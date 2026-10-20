"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PlanVisitSheet } from "@/components/visit/plan-sheet";
import { getOffering } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, formatTime, relativeDay } from "@/lib/utils";

/* Small client islands that connect the homepage to the visitor experience. */

const mori = "font-mori font-semibold";

/** Opens the visit-planning sheet in place, so visitors never leave the homepage. */
export function PlanVisitLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { profile, hydrated } = useStore();
  const planned = hydrated && profile.visitPlan;
  return (
    <>
      {planned ? (
        <Link href="/me" className={className}>
          You&apos;re on the list, see your plan <ArrowRight className="size-4" />
        </Link>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={className}>
          {children}
        </button>
      )}
      <PlanVisitSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

/**
 * For returning visitors only: a slim bar with their next step. First-time
 * visitors (no saved profile) see the homepage exactly as designed.
 */
export function WelcomeBackBar() {
  const { profile, hydrated } = useStore();
  if (!hydrated) return null;
  const name = profile.firstName || profile.visitPlan?.firstName;

  const now = Date.now();
  const next = profile.rsvps
    .map((r) => {
      const o = getOffering(r.offeringId);
      const item = o?.items?.find((i) => i.id === r.itemId);
      return o ? { o, title: item?.title ?? o.title, date: item?.date ?? (item ? undefined : o.date) } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x && !!x.date && new Date(x.date).getTime() > now)
    .sort((a, b) => +new Date(a.date!) - +new Date(b.date!))[0];

  let line: string | null = null;
  let href = "/me";
  if (next) {
    line = `${next.title}, ${relativeDay(next.date!)} at ${formatTime(next.date!)}`;
    href = `/events/${next.o.id}`;
  } else if (profile.visitPlan && new Date(profile.visitPlan.date).getTime() > now - 3 * 3600_000) {
    line = `Your first Sunday, ${relativeDay(profile.visitPlan.date)} at ${profile.visitPlan.service} AM`;
    href = "/visit#arrive";
  } else if (profile.onboardingComplete) {
    line = "Your next steps are ready";
  }
  if (!line) return null;

  return (
    <div className="mx-auto max-w-[1440px] px-5 pt-6 md:px-[60px]">
      <Link
        href={href}
        className={cn(mori, "group flex items-center justify-between gap-4 rounded-[80px] border-2 border-[#0285ff]/50 py-2 pl-2 pr-5 text-[15px] leading-tight tracking-[-0.03em] text-[#dcd2c5] transition hover:border-[#0285ff]")}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0285ff] text-[13px] text-black">{(name || "Y")[0].toUpperCase()}</span>
          <span className="truncate">
            Welcome back{name ? `, ${name}` : ""}. <span className="text-[#0285ff]">{line}</span>
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-[#0285ff] transition group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
