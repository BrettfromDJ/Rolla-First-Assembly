"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BookOpen, CalendarDays, Check, Clock, HandHeart, MapPin, MessageCircle, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ContactSheet } from "@/components/site/contact-sheet";
import { Photo } from "@/components/ui/photo";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";
import { InterestIcon, interestTone } from "@/components/ui/interest-icon";
import { ChoiceCard } from "@/components/connect/options";
import { OfferingCard, toneFor } from "@/components/events/offering-cards";
import { church, getOffering, interests as interestList, interestShort, staffById } from "@/lib/data";
import { img } from "@/lib/images";
import { reasonFor, recommend } from "@/lib/recommend";
import { useStore } from "@/lib/store";
import type { InterestId, Offering, Rsvp, SubItem } from "@/lib/types";
import { cn, formatDay, formatShortDay, formatTime, greeting, relativeDay } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

type Plan = { rsvp: Rsvp; o: Offering; item?: SubItem; date?: string };

export function HomePage() {
  const { profile, hydrated } = useStore();
  const [contactOpen, setContactOpen] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);

  const plans: Plan[] = useMemo(() => {
    return profile.rsvps
      .map((r) => {
        const o = getOffering(r.offeringId);
        if (!o) return null;
        const item = o.items?.find((i) => i.id === r.itemId);
        return { rsvp: r, o, item, date: item?.date ?? (item ? undefined : o.date) };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.date ? +new Date(a!.date) : Infinity) - (b!.date ? +new Date(b!.date) : Infinity)) as Plan[];
  }, [profile.rsvps]);

  const recs = useMemo(() => {
    const taken = new Set(profile.rsvps.map((r) => r.offeringId));
    return recommend(profile.interests, profile.followUps, 8).filter((o) => !taken.has(o.id)).slice(0, 6);
  }, [profile.interests, profile.followUps, profile.rsvps]);

  if (!hydrated) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-5 pt-16 md:px-8">
          <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-stone-200/60" />
          <div className="mt-10 h-80 animate-pulse rounded-[32px] bg-stone-200/50" />
        </main>
      </>
    );
  }

  const name = profile.firstName || profile.visitPlan?.firstName;
  const baptismNext = !!profile.baptism && new Date(profile.baptism.date).getTime() > Date.now() - 3 * 3600_000;
  const nextPlan = plans.find((p) => p.date && new Date(p.date) > new Date()) ?? plans[0];
  const personalized = profile.onboardingComplete || profile.interests.length > 0;

  return (
    <>
      <SiteHeader />
      <main>
        {/* ---------- Welcome ---------- */}
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 md:px-8 md:pt-20">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
              <h1 className="font-display text-[clamp(3.25rem,6.4vw,82px)] leading-[0.92] tracking-[-0.025em] text-stone-900">
                {greeting()}
                {name ? <>, <span className="italic text-forest-600">{name}.</span></> : "."}
              </h1>
              <p className="mt-4 text-xl text-stone-500">We&apos;re glad you&apos;re here.</p>
            </motion.div>
            <SundayChip />
          </div>
        </section>

        {/* ---------- Your next step ---------- */}
        <section className="mx-auto max-w-7xl px-5 md:px-8" aria-labelledby="next-step">
          <h2 id="next-step" className="mb-4 text-sm font-medium text-stone-500">Your next step</h2>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8, ease }}>
            {baptismNext ? (
              <NextStepCard
                href="/baptism"
                image="/home/hero-main.jpg"
                tone="forest"
                eyebrow={`${relativeDay(profile.baptism!.date)} · ${profile.baptism!.service} AM`}
                title={profile.baptism!.age === "child" ? `${profile.baptism!.firstName}'s baptism` : "Your baptism"}
                body={`${formatDay(profile.baptism!.date)}. Arrive 30 minutes early and bring a change of clothes.`}
                cta="View details"
                badge="You're registered"
              />
            ) : nextPlan ? (
              <NextStepCard
                href={`/events/${nextPlan.o.id}`}
                image={nextPlan.o.image}
                tone={toneFor(nextPlan.o)}
                eyebrow={nextPlan.date ? `${relativeDay(nextPlan.date)} · ${formatTime(nextPlan.date)}` : nextPlan.item?.meta || nextPlan.o.schedule}
                title={nextPlan.item?.title ?? nextPlan.o.title}
                body={nextPlan.item ? nextPlan.item.location : nextPlan.o.location}
                cta="View details"
                badge={nextPlan.o.actionKind === "join" ? "Request sent" : "You're going"}
              />
            ) : profile.visitPlan ? (
              <NextStepCard
                href="/visit#arrive"
                image={img.venue}
                tone="forest"
                eyebrow={`${relativeDay(profile.visitPlan.date)} · ${profile.visitPlan.service} AM`}
                title="Your first Sunday"
                body="Park in any of our lots and head to the main entrance on Oak St. Our team will be there to say hello."
                cta="See your Sunday guide"
                badge="You're on the list"
              />
            ) : recs[0] ? (
              <NextStepCard
                href={`/events/${recs[0].id}`}
                image={recs[0].image}
                tone={toneFor(recs[0])}
                eyebrow={recs[0].date ? `${relativeDay(recs[0].date)} · ${formatTime(recs[0].date)}` : recs[0].schedule}
                title={recs[0].title}
                body={recs[0].summary}
                cta="View details"
                badge={personalized ? "Recommended" : "A great first step"}
              />
            ) : null}
          </motion.div>
          {!personalized && (
            <div className="mt-4 flex flex-col gap-4 rounded-3xl p-5 ring-1 ring-forest-700/60 bg-forest-50 sm:flex-row sm:items-center sm:justify-between md:p-6">
              <p className="flex items-center gap-3 text-stone-800">
                <Sparkles className="size-5 shrink-0 text-forest-500" /> Tell us a little about you, and we&apos;ll make this page yours.
              </p>
              <Button asChild>
                <Link href="/connect">Personalize <ArrowRight /></Link>
              </Button>
            </div>
          )}
        </section>

        {/* ---------- Explore ---------- */}
        <section className="mx-auto max-w-7xl px-5 pt-20 md:px-8" aria-labelledby="explore">
          <h2 id="explore" className="mb-4 text-sm font-medium text-stone-500">Explore</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { href: "/events?area=groups", label: "Find a Group", sub: "40+ groups across town", icon: Users },
              { href: "/events?area=events", label: "Events", sub: "What's coming up", icon: CalendarDays },
              { href: "/events?area=faith", label: "Grow in Faith", sub: "Classes & studies", icon: BookOpen },
              { href: "/serve", label: "Serve", sub: "Find your team", icon: HandHeart },
            ].map((t, k) => {
              const blue = k === 0;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    "group relative flex aspect-[4/5] flex-col justify-between overflow-hidden p-5 transition duration-300 md:aspect-[4/3] md:p-6",
                    blue ? "rounded-[999px] bg-forest-700 text-ink hover:bg-forest-500 items-center text-center md:rounded-[36px] md:items-start md:text-left" : "rounded-[28px] text-paper ring-2 ring-paper/80 hover:bg-paper/[0.04]",
                  )}
                >
                  <t.icon className={cn("size-6", blue ? "text-ink/70 mt-4 md:mt-0" : "text-stone-500")} strokeWidth={1.5} />
                  <span className={cn("block", !blue ? "pr-14" : "md:pr-14")}>
                    <span className="block font-display text-[26px] leading-none md:text-[34px]">{t.label}</span>
                    <span className={cn("mt-2 block text-sm", blue ? "text-ink/60" : "text-stone-500")}>{t.sub}</span>
                  </span>
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full",
                      blue ? "mb-2 bg-paper text-ink md:absolute md:bottom-6 md:right-6 md:mb-0" : "absolute bottom-5 right-5 bg-forest-700 text-ink md:bottom-6 md:right-6",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/arrow.svg" alt="" width={28} height={28} className="transition duration-500 group-hover:rotate-45" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ---------- Your plans ---------- */}
        <section className="mx-auto max-w-7xl px-5 pt-20 md:px-8" aria-labelledby="plans">
          <div className="mb-4 flex items-end justify-between">
            <h2 id="plans" className="text-sm font-medium text-stone-500">Your plans</h2>
            {plans.length > 0 && <span className="text-sm text-stone-400">{plans.length} saved</span>}
          </div>
          {plans.length === 0 && !profile.visitPlan && !profile.baptism && !profile.kids && !profile.students ? (
            <div className="flex flex-col items-start gap-4 rounded-[28px] border border-dashed border-stone-300 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-stone-400 ring-1 ring-stone-200"><CalendarDays className="size-5" /></span>
                <div>
                  <p className="font-medium text-stone-900">Nothing on the calendar yet</p>
                  <p className="text-sm text-stone-500">When you RSVP or join a group, it&apos;ll show up here.</p>
                </div>
              </div>
              <Button asChild variant="secondary"><Link href="/events?area=events">Browse events</Link></Button>
            </div>
          ) : (
            <ul className="divide-y divide-stone-200/70 overflow-hidden rounded-[28px] bg-white ring-1 ring-stone-200/60">
              {profile.baptism && (
                <PlanRow
                  href="/baptism"
                  date={profile.baptism.date}
                  title={profile.baptism.age === "child" ? `${profile.baptism.firstName}'s baptism` : "Baptism"}
                  meta={`${profile.baptism.service} AM service · Arrive 30 minutes early`}
                  status="Registered"
                />
              )}
              {profile.kids && (
                <PlanRow
                  href="/kids"
                  date={profile.kids.date}
                  title={`Rolla First Kids · ${profile.kids.kids.map((k) => k.firstName).join(" & ")}`}
                  meta={`${profile.kids.service} AM · Kids Welcome desk, downstairs`}
                  status="Pre-registered"
                />
              )}
              {profile.students && (
                <PlanRow
                  href="/students"
                  date={profile.students.date}
                  title={`Students · ${profile.students.students.map((s) => s.firstName).join(" & ")}`}
                  meta="Wednesday 6:30 PM · Youth room upstairs"
                  status="Signed up"
                />
              )}
              {profile.visitPlan && (
                <PlanRow href="/visit" date={profile.visitPlan.date} title="Sunday service" meta={`${profile.visitPlan.service} AM · ${church.address}`} status="Planned" />
              )}
              {plans.map((p) => (
                <PlanRow
                  key={p.rsvp.id}
                  href={`/events/${p.o.id}`}
                  date={p.date}
                  title={p.item?.title ?? p.o.title}
                  meta={p.date ? `${formatTime(p.date)} · ${p.item?.location ?? p.o.location}` : `${p.item?.meta || p.o.schedule}`}
                  status={p.o.actionKind === "join" ? "Requested" : p.o.actionKind === "question" ? "Sent" : "Going"}
                />
              ))}
            </ul>
          )}
        </section>

        {/* ---------- Recommended ---------- */}
        <section className="pt-20" aria-labelledby="recs">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="recs" className="font-display text-4xl text-stone-900 md:text-5xl">Recommended for you</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.interests.length ? (
                    profile.interests.map((id) => (
                      <span key={id} className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", interestTone[id])}>
                        <InterestIcon id={id} className="size-3.5" /> {interestShort[id]}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-stone-500">Popular with first-time guests</span>
                  )}
                </div>
              </div>
              <Button variant="secondary" onClick={() => setInterestsOpen(true)}>
                <SlidersHorizontal /> Update interests
              </Button>
            </div>
          </div>
          <div className="no-scrollbar flex snap-x snap-proximity gap-4 overflow-x-auto overflow-y-hidden scroll-px-5 px-5 pb-4 md:scroll-px-8 md:px-8 xl:px-[max(2rem,calc((100vw-80rem)/2+2rem))] xl:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            <AnimatePresence mode="popLayout" initial={false}>
              {recs.map((o) => (
                <motion.div key={o.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, ease }} className="flex w-[82vw] max-w-[360px] shrink-0 snap-start">
                  <OfferingCard o={o} reason={reasonFor(o, profile.interests, profile.followUps)} className="flex-1" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* ---------- Need anything ---------- */}
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid overflow-hidden rounded-[32px] bg-forest-800 text-paper md:grid-cols-[1fr_1.1fr]">
            <Photo src={img.coffeeCup} alt="" tone="honey" className="min-h-56" />
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3">
                <Avatar name={staffById.amber.name} src={staffById.amber.photo} className="size-12 ring-2 ring-paper/20" />
                <div>
                  <p className="font-medium">Amber Eckelkamp</p>
                  <p className="text-sm text-paper/60">Administrative Assistant</p>
                </div>
              </div>
              <h2 className="mt-8 font-display text-4xl leading-[1.05] md:text-5xl">Need anything? I&apos;m here</h2>
              <p className="mt-4 max-w-md text-paper/70">
                Questions about Sunday, a prayer request, or just want to grab coffee? Send a note to the church office. We usually reply the same day.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="light" size="lg" onClick={() => setContactOpen(true)}><MessageCircle /> Message Amber</Button>
                <Button asChild variant="outlineLight" size="lg">
                  <a href={church.mapsUrl} target="_blank" rel="noreferrer"><MapPin /> Directions</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ContactSheet open={contactOpen} onOpenChange={setContactOpen} />
      <InterestsSheet open={interestsOpen} onOpenChange={setInterestsOpen} />
    </>
  );
}

function SundayChip() {
  const { profile } = useStore();
  const plan = profile.visitPlan;
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-4 pr-6 ring-1 ring-stone-200/70">
      <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-forest-700 text-ink">
        {plan ? (
          <>
            <span className="text-[10px] font-semibold uppercase leading-none tracking-wider text-ink/75">{new Date(plan.date).toLocaleDateString("en-US", { month: "short" })}</span>
            <span className="mt-0.5 font-mori text-xl font-semibold leading-none">{new Date(plan.date).getDate()}</span>
          </>
        ) : (
          <Clock className="size-5" strokeWidth={2} />
        )}
      </span>
      <div className="text-sm">
        <p className="font-medium text-stone-900">{plan ? `Your visit · ${plan.service} AM` : `Sundays at ${church.services.join(" & ")} AM`}</p>
        <p className="text-stone-500">{plan ? formatDay(plan.date) : church.address}</p>
      </div>
    </div>
  );
}

function NextStepCard(p: { href: string; image: string; tone: ReturnType<typeof toneFor>; eyebrow: string; title: string; body: string; cta: string; badge: string }) {
  return (
    <Link href={p.href} className="group relative block overflow-hidden rounded-[32px] bg-forest-900 text-paper">
      <Photo src={p.image} alt="" tone={p.tone} className="absolute inset-0" imgClassName="group-hover:scale-[1.03] opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/85 via-forest-950/50 to-transparent" />
      <div className="relative flex min-h-[380px] flex-col justify-between gap-10 p-7 md:min-h-[420px] md:p-12">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-paper/15 px-3 py-1.5 text-xs font-medium ring-1 ring-paper/20 backdrop-blur-md">
          <Check className="size-3.5 text-forest-500" /> {p.badge}
        </span>
        <div className="max-w-xl">
          <p className="text-sm text-paper/70">{p.eyebrow}</p>
          <h3 className="mt-2 font-display text-5xl leading-[0.98] md:text-7xl">{p.title}</h3>
          <p className="mt-4 max-w-md text-[17px] text-paper/80">{p.body}</p>
          <span className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-forest-700 px-6 font-medium text-ink transition group-hover:bg-forest-500">
            {p.cta} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PlanRow({ href, date, title, meta, status }: { href: string; date?: string; title: string; meta: string; status: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-4 p-4 transition hover:bg-stone-50 md:px-6">
        <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-forest-700 text-ink">
          {date ? (
            <>
              <span className="text-[10px] font-semibold uppercase leading-none tracking-wider text-ink/75">{new Date(date).toLocaleDateString("en-US", { month: "short" })}</span>
              <span className="mt-1 font-mori text-2xl font-semibold leading-none">{new Date(date).getDate()}</span>
            </>
          ) : (
            <Users className="size-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-stone-900">{title}</p>
          <p className="truncate text-sm text-stone-500">{date ? `${formatShortDay(date)} · ` : ""}{meta}</p>
        </div>
        <span className="hidden rounded-full bg-forest-50 px-3 py-1 text-xs font-medium text-forest-700 sm:inline">{status}</span>
        <ArrowRight className="size-4 text-stone-300" />
      </Link>
    </li>
  );
}

function InterestsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { profile, updateProfile } = useStore();
  const toggle = (id: InterestId) =>
    updateProfile({ interests: profile.interests.includes(id) ? profile.interests.filter((x) => x !== id) : [...profile.interests, id] });
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Your interests" hideTitle>
      <div className="px-6 pb-8 pt-8 sm:px-8">
        <h2 className="font-display text-4xl text-stone-900">What are you looking for?</h2>
        <p className="mt-2 text-[15px] text-stone-500">Change these anytime. Your recommendations update instantly.</p>
        <div className="mt-6 space-y-2.5">
          {interestList.map((it) => (
            <ChoiceCard
              key={it.id}
              selected={profile.interests.includes(it.id)}
              onToggle={() => toggle(it.id)}
              icon={<InterestIcon id={it.id} />}
              iconTone={interestTone[it.id]}
              title={it.title}
              body={it.description}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/connect?edit=1" className="text-center text-sm text-stone-500 hover:text-stone-900">Retake the full questionnaire</Link>
          <Button size="lg" onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </div>
    </Sheet>
  );
}
