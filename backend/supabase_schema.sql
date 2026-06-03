-- D-NET Supabase Schema Creation & Seeding Script

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create PROFILES table
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    email text,
    bio text,
    avatar_color text,
    total_dreams integer default 0,
    streak_count integer default 0,
    last_dream_date text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Create open access policies for simplicity in dev (or authenticated-only)
drop policy if exists "Allow public access to profiles" on public.profiles;
create policy "Allow public access to profiles" on public.profiles for all using (true) with check (true);

-- 2. Create REALMS table
create table if not exists public.realms (
    id uuid default gen_random_uuid() primary key,
    name text unique not null,
    color text not null,
    population integer default 0,
    today_count integer default 0,
    dominant_emotion text default 'mystery',
    chronicle text default '',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on realms
alter table public.realms enable row level security;
drop policy if exists "Allow public access to realms" on public.realms;
create policy "Allow public access to realms" on public.realms for all using (true) with check (true);

-- 3. Create DREAMS table
create table if not exists public.dreams (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    raw_text text not null,
    symbols jsonb default '[]'::jsonb,
    emotions jsonb default '{}'::jsonb,
    archetype text,
    theme text,
    realm text,
    insight text,
    pattern_note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on dreams
alter table public.dreams enable row level security;
drop policy if exists "Allow public access to dreams" on public.dreams;
create policy "Allow public access to dreams" on public.dreams for all using (true) with check (true);

-- 4. Create CHRONICLES table
create table if not exists public.chronicles (
    id uuid default gen_random_uuid() primary key,
    realm_id uuid references public.realms(id) on delete cascade not null,
    story text not null,
    dream_count integer default 0,
    generated_date text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on chronicles
alter table public.chronicles enable row level security;
drop policy if exists "Allow public access to chronicles" on public.chronicles;
create policy "Allow public access to chronicles" on public.chronicles for all using (true) with check (true);

-- 5. Seed default realms
insert into public.realms (name, color, population, today_count, dominant_emotion, chronicle)
values 
('Ocean Realm', '#00D4FF', 142, 12, 'calm', 'A great tide rises in the collective mind. Dreamers describe floating on deep luminous currents.'),
('Shadow Maze', '#6C63FF', 98, 8, 'anxiety', 'Through winding paths of darkness, the minds of many are seeking escape.'),
('Ethereal Skies', '#FF7E5F', 115, 10, 'wonder', 'Floating cities and wings of light. Dreamers report transcending earthly limits.'),
('Crystal Forest', '#4CAF50', 88, 5, 'mystery', 'Crystalline trees reflecting forgotten memories. Quiet introspection rules this domain.')
on conflict (name) do update set
    color = excluded.color,
    chronicle = excluded.chronicle;

-- 6. Seed default chronicles
insert into public.chronicles (realm_id, story, dream_count, generated_date)
select 
    id, 
    'A great tide rises in the collective mind. Dreamers describe floating on deep luminous currents, searching for submerged keys that open no doors.', 
    42, 
    to_char(now(), 'YYYY-MM-DD')
from public.realms where name = 'Ocean Realm'
union all
select 
    id, 
    'Through winding paths of darkness, the minds of many are seeking escape. There is a sense of being pursued by whispers, yet the walls of the maze are turning into starlight.', 
    28, 
    to_char(now(), 'YYYY-MM-DD')
from public.realms where name = 'Shadow Maze'
on conflict do nothing;

-- 7. Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email, total_dreams, streak_count, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    0,
    0,
    new.created_at
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert profiles for any existing users
insert into public.profiles (id, display_name, email, total_dreams, streak_count)
select id, coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1)), email, 0, 0
from auth.users
on conflict (id) do nothing;


-- 8. Chat Backups
create table if not exists public.chat_backups (
    user_id uuid references public.profiles(id) on delete cascade primary key,
    threads_data jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for chat_backups
alter table public.chat_backups enable row level security;

-- Policies for chat_backups
create policy "Users can view their own chat backups"
    on public.chat_backups for select
    using (auth.uid() = user_id);

create policy "Users can insert their own chat backups"
    on public.chat_backups for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own chat backups"
    on public.chat_backups for update
    using (auth.uid() = user_id);

-- 9. Real-time Direct Messages
create table if not exists public.chat_messages (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    receiver_id uuid references public.profiles(id) on delete cascade not null,
    encrypted_text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chat_messages enable row level security;

-- Policies
create policy "Users can insert messages" on public.chat_messages for insert with check (auth.uid() = sender_id);
create policy "Users can read their messages" on public.chat_messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

