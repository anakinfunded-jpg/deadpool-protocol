import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { MagCard } from "@/components/mag-card";
import { StatsStrip } from "@/components/stats-strip";

const STEPS = [
  { n: "01", t: "Detect", d: "Neural scanner monitors every pump.fun token — volume, holders, creator wallets — all in realtime.", ic: "⚡" },
  { n: "02", t: "Classify", d: "Weighted algorithm scores token health 0–100 and classifies status from ALIVE through DEAD to ZOMBIE.", ic: "◈" },
  { n: "03", t: "Index", d: "Zombie Index ranks dead tokens by revival potential. High holders, residual liquidity, strong narrative.", ic: "📊" },
  { n: "04", t: "Revive", d: "CTO Marketplace enables structured community takeovers. Stake bond, holders vote, resurrection begins.", ic: "🔄" },
];

const UTILITIES = [
  ["Stake", "CTO bond collateral — slashed if you abandon the revival"],
  ["Access", "Zombie Index premium features + early CTO alerts"],
  ["Burn", "Deflationary mechanism — CTO fees burned permanently"],
  ["Earn", "Creator Fee Sharing distributes protocol revenue"],
  ["Vote", "Governance over marketplace parameters + curation"],
  ["Alert", "Priority notifications on high-score zombie tokens"],
];

const SOCIALS = [
  ["@deadprotocol", "https://x.com"],
  ["Telegram", "https://t.me"],
  ["GitHub", "https://github.com"],
];

export default function Home() {
  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-[clamp(20px,5vw,60px)] pt-[120px] pb-20 relative overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.07)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-[30%] -left-[15%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.04)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

        <Reveal delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8 text-[13px] text-white/50 font-body">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_#00E5FF]" />
            Built for the pump.fun hackathon
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <h1 className="text-[clamp(40px,7vw,80px)] font-bold text-white leading-[1.05] font-display tracking-[-0.03em] max-w-[800px] mx-auto">
            The token
            <br />
            <span className="text-cyan">afterlife</span> protocol
          </h1>
        </Reveal>

        <Reveal delay={0.35}>
          <p className="text-[clamp(16px,1.8vw,19px)] text-white/[0.45] max-w-[520px] mx-auto mt-6 leading-[1.65] font-body">
            98.6% of pump.fun tokens die within 24 hours. DEADPOOL monitors the
            graveyard, ranks revival opportunities, and powers community
            takeovers.
          </p>
        </Reveal>

        <Reveal delay={0.5}>
          <div className="flex gap-3 mt-10">
            <Link
              href="/feed"
              className="bg-white text-bg px-8 py-3.5 rounded-xl text-[15px] font-semibold font-body transition-all duration-[250ms] hover:bg-cyan hover:-translate-y-0.5"
            >
              Enter the graveyard
            </Link>
            <Link
              href="/scan"
              className="bg-transparent text-white/60 border border-white/[0.12] px-8 py-3.5 rounded-xl text-[15px] font-semibold font-body transition-all duration-[250ms] hover:border-white/30 hover:text-white"
            >
              Scan a token
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.65}>
          <div className="mt-16 flex items-center gap-1.5 text-white/20 text-xs font-mono">
            <span className="w-5 h-px bg-white/[0.15]" /> scroll to explore
          </div>
        </Reveal>
      </section>

      {/* ─── Stats strip (live from API) ─── */}
      <section className="border-t border-white/[0.06] border-b border-b-white/[0.06] px-[clamp(20px,5vw,60px)] py-12">
        <StatsStrip />
      </section>

      {/* ─── How it works ─── */}
      <section className="px-[clamp(20px,5vw,60px)] py-[100px] max-w-[1100px] mx-auto">
        <Reveal>
          <div className="mb-14">
            <div className="text-xs text-cyan font-mono tracking-[0.12em] uppercase mb-3">
              How it works
            </div>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold text-white font-display tracking-[-0.02em] leading-[1.15] max-w-[500px]">
              Four steps from death to resurrection
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {STEPS.map((m, i) => (
            <Reveal key={m.n} delay={i * 0.1}>
              <MagCard className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7 min-h-[220px] flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs text-white/20 font-mono">
                    {m.n}
                  </span>
                  <span className="text-xl">{m.ic}</span>
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2.5">
                  {m.t}
                </h3>
                <p className="text-sm text-white/40 leading-[1.6] font-body flex-1">
                  {m.d}
                </p>
              </MagCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Token utility ─── */}
      <section className="px-[clamp(20px,5vw,60px)] py-20 border-t border-white/[0.06]">
        <div className="max-w-[900px] mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <div className="text-xs text-cyan font-mono tracking-[0.12em] uppercase mb-3">
                Token utility
              </div>
              <h2 className="text-[clamp(28px,4vw,40px)] font-bold text-white font-display tracking-[-0.02em]">
                $DEAD powers the afterlife
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
            {UTILITIES.map(([title, desc], i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="px-6 py-5 rounded-xl border border-white/[0.06] bg-white/[0.015] transition-all duration-300 cursor-default hover:border-cyan/20 hover:bg-cyan/[0.03]">
                  <div className="text-sm font-bold text-white font-display mb-1.5">
                    {title}
                  </div>
                  <div className="text-[13px] text-white/35 font-body leading-[1.5]">
                    {desc}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-[clamp(20px,5vw,60px)] py-[100px] text-center">
        <Reveal>
          <h2 className="text-[clamp(28px,5vw,48px)] font-bold text-white font-display tracking-[-0.02em] mb-4">
            Every token deserves a second chance.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-base text-white/35 font-body mb-9">
            Follow the resurrection. Built in public.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex gap-3 justify-center flex-wrap">
            {SOCIALS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-[10px] border border-white/10 text-white/50 text-[13px] font-medium no-underline font-body transition-all hover:border-white/25 hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
