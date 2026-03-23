import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, Player, GamePhase } from '@/store/gameStore';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, RotateCcw, Plus, Clock, AlertTriangle, XCircle, Trophy, Users, FileText, ChevronDown, ChevronUp, Upload, Database, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
  const navigate = useNavigate();
  const store = useGameStore();
  const clockRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState<'match' | 'setup' | 'live' | 'log'>('match');
  const [subTeam, setSubTeam] = useState<'home' | 'away'>('home');
  const [subOut, setSubOut] = useState('');
  const [subIn, setSubIn] = useState('');
  const [techFoulName, setTechFoulName] = useState('');
  const [ejectionName, setEjectionName] = useState('');
  const [newPlayer, setNewPlayer] = useState({ number: '', name: '', position: '', team: 'home' as 'home' | 'away' });

  useEffect(() => {
    store.fetchMatches();
  }, []);

  // Clock logic
  useEffect(() => {
    if (store.clockRunning && store.clockSeconds > 0) {
      clockRef.current = window.setInterval(() => {
        const s = useGameStore.getState().clockSeconds;
        if (s <= 0) {
          useGameStore.getState().setClockRunning(false);
          if (clockRef.current) clearInterval(clockRef.current);
          return;
        }
        useGameStore.getState().setClockSeconds(s - 1);
      }, 1000);
    } else {
      if (clockRef.current) clearInterval(clockRef.current);
    }
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, [store.clockRunning]);

  // Timeout countdown
  useEffect(() => {
    if ((store.phase === 'timeout-home' || store.phase === 'timeout-away') && store.timeoutCountdown > 0) {
      timeoutRef.current = window.setInterval(() => {
        const tc = useGameStore.getState().timeoutCountdown;
        if (tc <= 0) {
          useGameStore.getState().setPhase('live');
          if (timeoutRef.current) clearInterval(timeoutRef.current);
          return;
        }
        useGameStore.getState().setTimeoutCountdown(tc - 1);
      }, 1000);
    } else {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    }
    return () => { if (timeoutRef.current) clearInterval(timeoutRef.current); };
  }, [store.phase, store.timeoutCountdown]);

  const formatClock = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleAddPlayer = () => {
    if (!newPlayer.number || !newPlayer.name) return;
    const player: Player = {
      id: crypto.randomUUID(),
      number: newPlayer.number,
      name: newPlayer.name,
      position: newPlayer.position,
      isStarter: false,
      isCaptain: false,
      fouls: 0,
      points: 0,
      ejected: false,
    };
    store.addPlayer(newPlayer.team, player);
    setNewPlayer({ number: '', name: '', position: '', team: newPlayer.team });
  };

  const handleScore = (team: 'home' | 'away', points: number, player: Player) => {
    store.addScore(team, points, `#${player.number} ${player.name}`);
    store.updatePlayer(team, player.id, { points: player.points + points });
  };

  const handleSubstitution = () => {
    if (!subOut || !subIn) return;
    store.triggerSubstitution({ team: subTeam, playerOut: subOut, playerIn: subIn });
    setTimeout(() => store.clearSubstitution(), 8000);
    setSubOut('');
    setSubIn('');
  };

  const handleTechFoul = () => {
    if (!techFoulName) return;
    store.triggerEvent({ type: 'technical', playerName: techFoulName, visible: true });
    setTimeout(() => store.clearEvent(), 8000);
    setTechFoulName('');
  };

  const handleEjection = () => {
    if (!ejectionName) return;
    store.triggerEvent({ type: 'ejection', playerName: ejectionName, visible: true });
    setTimeout(() => store.clearEvent(), 8000);
    setEjectionName('');
  };

  const handleWinner = () => {
    const winner = store.home.score >= store.away.score ? store.home.name : store.away.name;
    store.setPhase('finished');
    store.setClockRunning(false);
    store.triggerEvent({ type: 'winner', teamName: winner, visible: true });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Spielbericht', 14, 20);
    doc.setFontSize(12);
    doc.text(`${store.home.name} ${store.home.score} - ${store.away.score} ${store.away.name}`, 14, 32);
    doc.setFontSize(10);
    let y = 45;
    doc.text('--- Spielprotokoll ---', 14, y);
    y += 8;
    [...store.logs].reverse().forEach(log => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(`[${log.clockTime} Q${log.quarter}] ${log.time} - ${log.message}`, 14, y);
      y += 6;
    });
    doc.save(`spielbericht_${store.home.shortName}_vs_${store.away.shortName}.pdf`);
  };

  const handleLogoUpload = (team: 'home' | 'away', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      store.updateTeam(team, { logoUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleShowLineup = () => {
    store.setPhase('lineup');
    store.setClockRunning(false);
  };

  const handleCreateMatch = async () => {
    await store.createMatch();
    setActiveTab('setup');
  };

  const handleLoadMatch = async (id: string) => {
    await store.loadMatch(id);
    setActiveTab('live');
  };

  const handleEndMatch = async () => {
    handleWinner();
    await store.endMatch();
    store.fetchMatches();
  };

  const phaseButtons: { label: string; phase: GamePhase }[] = [
    { label: 'LIVE', phase: 'live' },
    { label: 'HALBZEIT', phase: 'halftime' },
    { label: 'TECH. PAUSE', phase: 'technical-pause' },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl tracking-wider text-primary">HBC BROADCASTING</h1>
            {store.matchId && (
              <span className="text-xs font-mono-clock text-green-400 bg-green-400/10 px-2 py-1 rounded">
                LIVE • {store.matchId.slice(0, 8)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {(['match', 'setup', 'live', 'log'] as const).map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'secondary'}
                className="btn-press font-display tracking-wider"
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'match' ? 'SPIELE' : tab === 'setup' ? 'SETUP' : tab === 'live' ? 'LIVE' : 'PROTOKOLL'}
              </Button>
            ))}
            <Button variant="ghost" size="sm" className="btn-press text-muted-foreground" onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* MATCH TAB */}
        {activeTab === 'match' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wider text-primary">SPIELVERWALTUNG</h2>
              <div className="flex gap-2">
                <Button variant="secondary" className="btn-press" onClick={() => store.fetchMatches()}>
                  <RefreshCw className="w-4 h-4 mr-1" /> AKTUALISIEREN
                </Button>
                <Button className="btn-press" onClick={handleCreateMatch}>
                  <Plus className="w-4 h-4 mr-1" /> NEUES SPIEL
                </Button>
              </div>
            </div>

            {store.matchId && (
              <div className="glass p-4 flex items-center justify-between" style={{ borderLeft: '3px solid hsl(var(--hbc-gold))' }}>
                <div>
                  <span className="font-display text-sm text-muted-foreground tracking-wider">AKTIVES SPIEL</span>
                  <div className="font-mono-clock text-lg text-foreground mt-1">
                    {store.home.name} {store.home.score} - {store.away.score} {store.away.name}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono-clock">ID: {store.matchId}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="btn-press text-sm" onClick={() => setActiveTab('live')}>
                    ZUM SPIEL
                  </Button>
                  <Button variant="destructive" className="btn-press text-sm" onClick={handleEndMatch}>
                    SPIEL BEENDEN
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="font-display text-sm tracking-wider text-muted-foreground">LETZTE SPIELE</span>
              {store.matchList.length === 0 && (
                <div className="glass p-6 text-center text-muted-foreground">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Keine Spiele vorhanden. Erstelle ein neues Spiel.</p>
                </div>
              )}
              {store.matchList.map(m => (
                <div key={m.id} className="glass p-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground'}`} />
                    <div>
                      <span className="font-mono-clock text-foreground">
                        {m.homeName} {m.homeScore} - {m.awayScore} {m.awayName}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString('de-DE')} • {new Date(m.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        {m.status === 'active' && <span className="text-green-400 ml-2">AKTIV</span>}
                        {m.status === 'ended' && <span className="text-muted-foreground ml-2">BEENDET</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {m.status === 'active' && (
                      <Button size="sm" className="btn-press text-xs" onClick={() => handleLoadMatch(m.id)}>
                        FORTSETZEN
                      </Button>
                    )}
                    {m.status === 'ended' && (
                      <Button size="sm" variant="ghost" className="btn-press text-xs" onClick={() => handleLoadMatch(m.id)}>
                        ANSEHEN
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <div className="grid grid-cols-2 gap-6">
            {(['home', 'away'] as const).map(team => (
              <div key={team} className="glass p-4 space-y-4">
                <h2 className="font-display text-xl tracking-wider text-primary">
                  {team === 'home' ? 'HEIMTEAM' : 'GASTTEAM'}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Teamname" value={store[team].name} onChange={e => store.updateTeam(team, { name: e.target.value })} className="bg-secondary border-border" />
                  <Input placeholder="Kürzel (3)" maxLength={4} value={store[team].shortName} onChange={e => store.updateTeam(team, { shortName: e.target.value.toUpperCase() })} className="bg-secondary border-border" />
                  <Input placeholder="Coach" value={store[team].coach} onChange={e => store.updateTeam(team, { coach: e.target.value })} className="bg-secondary border-border" />
                  <Input placeholder="Co-Coach" value={store[team].coCoach} onChange={e => store.updateTeam(team, { coCoach: e.target.value })} className="bg-secondary border-border" />
                </div>
                {/* Logo Upload */}
                <div className="flex items-center gap-2">
                  {store[team].logoUrl && (
                    <img src={store[team].logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded" />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Logo hochladen</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleLogoUpload(team, file); }} />
                  </label>
                  {store[team].logoUrl && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => store.updateTeam(team, { logoUrl: undefined })}>
                      Entfernen
                    </Button>
                  )}
                </div>

                {/* Player list */}
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {store[team].players.map(p => (
                    <div key={p.id} className="flex items-center gap-2 px-2 py-1 rounded bg-secondary/50 text-sm">
                      <span className="font-mono-clock text-primary w-8">#{p.number}</span>
                      <span className="flex-1 text-foreground">
                        {p.isCaptain && <span className="text-primary font-bold">[C] </span>}
                        {p.name}
                      </span>
                      <span className="text-muted-foreground text-xs">{p.position}</span>
                      <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 text-xs ${p.isCaptain ? 'text-primary' : 'text-muted-foreground'}`} title="Captain" onClick={() => store.updatePlayer(team, p.id, { isCaptain: !p.isCaptain })}>C</Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary" onClick={() => store.updatePlayer(team, p.id, { isStarter: !p.isStarter })}>{p.isStarter ? '★' : '☆'}</Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-status-error" onClick={() => store.removePlayer(team, p.id)}>×</Button>
                    </div>
                  ))}
                </div>

                {/* Add player */}
                <div className="flex gap-1">
                  <Input placeholder="Nr." value={newPlayer.team === team ? newPlayer.number : ''} onChange={e => setNewPlayer({ ...newPlayer, number: e.target.value, team })} className="w-16 bg-secondary border-border" />
                  <Input placeholder="Name" value={newPlayer.team === team ? newPlayer.name : ''} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value, team })} className="flex-1 bg-secondary border-border" />
                  <Input placeholder="Pos." value={newPlayer.team === team ? newPlayer.position : ''} onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value, team })} className="w-16 bg-secondary border-border" />
                  <Button size="sm" className="btn-press" onClick={() => { setNewPlayer(p => ({ ...p, team })); handleAddPlayer(); }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIVE TAB */}
        {activeTab === 'live' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Left: Teams */}
            <div className="space-y-4">
              {(['home', 'away'] as const).map(team => (
                <div key={team} className="glass p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg tracking-wider text-primary">{store[team].shortName}</span>
                    <span className="font-mono-clock text-2xl text-foreground">{store[team].score}</span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {store[team].players.map(p => (
                      <div key={p.id} className="flex items-center gap-1 text-xs">
                        <span className="font-mono-clock text-primary w-7">#{p.number}</span>
                        <span className="flex-1 text-foreground truncate">{p.name}</span>
                        <span className="text-muted-foreground">{p.fouls}F</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(pts => (
                            <Button key={pts} size="sm" variant="secondary" className="h-6 w-7 p-0 text-xs btn-press" onClick={() => handleScore(team, pts, p)}>+{pts}</Button>
                          ))}
                          <Button size="sm" variant="secondary" className="h-6 w-7 p-0 text-xs btn-press text-status-error" onClick={() => store.addFoul(team, p.id)}>F</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" className="btn-press text-xs flex-1" onClick={() => store.callTimeout(team)} disabled={store[team].timeouts <= 0}>
                      <Clock className="w-3 h-3 mr-1" /> TO ({store[team].timeouts})
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Center: Clock & Controls */}
            <div className="space-y-4">
              <div className="glass p-4 flex flex-col items-center gap-3">
                <span className="font-mono-clock text-5xl text-primary glow-yellow font-bold">
                  {formatClock(store.clockSeconds)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm text-muted-foreground tracking-wider">
                    {store.quarter <= 4 ? `${store.quarter}. VIERTEL` : `OT${store.quarter - 4}`}
                  </span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => store.setQuarter(Math.max(1, store.quarter - 1))}>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => store.setQuarter(store.quarter + 1)}>
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button className="btn-press" onClick={() => { store.setClockRunning(!store.clockRunning); if (store.phase === 'pre-game') store.setPhase('live'); }}>
                    {store.clockRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    {store.clockRunning ? 'STOPP' : 'START'}
                  </Button>
                  <Button variant="secondary" className="btn-press" onClick={() => store.setClockSeconds(600)}>
                    <RotateCcw className="w-4 h-4 mr-1" /> RESET
                  </Button>
                </div>
                <div className="flex gap-1">
                  {[300, 480, 600, 720].map(s => (
                    <Button key={s} size="sm" variant="ghost" className="text-xs" onClick={() => store.setClockSeconds(s)}>
                      {Math.floor(s / 60)}:00
                    </Button>
                  ))}
                </div>
              </div>

              {/* Phase Controls */}
              <div className="glass p-3 space-y-2">
                <span className="font-display text-sm tracking-wider text-muted-foreground">SPIELPHASE</span>
                <div className="grid grid-cols-3 gap-1">
                  {phaseButtons.map(pb => (
                    <Button key={pb.phase} size="sm" variant={store.phase === pb.phase ? 'default' : 'secondary'} className="btn-press text-xs" onClick={() => { store.setPhase(pb.phase); if (pb.phase !== 'live') store.setClockRunning(false); }}>
                      {pb.label}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <Button size="sm" variant={store.phase === 'lineup' ? 'default' : 'secondary'} className="btn-press text-xs" onClick={handleShowLineup}>
                    <Users className="w-3 h-3 mr-1" /> STARTING 5
                  </Button>
                  <Button size="sm" variant="secondary" className="btn-press text-xs" onClick={() => { store.setPhase('live'); store.setClockRunning(false); }}>
                    OVERLAY ZURÜCK
                  </Button>
                </div>
              </div>

              {/* Substitution */}
              <div className="glass p-3 space-y-2">
                <span className="font-display text-sm tracking-wider text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> SPIELERWECHSEL
                </span>
                <div className="flex gap-1">
                  <select className="bg-secondary text-foreground text-xs rounded px-2 py-1 border border-border" value={subTeam} onChange={e => setSubTeam(e.target.value as 'home' | 'away')}>
                    <option value="home">Heim</option>
                    <option value="away">Gast</option>
                  </select>
                  <Input placeholder="AUS" value={subOut} onChange={e => setSubOut(e.target.value)} className="bg-secondary border-border text-xs h-7" />
                  <Input placeholder="EIN" value={subIn} onChange={e => setSubIn(e.target.value)} className="bg-secondary border-border text-xs h-7" />
                  <Button size="sm" className="btn-press text-xs" onClick={handleSubstitution}>GO</Button>
                </div>
              </div>
            </div>

            {/* Right: Events & Log */}
            <div className="space-y-4">
              <div className="glass p-3 space-y-2">
                <span className="font-display text-sm tracking-wider text-muted-foreground">EVENTS</span>
                <div className="flex gap-1 items-end">
                  <Input placeholder="Spieler" value={techFoulName} onChange={e => setTechFoulName(e.target.value)} className="bg-secondary border-border text-xs h-7" />
                  <Button size="sm" variant="secondary" className="btn-press text-xs" onClick={handleTechFoul}>
                    <AlertTriangle className="w-3 h-3 mr-1" /> TECH
                  </Button>
                </div>
                <div className="flex gap-1 items-end">
                  <Input placeholder="Spieler" value={ejectionName} onChange={e => setEjectionName(e.target.value)} className="bg-secondary border-border text-xs h-7" />
                  <Button size="sm" variant="destructive" className="btn-press text-xs" onClick={handleEjection}>
                    <XCircle className="w-3 h-3 mr-1" /> EJECTION
                  </Button>
                </div>
                <Button className="btn-press w-full" variant="default" onClick={handleWinner}>
                  <Trophy className="w-4 h-4 mr-1" /> SPIEL BEENDEN
                </Button>
                <Button size="sm" variant="ghost" className="text-xs w-full" onClick={() => store.clearEvent()}>
                  Event ausblenden
                </Button>
              </div>

              {/* Live Log */}
              <div className="glass p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm tracking-wider text-muted-foreground">LIVE LOG</span>
                  <Button size="sm" variant="ghost" className="text-xs h-6" onClick={exportPDF}>
                    <FileText className="w-3 h-3 mr-1" /> PDF
                  </Button>
                </div>
                <div className="space-y-0.5 max-h-64 overflow-y-auto">
                  {store.logs.slice(0, 50).map(log => (
                    <div key={log.id} className="text-xs flex gap-1">
                      <span className="font-mono-clock text-muted-foreground whitespace-nowrap">{log.time}</span>
                      <span className="font-mono-clock text-primary whitespace-nowrap">[{log.clockTime}]</span>
                      <span className={`text-foreground ${log.type === 'foul' ? 'text-status-error' : ''}`}>{log.message}</span>
                    </div>
                  ))}
                  {store.logs.length === 0 && <span className="text-xs text-muted-foreground">Noch keine Einträge</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOG TAB */}
        {activeTab === 'log' && (
          <div className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wider text-primary">SPIELPROTOKOLL</h2>
              <Button className="btn-press" onClick={exportPDF}>
                <FileText className="w-4 h-4 mr-2" /> ALS PDF EXPORTIEREN
              </Button>
            </div>
            <div className="text-lg font-mono-clock text-foreground mb-2">
              {store.home.name} {store.home.score} - {store.away.score} {store.away.name}
            </div>
            <div className="space-y-1">
              {store.logs.map(log => (
                <div key={log.id} className="flex gap-2 text-sm py-1 border-b border-border/30">
                  <span className="font-mono-clock text-muted-foreground w-12">{log.time}</span>
                  <span className="font-mono-clock text-primary w-16">[{log.clockTime}]</span>
                  <span className="text-muted-foreground w-16">Q{log.quarter}</span>
                  <span className="text-foreground">{log.message}</span>
                </div>
              ))}
              {store.logs.length === 0 && <span className="text-muted-foreground">Noch keine Einträge</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
