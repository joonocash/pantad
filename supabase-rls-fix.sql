-- Ta bort de gamla felaktiga policies
drop policy if exists "Ägare kan uppdatera sina posts" on pant_posts;
drop policy if exists "Samlare kan uppdatera status" on pant_posts;

-- Ny policy: inloggade kan uppdatera vilken post som helst (OK för nu)
create policy "Inloggade kan uppdatera posts" on pant_posts
  for update using (auth.uid() is not null);

-- Kontrollera att claims-policyn också tillåter delete (för avpaxning)
drop policy if exists "Samlare kan uppdatera sina claims" on claims;
create policy "Samlare kan hantera sina claims" on claims
  for all using (auth.uid() = collector_id);
