alter table public.resources
  drop constraint if exists resources_file_name_check;

alter table public.resources
  add constraint resources_file_name_check
  check (lower(right(file_name, 4)) = '.pdf');
