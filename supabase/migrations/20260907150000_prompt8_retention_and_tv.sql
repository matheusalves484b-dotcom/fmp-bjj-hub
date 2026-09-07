create or replace view public.student_retention_status with (security_invoker = true) as
select sp.user_id, p.full_name, p.avatar_url, sp.status,
  max(a.class_date) as last_checkin_date,
  case when sp.status = 'ACTIVE' and (max(a.class_date) is null or max(a.class_date) < current_date - 14) then true else false end as at_risk,
  case when max(a.class_date) is null then null else (current_date - max(a.class_date)) end as days_since_checkin
from public.student_profiles sp join public.profiles p on p.id=sp.user_id left join public.attendances a on a.student_id=sp.user_id
where sp.status='ACTIVE' group by sp.user_id,p.full_name,p.avatar_url,sp.status;
grant select on public.student_retention_status to authenticated;

create or replace view public.monthly_birthday_students with (security_invoker = true) as
select sp.user_id,p.full_name,p.avatar_url,sp.birth_date,extract(day from sp.birth_date)::int as birthday_day
from public.student_profiles sp join public.profiles p on p.id=sp.user_id
where sp.status='ACTIVE' and sp.birth_date is not null and extract(month from sp.birth_date)=extract(month from current_date);
grant select on public.monthly_birthday_students to authenticated;

create or replace function public.get_public_today_checkins()
returns table(id uuid, student_id uuid, class_schedule_id uuid, class_date date, checked_in_at timestamptz, method text, full_name text, avatar_url text, class_name text, start_time time, room text)
language sql security definer set search_path=public,pg_temp
as $$ select a.id,a.student_id,a.class_schedule_id,a.class_date,a.checked_in_at,a.method::text,p.full_name,p.avatar_url,cs.name,cs.start_time,cs.room from public.attendances a join public.profiles p on p.id=a.student_id join public.class_schedules cs on cs.id=a.class_schedule_id where a.class_date=current_date order by a.checked_in_at desc; $$;
revoke all on function public.get_public_today_checkins() from public;
grant execute on function public.get_public_today_checkins() to anon,authenticated;
