
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AuthModal from "./AuthModal";

const Header = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <>
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">AdOptimize</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => handleAuthClick('login')}
              className="text-gray-600 hover:text-gray-900"
            >
              Login
            </Button>
            <Button 
              onClick={() => handleAuthClick('signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>
      
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        mode={authMode}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
      />
    </>
  );
};

export default Header;
