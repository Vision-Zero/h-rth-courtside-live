import { useOverlayTransparency } from '@/hooks/useOverlayTransparency';
import TimeoutOverlay from '@/components/overlay/TimeoutOverlay';
import EventPopups from '@/components/overlay/EventPopups';
import TechnicalPause from '@/components/overlay/TechnicalPause';

const OverlayActions = () => {
  useOverlayTransparency();

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'transparent' }}>
      <TimeoutOverlay />
      <EventPopups />
      <TechnicalPause />
    </div>
  );
};

export default OverlayActions;
