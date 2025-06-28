
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import PlatformConnections from "@/components/PlatformConnections";
import KPISelector from "@/components/KPISelector";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <PlatformConnections />
      <KPISelector />
      <Footer />
    </div>
  );
};

export default Index;
