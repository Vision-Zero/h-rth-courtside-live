import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { AlertTriangle, XCircle, Trophy } from 'lucide-react';

const EventPopups = () => {
  const { eventPopup } = useGameStore();

  return (
    <AnimatePresence>
      {eventPopup?.visible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {eventPopup.type !== 'winner' && (
            <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
          )}

          {eventPopup.type === 'technical' && (
            <motion.div
              className="glass relative z-10 p-8 flex flex-col items-center gap-4"
              style={{ borderBottom: '3px solid hsl(var(--status-error))' }}
              initial={{ scale: 0.7, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <AlertTriangle className="w-12 h-12 text-primary" />
              <span className="font-display text-3xl tracking-[0.3em] text-status-error">TECHNISCHES FOUL</span>
              <span className="font-mono-clock text-2xl text-foreground">{eventPopup.playerName}</span>
            </motion.div>
          )}

          {eventPopup.type === 'ejection' && (
            <motion.div
              className="glass relative z-10 p-8 flex flex-col items-center gap-4"
              style={{ borderBottom: '3px solid hsl(var(--status-error))' }}
              initial={{ scale: 0.7, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <XCircle className="w-14 h-14 text-status-error" />
              <span className="font-display text-3xl tracking-[0.3em] text-status-error">SPIELERAUSSCHLUSS</span>
              <span className="font-mono-clock text-2xl text-foreground">{eventPopup.playerName}</span>
            </motion.div>
          )}

          {eventPopup.type === 'winner' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/70 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.3, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-4"
              >
                <Trophy className="w-20 h-20 text-primary glow-gold" />
                <span className="font-display text-6xl tracking-[0.3em] text-primary glow-yellow">GEWINNER</span>
                <span className="font-display text-4xl text-foreground tracking-wider">{eventPopup.teamName}</span>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventPopups;
