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
    refetchInterval: 30_000,
  });

  if (isPending) {
    return (
      <div className="max-w-[1000px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatBoxSkeleton key={i} />
        ))}
      </div>
    );
  }

  const items = stats
    ? [
        { label: "Tokens scanned", numericValue: stats.scanned },
        { label: "Dead / Zombie", numericValue: stats.deaths },
        { label: "Dying", numericValue: stats.dying },
        { label: "Zombies found", numericValue: stats.zombies },
        { label: "Holders stranded", textValue: stats.stranded },
      ]
    : [];

  return (
    <div className="max-w-[1000px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-8">
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
