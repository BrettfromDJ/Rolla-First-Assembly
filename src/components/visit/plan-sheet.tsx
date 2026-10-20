"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Baby, CalendarPlus, Check, Coffee, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { church, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { ServiceTime } from "@/lib/types";
import { cn, downloadIcs, formatDay, isEmail, isPhone, nextDow } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3;

export function PlanVisitSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { profile, savePlan } = useStore();
  const sundays = useMemo(() => [0, 1, 2].map((w) => nextDow(0, 9, 0, w)), []);
  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [contact, setContact] = useState("");
  const [service, setService] = useState<ServiceTime>("11:00");
  const [date, setDate] = useState(sundays[0].toISOString());
  const [kids, setKids] = useState<boolean | null>(null);
  const [kidsCount, setKidsCount] = useState(1);
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});

  useEffect(() => {
    if (!open) return;
    const p = profile.visitPlan;
    setStep(0);
    setErrors({});
    setFirstName(p?.firstName ?? profile.firstName);
    setContact(p?.contact ?? (profile.email || profile.phone));
    setService(p?.service ?? "11:00");
    setKids(p ? p.bringingKids : null);
    setKidsCount(p?.kidsCount || 1);
    const match = p && sundays.find((s) => s.toDateString() === new Date(p.date).toDateString());
    setDate((match ?? sundays[0]).toISOString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const go = (s: Step) => {
    setDir(s > step ? 1 : -1);
    setStep(s);
  };

  const next = () => {
    if (step === 0) {
      const e: typeof errors = {};
      if (!firstName.trim()) e.name = "What should we call you?";
      if (!isEmail(contact) && !isPhone(contact)) e.contact = "Add an email or a 10-digit phone number.";
      setErrors(e);
      if (Object.keys(e).length) return;
      go(1);
    } else if (step === 1) go(2);
    else if (step === 2) {
      if (kids === null) return;
      const d = new Date(date);
      d.setHours(service === "9:00" ? 9 : 11, 0, 0, 0);
      savePlan({ firstName: firstName.trim(), contact: contact.trim(), service, date: d.toISOString(), bringingKids: kids, kidsCount: kids ? kidsCount : 0 });
      go(3);
    }
  };

  const visitDate = useMemo(() => {
    const d = new Date(date);
    d.setHours(service === "9:00" ? 9 : 11, 0, 0, 0);
    return d.toISOString();
  }, [date, service]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Let us know you're coming" hideTitle className="sm:w-[min(600px,calc(100vw-48px))]">
      <div className="px-6 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-10">
        {step < 3 && (
          <div className="mb-8 flex items-center gap-3 pr-10">
            {step > 0 ? (
              <button onClick={() => go((step - 1) as Step)} className="-ml-2 flex size-9 items-center justify-center rounded-full text-stone-600 hover:bg-stone-900/5" aria-label="Back">
                <ArrowLeft className="size-4" />
              </button>
            ) : null}
            <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of 3`}>
              {[0, 1, 2].map((i) => (
                <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-forest-600" : "bg-stone-200")} />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-6">
                <Heading title="Let us know you're coming." body="Totally optional. It just helps us save you a great parking spot and say hello by name." />
                <Field label="First name" value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} error={errors.name} autoComplete="given-name" autoFocus placeholder="Sarah" />
                <Field label="Email or phone" value={contact} onChange={(e) => { setContact(e.target.value); setErrors((x) => ({ ...x, contact: undefined })); }} error={errors.contact} hint="We'll send a friendly reminder the day before. That's it." autoComplete="email" placeholder="sarah@example.com" />
                <Button type="submit" size="lg" className="w-full">Continue <ArrowRight /></Button>
              </form>
            )}

            {step === 1 && (
              <div className="space-y-7">
                <Heading title={`Which Sunday works, ${firstName.split(" ")[0]}?`} body="Both services are the same. Pick whatever fits your morning." />
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto overflow-y-hidden px-1">
                  {sundays.map((s, i) => {
                    const on = new Date(date).toDateString() === s.toDateString();
                    return (
                      <button key={s.toISOString()} onClick={() => setDate(s.toISOString())} aria-pressed={on} className={cn("min-w-28 flex-1 rounded-2xl px-4 py-3 text-left ring-1 transition", on ? "bg-forest-700 text-ink ring-forest-700" : "bg-white ring-stone-200 hover:ring-stone-300")}>
                        <span className={cn("block text-xs", on ? "text-paper/70" : "text-stone-500")}>{i === 0 ? "This Sunday" : i === 1 ? "Next week" : "In 2 weeks"}</span>
                        <span className="mt-0.5 block font-medium">{s.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(["9:00", "11:00"] as const).map((t) => {
                    const on = service === t;
                    return (
                      <button key={t} onClick={() => setService(t)} aria-pressed={on} className={cn("relative rounded-3xl p-5 text-left ring-1 transition", on ? "bg-white ring-2 ring-forest-600" : "bg-white/60 ring-stone-200 hover:bg-white")}>
                        <span className="font-display text-5xl text-stone-900">{t}</span>
                        <span className="ml-1 text-sm text-stone-500">AM</span>
                        <span className="mt-2 block text-sm text-stone-500">{t === "9:00" ? "Quieter, great with little ones" : "Our fullest, most energetic"}</span>
                        {on && <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-forest-600 text-ink"><Check className="size-3.5" strokeWidth={3} /></span>}
                      </button>
                    );
                  })}
                </div>
                <Button size="lg" className="w-full" onClick={next}>Continue <ArrowRight /></Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <Heading title="Bringing any kids along?" body="We'll have name tags ready and show you exactly where to go." />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: true, l: "Yes, kids are coming" },
                    { v: false, l: "Just me or us grown-ups" },
                  ].map((o) => (
                    <button key={String(o.v)} onClick={() => setKids(o.v)} aria-pressed={kids === o.v} className={cn("rounded-3xl p-5 text-left text-[15px] font-medium ring-1 transition", kids === o.v ? "bg-white ring-2 ring-forest-600" : "bg-white/60 ring-stone-200 hover:bg-white")}>
                      <span className="mb-6 flex size-10 items-center justify-center rounded-2xl bg-stone-100 text-forest-700" aria-hidden>{o.v ? <Baby className="size-5" /> : <Coffee className="size-5" />}</span>
                      {o.l}
                    </button>
                  ))}
                </div>
                <AnimatePresence initial={false}>
                  {kids && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="flex items-center justify-between rounded-3xl bg-white p-5 ring-1 ring-stone-200">
                        <div>
                          <p className="font-medium text-stone-900">How many?</p>
                          <p className="text-sm text-stone-500">Optional, but helpful</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => setKidsCount((c) => Math.max(1, c - 1))} disabled={kidsCount <= 1} className="flex size-10 items-center justify-center rounded-full ring-1 ring-stone-200 hover:bg-stone-50 disabled:opacity-30" aria-label="Fewer kids"><Minus className="size-4" /></button>
                          <span className="w-6 text-center text-xl font-medium tabular-nums" aria-live="polite">{kidsCount}</span>
                          <button onClick={() => setKidsCount((c) => Math.min(8, c + 1))} className="flex size-10 items-center justify-center rounded-full ring-1 ring-stone-200 hover:bg-stone-50" aria-label="More kids"><Plus className="size-4" /></button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button size="lg" className="w-full" onClick={next} disabled={kids === null}>Save my visit <Check /></Button>
              </div>
            )}

            {step === 3 && <Confirmation name={firstName} date={visitDate} service={service} kids={kids ? kidsCount : 0} onDone={() => onOpenChange(false)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Sheet>
  );
}

function Heading({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-display text-4xl leading-[1.05] text-stone-900 sm:text-[42px]">{title}</h2>
      <p className="mt-3 text-[15px] text-stone-500">{body}</p>
    </div>
  );
}

function Confirmation({ name, date, service, kids, onDone }: { name: string; date: string; service: ServiceTime; kids: number; onDone: () => void }) {
  const jamie = staffById.jamie;
  return (
    <div className="text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }} className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest-700 text-ink">
        <Check className="size-7" strokeWidth={2.5} />
      </motion.div>
      <h2 className="mt-6 font-display text-[44px] leading-[1.02] text-stone-900">See you Sunday, {name.split(" ")[0]}!</h2>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-stone-500">We&apos;re saving you a spot. Here&apos;s everything in one place.</p>

      <div className="mt-8 overflow-hidden rounded-3xl bg-white text-left ring-1 ring-stone-200">
        <dl className="divide-y divide-stone-100">
          {[
            ["When", `${formatDay(date)} · ${service} AM`],
            ["Where", `${church.address}, ${church.city}`],
            ["Park", "Lots north, south, or across Oak St"],
            ["Kids", kids ? `${kids} kid${kids > 1 ? "s" : ""}, name tags ready at the blue desk` : "Just the grown-ups"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4 px-5 py-3.5 text-[15px]">
              <dt className="w-14 shrink-0 text-stone-400">{k}</dt>
              <dd className="text-stone-800">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-3 bg-forest-50 px-5 py-4">
          <Avatar name={jamie.name} src={jamie.photo} />
          <p className="text-sm text-forest-300">Jamie will meet you at the main entrance on Oak St.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            downloadIcs({ title: "Sunday at Gather Church", start: date, durationMin: 70, location: `${church.address}, ${church.city}`, description: "Look for the welcome tent out front. We can't wait to meet you." });
            toast("Calendar invite downloaded");
          }}
        >
          <CalendarPlus /> Add to calendar
        </Button>
        <Button asChild size="lg" onClick={onDone}>
          <Link href="/connect">Personalize my visit <ArrowRight /></Link>
        </Button>
      </div>
    </div>
  );
}
