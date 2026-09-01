"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginFormState } from "../lib/actions";

const initialState: LoginFormState = {};

const inputClasses =
  "w-full rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 disabled:cursor-not-allowed disabled:border-[#e5e5e5] disabled:bg-[#f3f4f6] disabled:text-[#6a7282]";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full rounded-[2rem] border border-[#e5e5e5] bg-white p-8 shadow-[0_0_12px_#09c6b81a] sm:p-10">
      <h1 className="text-2xl font-bold text-[#101828]">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-[#6a7282]">
        Introduce tus credenciales para acceder a tu panel.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-5">
        {state.error ? (
          <div
            role="alert"
            className="rounded-[1.25rem] border border-[#fb2c36]/30 bg-[#fb2c36]/5 px-4 py-3 text-sm text-[#bf000f]"
          >
            {state.error}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs font-medium text-[#6a7282]">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            placeholder="nombre@empresa.com"
            disabled={isPending}
            className={inputClasses}
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
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isPending}
              className={`${inputClasses} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={isPending}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#6a7282] transition-colors hover:text-[#101828] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-[#9ca3af]"
            >
              {showPassword ? (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.5 10.5S5 5 10 5s7.5 5.5 7.5 5.5-2.5 5.5-7.5 5.5-7.5-5.5-7.5-5.5Z"
                  />
                  <circle cx="10" cy="10.5" r="2.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l14 14M8.35 8.4a2.25 2.25 0 0 0 3.18 3.2M6.2 6.27C4.02 7.6 2.5 9.75 2.5 9.75S5 15.25 10 15.25c1.4 0 2.62-.43 3.65-1.02M9.02 5.06A6.7 6.7 0 0 1 10 5c5 0 7.5 4.75 7.5 4.75a13.6 13.6 0 0 1-2.02 2.8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <label htmlFor="remember" className="flex items-center gap-2 text-sm text-[#6a7282]">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            disabled={isPending}
            className="h-4 w-4 rounded border-[#cccccc] accent-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40"
          />
          Recordarme
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 flex items-center justify-center gap-2 rounded-[2rem] bg-[#ff8b1a] px-4 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#6a7282]"
        >
          {isPending ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>
    </div>
  );
}
