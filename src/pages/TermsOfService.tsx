
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Please read these terms carefully before using AdPulse.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Terms of Service</CardTitle>
                <p className="text-gray-600">Last updated: December 29, 2024</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
                  <p className="text-gray-600">
                    By accessing and using AdPulse, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. Service Description</h3>
                  <p className="text-gray-600">
                    AdPulse is an AI-powered advertising analytics platform that connects to your advertising accounts to provide insights through conversational AI. We support Google Ads, Meta Ads, TikTok Ads, and LinkedIn Ads.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. User Accounts</h3>
                  <p className="text-gray-600">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Data Access and Privacy</h3>
                  <p className="text-gray-600">
                    By connecting your advertising accounts, you grant AdPulse read-only access to your advertising data. We do not store your advertising data permanently and only use it to generate the insights you request. We will never make changes to your advertising campaigns.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Subscription and Billing</h3>
                  <p className="text-gray-600">
                    Our service operates on a credit-based subscription model. Credits are consumed when you interact with our AI assistant. Subscriptions automatically renew monthly unless cancelled. You may cancel your subscription at any time from your account settings.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">6. Acceptable Use</h3>
                  <p className="text-gray-600">
                    You agree not to use AdPulse for any unlawful purposes or in any way that could damage, disable, or impair the service. You may not attempt to gain unauthorized access to any part of the service.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">7. Limitation of Liability</h3>
                  <p className="text-gray-600">
                    AdPulse shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Our total liability shall not exceed the amount paid by you for the service in the preceding 12 months.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">8. Changes to Terms</h3>
                  <p className="text-gray-600">
                    We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">9. Contact Information</h3>
                  <p className="text-gray-600">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-gray-600"><strong>Email:</strong> contact@adpulse.pro</p>
                    <p className="text-gray-600"><strong>Phone:</strong> 415-317-6427</p>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
