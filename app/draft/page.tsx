'use client';

import { useState, useEffect, useCallback } from 'react';

interface Pick {
  pickNumber: number;
  player: string;
  teamKey: string;
  teamName: string;
  seed: number;
  region: string;
}

interface DraftState {
  order: string[];
  picks: Pick[];
  currentPick: number;
  started: boolean;
  complete: boolean;
}

const PLAYER_COLORS: Record<string, string> = {
  Tom: 'player-text-Tom',
  Stacie: 'player-text-Stacie',
  Taylor: 'player-text-Taylor',
  Austin: 'player-text-Austin',
  Natalie: 'player-text-Natalie',
  Kait: 'player-text-Kait',
};

const PLAYER_EMOJI: Record<string, string> = {
  Tom: '👨',
  Stacie: '👩',
  Taylor: '🧑',
  Austin: '🤓',
  Natalie: '👧',
  Kait: '💁',
};

const REGION_COLORS: Record<string, string> = {
  East: 'text-blue-400',
  West: 'text-red-400',
  South: 'text-green-400',
  Midwest: 'text-yellow-400',
};

export default function DraftPage() {
  const [state, setState] = useState<DraftState | null>(null);
  const [snakeOrder, setSnakeOrder] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [availableTeams, setAvailableTeams] = useState(64);
  const [lastPick, setLastPick] = useState<Pick | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealedTeam, setRevealedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/draft?action=state');
      const data = await res.json();
      setState(data.state);
      setSnakeOrder(data.snakeOrder || []);
      setCurrentPlayer(data.currentPlayer || null);
      setAvailableTeams(data.availableTeams ?? 64);
    } catch (err) {
      console.error('Failed to fetch state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handleRandomize = async () => {
    const res = await fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'randomize' }),
    });
    const data = await res.json();
    setState(data.state);
    setSnakeOrder(data.snakeOrder);
    setCurrentPlayer(data.snakeOrder[0]);
    setAvailableTeams(64);
    setLastPick(null);
  };

  const handleDraw = async () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setShowReveal(false);

    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draw' }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      // Show reveal animation
      setRevealedTeam(data.pick);
      setShowReveal(true);

      setTimeout(() => {
        setState(data.state);
        setCurrentPlayer(data.nextPlayer);
        setAvailableTeams(data.availableTeams);
        setLastPick(data.pick);
      }, 1500);
    } catch (err) {
      console.error('Draw failed:', err);
    } finally {
      setTimeout(() => setIsDrawing(false), 1600);
    }
  };

  const handleReset = async () => {
    await fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    setShowResetConfirm(false);
    setState(null);
    setSnakeOrder([]);
    setCurrentPlayer(null);
    setAvailableTeams(64);
    setLastPick(null);
    setShowReveal(false);
    await fetchState();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-2xl animate-pulse">🏀 Loading draft...</div>
      </div>
    );
  }

  // Draft not started
  if (!state?.started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <h1 className="text-3xl font-bold mb-2">🎲 Draft Night</h1>
        <p className="text-white/60 mb-8">Press the button to randomize the draft order!</p>
        <button
          onClick={handleRandomize}
          className="py-5 px-10 bg-mm-orange hover:bg-mm-orange/80 rounded-2xl text-2xl font-bold transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
        >
          🎲 Randomize Draft Order
        </button>
      </div>
    );
  }

  // Draft complete
  if (state.complete) {
    // Group picks by player
    const playerTeams: Record<string, Pick[]> = {};
    for (const pick of state.picks) {
      if (!playerTeams[pick.player]) playerTeams[pick.player] = [];
      playerTeams[pick.player].push(pick);
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🎉 Draft Complete!</h1>
          <p className="text-white/60">All 64 teams have been assigned. Let the madness begin!</p>
        </div>

        {state.order.map((player) => (
          <div key={player} className={`rounded-xl border p-4 player-bg-${player}`}>
            <h3 className={`font-bold text-lg mb-2 ${PLAYER_COLORS[player]}`}>
              {PLAYER_EMOJI[player]} {player} ({playerTeams[player]?.length || 0} teams)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {playerTeams[player]?.sort((a, b) => a.seed - b.seed).map((pick) => (
                <div key={pick.teamKey} className="bg-black/20 rounded-lg px-3 py-2 text-sm">
                  <span className="text-white/40 mr-1">({pick.seed})</span>
                  <span className="font-medium">{pick.teamName}</span>
                  <span className={`text-xs ml-1 ${REGION_COLORS[pick.region]}`}>{pick.region}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 rounded-xl text-red-400 font-medium transition-colors"
        >
          🔄 Reset Draft
        </button>

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-mm-darker rounded-2xl p-6 max-w-sm border border-white/20">
              <h3 className="text-xl font-bold mb-2">Reset Draft?</h3>
              <p className="text-white/60 mb-4">This will erase all picks and start over. Are you sure?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 bg-white/10 rounded-lg">
                  Cancel
                </button>
                <button onClick={handleReset} className="flex-1 py-2 bg-red-600 rounded-lg font-bold">
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Draft in progress
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-1">🎲 Draft in Progress</h1>
        <p className="text-white/50 text-sm">
          Pick {state.currentPick + 1} of 64 · {availableTeams} teams remaining
        </p>
      </div>

      {/* Draft order */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-xs uppercase tracking-wider text-white/40 mb-3">Draft Order</h3>
        <div className="flex flex-wrap gap-2">
          {state.order.map((player, idx) => (
            <div
              key={idx}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                player === currentPlayer
                  ? `player-bg-${player} ring-2 ring-mm-orange`
                  : 'bg-white/5 border-white/10 text-white/40'
              } ${PLAYER_COLORS[player]}`}
            >
              {idx + 1}. {player}
            </div>
          ))}
        </div>
      </div>

      {/* Reveal animation */}
      {showReveal && revealedTeam && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="animate-bounce-in text-center">
            <div className="bg-gradient-to-br from-mm-orange/20 to-mm-accent/20 rounded-3xl p-8 border-2 border-mm-orange/50 max-w-sm mx-auto">
              <p className={`text-lg mb-2 ${PLAYER_COLORS[revealedTeam.player]}`}>
                {PLAYER_EMOJI[revealedTeam.player]} {revealedTeam.player} draws...
              </p>
              <div className="text-5xl mb-3">🏀</div>
              <p className="text-3xl font-extrabold mb-1">{revealedTeam.team.name}</p>
              <p className={`text-lg ${REGION_COLORS[revealedTeam.team.region]}`}>
                ({revealedTeam.team.seed}) seed · {revealedTeam.team.region}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current pick */}
      <div className="text-center space-y-4">
        <div className={`text-2xl font-bold ${PLAYER_COLORS[currentPlayer || '']}`}>
          {PLAYER_EMOJI[currentPlayer || '']} {currentPlayer}&apos;s Turn
        </div>
        <button
          onClick={handleDraw}
          disabled={isDrawing}
          className={`py-6 px-12 rounded-2xl text-3xl font-extrabold transition-all ${
            isDrawing
              ? 'bg-white/10 text-white/30 cursor-wait'
              : 'bg-mm-orange hover:bg-mm-orange/80 hover:scale-105 active:scale-95 animate-pulse-glow'
          }`}
        >
          {isDrawing ? '🎰 Drawing...' : '🎲 Draw Team'}
        </button>
      </div>

      {/* Recent picks */}
      {state.picks.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-xs uppercase tracking-wider text-white/40 mb-3">Recent Picks</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...state.picks].reverse().map((pick) => (
              <div key={pick.pickNumber} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 text-sm">
                <span className="text-white/30 w-8">#{pick.pickNumber}</span>
                <span className={`font-medium ${PLAYER_COLORS[pick.player]}`}>{pick.player}</span>
                <span className="flex items-center gap-1">
                  <span className="text-white/40">({pick.seed})</span>
                  <span className="font-medium">{pick.teamName}</span>
                  <span className={`text-xs ${REGION_COLORS[pick.region]}`}>{pick.region}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white/5 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-mm-orange to-mm-accent h-full rounded-full transition-all duration-500"
          style={{ width: `${(state.picks.length / 64) * 100}%` }}
        />
      </div>

      <button
        onClick={() => setShowResetConfirm(true)}
        className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/20 rounded-xl text-red-400/60 text-sm transition-colors"
      >
        🔄 Reset Draft
      </button>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-mm-darker rounded-2xl p-6 max-w-sm border border-white/20">
            <h3 className="text-xl font-bold mb-2">Reset Draft?</h3>
            <p className="text-white/60 mb-4">This will erase all picks and start over. Are you sure?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 bg-white/10 rounded-lg">
                Cancel
              </button>
              <button onClick={handleReset} className="flex-1 py-2 bg-red-600 rounded-lg font-bold">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
