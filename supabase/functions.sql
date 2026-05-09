-- RPC helpers for narrow profile access.
-- Run after schema.sql and before policies.sql.

drop function if exists find_profile_by_email(text);
drop function if exists get_profiles_by_ids(uuid[]);

create function find_profile_by_email(search_email text)
returns table (
  id uuid,
  email text
)
language sql
security definer
set search_path = public
as $$
  select profiles.id, profiles.email
  from profiles
  where lower(profiles.email) = lower(trim(search_email))
  limit 1;
$$;

create function get_profiles_by_ids(profile_ids uuid[])
returns table (
  id uuid,
  email text
)
language sql
security definer
set search_path = public
as $$
  select profiles.id, profiles.email
  from profiles
  where profiles.id = any(profile_ids);
$$;

revoke all on function find_profile_by_email(text) from public;
revoke all on function get_profiles_by_ids(uuid[]) from public;

grant execute on function find_profile_by_email(text) to authenticated;
grant execute on function get_profiles_by_ids(uuid[]) to authenticated;