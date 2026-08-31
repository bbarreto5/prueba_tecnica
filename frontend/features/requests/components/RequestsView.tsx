"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import type { RequestActionResult } from "../lib/actions";
import type { RequestDetail } from "../types";
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
  const [toast, setToast] = useState<string | null>(null);

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

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

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

      <RequestFilters />

      {requests.length === 0 ? (
        <RequestsEmptyState onCreate={() => setIsModalOpen(true)} />
      ) : (
        <DashboardSection
          title="Todas las solicitudes"
          description="Solicitudes e incidencias registradas en tu compañía."
        >
          <RequestTable requests={requests} columns={["updatedAt"]} titleColumnLabel="Asunto" />
        </DashboardSection>
      )}

      <RequestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
        createAction={createAction}
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[2rem] border border-[#e5e5e5] bg-white px-5 py-3 text-sm font-medium text-[#101828] shadow-[0_0_20px_#09c6b866]"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
