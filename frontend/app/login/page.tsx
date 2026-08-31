import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/currentUser";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { roleRedirectPath } from "@/types/role";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(roleRedirectPath[user.role]);
  }

  return (
    <div className="flex min-h-screen w-full font-sans">
      <section
        aria-hidden="true"
        className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-[#07131b] px-12 py-16 lg:flex"
      >
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#09c6b8]/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[1.25rem] bg-[#ff8b1a] text-lg font-bold text-[#101828]">
            P
          </span>
          <span className="text-lg font-bold text-white">Portal</span>
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-2xl leading-tight font-bold text-white">
            Un solo lugar para empresas, usuarios y solicitudes.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#9cb5c4]">
            Gestiona incidencias y solicitudes de soporte con visibilidad
            completa sobre cada rol de tu organización.
          </p>
        </div>

        <p className="relative text-xs text-[#6a7282]">
          © 2026 Portal. Todos los derechos reservados.
        </p>
      </section>

      <section className="flex w-full flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-[1.25rem] bg-[#ff8b1a] text-lg font-bold text-[#101828]">
              P
            </span>
            <span className="text-lg font-bold text-[#101828]">Portal</span>
          </div>

          <LoginForm />
        </div>
      </section>
    </div>
  );
}
