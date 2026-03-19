import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '🏀 Griffin Family March Madness Pool',
  description: 'Family random draw March Madness bracket pool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-white min-h-screen">
        <nav className="sticky top-0 z-50 bg-mm-darker/90 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold flex items-center gap-2">
              🏀 <span className="hidden sm:inline">Griffin</span> Madness
            </Link>
            <div className="flex gap-1 sm:gap-3 text-sm">
              <Link href="/draft" className="px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                Draft
              </Link>
              <Link href="/leaderboard" className="px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                Scores
              </Link>
              <Link href="/teams" className="px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                Teams
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
