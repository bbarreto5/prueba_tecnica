"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { DashboardSection } from "@/components/DashboardSection";
import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import type { CompanyActionResult } from "../lib/actions";
import type { Company } from "../types";
import { CompaniesEmptyState } from "./CompaniesEmptyState";
import { CompanyFormModal } from "./CompanyFormModal";
import { CompanyTable } from "./CompanyTable";

interface CompanyViewProps {
  initialCompanies: Company[];
  createAction: (formData: FormData) => Promise<CompanyActionResult>;
  updateAction: (id: string, formData: FormData) => Promise<CompanyActionResult>;
}

export function CompanyView({ initialCompanies, createAction, updateAction }: CompanyViewProps) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [query, setQuery] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { message: toast, showToast } = useToast();

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return companies;
    return companies.filter((company) => company.name.toLowerCase().includes(normalized));
  }, [companies, query]);

  function openCreateModal() {
    setEditingCompany(null);
    setIsModalOpen(true);
  }

  function openEditModal(company: Company) {
    setEditingCompany(company);
    setIsModalOpen(true);
  }

  function handleSuccess(company: Company, mode: "create" | "edit") {
    setCompanies((current) =>
      mode === "create"
        ? [company, ...current]
        : current.map((existing) => (existing.id === company.id ? company : existing)),
    );
    setIsModalOpen(false);
    showToast(
      mode === "create" ? "Empresa creada correctamente." : "Empresa actualizada correctamente.",
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-xs">
          <label htmlFor="company-search" className="sr-only">
            Buscar empresas
          </label>
          <input
            id="company-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40"
          />
        </div>
        <Button variant="primary" onClick={openCreateModal} className="shrink-0">
          + Nueva empresa
        </Button>
      </div>

      {companies.length === 0 ? (
        <CompaniesEmptyState onCreate={openCreateModal} />
      ) : (
        <DashboardSection
          title="Todas las empresas"
          description={`${filteredCompanies.length} de ${companies.length} empresas`}
        >
          <CompanyTable companies={filteredCompanies} onEdit={openEditModal} />
        </DashboardSection>
      )}

      <CompanyFormModal
        isOpen={isModalOpen}
        company={editingCompany}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        createAction={createAction}
        updateAction={updateAction}
      />

      {toast ? <Toast message={toast} /> : null}
    </>
  );
}
