
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, MessageCircle, BarChart3, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdAnalyticsChat from "@/components/AdAnalyticsChat";
import AdAccountConnector from "@/components/AdAccountConnector";

interface CampaignMetrics {
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      loadDashboardData();
    }
  }, [user, loading, navigate]);

  const loadDashboardData = async () => {
    try {
      // Load connected accounts
      const { data: accounts } = await supabase
        .from('ad_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      setConnectedAccounts(accounts || []);

      // Load recent campaign metrics
      const { data: campaigns } = await supabase
        .from('campaign_data')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date_range_start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('fetched_at', { ascending: false });

      if (campaigns && campaigns.length > 0) {
        const totalMetrics = campaigns.reduce((acc: CampaignMetrics, campaign: any) => {
          const metrics = (campaign.metrics as CampaignMetrics) || {};
          return {
            spend: (acc.spend || 0) + (metrics.spend || 0),
            impressions: (acc.impressions || 0) + (metrics.impressions || 0),
            clicks: (acc.clicks || 0) + (metrics.clicks || 0),
            conversions: (acc.conversions || 0) + (metrics.conversions || 0)
          };
        }, {} as CampaignMetrics);

        setRecentMetrics({
          ...totalMetrics,
          ctr: (totalMetrics.impressions || 0) > 0 ? ((totalMetrics.clicks || 0) / (totalMetrics.impressions || 0) * 100) : 0,
          cpc: (totalMetrics.clicks || 0) > 0 ? ((totalMetrics.spend || 0) / (totalMetrics.clicks || 0)) : 0,
          campaigns: campaigns.length
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600">
                Chat with AI to analyze your ad performance across all connected platforms
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Connected Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{connectedAccounts.length}</div>
                  <div className="flex gap-1 mt-2">
                    {connectedAccounts.slice(0, 3).map((account, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {account.platform.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Weekly Spend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${recentMetrics?.spend?.toFixed(0) || '0'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Active Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentMetrics?.campaigns || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {recentMetrics?.clicks || 0} clicks, {recentMetrics?.conversions || 0} conversions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Ready</div>
                  <p className="text-xs text-gray-500 mt-1">Ask any question below</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* AI Chat - Takes 2 columns */}
              <div className="xl:col-span-2">
                <AdAnalyticsChat />
              </div>

              {/* Account Management - Takes 1 column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Account Management
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/settings')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {connectedAccounts.length === 0 ? (
                        <div className="text-center py-6">
                          <div className="text-gray-400 mb-4">
                            <Plus className="h-12 w-12 mx-auto" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">No accounts connected</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Connect your ad accounts to start analyzing performance with AI
                          </p>
                          <Button onClick={() => navigate('/settings')}>
                            Connect Accounts
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-green-800">
                            ✅ {connectedAccounts.length} Connected Account{connectedAccounts.length !== 1 ? 's' : ''}
                          </h4>
                          <div className="space-y-2">
                            {connectedAccounts.map((account) => (
                              <div key={account.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                                <div>
                                  <div className="font-medium text-sm">
                                    {account.platform.replace('_', ' ')} 
                                  </div>
                                  <div className="text-xs text-gray-600">{account.account_name}</div>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => navigate('/settings')}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add More Accounts
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <strong>💡 Try asking:</strong>
                        <ul className="mt-2 space-y-1 text-gray-700">
                          <li>• "How did my ads perform last week?"</li>
                          <li>• "Which platform has the lowest CPC?"</li>
                          <li>• "Show me my top performing campaigns"</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <strong>🎯 Best practices:</strong>
                        <ul className="mt-2 space-y-1 text-gray-700">
                          <li>• Connect all your ad platforms</li>
                          <li>• Ask specific questions about metrics</li>
                          <li>• Compare performance across time periods</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
