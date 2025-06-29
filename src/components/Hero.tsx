
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-white/5 bg-grid-16 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with AI • Analyze Ads • Get Insights
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Stop Wrestling With
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Ad Spreadsheets
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform hours of manual ad analysis into simple conversations. 
            Connect your Google, Meta, TikTok, and LinkedIn ads, then chat with AI to get instant insights 
            that would take your team hours to compile.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            >
              Start Analyzing Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>

          {/* Value proposition highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">Save 10+ Hours Weekly</h3>
              <p className="text-slate-400 text-sm">
                No more manual report building. Ask questions in plain English and get instant, comprehensive analysis.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">All Platforms, One Place</h3>
              <p className="text-slate-400 text-sm">
                Connect Google Ads, Meta, TikTok, and LinkedIn. Compare performance across all channels effortlessly.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">Team-Ready Insights</h3>
              <p className="text-slate-400 text-sm">
                Share AI-generated insights with your team. Everyone gets the same data-driven answers, instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
