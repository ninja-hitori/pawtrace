-- Smart Urban Animal Management Platform: starting schema
create extension if not exists "pgcrypto";

create table if not exists verified_dogs (
  id uuid primary key default gen_random_uuid(),
  tag_status text,
  vaccination_status text,
  sterilisation_status text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists sightings (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  landmark_description text,
  latitude double precision,          -- effective coordinates used for mapping
  longitude double precision,
  location_source text not null default 'none' check (location_source in ('exif','manual','none')),
  manual_latitude double precision,   -- resident-supplied, preserved as entered
  manual_longitude double precision,
  exif_latitude double precision,     -- extracted from the photo, preserved as extracted
  exif_longitude double precision,
  exif_captured_at timestamp,         -- photo capture time as recorded by the camera (no timezone in EXIF)
  reported_at timestamptz not null default now(),  -- submission time
  injured_or_distressed boolean not null default false,
  attack_reported boolean not null default false,
  concerning_behaviour boolean not null default false,
  high_pedestrian_activity boolean not null default false,
  risk_score integer,
  status text not null default 'open' check (status in ('open','closed')),
  verified_dog_id uuid references verified_dogs(id)
);

create table if not exists sighting_matches (
  id uuid primary key default gen_random_uuid(),
  sighting_id uuid not null references sightings(id),
  candidate_sighting_id uuid not null references sightings(id),
  similarity_score double precision,
  distance_km double precision,
  hours_apart double precision,
  decision text not null default 'pending' check (decision in ('pending','confirmed','rejected'))
);

alter table sightings enable row level security;
alter table verified_dogs enable row level security;
alter table sighting_matches enable row level security;
-- The backend uses the service-role key (bypasses RLS). No public write policies are defined.
-- Storage: create a public bucket named dog-photos.
