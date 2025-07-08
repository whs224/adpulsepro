-- Give admin account unlimited credits
INSERT INTO public.user_credits (
  user_id,
  total_credits,
  used_credits,
  plan_name,
  max_team_members,
  is_active,
  billing_cycle_start,
  billing_cycle_end
) VALUES (
  '79565d18-33ce-461a-b23f-03ec6ea9d6d5',
  999999999,
  0,
  'admin_unlimited',
  999,
  true,
  now(),
  now() + interval '100 years'
) ON CONFLICT (user_id) DO UPDATE SET
  total_credits = 999999999,
  used_credits = 0,
  plan_name = 'admin_unlimited',
  max_team_members = 999,
  is_active = true,
  billing_cycle_start = now(),
  billing_cycle_end = now() + interval '100 years',
  updated_at = now();