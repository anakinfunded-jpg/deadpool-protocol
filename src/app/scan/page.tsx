"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { scanToken, type ScanResult } from "@/lib/api";
import { Reveal } from "@/components/reveal";
import { StatusPill } from "@/components/status-pill";
import { ScanResultSkeleton } from "@/components/skeleton";
import clsx from "clsx";

export default function ScanPage() {
  const [addr, setAddr] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval>>();

  const {
    data: result,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery<ScanResult>({
    queryKey: ["token", submitted],
    queryFn: () => scanToken(submitted),
    enabled: submitted.length > 0,
    retry: false,
  });

  const loading = isFetching && submitted.length > 0;

  // Fake progress bar while API call is in flight
  useEffect(() => {
    if (loading) {
      setProgress(0);
      let p = 0;
      progressRef.current = setInterval(() => {
        p += Math.random() * 8 + 2;
        if (p > 90) p = 90;
        setProgress(Math.floor(p));
      }, 100);
    } else {
      clearInterval(progressRef.current);
      if (result) setProgress(100);
    }
    return () => clearInterval(progressRef.current);
  }, [loading, result]);

  const run = useCallback(() => {
    if (!addr.trim()) return;
    setSubmitted(addr.trim());
  }, [addr]);

  const scoreColor = result
    ? result.score > 60
      ? "text-cyan"
      : result.score > 30
        ? "text-white/60"
        : "text-[#ff4444]"
    : "text-white";

  const details = result
    ? [
        ["Volume 24h", result.vol],
        ["Holders", result.holders.toLocaleString()],
        ["Liquidity", result.liq],
        ["Age", result.age],
        ["Creator", result.active ? "Active" : "Inactive"],
        ["Z-Score", result.status === "ZOMBIE" ? "High" : "—"],
      ]
    : [];

  return (
    <div className="max-w-[640px] mx-auto px-[clamp(20px,5vw,48px)] pt-[100px] pb-[60px]">
      {/* Header */}
      <Reveal>
        <div className="text-center mb-12">
          <div className="text-xs text-cyan font-mono tracking-[0.12em] uppercase mb-3">
            Diagnostics
          </div>
          <h2 className="text-[32px] font-bold text-white font-display tracking-[-0.02em]">
            Health Scan
          </h2>
          <p className="text-[15px] text-white/35 font-body mt-2">
            Paste any pump.fun token address to check its vitals
          </p>
        </div>
      </Reveal>

      {/* Search */}
      <Reveal delay={0.1}>
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Token address..."
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            className="flex-1 bg-white/[0.03] border border-white/[0.08] text-white px-[18px] py-3.5 rounded-xl text-sm outline-none font-mono transition-colors focus:border-cyan/30"
          />
          <button
            onClick={run}
            className={clsx(
              "px-6 py-3.5 rounded-xl text-sm font-semibold font-body transition-all whitespace-nowrap",
              loading
                ? "bg-white/[0.06] text-white/40 cursor-default"
                : "bg-white text-bg cursor-pointer hover:bg-cyan",
            )}
          >
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>
      </Reveal>

      {/* Progress bar */}
      {loading && (
        <div className="mb-6">
          <div className="h-[3px] rounded-sm bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-cyan rounded-sm transition-[width] duration-150 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[11px] text-white/20 font-mono mt-1.5 text-center">
            {progress}% — Analyzing on-chain data...
          </div>
        </div>
      )}

      {/* Loading skeleton (first load for a new address) */}
      {isPending && submitted.length > 0 && !loading && (
        <ScanResultSkeleton />
      )}

      {/* Error */}
      {isError && !loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-[14px] border border-[rgba(255,100,100,0.15)] mx-auto mb-4 flex items-center justify-center text-xl text-[#ff6b6b]">
            ⚠
          </div>
          <div className="text-[#ff6b6b] text-sm font-body">
            {(error as Error)?.message || "Failed to scan token"}
          </div>
          <div className="text-white/20 text-xs font-mono mt-2">
            Make sure the backend is running and the address is valid
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <Reveal>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            {/* Token header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-white font-display">
                  {result.name}
                </span>
                <span className="text-xs text-white/25 font-mono">
                  ${result.symbol}
                </span>
              </div>
              <StatusPill status={result.status} />
            </div>

            {/* Score */}
            <div className="text-center px-6 py-8 border-b border-white/[0.06]">
              <div
                className={clsx(
                  "text-[64px] font-bold font-display leading-none tracking-[-0.03em]",
                  scoreColor,
                )}
              >
                {result.score}
              </div>
              <div className="text-[11px] text-white/20 font-mono mt-2 tracking-[0.1em] uppercase">
                Health Score
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2">
              {details.map(([k, v], i) => (
                <div
                  key={k}
                  className={clsx(
                    "px-5 py-3.5",
                    i < 4 && "border-b border-white/[0.04]",
                    i % 2 === 0 && "border-r border-white/[0.04]",
                  )}
                >
                  <div className="text-[10px] text-white/20 font-mono tracking-[0.08em] uppercase mb-1">
                    {k}
                  </div>
                  <div
                    className={clsx(
                      "text-base font-semibold font-display",
                      k === "Creator" && !result.active
                        ? "text-[#ff4444]"
                        : "text-white",
                    )}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>

            {/* Risk flags */}
            {result.flags.length > 0 && (
              <div className="px-5 py-4 border-t border-[rgba(255,100,100,0.1)] bg-[rgba(255,50,50,0.02)]">
                <div className="text-[11px] font-bold text-[#ff6b6b] font-mono mb-2">
                  ⚠ Risk flags
                </div>
                {result.flags.map((f) => (
                  <div
                    key={f}
                    className="text-[13px] text-[rgba(255,107,107,0.7)] font-body mb-0.5"
                  >
                    • {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Empty state */}
      {!result && !loading && !isError && !submitted && (
        <div className="text-center px-5 py-12">
          <div className="w-12 h-12 rounded-[14px] border border-white/[0.06] mx-auto mb-4 flex items-center justify-center text-xl text-white/[0.15]">
            ◈
          </div>
          <div className="text-white/20 text-sm font-body">
            Paste a token address above to begin diagnostics
          </div>
        </div>
      )}
    </div>
  );
}
