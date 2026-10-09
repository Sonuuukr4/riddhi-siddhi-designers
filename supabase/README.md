# Connecting the content database (Supabase)

The admin panel (`/admin`) stores projects, categories, photos and videos in
Supabase: **Postgres** for content, **Storage** for media and **Auth** for the
admin sign-in. Until it is connected, the public site shows the built-in demo
content and `/admin` shows these instructions.

## 1. Create the project

1. Create a project at <https://supabase.com> (region: Mumbai, `ap-south-1`, is
   closest to Delhi).
2. **Project Settings → API**: copy the *Project URL* and the *anon public* key.

## 2. Environment variables

Add these to `.env.local` (development) and to the hosting provider (Vercel →
Settings → Environment Variables):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
NEXT_PUBLIC_SITE_URL=https://<your-domain>
```

The **service role key is never needed** and must never be added to this
project. All admin operations run as the signed-in admin and are checked by
row-level security in the database.

## 3. Run the SQL

In **SQL Editor**, run, in order:

1. `supabase/migrations/20261008120000_cms_schema.sql` — tables, row-level
   security, the `project-media` storage bucket and admin functions.
2. `supabase/seed.sql` — *optional*: the nine categories plus six clearly
   marked demo projects (delete them once real projects are added).

(With the Supabase CLI you can instead run `supabase db push` and
`supabase db seed`.)

## 4. Create the admin account

1. **Authentication → Users → Add user → Create new user**: enter the studio's
   email and a strong password, and tick *Auto Confirm User*.
2. In **SQL Editor**, grant that account admin rights:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'owner@example.com'
on conflict do nothing;
```

3. **Authentication → Providers → Email**: turn **off** “Allow new users to sign
   up”, so nobody else can create an account. (Even if someone did, they would
   not be in `public.admins` and could not change anything.)

Sign in at `/admin/login`.

## Limits

- Images are resized in the browser to a maximum of 2560 px and stored as WebP.
- Videos: MP4 / WebM / MOV up to 50 MB (Supabase's default per-file limit on the
  free plan). For longer films, upload to YouTube or Vimeo and paste the link.

## Local preview without Supabase

For a quick demonstration on one computer (never on Vercel), add to
`.env.local`:

```bash
CMS_LOCAL_MODE=true
LOCAL_ADMIN_PASSWORD=<at least 8 characters>
```

Content is then stored in `.data/` on that machine.
