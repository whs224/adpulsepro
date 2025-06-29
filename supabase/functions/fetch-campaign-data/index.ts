
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FetchDataRequest {
  dateRange: {
    start: string;
    end: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dateRange }: FetchDataRequest = await req.json();
    console.log('Fetching campaign data for date range:', dateRange);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get user's connected ad accounts
    const { data: adAccounts, error: accountsError } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (accountsError) {
      console.error('Error fetching ad accounts:', accountsError);
      throw accountsError;
    }

    if (!adAccounts || adAccounts.length === 0) {
      return new Response(
        JSON.stringify({
          campaigns: [],
          message: 'No connected ad accounts found. Please connect your ad accounts first.'
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log(`Found ${adAccounts.length} connected accounts`);

    // Fetch data from each platform
    const allCampaignData = [];
    
    for (const account of adAccounts) {
      console.log(`Fetching data for ${account.platform} account: ${account.account_name}`);
      
      try {
        let campaignData = [];
        
        switch (account.platform) {
          case 'google_ads':
            campaignData = await fetchGoogleAdsData(account, dateRange);
            break;
          case 'linkedin_ads':
            campaignData = await fetchLinkedInAdsData(account, dateRange);
            break;
          default:
            console.log(`Platform ${account.platform} not yet implemented`);
            continue;
        }

        if (campaignData.length > 0) {
          // Store the fetched data
          await storeCampaignData(supabase, campaignData, account, user.id);
          allCampaignData.push(...campaignData);
        }
      } catch (error) {
        console.error(`Failed to fetch data for ${account.platform}:`, error);
        // Continue with other accounts even if one fails
      }
    }

    console.log(`Fetched ${allCampaignData.length} campaigns total`);

    return new Response(
      JSON.stringify({
        campaigns: allCampaignData,
        connectedAccounts: adAccounts.length
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error fetching campaign data:", error);
    return new Response(
      JSON.stringify({
        campaigns: [],
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

async function fetchGoogleAdsData(account: any, dateRange: any) {
  console.log('Fetching Google Ads data...');
  
  // Check if token needs refresh
  if (account.token_expires_at && new Date(account.token_expires_at) <= new Date()) {
    throw new Error('Google Ads token expired. Please reconnect your account.');
  }

  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN');
  if (!developerToken) {
    throw new Error('Google Ads Developer Token not configured');
  }

  // Query Google Ads API for campaign data
  const query = `
    SELECT 
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
  `;

  const response = await fetch(`https://googleads.googleapis.com/v17/customers/${account.account_id}/googleAds:searchStream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${account.access_token}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Ads API error:', errorText);
    throw new Error(`Failed to fetch Google Ads data: ${errorText}`);
  }

  const data = await response.json();
  console.log('Google Ads data fetched successfully');

  // Transform the data to our format
  const campaigns = data.results?.map((result: any) => ({
    campaign_id: result.campaign.id.toString(),
    campaign_name: result.campaign.name,
    platform: 'google_ads',
    date_range_start: dateRange.start,
    date_range_end: dateRange.end,
    metrics: {
      impressions: parseInt(result.metrics.impressions) || 0,
      clicks: parseInt(result.metrics.clicks) || 0,
      spend: (parseInt(result.metrics.costMicros) || 0) / 1000000, // Convert micros to currency
      conversions: parseFloat(result.metrics.conversions) || 0
    }
  })) || [];

  return campaigns;
}

async function fetchLinkedInAdsData(account: any, dateRange: any) {
  console.log('Fetching LinkedIn Ads data...');
  
  // Check if token needs refresh
  if (account.token_expires_at && new Date(account.token_expires_at) <= new Date()) {
    throw new Error('LinkedIn Ads token expired. Please reconnect your account.');
  }

  // Get campaigns for the ad account
  const campaignsResponse = await fetch(`https://api.linkedin.com/rest/adCampaignsV2?q=search&search=(account:(values:List(urn%3Ali%3AsponsoredAccount%3A${account.account_id}))&status:(values:List(ACTIVE,PAUSED)))`, {
    headers: {
      'Authorization': `Bearer ${account.access_token}`,
      'LinkedIn-Version': '202404',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  if (!campaignsResponse.ok) {
    const errorText = await campaignsResponse.text();
    console.error('LinkedIn campaigns API error:', errorText);
    throw new Error(`Failed to fetch LinkedIn campaigns: ${errorText}`);
  }

  const campaignsData = await campaignsResponse.json();
  const campaigns = campaignsData.elements || [];

  // Fetch analytics for each campaign
  const campaignData = [];
  
  for (const campaign of campaigns) {
    try {
      const analyticsResponse = await fetch(`https://api.linkedin.com/rest/adAnalytics?q=analytics&pivot=CAMPAIGN&dateRange=(start:(year:${new Date(dateRange.start).getFullYear()},month:${new Date(dateRange.start).getMonth() + 1},day:${new Date(dateRange.start).getDate()}),end:(year:${new Date(dateRange.end).getFullYear()},month:${new Date(dateRange.end).getMonth() + 1},day:${new Date(dateRange.end).getDate()}))&campaigns=List(${campaign.id})`, {
        headers: {
          'Authorization': `Bearer ${account.access_token}`,
          'LinkedIn-Version': '202404',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        const metrics = analytics.elements?.[0] || {};

        campaignData.push({
          campaign_id: campaign.id.toString(),
          campaign_name: campaign.name,
          platform: 'linkedin_ads',
          date_range_start: dateRange.start,
          date_range_end: dateRange.end,
          metrics: {
            impressions: parseInt(metrics.impressions) || 0,
            clicks: parseInt(metrics.clicks) || 0,
            spend: parseFloat(metrics.costInUsd) || 0,
            conversions: parseInt(metrics.totalEngagements) || 0 // LinkedIn uses engagements
          }
        });
      }
    } catch (error) {
      console.error(`Failed to fetch analytics for campaign ${campaign.id}:`, error);
    }
  }

  return campaignData;
}

async function storeCampaignData(supabase: any, campaignData: any[], account: any, userId: string) {
  console.log(`Storing ${campaignData.length} campaigns for account ${account.account_name}`);

  const dataToInsert = campaignData.map(campaign => ({
    user_id: userId,
    ad_account_id: account.id,
    platform: campaign.platform,
    campaign_id: campaign.campaign_id,
    campaign_name: campaign.campaign_name,
    date_range_start: campaign.date_range_start,
    date_range_end: campaign.date_range_end,
    metrics: campaign.metrics
  }));

  const { error } = await supabase
    .from('campaign_data')
    .upsert(dataToInsert, {
      onConflict: 'ad_account_id,campaign_id,date_range_start,date_range_end'
    });

  if (error) {
    console.error('Error storing campaign data:', error);
    throw error;
  }

  console.log('Campaign data stored successfully');
}

serve(handler);
