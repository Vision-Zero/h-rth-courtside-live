import { useEffect } from 'react';
import LineupScreen from '@/components/overlay/LineupScreen';

const OverlayLineup = () => {
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
      <LineupScreen />
    </div>
  );
};

export default OverlayLineup;
