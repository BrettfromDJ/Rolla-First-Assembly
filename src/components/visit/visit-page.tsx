"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CalendarCheck, Clock, Music, MessageSquareQuote, Navigation, Shirt, ShieldCheck, Smile, Tag, Smartphone, Pencil, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { CampusMap } from "./campus-map";
import { PlanVisitSheet } from "./plan-sheet";
import { img } from "@/lib/images";
import { church, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { downloadIcs, formatDay, nextDow } from "@/lib/utils";

const sections = [
  { id: "service", label: "Service times" },
  { id: "expect", label: "What to expect" },
  { id: "kids", label: "Kids & families" },
  { id: "arrive", label: "Your first Sunday" },
];

export function VisitPage() {
  const [planOpen, setPlanOpen] = useState(false);
  const { profile, hydrated } = useStore();
  const plan = hydrated ? profile.visitPlan : null;

  return (
    <>
      <SiteHeader />
      <main className="pt-16 md:pt-18">
        {/* ---------- Intro ---------- */}
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 md:px-8 md:pb-16 md:pt-20">
          <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[13px] font-medium uppercase tracking-[0.16em] text-forest-500">
                Plan your visit
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.025em] text-stone-900 text-balance"
              >
                Your first Sunday, <span className="italic text-forest-600">made simple.</span>
              </motion.h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8 }} className="max-w-md text-lg leading-relaxed text-stone-600">
              Walking into a new place can feel like a lot. Here&apos;s everything you need to know, so the only surprise is how good the coffee is.
            </motion.p>
          </div>

          <nav aria-label="On this page" className="no-scrollbar -mx-5 mt-12 flex gap-2 overflow-x-auto overflow-y-hidden px-5 md:mx-0 md:px-0">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm text-stone-700 ring-1 ring-stone-200 transition hover:ring-stone-300">
                {s.label}
              </a>
            ))}
          </nav>
        </section>

        {/* ---------- Service information ---------- */}
        <section id="service" className="scroll-mt-24 px-5 md:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-12 [&>*]:min-w-0">
            <Photo src={img.venue} alt="The warmly lit Gather auditorium" tone="forest" className="h-[300px] rounded-[32px] md:h-[460px] lg:col-span-7" priority />
            <div className="flex flex-col justify-between gap-8 rounded-[32px] bg-forest-800 p-7 text-paper md:p-10 lg:col-span-5">
              <div>
                <p className="text-sm text-paper/60">Every Sunday</p>
                <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
                  {church.services.map((t) => (
                    <div key={t}>
                      <span className="font-display text-[56px] leading-none sm:text-7xl md:text-8xl">{t}</span>
                      <span className="ml-1 text-paper/60">AM</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 flex items-center gap-2 text-paper/80">
                  <Clock className="size-4 text-forest-500" /> About 70 minutes. Both services are the same.
                </p>
              </div>
              <div className="space-y-5 border-t border-paper/10 pt-6">
                <div>
                  <p className="text-lg">{church.address}</p>
                  <p className="text-paper/60">{church.city}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="light">
                    <a href={church.mapsUrl} target="_blank" rel="noreferrer">
                      <Navigation /> Get directions
                    </a>
                  </Button>
                  <Button
                    variant="outlineLight"
                    onClick={() => {
                      downloadIcs({ title: "Sunday at Gather Church", start: nextDow(0, 11).toISOString(), durationMin: 70, location: `${church.address}, ${church.city}`, description: "Services at 9:00 and 11:00. Look for the welcome tent out front." });
                      toast("Calendar invite downloaded", { description: "This Sunday at 11:00 AM." });
                    }}
                  >
                    <CalendarPlus /> Add to calendar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- What to expect ---------- */}
        <section id="expect" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
          <Reveal>
            <h2 className="max-w-2xl font-display text-5xl leading-[1] tracking-[-0.02em] text-stone-900 md:text-6xl">What to expect.</h2>
          </Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Music, t: "Worship", b: "About 25 minutes of music led by our band. Sing along, or just listen. Lyrics are on the screens." },
              { icon: MessageSquareQuote, t: "Teaching", b: "A 30-minute talk from the Bible that connects to real life. Thoughtful, honest, and occasionally funny." },
              { icon: Shirt, t: "Dress code", b: "There isn't one. Jeans and a t-shirt are perfect. So is whatever you're wearing right now." },
              { icon: Smile, t: "When you arrive", b: "Someone will say hello, but no one will single you out. Grab a coffee and sit wherever you like." },
            ].map((x, i) => (
              <Reveal key={x.t} delay={i * 0.06}>
                <div className="border-t border-stone-300 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl text-stone-300">0{i + 1}</span>
                    <x.icon className="size-5 text-forest-500" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-stone-900">{x.t}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-stone-600">{x.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Kids & families ---------- */}
        <section id="kids" className="scroll-mt-24 bg-ink-2">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="relative">
                <Photo src={img.kidsPlay} alt="Kids drawing and playing together" tone="clay" className="aspect-[4/5] rounded-[32px] sm:aspect-[5/4] lg:aspect-[4/5]" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-soft backdrop-blur sm:right-auto">
                  <Avatar name={staffById.priya.name} src={staffById.priya.photo} />
                  <div className="text-sm">
                    <p className="font-medium text-stone-900">Priya Shah</p>
                    <p className="text-stone-500">Kids &amp; Family Director</p>
                  </div>
                </div>
              </div>
            </Reveal>
            <div>
              <Reveal>
                <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-forest-500">Gather Kids</p>
                <h2 className="mt-5 font-display text-5xl leading-[1] tracking-[-0.02em] text-stone-900 md:text-6xl">Kids are the best part of Sunday.</h2>
                <p className="mt-6 max-w-md text-[17px] leading-relaxed text-stone-600">
                  During both services, kids from birth through 5th grade have their own space to play, learn, and be known by name. Students in 6th–12th meet Wednesday nights in the youth room upstairs.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="mt-10 grid grid-cols-3 gap-2">
                  {[["Nursery", "0–2"], ["Preschool", "3–5"], ["Elementary", "K–5th"]].map(([a, b]) => (
                    <div key={a} className="rounded-2xl bg-white p-4">
                      <p className="font-display text-3xl text-stone-900">{b}</p>
                      <p className="mt-1 text-sm text-stone-500">{a}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <h3 className="mt-12 text-sm font-medium text-stone-900">Check-in takes about two minutes</h3>
                <ol className="mt-5 space-y-5">
                  {[
                    { icon: Tag, t: "Stop by the blue Kids Welcome desk", b: "We'll set up a quick profile. It's one time only." },
                    { icon: ShieldCheck, t: "Get matching security tags", b: "Only the adult with the matching tag can pick up your child." },
                    { icon: Smartphone, t: "We'll text you if needed", b: "Enjoy the service. If your kiddo needs you, you'll know right away." },
                  ].map((s) => (
                    <li key={s.t} className="flex gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-forest-500">
                        <s.icon className="size-[18px]" strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="font-medium text-stone-900">{s.t}</p>
                        <p className="text-[15px] text-stone-600">{s.b}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 rounded-2xl bg-white/70 p-4 text-sm leading-relaxed text-stone-600">
                  <span className="font-medium text-stone-900">Safety first, always.</span> Every volunteer is background-checked, trained, and serves in pairs. Kids&apos; rooms have secure entry.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- Your first Sunday ---------- */}
        <section id="arrive" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
          <Reveal>
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 className="max-w-xl font-display text-5xl leading-[1] tracking-[-0.02em] text-stone-900 md:text-6xl">Your first Sunday, step by step.</h2>
              <p className="max-w-sm text-[17px] text-stone-600">Tap a stop to see where it is.</p>
            </div>
          </Reveal>
          <CampusMap />
        </section>

        {/* ---------- CTA ---------- */}
        <section className="px-5 pb-24 md:px-8 md:pb-32">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-forest-800 text-paper">
            {plan ? (
              <div className="grid gap-10 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-14">
                <div>
                  <p className="flex items-center gap-2 text-sm text-forest-500"><CalendarCheck className="size-4" /> You&apos;re on the list</p>
                  <h2 className="mt-4 font-display text-5xl leading-[1] md:text-6xl">See you {formatDay(plan.date).split(",")[0]}, {plan.firstName}.</h2>
                  <p className="mt-4 text-paper/70">
                    {formatDay(plan.date)} · {plan.service} AM{plan.bringingKids ? ` · Bringing ${plan.kidsCount} kid${plan.kidsCount === 1 ? "" : "s"}` : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                  <Button variant="outlineLight" size="lg" onClick={() => setPlanOpen(true)}><Pencil /> Edit my visit</Button>
                  <Button asChild variant="light" size="lg">
                    <Link href="/connect">Find your place <ArrowRight /></Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-[1.1fr_1fr]">
                <div className="p-8 md:p-14">
                  <h2 className="font-display text-5xl leading-[1] md:text-7xl">Let us know you&apos;re coming.</h2>
                  <p className="mt-5 max-w-md text-[17px] text-paper/70">
                    Totally optional. But if you do, we&apos;ll save you a parking spot, have name tags ready for the kids, and make sure someone&apos;s looking out for you.
                  </p>
                  <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <Button variant="light" size="lg" onClick={() => setPlanOpen(true)}>I&apos;m coming <ArrowRight /></Button>
                    <Button asChild variant="outlineLight" size="lg">
                      <Link href="/connect">Skip, just explore</Link>
                    </Button>
                  </div>
                </div>
                <Photo src={img.coffeeCup} alt="A fresh cup of coffee" tone="honey" className="min-h-64" />
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <PlanVisitSheet open={planOpen} onOpenChange={setPlanOpen} />
    </>
  );
}
