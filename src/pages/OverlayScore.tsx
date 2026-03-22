import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import Scoreboard from '@/components/overlay/Scoreboard';

const OverlayScore = () => {
  const { phase } = useGameStore();
  const showScoreboard = phase !== 'halftime' && phase !== 'lineup';

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
      {showScoreboard && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <Scoreboard />
        </div>
      )}
    </div>
  );
};

export default OverlayScore;
