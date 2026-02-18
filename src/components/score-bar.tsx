import clsx from "clsx";

interface ScoreBarProps {
  score: number;
}

export function ScoreBar({ score }: ScoreBarProps) {
  const tier = score > 80 ? "high" : score > 50 ? "mid" : "low";
  return (
    <div className="flex items-center gap-2">
      <div className="w-[60px] h-[3px] rounded-sm bg-white/[0.06] overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-sm transition-[width] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
            tier === "high" && "bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.4)]",
            tier === "mid" && "bg-white/60",
            tier === "low" && "bg-white/20",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={clsx(
          "text-xs font-bold font-mono min-w-[20px]",
          tier === "high" && "text-cyan",
          tier === "mid" && "text-white/60",
          tier === "low" && "text-white/20",
        )}
      >
        {score}
      </span>
    </div>
  );
}
