import { CompanyStatusBadge } from "./CompanyStatusBadge";
import type { Company } from "../types";

interface CompanyTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function CompanyTable({ companies, onEdit }: CompanyTableProps) {
  return (
    <div className="-mx-6 overflow-x-auto px-6 sm:-mx-8 sm:px-8">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#e5e5e5] text-xs tracking-wide text-[#6a7282] uppercase">
            <th className="py-3 pr-4 font-medium">Empresa</th>
            <th className="py-3 pr-4 font-medium">Estado</th>
            <th className="py-3 pr-4 font-medium">Fecha de creación</th>
            <th className="py-3 pr-0 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {companies.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-sm text-[#6a7282]">
                No se encontraron empresas para tu búsqueda.
              </td>
            </tr>
          ) : (
            companies.map((company) => (
              <tr key={company.id} className="border-b border-[#f3f4f6] last:border-0">
                <td className="py-3 pr-4 font-medium text-[#101828]">{company.name}</td>
                <td className="py-3 pr-4">
                  <CompanyStatusBadge status={company.isActive ? "active" : "inactive"} />
                </td>
                <td className="py-3 pr-4 text-[#6a7282]">{formatDate(company.createdAt)}</td>
                <td className="py-3 pr-0">
                  <button
                    type="button"
                    onClick={() => onEdit(company)}
                    className="rounded-[2rem] border border-[#cccccc] bg-transparent px-3 py-1.5 text-xs font-semibold text-[#101828] transition-colors hover:bg-[#f3f4f6] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 focus-visible:outline-none"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
