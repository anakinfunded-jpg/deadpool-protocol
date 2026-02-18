"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getZombies } from "@/lib/api";
import { Reveal } from "@/components/reveal";
import { MagCard } from "@/components/mag-card";
import { StatusPill } from "@/components/status-pill";
import { ScoreBar } from "@/components/score-bar";
import { TokenRowSkeleton, TokenCardSkeleton } from "@/components/skeleton";
import clsx from "clsx";

const SORT_OPTIONS = [
  { key: "score", label: "Z-Score" },
  { key: "holders", label: "Holders" },
];

export default function ZombiesPage() {
  const [sort, setSort] = useState("score");

  const { data: zombies = [], isPending } = useQuery({
    queryKey: ["zombies", sort],
    queryFn: () => getZombies(sort),
  });

  return (
    <div className="max-w-[1000px] mx-auto px-[clamp(20px,5vw,48px)] pt-[100px] pb-[60px]">
      <Reveal>
        <div className="mb-10">
          <div className="text-xs text-cyan font-mono tracking-[0.12em] uppercase mb-3">
            Revival opportunities
          </div>
          <h2 className="text-[32px] font-bold text-white font-display tracking-[-0.02em]">
            Zombie Index
          </h2>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="flex gap-1.5 mb-6 items-center">
          <span className="text-white/25 text-xs font-mono mr-1">Sort:</span>
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={clsx(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold font-body transition-all border",
                sort === key
                  ? "bg-white/[0.08] text-white border-white/[0.15]"
                  : "bg-transparent text-white/35 border-white/[0.06] hover:text-white/60",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Desktop table header */}
      <div className="hidden md:grid grid-cols-[40px_1fr_80px_80px_80px_100px] px-4 py-2.5 text-[10px] text-white/20 font-mono uppercase tracking-[0.1em] border-b border-white/[0.06]">
        <span>#</span>
        <span>Token</span>
        <span>Holders</span>
        <span>Peak MC</span>
        <span>Liq</span>
        <span>Z-Score</span>
      </div>

      {/* Content */}
      {isPending ? (
        <>
          {/* Desktop skeletons */}
          <div className="hidden md:block">
            {Array.from({ length: 6 }).map((_, i) => (
              <TokenRowSkeleton key={i} />
            ))}
          </div>
          {/* Mobile skeletons */}
          <div className="md:hidden flex flex-col gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <TokenCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : zombies.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-[14px] border border-white/[0.06] mx-auto mb-4 flex items-center justify-center text-xl text-white/[0.15]">
            ◈
          </div>
          <div className="text-white/20 text-sm font-body">
            No zombies detected yet. Start the backend scanner to populate data.
          </div>
        </div>
      ) : (
        <>
          {/* Desktop rows */}
          <div className="hidden md:block">
            {zombies.map((t, i) => (
              <Reveal key={t.address} delay={i * 0.05}>
                <div className="grid grid-cols-[40px_1fr_80px_80px_80px_100px] px-4 py-3.5 items-center border-b border-white/[0.03] transition-all cursor-pointer hover:bg-white/[0.02]">
                  <span className="text-white/[0.15] text-[13px] font-bold font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm font-display">
                        {t.name}
                      </span>
                      <span className="text-white/20 text-[11px] font-mono">
                        ${t.symbol}
                      </span>
                      <StatusPill status={t.status} />
                    </div>
                    <div className="text-[11px] text-white/[0.18] font-body mt-0.5">
                      {t.deathCause}
                    </div>
                  </div>
                  <span className="text-white/50 text-[13px] font-mono">
                    {t.holders.toLocaleString()}
                  </span>
                  <span className="text-white/50 text-[13px] font-mono">
                    {t.peakMcap}
                  </span>
                  <span className="text-white/50 text-[13px] font-mono">
                    {t.residualLiq}
                  </span>
                  <ScoreBar score={t.zombieScore} />
                </div>
              </Reveal>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-1.5">
            {zombies.map((t, i) => (
              <Reveal key={t.address} delay={i * 0.04}>
                <MagCard className="p-4 px-5 rounded-xl border border-white/[0.06] bg-white/[0.015]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-xs text-white/15 font-mono">
                      #{i + 1}
                    </span>
                    <span className="text-[15px] font-bold text-white font-display">
                      {t.name}
                    </span>
                    <span className="text-xs text-white/25 font-mono">
                      ${t.symbol}
                    </span>
                    <StatusPill status={t.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-white/30 font-mono">
                    <span>{t.holders.toLocaleString()} holders</span>
                    <span>Peak {t.peakMcap}</span>
                    <span>Liq {t.residualLiq}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/[0.18] font-body">
                      {t.deathCause}
                    </span>
                    <div className="w-[80px]">
                      <ScoreBar score={t.zombieScore} />
                    </div>
                  </div>
                </MagCard>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
