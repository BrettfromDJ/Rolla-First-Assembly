"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Checkbox, Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { church, staffById } from "@/lib/data";
import { gradeLabel, studentGrades, studentsInfo } from "@/lib/students";
import { useStore } from "@/lib/store";
import type { Guardian, StudentInfo } from "@/lib/types";
import { cn, downloadIcs, formatDay, isEmail, isPhone, nextDow } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3;
const STEPS = 3;
const blank = (lastName = ""): StudentInfo => ({ firstName: "", lastName, grade: "", school: "", medicalNotes: "", phone: "" });

/** (573) 555-0123 for a 10-digit US number; anything else is kept as typed. */
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : v.trim();
};

/** A parent signs up their 7th–12th graders for Wednesday nights. */
export function StudentsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { profile, saveStudents } = useStore();
  const weds = useMemo(() => [0, 1, 2].map((w) => nextDow(3, 18, 30, w)), []);
  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState(1);
  const [parent, setParent] = useState<Guardian & { email: string }>({ firstName: "", lastName: "", phone: "", email: "" });
  const [students, setStudents] = useState<StudentInfo[]>([blank()]);
  const [date, setDate] = useState(weds[0].toISOString());
  const [parentTexts, setParentTexts] = useState(true);
  const [studentTexts, setStudentTexts] = useState(true);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const r = profile.students;
    setStep(0);
    setErrors({});
    setParent(r ? { ...r.parent } : { firstName: profile.firstName ?? "", lastName: profile.kids?.parent.lastName ?? "", phone: profile.phone ?? "", email: profile.email ?? "" });
    setStudents(r?.students?.length ? r.students.map((s) => ({ ...s })) : [blank(profile.kids?.parent.lastName)]);
    const match = r && weds.find((w) => w.toDateString() === new Date(r.date).toDateString());
    setDate((match ?? weds[0]).toISOString());
    setParentTexts(r?.parentTexts ?? true);
    setStudentTexts(r?.studentTexts ?? true);
    setNotes(r?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const go = (s: Step) => {
    setDir(s > step ? 1 : -1);
    setStep(s);
  };
  const clear = (...k: string[]) => setErrors((e) => ({ ...e, ...Object.fromEntries(k.map((x) => [x, ""])) }));
  const setStudent = (i: number, patch: Partial<StudentInfo>) => {
    setStudents((ss) => ss.map((s, j) => (j === i ? { ...s, ...patch } : s)));
    clear(...Object.keys(patch).map((f) => `s${i}.${f}`));
  };
  const anyStudentPhone = students.some((s) => s.phone?.trim());

  const next = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!parent.firstName.trim()) e.pFirst = "Add your first name.";
      if (!parent.lastName.trim()) e.pLast = "Add your last name.";
      if (!isPhone(parent.phone)) e.pPhone = "Add a 10-digit mobile number.";
      if (!isEmail(parent.email)) e.pEmail = "Add a valid email.";
    } else if (step === 1) {
      students.forEach((s, i) => {
        if (!s.firstName.trim()) e[`s${i}.firstName`] = "Add a first name.";
        if (!s.grade) e[`s${i}.grade`] = "Pick a grade.";
        if (s.phone?.trim() && !isPhone(s.phone)) e[`s${i}.phone`] = "Add a 10-digit number, or leave it blank.";
      });
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < 2) return go((step + 1) as Step);
    const trim = (v?: string) => v?.trim() || undefined;
    saveStudents({
      parent: { firstName: parent.firstName.trim(), lastName: parent.lastName.trim(), phone: formatPhone(parent.phone), email: parent.email.trim() },
      students: students.map((s) => ({
        firstName: s.firstName.trim(),
        lastName: s.lastName.trim() || parent.lastName.trim(),
        grade: s.grade,
        school: trim(s.school),
        medicalNotes: trim(s.medicalNotes),
        phone: s.phone?.trim() ? formatPhone(s.phone) : undefined,
      })),
      parentTexts,
      studentTexts: anyStudentPhone && studentTexts,
      date,
      notes: trim(notes),
    });
    go(3);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Sign up for Wednesday nights" hideTitle className="sm:w-[min(620px,calc(100vw-48px))]">
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
              <form onSubmit={(e) => { e.preventDefault(); next(); }} noValidate className="space-y-6">
                <Heading title="Hi, parents" body="A couple of quick details so Pastor Gannon can say hello and keep you in the loop." />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Your first name" value={parent.firstName} onChange={(e) => { setParent((p) => ({ ...p, firstName: e.target.value })); clear("pFirst"); }} error={errors.pFirst} autoComplete="given-name" autoFocus />
                  <Field label="Your last name" value={parent.lastName} onChange={(e) => { setParent((p) => ({ ...p, lastName: e.target.value })); clear("pLast"); }} error={errors.pLast} autoComplete="family-name" />
                </div>
                <Field label="Mobile phone" type="tel" inputMode="tel" value={parent.phone} onChange={(e) => { setParent((p) => ({ ...p, phone: e.target.value })); clear("pPhone"); }} error={errors.pPhone} autoComplete="tel" placeholder="(573) 555-0123" />
                <Field label="Email" type="email" value={parent.email} onChange={(e) => { setParent((p) => ({ ...p, email: e.target.value })); clear("pEmail"); }} error={errors.pEmail} autoComplete="email" />
                <Button type="submit" size="lg" className="w-full">Continue <ArrowRight /></Button>
              </form>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <Heading title="Who's coming?" body="Add each student in 7th through 12th grade." />
                <ul className="space-y-3">
                  {students.map((s, i) => {
                    const err = (f: string) => errors[`s${i}.${f}`];
                    return (
                      <li key={i} className="space-y-4 rounded-2xl border-2 border-stone-200 p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                          <p className="font-mori text-[15px] font-semibold text-stone-900">Student {i + 1}</p>
                          {students.length > 1 && (
                            <button onClick={() => setStudents((ss) => ss.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-clay" aria-label={`Remove student ${i + 1}`}>
                              <Trash2 className="size-3.5" /> Remove
                            </button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="First name" value={s.firstName} onChange={(e) => setStudent(i, { firstName: e.target.value })} error={err("firstName")} autoComplete="off" />
                          <Field label="Last name" value={s.lastName} onChange={(e) => setStudent(i, { lastName: e.target.value })} placeholder={parent.lastName} hint={!s.lastName && parent.lastName ? `We'll use ${parent.lastName}` : undefined} autoComplete="off" />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-stone-800">Grade this school year</p>
                          <div role="radiogroup" aria-label={`Grade for student ${i + 1}`} className="flex flex-wrap gap-2">
                            {studentGrades.map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                role="radio"
                                aria-checked={s.grade === g.id}
                                onClick={() => setStudent(i, { grade: g.id })}
                                className={cn("h-10 min-w-14 rounded-full border-2 px-3.5 text-sm transition", s.grade === g.id ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 text-stone-700 hover:border-stone-300")}
                              >
                                {g.label}
                              </button>
                            ))}
                          </div>
                          {err("grade") && <p className="mt-2 text-[13px] text-clay">{err("grade")}</p>}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="School" optional value={s.school ?? ""} onChange={(e) => setStudent(i, { school: e.target.value })} placeholder="Rolla Junior High" autoComplete="off" />
                          <Field label="Student's cell" optional type="tel" inputMode="tel" value={s.phone ?? ""} onChange={(e) => setStudent(i, { phone: e.target.value })} error={err("phone")} hint="For the youth group text, with your OK" autoComplete="off" />
                        </div>
                        <Field label="Allergies or medical notes" optional value={s.medicalNotes ?? ""} onChange={(e) => setStudent(i, { medicalNotes: e.target.value })} placeholder="Peanut allergy, inhaler…" autoComplete="off" />
                      </li>
                    );
                  })}
                </ul>
                {students.length < 6 && (
                  <button onClick={() => setStudents((ss) => [...ss, blank(ss[0]?.lastName || parent.lastName)])} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 text-sm text-stone-600 transition hover:border-forest-700 hover:text-forest-500">
                    <Plus className="size-4" /> Add another student
                  </button>
                )}
                <Button size="lg" className="w-full" onClick={next}>Continue <ArrowRight /></Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <Heading title="When's their first night?" body={`${studentsInfo.day} at ${studentsInfo.time} in the ${studentsInfo.room.toLowerCase()}.`} />
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto overflow-y-hidden px-1 py-1">
                  {weds.map((w, i) => {
                    const on = new Date(date).toDateString() === w.toDateString();
                    return (
                      <button key={w.toISOString()} onClick={() => setDate(w.toISOString())} aria-pressed={on} className={cn("min-w-28 flex-1 rounded-2xl border-2 px-4 py-3 text-left transition", on ? "border-forest-700 bg-forest-700 text-ink" : "border-stone-200 hover:border-stone-300")}>
                        <span className={cn("block text-xs", on ? "text-ink/70" : "text-stone-500")}>{i === 0 ? "This Wednesday" : i === 1 ? "Next week" : "In 2 weeks"}</span>
                        <span className="mt-0.5 block font-mori font-semibold">{w.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  <Checkbox checked={parentTexts} onChange={setParentTexts}>
                    <span className="font-medium text-stone-800">Text me the weekly parent update</span>
                    <span className="mt-0.5 block text-stone-500">One short text a week: events, permission slips, and anything you need to know.</span>
                  </Checkbox>
                  {anyStudentPhone && (
                    <Checkbox checked={studentTexts} onChange={setStudentTexts}>
                      <span className="font-medium text-stone-800">Add my student to the youth group text</span>
                      <span className="mt-0.5 block text-stone-500">Run by Pastor Gannon. Leaders only message students in group threads.</span>
                    </Checkbox>
                  )}
                </div>
                <Textarea label="Anything we should know?" optional value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Nervous about coming, needs a ride, a friend they'd like to be in a group with…" />
                <Button size="lg" className="w-full" onClick={next}>
                  Sign up {students.length === 1 ? students[0].firstName || "my student" : `${students.length} students`} <Check />
                </Button>
                <p className="text-center text-xs text-stone-400">Simulated for this prototype. Nothing is sent.</p>
              </div>
            )}

            {step === 3 && <Done students={students} date={date} onDone={() => onOpenChange(false)} />}
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

function Done({ students, date, onDone }: { students: StudentInfo[]; date: string; onDone: () => void }) {
  const names = students.map((s) => s.firstName).filter(Boolean);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} & ${names.at(-1)}` : names[0] || "Your student";
  const gannon = staffById[studentsInfo.leaderId];
  return (
    <div className="text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }} className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest-700 text-ink">
        <Check className="size-7" strokeWidth={2.5} />
      </motion.div>
      <h2 className="mt-6 font-mori text-[44px] font-semibold leading-[1] tracking-[-0.05em] text-stone-900">{list} {names.length > 1 ? "are" : "is"} all set!</h2>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-stone-500">See you {formatDay(date)} at {studentsInfo.time}. Drop off at the Gym doors.</p>
      <ul className="mt-8 divide-y divide-stone-200/70 overflow-hidden rounded-2xl border-2 border-stone-200 text-left">
        {students.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-4 px-5 py-3.5 text-[15px]">
            <span className="text-stone-900">{s.firstName} {s.lastName}</span>
            <span className="text-stone-500">{gradeLabel(s.grade)}</span>
          </li>
        ))}
        <li className="flex items-center gap-3 bg-forest-50 px-5 py-4">
          <Avatar name={gannon.name} src={gannon.photo} />
          <p className="text-sm text-forest-300">Pastor Gannon will text you this week to say hi, and he&apos;ll be watching for {names.length > 1 ? "them" : names[0] || "them"} on Wednesday.</p>
        </li>
      </ul>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            downloadIcs({ title: "Wednesday Youth at Rolla First", start: date, durationMin: 90, location: `${church.address}, ${church.city}`, description: "Drop off at the Gym doors. The youth room is upstairs. Pickup at 8:00 PM." });
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
