'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface LiveGame {
  id: string;
  status: 'pre' | 'in' | 'post';
  statusDetail: string;
  homeTeam: string;
  homeScore: number;
  awayTeam: string;
  awayScore: number;
  winner?: string;
  loser?: string;
  startTime: string;
}

interface TeamStatus {
  name: string;
  region: string;
  seed: number;
  status: 'alive' | 'eliminated' | 'champion';
  wins: number;
  owner?: string;
}

const PLAYER_COLORS: Record<string, string> = {
  Tom: 'text-red-400',
  Stacie: 'text-pink-400',
  Taylor: 'text-purple-400',
  Austin: 'text-blue-400',
  Natalie: 'text-green-400',
  Kait: 'text-yellow-400',
};

const PLAYER_EMOJI: Record<string, string> = {
  Tom: '👨',
  Stacie: '👩',
  Taylor: '🧑',
  Austin: '🤓',
  Natalie: '👧',
  Kait: '💁',
};

function OwnerBadge({ owner }: { owner?: string }) {
  if (!owner) return <span className="text-xs text-white/20">Undrafted</span>;
  return (
    <span className={`text-xs font-bold ${PLAYER_COLORS[owner] || 'text-white/50'}`}>
      {PLAYER_EMOJI[owner] || ''} {owner}
    </span>
  );
}

function GameCard({ game, teamOwners }: { game: LiveGame; teamOwners: Record<string, string | undefined> }) {
  const isLive = game.status === 'in';
  const isFinal = game.status === 'post';
  const isPre = game.status === 'pre';

  const homeOwner = teamOwners[game.homeTeam];
  const awayOwner = teamOwners[game.awayTeam];
  const homeWon = isFinal && game.winner === game.homeTeam;
  const awayWon = isFinal && game.winner === game.awayTeam;

  return (
    <div className={`rounded-xl border p-3 transition-all ${
      isLive ? 'border-red-500/50 bg-red-500/5 ring-1 ring-red-500/20' 
      : isFinal ? 'border-white/10 bg-white/5' 
      : 'border-white/10 bg-white/5'
    }`}>
      {/* Status bar */}
      <div className="flex justify-between items-center mb-2">
        {isLive && (
          <span className="text-xs font-bold text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        )}
        {isFinal && <span className="text-xs text-white/40">Final</span>}
        {isPre && <span className="text-xs text-white/40">Upcoming</span>}
        <span className="text-xs text-white/30">{game.statusDetail}</span>
      </div>

      {/* Away team */}
      <div className={`flex items-center justify-between py-1.5 ${awayWon ? '' : isFinal ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="font-bold text-sm truncate">{game.awayTeam}</span>
          <OwnerBadge owner={awayOwner} />
        </div>
        <span className={`text-lg font-bold tabular-nums ml-2 ${awayWon ? 'text-mm-orange' : ''}`}>
          {isPre ? '-' : game.awayScore}
        </span>
      </div>

      {/* Home team */}
      <div className={`flex items-center justify-between py-1.5 ${homeWon ? '' : isFinal ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="font-bold text-sm truncate">{game.homeTeam}</span>
          <OwnerBadge owner={homeOwner} />
        </div>
        <span className={`text-lg font-bold tabular-nums ml-2 ${homeWon ? 'text-mm-orange' : ''}`}>
          {isPre ? '-' : game.homeScore}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [teamStatuses, setTeamStatuses] = useState<TeamStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores?action=live');
      if (!res.ok) return;
      const data = await res.json();
      
      // Combine live games and completed games into one list
      const allGames: LiveGame[] = [];
      
      // Add live/in-progress games
      if (data.liveGames) {
        allGames.push(...data.liveGames);
      }
      
      // Add completed games (convert from completedGames format)
      if (data.completedGames) {
        for (const cg of data.completedGames) {
          allGames.push({
            id: cg.gameId,
            status: 'post',
            statusDetail: cg.statusDetail || 'Final',
            homeTeam: cg.winner,
            homeScore: cg.winnerScore,
            awayTeam: cg.loser,
            awayScore: cg.loserScore,
            winner: cg.winner,
            loser: cg.loser,
            startTime: '',
          });
        }
      }

      setLiveGames(allGames);
      setTeamStatuses(data.teamStatuses || []);
      setLastUpdated(data.lastUpdated || null);
    } catch (err) {
      console.error('Failed to fetch scores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  // Build team → owner lookup
  const teamOwners: Record<string, string | undefined> = {};
  for (const ts of teamStatuses) {
    teamOwners[ts.name] = ts.owner;
  }

  const liveNow = liveGames.filter(g => g.status === 'in');
  const recentFinals = liveGames.filter(g => g.status === 'post').slice(-8).reverse();
  const upcoming = liveGames.filter(g => g.status === 'pre').slice(0, 8);

  const hasGames = liveGames.length > 0;

  return (
    <div className="space-y-8 px-2">
      {/* Hero */}
      <div className="text-center pt-4">
        <div className="text-5xl mb-4">🏀</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-mm-orange to-mm-accent bg-clip-text text-transparent">
          Griffin Family
          <br />
          March Madness Pool
        </h1>
        <p className="text-white/60 text-lg mb-6 max-w-md mx-auto">
          6 family members. 64 teams. Random draw. One champion.
        </p>

        <div className="w-full max-w-sm mx-auto space-y-3 mb-8">
          <Link
            href="/draft"
            className="block w-full py-4 px-6 bg-mm-orange hover:bg-mm-orange/80 rounded-xl text-xl font-bold text-center transition-all hover:scale-105 active:scale-95"
          >
            🎲 Draft
          </Link>
          <div className="flex gap-3">
            <Link
              href="/leaderboard"
              className="flex-1 py-3 px-4 bg-mm-blue hover:bg-mm-blue/80 border border-white/20 rounded-xl text-lg font-bold text-center transition-all hover:scale-105 active:scale-95"
            >
              📊 Leaderboard
            </Link>
            <Link
              href="/teams"
              className="flex-1 py-3 px-4 bg-mm-darker hover:bg-mm-darker/80 border border-white/20 rounded-xl text-lg font-bold text-center transition-all hover:scale-105 active:scale-95"
            >
              🏟️ Teams
            </Link>
          </div>
        </div>
      </div>

      {/* Live Games Section */}
      {hasGames && (
        <div className="space-y-6">
          {/* Live Now */}
          {liveNow.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                Live Now
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveNow.map(game => (
                  <GameCard key={game.id} game={game} teamOwners={teamOwners} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Results */}
          {recentFinals.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">🏁 Recent Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentFinals.map(game => (
                  <GameCard key={game.id} game={game} teamOwners={teamOwners} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">⏰ Coming Up</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcoming.map(game => (
                  <GameCard key={game.id} game={game} teamOwners={teamOwners} />
                ))}
              </div>
            </div>
          )}

          {lastUpdated && (
            <p className="text-center text-xs text-white/20">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()} · Auto-refreshes every 60s
            </p>
          )}
        </div>
      )}

      {/* No games yet / loading */}
      {!hasGames && !loading && (
        <div className="text-center text-white/30 text-sm py-4">
          No live games right now. Scores will appear here once tournament games start! 🏀
        </div>
      )}

      {loading && (
        <div className="text-center text-white/40 text-sm py-4 animate-pulse">
          Loading scores...
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white/5 rounded-xl p-6 max-w-md mx-auto border border-white/10">
        <h2 className="font-bold text-lg mb-3">How It Works</h2>
        <div className="text-left text-sm text-white/70 space-y-2">
          <p>1️⃣ <strong>Randomize</strong> the draft order</p>
          <p>2️⃣ <strong>Snake draft</strong> — each person draws a random team on their turn (1→6, then 6→1, repeat)</p>
          <p>3️⃣ <strong>Track scores</strong> as the tournament progresses — live updates!</p>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/40">
          <p className="font-bold mb-1">Scoring</p>
          <p>R64 win: 1pt · R32 win: 2pt · S16: 4pt · E8: 8pt · FF: 16pt · Champ: 32pt</p>
        </div>
      </div>
    </div>
  );
}
