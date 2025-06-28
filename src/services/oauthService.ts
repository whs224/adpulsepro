
import { supabase } from "@/integrations/supabase/client";

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  enabled: boolean;
}

const getOAuthConfigs = (): Record<string, OAuthConfig> => {
  const baseUrl = window.location.origin;
  
  return {
    google_ads: {
      clientId: "YOUR_GOOGLE_CLIENT_ID", // Please provide this again
      redirectUri: `${baseUrl}/oauth/google`,
      scopes: ['https://www.googleapis.com/auth/adwords'],
      authUrl: 'https://accounts.google.com/oauth2/auth',
      enabled: true // Set to true when you provide the credentials
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
  const configs = getOAuthConfigs();
  const config = configs[platform];
  
  if (!config) {
    throw new Error(`OAuth configuration not found for platform: ${platform}`);
  }

  if (!config.enabled) {
    throw new Error(`${platform} integration is coming soon!`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: `${platform}_${Date.now()}`
  });

  const authUrl = `${config.authUrl}?${params.toString()}`;
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
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

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
    });

  if (error) throw error;
  return data;
};

export const isPlatformEnabled = (platform: string): boolean => {
  const configs = getOAuthConfigs();
  return configs[platform]?.enabled || false;
};
