"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, CalendarPlus, Droplets, HandHeart, Mail, MapPin, Pencil, ShieldCheck, Users, X } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RevealGroup, Rise } from "@/components/church/motion";
import { Faq } from "@/components/visit/new-here";
import { church, churchLinks, staffById } from "@/lib/data";
import { gradeLabel, studentEvents, studentGroups, studentsFaqs, studentsInfo, wednesdayFlow } from "@/lib/students";
import { useStore } from "@/lib/store";
import { cn, downloadIcs, formatDay, formatTime } from "@/lib/utils";
import { StudentsSheet } from "./signup-sheet";

const mori = "font-mori font-semibold";
const Ed = ({ children }: { children: React.ReactNode }) => <span className="font-editorial font-normal italic tracking-[-0.03em]">{children}</span>;

export function StudentsPage() {
  const { profile, hydrated, cancelStudents } = useStore();
  const [sheet, setSheet] = useState(false);
  const reg = hydrated ? profile.students : null;
  const gannon = staffById[studentsInfo.leaderId];
  const events = useMemo(() => (hydrated ? studentEvents() : []), [hydrated]);
  const names = reg?.students.map((s) => s.firstName).join(" & ");

  return (
    <div className="overflow-x-clip bg-ink text-[#dcd2c5]">
      <SiteHeader />
      <main>
        {/* ---------- Hero ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-14 md:px-[60px] md:pt-[63px]">
          <p className={cn(mori, "m-load-rise text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>Youth · 7th–12th grade</p>
          <h1 className={cn(mori, "m-title mt-4 max-w-[1100px] text-[clamp(52px,6.4vw,82px)] leading-[0.92] tracking-[-0.05em]")}>
            Wednesdays are for <Ed>youth</Ed>
          </h1>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-6 px-5 md:px-[60px] lg:grid-cols-[1.35fr_1fr]">
          <Rise load delay={0.1} y={20}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/youth-night.jpg" alt="A youth leader speaking to students on a Wednesday night in the First Youth room" className="aspect-[4/3] h-full w-full rounded-[28px] object-cover object-[62%_50%] lg:aspect-auto" />
          </Rise>

          <Rise load delay={0.2} y={20}>
            <div className="relative flex h-full flex-col justify-between overflow-hidden m-sheen rounded-[28px] bg-[#0285ff] p-7 text-black md:p-9">
              <Users aria-hidden className="pointer-events-none absolute -right-6 -top-6 size-44 text-black/[0.07]" strokeWidth={1.25} />
              <div>
                <p className="font-mori text-[15px] font-semibold uppercase tracking-[-0.03em] text-black/60">Every Wednesday</p>
                <p className={cn(mori, "mt-3 text-[clamp(48px,5.6vw,80px)] leading-[0.9] tracking-[-0.05em]")}>6:30 PM</p>
                <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-black/75">Games, worship, a message that&apos;s actually about real life, and small groups with friends who have your back.</p>
                <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5 font-medium"><MapPin className="size-3.5" /> Youth room, upstairs above the Gym</span>
                  <span className="rounded-full bg-black/10 px-3 py-1.5 font-medium">Pickup at 8:00</span>
                </div>
              </div>

              <div className="mt-8 border-t border-black/15 pt-6">
                {reg ? (
                  <div>
                    <p className={cn(mori, "text-[22px] leading-tight tracking-[-0.04em]")}>
                      {names} {reg.students.length === 1 ? "is" : "are"} signed up.
                    </p>
                    <p className="mt-1 text-[15px] text-black/70">First night {formatDay(reg.date)} · Pastor Gannon will be watching for you</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button onClick={() => setSheet(true)} className={cn(mori, "inline-flex h-11 items-center gap-2 rounded-[80px] bg-[#dcd2c5] px-5 text-[14px] uppercase tracking-[-0.04em] transition hover:bg-[#f5f0e9]")}>
                        <Pencil className="size-4" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          downloadIcs({ title: "Wednesday Youth at Rolla First", start: reg.date, durationMin: 90, location: `${church.address}, ${church.city}`, description: "Drop off at the Gym doors. The youth room is upstairs. Pickup at 8:00 PM." });
                          toast("Added to your calendar");
                        }}
                        className={cn(mori, "inline-flex h-11 items-center gap-2 rounded-[80px] border-2 border-black/30 px-5 text-[14px] uppercase tracking-[-0.04em] transition hover:border-black")}
                      >
                        <CalendarPlus className="size-4" /> Calendar
                      </button>
                      <button
                        onClick={() => {
                          cancelStudents();
                          toast("Sign-up canceled", { description: "No problem. Students can still walk in any Wednesday." });
                        }}
                        className="inline-flex h-11 items-center gap-1.5 px-2 text-[14px] text-black/60 hover:text-black"
                      >
                        <X className="size-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setSheet(true)} className={cn(mori, "group flex h-[67px] w-full items-center justify-between rounded-[80px] bg-[#dcd2c5] pl-8 pr-2 text-[16px] uppercase tracking-[-0.05em] transition hover:bg-[#f5f0e9]")}>
                    Parents, sign up your student
                    <span className="flex size-[51px] shrink-0 items-center justify-center rounded-full bg-[#0285ff]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/home/arrow.svg" alt="" width={30} height={30} className="transition duration-500 group-hover:rotate-45" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </Rise>
        </section>

        {/* ---------- Group photo ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-6 md:px-[60px]">
          <Rise>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/home/students-group.jpg"
                alt="A big group of Rolla First students and leaders smiling together in the church parking lot"
                width={2000}
                height={1333}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-[28px] object-cover object-[50%_62%] sm:aspect-[2/1]"
              />
            </figure>
          </Rise>
        </section>

        {/* ---------- Groups ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <div className="grid gap-4 md:grid-cols-2">
            {studentGroups.map((g, i) => (
              <Rise key={g.id} delay={i * 0.06}>
                <div className="flex h-full flex-col justify-between gap-10 rounded-[28px] border-2 border-[#dcd2c5]/80 p-7 md:p-9">
                  <div>
                    <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">{g.grades}</p>
                    <p className={cn(mori, "mt-2 text-[clamp(40px,4vw,56px)] leading-none tracking-[-0.05em]")}>{g.label}</p>
                  </div>
                  <p className="max-w-md text-[16px] leading-relaxed text-stone-600">{g.blurb}</p>
                </div>
              </Rise>
            ))}
          </div>
        </section>

        {/* ---------- What to expect ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <Rise>
              <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
                What a Wednesday <Ed>looks like</Ed>
              </h2>
              <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-stone-600">Ninety minutes, and it goes fast. First time? Come at 6:15 and a leader will show you around.</p>
              <div className="mt-10 rounded-[28px] bg-[#dcd2c5]/[0.05] p-7">
                <ShieldCheck className="size-6 text-[#0285ff]" strokeWidth={1.5} />
                <h3 className={cn(mori, "mt-4 text-[22px] tracking-[-0.03em]")}>For parents</h3>
                <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-stone-600">
                  {["Every leader is 21+, background-checked, and trained", "Leaders are never alone with a student", "Students stay inside until you pick them up", "A short parent text each week, if you'd like one"].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#0285ff]" strokeWidth={1.75} />
                      {t}
                    </li>
                  ))}
                  <li className="flex gap-2.5">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#0285ff]" strokeWidth={1.75} />
                    {churchLinks.youthFacebook ? (
                      <span>
                        Join our{" "}
                        <a href={churchLinks.youthFacebook} target="_blank" rel="noreferrer" className="font-medium text-[#0285ff] underline decoration-[#0285ff]/40 underline-offset-4 hover:decoration-[#0285ff]">youth Facebook group</a>{" "}
                        for photos, updates, and what&apos;s coming up
                      </span>
                    ) : (
                      "Join our youth Facebook group for photos, updates, and what's coming up"
                    )}
                  </li>
                </ul>
              </div>
            </Rise>
            <Rise>
              <ol className="border-t border-[#dcd2c5]/15">
                {wednesdayFlow.map((s) => (
                  <li key={s.time} className="flex gap-6 border-b border-[#dcd2c5]/15 py-7 md:gap-10 md:py-8">
                    <span className={cn(mori, "w-[88px] shrink-0 text-[34px] leading-none tracking-[-0.05em] text-[#0285ff] md:w-[104px] md:text-[42px]")}>{s.time}</span>
                    <div>
                      <h3 className={cn(mori, "text-[26px] leading-[1.05] tracking-[-0.03em]")}>{s.title}</h3>
                      <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-stone-600">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Rise>
          </div>
        </section>

        {/* ---------- Pastor Gannon ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <div className="grid items-center gap-8 rounded-[28px] border-2 border-[#dcd2c5]/80 p-6 md:grid-cols-[280px_1fr] md:gap-12 md:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gannon.photo} alt={gannon.name} className="aspect-[4/5] w-full max-w-[280px] rounded-[20px] object-cover object-top" />
              <div>
                <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Meet your youth pastor</p>
                <h2 className={cn(mori, "mt-3 text-[clamp(40px,4.6vw,64px)] leading-[0.95] tracking-[-0.05em]")}>{gannon.name}</h2>
                <p className="mt-2 text-[16px] text-[#0285ff]">{gannon.role}</p>
                <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-stone-600">
                  Gannon leads Wednesday nights and our worship team, with a crew of adult volunteers who show up every week for your students. Got a question, or want to grab coffee before your student&apos;s first night? He&apos;d love that.
                </p>
                <a href={`mailto:${gannon.email}?subject=${encodeURIComponent("A question about Wednesday nights")}`} className={cn(mori, "mt-6 inline-flex h-[52px] items-center gap-2 rounded-[80px] border-[3px] border-[#0285ff] px-6 text-[15px] uppercase tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black")}>
                  <Mail className="size-4" /> Email Pastor Gannon
                </a>
              </div>
            </div>
          </Rise>
        </section>

        {/* ---------- Upcoming ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
              Coming <Ed>up</Ed>
            </h2>
          </Rise>
          <RevealGroup as="ul" className="mt-10 grid gap-4 md:grid-cols-2">
            {events.map((e) => (
              <li key={e.id}>
                <article className="m-lift flex h-full flex-col justify-between gap-8 rounded-[28px] border-2 border-[#dcd2c5]/80 p-7 transition hover:border-[#0285ff] md:p-8">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">
                        {formatDay(e.date)} · {formatTime(e.date)}
                      </p>
                      <span className="shrink-0 rounded-full bg-[#dcd2c5]/[0.07] px-2.5 py-1 text-[12px]">{e.tag}</span>
                    </div>
                    <h3 className={cn(mori, "mt-3 text-[32px] leading-[1] tracking-[-0.04em]")}>{e.title}</h3>
                    <p className="mt-3 text-[16px] leading-relaxed text-stone-600">{e.body}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1.5 text-[14px] text-stone-500"><MapPin className="size-4" /> {e.place}</span>
                    <button
                      onClick={() => {
                        downloadIcs({ title: `${e.title} (Rolla First Youth)`, start: e.date, durationMin: 120, location: e.place, description: e.body });
                        toast("Added to your calendar", { description: e.title });
                      }}
                      className={cn(mori, "inline-flex h-11 shrink-0 items-center gap-2 rounded-[80px] border-2 border-[#dcd2c5]/40 px-4 text-[13px] uppercase tracking-[-0.04em] transition hover:border-[#dcd2c5]")}
                    >
                      <CalendarPlus className="size-4" /> Add
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </RevealGroup>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Rise>
              <Link href="/serve" className="flex h-full gap-5 rounded-[28px] bg-[#dcd2c5]/[0.05] p-7 transition hover:bg-[#dcd2c5]/[0.09]">
                <HandHeart className="size-6 shrink-0 text-[#0285ff]" strokeWidth={1.5} />
                <div>
                  <h3 className={cn(mori, "text-[20px] tracking-[-0.03em]")}>Students can serve too</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">13 and up can join Welcome, Production, or Facilities on Sundays. A great way to belong.</p>
                </div>
              </Link>
            </Rise>
            <Rise delay={0.06}>
              <Link href="/baptism" className="flex h-full gap-5 rounded-[28px] bg-[#dcd2c5]/[0.05] p-7 transition hover:bg-[#dcd2c5]/[0.09]">
                <Droplets className="size-6 shrink-0 text-[#0285ff]" strokeWidth={1.5} />
                <div>
                  <h3 className={cn(mori, "text-[20px] tracking-[-0.03em]")}>Ready to be baptized?</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">Baptism Sundays are once a month. Students can sign up, and we&apos;ll loop in a parent.</p>
                </div>
              </Link>
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
              <p className="mt-5 max-w-xs text-[15px] text-stone-600">Anything else? Pastor Gannon is happy to talk.</p>
            </Rise>
            <div className="md:col-span-8">
              <Faq items={studentsFaqs} />
            </div>
          </div>
        </section>

        {!reg ? (
          <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-[60px]">
            <Rise>
              <button onClick={() => setSheet(true)} className="group flex w-full flex-col justify-between gap-8 rounded-[28px] border-2 border-[#dcd2c5]/80 p-8 text-left transition hover:border-[#0285ff] md:flex-row md:items-center md:p-12">
                <span className={cn(mori, "text-[clamp(36px,4.4vw,60px)] leading-[0.95] tracking-[-0.05em]")}>
                  See them <Ed>Wednesday</Ed>
                </span>
                <span className="flex items-center gap-3">
                  <span className={cn(mori, "text-[16px] uppercase tracking-[-0.04em]")}>Sign up your student</span>
                  <span className="flex size-[62px] items-center justify-center rounded-full bg-[#0285ff]">
                    <ArrowUpRight className="size-6 text-black transition duration-500 group-hover:rotate-45" strokeWidth={1.5} />
                  </span>
                </span>
              </button>
            </Rise>
          </section>
        ) : (
          <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-[60px]">
            <Rise>
              <div className="rounded-[28px] border-2 border-[#0285ff] p-8 md:p-10">
                <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Your sign-up</p>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {reg.students.map((s, i) => (
                    <li key={i} className="rounded-[20px] bg-[#dcd2c5]/[0.06] px-5 py-3">
                      <p className={cn(mori, "text-[18px]")}>{s.firstName} {s.lastName}</p>
                      <p className="text-[14px] text-stone-500">
                        {gradeLabel(s.grade)}
                        {s.school ? ` · ${s.school}` : ""}
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
      <StudentsSheet open={sheet} onOpenChange={setSheet} />
    </div>
  );
}
