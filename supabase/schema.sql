-- =========================================================
-- Blog CMS — Supabase schema
-- Run this once in the Supabase SQL editor on a fresh project.
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------
create type blog_status as enum ('draft', 'scheduled', 'published');
create type comment_status as enum ('pending', 'approved', 'rejected');
create type user_role as enum ('admin', 'author');

-- ---------------------------------------------------------
-- PROFILES  (extends auth.users, one row per admin/author)
-- ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  bio text,
  role user_role not null default 'author',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    -- First user ever created becomes admin automatically.
    -- Cast is required: a bare CASE expression defaults to text, but
    -- the role column is the user_role enum.
    (case when (select count(*) from public.profiles) = 0 then 'admin' else 'author' end)::user_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- TAGS
-- ---------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- BLOGS
-- ---------------------------------------------------------
create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  slug text not null unique,
  excerpt text,
  content jsonb not null default '{}'::jsonb,       -- Tiptap JSON (source of truth)
  content_html text,                                 -- rendered HTML cache
  featured_image text,
  gallery_images jsonb not null default '[]'::jsonb, -- array of storage URLs
  video_url text,                                     -- uploaded video or YouTube embed
  author_id uuid references public.profiles (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  status blog_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  meta_title text,
  meta_description text,
  keywords text[] not null default '{}',
  canonical_url text,
  reading_time_minutes integer not null default 1,
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  allow_comments boolean not null default true,
  views_count integer not null default 0,
  deleted_at timestamptz,                             -- soft delete -> "Restore deleted blog"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blogs_status_published_idx on public.blogs (status, published_at desc) where deleted_at is null;
create index blogs_category_idx on public.blogs (category_id);
create index blogs_author_idx on public.blogs (author_id);
create index blogs_featured_idx on public.blogs (is_featured) where is_featured = true;
create index blogs_trending_idx on public.blogs (is_trending) where is_trending = true;
create index blogs_search_idx on public.blogs using gin (
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(subtitle,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content_html,''))
);

-- ---------------------------------------------------------
-- BLOG_TAGS  (many-to-many)
-- ---------------------------------------------------------
create table public.blog_tags (
  blog_id uuid not null references public.blogs (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (blog_id, tag_id)
);

-- ---------------------------------------------------------
-- BLOG REVISIONS  (revision history)
-- ---------------------------------------------------------
create table public.blog_revisions (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.blogs (id) on delete cascade,
  content jsonb not null,
  title text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index blog_revisions_blog_idx on public.blog_revisions (blog_id, created_at desc);

-- ---------------------------------------------------------
-- COMMENTS  (supports replies via parent_id)
-- ---------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.blogs (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  user_name text not null,
  user_email text not null,
  content text not null,
  status comment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index comments_blog_idx on public.comments (blog_id, status);

-- ---------------------------------------------------------
-- SUBSCRIBERS  (newsletter)
-- ---------------------------------------------------------
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active', -- active | unsubscribed
  subscribed_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- MEDIA LIBRARY  (metadata; files live in Supabase Storage)
-- ---------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,          -- storage object path
  file_type text not null,          -- image | video
  mime_type text,
  folder text not null default 'uploads',
  size_bytes bigint not null default 0,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index media_folder_idx on public.media (folder);

-- ---------------------------------------------------------
-- VIEWS  (per-pageview log, used to compute analytics + trending)
-- ---------------------------------------------------------
create table public.views (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.blogs (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  referrer text,
  ip_hash text -- hashed, never store raw IPs
);

create index views_blog_idx on public.views (blog_id, viewed_at desc);

-- ---------------------------------------------------------
-- SETTINGS  (single-row key/value store for site-wide config)
-- ---------------------------------------------------------
create table public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.settings (key, value) values
  ('site', '{"name":"My Blog","description":"","logo_url":"","social":{}}'::jsonb),
  ('seo', '{"default_meta_title":"","default_meta_description":""}'::jsonb);

-- ---------------------------------------------------------
-- updated_at trigger helper (reused by several tables)
-- ---------------------------------------------------------
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.blogs for each row execute procedure public.set_updated_at();

-- Increment a blog's views_count and log the pageview atomically.
create function public.record_blog_view(p_blog_id uuid, p_referrer text default null, p_ip_hash text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.blogs set views_count = views_count + 1 where id = p_blog_id;
  insert into public.views (blog_id, referrer, ip_hash) values (p_blog_id, p_referrer, p_ip_hash);
end;
$$;

-- ---------------------------------------------------------
-- is_admin() helper for RLS policies
-- ---------------------------------------------------------
create function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.blogs enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_revisions enable row level security;
alter table public.comments enable row level security;
alter table public.subscribers enable row level security;
alter table public.media enable row level security;
alter table public.views enable row level security;
alter table public.settings enable row level security;

-- Profiles: public can view basic author info, only the owner/admin can edit.
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- Categories & tags: public read, admin write.
create policy "Categories are publicly readable" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "Tags are publicly readable" on public.tags for select using (true);
create policy "Admins manage tags" on public.tags for all using (public.is_admin()) with check (public.is_admin());

-- Blogs: public can read published, non-deleted posts. Admins see/manage everything.
create policy "Published blogs are publicly readable"
  on public.blogs for select
  using (status = 'published' and deleted_at is null and (published_at is null or published_at <= now()));

create policy "Admins read all blogs" on public.blogs for select using (public.is_admin());
create policy "Admins manage blogs" on public.blogs for insert with check (public.is_admin());
create policy "Admins update blogs" on public.blogs for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete blogs" on public.blogs for delete using (public.is_admin());

-- Blog tags follow blog visibility.
create policy "Blog tags are publicly readable" on public.blog_tags for select using (true);
create policy "Admins manage blog tags" on public.blog_tags for all using (public.is_admin()) with check (public.is_admin());

-- Revisions: admin only.
create policy "Admins manage revisions" on public.blog_revisions for all using (public.is_admin()) with check (public.is_admin());

-- Comments: public can read approved comments and submit new ones (pending by default).
create policy "Approved comments are publicly readable" on public.comments for select using (status = 'approved');
create policy "Admins read all comments" on public.comments for select using (public.is_admin());
create policy "Anyone can submit a comment" on public.comments for insert with check (status = 'pending');
create policy "Admins moderate comments" on public.comments for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete comments" on public.comments for delete using (public.is_admin());

-- Subscribers: anyone can subscribe (insert); only admins can read the list.
create policy "Anyone can subscribe" on public.subscribers for insert with check (true);
create policy "Admins read subscribers" on public.subscribers for select using (public.is_admin());
create policy "Admins manage subscribers" on public.subscribers for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete subscribers" on public.subscribers for delete using (public.is_admin());

-- Media: admin only (public site consumes URLs directly from Storage, not this table).
create policy "Admins manage media" on public.media for all using (public.is_admin()) with check (public.is_admin());

-- Views: insert is open (recording a pageview), only admins can read raw logs.
create policy "Anyone can log a view" on public.views for insert with check (true);
create policy "Admins read views" on public.views for select using (public.is_admin());

-- Settings: public read (site name, etc.), admin write.
create policy "Settings are publicly readable" on public.settings for select using (true);
create policy "Admins manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
insert into storage.buckets (id, name, public)
values
  ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public can view media" on storage.objects
  for select using (bucket_id = 'media');

create policy "Admins can upload media" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

create policy "Admins can update media" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

create policy "Admins can delete media" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());
