
import { supabase } from "@/integrations/supabase/client";
import { fetchGoogleAdsData, fetchMetaAdsData, storeCampaignData, getUserCampaignData } from "./adDataService";
import { analyzeWithOpenAI } from "./aiAnalysisService";

export interface AdAccount {
  id: string;
  platform: string;
  account_id: string;
  account_name: string;
  access_token: string;
  is_active: boolean;
}

export const fetchAllUserData = async (dateRange: { start: string; end: string }) => {
  console.log('Starting data orchestration...', dateRange);
  
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  // First try to fetch fresh data from connected accounts using edge function
  try {
    const { data, error } = await supabase.functions.invoke('fetch-campaign-data', {
      body: { dateRange }
    });

    if (error) {
      console.error('Error fetching fresh campaign data:', error);
      throw error;
    }

    if (data && data.campaigns && data.campaigns.length > 0) {
      console.log(`Fetched ${data.campaigns.length} fresh campaigns`);
      return {
        campaigns: data.campaigns,
        analysis: await getLatestAnalysis(user.user.id, dateRange),
        connectedAccounts: data.connectedAccounts || 0
      };
    }
  } catch (error) {
    console.error('Fresh data fetch failed, falling back to stored data:', error);
  }

  // Fallback to stored data if fresh fetch fails
  return await getStoredUserData(dateRange);
};

const getLatestAnalysis = async (userId: string, dateRange: { start: string; end: string }) => {
  const { data: analysis } = await supabase
    .from('ai_analysis')
    .select('*')
    .eq('user_id', userId)
    .eq('date_range_start', dateRange.start)
    .eq('date_range_end', dateRange.end)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return analysis ? {
    insights: analysis.ai_insights,
    recommendations: analysis.recommendations,
    keyMetrics: calculateKeyMetrics(Array.isArray(analysis.raw_data) ? analysis.raw_data : [])
  } : null;
};

export const getStoredUserData = async (dateRange: { start: string; end: string }) => {
  // Try to get stored data first (faster for repeat requests)
  const campaignData = await getUserCampaignData(dateRange);
  
  if (!campaignData || campaignData.length === 0) {
    // No stored data, try to fetch fresh
    try {
      return await fetchAllUserData(dateRange);
    } catch (error) {
      console.error('No data available:', error);
      throw new Error('No campaign data available. Please connect your ad accounts and try again.');
    }
  }

  // Get stored analysis
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const analysis = await getLatestAnalysis(user.user.id, dateRange);

  return {
    campaigns: campaignData,
    analysis: analysis || {
      insights: null,
      recommendations: [],
      keyMetrics: calculateKeyMetrics(campaignData)
    },
    connectedAccounts: [...new Set(campaignData.map(c => c.ad_accounts.platform))].length
  };
};

export const syncCampaignData = async (dateRange?: { start: string; end: string }) => {
  const defaultDateRange = dateRange || {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  };

  try {
    console.log('Syncing campaign data for date range:', defaultDateRange);
    
    const { data, error } = await supabase.functions.invoke('fetch-campaign-data', {
      body: { dateRange: defaultDateRange }
    });

    if (error) {
      console.error('Error syncing campaign data:', error);
      throw error;
    }

    console.log('Campaign data synced successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to sync campaign data:', error);
    throw error;
  }
};

const calculateKeyMetrics = (campaignData: any[]) => {
  const totals = campaignData.reduce((acc, campaign) => {
    const metrics = campaign.metrics;
    return {
      spend: acc.spend + metrics.spend,
      impressions: acc.impressions + metrics.impressions,
      clicks: acc.clicks + metrics.clicks,
      conversions: acc.conversions + metrics.conversions
    };
  }, { spend: 0, impressions: 0, clicks: 0, conversions: 0 });

  return {
    totalSpend: totals.spend,
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalConversions: totals.conversions,
    avgCTR: Number((totals.clicks / totals.impressions * 100).toFixed(2)),
    avgCPC: Number((totals.spend / totals.clicks).toFixed(2)),
    avgCPA: Number((totals.spend / totals.conversions).toFixed(2)),
    avgROAS: Number(((totals.conversions * 50) / totals.spend).toFixed(1)) // Assume $50 avg order value
  };
};
