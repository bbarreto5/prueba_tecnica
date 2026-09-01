interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

const UNAVAILABLE = "—";

export function MetricCard({ label, value, hint }: MetricCardProps) {
  const isUnavailable = value === UNAVAILABLE;

  return (
    <div className="rounded-[1.25rem] border border-[#e5e5e5] bg-white p-5 shadow-[0_0_12px_#09c6b81a] transition-shadow hover:shadow-[0_0_16px_#09c6b833]">
      <p className="text-xs font-medium tracking-wide text-[#6a7282] uppercase">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold tabular-nums ${isUnavailable ? "text-[#9ca3af]" : "text-[#101828]"}`}
      >
        {value}
      </p>
      {hint ? (
        <p className={`mt-1 text-xs ${isUnavailable ? "text-[#bf000f]" : "text-[#6a7282]"}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
