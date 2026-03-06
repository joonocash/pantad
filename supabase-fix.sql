-- Lägg till INSERT-policy för profiles så att triggern kan skapa profiler
create policy "Trigger kan skapa profiler" on profiles
  for insert with check (true);

-- Verifiera att triggern finns
select trigger_name, event_manipulation, action_timing
from information_schema.triggers
where trigger_name = 'on_auth_user_created';
