
import { supabase } from "@/integrations/supabase/client";

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  enabled: boolean;
  description?: string;
}

const getOAuthConfigs = (): Record<string, OAuthConfig> => {
  // Get the current domain dynamically
  const currentDomain = window.location.origin;
  console.log('Current domain for OAuth:', currentDomain);
  
  // Get Google Client ID from environment variable or use the configured one
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "211962165284-t2thud65iqscunist7u0c37gl02ab931.apps.googleusercontent.com";
  console.log('Google Client ID found:', !!googleClientId);
  
  return {
    google_ads: {
      clientId: googleClientId || "",
      redirectUri: `${currentDomain}/oauth/callback`,
      scopes: ['https://www.googleapis.com/auth/adwords'],
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      enabled: !!googleClientId && googleClientId.trim() !== ""
    },
    meta_ads: {
      clientId: "YOUR_META_CLIENT_ID",
      redirectUri: `${currentDomain}/oauth/callback`,
      scopes: ['ads_read', 'ads_management', 'business_management'],
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      enabled: false, // Coming soon
      description: 'Coming soon'
    },
    tiktok_ads: {
      clientId: "YOUR_TIKTOK_CLIENT_ID",
      redirectUri: `${currentDomain}/oauth/callback`,
      scopes: ['advertiser.read', 'advertiser.write'],
      authUrl: 'https://business-api.tiktok.com/portal/auth',
      enabled: false, // Coming soon
      description: 'Coming soon'
    },
    linkedin_ads: {
      clientId: "77sa4cca5uo0vc",
      redirectUri: `${currentDomain}/oauth/callback`,
      scopes: ['r_ads', 'r_ads_reporting', 'r_organization_social', 'r_liteprofile'],
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      enabled: false, // Coming soon
      description: 'Coming soon'
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
    if (platform === 'google_ads') {
      throw new Error('Google Ads integration is not configured. Please contact support to set up your Google OAuth credentials.');
    }
    console.error(`${platform} integration is not enabled yet`);
    throw new Error(`${platform} integration is coming soon!`);
  }

  if (!config.clientId || config.clientId.trim() === "") {
    throw new Error('Google OAuth client ID is missing. Please contact support to configure the integration.');
  }

  // Generate a more secure state parameter with longer expiry
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const userHash = btoa(user.id).substring(0, 8); // Short hash of user ID
  const state = `${platform}_${timestamp}_${randomStr}_${userHash}`;

  console.log('Generated state for OAuth:', state);
  console.log('OAuth redirect URI:', config.redirectUri);

  // Store state in both localStorage and sessionStorage for redundancy
  const stateKey = `oauth_state_${platform}`;
  const stateData = {
    state,
    timestamp,
    platform,
    userId: user.id,
    expiresAt: timestamp + (30 * 60 * 1000) // 30 minutes expiry
  };

  try {
    localStorage.setItem(stateKey, JSON.stringify(stateData));
    sessionStorage.setItem(stateKey, JSON.stringify(stateData));
    console.log(`Stored state in both localStorage and sessionStorage: ${stateKey}`, stateData);
    console.log('Current localStorage keys:', Object.keys(localStorage));
    console.log('Current sessionStorage keys:', Object.keys(sessionStorage));
  } catch (error) {
    console.error('Failed to store OAuth state:', error);
    throw new Error('Failed to store OAuth state. Please ensure cookies/storage are enabled.');
  }

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
  
  // Use window.location.href for better compatibility
  window.location.href = authUrl;
};

// Helper function to retrieve and validate OAuth state
export const getStoredOAuthState = (platform: string) => {
  const stateKey = `oauth_state_${platform}`;
  
  // Try localStorage first, then sessionStorage
  let stateDataStr = localStorage.getItem(stateKey) || sessionStorage.getItem(stateKey);
  
  if (!stateDataStr) {
    console.error(`No stored state found for platform: ${platform}`);
    return null;
  }

  try {
    const stateData = JSON.parse(stateDataStr);
    
    // Check if state has expired
    if (Date.now() > stateData.expiresAt) {
      console.error('OAuth state has expired');
      // Clean up expired state
      localStorage.removeItem(stateKey);
      sessionStorage.removeItem(stateKey);
      return null;
    }

    return stateData;
  } catch (error) {
    console.error('Failed to parse stored OAuth state:', error);
    return null;
  }
};

// Helper function to clean up OAuth state
export const cleanupOAuthState = (platform: string) => {
  const stateKey = `oauth_state_${platform}`;
  localStorage.removeItem(stateKey);
  sessionStorage.removeItem(stateKey);
  console.log(`Cleaned up OAuth state for platform: ${platform}`);
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
