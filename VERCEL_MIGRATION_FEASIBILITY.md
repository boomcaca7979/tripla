# UTRIPLA VERCEL MIGRATION FEASIBILITY REPORT

**Mode:** `# MIGRATION FEASIBILITY AUDIT` (STEP 1 — READ ONLY)
**Generated:** 2026-09-10 (21:58 GMT+8)
**Actions taken:** NONE. No project created, no domain unbound, no DNS changed, no deploy, no commit/push.
**Verdict:** `# MIGRATION SAFE TO PROCEED` (pending your explicit go-ahead)

---

## 1. Old Project Configuration

| Field | Value |
|---|---|
| Project ID | `prj_xJk9idoYPsrn4vBgrpTjpFBsRVkn` |
| Name | `travel-planner` |
| Team | `team_szRLX8YrEzFPhJNUjXT4yZ9H` |
| Framework | `nextjs` |
| Node.js version | `24.x` |
| Build command | (null → framework default) |
| Install command | (null → framework default) |
| Output directory | (null → default) |
| Root directory | (null → repo root) |
| `directoryListing` | `false` |
| `autoExposeSystemEnvs` | `true` |
| SSO (`ssoProtection`) | `null` (disabled) |
| Redirects / Rewrites / Headers | none configured |
| Functions / Cron / Integrations | none configured |
| Git link | **github** → org `boomcaca7979`, repo `tripla`, `productionBranch: main` |

➡ The project is a standard Next.js (Turbopack) project with framework-default build settings. Nothing exotic to replicate.

---

## 2. GitHub Integration

- Remote: `https://github.com/boomcaca7979/tripla.git` (fetch + push)
- Branch: `main`
- HEAD / latest commit: `3350b43` — `fix: resolve React hydration mismatch (#418) on home`
- Working tree: clean except 5 untracked report `.md` files (no application code modified)
- Accepted Phase 4 code + `3350b43` present on `main` ✅

➡ New project can import the **same repository** and set `productionBranch = main`.

---

## 3. Environment Variable Inventory (names only — no values)

| Variable name | Target | Type |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | production | sensitive |
| `NEXT_PUBLIC_SUPABASE_URL` | production | sensitive |

- Only **2** variables, both `NEXT_PUBLIC_*` (client-exposed, non-secret by nature).
- No Preview/Development-specific variables.
- Both must be copied to the new project (production target). No localhost/debug vars to exclude.

---

## 4. Current Domain Configuration

| Domain | Verified | Target (alias) | Notes |
|---|---|---|---|
| `utripla.xyz` | True | `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` (`m9k7way4s`) | canonical apex |
| `www.utripla.xyz` | (redirect) | → 307 → `utripla.xyz` | canonical redirect |

- Aliases for `utripla.xyz` correctly point at the new build in the **control plane**, but the **edge data plane** still serves the old `geistsans_f7939ba5` build with #418 (proven across 10/10 requests earlier this session).

---

## 5. DNS

- Authoritative NS (registrar): `dns7.hichina.com`, `dns8.hichina.com` (Alibaba/Hichina).
- **DNS ZONE is managed by Vercel** (`vercel-dns-017.com`):
  - `ALIAS *` → `cname.vercel-dns-017.com.`
  - `ALIAS (apex)` → `0d2b99dd58e65367.vercel-dns-017.com`
  - CAA records for `pki.goog` / `sectigo.com` / `letsencrypt.org`
- ➡ **Moving the domain between Vercel projects does NOT require any change at the registrar or to external DNS.** Only Vercel's internal alias→project mapping changes. No `dangerouslyDisableSandbox`/registrar action needed.

---

## 6. Current Production Deployment

| Item | Value |
|---|---|
| Intended production deployment | `travel-planner-m9k7way4s` |
| Deployment ID | `dpl_4ahc4EeTh4w7kLXF7qW35GDinN8j` |
| Ready state | `READY` (PROMOTED) |
| Git commit | `3350b43` |
| Other READY deployments | `67z4yyt2v`, `pfgb2gajc`, `q9rizd5ql` |

➡ The build artifact itself is correct; the defect is purely the old project's stuck edge routing.

---

## 7. New Project Feasibility

| Question | Answer |
|---|---|
| Can connect same GitHub repo? | ✅ Yes — Vercel allows multiple projects on one repo |
| Inherit repo / `main` auto-deploy? | ✅ Set `productionBranch = main` |
| Copy env variables? | ✅ 2 `NEXT_PUBLIC_*` vars, manual add to new project |
| Add custom domain `utripla.xyz`? | ✅ After removing it from old project (domain is unique per project) |
| Need external DNS modification? | ❌ No — Vercel zone stays; only alias re-map |
| Need to unbind old project? | ⚠️ Only the **domain** moves; the old project itself is kept |
| Can old project be retained? | ✅ Yes — dual-project coexistence is the recommended path |

- New project name suggestion: `tripla-v2` or `utripla-2` (avoid duplicate of `travel-planner`).
- New project must mirror: `framework=nextjs`, `nodeVersion=24.x`, root = repo root, framework-default build.

---

## 8. Risks

1. **Brief downtime on domain move** — Vercel requires removing `utripla.xyz` from the old project before adding to the new one. Re-provisioning SSL usually takes seconds–a few minutes. Must be communicated/scheduled.
2. **Build must succeed on new project** — same code, should pass; but unverified until first deploy.
3. **Env var copy** — only 2 vars, but a missed var would break runtime (Supabase calls). Verify both copied to production target.
4. **Edge still sticky on new project?** — Low probability: a brand-new project gets fresh deployment IDs and a clean edge routing table, so it should bypass the old project's stuck state. But cannot be 100% guaranteed pre-flight.
5. **No code change allowed** — migration must not touch application code (per procedure).

---

## 9. Recommended Migration Strategy (dual-project coexistence)

1. Keep old project `travel-planner` **untouched** (source of rollback).
2. Create **new** project (`tripla-v2`) in team `team_szRLX8YrEzFPhJNUjXT4yZ9H`, import `boomcaca7979/tripla`, `productionBranch = main`, `nodeVersion = 24.x`, `framework = nextjs`.
3. Copy the 2 production env vars.
4. Trigger an initial **preview/temporary deployment** (new `*.vercel.app` URL) — **do NOT bind `utripla.xyz` yet**.
5. Verify the new deployment: HTML signature = `VEU71W_className…` (new build), **React #418 = 0**, 3 viewports (1280/768/390), interaction (Time/Weather/Mood/Moon), SEO (canonical/JSON-LD/sitemap/robots), performance.
6. Only after all pass → **Domain Migration** (Section 10/20).
7. Old project retained until new project is stable in production.

---

## 10. Rollback Strategy

- Old project `travel-planner` + its deployments + env vars are preserved throughout.
- If new project fails (build error, hydration error, missing env, SEO/affiliate failure): simply **re-bind `utripla.xyz` back to the old project** (remove from new → add to old). Users revert to the (currently stuck-but-known) state; no data loss.
- Because the DNS zone is Vercel-managed, rollback is also a Vercel-side alias re-map — no registrar change.

---

## 11. Exact Next Steps (after your approval)

| Step | Action | Risk |
|---|---|---|
| 1 | Create new project `tripla-v2` (team, import GitHub `boomcaca7979/tripla`, `main`) | Low |
| 2 | Set `nodeVersion=24.x`, `framework=nextjs`, root=repo root | Low |
| 3 | Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `NEXT_PUBLIC_SUPABASE_URL` (production) | Low |
| 4 | Deploy preview (`*.vercel.app`) — **no domain yet** | Low |
| 5 | Verify: no #418, new build signature, 3 viewports, interaction, SEO, perf | Medium (verify) |
| 6 | **Pre-check** domain move (document downtime window) | Medium |
| 7 | Remove `utripla.xyz` from old → add to new → wait SSL | Brief downtime |
| 8 | Final production verification on `utripla.xyz` | Medium |
| 9 | Keep old project until stable → `# MIGRATION COMPLETE` | — |

---

# MIGRATION SAFE TO PROCEED

*(Pending your explicit approval to execute Step 1→creation. Nothing has been changed.)*
