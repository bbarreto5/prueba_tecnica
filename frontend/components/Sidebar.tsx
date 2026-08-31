import Link from "next/link";
import { Button } from "@/components/Button";

export interface SidebarNavItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface SidebarUser {
  name: string;
  email: string;
  roleLabel: string;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  user?: SidebarUser;
  logoutAction?: (formData: FormData) => Promise<void>;
  ctaLabel?: string;
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#ff8b1a] text-base font-bold text-[#101828]">
        P
      </span>
      <span className="text-base font-bold text-white">Portal</span>
    </div>
  );
}

function NavLink({ item }: { item: SidebarNavItem }) {
  return (
    <Link
      href={item.href}
      aria-current={item.current ? "page" : undefined}
      className={`rounded-[2rem] px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07131b] focus-visible:outline-none ${
        item.current
          ? "bg-white/10 text-[#ff8b1a]"
          : "text-[#9cb5c4] hover:bg-white/5 hover:text-white"
      }`}
    >
      {item.label}
    </Link>
  );
}

function SidebarCta({ label }: { label: string }) {
  return (
    <Button variant="primary" className="focus-visible:ring-offset-[#07131b]">
      {label}
    </Button>
  );
}

function LogoutForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="w-full rounded-[2rem] px-4 py-2.5 text-left text-sm font-medium whitespace-nowrap text-[#9cb5c4] transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07131b] focus-visible:outline-none"
      >
        Cerrar sesión
      </button>
    </form>
  );
}

export function Sidebar({ navItems, user, logoutAction, ctaLabel }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col bg-[#07131b] px-5 py-8 lg:flex">
        <div className="px-2">
          <Brand />
        </div>

        <nav
          className="mt-10 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
          aria-label="Navegación principal"
        >
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>

        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
          {ctaLabel ? <SidebarCta label={ctaLabel} /> : null}

          {user ? (
            <div className="px-2">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-[#9cb5c4]">{user.email}</p>
              <p className="mt-0.5 text-xs text-[#6a7282]">{user.roleLabel}</p>
            </div>
          ) : null}

          {logoutAction ? <LogoutForm action={logoutAction} /> : null}
        </div>
      </aside>

      <div className="flex flex-col gap-4 bg-[#07131b] px-4 pt-5 pb-4 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          {user ? (
            <span className="max-w-[9rem] truncate rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-[#9cb5c4]">
              {user.roleLabel}
            </span>
          ) : null}
        </div>
        <nav
          className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1"
          aria-label="Navegación principal"
        >
          {navItems.map((item) => (
            <NavLink item={item} key={item.label} />
          ))}
          {ctaLabel ? <SidebarCta label={ctaLabel} /> : null}
          {logoutAction ? <LogoutForm action={logoutAction} /> : null}
        </nav>
      </div>
    </>
  );
}
