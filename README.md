# Blog CMS — Complete (Phases 1–5, Redesigned)

A Next.js 15 + Supabase blogging platform: one codebase, one database, powering
both the public website and a password-protected admin dashboard. Publishing a
post in `/admin` makes it appear on the public site immediately — no redeploy,
no separate backend.

This is the full build: foundation, public website, admin CRUD, the Tiptap
rich editor, and the final polish pass — comment moderation, newsletter
export, a real media library, sitemap/robots.txt, and revision history.

**This version includes a visual redesign**: a two-column hero with a 3D
floating card stack that tilts toward your cursor (built with Framer
Motion), 3D hover-tilt on every article card, scroll-triggered reveal
animations throughout the home page, an animated gradient hero background,
and hover micro-interactions on nav links, category pills, and buttons. It
also has the first-signup bug fixed at the source (see "Fixed since the
last build" below) so creating your admin account works on the first try.

## Fixed since the last build

While setting this up together, we hit a real bug: creating the first
Supabase user failed with `column "role" is of type user_role but
expression is of type text`. The trigger that auto-creates a profile for
new signups was inserting a plain string where Postgres expected its
`user_role` enum type. **This is now fixed directly in `supabase/schema.sql`**
(the role value is explicitly cast with `::user_role`), so running the
schema fresh will not hit this issue.

## What's included

**Phase 1 — Foundation** — Next.js 15 + TypeScript + Tailwind scaffold, full
Supabase schema with RLS, Supabase Auth wired end-to-end, admin route guard.

**Phase 2 — Public website** — sticky header, live search, dark mode, home
page, blog post template (TOC, share buttons, related posts, comments, SEO
metadata + JSON-LD), category pages, `/search`, view tracking.

**Phase 3 — Admin CRUD** — blogs list (filter/search/trash/duplicate),
create & edit forms with full SEO fields and publish scheduling, categories
and tags management, automatic revision snapshots on every save.

**Phase 4 — Rich text editor** — full Tiptap toolbar (headings, font
size/color, highlight, alignment, lists, tables, blockquote, code block,
links, image/video upload to Supabase Storage, YouTube embed, emoji picker,
undo/redo, full-screen mode, live word/character count and reading time)
plus autosave while editing.

**Phase 5 — Polish**
- **Comment moderation** (`/admin/comments`) — tabs for pending/approved/
  rejected/all, approve, reject, delete, and reply-as-admin (publishes
  immediately as a nested reply)
- **Newsletter subscribers** (`/admin/subscribers`) — list, remove, and a
  one-click **Export CSV** button (`/api/subscribers/export`)
- **Media library** (`/admin/media`) — every image/video uploaded from the
  editor is indexed here automatically; drag-and-drop or click to upload
  more, search by filename, filter by folder, copy a file's public URL, or
  delete it (removes both the Storage object and the database row)
- **Site settings** (`/admin/settings`) — site name, description, logo, and
  social links, stored in the `settings` table
- **Revision history** (`/admin/blogs/[id]/history`, linked from the editor)
  — every save already snapshots into `blog_revisions`; this page lists them
  with previews and a one-click **Restore** (which itself snapshots the
  current version first, so restoring is reversible)
- **`sitemap.xml`** and **`robots.txt`** — generated dynamically via
  Next.js's metadata route convention (`src/app/sitemap.ts`,
  `src/app/robots.ts`), covering every published post and category and
  disallowing `/admin` and `/api`

## Getting started

### 1. Install Node.js

You need **Node.js 18.18+**. Download it from [nodejs.org](https://nodejs.org)
if you don't already have it (running `node -v` in a terminal tells you what
you have).

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and open
**SQL Editor**. Paste in the full contents of `supabase/schema.sql` and run
it. This creates every table, RLS policy, trigger, and the `media` storage
bucket in one shot.

### 3. Configure environment variables

Unzip this project, open a terminal in its folder, then:

```bash
cp .env.local.example .env.local
```

Fill in the values from your Supabase project's **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — server-only)
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev

### 4. Install dependencies and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the public site. The admin dashboard is at
`http://localhost:3000/admin`.

### 5. Create your admin account

Go to `http://localhost:3000/admin/login` — but you need an account first.
Easiest path for local dev: in the Supabase dashboard, go to
**Authentication → Users → Add user**, create yourself with an email and
password. Because it's the *first* user in the project, the database trigger
automatically sets your `profiles.role` to `admin`. Then sign in at
`/admin/login`.

## Trying it out

Sign in at `/admin/login`, add a category in **Categories**, then go to
**Blogs → New post**. Write with the full toolbar — headings, images
(uploaded straight to Supabase Storage), tables, embeds — set a category and
tags, and publish. It appears on the public site immediately, complete with
table of contents, share buttons, and SEO metadata.

If you'd rather seed data directly, this also works in the Supabase SQL
editor:

```sql
insert into public.categories (name, slug, description) values
  ('Technology', 'technology', 'Notes on building software.');

insert into public.blogs
  (title, subtitle, slug, excerpt, content_html, status, published_at,
   category_id, is_featured, is_trending, reading_time_minutes, author_id)
values (
  'Hello, world',
  'The first post on this blog',
  'hello-world',
  'A short introduction to what this blog is about.',
  '<h2 id="intro">Introduction</h2><p>This is the first post, rendered straight from Supabase.</p>',
  'published',
  now(),
  (select id from public.categories where slug = 'technology'),
  true, true, 2,
  (select id from public.profiles limit 1)
);
```

## Deploying to production

The easiest path for a Next.js + Supabase app is **[Vercel](https://vercel.com)**
(made by the creators of Next.js, free tier is plenty for a blog):

1. Push this project to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import that repo.
3. In the project's **Environment Variables** settings, add the same four
   values from your `.env.local` — but set `NEXT_PUBLIC_SITE_URL` to your
   real domain (e.g. `https://yourblog.vercel.app`) instead of localhost.
4. Deploy. Vercel builds the project and gives you a live URL, and
   redeploys automatically every time you push to the repo.
5. In Supabase, under **Authentication → URL Configuration**, add your
   production URL so auth redirects work there too.

No server to manage — Vercel runs the Next.js app, and Supabase remains the
database/auth/storage backend exactly as it does locally.

## Project structure

```
blog-cms/
├── supabase/
│   └── schema.sql              # full DB schema, RLS, storage bucket
├── src/
│   ├── middleware.ts            # session refresh + /admin route guard
│   ├── lib/
│   │   ├── supabase/             # browser / server / admin clients
│   │   ├── types/database.types.ts
│   │   ├── actions/               # Server Actions: blogs, categories, tags,
│   │   │                          # comments, subscribers, media, settings
│   │   ├── queries.ts             # shared Supabase read queries for the public site
│   │   ├── html-utils.ts          # reading-time + excerpt estimation from HTML
│   │   ├── upload.ts              # client-side Supabase Storage upload helper
│   │   └── format.ts              # date + reading-time formatting
│   ├── components/
│   │   ├── admin/
│   │   │   ├── editor/            # RichTextEditor, toolbar, emoji picker,
│   │   │   │                      # font-size / video / resizable-image extensions
│   │   │   ├── blog-row-actions.tsx
│   │   │   ├── category-row.tsx / category-create-form.tsx
│   │   │   ├── tag-controls.tsx
│   │   │   ├── comment-moderation-row.tsx
│   │   │   ├── subscriber-row-actions.tsx
│   │   │   ├── media-library.tsx
│   │   │   ├── restore-revision-button.tsx
│   │   │   ├── settings-form.tsx
│   │   │   └── sign-out-button.tsx
│   │   └── site/                  # header, footer, article-card, search-bar,
│   │                               # share-buttons, table-of-contents,
│   │                               # comments-section, newsletter-form, theme toggle
│   └── app/
│       ├── layout.tsx             # fonts + theme script
│       ├── globals.css
│       ├── sitemap.ts             # dynamic sitemap.xml
│       ├── robots.ts              # dynamic robots.txt
│       ├── api/
│       │   ├── search/route.ts
│       │   ├── newsletter/route.ts
│       │   ├── comments/route.ts
│       │   └── subscribers/export/route.ts   # CSV export
│       ├── (site)/                # public website, wrapped in header + footer
│       │   ├── layout.tsx
│       │   ├── page.tsx           # home
│       │   ├── blog/[slug]/page.tsx
│       │   ├── category/[slug]/page.tsx
│       │   └── search/page.tsx
│       └── (admin)/
│           └── admin/
│               ├── layout.tsx      # auth guard + sidebar nav
│               ├── page.tsx        # dashboard stats
│               ├── login/page.tsx
│               ├── blogs/
│               │   ├── page.tsx    # list + filters (status, search, trash)
│               │   ├── blog-form.tsx  # embeds RichTextEditor + autosave
│               │   ├── new/page.tsx
│               │   └── [id]/edit/page.tsx, [id]/history/page.tsx
│               ├── categories/page.tsx
│               ├── tags/page.tsx
│               ├── comments/page.tsx
│               ├── subscribers/page.tsx
│               ├── media/page.tsx
│               └── settings/page.tsx
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

## Roadmap

| Phase | Scope |
|---|---|
| 1 ✅ | Foundation — scaffold, DB schema, auth, dashboard shell |
| 2 ✅ | Public website — home, blog page template, category pages, search, dark mode toggle, nav/footer |
| 3 ✅ | Admin CRUD — blogs list, create/edit forms, categories, tags |
| 4 ✅ | Tiptap rich editor — full toolbar, image/video upload, autosave |
| 5 ✅ | Polish — comments moderation, newsletter CSV export, media library, sitemap.xml/robots.txt, revision history |

Everything in the original brief is built and wired end-to-end. A few spots
worth knowing about if you keep building on this:

- **Image resize** in the editor uses S/M/L width presets rather than
  free-form drag handles — a deliberate simplification that's easy to
  extend later with a drag-resize library if you want pixel-level control.
- **Emoji picker** is a curated palette (24 common emoji) rather than a full
  searchable emoji library, to avoid a heavy extra dependency.
- **Author invites**: right now the *first* person to sign up becomes admin
  automatically, and everyone else who signs up becomes `author`. There's
  no in-dashboard "invite a teammate" flow yet — add users via the Supabase
  dashboard (Authentication → Users) for now.

## Notes on the schema

- **Soft deletes**: `blogs.deleted_at` powers "Delete blog" / "Restore
  deleted blog" without losing data.
- **Revisions**: `blog_revisions` stores a snapshot on every save (and on
  every restore), powering the history page.
- **Views**: `record_blog_view()` is a Postgres function that atomically
  increments `blogs.views_count` and logs a row in `views`, which feeds the
  trending sidebar on the public site.
- **RLS is the security boundary**, not the app code: visitors can only ever
  read published, non-deleted posts and approved comments; every write
  requires `profiles.role = 'admin'`.
