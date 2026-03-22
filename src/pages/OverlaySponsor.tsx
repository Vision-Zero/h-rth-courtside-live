import { useEffect } from 'react';
import SponsorTicker from '@/components/overlay/SponsorTicker';

const OverlaySponsor = () => {
  useEffect(() => {
    document.documentElement.style.setProperty('background', 'transparent', 'important');
    document.body.style.setProperty('background', 'transparent', 'important');
    const root = document.getElementById('root');
    if (root) root.style.setProperty('background', 'transparent', 'important');
    return () => {
      document.documentElement.style.removeProperty('background');
      document.body.style.removeProperty('background');
      if (root) root.style.removeProperty('background');
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'transparent' }}>
      <div className="absolute bottom-6 left-6 z-10">
        <SponsorTicker />
      </div>
    </div>
  );
};

export default OverlaySponsor;
