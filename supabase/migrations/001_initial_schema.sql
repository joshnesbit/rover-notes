-- Rover Notes: initial schema
-- A personal notebook for a roving listener tracking neighbors' gifts, dreams, and connections.

create extension if not exists "uuid-ossp";

-- People: the neighbors
create table people (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  aliases text[] default '{}',
  where_they_are text,
  first_met_at date,
  last_seen_at timestamptz,
  notes_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notes: the source of truth (verbatim voice-typed entries)
create table notes (
  id uuid primary key default uuid_generate_v4(),
  raw_text text not null,
  structured jsonb,
  recorded_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Gifts: extracted from notes, always linked back
create table gifts (
  id uuid primary key default uuid_generate_v4(),
  person_id uuid not null references people(id) on delete cascade,
  text text not null,
  kind text not null check (kind in ('head', 'heart', 'hand', 'teachable', 'dream')),
  source_note_id uuid references notes(id) on delete set null,
  created_at timestamptz default now()
);

-- Join table: which people appear in which notes
create table note_people (
  note_id uuid not null references notes(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (note_id, person_id)
);

-- Connections: who pointed the listener toward whom
create table connections (
  id uuid primary key default uuid_generate_v4(),
  from_person uuid not null references people(id) on delete cascade,
  to_person uuid not null references people(id) on delete cascade,
  reason text,
  source_note_id uuid references notes(id) on delete set null,
  status text default 'suggested' check (status in ('suggested', 'introduced', 'done')),
  created_at timestamptz default now()
);

-- Indexes for common queries
create index idx_gifts_person on gifts(person_id);
create index idx_gifts_kind on gifts(kind);
create index idx_note_people_person on note_people(person_id);
create index idx_note_people_note on note_people(note_id);
create index idx_connections_from on connections(from_person);
create index idx_connections_to on connections(to_person);
create index idx_people_last_seen on people(last_seen_at desc nulls last);
create index idx_people_name on people(name);

-- Full-text search indexes
alter table people add column search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(array_to_string(aliases, ' '), '') || ' ' || coalesce(where_they_are, ''))
  ) stored;

alter table notes add column search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(raw_text, ''))
  ) stored;

alter table gifts add column search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(text, ''))
  ) stored;

create index idx_people_search on people using gin(search_vector);
create index idx_notes_search on notes using gin(search_vector);
create index idx_gifts_search on gifts using gin(search_vector);

-- Trigger to auto-update updated_at on people
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger people_updated_at
  before update on people
  for each row execute function update_updated_at();
