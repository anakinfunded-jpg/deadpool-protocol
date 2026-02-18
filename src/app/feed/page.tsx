"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDeaths } from "@/lib/api";
import { Reveal } from "@/components/reveal";
import { MagCard } from "@/components/mag-card";
import { StatusPill } from "@/components/status-pill";
import { ScoreBar } from "@/components/score-bar";
import { TokenCardSkeleton } from "@/components/skeleton";
import clsx from "clsx";

const FILTERS = ["ALL", "DEAD", "ZOMBIE", "DYING", "FADING", "ALIVE"] as const;

export default function FeedPage() {
  const [filter, setFilter] = useState<string>("ALL");

  const { data: tokens = [], isPending } = useQuery({
    queryKey: ["deaths", filter],
    queryFn: () => getDeaths(filter),
  });

  return (
    <div className="max-w-[1000px] mx-auto px-[clamp(20px,5vw,48px)] pt-[100px] pb-[60px]">
      <Reveal>
        <div className="mb-10">
          <div className="text-xs text-cyan font-mono tracking-[0.12em] uppercase mb-3">
            Realtime feed
          </div>
          <h2 className="text-[32px] font-bold text-white font-display tracking-[-0.02em]">
            Death Feed
          </h2>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="flex gap-1.5 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-[7px] rounded-lg text-xs font-semibold font-body transition-all border",
                filter === f
                  ? "bg-white/[0.08] text-white border-white/[0.15]"
                  : "bg-transparent text-white/35 border-white/[0.06] hover:text-white/60",
              )}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-white/20 text-xs font-mono self-center">
            {isPending ? "—" : `${tokens.length} results`}
          </span>
        </div>
      </Reveal>

      <div className="flex flex-col gap-1.5">
        {isPending
          ? Array.from({ length: 6 }).map((_, i) => (
              <TokenCardSkeleton key={i} />
            ))
          : tokens.length === 0
            ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-[14px] border border-white/[0.06] mx-auto mb-4 flex items-center justify-center text-xl text-white/[0.15]">
                  ☠
                </div>
                <div className="text-white/20 text-sm font-body">
                  No tokens found yet. Start the backend scanner to populate data.
                </div>
              </div>
            )
            : tokens.map((t, i) => {
              const isDead = t.status === "DEAD" || t.status === "ZOMBIE";
              const score = isDead ? t.zombieScore : t.healthScore;
              const scoreLabel = isDead ? "Z-SCORE" : "HEALTH";
              const timeLabel = isDead ? "died" : "age";
              return (
                <Reveal key={t.address} delay={i * 0.04}>
                  <MagCard className="p-4 px-5 rounded-xl border border-white/[0.06] bg-white/[0.015] grid grid-cols-[1fr_auto] gap-4 items-center">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className="text-[15px] font-bold text-white font-display">
                          {t.name}
                        </span>
                        <span className="text-xs text-white/25 font-mono">
                          ${t.symbol}
                        </span>
                        <StatusPill status={t.status} />
                      </div>
                      <div className="flex gap-4 flex-wrap text-xs text-white/25 font-mono">
                        <span>{t.address.slice(0, 8)}...</span>
                        <span>{timeLabel} {t.diedAgo}</span>
                        <span>{t.holders} holders</span>
                        <span>Peak {t.peakMcap}</span>
                        <span>Liq {t.residualLiq}</span>
                      </div>
                      {t.deathCause && t.deathCause !== "Scanning..." && (
                        <div className="text-xs text-white/[0.18] mt-1 font-body">
                          {t.deathCause}
                        </div>
                      )}
                    </div>
                    <div>
                      <ScoreBar score={score} />
                      <div className="text-[10px] text-white/[0.15] font-mono text-right mt-1">
                        {scoreLabel}
                      </div>
                    </div>
                  </MagCard>
                </Reveal>
              );
            })}
      </div>
    </div>
  );
}
