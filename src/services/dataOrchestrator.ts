
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

  // Get user's connected ad accounts
  const { data: adAccounts, error: accountsError } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('is_active', true);

  if (accountsError) throw accountsError;
  if (!adAccounts || adAccounts.length === 0) {
    throw new Error('No connected ad accounts found. Please connect your ad accounts in Settings.');
  }

  console.log(`Found ${adAccounts.length} connected accounts`);

  // Fetch data from each platform
  const allCampaignData = [];
  
  for (const account of adAccounts) {
    console.log(`Fetching data for ${account.platform} account: ${account.account_name}`);
    
    let campaignData = [];
    
    try {
      switch (account.platform) {
        case 'google_ads':
          campaignData = await fetchGoogleAdsData(account.access_token, account.account_id, dateRange);
          break;
        case 'meta_ads':
          campaignData = await fetchMetaAdsData(account.access_token, account.account_id, dateRange);
          break;
        case 'tiktok_ads':
          // campaignData = await fetchTikTokAdsData(account.access_token, account.account_id, dateRange);
          console.log('TikTok Ads integration coming soon');
          break;
        case 'linkedin_ads':
          // campaignData = await fetchLinkedInAdsData(account.access_token, account.account_id, dateRange);
          console.log('LinkedIn Ads integration coming soon');
          break;
        default:
          console.warn(`Unknown platform: ${account.platform}`);
      }

      if (campaignData.length > 0) {
        // Store the fetched data
        await storeCampaignData(campaignData, account.id);
        allCampaignData.push(...campaignData);
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${account.platform}:`, error);
      // Continue with other accounts even if one fails
    }
  }

  if (allCampaignData.length === 0) {
    throw new Error('No campaign data could be fetched from connected accounts');
  }

  console.log(`Fetched ${allCampaignData.length} campaigns total`);

  // Get user's business goals for context
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.user.id)
    .single();

  // Analyze with OpenAI
  console.log('Starting OpenAI analysis...');
  const analysis = await analyzeWithOpenAI({
    campaignData: allCampaignData,
    dateRange,
    userGoals: profile?.full_name || undefined
  });

  // Store the analysis results
  const { error: analysisError } = await supabase
    .from('ai_analysis')
    .insert({
      user_id: user.user.id,
      date_range_start: dateRange.start,
      date_range_end: dateRange.end,
      raw_data: allCampaignData,
      ai_insights: analysis.insights,
      recommendations: analysis.recommendations
    });

  if (analysisError) {
    console.error('Failed to store analysis:', analysisError);
    // Don't throw - we can still return the analysis
  }

  return {
    campaigns: allCampaignData,
    analysis,
    connectedAccounts: adAccounts.length
  };
};

export const getStoredUserData = async (dateRange: { start: string; end: string }) => {
  // Try to get stored data first (faster for repeat requests)
  const campaignData = await getUserCampaignData(dateRange);
  
  if (!campaignData || campaignData.length === 0) {
    // No stored data, fetch fresh
    return await fetchAllUserData(dateRange);
  }

  // Get stored analysis
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data: analysis } = await supabase
    .from('ai_analysis')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('date_range_start', dateRange.start)
    .eq('date_range_end', dateRange.end)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    campaigns: campaignData,
    analysis: analysis ? {
      insights: analysis.ai_insights,
      recommendations: analysis.recommendations,
      keyMetrics: calculateKeyMetrics(campaignData)
    } : null,
    connectedAccounts: [...new Set(campaignData.map(c => c.ad_accounts.platform))].length
  };
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
