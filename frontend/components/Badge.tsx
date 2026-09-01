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
  /** `sm` (default) fits table cells. `md` gives it more presence for standalone contexts, like a detail page header. */
  size?: "sm" | "md";
  /** Pulses the dot — draws the eye to something that needs attention (e.g. an urgent priority). Respects `prefers-reduced-motion`. */
  pulse?: boolean;
}

const sizeClasses: Record<"sm" | "md", { pill: string; dot: string }> = {
  sm: { pill: "px-2.5 py-1 text-xs", dot: "h-1.5 w-1.5" },
  md: { pill: "px-3 py-1.5 text-sm", dot: "h-2 w-2" },
};

export function Badge({ tone = "neutral", children, size = "sm", pulse = false }: BadgeProps) {
  const { pill, dot } = sizeClasses[size];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white font-medium whitespace-nowrap text-[#101828] ${pill}`}
    >
      <span
        className={`shrink-0 rounded-full ${dot} ${dotColor[tone]} ${pulse ? "motion-safe:animate-[pulse-glow_2s_ease-in-out_infinite]" : ""}`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
