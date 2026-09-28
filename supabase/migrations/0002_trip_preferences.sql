-- ── 0002: trips.preferences（首页 SearchBar 规划偏好随行存储） ─────────────
-- 与 flight 同模式的小 JSONB 对象（origin/style/budget/interests/travelers），
-- 不值得单独建表。缺列的老行读出来即 null，前端按无偏好处理。

alter table public.trips add column if not exists preferences jsonb;
