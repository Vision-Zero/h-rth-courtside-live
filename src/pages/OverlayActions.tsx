import { useEffect } from 'react';
import TimeoutOverlay from '@/components/overlay/TimeoutOverlay';
import EventPopups from '@/components/overlay/EventPopups';
import TechnicalPause from '@/components/overlay/TechnicalPause';

const OverlayActions = () => {
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
      <TimeoutOverlay />
      <EventPopups />
      <TechnicalPause />
    </div>
  );
};

export default OverlayActions;
