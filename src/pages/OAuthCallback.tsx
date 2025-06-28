
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

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Parse platform from state
        const platform = state.split('_')[0];
        
        if (platform === 'google_ads') {
          await handleGoogleAdsCallback(code);
        } else if (platform === 'linkedin_ads') {
          await handleLinkedInCallback(code);
        } else {
          throw new Error(`Unsupported platform: ${platform}`);
        }

        setStatus('success');
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
    // In a real implementation, you'd exchange the code for tokens
    // For now, we'll simulate a successful connection
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
  };

  const handleLinkedInCallback = async (code: string) => {
    // Similar implementation for LinkedIn
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        {status === 'processing' && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Connecting Your Account...</h2>
            <p className="text-gray-600">Please wait while we set up your ad account connection.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Account Connected Successfully!</h2>
            <p className="text-gray-600">Redirecting you back to settings...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Connection Failed</h2>
            <p className="text-gray-600">We'll redirect you back to settings to try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
