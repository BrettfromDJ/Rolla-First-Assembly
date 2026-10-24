"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Droplets, Mail, Pencil, Shirt, Users, X } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RevealGroup, Rise } from "@/components/church/motion";
import { Faq } from "@/components/visit/new-here";
import { BaptismSheet } from "./register-sheet";
import { baptism, baptismDates, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, formatDay } from "@/lib/utils";

const mori = "font-mori font-semibold";
const Ed = ({ children }: { children: React.ReactNode }) => <span className="font-editorial font-normal italic tracking-[-0.03em]">{children}</span>;

const faqs = [
  { q: "I was baptized as a baby. Should I be baptized again?", a: "Many people who were baptized as infants choose to be baptized as believers, as their own decision to follow Jesus. There's no pressure either way. Pastor Lance is happy to talk it through with you." },
  { q: "Do I have to share my story in front of everyone?", a: "No. Some people love to share, some would rather not. You'll only be asked to speak if you want to, and we'll always check with you first." },
  { q: "Can my child be baptized?", a: "Yes. Pastor Micah meets with every family first to make sure your child understands the decision. Register your child here and we'll reach out to set up a time." },
  { q: "What if I'm nervous?", a: "Totally normal. We'll walk you through every step ahead of time, a pastor will be right beside you the whole time, and it's over in about a minute. Then everyone cheers." },
  { q: "Do I need to be a member of Rolla First?", a: "No. Baptism is about your faith in Jesus, not membership. If you're ready to take this step, you're welcome here." },
  { q: "What should I wear?", a: "Wear dark clothes you don't mind getting wet. We'll give you a Rolla First baptism shirt to wear over them, and towels. Bring a change of clothes for afterward." },
];

export function BaptismPage() {
  const { profile, hydrated, cancelBaptism } = useStore();
  const [sheet, setSheet] = useState<{ open: boolean; date?: string }>({ open: false });
  const dates = useMemo(() => (hydrated ? baptismDates(3) : []), [hydrated]);
  const next = dates[0];
  const reg = hydrated ? profile.baptism : null;
  const lance = staffById[baptism.hostId];
  const open = (date?: string) => setSheet({ open: true, date });
  const days = next ? Math.max(0, Math.ceil((next.date.getTime() - Date.now()) / 864e5)) : 0;

  return (
    <div className="overflow-x-clip bg-ink text-[#dcd2c5]">
      <SiteHeader />
      <main>
        {/* ---------- Hero + next baptism ---------- */}
        <section className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-14 md:px-[60px] md:pt-[63px] lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className={cn(mori, "m-load-rise text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>Baptism</p>
            <h1 className={cn(mori, "m-title mt-4 text-[clamp(52px,6.4vw,82px)] leading-[0.92] tracking-[-0.05em]")}>
              Take the
              <br />
              <Ed>next</Ed> step
            </h1>
            <p className="m-load-rise mt-6 max-w-lg text-lg leading-relaxed text-stone-600 md:text-xl" style={{ "--rd": "0.45s" } as React.CSSProperties}>
              Baptism is a public way of saying, &ldquo;I&apos;m following Jesus.&rdquo; If you&apos;ve made that decision, we&apos;d love to celebrate it with you.
            </p>
          </div>

          <Rise load delay={0.2} y={20}>
            <div className="relative overflow-hidden m-sheen rounded-[28px] bg-[#0285ff] p-7 text-black md:p-9">
              <Droplets aria-hidden className="pointer-events-none absolute -right-6 -top-6 size-44 text-black/[0.07]" strokeWidth={1.25} />
              <p className="font-mori text-[15px] font-semibold uppercase tracking-[-0.03em] text-black/60">Next baptism</p>
              {next ? (
                <>
                  <p className={cn(mori, "mt-3 text-[clamp(48px,5.6vw,80px)] leading-[0.9] tracking-[-0.05em]")}>
                    {next.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  </p>
                  <p className="mt-3 text-[17px] text-black/75">
                    {next.date.toLocaleDateString("en-US", { weekday: "long" })} · During both services, 9:00 &amp; 10:30
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
                    <span className="rounded-full bg-black/10 px-3 py-1.5 font-medium">{days === 0 ? "Today" : `In ${days} day${days === 1 ? "" : "s"}`}</span>
                    <span className="rounded-full bg-black/10 px-3 py-1.5 font-medium">Both services</span>
                  </div>
                </>
              ) : (
                <div className="mt-3 h-[150px]" />
              )}

              <div className="mt-8 border-t border-black/15 pt-6">
                {reg ? (
                  <div>
                    <p className={cn(mori, "text-[22px] leading-tight tracking-[-0.04em]")}>
                      {reg.age === "child" ? `${reg.firstName} is registered` : "You're registered"} for {new Date(reg.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
                    </p>
                    <p className="mt-1 text-[15px] text-black/70">
                      {formatDay(reg.date)} · {reg.service} AM service
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button onClick={() => open(reg.date)} className={cn(mori, "inline-flex h-11 items-center gap-2 rounded-[80px] bg-[#dcd2c5] px-5 text-[14px] uppercase tracking-[-0.04em] transition hover:bg-[#f5f0e9]")}>
                        <Pencil className="size-4" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          cancelBaptism();
                          toast("Registration canceled", { description: "No problem. You can register again anytime." });
                        }}
                        className="inline-flex h-11 items-center gap-1.5 px-2 text-[14px] text-black/60 hover:text-black"
                      >
                        <X className="size-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => open()} className={cn(mori, "group flex h-[67px] w-full items-center justify-between rounded-[80px] bg-[#dcd2c5] pl-8 pr-2 text-[16px] uppercase tracking-[-0.05em] transition hover:bg-[#f5f0e9]")}>
                    Register for baptism
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

        {/* ---------- Baptism photo ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 md:px-[60px]">
          <Rise>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/home/baptism-group.jpg"
                alt="A group of people standing in the river after being baptized, smiling in matching Made New shirts"
                width={2000}
                height={1463}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-[28px] object-cover object-[50%_65%] sm:aspect-[2/1]"
              />
            </figure>
          </Rise>
        </section>

        {/* ---------- What baptism is ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-16 md:px-[60px] md:pt-24">
          <Rise>
            <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
              What is <Ed>baptism</Ed>?
            </h2>
          </Rise>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { t: "A public declaration", b: "It's how you tell your family, friends, and church that you've decided to follow Jesus.", v: "Matthew 28:19" },
              { t: "A picture of new life", b: "Going under the water and coming back up is a picture of leaving the old life behind and starting new with Jesus.", v: "Romans 6:4" },
              { t: "A step, not a finish line", b: "Baptism doesn't make you perfect. It's a next step in a lifelong journey of following Jesus with people who love you.", v: "Acts 2:38" },
            ].map((c, i) => (
              <Rise key={c.t} delay={i * 0.08}>
                <div className="flex h-full flex-col justify-between gap-10 rounded-[28px] border-2 border-[#dcd2c5]/80 p-7 md:p-8">
                  <span className="font-mori text-[15px] font-semibold text-[#0285ff]">0{i + 1}</span>
                  <div>
                    <h3 className={cn(mori, "text-[30px] leading-[1] tracking-[-0.04em]")}>{c.t}</h3>
                    <p className="mt-3 text-[16px] leading-relaxed text-stone-600">{c.b}</p>
                    <p className="mt-5 font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">{c.v}</p>
                  </div>
                </div>
              </Rise>
            ))}
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <Rise>
              <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
                How it <Ed>works</Ed>
              </h2>
              <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-stone-600">
                Four simple steps. A pastor is with you for every one of them.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/baptism-pool.jpg" alt="A young woman smiling in the baptism pool in a Made New shirt as the pastor celebrates with her" width={1365} height={2048} loading="lazy" className="mt-10 aspect-[4/5] w-full rounded-[28px] object-cover object-[50%_40%] lg:max-w-[460px]" />
            </Rise>
            <Rise>
            <ol className="border-t border-[#dcd2c5]/15">
              {[
                { t: "Register", b: "Takes about two minutes. Pick the Sunday that works for you and who's coming to cheer you on." },
                { t: "Talk with a pastor", b: "A pastor will reach out to hear your story, answer your questions, and walk you through exactly what happens on the day." },
                { t: "Baptism Sunday", b: "Arrive 30 minutes before your service and change into your shirt. You'll be baptized during the service with your people watching." },
                { t: "Celebrate", b: "Hugs, photos, and a little gift from us. Then we'll help you find your next step: a group, a team, or a class." },
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

        {/* ---------- What to bring ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Shirt, t: "Dark clothes", b: "Wear something you don't mind getting wet. We'll give you a baptism shirt to wear over it." },
                { icon: Droplets, t: "A change of clothes", b: "We'll have towels and a private place to change before and after." },
                { icon: Users, t: "Your people", b: "Invite friends and family. Tell us how many are coming and we'll save seats up front." },
              ].map((b) => (
                <div key={b.t} className="flex gap-5 rounded-[28px] bg-[#dcd2c5]/[0.05] p-7">
                  <b.icon className="size-6 shrink-0 text-[#0285ff]" strokeWidth={1.5} />
                  <div>
                    <h3 className={cn(mori, "text-[20px] tracking-[-0.03em]")}>{b.t}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">{b.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </Rise>
        </section>

        {/* ---------- Upcoming dates ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
                Upcoming <Ed>dates</Ed>
              </h2>
              <p className="text-[15px] text-stone-500">{baptism.rule}, during both services.</p>
            </div>
          </Rise>
          <Rise>
          <RevealGroup as="ul" className="mt-10 grid gap-4 md:grid-cols-3">
            {dates.map((d) => {
              const mine = reg && new Date(reg.date).toDateString() === d.date.toDateString();
              return (
                  <li key={d.date.toISOString()} className={cn("m-lift flex h-full flex-col justify-between gap-10 rounded-[28px] border-2 p-7 md:p-8", mine ? "border-[#0285ff]" : "border-[#dcd2c5]/80")}>
                    <div>
                      <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">{d.date.toLocaleDateString("en-US", { weekday: "long" })}</p>
                      <p className={cn(mori, "mt-2 text-[44px] leading-none tracking-[-0.05em]")}>{d.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
                      <p className="mt-3 text-[15px] text-stone-500">9:00 &amp; 10:30 services</p>
                    </div>
                    {mine ? (
                      <span className={cn(mori, "inline-flex h-12 w-fit items-center rounded-[80px] bg-[#0285ff]/15 px-5 text-[14px] uppercase tracking-[-0.04em] text-[#0285ff]")}>You&apos;re registered</span>
                    ) : (
                      <button onClick={() => open(d.date.toISOString())} className={cn(mori, "group flex w-fit items-center gap-3 text-[16px] uppercase tracking-[-0.04em] text-[#dcd2c5] transition hover:text-[#0285ff]")}>
                        {reg ? "Switch to this date" : "Register"}
                        <span className="flex size-12 items-center justify-center rounded-full bg-[#0285ff]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/home/arrow.svg" alt="" width={28} height={28} className="transition duration-500 group-hover:rotate-45" />
                        </span>
                      </button>
                    )}
                  </li>
              );
            })}
          </RevealGroup>
          </Rise>
        </section>

        {/* ---------- FAQ + talk to a pastor ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-[60px] md:py-32">
          <div className="grid gap-12 md:grid-cols-12">
            <Rise className="md:col-span-4">
              <h2 className={cn(mori, "text-[clamp(40px,4.6vw,64px)] leading-[0.95] tracking-[-0.05em]")}>
                Good <Ed>questions</Ed>
              </h2>
              <div className="mt-8 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lance.photo} alt="" width={64} height={64} className="size-16 rounded-full object-cover object-top" />
                <div>
                  <p className={cn(mori, "text-[17px]")}>{lance.name}</p>
                  <p className="text-sm text-[#0285ff]">{lance.role}</p>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-[15px] text-stone-600">Not sure if you&apos;re ready? That&apos;s a great conversation to have. Reach out anytime.</p>
              <a href={`mailto:${lance.email}?subject=${encodeURIComponent("A question about baptism")}`} className={cn(mori, "mt-6 inline-flex h-[52px] items-center gap-2 rounded-[80px] border-[3px] border-[#0285ff] px-6 text-[15px] uppercase tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black")}>
                <Mail className="size-4" /> Email Pastor Lance
              </a>
            </Rise>
            <div className="md:col-span-8">
              <Faq items={faqs} />
            </div>
          </div>
        </section>

        {!reg && next && (
          <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-[60px]">
            <Rise>
              <button onClick={() => open()} className="group flex w-full flex-col justify-between gap-8 rounded-[28px] border-2 border-[#dcd2c5]/80 p-8 text-left transition hover:border-[#0285ff] md:flex-row md:items-center md:p-12">
                <span className={cn(mori, "text-[clamp(36px,4.4vw,60px)] leading-[0.95] tracking-[-0.05em]")}>
                  Ready? <Ed>Let&apos;s</Ed> celebrate together
                </span>
                <span className="flex items-center gap-3">
                  <span className={cn(mori, "text-[16px] uppercase tracking-[-0.04em]")}>Register for {next.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className="flex size-[62px] items-center justify-center rounded-full bg-[#0285ff]">
                    <ArrowUpRight className="size-6 text-black transition duration-500 group-hover:rotate-45" strokeWidth={1.5} />
                  </span>
                </span>
              </button>
            </Rise>
          </section>
        )}
      </main>
      <SiteFooter />
      <BaptismSheet open={sheet.open} onOpenChange={(o) => setSheet((s) => ({ ...s, open: o }))} initialDate={sheet.date} />
    </div>
  );
}
