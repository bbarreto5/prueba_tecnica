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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_75%)]" />
        <div className="motion-safe:animate-[pulse-glow_6s_ease-in-out_infinite] pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#09c6b8]/25 blur-3xl" />
        <div className="motion-safe:animate-[pulse-glow_6s_ease-in-out_infinite] pointer-events-none absolute -right-24 -bottom-32 h-[26rem] w-[26rem] rounded-full bg-[#09c6b8]/10 blur-3xl [animation-delay:2s]" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[1.25rem] bg-[#ff8b1a] text-lg font-bold text-[#101828] shadow-[0_0_20px_#ff8b1a4d]">
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

          <ul className="mt-8 flex flex-col gap-3">
            {[
              "Solicitudes y respuestas en tiempo real",
              "Roles y permisos por empresa",
              "Historial completo de cada incidencia",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-[#e5e5e5]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#09c6b8]/15 text-[#09c6b8]">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5l3 3 7-7" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#6a7282]">
          © 2026 Portal. Todos los derechos reservados.
        </p>
      </section>

      <section className="flex w-full flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-[1.25rem] bg-[#ff8b1a] text-lg font-bold text-[#101828] shadow-[0_0_20px_#ff8b1a4d]">
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
