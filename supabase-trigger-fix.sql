-- Skriv om triggerfunktionen med explicit schema och search_path
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1) || '_' || floor(random() * 9000 + 1000)::text
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
