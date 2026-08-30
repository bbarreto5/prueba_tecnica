interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-[1.25rem] border border-[#e5e5e5] bg-white p-5">
      <p className="text-xs font-medium tracking-wide text-[#6a7282] uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[#101828]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#6a7282]">{hint}</p> : null}
    </div>
  );
}
