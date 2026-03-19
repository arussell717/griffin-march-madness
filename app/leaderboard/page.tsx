'use client';

import { useState, useEffect, useCallback } from 'react';
import { SCORING, ROUND_NAMES } from '@/lib/teams';

interface TeamStatus {
  name: string;
  region: string;
  seed: number;
  status: 'alive' | 'eliminated' | 'champion';
  eliminatedRound?: string;
  wins: number;
  owner?: string;
}

interface LiveGame {
  id: string;
  status: string;
  statusDetail: string;
  homeTeam: string;
  homeScore: number;
  awayTeam: string;
  awayScore: number;
}

interface PlayerScore {
  name: string;
  totalPoints: number;
  teamsAlive: number;
  teamsEliminated: number;
  totalTeams: number;
  teams: TeamStatus[];
}

const PLAYER_COLORS: Record<string, string> = {
  Tom: 'player-text-Tom',
  Stacie: 'player-text-Stacie',
  Taylor: 'player-text-Taylor',
  Austin: 'player-text-Austin',
  Natalie: 'player-text-Natalie',
  Kait: 'player-text-Kait',
};

const PLAYER_BG: Record<string, string> = {
  Tom: 'player-bg-Tom',
  Stacie: 'player-bg-Stacie',
  Taylor: 'player-bg-Taylor',
  Austin: 'player-bg-Austin',
  Natalie: 'player-bg-Natalie',
  Kait: 'player-bg-Kait',
};

const PLAYER_EMOJI: Record<string, string> = {
  Tom: '👨',
  Stacie: '👩',
  Taylor: '🧑',
  Austin: '🤓',
  Natalie: '👧',
  Kait: '💁',
};

function calculatePlayerScores(teamStatuses: TeamStatus[]): PlayerScore[] {
  const playerMap: Record<string, PlayerScore> = {};

  for (const team of teamStatuses) {
    const owner = team.owner;
    if (!owner) continue;

    if (!playerMap[owner]) {
      playerMap[owner] = {
        name: owner,
        totalPoints: 0,
        teamsAlive: 0,
        teamsEliminated: 0,
        totalTeams: 0,
        teams: [],
      };
    }

    const p = playerMap[owner];
    p.totalTeams++;
    p.teams.push(team);

    if (team.status === 'alive' || team.status === 'champion') {
      p.teamsAlive++;
    } else {
      p.teamsEliminated++;
    }

    let pts = 0;
    for (let i = 0; i < team.wins; i++) {
      const roundName = ROUND_NAMES[i];
      if (roundName && SCORING[roundName]) {
        pts += SCORING[roundName];
      }
    }
    p.totalPoints += pts;
  }

  return Object.values(playerMap).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.teamsAlive - a.teamsAlive;
  });
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/scores?action=live');
      const data = await res.json();
      if (data.teamStatuses) {
        const scores = calculatePlayerScores(data.teamStatuses);
        setPlayers(scores);
      }
      setLiveGames(data.liveGames || []);
      setLastUpdated(data.lastUpdated || '');
    } catch (err) {
      console.error('Failed to fetch scores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 60000);
    return () => clearInterval(interval);
  }, [fetchScores]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-2xl animate-pulse">📊 Loading scores...</div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-5xl mb-4">📊</div>
        <h1 className="text-2xl font-bold mb-2">No Scores Yet</h1>
        <p className="text-white/60">Complete the draft first, then scores will appear here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-1">📊 Leaderboard</h1>
        {lastUpdated && (
          <p className="text-white/40 text-xs">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
            <button onClick={fetchScores} className="ml-2 text-mm-orange hover:text-mm-orange/70">
              ↻ Refresh
            </button>
          </p>
        )}
      </div>

      {/* Live games */}
      {liveGames.length > 0 && (
        <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
          <h3 className="text-xs uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live Games
          </h3>
          <div className="space-y-2">
            {liveGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 text-sm">
                <div className="flex-1">
                  <span className="font-medium">{game.awayTeam}</span>
                  <span className="text-white/40 mx-2">{game.awayScore}</span>
                </div>
                <span className="text-red-400 text-xs font-mono">{game.statusDetail}</span>
                <div className="flex-1 text-right">
                  <span className="text-white/40 mx-2">{game.homeScore}</span>
                  <span className="font-medium">{game.homeTeam}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring legend */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="flex flex-wrap justify-center gap-3 text-xs text-white/50">
          <span>R64: 1pt</span>
          <span>R32: 2pt</span>
          <span>S16: 4pt</span>
          <span>E8: 8pt</span>
          <span>FF: 16pt</span>
          <span>🏆: 32pt</span>
        </div>
      </div>

      {/* Player rankings */}
      <div className="space-y-3">
        {players.map((player, rank) => (
          <div key={player.name}>
            <button
              onClick={() => setExpandedPlayer(expandedPlayer === player.name ? null : player.name)}
              className={`w-full rounded-xl border p-4 transition-all ${PLAYER_BG[player.name]} hover:brightness-110`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white/30 w-8">
                    {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}`}
                  </span>
                  <div className="text-left">
                    <span className={`font-bold text-lg ${PLAYER_COLORS[player.name]}`}>
                      {PLAYER_EMOJI[player.name]} {player.name}
                    </span>
                    <div className="text-xs text-white/40">
                      {player.teamsAlive} alive · {player.teamsEliminated} eliminated · {player.totalTeams} total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-mm-orange">{player.totalPoints}</div>
                  <div className="text-xs text-white/40">points</div>
                </div>
              </div>
            </button>

            {expandedPlayer === player.name && (
              <div className="mt-1 bg-black/20 rounded-xl p-3 border border-white/10 animate-slide-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {player.teams
                    .sort((a, b) => {
                      if (a.status === 'alive' && b.status !== 'alive') return -1;
                      if (a.status !== 'alive' && b.status === 'alive') return 1;
                      return b.wins - a.wins;
                    })
                    .map((team) => (
                      <div
                        key={`${team.region}|${team.name}`}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                          team.status === 'eliminated'
                            ? 'bg-red-900/10 text-white/30 line-through'
                            : team.status === 'champion'
                            ? 'bg-yellow-900/20 border border-yellow-500/30'
                            : 'bg-white/5'
                        }`}
                      >
                        <span>
                          {team.status === 'alive' ? '✅' : team.status === 'champion' ? '🏆' : '❌'}
                          <span className="text-white/40 ml-1">({team.seed})</span>{' '}
                          <span className={team.status !== 'eliminated' ? 'font-medium' : ''}>
                            {team.name}
                          </span>
                        </span>
                        <span className="text-xs">
                          {team.wins > 0 && (
                            <span className="text-mm-orange font-bold mr-1">
                              {(() => {
                                let pts = 0;
                                for (let i = 0; i < team.wins; i++) {
                                  const rn = ROUND_NAMES[i];
                                  if (rn && SCORING[rn]) pts += SCORING[rn];
                                }
                                return `+${pts}`;
                              })()}
                            </span>
                          )}
                          <span className="text-white/30">{team.wins}W</span>
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
