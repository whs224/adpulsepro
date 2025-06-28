
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { saveAdAccount } from "@/services/oauthService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your connection...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth callback initiated');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('OAuth callback params:', { code: !!code, state, error, errorDescription });

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          throw new Error(`OAuth error: ${error} - ${errorDescription || 'Authentication failed'}`);
        }

        if (!code || !state) {
          console.error('Missing required OAuth parameters');
          throw new Error('Missing authorization code or state parameter');
        }

        // Parse platform from state and verify it
        const platform = state.split('_')[0];
        const storedState = localStorage.getItem(`oauth_state_${platform}`);
        
        if (!storedState || storedState !== state) {
          console.error('State verification failed');
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        // Clean up stored state
        localStorage.removeItem(`oauth_state_${platform}`);
        
        console.log(`Processing OAuth callback for platform: ${platform}`);
        setMessage(`Connecting your ${platform.replace('_', ' ')} account...`);

        if (platform === 'google_ads') {
          await handleGoogleAdsCallback(code);
        } else if (platform === 'linkedin_ads') {
          await handleLinkedInCallback(code);
        } else {
          throw new Error(`Unsupported platform: ${platform}`);
        }

        setStatus('success');
        setMessage('Account connected successfully!');
        
        toast({
          title: "Account Connected Successfully! 🎉",
          description: `Your ${platform.replace('_', ' ')} account has been connected and is ready to use.`,
        });

        // Redirect to settings after a short delay
        setTimeout(() => {
          navigate('/settings');
        }, 2000);

      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to connect your account');
        
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect your account. Please try again.",
          variant: "destructive",
        });

        // Redirect to settings after error
        setTimeout(() => {
          navigate('/settings');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, toast]);

  const handleGoogleAdsCallback = async (code: string) => {
    console.log('Processing Google Ads callback');
    
    // In a real implementation, you'd exchange the code for tokens via your backend
    // For now, we'll simulate a successful connection with mock data
    const mockAccountData = {
      account_id: 'gads_' + Math.random().toString(36).substr(2, 9),
      account_name: 'Google Ads Account',
      access_token: 'mock_google_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_at: new Date(Date.now() + 3600000) // 1 hour from now
    };

    await saveAdAccount(
      'google_ads',
      mockAccountData.account_id,
      mockAccountData.account_name,
      mockAccountData.access_token,
      mockAccountData.refresh_token,
      mockAccountData.expires_at
    );
    
    console.log('Google Ads account saved successfully');
  };

  const handleLinkedInCallback = async (code: string) => {
    console.log('Processing LinkedIn Ads callback');
    
    // In a real implementation, you'd exchange the code for tokens via your backend
    // For now, we'll simulate a successful connection with mock data
    const mockAccountData = {
      account_id: 'lnkd_' + Math.random().toString(36).substr(2, 9),
      account_name: 'LinkedIn Ads Account',
      access_token: 'mock_linkedin_token_' + Date.now(),
    };

    await saveAdAccount(
      'linkedin_ads',
      mockAccountData.account_id,
      mockAccountData.account_name,
      mockAccountData.access_token
    );
    
    console.log('LinkedIn Ads account saved successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'processing' && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Connecting Your Account</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you back to settings...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">We'll redirect you back to settings to try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
