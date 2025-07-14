
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('AI service is not configured properly. Please contact support.');
    }

    // Check if we have connected accounts
    if (!connectedAccounts || connectedAccounts.length === 0) {
      console.log('No connected accounts found - providing general advertising advice');
      return await handleGeneralAdvertisingQuestion(question, openaiApiKey);
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

    // If no campaign data but we have connected accounts, provide general advice with account context
    if (!campaignData || campaignData.length === 0) {
      console.log('Connected accounts found but no campaign data available');
      return await handleQuestionWithoutData(question, connectedAccounts, userPreferences, openaiApiKey);
    }

    // Handle questions with full data context
    return await handleQuestionWithData(question, campaignData, connectedAccounts, userPreferences, dataContext, openaiApiKey);

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

const handleGeneralAdvertisingQuestion = async (question: string, openaiApiKey: string) => {
  const systemPrompt = `You are an expert digital advertising consultant. The user hasn't connected any ad accounts yet, so provide general advertising advice and best practices.

Focus on:
- General advertising strategies and best practices
- Platform-specific advice (Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads)
- Campaign optimization techniques
- Budget allocation strategies
- Audience targeting principles
- Creative best practices
- Performance measurement approaches

Be helpful, actionable, and educational. Encourage them to connect their ad accounts to get personalized insights once they have campaigns running.`;

  return await callOpenAI(systemPrompt, question, openaiApiKey, "I see you haven't connected any ad accounts yet. To get started, please go to the 'Accounts' tab in your dashboard and connect your Google Ads, Meta Ads, or other advertising accounts. Once connected, I'll be able to analyze your campaign performance and provide insights.\n\nIn the meantime, I can still help with general advertising questions and best practices!");
};

const handleQuestionWithoutData = async (question: string, connectedAccounts: any[], userPreferences: any, openaiApiKey: string) => {
  // Use Perplexity AI for web search to answer questions
  const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
  
  // Format platform names nicely
  const platformNames = connectedAccounts.map(acc => 
    acc.platform === 'google_ads' ? 'Google Ads' :
    acc.platform === 'meta_ads' ? 'Meta/Facebook Ads' :
    acc.platform === 'tiktok_ads' ? 'TikTok Ads' :
    acc.platform === 'linkedin_ads' ? 'LinkedIn Ads' : acc.platform
  ).join(', ');
  
  if (perplexityApiKey) {
    console.log('Using Perplexity AI to search for advertising advice');
    
    try {
      const searchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: `You are an expert digital marketing and advertising consultant. Provide actionable, specific advice for advertising campaigns. Be concise but thorough. The user has connected these platforms: ${platformNames}. Always be helpful and provide real-world strategies.`
            },
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const aiResponse = searchData.choices?.[0]?.message?.content;
        
        if (aiResponse) {
          const responseText = `Great question! I can see you have ${platformNames} connected. Here's what I found:\n\n${aiResponse}`;
          
          return new Response(
            JSON.stringify({ response: responseText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (error) {
      console.error('Perplexity API error:', error);
    }
  }

  // Fallback to OpenAI if Perplexity is not available
  const systemPrompt = `You are an expert digital advertising consultant. The user has connected ${platformNames}, but no campaign data is available yet. Provide helpful general advice while acknowledging their connected platforms. Be actionable and specific.`;

  const contextualFallback = `I can see you have ${platformNames} connected! While I don't have campaign data available yet, I can help with general advertising strategies. However, for the most current and detailed advice, please ensure the Perplexity API key is configured to enable web search capabilities.

What specific aspects of your advertising would you like guidance on?`;

  return await callOpenAI(systemPrompt, question, openaiApiKey, contextualFallback);
};

const handleQuestionWithData = async (question: string, campaignData: any[], connectedAccounts: any[], userPreferences: any, dataContext: any, openaiApiKey: string) => {
  const accountNames = connectedAccounts.map(acc => `${acc.platform} (${acc.account_name})`).join(', ');

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
- PRIORITIZE analysis around the user's selected KPIs and business goals
- Provide specific, data-driven answers using the actual campaign data
- Use actual numbers and percentages from their data
- Compare performance across platforms when relevant
- Suggest actionable optimizations based on their actual performance
- Be conversational and helpful, like a knowledgeable marketing consultant
- Keep responses concise but informative (2-3 paragraphs max unless they ask for details)`;

  return await callOpenAI(systemPrompt, question, openaiApiKey, null);
};

const callOpenAI = async (systemPrompt: string, question: string, openaiApiKey: string, fallbackMessage: string | null) => {
  console.log('Calling OpenAI with system prompt length:', systemPrompt.length);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
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
    
    if (fallbackMessage) {
      return new Response(
        JSON.stringify({
          response: fallbackMessage,
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
    
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices?.[0]?.message?.content;

  if (!aiResponse) {
    console.error('No AI response received:', data);
    
    if (fallbackMessage) {
      return new Response(
        JSON.stringify({
          response: fallbackMessage,
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
    
    throw new Error('No response from AI service');
  }

  console.log('AI analysis completed successfully, response length:', aiResponse.length);

  return new Response(
    JSON.stringify({
      response: aiResponse,
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
};

serve(handler);
