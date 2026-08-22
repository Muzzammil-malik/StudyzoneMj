create policy "admins read resource files" on storage.objects
for select to authenticated
using (bucket_id = 'studyzone-resources' and public.is_admin());
