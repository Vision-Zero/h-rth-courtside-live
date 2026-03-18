import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import hbcLogo from '@/assets/hbc-logo.webp';

const TimeoutOverlay = () => {
  const { phase, home, away, timeoutCountdown } = useGameStore();
  const isTimeout = phase === 'timeout-home' || phase === 'timeout-away';
  const team = phase === 'timeout-home' ? home : away;
  const progress = (timeoutCountdown / 60) * 100;

  return (
    <AnimatePresence>
      {isTimeout && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <motion.div
            className="glass relative z-10 p-8 flex flex-col items-center gap-4 min-w-[400px]"
            style={{ borderBottom: '3px solid hsl(var(--hbc-gold))' }}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-display text-2xl tracking-[0.3em] text-primary">TIMEOUT</span>
            {phase === 'timeout-home' && (
              <img src={hbcLogo} alt={team.name} className="w-20 h-20 object-contain" />
            )}
            <span className="font-display text-3xl text-foreground tracking-wider">{team.name}</span>
            <span className="font-mono-clock text-6xl text-primary glow-yellow font-bold">
              {timeoutCountdown}
            </span>
            <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimeoutOverlay;
