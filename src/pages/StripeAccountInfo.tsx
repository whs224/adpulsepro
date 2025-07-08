import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const StripeAccountInfo = () => {
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAccountInfo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-stripe-account');
      
      if (error) {
        throw error;
      }

      setAccountInfo(data.accountInfo);
      toast({ title: 'Account info retrieved successfully' });
    } catch (error) {
      console.error('Error fetching account info:', error);
      toast({ 
        title: 'Error fetching account info', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Stripe Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAccountInfo} disabled={loading} className="mb-4">
              {loading ? 'Loading...' : 'Get Account Info'}
            </Button>

            {accountInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Basic Information</h3>
                    <p><strong>Account ID:</strong> {accountInfo.id}</p>
                    <p><strong>Email:</strong> {accountInfo.email || 'Not set'}</p>
                    <p><strong>Country:</strong> {accountInfo.country}</p>
                    <p><strong>Currency:</strong> {accountInfo.default_currency?.toUpperCase()}</p>
                    <p><strong>Account Type:</strong> {accountInfo.type}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Business Profile</h3>
                    <p><strong>Business Name:</strong> {accountInfo.business_profile?.name || 'Not set'}</p>
                    <p><strong>Website:</strong> {accountInfo.business_profile?.url || 'Not set'}</p>
                    <p><strong>Support Email:</strong> {accountInfo.business_profile?.support_email || 'Not set'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Account Status</h3>
                  <div className="flex flex-wrap gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      accountInfo.details_submitted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Details {accountInfo.details_submitted ? 'Submitted' : 'Pending'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      accountInfo.charges_enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Charges {accountInfo.charges_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      accountInfo.payouts_enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Payouts {accountInfo.payouts_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div>
                  <p><strong>Account Created:</strong> {new Date(accountInfo.created * 1000).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StripeAccountInfo;