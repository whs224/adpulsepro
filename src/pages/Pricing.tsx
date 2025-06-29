
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const pricingPlans = [
  {
    name: "Starter",
    price: 29,
    credits: 100,
    support: "No",
    teamAccess: "1 user",
    features: [
      "100 AI Q&A messages per month",
      "Connect unlimited ad accounts",
      "Real-time data analysis",
      "Cross-platform insights",
      "Basic reporting",
      "Email support"
    ]
  },
  {
    name: "Growth",
    price: 79,
    credits: 500,
    support: "Yes",
    teamAccess: "3 users",
    popular: true,
    features: [
      "500 AI Q&A messages per month",
      "Everything in Starter",
      "Priority support",
      "Team collaboration",
      "Advanced analytics",
      "Custom integrations",
      "API access"
    ]
  },
  {
    name: "Scale",
    price: 199,
    credits: 2000,
    support: "Premium",
    teamAccess: "10 users",
    features: [
      "2000 AI Q&A messages per month",
      "Everything in Growth",
      "Premium support",
      "White-label options",
      "Custom AI training",
      "Dedicated account manager",
      "SLA guarantee"
    ]
  }
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = (planName: string) => {
    if (user) {
      navigate('/dashboard');
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
              Monthly Subscription with "Smart Analyst" Access
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Choose the plan that fits your needs. Chat with AI about your ad performance with monthly message credits.
            </p>
            <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg inline-block">
              <span className="text-sm">📊 Each "report request" is just a message — it's cheaper for you, and more flexible for them.</span>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <Card key={plan.name} className={`relative overflow-hidden ${plan.popular ? 'border-2 border-blue-500 shadow-2xl' : 'border shadow-lg'}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2">
                      <span className="font-semibold">🚀 Most Popular</span>
                    </div>
                  )}
                  
                  <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'} pb-8`}>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-blue-600">${plan.price}</span>
                      <span className="text-lg text-gray-600 ml-2">per month</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-gray-900">
                        {plan.credits} AI Q&A messages
                      </div>
                      <div className="text-sm text-gray-600">
                        Priority Support: {plan.support}
                      </div>
                      <div className="text-sm text-gray-600">
                        Team Access: {plan.teamAccess}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-8 pb-8">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      onClick={() => handleGetStarted(plan.name)}
                      className={`w-full py-3 ${plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      {user ? 'Go to Dashboard' : 'Start Free Trial'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-gray-50 rounded-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">All Plans Include:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Connect Google Ads, Meta, TikTok & LinkedIn</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Real-time AI analysis and insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Cross-platform performance comparisons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Secure OAuth integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Natural language queries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>24/7 data monitoring</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              🔒 Secure payment • Cancel anytime • 14-day free trial
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
