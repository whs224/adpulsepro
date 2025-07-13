import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Clock, Loader2, Settings, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isPlatformEnabled, initiateOAuth } from "@/services/oauthService";

interface ConnectedAccount {
  id: string;
  platform: string;
  account_name: string;
  connected_at: string;
  is_active: boolean;
}

// Company logo components
const GoogleAdsLogo = () => (
  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100">
    <svg viewBox="0 0 24 24" className="w-7 h-7">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  </div>
);

const MetaAdsLogo = () => (
  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100">
    <svg viewBox="0 0 24 24" className="w-7 h-7">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  </div>
);

const TikTokAdsLogo = () => (
  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100">
    <svg viewBox="0 0 24 24" className="w-7 h-7">
      <path fill="#000000" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  </div>
);

const LinkedInAdsLogo = () => (
  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100">
    <svg viewBox="0 0 24 24" className="w-7 h-7">
      <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  </div>
);

const platformConfig = {
  google_ads: {
    name: "Google Ads",
    description: "Search, Display & YouTube advertising",
    logo: GoogleAdsLogo,
    color: "blue"
  },
  meta_ads: {
    name: "Meta Ads", 
    description: "Facebook & Instagram advertising",
    logo: MetaAdsLogo,
    color: "blue"
  },
  tiktok_ads: {
    name: "TikTok Ads",
    description: "Short-form video advertising",
    logo: TikTokAdsLogo,
    color: "gray"
  },
  linkedin_ads: {
    name: "LinkedIn Ads",
    description: "Professional network advertising", 
    logo: LinkedInAdsLogo,
    color: "blue"
  }
};

const ConnectedAccountsList = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadConnectedAccounts();
    }
  }, [user]);

  const loadConnectedAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_accounts')
        .select('id, platform, account_name, connected_at, is_active')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setConnectedAccounts(data || []);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformKey: string) => {
    const enabled = isPlatformEnabled(platformKey);
    
    if (!enabled) {
      if (platformKey === 'google_ads') {
        toast({
          title: "Configuration Required 🔧",
          description: "Google Ads integration requires proper OAuth setup. Please contact support to configure your Google OAuth credentials.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Coming Soon! 🚀",
          description: `${platformConfig[platformKey as keyof typeof platformConfig]?.name} integration is currently being developed and will be available soon!`,
        });
      }
      return;
    }

    try {
      console.log(`Connecting to ${platformConfig[platformKey as keyof typeof platformConfig]?.name}...`);
      initiateOAuth(platformKey);
    } catch (error: unknown) {
      console.error('OAuth initiation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate connection. Please try again.';
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('ad_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Account Disconnected",
        description: "Your account has been successfully disconnected.",
      });

      loadConnectedAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const allPlatforms = Object.keys(platformConfig);
  const connectedPlatforms = connectedAccounts.map(acc => acc.platform);
  const availablePlatforms = allPlatforms.filter(platform => !connectedPlatforms.includes(platform));

  return (
    <div className="space-y-6">
      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>
          <div className="grid gap-4">
            {connectedAccounts.map((account) => {
              const config = platformConfig[account.platform as keyof typeof platformConfig];
              if (!config) return null;

              return (
                <Card key={account.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <config.logo />
                        <div>
                          <h4 className="font-medium text-gray-900">{config.name}</h4>
                          <p className="text-sm text-gray-600">{account.account_name}</p>
                          <p className="text-xs text-gray-500">
                            Connected {new Date(account.connected_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(account.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      {availablePlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {connectedAccounts.length > 0 ? 'Add More Platforms' : 'Connect Your First Platform'}
          </h3>
          <div className="grid gap-4">
            {availablePlatforms.map((platformKey) => {
              const config = platformConfig[platformKey as keyof typeof platformConfig];
              const enabled = isPlatformEnabled(platformKey);
              const comingSoon = !['google_ads'].includes(platformKey);

              return (
                <Card key={platformKey} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <config.logo />
                        <div>
                          <h4 className="font-medium text-gray-900">{config.name}</h4>
                          <p className="text-sm text-gray-600">{config.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {enabled && !comingSoon ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Available
                          </Badge>
                        ) : platformKey === 'google_ads' && !enabled ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <Settings className="h-3 w-3 mr-1" />
                            Setup Required
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Coming Soon
                          </Badge>
                        )}
                        <Button 
                          variant={enabled && !comingSoon ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleConnect(platformKey)}
                          disabled={(!enabled && platformKey === 'google_ads') || comingSoon}
                        >
                          {platformKey === 'google_ads' && !enabled ? (
                            <>
                              <Settings className="h-4 w-4 mr-2" />
                              Contact Support
                            </>
                          ) : comingSoon ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Coming Soon
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* No accounts and all platforms coming soon */}
      {connectedAccounts.length === 0 && availablePlatforms.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">All available platforms are connected!</p>
        </div>
      )}
    </div>
  );
};

export default ConnectedAccountsList;