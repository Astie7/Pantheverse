-- Run this in Supabase SQL Editor
-- 1) Creates rules + editors tables
-- 2) Applies RLS so everyone can read rules, only approved editors can write

create extension if not exists pgcrypto;

create table if not exists public.rules (
    id uuid primary key default gen_random_uuid(),
    position integer not null unique check (position > 0),
    text text not null check (char_length(btrim(text)) between 4 and 500),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.editors (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
    setting_key text primary key,
    setting_value text not null,
    updated_at timestamptz not null default now()
);

create table if not exists public.site_events (
    id bigint generated always as identity primary key,
    event_type text not null check (event_type in ('page_view', 'nav_click', 'discord_click')),
    page_path text not null,
    target_path text,
    href text,
    referrer text,
    created_at timestamptz not null default now()
);

create table if not exists public.rule_audit (
    id bigint generated always as identity primary key,
    rule_id uuid,
    action text not null check (action in ('insert', 'update', 'delete')),
    old_text text,
    new_text text,
    old_position integer,
    new_position integer,
    actor_id uuid,
    changed_at timestamptz not null default now()
);

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'rules_position_positive'
          and conrelid = 'public.rules'::regclass
    ) then
        alter table public.rules
            add constraint rules_position_positive check (position > 0);
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'rules_text_length_guard'
          and conrelid = 'public.rules'::regclass
    ) then
        alter table public.rules
            add constraint rules_text_length_guard check (char_length(btrim(text)) between 4 and 500);
    end if;
end;
$$;

create index if not exists rules_position_idx on public.rules(position);
create index if not exists rules_updated_at_idx on public.rules(updated_at desc);
create unique index if not exists rules_text_unique_idx on public.rules ((lower(btrim(text))));
create index if not exists site_events_created_at_idx on public.site_events(created_at desc);
create index if not exists site_events_event_type_idx on public.site_events(event_type);
create index if not exists rule_audit_changed_at_idx on public.rule_audit(changed_at desc);
create index if not exists rule_audit_rule_id_idx on public.rule_audit(rule_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.audit_rule_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        insert into public.rule_audit (rule_id, action, new_text, new_position, actor_id)
        values (new.id, 'insert', new.text, new.position, auth.uid());
        return new;
    end if;

    if tg_op = 'UPDATE' then
        insert into public.rule_audit (rule_id, action, old_text, new_text, old_position, new_position, actor_id)
        values (new.id, 'update', old.text, new.text, old.position, new.position, auth.uid());
        return new;
    end if;

    if tg_op = 'DELETE' then
        insert into public.rule_audit (rule_id, action, old_text, old_position, actor_id)
        values (old.id, 'delete', old.text, old.position, auth.uid());
        return old;
    end if;

    return null;
end;
$$;

create or replace function public.reorder_rules(rule_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.uid() is null then
        raise exception 'not authenticated';
    end if;

    if not exists (
        select 1 from public.editors e where e.user_id = auth.uid()
    ) then
        raise exception 'editor access required';
    end if;

    update public.rules r
    set position = array_length(rule_ids, 1) + 1000 + r.position
    where r.id = any(rule_ids);

    with ord as (
        select * from unnest(rule_ids) with ordinality as t(id, pos)
    )
    update public.rules r
    set position = ord.pos::integer
    from ord
    where r.id = ord.id;
end;
$$;

revoke all on function public.reorder_rules(uuid[]) from public;
grant execute on function public.reorder_rules(uuid[]) to authenticated;

drop trigger if exists trg_rules_updated_at on public.rules;
create trigger trg_rules_updated_at
before update on public.rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_rules_audit on public.rules;
create trigger trg_rules_audit
after insert or update or delete on public.rules
for each row execute function public.audit_rule_changes();

alter table public.rules enable row level security;
alter table public.editors enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_events enable row level security;
alter table public.rule_audit enable row level security;

drop policy if exists "rules_read_public" on public.rules;
create policy "rules_read_public"
on public.rules
for select
using (true);

drop policy if exists "rules_write_editors" on public.rules;
create policy "rules_write_editors"
on public.rules
for all
using (
    exists (
        select 1
        from public.editors e
        where e.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.editors e
        where e.user_id = auth.uid()
    )
);

drop policy if exists "editors_self_read" on public.editors;
create policy "editors_self_read"
on public.editors
for select
using (user_id = auth.uid());

drop policy if exists "editors_no_client_write" on public.editors;
create policy "editors_no_client_write"
on public.editors
for all
using (false)
with check (false);

drop policy if exists "site_settings_read_public" on public.site_settings;
create policy "site_settings_read_public"
on public.site_settings
for select
using (true);

drop policy if exists "site_settings_write_editors" on public.site_settings;
create policy "site_settings_write_editors"
on public.site_settings
for all
using (
    exists (
        select 1 from public.editors e where e.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1 from public.editors e where e.user_id = auth.uid()
    )
);

drop policy if exists "site_events_insert_public" on public.site_events;
create policy "site_events_insert_public"
on public.site_events
for insert
with check (true);

drop policy if exists "site_events_read_editors" on public.site_events;
create policy "site_events_read_editors"
on public.site_events
for select
using (
    exists (
        select 1 from public.editors e where e.user_id = auth.uid()
    )
);

drop policy if exists "rule_audit_read_editors" on public.rule_audit;
create policy "rule_audit_read_editors"
on public.rule_audit
for select
using (
    exists (
        select 1 from public.editors e where e.user_id = auth.uid()
    )
);

drop policy if exists "rule_audit_no_client_write" on public.rule_audit;
create policy "rule_audit_no_client_write"
on public.rule_audit
for all
using (false)
with check (false);

-- Seed default rules once
insert into public.rules (position, text)
values
    (1, 'NSFW is eternally forbidden and is never allowed in any form.'),
    (2, 'Racism, hate speech, or discrimination is forbidden across all realms.'),
    (3, 'Spamming is allowed only if it does not intentionally harm or break the server.'),
    (4, 'Advertising or promoting unrelated servers is forbidden.'),
    (5, 'Impersonation of members, bots, or entities is forbidden.'),
    (6, 'Malicious links, scams, or harmful content are forbidden.'),
    (7, 'Respect channel order and post content where it belongs.'),
    (8, 'Evading punishments or bypassing restrictions is forbidden.'),
    (9, 'Excessive disruption intended to ruin others experience is forbidden.'),
    (10, 'Alternate accounts used for abuse or evasion are forbidden.'),
    (11, 'Use reason and restraint. Loopholes do not grant immunity.')
on conflict (position) do nothing;

insert into public.site_settings (setting_key, setting_value)
values
    ('brand_name', 'Pantheverse'),
    ('home_hero_title', 'Find your orbit. Stay for the chaos.'),
    ('home_hero_subtitle', 'A vibrant corner of the internet where chill thinkers, late-night gamers, meme fiends, and lovable weirdos collide. Bring your whole self - the universe is big enough for every mood.'),
    ('footer_text', 'Pantheverse · Est. 2020 · Crafted by Astie & Andualem')
on conflict (setting_key) do nothing;

-- Add yourself as editor (replace with your auth.users id)
-- insert into public.editors (user_id) values ('00000000-0000-0000-0000-000000000000');

