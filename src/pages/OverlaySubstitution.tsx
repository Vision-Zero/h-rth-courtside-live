import { useEffect } from 'react';
import SubstitutionPopup from '@/components/overlay/SubstitutionPopup';

const OverlaySubstitution = () => {
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
      <SubstitutionPopup />
    </div>
  );
};

export default OverlaySubstitution;
