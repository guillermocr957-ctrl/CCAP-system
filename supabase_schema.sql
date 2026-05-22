create table if not exists public.ec2_user_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.ec2_user_snapshots
  add column if not exists created_at timestamptz not null default now();

alter table public.ec2_user_snapshots
  add column if not exists created_by uuid references auth.users (id) on delete set null;

alter table public.ec2_user_snapshots
  add column if not exists deleted_at timestamptz;

alter table public.ec2_user_snapshots enable row level security;

create or replace function public.ec2_set_audit_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.created_at is null then
      new.created_at := now();
    end if;
    if new.created_by is null then
      new.created_by := auth.uid();
    end if;
    if new.deleted_at is null then
      new.deleted_at := null;
    end if;
    new.updated_at := now();
    return new;
  end if;

  new.updated_at := now();

  -- If payload changes, revive row in case it was soft-deleted.
  if new.payload is distinct from old.payload then
    new.deleted_at := null;
  end if;

  -- Keep creator immutable after first write.
  if old.created_by is not null then
    new.created_by := old.created_by;
  else
    new.created_by := coalesce(new.created_by, auth.uid());
  end if;

  return new;
end;
$$;

drop trigger if exists ec2_user_snapshots_audit_tg on public.ec2_user_snapshots;
create trigger ec2_user_snapshots_audit_tg
before insert or update on public.ec2_user_snapshots
for each row
execute function public.ec2_set_audit_fields();

create or replace function public.ec2_soft_delete_my_snapshot()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ec2_user_snapshots
     set deleted_at = now(),
         updated_at = now()
   where user_id = auth.uid();
end;
$$;

revoke all on function public.ec2_soft_delete_my_snapshot() from public;
grant execute on function public.ec2_soft_delete_my_snapshot() to authenticated;

drop policy if exists "ec2_user_snapshots_select_own" on public.ec2_user_snapshots;
create policy "ec2_user_snapshots_select_own"
on public.ec2_user_snapshots
for select
using (auth.uid() = user_id and deleted_at is null);

drop policy if exists "ec2_user_snapshots_insert_own" on public.ec2_user_snapshots;
create policy "ec2_user_snapshots_insert_own"
on public.ec2_user_snapshots
for insert
with check (auth.uid() = user_id and deleted_at is null);

drop policy if exists "ec2_user_snapshots_update_own" on public.ec2_user_snapshots;
create policy "ec2_user_snapshots_update_own"
on public.ec2_user_snapshots
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ec2_user_snapshots_delete_own" on public.ec2_user_snapshots;

create index if not exists ec2_user_snapshots_updated_at_idx
on public.ec2_user_snapshots (updated_at desc);

create index if not exists ec2_user_snapshots_deleted_at_idx
on public.ec2_user_snapshots (deleted_at);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ec2_app_role') then
    create type public.ec2_app_role as enum ('admin', 'contador', 'visor');
  end if;
end
$$;

create table if not exists public.ec2_user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.ec2_app_role not null default 'visor',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.ec2_user_roles enable row level security;

drop trigger if exists ec2_user_roles_audit_tg on public.ec2_user_roles;
create trigger ec2_user_roles_audit_tg
before insert or update on public.ec2_user_roles
for each row
execute function public.ec2_set_audit_fields();

create or replace function public.ec2_current_role()
returns public.ec2_app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      case
        when (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'contador', 'visor')
          then (auth.jwt() -> 'app_metadata' ->> 'role')::public.ec2_app_role
        else null
      end
    ),
    (select r.role from public.ec2_user_roles r where r.user_id = auth.uid() and r.deleted_at is null),
    'visor'::public.ec2_app_role
  )
$$;

drop policy if exists "ec2_user_roles_select_self_or_admin" on public.ec2_user_roles;
create policy "ec2_user_roles_select_self_or_admin"
on public.ec2_user_roles
for select
using (
  deleted_at is null
  and (
    auth.uid() = user_id
    or public.ec2_current_role() = 'admin'::public.ec2_app_role
  )
);

drop policy if exists "ec2_user_roles_insert_admin" on public.ec2_user_roles;
create policy "ec2_user_roles_insert_admin"
on public.ec2_user_roles
for insert
with check (public.ec2_current_role() = 'admin'::public.ec2_app_role);

drop policy if exists "ec2_user_roles_update_admin" on public.ec2_user_roles;
create policy "ec2_user_roles_update_admin"
on public.ec2_user_roles
for update
using (public.ec2_current_role() = 'admin'::public.ec2_app_role)
with check (public.ec2_current_role() = 'admin'::public.ec2_app_role);

drop policy if exists "ec2_user_roles_delete_admin" on public.ec2_user_roles;

create table if not exists public.ec2_backup_runs (
  id bigserial primary key,
  requested_by uuid references auth.users (id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'running', 'success', 'failed')),
  provider text not null default 'gdrive',
  period_key text,
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.ec2_backup_runs enable row level security;

drop trigger if exists ec2_backup_runs_audit_tg on public.ec2_backup_runs;
create trigger ec2_backup_runs_audit_tg
before insert or update on public.ec2_backup_runs
for each row
execute function public.ec2_set_audit_fields();

drop policy if exists "ec2_backup_runs_select_role_scoped" on public.ec2_backup_runs;
create policy "ec2_backup_runs_select_role_scoped"
on public.ec2_backup_runs
for select
using (
  deleted_at is null
  and (
    public.ec2_current_role() in ('admin'::public.ec2_app_role, 'contador'::public.ec2_app_role)
    or requested_by = auth.uid()
  )
);

drop policy if exists "ec2_backup_runs_insert_admin_contador" on public.ec2_backup_runs;
create policy "ec2_backup_runs_insert_admin_contador"
on public.ec2_backup_runs
for insert
with check (public.ec2_current_role() in ('admin'::public.ec2_app_role, 'contador'::public.ec2_app_role));

drop policy if exists "ec2_backup_runs_update_admin" on public.ec2_backup_runs;
create policy "ec2_backup_runs_update_admin"
on public.ec2_backup_runs
for update
using (public.ec2_current_role() = 'admin'::public.ec2_app_role)
with check (public.ec2_current_role() = 'admin'::public.ec2_app_role);

drop policy if exists "ec2_backup_runs_delete_admin" on public.ec2_backup_runs;

create or replace function public.ec2_queue_weekly_backup(p_period_key text default null)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  if public.ec2_current_role() not in ('admin'::public.ec2_app_role, 'contador'::public.ec2_app_role) then
    raise exception 'not authorized';
  end if;

  insert into public.ec2_backup_runs (requested_by, status, provider, period_key, summary)
  values (auth.uid(), 'queued', 'gdrive', p_period_key, '{}'::jsonb)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.ec2_queue_weekly_backup(text) from public;
grant execute on function public.ec2_queue_weekly_backup(text) to authenticated;

create table if not exists public.ec2_backup_notifications (
  id bigserial primary key,
  backup_run_id bigint not null references public.ec2_backup_runs (id) on delete cascade,
  channel text not null default 'email' check (channel in ('email')),
  destination text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.ec2_backup_notifications enable row level security;

drop trigger if exists ec2_backup_notifications_audit_tg on public.ec2_backup_notifications;
create trigger ec2_backup_notifications_audit_tg
before insert or update on public.ec2_backup_notifications
for each row
execute function public.ec2_set_audit_fields();

drop policy if exists "ec2_backup_notifications_select_admin" on public.ec2_backup_notifications;
create policy "ec2_backup_notifications_select_admin"
on public.ec2_backup_notifications
for select
using (
  deleted_at is null
  and public.ec2_current_role() = 'admin'::public.ec2_app_role
);

drop policy if exists "ec2_backup_notifications_insert_admin" on public.ec2_backup_notifications;
create policy "ec2_backup_notifications_insert_admin"
on public.ec2_backup_notifications
for insert
with check (public.ec2_current_role() = 'admin'::public.ec2_app_role);

drop policy if exists "ec2_backup_notifications_update_admin" on public.ec2_backup_notifications;
create policy "ec2_backup_notifications_update_admin"
on public.ec2_backup_notifications
for update
using (public.ec2_current_role() = 'admin'::public.ec2_app_role)
with check (public.ec2_current_role() = 'admin'::public.ec2_app_role);

drop policy if exists "ec2_backup_notifications_delete_admin" on public.ec2_backup_notifications;
