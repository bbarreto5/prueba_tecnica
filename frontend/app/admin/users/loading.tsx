import { Sidebar, type SidebarNavItem } from "@/components/Sidebar";
import { SkeletonBlock } from "@/components/SkeletonBlock";

const navItems: SidebarNavItem[] = [{ label: "Usuarios", href: "/admin/users", current: true }];

export default function UsersLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col font-sans lg:flex-row">
      <Sidebar navItems={navItems} />

      <main className="flex-1 bg-white px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-7 w-32" />
            <SkeletonBlock className="h-4 w-72" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SkeletonBlock className="h-11 w-full sm:max-w-xs" />
            <SkeletonBlock className="h-11 w-40 rounded-[2rem]" />
          </div>

          <div className="flex flex-col gap-4 rounded-[2rem] border border-[#e5e5e5] p-6 sm:p-8">
            <SkeletonBlock className="h-5 w-48" />
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
