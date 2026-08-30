export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`motion-safe:animate-pulse rounded-[1.25rem] bg-[#f3f4f6] ${className}`}
      aria-hidden="true"
    />
  );
}
