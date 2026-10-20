import { SiteHeader } from "./header";

export function PageSkeleton() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 pt-32 md:px-8" aria-busy="true" aria-label="Loading">
        <div className="h-4 w-24 animate-pulse rounded-full bg-stone-200/70" />
        <div className="mt-5 h-16 w-3/4 animate-pulse rounded-2xl bg-stone-200/60" />
        <div className="mt-10 aspect-[21/9] animate-pulse rounded-[32px] bg-stone-200/50" />
      </main>
    </>
  );
}
