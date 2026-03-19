import { NextRequest, NextResponse } from 'next/server';
import { fetchAllTournamentScores, ESPNGame } from '@/lib/espn';
import { storageGet, storageSet } from '@/lib/storage';
import { ALL_TEAMS, getTeamKey, ROUND_NAMES } from '@/lib/teams';

export interface GameResult {
  gameId: string;
  winner: string;
  loser: string;
  round: string;
  winnerScore: number;
  loserScore: number;
  statusDetail: string;
}

export interface TeamStatus {
  name: string;
  region: string;
  seed: number;
  status: 'alive' | 'eliminated' | 'champion';
  eliminatedRound?: string;
  wins: number;
  owner?: string;
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action');

  if (action === 'live') {
    try {
      const games = await fetchAllTournamentScores();
      const assignments = await storageGet<Record<string, string>>('team_assignments') || {};

      // Build team status from game results
      const teamWins: Record<string, number> = {};
      const teamEliminated: Record<string, string> = {};
      const completedGames: GameResult[] = [];
      const liveGames: ESPNGame[] = [];

      for (const game of games) {
        if (game.status === 'post' && game.winner && game.loser) {
          const round = game.round || 'Round of 64';
          teamWins[game.winner] = (teamWins[game.winner] || 0) + 1;
          teamEliminated[game.loser] = round;
          completedGames.push({
            gameId: game.id,
            winner: game.winner,
            loser: game.loser,
            round,
            winnerScore: game.homeTeam === game.winner ? game.homeScore : game.awayScore,
            loserScore: game.homeTeam === game.loser ? game.homeScore : game.awayScore,
            statusDetail: game.statusDetail,
          });
        } else if (game.status === 'in') {
          liveGames.push(game);
        }
      }

      // Build full team statuses
      const teamStatuses: TeamStatus[] = ALL_TEAMS.map(team => {
        const key = getTeamKey(team);
        const wins = teamWins[team.name] || 0;
        const elimRound = teamEliminated[team.name];
        let status: 'alive' | 'eliminated' | 'champion' = 'alive';

        if (elimRound) {
          status = 'eliminated';
        } else if (wins === 6) {
          status = 'champion';
        }

        return {
          name: team.name,
          region: team.region,
          seed: team.seed,
          status,
          eliminatedRound: elimRound,
          wins,
          owner: assignments[key],
        };
      });

      // Cache results
      await storageSet('game_results', {
        lastUpdated: new Date().toISOString(),
        teamStatuses,
        completedGames,
      });

      return NextResponse.json({
        teamStatuses,
        completedGames,
        liveGames,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Scores fetch error:', error);

      // Return cached results on error
      const cached = await storageGet<any>('game_results');
      if (cached) {
        return NextResponse.json({ ...cached, liveGames: [], fromCache: true });
      }

      return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
