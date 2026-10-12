import Link from "next/link";

// ── All destinations：Region → Country → City 全展开目录 ──────────────────
// 设计要点（与 /mdd/ 上半部分同一页面语言）：
//   - Region = 独立 section（不隐藏、不切换、无 Tab），依次纵向排列
//   - Country = 横向流式 column（桌面 ~6-8 列自适应，移动端 2 列）
//   - City = 轻文字链接（有 guide 带 "· N guides" 次级信息，不抢城市名）
//   - 业务链接逻辑与图片卡一致：一律指向 /destinations/<slug>（城市唯一页规则）

export interface DirectoryCity {
  name: string;
  href: string;
  guides: number;
}

export interface DirectoryCountry {
  country: string;
  cities: DirectoryCity[];
}

export interface DirectoryRegionGroup {
  region: string;
  total: number;
  countries: DirectoryCountry[];
}

function RegionSection({ group }: { group: DirectoryRegionGroup }) {
  return (
    <section
      aria-label={`${group.region} destinations`}
      className="border-t border-[#e6e6e6] pt-[28px] pb-[34px]"
    >
      <header className="flex items-baseline gap-[12px]">
        <h3 className="text-[18px] leading-none font-semibold tracking-[0.04em] text-[#111] uppercase">
          {group.region}
        </h3>
        <span className="text-[13px] leading-none text-[#999]">
          {group.total} destinations
        </span>
      </header>

      {/* 国家横向流式 column：移动 2 列，≥sm 自适应 ~6-8 列 */}
      <div className="mt-[22px] grid grid-cols-2 gap-x-[24px] gap-y-[30px] sm:flex sm:flex-wrap sm:gap-x-[36px] sm:gap-y-[34px]">
        {group.countries.map((c) => (
          <div key={c.country} className="min-w-0 sm:w-[148px]">
            <h4 className="text-[15px] leading-none font-medium text-[#111]">
              {c.country}
            </h4>
            <ul className="mt-[12px] space-y-[8px]">
              {c.cities.map((city) => (
                <li key={city.href}>
                  <Link
                    href={city.href}
                    className="group/city inline-block max-w-full"
                  >
                    <span className="text-[14px] leading-snug text-[#696969] transition-colors group-hover/city:text-[#ff9d00]">
                      {city.name}
                    </span>
                    {city.guides > 0 && (
                      <span className="ml-[6px] text-[12px] text-[#757575] transition-colors group-hover/city:text-[#ff9d00]">
                        · {city.guides} {city.guides === 1 ? "guide" : "guides"}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DestinationDirectory({
  groups,
}: {
  groups: DirectoryRegionGroup[];
}) {
  const total = groups.reduce((n, g) => n + g.total, 0);
  return (
    <section id="all-destinations" aria-label="All destinations">
      {/* 目录标题：与三个 block 的居中 item-hd 同一视觉语言 */}
      <div className="border-t border-[#e6e6e6] pt-[42px] pb-[6px] text-center">
        <h2 className="text-[24px] leading-none font-normal text-[#111]">
          All destinations
        </h2>
        <p className="mt-[10px] text-[14px] leading-none text-[#999]">
          Every destination covered — by region and country ({total} total)
        </p>
      </div>
      <div className="mt-[24px]">
        {groups.map((g) => (
          <RegionSection key={g.region} group={g} />
        ))}
      </div>
    </section>
  );
}
