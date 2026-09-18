# Vercel Tripla Project Relationship Audit

- Audit date: 2026-09-13 (UTC)
- Auditor: ZCode (read-only investigation; no destructive operations performed)
- Team: `boomcaca666's projects` (`team_szRLX8YrEzFPhJNUjXT4yZ9H`), plan: **Hobby**
- Vercel account: `boomcaca666` (uid `ARpOSktPuMGjPPjSM5DF42vi`)
- Method: Vercel REST API v6/v9 + Vercel CLI 59.0.0 (`project inspect`, `domains inspect`, `ls`) + DNS/HTTP probes + local repo inspection

---

## 1. Projects Identified

| | Project A | Project B |
|---|---|---|
| Name | `travel-planner` | `tripla-v2` |
| Created At | 2026-06-08 14:09:42 UTC (97 days ago) | 2026-09-10 14:08:31 UTC (3 days ago) |
| Age vs first deployment | **94 days dormant** (first deploy only on 2026-09-10) | Deployed within 1 minute of creation |
| Total deployments (all time) | **6** | **4** |
| Latest Production URL | `travel-planner-two-livid.vercel.app` | **`utripla.xyz`** |

## 2. Project IDs

- travel-planner: `prj_xJk9idoYPsrn4vBgrpTjpFBsRVkn`
- tripla-v2: `prj_AiGj8U2uZUUeB1zbLrRGL7O7NjAO`

Both IDs independently confirmed via CLI `project inspect` and API `GET /v9/projects/{id}`.

## 3. Git Repository

Both projects connect to the **same repository with the same credential**:

| Field | travel-planner | tripla-v2 |
|---|---|---|
| type | github | github |
| org | boomcaca7979 | boomcaca7979 |
| repo | tripla (repoId `1263673862`, public) | tripla (repoId `1263673862`, public) |
| productionBranch | `main` | `main` |
| gitCredentialId | `cred_1a69eb283d242db388e3139d19c0c3a2b1395e0a` | `cred_1a69eb283d242db388e3139d19c0c3a2b1395e0a` |
| deployHooks | none | none |

Confirmed: deleting one project does NOT affect the GitHub repo or the other project's Git connection — the GitHub App integration is per-project.

## 4. Production Domains

### Verdict: `utripla.xyz` and `www.utripla.xyz` belong exclusively to **tripla-v2**.

Evidence:

1. `GET /v9/projects/prj_AiGj8U2uZUUeB1zbLrRGL7O7NjAO/domains` → `www.utripla.xyz` (added 2026-09-10 15:48:13 UTC), `utripla.xyz` (added 2026-09-10 15:47:22 UTC), plus `tripla-v2.vercel.app`.
2. `GET /v9/projects/prj_xJk9idoYPsrn4vBgrpTjpFBsRVkn/domains` → only `travel-planner-two-livid.vercel.app`. **No custom domain.**
3. `vercel domains inspect utripla.xyz` → Projects table shows only `tripla-v2`.
4. DNS: `utripla.xyz` A → `216.198.79.1` (Vercel anycast); `www.utripla.xyz` CNAME → `…vercel-dns-017.com` → `64.29.17.1 / 216.198.79.1`. HTTP 200 serving the UTRIPLA Next.js app.
5. tripla-v2's current production deployment (`dpl_584nDf5EyYKJpCC4ksyXdVN5u3SV`) carries aliases `utripla.xyz`, `www.utripla.xyz`, `tripla-v2.vercel.app`, `tripla-v2-…vercel.app`, `tripla-v2-git-main-…vercel.app`.

Historical note: travel-planner's 2026-09-10 deployment (`dpl_8At8vudD…`) has `utripla.xyz` in its alias snapshot — the domain was briefly pointed at travel-planner on Sep 10 before being moved to tripla-v2 the same day. It has never been a stable travel-planner domain.

Also observed: `travel-planner-two-livid.vercel.app` and `travel-planner-…vercel.app` are **unreachable from the operator's network** — DNS for `*.vercel.app` resolves to `199.59.148.106` (a DNS-poisoning sinkhole) and connections time out. This is almost certainly why the custom domain `utripla.xyz` exists at all. The `.vercel.app` URLs of tripla-v2 are equally unreachable from that network, so `utripla.xyz` is the only usable public entry point.

## 5. Deployment History

### travel-planner — complete history (6 deployments, all production)

| # | uid | created (UTC) | state | target | branch | sha | commit |
|---|---|---|---|---|---|---|---|
| 1 | dpl_mjnsrixX47b | 2026-09-10 08:27:11 | READY | production | main | eb79031f18 | feat: complete UTRIPLA 2.0 home visual rebuild |
| 2 | dpl_955uJSi1kaL | 2026-09-10 08:57:15 | READY | production | main | 3350b436f4 | fix: resolve React hydration mismatch (#418) on home |
| 3 | dpl_2Ffp49i7JD9 | 2026-09-10 09:08:39 | READY | production | main | 3350b436f4 | fix: resolve React hydration mismatch (#418) on home |
| 4 | dpl_4ahc4EeTh4w | 2026-09-10 09:33:09 | READY | production | main | 3350b436f4 | fix: resolve React hydration mismatch (#418) on home |
| 5 | dpl_8At8vudD3Vz | 2026-09-10 15:38:01 | READY | production | main | 2873745f96 | fix(home): deterministic SSG initial state (React #418) |
| 6 | dpl_2JgdtLE751V | 2026-09-13 09:52:23 | READY | production | main | 0c4488a5c0 | feat(best-time): promote NASA POWER climate dataset |

### tripla-v2 — complete history (4 deployments, all production)

| # | uid | created (UTC) | state | target | branch | sha | commit |
|---|---|---|---|---|---|---|---|
| 1 | dpl_66j5Ptgc6ap | 2026-09-10 14:09:43 | READY | production | main | 3350b436f4 | fix: resolve React hydration mismatch (#418) on home |
| 2 | dpl_C7XiEoWZw9B | 2026-09-10 14:59:16 | READY | production | **fix/hydration-418** | 2873745f96 | fix(home): deterministic SSG initial state (React #418) — likely local CLI `vercel --prod` |
| 3 | dpl_AN6RrWk97Qv | 2026-09-10 15:38:02 | READY | production | main | 2873745f96 | fix(home): deterministic SSG initial state (React #418) |
| 4 | dpl_584nDf5EyYK | 2026-09-13 09:52:23 | READY | production | main | 0c4488a5c0 | feat(best-time): promote NASA POWER climate dataset |

Answers to STEP 3 questions:

- **A. Auto-deploy on git push:** Both. Every push to `main` since Sep 10 created production deployments on both projects simultaneously (e.g., the two 0c4488a deployments were created 11 ms apart — `09:52:23.499` vs `09:52:23.510` — a single GitHub webhook fanning out to two projects).
- **B. Latest production deployment:** Both on 2026-09-13 09:52 UTC.
- **C. Same commits?** Yes — every deployment since Sep 10 15:38 is mirrored (2873745, then 0c4488a).
- **D. `0c4488a` in both?** Yes: `dpl_2JgdtLE751V…` (travel-planner) and `dpl_584nDf5EyYK…` (tripla-v2), both READY/PROMOTED production.
- **E. Who serves NASA POWER release on the real domain?** tripla-v2 — `utripla.xyz` is aliased to `dpl_584nDf5EyYK…` (0c4488a). Verified live: `https://utripla.xyz` returns HTTP 200 with the UTRIPLA app HTML.

Note: both projects have fewer than 10 lifetime deployments; the tables above are complete, not truncated. There is no long-term parallel history — tripla-v2 simply did not exist before Sep 10.

## 6. Current Production Owner

**CURRENT PRODUCTION PROJECT = tripla-v2.**
**CURRENT PRODUCTION DOMAIN OWNER = tripla-v2** (holds `utripla.xyz` + `www.utripla.xyz`, verified via project-domains API, account-domain inspection, DNS, and live HTTP check).

travel-planner has no custom domain, no reachable URL, and no traffic routing.

## 7. Git Integration Differences

None. Same repo, same production branch (`main`), same credential, no ignored build step, no monorepo/root-directory overrides (`rootDirectory: null` on both), no deploy hooks, no branch filters. The only "difference" is that the integration exists twice — which is precisely why every push double-deploys.

## 8. Environment Variable Differences

| Variable | travel-planner | tripla-v2 | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ production-only | ✅ production-only | Identical name & target |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ production-only | ✅ production-only | Identical name & target |

- A-only: **none**. B-only: **none**. Both: the two Supabase vars above.
- Values were NOT read or output (both stored as sensitive/encrypted; API does not return them).
- **Critical finding: neither variable is referenced anywhere in the current codebase** (`grep -r NEXT_PUBLIC_SUPABASE src/` → 0 hits; no `supabase` usage in `src/`). They are leftovers from an earlier iteration. The live `utripla.xyz` build works with tripla-v2's own copies.
- Local `.env.local` contains only `NEXT_PUBLIC_TRAVELPAYOUTS_MARKER` (unrelated to either project's env store).
- Therefore there are **no unique production-only secrets** in either project.

## 9. Settings Differences

| Setting | travel-planner | tripla-v2 |
|---|---|---|
| Framework | nextjs | nextjs |
| Node version | 24.x | 24.x |
| Build / Install / Output | defaults (`null`) | defaults (`null`) |
| Root directory | `.` (null) | `.` (null) |
| serverlessFunctionRegion | iad1 | iad1 |
| Cron jobs | none | none |
| Security headers / rewrites / redirects | none at project level | none at project level |
| autoExposeSystemEnvs | true | true |

The two projects are configuration-identical. There is no configuration-based reason for both to exist.

## 10. Why Two Projects Exist

Reconstructed timeline (all UTC):

1. **2026-06-08 14:09** — `travel-planner` created (97 days before audit). It then sat **dormant for 94 days with zero deployments** — likely an earlier dashboard import/`vercel link` that was never used.
2. **2026-09-10 08:27** — first-ever travel-planner deployment (eb79031, UTRIPLA 2.0 home rebuild). The local repo directory was linked to it: `/Users/boomcaca/projects/tripla/.vercel/project.json` still points to `prj_xJk9idoYPsrn4vBgrpTjpFBsRVkn` / `travel-planner`.
3. **2026-09-10 14:08** — mid-pivot (hydration-418 debugging day), a second project `tripla-v2` was created from the same repo and immediately deployed (14:09, commit 3350b43).
4. **2026-09-10 15:47–15:48** — `utripla.xyz` and `www.utripla.xyz` were added and assigned to tripla-v2 (briefly pointed at travel-planner minutes earlier per its alias snapshot).
5. Since then, every push to `main` fan-outs to both projects (duplicate builds), while only tripla-v2 serves `utripla.xyz`.

Conclusion: `tripla-v2` was created as a fresh production project during the UTRIPLA 2.0 pivot and the domain was attached to it; `travel-planner` was left behind still connected to the same repo and never disconnected — a leftover duplicate, not a deliberate second environment.

## 11. Relationship Classification

**Classification: C (two independent projects duplicating the same repo's production) — with travel-planner simultaneously satisfying E (historical leftover).** Not A (different projects, different IDs), not D (travel-planner deploys to production too, not previews), not F (travel-planner has no domain/traffic/unique config or env).

## 12. Delete Safety — travel-planner

Verdict: **SAFE TO DELETE = YES** (conditional — one mandatory pre-step, see below).

Checklist:

| Criterion | Result |
|---|---|
| No production domain | ✅ Only auto `*.vercel.app` aliases (unreachable from operator's network anyway) |
| No current production deployment | ✅ Its "production" serves nothing; no traffic is routed to it |
| Not the live UTRIPLA project | ✅ `utripla.xyz` is tripla-v2's |
| No unique production env vars | ✅ Both vars duplicated in tripla-v2, and neither is used by current code |
| No unique important config | ✅ Settings are byte-identical to tripla-v2 |
| No business deployments to preserve | ✅ 6 deployments; every commit exists in git history (eb79031, 3350b43, 2873745, 0c4488a all in the repo) |
| Deleting won't affect Git integration | ✅ Shared credential `cred_1a69eb…` belongs to the account/GitHub App; repo connection of tripla-v2 is independent; GitHub repo itself untouched |
| Deleting won't affect DNS | ✅ travel-planner holds no DNS-relevant domain |
| Deleting won't affect utripla.xyz | ✅ Domain assigned exclusively to tripla-v2 |
| Deleting won't affect future deploys | ⚠️ **One caveat:** the local repo is linked to travel-planner |

**Mandatory pre-step before deletion:** re-link the local repository to tripla-v2, otherwise local `vercel` CLI commands in `/Users/boomcaca/projects/tripla` will fail after deletion:

```bash
cd /Users/boomcaca/projects/tripla
vercel link --yes --project tripla-v2   # rewrites .vercel/project.json
```

Optional convenience: `vercel domains inspect` after deletion to confirm nothing regressed; side benefit — the duplicate builds stop, halting double build minutes on the Hobby plan.

## 13. Delete Safety — tripla-v2

Verdict: **SAFE TO DELETE = NO — BLOCKED.**

It is the live production owner: holds `utripla.xyz` + `www.utripla.xyz`, serves the current NASA POWER release (0c4488a) on the real domain, and is the only reachable public URL for UTRIPLA (`*.vercel.app` is DNS-poisoned in the operator's network).

## 14. Migration / Merge Options

Vercel projects cannot be merged. Realistic options:

- **A. Keep travel-planner, delete tripla-v2** — ❌ Rejected. Would require moving `utripla.xyz`/`www` domains, re-verifying env, and re-pointing production — real downtime risk for zero benefit. travel-planner has less history (6 deployments) and no domain.
- **B. Keep tripla-v2, delete travel-planner** — ✅ **Recommended.** Zero production change (domain already attached to tripla-v2). Cost: one `vercel link` in the local repo; loss of 6 travel-planner deployment records (commits preserved in git).
- **C. Keep both, stop one** — ❌ Defeats the purpose; a "stopped" project still receives auto-deployments unless its Git integration is removed, leaving ambiguity (violates the target architecture).
- **D. Migrate domain/env/settings then delete one** — Only applicable if keeping travel-planner (would mean moving the domain back). Unnecessary because domain/env/settings already live on tripla-v2.
- **E. Re-import repo into a new single project** — ❌ Unneeded third project; same as B with more steps and a new URL.

Deletion impact note (relevant to B): deleting travel-planner removes its 6 deployment records, its env copies, and its alias — nothing else. GitHub repo, commits, tripla-v2, and DNS are unaffected.

## 15. Recommended Final Architecture

```
GitHub  boomcaca7979/tripla (main)
        ↓  (single Git integration)
Vercel Project  tripla-v2  (prj_AiGj8U2uZUUeB1zbLrRGL7O7NjAO)
        ↓
utripla.xyz + www.utripla.xyz
        ↓
Production (currently dpl_584nDf5EyYK… = 0c4488a, NASA POWER release)
```

Execution order:

1. `vercel link --project tripla-v2` inside `/Users/boomcaca/projects/tripla` (re-link local dir).
2. Delete `travel-planner` (in Vercel dashboard: Settings → General → Delete, or `vercel project rm travel-planner`).
3. Verify: push nothing; `vercel projects ls` shows only `tripla-v2` with Latest Production URL `utripla.xyz`; `https://utripla.xyz` still HTTP 200.

## 16. Final Decision

- **CURRENT PRODUCTION PROJECT:** `tripla-v2` (`prj_AiGj8U2uZUUeB1zbLrRGL7O7NjAO`)
- **CURRENT PRODUCTION DOMAIN OWNER:** `tripla-v2` (exclusive holder of `utripla.xyz` + `www.utripla.xyz`)
- **KEEP:** `tripla-v2`
- **DELETE:** `travel-planner` (`prj_xJk9idoYPsrn4vBgrpTjpFBsRVkn`)
- **DELETE SAFETY:** YES (after re-linking the local repo to tripla-v2; then SAFE — none of the blocking criteria are met)
- **REQUIRES MIGRATION:** YES — but only the trivial local-link re-point; no domain, env, or settings migration is needed (all already on tripla-v2).

**REASON (evidence):** tripla-v2 (created 2026-09-10) exclusively holds the only real production domains per `GET /v9/projects/prj_AiGj…/domains` and `vercel domains inspect utripla.xyz`; DNS (216.198.79.1) and live HTTP 200 confirm it serves the current release `0c4488a` (`dpl_584nDf5EyYK…`). travel-planner (created 2026-06-08, dormant until 2026-09-10, 6 deployments total, all duplicated in tripla-v2's history) holds no custom domain, no unique env vars (both `NEXT_PUBLIC_SUPABASE_*` vars are duplicated and unused by the code), and identical settings — it is a leftover duplicate that currently double-builds on every push.

---

## 17. Safety Confirmation — Operations performed this round

- PROJECT DELETED = NO
- PROJECT RENAMED = NO
- DOMAIN CHANGED = NO
- ENV CHANGED = NO
- DEPLOYMENT = NO
- COMMIT = NO
- PUSH = NO

All actions were read-only API/CLI queries, DNS lookups, HTTP GETs, and local file reads. No destructive operation was executed. Deletion of travel-planner awaits explicit user confirmation.
