'use client';

import { useState, useEffect, useCallback } from 'react';

interface TeamStatus {
  name: string;
  region: string;
  seed: number;
  status: 'alive' | 'eliminated' | 'champion';
  eliminatedRound?: string;
  wins: number;
  owner?: string;
}

const REGION_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  East: { bg: 'bg-blue-900/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20' },
  West: { bg: 'bg-red-900/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20' },
  South: { bg: 'bg-green-900/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20' },
  Midwest: { bg: 'bg-yellow-900/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20' },
};

const PLAYER_COLORS: Record<string, string> = {
  Tom: 'text-blue-400',
  Stacie: 'text-purple-400',
  Taylor: 'text-pink-400',
  Austin: 'text-orange-400',
  Natalie: 'text-green-400',
  Kait: 'text-cyan-400',
};

export default function TeamsPage() {
  const [teamStatuses, setTeamStatuses] = useState<TeamStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch('/api/scores?action=live');
      const data = await res.json();
      setTeamStatuses(data.teamStatuses || []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
    const interval = setInterval(fetchTeams, 60000);
    return () => clearInterval(interval);
  }, [fetchTeams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-2xl animate-pulse">🏟️ Loading teams...</div>
      </div>
    );
  }

  const regions = ['East', 'West', 'South', 'Midwest'];

  const filtered = filter === 'all'
    ? teamStatuses
    : filter === 'alive'
    ? teamStatuses.filter(t => t.status === 'alive')
    : filter === 'eliminated'
    ? teamStatuses.filter(t => t.status === 'eliminated')
    : teamStatuses.filter(t => t.owner === filter);

  const uniqueOwners = [...new Set(teamStatuses.map(t => t.owner).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-1">🏟️ All Teams</h1>
        <p className="text-white/40 text-sm">
          {teamStatuses.filter(t => t.status === 'alive').length} alive ·{' '}
          {teamStatuses.filter(t => t.status === 'eliminated').length} eliminated
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {['all', 'alive', 'eliminated', ...uniqueOwners].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as string)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-mm-orange text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {f === 'all' ? '🏀 All' : f === 'alive' ? '✅ Alive' : f === 'eliminated' ? '❌ Out' : `${f}`}
          </button>
        ))}
      </div>

      {/* Teams by region */}
      {regions.map((region) => {
        const regionTeams = filtered
          .filter(t => t.region === region)
          .sort((a, b) => a.seed - b.seed);

        if (regionTeams.length === 0) return null;

        const colors = REGION_COLORS[region];

        return (
          <div key={region} className={`rounded-xl border ${colors.border} overflow-hidden`}>
            <div className={`${colors.badge} px-4 py-2.5`}>
              <h2 className={`font-bold text-lg ${colors.text}`}>{region} Region</h2>
            </div>
            <div className="divide-y divide-white/5">
              {regionTeams.map((team) => (
                <div
                  key={`${team.region}|${team.name}`}
                  className={`flex items-center justify-between px-4 py-3 ${
                    team.status === 'eliminated' ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {team.status === 'alive' ? '✅' : team.status === 'champion' ? '🏆' : '❌'}
                    </span>
                    <div>
                      <span className="text-white/40 text-sm mr-1">({team.seed})</span>
                      <span className={`font-medium ${team.status === 'eliminated' ? 'line-through' : ''}`}>
                        {team.name}
                      </span>
                      {team.wins > 0 && (
                        <span className="ml-2 text-xs text-mm-orange font-bold">{team.wins}W</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {team.owner ? (
                      <span className={`text-sm font-medium ${PLAYER_COLORS[team.owner] || 'text-white/60'}`}>
                        {team.owner}
                      </span>
                    ) : (
                      <span className="text-sm text-white/20">Unassigned</span>
                    )}
                    {team.eliminatedRound && (
                      <div className="text-xs text-white/30">{team.eliminatedRound}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
