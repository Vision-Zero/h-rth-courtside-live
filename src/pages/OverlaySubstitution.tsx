import { useOverlayTransparency } from '@/hooks/useOverlayTransparency';
import SubstitutionPopup from '@/components/overlay/SubstitutionPopup';

const OverlaySubstitution = () => {
  useOverlayTransparency();

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'transparent' }}>
      <SubstitutionPopup />
    </div>
  );
};

export default OverlaySubstitution;
