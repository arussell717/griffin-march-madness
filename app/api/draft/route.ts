import { NextRequest, NextResponse } from 'next/server';
import { storageGet, storageSet, storageReset } from '@/lib/storage';
import { PLAYERS, ALL_TEAMS, getTeamKey } from '@/lib/teams';

export interface DraftState {
  order: string[];
  picks: Array<{ pickNumber: number; player: string; teamKey: string; teamName: string; seed: number; region: string }>;
  currentPick: number;
  started: boolean;
  complete: boolean;
}

function getSnakeOrder(order: string[], totalPicks: number): string[] {
  const result: string[] = [];
  const n = order.length;
  let round = 0;
  let pick = 0;

  while (pick < totalPicks) {
    if (round % 2 === 0) {
      for (let i = 0; i < n && pick < totalPicks; i++) {
        result.push(order[i]);
        pick++;
      }
    } else {
      for (let i = n - 1; i >= 0 && pick < totalPicks; i--) {
        result.push(order[i]);
        pick++;
      }
    }
    round++;
  }

  return result;
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action');

  if (action === 'state') {
    const state = await storageGet<DraftState>('draft_state');
    const assignments = await storageGet<Record<string, string>>('team_assignments') || {};

    if (!state) {
      return NextResponse.json({
        state: { order: [], picks: [], currentPick: 0, started: false, complete: false },
        assignments,
        snakeOrder: [],
        availableTeams: ALL_TEAMS.length,
      });
    }

    const snakeOrder = getSnakeOrder(state.order, ALL_TEAMS.length);
    const currentPlayer = state.currentPick < snakeOrder.length ? snakeOrder[state.currentPick] : null;

    return NextResponse.json({
      state,
      assignments,
      snakeOrder,
      currentPlayer,
      availableTeams: ALL_TEAMS.length - state.picks.length,
    });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === 'randomize') {
    // Shuffle players into random order
    const shuffled = [...PLAYERS].sort(() => Math.random() - 0.5);
    const state: DraftState = {
      order: shuffled,
      picks: [],
      currentPick: 0,
      started: true,
      complete: false,
    };
    await storageSet('draft_state', state);
    await storageSet('team_assignments', {});

    return NextResponse.json({
      state,
      snakeOrder: getSnakeOrder(shuffled, ALL_TEAMS.length),
    });
  }

  if (action === 'draw') {
    const state = await storageGet<DraftState>('draft_state');
    if (!state || !state.started || state.complete) {
      return NextResponse.json({ error: 'Draft not in progress' }, { status: 400 });
    }

    const snakeOrder = getSnakeOrder(state.order, ALL_TEAMS.length);
    if (state.currentPick >= snakeOrder.length) {
      return NextResponse.json({ error: 'Draft complete' }, { status: 400 });
    }

    // Get assigned team keys
    const assignments = await storageGet<Record<string, string>>('team_assignments') || {};
    const assignedKeys = new Set(Object.keys(assignments));

    // Get available teams
    const available = ALL_TEAMS.filter(t => !assignedKeys.has(getTeamKey(t)));
    if (available.length === 0) {
      state.complete = true;
      await storageSet('draft_state', state);
      return NextResponse.json({ error: 'No teams remaining' }, { status: 400 });
    }

    // Random draw
    const randomIndex = Math.floor(Math.random() * available.length);
    const drawnTeam = available[randomIndex];
    const teamKey = getTeamKey(drawnTeam);
    const currentPlayer = snakeOrder[state.currentPick];

    // Record the pick
    assignments[teamKey] = currentPlayer;
    state.picks.push({
      pickNumber: state.currentPick + 1,
      player: currentPlayer,
      teamKey,
      teamName: drawnTeam.name,
      seed: drawnTeam.seed,
      region: drawnTeam.region,
    });
    state.currentPick++;

    if (state.currentPick >= ALL_TEAMS.length) {
      state.complete = true;
    }

    await storageSet('draft_state', state);
    await storageSet('team_assignments', assignments);

    const nextPlayer = state.currentPick < snakeOrder.length ? snakeOrder[state.currentPick] : null;

    return NextResponse.json({
      pick: {
        player: currentPlayer,
        team: drawnTeam,
        pickNumber: state.currentPick,
      },
      state,
      nextPlayer,
      availableTeams: ALL_TEAMS.length - state.picks.length,
    });
  }

  if (action === 'reset') {
    await storageReset();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
