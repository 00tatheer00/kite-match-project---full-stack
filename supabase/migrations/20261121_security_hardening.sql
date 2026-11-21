-- =====================================================================
-- Kite FMCG — Security hardening (run once in Supabase → SQL Editor)
-- =====================================================================
-- Why: the original setup disabled Row Level Security and granted
-- INSERT/UPDATE/DELETE on every table to the public `anon` role. The anon
-- key is public (NEXT_PUBLIC_*), so anyone could read all orders (customer
-- names, phones, addresses) or wipe the database through the Supabase REST API.
--
-- The Next.js server uses the SERVICE ROLE key, which bypasses RLS, so the
-- website and admin panel keep working after this migration.
-- Safe to run more than once.
-- =====================================================================

begin;

-- 1. Remove write access from public roles --------------------------------
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
revoke select on public.orders, public.analytics from anon, authenticated;

-- Make sure future tables don't silently inherit public write access.
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon, authenticated;

-- 2. Enable Row Level Security on every table ------------------------------
alter table public.products   enable row level security;
alter table public.promotions enable row level security;
alter table public.orders     enable row level security;
alter table public.settings   enable row level security;
alter table public.analytics  enable row level security;

-- 3. Read-only public policies for catalog data (orders/analytics: no public access)
drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products
  for select to anon, authenticated using ("isActive" = true);

drop policy if exists "Public read active promotions" on public.promotions;
create policy "Public read active promotions" on public.promotions
  for select to anon, authenticated using ("isActive" = true);

drop policy if exists "Public read settings" on public.settings;
create policy "Public read settings" on public.settings
  for select to anon, authenticated using (true);

-- 4. Data integrity --------------------------------------------------------
-- Order numbers must be unique (the app retries on conflict).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conrelid = 'public.orders'::regclass and contype = 'u'
      and conname in ('orders_orderNumber_key', 'orders_ordernumber_key')
  ) then
    begin
      alter table public.orders add constraint "orders_orderNumber_key" unique ("orderNumber");
    exception when duplicate_table or duplicate_object then null;
    end;
  end if;
end $$;

create index if not exists orders_created_at_idx on public.orders ("createdAt" desc);

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'shipped', 'cancelled')) not valid;

alter table public.orders drop constraint if exists orders_total_positive;
alter table public.orders add constraint orders_total_positive
  check ("totalAmount" > 0) not valid;

-- 5. Atomic page-view counter (used by /api/analytics/track when present) ----
create or replace function public.track_page_view(
  p_path text,
  p_source text,
  p_device text,
  p_city text,
  p_country text,
  p_new_visitor boolean,
  p_visit jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today text := to_char(now() at time zone 'Asia/Karachi', 'YYYY-MM-DD');
  v_inc int := case when p_new_visitor then 1 else 0 end;
begin
  insert into public.analytics (id, key) values (1, 'global_summary') on conflict (id) do nothing;

  update public.analytics a set
    "totalPageviews" = coalesce(a."totalPageviews", 0) + 1,
    "totalVisitors"  = coalesce(a."totalVisitors", 0) + v_inc,
    "todayVisitors"  = (case
                          when a."lastUpdated" is not null
                           and to_char((a."lastUpdated")::timestamptz at time zone 'Asia/Karachi', 'YYYY-MM-DD') = v_today
                          then coalesce(a."todayVisitors", 0) else 0
                        end) + v_inc,
    sources   = case when p_new_visitor then jsonb_set(coalesce(a.sources, '{}'),   array[p_source],  to_jsonb(coalesce((a.sources   ->> p_source)::int, 0) + 1)) else a.sources end,
    devices   = case when p_new_visitor then jsonb_set(coalesce(a.devices, '{}'),   array[p_device],  to_jsonb(coalesce((a.devices   ->> p_device)::int, 0) + 1)) else a.devices end,
    cities    = case when p_new_visitor then jsonb_set(coalesce(a.cities, '{}'),    array[p_city],    to_jsonb(coalesce((a.cities    ->> p_city)::int, 0) + 1)) else a.cities end,
    countries = case when p_new_visitor then jsonb_set(coalesce(a.countries, '{}'), array[p_country], to_jsonb(coalesce((a.countries ->> p_country)::int, 0) + 1)) else a.countries end,
    "topPages" = jsonb_set(coalesce(a."topPages", '{}'), array[p_path], to_jsonb(coalesce((a."topPages" ->> p_path)::int, 0) + 1)),
    "recentVisits" = (
      select coalesce(jsonb_agg(e order by i), '[]'::jsonb)
      from (
        select e, i
        from jsonb_array_elements(jsonb_build_array(p_visit) || coalesce(a."recentVisits", '[]'::jsonb)) with ordinality as t(e, i)
        order by i
        limit 50
      ) s
    ),
    "lastUpdated" = now()::text,
    "updatedAt" = now()
  where a.id = 1;
end;
$$;

revoke all on function public.track_page_view(text, text, text, text, text, boolean, jsonb) from public, anon, authenticated;
grant execute on function public.track_page_view(text, text, text, text, text, boolean, jsonb) to service_role;

-- 6. Remove IP addresses stored by the old analytics code -------------------
update public.analytics
set "recentVisits" = coalesce(
  (select jsonb_agg(e - 'ip') from jsonb_array_elements("recentVisits") e),
  '[]'::jsonb
)
where "recentVisits" is not null;

notify pgrst, 'reload schema';

commit;

-- =====================================================================
-- Storage: bucket "kite-images" should be PUBLIC for reads only.
-- In Storage → Policies, make sure there is NO insert/update/delete policy
-- for anon/authenticated on storage.objects for this bucket (uploads go
-- through the server with the service role key).
-- =====================================================================
