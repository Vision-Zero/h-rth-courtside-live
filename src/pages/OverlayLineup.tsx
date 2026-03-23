import { useOverlayTransparency } from '@/hooks/useOverlayTransparency';
import LineupScreen from '@/components/overlay/LineupScreen';

const OverlayLineup = () => {
  useOverlayTransparency();

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'transparent' }}>
      <LineupScreen />
    </div>
  );
};

export default OverlayLineup;
