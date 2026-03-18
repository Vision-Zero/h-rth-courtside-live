import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import hbcLogo from '@/assets/hbc-logo.webp';
import kleinsLogo from '@/assets/kleins-backstube.png';
import falcLogo from '@/assets/falc-immobilien.png';

const HalftimeScreen = () => {
  const { phase, home, away } = useGameStore();

  if (phase !== 'halftime') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-background/90 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-display text-5xl tracking-[0.4em] text-primary glow-yellow">HALBZEITPAUSE</span>

          <div className="flex items-center gap-12 mt-4">
            <div className="flex flex-col items-center gap-2">
              <img src={hbcLogo} alt={home.name} className="w-16 h-16 object-contain" />
              <span className="font-display text-2xl text-foreground">{home.shortName}</span>
              <span className="font-mono-clock text-5xl text-primary glow-yellow font-bold">{home.score}</span>
            </div>
            <span className="font-display text-3xl text-muted-foreground">VS</span>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                <span className="font-display text-xl text-foreground">{away.shortName}</span>
              </div>
              <span className="font-display text-2xl text-foreground">{away.shortName}</span>
              <span className="font-mono-clock text-5xl text-primary glow-yellow font-bold">{away.score}</span>
            </div>
          </div>

          {/* Sponsors */}
          <div className="flex items-center gap-8 mt-8">
            <div className="glass px-6 py-3 animate-pulse-sponsor">
              <img src={kleinsLogo} alt="Kleins Backstube" className="h-12 object-contain" />
            </div>
            <div className="glass px-6 py-3 animate-pulse-sponsor">
              <img src={falcLogo} alt="Falc Immobilien" className="h-12 object-contain" />
            </div>
          </div>

          {/* Top Scorers */}
          <div className="grid grid-cols-2 gap-8 mt-6">
            {[{ team: home, label: 'HEIM' }, { team: away, label: 'GAST' }].map(({ team, label }) => (
              <div key={label} className="glass p-4">
                <span className="font-display text-sm tracking-[0.2em] text-muted-foreground">{label} - TOP SCORER</span>
                <div className="mt-2 space-y-1">
                  {[...team.players]
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 3)
                    .map(p => (
                      <div key={p.id} className="flex justify-between items-center">
                        <span className="text-sm text-foreground">#{p.number} {p.name}</span>
                        <span className="font-mono-clock text-sm text-primary">{p.points} PTS</span>
                      </div>
                    ))}
                  {team.players.length === 0 && (
                    <span className="text-sm text-muted-foreground">Keine Spielerdaten</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HalftimeScreen;
