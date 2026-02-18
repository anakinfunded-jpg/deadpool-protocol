import clsx from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={clsx("rounded skeleton-shimmer", className)} />;
}

/* ── Page-specific skeleton layouts ── */

export function TokenCardSkeleton() {
  return (
    <div className="p-4 px-5 rounded-xl border border-white/[0.06] bg-white/[0.015] grid grid-cols-[1fr_auto] gap-4 items-center">
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-36 mt-1.5" />
      </div>
      <Skeleton className="h-3 w-[80px]" />
    </div>
  );
}

export function TokenRowSkeleton() {
  return (
    <div className="grid grid-cols-[40px_1fr_80px_80px_80px_100px] px-4 py-3.5 items-center border-b border-white/[0.03]">
      <Skeleton className="h-4 w-6" />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-[60px]" />
    </div>
  );
}

export function StatBoxSkeleton() {
  return (
    <div className="text-center">
      <Skeleton className="h-8 w-20 mx-auto" />
      <Skeleton className="h-3 w-24 mx-auto mt-3" />
    </div>
  );
}

export function ScanResultSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="text-center px-6 py-8 border-b border-white/[0.06]">
        <Skeleton className="h-16 w-20 mx-auto" />
        <Skeleton className="h-3 w-24 mx-auto mt-3" />
      </div>
      <div className="grid grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "px-5 py-3.5",
              i < 4 && "border-b border-white/[0.04]",
              i % 2 === 0 && "border-r border-white/[0.04]",
            )}
          >
            <Skeleton className="h-2.5 w-16 mb-2" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
