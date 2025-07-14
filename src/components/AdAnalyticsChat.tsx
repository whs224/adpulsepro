import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, User, AlertCircle, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { checkAndUseCredit, getUserCredits } from "@/services/creditService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ChatHistory from "./ChatHistory";

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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionUpdate, setSessionUpdate] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCredits();
      checkConnectedAccounts();
      startNewChat();
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

  const startNewChat = async () => {
    try {
      // Create a new chat session
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: user?.id,
            title: 'New Chat'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(session.id);
      setMessages([{
        id: '1',
        type: 'ai',
        content: "Hi! I'm your AdPulse AI assistant. I can help you analyze your advertising data, provide insights on campaign performance, and suggest optimization strategies. What would you like to know about your ads?",
        timestamp: new Date()
      }]);

      // Save the welcome message
      await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: session.id,
            user_id: user?.id,
            type: 'ai',
            content: "Hi! I'm your AdPulse AI assistant. I can help you analyze your advertising data, provide insights on campaign performance, and suggest optimization strategies. What would you like to know about your ads?"
          }
        ]);

      setSessionUpdate(prev => prev + 1);
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast.error('Failed to start new chat');
    }
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        type: msg.type as 'user' | 'ai',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));

      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast.error('Failed to load chat');
    }
  };

  const saveMessage = async (message: Message, sessionId: string) => {
    try {
      await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            user_id: user?.id,
            type: message.type,
            content: message.content
          }
        ]);

      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user?.id);

      setSessionUpdate(prev => prev + 1);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const generateChatTitle = async (sessionId: string, messages: Message[]) => {
    try {
      // Only generate title after the first user message
      const userMessages = messages.filter(m => m.type === 'user');
      if (userMessages.length === 1) {
        const { data, error } = await supabase.functions.invoke('generate-chat-title', {
          body: { messages: messages.slice(0, 4) }
        });

        if (!error && data?.title) {
          await supabase
            .from('chat_sessions')
            .update({ title: data.title })
            .eq('id', sessionId)
            .eq('user_id', user?.id);
          
          setSessionUpdate(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user || !currentSessionId) return;

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

    // Save user message
    await saveMessage(userMessage, currentSessionId);

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
          .limit(100),
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

      setMessages(prev => {
        const updatedMessages = [...prev, aiMessage];
        // Generate title after messages are updated
        generateChatTitle(currentSessionId, updatedMessages);
        return updatedMessages;
      });

      // Save AI message
      await saveMessage(aiMessage, currentSessionId);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I encountered an error: ${error.message || 'Unknown error'}. Please try again, and if the issue persists, make sure your ad accounts are properly connected.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage, currentSessionId);
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

  const handleSessionSelect = (sessionId: string) => {
    if (sessionId !== currentSessionId) {
      loadChatSession(sessionId);
    }
  };

  const handleNewChat = () => {
    startNewChat();
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
    <div className="flex gap-6 h-[700px] max-w-7xl mx-auto">
      {/* Chat History Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChatHistory
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          onSessionUpdate={() => setSessionUpdate(prev => prev + 1)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        <Card className="h-full flex flex-col shadow-xl rounded-3xl bg-gradient-to-br from-slate-50 to-white border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-t-3xl p-6">
            <CardTitle className="text-white text-2xl flex items-center gap-3 font-semibold">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
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
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
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
                  <div className={`flex-1 max-w-[85%] ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`rounded-2xl p-4 shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-100'
                    }`}>
                      <div className="prose prose-sm max-w-none">
                        {message.content.split('\n').map((line, index) => {
                          if (line.startsWith('###')) {
                            return <h3 key={index} className={`text-lg font-semibold mt-3 mb-2 ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>{line.replace('###', '').trim()}</h3>;
                          } else if (line.startsWith('##')) {
                            return <h2 key={index} className={`text-xl font-bold mt-4 mb-2 ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>{line.replace('##', '').trim()}</h2>;
                          } else if (line.startsWith('- ')) {
                            return <li key={index} className={`ml-4 list-disc ${message.type === 'user' ? 'text-blue-100' : 'text-gray-700'}`}>{line.replace('- ', '')}</li>;
                          } else if (line.startsWith('**') && line.endsWith('**')) {
                            return <p key={index} className={`font-semibold ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>{line.replace(/\*\*/g, '')}</p>;
                          } else if (line.trim()) {
                            return <p key={index} className={`mb-2 leading-relaxed ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>{line}</p>;
                          }
                          return <br key={index} />;
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
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
            <div className="flex space-x-3 mt-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your ad performance..."
                disabled={isLoading || (remainingCredits !== null && remainingCredits <= 0)}
                className="flex-1 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-0 px-4 py-3 bg-white shadow-sm text-base"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || (remainingCredits !== null && remainingCredits <= 0)}
                size="icon"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg p-3 h-12 w-12 transition-all hover:scale-105"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            {remainingCredits !== null && (
              <div className="mt-3 text-center">
                <span className={`text-sm font-medium ${remainingCredits <= 10 ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {remainingCredits} credits remaining this month
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdAnalyticsChat;