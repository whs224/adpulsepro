
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Target, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About AdPulse
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to make advertising analytics accessible to everyone through the power of conversational AI.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Mission Section */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto leading-relaxed">
                  Marketing shouldn't require a data science degree. We believe every business owner and marketer 
                  should be able to understand their advertising performance through simple conversations with AI, 
                  not complex dashboards and spreadsheets.
                </p>
              </CardContent>
            </Card>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Simplicity First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Complex analytics made as simple as having a conversation. No training required.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Get insights in seconds, not hours. Spend time on strategy, not data crunching.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Actionable Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Not just data - get specific recommendations you can act on immediately.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Team-Focused</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Built for teams that need to collaborate and share insights effortlessly.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Story Section */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Our Story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  AdPulse was born from frustration. As marketers ourselves, we were tired of spending hours 
                  every week pulling data from different platforms, building reports, and trying to make sense 
                  of it all in spreadsheets.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We realized that with advances in AI, there had to be a better way. Why couldn't we just ask 
                  questions about our ad performance and get instant, intelligent answers?
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  That's exactly what AdPulse does. We've created an AI assistant that connects to your advertising 
                  accounts and can answer any question about your campaigns, audiences, costs, and performance - 
                  all through simple conversation.
                </p>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-center">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-600 text-center mb-6">
                  We'd love to hear from you. Whether you have questions, feedback, or just want to chat 
                  about advertising, we're here to help.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">📧</span>
                    <a href="mailto:contact@adpulse.pro" className="text-blue-600 hover:underline text-lg">
                      contact@adpulse.pro
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">📞</span>
                    <a href="tel:415-317-6427" className="text-blue-600 hover:underline text-lg">
                      415-317-6427
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
