
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Clock } from "lucide-react";
import { isPlatformEnabled, initiateOAuth } from "@/services/oauthService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const platforms = [
  {
    key: "meta_ads",
    name: "Meta Ads",
    description: "Facebook & Instagram advertising",
    icon: "📘",
    connected: false,
    color: "blue"
  },
  {
    key: "google_ads",
    name: "Google Ads",
    description: "Search, Display & YouTube advertising",
    icon: "🔴",
    connected: false,
    color: "red"
  },
  {
    key: "tiktok_ads",
    name: "TikTok Ads",
    description: "TikTok for Business advertising",
    icon: "⚫",
    connected: false,
    color: "gray"
  },
  {
    key: "linkedin_ads",
    name: "LinkedIn Ads",
    description: "Professional network advertising",
    icon: "💼",
    connected: false,
    color: "blue"
  }
];

const PlatformConnections = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleConnect = (platform: any) => {
    const enabled = isPlatformEnabled(platform.key);
    
    if (!enabled) {
      toast({
        title: "Coming Soon! 🚀",
        description: `${platform.name} integration is currently being developed and will be available soon!`,
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect your ad accounts.",
      });
      navigate('/auth');
      return;
    }

    try {
      console.log(`Connecting to ${platform.name}...`);
      initiateOAuth(platform.key);
    } catch (error: any) {
      console.error('OAuth initiation failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to initiate connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Connect Your Ad Platforms
            </h2>
            <p className="text-lg text-gray-600">
              Securely connect your advertising accounts to chat with AI about your performance
            </p>
            <p className="text-sm text-blue-600 mt-2">
              🚀 Google Ads and LinkedIn Ads available now • Meta Ads and TikTok Ads coming soon!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map((platform) => {
              const enabled = isPlatformEnabled(platform.key);
              
              return (
                <Card key={platform.name} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                          <CardDescription>{platform.description}</CardDescription>
                        </div>
                      </div>
                      {platform.connected ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : enabled ? (
                        <Badge variant="outline">Available</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {!platform.connected ? (
                      <Button 
                        onClick={() => handleConnect(platform)}
                        className="w-full"
                        variant={enabled ? "outline" : "ghost"}
                        disabled={!enabled}
                      >
                        {enabled ? (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Connect {platform.name}
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            Coming Soon
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-600">
                        ✓ Account connected and data syncing
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-4">
              🔒 Your data is encrypted and secure. We only access the metrics needed for AI analysis.
            </p>
            <p className="text-sm text-blue-600">
              💡 Connect your accounts and start asking AI questions about your ad performance!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformConnections;
