import { Sidebar, type SidebarNavItem } from "@/components/Sidebar";

interface DashboardLayoutProps {
  navItems: SidebarNavItem[];
  roleLabel: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({
  navItems,
  roleLabel,
  title,
  description,
  ctaLabel,
  headerActions,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col font-sans lg:flex-row">
      <Sidebar navItems={navItems} roleLabel={roleLabel} ctaLabel={ctaLabel} />

      <main className="flex-1 bg-white px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#101828]">{title}</h1>
              {description ? (
                <p className="mt-1 text-sm text-[#6a7282]">{description}</p>
              ) : null}
            </div>
            {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
