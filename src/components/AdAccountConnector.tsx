import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Loader2, Clock, RefreshCw } from "lucide-react";
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

// Company logo components
const GoogleAdsLogo = () => (
  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  </div>
);

const MetaAdsLogo = () => (
  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  </div>
);

const TikTokAdsLogo = () => (
  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#000000" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  </div>
);

const LinkedInAdsLogo = () => (
  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  </div>
);

const platforms = [
  {
    key: "google_ads",
    name: "Google Ads",
    description: "Search, Display & YouTube advertising",
    logo: GoogleAdsLogo,
    color: "red"
  },
  {
    key: "meta_ads", 
    name: "Meta Ads",
    description: "Facebook & Instagram advertising",
    logo: MetaAdsLogo,
    color: "blue"
  },
  {
    key: "tiktok_ads",
    name: "TikTok Ads",
    description: "TikTok for Business advertising",
    logo: TikTokAdsLogo,
    color: "gray"
  },
  {
    key: "linkedin_ads",
    name: "LinkedIn Ads", 
    description: "Professional network advertising",
    logo: LinkedInAdsLogo,
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
      console.log('Loading connected accounts...');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('No authenticated user found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('ad_accounts')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .order('connected_at', { ascending: false });

      if (error) {
        console.error('Error loading connected accounts:', error);
        throw error;
      }
      
      console.log('Connected accounts loaded:', data);
      setConnectedAccounts(data || []);
    } catch (error: unknown) {
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
    console.log(`Attempting to connect platform: ${platformKey}`);
    
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
      await initiateOAuth(platformKey);
    } catch (error: unknown) {
      console.error('OAuth initiation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setConnecting(null);
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing connected accounts...');
    setLoading(true);
    loadConnectedAccounts();
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
    return { status: 'available', label: 'Available', variant: 'outline' as const, className: '' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading connected accounts...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connected Ad Accounts</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Connect your advertising accounts to start getting AI insights</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => {
            const platformStatus = getPlatformStatus(platform.key);
            const enabled = isPlatformEnabled(platform.key);
            
            return (
              <div key={platform.key} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <platform.logo />
                  <div>
                    <div className="font-semibold">{platform.name}</div>
                    <div className="text-sm text-gray-600">{platform.description}</div>
                    <div className="mt-1">
                      <Badge variant={platformStatus.variant} className={platformStatus.className}>
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
              🎉 Connected Accounts ({connectedAccounts.length})
            </h4>
            <div className="space-y-2">
              {connectedAccounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center text-sm">
                  <span className="text-green-800 font-medium">
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
        
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-500">
            🔒 Your data is encrypted and secure. We only access the metrics needed for analysis.
          </p>
          <p className="text-sm text-blue-600">
            💡 Google Ads and LinkedIn Ads are live! Meta Ads and TikTok Ads integrations coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdAccountConnector;
