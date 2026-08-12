-- 비개발자 실습용 안전한 재고관리 스키마 (Supabase, 2026)
-- Supabase SQL Editor에서 한 번 실행합니다.

create table if not exists public.test_inventory_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_code text not null,
  name text not null,
  category text not null default '일반',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  safety_stock integer not null default 10 check (safety_stock >= 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  warehouse_location text not null default '창고 A-1',
  status text not null default 'NORMAL' check (status in ('NORMAL', 'LOW_STOCK', 'OUT_OF_STOCK')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, item_code)
);

create table if not exists public.test_inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_id uuid not null references public.test_inventory_items(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('INBOUND', 'OUTBOUND')),
  quantity integer not null check (quantity > 0),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.test_inventory_items enable row level security;
alter table public.test_inventory_transactions enable row level security;

-- 2026년 Data API 노출 정책 변경에 대비한 명시적 테이블 권한
revoke all on public.test_inventory_items from anon;
revoke all on public.test_inventory_transactions from anon;
grant select, insert, update, delete on public.test_inventory_items to authenticated;
grant select, insert on public.test_inventory_transactions to authenticated;

drop policy if exists "Users select own inventory" on public.test_inventory_items;
drop policy if exists "Users insert own inventory" on public.test_inventory_items;
drop policy if exists "Users update own inventory" on public.test_inventory_items;
drop policy if exists "Users delete own inventory" on public.test_inventory_items;

create policy "Users select own inventory"
on public.test_inventory_items for select to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users insert own inventory"
on public.test_inventory_items for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users update own inventory"
on public.test_inventory_items for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users delete own inventory"
on public.test_inventory_items for delete to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Users select own transactions" on public.test_inventory_transactions;
drop policy if exists "Users insert own transactions" on public.test_inventory_transactions;

create policy "Users select own transactions"
on public.test_inventory_transactions for select to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users insert own transactions"
on public.test_inventory_transactions for insert to authenticated
with check (
  (select auth.uid()) = owner_id
  and exists (
    select 1 from public.test_inventory_items item
    where item.id = item_id and item.owner_id = (select auth.uid())
  )
);

-- 재고 변경과 입출고 이력 기록을 하나의 DB 트랜잭션으로 처리합니다.
create or replace function public.adjust_inventory_stock(
  target_item_id uuid,
  movement_type text,
  movement_quantity integer,
  movement_notes text default null
)
returns public.test_inventory_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_item public.test_inventory_items;
begin
  if movement_type not in ('INBOUND', 'OUTBOUND') then
    raise exception '입출고 유형은 INBOUND 또는 OUTBOUND여야 합니다.';
  end if;
  if movement_quantity <= 0 then
    raise exception '수량은 1 이상이어야 합니다.';
  end if;

  update public.test_inventory_items
  set stock_quantity = case
        when movement_type = 'INBOUND' then stock_quantity + movement_quantity
        else stock_quantity - movement_quantity
      end,
      status = case
        when movement_type = 'OUTBOUND' and stock_quantity - movement_quantity = 0 then 'OUT_OF_STOCK'
        when movement_type = 'OUTBOUND' and stock_quantity - movement_quantity < safety_stock then 'LOW_STOCK'
        when movement_type = 'INBOUND' and stock_quantity + movement_quantity < safety_stock then 'LOW_STOCK'
        else 'NORMAL'
      end,
      updated_at = now()
  where id = target_item_id
    and owner_id = (select auth.uid())
    and (movement_type = 'INBOUND' or stock_quantity >= movement_quantity)
  returning * into updated_item;

  if updated_item.id is null then
    raise exception '품목을 찾을 수 없거나 출고 수량이 현재 재고보다 많습니다.';
  end if;

  insert into public.test_inventory_transactions
    (owner_id, item_id, transaction_type, quantity, notes)
  values
    ((select auth.uid()), target_item_id, movement_type, movement_quantity, movement_notes);

  return updated_item;
end;
$$;

revoke all on function public.adjust_inventory_stock(uuid, text, integer, text) from public, anon;
grant execute on function public.adjust_inventory_stock(uuid, text, integer, text) to authenticated;

create index if not exists test_inventory_items_owner_idx
  on public.test_inventory_items(owner_id);
create index if not exists test_inventory_transactions_owner_created_idx
  on public.test_inventory_transactions(owner_id, created_at desc);
