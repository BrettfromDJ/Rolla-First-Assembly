"use client";

import { DetailPage } from "@/components/explore/detail-page";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { getOffering } from "@/lib/data";
import { useStore } from "@/lib/store";

/** Offerings carry dates relative to "today" in the visitor's timezone, so we resolve them in the browser. */
export function DetailClient({ id }: { id: string }) {
  const { hydrated } = useStore();
  if (!hydrated) return <PageSkeleton />;
  return <DetailPage offering={getOffering(id)!} />;
}
