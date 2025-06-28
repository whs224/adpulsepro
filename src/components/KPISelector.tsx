import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TrendingUp, Users, DollarSign, Target, MousePointer, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const kpiOptions = [
  {
    id: "roas",
    label: "Return on Ad Spend (ROAS)",
    description: "Focus on maximizing revenue per dollar spent",
    icon: DollarSign,
    category: "Revenue"
  },
  {
    id: "cpa",
    label: "Cost Per Acquisition (CPA)",
    description: "Minimize cost to acquire new customers",
    icon: Target,
    category: "Acquisition"
  },
  {
    id: "ctr",
    label: "Click-Through Rate (CTR)",
    description: "Improve ad engagement and relevance",
    icon: MousePointer,
    category: "Engagement"
  },
  {
    id: "impressions",
    label: "Impressions & Reach",
    description: "Maximize brand visibility and awareness",
    icon: Eye,
    category: "Awareness"
  },
  {
    id: "conversions",
    label: "Conversion Rate",
    description: "Optimize for higher conversion rates",
    icon: TrendingUp,
    category: "Performance"
  },
  {
    id: "audience",
    label: "Audience Quality",
    description: "Focus on reaching high-value audiences",
    icon: Users,
    category: "Targeting"
  }
];

const KPISelector = () => {
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleKPIToggle = (kpiId: string) => {
    setSelectedKPIs(prev => 
      prev.includes(kpiId) 
        ? prev.filter(id => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  const handleGenerateReport = () => {
    console.log('Generating report with KPIs:', selectedKPIs);
    
    if (selectedKPIs.length === 0) {
      toast({
        title: "Please Select KPIs",
        description: "You need to select at least one KPI to generate a report.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate a report.",
      });
      navigate('/auth');
      return;
    }

    // Store selected KPIs in localStorage for the report page
    localStorage.setItem('selectedKPIs', JSON.stringify(selectedKPIs));
    
    toast({
      title: "Redirecting to Report Generation",
      description: "Taking you to the report page...",
    });
    
    navigate('/report');
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Matters Most to Your Business?
            </h2>
            <p className="text-lg text-gray-600">
              Select the KPIs you want to prioritize. Our AI will focus the analysis on your chosen metrics.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {kpiOptions.map((kpi) => (
              <Card 
                key={kpi.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedKPIs.includes(kpi.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleKPIToggle(kpi.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      checked={selectedKPIs.includes(kpi.id)}
                      onChange={() => handleKPIToggle(kpi.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <kpi.icon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{kpi.label}</CardTitle>
                      </div>
                      <CardDescription>{kpi.description}</CardDescription>
                      <div className="mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {kpi.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Your Personalized Report Will Include:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cross-platform performance analysis</li>
                <li>• Budget reallocation recommendations</li>
                <li>• Audience optimization strategies</li>
                <li>• Creative performance insights</li>
                <li>• Actionable next steps</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleGenerateReport}
              disabled={selectedKPIs.length === 0}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              Generate Report - $5 <span className="ml-2">📄</span>
            </Button>
            
            {selectedKPIs.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Please select at least one KPI to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KPISelector;
