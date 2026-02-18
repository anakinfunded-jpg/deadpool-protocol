# DEADPOOL — Step-by-Step Execution Plan

## From Right Now to Application Submission (Feb 25 deadline)

---

# TODAY — Day 0 (Feb 18)

## Step 1: Set Up Your Wallets (30 min)
1. Download **Phantom Wallet** (phantom.app) if you don't have it — this is the standard Solana wallet
2. Create a **dedicated project wallet** — do NOT use your personal wallet. Label it "DEADPOOL Dev"
3. Fund it with at least **15 SOL** (you'll need ~9.45 SOL for 30% token supply purchase + gas fees + some buffer)
4. Create a **second wallet** for the community treasury allocation in Creator Fee Sharing
5. Write down both wallet public addresses — you'll publish these on Day 1

## Step 2: Secure Your Brand (1 hour)
1. **X/Twitter**: Register @DeadProtocol or @deadpoolsol or @dead_protocol — get the best available handle. Write a bio: "The Token Afterlife Protocol 💀🧟 | Giving dead pump.fun tokens a second life | Building in public for @Pumpfun hackathon"
2. **Telegram**: Create a public group — t.me/deadprotocol or similar. Set description, rules, and a pinned welcome message
3. **Domain**: Register deadprotocol.xyz or similar (Namecheap, ~$2)
4. **GitHub**: Create a public repo — github.com/[you]/deadpool-protocol. Make it public from Day 1. This is "building in public"
5. **Logo/Branding**: Use an AI image generator (Midjourney, DALL-E, or ask Claude to describe a prompt) to create a logo. Theme: skull + resurrection + green/purple neon. You need this for the pump.fun token image

## Step 3: Launch the $DEAD Token on Pump.fun (30 min)
1. Go to pump.fun (web or app)
2. Connect your Phantom wallet
3. Click "Create Token"
4. Fill in:
   - **Name**: Dead Protocol (or DEADPOOL if not taken — check first)
   - **Ticker**: $DEAD
   - **Image**: Upload your logo
   - **Description**: Copy from the plan document — include website, X, Telegram, GitHub links
5. At the purchase step: **Buy 30% of supply**. This costs approximately 9.45 SOL. This puts you in the recommended 20-50% range
6. **Immediately after creation**: Go to your token page on pump.fun and enable **Creator Fee Sharing**
   - Set up fee distribution: Dev wallet 60%, Community treasury wallet 30%, Third wallet for contributor rewards 10%
7. Screenshot the token page, contract address, and your wallet's holdings as proof

## Step 4: Lock Tokens via Streamflow (30 min)
1. Go to app.streamflow.finance
2. Connect your Phantom wallet
3. Select "Token Lock" or "Vesting"
4. Lock **20% of total supply** (200M out of your 300M tokens) with:
   - **Type**: Linear vesting
   - **Duration**: 6 months
   - **Cliff**: 1 month (nothing unlocks for 30 days, then linear release)
5. Complete the transaction
6. Copy the Streamflow dashboard link — this is your public proof of locked tokens
7. You now have 10% liquid (for development/marketing) and 20% locked (for long-term signal)

## Step 5: First Public Announcement (1 hour)
1. **X Thread** (your first post ever — make it count):

   Post 1/7: "Introducing DEADPOOL — The Token Afterlife Protocol 💀🧟

   Every day, 30,000 tokens launch on @Pumpfun. 98% die within 24 hours.

   That's millions of stranded holders, dead communities, and trapped value.

   We're building the infrastructure to bring them back to life. 🧵"

   Post 2/7: "The problem is massive:
   - 15M+ dead tokens on pump.fun
   - Millions of holders stuck with worthless bags
   - CTOs happen organically but are chaotic and unstructured
   - pump.fun literally says CTO founders are eligible for their hackathon

   DEADPOOL is the missing infrastructure."

   Post 3/7: "What we're building:
   🔍 Death Detection Engine — AI that scans every pump.fun token and scores its health in real-time
   🧟 Zombie Index — ranked list of the most promising dead tokens to revive
   🏪 CTO Marketplace — structured takeover process with holder voting
   🛠️ Revival Toolkit — everything a new team needs to succeed"

   Post 4/7: "How the $DEAD token works:
   - Stake $DEAD to claim dead tokens (bond)
   - Hold $DEAD to access Zombie Index premium
   - Burn $DEAD on CTO fees (deflationary)
   - Creator Fee Sharing enabled from Day 1
   - 30% team supply, 20% locked on @streamaborflow for 6 months"

   Post 5/7: "Proof of commitment:
   🔒 Streamflow lock: [link]
   👛 Dev wallet: [address]
   👛 Community wallet: [address]
   📂 Open source: [github link]

   Everything is public. No hiding."

   Post 6/7: "Building in public for the @Pumpfun Build in Public Hackathon.

   Daily updates. Regular streams. Open development.

   Follow this account to watch a product get built from zero. 💀"

   Post 7/7: "$DEAD is live on pump.fun: [link]

   Join our community: [telegram link]

   The token afterlife starts now. 🧟

   @pumpspotlight @Pumpfun @a1lon9"

2. **Telegram**: Post the same thread as a welcome message. Pin it.
3. **Pump.fun Stream** (optional but powerful): Go live on pump.fun for 15-30 minutes. Introduce yourself, explain the concept, show the token, show the locked tokens. Even if 3 people watch, it signals to pump.fun's team that you're using their platform features.

---

# DAYS 1-3 — Foundation & MVP Start

## Step 6: Start Building the Death Detection Engine (Day 1-2)
This is the CORE technical product. Build it with Claude.

**What you need:**
- A way to query pump.fun token data (use Moralis API — free tier, sign up at developers.moralis.com)
- A simple scoring algorithm
- A database to store results
- A basic web interface to display them

**API Setup:**
1. Sign up at developers.moralis.com (free)
2. Get your API key
3. Key endpoints you'll use:
   - `GET /token/mainnet/exchange/pumpfun/new` — lists recent pump.fun tokens
   - `GET /token/mainnet/{address}/price` — gets current price
   - `GET /token/mainnet/{address}/metadata` — gets token info
   - You can also use Bitquery's GraphQL API (bitquery.io) for more detailed trade data

**Ask Claude to build:**
- A Python script that:
  1. Fetches recent pump.fun tokens from Moralis API
  2. For each token, checks: current price, 24h volume, liquidity, creation date
  3. Calculates a "health score" (simple formula: score based on volume trend, age, liquidity)
  4. Classifies as ALIVE/FADING/DYING/DEAD/ZOMBIE
  5. Stores results in a SQLite database
  6. Runs on a scheduled basis (every 30 min via cron)

**Prompt for Claude:** "Build me a Python script that queries the Moralis Solana API for pump.fun tokens, calculates a health score based on trading volume, liquidity, and age, classifies tokens into health categories (ALIVE/FADING/DYING/DEAD/ZOMBIE), and stores results in SQLite. Include the API calls, scoring logic, and database schema."

## Step 7: Build the Web Dashboard (Day 2-3)
**Ask Claude to build a React/Next.js dashboard:**

Page 1 — **Death Feed**: Live scrolling feed of recently dead tokens (pulls from your SQLite DB via a simple API)

Page 2 — **Token Health Checker**: Input field where you paste any pump.fun token address → shows its health status, score, and key metrics

Page 3 — **Zombie Index**: Table of top 50 tokens with the highest "zombie scores" (dead but promising) — sortable by holder count, residual liquidity, age, narrative

Page 4 — **Stats**: Total tokens scanned, deaths today, zombies detected, etc.

**Tech stack for speed:**
- Next.js with Tailwind CSS (Claude can generate this quickly)
- Deploy on Vercel (free, instant deploys, connect to GitHub)
- Simple Express/FastAPI backend serving data from SQLite
- Deploy backend on Railway or Render (free tier)

**Prompt for Claude:** "Build me a Next.js dashboard with Tailwind CSS that displays: 1) a live feed of dead pump.fun tokens, 2) a token health checker where users paste an address and see the health status, 3) a Zombie Index table of the most promising dead tokens ranked by score. The data comes from a REST API that reads from SQLite. Include the full frontend code and the API routes."

## Step 8: Daily Content Routine (Every Day Starting Day 1)

**Morning (before you code):**
- Post "DEADPOOL Daily Death Report 💀" on X
  - How many tokens died yesterday
  - Biggest death (highest market cap token that went to zero)
  - Zombie spotlight (one interesting dead token with a story)
  - Development update (what you're building today)

**Evening (after you code):**
- Post a development update on X: screenshot of what you built, what's working, what's next
- Update Telegram with the same content
- Reply to every single comment and DM

**3x per week:**
- Pump.fun livestream (even 15-30 min counts). Show your screen, walk through what you built, talk about dead tokens you found. Be authentic and raw — this is "build in public."

---

# DAYS 4-7 — MVP Polish & First Content Viral Moments

## Step 9: Launch the Dashboard Publicly (Day 4-5)
1. Deploy the dashboard to your domain (deadprotocol.xyz)
2. Announce on X: "The DEADPOOL Dashboard is LIVE 💀 Check the health of any pump.fun token instantly → [link]"
3. Include screenshots showing interesting data — dead tokens with lots of holders, tokens that died after big pumps, etc.
4. Tag crypto analytics accounts, pump.fun ecosystem builders

## Step 10: Create "The Graveyard" Infographic (Day 5-6)
This is your engineered viral moment.

**Ask Claude to generate the data:**
- How many tokens have died on pump.fun in the last 30 days
- Average lifespan of a pump.fun token
- Total holder count across all dead tokens (millions of people holding dead bags)
- Biggest single-day massacre (most deaths in one day)

**Create a visual** (use Canva, Figma, or ask Claude to build an SVG):
- "The Pump.fun Graveyard 💀" — visual showing the scale of token death
- Post this on X with the tagline: "15 million tokens launched. 14.7 million are dead. Here's what the graveyard looks like."
- This WILL get shared. The data is shocking and novel.

## Step 11: Engage the Community (Days 4-7)
- Reply to every pump.fun related tweet you see
- Find holders of dead tokens on X and DM them: "Hey, I'm building DEADPOOL — a protocol to revive dead pump.fun tokens. Your [token name] is in our Zombie Index. Interested in a revival?"
- Post in pump.fun Telegram groups about your project
- Find other hackathon participants and cross-promote
- Look for crypto content creators who might cover the data

---

# DAYS 8-14 — CTO Marketplace & First Revival

## Step 12: Build the CTO Marketplace (Days 8-11)
**Ask Claude to build:**
- A CTO claim form on your website: team info, revival plan, target token, timeline
- A simple voting page where holders of a dead token can vote yes/no on a CTO proposal
- A status tracker showing active CTO proposals
- Start with a Google Form + Telegram voting if building a full app is too slow — ship ugly, iterate later

## Step 13: Facilitate Your First CTO (Days 11-14)
This is the most important milestone. A successful first CTO is your proof of concept.

1. **Identify the target**: Go through your Zombie Index. Find a token that:
   - Has 200+ holders
   - Had an interesting narrative or name
   - Creator is confirmed inactive
   - Has some residual liquidity
2. **Find or become the CTO team**: Either recruit someone from your Telegram to take over, or do a "community CTO" where your own community decides the revival strategy
3. **Announce the CTO publicly**: "DEADPOOL's FIRST REVIVAL 🧟 [Token Name] died 2 weeks ago with 400 holders. Today, a new team is taking over. Watch it happen LIVE on pump.fun stream at [time]."
4. **Stream the entire process**: Go live on pump.fun. Walk through the dead token, introduce the new team/plan, show the holder vote, and announce the result
5. **Document everything**: Before/after screenshots, volume data, holder reaction, everything. This becomes your case study.

## Step 14: Track & Publish CTO Results (Day 14+)
- 24 hours after the CTO: post the results. Did the token pump? Did volume increase? Are holders happy?
- Create a "CTO Report Card" format: Before vs. After metrics
- If the token pumped, this is your strongest marketing material: "This token was dead. DEADPOOL brought it back. +X% in 24 hours."

---

# DAYS 15-21 — Growth, Metrics, Application Prep

## Step 15: Scale Content Production
- **Daily Death Report** continues (now with real data from your engine)
- **Weekly CTO Roundup**: summary of all CTO activity
- **"Dead Token of the Day"**: daily spotlight generating discussion
- **User-generated content**: encourage your community to submit dead tokens they want revived

## Step 16: Build Public Metrics Page
Add a page to your dashboard showing:
- Total tokens scanned (should be thousands by now)
- Total deaths detected
- CTOs facilitated (aim for 3-5 by this point)
- Volume generated from CTO-revived tokens
- $DEAD holder count
- $DEAD market cap
- Dashboard daily visitors

This page is your proof of traction for the application.

## Step 17: Reach Out to Advisors
The hackathon has advisors from Polymarket, Delphi Digital, Pantera, and others. They engage publicly.
- Tag them in relevant threads
- If any post about the hackathon, reply with your progress
- They're not judges but they amplify signal — being on their radar helps

## Step 18: API Release (Optional but Impressive)
Release a simple public API:
- `GET /api/token/{address}/health` — returns health score
- `GET /api/zombies` — returns Zombie Index
- Announce it as open infrastructure for the pump.fun ecosystem
- Other builders can integrate it into their tools

---

# DAYS 22-25 — Application Submission

## Step 19: Record Your Application Video (Day 22-23)
Follow the script from the comprehensive plan, but now UPDATE it with REAL metrics:

"Since launching 3 weeks ago:
- We've scanned X thousand tokens
- Detected X deaths
- Facilitated X community takeovers
- Generated $X in trading volume from revived tokens
- $DEAD has X holders and X market cap
- Our dashboard gets X daily visitors"

Show the dashboard, show the Zombie Index, show a CTO in action. Keep it under 3 minutes. Record with Loom (free) or OBS.

## Step 20: Submit the Application (Day 23-24)
1. Go to the Google Form linked at hackathon.pump.fun/apply
2. Fill in every field thoroughly
3. Attach your video
4. Include links to: token, dashboard, GitHub, X account, Telegram, Streamflow lock, metrics page
5. Submit BEFORE Feb 25, 23:59 EST — do NOT wait until the last hour

## Step 21: Post-Submission Push (Day 25+)
Remember: the hackathon page says this is an **ongoing initiative**. Even after submission:
- Keep building
- Keep streaming
- Keep shipping
- Keep posting Death Reports
- Winners are selected continuously based on observed traction

---

# TOOLS & ACCOUNTS CHECKLIST

| Tool | Purpose | Cost | URL |
|------|---------|------|-----|
| Phantom Wallet | Solana wallet for token creation | Free | phantom.app |
| Pump.fun | Token launch + streaming | ~9.45 SOL for 30% supply | pump.fun |
| Streamflow | Token locking/vesting | Small SOL fee | app.streamflow.finance |
| Moralis | Pump.fun token data API | Free tier | developers.moralis.com |
| Vercel | Frontend hosting | Free tier | vercel.com |
| Railway or Render | Backend hosting | Free tier | railway.app / render.com |
| GitHub | Open source code | Free | github.com |
| Namecheap | Domain registration | ~$2 | namecheap.com |
| Loom | Video recording | Free | loom.com |
| Canva | Graphics/infographics | Free | canva.com |
| Telegram | Community group | Free | telegram.org |
| X/Twitter | Public updates | Free | x.com |
| Claude | Build everything technical | Your current plan | claude.ai |

---

# SOL BUDGET ESTIMATE

| Item | Cost (SOL) |
|------|-----------|
| 30% token supply purchase | ~9.45 |
| Token creation fee | ~0.02 |
| Streamflow lock transaction | ~0.01 |
| Creator Fee Sharing setup | ~0.01 |
| Gas for various transactions | ~0.5 |
| **Buffer** | ~5.0 |
| **TOTAL NEEDED** | **~15 SOL** |

At ~$130/SOL, that's approximately **$1,950** total investment.

---

# CRITICAL RULES — DO NOT BREAK

1. ❌ **NEVER sell your tokens** during the program — this is explicitly against the rules and will disqualify you
2. ❌ **NEVER engage in insider trading** — don't tell people about CTOs before they're public
3. ❌ **NEVER overpromise** — be precise about what exists and what's experimental
4. ✅ **ALWAYS share progress publicly** — silence = stagnation in their eyes
5. ✅ **ALWAYS use pump.fun streaming** — this is their feature, using it signals alignment
6. ✅ **ALWAYS tag @pumpspotlight @Pumpfun @a1lon9** in major milestones
7. ✅ **ALWAYS be transparent** about team wallets, token holdings, and decisions
8. ✅ **ALWAYS respond to community** — engagement is being evaluated

---

# IMMEDIATE NEXT ACTIONS (Do These Right Now)

1. **Fund a Phantom wallet with 15 SOL**
2. **Register your X handle and Telegram group**
3. **Generate a logo**
4. **Launch the $DEAD token on pump.fun**
5. **Lock tokens on Streamflow**
6. **Post your introduction thread**
7. **Ask Claude to start building the Death Detection Engine**

You have 7 days until the Feb 25 deadline. Every hour counts. Ship first, polish later.
