# First administrator setup

1. Create the first user in Supabase Dashboard under Authentication > Users.
2. Copy that user's UUID.
3. Run this SQL in the Supabase SQL editor:

```sql
insert into public.profiles (id, role)
values ('AUTH_USER_UUID_HERE', 'admin')
on conflict (id) do update set role = 'admin';
```

The frontend never accepts a role from user metadata. The `profiles.role` row and RLS policies control admin access.

After signing in at `/admin`, upload a real PDF from the Resource Library page. The file is stored in the private `studyzone-resources` bucket and published resources are served through short-lived signed URLs.
