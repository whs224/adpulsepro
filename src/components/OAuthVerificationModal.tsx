
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Shield, AlertTriangle } from "lucide-react";

interface OAuthVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  platform: string;
}

const OAuthVerificationModal = ({ isOpen, onClose, onProceed, platform }: OAuthVerificationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            OAuth App Verification
          </DialogTitle>
          <DialogDescription>
            You may see a "Google hasn't verified this app" warning during the connection process.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This is normal for apps in development. Your data remains secure and encrypted.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3 text-sm">
            <p className="font-medium">If you see the verification warning:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Click "Advanced" at the bottom left</li>
              <li>Click "Go to [domain] (unsafe)"</li>
              <li>Continue with the normal OAuth flow</li>
            </ol>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Why this happens:</strong> Google shows this warning for apps that haven't completed their verification process. Your connection is still secure.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col gap-2">
          <Button onClick={onProceed} className="w-full">
            Continue to {platform}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OAuthVerificationModal;
