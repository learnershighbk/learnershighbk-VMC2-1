-- Migration: create concert reservation schema
-- ensures pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- reusable trigger function to maintain updated_at stamps
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- concerts table
create table if not exists public.concerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  venue_name text not null,
  poster_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.concerts disable row level security;

-- seat classes table
create table if not exists public.seat_classes (
  id uuid primary key default gen_random_uuid(),
  concert_id uuid not null references public.concerts(id) on delete cascade,
  name text not null,
  price integer not null check (price > 0),
  total_seats integer not null check (total_seats >= 0),
  available_seats integer not null check (available_seats >= 0 and available_seats <= total_seats),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.seat_classes disable row level security;

create index if not exists idx_seat_classes_concert on public.seat_classes (concert_id);
create unique index if not exists uq_seat_classes_concert_name on public.seat_classes (concert_id, name);

-- seats table
create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  concert_id uuid not null references public.concerts(id) on delete cascade,
  seat_class_id uuid not null references public.seat_classes(id) on delete cascade,
  section_label text,
  row_label text not null,
  seat_number integer not null,
  is_reserved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.seats disable row level security;

create index if not exists idx_seats_concert on public.seats (concert_id);
create unique index if not exists uq_seats_concert_position on public.seats (concert_id, row_label, seat_number);

-- reservations table
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  concert_id uuid not null references public.concerts(id) on delete restrict,
  reservation_code text not null default upper(replace(gen_random_uuid()::text, '-', '')),
  phone_number text not null,
  password_hash text not null,
  status text not null check (status in ('reserved', 'canceled')),
  total_price integer not null check (total_price >= 0),
  reserved_at timestamptz not null default now(),
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.reservations disable row level security;

create unique index if not exists uq_reservations_reservation_code on public.reservations (reservation_code);
create index if not exists idx_reservations_lookup on public.reservations (phone_number, status, reserved_at desc);

-- reservation seats junction table
create table if not exists public.reservation_seats (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  seat_id uuid not null references public.seats(id) on delete restrict,
  seat_label_snapshot text not null,
  unit_price integer not null check (unit_price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.reservation_seats disable row level security;

create index if not exists idx_reservation_seats_reservation on public.reservation_seats (reservation_id);
create unique index if not exists uq_reservation_seats_active_seat on public.reservation_seats (seat_id) where (is_active);

-- cancel lookup helper to quickly find seats by active reservation
create index if not exists idx_reservation_seats_active on public.reservation_seats (reservation_id) where (is_active);

-- trigger helpers to maintain updated_at columns

do $$
declare
  trigger_name text;
begin
  -- concerts
  trigger_name := 'set_public_concerts_updated_at';
  if not exists (select 1 from pg_trigger where tgname = trigger_name) then
    execute format(
      'create trigger %I before update on public.concerts for each row execute procedure public.set_updated_at()'
    , trigger_name);
  end if;

  -- seat_classes
  trigger_name := 'set_public_seat_classes_updated_at';
  if not exists (select 1 from pg_trigger where tgname = trigger_name) then
    execute format(
      'create trigger %I before update on public.seat_classes for each row execute procedure public.set_updated_at()'
    , trigger_name);
  end if;

  -- seats
  trigger_name := 'set_public_seats_updated_at';
  if not exists (select 1 from pg_trigger where tgname = trigger_name) then
    execute format(
      'create trigger %I before update on public.seats for each row execute procedure public.set_updated_at()'
    , trigger_name);
  end if;

  -- reservations
  trigger_name := 'set_public_reservations_updated_at';
  if not exists (select 1 from pg_trigger where tgname = trigger_name) then
    execute format(
      'create trigger %I before update on public.reservations for each row execute procedure public.set_updated_at()'
    , trigger_name);
  end if;

  -- reservation_seats
  trigger_name := 'set_public_reservation_seats_updated_at';
  if not exists (select 1 from pg_trigger where tgname = trigger_name) then
    execute format(
      'create trigger %I before update on public.reservation_seats for each row execute procedure public.set_updated_at()'
    , trigger_name);
  end if;
exception
  when others then
    raise notice 'set_updated_at triggers creation skipped: %', sqlerrm;
end $$;
