
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Settings, BarChart3 } from "lucide-react";
import ConnectedAccountsList from "@/components/ConnectedAccountsList";
import AdAnalyticsChat from "@/components/AdAnalyticsChat";
import AdDataDashboard from "@/components/AdDataDashboard";
import CreditDisplay from "@/components/CreditDisplay";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Admin from "@/pages/Admin";
import { Routes, Route } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const platformConnectionsRef = useRef<HTMLDivElement>(null);

  const goToAccountsTab = () => {
    setActiveTab('settings');
    setTimeout(() => {
      platformConnectionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-gray-600">
            Chat with AI to get instant insights from your ad campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CreditDisplay />
          </div>
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect your ad accounts to see performance metrics here
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ad Performance
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <Card className="h-[800px]">
              <CardHeader>
                <CardTitle>Chat with AI Assistant</CardTitle>
                <CardDescription>
                  Ask questions about your ad performance in plain English
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                <AdAnalyticsChat />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <AdDataDashboard goToAccountsTab={goToAccountsTab} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div ref={platformConnectionsRef} />
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Connect your advertising accounts to start getting insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConnectedAccountsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
