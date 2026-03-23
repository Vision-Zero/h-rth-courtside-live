import { useOverlayTransparency } from '@/hooks/useOverlayTransparency';
import HalftimeScreen from '@/components/overlay/HalftimeScreen';

const OverlayHalftime = () => {
  useOverlayTransparency();

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'transparent' }}>
      <HalftimeScreen />
    </div>
  );
};

export default OverlayHalftime;
