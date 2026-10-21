"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CalendarPlus, Check, Minus, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { headcount } from "@/lib/event-builder";
import { useStore } from "@/lib/store";
import type { Offering, SubItem } from "@/lib/types";
import { downloadIcs, formatDay, formatTime, isEmail, isPhone } from "@/lib/utils";

export function RsvpSheet({
  open,
  onOpenChange,
  offering,
  item,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  offering: Offering;
  item?: SubItem;
}) {
  const { profile, updateProfile, addRsvp, responses } = useStore();
  const known = !!profile.firstName && !!(profile.email || profile.phone);
  const [editing, setEditing] = useState(!known);
  const [name, setName] = useState(profile.firstName);
  const [contact, setContact] = useState(profile.email || profile.phone);
  const [message, setMessage] = useState("");
  const [guests, setGuests] = useState(0);
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState<{ name?: string; contact?: string; message?: string; answer?: string }>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setErrors({});
    setMessage("");
    setGuests(0);
    setAnswer("");
    setName(profile.firstName);
    setContact(profile.email || profile.phone);
    setEditing(!(profile.firstName && (profile.email || profile.phone)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const title = item?.title ?? offering.title;
  const date = item?.date ?? (item ? undefined : offering.date);
  const duration = item?.durationMin ?? offering.durationMin;
  const location = item?.location ?? offering.location;
  const isQuestion = offering.actionKind === "question";
  // Staff-built events can take guests, ask one question, and cap how many people come.
  const left = offering.capacity ? offering.capacity - headcount(responses.filter((r) => r.eventId === offering.id)) : undefined;
  const maxGuests = Math.max(0, Math.min(10, (left ?? 11) - 1));
  const askGuests = !!offering.custom && !!offering.allowGuests && offering.actionKind !== "join";

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const err: typeof errors = {};
    if (editing) {
      if (!name.trim()) err.name = "What should we call you?";
      if (!isEmail(contact) && !isPhone(contact)) err.contact = "Add an email or phone so we can reach you.";
    }
    if (isQuestion && !message.trim()) err.message = "What would you like to ask?";
    if (offering.question && offering.questionRequired && !answer.trim()) err.answer = "Please answer this one.";
    setErrors(err);
    if (Object.keys(err).length) return;
    if (editing) {
      const c = contact.trim();
      updateProfile({ firstName: name.trim(), ...(c.includes("@") ? { email: c } : { phone: c }) });
    }
    addRsvp({ offeringId: offering.id, itemId: item?.id, message: message.trim() || undefined, guests: askGuests ? guests : undefined, answer: answer.trim() || undefined });
    setDone(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={done ? offering.confirmTitle : offering.action} hideTitle>
      <div className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10">
        {done ? (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 220, delay: 0.05 }}
              className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest-700 text-ink"
            >
              <Check className="size-7" strokeWidth={2.5} />
            </motion.div>
            <h2 className="mt-6 font-display text-5xl leading-none text-stone-900">{offering.confirmTitle}</h2>
            <p className="mx-auto mt-4 max-w-sm text-[17px] leading-relaxed text-stone-600">{offering.confirmBody}</p>

            <div className="mt-8 rounded-3xl bg-white p-5 text-left ring-1 ring-stone-200">
              <p className="font-medium text-stone-900">{title}</p>
              <p className="mt-1 text-sm text-stone-500">
                {date ? `${formatDay(date)} · ${formatTime(date)}` : item?.meta || offering.schedule}
              </p>
              <p className="text-sm text-stone-500">{location}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {date ? (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    downloadIcs({ title, start: date, durationMin: duration, location, description: `${offering.summary}\n\nRolla First · ${location}` });
                    toast("Calendar invite downloaded", { description: `${title} · ${formatDay(date)}` });
                  }}
                >
                  <CalendarPlus /> Add to calendar
                </Button>
              ) : (
                <Button variant="secondary" size="lg" onClick={() => onOpenChange(false)}>
                  Keep exploring
                </Button>
              )}
              <Button asChild size="lg">
                <Link href="/me">
                  Go to My Rolla First <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6" noValidate>
            <div>
              <p className="text-sm font-medium text-forest-600">{offering.tag}</p>
              <h2 className="mt-1 font-display text-4xl leading-[1.05] text-stone-900">{title}</h2>
              <p className="mt-2 text-[15px] text-stone-500">
                {date ? `${formatDay(date)} · ${formatTime(date)}` : item?.meta || offering.schedule} · {location}
              </p>
            </div>

            {isQuestion && (
              <div>
                <Textarea
                  label="Your question"
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setErrors((x) => ({ ...x, message: undefined })); }}
                  placeholder="Ask anything. Seriously. Big questions, small questions, skeptical questions."
                  autoFocus
                />
                {errors.message && <p className="mt-2 text-[13px] text-clay">{errors.message}</p>}
              </div>
            )}

            {editing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" value={name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} error={errors.name} autoComplete="given-name" autoFocus={!isQuestion} />
                <Field label="Email or phone" value={contact} onChange={(e) => { setContact(e.target.value); setErrors((x) => ({ ...x, contact: undefined })); }} error={errors.contact} autoComplete="email" />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
                <div className="flex items-center gap-3">
                  <Avatar name={profile.firstName} className="bg-forest-700 text-ink" />
                  <div className="text-sm">
                    <p className="font-medium text-stone-900">{offering.actionKind === "join" ? "Requesting" : "Saving a spot"} for {profile.firstName}</p>
                    <p className="text-stone-500">{profile.email || profile.phone}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
                  <Pencil className="size-3.5" /> Edit
                </button>
              </div>
            )}

            {askGuests && (
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
                <div>
                  <p className="text-sm font-medium text-stone-900">Bringing anyone?</p>
                  <p className="text-sm text-stone-500">{guests ? `You + ${guests} = ${guests + 1} people` : "Just you"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setGuests((g) => Math.max(0, g - 1))} disabled={guests <= 0} aria-label="Fewer guests" className="flex size-10 items-center justify-center rounded-full ring-1 ring-stone-200 disabled:opacity-30"><Minus className="size-4" /></button>
                  <span className="w-5 text-center text-lg font-medium tabular-nums" aria-live="polite">{guests}</span>
                  <button type="button" onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))} disabled={guests >= maxGuests} aria-label="More guests" className="flex size-10 items-center justify-center rounded-full ring-1 ring-stone-200 disabled:opacity-30"><Plus className="size-4" /></button>
                </div>
              </div>
            )}

            {offering.question && (
              <Field
                label={offering.question}
                optional={!offering.questionRequired}
                value={answer}
                onChange={(e) => { setAnswer(e.target.value); setErrors((x) => ({ ...x, answer: undefined })); }}
                error={errors.answer}
                autoComplete="off"
              />
            )}

            <Button type="submit" size="lg" className="w-full">
              {offering.action} <ArrowRight />
            </Button>
            {left !== undefined && left <= 25 && <p className="text-center text-sm text-clay">Only {left} spot{left === 1 ? "" : "s"} left</p>}
            <p className="text-center text-xs text-stone-400">Simulated for this prototype. No messages are sent.</p>
          </form>
        )}
      </div>
    </Sheet>
  );
}
