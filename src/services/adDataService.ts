
import { supabase } from "@/integrations/supabase/client";

export interface CampaignMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export interface CampaignData {
  campaignId: string;
  campaignName: string;
  platform: string;
  metrics: CampaignMetrics;
  dateRange: {
    start: string;
    end: string;
  };
}

// Mock data fetching - in production, these would call actual APIs
export const fetchGoogleAdsData = async (accessToken: string, accountId: string, dateRange: { start: string; end: string }): Promise<CampaignData[]> => {
  console.log('Fetching Google Ads data...', { accountId, dateRange });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock realistic data
  return [
    {
      campaignId: 'gad_001',
      campaignName: 'Search Campaign - Brand Keywords',
      platform: 'google_ads',
      dateRange,
      metrics: {
        spend: 2340.50,
        impressions: 45600,
        clicks: 1276,
        conversions: 68,
        ctr: 2.8,
        cpc: 1.83,
        cpa: 34.42,
        roas: 3.2
      }
    },
    {
      campaignId: 'gad_002',
      campaignName: 'Shopping Campaign - Electronics',
      platform: 'google_ads',
      dateRange,
      metrics: {
        spend: 1245.75,
        impressions: 18900,
        clicks: 794,
        conversions: 38,
        ctr: 4.2,
        cpc: 1.57,
        cpa: 32.78,
        roas: 4.1
      }
    }
  ];
};

export const fetchMetaAdsData = async (accessToken: string, accountId: string, dateRange: { start: string; end: string }): Promise<CampaignData[]> => {
  console.log('Fetching Meta Ads data...', { accountId, dateRange });
  
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return [
    {
      campaignId: 'meta_001',
      campaignName: 'Brand Awareness - Lookalike Audience',
      platform: 'meta_ads',
      dateRange,
      metrics: {
        spend: 1890.25,
        impressions: 38200,
        clicks: 1184,
        conversions: 52,
        ctr: 3.1,
        cpc: 1.60,
        cpa: 36.35,
        roas: 2.9
      }
    },
    {
      campaignId: 'meta_002',
      campaignName: 'Conversion Campaign - Retargeting',
      platform: 'meta_ads',
      dateRange,
      metrics: {
        spend: 1225.50,
        impressions: 22400,
        clicks: 538,
        conversions: 29,
        ctr: 2.4,
        cpc: 2.28,
        cpa: 42.26,
        roas: 2.7
      }
    }
  ];
};

export const storeCampaignData = async (campaignData: CampaignData[], adAccountId: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const dataToInsert = campaignData.map(campaign => ({
    user_id: user.user.id,
    ad_account_id: adAccountId,
    platform: campaign.platform,
    campaign_id: campaign.campaignId,
    campaign_name: campaign.campaignName,
    date_range_start: campaign.dateRange.start,
    date_range_end: campaign.dateRange.end,
    metrics: campaign.metrics
  }));

  const { data, error } = await supabase
    .from('campaign_data')
    .upsert(dataToInsert);

  if (error) throw error;
  return data;
};

export const getUserCampaignData = async (dateRange: { start: string; end: string }) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('campaign_data')
    .select(`
      *,
      ad_accounts!inner(platform, account_name)
    `)
    .eq('user_id', user.user.id)
    .gte('date_range_start', dateRange.start)
    .lte('date_range_end', dateRange.end);

  if (error) throw error;
  return data;
};
