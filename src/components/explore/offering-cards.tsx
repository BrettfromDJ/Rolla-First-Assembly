"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, Repeat, Sparkles } from "lucide-react";
import { Photo, type Tone } from "@/components/ui/photo";
import { useStore } from "@/lib/store";
import type { Offering } from "@/lib/types";
import { cn, formatShortDay, formatTime } from "@/lib/utils";

export const toneFor = (o: Offering): Tone =>
  ({ people: "honey", home: "forest", faith: "sand", family: "clay", serve: "sage" } as const)[o.interests[0]];

export function when(o: Offering) {
  return o.date ? `${formatShortDay(o.date)} · ${formatTime(o.date)}` : o.schedule;
}

function useJoined(o: Offering) {
  const { profile } = useStore();
  return profile.rsvps.some((r) => r.offeringId === o.id);
}

/** Large editorial feature, used for the top recommendation. */
export function FeatureCard({ o, reason }: { o: Offering; reason?: string }) {
  const joined = useJoined(o);
  return (
    <Link href={`/explore/${o.id}`} className="group grid overflow-hidden rounded-[32px] bg-white shadow-soft ring-1 ring-stone-200/60 transition duration-300 hover:shadow-lift md:grid-cols-[1.15fr_1fr]">
      <Photo src={o.image} alt="" tone={toneFor(o)} className="aspect-[4/3] md:aspect-auto md:min-h-[380px]" imgClassName="group-hover:scale-[1.03]">
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-stone-800 backdrop-blur">{o.tag}</span>
      </Photo>
      <div className="flex flex-col justify-between gap-8 p-6 md:p-10">
        <div>
          {reason && (
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-forest-600">
              <Sparkles className="size-3.5" /> {reason}
            </p>
          )}
          <h3 className="mt-3 font-display text-4xl leading-[1.02] text-stone-900 md:text-5xl">{o.title}</h3>
          <p className="mt-4 text-[17px] leading-relaxed text-stone-600">{o.summary}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <When o={o} />
          <CardCta o={o} joined={joined} />
        </div>
      </div>
    </Link>
  );
}

/** Standard vertical card. */
export function OfferingCard({ o, reason, className }: { o: Offering; reason?: string; className?: string }) {
  const joined = useJoined(o);
  return (
    <Link href={`/explore/${o.id}`} className={cn("group flex flex-col overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-stone-200/60 transition duration-300 hover:shadow-lift", className)}>
      <Photo src={o.image} alt="" tone={toneFor(o)} className="aspect-[16/10]" imgClassName="group-hover:scale-[1.03]">
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-stone-800 backdrop-blur">{o.tag}</span>
      </Photo>
      <div className="flex flex-1 flex-col p-6">
        {reason && (
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-forest-600">
            <Sparkles className="size-3.5" /> {reason}
          </p>
        )}
        <h3 className="mt-2 font-display text-[30px] leading-[1.05] text-stone-900">{o.title}</h3>
        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-stone-600">{o.summary}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <When o={o} />
          <CardCta o={o} joined={joined} small />
        </div>
      </div>
    </Link>
  );
}

/** Compact horizontal row. */
export function OfferingRow({ o }: { o: Offering }) {
  const joined = useJoined(o);
  return (
    <Link href={`/explore/${o.id}`} className="group flex items-center gap-4 rounded-3xl p-2 pr-4 transition hover:bg-white">
      <Photo src={o.image} alt="" tone={toneFor(o)} className="size-20 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-stone-500">{o.tag}</p>
        <p className="truncate font-medium text-stone-900">{o.title}</p>
        <p className="truncate text-sm text-stone-500">{when(o)}</p>
      </div>
      {joined ? (
        <span className="flex size-8 items-center justify-center rounded-full bg-forest-100 text-forest-700"><Check className="size-4" /></span>
      ) : (
        <ArrowUpRight className="size-5 text-stone-300 transition group-hover:text-stone-700" />
      )}
    </Link>
  );
}

function When({ o }: { o: Offering }) {
  const Icon = o.date ? CalendarDays : Repeat;
  return (
    <span className="flex items-center gap-2 text-sm text-stone-500">
      <Icon className="size-4 text-stone-400" />
      {when(o)}
    </span>
  );
}

function CardCta({ o, joined, small }: { o: Offering; joined: boolean; small?: boolean }) {
  if (joined)
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-forest-100 font-medium text-forest-700", small ? "h-9 px-3.5 text-sm" : "h-11 px-5 text-[15px]")}>
        <Check className="size-4" /> {o.actionKind === "join" ? "Requested" : o.actionKind === "question" ? "Sent" : "You're going"}
      </span>
    );
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full bg-forest-700 font-medium text-paper transition group-hover:bg-forest-800", small ? "h-9 px-4 text-sm" : "h-11 px-5 text-[15px]")}>
      {o.cta} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
    </span>
  );
}
