-- Add a required vehicle classification while keeping older clients compatible.
begin;

alter table public.products
add column vehicle_type text not null default 'carro';

update public.products
set vehicle_type = 'mota'
where title in (
  'Bridgestone Battlax T33 180/55 ZR17',
  'Bridgestone Battlax T33 120/70 ZR17'
);

alter table public.products
add constraint products_vehicle_type_check
check (vehicle_type in ('carro', 'mota'));

commit;
