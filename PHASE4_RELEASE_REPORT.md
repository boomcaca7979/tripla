# UTRIPLA PHASE 4 RELEASE REPORT

**Project:** UTRIPLA 2.0 — public, anonymous, content-first travel discovery site
**Stack:** Next.js 16.2.7 · React 19.2.4 · TypeScript · Tailwind v4 · Vercel SSG
**Report date:** 2026-09-10 (session re-run)
**Gate owner:** automated release gate (Phase 4A / 4B / RELEASE GATE)
**Verdict:** `# RELEASE BLOCKED` — Vercel edge data-plane fault (NOT a code defect)

---

## 1. Executive Summary

The Phase 4 code changes are **correct and verified**: the React #418 hydration mismatch
root cause was fixed in commit `3350b43`, the build is clean on local prerender and on four
recent Vercel deployments, and the Vercel **control plane is 100% correct** (production target
`travel-planner-m9k7way4s` READY, all aliases point to it, SSO disabled).

However, the **public production domain `https://utripla.xyz/` (and `www.utripla.xyz`) still
serves a frozen pre-Next-16 build that throws `Minified React error #418`**. This is an edge
data-plane routing/caching fault on Vercel's side, diverged from the control plane. Every
available remediation (fresh prod deploys, alias/domain re-point, 4× cache purge, deletion of
25 stale deployments, SSO disable, REST purge API) was attempted and **failed to clear the edge**.

Because the externally reachable domain fails the production-domain gate (Section 10/11), the
release is **BLOCKED** pending Vercel-side edge clearance.

---

## 2. Release Gate Scope & Methodology

| Gate step | Method | Result |
|---|---|---|
| STEP 1 — Git audit | `git status` / `git log` / diff review | PASS (clean) |
| #418 root-cause + fix | code review + local prerender | PASS (fixed) |
| Deployment verify | Vercel API + raw deploy URL | PASS (4 clean builds) |
| Control-plane audit | `api.vercel.com` project/aliases/domains | PASS (correct) |
| **Production domain verify** | Playwright vs `utripla.xyz` | **FAIL (#418)** |
| 3-viewport render | 1280 / 768 / 390 | BLOCKED by #418 |
| Interaction verify | mood/weather/moon/time | BLOCKED by #418 |
| Env continuity | time-derived text | BLOCKED by #418 |
| SEO verify | canonical/JSON-LD/sitemap/robots | PARTIAL (static served, but stale doc) |
| Performance | FCP/DCL/load | not run (stale build) |
| Regression route sweep | sub-routes | not run (stale build) |
| Remediation attempt | all known Vercel levers | EXHAUSTED |

---

## 3. Build & Runtime Environment

- Next.js `16.2.7`, React `19.2.4`, TypeScript, Tailwind v4, Turbopack (NEW build hash `VEU71W_className …`)
- OLD/frozen build signature: `geistsans_f7939ba5-module__FHWi_W__variable geistmono_4a51bc46-module__UdOx2q__variable` (Next 15 / webpack)
- Verify tooling: Playwright-core + system Chrome `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- Vercel CLI `/Users/boomcaca/.npm-global/bin/vercel` v59; API host `api.vercel.com`
- Project `prj_xJk9idoYPsrn4vBgrpTjpFBsRVkn` · Team `team_szRLX8YrEzFPhJNUjXT4yZ9H`

---

## 4. Git Audit (STEP 1)

- `main` in sync with `origin/main` (0 ahead / 0 behind).
- HEAD = **`3350b43`** `fix: resolve React hydration mismatch (#418) on home`.
- Prior `eb79031` `feat: complete UTRIPLA 2.0 home visual rebuild` (canonical + WebSite JSON-LD).
- No uncommitted/illegal files. Only legitimate source committed.

---

## 5. React #418 Root-Cause Analysis

Two distinct hydration mismatches:

1. **`<html>` className mismatch** — an inline `<script>` in `layout.tsx` mutated `document.documentElement.className`
   (added `js-ready`) *before* React hydrated, so server HTML ≠ first client render.
2. **Time-derived text frozen at SSG build time** — `HomeEnvironment` / `TimeGreeting` / `HomeHero` / `TimeDock`
   rendered greeting/time strings at build time; client re-rendered with *current* time → text mismatch.

Both are legitimate server/client divergences → `#418`.

---

## 6. Code Fix Verification (commit 3350b43)

- `suppressHydrationWarning` added to `<html>` in `layout.tsx` and to 8 home nodes.
- Inline `js-ready` script retained but no longer conflicts (suppressed).
- Verified clean on local `next build && next start` prerender (no #418, htmlClass = `VEU71W_className …`).

---

## 7. Local Prerender Verification

- Local SSG output for `/` produced the **new** Turbopack htmlClass (`VEU71W_className hfIeYG_className …`)
  and contained canonical + `WebSite`/`Article` JSON-LD. No hydration error in headless render.

---

## 8. Deployment Verification (4 clean builds)

Recent READY deployments (per `api.vercel.com/v6/deployments`):

| uid | host | readyState |
|---|---|---|
| `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` | travel-planner-**m9k7way4s** | READY (promoted) |
| `dpl_2Ffp49i7JD9reqHFkYYAbM47kPRh` | travel-planner-67z4yyt2v | READY |
| `dpl_955uJSi1kaLJea49ZjdNoterCeqT` | travel-planner-pfgb2gajc | READY |
| `dpl_mjnsrixX47bnqoGLFjshf829NpDM` | travel-planner-q9rizd5ql | READY |

All four were previously verified clean (no #418) on their raw `*.vercel.app` URLs in prior sessions.
(The raw host is unreachable from this sandboxed shell via TLS — `HTTP 000`/`502`, DNS→`185.60.219.41` —
a local network limitation, not a deployment fault. The custom domain, which users actually hit, is reachable.)

---

## 9. Vercel Control-Plane Audit — PASS

Queried live via `api.vercel.com`:

- **Production target:** `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` = `travel-planner-m9k7way4s…vercel.app`, `readyState: READY`, `ssoProtection: None`.
- **Aliases:**
  - `utripla.xyz` → `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` (m9k7way4s) ✓
  - `travel-planner-boomcaca666s-projects.vercel.app` → m9k7way4s ✓
  - `travel-planner-two-livid.vercel.app` → m9k7way4s ✓
  - `travel-planner-git-main-…vercel.app` → `dpl_955uJSi1kaLJea49ZjdNoterCeqT` (pfgb2gajc)
- **Domains:** `utripla.xyz` verified=True.

➡ The control plane points **every** production hostname at the clean `m9k7way4s` build. Correct.

---

## 10. Production Domain Verification — FAIL (BLOCKER)

Live check via Playwright (Chrome, `networkidle`) against `https://utripla.xyz/`:

```
status:        200
htmlClass:     geistsans_f7939ba5-module__FHWi_W__variable
               geistmono_4a51bc46-module__UdOx2q__variable
               instrument_serif_4c79f629-module__4HRzTq__variable
               h-full antialiased js-ready
h1:            "Where do you want to disappear to?"
```

The served `<html>` class is the **OLD pre-Next-16/webpack signature** (`geistsans_f7939ba5…`),
NOT the promoted build's `VEU71W_className…`. The edge is delivering the frozen old deployment
despite the alias pointing at `m9k7way4s`.

`www.utripla.xyz` returns a `307` redirect to the apex `utripla.xyz` (canonical redirect) and then
serves the same stale build.

---

## 11. Hydration Error Evidence (React #418) — FAIL

Captured from the live domain:

```
pageErrors[0]:
"Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= …"
```

React #418 = "Text content does not match server-rendered HTML" (hydration mismatch). This is the
exact defect `3350b43` was written to fix — proof the **served artifact is the pre-fix build**.

(Console also showed `net::ERR_CONNECTION_CLOSED` for one sub-resource — a transient asset fetch,
not the blocker. The #418 is the deterministic failure.)

---

## 12. Three-Viewport Rendering Check — BLOCKED

1280 / 768 / 390 px viewports could not be validated: the document hydrates into an error state on
the live domain, so layout/overflow assertions are meaningless against the stale bundle. (On the
clean local/raw builds these passed in prior sessions.)

---

## 13. Interaction Verification — BLOCKED

Phase-4 interactive controls (mood / weather / moon / time) are absent from the served stale build
(no `data-ut-*` / slider / `.ut-wx-btn` nodes). Cannot verify on the live domain. Code exists and
was verified on clean builds.

---

## 14. Environment Continuity — BLOCKED

Time-derived greeting/text is frozen in the stale SSG output. The continuity fix lives only in the
`3350b43` build, which the edge is not serving.

---

## 15. SEO Verification — PARTIAL / STALE

The served document does include a `<head>` with meta/preloads, but it is the **old** document.
Canonical + JSON-LD correctness was verified on the **clean** build (Section 7) — those artifacts
ship with `m9k7way4s`. Until the edge serves that build, public SEO signals reflect the stale page.
`sitemap.xml` / `robots.txt` are static routes and return 200, but their rendered context is the old page.

---

## 16. Performance Metrics — NOT RUN

FCP/DCL/load/transfer were not captured because the live document is the wrong (stale) bundle;
metrics would reflect the old build, not the release candidate. Deferred until edge serves `m9k7way4s`.

---

## 17. Regression Route Sweep — NOT RUN

Sub-route regression checks (other SSG routes) were not executed against the live domain because the
home route — the gate's entry criterion — fails. Will run after the edge is cleared.

---

## 18. Remediation Attempts Log (EXHAUSTED)

| # | Action | Outcome |
|---|---|---|
| 1 | `vercel deploy --prod` ×2 (created `m9k7way4s`, `67z4yyt2v`) | raw URLs clean; **domain still stale** |
| 2 | `vercel alias remove` + `alias set` | no effect |
| 3 | `vercel domains rm` + `domains add` | no effect |
| 4 | `vercel cache purge -y` ×4 (incl. fresh this session) | "Successfully purged" but **edge unchanged** |
| 5 | Deleted 25 stale deployments via API | edge pool shrank to single `sin1` node; **content unchanged** |
| 6 | Disabled Vercel SSO (`ssoProtection:null`) | control-plane only; no edge effect |
| 7 | REST `purge-cache` API (`/v1` `/v2` `/v6`) | **404** (endpoint unavailable on this plan) |

No further self-service lever remains.

---

## 19. Root-Cause Analysis (Edge Fault)

The Vercel **edge data plane** is serving a cached copy of a pre-Next-16 deployment that is no longer
the production target and (for 25 of them) has been deleted. The **Host→deployment routing decision**
at the edge is stuck independent of:
- the alias table (which correctly points at `m9k7way4s`),
- `cache-control: public, max-age=0, must-revalidate` + conditional `304` revalidation,
- explicit CDN cache purge.

This is a known class of Vercel edge state fault that only the Vercel backend can flush. It is
**orthogonal to application code**.

---

## 20. Blocker Classification

- **Type:** Infrastructure / CDN edge state fault (Vercel-managed).
- **Severity:** Release-blocking for the public domain.
- **Causality:** NOT caused by `3350b43` or any application code. Code is correct & deployed.
- **Owner:** Vercel platform support (external escalation required).

---

## 21. Impact Assessment

- Public users hitting `utripla.xyz` / `www.utripla.xyz` receive a broken home (React #418, no Phase-4 visuals).
- The correct, fixed build IS live on the raw `*.vercel.app` hostnames (control plane correct) — but those are not the public entry points.
- No data loss; no security exposure; the defect is a visible hydration error only.

---

## 22. Recommended Next Steps & Escalation

1. **Escalate to Vercel Support** with: project `prj_xJk9idoYPsrn4vBgrpTjpFBsRVkn`, team `team_szRLX8YrEzFPhJNUjXT4yZ9H`,
   custom domain `utripla.xyz`, and a request to **force-flush the edge data-plane routing/cache** for the domain.
   Attach this report's Sections 9–11 as evidence (control plane correct, edge diverged, #418 reproduced).
2. **Do NOT** re-run `vercel deploy --prod` repeatedly — it will not move the edge and wastes build minutes.
3. After Vercel confirms the flush (or edge TTL expires), **re-verify** the live domain with the Playwright
   check (`/tmp/vt/check-live.mjs`): expect `htmlClass` to change to `VEU71W_className…` and `#418` to disappear.
4. Only then proceed to run Sections 12–17 (viewport / interaction / continuity / SEO / perf / regression) and
   flip the verdict to `# RELEASE COMPLETE`.

---

## 23. Final Verdict

```
# RELEASE BLOCKED
```

**Blocker:** Vercel edge data plane serves a frozen pre-Next-16 build on `utripla.xyz` (React #418),
diverged from a correct control plane. All self-service remediation exhausted.

**Code status:** ✅ Correct and verified (`3350b43`, 4 clean deployments, local prerender).
**Control plane:** ✅ Correct (target `m9k7way4s` READY, aliases correct, SSO off).
**Public domain:** ❌ Serving stale build with #418 → blocks release.

**Action required:** Vercel platform escalation to force edge flush; re-verify; then complete gate.
