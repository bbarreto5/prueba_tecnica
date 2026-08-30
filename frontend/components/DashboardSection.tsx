interface DashboardSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardSection({
  title,
  description,
  action,
  children,
}: DashboardSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#101828]">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-[#6a7282]">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 sm:p-8">
        {children}
      </div>
    </section>
  );
}
