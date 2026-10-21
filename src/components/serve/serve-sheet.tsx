"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Mic2, ShieldCheck } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Checkbox, Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { staffById } from "@/lib/data";
import { frequencyOptions, serveTimeOptions, teamById } from "@/lib/serve";
import { useStore } from "@/lib/store";
import type { ServeFrequency, ServeTime } from "@/lib/types";
import { cn, isEmail, isPhone } from "@/lib/utils";

type Step = 0 | 1 | 2;

/** (573) 555-0123 for a 10-digit US number; anything else is kept as typed. */
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : v.trim();
};

/** Team details, then a one-minute sign-up. */
export function ServeSheet({ teamId, onOpenChange }: { teamId: string | null; onOpenChange: (o: boolean) => void }) {
  const { profile, serve, submitServe } = useStore();
  // Keep showing the last team while the sheet animates closed.
  const [shownId, setShownId] = useState<string | null>(teamId);
  useEffect(() => {
    if (teamId) setShownId(teamId);
  }, [teamId]);
  const t = shownId ? teamById[shownId] : null;

  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teen, setTeen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [times, setTimes] = useState<ServeTime[]>([]);
  const [frequency, setFrequency] = useState<ServeFrequency>("monthly");
  const [experience, setExperience] = useState("");
  const [shadowFirst, setShadowFirst] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!teamId) return;
    const team = teamById[teamId];
    const prev = serve.find((s) => s.isYou && s.teamId === teamId);
    setStep(0);
    setErrors({});
    setFirstName(prev?.firstName ?? profile.firstName ?? "");
    setLastName(prev?.lastName ?? "");
    setEmail(prev?.email ?? profile.email ?? "");
    setPhone(prev?.phone ?? profile.phone ?? "");
    setTeen(prev?.teen ?? false);
    setRoles(prev?.roles ?? []);
    setTimes(prev?.times ?? (team.times.length === 1 ? team.times : []));
    setFrequency(prev?.frequency ?? "monthly");
    setExperience(prev?.experience ?? "");
    setShadowFirst(prev?.shadowFirst ?? true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  if (!t) return null;
  const leader = staffById[t.leaderId];
  const lead = leader.name.split(" ")[0];
  const adultsOnly = (t.minAge ?? 0) >= 18;
  const teenBlocked = teen && adultsOnly && !t.teensWith;

  const go = (s: Step) => {
    setDir(s > step ? 1 : -1);
    setStep(s);
  };
  const flip = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.first = "Add your first name.";
    if (!lastName.trim()) e.last = "Add your last name.";
    if (!isEmail(email)) e.email = "Add a valid email.";
    if (!isPhone(phone)) e.phone = "Add a 10-digit phone number.";
    if (!times.length) e.times = "Pick at least one time that works.";
    if (teenBlocked) e.teen = `${t.name} is for adults ${t.minAge} and older.`;
    setErrors(e);
    if (Object.keys(e).length) return;
    submitServe({
      teamId: t.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: formatPhone(phone),
      teen,
      roles,
      times,
      frequency,
      experience: experience.trim() || undefined,
      shadowFirst,
      backgroundCheck: t.backgroundCheck ? "needed" : undefined,
    });
    go(2);
  };

  return (
    <Sheet open={!!teamId} onOpenChange={onOpenChange} title={`Serve on ${t.name}`} hideTitle className="sm:w-[min(620px,calc(100vw-48px))]">
      <div className="px-6 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-10">
        {step === 1 && (
          <button onClick={() => go(0)} className="-ml-2 mb-6 flex size-9 items-center justify-center rounded-full text-stone-600 hover:bg-paper/5" aria-label="Back">
            <ArrowLeft className="size-4" />
          </button>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -24 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            {step === 0 && (
              <div className="space-y-7">
                <div className="pr-10">
                  <h2 className="font-mori text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-stone-900 sm:text-[42px]">{t.name}</h2>
                  <p className="mt-3 text-[16px] text-stone-500">{t.tagline}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">What you&apos;ll do</p>
                  <ul className="mt-3 space-y-2.5">
                    {t.does.map((d) => (
                      <li key={d} className="flex gap-3 text-[15px] text-stone-700">
                        <Check className="mt-0.5 size-4 shrink-0 text-forest-500" strokeWidth={2.5} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <dl className="divide-y divide-stone-200/70 overflow-hidden rounded-2xl border-2 border-stone-200 text-[15px]">
                  {[
                    ["When", t.when],
                    ["How often", t.commitment],
                    ["Age", t.minAge ? `${t.minAge} and up${t.teensWith ? `. ${t.teensWith}` : ""}` : "Anyone"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-4 px-5 py-3.5">
                      <dt className="w-24 shrink-0 text-stone-400">{k}</dt>
                      <dd className="text-stone-800">{v}</dd>
                    </div>
                  ))}
                </dl>
                {(t.backgroundCheck || t.audition) && (
                  <div className="space-y-2">
                    {t.backgroundCheck && (
                      <p className="flex gap-3 rounded-2xl bg-stone-100 p-4 text-[14px] text-stone-600">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest-500" />
                        Everyone on this team completes a free background check and a short safety training before serving.
                      </p>
                    )}
                    {t.audition && (
                      <p className="flex gap-3 rounded-2xl bg-stone-100 p-4 text-[14px] text-stone-600">
                        <Mic2 className="mt-0.5 size-4 shrink-0 text-forest-500" />
                        {lead} will set up a relaxed audition so we can find the right spot for you.
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Avatar name={leader.name} src={leader.photo} />
                  <p className="text-[14px] text-stone-500">
                    Led by <span className="text-stone-800">{leader.name}</span>, {leader.role}
                  </p>
                </div>
                <Button size="lg" className="w-full" onClick={() => go(1)}>
                  Sign up for {t.name} <ArrowRight />
                </Button>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate className="space-y-6">
                <div>
                  <h2 className="font-mori text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-stone-900 sm:text-[42px]">Tell us about you</h2>
                  <p className="mt-3 text-[15px] text-stone-500">{lead} will use this to reach out and find a Sunday to start.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="First name" value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors((x) => ({ ...x, first: "" })); }} error={errors.first} autoComplete="given-name" />
                  <Field label="Last name" value={lastName} onChange={(e) => { setLastName(e.target.value); setErrors((x) => ({ ...x, last: "" })); }} error={errors.last} autoComplete="family-name" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: "" })); }} error={errors.email} autoComplete="email" />
                  <Field label="Mobile phone" type="tel" inputMode="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((x) => ({ ...x, phone: "" })); }} error={errors.phone} autoComplete="tel" />
                </div>
                <div>
                  <Checkbox checked={teen} onChange={(v) => { setTeen(v); setErrors((x) => ({ ...x, teen: "" })); }}>I&apos;m under 18</Checkbox>
                  {teen && (
                    <p className={cn("mt-2 pl-8 text-[13px]", teenBlocked ? "text-clay" : "text-stone-500")}>
                      {teenBlocked
                        ? `${t.name} is for adults ${t.minAge} and older. Welcome, Production, and Facilities are great teams for students.`
                        : adultsOnly && t.teensWith
                          ? `${t.teensWith} We'll check with a parent before you start.`
                          : "Awesome. We'll check with a parent before you start."}
                    </p>
                  )}
                </div>

                <fieldset>
                  <legend className="mb-2.5 text-sm font-medium text-stone-800">
                    What would you like to do? <span className="font-normal text-stone-400">Optional</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {t.roles.map((r) => (
                      <Pill key={r} on={roles.includes(r)} onClick={() => setRoles(flip(roles, r))}>{r}</Pill>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2.5 text-sm font-medium text-stone-800">When can you serve?</legend>
                  <div className="flex flex-wrap gap-2">
                    {serveTimeOptions.filter((o) => t.times.includes(o.id)).map((o) => (
                      <Pill key={o.id} on={times.includes(o.id)} onClick={() => { setTimes(flip(times, o.id)); setErrors((x) => ({ ...x, times: "" })); }}>{o.label}</Pill>
                    ))}
                  </div>
                  {errors.times && <p className="mt-2 text-[13px] text-clay">{errors.times}</p>}
                </fieldset>

                <fieldset>
                  <legend className="mb-2.5 text-sm font-medium text-stone-800">How often?</legend>
                  <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {frequencyOptions.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        role="radio"
                        aria-checked={frequency === f.id}
                        onClick={() => setFrequency(f.id)}
                        className={cn("h-11 rounded-xl border-2 px-2 text-sm transition", frequency === f.id ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 text-stone-700 hover:border-stone-300")}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <Textarea label="Any experience?" optional value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="None is totally fine. We'll train you." />
                <Checkbox checked={shadowFirst} onChange={setShadowFirst}>I&apos;d like to shadow someone for a Sunday first</Checkbox>

                <Button type="submit" size="lg" className="w-full">
                  Sign me up <Check />
                </Button>
                <p className="text-center text-xs text-stone-400">Simulated for this prototype. Nothing is sent.</p>
              </form>
            )}

            {step === 2 && (
              <div className="text-center">
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }} className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest-700 text-ink">
                  <Check className="size-7" strokeWidth={2.5} />
                </motion.div>
                <h2 className="mt-6 font-mori text-[44px] font-semibold leading-[1] tracking-[-0.05em] text-stone-900">You&apos;re in, {firstName.trim().split(" ")[0]}!</h2>
                <p className="mx-auto mt-3 max-w-sm text-[15px] text-stone-500">Thanks for raising your hand to serve on {t.name}. Here&apos;s what happens next.</p>
                <ol className="mt-8 divide-y divide-stone-200/70 overflow-hidden rounded-2xl border-2 border-stone-200 text-left text-[15px]">
                  {[
                    `${lead} will reach out within a week to say hi.`,
                    shadowFirst ? "You'll shadow someone for a Sunday before joining the schedule." : "You'll pick a first Sunday together.",
                    ...(t.backgroundCheck ? ["We'll email a link for a free background check and a short training."] : []),
                    ...(t.audition ? [`${lead} will set up a relaxed audition.`] : []),
                  ].map((x, i) => (
                    <li key={i} className="flex gap-4 px-5 py-3.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-forest-700 font-mori text-[12px] font-semibold text-ink">{i + 1}</span>
                      <span className="text-stone-800">{x}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Button variant="secondary" size="lg" onClick={() => onOpenChange(false)}>See more teams</Button>
                  <Button asChild size="lg" onClick={() => onOpenChange(false)}>
                    <Link href="/me">Go to My Rolla First <ArrowRight /></Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Sheet>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn("h-10 rounded-full border-2 px-4 text-sm transition", on ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 text-stone-700 hover:border-stone-300")}
    >
      {children}
    </button>
  );
}
