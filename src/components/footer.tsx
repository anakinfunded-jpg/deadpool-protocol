import Link from "next/link";

const NAV_LINKS = [
  { href: "/feed", label: "Death Feed" },
  { href: "/zombies", label: "Zombie Index" },
  { href: "/scan", label: "Health Scan" },
  { href: "/cto", label: "CTO Market" },
  { href: "/metrics", label: "Metrics" },
];

const SOCIAL_LINKS = [
  { href: "https://x.com", label: "X / Twitter" },
  { href: "https://t.me", label: "Telegram" },
  { href: "https://github.com", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-16">
      <div className="max-w-[1200px] mx-auto px-[clamp(20px,5vw,48px)] py-12">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-md bg-cyan flex items-center justify-center text-xs">
                ☠
              </div>
              <span className="text-sm font-bold text-white font-display tracking-[-0.02em]">
                deadpool
              </span>
            </div>
            <p className="text-xs text-white/25 font-body leading-[1.7] max-w-[280px]">
              The Token Afterlife Protocol. Monitoring dead pump.fun tokens,
              ranking revival opportunities, and powering community takeovers.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.06] text-[10px] text-white/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#00E5FF]" />
              Built for the pump.fun hackathon
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="text-[10px] text-white/20 font-mono tracking-[0.1em] uppercase mb-3">
              Protocol
            </div>
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-white/30 font-body hover:text-white/60 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Socials */}
          <div>
            <div className="text-[10px] text-white/20 font-mono tracking-[0.1em] uppercase mb-3">
              Community
            </div>
            <div className="flex flex-col gap-2">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-white/30 font-body hover:text-white/60 transition-colors"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-[11px] text-white/[0.12] font-mono">
            &copy; {new Date().getFullYear()} deadpool protocol
          </span>
          <span className="text-[10px] text-white/[0.08] font-mono">
            $DEAD on pump.fun
          </span>
        </div>
      </div>
    </footer>
  );
}
