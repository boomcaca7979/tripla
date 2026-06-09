# tripla 旅行规划网站全面检查报告

> 检查日期：2026-06-09
> 线上地址：https://travel-planner-two-livid.vercel.app/
> 项目路径：/Users/boomcaca/projects/tripla

---

## 一、项目概况

| 项目 | 详情 |
|------|------|
| 框架 | Next.js 16.2.7 (App Router) |
| 前端 | React 19.2.4 + Tailwind CSS 4 + Zustand 5 |
| 语言 | TypeScript 5 |
| 构建 | Turbopack，编译成功，无 TypeScript 错误 |
| 部署 | Vercel |
| AI 引擎 | Groq API (llama-3.3-70b-versatile) |
| 数据源 | Aviationstack (航班)、Open-Meteo (天气/地理编码)、ExchangeRate-API (汇率) |

### 路由结构

| 路由 | 类型 | 说明 |
|------|------|------|
| `/` | 静态 | 首页：Hero + 搜索栏 + AI 展示 + 热门目的地 |
| `/destinations` | 静态 | 目的地浏览（12 个城市，筛选/搜索/分页） |
| `/guides` | 静态 | 旅行指南（6 篇文章，弹窗阅读） |
| `/trips` | 静态 | 精选行程（6 个行程模板，弹窗预览） |
| `/pricing` | 静态 | 定价页（Free / Pro 对比） |
| `/plan` | 动态 | 行程规划结果页（航班/行程/天气/汇率） |
| `/login` | 静态 | 登录页（双栏布局） |
| `/signup` | 静态 | 注册页（双栏布局） |
| `/api/itinerary` | 动态 | 行程生成 API |
| `/api/flights` | 动态 | 航班搜索 API |
| `/api/weather` | 动态 | 天气预报 API |
| `/api/currency` | 动态 | 汇率转换 API |
| `/api/geocoding` | 动态 | 地理编码 API |

---

## 二、BUG 列表（按严重程度排序）

### 高严重度 (5)

---

#### H1：Header 登录/注册按钮无实际功能

- **位置**：`src/components/layout/Header.tsx` 第 149-164 行
- **现象**：Log in 和 Sign up 按钮点击后仅弹出 `alert("Coming soon")`
- **问题**：`/login` 和 `/signup` 页面实际已存在且有完整表单（含 Zod 验证、密码强度检测、Google 登录按钮），但 Header 按钮未链接到这些页面
- **影响**：用户无法从导航栏进入登录/注册流程，已开发的认证页面完全不可达
- **修复方案**：将 `<button onClick={() => alert("Coming soon")}>` 改为 `<Link href="/login">` 和 `<Link href="/signup">`

```tsx
// 修复代码 — Header.tsx

// Log in 按钮（桌面端）
<Link
  href="/login"
  className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:inline-flex"
>
  Log in
</Link>

// Sign up 按钮
<Link
  href="/signup"
  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  Sign up
</Link>

// 移动端菜单中的按钮同理修改
```

---

#### H2：`/forgot-password` 页面缺失 → 404

- **位置**：`src/components/auth/LoginForm.tsx` 第 98-103 行
- **现象**：登录表单中 "Forgot password?" 链接指向 `/forgot-password`，访问该 URL 返回 Next.js 默认 404 页面
- **影响**：用户点击后看到无品牌样式的 404 页面，体验差
- **修复方案**：创建 `src/app/(auth)/forgot-password/page.tsx`

```tsx
// src/app/(auth)/forgot-password/page.tsx

import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password · tripla",
  description: "Reset your tripla account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
```

---

#### H3：`/terms` 和 `/privacy` 页面缺失 → 404

- **位置**：`src/components/auth/SignupForm.tsx` 第 151-158 行
- **现象**：注册表单底部 "Terms" 链接指向 `/terms`，"Privacy Policy" 链接指向 `/privacy`，两个 URL 均返回 404
- **影响**：法律合规风险，用户无法查看服务条款和隐私政策
- **修复方案**：创建对应页面

```tsx
// src/app/terms/page.tsx

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Terms of Service
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
        <p>Last updated: June 9, 2026</p>
        <p>Terms of service content here...</p>
      </div>
    </div>
  );
}

// src/app/privacy/page.tsx

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
        <p>Last updated: June 9, 2026</p>
        <p>Privacy policy content here...</p>
      </div>
    </div>
  );
}
```

---

#### H4：登录/注册表单无后端对接

- **位置**：
  - `src/components/auth/LoginForm.tsx` 第 37-41 行
  - `src/components/auth/SignupForm.tsx` 第 42-47 行
- **现象**：表单提交仅执行 `console.log(result.data)`，然后 `setTimeout(() => setSubmitting(false), 600)` 模拟提交。Google 登录按钮同样仅 `console.log("Google auth")`
- **影响**：用户填写表单后无任何实际效果，无法创建账户或登录
- **修复方案**：需要接入认证后端（如 NextAuth.js、Supabase Auth、Firebase Auth 等），LoginForm 注释中提到 "Firebase Auth will be wired up here next" 但未实现

---

#### H5：`.env.example` 与实际代码不匹配

- **位置**：`.env.example`
- **现象**：示例文件列出 `ANTHROPIC_API_KEY=sk-ant-...`，但 `src/app/api/itinerary/route.ts` 实际使用的是 `GROQ_API_KEY`（调用 Groq API 的 llama-3.3-70b-versatile 模型）
- **影响**：新开发者按照 `.env.example` 配置环境变量后，行程生成 API 仍会因缺少 `GROQ_API_KEY` 而回退到 mock 数据
- **修复方案**：更新 `.env.example`

```env
AVIATIONSTACK_API_KEY=your_key_here
EXCHANGE_RATE_API_KEY=your_key_here
GROQ_API_KEY=gsk_your_key_here
NEXT_PUBLIC_APP_NAME=tripla
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 中严重度 (10)

---

#### M1：缺少自定义 404 页面

- **位置**：`src/app/not-found.tsx` 不存在
- **现象**：访问不存在路由（如 `/nonexistent-page`、`/forgot-password`、`/terms`、`/privacy`）时显示 Next.js 默认 404 页面，无品牌样式、无导航链接
- **影响**：用户看到无品牌一致性的错误页面，无法方便地返回网站
- **修复方案**：

```tsx
// src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
      <p className="text-lg text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
```

---

#### M2：缺少 error.tsx 错误边界

- **位置**：`src/app/error.tsx` 不存在
- **现象**：运行时错误会显示 Next.js 默认错误页面
- **影响**：无品牌一致性的错误展示，用户无法方便地重试或返回
- **修复方案**：

```tsx
// src/app/error.tsx

"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
```

---

#### M3：缺少 loading.tsx 全局加载状态

- **位置**：`src/app/loading.tsx` 不存在
- **现象**：页面切换时无统一加载指示器
- **影响**：用户体验不连贯，页面跳转时可能出现空白闪烁
- **修复方案**：

```tsx
// src/app/loading.tsx

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );
}
```

---

#### M4：9 个目的地城市缺少封面图片

- **位置**：`src/app/destinations/page.tsx` 中 `DESTINATIONS` 数组
- **现象**：12 个目的地中仅 Tokyo、Paris、New York 有图片（`/images/tokyo.jpg`、`/images/paris.jpg`、`/images/newyork.jpg`），其余 9 个城市（Bangkok、London、Sydney、Dubai、Rome、Barcelona、Singapore、Istanbul、Seoul）的 `image` 字段为 `null`，显示纯渐变背景
- **影响**：目的地卡片视觉体验不一致，有图片的卡片明显更吸引人
- **修复方案**：补充 9 张城市封面图片到 `public/images/` 目录，并更新 `DESTINATIONS` 数组中的 `image` 字段

---

#### M5：语言切换按钮无功能

- **位置**：`src/components/layout/Header.tsx` 第 109-120 行
- **现象**：语言切换按钮（地球图标）点击后仅弹 `alert("Coming soon")`，但始终显示在导航栏上
- **影响**：用户期望切换语言但无法实现，弹窗体验差
- **修复方案**：短期可隐藏该按钮（添加 `hidden` 类），待国际化功能实现后再显示

---

#### M6：Pro 订阅按钮无功能

- **位置**：`src/app/pricing/page.tsx` 第 94-99 行
- **现象**："Upgrade to Pro" 按钮点击后仅弹 `alert("Coming soon")`
- **影响**：用户无法完成付费转化
- **修复方案**：短期可改为 "Coming Soon" 状态按钮（灰色、禁用），避免用户点击后失望

---

#### M7：页脚导航链接中英混杂

- **位置**：`src/components/layout/Footer.tsx` 第 16-18 行
- **现象**："首页" 和 "定价" 使用中文，而 "GitHub" 和 "Twitter" 使用英文，整站其余部分均为英文
- **影响**：语言不统一，影响专业感
- **修复方案**：统一为英文

```tsx
// Footer.tsx — 修改链接文本
<Link href="/" className="...">Home</Link>
<Link href="/pricing" className="...">Pricing</Link>
```

---

#### M8：页脚 GitHub/Twitter 链接指向通用域名

- **位置**：`src/components/layout/Footer.tsx` 第 22-37 行
- **现象**：`https://github.com` 和 `https://twitter.com` 未指向项目实际社交账号，点击后进入各平台首页
- **影响**：用户无法找到项目的实际社交账号
- **修复方案**：替换为项目实际 GitHub 仓库和 Twitter 账号链接，或暂时移除

---

#### M9：AirportAutocomplete 机场名称显示不完整

- **位置**：`src/components/search/AirportAutocomplete.tsx` 第 102-113 行
- **现象**：`toAirport()` 函数将 `geo.name`（城市名如 "London"）同时赋给 `name` 和 `city` 字段，导致选中后显示 "London (LHR)" 而非 "London Heathrow Airport (LHR)"，机场全名丢失
- **影响**：用户无法区分同一城市的不同机场（如东京的 NRT 和 HND）
- **修复方案**：在 `CITY_TO_IATA` 映射中增加机场全名，或从 geocoding 结果中拼接更完整的名称

```tsx
// AirportAutocomplete.tsx — 增强 CITY_TO_IATA 映射
const CITY_TO_IATA: Record<string, { iata: string; icao: string; name: string }> = {
  tokyo: { iata: "NRT", icao: "RJAA", name: "Narita International Airport" },
  london: { iata: "LHR", icao: "EGLL", name: "London Heathrow Airport" },
  // ... 其余城市同理
};

function toAirport(geo: GeocodingResult): Airport {
  const codes = lookupIata(geo.name);
  return {
    iata: codes.iata,
    icao: codes.icao,
    name: codes.name || geo.name,  // 使用映射中的机场全名
    city: geo.name,
    country: geo.country,
    timezone: geo.timezone,
    latitude: geo.latitude,
    longitude: geo.longitude,
  };
}
```

---

#### M10：搜索参数通过 URL 传递 JSON 对象

- **位置**：`src/components/search/SearchBar.tsx` 第 136-147 行
- **现象**：`origin` 和 `destination` 通过 `JSON.stringify()` 编码到 URL 参数中，导致 URL 极长且不可读
- **示例 URL**：`/plan?origin=%7B%22iata%22%3A%22NRT%22%2C...%7D&destination=%7B%22iata%22%3A%22CDG%22%2C...%7D&...`
- **影响**：
  - URL 不可读，用户无法理解或手动修改
  - URL 过长可能超出浏览器/服务器限制
  - 不利于 SEO 和链接分享
- **修复方案**：仅传递 IATA 代码，在 `/plan` 页面根据 IATA 反查机场详情

```tsx
// SearchBar.tsx — 精简 URL 参数
const params = new URLSearchParams({
  originIata: origin.iata,
  destinationIata: destination.iata,
  departureDate,
  returnDate,
  travelStyle,
  budgetLevel,
  interests: interests.join(","),
  groupSize: String(groupSize),
});
router.push(`/plan?${params.toString()}`);

// PlanPageClient.tsx — 根据 IATA 反查
const originIata = searchParams.get("originIata") ?? "";
const destinationIata = searchParams.get("destinationIata") ?? "";
// 从 CITY_TO_IATA 反向查找或调用 API 获取机场详情
```

---

### 低严重度 (5)

---

#### L1：SEO meta 信息过于简单

- **位置**：`src/app/layout.tsx` 第 26-32 行
- **现象**：
  - `title` 仅 "tripla"
  - `description` 仅 "AI-powered travel planner"
  - 缺少 `og:image`、`og:title`、`og:description`、`twitter:card` 等 Open Graph 标签
  - 缺少 `robots` 配置
  - 缺少 `sitemap.xml`
- **影响**：搜索引擎和社交媒体分享时展示信息不充分
- **修复方案**：

```tsx
// layout.tsx — 增强 metadata
export const metadata: Metadata = {
  title: "tripla — AI-Powered Travel Planner",
  description: "Plan smarter, travel better. AI-powered trip planning with real-time flight data, intelligent weather scoring, and personalised itineraries — all in one place.",
  icons: { icon: "/logo-icon.svg" },
  openGraph: {
    title: "tripla — AI-Powered Travel Planner",
    description: "Plan smarter, travel better. AI-powered trip planning with real-time flight data, intelligent weather scoring, and personalised itineraries.",
    url: "https://travel-planner-two-livid.vercel.app",
    siteName: "tripla",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tripla — AI-Powered Travel Planner",
    description: "Plan smarter, travel better.",
  },
};
```

---

#### L2：暗色模式 CSS 变量已定义但未使用

- **位置**：`src/app/globals.css` 第 15-20 行
- **现象**：定义了 `prefers-color-scheme: dark` 下的 `--background: #0a0a0a` 和 `--foreground: #ededed`，但所有组件硬编码白色背景（`bg-white`、`bg-gray-50` 等），暗色模式变量从未生效
- **影响**：暗色模式偏好用户看到闪烁的暗色 body 但白色组件，体验差
- **修复方案**：短期移除暗色模式 CSS 变量定义，避免闪烁；长期实现完整暗色模式

---

#### L3：public 目录残留 Next.js 默认文件

- **位置**：`/public/file.svg`、`globe.svg`、`next.svg`、`vercel.svg`、`window.svg`
- **现象**：这些是 Next.js 脚手架 (`create-next-app`) 的默认文件，项目中未引用
- **影响**：增加部署包体积，代码不整洁
- **修复方案**：删除这 5 个未使用的文件

---

#### L4：ItineraryPreviewSection 卡片高度过大

- **位置**：`src/components/home/ItineraryPreviewSection.tsx` 第 324 行
- **现象**：Popular Destinations 卡片高度 `h-80 sm:h-96`（320-384px），在首页占据过多垂直空间
- **影响**：首页需要大量滚动才能看完 3 张卡片
- **修复方案**：减小高度至 `h-56 sm:h-64`（224-256px），与 Destinations 页面的 `h-48` 保持一致

---

#### L5：Destinations 页面 Plan Trip 按钮需 hover 才可见

- **位置**：`src/app/destinations/page.tsx` 第 674-695 行
- **现象**："Plan Trip" 按钮在 hover overlay 中（`opacity-0 group-hover:opacity-100`），移动端无 hover 状态
- **影响**：移动端用户无法发现该按钮，无法从目的地卡片快速跳转到搜索
- **修复方案**：在移动端始终显示按钮，桌面端保持 hover 效果

```tsx
// destinations/page.tsx — Plan Trip overlay
<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 opacity-100">
```

或更优雅地：在卡片底部 body 区域始终显示一个 "Plan Trip" 按钮。

---

## 三、缺失的页面或功能

| 缺失项 | 严重程度 | 引用位置 | 说明 |
|---------|---------|---------|------|
| `/forgot-password` 页面 | 高 | LoginForm.tsx 第 98-103 行 | "Forgot password?" 链接指向该页面，但不存在 |
| `/terms` 页面 | 高 | SignupForm.tsx 第 151 行 | "Terms" 链接指向该页面，但不存在 |
| `/privacy` 页面 | 高 | SignupForm.tsx 第 155 行 | "Privacy Policy" 链接指向该页面，但不存在 |
| 自定义 `not-found.tsx` | 中 | 全局 | 无品牌化 404 页面 |
| 自定义 `error.tsx` | 中 | 全局 | 无品牌化错误页面 |
| 全局 `loading.tsx` | 中 | 全局 | 无统一加载指示器 |
| 用户认证后端 | 高 | LoginForm / SignupForm | 表单仅前端验证，无后端逻辑 |
| 目的地城市图片 | 中 | destinations/page.tsx | 9/12 个目的地缺少图片 |
| 国际化 (i18n) | 低 | Header.tsx 语言切换按钮 | 按钮存在但无功能 |
| 行程分享/导出 | 低 | plan 页面 | 行程生成后无分享或 PDF 导出功能 |
| sitemap.xml | 低 | 全局 | 缺少搜索引擎站点地图 |
| robots.txt | 低 | 全局 | 缺少搜索引擎爬虫配置 |

---

## 四、功能检查详细结果

### 4.1 首页搜索表单

| 字段 | 状态 | 说明 |
|------|------|------|
| From (出发地) | 正常 | AirportAutocomplete 组件，支持模糊搜索和键盘导航 |
| To (目的地) | 正常 | 同上，支持 swap 按钮交换出发/目的地 |
| Start (出发日期) | 正常 | DateRangePicker 组件 |
| End (返回日期) | 正常 | 同上 |
| Travelers (人数) | 正常 | number input，范围 1-20 |
| Travel Style | 正常 | select 下拉，5 个选项 |
| Budget | 正常 | select 下拉，3 个选项 |
| Interests | 正常 | 8 个 pill 按钮多选 |
| Plan My Trip 按钮 | 正常 | 点击后跳转到 `/plan` 页面 |
| 表单验证 | 正常 | 缺少出发地/目的地或日期时显示错误提示 |

**潜在问题**：
- AirportAutocomplete 依赖 `/api/geocoding` 接口，如果 Open-Meteo API 不可用，搜索将无结果
- 选中机场后，如果城市不在 `CITY_TO_IATA` 映射中，IATA 代码为空，后续航班搜索会失败

### 4.2 行程生成流程

1. 用户填写搜索表单 → 点击 "Plan My Trip"
2. 跳转到 `/plan?origin=...&destination=...&...`
3. PlanPageClient 解析 URL 参数，同时触发 3 个 API 请求：
   - `/api/itinerary` — 生成行程（调用 Groq API 或返回 mock 数据）
   - `/api/flights` — 搜索航班（调用 Aviationstack API 或返回 mock 数据）
   - `/api/weather` — 获取天气预报（调用 Open-Meteo API 或返回 mock 数据）
4. 结果展示：左侧 FlightList + ItineraryTimeline，右侧 WeatherPanel + CurrencyWidget
5. 所有组件有 ErrorBoundary 包裹

**潜在问题**：
- 当 `GROQ_API_KEY` 未配置时，行程 API 返回 mock 数据（仅 2 天、2 个活动），体验较简陋
- URL 中包含 JSON.stringify 的 Airport 对象，URL 过长
- 无参数时显示 "No search parameters found" 空状态，但无返回首页的链接

### 4.3 Popular Destinations 卡片

| 功能 | 状态 | 说明 |
|------|------|------|
| 点击卡片 | 正常 | 打开弹窗显示完整行程 |
| 弹窗内容 | 正常 | 显示每日活动、时间、emoji |
| "Plan with this template" 按钮 | 正常 | 自动填充搜索表单并滚动到顶部 |
| Template applied 提示 | 正常 | 绿色提示条，3 秒后自动消失 |

### 4.4 响应式检查

| 断点 | 状态 | 说明 |
|------|------|------|
| 桌面 (≥1024px) | 正常 | 导航栏水平排列，搜索表单多列布局 |
| 平板 (768px) | 基本正常 | 搜索表单切换为单列，卡片 2 列 |
| 手机 (375px) | 有问题 | 见下方详细说明 |

**移动端问题**：
1. 搜索表单 Interests 区域 8 个 pill 按钮在窄屏下可能溢出或换行过多
2. Destinations 页面 "Plan Trip" 按钮 hover 才显示，移动端无法触发
3. Header 右侧按钮过多（搜索、语言、温度、货币、登录、注册、汉堡菜单），在 375px 下可能挤压
4. `/plan` 页面侧边栏在移动端堆叠在主内容下方，但无 tab 切换，需要大量滚动

---

## 五、视觉与交互检查

### 5.1 样式一致性

| 项目 | 状态 | 说明 |
|------|------|------|
| 字体 | 统一 | 全站使用 Geist 字体族（本地字体） |
| 按钮样式 | 基本统一 | 主按钮蓝色渐变，次按钮灰色边框 |
| 卡片样式 | 统一 | 圆角 2xl，阴影 md，hover 上移 + 阴影增强 |
| 表单样式 | 统一 | 圆角 xl，灰色背景，蓝色 focus ring |
| 颜色方案 | 统一 | 蓝色主色调，灰色辅助色 |

### 5.2 动画效果

| 动画 | 状态 | 说明 |
|------|------|------|
| Hero 浮动光球 | 正常 | 3 种速度（8s/10s/12s），CSS keyframe 动画 |
| 卡片 hover 上移 | 正常 | `hover:-translate-y-1.5`，过渡 300ms |
| 图片 hover 缩放 | 正常 | `group-hover:scale-110`，过渡 500ms |
| 弹窗背景模糊 | 正常 | `backdrop-blur-sm` |
| 加载骨架屏 | 正常 | `/plan` 页面有 `animate-pulse` 骨架屏 |

### 5.3 图片加载

| 图片 | 状态 | 说明 |
|------|------|------|
| `/images/tokyo.jpg` | 正常 | Destinations/Guides/Trips/ItineraryPreview 中使用 |
| `/images/paris.jpg` | 正常 | 同上 |
| `/images/newyork.jpg` | 正常 | 同上 |
| 其余 9 个城市 | 无图片 | 使用 Tailwind 渐变背景作为 fallback |
| `/logo.svg` | 正常 | Header 中使用，120x32 |
| `/logo-icon.svg` | 正常 | favicon |

---

## 六、性能与控制台检查

### 6.1 构建结果

```
▲ Next.js 16.2.7 (Turbopack)
✓ Compiled successfully in 1700ms
✓ TypeScript check passed
✓ 16 static pages generated

Route (app)
┌ ○ /              → 静态预渲染
├ ○ /_not-found    → 静态预渲染
├ ƒ /api/currency  → 动态按需渲染
├ ƒ /api/flights   → 动态按需渲染
├ ƒ /api/geocoding → 动态按需渲染
├ ƒ /api/itinerary → 动态按需渲染
├ ƒ /api/weather   → 动态按需渲染
├ ○ /destinations  → 静态预渲染
├ ○ /guides        → 静态预渲染
├ ○ /login         → 静态预渲染
├ ○ /plan          → 静态预渲染 (Suspense 包裹)
├ ○ /pricing       → 静态预渲染
├ ○ /signup        → 静态预渲染
└ ○ /trips         → 静态预渲染
```

### 6.2 API 路由健壮性

| API | 依赖 | Fallback | 说明 |
|-----|------|----------|------|
| `/api/itinerary` | `GROQ_API_KEY` | 有 mock 数据 | 无 key 时返回 2 天 mock 行程 |
| `/api/flights` | `AVIATIONSTACK_API_KEY` | 有 mock 数据 | 无 key 时生成随机航班数据 |
| `/api/weather` | Open-Meteo (免费) | 有 mock 数据 | API 调用失败时返回模拟天气 |
| `/api/currency` | `EXCHANGE_RATE_API_KEY` | 有 mock 数据 | 无 key 时返回固定汇率 |
| `/api/geocoding` | Open-Meteo (免费) | 无 fallback | 失败时返回空数组 |

### 6.3 状态管理

- 使用 Zustand + `persist` 中间件
- 持久化到 `localStorage`（key: `travel-store`）
- 仅持久化 `savedItineraries`、`temperatureUnit`、`preferredCurrency`
- 搜索结果和选中航班不持久化（刷新丢失）
- 有 hydration 处理（`useHydration` hook + `_hydrated` 标志）

---

## 七、特别关注点总结

### 7.1 搜索表单在移动端是否可用

基本可用，但有以下问题：
- Interests 区域 8 个 pill 按钮在 375px 宽度下换行较多，占据大量垂直空间
- Header 右侧操作按钮过多，在小屏下可能挤压
- 建议对 Interests 区域在移动端使用可折叠/展开设计

### 7.2 行程生成后的展示页面是否完整

结构完整，包含 4 个核心模块：
1. **FlightList** — 航班列表，有 loading/error/retry 状态
2. **ItineraryTimeline** — 行程时间线，有进度指示器
3. **WeatherPanel** — 天气面板，有评分系统
4. **CurrencyWidget** — 汇率小工具

但有以下不足：
- 无参数时显示空状态但无返回首页链接
- Mock 数据体验简陋（仅 2 天 2 个活动）
- 移动端侧边栏需大量滚动

### 7.3 是否有登录/用户系统，功能是否正常

前端表单完整：
- 登录页：邮箱 + 密码 + 记住我 + 忘记密码 + Google 登录
- 注册页：姓名 + 邮箱 + 密码 + 确认密码 + 密码强度 + Google 注册
- Zod 表单验证完整
- 双栏布局（左侧品牌插画 + 右侧表单）

但**无后端**：
- 提交仅 `console.log`
- Google 登录无功能
- Header 按钮未链接到登录/注册页面
- 忘记密码、服务条款、隐私政策页面均不存在

### 7.4 SEO 相关

| 项目 | 状态 | 说明 |
|------|------|------|
| `<title>` | 过于简单 | 仅 "tripla"，缺少描述性关键词 |
| `<meta description>` | 过于简单 | 仅 "AI-powered travel planner" |
| Open Graph 标签 | 缺失 | 无 og:title、og:description、og:image |
| Twitter Card 标签 | 缺失 | 无 twitter:card 等 |
| `<html lang>` | 正常 | `lang="en"` |
| sitemap.xml | 缺失 | 无搜索引擎站点地图 |
| robots.txt | 缺失 | 无爬虫配置 |
| 语义化 HTML | 良好 | 使用了 `<header>`、`<main>`、`<footer>`、`<nav>`、`<article>` |
| ARIA 标签 | 良好 | 搜索、导航、弹窗等有 aria-label |

---

## 八、优化优先级排序

| 优先级 | 任务 | 工作量 | 说明 |
|--------|------|--------|------|
| **P0** | Header 登录/注册按钮改为 Link 跳转 | 小 | 已有页面但按钮未链接 |
| **P0** | 创建 `/forgot-password` 页面 | 中 | 防止 404 |
| **P0** | 创建 `/terms` 和 `/privacy` 页面 | 中 | 法律合规 |
| **P0** | 修复 `.env.example` 与实际代码不匹配 | 小 | 防止新开发者配置错误 |
| **P1** | 创建自定义 `not-found.tsx` | 小 | 品牌一致性 |
| **P1** | 创建自定义 `error.tsx` | 小 | 品牌一致性 |
| **P1** | 补充目的地城市封面图片 | 中 | 视觉一致性 |
| **P1** | 移动端 Plan Trip 按钮可见性修复 | 小 | 移动端可用性 |
| **P1** | `/plan` 空状态添加返回首页链接 | 小 | 用户体验 |
| **P2** | 页脚语言统一 + 社交链接修正 | 小 | 专业性 |
| **P2** | 增强 SEO meta 标签 | 小 | 搜索引擎优化 |
| **P2** | 清理 public 目录无用默认文件 | 小 | 代码整洁 |
| **P2** | 隐藏无功能的语言切换按钮 | 小 | 避免用户困惑 |
| **P2** | AirportAutocomplete 机场全名显示 | 小 | 信息完整性 |
| **P3** | 暗色模式实现或移除相关 CSS | 中 | 视觉一致性 |
| **P3** | URL 参数优化（避免 JSON stringify） | 中 | 可读性和 SEO |
| **P3** | 国际化 (i18n) 实现 | 大 | 多语言支持 |
| **P3** | 用户认证后端对接 | 大 | 核心功能 |
| **P3** | 行程分享/导出功能 | 中 | 用户留存 |
| **P3** | sitemap.xml 和 robots.txt | 小 | SEO |

---

## 九、文件索引

检查过程中涉及的关键文件：

| 文件路径 | 说明 |
|---------|------|
| `src/app/layout.tsx` | 根布局，metadata 定义 |
| `src/app/page.tsx` | 首页 |
| `src/app/destinations/page.tsx` | 目的地页（743 行，含 mock 数据） |
| `src/app/guides/page.tsx` | 指南页（679 行，含 mock 数据和弹窗） |
| `src/app/trips/page.tsx` | 行程页（837 行，含 mock 数据和弹窗） |
| `src/app/pricing/page.tsx` | 定价页 |
| `src/app/plan/page.tsx` | 行程规划页（Suspense 包裹） |
| `src/app/plan/PlanPageClient.tsx` | 行程规划客户端组件 |
| `src/app/(auth)/login/page.tsx` | 登录页 |
| `src/app/(auth)/signup/page.tsx` | 注册页 |
| `src/app/(auth)/layout.tsx` | 认证布局（双栏） |
| `src/app/api/itinerary/route.ts` | 行程生成 API |
| `src/app/api/flights/route.ts` | 航班搜索 API |
| `src/app/api/weather/route.ts` | 天气 API |
| `src/app/api/currency/route.ts` | 汇率 API |
| `src/app/api/geocoding/route.ts` | 地理编码 API |
| `src/app/globals.css` | 全局样式 |
| `src/components/layout/Header.tsx` | 页眉（237 行） |
| `src/components/layout/Footer.tsx` | 页脚 |
| `src/components/layout/PageWrapper.tsx` | 页面包装器 |
| `src/components/search/SearchBar.tsx` | 搜索表单 |
| `src/components/search/AirportAutocomplete.tsx` | 机场自动完成 |
| `src/components/search/DateRangePicker.tsx` | 日期范围选择器 |
| `src/components/home/AIShowcaseSection.tsx` | AI 功能展示 |
| `src/components/home/ItineraryPreviewSection.tsx` | 热门目的地 |
| `src/components/auth/LoginForm.tsx` | 登录表单 |
| `src/components/auth/SignupForm.tsx` | 注册表单 |
| `src/components/auth/AuthSplitLayout.tsx` | 认证双栏布局 |
| `src/store/travel.ts` | Zustand 状态管理 |
| `.env.example` | 环境变量示例 |
| `package.json` | 项目依赖 |
| `next.config.ts` | Next.js 配置 |
