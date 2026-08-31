import { Button } from "@/components/Button";

interface RequestsEmptyStateProps {
  onCreate: () => void;
}

export function RequestsEmptyState({ onCreate }: RequestsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
      <p className="text-base font-bold text-[#101828]">No tienes solicitudes todavía</p>
      <p className="max-w-sm text-sm text-[#6a7282]">
        Crea tu primera solicitud para comenzar a dar seguimiento a tus incidencias y
        pedidos de soporte.
      </p>
      <Button variant="primary" onClick={onCreate} className="mt-4">
        + Nueva solicitud
      </Button>
    </div>
  );
}
