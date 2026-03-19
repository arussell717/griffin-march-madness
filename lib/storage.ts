// Storage abstraction: uses Vercel KV if available, falls back to in-memory
// In-memory state resets on cold start but is fine for the draft night + short-lived pool

let memStore: Record<string, string> = {};

function useKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKV() {
  if (!useKV()) return null;
  const { kv } = await import('@vercel/kv');
  return kv;
}

export async function storageGet<T>(key: string): Promise<T | null> {
  try {
    const kv = await getKV();
    if (kv) {
      return await kv.get<T>(key);
    }
    const val = memStore[key];
    return val ? JSON.parse(val) as T : null;
  } catch (error) {
    console.error(`Storage get error for ${key}:`, error);
    return null;
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  try {
    const kv = await getKV();
    if (kv) {
      await kv.set(key, value);
    } else {
      memStore[key] = JSON.stringify(value);
    }
  } catch (error) {
    console.error(`Storage set error for ${key}:`, error);
    // Fallback to memory if KV fails
    memStore[key] = JSON.stringify(value);
  }
}

export async function storageDel(key: string): Promise<void> {
  try {
    const kv = await getKV();
    if (kv) {
      await kv.del(key);
    } else {
      delete memStore[key];
    }
  } catch (error) {
    console.error(`Storage del error for ${key}:`, error);
    delete memStore[key];
  }
}

// For resetting everything
export async function storageReset(): Promise<void> {
  const keys = ['draft_order', 'draft_state', 'team_assignments', 'game_results'];
  for (const key of keys) {
    await storageDel(key);
  }
  memStore = {};
}
