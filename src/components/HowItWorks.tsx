
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Connect Your Accounts",
    description: "Securely link your Meta, Google, TikTok, and LinkedIn advertising accounts using official APIs.",
    color: "from-blue-500 to-blue-600"
  },
  {
    step: "02", 
    title: "Choose Your Focus",
    description: "Select the KPIs that matter most to your business - ROAS, CPA, conversions, or brand awareness.",
    color: "from-blue-400 to-blue-500"
  },
  {
    step: "03",
    title: "AI Analysis",
    description: "Our advanced algorithms analyze your data across platforms and identify optimization opportunities.",
    color: "from-blue-600 to-blue-700"
  },
  {
    step: "04",
    title: "Get Your Report",
    description: "Receive a beautifully designed PDF with actionable insights and specific recommendations for improvement.",
    color: "from-blue-500 to-blue-600"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Get professional ad optimization insights in just 4 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="bg-slate-900 border-slate-700 hover:bg-slate-850 transition-colors duration-300 h-full">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-white text-center">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-center leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
