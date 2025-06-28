
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Shield, Zap, FileText, BarChart, Coins } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced algorithms analyze your ad performance across all platforms to identify optimization opportunities."
  },
  {
    icon: BarChart,
    title: "Cross-Platform Insights",
    description: "Get a unified view of your Meta, Google, TikTok, and LinkedIn ad performance in one comprehensive report."
  },
  {
    icon: Zap,
    title: "Instant Optimization",
    description: "Receive actionable recommendations that you can implement immediately to improve your ad performance."
  },
  {
    icon: FileText,
    title: "Professional Reports",
    description: "Beautifully designed PDF reports that you can share with your team or clients."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption ensures your advertising data remains secure and private."
  },
  {
    icon: Coins,
    title: "Affordable Pricing",
    description: "Get professional-grade analysis for just $5 per report - no subscriptions or hidden fees."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Optimize Your Ads
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines the power of AI with deep advertising expertise to deliver 
              actionable insights that drive real results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
