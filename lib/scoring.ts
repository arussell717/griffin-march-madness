import { SCORING, ROUND_NAMES } from './teams';

export interface TeamResult {
  name: string;
  region: string;
  seed: number;
  status: 'alive' | 'eliminated' | 'champion';
  eliminatedRound?: string;
  wins: number;
  owner?: string;
}

export interface PlayerScore {
  name: string;
  totalPoints: number;
  teamsAlive: number;
  teamsEliminated: number;
  totalTeams: number;
  teams: TeamResult[];
}

export function calculateScores(
  teams: TeamResult[],
  assignments: Record<string, string>
): PlayerScore[] {
  const playerMap: Record<string, PlayerScore> = {};

  // Initialize players from assignments
  const allPlayers = new Set(Object.values(assignments));
  for (const player of allPlayers) {
    playerMap[player] = {
      name: player,
      totalPoints: 0,
      teamsAlive: 0,
      teamsEliminated: 0,
      totalTeams: 0,
      teams: [],
    };
  }

  for (const team of teams) {
    const owner = assignments[`${team.region}|${team.name}`];
    if (!owner || !playerMap[owner]) continue;

    const p = playerMap[owner];
    p.totalTeams++;
    const teamWithOwner = { ...team, owner };

    if (team.status === 'alive' || team.status === 'champion') {
      p.teamsAlive++;
    } else {
      p.teamsEliminated++;
    }

    // Calculate points from wins
    let pts = 0;
    for (let i = 0; i < team.wins; i++) {
      const roundName = ROUND_NAMES[i];
      if (roundName && SCORING[roundName]) {
        pts += SCORING[roundName];
      }
    }
    p.totalPoints += pts;
    p.teams.push(teamWithOwner);
  }

  // Sort: most points first, then most teams alive
  return Object.values(playerMap).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.teamsAlive - a.teamsAlive;
  });
}
