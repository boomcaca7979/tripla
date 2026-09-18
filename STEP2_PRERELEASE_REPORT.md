# STEP 2 — NEW PROJECT PRE-RELEASE REPORT

**Project:** `tripla-v2` (new Vercel project, dual-project coexistence with old `travel-planner`)
**Date:** 2026-09-10 (22:18 GMT+8)
**Verdict:** `# MIGRATION BLOCKED`
**Domain touched?** NO. `utripla.xyz` / `www.utripla.xyz` untouched.

---

## ⚠️ PIVOTAL CORRECTION (read first)

The previous diagnosis — *"the production domain is stuck on an old pre-Next-16 build; the application code is FULLY ACCEPTED"* — is **incorrect**.

Evidence this session: a **brand-new, clean project** (`tripla-v2`) built a **fresh** production deployment directly from commit `3350b43` (API-confirmed `meta.commit = 3350b436f459081fb678c7a01bdb90acc5c32837`). That fresh build **still throws `Minified React error #418` on every load** (4/4 loads: fresh + 3 reloads).

Why the earlier "edge stuck / code is fine" reading was wrong: the old project had `ssoProtection: {deploymentType:"all_except_custom_domains"}`, so every `*.vercel.app` URL was served **Vercel's login page** (not our app). Those raw URLs *looked* clean only because they weren't our app at all. The custom domain `utripla.xyz` was exempt from SSO, so it served the **real app — which has #418**. The bug is therefore **in the build/code, not the Vercel edge**.

The `suppressHydrationWarning` added in `3350b43` (7 sites) is **insufficient** to silence #418 in the production SSG output.

---

## 1. New Project Name
`tripla-v2`

## 2. New Project ID
`prj_AiGj8U2uZUUeB1zbLrRGL7O7NjAO`

## 3. GitHub Connection
Connected → `github` · org `boomcaca7979` · repo `tripla` · `productionBranch: main` ✅

## 4. Production Branch
`main`

## 5. Environment Variable Names (values NOT printed)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → production
- `NEXT_PUBLIC_SUPABASE_URL` → production
- (Only these 2 user vars; Vercel system vars `VERCEL_*` / `TURBO_*` are auto-injected, not copied.)

## 6. Deployment ID
`dpl_66j5Ptgc6apxQcD8Mm3yGDXmwpTv`

## 7. Deployment URL
`https://tripla-v2-n0kn8djvg-boomcaca666s-projects.vercel.app/`

## 8. Build Status
`READY` — built from commit `3350b43`, target `production`. Build succeeded, no build errors.

## 9. Hydration Status  ← BLOCKER
**FAIL.** `Minified React error #418` on **4/4** loads (fresh + 3 reloads). Console not clean.
The new project has a **fresh edge routing table** (no stickiness), so this error is **not** an edge artifact — it is reproduced in a clean build.

## 10. 1280 Evidence
App renders the full Phase 4 UI (`title = tripla — Interactive Travel Discovery`, H1 "Where do you want to disappear to?", weather/mood/instrument controls, JSON-LD). No horizontal overflow. Screenshot: `v2_1280.png`. **But #418 present.**

## 11. 768 Evidence
Renders correctly, no overflow. Screenshot: `v2_768.png`. **#418 present.**

## 12. 390 Evidence
Renders correctly, no horizontal overflow (scrollWidth ≤ innerWidth). Screenshot: `v2_390.png`. **#418 present.**

## 13. Interaction Evidence
Phase 4 controls are present in the DOM: `role="slider"` ×1, `.ut-wx-btn` ×5, `data-ut-*` attributes, weather/mood buttons. Interaction was **not** fully exercised because the page never reaches a clean hydration state (#418 is a hard failure).

## 14. Environment Continuity
Single-world scroll structure present (Hero → Discovery → Routes → Field Notes → Footer). Not formally validated due to #418.

## 15. SEO
Structurally correct: `<title>`, `<meta name="description">`, `<link rel="canonical" href="https://www.utripla.xyz/">`, `WebSite`/`@context` JSON-LD all present. Invalidated as a "pass" only because the page carries a hydration error.

## 16. Sitemap / 17. Robots
Not separately executed — the gate stopped at Hydration (section 9). Code path is identical to the accepted build; cannot be certified while #418 stands.

## 18. Performance
Not measured (blocked by hydration failure).

## 19. Regression
Not executed (blocked by hydration failure).

## 20. Old Project Status
**INTACT.** `travel-planner` (`prj_xJk9idoYPsrn4vBgrpTjpFBsRVkn`) — unmodified, not deleted, deployments and env vars preserved.

## 21. Domain Status
`utripla.xyz` / `www.utripla.xyz` — **UNTOUCHED**. No remove / add / DNS / SSL / alias changes.

## 22. STEP 3 Readiness
**NOT READY.** STEP 3 (domain migration) must not run while #418 exists — migrating now would simply move the same hydration error onto the public domain.

---

# MIGRATION BLOCKED

**Reason:** The accepted-build assumption is false. A clean, fresh deployment of `3350b43` on a brand-new project **still throws React #418**. The defect is in the application's production hydration, not the Vercel edge or the domain.

**Do NOT:** migrate the domain, modify DNS, or re-deploy hoping it clears. None of those address a code-level hydration mismatch.

**Required next step (user decision — code edits are out of scope for this flow):**
Properly resolve the #418 in source — `suppressHydrationWarning` alone is not enough. Likely culprits:
- Time-/locale-derived text rendered during SSG then re-rendered on the client (e.g. `TimeGreeting` / `TimeDock` / `HomeEnvironment`).
- The inline `js-ready` script mutating `<html>` before hydration.
- Nested text children where `suppressHydrationWarning` (one level only) doesn't apply.

Once the build is proven #418-free on `tripla-v2` (re-run the verification), STEP 3 domain migration can proceed.
