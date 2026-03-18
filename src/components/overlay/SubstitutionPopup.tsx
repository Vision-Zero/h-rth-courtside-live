import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

const SubstitutionPopup = () => {
  const { substitution } = useGameStore();

  return (
    <AnimatePresence>
      {substitution && (
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 glass px-8 py-4 flex items-center gap-6 z-30"
          style={{ borderBottom: '2px solid hsl(var(--hbc-gold))' }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-lg tracking-wider text-status-error">AUS</span>
            <span className="font-mono-clock text-xl text-foreground">{substitution.playerOut}</span>
          </div>
          <div className="w-px h-8 bg-muted/40" />
          <div className="flex items-center gap-2">
            <span className="font-display text-lg tracking-wider text-green-400">EIN</span>
            <span className="font-mono-clock text-xl text-foreground">{substitution.playerIn}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubstitutionPopup;
