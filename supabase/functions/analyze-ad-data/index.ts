
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  question: string;
  campaignData: any[];
  connectedAccounts: Array<{platform: string; account_name: string}>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, campaignData, connectedAccounts }: AnalysisRequest = await req.json();
    console.log('Analyzing ad data question:', question);
    console.log('Campaign data count:', campaignData.length);
    console.log('Connected accounts:', connectedAccounts);

    // Get the OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('ChatGPT API');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare context about user's data
    const dataContext = campaignData.length > 0 ? {
      totalCampaigns: campaignData.length,
      platforms: [...new Set(campaignData.map(c => c.ad_accounts?.platform || c.platform))],
      dateRange: campaignData.length > 0 ? {
        start: Math.min(...campaignData.map(c => new Date(c.date_range_start).getTime())),
        end: Math.max(...campaignData.map(c => new Date(c.date_range_end).getTime()))
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

    const systemPrompt = `You are an expert digital advertising analyst AI assistant. You help users understand their ad performance data by answering questions about their campaigns across Google Ads, Meta Ads, TikTok Ads, and LinkedIn Ads.

Context about this user:
- Connected accounts: ${connectedAccounts.map(acc => `${acc.platform} (${acc.account_name})`).join(', ') || 'None'}
- Available data: ${campaignData.length} campaign records
${dataContext ? `
- Platforms with data: ${dataContext.platforms.join(', ')}
- Total spend: $${dataContext.totalMetrics.spend?.toFixed(2) || '0'}
- Total impressions: ${dataContext.totalMetrics.impressions?.toLocaleString() || '0'}
- Total clicks: ${dataContext.totalMetrics.clicks?.toLocaleString() || '0'}
- Total conversions: ${dataContext.totalMetrics.conversions || '0'}
` : '- No campaign data available yet'}

Campaign Data Available:
${JSON.stringify(campaignData.slice(0, 10), null, 2)}
${campaignData.length > 10 ? `... and ${campaignData.length - 10} more campaigns` : ''}

Instructions:
- Provide specific, data-driven answers when campaign data is available
- If no data is available, explain what they need to do (connect accounts, wait for data sync)
- Use actual numbers and percentages from their data
- Compare performance across platforms when relevant
- Suggest actionable optimizations based on their actual performance
- Be conversational and helpful, like a knowledgeable marketing consultant
- If they ask about time periods not in the data, explain the available date range
- Keep responses concise but informative (2-3 paragraphs max unless they ask for details)`;

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
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI analysis completed successfully');

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
    return new Response(
      JSON.stringify({
        response: "I'm experiencing technical difficulties right now. Please make sure your ad accounts are connected and try again. If the issue persists, our team has been notified.",
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

serve(handler);
