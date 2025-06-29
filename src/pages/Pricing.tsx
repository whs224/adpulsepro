
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
    users: 1,
    support: "Email",
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
    users: 3,
    support: "Priority",
    popular: true,
    features: [
      "500 AI Q&A messages per month",
      "Up to 3 team members",
      "Everything in Starter",
      "Priority support",
      "Team collaboration",
      "Advanced analytics",
      "Custom integrations"
    ]
  },
  {
    name: "Scale",
    price: 199,
    credits: 2000,
    users: 10,
    support: "Premium",
    features: [
      "2000 AI Q&A messages per month",
      "Up to 10 team members",
      "Everything in Growth",
      "Premium support",
      "White-label options",
      "Custom AI training",
      "Dedicated account manager"
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
              Simple Pricing That Scales With Your Business
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Choose the plan that fits your team size and analysis needs. Every plan includes unlimited ad account connections 
              and real-time AI analysis. Pay monthly with message credits that reset each billing cycle.
            </p>
            <div className="bg-blue-50 text-blue-800 px-6 py-3 rounded-lg inline-block">
              <span className="text-sm font-medium">💡 Each question to the AI counts as one message credit • No setup fees • Cancel anytime</span>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <Card key={plan.name} className={`relative overflow-hidden ${plan.popular ? 'border-2 border-blue-500 shadow-2xl scale-105' : 'border shadow-lg'}`}>
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
                        {plan.credits} AI messages/month
                      </div>
                      <div className="text-sm text-gray-600">
                        Up to {plan.users} team member{plan.users > 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-600">
                        {plan.support} support included
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
                      {user ? 'Upgrade to ' + plan.name : 'Start with ' + plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-gray-50 rounded-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6">How Credits Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>1 Credit = 1 AI Question:</strong> Ask "How did my Google Ads perform last week?" = 1 credit</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Team Sharing:</strong> All team members share the monthly credit pool across connected accounts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Monthly Reset:</strong> Credits refresh every billing cycle - unused credits don't roll over</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Unlimited Accounts:</strong> Connect as many ad accounts as you want at no extra cost</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Real-time Analysis:</strong> Every response includes live data from your connected platforms</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Secure & Private:</strong> Your ad data stays encrypted and is never shared</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              🔒 Secure payment • Cancel anytime • Enterprise pricing available for larger teams
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
