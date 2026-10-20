"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CalendarHeart, Footprints, MessageCircle, CalendarCheck, Clock, Music, MessageSquareQuote, Navigation, Shirt, ShieldCheck, Smile, Tag, Smartphone, Pencil, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { CampusMap } from "./campus-map";
import { PlanVisitSheet } from "./plan-sheet";
import { Faq, PathCard } from "./new-here";
import { ContactSheet } from "@/components/site/contact-sheet";
import { img } from "@/lib/images";
import { church, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { downloadIcs, formatDay, nextDow } from "@/lib/utils";

const sections = [
  { id: "service", label: "Service times" },
  { id: "sunday", label: "A glimpse of Sunday" },
  { id: "expect", label: "What to expect" },
  { id: "kids", label: "Kids & families" },
  { id: "arrive", label: "Your first Sunday" },
  { id: "faq", label: "Questions" },
];

export function VisitPage() {
  const router = useRouter();
  const [planOpen, setPlanOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { profile, hydrated, updateProfile } = useStore();
  const plan = hydrated ? profile.visitPlan : null;

  return (
    <>
      <SiteHeader />
      <main>
        {/* ---------- Welcome + two paths (from the retired New Here page) ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pb-12 pt-14 md:px-[60px] md:pb-16 md:pt-[63px]">
          <p className="font-mori text-[16px] font-semibold uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]">New here</p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-5xl font-mori text-[clamp(48px,7.2vw,104px)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#dcd2c5] text-balance"
          >
            New here? <span className="font-editorial font-normal italic tracking-[-0.03em] text-[#0285ff]">You&apos;re</span> in the right place.
          </motion.h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600 md:text-xl">
            Whether you&apos;re exploring faith, looking for community, or just checking things out, we&apos;re glad you&apos;re here.
          </p>

          <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2">
            <PathCard
              onClick={() => setPlanOpen(true)}
              eyebrow="Path one"
              title="I'm planning my first visit"
              body="Let us know you're coming. Everything you need to know is below."
              icon={<CalendarHeart className="size-5" />}
              variant="light"
            />
            <PathCard
              onClick={() => {
                updateProfile({ path: "visited" });
                router.push("/connect");
              }}
              eyebrow="Path two"
              title="I've already visited"
              body="Let's help you find your place."
              icon={<Footprints className="size-5" />}
              variant="glass"
            />
          </div>

          <nav aria-label="On this page" className="no-scrollbar -mx-5 mt-12 flex gap-2.5 overflow-x-auto overflow-y-hidden px-5 py-1 md:mx-0 md:flex-wrap md:px-0">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="flex h-11 shrink-0 items-center rounded-full border-2 border-[#dcd2c5]/25 px-5 font-mori text-[15px] font-semibold tracking-[-0.03em] text-[#dcd2c5] transition hover:border-[#0285ff] hover:text-[#0285ff]">
                {s.label}
              </a>
            ))}
          </nav>
        </section>

        {/* ---------- Service information ---------- */}
        <section id="service" className="scroll-mt-24 px-5 md:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-12 [&>*]:min-w-0">
            <Photo src="/home/sanctuary.jpg" alt="The Rolla First sanctuary during Sunday worship, with people standing in the pews under the wood ceiling" tone="forest" className="h-[300px] rounded-[32px] md:h-[460px] lg:col-span-7 lg:h-auto lg:min-h-[460px]" imgClassName="object-[50%_45%]" priority />
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
                <p className="mt-6 border-t border-paper/10 pt-5 text-paper/80">
                  <span className="text-paper">Wednesdays at 6:30 PM</span> · Adults &amp; youth
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
                      downloadIcs({ title: "Sunday at Rolla First", start: nextDow(0, 10, 30).toISOString(), durationMin: 70, location: `${church.address}, ${church.city}`, description: "Services at 9:00 and 10:30. Look for the welcome tent out front." });
                      toast("Calendar invite downloaded", { description: "This Sunday at 10:30 AM." });
                    }}
                  >
                    <CalendarPlus /> Add to calendar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- A glimpse of Sunday ---------- */}
        <section id="sunday" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-24 md:px-8 md:pt-32">
          <div className="grid gap-4 md:grid-cols-12">
            <Reveal className="md:col-span-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/hero-main.jpg" alt="Pastor Lance leading worship" width={427} height={471} className="aspect-[427/471] w-full object-cover" />
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-7">
              <div className="flex h-full flex-col justify-between rounded-[44px] border-4 border-[#dcd2c5] p-7 md:p-10">
                <h2 className="font-mori text-[clamp(40px,4.6vw,64px)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#dcd2c5]">
                  A glimpse of <span className="font-editorial font-normal italic tracking-[-0.03em]">Sunday</span>.
                </h2>
                <ol className="mt-10 space-y-4">
                  {[
                    ["8:30", "Grab a coffee in the gym"],
                    ["9:00", "Music and a warm welcome"],
                    ["9:25", "A message from the Bible that connects to real life"],
                    ["10:10", "Linger and meet someone new. Second service starts at 10:30."],
                  ].map(([t, l]) => (
                    <li key={t} className="flex items-baseline gap-5 border-b border-[#dcd2c5]/15 pb-4 last:border-0 last:pb-0">
                      <span className="w-14 font-mori text-[15px] font-semibold tabular-nums text-[#0285ff]">{t}</span>
                      <span className="text-[17px] text-stone-700">{l}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
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
                <Photo src="/home/kids-worship.jpg" alt="Kids leading worship on stage with hands raised during Kids First" tone="clay" className="aspect-[4/5] rounded-[32px] sm:aspect-[3/2] lg:aspect-[4/5]" imgClassName="object-[50%_55%]" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-soft backdrop-blur sm:right-auto">
                  <Avatar name={staffById.micah.name} src={staffById.micah.photo} />
                  <div className="text-sm">
                    <p className="font-medium text-stone-900">Micah Wells</p>
                    <p className="text-stone-500">Children&apos;s Pastor</p>
                  </div>
                </div>
              </div>
            </Reveal>
            <div>
              <Reveal>
                <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-forest-500">Kids First</p>
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
                <Link href="/kids" className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-forest-500 hover:underline">
                  Everything about Kids First <ArrowRight className="size-4" />
                </Link>
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

        {/* ---------- FAQ ---------- */}
        <section id="faq" className="scroll-mt-24 border-t border-[#dcd2c5]/15">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
            <Reveal className="md:col-span-4">
              <h2 className="font-mori text-[clamp(40px,4.6vw,64px)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#dcd2c5]">
                Good <span className="font-editorial font-normal italic tracking-[-0.03em]">questions</span>.
              </h2>
              <p className="mt-5 max-w-xs text-stone-600">The things most people wonder before their first visit.</p>
              <button onClick={() => setContactOpen(true)} className="mt-8 inline-flex h-[52px] items-center gap-2 rounded-[80px] border-[3px] border-[#0285ff] px-6 font-mori text-[15px] font-semibold uppercase tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black">
                <MessageCircle className="size-4" /> Ask us anything
              </button>
            </Reveal>
            <div className="md:col-span-8">
              <Faq />
            </div>
          </div>
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
                    Totally optional. But if you do, we&apos;ll have name tags ready for the kids and make sure someone&apos;s looking out for you.
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
      <ContactSheet open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
