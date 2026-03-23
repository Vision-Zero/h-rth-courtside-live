import { useOverlayTransparency } from '@/hooks/useOverlayTransparency';
import { useGameStore } from '@/store/gameStore';
import Scoreboard from '@/components/overlay/Scoreboard';
import SponsorTicker from '@/components/overlay/SponsorTicker';
import TimeoutOverlay from '@/components/overlay/TimeoutOverlay';
import SubstitutionPopup from '@/components/overlay/SubstitutionPopup';
import EventPopups from '@/components/overlay/EventPopups';
import HalftimeScreen from '@/components/overlay/HalftimeScreen';
import TechnicalPause from '@/components/overlay/TechnicalPause';
import LineupScreen from '@/components/overlay/LineupScreen';

const Overlay = () => {
  const { phase } = useGameStore();
  const showScoreboard = phase !== 'halftime' && phase !== 'lineup';
  useOverlayTransparency();

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'transparent' }}>
      <div className="relative w-full h-full overflow-hidden">
        {showScoreboard && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
            <Scoreboard />
          </div>
        )}
        {showScoreboard && (
          <div className="absolute bottom-6 left-6 z-10">
            <SponsorTicker />
          </div>
        )}
        <TimeoutOverlay />
        <SubstitutionPopup />
        <EventPopups />
        <HalftimeScreen />
        <TechnicalPause />
        <LineupScreen />
      </div>
    </div>
  );
};

export default Overlay;
