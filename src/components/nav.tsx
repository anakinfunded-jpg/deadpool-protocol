"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Death Feed" },
  { href: "/zombies", label: "Zombie Index" },
  { href: "/scan", label: "Health Scan" },
  { href: "/cto", label: "CTO Market" },
  { href: "/metrics", label: "Metrics" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-[1000] px-[clamp(16px,4vw,48px)] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled || open
          ? "border-b border-white/[0.06] bg-[rgba(8,8,10,0.85)] backdrop-blur-[20px] backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-cyan flex items-center justify-center text-sm">
            ☠
          </div>
          <span className="text-[15px] font-bold text-white font-display tracking-[-0.02em]">
            deadpool
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "relative bg-transparent text-[13px] font-medium font-body px-3.5 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/35 hover:text-white/70",
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-sm bg-cyan" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* CTA */}
          <a
            href="https://pump.fun"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 bg-white text-bg px-5 py-2 rounded-[10px] text-[13px] font-semibold no-underline font-body transition-all hover:bg-cyan hover:text-black"
          >
            Buy $DEAD <span className="text-[10px]">↗</span>
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden flex flex-col gap-[5px] p-2"
            aria-label="Toggle menu"
          >
            <span
              className={clsx(
                "w-5 h-[1.5px] bg-white/60 transition-all duration-300 origin-center",
                open && "rotate-45 translate-y-[6.5px]",
              )}
            />
            <span
              className={clsx(
                "w-5 h-[1.5px] bg-white/60 transition-all duration-300",
                open && "opacity-0",
              )}
            />
            <span
              className={clsx(
                "w-5 h-[1.5px] bg-white/60 transition-all duration-300 origin-center",
                open && "-rotate-45 -translate-y-[6.5px]",
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "md:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "max-h-[400px] pb-4" : "max-h-0",
        )}
      >
        <div className="flex flex-col gap-0.5 pt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-body px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "text-white bg-white/[0.05]"
                    : "text-white/40 hover:text-white/70",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href="https://pump.fun"
            target="_blank"
            rel="noreferrer"
            className="sm:hidden mt-2 text-center bg-white text-bg px-5 py-2.5 rounded-[10px] text-[13px] font-semibold no-underline font-body"
          >
            Buy $DEAD ↗
          </a>
        </div>
      </div>
    </nav>
  );
}
