"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { type ReactNode, useRef, useCallback } from "react";
import clsx from "clsx";

const SPRING = { stiffness: 150, damping: 15 };

interface MagCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MagCard({ children, className, onClick }: MagCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);

  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);

  const rotateX = useTransform(y, [0, 1], [4, -4]);
  const rotateY = useTransform(x, [0, 1], [-4, 4]);
  const glowX = useTransform(x, [0, 1], [0, 100]);
  const glowY = useTransform(y, [0, 1], [0, 100]);
  const glow = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(0,229,255,0.06) 0%, transparent 60%)`;

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set((e.clientX - r.left) / r.width);
      rawY.set((e.clientY - r.top) / r.height);
    },
    [rawX, rawY],
  );

  const handleLeave = useCallback(() => {
    rawX.set(0.5);
    rawY.set(0.5);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ perspective: 800, rotateX, rotateY, background: glow }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={clsx(onClick && "cursor-pointer", className)}
    >
      {children}
    </motion.div>
  );
}
