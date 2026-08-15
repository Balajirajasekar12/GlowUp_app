-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

-- Users are handled by Supabase Auth (auth.users) automatically.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  date_of_birth date,
  is_age_verified boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage their own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  storage_path text not null,
  is_public boolean default false,
  created_at timestamptz default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  skin_summary text,
  hair_summary text,
  face_shape text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists previews (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  preview_storage_path text not null,
  created_at timestamptz default now()
);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  rater_id uuid references auth.users(id) on delete cascade,
  score smallint check (score between 1 and 5),
  created_at timestamptz default now(),
  unique (photo_id, rater_id)
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text check (type in ('bug', 'feature_request', 'general')),
  message text not null,
  status text default 'new' check (status in ('new', 'reviewing', 'planned', 'shipped')),
  created_at timestamptz default now()
);

-- Row Level Security: photos and analyses are private by default.
alter table photos enable row level security;
alter table analyses enable row level security;
alter table previews enable row level security;
alter table ratings enable row level security;
alter table feedback enable row level security;

create policy "Users manage their own photos"
  on photos for all
  using (auth.uid() = user_id);

create policy "Anyone can view public photos"
  on photos for select
  using (is_public = true);

create policy "Users can rate public photos, not their own"
  on ratings for insert
  with check (
    auth.uid() = rater_id
    and exists (
      select 1 from photos
      where photos.id = photo_id
        and photos.is_public = true
        and photos.user_id <> auth.uid()
    )
  );

create policy "Anyone can view ratings"
  on ratings for select
  using (true);

create policy "Users submit their own feedback"
  on feedback for insert
  with check (auth.uid() = user_id or user_id is null);

-- Storage: a public bucket for photos the user explicitly chooses to
-- publish. Anything NOT run through the publish flow stays only in the
-- browser and is never uploaded here, so private-by-default still holds.
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "Anyone can view gallery images"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Users upload to their own gallery folder"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete their own gallery images"
  on storage.objects for delete
  using (
    bucket_id = 'gallery'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
