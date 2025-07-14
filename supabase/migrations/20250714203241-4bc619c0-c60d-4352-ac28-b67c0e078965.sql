-- Add test credits for the current user
INSERT INTO public.user_credits (
    user_id,
    total_credits,
    used_credits,
    plan_name,
    billing_cycle_start,
    billing_cycle_end,
    is_active
) VALUES (
    auth.uid(),
    100,
    0,
    'test',
    now(),
    now() + interval '1 month',
    true
) ON CONFLICT (user_id) DO UPDATE SET
    total_credits = 100,
    used_credits = 0,
    plan_name = 'test',
    billing_cycle_start = now(),
    billing_cycle_end = now() + interval '1 month',
    is_active = true;