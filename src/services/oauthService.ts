
import { supabase } from "@/integrations/supabase/client";

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  enabled: boolean;
}

const getOAuthConfigs = (): Record<string, OAuthConfig> => {
  const baseUrl = 'https://adpulse.pro';
  
  return {
    google_ads: {
      clientId: "211962165284-laf0vao0gfeqsgtg22josn2n1pq9egg4.apps.googleusercontent.com",
      redirectUri: `${baseUrl}/oauth/google`,
      scopes: ['https://www.googleapis.com/auth/adwords'],
      authUrl: 'https://accounts.google.com/oauth2/auth',
      enabled: true
    },
    meta_ads: {
      clientId: "YOUR_META_CLIENT_ID",
      redirectUri: `${baseUrl}/oauth/meta`,
      scopes: ['ads_read'],
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      enabled: false // Coming soon
    },
    tiktok_ads: {
      clientId: "YOUR_TIKTOK_CLIENT_ID",
      redirectUri: `${baseUrl}/oauth/tiktok`,
      scopes: ['advertiser.read'],
      authUrl: 'https://business-api.tiktok.com/portal/auth',
      enabled: false // Coming soon
    },
    linkedin_ads: {
      clientId: "77sa4cca5uo0vc",
      redirectUri: `${baseUrl}/oauth/linkedin`,
      scopes: ['r_ads', 'r_ads_reporting'],
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      enabled: true
    }
  };
};

export const initiateOAuth = (platform: string) => {
  console.log(`Initiating OAuth for platform: ${platform}`);
  const configs = getOAuthConfigs();
  const config = configs[platform];
  
  if (!config) {
    console.error(`OAuth configuration not found for platform: ${platform}`);
    throw new Error(`OAuth configuration not found for platform: ${platform}`);
  }

  if (!config.enabled) {
    console.error(`${platform} integration is not enabled yet`);
    throw new Error(`${platform} integration is coming soon!`);
  }

  const state = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: state
  });

  const authUrl = `${config.authUrl}?${params.toString()}`;
  console.log(`Redirecting to OAuth URL: ${authUrl}`);
  
  // Store the state for verification when the user returns
  localStorage.setItem(`oauth_state_${platform}`, state);
  
  window.location.href = authUrl;
};

export const saveAdAccount = async (
  platform: string,
  accountId: string,
  accountName: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: Date
) => {
  console.log(`Saving ad account for platform: ${platform}`);
  
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    console.error('User not authenticated when trying to save ad account');
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('ad_accounts')
    .upsert({
      user_id: user.user.id,
      platform,
      account_id: accountId,
      account_name: accountName,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt?.toISOString(),
      is_active: true
    }, {
      onConflict: 'user_id,platform,account_id'
    });

  if (error) {
    console.error('Error saving ad account:', error);
    throw error;
  }
  
  console.log('Ad account saved successfully:', data);
  return data;
};

export const isPlatformEnabled = (platform: string): boolean => {
  const configs = getOAuthConfigs();
  const enabled = configs[platform]?.enabled || false;
  console.log(`Platform ${platform} enabled: ${enabled}`);
  return enabled;
};

export const getConnectedAccounts = async () => {
  console.log('Fetching connected accounts');
  
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    console.error('User not authenticated when fetching connected accounts');
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching connected accounts:', error);
    throw error;
  }

  console.log('Connected accounts fetched:', data);
  return data || [];
};
