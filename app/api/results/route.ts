import { NextRequest, NextResponse } from 'next/server';
import { storageGet, storageSet } from '@/lib/storage';
import { ALL_TEAMS, getTeamKey } from '@/lib/teams';

// Manual results API - for correcting or manually entering results
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === 'eliminate') {
    const { teamName, round } = body;
    const cached = await storageGet<any>('game_results') || {
      lastUpdated: new Date().toISOString(),
      teamStatuses: ALL_TEAMS.map(t => ({
        name: t.name,
        region: t.region,
        seed: t.seed,
        status: 'alive',
        wins: 0,
      })),
      completedGames: [],
    };

    const teamStatuses = cached.teamStatuses.map((t: any) => {
      if (t.name === teamName) {
        return { ...t, status: 'eliminated', eliminatedRound: round };
      }
      return t;
    });

    await storageSet('game_results', { ...cached, teamStatuses, lastUpdated: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  }

  if (action === 'add_win') {
    const { teamName } = body;
    const cached = await storageGet<any>('game_results') || {
      lastUpdated: new Date().toISOString(),
      teamStatuses: ALL_TEAMS.map(t => ({
        name: t.name,
        region: t.region,
        seed: t.seed,
        status: 'alive',
        wins: 0,
      })),
      completedGames: [],
    };

    const teamStatuses = cached.teamStatuses.map((t: any) => {
      if (t.name === teamName) {
        return { ...t, wins: (t.wins || 0) + 1 };
      }
      return t;
    });

    await storageSet('game_results', { ...cached, teamStatuses, lastUpdated: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
