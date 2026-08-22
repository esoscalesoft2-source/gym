-- ============================================================
--  Gym Trainer Hiring — Phase 1 schema
--  Supabase Dashboard -> SQL Editor -> paste -> Run
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. GYMS  (owner_id points at a Supabase auth user)
-- ------------------------------------------------------------
create table if not exists public.gyms (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users(id) on delete cascade,
  gym_name      text not null,
  city          text,
  address       text,
  contact_phone text,
  contact_email text,
  logo_url      text,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. JOB POSTS  (Phase 1 = one default post; Phase 2 = many)
-- ------------------------------------------------------------
create table if not exists public.job_posts (
  id             uuid primary key default gen_random_uuid(),
  gym_id         uuid not null references public.gyms(id) on delete cascade,
  title          text not null,
  description    text,
  specialization text[] default '{}',
  job_type       text check (job_type in ('full_time','part_time','freelance')),
  shift          text check (shift in ('morning','evening','both')),
  salary_min     int,
  salary_max     int,
  openings       int default 1,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. TRAINER APPLICATIONS  (main table)
-- ------------------------------------------------------------
create table if not exists public.trainer_applications (
  id           uuid primary key default gen_random_uuid(),
  gym_id       uuid not null references public.gyms(id) on delete cascade,
  job_post_id  uuid references public.job_posts(id) on delete set null,

  -- personal
  full_name    text not null,
  gender       text check (gender in ('male','female','other')),
  dob          date,
  phone        text not null,
  email        text,
  city         text,
  address      text,
  languages    text[] default '{}',
  photo_path   text,

  -- professional
  experience_years   numeric(4,1) not null default 0,
  specializations    text[] not null default '{}',
  certifications     text[] default '{}',
  certificate_paths  text[] default '{}',
  resume_path        text,
  previous_gyms      jsonb default '[]'::jsonb,   -- [{gym,role,from,to}]

  -- preferences
  job_type            text check (job_type in ('full_time','part_time','freelance')),
  preferred_shift     text check (preferred_shift in ('morning','evening','both')),
  expected_salary_min int,
  expected_salary_max int,
  available_from      date,
  willing_to_relocate boolean not null default false,

  -- extras
  bio               text,
  instagram_url     text,
  youtube_url       text,
  reference_contact text,

  -- pipeline
  status      text not null default 'new'
              check (status in ('new','shortlisted','interview','hired','rejected')),
  owner_notes text,

  source      text default 'web',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_apps_gym_status on public.trainer_applications (gym_id, status);
create index if not exists idx_apps_created    on public.trainer_applications (created_at desc);
create index if not exists idx_apps_city       on public.trainer_applications (city);
create index if not exists idx_apps_phone      on public.trainer_applications (phone);

-- One application per phone number per gym: stops double-submits and the most
-- common form spam. Owner can delete a row to let someone re-apply.
create unique index if not exists uniq_app_gym_phone
  on public.trainer_applications (gym_id, phone);

-- ------------------------------------------------------------
-- 4. STATUS HISTORY (audit trail — who moved the candidate, when)
-- ------------------------------------------------------------
create table if not exists public.application_status_history (
  id             bigserial primary key,
  application_id uuid not null references public.trainer_applications(id) on delete cascade,
  from_status    text,
  to_status      text not null,
  changed_by     uuid references auth.users(id) on delete set null,
  changed_at     timestamptz not null default now()
);

create index if not exists idx_history_app
  on public.application_status_history (application_id, changed_at desc);

-- ------------------------------------------------------------
-- 5. TRIGGERS
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end $fn$;

drop trigger if exists trg_apps_touch on public.trainer_applications;
create trigger trg_apps_touch
  before update on public.trainer_applications
  for each row execute function public.touch_updated_at();

create or replace function public.log_status_change()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  if new.status is distinct from old.status then
    insert into public.application_status_history (application_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end $fn$;

drop trigger if exists trg_apps_status_log on public.trainer_applications;
create trigger trg_apps_status_log
  after update on public.trainer_applications
  for each row execute function public.log_status_change();

-- ------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.gyms                       enable row level security;
alter table public.job_posts                  enable row level security;
alter table public.trainer_applications       enable row level security;
alter table public.application_status_history enable row level security;

-- helper: gym ids owned by the logged-in user
create or replace function public.my_gym_ids()
returns setof uuid language sql stable security definer set search_path = public as $fn$
  select id from public.gyms where owner_id = auth.uid()
$fn$;

-- GYMS ---------------------------------------------------------
drop policy if exists "public can read gyms" on public.gyms;
create policy "public can read gyms"
  on public.gyms for select to anon, authenticated using (true);

drop policy if exists "owner manages own gym" on public.gyms;
create policy "owner manages own gym"
  on public.gyms for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- JOB POSTS ----------------------------------------------------
drop policy if exists "public can read active posts" on public.job_posts;
create policy "public can read active posts"
  on public.job_posts for select to anon, authenticated using (is_active = true);

drop policy if exists "owner manages own posts" on public.job_posts;
create policy "owner manages own posts"
  on public.job_posts for all to authenticated
  using (gym_id in (select public.my_gym_ids()))
  with check (gym_id in (select public.my_gym_ids()));

-- APPLICATIONS -------------------------------------------------
-- anyone may apply, but only ever as a brand-new application
drop policy if exists "anyone can apply" on public.trainer_applications;
create policy "anyone can apply"
  on public.trainer_applications for insert to anon, authenticated
  with check (status = 'new' and owner_notes is null);

-- applicants can NEVER read the table back; only the gym owner can
drop policy if exists "owner reads own applications" on public.trainer_applications;
create policy "owner reads own applications"
  on public.trainer_applications for select to authenticated
  using (gym_id in (select public.my_gym_ids()));

drop policy if exists "owner updates own applications" on public.trainer_applications;
create policy "owner updates own applications"
  on public.trainer_applications for update to authenticated
  using (gym_id in (select public.my_gym_ids()))
  with check (gym_id in (select public.my_gym_ids()));

drop policy if exists "owner deletes own applications" on public.trainer_applications;
create policy "owner deletes own applications"
  on public.trainer_applications for delete to authenticated
  using (gym_id in (select public.my_gym_ids()));

-- STATUS HISTORY -----------------------------------------------
drop policy if exists "owner reads own history" on public.application_status_history;
create policy "owner reads own history"
  on public.application_status_history for select to authenticated
  using (
    application_id in (
      select id from public.trainer_applications
      where gym_id in (select public.my_gym_ids())
    )
  );

-- ------------------------------------------------------------
-- 7. STORAGE  (private bucket: anon may upload, only owners may read)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trainer-docs', 'trainer-docs', false, 5242880,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'];

drop policy if exists "anon can upload trainer docs" on storage.objects;
create policy "anon can upload trainer docs"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'trainer-docs');

drop policy if exists "authenticated can read trainer docs" on storage.objects;
create policy "authenticated can read trainer docs"
  on storage.objects for select to authenticated
  using (bucket_id = 'trainer-docs');

-- ============================================================
--  8. SEED  — edit and run AFTER you create the owner login
--     (Dashboard -> Authentication -> Users -> Add user)
-- ============================================================
-- with u as (select id from auth.users where email = 'owner@yourgym.com')
-- insert into public.gyms (owner_id, gym_name, city, contact_phone, contact_email)
-- select u.id, 'Your Gym Name', 'Chennai', '9876543210', 'owner@yourgym.com' from u
-- returning id;   --  <-- copy this id into .env.local as NEXT_PUBLIC_GYM_ID
