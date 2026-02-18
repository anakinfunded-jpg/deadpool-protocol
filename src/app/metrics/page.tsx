"use client";

import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "@/lib/api";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { MagCard } from "@/components/mag-card";

export default function MetricsPage() {
  const { data: m, isPending } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    refetchInterval: 30_000,
  });

  return (
    <div className="max-w-[1000px] mx-auto px-[clamp(20px,5vw,48px)] pt-[100px] pb-[60px]">
      <Reveal>
        <div className="mb-12">
          <div className="text-xs text-cyan font-mono tracking-[0.12em] uppercase mb-3">
            Live dashboard
          </div>
          <h2 className="text-[32px] font-bold text-white font-display tracking-[-0.02em]">
            Protocol Metrics
          </h2>
          <p className="text-[15px] text-white/35 font-body mt-2 max-w-[500px]">
            Real-time stats from the Death Detection Engine and CTO
            Marketplace.
          </p>
        </div>
      </Reveal>

      {isPending ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[120px] rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse"
            />
          ))}
        </div>
      ) : m ? (
        <>
          {/* ── Scanner Stats ── */}
          <Reveal delay={0.1}>
            <div className="text-xs text-white/25 font-mono tracking-[0.1em] uppercase mb-3">
              Scanner Engine
            </div>
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-10">
            <MetricCard label="Tokens Scanned" value={m.tokensScanned} delay={0.1} />
            <MetricCard label="Deaths Detected" value={m.deathsDetected} delay={0.15} accent />
            <MetricCard label="Deaths (24h)" value={m.deaths24h} delay={0.2} />
            <MetricCard label="Zombies Indexed" value={m.zombiesIndexed} delay={0.25} accent />
          </div>

          {/* ── Token Breakdown ── */}
          <Reveal delay={0.3}>
            <div className="text-xs text-white/25 font-mono tracking-[0.1em] uppercase mb-3">
              Token Health Breakdown
            </div>
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-10">
            <MiniStat label="Alive" value={m.aliveTokens} color="text-green-400" delay={0.3} />
            <MiniStat label="Fading" value={m.fadingTokens} color="text-yellow-400" delay={0.35} />
            <MiniStat label="Dying" value={m.dyingTokens} color="text-orange-400" delay={0.4} />
            <MiniStat label="Dead" value={m.deadTokens} color="text-red-400" delay={0.45} />
            <MiniStat label="Zombie" value={m.zombiesIndexed} color="text-cyan" delay={0.5} />
          </div>

          {/* Health bar visualization */}
          <Reveal delay={0.5}>
            <HealthBar
              alive={m.aliveTokens}
              fading={m.fadingTokens}
              dying={m.dyingTokens}
              dead={m.deadTokens}
              zombie={m.zombiesIndexed}
            />
          </Reveal>

          {/* ── CTO Marketplace ── */}
          <Reveal delay={0.55}>
            <div className="text-xs text-white/25 font-mono tracking-[0.1em] uppercase mb-3 mt-10">
              CTO Marketplace
            </div>
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-10">
            <MetricCard label="CTO Proposals" value={m.ctoProposals} delay={0.55} />
            <MetricCard label="Active Proposals" value={m.ctoActive} delay={0.6} accent />
            <MetricCard label="Completed CTOs" value={m.ctoCompleted} delay={0.65} />
            <MetricCard label="Votes Cast" value={m.totalVotesCast} delay={0.7} />
          </div>

          {/* ── Holder Impact ── */}
          <Reveal delay={0.75}>
            <div className="text-xs text-white/25 font-mono tracking-[0.1em] uppercase mb-3">
              Holder Impact
            </div>
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-10">
            <MetricCard label="Stranded Holders" value={m.strandedHolders} delay={0.75} />
            <MetricCard label="Scan Runs" value={m.totalScanRuns} delay={0.8} />
            <Reveal delay={0.85}>
              <MagCard className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col justify-between min-h-[120px]">
                <div className="text-[10px] text-white/20 font-mono tracking-[0.08em] uppercase">
                  Last Scan
                </div>
                <div className="text-lg font-bold text-white font-display mt-auto">
                  {m.lastScanAt
                    ? new Date(m.lastScanAt + "Z").toLocaleTimeString()
                    : "Never"}
                </div>
              </MagCard>
            </Reveal>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function MetricCard({
  label,
  value,
  delay = 0,
  accent = false,
}: {
  label: string;
  value: number;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <Reveal delay={delay}>
      <MagCard className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col justify-between min-h-[120px]">
        <div className="text-[10px] text-white/20 font-mono tracking-[0.08em] uppercase">
          {label}
        </div>
        <div
          className={`text-[28px] font-bold font-display tracking-[-0.02em] leading-none mt-auto ${
            accent ? "text-cyan" : "text-white"
          }`}
        >
          <Counter to={value} />
        </div>
      </MagCard>
    </Reveal>
  );
}

function MiniStat({
  label,
  value,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  color: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-5 py-4 flex items-center justify-between">
        <span className="text-xs text-white/40 font-body">{label}</span>
        <span className={`text-lg font-bold font-display ${color}`}>
          <Counter to={value} />
        </span>
      </div>
    </Reveal>
  );
}

function HealthBar({
  alive,
  fading,
  dying,
  dead,
  zombie,
}: {
  alive: number;
  fading: number;
  dying: number;
  dead: number;
  zombie: number;
}) {
  const total = alive + fading + dying + dead + zombie;
  if (total === 0) return null;

  const pct = (v: number) => Math.max((v / total) * 100, 0.5);

  return (
    <div className="mb-4">
      <div className="h-3 rounded-full overflow-hidden flex bg-white/[0.04]">
        <div
          className="h-full bg-green-400 transition-[width] duration-1000"
          style={{ width: `${pct(alive)}%` }}
        />
        <div
          className="h-full bg-yellow-400 transition-[width] duration-1000"
          style={{ width: `${pct(fading)}%` }}
        />
        <div
          className="h-full bg-orange-400 transition-[width] duration-1000"
          style={{ width: `${pct(dying)}%` }}
        />
        <div
          className="h-full bg-red-400 transition-[width] duration-1000"
          style={{ width: `${pct(dead)}%` }}
        />
        <div
          className="h-full bg-cyan transition-[width] duration-1000"
          style={{ width: `${pct(zombie)}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[10px] font-mono text-white/20">
        <span>Healthy</span>
        <span>Dead</span>
      </div>
    </div>
  );
}
