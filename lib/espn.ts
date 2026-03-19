// ESPN API integration for live scores
// Uses the public ESPN scoreboard API for NCAA men's basketball

export interface ESPNGame {
  id: string;
  status: 'pre' | 'in' | 'post';
  statusDetail: string;
  homeTeam: string;
  homeScore: number;
  awayTeam: string;
  awayScore: number;
  winner?: string;
  loser?: string;
  round?: string;
  startTime: string;
}

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball';

function normalizeTeamName(name: string): string {
  const mapping: Record<string, string> = {
    'UConn': 'UConn',
    'Connecticut': 'UConn',
    'Miami (OH)': 'Miami OH',
    'Miami (FL)': 'Miami',
    'St. John\'s': 'St. John\'s',
    'St. John\'s (NY)': 'St. John\'s',
    'Saint Mary\'s': 'Saint Mary\'s',
    'Saint Mary\'s (CA)': 'Saint Mary\'s',
    'N.C. State': 'NC State',
    'North Carolina': 'North Carolina',
    'UNC': 'North Carolina',
    'TCU': 'TCU',
    'Texas Christian': 'TCU',
    'BYU': 'BYU',
    'Brigham Young': 'BYU',
    'UCF': 'UCF',
    'Central Florida': 'UCF',
    'SMU': 'SMU',
    'Southern Methodist': 'SMU',
    'VCU': 'VCU',
    'Virginia Commonwealth': 'VCU',
    'UMBC': 'UMBC',
    'LIU': 'Long Island',
    'Long Island University': 'Long Island',
    'Cal Baptist': 'CA Baptist',
    'California Baptist': 'CA Baptist',
    'SIU Edwardsville': 'SIU Edwardsville',
    'SIUE': 'SIU Edwardsville',
    'Prairie View A&M': 'Prairie View',
    'North Dakota St': 'North Dakota State',
    'NDSU': 'North Dakota State',
    'N. Dakota St.': 'North Dakota State',
    'Tennessee St': 'Tennessee State',
    'Tennessee State': 'Tennessee State',
    'Kennesaw St': 'Kennesaw State',
    'Kennesaw St.': 'Kennesaw State',
    'Wright St': 'Wright State',
    'Wright St.': 'Wright State',
    'USF': 'South Florida',
    'Iowa St': 'Iowa State',
    'Iowa St.': 'Iowa State',
    'Michigan St': 'Michigan State',
    'Michigan St.': 'Michigan State',
    'Ohio St': 'Ohio State',
    'Ohio St.': 'Ohio State',
    'Texas A&M': 'Texas A&M',
    'Utah St': 'Utah State',
    'Utah St.': 'Utah State',
    'Hawaii': 'Hawai\'i',
    'Saint Louis': 'Saint Louis',
    'St. Louis': 'Saint Louis',
    'Queens (NC)': 'Queens',
    'Queens University': 'Queens',
    'N. Iowa': 'Northern Iowa',
    'Northern Iowa': 'Northern Iowa',
    'Tenn. State': 'Tennessee State',
    'Tenn State': 'Tennessee State',
  };
  return mapping[name] || name;
}

export async function fetchTournamentScores(dateStr?: string): Promise<ESPNGame[]> {
  try {
    // Fetch tournament scoreboard - groups=100 is NCAA tournament
    const dates = dateStr || new Date().toISOString().split('T')[0].replace(/-/g, '');
    const url = `${ESPN_BASE}/scoreboard?groups=100&dates=${dates}&limit=50`;
    
    const res = await fetch(url, { 
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    const games: ESPNGame[] = [];

    for (const event of data?.events || []) {
      try {
        const comp = event.competitions?.[0];
        if (!comp) continue;

        const home = comp.competitors?.find((c: any) => c.homeAway === 'home');
        const away = comp.competitors?.find((c: any) => c.homeAway === 'away');
        if (!home || !away) continue;

        const homeTeam = normalizeTeamName(home.team?.displayName || home.team?.shortDisplayName || '');
        const awayTeam = normalizeTeamName(away.team?.displayName || away.team?.shortDisplayName || '');
        const homeScore = parseInt(home.score || '0');
        const awayScore = parseInt(away.score || '0');

        const statusType = event.status?.type?.name || '';
        let status: 'pre' | 'in' | 'post' = 'pre';
        if (statusType === 'STATUS_IN_PROGRESS' || statusType === 'STATUS_HALFTIME') {
          status = 'in';
        } else if (statusType === 'STATUS_FINAL') {
          status = 'post';
        }

        const game: ESPNGame = {
          id: event.id,
          status,
          statusDetail: event.status?.type?.shortDetail || '',
          homeTeam,
          homeScore,
          awayTeam,
          awayScore,
          startTime: event.date || '',
        };

        if (status === 'post') {
          game.winner = homeScore > awayScore ? homeTeam : awayTeam;
          game.loser = homeScore > awayScore ? awayTeam : homeTeam;
        }

        // Try to detect round from notes
        const note = event.competitions?.[0]?.notes?.[0]?.headline || '';
        if (note.toLowerCase().includes('first round') || note.toLowerCase().includes('round of 64')) {
          game.round = 'Round of 64';
        } else if (note.toLowerCase().includes('second round') || note.toLowerCase().includes('round of 32')) {
          game.round = 'Round of 32';
        } else if (note.toLowerCase().includes('sweet 16') || note.toLowerCase().includes('regional semifinal')) {
          game.round = 'Sweet 16';
        } else if (note.toLowerCase().includes('elite 8') || note.toLowerCase().includes('elite eight') || note.toLowerCase().includes('regional final')) {
          game.round = 'Elite 8';
        } else if (note.toLowerCase().includes('final four') || note.toLowerCase().includes('national semifinal')) {
          game.round = 'Final Four';
        } else if (note.toLowerCase().includes('championship') || note.toLowerCase().includes('national championship')) {
          game.round = 'Championship';
        }

        games.push(game);
      } catch {
        continue;
      }
    }

    return games;
  } catch (error) {
    console.error('ESPN API error:', error);
    return [];
  }
}

// Fetch scores across multiple days of the tournament
export async function fetchAllTournamentScores(): Promise<ESPNGame[]> {
  const allGames: ESPNGame[] = [];
  
  // Tournament dates for 2026
  const dates = [
    '20260319', '20260320', '20260321', '20260322', '20260323',
    '20260326', '20260327', '20260328', '20260329',
    '20260404', '20260405', '20260407',
  ];

  // Only fetch dates up to today + 1
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0].replace(/-/g, '');

  const relevantDates = dates.filter(d => d <= tomorrowStr);

  const results = await Promise.allSettled(
    relevantDates.map(d => fetchTournamentScores(d))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allGames.push(...result.value);
    }
  }

  // Deduplicate by game id
  const seen = new Set<string>();
  return allGames.filter(g => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
}
