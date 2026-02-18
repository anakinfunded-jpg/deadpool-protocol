"use client";

import { Counter } from "./counter";

interface StatBoxProps {
  label: string;
  numericValue?: number;
  textValue?: string;
}

export function StatBox({
  label,
  numericValue = 0,
  textValue = "",
}: StatBoxProps) {
  return (
    <div className="text-center">
      <div className="text-[32px] font-bold text-white font-display tracking-[-0.02em] leading-none">
        {numericValue > 0 ? <Counter to={numericValue} /> : textValue}
      </div>
      <div className="text-xs text-white/30 mt-2 font-mono uppercase tracking-[0.1em]">
        {label}
      </div>
    </div>
  );
}
