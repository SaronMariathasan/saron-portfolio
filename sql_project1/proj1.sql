-- COMP3311 24T2 Assignment 1
--
-- Fill in the gaps ("...") below with your code
--
-- You can add any auxiliary views/function that you like
-- but they must be defined in this file *before* their first use
--
-- The code in this file *MUST* load into an empty database in one pass
--
-- It will be tested as follows:
-- createdb test; psql test -f ass1.dump; psql test -f ass1.sql
--
-- Make sure it can load without error under these conditions

-- Put any views/functions that might be useful in multiple questions here

-- create RugPiles type
drop type if exists RugPiles cascade;
create type RugPiles as (rug text, factory text, piles text)
;

-- create Collab type
drop type if exists Collab cascade;
create type Collab as (factory text, collaborator text)
;

create or replace view styles_knot_diff as 
select *, max_knot_length - min_knot_length as diff 
from styles
;

create or replace view factory_rating_avg as 
select factories.id, count(a.rating), avg(a.rating)
from (rugs 
    join crafted_by on rugs.id=crafted_by.rug) as a 
    join factories on a.factory=factories.id 
where a.rating >= 0 
group by factories.id
;

--map crafted rugs to locations
create or replace view crafted_in_location(rug_id, location_id) as
select rug, located_in
from crafted_by 
    join factories on crafted_by.factory = factories.id
;

-- map crafted rugs to provinces
create or replace view crafted_in_province(rug_id, province) as
select rug_id, province
from crafted_in_location 
    join locations on crafted_in_location.location_id = locations.id
;

create or replace view contains_materials
as
select * 
from contains 
    join materials on contains.material=materials.id
;

-- create view mapping rug to factories

create or replace view rug_by_factory as
select a.rug, a.name as rug_name, b.factory, b.name as factory_name
from (rugs 
    join crafted_by on rugs.id=crafted_by.rug) as a
join (factories 
    join crafted_by on factories.id = crafted_by.factory) as b
on a.factory=b.id and a.id=b.rug
order by factory_name
;
-- create view mapping rug to materials

create or replace view rug_by_materials as
select a.rug, a.name as rug_name, b.material, b.name as material_name, b.itype
from (rugs 
    join contains on rugs.id=contains.rug) as a
join (materials 
    join contains on materials.id = contains.material) as b
on a.material=b.id and a.id=b.rug
order by material_name
;

-- produces duplicate rows if two factories collaborate on more than 1 rug
create or replace view collaborated as
select a.factory as factory1, b.factory as factory2, a.rug as rug_id 
from 
    (select * 
    from rug_by_factory 
    order by rug,factory_name) as a
join 
    (select * 
    from rug_by_factory 
    order by rug,factory_name) as b
on a.rug=b.rug and b.factory_name > a.factory_name;


-- Q1

create or replace view Q1(province, nfactories) as 
select province, sum(count)::bigint 
from 
    (select province, id 
    from locations) as a 
    join 
    (select located_in, count(id) 
    from factories 
    group by located_in) as b 
    on a.id = b.located_in 
group by province
;
-- Q2

create or replace view Q2(style, knot_length_diff) as 
select name, diff 
from styles_knot_diff 
where diff in (select max(diff)
                from styles_knot_diff)
;
-- Q3

create or replace view Q3(style, lo_knot_length, hi_knot_length, min_knot_length, max_knot_length) as
select a.name, b.min, b.max, a.min_knot_length, a.max_knot_length
from 
    (select * 
    from styles 
    where min_knot_length != max_knot_length) as a
    join 
    (select style, min(knot_leng), max(knot_leng)
    from rugs
    group by style) as b 
    on a.id = b.style
where min < min_knot_length or max > max_knot_length
;


create or replace view Q4(factory, rating) as
select factories.name, factory_rating_avg.avg::numeric(3,1)
from factory_rating_avg
    join factories on factory_rating_avg.id = factories.id
where factory_rating_avg.avg in (
    select max(avg)
    from factory_rating_avg
    where count >= 5)
;

-- Q5

create or replace function 
    Q5(pattern text) returns table(rug text, size_and_stoper text, total_knots numeric) 
as $$
select name, concat(size,'sf ',rug_stop), ((greatest(knot_per_foot,-50)^2)*size)::numeric(8,0) 
from rugs as r
where r.name similar to concat('%', pattern, '%');
$$ 
language sql
;


-- Q6

create or replace function
    Q6(pattern text) returns table(province text, first integer, nrugs integer, rating numeric)
as $$
select province, min(year_crafted), count(rug_id), avg(rating)::numeric(3,1)
from crafted_in_province 
    join rugs on crafted_in_province.rug_id = rugs.id
where province ilike concat('%', pattern, '%')
group by province;
$$
language sql
;

-- Q7

create or replace function 
    Q7(_rugID integer) returns text
as $$
declare
    contains_tuple record;
    rug_name text;
    material record;
    result text;
begin
    -- check if rug id exists
    if exists (select * from rugs where rugs.id = _rugID) then
        select name into rug_name from rugs where rugs.id = _rugID;
        result := '"' || rug_name || '"';
    else 
        return 'No such rug (' || _rugID::text || ')';        
    end if;

    -- check if rug doesn't list materials
    if not exists (select * from contains where contains.rug = _rugID) then
        result := result || E'\n  no materials recorded';
        return result;
    end if;

    -- list materials
    result := result || E'\n  contains:';

    for contains_tuple in 
        (select name, itype 
        from contains_materials
        where rug=_rugID 
        order by name) 
    loop
        result := result || E'\n    ' || contains_tuple.name || ' (' || contains_tuple.itype || ')';
    end loop;
    return result;
end
$$
language plpgsql
;

-- Q8

create or replace function
    Q8(pattern text) returns setof RugPiles
as $$
declare
    rug_record record;
    tuple RugPiles;
    factories_crafted text;
    piles text;
begin
    -- get id corresponding to name
    for rug_record in 
        (select id, name 
        from rugs 
        where name ilike concat('%', pattern, '%')) 
    loop
        -- get factories where rug is crafted
        select string_agg(factory_name, '+') 
        into factories_crafted 
        from rug_by_factory 
        where rug=rug_record.id;
        -- get pile materials used in rug
        if not exists (select * from rug_by_materials where rug=rug_record.id and itype='pile') then 
            piles := 'no piles recorded';
        else 
            select string_agg(material_name, ',') 
            into piles 
            from rug_by_materials 
            where rug=rug_record.id and itype='pile';
        end if;
        tuple.rug = rug_record.name;
        tuple.factory := factories_crafted;
        tuple.piles := piles;
        return next tuple;
    end loop;
end
$$
language plpgsql
;

-- Q9

create or replace function
    Q9(factoryID integer) returns setof Collab
as $$
declare
    tuple Collab;
    collaborated_tuple record;
begin
-- check if factoryID exists in factories table; if not, return 
    if not exists (select * from factories where id=factoryID) then
        tuple.factory := concat('No such factory (', factoryID::text, ')');
        tuple.collaborator := 'none';
        return next tuple;
        return;
    else
        select name 
        into tuple.factory 
        from factories 
        where id=factoryID;
    end if;

-- check if factory ID exists in collaborated view; if not, return
    if not exists (select * from collaborated where factory1=factoryID or factory2=factoryID) then
        tuple.collaborator := 'none';
        return next tuple;
        return;
    end if;

-- loop through tuples from collaborated view, and add columns to Collab tuple
    for collaborated_tuple in 
        (select distinct on (factory1,factory2) * 
        from collaborated 
        where factory1=factoryID or factory2=factoryID) 
    loop 
        if (collaborated_tuple.factory1=factoryID) then
            select name 
            into tuple.collaborator 
            from factories 
            where id=collaborated_tuple.factory2;
        else
            select name 
            into tuple.collaborator 
            from factories 
            where id=collaborated_tuple.factory1;
        end if;
        return next tuple;
        tuple.factory := null;
    end loop;
end;
$$
language plpgsql
;
