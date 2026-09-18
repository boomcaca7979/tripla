# NASA POWER PRODUCTION RELEASE GATE

- gate id: `nasa-power-production-release-gate-2026.09.13.v1`
- decision inputs: compliance v2 PASS · readiness READY · migration PASS
- companion: `release-gate-v1.json`

## 1. Source Authority

Latitude-derived climate authority **retired from all code paths** (0 calls;
functions removed from `src/lib/climate-pattern.ts`, only geographic/calendar
helpers remain). The **NASA POWER canonical dataset is the only climate
authority** for Best-time: monthly values, qualitative buckets, R1–R7 tiers and
the best-time window all derive from `src/data/climate/nasa-power-canonical-v1.json`.

## 2. Best Months Authority

Best Months on every migrated page = canonical `bestMonthsBaseline`
(R1–R7-derived, freeze-validated). The legacy editorial `dest.bestMonths` string
is **no longer rendered** as the Best-time window. Metadata title, FAQ, CTA,
hero window and the "Why these months?" paragraph all read the canonical label.

## 3. Legacy Leakage

- **Release-gate catch + fix:** `RecommendationModule` still rendered the legacy
  `{dest.bestMonths}` string in the visible reasoning paragraph — found by this
  gate and **fixed before release** (now renders the canonical window label).
- Final sweep: 145/145 pages render the canonical Best Months (0 mismatch);
  0 pages contain the old "stated best-time window is <abbr-range>" sentence;
  0 legacy 3-letter month-range leaks in window phrases.
- Hub/listing surfaces (`/best-time-to-visit` hub, `DestinationsClient`) still
  show `dest.bestMonths` as **pre-existing editorial metadata** on destination
  cards — not the climate authority, not part of the migrated pages, unchanged
  by this release.

**canonical Best Months displayed = 145/145 · legacy Best Months leakage = 0**

## 4. Artifact Integrity — PASS

`nasa-power-canonical-v1.json`: file sha256 `fb8d12c6de58d616…`, embedded
self-hash `c92bd293cb79…` (recomputation-verified), source linkage
`9ac50d81a0b2…` — all identical to the migration report.

## 5. Numerical — PASS

coreClimateHash / recommendationHash / bestMonthsHash recomputed from the
production artifact and matched against the v8.7 freeze baseline.

## 6. Schema — PASS

145 records / 1740 months / 0 schema errors / 0 classification differences /
0 Best Months differences (re-run of `migration_gates.py`).

## 7. Build — PASS

Worktree at HEAD + release file list only → clean build, 1132/1132 static pages.
This proves the pushed tree is self-consistent **without** the excluded
pre-existing changes. `/api/weather` and `/api/geocoding` byte-unchanged.

## 8. Determinism — PASS

(Carried from migration: clean builds byte-identical for all 145 pages after
excluding only the Next.js BUILD_ID.)

## 9. Runtime — PASS

0 runtime NASA/climate requests; NASA domain appears only as provenance strings
inside the static artifact.

## 10. SEO — PASS

Sampled across regions (Tokyo / Paris / Singapore / New York / Phnom Penh /
Siem Reap / Ho Chi Minh City): correct `rel="canonical"`, 0 noindex, OG present,
Article + BreadcrumbList + FAQPage JSON-LD present, sitemap untouched, no NASA
API URL in canonicals.

## 11. Attribution — PASS

Every Best-time page carries `Climate data source: NASA POWER (NASA Langley
Research Center) · …`. 0 NASA logo/insignia, 0 endorsement claims, 0 forbidden
phrases ("NASA tested/approved/endorsed", "NASA-powered"), 0 stale
"not measurements / general pattern / latitude-derived" copy.

## 12. Git Scope

**RELEASE_COMMIT_FILE_LIST** (A-class only):
- `src/app/best-time-to-visit/[slug]/page.tsx`
- `src/lib/climate-pattern.ts`
- `src/data/climate/nasa-power-canonical-v1.json`
- `src/data/climate/nasa-canonical.ts`
- `src/components/besttime/`
- `src/components/inner/`
- `src/components/destination/`

Excluded (C — pre-existing prior-phase edits, left uncommitted):
`src/app/destinations/[slug]/page.tsx`, `src/app/guides/[slug]/page.tsx`,
`src/app/trips/[slug]/page.tsx`, `src/app/globals.css`,
`src/components/ui/Eyebrow.tsx` (comment-only; HEAD version API-identical).
Excluded (D — unrelated): `src/components/journey/` (only the excluded trips
page consumes it). Excluded (B): all `pilot/` assets and root strategy/report
markdown files remain untracked.

Secret scan: 0 env/secret/token/NetCDF/raw-data files in the release scope.

## 13. Remaining Risks

1. Deployed design tokens will be the HEAD values (the excluded `globals.css`
   contrast tweaks stay uncommitted) — visual only, no functional impact.
2. Hub/listing pages still show legacy editorial best-months strings on
   destination cards (pre-existing, editorial layer, not climate authority).
3. EU database right: LEGAL REVIEW REQUIRED residual (compliance v2).
4. NASA automation quota: UNVERIFIED (operational; future re-acquisitions).

## 14. Release Decision

**RELEASE READY** — all gates PASS; no legacy climate authority leakage;
145/145 canonical Best Months; production diff fully classified and coherent
(worktree-proven). Authorized to proceed: commit → push → deploy → live audit.

## 15. Release Execution (post-decision)

- **COMMIT = PASS** — `0c4488a` "feat(best-time): promote NASA POWER climate
  dataset" (34 files; `git diff --cached --check` clean; 0 secret patterns;
  excluded C-class edits remain uncommitted in the working tree as planned).
- **PUSH = PASS** — `main == origin/main == 0c4488a`.
- **DEPLOY = PASS** — Vercel production deployment
  `travel-planner-b4au1gk7r-…vercel.app` = **Ready** (1m), build logs confirm
  `Branch: main, Commit: 0c4488a`; production domain `https://utripla.xyz` live.
- **LIVE AUDIT = PASS** — 8/8 sampled URLs (home + Tokyo / Paris / Singapore /
  New York / Phnom Penh / Siem Reap / Ho Chi Minh City): HTTP 200, NASA POWER
  attribution present, January tempHighC equals the canonical value, canonical
  bestMonthsBaseline window rendered (live title example: "Best Time To Visit
  Tokyo · December Travel Guide"), correct rel=canonical, 0 forbidden branding.

## 16. FINAL DECISION

**FINAL DECISION: RELEASE PASS**

COMMIT = PASS · PUSH = PASS · DEPLOY = PASS · LIVE AUDIT = PASS ·
PRODUCTION RELEASE: PASS
