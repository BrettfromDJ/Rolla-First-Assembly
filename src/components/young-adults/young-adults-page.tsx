"use client";

import { BadgeCheck, CalendarClock, Mail, Users } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RevealGroup, Rise } from "@/components/church/motion";
import { Faq } from "@/components/visit/new-here";
import { staffById } from "@/lib/data";
import { cn } from "@/lib/utils";

const mori = "font-mori font-semibold";
const Ed = ({ children }: { children: React.ReactNode }) => <span className="font-editorial font-normal italic tracking-[-0.03em]">{children}</span>;

/** Gatherings for 18–29. Fill in days and times once the schedule is set; empty entries show "Schedule coming soon". */
const gatherings: { name: string; who: string; when?: string; where?: string; blurb: string }[] = [
  { name: "Chi Alpha", who: "On campus at Missouri S&T", blurb: "A campus ministry for college students at Missouri S&T: worship, Bible study, and a community that feels like home while you're away from home." },
  { name: "Young Adults", who: "At Rolla First", blurb: "For anyone 18 to 29, in school, working, or figuring it out. Real friends, honest conversations about faith and life, and a place to belong." },
];

const faqs = [
  { q: "Do I have to be a student?", a: "No. Chi Alpha and Young Adults are open to everyone 18 to 29, whether you're at Missouri S&T, working, in the military, or somewhere in between." },
  { q: "I don't know anyone. Is that weird?", a: "Not at all. Most people show up knowing no one. Reach out to Pastor Gannon before you come and he'll make sure someone is looking for you." },
  { q: "What if I'm new to faith, or just curious?", a: "You're welcome exactly as you are. Bring your questions. Nobody expects you to have it all figured out." },
  { q: "How do I find out what's happening this week?", a: "Email Pastor Gannon and he'll get you connected with what's coming up and the group chat." },
];

export function YoungAdultsPage() {
  const gannon = staffById.gannon;
  return (
    <div className="overflow-x-clip bg-ink text-[#dcd2c5]">
      <SiteHeader />
      <main>
        {/* ---------- Hero ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-14 md:px-[60px] md:pt-[63px]">
          <p className={cn(mori, "m-load-rise text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>Chi Alpha &amp; Young Adults · Ages 18–29</p>
          <h1 className={cn(mori, "m-title mt-4 max-w-[1100px] text-[clamp(52px,6.4vw,82px)] leading-[0.92] tracking-[-0.05em]")}>
            Find your people <Ed>here</Ed>
          </h1>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-6 px-5 md:px-[60px] lg:grid-cols-[1.35fr_1fr]">
          <Rise load delay={0.1} y={20}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/chi-alpha.jpg" alt="A smiling young adult giving a thumbs up next to the Chi Alpha campus ministry banner" width={1365} height={2048} className="aspect-[4/3] h-full w-full rounded-[28px] object-cover object-[50%_30%] lg:aspect-[5/4]" />
          </Rise>
          <Rise load delay={0.2} y={20}>
            <div className="relative flex h-full flex-col justify-between overflow-hidden m-sheen rounded-[28px] bg-[#0285ff] p-7 text-black md:p-9">
              <Users aria-hidden className="pointer-events-none absolute -right-6 -top-6 size-44 text-black/[0.07]" strokeWidth={1.25} />
              <div>
                <p className="font-mori text-[15px] font-semibold uppercase tracking-[-0.03em] text-black/60">For anyone</p>
                <p className={cn(mori, "mt-3 text-[clamp(48px,5.6vw,80px)] leading-[0.9] tracking-[-0.05em]")}>18 – 29</p>
                <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-black/75">You don&apos;t have to be a student. College, career, military, or still figuring it out: you&apos;re welcome here.</p>
                <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5 font-medium"><CalendarClock className="size-3.5" /> Schedule coming soon</span>
                </div>
              </div>
              <div className="mt-8 border-t border-black/15 pt-6">
                <a href={`mailto:${gannon.email}?subject=${encodeURIComponent("Young Adults / Chi Alpha")}`} className={cn(mori, "group flex h-[67px] w-full items-center justify-between rounded-[80px] bg-[#dcd2c5] pl-8 pr-2 text-[16px] uppercase tracking-[-0.05em] transition hover:bg-[#f5f0e9]")}>
                  Get connected
                  <span className="flex size-[51px] shrink-0 items-center justify-center rounded-full bg-[#0285ff]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/arrow.svg" alt="" width={30} height={30} className="transition duration-500 group-hover:rotate-45" />
                  </span>
                </a>
              </div>
            </div>
          </Rise>
        </section>

        {/* ---------- Gatherings ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
              Two ways to <Ed>connect</Ed>
            </h2>
          </Rise>
          <RevealGroup as="ul" className="mt-10 grid gap-4 md:grid-cols-2">
            {gatherings.map((g) => (
              <li key={g.name} className="flex flex-col justify-between gap-10 rounded-[28px] border-2 border-[#dcd2c5]/80 p-7 md:p-9">
                <div>
                  <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">{g.who}</p>
                  <p className={cn(mori, "mt-2 text-[clamp(40px,4vw,56px)] leading-none tracking-[-0.05em]")}>{g.name}</p>
                  <p className="mt-4 max-w-md text-[16px] leading-relaxed text-stone-600">{g.blurb}</p>
                </div>
                <p className="flex items-center gap-2 text-[15px] text-[#0285ff]">
                  <CalendarClock className="size-4" /> {g.when ? `${g.when}${g.where ? ` · ${g.where}` : ""}` : "Schedule coming soon"}
                </p>
              </li>
            ))}
          </RevealGroup>
          <Rise>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[15px] text-stone-600">
              {["Ages 18 to 29", "Students and non-students welcome", "No sign-up needed"].map((t) => (
                <li key={t} className="flex items-center gap-2"><BadgeCheck className="size-4 text-[#0285ff]" strokeWidth={1.75} />{t}</li>
              ))}
            </ul>
          </Rise>
        </section>

        {/* ---------- Pastor Gannon ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <div className="grid items-center gap-8 rounded-[28px] border-2 border-[#dcd2c5]/80 p-6 md:grid-cols-[280px_1fr] md:gap-12 md:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gannon.photo} alt={gannon.name} className="aspect-[4/5] w-full max-w-[280px] rounded-[20px] object-cover object-top" />
              <div>
                <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Your point of contact</p>
                <h2 className={cn(mori, "mt-3 text-[clamp(40px,4.6vw,64px)] leading-[0.95] tracking-[-0.05em]")}>{gannon.name}</h2>
                <p className="mt-2 text-[16px] text-[#0285ff]">{gannon.role}</p>
                <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-stone-600">
                  New to Rolla, new to church, or just looking for friends who get it? Send Gannon a note. He&apos;ll tell you what&apos;s happening this week and make sure you don&apos;t walk in alone.
                </p>
                <a href={`mailto:${gannon.email}?subject=${encodeURIComponent("Young Adults / Chi Alpha")}`} className={cn(mori, "mt-6 inline-flex h-[52px] items-center gap-2 rounded-[80px] border-[3px] border-[#0285ff] px-6 text-[15px] uppercase tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black")}>
                  <Mail className="size-4" /> Email Pastor Gannon
                </a>
              </div>
            </div>
          </Rise>
        </section>

        {/* ---------- Questions ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-[60px] md:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <Rise>
              <h2 className={cn(mori, "text-[clamp(40px,4.6vw,64px)] leading-[0.95] tracking-[-0.05em]")}>
                Good <Ed>questions</Ed>
              </h2>
            </Rise>
            <Rise>
              <Faq items={faqs} />
            </Rise>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
