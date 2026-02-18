# ☠ DEADPOOL — The Token Afterlife Protocol

> 98.6% of pump.fun tokens die within 24 hours. DEADPOOL monitors the graveyard, ranks revival opportunities, and powers community takeovers.

Built in public for the [pump.fun $3M Build in Public Hackathon](https://pump.fun).

---

## Project Structure

```
deadpool/
├── frontend/          ← React dashboard (Next.js ready)
│   └── App.jsx        ← Complete 5-page app with animations
├── backend/           ← Python API + death detection engine
│   ├── death_engine.py
│   ├── requirements.txt
│   └── .env.example
├── content/           ← Launch copy, tweets, templates
│   └── CONTENT-TEMPLATES.md
├── docs/              ← Strategy, deployment, execution
│   ├── CLAUDE-CODE-GUIDE.md   ← START HERE — step-by-step dev guide
│   ├── STRATEGY.md
│   ├── DEPLOYMENT.md
│   └── EXECUTION-PLAN.md
└── README.md          ← You are here
```

## Quick Start

### 1. Read the guide
Open `docs/CLAUDE-CODE-GUIDE.md` — it has exact prompts to paste into Claude Code.

### 2. Set up frontend
The `frontend/App.jsx` is a complete React app. Port it into Next.js using Claude Code (instructions in the guide).

### 3. Set up backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your Moralis API key to .env
python death_engine.py
```
API runs on http://localhost:5000

### 4. Launch token
Follow `docs/EXECUTION-PLAN.md` — Day 0 checklist.

## Deadline
**Application: February 25, 2026, 23:59 EST**

## Links
- Token: [pump.fun] (create first)
- Dashboard: [deploy to Vercel]
- API: [deploy to Railway]
- X: [@deadprotocol]
- Telegram: [t.me/deadprotocol]
