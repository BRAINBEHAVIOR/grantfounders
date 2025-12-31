-- Core schema for GF-777ACE / DIOS stack
-- Tables are stubs; review before running in production.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists orgs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists api_keys (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null default 'default',
  secret text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function create_api_key(p_org uuid, p_name text default 'default')
returns uuid as $$
declare
  new_id uuid;
begin
  insert into api_keys (org_id, name, secret)
    values (p_org, coalesce(p_name, 'default'), encode(gen_random_bytes(24), 'base64'))
    returning id into new_id;
  return new_id;
end;
$$ language plpgsql security definer;

create or replace function verify_api_key(p_key text)
returns table(org_id uuid, api_key_id uuid, is_active boolean) as $$
begin
  return query
    select org_id, id as api_key_id, is_active
    from api_keys
    where secret = p_key
      and is_active = true;
end;
$$ language plpgsql stable;

create table if not exists org_memberships (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references orgs(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

create table if not exists usage_events (
  id bigserial primary key,
  org_id uuid not null references orgs(id) on delete cascade,
  api_key_id uuid not null references api_keys(id) on delete cascade,
  endpoint text not null,
  created_at timestamptz not null default now()
);

comment on table orgs is 'Organizations using GF-777ACE platform';
comment on table api_keys is 'API keys scoped to an organization';
comment on table org_memberships is 'User-to-organization memberships';
comment on table usage_events is 'Event-level metering for billing and analytics';
