import { EmptyState } from "@/components/EmptyState";

interface CompaniesEmptyStateProps {
  onCreate: () => void;
}

export function CompaniesEmptyState({ onCreate }: CompaniesEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.5V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v15.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 10.5h3a1 1 0 0 1 1 1v9" />
          <path strokeLinecap="round" d="M7.5 7.5h2M7.5 11h2M7.5 14.5h2M12 7.5h1M12 11h1M12 14.5h1" />
        </svg>
      }
      title="No hay empresas registradas"
      description="Crea la primera empresa para comenzar a gestionar tus clientes."
      actionLabel="+ Nueva empresa"
      onAction={onCreate}
    />
  );
}
