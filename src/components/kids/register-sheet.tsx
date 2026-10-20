"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { church, kidGradeLabel, kidGradeOptions, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { KidInfo, ServiceTime } from "@/lib/types";
import { cn, downloadIcs, formatDay, isEmail, isPhone, nextDow } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3;
const blankKid = (lastName = ""): KidInfo => ({ firstName: "", lastName, group: "", allergies: "" });

const serviceStart = (iso: string, service: ServiceTime) => {
  const d = new Date(iso);
  d.setHours(service === "9:00" ? 9 : 10, service === "9:00" ? 0 : 30, 0, 0);
  return d.toISOString();
};

/** Parent pre-registration for Kids First: speeds up check-in on their first Sunday. */
export function KidsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { profile, saveKids } = useStore();
  const sundays = useMemo(() => [0, 1, 2].map((w) => nextDow(0, 9, 0, w)), []);
  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState(1);
  const [parentName, setParentName] = useState("");
  const [contact, setContact] = useState("");
  const [kids, setKids] = useState<KidInfo[]>([blankKid()]);
  const [date, setDate] = useState(sundays[0].toISOString());
  const [service, setService] = useState<ServiceTime>("10:30");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const r = profile.kids;
    setStep(0);
    setErrors({});
    setParentName(r?.parentName ?? profile.firstName ?? "");
    setContact(r?.contact ?? (profile.email || profile.phone));
    setKids(r?.kids?.length ? r.kids.map((k) => ({ ...k })) : [blankKid()]);
    const match = r && sundays.find((s) => s.toDateString() === new Date(r.date).toDateString());
    setDate((match ?? sundays[0]).toISOString());
    setService(r?.service ?? profile.visitPlan?.service ?? "10:30");
    setNotes(r?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const go = (s: Step) => {
    setDir(s > step ? 1 : -1);
    setStep(s);
  };
  const setKid = (i: number, patch: Partial<KidInfo>) => {
    setKids((ks) => ks.map((k, j) => (j === i ? { ...k, ...patch } : k)));
    setErrors((e) => ({ ...e, [`k${i}`]: "" }));
  };

  const next = () => {
    if (step === 0) {
      const e: Record<string, string> = {};
      if (!parentName.trim()) e.parent = "What's your name?";
      if (!isEmail(contact) && !isPhone(contact)) e.contact = "Add an email or a 10-digit phone number.";
      setErrors(e);
      if (!Object.keys(e).length) go(1);
    } else if (step === 1) {
      const e: Record<string, string> = {};
      kids.forEach((k, i) => {
        if (!k.firstName.trim() || !k.group) e[`k${i}`] = "Add a first name and pick a group.";
      });
      setErrors(e);
      if (!Object.keys(e).length) go(2);
    } else if (step === 2) {
      const last = parentName.trim().split(" ").slice(1).join(" ");
      saveKids({
        parentName: parentName.trim(),
        contact: contact.trim(),
        kids: kids.map((k) => ({ firstName: k.firstName.trim(), lastName: k.lastName.trim() || last, group: k.group, allergies: k.allergies?.trim() || undefined })),
        date: serviceStart(date, service),
        service,
        notes: notes.trim() || undefined,
      });
      go(3);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Pre-register your kids" hideTitle className="sm:w-[min(620px,calc(100vw-48px))]">
      <div className="px-6 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-10">
        {step < 3 && (
          <div className="mb-8 flex items-center gap-3 pr-10">
            {step > 0 && (
              <button onClick={() => go((step - 1) as Step)} className="-ml-2 flex size-9 items-center justify-center rounded-full text-stone-600 hover:bg-paper/5" aria-label="Back">
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of 3`}>
              {[0, 1, 2].map((i) => (
                <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-forest-700" : "bg-stone-200")} />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -24 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            {step === 0 && (
              <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-6" noValidate>
                <Heading title="Let's get your kids ready." body="Pre-registering takes two minutes and makes your first check-in a breeze. Name tags will be waiting." />
                <Field label="Your name" value={parentName} onChange={(e) => { setParentName(e.target.value); setErrors((x) => ({ ...x, parent: "" })); }} error={errors.parent} autoComplete="name" placeholder="Sarah Morgan" autoFocus />
                <Field label="Email or phone" value={contact} onChange={(e) => { setContact(e.target.value); setErrors((x) => ({ ...x, contact: "" })); }} error={errors.contact} autoComplete="email" hint="Used for check-in and to text you if your child needs you." />
                <Button type="submit" size="lg" className="w-full">Continue <ArrowRight /></Button>
              </form>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <Heading title="Who's coming?" body="Add each child. Students in 6th–12th grade meet Wednesday nights instead." />
                <ul className="space-y-3">
                  {kids.map((k, i) => (
                    <li key={i} className="space-y-4 rounded-2xl border-2 border-stone-200 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <p className="font-mori text-[15px] font-semibold text-stone-900">Child {i + 1}</p>
                        {kids.length > 1 && (
                          <button onClick={() => setKids((ks) => ks.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-clay" aria-label={`Remove child ${i + 1}`}>
                            <Trash2 className="size-3.5" /> Remove
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="First name" value={k.firstName} onChange={(e) => setKid(i, { firstName: e.target.value })} autoComplete="off" />
                        <Field label="Last name" optional value={k.lastName} onChange={(e) => setKid(i, { lastName: e.target.value })} autoComplete="off" />
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium text-stone-800">Age or grade</p>
                        <div role="radiogroup" aria-label={`Age or grade for child ${i + 1}`} className="flex flex-wrap gap-2">
                          {kidGradeOptions.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              role="radio"
                              aria-checked={k.group === g.id}
                              onClick={() => setKid(i, { group: g.id })}
                              className={cn("h-9 rounded-full border-2 px-3.5 text-sm transition", k.group === g.id ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 text-stone-700 hover:border-stone-300")}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Field label="Allergies or anything we should know" optional value={k.allergies ?? ""} onChange={(e) => setKid(i, { allergies: e.target.value })} autoComplete="off" placeholder="Peanuts, needs a nap at 10…" />
                      {errors[`k${i}`] && <p className="text-[13px] text-clay" role="alert">{errors[`k${i}`]}</p>}
                    </li>
                  ))}
                </ul>
                {kids.length < 6 && (
                  <button onClick={() => setKids((ks) => [...ks, blankKid(ks[0]?.lastName)])} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 text-sm text-stone-600 transition hover:border-forest-700 hover:text-forest-500">
                    <Plus className="size-4" /> Add another child
                  </button>
                )}
                <Button size="lg" className="w-full" onClick={next}>Continue <ArrowRight /></Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <Heading title="When's your first Sunday?" body="Kids First runs during both services. Come 10 minutes early for check-in." />
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto overflow-y-hidden px-1 py-1">
                  {sundays.map((s, i) => {
                    const on = new Date(date).toDateString() === s.toDateString();
                    return (
                      <button key={s.toISOString()} onClick={() => setDate(s.toISOString())} aria-pressed={on} className={cn("min-w-28 flex-1 rounded-2xl border-2 px-4 py-3 text-left transition", on ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 hover:border-stone-300")}>
                        <span className={cn("block text-xs", on ? "text-ink/70" : "text-stone-500")}>{i === 0 ? "This Sunday" : i === 1 ? "Next week" : "In 2 weeks"}</span>
                        <span className="mt-0.5 block font-mori font-semibold">{s.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(["9:00", "10:30"] as const).map((t) => {
                    const on = service === t;
                    return (
                      <button key={t} onClick={() => setService(t)} aria-pressed={on} className={cn("relative rounded-2xl border-2 p-5 text-left transition", on ? "border-forest-700" : "border-stone-200 hover:border-stone-300")}>
                        <span className="font-mori text-4xl font-semibold tracking-[-0.05em] text-stone-900">{t}</span>
                        <span className="ml-1 text-sm text-stone-500">AM</span>
                        {on && <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-forest-700 text-ink"><Check className="size-3.5" strokeWidth={3} /></span>}
                      </button>
                    );
                  })}
                </div>
                <Textarea label="Anything else? (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="First time away from us, special needs, a sibling who'd like to stay together…" />
                <Button size="lg" className="w-full" onClick={next}>Pre-register {kids.length === 1 ? kids[0].firstName || "my child" : `${kids.length} kids`} <Check /></Button>
                <p className="text-center text-xs text-stone-400">Simulated for this prototype. Nothing is sent.</p>
              </div>
            )}

            {step === 3 && <Done kids={kids} date={serviceStart(date, service)} service={service} onDone={() => onOpenChange(false)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Sheet>
  );
}

function Heading({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-mori text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-stone-900 sm:text-[42px]">{title}</h2>
      <p className="mt-3 text-[15px] text-stone-500">{body}</p>
    </div>
  );
}

function Done({ kids, date, service, onDone }: { kids: KidInfo[]; date: string; service: ServiceTime; onDone: () => void }) {
  const names = kids.map((k) => k.firstName).filter(Boolean);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} & ${names.at(-1)}` : names[0] || "Your child";
  const micah = staffById.micah;
  return (
    <div className="text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }} className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest-700 text-ink">
        <Check className="size-7" strokeWidth={2.5} />
      </motion.div>
      <h2 className="mt-6 font-mori text-[44px] font-semibold leading-[1] tracking-[-0.05em] text-stone-900">{list} {names.length > 1 ? "are" : "is"} all set!</h2>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-stone-500">Name tags will be ready at the Kids Welcome desk on {formatDay(date)}.</p>

      <ul className="mt-8 divide-y divide-stone-200/70 overflow-hidden rounded-2xl border-2 border-stone-200 text-left">
        {kids.map((k, i) => (
          <li key={i} className="flex items-center justify-between gap-4 px-5 py-3.5 text-[15px]">
            <span className="text-stone-900">{k.firstName} {k.lastName}</span>
            <span className="text-stone-500">{kidGradeLabel(k.group)}</span>
          </li>
        ))}
        <li className="flex items-center gap-3 bg-forest-50 px-5 py-4">
          <Avatar name={micah.name} src={micah.photo} />
          <p className="text-sm text-forest-300">Pastor Micah will look out for you at the {service} service. Arrive 10 minutes early.</p>
        </li>
      </ul>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            downloadIcs({ title: "Sunday at Rolla First (Kids First)", start: date, durationMin: 80, location: `${church.address}, ${church.city}`, description: "Check in at the Kids Welcome desk downstairs 10 minutes early." });
            toast("Added to your calendar");
          }}
        >
          <CalendarPlus /> Add to calendar
        </Button>
        <Button asChild size="lg" onClick={onDone}>
          <Link href="/me">Go to My Rolla First <ArrowRight /></Link>
        </Button>
      </div>
    </div>
  );
}
