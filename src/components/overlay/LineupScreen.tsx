import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import hbcLogo from '@/assets/hbc-logo.webp';

const LineupScreen = () => {
  const { phase, home, away } = useGameStore();
  const isVisible = phase === 'lineup';

  const homeStarters = home.players.filter(p => p.isStarter).slice(0, 5);
  const awayStarters = away.players.filter(p => p.isStarter).slice(0, 5);

  const positionLabels: Record<string, string> = {
    PG: 'POINT GUARD',
    SG: 'SHOOTING GUARD',
    SF: 'SMALL FORWARD',
    PF: 'POWER FORWARD',
    C: 'CENTER',
  };

  const getPositionLabel = (pos: string) => positionLabels[pos.toUpperCase()] || pos.toUpperCase();

  const PlayerCard = ({ player, index, side }: { player: typeof homeStarters[0]; index: number; side: 'left' | 'right' }) => (
    <motion.div
      className="flex items-center gap-4 px-5 py-3 rounded-lg bg-muted/20 border border-muted/30 backdrop-blur-sm"
      initial={{ x: side === 'left' ? -120 : 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4 + index * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="font-mono-clock text-3xl font-bold text-primary w-14 text-center">
        {player.number}
      </span>
      <div className="flex flex-col">
        <span className="font-display text-xl tracking-wider text-foreground">
          {player.isCaptain ? '[C] ' : ''}{player.name}
        </span>
        <span className="text-xs tracking-[0.2em] text-muted-foreground font-display">
          {getPositionLabel(player.position)}
        </span>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <motion.div
            className="mb-10"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <span className="font-display text-5xl tracking-[0.4em] text-primary glow-yellow">
              STARTING FIVE
            </span>
          </motion.div>

          <div className="flex gap-20 w-full max-w-[1600px] px-12">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <motion.div
                className="flex items-center gap-4 mb-4"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {home.logoUrl ? (
                  <img src={home.logoUrl} alt={home.name} className="w-14 h-14 object-contain" />
                ) : (
                  <img src={hbcLogo} alt={home.name} className="w-14 h-14 object-contain" />
                )}
                <span className="font-display text-3xl tracking-wider text-foreground">{home.name}</span>
              </motion.div>
              {homeStarters.map((p, i) => (
                <PlayerCard key={p.id} player={p} index={i} side="left" />
              ))}
              {homeStarters.length === 0 && (
                <span className="text-muted-foreground font-display tracking-wider">Keine Starter markiert</span>
              )}
            </div>

            {/* Divider */}
            <motion.div
              className="w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <motion.div
                className="flex items-center gap-4 mb-4"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {away.logoUrl ? (
                  <img src={away.logoUrl} alt={away.name} className="w-14 h-14 object-contain" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center font-display text-lg text-muted-foreground">
                    {away.shortName}
                  </div>
                )}
                <span className="font-display text-3xl tracking-wider text-foreground">{away.name}</span>
              </motion.div>
              {awayStarters.map((p, i) => (
                <PlayerCard key={p.id} player={p} index={i} side="right" />
              ))}
              {awayStarters.length === 0 && (
                <span className="text-muted-foreground font-display tracking-wider">Keine Starter markiert</span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LineupScreen;
