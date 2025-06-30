import { supabase } from "@/integrations/supabase/client";

export interface UserCredits {
  id: string;
  user_id: string;
  plan_name: string;
  total_credits: number;
  used_credits: number;
  max_team_members: number;
  billing_cycle_start: string;
  billing_cycle_end: string;
  is_active: boolean;
  remaining_credits: number;
}

export const getUserCredits = async (): Promise<UserCredits | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {
      id: '',
      user_id: '',
      plan_name: 'none',
      total_credits: 0,
      used_credits: 0,
      max_team_members: 0,
      billing_cycle_start: '',
      billing_cycle_end: '',
      is_active: false,
      remaining_credits: 0
    };

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return {
        id: '',
        user_id: user.id,
        plan_name: 'none',
        total_credits: 0,
        used_credits: 0,
        max_team_members: 0,
        billing_cycle_start: '',
        billing_cycle_end: '',
        is_active: false,
        remaining_credits: 0
      };
    }

    return {
      ...data,
      remaining_credits: data.total_credits - data.used_credits
    };
  } catch (error) {
    console.error('Error in getUserCredits:', error);
    return {
      id: '',
      user_id: '',
      plan_name: 'none',
      total_credits: 0,
      used_credits: 0,
      max_team_members: 0,
      billing_cycle_start: '',
      billing_cycle_end: '',
      is_active: false,
      remaining_credits: 0
    };
  }
};

export const checkAndUseCredit = async (message: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc('use_credit', {
      p_user_id: user.id,
      p_message: message
    });

    if (error) {
      console.error('Error using credit:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Error in checkAndUseCredit:', error);
    return false;
  }
};

export const getCreditUsageHistory = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('credit_usage_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching credit usage:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getCreditUsageHistory:', error);
    return [];
  }
};
