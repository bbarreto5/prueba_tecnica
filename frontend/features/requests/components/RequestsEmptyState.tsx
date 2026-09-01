import { EmptyState } from "@/components/EmptyState";

interface RequestsEmptyStateProps {
  onCreate: () => void;
}

export function RequestsEmptyState({ onCreate }: RequestsEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 3.5h10a1 1 0 0 1 1 1V19l-3-2-3 2-3-2-3 2V4.5a1 1 0 0 1 1-1Z"
          />
          <path strokeLinecap="round" d="M9.5 8h5M9.5 11h5" />
        </svg>
      }
      title="No tienes solicitudes todavía"
      description="Crea tu primera solicitud para comenzar a dar seguimiento a tus incidencias y pedidos de soporte."
      actionLabel="+ Nueva solicitud"
      onAction={onCreate}
    />
  );
}
