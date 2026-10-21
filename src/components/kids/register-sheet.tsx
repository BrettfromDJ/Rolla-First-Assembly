"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { church, kidGradeLabel, kidGradeOptions, staffById, suggestGrade } from "@/lib/data";
import { useSite, useStore } from "@/lib/store";
import { atService, currentSite, meridiem, serviceClock } from "@/lib/site";
import type { Guardian, KidInfo, PickupPerson, ServiceTime } from "@/lib/types";
import { cn, downloadIcs, formatDay, isEmail, isPhone, nextDow } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3 | 4;
const STEPS = 4;
const blankKid = (lastName = ""): KidInfo => ({ firstName: "", lastName, nickname: "", birthdate: "", gender: "", grade: "", school: "", medicalNotes: "" });
const blankGuardian = (): Guardian => ({ firstName: "", lastName: "", phone: "", email: "" });
const blankPickup = (): PickupPerson => ({ name: "", relationship: "", phone: "" });
const todayYmd = () => new Date().toLocaleDateString("en-CA");
const tooOld = () => new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate()).toLocaleDateString("en-CA");

const serviceStart = (iso: string, service: ServiceTime) => atService(new Date(iso), currentSite(), service).toISOString();

/** Parent pre-registration for Kids First: collects what Planning Center Check-Ins needs to create the household. */
export function KidsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { profile, saveKids } = useStore();
  const site = useSite();
  const sundays = useMemo(() => [0, 1, 2].map((w) => nextDow(0, 9, 0, w)), []);
  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState(1);
  const [parent, setParent] = useState<Guardian & { email: string }>({ ...blankGuardian(), email: "" });
  const [second, setSecond] = useState<Guardian | null>(null);
  const [kids, setKids] = useState<KidInfo[]>([blankKid()]);
  const [pickup, setPickup] = useState<PickupPerson[]>([]);
  const [emergency, setEmergency] = useState({ name: "", phone: "" });
  const [date, setDate] = useState(sundays[0].toISOString());
  const [service, setService] = useState<ServiceTime>("10:30");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const r = profile.kids;
    setStep(0);
    setErrors({});
    setParent(r ? { ...r.parent } : { firstName: profile.firstName ?? "", lastName: "", phone: profile.phone ?? "", email: profile.email ?? "" });
    setSecond(r?.secondGuardian ? { ...r.secondGuardian } : null);
    setKids(r?.kids?.length ? r.kids.map((k) => ({ ...k })) : [blankKid()]);
    setPickup(r?.pickup?.map((p) => ({ ...p })) ?? []);
    setEmergency(r?.emergency ? { ...r.emergency } : { name: "", phone: "" });
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
  const clear = (...keys: string[]) => setErrors((e) => ({ ...e, ...Object.fromEntries(keys.map((k) => [k, ""])) }));
  const setKid = (i: number, patch: Partial<KidInfo>) => {
    setKids((ks) => ks.map((k, j) => (j === i ? { ...k, ...patch } : k)));
    clear(...Object.keys(patch).map((f) => `k${i}.${f}`));
  };
  const setPickupAt = (i: number, patch: Partial<PickupPerson>) => {
    setPickup((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
    clear(...Object.keys(patch).map((f) => `p${i}.${f}`));
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!parent.firstName.trim()) e.pFirst = "Add your first name.";
      if (!parent.lastName.trim()) e.pLast = "Add your last name.";
      if (!isPhone(parent.phone)) e.pPhone = "Add a 10-digit mobile number. We text it if your child needs you.";
      if (!isEmail(parent.email)) e.pEmail = "Add a valid email.";
      if (second) {
        if (!second.firstName.trim()) e.sFirst = "Add a first name.";
        if (!second.lastName.trim()) e.sLast = "Add a last name.";
        if (second.phone.trim() && !isPhone(second.phone)) e.sPhone = "Add a 10-digit number, or leave it blank.";
      }
    } else if (step === 1) {
      kids.forEach((k, i) => {
        if (!k.firstName.trim()) e[`k${i}.firstName`] = "Add a first name.";
        if (!k.birthdate) e[`k${i}.birthdate`] = "Add a birthdate.";
        else if (k.birthdate > todayYmd() || k.birthdate < tooOld()) e[`k${i}.birthdate`] = "Kids First is for birth through 5th grade. Check the date.";
        if (!k.gender) e[`k${i}.gender`] = "Pick one.";
        if (!k.grade) e[`k${i}.grade`] = "Pick a grade.";
      });
    } else if (step === 2) {
      pickup.forEach((p, i) => {
        if (!p.name.trim()) e[`p${i}.name`] = "Add a name, or remove this person.";
        if (p.phone?.trim() && !isPhone(p.phone)) e[`p${i}.phone`] = "Add a 10-digit number, or leave it blank.";
      });
      if (emergency.name.trim() && !isPhone(emergency.phone)) e.ePhone = "Add a 10-digit number for your emergency contact.";
      if (!emergency.name.trim() && emergency.phone.trim()) e.eName = "Add their name.";
    }
    return e;
  };

  const next = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < 3) return go((step + 1) as Step);
    const trim = (v?: string) => v?.trim() || undefined;
    const last = parent.lastName.trim();
    saveKids({
      parent: { firstName: parent.firstName.trim(), lastName: last, phone: parent.phone.trim(), email: parent.email.trim() },
      secondGuardian: second ? { firstName: second.firstName.trim(), lastName: second.lastName.trim(), phone: second.phone.trim(), email: trim(second.email) } : undefined,
      kids: kids.map((k) => ({
        firstName: k.firstName.trim(),
        lastName: k.lastName.trim() || last,
        nickname: trim(k.nickname),
        birthdate: k.birthdate,
        gender: k.gender,
        grade: k.grade,
        school: trim(k.school),
        medicalNotes: trim(k.medicalNotes),
      })),
      pickup: pickup.map((p) => ({ name: p.name.trim(), relationship: trim(p.relationship), phone: trim(p.phone) })),
      emergency: emergency.name.trim() ? { name: emergency.name.trim(), phone: emergency.phone.trim() } : undefined,
      date: serviceStart(date, service),
      service,
      notes: trim(notes),
    });
    go(4);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Pre-register your kids" hideTitle className="sm:w-[min(620px,calc(100vw-48px))]">
      <div className="px-6 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-10">
        {step < STEPS && (
          <div className="mb-8 flex items-center gap-3 pr-10">
            {step > 0 && (
              <button onClick={() => go((step - 1) as Step)} className="-ml-2 flex size-9 items-center justify-center rounded-full text-stone-600 hover:bg-paper/5" aria-label="Back">
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of ${STEPS}`}>
              {Array.from({ length: STEPS }, (_, i) => (
                <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-forest-700" : "bg-stone-200")} />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -24 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            {step === 0 && (
              <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-6" noValidate>
                <Heading title="Let's get your kids ready" body="Pre-registering takes a few minutes and makes your first check-in a breeze. Name tags will be waiting." />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Your first name" value={parent.firstName} onChange={(e) => { setParent((p) => ({ ...p, firstName: e.target.value })); clear("pFirst"); }} error={errors.pFirst} autoComplete="given-name" autoFocus />
                  <Field label="Your last name" value={parent.lastName} onChange={(e) => { setParent((p) => ({ ...p, lastName: e.target.value })); clear("pLast"); }} error={errors.pLast} autoComplete="family-name" />
                </div>
                <Field label="Mobile phone" type="tel" inputMode="tel" value={parent.phone} onChange={(e) => { setParent((p) => ({ ...p, phone: e.target.value })); clear("pPhone"); }} error={errors.pPhone} autoComplete="tel" placeholder="(573) 555-0123" hint="We'll text this number if your child needs you during the service." />
                <Field label="Email" type="email" value={parent.email} onChange={(e) => { setParent((p) => ({ ...p, email: e.target.value })); clear("pEmail"); }} error={errors.pEmail} autoComplete="email" placeholder="you@example.com" />

                {second ? (
                  <div className="space-y-4 rounded-2xl border-2 border-stone-200 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-mori text-[15px] font-semibold text-stone-900">Second parent or guardian</p>
                      <button type="button" onClick={() => { setSecond(null); clear("sFirst", "sLast", "sPhone"); }} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-clay">
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="First name" value={second.firstName} onChange={(e) => { setSecond((g) => g && { ...g, firstName: e.target.value }); clear("sFirst"); }} error={errors.sFirst} autoComplete="off" />
                      <Field label="Last name" value={second.lastName} onChange={(e) => { setSecond((g) => g && { ...g, lastName: e.target.value }); clear("sLast"); }} error={errors.sLast} autoComplete="off" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Mobile phone" optional type="tel" inputMode="tel" value={second.phone} onChange={(e) => { setSecond((g) => g && { ...g, phone: e.target.value }); clear("sPhone"); }} error={errors.sPhone} autoComplete="off" />
                      <Field label="Email" optional type="email" value={second.email ?? ""} onChange={(e) => setSecond((g) => g && { ...g, email: e.target.value })} autoComplete="off" />
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setSecond({ ...blankGuardian(), lastName: parent.lastName })} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 text-sm text-stone-600 transition hover:border-forest-700 hover:text-forest-500">
                    <Plus className="size-4" /> Add a second parent or guardian
                  </button>
                )}
                <Button type="submit" size="lg" className="w-full">Continue <ArrowRight /></Button>
              </form>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <Heading title="Who's coming?" body="Add each child. We use birthdate and grade to get them to the right room. Students in 6th–12th grade meet Wednesday nights instead." />
                <ul className="space-y-3">
                  {kids.map((k, i) => {
                    const err = (f: string) => errors[`k${i}.${f}`];
                    return (
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
                          <Field label="First name" value={k.firstName} onChange={(e) => setKid(i, { firstName: e.target.value })} error={err("firstName")} autoComplete="off" />
                          <Field label="Last name" value={k.lastName} onChange={(e) => setKid(i, { lastName: e.target.value })} placeholder={parent.lastName} hint={!k.lastName && parent.lastName ? `We'll use ${parent.lastName}` : undefined} autoComplete="off" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Goes by" optional value={k.nickname ?? ""} onChange={(e) => setKid(i, { nickname: e.target.value })} placeholder="Nickname for their name tag" autoComplete="off" />
                          <Field
                            label="Birthdate"
                            type="date"
                            value={k.birthdate}
                            min={tooOld()}
                            max={todayYmd()}
                            onChange={(e) => {
                              const birthdate = e.target.value;
                              const g = !k.grade && suggestGrade(birthdate);
                              setKid(i, g ? { birthdate, grade: g } : { birthdate });
                            }}
                            error={err("birthdate")}
                          />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-stone-800">Gender</p>
                          <div role="radiogroup" aria-label={`Gender for child ${i + 1}`} className="flex gap-2">
                            {([["M", "Boy"], ["F", "Girl"]] as const).map(([v, l]) => (
                              <button key={v} type="button" role="radio" aria-checked={k.gender === v} onClick={() => setKid(i, { gender: v })} className={cn("h-9 min-w-20 rounded-full border-2 px-4 text-sm transition", k.gender === v ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 text-stone-700 hover:border-stone-300")}>
                                {l}
                              </button>
                            ))}
                          </div>
                          {err("gender") && <p className="mt-2 text-[13px] text-clay">{err("gender")}</p>}
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-stone-800">Grade this school year</p>
                          <div role="radiogroup" aria-label={`Grade for child ${i + 1}`} className="flex flex-wrap gap-2">
                            {kidGradeOptions.map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                role="radio"
                                aria-checked={k.grade === g.id}
                                onClick={() => setKid(i, { grade: g.id })}
                                className={cn("h-9 rounded-full border-2 px-3.5 text-sm transition", k.grade === g.id ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 text-stone-700 hover:border-stone-300")}
                              >
                                {g.label}
                                {g.hint && <span className={cn("ml-1.5 text-xs", k.grade === g.id ? "text-ink/70" : "text-stone-400")}>{g.hint}</span>}
                              </button>
                            ))}
                          </div>
                          {err("grade") && <p className="mt-2 text-[13px] text-clay">{err("grade")}</p>}
                        </div>
                        <Field label="School" optional value={k.school ?? ""} onChange={(e) => setKid(i, { school: e.target.value })} placeholder="Mark Twain Elementary" autoComplete="off" />
                        <Field label="Allergies or medical notes" optional value={k.medicalNotes ?? ""} onChange={(e) => setKid(i, { medicalNotes: e.target.value })} placeholder="Peanut allergy, inhaler in diaper bag…" hint="Prints on your child's name tag so every leader sees it." autoComplete="off" />
                      </li>
                    );
                  })}
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
              <div className="space-y-6">
                <Heading title="Pickup & safety" body="Only you and the adults you list here can pick up your kids. Both are optional, and you can add people at the desk too." />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-stone-800">Anyone else allowed to pick up?</p>
                  {pickup.map((p, i) => (
                    <div key={i} className="space-y-3 rounded-2xl border-2 border-stone-200 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <p className="font-mori text-[15px] font-semibold text-stone-900">Trusted adult {i + 1}</p>
                        <button onClick={() => setPickup((ps) => ps.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-clay" aria-label={`Remove trusted adult ${i + 1}`}>
                          <Trash2 className="size-3.5" /> Remove
                        </button>
                      </div>
                      <Field label="Full name" value={p.name} onChange={(e) => setPickupAt(i, { name: e.target.value })} error={errors[`p${i}.name`]} autoComplete="off" />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Relationship" optional value={p.relationship ?? ""} onChange={(e) => setPickupAt(i, { relationship: e.target.value })} placeholder="Grandma" autoComplete="off" />
                        <Field label="Phone" optional type="tel" inputMode="tel" value={p.phone ?? ""} onChange={(e) => setPickupAt(i, { phone: e.target.value })} error={errors[`p${i}.phone`]} autoComplete="off" />
                      </div>
                    </div>
                  ))}
                  {pickup.length < 4 && (
                    <button onClick={() => setPickup((ps) => [...ps, blankPickup()])} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 text-sm text-stone-600 transition hover:border-forest-700 hover:text-forest-500">
                      <Plus className="size-4" /> Add a trusted adult
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-stone-800">Emergency contact <span className="font-normal text-stone-400">(if we can&apos;t reach you)</span></p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name" optional value={emergency.name} onChange={(e) => { setEmergency((x) => ({ ...x, name: e.target.value })); clear("eName", "ePhone"); }} error={errors.eName} autoComplete="off" />
                    <Field label="Phone" optional type="tel" inputMode="tel" value={emergency.phone} onChange={(e) => { setEmergency((x) => ({ ...x, phone: e.target.value })); clear("eName", "ePhone"); }} error={errors.ePhone} autoComplete="off" />
                  </div>
                </div>
                <p className="flex gap-3 rounded-2xl bg-stone-100 p-4 text-[13px] leading-relaxed text-stone-600">
                  <Lock className="mt-0.5 size-4 shrink-0 text-forest-500" />
                  <span>
                    Is there someone who should <span className="font-medium text-stone-900">not</span> pick up your child, or a custody situation we should know about? Please tell {staffById.debbie.name.split(" ")[0]} privately at {staffById.debbie.email} or at the Kids Welcome desk. We&apos;ll handle it with care.
                  </span>
                </p>
                <Button size="lg" className="w-full" onClick={next}>Continue <ArrowRight /></Button>
              </div>
            )}

            {step === 3 && (
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
                        <span className="font-mori text-4xl font-semibold tracking-[-0.05em] text-stone-900">{serviceClock(site, t)}</span>
                        <span className="ml-1 text-sm text-stone-500">{meridiem(site.sunday[t === "9:00" ? 0 : 1])}</span>
                        {on && <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-forest-700 text-ink"><Check className="size-3.5" strokeWidth={3} /></span>}
                      </button>
                    );
                  })}
                </div>
                <Textarea label="Anything else?" optional value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="First time away from us, special needs, a sibling who'd like to stay together…" />
                <Button size="lg" className="w-full" onClick={next}>Pre-register {kids.length === 1 ? kids[0].firstName || "my child" : `${kids.length} kids`} <Check /></Button>
                <p className="text-center text-xs text-stone-400">Simulated for this prototype. Nothing is sent.</p>
              </div>
            )}

            {step === 4 && <Done kids={kids} date={serviceStart(date, service)} service={service} onDone={() => onOpenChange(false)} />}
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
            <span className="text-stone-900">{k.nickname ? `${k.nickname} (${k.firstName})` : k.firstName} {k.lastName}</span>
            <span className="text-stone-500">{kidGradeLabel(k.grade)}</span>
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
