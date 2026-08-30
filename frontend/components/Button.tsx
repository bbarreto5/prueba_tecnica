import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#ff8b1a] text-[#101828] hover:opacity-90 focus-visible:ring-[#ff8b1a]/40",
  ghost:
    "border border-[#cccccc] bg-transparent text-[#101828] hover:bg-[#f3f4f6] focus-visible:ring-[#ff8b1a]/40",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-[2rem] px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
