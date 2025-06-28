
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { initiateOAuth } from "@/services/oauthService";

interface ConnectedAccount {
  id: string;
  platform: string;
  account_name: string;
  connected_at: string;
  is_active: boolean;
}

const platforms = [
  {
    key: "google_ads",
    name: "Google Ads",
    description: "Search, Display & YouTube advertising",
    icon: "🔴",
    color: "red"
  },
  {
    key: "meta_ads", 
    name: "Meta Ads",
    description: "Facebook & Instagram advertising",
    icon: "🔵",
    color: "blue"
  },
  {
    key: "tiktok_ads",
    name: "TikTok Ads",
    description: "TikTok for Business advertising",
    icon: "⚫",
    color: "gray"
  },
  {
    key: "linkedin_ads",
    name: "LinkedIn Ads", 
    description: "Professional network advertising",
    icon: "🔷",
    color: "blue"
  }
];

const AdAccountConnector = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('ad_accounts')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('is_active', true);

      if (error) throw error;
      setConnectedAccounts(data || []);
    } catch (error: any) {
      console.error('Failed to load connected accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load connected accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformKey: string) => {
    if (platformKey === 'tiktok_ads' || platformKey === 'linkedin_ads') {
      toast({
        title: "Coming Soon",
        description: `${platforms.find(p => p.key === platformKey)?.name} integration will be available soon!`,
      });
      return;
    }

    setConnecting(platformKey);
    
    try {
      // For now, we'll simulate a successful connection with mock data
      // In production, this would use actual OAuth flows
      await simulateConnection(platformKey);
      
      toast({
        title: "Account Connected",
        description: `Successfully connected your ${platforms.find(p => p.key === platformKey)?.name} account`,
      });
      
      await loadConnectedAccounts();
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const simulateConnection = async (platformKey: string) => {
    // Simulate OAuth flow delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Mock account data - in production this would come from the OAuth response
    const mockAccountData = {
      google_ads: {
        account_id: 'gads_' + Math.random().toString(36).substr(2, 9),
        account_name: 'Main Google Ads Account',
        access_token: 'mock_google_token_' + Date.now()
      },
      meta_ads: {
        account_id: 'meta_' + Math.random().toString(36).substr(2, 9),
        account_name: 'Business Meta Account',
        access_token: 'mock_meta_token_' + Date.now()
      }
    };

    const accountData = mockAccountData[platformKey as keyof typeof mockAccountData];
    if (!accountData) throw new Error('Platform not supported');

    const { error } = await supabase
      .from('ad_accounts')
      .insert({
        user_id: user.user.id,
        platform: platformKey,
        account_id: accountData.account_id,
        account_name: accountData.account_name,
        access_token: accountData.access_token,
        is_active: true
      });

    if (error) throw error;
  };

  const isConnected = (platformKey: string) => {
    return connectedAccounts.some(account => account.platform === platformKey);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading connected accounts...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Ad Accounts</CardTitle>
        <p className="text-sm text-gray-600">Connect your advertising accounts to generate reports</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <div key={platform.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platform.icon}</span>
                <div>
                  <div className="font-semibold">{platform.name}</div>
                  <div className="text-sm text-gray-600">{platform.description}</div>
                  <div className="text-sm text-gray-600">
                    {isConnected(platform.key) ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-1">Not Connected</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleConnect(platform.key)}
                disabled={connecting === platform.key || isConnected(platform.key)}
              >
                {connecting === platform.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isConnected(platform.key) ? (
                  'Connected'
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
        
        {connectedAccounts.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">
              Connected Accounts ({connectedAccounts.length})
            </h4>
            <div className="space-y-2">
              {connectedAccounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center text-sm">
                  <span className="text-green-800">
                    {platforms.find(p => p.key === account.platform)?.name}: {account.account_name}
                  </span>
                  <span className="text-green-600">
                    Connected {new Date(account.connected_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-4">
            🔒 Your data is encrypted and secure. We only access the metrics needed for analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdAccountConnector;
