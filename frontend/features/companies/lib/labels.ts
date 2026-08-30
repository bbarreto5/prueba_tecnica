import type { BadgeTone } from "@/components/Badge";
import type { CompanyStatus } from "../types";

export const companyStatusLabels: Record<CompanyStatus, string> = {
  active: "Activa",
  inactive: "Inactiva",
};

export const companyStatusTones: Record<CompanyStatus, BadgeTone> = {
  active: "success",
  inactive: "neutral",
};
