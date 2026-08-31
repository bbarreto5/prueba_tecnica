import { getSessionToken } from "@/features/auth/lib/session";
import { listCompanies } from "@/services/companies";
import { toCompany } from "./mappers";
import type { Company } from "../types";

/** Fetches the real company list for the current session. Throws on failure — callers render the error state. */
export async function getCompanies(): Promise<Company[]> {
  const token = await getSessionToken();
  if (!token) return [];

  const companies = await listCompanies(token);
  return companies.map(toCompany);
}
