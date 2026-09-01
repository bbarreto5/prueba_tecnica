interface DashboardSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** `default` (no accent) or `warning` — a left accent stripe and marker for a section that needs to stand out, like a priority queue. */
  tone?: "default" | "warning";
}

export function DashboardSection({
  title,
  description,
  action,
  children,
  tone = "default",
}: DashboardSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {tone === "warning" ? (
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fcbb00]/15 text-[#fcbb00]"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 1.5 1 13.5h14L8 1.5Z"
                />
                <path strokeLinecap="round" d="M8 6v3.5" />
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </span>
          ) : null}
          <div>
            <h2 className="text-lg font-bold text-[#101828]">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-sm text-[#6a7282]">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div
        className={`rounded-[2rem] border bg-white p-6 sm:p-8 ${
          tone === "warning" ? "border-[#e5e5e5] border-l-4 border-l-[#fcbb00]" : "border-[#e5e5e5]"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
