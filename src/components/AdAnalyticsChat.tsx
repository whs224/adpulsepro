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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCredits();
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

      // Get user's campaign data and connected accounts
      const [campaignResponse, accountsResponse] = await Promise.all([
        supabase.from('campaign_data').select('*').eq('user_id', user.id),
        supabase.from('ad_accounts').select('platform, account_name').eq('user_id', user.id).eq('is_active', true)
      ]);

      const campaignData = campaignResponse.data || [];
      const connectedAccounts = accountsResponse.data || [];

      // Call the analyze-ad-data edge function
      const { data, error } = await supabase.functions.invoke('analyze-ad-data', {
        body: {
          question: userMessage.content,
          campaignData,
          connectedAccounts
        }
      });

      if (error) {
        console.error('Error calling AI function:', error);
        throw error;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response || "I'm having trouble analyzing your data right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm experiencing technical difficulties. Please make sure your ad accounts are connected and try again.",
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
      <Card className="h-[600px] flex flex-col shadow-lg rounded-2xl bg-gradient-to-br from-white to-blue-50 border border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-4">
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AdPulse AI Assistant
          </CardTitle>
          <CardDescription className="text-blue-100 mt-1">
            Ask questions about your ad performance. Each message uses 1 credit.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-hidden flex flex-col bg-white/80 rounded-b-2xl">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 max-w-[80%] ${
                  message.type === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
              placeholder="Ask about your ad performance..."
              disabled={isLoading || (remainingCredits !== null && remainingCredits <= 0)}
              className="flex-1 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || (remainingCredits !== null && remainingCredits <= 0)}
              size="icon"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg shadow"
            >
              <Send className="h-4 w-4" />
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
