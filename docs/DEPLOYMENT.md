# DEADPOOL — Deployment Guide

## What You Have

You now have 5 files ready to go:

| File | What it is |
|------|-----------|
| `DEADPOOL-dashboard.jsx` | Full React web app (landing + death feed + zombie index + health check + CTO marketplace) |
| `death_engine.py` | Python backend (API + scanner + health scoring + SQLite database) |
| `DEADPOOL-content-package.md` | All copy-paste-ready content (X threads, video script, app answers, templates) |
| `DEADPOOL-comprehensive-plan.md` | Full strategic plan and hackathon compliance guide |
| `DEADPOOL-step-by-step-execution.md` | Day-by-day action plan |

---

## Deploying the Backend (death_engine.py)

### Option A: Railway (Recommended — Free Tier)
1. Go to railway.app, sign up with GitHub
2. Create new project → "Deploy from GitHub repo"
3. Push `death_engine.py` + `requirements.txt` to a GitHub repo
4. Set environment variable: `MORALIS_API_KEY=your_key`
5. Set environment variable: `PORT=5000`
6. Railway auto-detects Python and deploys
7. Your API will be live at `https://your-app.railway.app`

### Option B: Render (Alternative — Free Tier)
1. Go to render.com, sign up
2. New → Web Service → Connect GitHub repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `python death_engine.py`
5. Add env var: `MORALIS_API_KEY=your_key`

### requirements.txt
```
flask==3.0.0
flask-cors==4.0.0
requests==2.31.0
```

---

## Deploying the Frontend (dashboard)

### Option A: Vercel with Next.js (Recommended)

1. Install Node.js if you don't have it
2. Create a new Next.js project:
   ```bash
   npx create-next-app@latest deadpool-dashboard
   cd deadpool-dashboard
   ```
3. Replace the contents of `app/page.tsx` with the React component from `DEADPOOL-dashboard.jsx`
   - Wrap it in proper Next.js format
   - Or use the JSX directly as a client component with `"use client"` at top
4. Update the API calls to point to your Railway backend URL
5. Push to GitHub
6. Go to vercel.com → Import project → Connect GitHub repo
7. Vercel auto-deploys. Connect your domain (deadprotocol.xyz)

### Option B: Static HTML (Fastest)

If you want to skip the Next.js setup, ask Claude to convert the React dashboard into a single HTML file with inline React (via CDN). This can be hosted anywhere — even GitHub Pages for free.

---

## Connecting Frontend to Backend

In the React dashboard, replace the mock data with fetch calls:

```javascript
// Instead of MOCK_DEAD_TOKENS, do:
const [tokens, setTokens] = useState([]);

useEffect(() => {
  fetch('https://your-backend.railway.app/api/deaths?limit=50')
    .then(res => res.json())
    .then(data => setTokens(data.tokens));
}, []);

// Instead of MOCK_STATS, do:
const [stats, setStats] = useState({});

useEffect(() => {
  fetch('https://your-backend.railway.app/api/stats')
    .then(res => res.json())
    .then(data => setStats(data));
}, []);

// For health check:
const checkHealth = async (address) => {
  const res = await fetch(`https://your-backend.railway.app/api/token/${address}`);
  const data = await res.json();
  return data.token;
};
```

---

## Getting Your Moralis API Key

1. Go to developers.moralis.com
2. Sign up (free)
3. Go to dashboard → Settings → API Keys
4. Copy your key
5. Set it as `MORALIS_API_KEY` in your backend environment

Free tier gives you 25,000 requests/day — more than enough to start.

---

## Your Setup Checklist (What YOU Need To Do)

### Right Now (Before Anything Else)
- [ ] Fund a Phantom wallet with 10-15 SOL (~$850-$1,275)
- [ ] Register X handle (@deadprotocol or similar)
- [ ] Create Telegram group (t.me/deadprotocol)
- [ ] Register domain (deadprotocol.xyz — Namecheap, ~$2)
- [ ] Create GitHub repo (github.com/you/deadpool-protocol, make it PUBLIC)
- [ ] Sign up for Moralis (developers.moralis.com — free)

### Token Launch Day
- [ ] Create $DEAD token on pump.fun (buy 20-30% supply)
- [ ] Enable Creator Fee Sharing (60/30/10 split)
- [ ] Lock tokens on Streamflow (app.streamflow.finance)
- [ ] Post launch thread on X (copy from content package)
- [ ] Send welcome message in Telegram (copy from content package)
- [ ] Go live on pump.fun for 15-30 min introduction stream

### Deploy Day (Same Day or Day After)
- [ ] Push death_engine.py to GitHub
- [ ] Deploy backend to Railway
- [ ] Set up frontend (Vercel or static hosting)
- [ ] Connect frontend to backend API
- [ ] Connect domain
- [ ] Post "Dashboard is LIVE" announcement

### Before Feb 25
- [ ] Record application video with Loom (script in content package)
- [ ] Fill out Google Form at hackathon.pump.fun/apply
- [ ] Submit before 23:59 EST February 25

---

## Need Help?

Come back to Claude anytime to:
- Debug deployment issues
- Add new features to the dashboard
- Generate more content
- Build the CTO marketplace
- Create infographics or visuals
- Iterate on the health scoring algorithm
- Add more API endpoints

The foundation is built. Now execute.
