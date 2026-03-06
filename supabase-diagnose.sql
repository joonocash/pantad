-- 1. Kolla om profiles-tabellen finns och har rätt kolumner
select column_name, data_type
from information_schema.columns
where table_name = 'profiles'
order by ordinal_position;
