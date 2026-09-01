"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import type { RequestActionResult } from "../lib/actions";
import type { RequestDetail, RequestPriority, RequestStatus } from "../types";
import { RequestFilters } from "./RequestFilters";
import { RequestFormModal } from "./RequestFormModal";
import { RequestTable } from "./RequestTable";
import { RequestsEmptyState } from "./RequestsEmptyState";

interface RequestsViewProps {
  initialRequests: RequestDetail[];
  createAction: (formData: FormData) => Promise<RequestActionResult>;
}

export function RequestsView({ initialRequests, createAction }: RequestsViewProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { message: toast, showToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | "all">("all");

  const metrics = useMemo(
    () => [
      { label: "Total de solicitudes", value: requests.length },
      {
        label: "Abiertas",
        value: requests.filter((request) => request.status === "pending").length,
      },
      {
        label: "En progreso",
        value: requests.filter((request) => request.status === "in_progress").length,
      },
      {
        label: "Resueltas",
        value: requests.filter((request) => request.status === "resolved").length,
      },
      {
        label: "Prioridad crítica",
        value: requests.filter((request) => request.priority === "urgent").length,
        hint: "Requieren atención inmediata",
      },
    ],
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !normalized ||
        request.title.toLowerCase().includes(normalized) ||
        request.id.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requests, search, statusFilter, priorityFilter]);

  function handleCreateSuccess(request: RequestDetail) {
    setRequests((current) => [request, ...current]);
    setIsModalOpen(false);
    showToast("Solicitud creada correctamente.");
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Nueva solicitud
        </Button>
      </div>

      <RequestFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      {requests.length === 0 ? (
        <RequestsEmptyState onCreate={() => setIsModalOpen(true)} />
      ) : (
        <DashboardSection
          title="Todas las solicitudes"
          description={`${filteredRequests.length} de ${requests.length} solicitudes`}
        >
          <RequestTable
            requests={filteredRequests}
            columns={["updatedAt"]}
            titleColumnLabel="Asunto"
          />
        </DashboardSection>
      )}

      <RequestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
        createAction={createAction}
      />

      {toast ? <Toast message={toast} /> : null}
    </>
  );
}
