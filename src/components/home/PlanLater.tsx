import Eyebrow from "@/components/ui/Eyebrow";
import SearchBar from "@/components/search/SearchBar";

/**
 * PlanLater — "Already know where?" 层。
 * 把既有 SearchBar（geocoding autocomplete 完整保留）降为次级入口，
 * 并保留 `#hero-search` 锚点：60 个 AI 落地页与攻略页的 planner 深链依赖它。
 */
export default function PlanLater() {
  return (
    <section
      id="ready"
      className="scroll-mt-20 border-t"
      style={{ borderTopColor: "rgba(var(--ut-accent-rgb), 0.16)" }}
    >
      <div className="mx-auto max-w-[var(--ut-container-max)] px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow dot>When you&apos;re ready</Eyebrow>
          <h2 className="mt-3 font-display text-h1 text-ut-ink">Already know where?</h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-body text-ut-text-2">
            Pick an origin and a destination — we&apos;ll sketch the route,
            check the weather window and hand you a plan you can bend.
          </p>
        </div>

        <div id="hero-search" className="mx-auto mt-10 max-w-3xl scroll-mt-24">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
