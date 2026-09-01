import { Sidebar, type SidebarNavItem, type SidebarUser } from "@/components/Sidebar";

interface DashboardLayoutProps {
  navItems: SidebarNavItem[];
  user?: SidebarUser;
  logoutAction?: (formData: FormData) => Promise<void>;
  title: string;
  description?: string;
  ctaLabel?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({
  navItems,
  user,
  logoutAction,
  title,
  description,
  ctaLabel,
  headerActions,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col font-sans lg:h-dvh lg:flex-row lg:overflow-hidden">
      <Sidebar navItems={navItems} user={user} logoutAction={logoutAction} ctaLabel={ctaLabel} />

      <main className="flex-1 bg-white px-4 py-8 sm:px-8 lg:min-h-0 lg:overflow-y-auto lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 h-6 w-1 shrink-0 rounded-full bg-[#ff8b1a]"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#101828]">{title}</h1>
                {description ? (
                  <p className="mt-1 text-sm text-[#6a7282]">{description}</p>
                ) : null}
              </div>
            </div>
            {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
