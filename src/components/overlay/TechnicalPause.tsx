import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { PauseCircle } from 'lucide-react';

const TechnicalPause = () => {
  const { phase } = useGameStore();

  return (
    <AnimatePresence>
      {phase === 'technical-pause' && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 glass px-12 py-6 flex items-center gap-4"
          style={{ borderBottom: '2px solid hsl(var(--hbc-gold))' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <PauseCircle className="w-10 h-10 text-primary" />
          <span className="font-display text-3xl tracking-[0.3em] text-foreground">TECHNISCHE PAUSE</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TechnicalPause;
