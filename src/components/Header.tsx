
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import AuthModal from "./AuthModal";

const Header = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = (mode: 'login' | 'signup') => {
    if (user) return;
    navigate('/auth');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <header className="fixed top-0 w-full bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/ccada74d-80a1-45de-9c91-c3e558e1ff87.png" 
              alt="AdPulse Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 w-full bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/ccada74d-80a1-45de-9c91-c3e558e1ff87.png" 
              alt="AdPulse Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How it Works</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getUserInitials(user.user_metadata?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-300 text-sm hidden sm:inline">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:ml-2 sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => handleAuthClick('login')}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => handleAuthClick('signup')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  Get Started
                </Button>
              </>
            )}
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
