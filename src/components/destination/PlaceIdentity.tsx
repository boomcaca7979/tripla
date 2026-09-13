import type { Destination } from "@/data/destinations";
import PlaceReadout from "./PlaceReadout";
import LocalStateReadout from "./LocalStateReadout";

/**
 * PlaceIdentity — Place Arrival 的仪器读数带。
 *
 * CONTRACT §8 / §14：
 *   首屏必须让用户知道 城市 / 国家 / 地区 / 当前天气 / 当前当地时间 / 当前季节。
 *   但**不得**做成 4 张白卡 —— 这里是一条 mono 仪器读数带：
 *   细横线分隔 + 极细竖线分列 + 等宽数值，读起来像仪表，而不是 dashboard。
 *
 * region / country 为静态真实字段，server 直接渲染；
 * local time / season / weather 由 client 读数在 hydration 后填入。
 */
export default function PlaceIdentity({ dest }: { dest: Destination }) {
  return (
    <section
      aria-label={`${dest.city} place context`}
      className="border-b border-ut-border"
    >
      <div
        className={[
          "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
          // lg 单行 5 列时给出竖线分列（仅 lg，避免换行时竖线错位）
          "lg:[&>*]:border-l lg:[&>*]:border-ut-border",
          "lg:[&>*:first-child]:border-l-0",
        ].join(" ")}
      >
        <PlaceReadout label="Region" value={dest.region} />
        <PlaceReadout label="Country" value={dest.country} />
        <LocalStateReadout destinationId={dest.id} timeZone={dest.timezone} />
      </div>
    </section>
  );
}
