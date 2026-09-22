/**
 * expenses/types — Travel Expenses / Travel Memory 的交易数据模型。
 *
 * 核心产品原则（本轮 Expanses 升级）：
 *  - **Actual spent 是核心数字**：只统计 status = confirmed 的真实发生交易；
 *  - **Committed ≠ Actual**：booked stay 永远不会被当作实际消费；
 *  - **原始金额永远保留**：originalAmount / originalCurrency 不被转换覆盖；
 *  - **导入永远先进入 Review**：低置信度结果绝不静默写入正式账本；
 *  - **Split 只描述"谁欠谁"**：不改变 Actual spent 的口径。
 */

import type { ExpenseCategory } from "../types";

/** 交易来源。没有真实 API 时绝不伪造 bank / alipay / wechat 连接。 */
export type TransactionSource =
  | "manual"
  | "csv"
  | "xlsx"
  | "receipt"
  | "connected_account";

/**
 * 交易状态（Capture first → Organize later）：
 *  draft（随手记：只有标题或金额，其余以后再补）
 *  imported（已导入未处理）→ needs_review（待用户确认）→ confirmed（进入 Actual spending）
 *  ignored（用户忽略；imported 记录不删除原始数据，置为 ignored 以防重复导入产生怪状态）
 */
export type TransactionStatus =
  | "draft"
  | "imported"
  | "needs_review"
  | "confirmed"
  | "ignored";

/** 消费来源标记（manual 表单里的 Payment source；不是平台连接声明） */
export type PaymentMethod = "card" | "cash" | "alipay" | "wechat_pay" | "other";

/** Split 模式：平分（默认）/ 按金额 / 按百分比 */
export type SplitMode = "equal" | "amount" | "percentage";

/**
 * Transaction — 一次真实消费的记录。
 *
 * Capture first → Organize later（本轮范式）：
 *  - 没有业务必填字段：merchant 或 amount 至少有一个即可保存；
 *  - originalAmount undefined = 还没填金额（draft 常态）；
 *  - category null = 未分类（自动分类只是建议，不是要求）；
 *  - paidBy / splitBetween 可以后补（confirm 时有默认值）。
 */
export interface Transaction {
  id: string;
  source: TransactionSource;
  /** 账单原始流水号（用于去重 / View original） */
  sourceTransactionId?: string;
  /** 规范化后的商户名 / 用户随手写的标题（可为空，展示层回退 "Untitled"） */
  merchant: string;
  /** 原始描述（7-ELEVEN #1234）——永不覆盖 */
  rawMerchant?: string;
  /** 消费发生日，ISO "YYYY-MM-DD"（快速记录默认今天） */
  occurredAt: string;

  /** undefined = 尚未填金额（draft）；一旦填写即视为真实消费 */
  originalAmount?: number;
  /** ISO 4217 code，如 THB / USD / JPY（默认跟随 Trip 币种） */
  originalCurrency: string;

  /** 换算记录（可选；没有可靠汇率时绝不伪造） */
  convertedAmount?: number;
  convertedCurrency?: string;
  conversionRate?: number;

  /** null = 未分类（以后整理；自动分类只是 suggestion） */
  category: ExpenseCategory | null;
  /** 自由文本二级分类（suggestions 仅供选择，不限定枚举） */
  subcategory?: string;
  /** 0-1 分类置信度；低置信度必须进 Review */
  categoryConfidence?: number;
  /** 0-1 Trip 匹配置信度 */
  tripConfidence?: number;

  /** 所属 Trip；undefined = Unassigned */
  tripId?: string;

  status: TransactionStatus;

  /** 支付人 = trip.travelers[].id */
  paidBy?: string;
  /** 参与分摊的 traveler id */
  splitBetween: string[];
  splitMode?: SplitMode;
  /** 不等额 split 时每人固定份额（display currency）；equal 模式可省略 */
  splitShares?: Record<string, number>;

  note?: string;
  /** 收据缩略图（data URL，客户端压缩）或文件名 */
  receiptUrl?: string;
  receiptId?: string;
  paymentMethod?: PaymentMethod;

  createdAt: string;
  updatedAt: string;
}

/** 用户纠正分类后学到的 merchant rule（以后同商户优先使用用户选择） */
export interface MerchantRule {
  category: ExpenseCategory;
  subcategory?: string;
}

/** 新建交易的输入形状（id / createdAt / updatedAt 由引擎补齐） */
export type NewTransaction = Omit<Transaction, "id" | "createdAt" | "updatedAt">;

/**
 * ExpenseSourceAdapter — 未来账户连接的预留接口。
 *
 * 当前没有任何真实 bank / card / payment provider API，因此不实现假连接：
 * 只提供接口形状 + 一个 manual adapter 实例，future provider 按此接入。
 */
export interface ExpenseSourceAdapter {
  provider: string;
  label: string;
  /** 是否具备真实连接能力（决定 UI 显示 "Connect" 还是 "Coming soon"） */
  available: boolean;
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
  /** 拉取并 normalize 成 NewTransaction[] */
  sync?(): Promise<NewTransaction[]>;
}

/** 本地手动 adapter（唯一 available 的来源；其余都是 Coming soon 占位） */
export const MANUAL_SOURCE_ADAPTER: ExpenseSourceAdapter = {
  provider: "manual",
  label: "Manual entry",
  available: true,
};

/** 未来可接入的 provider 占位（available=false → UI 显示 Coming soon） */
export const FUTURE_SOURCE_ADAPTERS: ExpenseSourceAdapter[] = [
  { provider: "bank_card", label: "Bank / card account", available: false },
  { provider: "alipay", label: "Alipay", available: false },
  { provider: "wechat_pay", label: "WeChat Pay", available: false },
];
