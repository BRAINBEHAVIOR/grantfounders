-- Minimal seed data for local dev
-- Replace placeholder UUIDs/emails with real values before production use.

insert into orgs (id, name)
values ('11111111-2222-3333-4444-555555555555', 'GF Demo Org')
on conflict (id) do nothing;

-- Create a default API key for the demo org
select create_api_key('11111111-2222-3333-4444-555555555555', 'demo') as api_key;

-- Associate an existing auth user (replace with a real user id)
insert into org_memberships (org_id, user_id, role)
values ('11111111-2222-3333-4444-555555555555', '00000000-0000-0000-0000-000000000000', 'owner')
on conflict do nothing;
