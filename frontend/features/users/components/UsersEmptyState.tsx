import { Button } from "@/components/Button";

interface UsersEmptyStateProps {
  onCreate: () => void;
}

export function UsersEmptyState({ onCreate }: UsersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
      <p className="text-base font-bold text-[#101828]">No hay usuarios registrados</p>
      <p className="max-w-sm text-sm text-[#6a7282]">
        Crea el primer usuario para comenzar a gestionar accesos a la plataforma.
      </p>
      <Button variant="primary" onClick={onCreate} className="mt-4">
        + Nuevo usuario
      </Button>
    </div>
  );
}
