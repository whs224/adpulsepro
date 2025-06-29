
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Shield, Zap, Clock, Users, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Simplify Complex Ad Analysis",
    description: "Transform hours of spreadsheet work into simple conversations. Ask plain English questions and get instant insights from all your ad platforms."
  },
  {
    icon: Zap,
    title: "Lightning-Fast Insights",
    description: "No more waiting for reports or manual data crunching. Get real-time analysis of your ad performance in seconds, not hours."
  },
  {
    icon: Users,
    title: "Team Collaboration Made Easy",
    description: "Share insights instantly with your team. Everyone can ask questions and get the same data-driven answers without technical expertise."
  },
  {
    icon: TrendingUp,
    title: "Cross-Platform Intelligence",
    description: "See the big picture across Google, Meta, TikTok, and LinkedIn ads. Compare performance and find opportunities you'd never spot manually."
  },
  {
    icon: Clock,
    title: "Save Hours Every Week",
    description: "Stop spending time pulling reports and building dashboards. Focus on strategy while AI handles the heavy lifting of data analysis."
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "Your advertising data is encrypted and secure. We use bank-level security to protect your sensitive business information."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Turn Complex Ad Data Into Simple Conversations
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Stop wrestling with spreadsheets and dashboards. Our AI makes ad analysis as easy as asking a question, 
              saving your team hours every week while delivering better insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors duration-300">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">
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
