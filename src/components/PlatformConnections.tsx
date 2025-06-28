
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";

const platforms = [
  {
    name: "Meta Ads",
    description: "Facebook & Instagram advertising",
    icon: "🔵",
    connected: false,
    color: "blue"
  },
  {
    name: "Google Ads",
    description: "Search, Display & YouTube advertising",
    icon: "🔴",
    connected: false,
    color: "red"
  },
  {
    name: "TikTok Ads",
    description: "TikTok for Business advertising",
    icon: "⚫",
    connected: false,
    color: "gray"
  },
  {
    name: "LinkedIn Ads",
    description: "Professional network advertising",
    icon: "🔷",
    connected: false,
    color: "blue"
  }
];

const PlatformConnections = () => {
  const handleConnect = (platformName: string) => {
    console.log(`Connecting to ${platformName}...`);
    // Platform connection logic will be implemented later
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
              Securely connect your advertising accounts to get comprehensive insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platforms.map((platform) => (
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
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {!platform.connected ? (
                    <Button 
                      onClick={() => handleConnect(platform.name)}
                      className="w-full"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect {platform.name}
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-600">
                      ✓ Account connected and data syncing
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-4">
              🔒 Your data is encrypted and secure. We only access the metrics needed for analysis.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformConnections;
