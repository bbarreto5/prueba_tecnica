"use client";

import type { FormEvent } from "react";

export function LoginForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="w-full rounded-[2rem] border border-[#e5e5e5] bg-white p-8 shadow-[0_0_12px_#09c6b81a] sm:p-10">
      <h1 className="text-2xl font-bold text-[#101828]">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-[#6a7282]">
        Introduce tus credenciales para acceder a tu panel.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs font-medium text-[#6a7282]">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            className="rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-xs font-medium text-[#6a7282]">
              Contraseña
            </label>
            <a
              href="#"
              className="text-xs font-medium text-[#6a7282] transition-colors hover:text-[#101828] hover:underline focus-visible:text-[#101828] focus-visible:underline focus-visible:outline-none"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40"
          />
        </div>

        <label htmlFor="remember" className="flex items-center gap-2 text-sm text-[#6a7282]">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-[#cccccc] accent-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40"
          />
          Recordarme
        </label>

        <button
          type="submit"
          className="mt-2 rounded-[2rem] bg-[#ff8b1a] px-4 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 focus-visible:ring-offset-2"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
