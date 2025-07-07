-- Remove the automatic starter subscription initialization
DROP TRIGGER IF EXISTS initialize_user_credits_trigger ON auth.users;

-- Update the initialize_user_credits function to not give any credits by default
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- No automatic credits - users must pay to get a subscription
  -- This function is kept for potential future use but doesn't insert any credits
  RETURN NEW;
END;
$$;

-- Update existing users who have starter plan to have no active subscription
UPDATE public.user_credits 
SET is_active = false, 
    plan_name = 'none',
    total_credits = 0,
    used_credits = 0,
    max_team_members = 0
WHERE plan_name = 'starter' AND is_active = true;