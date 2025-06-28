
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Last updated: December 28, 2024
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  AdPulse ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our advertising analytics service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none space-y-4">
                <div>
                  <h4 className="font-semibold">Account Information</h4>
                  <p>When you create an account, we collect your email address, name, and password.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Advertising Data</h4>
                  <p>When you connect your advertising accounts (Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads), we access and collect:</p>
                  <ul className="list-disc ml-6">
                    <li>Campaign performance metrics (impressions, clicks, conversions, spend)</li>
                    <li>Campaign names and settings</li>
                    <li>Audience demographics and targeting data</li>
                    <li>Ad creative performance data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Usage Information</h4>
                  <p>We collect information about how you use our service, including pages visited, features used, and report generation activity.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>We use your information to:</p>
                <ul className="list-disc ml-6">
                  <li>Provide and maintain our advertising analytics service</li>
                  <li>Generate personalized performance reports and recommendations</li>
                  <li>Process payments for report generation</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Improve our AI analysis and recommendation algorithms</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. OAuth and Third-Party Integrations</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  We use OAuth 2.0 to securely connect to your advertising accounts. This means:
                </p>
                <ul className="list-disc ml-6">
                  <li>We never store your advertising platform passwords</li>
                  <li>You can revoke access at any time through your advertising platform settings</li>
                  <li>We only access data necessary for generating your reports</li>
                  <li>All connections use encrypted, industry-standard security protocols</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. AI Processing and Data Analysis</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  We use artificial intelligence (OpenAI) to analyze your advertising data and generate insights. Your data is:
                </p>
                <ul className="list-disc ml-6">
                  <li>Processed securely and in compliance with AI provider terms</li>
                  <li>Used only to generate your specific reports and recommendations</li>
                  <li>Not used to train AI models or shared with other users</li>
                  <li>Transmitted using encrypted connections</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Data Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>We do not sell, trade, or rent your personal information. We may share your information only in these limited circumstances:</p>
                <ul className="list-disc ml-6">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, property, or safety, or that of others</li>
                  <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>We implement robust security measures including:</p>
                <ul className="list-disc ml-6">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure OAuth 2.0 authentication</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access controls and employee training</li>
                  <li>Secure cloud infrastructure (Supabase)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  We retain your data only as long as necessary to provide our services. You can request deletion of your account and associated data at any time. Some data may be retained for legal compliance purposes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>You have the right to:</p>
                <ul className="list-disc ml-6">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Disconnect advertising accounts at any time</li>
                  <li>Export your data</li>
                  <li>Object to processing of your data</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  We use minimal cookies and tracking technologies necessary for authentication, security, and basic functionality. We do not use third-party advertising cookies or tracking pixels.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Your data may be processed and stored in the United States or other countries where our service providers operate. We ensure appropriate safeguards are in place for international transfers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>13. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> <a href="mailto:contact@adpulse.pro" className="text-blue-600 hover:underline">contact@adpulse.pro</a></li>
                  <li><strong>Phone:</strong> <a href="tel:415-317-6427" className="text-blue-600 hover:underline">415-317-6427</a></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
