import { Button } from "@/components/Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff8b1a]/10 text-[#ff8b1a]"
      >
        {icon}
      </span>
      <p className="text-base font-bold text-[#101828]">{title}</p>
      <p className="max-w-sm text-sm text-[#6a7282]">{description}</p>
      <Button variant="primary" onClick={onAction} className="mt-4">
        {actionLabel}
      </Button>
    </div>
  );
}
