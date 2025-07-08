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
);