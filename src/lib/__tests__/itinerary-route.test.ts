/**
 * /api/itinerary — 路由级回归测试（不需要真实 Groq 密钥）。
 *
 * 目的：钉住「**任何失败都不得是 200 + 不合契约的对象**」这条线。
 * 上游 fetch 被替换成模拟响应，因此这里验证的是**本地**的解析与规范化逻辑，
 * 不代表真实 Groq 服务已验证（见报告中的 UNVERIFIED 项）。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/itinerary/route";
import { ItinerarySchema } from "@/lib/schemas";

const DESTINATION = {
  iata: "NRT",
  icao: "RJAA",
  name: "Narita International Airport",
  city: "Tokyo",
  country: "Japan",
  timezone: "Asia/Tokyo",
  latitude: 35.7647,
  longitude: 140.3864,
};

function planInput() {
  return {
    destination: DESTINATION,
    departureDate: "2026-11-15",
    returnDate: "2026-11-17",
    travelStyle: "cultural",
    budgetLevel: "mid-range",
    interests: ["food", "history"],
    groupSize: 2,
  };
}

/** 线上观察到的模型输出（脱敏 · 模拟）。 */
function productionShapedPlan() {
  return {
    id: "model-generated-id",
    createdAt: "2026-01-01T00:00:00.000Z",
    input: { destination: "Tokyo, Japan (NRT)", travelDates: { start: "2026-11-15", end: "2026-11-17" } },
    days: [
      {
        date: "2026-11-15",
        activities: [
          {
            name: "Tsukiji Outer Market breakfast",
            type: "food",
            startTime: "08:30",
            endTime: "09:30",
            location: "Tsukiji, Chuo-ku",
            estimatedCost: 1200,
            description: "Street-food breakfast at the stalls.",
          },
        ],
      },
      {
        date: "2026-11-16",
        activities: [
          {
            name: "Tokyo National Museum",
            type: "museum",
            startTime: "10:00",
            endTime: "12:00",
            location: "Ueno Park",
            estimatedCost: 1000,
            description: "Japanese art and archaeology.",
          },
        ],
      },
    ],
    totalEstimatedCost: 2200,
    currency: "JPY",
    summary: "Two museum-and-market days in Tokyo.",
    packingList: ["Passport"],
    importantNotes: ["No tipping."],
  };
}

function postItinerary(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

/** 让 route 里的 fetch 返回一段模型文本。 */
function stubModelText(content: string, status = 200) {
  const fetchMock = vi.fn(async () =>
    new Response(
      JSON.stringify({ choices: [{ message: { content } }] }),
      { status, headers: { "Content-Type": "application/json" } },
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  process.env.GROQ_API_KEY = "test-key-not-real";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.GROQ_API_KEY;
});

describe("/api/itinerary — 失败路径绝不返回 200", () => {
  it("没有密钥 → 503 AI_NOT_CONFIGURED", async () => {
    delete process.env.GROQ_API_KEY;
    const res = await postItinerary({ input: planInput(), weather: [], exchangeRate: null });
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("AI_NOT_CONFIGURED");
  });

  it("缺 input → 400 MISSING_INPUT", async () => {
    const res = await postItinerary({ weather: [], exchangeRate: null });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("MISSING_INPUT");
  });

  it("上游非 2xx → 502 AI_UPSTREAM_ERROR", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("upstream boom", { status: 500 })),
    );
    const res = await postItinerary({ input: planInput(), weather: [], exchangeRate: null });
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("AI_UPSTREAM_ERROR");
  });

  it("模型返回纯文本 → 502 AI_OUTPUT_INVALID（不是 200）", async () => {
    stubModelText("Sure! Here is a lovely trip for you.");
    const res = await postItinerary({ input: planInput(), weather: [], exchangeRate: null });
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("AI_OUTPUT_INVALID");
  });

  it("模型返回合法 JSON 但没有可用 days → 502 AI_OUTPUT_INVALID", async () => {
    stubModelText(JSON.stringify({ days: [], summary: "empty" }));
    const res = await postItinerary({ input: planInput(), weather: [], exchangeRate: null });
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("AI_OUTPUT_INVALID");
  });

  it("模型返回活动缺必需字段、全被丢弃 → 502（不造一条假行程）", async () => {
    stubModelText(
      JSON.stringify({
        days: [{ date: "2026-11-15", activities: [{ name: "", description: "" }] }],
        summary: "x",
        currency: "JPY",
      }),
    );
    const res = await postItinerary({ input: planInput(), weather: [], exchangeRate: null });
    expect(res.status).toBe(502);
  });

  it("请求字段不合法（groupSize = 0）→ 400 INVALID_INPUT，不冒充上游故障", async () => {
    stubModelText(JSON.stringify(productionShapedPlan()));
    const res = await postItinerary({
      input: { ...planInput(), groupSize: 0 },
      weather: [],
      exchangeRate: null,
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("INVALID_INPUT");
  });

  it("返程早于出发 → 400（请求问题）", async () => {
    stubModelText(JSON.stringify(productionShapedPlan()));
    const res = await postItinerary({
      input: { ...planInput(), departureDate: "2026-11-18", returnDate: "2026-11-15" },
      weather: [],
      exchangeRate: null,
    });
    expect(res.status).toBe(400);
  });

  it("请求体不是合法 JSON → 400（不裸 500）", async () => {
    const res = await POST(
      new Request("http://localhost/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not-json",
      }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: { code?: string } };
    expect(body.error?.code).toBe("INVALID_INPUT");
  });

  it("weather 是 /api/weather 的并行数组对象 → 不再 500，按无天气处理（2026-10-28 生产故障回归）", async () => {
    stubModelText(JSON.stringify(productionShapedPlan()));
    // 修复前：客户端把 `{ time: [...], temperature_2m_max: [...] }` 直接当
    // WeatherDay[] 传上来，buildUserMessage 对它调 .map() 抛 TypeError → 裸 500。
    const res = await postItinerary({
      input: planInput(),
      weather: {
        time: ["2026-11-15", "2026-11-16"],
        temperature_2m_max: [16.2, 17.1],
        temperature_2m_min: [11.4, 12.0],
        precipitation_sum: [0, 0.2],
        wind_speed_10m_max: [9.7, 18.8],
        weather_code: [45, 3],
        uv_index_max: [3.1, 2.8],
        sunrise: ["2026-11-15T06:00:00", "2026-11-16T06:00:00"],
        sunset: ["2026-11-15T16:30:00", "2026-11-16T16:30:00"],
      },
      exchangeRate: null,
    });
    expect(res.status).toBe(200);
    const body: unknown = await res.json();
    expect(ItinerarySchema.safeParse(body).success).toBe(true);
  });
});

describe("/api/itinerary — 正常路径输出契约", () => {
  it("线上结构 → 200，且返回体通过 ItinerarySchema，input 来自请求", async () => {
    stubModelText(JSON.stringify(productionShapedPlan()));
    const res = await postItinerary({ input: planInput(), weather: [], exchangeRate: null });
    expect(res.status).toBe(200);

    const body: unknown = await res.json();
    const parsed = ItinerarySchema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (!parsed.success) throw new Error(parsed.error.message);

    // input 不被模型回显污染
    expect(parsed.data.input.destination.city).toBe("Tokyo");
    expect(parsed.data.input.departureDate).toBe("2026-11-15");
    expect(parsed.data.input.budgetLevel).toBe("mid-range");
    expect(parsed.data.input.groupSize).toBe(2);
    // id/createdAt 由服务端生成
    expect(parsed.data.id).not.toBe("model-generated-id");
    // 活动字段已映射
    expect(parsed.data.days[0].activities[0].category).toBe("food");
    expect(parsed.data.days[0].activities[0].duration).toBe(60);
    expect(parsed.data.days[0].activities[0].timeOfDay).toBe("morning");
  });

  it("Markdown 围栏包裹的 JSON 也能被接受", async () => {
    stubModelText("```json\n" + JSON.stringify(productionShapedPlan()) + "\n```");
    const res = await postItinerary({ input: planInput(), weather: [], exchangeRate: null });
    expect(res.status).toBe(200);
    const body: unknown = await res.json();
    expect(ItinerarySchema.safeParse(body).success).toBe(true);
  });

  it("模型给的币种不被运行时支持时，回退到目的地数据集的计价币种", async () => {
    stubModelText(JSON.stringify({ ...productionShapedPlan(), currency: "yen" }));
    const res = await postItinerary({ input: planInput(), weather: [], exchangeRate: null });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { currency?: string };
    expect(body.currency).toBe("JPY");
  });
});
