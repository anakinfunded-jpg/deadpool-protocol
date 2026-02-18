const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Backend response types ──────────────────────────────────

interface ApiStatsResponse {
  tokens_scanned: number;
  deaths_today: number;
  zombies_detected: number;
  alive: number;
  fading: number;
  dying: number;
  dead: number;
  total_holders_stranded: number;
  last_scan: Record<string, unknown> | null;
}

interface ApiToken {
  address: string;
  name: string;
  symbol: string;
  logo: string | null;
  created_at: string | null;
  price_usd: number;
  liquidity_usd: number;
  fully_diluted_value: number;
  volume_24h: number;
  health_score: number;
  status: string;
  death_cause: string | null;
  holder_count: number;
  peak_mcap: number;
  zombie_score: number;
  died_at: string | null;
  days_dead: number;
  creator_active: number;
}

// ── Frontend types ──────────────────────────────────────────

export interface Token {
  address: string;
  name: string;
  symbol: string;
  diedAgo: string;
  holders: number;
  peakMcap: string;
  residualLiq: string;
  zombieScore: number;
  healthScore: number;
  status: "DEAD" | "ZOMBIE" | "ALIVE" | "FADING" | "DYING";
  deathCause: string;
}

export interface Stats {
  scanned: number;
  deaths: number;
  zombies: number;
  dying: number;
  alive: number;
  stranded: string;
}

export interface ScanResult {
  name: string;
  symbol: string;
  status: string;
  score: number;
  vol: string;
  holders: number;
  active: boolean;
  liq: string;
  age: string;
  flags: string[];
}

export interface Proposal {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  teamName: string;
  teamContact: string;
  revivalPlan: string;
  strategy: string;
  timeline: string;
  status: "active" | "approved" | "rejected" | "completed";
  createdAt: string;
  createdAgo: string;
  votesFor: number;
  votesAgainst: number;
  voteDeadline: string;
}

// ── Helpers ─────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "?";
  const ms = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return "<1h";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function transformToken(t: ApiToken): Token {
  // For non-dead tokens, show age since creation; for dead, show time since death
  const timeLabel =
    t.status === "DEAD" || t.status === "ZOMBIE"
      ? timeAgo(t.died_at)
      : timeAgo(t.created_at);

  return {
    address: t.address,
    name: t.name || "Unknown",
    symbol: t.symbol || "???",
    diedAgo: timeLabel,
    holders: t.holder_count || 0,
    peakMcap: formatCurrency(t.peak_mcap || 0),
    residualLiq: formatCurrency(t.liquidity_usd || 0),
    zombieScore: t.zombie_score || 0,
    healthScore: t.health_score || 0,
    status: (t.status as Token["status"]) || "DEAD",
    deathCause: t.death_cause || "Scanning...",
  };
}

// ── API functions ───────────────────────────────────────────

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_URL}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  const d: ApiStatsResponse = await res.json();
  return {
    scanned: d.tokens_scanned,
    deaths: d.dead + d.zombies_detected,
    zombies: d.zombies_detected,
    dying: d.dying,
    alive: d.alive,
    stranded: d.total_holders_stranded
      ? d.total_holders_stranded > 1_000_000
        ? `${(d.total_holders_stranded / 1_000_000).toFixed(1)}M`
        : d.total_holders_stranded.toLocaleString()
      : "0",
  };
}

export async function getDeaths(filter: string = "ALL"): Promise<Token[]> {
  const res = await fetch(`${API_URL}/api/deaths?status=${filter}&limit=200`);
  if (!res.ok) throw new Error("Failed to fetch deaths");
  const d: { tokens: ApiToken[]; count: number } = await res.json();
  return d.tokens.map(transformToken);
}

export async function getZombies(sort: string = "score"): Promise<Token[]> {
  const apiSort = sort === "score" ? "zombie_score" : sort;
  const res = await fetch(`${API_URL}/api/zombies?sort=${apiSort}&limit=200`);
  if (!res.ok) throw new Error("Failed to fetch zombies");
  const d: { zombies: ApiToken[]; count: number } = await res.json();
  return d.zombies.map(transformToken);
}

// ── Metrics API ────────────────────────────────────────────

export interface Metrics {
  tokensScanned: number;
  deathsDetected: number;
  deaths24h: number;
  zombiesIndexed: number;
  aliveTokens: number;
  fadingTokens: number;
  dyingTokens: number;
  deadTokens: number;
  strandedHolders: number;
  totalScanRuns: number;
  lastScanAt: string | null;
  ctoProposals: number;
  ctoActive: number;
  ctoCompleted: number;
  totalVotesCast: number;
}

export async function getMetrics(): Promise<Metrics> {
  const res = await fetch(`${API_URL}/api/metrics`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  const d = await res.json();
  return {
    tokensScanned: d.tokens_scanned,
    deathsDetected: d.deaths_detected,
    deaths24h: d.deaths_24h,
    zombiesIndexed: d.zombies_indexed,
    aliveTokens: d.alive_tokens,
    fadingTokens: d.fading_tokens,
    dyingTokens: d.dying_tokens,
    deadTokens: d.dead_tokens,
    strandedHolders: d.stranded_holders,
    totalScanRuns: d.total_scan_runs,
    lastScanAt: d.last_scan_at,
    ctoProposals: d.cto_proposals,
    ctoActive: d.cto_active,
    ctoCompleted: d.cto_completed,
    totalVotesCast: d.total_votes_cast,
  };
}

// ── CTO API functions ──────────────────────────────────────

interface ApiProposal {
  id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
  team_name: string;
  team_contact: string;
  revival_plan: string;
  strategy: string;
  timeline: string;
  status: string;
  created_at: string;
  votes_for: number;
  votes_against: number;
  vote_deadline: string;
}

function transformProposal(p: ApiProposal): Proposal {
  return {
    id: p.id,
    tokenAddress: p.token_address,
    tokenName: p.token_name || "Unknown",
    tokenSymbol: p.token_symbol || "???",
    teamName: p.team_name,
    teamContact: p.team_contact || "",
    revivalPlan: p.revival_plan,
    strategy: p.strategy || "community",
    timeline: p.timeline || "TBD",
    status: (p.status as Proposal["status"]) || "active",
    createdAt: p.created_at,
    createdAgo: timeAgo(p.created_at),
    votesFor: p.votes_for || 0,
    votesAgainst: p.votes_against || 0,
    voteDeadline: p.vote_deadline || "",
  };
}

export async function getProposals(status: string = "all"): Promise<Proposal[]> {
  const res = await fetch(`${API_URL}/api/cto/proposals?status=${status}`);
  if (!res.ok) throw new Error("Failed to fetch proposals");
  const d: { proposals: ApiProposal[] } = await res.json();
  return d.proposals.map(transformProposal);
}

export async function getProposal(id: string): Promise<Proposal> {
  const res = await fetch(`${API_URL}/api/cto/proposals/${id}`);
  if (!res.ok) throw new Error("Proposal not found");
  const d: { proposal: ApiProposal } = await res.json();
  return transformProposal(d.proposal);
}

export interface ProposeInput {
  token_address: string;
  token_name?: string;
  token_symbol?: string;
  team_name: string;
  team_contact?: string;
  revival_plan: string;
  strategy?: string;
  timeline?: string;
}

export async function submitProposal(input: ProposeInput): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/api/cto/propose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to submit proposal");
  }
  return res.json();
}

export async function castVote(
  proposalId: string,
  walletAddress: string,
  vote: "for" | "against"
): Promise<void> {
  const res = await fetch(`${API_URL}/api/cto/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proposal_id: proposalId, wallet_address: walletAddress, vote }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to cast vote");
  }
}

export async function scanToken(address: string): Promise<ScanResult> {
  const res = await fetch(`${API_URL}/api/token/${address}`);
  if (!res.ok) throw new Error("Token not found");
  const d: { source: string; token: ApiToken } = await res.json();
  const t = d.token;

  const flags: string[] = [];
  if (!t.creator_active) flags.push("Creator wallet inactive");
  if ((t.holder_count || 0) < 10) flags.push("Very few holders");
  if (!t.liquidity_usd) flags.push("No liquidity remaining");

  return {
    name: t.name || "Unknown",
    symbol: t.symbol || "???",
    status: t.status || "UNKNOWN",
    score: t.health_score || 0,
    vol: formatCurrency(t.volume_24h || 0),
    holders: t.holder_count || 0,
    active: Boolean(t.creator_active),
    liq: formatCurrency(t.liquidity_usd || 0),
    age: t.days_dead ? `${t.days_dead}d` : "?",
    flags,
  };
}
