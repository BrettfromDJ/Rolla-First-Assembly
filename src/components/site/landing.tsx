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
        <section className="relative flex min-h-[100svh] flex-col bg-forest-900 text-paper">
          <Photo src={img.heroFriends} alt="Friends laughing together outdoors" className="absolute inset-0" tone="forest" priority imgClassName="scale-[1.02]" />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_24_17/0.55)_0%,rgb(10_24_17/0.15)_35%,rgb(10_24_17/0.55)_65%,rgb(10_24_17/0.92)_100%)]" />

          <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-8 pt-28 md:px-8 md:pb-12">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-paper/10 px-3 py-1.5 text-[13px] text-paper/90 ring-1 ring-paper/15 backdrop-blur-md"
            >
              <span className="size-1.5 rounded-full bg-honey" /> Sundays at 9 &amp; 11 · Rolla, MO
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.05 }}
              className="max-w-5xl font-display text-[clamp(3.25rem,9vw,8.5rem)] leading-[0.92] tracking-[-0.025em] text-balance"
            >
              New here? <span className="italic text-paper/75">You&apos;re in the right place.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-paper/80 md:text-xl"
            >
              Whether you&apos;re exploring faith, looking for community, or just checking things out, we&apos;re glad you&apos;re here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.35 }}
              className="mt-10 grid gap-3 md:mt-14 md:grid-cols-2 md:gap-4"
            >
              <PathCard
                onClick={() => choose("planning")}
                eyebrow="Path one"
                title="I'm planning my first visit"
                body="Everything you need to know before Sunday."
                icon={<CalendarHeart className="size-5" />}
                variant="light"
              />
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
        <section className="bg-paper-2/60">
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
                        <span className="w-12 font-mono text-sm tabular-nums text-honey">{t}</span>
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
            <div className="mx-auto flex max-w-7xl flex-col gap-10 overflow-hidden rounded-[36px] bg-honey-soft p-8 md:flex-row md:items-center md:justify-between md:p-16">
              <div className="flex items-start gap-5">
                <Avatar name={staffById.jamie.name} src={staffById.jamie.photo} className="size-16 ring-4 ring-white md:size-20" />
                <div>
                  <h2 className="font-display text-4xl leading-tight text-stone-900 md:text-5xl">Still wondering about something?</h2>
                  <p className="mt-3 max-w-md text-[17px] text-stone-700">Jamie leads our welcome team and would love to help. Send a note. A real person will reply.</p>
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
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between gap-6 overflow-hidden rounded-[28px] p-6 text-left transition duration-300 md:p-8",
        variant === "light"
          ? "bg-paper text-stone-900 hover:bg-white"
          : "bg-paper/10 text-paper ring-1 ring-paper/20 backdrop-blur-xl hover:bg-paper/15",
      )}
    >
      <div className="flex items-start gap-5">
        <span
          className={cn(
            "mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl",
            variant === "light" ? "bg-forest-700 text-paper" : "bg-paper/15 text-honey",
          )}
        >
          {icon}
        </span>
        <div>
          <span className={cn("text-xs uppercase tracking-[0.14em]", variant === "light" ? "text-stone-400" : "text-paper/50")}>{eyebrow}</span>
          <h2 className="mt-1 font-display text-[28px] leading-[1.05] md:text-[34px]">{title}</h2>
          <p className={cn("mt-2 text-[15px]", variant === "light" ? "text-stone-600" : "text-paper/70")}>{body}</p>
        </div>
      </div>
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full transition duration-300 group-hover:translate-x-1",
          variant === "light" ? "bg-stone-900/5 group-hover:bg-forest-700 group-hover:text-paper" : "bg-paper/10 group-hover:bg-paper group-hover:text-forest-900",
        )}
      >
        <ArrowUpRight className="size-5 transition group-hover:rotate-45" />
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
