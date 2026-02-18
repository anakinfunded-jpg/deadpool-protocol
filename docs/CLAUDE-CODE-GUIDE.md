# DEADPOOL — Claude Code Development Guide

Everything you need to go from the current JSX artifact to a live, deployed product.

---

## What You Have Right Now

| File | What it is |
|------|-----------|
| `DEADPOOL-dashboard.jsx` | React frontend (5 pages, mock data, all animations) |
| `death_engine.py` | Python backend (Flask API, Moralis integration, health scoring, SQLite) |
| `DEADPOOL-content-package.md` | All launch copy, tweets, templates |
| `DEADPOOL-comprehensive-plan.md` | Full strategy document |
| `DEADPOOL-deployment-guide.md` | Hosting instructions |
| `DEADPOOL-step-by-step-execution.md` | Day-by-day action plan |

---

## Phase 1: Project Setup (30 min)

Open your terminal. Everything below is what you tell Claude Code to do.

### 1.1 Create the Next.js project

```
Create a new Next.js 14 app with App Router, TypeScript, and Tailwind CSS.
Name it "deadpool". Use pnpm as the package manager.
```

### 1.2 Install dependencies

```
Install these packages:
- @tanstack/react-query (data fetching)
- framer-motion (animations — replaces our manual CSS transitions)
- lucide-react (icons)
- clsx (class merging)
```

### 1.3 Port the dashboard into Next.js

```
Here is my existing React dashboard JSX file: [paste DEADPOOL-dashboard.jsx]

Port this into the Next.js app:
- Convert to TypeScript
- Split into proper components under /components
- Replace inline styles with Tailwind classes
- Replace manual IntersectionObserver reveals with framer-motion
- Replace manual magnetic hover with framer-motion useMotionValue
- Keep the exact same design: black/white/cyan palette, Sora + Instrument Sans + JetBrains Mono fonts, grain overlay, gradient orbs
- Set up the pages as routes: /, /feed, /zombies, /scan, /cto
- Keep mock data for now, we'll connect the API next
```

This is the biggest single prompt. Claude Code will create ~15 files. Review each page in the browser before moving on.

---

## Phase 2: Backend API (1-2 hours)

### 2.1 Set up the Python backend

```
Here is my Python backend: [paste death_engine.py]

Set this up as a standalone Flask project in a /backend folder.
- Add a requirements.txt
- Add a .env.example with MORALIS_API_KEY placeholder
- Add CORS support (flask-cors) so the Next.js frontend can call it
- Make sure the /api/stats, /api/deaths, /api/zombies, /api/token/<address> endpoints work
- Add a /api/health endpoint for uptime monitoring
- Test each endpoint returns valid JSON with mock data if no Moralis key is set
```

### 2.2 Get your Moralis API key

1. Go to https://admin.moralis.io — sign up (free)
2. Create a new project
3. Copy the API key
4. Add it to your backend `.env` file

### 2.3 Test the scanner

```
Run the backend locally. Trigger a manual scan with POST /api/scan.
Verify it fetches real pump.fun tokens from Moralis and scores them.
Print the first 5 results so I can verify the health scoring works.
```

---

## Phase 3: Connect Frontend to Backend (1 hour)

### 3.1 Create API client

```
Create an API client module at /lib/api.ts that:
- Has a base URL configurable via NEXT_PUBLIC_API_URL env var
- Has typed functions: getStats(), getDeaths(filter), getZombies(sort), scanToken(address)
- Returns properly typed TypeScript interfaces
- Handles errors gracefully
```

### 3.2 Replace mock data with real API calls

```
Replace all mock data in the frontend with real API calls using @tanstack/react-query.
- Home page: useQuery for stats
- Death Feed: useQuery for deaths with filter parameter
- Zombie Index: useQuery for zombies with sort parameter
- Health Scan: useMutation for token scanning
- Add loading skeletons that match the design (dark shimmer placeholders)
- Add error states
- Keep the existing animations — data should fade in with the same reveal effects
```

### 3.3 Add auto-refresh

```
Add auto-refresh to the Death Feed page:
- Refetch every 60 seconds
- Show a subtle "Updated X seconds ago" timestamp
- New tokens should animate in at the top of the list
```

---

## Phase 4: Deploy (1 hour)

### 4.1 Deploy backend

```
Create a Dockerfile for the Python backend.
Add a railway.toml or render.yaml for one-click deployment.
The backend should:
- Run the Flask API on port 8080
- Start the background scanner thread
- Use SQLite stored in a persistent volume
```

**Steps you do manually:**
1. Push backend to GitHub
2. Go to https://railway.app — connect your repo
3. Add the `MORALIS_API_KEY` environment variable
4. Deploy — note the public URL (e.g., `deadpool-api.up.railway.app`)

### 4.2 Deploy frontend

```
Configure the Next.js app for Vercel deployment:
- Add NEXT_PUBLIC_API_URL to .env.production pointing to the Railway backend URL
- Make sure all pages work with the API
- Add proper meta tags, OpenGraph image, and favicon (skull emoji or similar)
```

**Steps you do manually:**
1. Push frontend to GitHub
2. Go to https://vercel.com — import the repo
3. Add `NEXT_PUBLIC_API_URL` env var pointing to your Railway URL
4. Deploy
5. Connect your domain (deadprotocol.xyz or similar)

---

## Phase 5: Token Launch (do this in parallel with Phase 2-4)

This is all manual — Claude Code can't do this for you.

1. **Fund wallet**: Send 12-15 SOL to a fresh Phantom wallet
2. **Create $DEAD token on pump.fun**:
   - Name: DEADPOOL
   - Ticker: DEAD
   - Description: paste from `DEADPOOL-content-package.md`
   - Buy 20% of supply on launch (~10 SOL)
3. **Lock tokens**: Go to https://streamflow.finance, lock 50% of your holdings for 6 months
4. **Enable Creator Fee Sharing** on pump.fun
5. **Post launch thread on X** (use the 7-tweet thread from content package)
6. **Set up Telegram group** (use welcome message from content package)

---

## Phase 6: Polish & Content (ongoing)

### 6.1 Add a real-time death counter

```
Add a WebSocket or Server-Sent Events connection to the backend that pushes
new token deaths to the frontend in real-time. Show a subtle notification
toast in the bottom-right when a new death is detected, showing the token
name and cause of death. Auto-dismiss after 5 seconds.
```

### 6.2 Create the "Graveyard" viral infographic

```
Create a /graveyard page that shows a visual grid of the top 100 dead tokens
as small gravestones. Each gravestone shows the token name, peak market cap,
and time of death. Make it shareable — add an "Open Graph" image generator
so when someone shares the URL on X it shows a preview of the graveyard.
```

### 6.3 Add the token page

```
Create a /token/[address] page that shows:
- Full health report for any token
- Price chart (use lightweight-charts library)
- Holder distribution
- Creator wallet activity timeline
- "Submit for CTO" button (links to future marketplace)
Make it look like a detailed medical report / autopsy report for dead tokens.
```

### 6.4 Build the pump.fun stream overlay

```
Create a /overlay page (no nav, transparent background) designed to be used
as a browser source in OBS for pump.fun livestreams. It should show:
- Latest death in a ticker at the bottom
- Current zombie count
- A "DEADPOOL LIVE" badge in the corner
Style it to look good overlaid on a stream.
```

---

## Phase 7: CTO Marketplace (Week 3)

### 7.1 Backend: CTO data model

```
Add CTO marketplace tables to the database:
- cto_proposals: id, token_address, proposer_wallet, bond_amount, revival_plan, status, votes_for, votes_against, created_at
- cto_votes: id, proposal_id, voter_wallet, vote (for/against), holder_balance, created_at
Add API endpoints:
- POST /api/cto/propose (create proposal)
- GET /api/cto/proposals (list active proposals)
- POST /api/cto/vote (cast vote, verify holder status)
- GET /api/cto/proposal/<id> (single proposal detail)
```

### 7.2 Frontend: CTO marketplace page

```
Replace the "Coming Soon" CTO page with a working marketplace:
- List of active CTO proposals with vote counts
- Proposal detail view with revival plan and voting progress
- "Propose CTO" form (token address, revival plan text, bond amount)
- Vote interface for token holders
Keep the same design language. Use the magnetic hover cards for proposal listings.
```

---

## Prompt Tips for Claude Code

Things that will make your Claude Code sessions more productive:

1. **Always paste the relevant file** when asking for changes — don't assume it remembers
2. **One task per prompt** — "port the dashboard to Next.js" is one task, "also add dark mode toggle" is a separate prompt
3. **Reference the design** — say "match the existing black/white/cyan palette" or "use the same Sora font for headings"
4. **Ask it to run the dev server** and verify changes work before moving to the next step
5. **Keep a running TODO** — after each session, ask Claude Code to update a TODO.md in the repo root

---

## File Structure You'll End Up With

```
deadpool/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          (home)
│   │   ├── feed/page.tsx
│   │   ├── zombies/page.tsx
│   │   ├── scan/page.tsx
│   │   ├── cto/page.tsx
│   │   ├── graveyard/page.tsx
│   │   ├── token/[address]/page.tsx
│   │   └── overlay/page.tsx
│   ├── components/
│   │   ├── nav.tsx
│   │   ├── reveal.tsx
│   │   ├── mag-card.tsx
│   │   ├── counter.tsx
│   │   ├── status-pill.tsx
│   │   ├── score-bar.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── public/
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
├── backend/
│   ├── death_engine.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── railway.toml
├── TODO.md
└── README.md
```

---

## Priority Order

If you're short on time, do exactly this:

| Priority | Task | Time | Why |
|----------|------|------|-----|
| 1 | Launch $DEAD token on pump.fun | 30 min | Must exist before application |
| 2 | Lock tokens on Streamflow | 10 min | Required for hackathon |
| 3 | Post launch thread on X | 15 min | Starts the "build in public" clock |
| 4 | Deploy dashboard (even with mock data) | 1 hr | Something to show |
| 5 | Get backend working with real Moralis data | 2 hr | Makes the product real |
| 6 | Connect frontend to backend | 1 hr | Live data on the dashboard |
| 7 | Daily Death Reports on X | 15 min/day | Content cadence |
| 8 | Submit application before Feb 25 | 30 min | The actual deadline |

Everything else (CTO marketplace, graveyard page, stream overlay) is bonus that makes your application stronger but isn't required.

---

## Deadline Reminder

**Application deadline: February 25, 2026, 23:59 EST**

You have 7 days. The token needs to be live before you submit. The dashboard needs to be deployed with real data. Everything else is gravy.

Go build.
