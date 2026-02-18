import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// DEADPOOL — The Token Afterlife Protocol
// Overrrides-inspired: dark, textured, smooth reveals, magnetic hovers
// Palette: Black / White / Electric Cyan (#00E5FF)
// ============================================================

const TOKENS = [
  { address: "7xKXtQ9Rp4mVz8NbW3dGhY5sLcFjA2kEu6", name: "DogeAI", symbol: "DOAI", diedAgo: "2h", holders: 847, peakMcap: "$142K", residualLiq: "$230", zombieScore: 78, status: "DEAD", deathCause: "Dev inactive 14d" },
  { address: "Qm9FzW7xLpN3kRtB8vY2cHdS6jUeA4gMo1", name: "SolChef", symbol: "CHEF", diedAgo: "5h", holders: 1203, peakMcap: "$89K", residualLiq: "$1,100", zombieScore: 85, status: "ZOMBIE", deathCause: "Zero volume 72h" },
  { address: "Bx4RpT2mKzQ8wN6vL9yGhD3sJcFe7jUiA5", name: "NeonCat", symbol: "NCAT", diedAgo: "12h", holders: 412, peakMcap: "$53K", residualLiq: "$80", zombieScore: 42, status: "DEAD", deathCause: "Rug — dev sold 100%" },
  { address: "Ht7UwZ3nKpR9xM4vB8yLcGdS6jFeA2kQo1", name: "GPT Token", symbol: "GPTX", diedAgo: "1d", holders: 2891, peakMcap: "$310K", residualLiq: "$4,200", zombieScore: 94, status: "ZOMBIE", deathCause: "Team abandoned" },
  { address: "Nm3QkW8xLpT2vR6yB9zGhD4sFcJe7jUiA5", name: "BasedFrog", symbol: "BFROG", diedAgo: "1d", holders: 634, peakMcap: "$71K", residualLiq: "$150", zombieScore: 56, status: "DEAD", deathCause: "Community dissolved" },
  { address: "Zv8LwT5nKpR3xM9vB2yGcHdS6jFeA4kQo1", name: "SolPets", symbol: "SPET", diedAgo: "2d", holders: 1567, peakMcap: "$205K", residualLiq: "$2,800", zombieScore: 91, status: "ZOMBIE", deathCause: "Dev wallet inactive 30d" },
  { address: "Yx2MnR7xLpQ8wN4vT6yBcGdS3jFeA9kUi5", name: "MoonRabbit", symbol: "MRAB", diedAgo: "3d", holders: 328, peakMcap: "$38K", residualLiq: "$45", zombieScore: 31, status: "DEAD", deathCause: "Failed bonding curve" },
  { address: "Kp5JdW1nLzR8xM3vT9yBcGhS6jFeA2kQo4", name: "AITrader Pro", symbol: "AITP", diedAgo: "3d", holders: 3104, peakMcap: "$520K", residualLiq: "$8,400", zombieScore: 97, status: "ZOMBIE", deathCause: "Team pivot, token abandoned" },
  { address: "Wc1RtZ6nKpQ3xM8vB4yLcGdS9jFeA7kUi2", name: "Pump Punk", symbol: "PPNK", diedAgo: "4d", holders: 189, peakMcap: "$22K", residualLiq: "$12", zombieScore: 18, status: "DEAD", deathCause: "Never gained traction" },
  { address: "Fg6NsW4xLpT7vR2yB8zGhD5sFcJe1jQkA9", name: "DeFi Degen", symbol: "DDGN", diedAgo: "5d", holders: 2210, peakMcap: "$175K", residualLiq: "$3,100", zombieScore: 88, status: "ZOMBIE", deathCause: "Creator fee drain" },
];
const STATS = { scanned: 147832, deaths: 24891, zombies: 1247, lifespan: "4.2h", stranded: "12.4M" };

// --- Scroll reveal hook ---
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// --- Reveal wrapper ---
const Reveal = ({ children, delay = 0, direction = "up", style = {} }) => {
  const [ref, visible] = useReveal(0.1);
  const transforms = { up: "translateY(40px)", down: "translateY(-40px)", left: "translateX(40px)", right: "translateX(-40px)", none: "none" };
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : transforms[direction], transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`, willChange: "opacity, transform", ...style }}>{children}</div>
  );
};

// --- Magnetic hover card ---
const MagCard = ({ children, style = {}, onClick }) => {
  const ref = useRef(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0) rotateY(0)");
  const [glow, setGlow] = useState("none");
  const handleMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.01)`);
    setGlow(`radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(0,229,255,0.06) 0%, transparent 60%)`);
  }, []);
  const handleLeave = useCallback(() => { setTransform("perspective(800px) rotateX(0) rotateY(0) scale(1)"); setGlow("none"); }, []);
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={onClick} style={{ transform, background: glow !== "none" ? glow : undefined, transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)", cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
  );
};

// --- Counter animation ---
const Counter = ({ to, duration = 2000, prefix = "", suffix = "" }) => {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0; const steps = 60; let step = 0;
    const iv = setInterval(() => { step++; const p = 1 - Math.pow(1 - step/steps, 3); setVal(Math.floor(to * p)); if (step >= steps) clearInterval(iv); }, duration / steps);
    return () => clearInterval(iv);
  }, [visible, to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};


// --- Status pill ---
const StatusPill = ({ status }) => {
  const isZombie = status === "ZOMBIE";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", fontFamily: "var(--mono)", border: isZombie ? "1px solid var(--cyan)" : "1px solid rgba(255,255,255,0.15)", color: isZombie ? "var(--cyan)" : "rgba(255,255,255,0.5)", background: isZombie ? "rgba(0,229,255,0.06)" : "rgba(255,255,255,0.03)" }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isZombie ? "var(--cyan)" : "rgba(255,255,255,0.3)", boxShadow: isZombie ? "0 0 8px var(--cyan)" : "none" }} />{status}
  </span>;
};

// --- Score bar ---
const ScoreBar = ({ score }) => {
  const c = score > 80 ? "var(--cyan)" : score > 50 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)";
  return <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ width: 60, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}><div style={{ width: score + "%", height: "100%", borderRadius: 2, background: c, boxShadow: score > 80 ? "0 0 8px rgba(0,229,255,0.4)" : "none", transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} /></div>
    <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: "var(--mono)", minWidth: 20 }}>{score}</span>
  </div>;
};

// --- Nav ---
const PAGES = ["home","feed","zombies","scan","cto"];
const PAGE_LABELS = { home: "Home", feed: "Death Feed", zombies: "Zombie Index", scan: "Health Scan", cto: "CTO Market" };

const Nav = ({ active, go }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h);
  }, []);
  return <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "0 clamp(16px,4vw,48px)", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent", background: scrolled ? "rgba(8,8,10,0.85)" : "transparent", backdropFilter: scrolled ? "blur(20px) saturate(1.5)" : "none", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => go("home")}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>☠</div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>deadpool</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>{PAGES.map(p => <button key={p} onClick={() => go(p)} style={{ background: "transparent", border: "none", color: active === p ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--body)", padding: "8px 14px", borderRadius: 8, transition: "all 0.2s", position: "relative" }} onMouseEnter={e => { if (active !== p) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }} onMouseLeave={e => { if (active !== p) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>{PAGE_LABELS[p]}{active === p && <span style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 16, height: 2, borderRadius: 1, background: "var(--cyan)" }} />}</button>)}</div>
      <a href="https://pump.fun" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "#08080a", padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "var(--body)", transition: "all 0.2s", border: "none" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--cyan)"; e.currentTarget.style.color = "#000"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#08080a"; }}>Buy $DEAD <span style={{ fontSize: 10 }}>↗</span></a>
    </div>
  </nav>;
};


// ============ HOME ============
const Home = ({ go }) => {
  return <div>
    {/* Hero */}
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px clamp(20px,5vw,60px) 80px", position: "relative", overflow: "hidden" }}>
      {/* Gradient orb */}
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "60vw", height: "60vw", maxWidth: 800, maxHeight: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-30%", left: "-15%", width: "50vw", height: "50vw", maxWidth: 600, maxHeight: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      <Reveal delay={0.1}><div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", marginBottom: 32, fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--body)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }} />Built for the pump.fun hackathon
      </div></Reveal>

      <Reveal delay={0.2}><h1 style={{ fontSize: "clamp(40px,7vw,80px)", fontWeight: 700, color: "#fff", lineHeight: 1.05, fontFamily: "var(--display)", letterSpacing: "-0.03em", maxWidth: 800, margin: "0 auto" }}>
        The token<br /><span style={{ color: "var(--cyan)" }}>afterlife</span> protocol
      </h1></Reveal>

      <Reveal delay={0.35}><p style={{ fontSize: "clamp(16px,1.8vw,19px)", color: "rgba(255,255,255,0.45)", maxWidth: 520, margin: "24px auto 0", lineHeight: 1.65, fontFamily: "var(--body)", fontWeight: 400 }}>
        98.6% of pump.fun tokens die within 24 hours. DEADPOOL monitors the graveyard, ranks revival opportunities, and powers community takeovers.
      </p></Reveal>

      <Reveal delay={0.5}><div style={{ display: "flex", gap: 12, marginTop: 40 }}>
        <button onClick={() => go("feed")} style={{ background: "#fff", color: "#08080a", border: "none", padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "var(--body)", transition: "all 0.25s" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--cyan)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; }}>Enter the graveyard</button>
        <button onClick={() => go("scan")} style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "var(--body)", transition: "all 0.25s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>Scan a token</button>
      </div></Reveal>

      <Reveal delay={0.65}><div style={{ marginTop: 64, display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.2)", fontSize: 12, fontFamily: "var(--mono)" }}>
        <span style={{ width: 20, height: 1, background: "rgba(255,255,255,0.15)" }} /> scroll to explore
      </div></Reveal>
    </section>

    {/* Stats strip */}
    <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px clamp(20px,5vw,60px)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 32 }}>
        {[["Tokens scanned", STATS.scanned, ""],["Deaths today", STATS.deaths, ""],["Zombies found", STATS.zombies, ""],["Avg lifespan", 0, STATS.lifespan],["Holders stranded", 0, STATS.stranded]].map(([label, num, text], i) => (
          <Reveal key={i} delay={i * 0.08}><div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em", lineHeight: 1 }}>{num > 0 ? <Counter to={num} /> : text}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
          </div></Reveal>
        ))}
      </div>
    </section>

    {/* How it works */}
    <section style={{ padding: "100px clamp(20px,5vw,60px)", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal><div style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 12, color: "var(--cyan)", fontFamily: "var(--mono)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>How it works</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em", lineHeight: 1.15, maxWidth: 500 }}>Four steps from death to resurrection</h2>
      </div></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {[{n:"01",t:"Detect",d:"Neural scanner monitors every pump.fun token — volume, holders, creator wallets — all in realtime.",ic:"⚡"},{n:"02",t:"Classify",d:"Weighted algorithm scores token health 0–100 and classifies status from ALIVE through DEAD to ZOMBIE.",ic:"◈"},{n:"03",t:"Index",d:"Zombie Index ranks dead tokens by revival potential. High holders, residual liquidity, strong narrative.",ic:"📊"},{n:"04",t:"Revive",d:"CTO Marketplace enables structured community takeovers. Stake bond, holders vote, resurrection begins.",ic:"🔄"}].map((m,i) => (
          <Reveal key={i} delay={i * 0.1}><MagCard style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28, minHeight: 220, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "var(--mono)" }}>{m.n}</span>
              <span style={{ fontSize: 20 }}>{m.ic}</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "var(--display)", marginBottom: 10 }}>{m.t}</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontFamily: "var(--body)", flex: 1 }}>{m.d}</p>
          </MagCard></Reveal>
        ))}
      </div>
    </section>

    {/* Token utility */}
    <section style={{ padding: "80px clamp(20px,5vw,60px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Reveal><div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: "var(--cyan)", fontFamily: "var(--mono)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Token utility</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>$DEAD powers the afterlife</h2>
        </div></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12 }}>
          {[["Stake","CTO bond collateral — slashed if you abandon the revival"],["Access","Zombie Index premium features + early CTO alerts"],["Burn","Deflationary mechanism — CTO fees burned permanently"],["Earn","Creator Fee Sharing distributes protocol revenue"],["Vote","Governance over marketplace parameters + curation"],["Alert","Priority notifications on high-score zombie tokens"]].map(([title,desc],i) => (
            <Reveal key={i} delay={i*0.06}><div style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", transition: "all 0.3s", cursor: "default" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.2)"; e.currentTarget.style.background = "rgba(0,229,255,0.03)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "var(--display)", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "var(--body)", lineHeight: 1.5 }}>{desc}</div>
            </div></Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section style={{ padding: "100px clamp(20px,5vw,60px)", textAlign: "center" }}>
      <Reveal><h2 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 700, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em", marginBottom: 16 }}>Every token deserves a second chance.</h2></Reveal>
      <Reveal delay={0.1}><p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", fontFamily: "var(--body)", marginBottom: 36 }}>Follow the resurrection. Built in public.</p></Reveal>
      <Reveal delay={0.2}><div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {[["@deadprotocol","https://x.com"],["Telegram","https://t.me"],["GitHub","https://github.com"]].map(([l,h],i) => <a key={i} href={h} target="_blank" rel="noreferrer" style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, textDecoration: "none", fontFamily: "var(--body)", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>{l}</a>)}
      </div></Reveal>
    </section>
  </div>;
};


// ============ DEATH FEED ============
const Feed = () => {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? TOKENS : TOKENS.filter(t => t.status === filter);
  return <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px clamp(20px,5vw,48px) 60px" }}>
    <Reveal><div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 12, color: "var(--cyan)", fontFamily: "var(--mono)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Realtime feed</div>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>Death Feed</h2>
    </div></Reveal>
    <Reveal delay={0.1}><div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
      {["ALL","DEAD","ZOMBIE"].map(f => <button key={f} onClick={() => setFilter(f)} style={{ background: filter===f ? "rgba(255,255,255,0.08)" : "transparent", color: filter===f ? "#fff" : "rgba(255,255,255,0.35)", border: "1px solid " + (filter===f ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"), padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--body)", transition: "all 0.2s" }}>{f}</button>)}
      <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: 12, fontFamily: "var(--mono)", alignSelf: "center" }}>{filtered.length} results</span>
    </div></Reveal>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {filtered.map((t,i) => <Reveal key={i} delay={i*0.04}><MagCard style={{ padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "var(--display)" }}>{t.name}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--mono)" }}>${t.symbol}</span>
            <StatusPill status={t.status} />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--mono)" }}>
            <span>{t.address.slice(0,8)}...</span>
            <span>{t.diedAgo} ago</span>
            <span>{t.holders} holders</span>
            <span>Peak {t.peakMcap}</span>
            <span>Liq {t.residualLiq}</span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", marginTop: 4, fontFamily: "var(--body)" }}>{t.deathCause}</div>
        </div>
        <div><ScoreBar score={t.zombieScore} /><div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "var(--mono)", textAlign: "right", marginTop: 4 }}>Z-SCORE</div></div>
      </MagCard></Reveal>)}
    </div>
  </div>;
};

// ============ ZOMBIE INDEX ============
const Zombies = () => {
  const [sort, setSort] = useState("score");
  const list = [...TOKENS].filter(t => t.status==="ZOMBIE"||t.zombieScore>50).sort((a,b) => sort==="score" ? b.zombieScore-a.zombieScore : b.holders-a.holders);
  return <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px clamp(20px,5vw,48px) 60px" }}>
    <Reveal><div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 12, color: "var(--cyan)", fontFamily: "var(--mono)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Revival opportunities</div>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>Zombie Index</h2>
    </div></Reveal>
    <Reveal delay={0.1}><div style={{ display: "flex", gap: 6, marginBottom: 24, alignItems: "center" }}>
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontFamily: "var(--mono)", marginRight: 4 }}>Sort:</span>
      {[["score","Z-Score"],["holders","Holders"]].map(([k,l]) => <button key={k} onClick={() => setSort(k)} style={{ background: sort===k?"rgba(255,255,255,0.08)":"transparent", color: sort===k?"#fff":"rgba(255,255,255,0.35)", border: "1px solid "+(sort===k?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.06)"), padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--body)", transition: "all 0.2s" }}>{l}</button>)}
    </div></Reveal>
    {/* Table header */}
    <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 80px 100px", padding: "10px 16px", fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <span>#</span><span>Token</span><span>Holders</span><span>Peak MC</span><span>Liq</span><span>Z-Score</span>
    </div>
    {list.map((t,i) => <Reveal key={i} delay={i*0.05}><div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 80px 100px", padding: "14px 16px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "all 0.2s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
      <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)" }}>{String(i+1).padStart(2,"0")}</span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 700, color: "#fff", fontSize: 14, fontFamily: "var(--display)" }}>{t.name}</span><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "var(--mono)" }}>${t.symbol}</span><StatusPill status={t.status} /></div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "var(--body)", marginTop: 2 }}>{t.deathCause}</div>
      </div>
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "var(--mono)" }}>{t.holders.toLocaleString()}</span>
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "var(--mono)" }}>{t.peakMcap}</span>
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "var(--mono)" }}>{t.residualLiq}</span>
      <ScoreBar score={t.zombieScore} />
    </div></Reveal>)}
  </div>;
};


// ============ HEALTH SCAN ============
const Scan = () => {
  const [addr, setAddr] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const run = useCallback(() => {
    if (!addr.trim()) return; setLoading(true); setResult(null); setProgress(0);
    const steps = 30; let step = 0;
    const iv = setInterval(() => { step++; setProgress(Math.floor((step/steps)*100)); if (step>=steps) { clearInterval(iv); setResult({ name: "Token_"+addr.trim().slice(0,4), symbol: addr.trim().slice(0,4).toUpperCase(), status: ["ALIVE","FADING","DYING","DEAD","ZOMBIE"][Math.floor(Math.random()*5)], score: Math.floor(Math.random()*100), vol: "$"+(Math.random()*10000).toFixed(0), holders: Math.floor(Math.random()*5000), active: Math.random()>0.5, liq: "$"+(Math.random()*50000).toFixed(0), age: Math.floor(Math.random()*30)+"d", flags: Math.random()>0.5?["Dev holds >80% supply","No social links"]:[] }); setLoading(false); } }, 60);
  }, [addr]);
  const scoreColor = result ? (result.score > 60 ? "var(--cyan)" : result.score > 30 ? "rgba(255,255,255,0.6)" : "#ff4444") : "#fff";

  return <div style={{ maxWidth: 640, margin: "0 auto", padding: "100px clamp(20px,5vw,48px) 60px" }}>
    <Reveal><div style={{ textAlign: "center", marginBottom: 48 }}>
      <div style={{ fontSize: 12, color: "var(--cyan)", fontFamily: "var(--mono)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Diagnostics</div>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>Health Scan</h2>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", fontFamily: "var(--body)", marginTop: 8 }}>Paste any pump.fun token address to check its vitals</p>
    </div></Reveal>

    <Reveal delay={0.1}><div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
      <input type="text" placeholder="Token address..." value={addr} onChange={e => setAddr(e.target.value)} onKeyDown={e => e.key==="Enter"&&run()} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "14px 18px", borderRadius: 12, fontSize: 14, outline: "none", fontFamily: "var(--mono)", transition: "border 0.2s" }} onFocus={e => e.currentTarget.style.borderColor="rgba(0,229,255,0.3)"} onBlur={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"} />
      <button onClick={run} style={{ background: loading ? "rgba(255,255,255,0.06)" : "#fff", color: loading ? "rgba(255,255,255,0.4)" : "#08080a", border: "none", padding: "14px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: loading?"default":"pointer", fontFamily: "var(--body)", transition: "all 0.25s", whiteSpace: "nowrap" }}>{loading ? "Scanning..." : "Scan"}</button>
    </div></Reveal>

    {loading && <div style={{ marginBottom: 24 }}>
      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}><div style={{ width: progress+"%", height: "100%", background: "var(--cyan)", borderRadius: 2, transition: "width 0.15s", boxShadow: "0 0 12px rgba(0,229,255,0.3)" }} /></div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "var(--mono)", marginTop: 6, textAlign: "center" }}>{progress}% — Analyzing on-chain data...</div>
    </div>}

    {result && !loading && <Reveal><div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "var(--display)" }}>{result.name}</span><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "var(--mono)" }}>${result.symbol}</span></div>
        <StatusPill status={result.status} />
      </div>
      <div style={{ textAlign: "center", padding: "32px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 64, fontWeight: 700, fontFamily: "var(--display)", color: scoreColor, lineHeight: 1, letterSpacing: "-0.03em" }}>{result.score}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "var(--mono)", marginTop: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Health Score</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {[["Volume 24h",result.vol],["Holders",result.holders.toLocaleString()],["Liquidity",result.liq],["Age",result.age],["Creator",result.active?"Active":"Inactive"],["Z-Score",result.status==="ZOMBIE"?"High":"—"]].map(([k,v],i) => <div key={i} style={{ padding: "14px 20px", borderBottom: i<4?"1px solid rgba(255,255,255,0.04)":"none", borderRight: i%2===0?"1px solid rgba(255,255,255,0.04)":"none" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: k==="Creator"&&!result.active?"#ff4444":"#fff", fontFamily: "var(--display)" }}>{v}</div>
        </div>)}
      </div>
      {result.flags.length>0 && <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,100,100,0.1)", background: "rgba(255,50,50,0.02)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#ff6b6b", fontFamily: "var(--mono)", marginBottom: 8 }}>⚠ Risk flags</div>
        {result.flags.map((f,i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,107,107,0.7)", fontFamily: "var(--body)", marginBottom: 2 }}>• {f}</div>)}
      </div>}
    </div></Reveal>}

    {!result && !loading && <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "rgba(255,255,255,0.15)" }}>◈</div>
      <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, fontFamily: "var(--body)" }}>Paste a token address above to begin diagnostics</div>
    </div>}
  </div>;
};

// ============ CTO MARKETPLACE ============
const CTO = () => <div style={{ maxWidth: 700, margin: "0 auto", padding: "100px clamp(20px,5vw,48px) 60px" }}>
  <Reveal><div style={{ textAlign: "center", marginBottom: 48 }}>
    <div style={{ fontSize: 12, color: "var(--cyan)", fontFamily: "var(--mono)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Coming soon</div>
    <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>CTO Marketplace</h2>
    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", fontFamily: "var(--body)", marginTop: 8, maxWidth: 440, margin: "8px auto 0" }}>Structured community takeovers. Claim dead tokens, stake $DEAD bond, holders vote on revival.</p>
  </div></Reveal>

  <Reveal delay={0.1}><div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "40px 32px", textAlign: "center" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 32 }}>
      {[{t:"Revival proposals",p:85,s:"Building"},{t:"Holder voting",p:60,s:"Designing"},{t:"Bond staking",p:30,s:"Planned"},{t:"Revival tracker",p:20,s:"Planned"}].map((m,i) => <div key={i} style={{ padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", textAlign: "left" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", fontFamily: "var(--display)", marginBottom: 10 }}>{m.t}</div>
        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", marginBottom: 6 }}><div style={{ width: m.p+"%", height: "100%", borderRadius: 2, background: m.s==="Building"?"var(--cyan)":"rgba(255,255,255,0.15)", transition: "width 1s", boxShadow: m.s==="Building"?"0 0 8px rgba(0,229,255,0.3)":"none" }} /></div>
        <div style={{ fontSize: 10, color: m.s==="Building"?"var(--cyan)":"rgba(255,255,255,0.2)", fontFamily: "var(--mono)" }}>{m.s} — {m.p}%</div>
      </div>)}
    </div>
    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "var(--body)", marginBottom: 24 }}>Launching Week 3 of the hackathon</div>
    <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--body)", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cyan)"; e.currentTarget.style.color = "var(--cyan)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>Get notified on launch</button>
  </div></Reveal>
</div>;


// ============ APP SHELL ============
export default function App() {
  const [page, setPage] = useState("home");
  const go = useCallback((p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const P = { home: <Home go={go} />, feed: <Feed />, zombies: <Zombies />, scan: <Scan />, cto: <CTO /> };

  return <div style={{ minHeight: "100vh", background: "var(--bg)", color: "#fff", position: "relative" }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Sora:wght@400;500;600;700&display=swap');
      :root {
        --bg: #08080a;
        --cyan: #00E5FF;
        --display: 'Sora', sans-serif;
        --body: 'Instrument Sans', sans-serif;
        --mono: 'JetBrains Mono', monospace;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html { scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
      body { background: var(--bg); font-family: var(--body); -webkit-font-smoothing: antialiased; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      ::selection { background: rgba(0,229,255,0.2); color: #fff; }
      input::placeholder { color: rgba(255,255,255,0.2); }

      /* Subtle grain overlay */
      body::before {
        content: "";
        position: fixed;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        background-repeat: repeat;
        background-size: 256px;
        pointer-events: none;
        z-index: 10000;
        opacity: 0.5;
      }
    `}</style>

    <Nav active={page} go={go} />
    <main style={{ position: "relative", zIndex: 1 }}>{P[page]}</main>

    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "24px clamp(20px,5vw,48px)", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", fontFamily: "var(--mono)" }}>deadpool protocol © {new Date().getFullYear()}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.1)", fontFamily: "var(--mono)" }}>built in public for pump.fun</span>
    </footer>
  </div>;
}
