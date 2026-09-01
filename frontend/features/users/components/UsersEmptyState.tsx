import { EmptyState } from "@/components/EmptyState";

interface UsersEmptyStateProps {
  onCreate: () => void;
}

export function UsersEmptyState({ onCreate }: UsersEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <circle cx="12" cy="8.5" r="3.25" />
          <path strokeLinecap="round" d="M5.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        </svg>
      }
      title="No hay usuarios registrados"
      description="Crea el primer usuario para comenzar a gestionar accesos a la plataforma."
      actionLabel="+ Nuevo usuario"
      onAction={onCreate}
    />
  );
}
