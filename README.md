# 🏀 Griffin Family March Madness Pool

A family random-draw March Madness bracket pool with live score tracking.

## Features
- 🎲 Random snake draft of all 64 tournament teams
- 📊 Live leaderboard with automatic score updates from ESPN
- 🏟️ Team tracker organized by region
- 📱 Mobile-first design
- 🎨 Fun reveal animations for draws

## Quick Deploy to Vercel

### 1. Push to GitHub
```bash
cd march-madness-family-pool
git init
git add -A
git commit -m "Initial commit"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/march-madness-family-pool.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Click **Deploy** — it works out of the box with no env vars (uses in-memory storage)

### 3. Add Persistent Storage (Recommended)
Without KV, data resets on cold starts. To add persistence:

1. In your Vercel project dashboard, go to **Storage**
2. Click **Create** → **KV (Upstash Redis)** → choose a name
3. It automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your env vars
4. Redeploy

## Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## How It Works

### The Draft
1. Hit **Randomize Draft Order** to shuffle the family
2. Snake draft: Round 1 goes 1→6, Round 2 goes 6→1, etc.
3. Each person presses **Draw Team** to get a random team
4. All 64 teams are distributed (~10-11 per person)

### Scoring
| Round | Points per Win |
|-------|---------------|
| Round of 64 | 1 |
| Round of 32 | 2 |
| Sweet 16 | 4 |
| Elite 8 | 8 |
| Final Four | 16 |
| Championship | 32 |

### Live Scores
The app polls ESPN's API every 60 seconds for game results. When a team loses, it's automatically marked as eliminated and scores update.

## Players
Tom, Stacie, Taylor, Austin, Natalie, Kait

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Vercel KV (Upstash Redis) with in-memory fallback
- ESPN API for live scores
