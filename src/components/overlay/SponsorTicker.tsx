import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import kleinsLogo from '@/assets/kleins-backstube.png';
import falcLogo from '@/assets/falc-immobilien.png';

const sponsors = [
  { name: "Kleins Backstube", logo: kleinsLogo },
  { name: "Falc Immobilien", logo: falcLogo },
];

const SponsorTicker = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % sponsors.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-lg px-4 py-2 w-[200px] h-[70px] flex items-center justify-center animate-pulse-sponsor"
         style={{ borderBottom: '1px solid hsl(var(--hbc-gold) / 0.4)' }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={sponsors[index].name}
          src={sponsors[index].logo}
          alt={sponsors[index].name}
          className="max-h-[50px] max-w-[170px] object-contain"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
    </div>
  );
};

export default SponsorTicker;
