
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Download } from "lucide-react";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Payment Successful!
              </h1>
              <p className="text-xl text-gray-600">
                Thank you for your purchase. Your AdPulse report is being generated.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Email Confirmation</h3>
                    <p className="text-gray-600 text-sm">
                      You'll receive a confirmation email shortly with your order details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Download className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Report Generation</h3>
                    <p className="text-gray-600 text-sm">
                      Your professional PDF report will be delivered to your email within 24 hours.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-4">
                    Need help or have questions? Contact us at:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <a href="mailto:contact@adpulse.pro" className="text-blue-600 hover:underline">
                      contact@adpulse.pro
                    </a>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <a href="tel:415-317-6427" className="text-blue-600 hover:underline">
                      415-317-6427
                    </a>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={() => window.location.href = '/'} className="w-full">
                    Return to Homepage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
