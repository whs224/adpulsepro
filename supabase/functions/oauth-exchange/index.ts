
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OAuthExchangeRequest {
  platform: string;
  code: string;
  state: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, code, state }: OAuthExchangeRequest = await req.json();
    console.log(`OAuth exchange for platform: ${platform}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the current domain for redirect URI
    const origin = req.headers.get('origin') || 'https://your-app.lovableproject.com';
    const redirectUri = `${origin}/oauth/callback`;

    let tokenData;
    let accountInfo;

    if (platform === 'google_ads') {
      tokenData = await exchangeGoogleAdsToken(code, redirectUri);
      accountInfo = await fetchGoogleAdsAccountInfo(tokenData.access_token);
    } else if (platform === 'linkedin_ads') {
      tokenData = await exchangeLinkedInToken(code, redirectUri);
      accountInfo = await fetchLinkedInAccountInfo(tokenData.access_token);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Save the ad account
    const { error: saveError } = await supabase
      .from('ad_accounts')
      .upsert({
        user_id: user.id,
        platform,
        account_id: accountInfo.id,
        account_name: accountInfo.name,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_at ? new Date(tokenData.expires_at).toISOString() : null,
        is_active: true
      }, {
        onConflict: 'user_id,platform,account_id'
      });

    if (saveError) {
      console.error('Error saving ad account:', saveError);
      throw saveError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        account: { 
          id: accountInfo.id, 
          name: accountInfo.name, 
          platform 
        } 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("OAuth exchange error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

async function exchangeGoogleAdsToken(code: string, redirectUri: string) {
  console.log('Exchanging Google Ads token...');
  
  const clientId = "211962165284-laf0vao0gfeqsgtg22josn2n1pq9egg4.apps.googleusercontent.com";
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  if (!clientSecret) {
    throw new Error('Google Client Secret not configured');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Google token exchange failed:', errorText);
    throw new Error(`Failed to exchange Google token: ${errorText}`);
  }

  const tokens = await tokenResponse.json();
  console.log('Google tokens received successfully');

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : null
  };
}

async function fetchGoogleAdsAccountInfo(accessToken: string) {
  console.log('Fetching Google Ads account info...');

  // Get user's accessible customers
  const customersResponse = await fetch('https://googleads.googleapis.com/v17/customers:listAccessibleCustomers', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || 'YOUR_DEVELOPER_TOKEN',
    },
  });

  if (!customersResponse.ok) {
    const errorText = await customersResponse.text();
    console.error('Failed to fetch Google Ads customers:', errorText);
    throw new Error(`Failed to fetch Google Ads account info: ${errorText}`);
  }

  const customers = await customersResponse.json();
  console.log('Google Ads customers fetched:', customers);

  // Use the first customer or implement customer selection logic
  const firstCustomer = customers.resourceNames?.[0];
  if (!firstCustomer) {
    throw new Error('No Google Ads accounts found');
  }

  const customerId = firstCustomer.split('/')[1];
  
  return {
    id: customerId,
    name: `Google Ads Account (${customerId})`
  };
}

async function exchangeLinkedInToken(code: string, redirectUri: string) {
  console.log('Exchanging LinkedIn token...');
  
  const clientId = "77sa4cca5uo0vc";
  const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
  
  if (!clientSecret) {
    throw new Error('LinkedIn Client Secret not configured');
  }

  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('LinkedIn token exchange failed:', errorText);
    throw new Error(`Failed to exchange LinkedIn token: ${errorText}`);
  }

  const tokens = await tokenResponse.json();
  console.log('LinkedIn tokens received successfully');

  return {
    access_token: tokens.access_token,
    refresh_token: null, // LinkedIn doesn't provide refresh tokens by default
    expires_at: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : null
  };
}

async function fetchLinkedInAccountInfo(accessToken: string) {
  console.log('Fetching LinkedIn account info...');

  // Get LinkedIn ad accounts
  const accountsResponse = await fetch('https://api.linkedin.com/rest/adAccounts?q=search&search=(status:(values:List(ACTIVE)))', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'LinkedIn-Version': '202404',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  if (!accountsResponse.ok) {
    const errorText = await accountsResponse.text();
    console.error('Failed to fetch LinkedIn ad accounts:', errorText);
    throw new Error(`Failed to fetch LinkedIn account info: ${errorText}`);
  }

  const accounts = await accountsResponse.json();
  console.log('LinkedIn ad accounts fetched:', accounts);

  // Use the first account or implement account selection logic
  const firstAccount = accounts.elements?.[0];
  if (!firstAccount) {
    throw new Error('No LinkedIn ad accounts found');
  }

  return {
    id: firstAccount.id.toString(),
    name: firstAccount.name || `LinkedIn Ads Account (${firstAccount.id})`
  };
}

serve(handler);
