"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarDays, CalendarPlus, Check, Clock, MapPin, Repeat, Users, X } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Photo } from "@/components/ui/photo";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { RsvpSheet } from "./rsvp-sheet";
import { headcount } from "@/lib/event-builder";
import { OfferingRow, toneFor } from "./offering-cards";
import { getOfferings, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { Offering, SubItem } from "@/lib/types";
import { cn, downloadIcs, formatDay, formatShortDay, formatTime } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function DetailPage({ offering: o }: { offering: Offering }) {
  const router = useRouter();
  const { hasRsvp, cancelRsvp, hydrated, responses } = useStore();
  const taken = o.custom ? headcount(responses.filter((r) => r.eventId === o.id)) : 0;
  const left = o.capacity ? Math.max(0, o.capacity - taken) : undefined;
  const closed = !!o.closesAt && hydrated && Date.now() > +new Date(o.closesAt);
  const blocked = closed || left === 0;
  const [sheet, setSheet] = useState<{ open: boolean; item?: SubItem }>({ open: false });
  const hosts = o.hostIds.map((id) => staffById[id]).filter(Boolean);
  const main = hydrated ? hasRsvp(o.id) : undefined;
  const related = useMemo(
    () => getOfferings().filter((x) => x.id !== o.id && x.interests.some((i) => o.interests.includes(i))).slice(0, 3),
    [o],
  );

  const open = (item?: SubItem) => setSheet({ open: true, item });

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-7xl px-5 pt-6 md:px-8 md:pt-10">
          <button onClick={() => (window.history.length > 1 ? router.back() : router.push("/events"))} className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-stone-500 transition hover:text-stone-900">
            <ArrowLeft className="size-4" /> Back
          </button>
        </div>

        {o.status === "draft" && (
          <div className="mx-auto max-w-7xl px-5 pt-4 md:px-8">
            <p className="rounded-2xl bg-honey-soft px-4 py-3 text-sm text-honey">Draft preview. Visitors can&apos;t see this event until it&apos;s published in the admin.</p>
          </div>
        )}

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-5 pt-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <p className="text-sm font-medium text-forest-600">{o.tag}</p>
            <h1 className="mt-3 max-w-4xl font-display text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[0.95] tracking-[-0.025em] text-stone-900 text-balance">{o.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">{o.summary}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.8 }}>
            <Photo src={o.image} alt={o.title} tone={toneFor(o)} priority className="mt-10 aspect-[4/3] rounded-[32px] sm:aspect-[21/9]" />
          </motion.div>
        </section>

        {/* Body */}
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1fr_380px] lg:gap-20 lg:py-20">
          <div className="min-w-0 space-y-16">
            <div className="space-y-5 text-[19px] leading-relaxed text-stone-700">
              {o.description.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            {o.items && (
              <div>
                <h2 className="font-display text-4xl text-stone-900">{o.itemsTitle}</h2>
                <ul className="mt-6 space-y-3">
                  {o.items.map((it) => (
                    <ItemRow key={it.id} o={o} it={it} onAction={() => open(it)} />
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="font-display text-4xl text-stone-900">What to expect</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {o.expect.map((e) => (
                  <li key={e} className="flex gap-3 rounded-2xl bg-white p-4 text-[15px] text-stone-700 ring-1 ring-stone-200/70">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>

            {hosts.length > 0 && (
              <div>
                <h2 className="font-display text-4xl text-stone-900">Who you&apos;ll meet</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {hosts.map((h) => (
                    <div key={h.id} className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-stone-200/70">
                      <Avatar name={h.name} src={h.photo} className="size-14" />
                      <div>
                        <p className="font-medium text-stone-900">{h.name}</p>
                        <p className="text-sm text-forest-600">{h.role}</p>
                        {h.bio && <p className="mt-2 text-sm leading-relaxed text-stone-500">{h.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky action card */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[28px] bg-white p-6 shadow-soft ring-1 ring-stone-200/60 md:p-7">
              <dl className="space-y-4 text-[15px]">
                {o.date ? (
                  <>
                    <Meta icon={CalendarDays} label="Next up" value={formatDay(o.date)} />
                    <Meta icon={Clock} label="Time" value={`${formatTime(o.date)}${o.durationMin ? ` · ${o.durationMin} min` : ""}`} />
                  </>
                ) : (
                  <Meta icon={Repeat} label="When" value={o.schedule} />
                )}
                <Meta icon={MapPin} label="Where" value={o.location} />
                {o.date && <Meta icon={Repeat} label="Rhythm" value={o.schedule} />}
              </dl>

              <div className="mt-6 space-y-2.5 border-t border-stone-100 pt-6">
                {o.items ? (
                  <>
                    <p className="text-sm text-stone-500">Pick one below and we&apos;ll take care of the rest.</p>
                    <Button size="lg" className="w-full" onClick={() => document.getElementById(`item-${o.items![0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}>
                      {o.cta} <ArrowRight />
                    </Button>
                  </>
                ) : main ? (
                  <>
                    <div className="flex items-center gap-3 rounded-2xl bg-forest-50 p-4 text-forest-300">
                      <Check className="size-5" />
                      <span className="font-medium">{o.actionKind === "question" ? "Question sent" : o.actionKind === "join" ? "Request sent" : "You're going!"}</span>
                    </div>
                    {o.date && (
                      <Button variant="secondary" className="w-full" onClick={() => { downloadIcs({ title: o.title, start: o.date!, durationMin: o.durationMin, location: o.location, description: o.summary }); toast("Calendar invite downloaded"); }}>
                        <CalendarPlus /> Add to calendar
                      </Button>
                    )}
                    {o.actionKind === "question" ? (
                      <Button variant="ghost" className="w-full" onClick={() => open()}>Ask another question</Button>
                    ) : (
                      <Button variant="ghost" className="w-full text-stone-500" onClick={() => { cancelRsvp(main.id); toast("RSVP canceled", { description: "No worries. You're welcome anytime." }); }}>
                        <X /> Can&apos;t make it
                      </Button>
                    )}
                  </>
                ) : blocked ? (
                  <div className="rounded-2xl bg-stone-100 p-4 text-center text-sm text-stone-600">
                    {closed ? "Sign-ups for this event are closed." : "This event is full."} Questions? Call the church office.
                  </div>
                ) : (
                  <>
                    <Button size="lg" className="w-full" onClick={() => open()}>
                      {o.action} <ArrowRight />
                    </Button>
                    <p className="pt-1 text-center text-xs text-stone-400">
                      {left !== undefined ? `${left} spot${left === 1 ? "" : "s"} left` : "Free · No commitment"}
                      {o.closesAt ? ` · closes ${formatDay(o.closesAt)}` : ""}
                    </p>
                  </>
                )}
              </div>
            </div>
          </aside>
        </section>

        {related.length > 0 && (
          <section className="border-t border-stone-200/70">
            <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-4xl text-stone-900">You might also like</h2>
                <Link href="/events" className="text-sm text-stone-500 hover:text-stone-900">See everything</Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-1 md:grid-cols-3">
                {related.map((r) => (
                  <OfferingRow key={r.id} o={r} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      {/* Mobile sticky action */}
      {!o.items && !main && !blocked && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200/70 bg-ink/85 p-4 backdrop-blur-xl lg:hidden">
          <Button size="lg" className="w-full" onClick={() => open()}>{o.action} <ArrowRight /></Button>
        </div>
      )}
      <RsvpSheet open={sheet.open} onOpenChange={(v) => setSheet((s) => ({ ...s, open: v }))} offering={o} item={sheet.item} />
    </>
  );
}

function Meta({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-[18px] shrink-0 text-stone-400" />
      <div>
        <dt className="text-xs text-stone-400">{label}</dt>
        <dd className="text-stone-800">{value}</dd>
      </div>
    </div>
  );
}

function ItemRow({ o, it, onAction }: { o: Offering; it: SubItem; onAction: () => void }) {
  const { hasRsvp, cancelRsvp, hydrated } = useStore();
  const r = hydrated ? hasRsvp(o.id, it.id) : undefined;
  const label = o.actionKind === "join" ? "Request to join" : o.action;
  return (
    <li id={`item-${it.id}`} className={cn("flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 transition sm:flex-row sm:items-center md:p-6", r ? "ring-2 ring-forest-500" : "ring-stone-200/70")}>
      {it.date && (
        <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-stone-100 text-stone-900">
          <span className="text-[11px] font-medium uppercase tracking-wider text-clay">{new Date(it.date).toLocaleDateString("en-US", { month: "short" })}</span>
          <span className="font-display text-3xl leading-none">{new Date(it.date).getDate()}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-lg font-medium text-stone-900">{it.title}</p>
        <p className="mt-0.5 text-sm text-stone-500">
          {it.date ? `${formatShortDay(it.date)} · ${formatTime(it.date)}` : it.meta} · {it.location}
        </p>
        <p className="mt-2 text-[15px] text-stone-600">{it.description}</p>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {it.leader}</span>
          {it.spots ? <span className="text-forest-600">{it.spots} open spots</span> : null}
        </p>
      </div>
      {r ? (
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-forest-100 px-4 text-sm font-medium text-forest-700">
            <Check className="size-4" /> {o.actionKind === "join" ? "Requested" : "You're in"}
          </span>
          <button onClick={() => { cancelRsvp(r.id); toast("Canceled", { description: `${it.title} removed.` }); }} className="text-xs text-stone-400 hover:text-stone-700">
            Undo
          </button>
        </div>
      ) : (
        <Button variant="secondary" onClick={onAction} className="shrink-0">
          {label}
        </Button>
      )}
    </li>
  );
}
