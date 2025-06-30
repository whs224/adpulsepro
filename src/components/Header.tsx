import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Features', href: '/#features' },
    { name: 'How it Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-purple-600 shadow text-white py-4 px-8 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}> 
        <img src="/lovable-uploads/42d2f28c-5627-4568-937d-18299a06a8a2.png" alt="AdPulse Logo" className="h-10 w-10 rounded-lg bg-white p-1 shadow" />
        <span className="text-2xl font-bold">AdPulse</span>
      </div>
      <nav className="flex items-center gap-6">
        <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate("/dashboard")}>Dashboard</Button>
        <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate("/pricing")}>Pricing</Button>
        <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => navigate("/settings")}>Settings</Button>
        {user ? (
          <Button variant="outline" className="text-white border-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white transition-colors" onClick={signOut}>
            Sign Out
          </Button>
        ) : (
          <Button variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => navigate("/auth")}>Sign In</Button>
        )}
      </nav>
    </header>
  );
};

export default Header;
