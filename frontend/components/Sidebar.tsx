import Link from "next/link";

export interface SidebarNavItem {
  label: string;
  href: string;
  current?: boolean;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  roleLabel: string;
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
    <button
      type="button"
      className="rounded-[2rem] bg-[#ff8b1a] px-4 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07131b] focus-visible:outline-none"
    >
      {label}
    </button>
  );
}

export function Sidebar({ navItems, roleLabel, ctaLabel }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-[#07131b] px-5 py-8 lg:flex">
        <div className="flex flex-col gap-10">
          <div className="px-2">
            <Brand />
          </div>
          <nav className="flex flex-col gap-1" aria-label="Navegación principal">
            {navItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          {ctaLabel ? <SidebarCta label={ctaLabel} /> : null}
          <p className="px-2 text-xs text-[#6a7282]">{roleLabel}</p>
        </div>
      </aside>

      <div className="flex flex-col gap-4 bg-[#07131b] px-4 pt-5 pb-4 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-[#9cb5c4]">
            {roleLabel}
          </span>
        </div>
        <nav
          className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1"
          aria-label="Navegación principal"
        >
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
          {ctaLabel ? <SidebarCta label={ctaLabel} /> : null}
        </nav>
      </div>
    </>
  );
}
