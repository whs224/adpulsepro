
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { initiateOAuth, isPlatformEnabled } from "@/services/oauthService";

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
    if (!isPlatformEnabled(platformKey)) {
      toast({
        title: "Coming Soon! 🚀",
        description: `${platforms.find(p => p.key === platformKey)?.name} integration is currently being developed and will be available soon!`,
      });
      return;
    }

    setConnecting(platformKey);
    
    try {
      // Initiate OAuth flow
      initiateOAuth(platformKey);
    } catch (error: any) {
      console.error('OAuth initiation failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
      setConnecting(null);
    }
  };

  const isConnected = (platformKey: string) => {
    return connectedAccounts.some(account => account.platform === platformKey);
  };

  const getPlatformStatus = (platformKey: string) => {
    if (isConnected(platformKey)) {
      return { status: 'connected', label: 'Connected', variant: 'secondary' as const, className: 'bg-green-100 text-green-800' };
    }
    if (!isPlatformEnabled(platformKey)) {
      return { status: 'coming_soon', label: 'Coming Soon', variant: 'outline' as const, className: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    }
    return { status: 'available', label: 'Not Connected', variant: 'outline' as const, className: '' };
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
          {platforms.map((platform) => {
            const platformStatus = getPlatformStatus(platform.key);
            const enabled = isPlatformEnabled(platform.key);
            
            return (
              <div key={platform.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <div>
                    <div className="font-semibold">{platform.name}</div>
                    <div className="text-sm text-gray-600">{platform.description}</div>
                    <div className="text-sm text-gray-600">
                      <Badge variant={platformStatus.variant} className={`mt-1 ${platformStatus.className}`}>
                        {platformStatus.status === 'connected' && <Check className="h-3 w-3 mr-1" />}
                        {platformStatus.status === 'coming_soon' && <Clock className="h-3 w-3 mr-1" />}
                        {platformStatus.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant={enabled ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => handleConnect(platform.key)}
                  disabled={connecting === platform.key || isConnected(platform.key)}
                  className={!enabled ? "opacity-60" : ""}
                >
                  {connecting === platform.key ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isConnected(platform.key) ? (
                    'Connected'
                  ) : !enabled ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Soon
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            );
          })}
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
          <p className="text-sm text-blue-600">
            💡 More platforms coming soon! Meta Ads and TikTok Ads integrations are currently in development.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdAccountConnector;
