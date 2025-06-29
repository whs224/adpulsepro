import { supabase } from "@/integrations/supabase/client";

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  enabled: boolean;
}

const getOAuthConfigs = (): Record<string, OAuthConfig> => {
  // Get the current domain dynamically
  const currentDomain = window.location.origin;
  console.log('Current domain for OAuth:', currentDomain);
  
  return {
    google_ads: {
      clientId: "211962165284-laf0vao0gfeqsgtg22josn2n1pq9egg4.apps.googleusercontent.com",
      redirectUri: `${currentDomain}/oauth/callback`,
      scopes: ['https://www.googleapis.com/auth/adwords.readonly'],
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      enabled: true
    },
    meta_ads: {
      clientId: "YOUR_META_CLIENT_ID",
      redirectUri: `${currentDomain}/oauth/callback`,
      scopes: ['ads_read', 'ads_management', 'business_management'],
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      enabled: true // Enabled for development - needs Meta Business verification for production
    },
    tiktok_ads: {
      clientId: "YOUR_TIKTOK_CLIENT_ID",
      redirectUri: `${currentDomain}/oauth/callback`,
      scopes: ['advertiser.read', 'advertiser.write'],
      authUrl: 'https://business-api.tiktok.com/portal/auth',
      enabled: true // Enabled for development - needs TikTok Business verification for production
    },
    linkedin_ads: {
      clientId: "77sa4cca5uo0vc",
      redirectUri: `${currentDomain}/oauth/callback`,
      scopes: ['r_ads', 'r_ads_reporting', 'r_organization_social', 'r_liteprofile'],
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      enabled: true
    }
  };
};

export const initiateOAuth = async (platform: string) => {
  console.log(`Initiating OAuth for platform: ${platform}`);
  
  // Check if user is authenticated first
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('User not authenticated when trying to initiate OAuth');
    throw new Error('Please sign in to your AdPulse account first');
  }

  console.log('User authenticated for OAuth:', user.email);

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

  // Generate a more secure state parameter
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const userHash = btoa(user.id).substring(0, 8); // Short hash of user ID
  const state = `${platform}_${timestamp}_${randomStr}_${userHash}`;

  console.log('Generated state for OAuth:', state);
  console.log('OAuth redirect URI:', config.redirectUri);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: state,
    access_type: 'offline', // For Google to get refresh token
    prompt: 'consent' // Force consent screen to ensure we get refresh token
  });

  const authUrl = `${config.authUrl}?${params.toString()}`;
  console.log(`Redirecting to OAuth URL: ${authUrl}`);
  
  // Store the state for verification when the user returns
  localStorage.setItem(`oauth_state_${platform}`, state);
  console.log(`Stored state in localStorage: oauth_state_${platform}`);
  
  // Use window.location.href for better compatibility
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

  // Enforce ad account connection limit based on plan
  const { data: credits } = await supabase
    .from('user_credits')
    .select('max_team_members')
    .eq('user_id', user.user.id)
    .eq('is_active', true)
    .single();

  const { count: accountCount } = await supabase
    .from('ad_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.user.id)
    .eq('is_active', true);

  if (credits && typeof accountCount === 'number' && accountCount >= credits.max_team_members) {
    throw new Error('You have reached the maximum number of connected ad accounts for your plan. Please upgrade your plan to connect more.');
  }

  console.log('Saving ad account for user:', user.user.email);

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
