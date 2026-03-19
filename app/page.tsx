import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="text-6xl mb-6 animate-bounce">🏀</div>
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-mm-orange to-mm-accent bg-clip-text text-transparent">
        Griffin Family
        <br />
        March Madness Pool
      </h1>
      <p className="text-white/60 text-lg mb-8 max-w-md">
        6 family members. 64 teams. Random draw. One champion.
      </p>

      <div className="w-full max-w-sm space-y-4 mb-10">
        <Link
          href="/draft"
          className="block w-full py-4 px-6 bg-mm-orange hover:bg-mm-orange/80 rounded-xl text-xl font-bold text-center transition-all hover:scale-105 active:scale-95"
        >
          🎲 Start the Draft
        </Link>
        <Link
          href="/leaderboard"
          className="block w-full py-4 px-6 bg-mm-blue hover:bg-mm-blue/80 border border-white/20 rounded-xl text-xl font-bold text-center transition-all hover:scale-105 active:scale-95"
        >
          📊 Leaderboard
        </Link>
        <Link
          href="/teams"
          className="block w-full py-4 px-6 bg-mm-darker hover:bg-mm-darker/80 border border-white/20 rounded-xl text-xl font-bold text-center transition-all hover:scale-105 active:scale-95"
        >
          🏟️ All Teams
        </Link>
      </div>

      <div className="bg-white/5 rounded-xl p-6 max-w-md border border-white/10">
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
