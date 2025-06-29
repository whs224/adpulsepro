import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Users, 
  Calendar,
  RefreshCw,
  Loader2,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AdMetrics {
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversion_rate: number;
  revenue: number;
  roas: number;
  date_range: string;
}

interface PlatformData {
  platform: string;
  account_name: string;
  is_connected: boolean;
  last_sync?: string;
  metrics?: AdMetrics;
}

const AdDataDashboard = () => {
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPlatformData();
    }
  }, [user]);

  const loadPlatformData = async () => {
    try {
      setLoading(true);
      
      // Get connected ad accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('ad_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (accountsError) {
        console.error('Error loading accounts:', accountsError);
        throw accountsError;
      }

      // Get campaign data for metrics
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaign_data')
        .select('*')
        .eq('user_id', user?.id)
        .order('fetched_at', { ascending: false })
        .limit(100);

      if (campaignsError) {
        console.error('Error loading campaigns:', campaignsError);
        throw campaignsError;
      }

      // Process platform data
      const platforms = ['google_ads', 'meta_ads', 'tiktok_ads', 'linkedin_ads'];
      const platformDataMap = platforms.map(platform => {
        const account = accounts?.find(acc => acc.platform === platform);
        const platformCampaigns = campaigns?.filter(camp => camp.platform === platform) || [];
        
        // Calculate aggregated metrics
        const metrics = calculateAggregatedMetrics(platformCampaigns);
        
        return {
          platform,
          account_name: account?.account_name || 'Not Connected',
          is_connected: !!account,
          last_sync: account?.connected_at,
          metrics
        };
      });

      setPlatformData(platformDataMap);
    } catch (error: unknown) {
      console.error('Error loading platform data:', error);
      toast({
        title: "Error",
        description: "Failed to load ad data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAggregatedMetrics = (campaigns: unknown[]): AdMetrics | undefined => {
    if (campaigns.length === 0) return undefined;

    interface CampaignMetrics {
      spend?: number;
      impressions?: number;
      clicks?: number;
      conversions?: number;
      revenue?: number;
    }

    const totalMetrics = campaigns.reduce((acc: { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }, campaign) => {
      const metrics = (campaign as { metrics?: CampaignMetrics })?.metrics || {};
      return {
        spend: acc.spend + (metrics.spend || 0),
        impressions: acc.impressions + (metrics.impressions || 0),
        clicks: acc.clicks + (metrics.clicks || 0),
        conversions: acc.conversions + (metrics.conversions || 0),
        revenue: acc.revenue + (metrics.revenue || 0)
      };
    }, { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 });

    const ctr = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;
    const cpc = totalMetrics.clicks > 0 ? totalMetrics.spend / totalMetrics.clicks : 0;
    const conversion_rate = totalMetrics.clicks > 0 ? (totalMetrics.conversions / totalMetrics.clicks) * 100 : 0;
    const roas = totalMetrics.spend > 0 ? totalMetrics.revenue / totalMetrics.spend : 0;

    return {
      platform: (campaigns[0] as { platform?: string })?.platform || '',
      spend: totalMetrics.spend,
      impressions: totalMetrics.impressions,
      clicks: totalMetrics.clicks,
      ctr,
      cpc,
      conversions: totalMetrics.conversions,
      conversion_rate,
      revenue: totalMetrics.revenue,
      roas,
      date_range: 'Last 30 days'
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlatformData();
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Your ad data has been updated.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const getPlatformDisplayName = (platform: string) => {
    const names: Record<string, string> = {
      google_ads: 'Google Ads',
      meta_ads: 'Meta Ads',
      tiktok_ads: 'TikTok Ads',
      linkedin_ads: 'LinkedIn Ads'
    };
    return names[platform] || platform;
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      google_ads: 'text-red-600',
      meta_ads: 'text-blue-600',
      tiktok_ads: 'text-gray-800',
      linkedin_ads: 'text-blue-700'
    };
    return colors[platform] || 'text-gray-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading ad data...</span>
        </CardContent>
      </Card>
    );
  }

  const connectedPlatforms = platformData.filter(p => p.is_connected);
  const hasData = connectedPlatforms.some(p => p.metrics);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ad Performance Dashboard
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Overview of your connected ad accounts and performance metrics
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {connectedPlatforms.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ad Accounts Connected</h3>
            <p className="text-gray-600 mb-4">
              Connect your advertising accounts to see performance data here
            </p>
            <Button variant="outline">
              Connect Accounts
            </Button>
          </div>
        ) : !hasData ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              Your connected accounts don't have recent campaign data. Data will appear here once campaigns are active.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="platforms">By Platform</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Overall Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  const totalMetrics = connectedPlatforms
                    .filter(p => p.metrics)
                    .reduce((acc, platform) => {
                      const metrics = platform.metrics!;
                      return {
                        spend: acc.spend + metrics.spend,
                        impressions: acc.impressions + metrics.impressions,
                        clicks: acc.clicks + metrics.clicks,
                        conversions: acc.conversions + metrics.conversions,
                        revenue: acc.revenue + metrics.revenue
                      };
                    }, { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 });

                  const totalCtr = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;
                  const totalCpc = totalMetrics.clicks > 0 ? totalMetrics.spend / totalMetrics.clicks : 0;
                  const totalRoas = totalMetrics.spend > 0 ? totalMetrics.revenue / totalMetrics.spend : 0;

                  return (
                    <>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Spend</p>
                              <p className="text-2xl font-bold">{formatCurrency(totalMetrics.spend)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Impressions</p>
                              <p className="text-2xl font-bold">{formatNumber(totalMetrics.impressions)}</p>
                            </div>
                            <Eye className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">CTR</p>
                              <p className="text-2xl font-bold">{formatPercentage(totalCtr)}</p>
                            </div>
                            <MousePointer className="h-8 w-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">ROAS</p>
                              <p className="text-2xl font-bold">{totalRoas.toFixed(2)}x</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>
            </TabsContent>

            <TabsContent value="platforms" className="space-y-4">
              {connectedPlatforms.map((platform) => (
                <Card key={platform.platform}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold ${getPlatformColor(platform.platform)}`}>
                          {getPlatformDisplayName(platform.platform)}
                        </h3>
                        <Badge variant="secondary">
                          {platform.account_name}
                        </Badge>
                      </div>
                      {platform.last_sync && (
                        <span className="text-sm text-gray-500">
                          Last sync: {new Date(platform.last_sync).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {platform.metrics ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Spend</p>
                          <p className="text-lg font-semibold">{formatCurrency(platform.metrics.spend)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Impressions</p>
                          <p className="text-lg font-semibold">{formatNumber(platform.metrics.impressions)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">CTR</p>
                          <p className="text-lg font-semibold">{formatPercentage(platform.metrics.ctr)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ROAS</p>
                          <p className="text-lg font-semibold">{platform.metrics.roas.toFixed(2)}x</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No recent data available for this platform
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AdDataDashboard; 