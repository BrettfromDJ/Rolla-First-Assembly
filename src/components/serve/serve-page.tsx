"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Clock, Mic2, ShieldCheck, Users, X } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RevealGroup, Rise } from "@/components/church/motion";
import { Faq } from "@/components/visit/new-here";
import { staffById } from "@/lib/data";
import { mostNeeded, serveAreas, serveTeams, serveTimeOptions, teamById, type ServeArea, type ServeTeam } from "@/lib/serve";
import { useStore } from "@/lib/store";
import type { ServeSignup, ServeTime } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { ServeSheet } from "./serve-sheet";

const mori = "font-mori font-semibold";
const Ed = ({ children }: { children: React.ReactNode }) => <span className="font-editorial font-normal italic tracking-[-0.03em]">{children}</span>;
const needed = (t: ServeTeam) => t.serving / t.goal < 0.75;

const faqs = [
  { q: "Do I have to be a member to serve?", a: "No. If you call Rolla First home, or you're getting there, you're welcome to serve. Some teams that work with kids and students ask that you've been coming for a few months first." },
  { q: "How much time does it take?", a: "Most teams serve once or twice a month, and you'll still go to the other service. You choose how often when you sign up, and you can change it anytime." },
  { q: "Can I try it before I commit?", a: "Yes, please do. Every team lets you shadow someone for a Sunday first. No pressure to keep going if it's not a fit." },
  { q: "Why do some teams need a background check?", a: "Anyone serving with kids or students completes a free background check and a short training. It's one of the ways we keep every child safe." },
  { q: "Can my teenager serve?", a: "Yes. Teens 13 and up can serve on the Welcome Team and Production, and help in Rolla First Kids alongside an adult. We'll check with a parent first." },
  { q: "What if I sign up for the wrong team?", a: "It happens. Tell your team leader and we'll help you find a better fit. Lots of people try a couple of teams before one clicks." },
];

export function ServePage() {
  const { serve, hydrated } = useStore();
  const [areas, setAreas] = useState<ServeArea[]>([]);
  const [times, setTimes] = useState<ServeTime[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const mine = hydrated ? serve.filter((s) => s.isYou) : [];

  const teams = useMemo(
    () => serveTeams.filter((t) => (!areas.length || areas.includes(t.area)) && (!times.length || t.times.some((x) => times.includes(x)))),
    [areas, times],
  );
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="overflow-x-clip bg-ink text-[#dcd2c5]">
      <SiteHeader />
      <main>
        {/* ---------- Hero ---------- */}
        <section className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-14 md:px-[60px] md:pt-[63px] lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className={cn(mori, "m-load-rise text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>Serve</p>
            <h1 className={cn(mori, "m-title mt-4 text-[clamp(52px,6.4vw,82px)] leading-[0.92] tracking-[-0.05em]")}>
              Find your <Ed>place</Ed> on a team
            </h1>
            <p className="m-load-rise mt-6 max-w-lg text-lg leading-relaxed text-stone-600 md:text-xl" style={{ "--rd": "0.45s" } as React.CSSProperties}>
              Church happens because people show up for each other. Pick a team, try it for a Sunday, and see where you fit.
            </p>
          </div>
          <Rise load delay={0.2} y={20}>
            <div className="relative overflow-hidden m-sheen rounded-[28px] bg-[#0285ff] p-7 text-black md:p-9">
              <Users aria-hidden className="pointer-events-none absolute -right-6 -top-6 size-44 text-black/[0.07]" strokeWidth={1.25} />
              <p className="font-mori text-[15px] font-semibold uppercase tracking-[-0.03em] text-black/60">Most needed right now</p>
              <ul className="mt-5 space-y-3">
                {mostNeeded.map((t) => (
                  <li key={t.id}>
                    <button onClick={() => setOpen(t.id)} className="group flex w-full items-center justify-between gap-4 rounded-[20px] bg-black/10 p-4 text-left transition hover:bg-black/15">
                      <span>
                        <span className={cn(mori, "block text-[22px] leading-none tracking-[-0.04em]")}>{t.name}</span>
                        <span className="mt-1.5 block text-[14px] text-black/65">Needs {t.goal - t.serving} more people</span>
                      </span>
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/home/arrow.svg" alt="" width={24} height={24} className="invert transition duration-500 group-hover:rotate-45" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Rise>
        </section>

        {/* ---------- Your teams ---------- */}
        {mine.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-5 pb-8 md:px-[60px]">
            <h2 className={cn(mori, "text-[clamp(32px,3.6vw,48px)] leading-[0.95] tracking-[-0.05em]")}>
              Your <Ed>teams</Ed>
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {mine.map((s) => (
                <MySignup key={s.id} s={s} />
              ))}
            </ul>
          </section>
        )}

        {/* ---------- Find a fit + teams ---------- */}
        <section id="teams" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 pt-16 md:px-[60px] md:pt-24">
          <Rise>
            <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
              What sounds <Ed>fun</Ed>?
            </h2>
            <p className="mt-3 max-w-md text-[17px] text-stone-500">Pick anything that fits. We&apos;ll show the teams that match.</p>
          </Rise>
          <div className="mt-8 space-y-4">
            <ChipRow label="I'd enjoy">
              {serveAreas.map((a) => (
                <Chip key={a.id} on={areas.includes(a.id)} onClick={() => setAreas(toggle(areas, a.id))}>{a.label}</Chip>
              ))}
            </ChipRow>
            <ChipRow label="I'm free">
              {serveTimeOptions.map((t) => (
                <Chip key={t.id} on={times.includes(t.id)} onClick={() => setTimes(toggle(times, t.id))}>{t.label}</Chip>
              ))}
            </ChipRow>
            {(areas.length > 0 || times.length > 0) && (
              <button onClick={() => { setAreas([]); setTimes([]); }} className="inline-flex items-center gap-1.5 text-[14px] text-stone-500 hover:text-[#dcd2c5]">
                <X className="size-4" /> Show all teams
              </button>
            )}
          </div>

          <p className="mt-10 text-[14px] text-stone-500">
            {teams.length === serveTeams.length ? `${teams.length} teams` : `${teams.length} team${teams.length === 1 ? "" : "s"} match`}
          </p>
          {teams.length === 0 ? (
            <div className="mt-4 rounded-[28px] border-2 border-dashed border-[#dcd2c5]/20 px-6 py-16 text-center">
              <p className={cn(mori, "text-[22px] tracking-[-0.03em]")}>No team matches all of that.</p>
              <p className="mt-2 text-stone-500">Try fewer choices, or email the church office and we&apos;ll help you find a fit.</p>
            </div>
          ) : (
            <RevealGroup as="ul" className="mt-4 grid gap-4 md:grid-cols-2">
              {teams.map((t) => (
                <TeamCard key={t.id} t={t} joined={mine.some((m) => m.teamId === t.id)} onOpen={() => setOpen(t.id)} />
              ))}
            </RevealGroup>
          )}
        </section>

        {/* ---------- How it works ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <Rise>
              <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
                How it <Ed>works</Ed>
              </h2>
              <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-stone-600">No experience needed. Every team trains you and pairs you with someone who&apos;s done it before.</p>
            </Rise>
            <Rise>
              <ol className="border-t border-[#dcd2c5]/15">
                {[
                  { t: "Sign up", b: "Pick a team and tell us when you're free. It takes about a minute." },
                  { t: "Meet your team leader", b: "They'll reach out within a week to say hi, answer questions, and find a Sunday that works." },
                  { t: "Shadow a Sunday", b: "Serve alongside someone experienced. Teams with kids and students also do a free background check and a short training." },
                  { t: "Join the schedule", b: "Serve as often as you said you'd like. Swap or take a break anytime." },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-6 border-b border-[#dcd2c5]/15 py-7 md:gap-10 md:py-9">
                    <span className={cn(mori, "w-12 shrink-0 text-[42px] leading-none tracking-[-0.05em] text-[#0285ff]")}>{i + 1}</span>
                    <div>
                      <h3 className={cn(mori, "text-[26px] leading-[1.05] tracking-[-0.03em]")}>{s.t}</h3>
                      <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-stone-600">{s.b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Rise>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-[60px] md:py-32">
          <div className="grid gap-12 md:grid-cols-12">
            <Rise className="md:col-span-4">
              <h2 className={cn(mori, "text-[clamp(40px,4.6vw,64px)] leading-[0.95] tracking-[-0.05em]")}>
                Good <Ed>questions</Ed>
              </h2>
              <p className="mt-5 max-w-xs text-[15px] text-stone-600">Not sure which team? Email the church office and we&apos;ll help you find one.</p>
            </Rise>
            <div className="md:col-span-8">
              <Faq items={faqs} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ServeSheet teamId={open} onOpenChange={(o) => !o && setOpen(null)} />
    </div>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <p className="w-20 shrink-0 font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn("h-11 rounded-full border-2 px-5 text-[15px] transition", on ? "border-[#0285ff] bg-[#0285ff] text-black" : "border-[#dcd2c5]/25 hover:border-[#dcd2c5]/60")}
    >
      {children}
    </button>
  );
}

function TeamCard({ t, joined, onOpen }: { t: ServeTeam; joined: boolean; onOpen: () => void }) {
  const leaders = [staffById[t.leaderId], ...(t.coLeaderId ? [staffById[t.coLeaderId]] : [])];
  return (
    <li>
      <button onClick={onOpen} className={cn("m-lift group flex h-full w-full flex-col justify-between gap-8 rounded-[28px] border-2 p-7 text-left transition hover:border-[#0285ff]", joined ? "border-[#0285ff]" : "border-[#dcd2c5]/80")}>
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">{serveAreas.find((a) => a.id === t.area)!.label}</p>
            {joined ? (
              <span className={cn(mori, "rounded-full bg-[#0285ff] px-3 py-1 text-[12px] uppercase tracking-[-0.02em] text-black")}>Signed up</span>
            ) : (
              needed(t) && <span className={cn(mori, "rounded-full border-2 border-[#0285ff] px-3 py-0.5 text-[12px] uppercase tracking-[-0.02em] text-[#0285ff]")}>We need you</span>
            )}
          </div>
          <h3 className={cn(mori, "mt-4 text-[32px] leading-[1] tracking-[-0.04em]")}>{t.name}</h3>
          <p className="mt-3 text-[16px] leading-relaxed text-stone-600">{t.tagline}</p>
          <ul className="mt-5 space-y-2 text-[14px] text-stone-500">
            <li className="flex gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-[#0285ff]" />{t.when}</li>
            {t.commitment && <li className="flex gap-2.5"><BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#0285ff]" />{t.commitment}</li>}
          </ul>
          {(t.backgroundCheck || t.audition || (t.minAge ?? 18) < 18) && (
            <div className="mt-5 flex flex-wrap gap-2 text-[12px]">
              {t.backgroundCheck && <span className="inline-flex items-center gap-1 rounded-full bg-[#dcd2c5]/[0.07] px-2.5 py-1"><ShieldCheck className="size-3.5" /> Background check</span>}
              {t.audition && <span className="inline-flex items-center gap-1 rounded-full bg-[#dcd2c5]/[0.07] px-2.5 py-1"><Mic2 className="size-3.5" /> Audition</span>}
              {(t.minAge ?? 18) < 18 && <span className="rounded-full bg-[#dcd2c5]/[0.07] px-2.5 py-1">Ages {t.minAge}+</span>}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-2.5 text-[14px] text-stone-500">
            <span className="flex shrink-0 -space-x-2">
              {leaders.map((l) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={l.id} src={l.photo} alt="" width={32} height={32} className="size-8 rounded-full object-cover object-top ring-2 ring-ink" />
              ))}
            </span>
            <span className="truncate">Led by {leaders.map((l) => l.name).join(" & ")}</span>
          </span>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0285ff]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/arrow.svg" alt="" width={28} height={28} className="transition duration-500 group-hover:rotate-45" />
          </span>
        </div>
      </button>
    </li>
  );
}

function MySignup({ s }: { s: ServeSignup }) {
  const { cancelMyServe } = useStore();
  const t = teamById[s.teamId];
  const leader = staffById[t.leaderId];
  const status = {
    new: `${leader.name.split(" ")[0]} will reach out soon`,
    contacted: `You've talked with ${leader.name.split(" ")[0]}`,
    shadowing: s.shadowDate ? `Shadowing on ${new Date(`${s.shadowDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}` : "Shadowing soon",
    serving: "You're on the team",
    "not-now": "On hold for now",
  }[s.status];
  return (
    <li className="flex flex-col justify-between gap-5 rounded-[28px] border-2 border-[#0285ff] p-6">
      <div>
        <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Signed up {timeAgo(s.createdAt).toLowerCase()}</p>
        <p className={cn(mori, "mt-2 text-[28px] leading-none tracking-[-0.04em]")}>{t.name}</p>
        <p className="mt-2 text-[15px] text-[#0285ff]">{status}</p>
        {s.roles.length > 0 && <p className="mt-1 text-[14px] text-stone-500">{s.roles.join(", ")}</p>}
      </div>
      <button
        onClick={() => {
          cancelMyServe(s.id);
          toast("Sign-up canceled", { description: "No problem. You can sign up again anytime." });
        }}
        className="inline-flex w-fit items-center gap-1.5 text-[14px] text-stone-500 hover:text-[#dcd2c5]"
      >
        <X className="size-4" /> Cancel sign-up
      </button>
    </li>
  );
}
