
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, Target, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getStoredUserData } from "@/services/dataOrchestrator";
import { useToast } from "@/hooks/use-toast";

const Report = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      };

      const data = await getStoredUserData(dateRange);
      setReportData(data);
      setHasConnectedAccounts(data.connectedAccounts > 0);
      
      if (data.connectedAccounts === 0) {
        toast({
          title: "No Connected Accounts",
          description: "Connect your ad accounts in Settings to see real data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Failed to load report data:', error);
      
      // Show demo data if no real data available
      setReportData(getDemoData());
      setHasConnectedAccounts(false);
      
      toast({
        title: "Using Demo Data",
        description: "Connect your ad accounts in Settings to see your real performance",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDemoData = () => {
    const dummyData = [
      { date: 'Jun 1', spend: 1200, conversions: 24, clicks: 480, impressions: 12000 },
      { date: 'Jun 7', spend: 1350, conversions: 28, clicks: 520, impressions: 13500 },
      { date: 'Jun 14', spend: 1180, conversions: 22, clicks: 450, impressions: 11800 },
      { date: 'Jun 21', spend: 1420, conversions: 32, clicks: 580, impressions: 14200 },
      { date: 'Jun 28', spend: 1550, conversions: 38, clicks: 620, impressions: 15500 },
    ];

    const totalSpend = dummyData.reduce((sum, item) => sum + item.spend, 0);
    const totalConversions = dummyData.reduce((sum, item) => sum + item.conversions, 0);
    const totalClicks = dummyData.reduce((sum, item) => sum + item.clicks, 0);
    const totalImpressions = dummyData.reduce((sum, item) => sum + item.impressions, 0);
    
    return {
      campaigns: dummyData,
      analysis: {
        keyMetrics: {
          totalSpend,
          totalImpressions,
          totalClicks,
          totalConversions,
          avgCTR: Number(((totalClicks / totalImpressions) * 100).toFixed(2)),
          avgCPC: Number((totalSpend / totalClicks).toFixed(2)),
          avgCPA: Number((totalSpend / totalConversions).toFixed(2)),
          avgROAS: 3.2
        },
        recommendations: [
          "Budget Reallocation: Move 20% of budget from low-CTR audience segments to high-performing lookalike audiences",
          "Campaign Alert: Consider pausing underperforming campaigns with ROAS below 2.0x",
          "Opportunity: Increase bids on high-performing demographics showing 18% better CTR than average"
        ]
      },
      connectedAccounts: 0
    };
  };

  const handleGetReport = () => {
    if (!hasConnectedAccounts) {
      toast({
        title: "Connect Your Ad Accounts First",
        description: "Please connect your ad accounts in Settings to generate a real report with your data",
        variant: "destructive",
      });
      navigate('/settings');
      return;
    }

    setShowCheckout(true);
    setTimeout(() => setShowCheckout(false), 3000);
    setTimeout(() => navigate('/checkout'), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading your report data...</p>
        </div>
      </div>
    );
  }

  const metrics = reportData?.analysis?.keyMetrics || {};
  const chartData = reportData?.campaigns || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Settings Reminder Popup */}
      {showCheckout && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <p className="text-sm">💡 Make sure your ad accounts are connected in Settings!</p>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Ad Performance Report
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {user?.user_metadata?.full_name || user?.email}! 
            {hasConnectedAccounts ? " Here's how your campaigns performed." : " This is a demo report."}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {hasConnectedAccounts ? 
              `${reportData.connectedAccounts} connected accounts • ${reportData.campaigns?.length || 0} campaigns analyzed` :
              "Demo data • Connect your accounts for real insights"
            }
          </p>
          
          {!hasConnectedAccounts && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-yellow-800">
                📊 This is demo data. <Button variant="link" className="p-0 h-auto text-yellow-800 underline" onClick={() => navigate('/settings')}>
                  Connect your ad accounts
                </Button> to see your real performance data.
              </p>
            </div>
          )}
        </div>

        {/* Executive Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">${metrics.totalSpend?.toLocaleString() || '0'}</div>
                <div className="text-sm text-gray-600">Total Spend</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.totalImpressions?.toLocaleString() || '0'}</div>
                <div className="text-sm text-gray-600">Impressions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.totalClicks?.toLocaleString() || '0'}</div>
                <div className="text-sm text-gray-600">Clicks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.totalConversions || '0'}</div>
                <div className="text-sm text-gray-600">Conversions</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{metrics.avgCTR || '0'}%</div>
                <div className="text-sm text-gray-600">Avg CTR</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">${metrics.avgCPC || '0'}</div>
                <div className="text-sm text-gray-600">Avg CPC</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{metrics.avgROAS || '0'}x</div>
                <div className="text-sm text-gray-600">Avg ROAS</div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">
                  {hasConnectedAccounts ? 'AI Insight:' : 'Demo Insight:'}
                </span>
              </div>
              <p className="text-green-700 mt-1">
                {reportData?.analysis?.insights?.topPerformingCampaigns?.[0] || 
                 "Your campaigns show strong performance with opportunities for optimization"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {hasConnectedAccounts ? 'AI-Powered Recommendations' : 'Demo Recommendations'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportData?.analysis?.recommendations?.slice(0, 3).map((recommendation: string, index: number) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                index === 0 ? 'bg-blue-50 border-blue-500' :
                index === 1 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
              }`}>
                <p className={`font-semibold ${
                  index === 0 ? 'text-blue-900' :
                  index === 1 ? 'text-red-900' : 'text-green-900'
                }`}>
                  {index === 0 ? 'Budget Optimization' : index === 1 ? 'Campaign Alert' : 'Growth Opportunity'}
                </p>
                <p className={`${
                  index === 0 ? 'text-blue-800' :
                  index === 1 ? 'text-red-800' : 'text-green-800'
                }`}>
                  {recommendation}
                </p>
              </div>
            )) || []}
          </CardContent>
        </Card>

        {/* Get My Report Button */}
        <div className="text-center py-12 relative z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-xl border">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {hasConnectedAccounts ? 'Get Your Full Report' : 'Connect & Get Your Real Report'}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasConnectedAccounts ? 
                'Generate a comprehensive PDF report with detailed analysis of your actual campaign data and AI-powered recommendations.' :
                'Connect your ad accounts to get a personalized analysis of your actual campaign data with AI-powered recommendations.'
              }
            </p>
            <Button 
              onClick={handleGetReport}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              {hasConnectedAccounts ? 'Generate Report - $5 📊' : 'Connect Accounts & Get Report'}
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              {hasConnectedAccounts ? 
                'Professional PDF report delivered to your email' :
                'First connect your accounts in Settings'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
