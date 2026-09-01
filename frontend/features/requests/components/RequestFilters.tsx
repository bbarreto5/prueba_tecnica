import { requestPriorityLabels, requestStatusLabels } from "../lib/labels";
import type { RequestPriority, RequestStatus } from "../types";

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
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      name={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClassName}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface RequestFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: RequestStatus | "all";
  onStatusChange: (value: RequestStatus | "all") => void;
  priority: RequestPriority | "all";
  onPriorityChange: (value: RequestPriority | "all") => void;
}

export function RequestFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
}: RequestFiltersProps) {
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
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#9ca3af]"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path strokeLinecap="round" d="M16 16l-3.5-3.5" />
            </svg>
            <input
              id="search"
              name="search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Título o ID..."
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <FilterField label="Estado" htmlFor="status">
          <FilterSelect
            id="status"
            value={status}
            onChange={(value) => onStatusChange(value as RequestStatus | "all")}
            options={statusOptions}
          />
        </FilterField>

        <FilterField label="Prioridad" htmlFor="priority">
          <FilterSelect
            id="priority"
            value={priority}
            onChange={(value) => onPriorityChange(value as RequestPriority | "all")}
            options={priorityOptions}
          />
        </FilterField>
      </div>
    </div>
  );
}
