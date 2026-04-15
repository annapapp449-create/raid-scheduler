-- ============================================
-- Raid Scheduler - Supabase 建表脚本
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. leaders 表
create table if not exists leaders (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  server text not null,
  characters jsonb not null default '[]',
  edit_password text not null,
  share_id text not null unique,
  created_at timestamptz not null default now()
);

-- 2. schedules 表
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid not null references leaders(id) on delete cascade,
  instance_id text,
  instance_name text,
  raid_size int not null default 25,
  character_name text,
  character_class text,
  server text,
  day_of_week int not null,
  start_time text not null,
  week_key text not null,
  signup_count int not null default 0,
  status text not null default 'recruiting',
  fragment_enabled boolean not null default false,
  fragment_status text,
  fragment_player text,
  fragment_server text,
  team_config jsonb,
  created_at timestamptz not null default now()
);

-- 3. signups 表
create table if not exists signups (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references schedules(id) on delete cascade,
  player_name text not null,
  player_server text,
  player_class text,
  player_role text,
  player_spec text,
  contact_info text default '',
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

-- ============================================
-- 索引
-- ============================================
create index if not exists idx_leaders_share_id on leaders(share_id);
create index if not exists idx_schedules_leader_id on schedules(leader_id);
create index if not exists idx_schedules_week_key on schedules(week_key);
create index if not exists idx_signups_schedule_id on signups(schedule_id);
create index if not exists idx_signups_status on signups(status);

-- ============================================
-- RLS 策略（行级安全）
-- 允许匿名用户读写（因为前端无用户认证体系）
-- ============================================

-- leaders
alter table leaders enable row level security;
create policy "leaders_read" on leaders for select using (true);
create policy "leaders_insert" on leaders for insert with check (true);
create policy "leaders_update" on leaders for update using (true);

-- schedules
alter table schedules enable row level security;
create policy "schedules_read" on schedules for select using (true);
create policy "schedules_insert" on schedules for insert with check (true);
create policy "schedules_update" on schedules for update using (true);
create policy "schedules_delete" on schedules for delete using (true);

-- signups
alter table signups enable row level security;
create policy "signups_read" on signups for select using (true);
create policy "signups_insert" on signups for insert with check (true);
create policy "signups_update" on signups for update using (true);
