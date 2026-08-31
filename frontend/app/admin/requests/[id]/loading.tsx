import { Sidebar, type SidebarNavItem } from "@/components/Sidebar";
import { SkeletonBlock } from "@/components/SkeletonBlock";

const navItems: SidebarNavItem[] = [
  { label: "Solicitudes", href: "/admin/requests", current: true },
];

export default function AdminRequestDetailLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col font-sans lg:flex-row">
      <Sidebar navItems={navItems} />

      <main className="flex-1 bg-white px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-7 w-72" />
              <SkeletonBlock className="h-4 w-48" />
            </div>
            <SkeletonBlock className="h-8 w-40 rounded-full" />
          </div>

          <SkeletonBlock className="h-4 w-32" />

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="flex flex-col gap-8 xl:col-span-2">
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-64" />
            </div>
            <div className="flex flex-col gap-8">
              <SkeletonBlock className="h-48" />
              <SkeletonBlock className="h-24" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
