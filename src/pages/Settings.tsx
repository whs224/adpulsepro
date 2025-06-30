import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdAccountConnector from "@/components/AdAccountConnector";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    goals: ''
  });

  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTeam();
      loadPlan();
    }
  }, [user]);

  const loadPlan = async () => {
    const { data, error } = await supabase
      .from('user_credits')
      .select('plan_name')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();
    if (data) setPlanName(data.plan_name);
  };

  const loadTeam = async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .or(`team_owner_id.eq.${user.id},member_user_id.eq.${user.id}`);
    if (data) setTeamMembers(data);
  };

  const handleInvite = async () => {
    setInviteLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_owner_id: user.id,
          member_email: inviteEmail,
          member_user_id: '',
          is_active: false
        });
      if (error) throw error;
      toast({ title: "Invite Sent", description: `Invitation sent to ${inviteEmail}` });
      setInviteEmail("");
      loadTeam();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setInviteLoading(false);
    }
  };

  const kpiOptions = [
    { id: 'total_spend', label: 'Total Spend', description: 'Track total budget across campaigns' },
    { id: 'impressions', label: 'Impressions', description: 'Measure reach and visibility' },
    { id: 'clicks', label: 'Clicks', description: 'Track user engagement' },
    { id: 'ctr', label: 'Click-Through Rate (CTR)', description: 'Measure ad effectiveness' },
    { id: 'cpc', label: 'Cost Per Click (CPC)', description: 'Average cost per click' },
    { id: 'conversions', label: 'Conversions', description: 'Track desired actions' },
    { id: 'cvr', label: 'Conversion Rate (CVR)', description: 'Percentage of clicks that convert' },
    { id: 'cpa', label: 'Cost Per Acquisition (CPA)', description: 'Cost to acquire customers' },
    { id: 'roas', label: 'Return on Ad Spend (ROAS)', description: 'Measure profitability' }
  ];

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          phone: profileData.phone
        }
      });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleKPIToggle = (kpiId: string) => {
    setSelectedKPIs(prev => 
      prev.includes(kpiId) 
        ? prev.filter(id => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Settings</h1>
              <p className="text-lg text-gray-600">Manage your account and configure AdPulse preferences</p>
            </div>

            <div className="grid gap-8">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getUserInitials(user?.user_metadata?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-gray-500">(optional)</span></Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">Business Goals <span className="text-gray-500">(optional)</span></Label>
                    <Textarea
                      id="goals"
                      value={profileData.goals}
                      onChange={(e) => setProfileData(prev => ({ ...prev, goals: e.target.value }))}
                      placeholder="Describe your advertising goals and what you'd like to achieve..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleProfileUpdate} disabled={loading}>
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                    <Button variant="outline" onClick={handlePasswordReset}>
                      Reset Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Connected Accounts - Use new component */}
              <AdAccountConnector />

              {/* KPI Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>KPI Preferences</CardTitle>
                  <p className="text-sm text-gray-600">Select the metrics that matter most to your business</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kpiOptions.map((kpi) => (
                      <div key={kpi.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={kpi.id}
                          checked={selectedKPIs.includes(kpi.id)}
                          onCheckedChange={() => handleKPIToggle(kpi.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={kpi.id} className="font-semibold cursor-pointer">
                            {kpi.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedKPIs.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Selected KPIs ({selectedKPIs.length})</h4>
                      <p className="text-sm text-blue-800">
                        Your reports will focus on these metrics to provide the most relevant insights for your business.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Management Section */}
              {(planName === 'growth' || planName === 'scale') && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Label htmlFor="inviteEmail">Invite Team Member (email)</Label>
                      <div className="flex gap-2 mt-2">
                        <Input id="inviteEmail" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@email.com" />
                        <Button onClick={handleInvite} disabled={inviteLoading || !inviteEmail}>
                          {inviteLoading ? 'Inviting...' : 'Invite'}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Current Team Members</h4>
                      <ul className="space-y-2">
                        {teamMembers.length === 0 && <li className="text-gray-500">No team members yet.</li>}
                        {teamMembers.map(member => (
                          <li key={member.id} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6"><AvatarFallback>{member.member_email[0]}</AvatarFallback></Avatar>
                            <span>{member.member_email}</span>
                            <span className="text-xs text-gray-400">{member.role}</span>
                            {member.member_user_id === user.id && <span className="text-xs text-blue-600">(You)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
