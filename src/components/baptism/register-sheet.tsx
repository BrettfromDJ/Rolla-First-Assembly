"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Minus, Plus } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Checkbox, Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { baptism, baptismDates, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { BaptismAge, ServiceTime } from "@/lib/types";
import { cn, formatDay, isEmail, isPhone } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3;

const ages: { id: BaptismAge; label: string; hint: string }[] = [
  { id: "adult", label: "Me", hint: "18 or older" },
  { id: "student", label: "Me, a student", hint: "Ages 13–17" },
  { id: "child", label: "My child", hint: "12 and under" },
];

const serviceStart = (iso: string, service: ServiceTime) => {
  const d = new Date(iso);
  d.setHours(service === "9:00" ? 9 : 10, service === "9:00" ? 0 : 30, 0, 0);
  return d.toISOString();
};

export function BaptismSheet({ open, onOpenChange, initialDate }: { open: boolean; onOpenChange: (o: boolean) => void; initialDate?: string }) {
  const { profile, saveBaptism } = useStore();
  const dates = useMemo(() => baptismDates(3), []);
  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState(1);
  const [age, setAge] = useState<BaptismAge>("adult");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [parentName, setParentName] = useState("");
  const [contact, setContact] = useState("");
  const [date, setDate] = useState("");
  const [service, setService] = useState<ServiceTime>("10:30");
  const [story, setStory] = useState("");
  const [okToShare, setOkToShare] = useState(false);
  const [guests, setGuests] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Start from the visitor's existing registration (editing) or what we already know about them.
  useEffect(() => {
    if (!open) return;
    const b = profile.baptism;
    setStep(0);
    setErrors({});
    setAge(b?.age ?? "adult");
    setFirstName(b?.firstName ?? profile.firstName);
    setLastName(b?.lastName ?? "");
    setParentName(b?.parentName ?? "");
    setContact(b?.contact ?? (profile.email || profile.phone));
    const want = initialDate ?? b?.date;
    const match = want ? dates.find((d) => d.date.toDateString() === new Date(want).toDateString()) : undefined;
    setDate((match ?? dates[0]).date.toISOString());
    setService(b?.service ?? "10:30");
    setStory(b?.story ?? "");
    setOkToShare(b?.okToShare ?? false);
    setGuests(b?.guests ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const chosen = dates.find((d) => d.date.toISOString() === date) ?? dates[0];
  const go = (s: Step) => {
    setDir(s > step ? 1 : -1);
    setStep(s);
  };

  const next = () => {
    if (step === 0) {
      const e: Record<string, string> = {};
      if (!firstName.trim()) e.first = age === "child" ? "Your child's first name, please." : "What should we call you?";
      if (!lastName.trim()) e.last = "We'll need a last name for the certificate.";
      if (age === "child" && !parentName.trim()) e.parent = "Who's the parent or guardian?";
      if (!isEmail(contact) && !isPhone(contact)) e.contact = "Add an email or a 10-digit phone number.";
      setErrors(e);
      if (Object.keys(e).length) return;
      go(1);
    } else if (step === 1) go(2);
    else if (step === 2) {
      saveBaptism({
        age,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        parentName: age === "child" ? parentName.trim() : undefined,
        contact: contact.trim(),
        date: serviceStart(chosen.date.toISOString(), service),
        service,
        story: story.trim() || undefined,
        okToShare,
        guests,
      });
      go(3);
    }
  };

  const who = age === "child" ? firstName.split(" ")[0] || "your child" : "you";

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Register for baptism" hideTitle className="sm:w-[min(620px,calc(100vw-48px))]">
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
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-6" noValidate>
                <Heading title="Who's being baptized?" body="This is a big deal, and we're so glad. Let's start with a few details." />
                <div role="radiogroup" aria-label="Who's being baptized" className="grid grid-cols-3 gap-2">
                  {ages.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      role="radio"
                      aria-checked={age === a.id}
                      onClick={() => setAge(a.id)}
                      className={cn("rounded-2xl border-2 px-3 py-3 text-left transition", age === a.id ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 hover:border-stone-300")}
                    >
                      <span className="block font-mori text-[15px] font-semibold">{a.label}</span>
                      <span className={cn("block text-xs", age === a.id ? "text-ink/70" : "text-stone-500")}>{a.hint}</span>
                    </button>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={age === "child" ? "Child's first name" : "First name"} value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors((x) => ({ ...x, first: "" })); }} error={errors.first} autoComplete={age === "child" ? "off" : "given-name"} autoFocus />
                  <Field label={age === "child" ? "Child's last name" : "Last name"} value={lastName} onChange={(e) => { setLastName(e.target.value); setErrors((x) => ({ ...x, last: "" })); }} error={errors.last} autoComplete={age === "child" ? "off" : "family-name"} />
                </div>
                {age === "child" && (
                  <Field label="Parent or guardian" value={parentName} onChange={(e) => { setParentName(e.target.value); setErrors((x) => ({ ...x, parent: "" })); }} error={errors.parent} autoComplete="name" hint="Pastor Micah meets with every family before a child's baptism." />
                )}
                <Field
                  label={age === "child" ? "Parent's email or phone" : "Email or phone"}
                  value={contact}
                  onChange={(e) => { setContact(e.target.value); setErrors((x) => ({ ...x, contact: "" })); }}
                  error={errors.contact}
                  autoComplete="email"
                  hint={age === "student" ? "We'll also loop in a parent before the big day." : "We'll send the details and a reminder before the class."}
                />
                <Button type="submit" size="lg" className="w-full">Continue <ArrowRight /></Button>
              </form>
            )}

            {step === 1 && (
              <div className="space-y-7">
                <Heading title="Pick your Sunday" body="Baptisms happen during both services. Choose whichever fits your family." />
                <div className="grid gap-2 sm:grid-cols-3">
                  {dates.map((d, i) => {
                    const on = d.date.toISOString() === date;
                    return (
                      <button
                        key={d.date.toISOString()}
                        onClick={() => setDate(d.date.toISOString())}
                        aria-pressed={on}
                        className={cn("rounded-2xl border-2 px-4 py-3 text-left transition", on ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 hover:border-stone-300")}
                      >
                        <span className={cn("block text-xs", on ? "text-ink/70" : "text-stone-500")}>{i === 0 ? "Next baptism" : d.date.toLocaleDateString("en-US", { month: "long" })}</span>
                        <span className="mt-0.5 block font-mori text-[17px] font-semibold">{d.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
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
                <p className="rounded-2xl border-2 border-stone-200 p-4 text-[15px] text-stone-500">
                  Before the day, a pastor will reach out to hear your story, answer any questions, and walk you through what happens.
                </p>
                <Button size="lg" className="w-full" onClick={next}>Continue <ArrowRight /></Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <Heading title={age === "child" ? "Almost done" : "Share your story"} body={age === "child" ? "A couple of optional details to help us celebrate with your family." : "Optional, but we'd love to hear it. A sentence or two is plenty."} />
                {age !== "child" && (
                  <div className="space-y-3">
                    <Textarea label="What has God been doing in your life?" value={story} onChange={(e) => setStory(e.target.value)} placeholder="When did you put your faith in Jesus? What made you want to take this step?" />
                    <Checkbox checked={okToShare} onChange={setOkToShare}>
                      <span className="font-medium text-stone-800">It&apos;s okay to share my story during the service.</span>
                      <span className="mt-0.5 block text-stone-500">We&apos;ll always check with you first. Totally fine to say no.</span>
                    </Checkbox>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-2xl border-2 border-stone-200 p-5">
                  <div>
                    <p className="font-medium text-stone-900">Friends &amp; family coming</p>
                    <p className="text-sm text-stone-500">We&apos;ll save seats up front.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setGuests((g) => Math.max(0, g - 1))} disabled={guests <= 0} className="flex size-10 items-center justify-center rounded-full border-2 border-stone-200 hover:border-stone-300 disabled:opacity-30" aria-label="Fewer guests"><Minus className="size-4" /></button>
                    <span className="w-6 text-center text-xl font-medium tabular-nums" aria-live="polite">{guests}</span>
                    <button onClick={() => setGuests((g) => Math.min(30, g + 1))} className="flex size-10 items-center justify-center rounded-full border-2 border-stone-200 hover:border-stone-300" aria-label="More guests"><Plus className="size-4" /></button>
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={next}>Register for baptism <Check /></Button>
                <p className="text-center text-xs text-stone-400">Simulated for this prototype. Nothing is sent.</p>
              </div>
            )}

            {step === 3 && (
              <Confirmation
                name={firstName.split(" ")[0]}
                who={who}
                date={serviceStart(chosen.date.toISOString(), service)}
                service={service}
                child={age === "child"}
                onDone={() => onOpenChange(false)}
              />
            )}
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

function Confirmation({ name, who, date, service, child, onDone }: { name: string; who: string; date: string; service: ServiceTime; child: boolean; onDone: () => void }) {
  const pastor = child ? staffById.micah : staffById[baptism.hostId];
  return (
    <div className="text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }} className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest-700 text-ink">
        <Check className="size-7" strokeWidth={2.5} />
      </motion.div>
      <h2 className="mt-6 font-mori text-[44px] font-semibold leading-[1] tracking-[-0.05em] text-stone-900">
        {child ? `${name} is registered!` : `You're registered, ${name}!`}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-stone-500">We&apos;re celebrating with {who === "you" ? "you" : `${who} and your family`}. Here&apos;s everything in one place.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border-2 border-stone-200 text-left">
        <dl className="divide-y divide-stone-200/70">
          {[
            ["Baptism", `${formatDay(date)} · ${service} AM service`],
            ["Bring", "A change of clothes. We'll have a shirt and towels."],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4 px-5 py-3.5 text-[15px]">
              <dt className="w-16 shrink-0 text-stone-400">{k}</dt>
              <dd className="text-stone-800">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-3 bg-forest-50 px-5 py-4">
          <Avatar name={pastor.name} src={pastor.photo} />
          <p className="text-sm text-forest-300">Pastor {pastor.name.split(" ")[0]} will reach out this week to say congrats and talk through the day.</p>
        </div>
      </div>

      <div className="mt-6">
      </div>
      <Button asChild size="lg" className="mt-3 w-full" onClick={onDone}>
        <Link href="/me">Go to My Rolla First <ArrowRight /></Link>
      </Button>
    </div>
  );
}
