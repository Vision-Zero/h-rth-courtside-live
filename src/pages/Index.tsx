import { Link } from 'react-router-dom';
import { Monitor, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hbcLogo from '@/assets/hbc-logo.webp';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background">
      <img src={hbcLogo} alt="Hürther BC" className="w-32 h-32 object-contain" />
      <h1 className="font-display text-5xl tracking-[0.3em] text-primary glow-yellow">
        HBC BROADCASTING
      </h1>
      <p className="text-muted-foreground text-lg max-w-md text-center">
        Professionelles Basketball-Broadcasting-System für den Hürther Basketball Club
      </p>
      <div className="flex gap-4">
        <Link to="/login">
          <Button size="lg" className="btn-press font-display tracking-wider text-lg px-8">
            <Settings className="w-5 h-5 mr-2" /> DASHBOARD
          </Button>
        </Link>
        <Link to="/overlay">
          <Button size="lg" variant="secondary" className="btn-press font-display tracking-wider text-lg px-8">
            <Monitor className="w-5 h-5 mr-2" /> OVERLAY
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Öffne das <strong>Dashboard</strong> zur Steuerung und das <strong>Overlay</strong> als Browser-Quelle in OBS.
      </p>
    </div>
  );
};

export default Index;
