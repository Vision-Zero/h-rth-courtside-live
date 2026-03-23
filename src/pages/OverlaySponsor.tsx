import { useOverlayTransparency } from '@/hooks/useOverlayTransparency';
import SponsorTicker from '@/components/overlay/SponsorTicker';

const OverlaySponsor = () => {
  useOverlayTransparency();

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'transparent' }}>
      <div className="absolute bottom-6 left-6 z-10">
        <SponsorTicker />
      </div>
    </div>
  );
};

export default OverlaySponsor;
