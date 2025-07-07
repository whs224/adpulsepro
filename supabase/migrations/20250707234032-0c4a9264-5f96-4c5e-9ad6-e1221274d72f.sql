-- Fix the accept_team_invite_on_signup function to handle empty strings properly
CREATE OR REPLACE FUNCTION public.accept_team_invite_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.team_members
  SET member_user_id = NEW.id,
      is_active = true,
      joined_at = now()
  WHERE member_email = NEW.email
    AND (member_user_id IS NULL OR member_user_id::text = '')
    AND is_active = false;
  RETURN NEW;
END;
$$;

-- Update any existing records that have empty string UUIDs to NULL
UPDATE public.team_members 
SET member_user_id = NULL 
WHERE member_user_id::text = '';

-- Add a constraint to prevent empty string UUIDs in the future
ALTER TABLE public.team_members 
ADD CONSTRAINT check_member_user_id_not_empty 
CHECK (member_user_id IS NULL OR member_user_id::text != '');