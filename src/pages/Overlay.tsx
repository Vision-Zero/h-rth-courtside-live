import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import Scoreboard from '@/components/overlay/Scoreboard';
import SponsorTicker from '@/components/overlay/SponsorTicker';
import TimeoutOverlay from '@/components/overlay/TimeoutOverlay';
import SubstitutionPopup from '@/components/overlay/SubstitutionPopup';
import EventPopups from '@/components/overlay/EventPopups';
import HalftimeScreen from '@/components/overlay/HalftimeScreen';
import TechnicalPause from '@/components/overlay/TechnicalPause';

const Overlay = () => {
  const { phase } = useGameStore();
  const showScoreboard = phase !== 'halftime';

  // Transparent background for OBS
  useEffect(() => {
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  return (
    <div className="relative w-[1920px] h-[1080px] overflow-hidden" style={{ background: 'transparent' }}>
      {/* Scoreboard top center */}
      {showScoreboard && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <Scoreboard />
        </div>
      )}

      {/* Sponsor bottom left */}
      {showScoreboard && (
        <div className="absolute bottom-6 left-6 z-10">
          <SponsorTicker />
        </div>
      )}

      {/* Overlays */}
      <TimeoutOverlay />
      <SubstitutionPopup />
      <EventPopups />
      <HalftimeScreen />
      <TechnicalPause />
    </div>
  );
};

export default Overlay;
