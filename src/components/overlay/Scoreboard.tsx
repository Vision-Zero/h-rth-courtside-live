import { useGameStore } from '@/store/gameStore';
import hbcLogo from '@/assets/hbc-logo.webp';

const Scoreboard = () => {
  const { home, away, quarter, clockSeconds, phase } = useGameStore();

  const formatClock = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const quarterLabel = () => {
    if (phase === 'halftime') return 'HALBZEIT';
    if (phase === 'finished') return 'ENDE';
    if (quarter <= 4) return `${quarter}. VIERTEL`;
    return `OT${quarter - 4}`;
  };

  const renderFoulDots = (fouls: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i <= fouls ? 'bg-status-error shadow-[0_0_6px_hsl(var(--status-error))]' : 'bg-muted/40'
          }`}
        />
      ))}
    </div>
  );

  const renderTimeouts = (remaining: number, max: number) => (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-5 h-1.5 rounded-sm transition-all duration-300 ${
            i < remaining ? 'bg-hbc-gold' : 'bg-muted/30'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="glass-scoreboard rounded-b-xl px-1 inline-flex items-stretch" style={{ borderBottom: '2px solid hsl(var(--hbc-gold))' }}>
      {/* Home Team */}
      <div className="flex items-center gap-3 px-4 py-2 min-w-[200px]">
        <img src={hbcLogo} alt={home.name} className="w-10 h-10 object-contain" />
        <div className="flex flex-col items-start">
          <span className="font-display text-lg tracking-wider text-foreground">{home.shortName}</span>
          <div className="flex items-center gap-2">
            {renderFoulDots(home.fouls)}
            {renderTimeouts(home.timeouts, home.maxTimeouts)}
          </div>
        </div>
        <span className="font-mono-clock text-4xl font-bold text-foreground ml-2 glow-yellow">{home.score}</span>
      </div>

      {/* Clock / Quarter */}
      <div className="flex flex-col items-center justify-center px-6 border-x border-muted/20 min-w-[140px]">
        <span className="font-mono-clock text-3xl text-primary glow-yellow font-bold tracking-wider">
          {formatClock(clockSeconds)}
        </span>
        <span className="font-display text-xs tracking-[0.2em] text-muted-foreground mt-0.5">
          {quarterLabel()}
        </span>
      </div>

      {/* Away Team */}
      <div className="flex items-center gap-3 px-4 py-2 min-w-[200px]">
        <span className="font-mono-clock text-4xl font-bold text-foreground mr-2 glow-yellow">{away.score}</span>
        <div className="flex flex-col items-end">
          <span className="font-display text-lg tracking-wider text-foreground">{away.shortName}</span>
          <div className="flex items-center gap-2">
            {renderTimeouts(away.timeouts, away.maxTimeouts)}
            {renderFoulDots(away.fouls)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
