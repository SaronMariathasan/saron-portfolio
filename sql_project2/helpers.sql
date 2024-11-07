-- COMP3311 21T3 Ass2 ... extra database definitions
-- add any views or functions you need into this file
-- note: it must load without error into a freshly created Movies database
-- you must submit this file even if you add nothing to it

-- View joining principals and people
create or replace view is_a(people_id, name, born, died, principals_id, movie, person, ord, job) as 
select *
from people
    join principals on people.id=principals.person;

-- View joining people, principals and movies
create or replace view people_principals_movies as
select *
from is_a
    join movies on is_a.movie=movies.id;