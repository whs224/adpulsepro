
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Bot, User, BarChart3, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data_context?: any;
}

const AdAnalyticsChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI ad analytics assistant. I can analyze your connected ad accounts and answer questions about your campaign performance. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadConnectedAccounts();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConnectedAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setConnectedAccounts(data || []);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    }
  };

  const analyzeWithAI = async (userQuestion: string) => {
    try {
      console.log('Sending question to AI:', userQuestion);
      
      // Get recent campaign data for context
      const { data: campaignData, error: dataError } = await supabase
        .from('campaign_data')
        .select(`
          *,
          ad_accounts!inner(platform, account_name)
        `)
        .eq('user_id', user?.id)
        .gte('date_range_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('fetched_at', { ascending: false })
        .limit(50);

      if (dataError) {
        console.error('Error fetching campaign data:', dataError);
      }

      const contextData = campaignData || [];
      
      const response = await fetch('/functions/v1/analyze-ad-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          question: userQuestion,
          campaignData: contextData,
          connectedAccounts: connectedAccounts.map(acc => ({
            platform: acc.platform,
            account_name: acc.account_name
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        content: result.response,
        data_context: {
          campaigns_analyzed: contextData.length,
          platforms: [...new Set(contextData.map(d => d.ad_accounts.platform))]
        }
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        content: "I'm having trouble analyzing your data right now. Please make sure your ad accounts are connected and try again. If you haven't connected any accounts yet, please do so in the Settings page.",
        data_context: null
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the AI assistant",
        variant: "destructive"
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await analyzeWithAI(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        data_context: aiResponse.data_context
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Store conversation in database for history
      await supabase
        .from('ai_analysis')
        .insert({
          user_id: user.id,
          date_range_start: new Date().toISOString().split('T')[0],
          date_range_end: new Date().toISOString().split('T')[0],
          raw_data: { question: userMessage.content },
          ai_insights: { response: aiResponse.content },
          recommendations: [aiResponse.content]
        });

    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
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

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-600" />
          AI Ad Analytics Assistant
          {connectedAccounts.length > 0 && (
            <span className="text-sm font-normal text-green-600 flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              {connectedAccounts.length} accounts connected
            </span>
          )}
        </CardTitle>
        {connectedAccounts.length === 0 && (
          <p className="text-sm text-orange-600">
            Connect your ad accounts in Settings to enable data analysis
          </p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.role === 'user' ? (
                    <>
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-blue-100">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-green-100">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.data_context && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          Analyzed {message.data_context.campaigns_analyzed} campaigns from {message.data_context.platforms?.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-100">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Analyzing your data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your ad performance..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ask questions like "How did my Google Ads perform last week?" or "Which campaign has the lowest CPC?"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdAnalyticsChat;
