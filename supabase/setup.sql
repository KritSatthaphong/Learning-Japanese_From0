-- =============================================================
-- Nihongo Survival — ตั้งค่าฐานข้อมูล Supabase (รันครั้งเดียว)
-- วิธีใช้: Supabase → SQL Editor → New query → วางทั้งไฟล์ → Run
--
-- มี 2 ตาราง ทั้งสองตารางเปิด Row Level Security (RLS)
-- = แต่ละบัญชีอ่าน/เขียนได้เฉพาะข้อมูลของตัวเองเท่านั้น
-- =============================================================

-- 1) ความคืบหน้าทั้งหมดของแต่ละบัญชี (1 แถวต่อ 1 บัญชี เก็บเป็น JSON)
create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
drop policy if exists "progress_insert_own" on public.progress;
drop policy if exists "progress_update_own" on public.progress;
drop policy if exists "progress_delete_own" on public.progress;
create policy "progress_select_own" on public.progress for select to authenticated using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress for insert to authenticated with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete_own" on public.progress for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.progress to authenticated;

-- 2) ภาพลายมือจากการคัด (1 แถวต่อ 1 ครั้ง ภาพเก็บเป็นข้อความ data:image/png)
create table if not exists public.writing_samples (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('char', 'sent')),
  key        text not null,
  label      text,
  th         text,
  score      integer,
  img        text not null check (length(img) < 400000),
  created_at timestamptz not null default now()
);

create index if not exists writing_samples_user_idx on public.writing_samples (user_id, id);

alter table public.writing_samples enable row level security;

drop policy if exists "samples_select_own" on public.writing_samples;
drop policy if exists "samples_insert_own" on public.writing_samples;
drop policy if exists "samples_delete_own" on public.writing_samples;
create policy "samples_select_own" on public.writing_samples for select to authenticated using (auth.uid() = user_id);
create policy "samples_insert_own" on public.writing_samples for insert to authenticated with check (auth.uid() = user_id);
create policy "samples_delete_own" on public.writing_samples for delete to authenticated using (auth.uid() = user_id);

grant select, insert, delete on public.writing_samples to authenticated;
