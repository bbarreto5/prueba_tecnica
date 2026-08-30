export type BadgeTone = "neutral" | "info" | "warning" | "danger" | "success";

const dotColor: Record<BadgeTone, string> = {
  neutral: "bg-[#9ca3af]",
  info: "bg-[#3080ff]",
  warning: "bg-[#fcbb00]",
  danger: "bg-[#fb2c36]",
  success: "bg-[#09c6b8]",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
}

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[#101828]">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[tone]}`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
