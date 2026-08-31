import { requestPriorityLabels, requestStatusLabels } from "../lib/labels";

const inputClassName =
  "rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40";

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
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

export function RequestFilters() {
  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    ...Object.entries(requestStatusLabels).map(([value, label]) => ({ value, label })),
  ];

  const priorityOptions = [
    { value: "all", label: "Todas las prioridades" },
    ...Object.entries(requestPriorityLabels).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 lg:col-span-2">
          <label htmlFor="search" className="text-xs font-medium text-[#6a7282]">
            Buscar
          </label>
          <input
            id="search"
            name="search"
            type="search"
            placeholder="Título o ID..."
            className={inputClassName}
          />
        </div>

        <FilterField label="Estado" htmlFor="status">
          <FilterSelect id="status" defaultValue="all" options={statusOptions} />
        </FilterField>

        <FilterField label="Prioridad" htmlFor="priority">
          <FilterSelect id="priority" defaultValue="all" options={priorityOptions} />
        </FilterField>
      </div>
    </div>
  );
}
