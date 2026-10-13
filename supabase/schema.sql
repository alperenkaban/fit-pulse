-- ============================================================================
-- FITPULSE • SUPABASE VERİTABANI ŞEMASI & ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- Faz 1, Faz 2 ve Faz 3 Gereksinimleri İçin Çok Kullanıcılı Güvenli Mimari
-- ============================================================================

-- 1. PROFILES TABLOSU (Kullanıcı hesapları & BMR/TDEE temel parametreleri)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text not null,
  gender text check (gender in ('female', 'male')) not null default 'female',
  birth_date date not null,
  height_cm numeric(5,2) not null check (height_cm > 50 and height_cm < 260),
  start_weight_kg numeric(5,2) not null check (start_weight_kg > 20 and start_weight_kg < 350),
  current_weight_kg numeric(5,2) not null check (current_weight_kg > 20 and current_weight_kg < 350),
  target_weight_kg numeric(5,2) not null check (target_weight_kg > 20 and target_weight_kg < 350),
  activity_level numeric(4,3) not null default 1.375 check (activity_level in (1.2, 1.375, 1.55, 1.725, 1.9)),
  daily_calorie_target integer check (daily_calorie_target >= 1000), -- Crash diet alt sınır kontrolü
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS: Profil Güvenliği (Kullanıcı A, Kullanıcı B'nin verisine ASLA erişemez)
alter table public.profiles enable row level security;

create policy "Kullanıcılar sadece kendi profilini okuyabilir"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Kullanıcılar sadece kendi profilini oluşturabilir"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Kullanıcılar sadece kendi profilini güncelleyebilir"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Kullanıcılar sadece kendi profilini silebilir"
  on public.profiles for delete
  using (auth.uid() = id);


-- 2. WEIGHT_LOGS TABLOSU (Günlük Kilo Takibi & Tarihçesi)
create table if not exists public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null,
  weight_kg numeric(5,2) not null check (weight_kg > 20 and weight_kg < 350),
  notes text,
  created_at timestamptz default now() not null,
  unique (user_id, log_date)
);

alter table public.weight_logs enable row level security;

create policy "Kullanıcılar sadece kendi kilo kayıtlarını görebilir"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "Kullanıcılar sadece kendi kilo kayıtlarını ekleyebilir"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "Kullanıcılar sadece kendi kilo kayıtlarını güncelleyebilir"
  on public.weight_logs for update
  using (auth.uid() = user_id);

create policy "Kullanıcılar sadece kendi kilo kayıtlarını silebilir"
  on public.weight_logs for delete
  using (auth.uid() = user_id);


-- 3. MEAL_LOGS TABLOSU (FAZ 2 Hazırlığı: Öğünler, Porsiyon ve Makrolar)
create table if not exists public.meal_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  food_name text not null,
  serving_amount numeric(6,2) not null,
  serving_unit text default 'gram' not null,
  calories integer not null check (calories >= 0),
  protein_g numeric(5,1) default 0,
  carbs_g numeric(5,1) default 0,
  fat_g numeric(5,1) default 0,
  created_at timestamptz default now() not null
);

alter table public.meal_logs enable row level security;

create policy "Kullanıcılar sadece kendi öğün kayıtlarını görebilir"
  on public.meal_logs for select
  using (auth.uid() = user_id);

create policy "Kullanıcılar sadece kendi öğün kayıtlarını ekleyebilir"
  on public.meal_logs for insert
  with check (auth.uid() = user_id);

create policy "Kullanıcılar sadece kendi öğün kayıtlarını silebilir"
  on public.meal_logs for delete
  using (auth.uid() = user_id);


-- 4. OTOMATİK PROFİL TETİKLEYİCİSİ (auth.users kaydı oluştuğunda tetiklenir)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Yeni kullanıcı oluşunca otomatik boş profil kaydı hazırla (Onboarding'de doldurulmak üzere)
  insert into public.profiles (
    id,
    email,
    full_name,
    gender,
    birth_date,
    height_cm,
    start_weight_kg,
    current_weight_kg,
    target_weight_kg,
    activity_level,
    daily_calorie_target
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Kullanıcı'),
    coalesce(new.raw_user_meta_data->>'gender', 'female'),
    coalesce((new.raw_user_meta_data->>'birth_date')::date, '2000-01-01'::date),
    coalesce((new.raw_user_meta_data->>'height_cm')::numeric, 165),
    coalesce((new.raw_user_meta_data->>'start_weight_kg')::numeric, 65),
    coalesce((new.raw_user_meta_data->>'start_weight_kg')::numeric, 65),
    coalesce((new.raw_user_meta_data->>'target_weight_kg')::numeric, 58),
    coalesce((new.raw_user_meta_data->>'activity_level')::numeric, 1.375),
    1500
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger'ı bağla
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 5. BİLDİRİMLER & KOÇLUK PANELİ (Admin & Danışan Mesajlaşma)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  type text check (type in ('warning', 'congrats', 'info', 'reminder')) default 'info',
  is_read boolean default false,
  created_at timestamptz default now() not null
);

alter table public.notifications enable row level security;

create policy "Kullanıcılar kendi bildirimlerini okuyabilir"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Kullanıcılar bildirimlerini güncelleyebilir"
  on public.notifications for update using (auth.uid() = user_id);

create policy "Bildirim ekleme izni"
  on public.notifications for insert with check (true);

