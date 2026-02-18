"use client";

import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/lib/api";
import { Reveal } from "./reveal";
import { StatBox } from "./stat-box";
import { StatBoxSkeleton } from "./skeleton";

export function StatsStrip() {
  const { data: stats, isPending } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  if (isPending) {
    return (
      <div className="max-w-[1000px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatBoxSkeleton key={i} />
        ))}
      </div>
    );
  }

  const items = stats
    ? [
        { label: "Tokens scanned", numericValue: stats.scanned },
        { label: "Deaths today", numericValue: stats.deaths },
        { label: "Zombies found", numericValue: stats.zombies },
        { label: "Avg lifespan", textValue: stats.lifespan },
        { label: "Holders stranded", textValue: stats.stranded },
      ]
    : [];

  return (
    <div className="max-w-[1000px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8">
      {items.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08}>
          <StatBox
            label={s.label}
            numericValue={s.numericValue}
            textValue={s.textValue}
          />
        </Reveal>
      ))}
    </div>
  );
}
