
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/report');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get professional ad performance insights for a fraction of what agencies charge. 
              No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden border-2 border-blue-500 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2">
                <span className="font-semibold">🚀 MVP Launch Special</span>
              </div>
              
              <CardHeader className="text-center pt-12 pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  Professional Ad Report
                </CardTitle>
                <div className="mb-6">
                  <span className="text-6xl font-bold text-blue-600">$5</span>
                  <span className="text-xl text-gray-600 ml-2">per report</span>
                </div>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  Get a comprehensive analysis of your ad performance across all platforms with AI-powered recommendations.
                </p>
              </CardHeader>

              <CardContent className="px-8 pb-12">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">What's Included:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Cross-platform performance analysis</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>AI-powered optimization recommendations</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Budget reallocation suggestions</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Audience & demographic insights</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Campaign performance breakdown</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Professional PDF report</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Supported Platforms:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-blue-600" />
                        <span>Google Ads</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-blue-600" />
                        <span>Meta Ads (Facebook & Instagram)</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-blue-600" />
                        <span>TikTok Ads</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-blue-600" />
                        <span>LinkedIn Ads</span>
                      </li>
                    </ul>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Why $5?</h4>
                      <p className="text-sm text-blue-800">
                        We're in MVP mode and testing market interest. This is a fraction of what agencies charge 
                        for similar analysis ($500+). Help us validate our product!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl"
                  >
                    Get Your Report Now
                  </Button>
                  <p className="text-sm text-gray-500 mt-4">
                    Secure payment • Instant delivery • 100% satisfaction guarantee
                  </p>
                </div>

                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-center font-semibold text-lg mb-6">Frequently Asked Questions</h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">How long does it take?</h4>
                      <p className="text-gray-600">Reports are typically generated and delivered within 24 hours.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Is my data secure?</h4>
                      <p className="text-gray-600">Yes, we use secure OAuth connections and encrypt all data. Your information is never shared.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Can I get multiple reports?</h4>
                      <p className="text-gray-600">Absolutely! Each report is $5, generate as many as you need.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">What if I'm not satisfied?</h4>
                      <p className="text-gray-600">We offer a 100% money-back guarantee if you're not happy with your report.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
