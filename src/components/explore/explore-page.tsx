"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { OfferingCard } from "./offering-cards";
import { getOfferings } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { ExploreArea } from "@/lib/types";
import { cn } from "@/lib/utils";

export const areas: { id: ExploreArea | "all"; label: string; blurb: string }[] = [
  { id: "all", label: "Everything", blurb: "All the ways to get connected at Gather." },
  { id: "groups", label: "Find a Group", blurb: "Smaller circles, real friendships." },
  { id: "events", label: "Events", blurb: "Easy, open-door ways to meet people." },
  { id: "faith", label: "Grow in Faith", blurb: "Classes, studies, and honest conversations." },
  { id: "serve", label: "Serve", blurb: "Make a difference, at Gather and across Rolla." },
];

export function ExplorePage() {
  const params = useSearchParams();
  const router = useRouter();
  const area = (params.get("area") as ExploreArea | null) ?? "all";
  const current = areas.find((a) => a.id === area) ?? areas[0];
  const { hydrated } = useStore();

  const list = useMemo(() => {
    const all = getOfferings();
    if (area === "all") return all;
    // Groups also surface studies; events include anything with a date.
    return all.filter((o) => o.area === area || (area === "groups" && o.kind === "group") || (area === "events" && o.kind === "event"));
  }, [area]);

  return (
    <>
      <SiteHeader />
      <main className="pt-16 md:pt-18">
        <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 md:px-8 md:pt-20">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-forest-500">Explore</p>
          <AnimatePresence mode="wait">
            <motion.div key={current.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}>
              <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[-0.025em] text-stone-900">{current.label}</h1>
              <p className="mt-4 max-w-lg text-lg text-stone-500">{current.blurb}</p>
            </motion.div>
          </AnimatePresence>

          <div role="tablist" aria-label="Areas" className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto overflow-y-hidden px-5 md:mx-0 md:px-0">
            {areas.map((a) => (
              <button
                key={a.id}
                role="tab"
                aria-selected={a.id === area}
                onClick={() => router.replace(a.id === "all" ? "/explore" : `/explore?area=${a.id}`, { scroll: false })}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm ring-1 transition",
                  a.id === area ? "bg-forest-700 text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {hydrated && list.map((o) => (
                <motion.div key={o.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="flex">
                  <OfferingCard o={o} className="flex-1" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
