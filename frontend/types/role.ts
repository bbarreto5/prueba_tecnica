export type Role = "admin" | "support" | "company" | "user";

export const roleLabels: Record<Role, string> = {
  admin: "Administrador",
  support: "Soporte",
  company: "Empresa",
  user: "Usuario",
};
