"use client";

import Link from "next/link";
import { DetailPage } from "@/components/events/detail-page";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { getOffering } from "@/lib/data";
import { useStore } from "@/lib/store";

/** Offerings carry dates relative to "today" in the visitor's timezone (and staff events live in the browser), so we resolve them here. */
export function DetailClient({ id }: { id: string }) {
  const { hydrated } = useStore();
  if (!hydrated) return <PageSkeleton />;
  const o = getOffering(id);
  if (!o) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-5 py-32 text-center md:px-8">
          <h1 className="font-mori text-5xl font-semibold tracking-[-0.05em] text-stone-900">This event isn&apos;t here</h1>
          <p className="mt-4 text-lg text-stone-500">It may have ended or been taken down.</p>
          <Link href="/events" className="mt-8 inline-flex h-12 items-center rounded-full bg-forest-700 px-6 font-medium text-ink">See what&apos;s coming up</Link>
        </main>
        <SiteFooter />
      </>
    );
  }
  return <DetailPage offering={o} />;
}
