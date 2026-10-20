"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, CalendarHeart, Footprints, Plus, MessageCircle } from "lucide-react";
import { SiteHeader } from "./header";
import { SiteFooter } from "./footer";
import { ContactSheet } from "./contact-sheet";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { img } from "@/lib/images";
import { faqs, staff, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function Landing() {
  const router = useRouter();
  const { updateProfile } = useStore();
  const [contactOpen, setContactOpen] = useState(false);

  const choose = (path: "planning" | "visited") => {
    updateProfile({ path });
    router.push(path === "planning" ? "/visit" : "/connect");
  };

  return (
    <>
      <SiteHeader overlay />
      <main>
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden pt-24 md:pt-28">
          <h1 className="sr-only">New here? You&apos;re in the right place.</h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="eyebrow relative z-10 mx-auto flex w-fit items-center gap-2 text-stone-500"
          >
            <span className="size-1.5 rounded-full bg-forest-600" /> Sundays at 9 &amp; 11 · Rolla, MO
          </motion.p>

          {/* Oval photo with giant headlines drifting across it */}
          <div className="relative mt-6 flex h-[min(78svh,760px)] min-h-[440px] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease }}
              className="absolute h-full w-[min(78vw,560px)]"
            >
              <Photo
                src={img.heroFriends}
                alt="Friends laughing together"
                tone="forest"
                priority
                className="h-full w-full rounded-[50%]"
                imgClassName="grayscale contrast-[1.15] brightness-90"
              >
                <div aria-hidden className="absolute inset-0 bg-forest-700/25 mix-blend-color" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/50" />
              </Photo>
            </motion.div>

            <div aria-hidden className="pointer-events-none relative z-10 w-full select-none space-y-1 md:space-y-3">
              <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease, delay: 0.15 }} className="-rotate-[3deg]">
                <Marquee className="text-paper">
                  New here? <em>You&apos;re</em> in the right place.
                </Marquee>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease, delay: 0.3 }} className="-rotate-[3deg]">
                <Marquee className="text-forest-600" reverse>
                  There&apos;s a place <em>for you</em> here.
                </Marquee>
              </motion.div>
            </div>
          </div>

          <div className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 pt-12 md:grid-cols-12 md:px-8 md:pb-24 md:pt-16">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.4 }}
              className="text-xl leading-snug text-stone-700 md:col-span-4 md:pr-6 md:text-2xl"
            >
              Whether you&apos;re exploring faith, looking for community, or just checking things out, <span className="font-serif italic text-paper">we&apos;re glad you&apos;re here.</span>
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.5 }} className="md:col-span-4">
              <PathCard
                onClick={() => choose("planning")}
                eyebrow="Path one"
                title="I'm planning my first visit"
                body="Everything you need to know before Sunday."
                icon={<CalendarHeart className="size-5" />}
                variant="light"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.6 }} className="md:col-span-4">
              <PathCard
                onClick={() => choose("visited")}
                eyebrow="Path two"
                title="I've already visited"
                body="Let's help you find your place."
                icon={<Footprints className="size-5" />}
                variant="glass"
              />
            </motion.div>
          </div>
        </section>

        {/* ---------- Intro ---------- */}
        <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
          <div className="grid gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-3">
              <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-forest-500">Hello, neighbor</p>
            </Reveal>
            <div className="md:col-span-9">
              <Reveal>
                <p className="font-display text-[clamp(2.1rem,4.6vw,4rem)] leading-[1.05] tracking-[-0.015em] text-stone-900 text-balance">
                  We&apos;re a church for people who are still figuring it out. <span className="text-stone-400">Which, honestly, is all of us.</span>
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mt-12 grid gap-8 text-[17px] leading-relaxed text-stone-600 sm:grid-cols-2">
                  <p>Gather started in 2011 with twelve friends in a living room. Today we&apos;re a few hundred people in an old feed mill on Larkspur Lane: students, retirees, young families, and everyone in between.</p>
                  <p>You don&apos;t need to know the songs, own a Bible, or have it all together. Come as you are. Ask the hard questions. Stay for coffee.</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- A glimpse of Sunday ---------- */}
        <section className="bg-ink-2">
          <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
            <Reveal>
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <h2 className="max-w-xl font-display text-5xl leading-[1] tracking-[-0.02em] text-stone-900 md:text-7xl">
                  A glimpse of Sunday.
                </h2>
                <p className="max-w-sm text-[17px] text-stone-600">About 70 minutes. Good music, an honest message, and people who are happy you came.</p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-4 md:grid-cols-12 md:grid-rows-[280px_280px]">
              <Reveal className="md:col-span-7 md:row-span-2">
                <Photo src={img.music} alt="People singing together at a gathering" tone="forest" className="h-[420px] rounded-[28px] md:h-full">
                  <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-20 text-paper md:p-8">
                    <span className="text-[13px] text-paper/70">9:00 &amp; 11:00</span>
                    <p className="mt-1 font-display text-3xl">We sing together.</p>
                  </figcaption>
                </Photo>
              </Reveal>
              <Reveal delay={0.1} className="md:col-span-5">
                <Photo src={img.cafe} alt="A warm café counter" tone="honey" className="h-[280px] rounded-[28px]">
                  <figcaption className="absolute bottom-5 left-5 rounded-full bg-paper px-4 py-2 text-sm font-medium text-stone-900 shadow-soft">
                    Coffee&apos;s on from 8:30
                  </figcaption>
                </Photo>
              </Reveal>
              <Reveal delay={0.15} className="md:col-span-5">
                <div className="flex h-full flex-col justify-between rounded-[28px] bg-forest-800 p-7 text-paper md:p-8">
                  <ol className="space-y-4">
                    {[
                      ["8:30", "Grab a coffee in the lobby"],
                      ["9:00", "Music and a warm welcome"],
                      ["9:25", "A talk worth thinking about"],
                      ["10:10", "Linger, meet someone new"],
                    ].map(([t, l]) => (
                      <li key={t} className="flex items-baseline gap-5 border-b border-paper/10 pb-4 last:border-0 last:pb-0">
                        <span className="w-12 font-mono text-sm tabular-nums text-forest-500">{t}</span>
                        <span className="text-[17px]">{l}</span>
                      </li>
                    ))}
                  </ol>
                  <Link href="/visit" className="mt-6 inline-flex items-center gap-2 text-sm text-paper/70 hover:text-paper">
                    See the full Sunday guide <ArrowRight className="size-4" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- Community ---------- */}
        <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
          <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
            <Reveal>
              <div className="relative">
                <Photo src={img.dinner} alt="Friends sharing dinner around a table" tone="clay" className="aspect-[4/5] rounded-[32px]" />
                <div className="absolute -bottom-8 -right-2 w-64 rounded-3xl bg-white p-5 shadow-lift md:-right-10">
                  <p className="text-[15px] leading-snug text-stone-800">&ldquo;I came for one Sunday. Two years later, these are the people I call when my car breaks down.&rdquo;</p>
                  <p className="mt-3 text-xs text-stone-500">Hannah · Trail &amp; Table group</p>
                </div>
              </div>
            </Reveal>
            <div>
              <Reveal>
                <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-forest-500">Our community</p>
                <h2 className="mt-5 font-display text-5xl leading-[1] tracking-[-0.02em] text-stone-900 md:text-6xl">
                  Find your people. <br />They&apos;re probably here.
                </h2>
                <p className="mt-6 max-w-md text-[17px] leading-relaxed text-stone-600">
                  Over 40 small groups meet across Rolla every week, around dinner tables, on hiking trails, and in coffee shops. There&apos;s a place at the table for you.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mt-10 flex flex-wrap gap-2">
                  {["Twenties & Thirties", "Parents of Littles", "Trail & Table", "Wednesday Word", "Food Pantry Crew", "Students"].map((g) => (
                    <span key={g} className="rounded-full bg-white px-4 py-2 text-sm text-stone-700 ring-1 ring-stone-200">{g}</span>
                  ))}
                </div>
                <div className="mt-10 flex items-center gap-4">
                  <AvatarStack people={staff.slice(0, 6)} />
                  <p className="text-sm text-stone-500">Meet the team who&apos;ll say hello</p>
                </div>
                <Button asChild size="lg" className="mt-10">
                  <Link href="/connect">Find your people <ArrowRight /></Link>
                </Button>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="border-t border-stone-200/70">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
            <Reveal className="md:col-span-4">
              <h2 className="font-display text-5xl leading-[1] tracking-[-0.02em] text-stone-900">Good questions.</h2>
              <p className="mt-5 max-w-xs text-stone-600">The things most people wonder before their first visit.</p>
            </Reveal>
            <div className="md:col-span-8">
              <Faq />
            </div>
          </div>
        </section>

        {/* ---------- Contact ---------- */}
        <section className="px-5 pb-24 md:px-8 md:pb-32">
          <Reveal>
            <div className="mx-auto flex max-w-7xl flex-col gap-10 overflow-hidden rounded-[36px] p-8 ring-2 ring-paper/85 md:flex-row md:items-center md:justify-between md:p-16">
              <div className="flex items-start gap-5">
                <Avatar name={staffById.jamie.name} src={staffById.jamie.photo} className="size-16 ring-4 ring-forest-700 md:size-20" />
                <div>
                  <h2 className="font-display text-4xl leading-tight text-stone-900 md:text-5xl">Still wondering about something?</h2>
                  <p className="mt-3 max-w-md text-[17px] text-stone-600">Jamie leads our welcome team and would love to help. Send a note. A real person will reply.</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => setContactOpen(true)}>
                  <MessageCircle /> Ask Jamie a question
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/visit">Plan a visit</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
      <ContactSheet open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}

function Marquee({ children, className, reverse }: { children: React.ReactNode; className?: string; reverse?: boolean }) {
  const line = (
    <span className="flex shrink-0 items-center gap-[0.4em] pr-[0.4em]">
      {children}
      <span className="inline-block size-[0.18em] rounded-full bg-current opacity-60" />
    </span>
  );
  return (
    <div className="overflow-hidden">
      <div className={cn("flex w-max whitespace-nowrap font-display text-[clamp(3.5rem,11vw,10.5rem)] leading-[1.02]", reverse ? "marquee-reverse" : "marquee", className)}>
        {line}
        {line}
        {line}
        {line}
      </div>
    </div>
  );
}

function PathCard({
  onClick,
  eyebrow,
  title,
  body,
  icon,
  variant,
}: {
  onClick: () => void;
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  variant: "light" | "glass";
}) {
  const blue = variant === "light";
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex h-full min-h-64 w-full flex-col justify-between gap-10 overflow-hidden p-7 text-left transition duration-300 md:min-h-80 md:p-8",
        blue
          ? "rounded-[44px] bg-forest-700 text-ink hover:bg-forest-500 md:rounded-[999px] md:items-center md:px-10 md:py-12 md:text-center"
          : "rounded-[28px] text-paper ring-2 ring-paper/85 hover:bg-paper/[0.04]",
      )}
    >
      <span className={cn("flex items-center gap-2", blue && "md:flex-col")}>
        <span className={cn("flex size-10 items-center justify-center rounded-full", blue ? "bg-ink/10" : "bg-paper/10 text-forest-500")}>{icon}</span>
        <span className={cn("eyebrow", blue ? "text-ink/60" : "text-stone-500")}>{eyebrow}</span>
      </span>
      <span className={cn("block", blue && "md:flex md:flex-col md:items-center")}>
        <span className={cn("block font-display text-[34px] leading-[0.98] md:text-[40px]", !blue && "pr-16")}>{title}</span>
        <span className={cn("mt-3 block text-[15px]", blue ? "text-ink/70" : "text-stone-500")}>{body}</span>
        <span
          className={cn(
            "mt-7 flex size-14 items-center justify-center rounded-full transition duration-300 group-hover:rotate-45",
            blue ? "bg-paper text-ink" : "bg-forest-700 text-ink",
            !blue && "absolute bottom-7 right-7 mt-0 md:bottom-8 md:right-8",
          )}
        >
          <ArrowUpRight className="size-6" strokeWidth={1.5} />
        </span>
      </span>
    </button>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-stone-200 border-y border-stone-200">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q}>
            <h3>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium text-stone-900 md:text-xl"
              >
                {f.q}
                <Plus className={cn("size-5 shrink-0 text-stone-400 transition duration-300", isOpen && "rotate-45 text-forest-600")} />
              </button>
            </h3>
            <motion.div
              id={`faq-${i}`}
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <p className="max-w-2xl pb-6 text-[17px] leading-relaxed text-stone-600">{f.a}</p>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
