
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { checkAndUseCredit, getUserCredits } from "@/services/creditService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AdAnalyticsChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCredits();
      checkConnectedAccounts();
      // Add welcome message
      setMessages([{
        id: '1',
        type: 'ai',
        content: "Hi! I'm your AI marketing assistant. Ask me anything about your ad performance, and I'll analyze your data to give you actionable insights. For example: 'How did my Facebook ads perform last week?' or 'Which platform has the best ROI?'",
        timestamp: new Date()
      }]);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkConnectedAccounts = async () => {
    try {
      const { data: accounts, error } = await supabase
        .from('ad_accounts')
        .select('platform, account_name, is_active')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      console.log('Connected accounts check:', accounts);
      setDebugInfo({ connectedAccounts: accounts || [] });
    } catch (error) {
      console.error('Error checking connected accounts:', error);
    }
  };

  const loadCredits = async () => {
    try {
      const credits = await getUserCredits();
      setRemainingCredits(credits?.remaining_credits || 0);
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    // Check credits before processing
    if (remainingCredits !== null && remainingCredits <= 0) {
      toast.error('No credits remaining. Please upgrade your plan to continue chatting.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check and use credit
      const creditUsed = await checkAndUseCredit(userMessage.content);
      if (!creditUsed) {
        toast.error('Unable to process message. You may be out of credits.');
        setIsLoading(false);
        return;
      }

      // Update remaining credits
      await loadCredits();

      console.log('Fetching user data for AI analysis...');

      // Get user's campaign data, connected accounts, and preferences
      const [campaignResponse, accountsResponse, preferencesResponse] = await Promise.all([
        supabase.from('campaign_data')
          .select(`
            *,
            ad_accounts!inner(platform, account_name)
          `)
          .eq('user_id', user.id)
          .order('fetched_at', { ascending: false })
          .limit(100), // Limit to recent data for better performance
        supabase.from('ad_accounts')
          .select('platform, account_name, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true),
        supabase.from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      console.log('Data fetched:', {
        campaigns: campaignResponse.data?.length || 0,
        accounts: accountsResponse.data?.length || 0,
        preferences: !!preferencesResponse.data
      });

      if (campaignResponse.error && campaignResponse.error.code !== 'PGRST116') {
        console.error('Campaign data error:', campaignResponse.error);
      }
      if (accountsResponse.error) {
        console.error('Accounts data error:', accountsResponse.error);
      }
      if (preferencesResponse.error && preferencesResponse.error.code !== 'PGRST116') {
        console.error('Preferences data error:', preferencesResponse.error);
      }

      const campaignData = campaignResponse.data || [];
      const connectedAccounts = accountsResponse.data || [];
      const userPreferences = preferencesResponse.data || null;

      console.log('Calling analyze-ad-data function with:', {
        campaignCount: campaignData.length,
        accountCount: connectedAccounts.length,
        hasPreferences: !!userPreferences
      });

      // Call the analyze-ad-data edge function
      const { data, error } = await supabase.functions.invoke('analyze-ad-data', {
        body: {
          question: userMessage.content,
          campaignData,
          connectedAccounts,
          userPreferences: userPreferences ? {
            selected_kpis: userPreferences.selected_kpis || [],
            business_goals: userPreferences.business_goals,
            primary_objective: userPreferences.primary_objective
          } : undefined
        }
      });

      console.log('AI function response:', { data, error });

      if (error) {
        console.error('Error calling AI function:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data?.response || "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I encountered an error: ${error.message || 'Unknown error'}. Please try again, and if the issue persists, make sure your ad accounts are properly connected.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
          <p className="text-gray-600">Please sign in to start chatting with your AI marketing assistant.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="h-[600px] flex flex-col shadow-xl rounded-3xl bg-gradient-to-br from-slate-50 to-white border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-t-3xl p-6">
          <CardTitle className="text-white text-2xl flex items-center gap-3 font-semibold">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="h-6 w-6" />
            </div>
            AdPulse AI Assistant
          </CardTitle>
          <CardDescription className="text-blue-100 mt-2 text-sm">
            Ask me anything about advertising strategies. Each message uses 1 credit.
            {debugInfo?.connectedAccounts?.length > 0 && (
              <span className="block mt-1 text-blue-200 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Connected: {debugInfo.connectedAccounts.map((acc: any) => 
                  acc.platform === 'google_ads' ? 'Google Ads' :
                  acc.platform === 'meta_ads' ? 'Meta Ads' :
                  acc.platform === 'tiktok_ads' ? 'TikTok Ads' :
                  acc.platform === 'linkedin_ads' ? 'LinkedIn Ads' : acc.platform
                ).join(', ')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-6 overflow-hidden flex flex-col bg-white/90 backdrop-blur-sm rounded-b-3xl">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className={`flex-1 max-w-[80%] ${
                  message.type === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`rounded-2xl p-4 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex space-x-2 mt-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about advertising strategies..."
              disabled={isLoading || (remainingCredits !== null && remainingCredits <= 0)}
              className="flex-1 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-0 px-4 py-3 bg-white shadow-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || (remainingCredits !== null && remainingCredits <= 0)}
              size="icon"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-md p-3 h-12 w-12"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          {remainingCredits !== null && (
            <div className="mt-2 text-center">
              <span className={`text-xs ${remainingCredits <= 10 ? 'text-yellow-600' : 'text-gray-500'}`}>
                {remainingCredits} credits remaining this month
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdAnalyticsChat;
