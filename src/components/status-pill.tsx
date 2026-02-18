import clsx from "clsx";

interface StatusPillProps {
  status: string;
}

export function StatusPill({ status }: StatusPillProps) {
  const isZombie = status === "ZOMBIE";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.06em] font-mono",
        isZombie
          ? "border border-cyan text-cyan bg-cyan/[0.06]"
          : "border border-white/[0.15] text-white/50 bg-white/[0.03]",
      )}
    >
      <span
        className={clsx(
          "w-1.5 h-1.5 rounded-full",
          isZombie ? "bg-cyan shadow-[0_0_8px_#00E5FF]" : "bg-white/30",
        )}
      />
      {status}
    </span>
  );
}
