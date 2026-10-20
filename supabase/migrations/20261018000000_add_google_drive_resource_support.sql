-- Migration: Add Google Drive resource support and duplicate prevention
-- Description: Extends public.resources table with storage_provider, drive_file_id, and drive_view_url columns.

alter table public.resources
  add column if not exists storage_provider text not null default 'supabase' check (storage_provider in ('supabase', 'google_drive')),
  add column if not exists drive_file_id text,
  add column if not exists drive_view_url text;

-- Create partial unique index on drive_file_id to prevent duplicate Google Drive imports
create unique index if not exists resources_drive_file_id_idx
  on public.resources (drive_file_id)
  where drive_file_id is not null;

comment on column public.resources.storage_provider is 'Storage provider: supabase (Supabase Storage) or google_drive (Google Drive metadata pointer)';
comment on column public.resources.drive_file_id is 'Unique Google Drive file ID for Google Drive-backed resources';
comment on column public.resources.drive_view_url is 'Google Drive web viewing URL';
