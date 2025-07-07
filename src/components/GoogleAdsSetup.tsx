import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, AlertCircle } from "lucide-react";

const GoogleAdsSetup = () => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔗</span>
          Google Ads Developer Token Required
        </CardTitle>
        <CardDescription>
          To connect your Google Ads account, we need a Google Ads Developer Token
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to apply for a Google Ads Developer Token to access the Google Ads API. 
            This is required to fetch your campaign data.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">How to get your Google Ads Developer Token:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Go to the Google Ads API Center</li>
            <li>Sign in with your Google Ads account</li>
            <li>Apply for a developer token (Basic Access level is sufficient)</li>
            <li>Wait for approval (usually takes 1-2 business days)</li>
            <li>Once approved, copy your developer token</li>
          </ol>
        </div>

        <div className="pt-4">
          <a
            href="https://developers.google.com/google-ads/api/docs/first-call/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Google Ads API Getting Started Guide
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <Alert className="mt-4">
          <AlertDescription>
            <strong>Note:</strong> The developer token is different from your OAuth tokens. 
            It's a one-time setup that allows your application to access Google Ads API.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default GoogleAdsSetup;