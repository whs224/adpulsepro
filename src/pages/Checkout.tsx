
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Shield, Check } from "lucide-react";

const Checkout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    email: user?.email || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    zipCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // This would integrate with Stripe or your payment processor
      console.log('Processing payment:', paymentData);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful!",
        description: "Your report will be delivered to your email within 24 hours.",
      });
      
      // Redirect to success page
      window.location.href = '/payment-success';
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please check your payment details and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Format card number
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.substring(0, 19);
    }
    
    // Format expiry date
    if (e.target.name === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (value.length > 5) value = value.substring(0, 5);
    }
    
    // Limit CVV
    if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) value = value.substring(0, 4);
    }
    
    setPaymentData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Complete Your Order
              </h1>
              <p className="text-lg text-gray-600">
                Get your professional ad performance report for just $5
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="font-medium">AdPulse Professional Report</span>
                    <span className="font-bold">$5.00</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-600" />
                      Cross-platform analysis
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-600" />
                      AI-powered recommendations
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-600" />
                      Professional PDF report
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-600" />
                      Delivered within 24 hours
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>$5.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={paymentData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your@email.com"
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-600">Report will be sent to this email</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={paymentData.expiryDate}
                          onChange={handleInputChange}
                          required
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={handleInputChange}
                          required
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Cardholder Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={paymentData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={paymentData.zipCode}
                        onChange={handleInputChange}
                        required
                        placeholder="12345"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        {loading ? 'Processing...' : 'Complete Payment - $5.00'}
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        🔒 Your payment information is secure and encrypted
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
