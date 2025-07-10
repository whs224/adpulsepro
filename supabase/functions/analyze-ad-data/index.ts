
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  question: string;
  campaignData: any[];
  connectedAccounts: Array<{platform: string; account_name: string}>;
  userPreferences?: {
    selected_kpis?: string[];
    business_goals?: string;
    primary_objective?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, campaignData, connectedAccounts, userPreferences }: AnalysisRequest = await req.json();
    console.log('Analyzing ad data question:', question);
    console.log('Campaign data count:', campaignData?.length || 0);
    console.log('Connected accounts:', connectedAccounts?.length || 0, connectedAccounts);
    console.log('User preferences:', userPreferences);

    // Get the OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('ChatGPT API');
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('AI service is not configured properly. Please contact support.');
    }

    // Check if we have connected accounts
    if (!connectedAccounts || connectedAccounts.length === 0) {
      console.log('No connected accounts found');
      return new Response(
        JSON.stringify({
          response: "I see you haven't connected any ad accounts yet. To get started, please go to the 'Accounts' tab in your dashboard and connect your Google Ads, Meta Ads, or other advertising accounts. Once connected, I'll be able to analyze your campaign performance and provide insights.",
          context: null
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

    // Prepare context about user's data
    const dataContext = campaignData && campaignData.length > 0 ? {
      totalCampaigns: campaignData.length,
      platforms: [...new Set(campaignData.map(c => c.ad_accounts?.platform || c.platform))],
      dateRange: campaignData.length > 0 ? {
        start: Math.min(...campaignData.map(c => new Date(c.date_range_start || Date.now()).getTime())),
        end: Math.max(...campaignData.map(c => new Date(c.date_range_end || Date.now()).getTime()))
      } : null,
      totalMetrics: campaignData.reduce((acc, campaign) => {
        const metrics = campaign.metrics || {};
        return {
          spend: (acc.spend || 0) + (metrics.spend || 0),
          impressions: (acc.impressions || 0) + (metrics.impressions || 0),
          clicks: (acc.clicks || 0) + (metrics.clicks || 0),
          conversions: (acc.conversions || 0) + (metrics.conversions || 0)
        };
      }, {})
    } : null;

    const connectedPlatforms = connectedAccounts.map(acc => acc.platform).join(', ');
    const accountNames = connectedAccounts.map(acc => `${acc.platform} (${acc.account_name})`).join(', ');

    // If no campaign data but we have connected accounts, explain the situation
    if (!campaignData || campaignData.length === 0) {
      console.log('Connected accounts found but no campaign data available');
      return new Response(
        JSON.stringify({
          response: `I can see you have connected accounts: ${accountNames}. However, I don't have any campaign data available yet. This could be because:

1. Your campaigns are very new and data hasn't been synced yet
2. The connected accounts don't have any active campaigns in the recent period
3. There was an issue fetching data from the advertising platforms

Try asking me again in a few minutes, or check if your connected accounts have active campaigns with recent data. You can also try reconnecting your accounts if the issue persists.`,
          context: {
            connectedAccounts: connectedAccounts.length,
            platforms: connectedAccounts.map(acc => acc.platform)
          }
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

    const systemPrompt = `You are an expert digital advertising analyst AI assistant. You help users understand their ad performance data by answering questions about their campaigns across Google Ads, Meta Ads, TikTok Ads, and LinkedIn Ads.

Context about this user:
- Connected accounts: ${accountNames}
- Available data: ${campaignData.length} campaign records
${dataContext ? `
- Platforms with data: ${dataContext.platforms.join(', ')}
- Total spend: $${dataContext.totalMetrics.spend?.toFixed(2) || '0'}
- Total impressions: ${dataContext.totalMetrics.impressions?.toLocaleString() || '0'}
- Total clicks: ${dataContext.totalMetrics.clicks?.toLocaleString() || '0'}
- Total conversions: ${dataContext.totalMetrics.conversions || '0'}
` : '- Campaign data is being processed'}

User's KPI Preferences: ${userPreferences?.selected_kpis?.length ? userPreferences.selected_kpis.join(', ') : 'Not specified'}
Business Goals: ${userPreferences?.business_goals || 'Not specified'}
Primary Objective: ${userPreferences?.primary_objective || 'Not specified'}

Campaign Data Sample (showing first 3 campaigns):
${JSON.stringify(campaignData.slice(0, 3), null, 2)}
${campaignData.length > 3 ? `... and ${campaignData.length - 3} more campaigns` : ''}

Instructions:
- PRIORITIZE analysis around the user's selected KPIs: ${userPreferences?.selected_kpis?.map(kpi => {
  const kpiMap: Record<string, string> = {
    'roas': 'Return on Ad Spend (ROAS) - focus on revenue optimization',
    'cpa': 'Cost Per Acquisition (CPA) - focus on efficient customer acquisition',
    'ctr': 'Click-Through Rate (CTR) - focus on ad engagement and relevance',
    'impressions': 'Impressions & Reach - focus on brand visibility and awareness',
    'conversions': 'Conversion Rate - focus on conversion optimization',
    'audience': 'Audience Quality - focus on targeting and audience insights'
  };
  return kpiMap[kpi] || kpi;
}).join('; ') || 'general performance metrics'}
- When no specific KPIs are selected, provide balanced analysis across all metrics
- Provide specific, data-driven answers using the actual campaign data
- Use actual numbers and percentages from their data
- Compare performance across platforms when relevant
- Suggest actionable optimizations based on their actual performance AND their KPI priorities
- Be conversational and helpful, like a knowledgeable marketing consultant
- Keep responses concise but informative (2-3 paragraphs max unless they ask for details)
- Always relate insights back to their chosen KPI focus areas when applicable`;

    console.log('Calling OpenAI with system prompt length:', systemPrompt.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('No AI response received:', data);
      throw new Error('No response from AI service');
    }

    console.log('AI analysis completed successfully, response length:', aiResponse.length);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        context: dataContext
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
    console.error("Error in ad data analysis:", error);
    
    // Provide more specific error messages
    let errorMessage = "I'm having trouble accessing your data right now. ";
    
    if (error.message?.includes('AI service')) {
      errorMessage += "There's an issue with the AI analysis service. Please try again in a moment.";
    } else if (error.message?.includes('not configured')) {
      errorMessage += "The AI service needs to be configured. Please contact support.";
    } else {
      errorMessage += "Please make sure your ad accounts are properly connected and try again. If this continues, the data might still be syncing from your connected accounts.";
    }
    
    return new Response(
      JSON.stringify({
        response: errorMessage,
        error: error.message,
        debug: {
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name
        }
      }),
      {
        status: 200, // Return 200 so the frontend doesn't treat it as a hard error
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
