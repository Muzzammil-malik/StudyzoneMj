create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  semester_id uuid not null references public.semesters(id) on delete restrict,
  description text,
  department text,
  credits numeric check (credits is null or credits >= 0),
  display_order integer not null default 0,
  active boolean not null default true,
  icon_name text,
  color_tone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (semester_id, code)
);

create table public.resource_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  display_order integer not null default 0,
  active boolean not null default true,
  icon_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.folders (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete restrict,
  parent_folder_id uuid references public.folders(id) on delete restrict,
  name text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, parent_folder_id, name),
  check (parent_folder_id is null or parent_folder_id <> id)
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  folder_id uuid not null references public.folders(id) on delete restrict,
  category_id uuid not null references public.resource_categories(id) on delete restrict,
  semester_id uuid not null references public.semesters(id) on delete restrict,
  file_path text not null unique,
  file_name text not null,
  file_size bigint check (file_size is null or file_size >= 0),
  mime_type text not null default 'application/pdf' check (mime_type = 'application/pdf'),
  page_count integer check (page_count is null or page_count > 0),
  author_or_professor text,
  academic_year text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  downloads_count integer not null default 0 check (downloads_count >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (lower(right(file_name, 4)) = '.pdf')
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null,
  type text not null default 'feedback' check (type in ('material_request', 'correction', 'feedback', 'other')),
  subject_requested text,
  status text not null default 'unread' check (status in ('unread', 'read')),
  created_at timestamptz not null default now()
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, resource_id)
);

create table public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table public.admin_activities (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null check (entity_type in ('subject', 'semester', 'category', 'folder', 'resource', 'feedback')),
  entity_name text not null,
  created_at timestamptz not null default now()
);

create or replace function public.prevent_folder_cycle()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  current_parent uuid;
begin
  current_parent := new.parent_folder_id;
  while current_parent is not null loop
    if current_parent = new.id then
      raise exception 'Folder hierarchy cannot contain cycles';
    end if;
    select parent_folder_id into current_parent from public.folders where id = current_parent;
  end loop;
  return new;
end;
$$;
create trigger folders_prevent_cycle before insert or update of parent_folder_id on public.folders
for each row execute function public.prevent_folder_cycle();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.validate_resource_relations()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.folders where id = new.folder_id and subject_id = new.subject_id) then
    raise exception 'Resource folder must belong to the selected subject';
  end if;
  if not exists (select 1 from public.subjects where id = new.subject_id and semester_id = new.semester_id) then
    raise exception 'Resource semester must match the selected subject';
  end if;
  return new;
end;
$$;
create trigger resources_validate_relations before insert or update on public.resources
for each row execute function public.validate_resource_relations();

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger semesters_set_updated_at before update on public.semesters for each row execute function public.set_updated_at();
create trigger subjects_set_updated_at before update on public.subjects for each row execute function public.set_updated_at();
create trigger resource_categories_set_updated_at before update on public.resource_categories for each row execute function public.set_updated_at();
create trigger folders_set_updated_at before update on public.folders for each row execute function public.set_updated_at();
create trigger resources_set_updated_at before update on public.resources for each row execute function public.set_updated_at();
create trigger settings_set_updated_at before update on public.settings for each row execute function public.set_updated_at();

create index subjects_semester_id_idx on public.subjects(semester_id);
create index subjects_active_idx on public.subjects(active);
create index folders_subject_id_idx on public.folders(subject_id);
create index folders_parent_folder_id_idx on public.folders(parent_folder_id);
create index resources_subject_id_idx on public.resources(subject_id);
create index resources_folder_id_idx on public.resources(folder_id);
create index resources_category_id_idx on public.resources(category_id);
create index resources_semester_id_idx on public.resources(semester_id);
create index resources_status_idx on public.resources(status);
create index resources_created_at_idx on public.resources(created_at desc);
create index resource_categories_active_idx on public.resource_categories(active);
create index semesters_active_idx on public.semesters(active);
create index admin_activities_created_at_idx on public.admin_activities(created_at desc);

alter table public.profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.resource_categories enable row level security;
alter table public.folders enable row level security;
alter table public.resources enable row level security;
alter table public.feedback enable row level security;
alter table public.bookmarks enable row level security;
alter table public.settings enable row level security;
alter table public.admin_activities enable row level security;

create policy "public reads active semesters" on public.semesters for select to anon, authenticated using (active or public.is_admin());
create policy "admins manage semesters" on public.semesters for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads active subjects" on public.subjects for select to anon, authenticated using ((active and exists (select 1 from public.semesters s where s.id = semester_id and s.active)) or public.is_admin());
create policy "admins manage subjects" on public.subjects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads active categories" on public.resource_categories for select to anon, authenticated using (active or public.is_admin());
create policy "admins manage categories" on public.resource_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads folders for active subjects" on public.folders for select to anon, authenticated using (exists (select 1 from public.subjects s join public.semesters sem on sem.id = s.semester_id where s.id = subject_id and s.active and sem.active) or public.is_admin());
create policy "admins manage folders" on public.folders for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads published resources" on public.resources for select to anon, authenticated using ((status = 'published' and exists (select 1 from public.subjects s join public.semesters sem on sem.id = s.semester_id where s.id = subject_id and s.active and sem.active)) or public.is_admin());
create policy "admins manage resources" on public.resources for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "anyone submits feedback" on public.feedback for insert to anon, authenticated with check (status = 'unread');
create policy "admins read feedback" on public.feedback for select to authenticated using (public.is_admin());
create policy "admins update feedback" on public.feedback for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete feedback" on public.feedback for delete to authenticated using (public.is_admin());
create policy "users manage own bookmarks" on public.bookmarks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "admins manage settings" on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads public settings" on public.settings for select to anon, authenticated using (true);
create policy "admins read activities" on public.admin_activities for select to authenticated using (public.is_admin());
create policy "admins insert activities" on public.admin_activities for insert to authenticated with check (public.is_admin() and actor_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('studyzone-resources', 'studyzone-resources', false, 52428800, array['application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads published resource files" on storage.objects for select to anon, authenticated using (
  bucket_id = 'studyzone-resources' and exists (select 1 from public.resources r where r.file_path = name and r.status = 'published')
);
create policy "admins upload resource files" on storage.objects for insert to authenticated with check (bucket_id = 'studyzone-resources' and public.is_admin());
create policy "admins update resource files" on storage.objects for update to authenticated using (bucket_id = 'studyzone-resources' and public.is_admin()) with check (bucket_id = 'studyzone-resources' and public.is_admin());
create policy "admins delete resource files" on storage.objects for delete to authenticated using (bucket_id = 'studyzone-resources' and public.is_admin());

insert into public.settings(key, value) values
  ('website_name', 'StudyZone MJCET'),
  ('footer_text', 'An independent, student-first digital library crafted for Muffakham Jah College of Engineering & Technology.'),
  ('contact_email', '160425733134@mjcollege.ac.in'),
  ('contact_phone', '+91 9849931637'),
  ('linkedin_url', 'https://www.linkedin.com/in/md-muzzammil-malik-737056364'),
  ('version', '3.0.0')
on conflict (key) do nothing;
