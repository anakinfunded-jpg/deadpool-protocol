"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";

interface CounterProps {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function Counter({
  to,
  duration = 2000,
  prefix = "",
  suffix = "",
}: CounterProps) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!inView) return;
    const steps = 60;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const p = 1 - Math.pow(1 - step / steps, 3);
      setVal(Math.floor(to * p));
      if (step >= steps) clearInterval(iv);
    }, duration / steps);
    return () => clearInterval(iv);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}
