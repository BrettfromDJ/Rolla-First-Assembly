"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Baby, BadgeCheck, CalendarPlus, Droplets, HeartHandshake, Mail, MapPin, Pencil, ShieldCheck, Smartphone, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RevealGroup, Rise } from "@/components/church/motion";
import { Faq } from "@/components/visit/new-here";
import { KidsSheet } from "./register-sheet";
import { church, getOffering, kidGradeLabel, kidsGroups, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, downloadIcs, formatDay, formatTime } from "@/lib/utils";

const mori = "font-mori font-semibold";
const Ed = ({ children }: { children: React.ReactNode }) => <span className="font-editorial font-normal italic tracking-[-0.03em]">{children}</span>;

const faqs = [
  { q: "Do I have to pre-register?", a: "No. You can check in at the blue Kids Welcome desk on Sunday morning. Pre-registering just means we'll have name tags ready and your first check-in is even faster." },
  { q: "Where do I drop off my kids?", a: "The kids area is downstairs, right below the auditorium. Follow the blue signs from the main entrance, or ask anyone in a Rolla First shirt and they'll walk you there." },
  { q: "How do you keep my child safe?", a: "Every volunteer is background-checked and trained, and they always serve in pairs. Kids' rooms have secure entry, and only the adult with the matching security tag can pick up your child." },
  { q: "My child has allergies. What should I do?", a: "Let us know when you pre-register or at check-in. Allergies print right on your child's name tag, and leaders check them before any snack is served." },
  { q: "What if my child has a hard time separating?", a: "That's completely normal. You're welcome to stay in the room for a few minutes, or the whole time on your first Sunday. If your child needs you during the service, we'll text you right away." },
  { q: "What about middle and high school students?", a: "Students in 6th–12th grade sit with their families on Sunday mornings. On Wednesday nights at 6:30 PM they have their own night in the youth room upstairs, led by Pastor Gannon." },
];

export function KidsPage() {
  const { profile, hydrated, cancelKids } = useStore();
  const [sheet, setSheet] = useState(false);
  const reg = hydrated ? profile.kids : null;
  const micah = staffById.micah;
  const team = ["micah", "pam", "debbie"].map((id) => staffById[id]);
  const familyEvents = useMemo(() => (hydrated ? (getOffering("family-events")?.items ?? []) : []), [hydrated]);
  const names = reg?.kids.map((k) => k.firstName).join(" & ");

  return (
    <div className="overflow-x-clip bg-ink text-[#dcd2c5]">
      <SiteHeader />
      <main>
        {/* ---------- Hero ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-14 md:px-[60px] md:pt-[63px]">
          <p className={cn(mori, "m-load-rise text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>Kids First</p>
          <h1 className={cn(mori, "m-title mt-4 max-w-[1100px] text-[clamp(52px,8vw,124px)] leading-[0.92] tracking-[-0.05em]")}>
            Kids are the best part of <Ed>Sunday</Ed>
          </h1>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-6 px-5 md:px-[60px] lg:grid-cols-[1.35fr_1fr]">
          <Rise load delay={0.1} y={20}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/home/kids-worship.jpg"
              alt="Kids leading worship on stage with hands raised during Kids First"
              width={2000}
              height={1333}
              className="aspect-[4/3] h-full w-full rounded-[28px] object-cover object-[50%_55%] lg:aspect-auto"
            />
          </Rise>

          <Rise load delay={0.2} y={20}>
            <div className="relative flex h-full flex-col justify-between overflow-hidden m-sheen rounded-[28px] bg-[#0285ff] p-7 text-black md:p-9">
              <Baby aria-hidden className="pointer-events-none absolute -right-6 -top-6 size-44 text-black/[0.07]" strokeWidth={1.25} />
              <div>
                <p className="font-mori text-[15px] font-semibold uppercase tracking-[-0.03em] text-black/60">Every Sunday</p>
                <p className={cn(mori, "mt-3 text-[clamp(48px,5.6vw,80px)] leading-[0.9] tracking-[-0.05em]")}>9:00 &amp; 10:30</p>
                <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-black/75">
                  Birth through 5th grade, during both services. While you worship, your kids play, learn about Jesus, and get known by name.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5 font-medium"><MapPin className="size-3.5" /> Downstairs, below the auditorium</span>
                  <span className="rounded-full bg-black/10 px-3 py-1.5 font-medium">Students: Wed 6:30 PM</span>
                </div>
              </div>

              <div className="mt-8 border-t border-black/15 pt-6">
                {reg ? (
                  <div>
                    <p className={cn(mori, "text-[22px] leading-tight tracking-[-0.04em]")}>
                      {names} {reg.kids.length === 1 ? "is" : "are"} pre-registered.
                    </p>
                    <p className="mt-1 text-[15px] text-black/70">
                      {formatDay(reg.date)} · {reg.service} AM service · Name tags will be ready
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button onClick={() => setSheet(true)} className={cn(mori, "inline-flex h-11 items-center gap-2 rounded-[80px] bg-[#dcd2c5] px-5 text-[14px] uppercase tracking-[-0.04em] transition hover:bg-[#f5f0e9]")}>
                        <Pencil className="size-4" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          downloadIcs({ title: "Kids First at Rolla First", start: reg.date, durationMin: 85, location: `${church.address}, ${church.city}`, description: "Arrive 15 minutes early and stop by the blue Kids Welcome desk downstairs." });
                          toast("Added to your calendar");
                        }}
                        className={cn(mori, "inline-flex h-11 items-center gap-2 rounded-[80px] border-2 border-black/30 px-5 text-[14px] uppercase tracking-[-0.04em] transition hover:border-black")}
                      >
                        <CalendarPlus className="size-4" /> Calendar
                      </button>
                      <button
                        onClick={() => {
                          cancelKids();
                          toast("Pre-registration canceled", { description: "No problem. You can still check in on Sunday." });
                        }}
                        className="inline-flex h-11 items-center gap-1.5 px-2 text-[14px] text-black/60 hover:text-black"
                      >
                        <X className="size-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSheet(true)} className={cn(mori, "group flex h-[67px] w-full items-center justify-between rounded-[80px] bg-[#dcd2c5] pl-8 pr-2 text-[16px] uppercase tracking-[-0.05em] transition hover:bg-[#f5f0e9]")}>
                    Pre-register your kids
                    <span className="flex size-[51px] items-center justify-center rounded-full bg-[#0285ff]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/home/arrow.svg" alt="" width={30} height={30} className="transition duration-500 group-hover:rotate-45" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </Rise>
        </section>

        {/* ---------- Age groups ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
                A room for <Ed>every</Ed> age
              </h2>
              <p className="max-w-sm text-[15px] text-stone-500">Same leaders every week, so your kids see familiar faces.</p>
            </div>
          </Rise>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kidsGroups.map((g, i) => (
              <Rise key={g.id} delay={i * 0.06}>
                <div className={cn("flex h-full flex-col justify-between gap-10 rounded-[28px] border-2 p-7", g.id === "students" ? "border-[#dcd2c5]/30" : "border-[#dcd2c5]/80")}>
                  <div>
                    <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">{g.room}</p>
                    <p className={cn(mori, "mt-2 text-[40px] leading-none tracking-[-0.05em]")}>{g.label}</p>
                    <p className="mt-2 font-mori text-[15px] font-semibold text-[#0285ff]">{g.ages}</p>
                  </div>
                  <div>
                    <p className="text-[15px] leading-relaxed text-stone-600">{g.blurb}</p>
                    {g.id === "students" && (
                      <Link href="/students" className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0285ff] hover:underline">
                        Wednesday nights <ArrowUpRight className="size-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </Rise>
            ))}
          </div>
        </section>

        {/* ---------- Check-in ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <Rise>
              <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
                Your first <Ed>Sunday</Ed>
              </h2>
              <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-stone-600">
                Check-in takes about two minutes. Plan to arrive 15 minutes early the first time so you can see the room.
              </p>
              <div className="mt-10 rounded-[28px] bg-[#dcd2c5]/[0.05] p-7">
                <ShieldCheck className="size-6 text-[#0285ff]" strokeWidth={1.5} />
                <h3 className={cn(mori, "mt-4 text-[22px] tracking-[-0.03em]")}>Safety first, always</h3>
                <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-stone-600">
                  {["Every volunteer is background-checked and trained", "Leaders always serve in pairs", "Secure entry to every kids' room", "Allergies printed on every name tag"].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#0285ff]" strokeWidth={1.75} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Rise>
            <Rise>
              <ol className="border-t border-[#dcd2c5]/15">
                {[
                  { icon: MapPin, t: "Head downstairs", b: "The kids area is right below the auditorium. Follow the blue signs from the main entrance." },
                  { icon: Tag, t: "Stop by the Kids Welcome desk", b: "We'll set up a quick profile for each child. It's one time only, and if you pre-registered, it's already done." },
                  { icon: ShieldCheck, t: "Get matching security tags", b: "Your child gets a name tag, you get the matching pickup tag. Only you can pick them up." },
                  { icon: Smartphone, t: "Enjoy the service", b: "If your kiddo needs you, we'll text you right away. After service, come back downstairs with your tag." },
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

        {/* ---------- Team ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
                Meet the <Ed>team</Ed>
              </h2>
              <Link href="/events/family-team" className={cn(mori, "group inline-flex items-center gap-3 text-[16px] uppercase tracking-[-0.04em] transition hover:text-[#0285ff]")}>
                Book a tour of the kids area
                <span className="flex size-12 items-center justify-center rounded-full bg-[#0285ff]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/arrow.svg" alt="" width={28} height={28} className="transition duration-500 group-hover:rotate-45" />
                </span>
              </Link>
            </div>
          </Rise>
          <Rise>
            <RevealGroup as="ul" className="mt-10 grid gap-4 sm:grid-cols-3">
              {team.map((p) => (
                <li key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo} alt={p.name} width={600} height={750} loading="lazy" className="aspect-[4/5] w-full rounded-[28px] object-cover object-top" />
                  <p className={cn(mori, "mt-4 text-[22px] tracking-[-0.03em]")}>{p.name}</p>
                  <p className="text-[15px] text-[#0285ff]">{p.role}</p>
                  {p.email && (
                    <a href={`mailto:${p.email}`} className="mt-1 inline-block text-[14px] text-stone-500 hover:text-[#dcd2c5]">{p.email}</a>
                  )}
                </li>
              ))}
            </RevealGroup>
          </Rise>
        </section>

        {/* ---------- Family events + next steps ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
              Coming <Ed>up</Ed>
            </h2>
          </Rise>
          <Rise>
            <RevealGroup as="ul" className="mt-10 grid gap-4 md:grid-cols-3">
              {familyEvents.map((e) => (
                <li key={e.id}>
                  <Link href="/events/family-events" className="m-lift group flex h-full flex-col justify-between gap-10 rounded-[28px] border-2 border-[#dcd2c5]/80 p-7 transition hover:border-[#0285ff] md:p-8">
                    <div>
                      {e.date && (
                        <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">
                          {formatDay(e.date)} · {formatTime(e.date)}
                        </p>
                      )}
                      <p className={cn(mori, "mt-2 text-[32px] leading-[1] tracking-[-0.04em]")}>{e.title}</p>
                      <p className="mt-3 text-[15px] leading-relaxed text-stone-600">{e.description}</p>
                    </div>
                    <span className="flex items-center justify-between text-[14px] text-stone-500">
                      {e.location}
                      <ArrowUpRight className="size-5 text-[#0285ff] transition duration-500 group-hover:rotate-45" strokeWidth={1.5} />
                    </span>
                  </Link>
                </li>
              ))}
            </RevealGroup>
          </Rise>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Rise>
              <Link href="/baptism" className="flex h-full gap-5 rounded-[28px] bg-[#dcd2c5]/[0.05] p-7 transition hover:bg-[#dcd2c5]/[0.09]">
                <Droplets className="size-6 shrink-0 text-[#0285ff]" strokeWidth={1.5} />
                <div>
                  <h3 className={cn(mori, "text-[20px] tracking-[-0.03em]")}>Is your child ready to be baptized?</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">Pastor Micah meets with every family first. Register your child and we&apos;ll reach out.</p>
                </div>
              </Link>
            </Rise>
            <Rise delay={0.06}>
              <a
                href={`mailto:${staffById.debbie.email}?subject=${encodeURIComponent("I'd like to serve on the Kids Team")}`}
                className="flex h-full gap-5 rounded-[28px] bg-[#dcd2c5]/[0.05] p-7 transition hover:bg-[#dcd2c5]/[0.09]"
              >
                <HeartHandshake className="size-6 shrink-0 text-[#0285ff]" strokeWidth={1.5} />
                <div>
                  <h3 className={cn(mori, "text-[20px] tracking-[-0.03em]")}>Serve on the Kids Team</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">Rock babies, lead a small group, or run check-in. Email Debbie to get started.</p>
                </div>
              </a>
            </Rise>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-[60px] md:py-32">
          <div className="grid gap-12 md:grid-cols-12">
            <Rise className="md:col-span-4">
              <h2 className={cn(mori, "text-[clamp(40px,4.6vw,64px)] leading-[0.95] tracking-[-0.05em]")}>
                Parent <Ed>questions</Ed>
              </h2>
              <div className="mt-8 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={micah.photo} alt="" width={64} height={64} className="size-16 rounded-full object-cover object-top" />
                <div>
                  <p className={cn(mori, "text-[17px]")}>{micah.name}</p>
                  <p className="text-sm text-[#0285ff]">{micah.role}</p>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-[15px] text-stone-600">Anything else on your mind? Pastor Micah would love to hear from you.</p>
              <a href={`mailto:${micah.email}?subject=${encodeURIComponent("A question about Kids First")}`} className={cn(mori, "mt-6 inline-flex h-[52px] items-center gap-2 rounded-[80px] border-[3px] border-[#0285ff] px-6 text-[15px] uppercase tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black")}>
                <Mail className="size-4" /> Email Pastor Micah
              </a>
            </Rise>
            <div className="md:col-span-8">
              <Faq items={faqs} />
            </div>
          </div>
        </section>

        {!reg && (
          <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-[60px]">
            <Rise>
              <button onClick={() => setSheet(true)} className="group flex w-full flex-col justify-between gap-8 rounded-[28px] border-2 border-[#dcd2c5]/80 p-8 text-left transition hover:border-[#0285ff] md:flex-row md:items-center md:p-12">
                <span className={cn(mori, "text-[clamp(36px,4.4vw,60px)] leading-[0.95] tracking-[-0.05em]")}>
                  We&apos;ll have their <Ed>name tags</Ed> ready
                </span>
                <span className="flex items-center gap-3">
                  <span className={cn(mori, "text-[16px] uppercase tracking-[-0.04em]")}>Pre-register</span>
                  <span className="flex size-[62px] items-center justify-center rounded-full bg-[#0285ff]">
                    <ArrowUpRight className="size-6 text-black transition duration-500 group-hover:rotate-45" strokeWidth={1.5} />
                  </span>
                </span>
              </button>
            </Rise>
          </section>
        )}

        {reg && (
          <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-[60px]">
            <Rise>
              <div className="rounded-[28px] border-2 border-[#0285ff] p-8 md:p-10">
                <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Your pre-registration</p>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {reg.kids.map((k, i) => (
                    <li key={i} className="rounded-[20px] bg-[#dcd2c5]/[0.06] px-5 py-3">
                      <p className={cn(mori, "text-[18px]")}>{k.nickname || k.firstName} {k.lastName}</p>
                      <p className="text-[14px] text-stone-500">
                        {kidGradeLabel(k.grade)}
                        {k.medicalNotes ? ` · ${k.medicalNotes}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Rise>
          </section>
        )}
      </main>
      <SiteFooter />
      <KidsSheet open={sheet} onOpenChange={setSheet} />
    </div>
  );
}
