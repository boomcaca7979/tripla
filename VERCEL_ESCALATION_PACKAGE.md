# VERCEL SUPPORT ESCALATION PACKAGE — UTRIPLA 2.0

**Status:** `# ESCALATION REQUIRED` · `# RELEASE BLOCKED`
**Generated:** 2026-09-10 (session re-run)
**Action taken by reporter:** READ-ONLY diagnosis only. No redeploy, no alias/domain reset, no cache purge, no code change.

---

## 1. Account & Resource Identifiers

| Field | Value |
|---|---|
| Project ID | `prj_xJk9idoYPsrn4vBgrpTjpFBsRVkn` |
| Team ID | `team_szRLX8YrEzFPhJNUjXT4yZ9H` |
| Custom Domain | `utripla.xyz` (also `www.utripla.xyz` → 307 → apex) |
| Latest production deployment | `travel-planner-m9k7way4s` |
| Production Deployment ID | `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` |
| Git commit | `3350b43` — `fix: resolve React hydration mismatch (#418) on home` |
| Framework | Next.js 16.2.7 / React 19.2.4 / Turbopack (NEW build signature `VEU71W_className…`) |
| Old (frozen) build | Next 15 / webpack (signature `geistsans_f7939ba5-module__FHWi_W__variable…`) |

---

## 2. Control-Plane Status (VERIFIED CORRECT)

Queried live via `api.vercel.com` (read-only):

- **Production target:** `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` (`travel-planner-m9k7way4s…vercel.app`) — `readyState: READY`, `ssoProtection: None`.
- **Aliases:**
  - `utripla.xyz` → `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` ✅
  - `travel-planner-boomcaca666s-projects.vercel.app` → `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` ✅
  - `travel-planner-two-livid.vercel.app` → `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` ✅
- **Domains:** `utripla.xyz` `verified: True`.
- **Recent deployments:** all `READY` (m9k7way4s / 67z4yyt2v / pfgb2gajc / q9rizd5ql).

➡ The control plane correctly points **every** production hostname at the clean `m9k7way4s` build.

---

## 3. Edge Data-Plane Status (FAULTY — THE BLOCKER)

**10 consecutive requests** to `https://utripla.xyz/` (Playwright / Chrome / `networkidle`):

| # | status | x-vercel-cache | etag | build signature | React #418 |
|---|---|---|---|---|---|
| 1 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD (`geistsans_f7939ba5`) | YES |
| 2 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD | YES |
| 3 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD | YES |
| 4 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD | YES |
| 5 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD | YES |
| 6 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD | YES |
| 7 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD | YES |
| 8 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD | YES |
| 9 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD | YES |
| 10 | 200 | HIT | `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` | OLD | YES |

- **OLD:** 10/10 · **NEW:** 0/10 · **React #418 hits:** 10/10
- `x-vercel-id` rotated across `iad1::*` edge nodes, but **every node returned the identical old-build etag** → not node flapping; the edge data plane as a whole is pinned to the stale deployment.

**Conclusion:** `# PRODUCTION EDGE DATA-PLANE ISSUE` — the edge is serving a frozen pre-Next-16 deployment that is no longer the production target (and has been superseded by `3350b43`).

---

## 4. Evidence of Inconsistency (Control Plane vs Edge)

- Control plane says: serve `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` (NEW build).
- Edge actually serves: a cached copy with etag `W/"ffacef4d56a1d52d2cbe4a16c54f0674"` (OLD `geistsans_f7939ba5` build) that throws `Minified React error #418`.
- `cache-control` is `public, max-age=0, must-revalidate` with conditional `304` revalidation, yet the edge keeps returning the stale artifact — i.e. the **deployment mapping at the edge is stuck**, not a normal TTL.

---

## 5. Requested Action (DO NOT just purge cache)

> **Force-flush / rebuild the edge routing and cached deployment mapping for the custom domain `utripla.xyz`.**

Specifically ask Vercel to:
1. Invalidate the edge's **deployment-to-host mapping** for `utripla.xyz` (and `www.utripla.xyz`), so it re-resolves to `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j`.
2. Drop the pinned cached response (`etag W/"ffacef4d56a1d52d2cbe4a16c54f0674"` / old build HTML) at the edge for this domain.
3. Confirm the edge now serves the NEW Turbopack build (`VEU71W_className…`) with **0 React #418**.

Plain cache purge (`vercel cache purge`) has already been run multiple times by the reporter and did **not** resolve it — the issue is the **edge data-plane routing/mapping**, not the HTTP object cache.

---

## 6. Problem Description (copy-paste for Vercel Support ticket)

> Our project control plane has the production target set to the latest READY deployment
> (`dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j`, build `travel-planner-m9k7way4s`, commit `3350b43`,
> Next.js 16.2.7 / Turbopack). All aliases for the custom domain `https://utripla.xyz/` point to
> this deployment, and SSO is disabled.
>
> However, the production custom domain still returns, from the **Edge Data Plane**, the HTML of an
> OLD deployment (pre-Next-16 / webpack signature `geistsans_f7939ba5…`), which triggers a
> `Minified React error #418` hydration mismatch. We confirmed this with 10 consecutive requests:
> every response is HTTP 200, `x-vercel-cache: HIT`, with an identical stale `etag`, and a runtime
> React #418 error. Local and deployment-level verification of the current build PASSES.
>
> We have already tried (with no effect): multiple `vercel deploy --prod`, alias remove/set,
> domain remove/add, several `vercel cache purge`, deletion of old deployments, disabling SSO, and
> the REST purge-cache endpoint.
>
> **The Control Plane and Edge Data Plane are inconsistent.** Please force-flush / rebuild the edge
> routing and cached deployment mapping for the custom domain so it serves `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j`.

---

## 7. What Was NOT Done (per procedure)

- ❌ No application code modified (Home / Phase 4 visuals / visual-state / SEO / layout / hydration fix / package.json / Next config).
- ❌ No new `vercel deploy --prod`.
- ❌ No alias / domain reset.
- ❌ No further cache purge (known-ineffective).

---

## 8. Blocker Summary

- **Blocker:** Vercel edge data plane serves a frozen pre-Next-16 build on `utripla.xyz` (React #418).
- **Evidence:** 10/10 old build + 10/10 #418 + identical stale etag + `x-vercel-cache: HIT`.
- **Control Plane:** correct (target `m9k7way4s` READY, aliases correct, SSO off).
- **Edge Data Plane:** stuck on deleted/old build.
- **Actions already tried:** deploy ×multiple, alias reset, domain reset, cache purge ×multiple, old-deployment deletion, SSO off, REST purge API (404).
- **Support escalation:** REQUIRED (cannot be resolved from customer side).

# ESCALATION REQUIRED
# RELEASE BLOCKED
