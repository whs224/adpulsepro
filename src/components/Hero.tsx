import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, DollarSign, Target, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleStartOptimizing = () => {
    navigate('/report');
  };

  const handleViewExample = () => {
    navigate('/report');
  };

  return (
    <section className="pt-24 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Optimize Your Ad Spend
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent block">
              Across All Platforms
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect your Meta, Google, TikTok, and LinkedIn ad accounts. Get a personalized 
            AI-powered optimization report for just $5 that shows you exactly how to improve your ROI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={handleStartOptimizing} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3">
              Start Optimizing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" onClick={handleViewExample} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-3">
              <FileText className="mr-2 h-5 w-5" />
              View Example Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Multi-Platform Analysis</h3>
              <p className="text-sm text-slate-400">Connect all your ad accounts in one place</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">AI-Powered Insights</h3>
              <p className="text-sm text-slate-400">Get personalized optimization strategies</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Affordable Reports</h3>
              <p className="text-sm text-slate-400">Comprehensive analysis for just $5</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
