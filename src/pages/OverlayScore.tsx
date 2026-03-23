import { useOverlayTransparency } from '@/hooks/useOverlayTransparency';
import { useGameStore } from '@/store/gameStore';
import Scoreboard from '@/components/overlay/Scoreboard';

const OverlayScore = () => {
  const { phase } = useGameStore();
  const showScoreboard = phase !== 'halftime' && phase !== 'lineup';
  useOverlayTransparency();

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
