import type { Itinerary } from "@/types/itinerary";
import type { FlightLeg } from "@/types/flight";

// ── Types ────────────────────────────────────────────────────────────

export interface SharedData {
  itinerary: Itinerary;
  flights?: FlightLeg[];
}

// ── Constants ────────────────────────────────────────────────────────

const SITE_URL = "https://www.utripla.xyz";

/**
 * 新载荷前缀：deflate 压缩 + base64url（P12 链接缩短）。
 * 旧的无前缀 base64 载荷仍可解码（向后兼容：老分享链接不断）。
 */
const COMPRESSED_PREFIX = "z1.";

// ── Payload shaping ──────────────────────────────────────────────────

/**
 * Encode an itinerary (and optional flights) into a URL-safe base64 string.
 * We strip verbose fields to keep the payload compact.
 */
function stripItinerary(itinerary: Itinerary): Itinerary {
  return {
    ...itinerary,
    days: itinerary.days.map((day) => ({
      ...day,
      weather: null, // weather data is time-sensitive, skip it
      activities: day.activities.map((act) => ({
        ...act,
        description: act.description, // keep description, it's useful
      })),
    })),
  };
}

function stripFlights(flights: FlightLeg[]): FlightLeg[] {
  // Only keep essential flight info for display
  return flights.map((f) => ({
    ...f,
    departure: {
      ...f.departure,
      actualTime: null,
    },
    arrival: {
      ...f.arrival,
      actualTime: null,
    },
  }));
}

// ── Compressed encoding (deflate + base64url，P12) ───────────────────

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(encoded: string): Uint8Array {
  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** CompressionStream 不可用（老浏览器）时返回 null，调用方退回旧 base64。 */
async function deflateJson(json: string): Promise<Uint8Array | null> {
  if (typeof CompressionStream === "undefined") return null;
  try {
    const stream = new Blob([json as BlobPart])
      .stream()
      .pipeThrough(new CompressionStream("deflate-raw"));
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

async function inflateToBytes(compressed: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === "undefined") return null;
  try {
    const stream = new Blob([compressed.buffer as ArrayBuffer])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    const buffer = await new Response(stream).arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────────────

export async function encodeShareData(data: SharedData): Promise<string> {
  const stripped: SharedData = {
    itinerary: stripItinerary(data.itinerary),
    flights: data.flights ? stripFlights(data.flights) : undefined,
  };

  const json = JSON.stringify(stripped);

  const compressed = await deflateJson(json);
  if (compressed) {
    return COMPRESSED_PREFIX + bytesToBase64Url(compressed);
  }

  // 无 CompressionStream：退回旧未压缩 base64（无前缀，与新格式可区分）。
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeShareData(encoded: string): Promise<SharedData | null> {
  // 新格式：deflate-raw + base64url（前缀标识）
  if (encoded.startsWith(COMPRESSED_PREFIX)) {
    try {
      const bytes = base64UrlToBytes(encoded.slice(COMPRESSED_PREFIX.length));
      const inflated = await inflateToBytes(bytes);
      if (!inflated) return null;
      const json = new TextDecoder().decode(inflated);
      return JSON.parse(json) as SharedData;
    } catch {
      return null;
    }
  }

  // 旧格式（无前缀 base64）保持可解码 —— 老分享链接不作废。
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as SharedData;
  } catch {
    return null;
  }
}

export async function createShareableLink(
  itinerary: Itinerary,
  flights?: FlightLeg[],
): Promise<string> {
  const data = await encodeShareData({ itinerary, flights });
  return `${SITE_URL}/share?data=${encodeURIComponent(data)}`;
}
