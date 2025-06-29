
-- Create user_credits table to track message credits and usage
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'starter',
  total_credits INTEGER NOT NULL DEFAULT 100,
  used_credits INTEGER NOT NULL DEFAULT 0,
  max_team_members INTEGER NOT NULL DEFAULT 1,
  billing_cycle_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  billing_cycle_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 month'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_members table to manage team access
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'member'
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ,
  UNIQUE(team_owner_id, member_user_id)
);

-- Create credit_usage_log table to track AI message usage
CREATE TABLE public.credit_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits" ON public.user_credits
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own credits" ON public.user_credits
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all credits" ON public.user_credits
FOR ALL USING (true);

-- RLS policies for team_members
CREATE POLICY "Team owners can manage their team" ON public.team_members
FOR ALL USING (team_owner_id = auth.uid());

CREATE POLICY "Team members can view their team info" ON public.team_members
FOR SELECT USING (member_user_id = auth.uid() OR team_owner_id = auth.uid());

-- RLS policies for credit_usage_log
CREATE POLICY "Users can view their own usage" ON public.credit_usage_log
FOR SELECT USING (user_id = auth.uid() OR team_owner_id = auth.uid());

CREATE POLICY "Service role can log usage" ON public.credit_usage_log
FOR INSERT WITH CHECK (true);

-- Function to initialize user credits on signup
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, plan_name, total_credits, max_team_members)
  VALUES (NEW.id, 'starter', 100, 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize credits for new users
CREATE OR REPLACE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();

-- Function to check and deduct credits
CREATE OR REPLACE FUNCTION public.use_credit(p_user_id UUID, p_message TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
  team_owner_id UUID;
BEGIN
  -- Check if user is a team member, get the team owner's credits
  SELECT tm.team_owner_id INTO team_owner_id
  FROM public.team_members tm
  WHERE tm.member_user_id = p_user_id AND tm.is_active = true;
  
  -- If not a team member, use own credits
  IF team_owner_id IS NULL THEN
    team_owner_id := p_user_id;
  END IF;
  
  -- Get current available credits
  SELECT (total_credits - used_credits) INTO current_credits
  FROM public.user_credits
  WHERE user_id = team_owner_id 
  AND is_active = true
  AND billing_cycle_end > now();
  
  -- Check if credits are available
  IF current_credits IS NULL OR current_credits < 1 THEN
    RETURN false;
  END IF;
  
  -- Deduct credit
  UPDATE public.user_credits
  SET used_credits = used_credits + 1,
      updated_at = now()
  WHERE user_id = team_owner_id;
  
  -- Log usage
  INSERT INTO public.credit_usage_log (user_id, team_owner_id, message_content, credits_used)
  VALUES (p_user_id, team_owner_id, p_message, 1);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
