import { requestPriorityLabels, requestStatusLabels } from "../lib/labels";

interface RequestFiltersProps {
  companyOptions: string[];
  assigneeOptions: string[];
}

const inputClassName =
  "rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40";

function FilterField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium text-[#6a7282]">
        {label}
      </label>
      {children}
    </div>
  );
}

function FilterSelect({
  id,
  defaultValue,
  options,
}: {
  id: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select id={id} name={id} defaultValue={defaultValue} className={inputClassName}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function RequestFilters({ companyOptions, assigneeOptions }: RequestFiltersProps) {
  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    ...Object.entries(requestStatusLabels).map(([value, label]) => ({ value, label })),
  ];

  const priorityOptions = [
    { value: "all", label: "Todas las prioridades" },
    ...Object.entries(requestPriorityLabels).map(([value, label]) => ({ value, label })),
  ];

  const companySelectOptions = [
    { value: "all", label: "Todas las empresas" },
    ...companyOptions.map((name) => ({ value: name, label: name })),
  ];

  const assigneeSelectOptions = [
    { value: "all", label: "Todos los responsables" },
    { value: "unassigned", label: "Sin asignar" },
    ...assigneeOptions.map((name) => ({ value: name, label: name })),
  ];

  return (
    <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="flex flex-col gap-2 xl:col-span-2">
          <label htmlFor="search" className="text-xs font-medium text-[#6a7282]">
            Buscar
          </label>
          <input
            id="search"
            name="search"
            type="search"
            placeholder="Título, ID o empresa..."
            className={inputClassName}
          />
        </div>

        <FilterField label="Estado" htmlFor="status">
          <FilterSelect id="status" defaultValue="all" options={statusOptions} />
        </FilterField>

        <FilterField label="Prioridad" htmlFor="priority">
          <FilterSelect id="priority" defaultValue="all" options={priorityOptions} />
        </FilterField>

        <FilterField label="Empresa" htmlFor="company">
          <FilterSelect id="company" defaultValue="all" options={companySelectOptions} />
        </FilterField>

        <FilterField label="Responsable" htmlFor="assignee">
          <FilterSelect id="assignee" defaultValue="all" options={assigneeSelectOptions} />
        </FilterField>

        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-2">
          <span className="text-xs font-medium text-[#6a7282]">Rango de fechas</span>
          <div className="flex items-center gap-2">
            <input type="date" aria-label="Desde" className={`w-full ${inputClassName}`} />
            <span className="text-xs text-[#6a7282]">–</span>
            <input type="date" aria-label="Hasta" className={`w-full ${inputClassName}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
