import { SkeletonBlock } from "@/components/SkeletonBlock";

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-6 font-sans">
      <div className="w-full max-w-[400px]">
        <div className="w-full rounded-[2rem] border border-[#e5e5e5] bg-white p-8 sm:p-10">
          <SkeletonBlock className="h-7 w-40" />
          <SkeletonBlock className="mt-3 h-4 w-64" />

          <div className="mt-8 flex flex-col gap-5">
            <SkeletonBlock className="h-11" />
            <SkeletonBlock className="h-11" />
            <SkeletonBlock className="h-11 rounded-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  );
}
