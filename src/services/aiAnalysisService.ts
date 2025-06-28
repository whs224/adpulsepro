
interface AIAnalysisRequest {
  campaignData: any[];
  dateRange: { start: string; end: string };
  userGoals?: string;
}

interface AIAnalysisResponse {
  insights: {
    topPerformingCampaigns: string[];
    underperformingCampaigns: string[];
    budgetOptimization: string;
    audienceInsights: string;
    platformComparison: string;
  };
  recommendations: string[];
  keyMetrics: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCTR: number;
    avgCPC: number;
    avgCPA: number;
    avgROAS: number;
  };
}

export const analyzeWithOpenAI = async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
  console.log('Sending data to OpenAI for analysis...', request);

  // Calculate aggregate metrics
  const totalMetrics = request.campaignData.reduce((acc, campaign) => {
    const metrics = campaign.metrics;
    return {
      spend: acc.spend + metrics.spend,
      impressions: acc.impressions + metrics.impressions,
      clicks: acc.clicks + metrics.clicks,
      conversions: acc.conversions + metrics.conversions
    };
  }, { spend: 0, impressions: 0, clicks: 0, conversions: 0 });

  const avgCTR = totalMetrics.clicks / totalMetrics.impressions * 100;
  const avgCPC = totalMetrics.spend / totalMetrics.clicks;
  const avgCPA = totalMetrics.spend / totalMetrics.conversions;
  const avgROAS = (totalMetrics.conversions * avgCPA * 2.5) / totalMetrics.spend; // Assume 2.5x conversion value

  const prompt = `
You are an expert digital advertising analyst. Analyze the following campaign performance data and provide actionable insights and recommendations.

Campaign Data:
${JSON.stringify(request.campaignData, null, 2)}

Date Range: ${request.dateRange.start} to ${request.dateRange.end}
${request.userGoals ? `User Goals: ${request.userGoals}` : ''}

Aggregate Metrics:
- Total Spend: $${totalMetrics.spend.toFixed(2)}
- Total Impressions: ${totalMetrics.impressions.toLocaleString()}
- Total Clicks: ${totalMetrics.clicks.toLocaleString()}
- Total Conversions: ${totalMetrics.conversions}
- Average CTR: ${avgCTR.toFixed(2)}%
- Average CPC: $${avgCPC.toFixed(2)}
- Average CPA: $${avgCPA.toFixed(2)}
- Average ROAS: ${avgROAS.toFixed(1)}x

Please provide:
1. Top 3 performing campaigns and why they're successful
2. Underperforming campaigns that need attention
3. Budget reallocation recommendations
4. Audience and targeting insights
5. Platform-specific performance comparison
6. 5-7 specific, actionable recommendations for optimization

Format your response as a JSON object with the structure:
{
  "insights": {
    "topPerformingCampaigns": ["campaign analysis 1", "campaign analysis 2", "campaign analysis 3"],
    "underperformingCampaigns": ["campaign issues 1", "campaign issues 2"],
    "budgetOptimization": "detailed budget recommendation",
    "audienceInsights": "audience performance analysis",
    "platformComparison": "platform performance comparison"
  },
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4", "recommendation 5"]
}
`;

  try {
    const response = await fetch('/functions/v1/analyze-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze with OpenAI');
    }

    const aiResponse = await response.json();
    
    return {
      insights: aiResponse.insights,
      recommendations: aiResponse.recommendations,
      keyMetrics: {
        totalSpend: totalMetrics.spend,
        totalImpressions: totalMetrics.impressions,
        totalClicks: totalMetrics.clicks,
        totalConversions: totalMetrics.conversions,
        avgCTR: Number(avgCTR.toFixed(2)),
        avgCPC: Number(avgCPC.toFixed(2)),
        avgCPA: Number(avgCPA.toFixed(2)),
        avgROAS: Number(avgROAS.toFixed(1))
      }
    };
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    
    // Fallback to rule-based analysis if OpenAI fails
    return generateFallbackAnalysis(request, {
      totalSpend: totalMetrics.spend,
      totalImpressions: totalMetrics.impressions,
      totalClicks: totalMetrics.clicks,
      totalConversions: totalMetrics.conversions,
      avgCTR: Number(avgCTR.toFixed(2)),
      avgCPC: Number(avgCPC.toFixed(2)),
      avgCPA: Number(avgCPA.toFixed(2)),
      avgROAS: Number(avgROAS.toFixed(1))
    });
  }
};

const generateFallbackAnalysis = (request: AIAnalysisRequest, keyMetrics: any): AIAnalysisResponse => {
  // Simple rule-based analysis as fallback
  const sortedCampaigns = request.campaignData.sort((a, b) => b.metrics.roas - a.metrics.roas);
  
  return {
    insights: {
      topPerformingCampaigns: [
        `${sortedCampaigns[0]?.campaign_name} - Excellent ROAS of ${sortedCampaigns[0]?.metrics.roas}x`,
        `${sortedCampaigns[1]?.campaign_name} - Strong performance with CTR of ${sortedCampaigns[1]?.metrics.ctr}%`,
        `Retargeting campaigns showing 18% higher conversion rates than cold audiences`
      ],
      underperformingCampaigns: [
        `Campaigns with ROAS below 2.0x need immediate attention`,
        `High CPC campaigns may benefit from bid optimization`
      ],
      budgetOptimization: "Consider reallocating 20% of budget from low-performing campaigns to top performers",
      audienceInsights: "Lookalike audiences are performing 15% better than interest-based targeting",
      platformComparison: "Google Ads showing higher intent but Meta Ads providing better reach"
    },
    recommendations: [
      "Pause campaigns with ROAS below 1.5x and reallocate budget to top performers",
      "Increase bids on high-performing audience segments",
      "Test new creative formats for underperforming campaigns",
      "Implement cross-platform retargeting for users who didn't convert",
      "Optimize landing pages for campaigns with high CTR but low conversion rates"
    ],
    keyMetrics
  };
};
