import clsx from "clsx";

interface StatusPillProps {
  status: string;
}

const STATUS_STYLES: Record<string, { border: string; text: string; dot: string }> = {
  ZOMBIE: {
    border: "border-cyan",
    text: "text-cyan bg-cyan/[0.06]",
    dot: "bg-cyan shadow-[0_0_8px_#00E5FF]",
  },
  DEAD: {
    border: "border-red-400/30",
    text: "text-red-400 bg-red-400/[0.06]",
    dot: "bg-red-400",
  },
  DYING: {
    border: "border-orange-400/30",
    text: "text-orange-400 bg-orange-400/[0.06]",
    dot: "bg-orange-400",
  },
  FADING: {
    border: "border-yellow-400/30",
    text: "text-yellow-400 bg-yellow-400/[0.06]",
    dot: "bg-yellow-400",
  },
  ALIVE: {
    border: "border-green-400/30",
    text: "text-green-400 bg-green-400/[0.06]",
    dot: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]",
  },
};

const DEFAULT_STYLE = {
  border: "border-white/[0.15]",
  text: "text-white/50 bg-white/[0.03]",
  dot: "bg-white/30",
};

export function StatusPill({ status }: StatusPillProps) {
  const s = STATUS_STYLES[status] || DEFAULT_STYLE;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.06em] font-mono border",
        s.border,
        s.text,
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", s.dot)} />
      {status}
    </span>
  );
}
