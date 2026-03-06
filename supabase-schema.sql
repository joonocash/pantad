-- Aktivera PostGIS för geodata
create extension if not exists postgis;

-- ============================================
-- PROFILES (utökar Supabase Auth users)
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text unique not null,
  avatar_url text,
  xp integer default 0,
  level integer default 1,
  total_cans integer default 0,
  current_mode text default 'collect' check (current_mode in ('drop', 'collect')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Alla kan se profiler" on profiles for select using (true);
create policy "Användare kan uppdatera sin egna profil" on profiles for update using (auth.uid() = id);

-- Trigger: skapa profil automatiskt vid registrering
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, username)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1) || '_' || floor(random() * 9000 + 1000)::text
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================
-- PANT POSTS (pins på kartan)
-- ============================================
create table pant_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  latitude double precision not null,
  longitude double precision not null,
  location geometry(Point, 4326) generated always as (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  ) stored,
  can_count_min integer not null check (can_count_min > 0),
  can_count_max integer not null check (can_count_max >= can_count_min),
  comment text,
  photo_url text,
  status text default 'available' check (status in ('available', 'claimed', 'collected')),
  created_at timestamptz default now(),
  expires_at timestamptz
);

create index pant_posts_location_idx on pant_posts using gist(location);
create index pant_posts_status_idx on pant_posts(status);

alter table pant_posts enable row level security;

create policy "Alla kan se tillgängliga posts" on pant_posts for select using (true);
create policy "Inloggade kan skapa posts" on pant_posts for insert with check (auth.uid() = user_id);
create policy "Ägare kan uppdatera sina posts" on pant_posts for update using (auth.uid() = user_id);
create policy "Samlare kan uppdatera status" on pant_posts for update using (
  status in ('claimed', 'collected')
);

-- ============================================
-- CLAIMS (paxning av pant)
-- ============================================
create table claims (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references pant_posts(id) on delete cascade not null,
  collector_id uuid references profiles(id) on delete cascade not null,
  claimed_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 minutes'),
  collected_at timestamptz,
  unique(post_id, collector_id, claimed_at)
);

alter table claims enable row level security;

create policy "Användare ser sina egna claims" on claims for select using (auth.uid() = collector_id);
create policy "Inloggade kan claima" on claims for insert with check (auth.uid() = collector_id);
create policy "Samlare kan uppdatera sina claims" on claims for update using (auth.uid() = collector_id);

-- Funktion: återställ utgångna claims automatiskt
create or replace function expire_old_claims()
returns void as $$
begin
  update pant_posts
  set status = 'available'
  where id in (
    select post_id from claims
    where expires_at < now()
    and collected_at is null
    and post_id in (
      select id from pant_posts where status = 'claimed'
    )
  );

  delete from claims
  where expires_at < now()
  and collected_at is null;
end;
$$ language plpgsql security definer;

-- ============================================
-- ACHIEVEMENTS (badges)
-- ============================================
create table achievements (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  icon text not null,
  xp_reward integer default 50,
  requirement_type text not null,
  requirement_value integer not null
);

insert into achievements (slug, title, description, icon, xp_reward, requirement_type, requirement_value) values
  ('first_collect', 'Första steget', 'Hämta din första pant', '🥤', 50, 'total_cans', 1),
  ('ten_cans', 'Dubbel digits', 'Samla totalt 10 burkar', '🎯', 100, 'total_cans', 10),
  ('fifty_cans', 'Pantmästare', 'Samla totalt 50 burkar', '⭐', 250, 'total_cans', 50),
  ('hundred_cans', 'Panthjälte', 'Samla totalt 100 burkar', '🏆', 500, 'total_cans', 100),
  ('five_hundred_cans', 'Pantlegend', 'Samla totalt 500 burkar', '👑', 2000, 'total_cans', 500),
  ('first_drop', 'Generös givare', 'Lägg ut din första pant', '📍', 30, 'total_drops', 1),
  ('ten_drops', 'Städarentusiasten', 'Lägg ut pant 10 gånger', '🌿', 150, 'total_drops', 10),
  ('eco_warrior', 'Miljöhjälte', 'Bidra till 50 upphämtningar', '🌍', 300, 'total_drops', 50);

alter table achievements enable row level security;
create policy "Alla kan se achievements" on achievements for select using (true);

-- ============================================
-- USER ACHIEVEMENTS
-- ============================================
create table user_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  achievement_id uuid references achievements(id) not null,
  earned_at timestamptz default now(),
  unique(user_id, achievement_id)
);

alter table user_achievements enable row level security;
create policy "Användare ser sina egna achievements" on user_achievements for select using (auth.uid() = user_id);
create policy "System kan sätta achievements" on user_achievements for insert with check (true);

-- ============================================
-- SIDEQUESTS (veckovisa uppdrag)
-- ============================================
create table sidequests (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  xp_reward integer default 100,
  requirement_type text not null,
  requirement_value integer not null,
  active boolean default true,
  resets_weekly boolean default true
);

insert into sidequests (title, description, xp_reward, requirement_type, requirement_value) values
  ('Veckans samlare', 'Samla pant 3 gånger denna vecka', 150, 'weekly_collects', 3),
  ('Stadsutforskaren', 'Hämta pant i 3 olika parker', 200, 'unique_locations', 3),
  ('Heltehjälten', 'Hämta pant 2 gånger på helgen', 120, 'weekend_collects', 2),
  ('Burkkungen', 'Samla minst 20 burkar denna vecka', 180, 'weekly_cans', 20),
  ('Den generöse', 'Lägg ut pant 2 gånger denna vecka', 100, 'weekly_drops', 2);

alter table sidequests enable row level security;
create policy "Alla kan se sidequests" on sidequests for select using (true);

-- ============================================
-- USER SIDEQUESTS (progress)
-- ============================================
create table user_sidequests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  sidequest_id uuid references sidequests(id) not null,
  progress integer default 0,
  completed_at timestamptz,
  week_start date,
  unique(user_id, sidequest_id, week_start)
);

alter table user_sidequests enable row level security;
create policy "Användare ser sin egen sidequest-progress" on user_sidequests for select using (auth.uid() = user_id);
create policy "System kan uppdatera progress" on user_sidequests for all using (true);

-- ============================================
-- REALTIME: aktivera för kartan
-- ============================================
alter publication supabase_realtime add table pant_posts;
alter publication supabase_realtime add table claims;
