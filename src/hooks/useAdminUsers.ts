import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminUser {
  user_id: string;
  plan_name: string;
  total_credits: number;
  used_credits: number;
  is_active: boolean;
  full_name: string;
  user_email: string;
}

export const useAdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creditEdit, setCreditEdit] = useState<{ [userId: string]: number }>({});
  const [planEdit, setPlanEdit] = useState<{ [userId: string]: string }>({});

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Get user credits first
      const { data: userCreditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, plan_name, total_credits, used_credits, is_active');
      
      if (creditsError) {
        console.error('Error loading user credits:', creditsError);
        toast({ title: 'Error loading user credits', description: creditsError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Get profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Get user details from edge function
      const userIds = userCreditsData?.map(uc => uc.user_id) || [];
      
      let userDetailsMap = new Map();
      if (userIds.length > 0) {
        try {
          const { data: userDetailsResponse, error: userDetailsError } = await supabase.functions.invoke('fetch-user-details', {
            body: { userIds }
          });

          if (userDetailsError) {
            console.error('Error fetching user details:', userDetailsError);
          } else {
            userDetailsResponse?.userDetails?.forEach((detail: any) => {
              userDetailsMap.set(detail.user_id, detail);
            });
          }
        } catch (error) {
          console.error('Error calling fetch-user-details function:', error);
        }
      }

      // Combine all data
      const usersWithData = userCreditsData?.map((userCredit) => {
        const profile = profilesData?.find(p => p.id === userCredit.user_id);
        const userDetails = userDetailsMap.get(userCredit.user_id);
        
        return {
          ...userCredit,
          full_name: userDetails?.full_name || profile?.full_name || 'No name',
          user_email: userDetails?.email || 'No email'
        };
      }) || [];

      console.log('Users with data:', usersWithData);
      setUsers(usersWithData);
    } catch (error) {
      console.error('Error in loadUsers:', error);
      toast({ title: 'Error loading users', description: 'Failed to load user data', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCreditChange = (userId: string, value: number) => {
    setCreditEdit(prev => ({ ...prev, [userId]: value }));
  };

  const handlePlanChange = (userId: string, value: string) => {
    setPlanEdit(prev => ({ ...prev, [userId]: value }));
  };

  const updateCredits = async (userId: string) => {
    setLoading(true);
    try {
      const credits = creditEdit[userId];
      
      if (credits === undefined || credits < 0) {
        toast({ title: 'Invalid credits value', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('user_credits')
        .update({ 
          total_credits: credits,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating credits:', error);
        toast({ title: 'Failed to update credits', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Credits updated successfully' });
        // Clear the edit state for this user
        setCreditEdit(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
        await loadUsers();
      }
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({ title: 'Failed to update credits', variant: 'destructive' });
    }
    setLoading(false);
  };

  const updatePlan = async (userId: string) => {
    setLoading(true);
    try {
      const plan = planEdit[userId];
      
      if (!plan || plan.trim() === '') {
        toast({ title: 'Plan name cannot be empty', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('user_credits')
        .update({ 
          plan_name: plan.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating plan:', error);
        toast({ title: 'Failed to update plan', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Plan updated successfully' });
        // Clear the edit state for this user
        setPlanEdit(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
        await loadUsers();
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({ title: 'Failed to update plan', variant: 'destructive' });
    }
    setLoading(false);
  };

  const deleteUser = async (userId: string) => {
    setLoading(true);
    try {
      // Delete auth user first using admin client
      const { error: deleteAuthError } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError);
        toast({ title: 'Failed to delete auth user', description: deleteAuthError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      toast({ title: 'User deleted successfully' });
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: 'Failed to delete user', variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const giveCreditsToUser = async (userId: string, credits: number) => {
    setLoading(true);
    try {
      if (credits <= 0) {
        toast({ title: 'Credits must be greater than 0', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Check if user already has any credits (active or inactive)
      const { data: existingCredits } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingCredits) {
        // Update existing credits and make them active
        const { error } = await supabase
          .from('user_credits')
          .update({ 
            total_credits: existingCredits.total_credits + credits,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating credits:', error);
          toast({ title: 'Failed to add credits', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: `Successfully added ${credits} credits to user` });
          await loadUsers();
        }
      } else {
        // Create new credit record for new user
        const { error } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            plan_name: 'admin_given',
            total_credits: credits,
            used_credits: 0,
            max_team_members: 1,
            billing_cycle_start: new Date().toISOString(),
            billing_cycle_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            is_active: true
          });

        if (error) {
          console.error('Error creating credits:', error);
          toast({ title: 'Failed to give credits', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: `Successfully gave ${credits} credits to user` });
          await loadUsers();
        }
      }
    } catch (error) {
      console.error('Error giving credits:', error);
      toast({ title: 'Failed to give credits', variant: 'destructive' });
    }
    setLoading(false);
  };

  return {
    users,
    loading,
    creditEdit,
    planEdit,
    loadUsers,
    handleCreditChange,
    handlePlanChange,
    updateCredits,
    updatePlan,
    deleteUser,
    giveCreditsToUser
  };
};