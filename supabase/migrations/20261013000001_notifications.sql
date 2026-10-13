-- ============================================================================
-- FITPULSE • KOÇ & ADMİN PANELİ BİLDİRİM ŞEMASI
-- ============================================================================

-- 1. Bildirimler Tablosu
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

-- Kullanıcılar sadece kendi bildirimlerini okuyabilir
create policy "Kullanıcılar kendi bildirimlerini okuyabilir"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Kullanıcılar kendi bildirimlerini okundu yapabilir
create policy "Kullanıcılar bildirimlerini güncelleyebilir"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Koç/Admin bildirim oluşturabilir
create policy "Bildirim ekleme izni"
  on public.notifications for insert
  with check (true);

-- Koç Paneli için profilleri okuma izni (RLS genişletmesi)
create policy "Koç paneli profil görüntüleme"
  on public.profiles for select
  using (true);

create policy "Koç paneli öğün görüntüleme"
  on public.meal_logs for select
  using (true);
