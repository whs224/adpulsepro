
import { supabase } from "@/integrations/supabase/client";

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
}

const getOAuthConfigs = (): Record<string, OAuthConfig> => {
  const baseUrl = window.location.origin;
  
  return {
    google_ads: {
      clientId: "YOUR_GOOGLE_CLIENT_ID", // This will need to be configured
      redirectUri: `${baseUrl}/oauth/google`,
      scopes: ['https://www.googleapis.com/auth/adwords'],
      authUrl: 'https://accounts.google.com/oauth2/auth'
    },
    meta_ads: {
      clientId: "YOUR_META_CLIENT_ID", // This will need to be configured
      redirectUri: `${baseUrl}/oauth/meta`,
      scopes: ['ads_read'],
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
    },
    tiktok_ads: {
      clientId: "YOUR_TIKTOK_CLIENT_ID", // This will need to be configured
      redirectUri: `${baseUrl}/oauth/tiktok`,
      scopes: ['advertiser.read'],
      authUrl: 'https://business-api.tiktok.com/portal/auth'
    },
    linkedin_ads: {
      clientId: "YOUR_LINKEDIN_CLIENT_ID", // This will need to be configured
      redirectUri: `${baseUrl}/oauth/linkedin`,
      scopes: ['r_ads', 'r_ads_reporting'],
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization'
    }
  };
};

export const initiateOAuth = (platform: string) => {
  const configs = getOAuthConfigs();
  const config = configs[platform];
  
  if (!config) {
    throw new Error(`OAuth configuration not found for platform: ${platform}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: `${platform}_${Date.now()}` // Include platform and timestamp for security
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
