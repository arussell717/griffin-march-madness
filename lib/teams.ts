export interface Team {
  seed: number;
  name: string;
  region: 'East' | 'West' | 'South' | 'Midwest';
  status: 'alive' | 'eliminated' | 'champion';
  eliminatedRound?: string;
  owner?: string;
  wins: number;
}

export const REGIONS = ['East', 'West', 'South', 'Midwest'] as const;

export const PLAYERS = ['Tom', 'Stacie', 'Taylor', 'Austin', 'Natalie', 'Kait'] as const;

export const SCORING: Record<string, number> = {
  'Round of 64': 1,
  'Round of 32': 2,
  'Sweet 16': 4,
  'Elite 8': 8,
  'Final Four': 16,
  'Championship': 32,
};

export const ROUND_NAMES = [
  'Round of 64',
  'Round of 32',
  'Sweet 16',
  'Elite 8',
  'Final Four',
  'Championship',
];

export const ALL_TEAMS: Team[] = [
  // EAST
  { seed: 1, name: 'Duke', region: 'East', status: 'alive', wins: 0 },
  { seed: 16, name: 'Siena', region: 'East', status: 'alive', wins: 0 },
  { seed: 8, name: 'Ohio State', region: 'East', status: 'alive', wins: 0 },
  { seed: 9, name: 'TCU', region: 'East', status: 'alive', wins: 0 },
  { seed: 5, name: 'St. John\'s', region: 'East', status: 'alive', wins: 0 },
  { seed: 12, name: 'Northern Iowa', region: 'East', status: 'alive', wins: 0 },
  { seed: 4, name: 'Kansas', region: 'East', status: 'alive', wins: 0 },
  { seed: 13, name: 'CA Baptist', region: 'East', status: 'alive', wins: 0 },
  { seed: 6, name: 'Louisville', region: 'East', status: 'alive', wins: 0 },
  { seed: 11, name: 'South Florida', region: 'East', status: 'alive', wins: 0 },
  { seed: 3, name: 'Michigan State', region: 'East', status: 'alive', wins: 0 },
  { seed: 14, name: 'North Dakota State', region: 'East', status: 'alive', wins: 0 },
  { seed: 7, name: 'UCLA', region: 'East', status: 'alive', wins: 0 },
  { seed: 10, name: 'UCF', region: 'East', status: 'alive', wins: 0 },
  { seed: 2, name: 'UConn', region: 'East', status: 'alive', wins: 0 },
  { seed: 15, name: 'Furman', region: 'East', status: 'alive', wins: 0 },

  // WEST
  { seed: 1, name: 'Arizona', region: 'West', status: 'alive', wins: 0 },
  { seed: 16, name: 'Long Island', region: 'West', status: 'alive', wins: 0 },
  { seed: 8, name: 'Villanova', region: 'West', status: 'alive', wins: 0 },
  { seed: 9, name: 'Utah State', region: 'West', status: 'alive', wins: 0 },
  { seed: 5, name: 'Wisconsin', region: 'West', status: 'alive', wins: 0 },
  { seed: 12, name: 'High Point', region: 'West', status: 'alive', wins: 0 },
  { seed: 4, name: 'Arkansas', region: 'West', status: 'alive', wins: 0 },
  { seed: 13, name: 'Hawai\'i', region: 'West', status: 'alive', wins: 0 },
  { seed: 6, name: 'BYU', region: 'West', status: 'alive', wins: 0 },
  { seed: 11, name: 'Texas', region: 'West', status: 'alive', wins: 0 },
  { seed: 3, name: 'Gonzaga', region: 'West', status: 'alive', wins: 0 },
  { seed: 14, name: 'Kennesaw State', region: 'West', status: 'alive', wins: 0 },
  { seed: 7, name: 'Miami', region: 'West', status: 'alive', wins: 0 },
  { seed: 10, name: 'Missouri', region: 'West', status: 'alive', wins: 0 },
  { seed: 2, name: 'Purdue', region: 'West', status: 'alive', wins: 0 },
  { seed: 15, name: 'Queens', region: 'West', status: 'alive', wins: 0 },

  // SOUTH
  { seed: 1, name: 'Florida', region: 'South', status: 'alive', wins: 0 },
  { seed: 16, name: 'Prairie View', region: 'South', status: 'alive', wins: 0 },
  { seed: 8, name: 'Clemson', region: 'South', status: 'alive', wins: 0 },
  { seed: 9, name: 'Iowa', region: 'South', status: 'alive', wins: 0 },
  { seed: 5, name: 'Vanderbilt', region: 'South', status: 'alive', wins: 0 },
  { seed: 12, name: 'McNeese', region: 'South', status: 'alive', wins: 0 },
  { seed: 4, name: 'Nebraska', region: 'South', status: 'alive', wins: 0 },
  { seed: 13, name: 'Troy', region: 'South', status: 'alive', wins: 0 },
  { seed: 6, name: 'North Carolina', region: 'South', status: 'alive', wins: 0 },
  { seed: 11, name: 'VCU', region: 'South', status: 'alive', wins: 0 },
  { seed: 3, name: 'Illinois', region: 'South', status: 'alive', wins: 0 },
  { seed: 14, name: 'Penn', region: 'South', status: 'alive', wins: 0 },
  { seed: 7, name: 'Saint Mary\'s', region: 'South', status: 'alive', wins: 0 },
  { seed: 10, name: 'Texas A&M', region: 'South', status: 'alive', wins: 0 },
  { seed: 2, name: 'Houston', region: 'South', status: 'alive', wins: 0 },
  { seed: 15, name: 'Idaho', region: 'South', status: 'alive', wins: 0 },

  // MIDWEST
  { seed: 1, name: 'Michigan', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 16, name: 'Howard', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 8, name: 'Georgia', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 9, name: 'Saint Louis', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 5, name: 'Texas Tech', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 12, name: 'Akron', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 4, name: 'Alabama', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 13, name: 'Hofstra', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 6, name: 'Tennessee', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 11, name: 'Miami OH', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 3, name: 'Virginia', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 14, name: 'Wright State', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 7, name: 'Kentucky', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 10, name: 'Santa Clara', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 2, name: 'Iowa State', region: 'Midwest', status: 'alive', wins: 0 },
  { seed: 15, name: 'Tennessee State', region: 'Midwest', status: 'alive', wins: 0 },
];

export function getTeamKey(team: { name: string; region: string }): string {
  return `${team.region}|${team.name}`;
}
