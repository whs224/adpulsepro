import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
        console.log('Full URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('OAuth callback params:', { code: !!code, state, error, errorDescription });

        if (error) {
          console.error('OAuth error received:', error, errorDescription);
          throw new Error(`OAuth error: ${error} - ${errorDescription || 'Authentication failed'}`);
        }

        if (!code) {
          console.error('No authorization code received');
          throw new Error('No authorization code received from OAuth provider');
        }

        if (!state) {
          console.error('No state parameter received');
          throw new Error('No state parameter received - security validation failed');
        }

        // Parse platform from state and verify it
        const stateParts = state.split('_');
        console.log('State parts:', stateParts);
        
        if (stateParts.length < 2) {
          console.error('Invalid state format:', state);
          throw new Error('Invalid state parameter format');
        }

        const platform = stateParts[0];
        const storedState = localStorage.getItem(`oauth_state_${platform}`);
        
        console.log('Platform extracted:', platform);
        console.log('Stored state exists:', !!storedState);
        console.log('State match:', storedState === state);

        if (!storedState) {
          console.error('No stored state found for platform:', platform);
          throw new Error('No stored state found - possible session timeout');
        }

        if (storedState !== state) {
          console.error('State verification failed');
          throw new Error('State verification failed - possible security issue');
        }

        // Clean up stored state
        localStorage.removeItem(`oauth_state_${platform}`);
        
        console.log(`Processing OAuth callback for platform: ${platform} with code: ${code.substring(0, 10)}...`);
        setMessage(`Connecting your ${platform.replace('_', ' ')} account...`);

        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Please sign in to your AdPulse account first');
        }

        console.log('User authenticated:', session.user.email);

        // Exchange code for tokens using our edge function
        const { data, error: exchangeError } = await supabase.functions.invoke('oauth-exchange', {
          body: {
            platform,
            code,
            state
          }
        });

        if (exchangeError) {
          console.error('Token exchange failed:', exchangeError);
          throw new Error(exchangeError.message || 'Failed to exchange authorization code');
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to connect account');
        }

        setStatus('success');
        setMessage('Account connected successfully!');
        
        toast({
          title: "Account Connected Successfully! 🎉",
          description: `Your ${platform.replace('_', ' ')} account has been connected and is ready to use.`,
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
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

        // Redirect to dashboard after error
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'processing' && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Connecting Your Account</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-xs text-gray-400">Please wait while we verify your credentials...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you back to dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">We'll redirect you back to dashboard to try again.</p>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                💡 If this keeps happening, check your browser's developer console for detailed error logs.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
