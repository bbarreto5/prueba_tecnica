import { Button } from "@/components/Button";

interface CompaniesEmptyStateProps {
  onCreate: () => void;
}

export function CompaniesEmptyState({ onCreate }: CompaniesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
      <p className="text-base font-bold text-[#101828]">No hay empresas registradas</p>
      <p className="max-w-sm text-sm text-[#6a7282]">
        Crea la primera empresa para comenzar a gestionar tus clientes.
      </p>
      <Button variant="primary" onClick={onCreate} className="mt-4">
        + Nueva empresa
      </Button>
    </div>
  );
}
