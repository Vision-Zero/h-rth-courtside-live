import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Player {
  id: string;
  number: string;
  name: string;
  position: string;
  isStarter: boolean;
  isCaptain: boolean;
  fouls: number;
  points: number;
  ejected: boolean;
}

export interface TeamData {
  name: string;
  shortName: string;
  coach: string;
  coCoach: string;
  score: number;
  fouls: number;
  timeouts: number;
  maxTimeouts: number;
  players: Player[];
  logoUrl?: string;
}

export interface GameLog {
  id: string;
  time: string;
  clockTime: string;
  quarter: number;
  message: string;
  type: 'score' | 'foul' | 'timeout' | 'substitution' | 'technical' | 'ejection' | 'general';
}

export interface SubstitutionEvent {
  team: 'home' | 'away';
  playerOut: string;
  playerIn: string;
}

export interface EventPopup {
  type: 'technical' | 'ejection' | 'winner';
  playerName?: string;
  teamName?: string;
  visible: boolean;
}

export type GamePhase = 'pre-game' | 'lineup' | 'live' | 'halftime' | 'timeout-home' | 'timeout-away' | 'technical-pause' | 'finished';

export interface MatchInfo {
  id: string;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  status: 'active' | 'ended';
  createdAt: string;
}

export interface GameState {
  // Match persistence
  matchId: string | null;
  matchList: MatchInfo[];

  phase: GamePhase;
  quarter: number;
  clockSeconds: number;
  clockRunning: boolean;
  home: TeamData;
  away: TeamData;
  logs: GameLog[];
  substitution: SubstitutionEvent | null;
  eventPopup: EventPopup | null;
  showSponsor: boolean;
  timeoutCountdown: number;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setQuarter: (q: number) => void;
  setClockSeconds: (s: number) => void;
  setClockRunning: (r: boolean) => void;
  addScore: (team: 'home' | 'away', points: number, playerName: string) => void;
  addFoul: (team: 'home' | 'away', playerId: string) => void;
  callTimeout: (team: 'home' | 'away') => void;
  setTimeoutCountdown: (s: number) => void;
  triggerSubstitution: (event: SubstitutionEvent) => void;
  clearSubstitution: () => void;
  triggerEvent: (event: EventPopup) => void;
  clearEvent: () => void;
  addLog: (log: Omit<GameLog, 'id'>) => void;
  updateTeam: (team: 'home' | 'away', data: Partial<TeamData>) => void;
  updatePlayer: (team: 'home' | 'away', playerId: string, data: Partial<Player>) => void;
  addPlayer: (team: 'home' | 'away', player: Player) => void;
  removePlayer: (team: 'home' | 'away', playerId: string) => void;
  resetGame: () => void;
  setFullState: (state: Partial<GameState>) => void;

  // Match management
  createMatch: () => Promise<void>;
  loadMatch: (id: string) => Promise<void>;
  endMatch: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  saveToDb: () => void;
}

const defaultTeam = (name: string, shortName: string): TeamData => ({
  name,
  shortName,
  coach: '',
  coCoach: '',
  score: 0,
  fouls: 0,
  timeouts: 2,
  maxTimeouts: 2,
  players: [],
});

const formatClock = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const getTimestamp = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

// BroadcastChannel for syncing
let bc: BroadcastChannel | null = null;
try {
  bc = new BroadcastChannel('hbc_game_data');
} catch (e) {
  console.warn('BroadcastChannel not supported');
}

const getSerializableState = (state: any) => {
  const { setPhase, setQuarter, setClockSeconds, setClockRunning, addScore, addFoul, callTimeout, setTimeoutCountdown, triggerSubstitution, clearSubstitution, triggerEvent, clearEvent, addLog, updateTeam, updatePlayer, addPlayer, removePlayer, resetGame, setFullState, createMatch, loadMatch, endMatch, fetchMatches, saveToDb, matchList, ...data } = state;
  return data;
};

const broadcastState = (state: any) => {
  if (bc) {
    bc.postMessage({ type: 'STATE_SYNC', data: getSerializableState(state) });
  }
};

// Debounced DB save
let saveTimeout: number | null = null;
const debouncedSave = (state: GameState) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = window.setTimeout(() => {
    const { matchId } = state;
    if (!matchId) return;
    const serializable = getSerializableState(state);
    supabase
      .from('matches')
      .update({
        game_state: serializable,
        home_name: state.home.name,
        away_name: state.away.name,
        home_score: state.home.score,
        away_score: state.away.score,
        status: state.phase === 'finished' ? 'ended' : 'active',
      })
      .eq('id', matchId)
      .then();
  }, 2000);
};

export const useGameStore = create<GameState>((set, get) => ({
  matchId: null,
  matchList: [],

  phase: 'pre-game',
  quarter: 1,
  clockSeconds: 600,
  clockRunning: false,
  home: defaultTeam('Hürther BC', 'HBC'),
  away: defaultTeam('Gast', 'GST'),
  logs: [],
  substitution: null,
  eventPopup: null,
  showSponsor: true,
  timeoutCountdown: 60,

  setPhase: (phase) => set(s => { const ns = { ...s, phase }; broadcastState(ns); debouncedSave(ns as GameState); return ns; }),
  setQuarter: (quarter) => set(s => { const ns = { ...s, quarter }; broadcastState(ns); debouncedSave(ns as GameState); return ns; }),
  setClockSeconds: (clockSeconds) => set(s => { const ns = { ...s, clockSeconds }; broadcastState(ns); debouncedSave(ns as GameState); return ns; }),
  setClockRunning: (clockRunning) => set(s => { const ns = { ...s, clockRunning }; broadcastState(ns); debouncedSave(ns as GameState); return ns; }),

  addScore: (team, points, playerName) => set(s => {
    const t = { ...s[team], score: s[team].score + points };
    const log: GameLog = {
      id: crypto.randomUUID(),
      time: getTimestamp(),
      clockTime: formatClock(s.clockSeconds),
      quarter: s.quarter,
      message: `+${points} ${playerName} (${s[team].shortName})`,
      type: 'score',
    };
    const ns = { ...s, [team]: t, logs: [log, ...s.logs] };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  addFoul: (team, playerId) => set(s => {
    const players = s[team].players.map(p =>
      p.id === playerId ? { ...p, fouls: p.fouls + 1 } : p
    );
    const player = players.find(p => p.id === playerId);
    const t = { ...s[team], fouls: s[team].fouls + 1, players };
    const log: GameLog = {
      id: crypto.randomUUID(),
      time: getTimestamp(),
      clockTime: formatClock(s.clockSeconds),
      quarter: s.quarter,
      message: `Foul #${player?.number} ${player?.name} (${s[team].shortName}) [${player?.fouls || 0}]`,
      type: 'foul',
    };
    const ns = { ...s, [team]: t, logs: [log, ...s.logs] };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  callTimeout: (team) => set(s => {
    if (s[team].timeouts <= 0) return s;
    const t = { ...s[team], timeouts: s[team].timeouts - 1 };
    const log: GameLog = {
      id: crypto.randomUUID(),
      time: getTimestamp(),
      clockTime: formatClock(s.clockSeconds),
      quarter: s.quarter,
      message: `Timeout ${s[team].name}`,
      type: 'timeout',
    };
    const phase: GamePhase = team === 'home' ? 'timeout-home' : 'timeout-away';
    const ns = { ...s, [team]: t, phase, timeoutCountdown: 60, clockRunning: false, logs: [log, ...s.logs] };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  setTimeoutCountdown: (timeoutCountdown) => set(s => { const ns = { ...s, timeoutCountdown }; broadcastState(ns); return ns; }),

  triggerSubstitution: (substitution) => set(s => {
    const log: GameLog = {
      id: crypto.randomUUID(),
      time: getTimestamp(),
      clockTime: formatClock(s.clockSeconds),
      quarter: s.quarter,
      message: `Wechsel (${s[substitution.team].shortName}): AUS ${substitution.playerOut} → EIN ${substitution.playerIn}`,
      type: 'substitution',
    };
    const ns = { ...s, substitution, logs: [log, ...s.logs] };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  clearSubstitution: () => set(s => { const ns = { ...s, substitution: null }; broadcastState(ns); return ns; }),

  triggerEvent: (eventPopup) => set(s => {
    let log: GameLog | null = null;
    if (eventPopup.type === 'technical') {
      log = {
        id: crypto.randomUUID(),
        time: getTimestamp(),
        clockTime: formatClock(s.clockSeconds),
        quarter: s.quarter,
        message: `Technisches Foul: ${eventPopup.playerName}`,
        type: 'technical',
      };
    } else if (eventPopup.type === 'ejection') {
      log = {
        id: crypto.randomUUID(),
        time: getTimestamp(),
        clockTime: formatClock(s.clockSeconds),
        quarter: s.quarter,
        message: `Spielerausschluss: ${eventPopup.playerName}`,
        type: 'ejection',
      };
    }
    const ns = { ...s, eventPopup, logs: log ? [log, ...s.logs] : s.logs };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  clearEvent: () => set(s => { const ns = { ...s, eventPopup: null }; broadcastState(ns); return ns; }),

  addLog: (log) => set(s => {
    const newLog = { ...log, id: crypto.randomUUID() };
    const ns = { ...s, logs: [newLog, ...s.logs] };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  updateTeam: (team, data) => set(s => {
    const ns = { ...s, [team]: { ...s[team], ...data } };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  updatePlayer: (team, playerId, data) => set(s => {
    const players = s[team].players.map(p => p.id === playerId ? { ...p, ...data } : p);
    const ns = { ...s, [team]: { ...s[team], players } };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  addPlayer: (team, player) => set(s => {
    const ns = { ...s, [team]: { ...s[team], players: [...s[team].players, player] } };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  removePlayer: (team, playerId) => set(s => {
    const ns = { ...s, [team]: { ...s[team], players: s[team].players.filter(p => p.id !== playerId) } };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  resetGame: () => set(s => {
    const ns = {
      ...s,
      phase: 'pre-game' as GamePhase,
      quarter: 1,
      clockSeconds: 600,
      clockRunning: false,
      home: { ...s.home, score: 0, fouls: 0, timeouts: s.home.maxTimeouts, players: s.home.players.map(p => ({ ...p, fouls: 0, points: 0, ejected: false, isCaptain: p.isCaptain })) },
      away: { ...s.away, score: 0, fouls: 0, timeouts: s.away.maxTimeouts, players: s.away.players.map(p => ({ ...p, fouls: 0, points: 0, ejected: false, isCaptain: p.isCaptain })) },
      logs: [],
      substitution: null,
      eventPopup: null,
      timeoutCountdown: 60,
    };
    broadcastState(ns);
    debouncedSave(ns as GameState);
    return ns;
  }),

  setFullState: (data) => set(s => ({ ...s, ...data })),

  // === Match Management ===
  createMatch: async () => {
    const s = get();
    const serializable = getSerializableState(s);
    const { data, error } = await supabase
      .from('matches')
      .insert({
        game_state: serializable,
        home_name: s.home.name,
        away_name: s.away.name,
        home_score: s.home.score,
        away_score: s.away.score,
        status: 'active',
      })
      .select('id')
      .single();

    if (!error && data) {
      set({ matchId: data.id });
      broadcastState({ ...get() });
    }
  },

  loadMatch: async (id: string) => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      const gs = data.game_state as any;
      set(s => ({
        ...s,
        ...gs,
        matchId: data.id,
      }));
      broadcastState(get());
    }
  },

  endMatch: async () => {
    const { matchId } = get();
    if (!matchId) return;
    const serializable = getSerializableState(get());
    await supabase
      .from('matches')
      .update({
        game_state: serializable,
        status: 'ended',
        home_score: get().home.score,
        away_score: get().away.score,
      })
      .eq('id', matchId);
    set({ matchId: null });
  },

  fetchMatches: async () => {
    const { data } = await supabase
      .from('matches')
      .select('id, home_name, away_name, home_score, away_score, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      set({
        matchList: data.map(m => ({
          id: m.id,
          homeName: m.home_name,
          awayName: m.away_name,
          homeScore: m.home_score,
          awayScore: m.away_score,
          status: m.status as 'active' | 'ended',
          createdAt: m.created_at,
        })),
      });
    }
  },

  saveToDb: () => {
    debouncedSave(get() as GameState);
  },
}));

// Listen for broadcasts from other tabs
if (bc) {
  bc.onmessage = (event) => {
    if (event.data.type === 'STATE_SYNC') {
      useGameStore.getState().setFullState(event.data.data);
    }
  };
}

// On startup: check for active match in URL or load latest active
const initMatch = async () => {
  const params = new URLSearchParams(window.location.search);
  const matchIdParam = params.get('match');

  if (matchIdParam) {
    await useGameStore.getState().loadMatch(matchIdParam);
    return;
  }

  // Auto-load latest active match
  const { data } = await supabase
    .from('matches')
    .select('id')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (data) {
    await useGameStore.getState().loadMatch(data.id);
  }
};

initMatch();
