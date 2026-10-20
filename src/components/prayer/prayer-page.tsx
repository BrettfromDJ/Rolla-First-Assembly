"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, EyeOff, HandHeart, Heart, Lock, Phone, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Rise } from "@/components/church/motion";
import { Checkbox, Field } from "@/components/ui/field";
import { church } from "@/lib/data";
import { prayerCategories, prayerCategoryLabel, prayerVisibility, publicName } from "@/lib/prayer";
import { useStore } from "@/lib/store";
import type { PrayerCategory, PrayerRequest, PrayerVisibility } from "@/lib/types";
import { cn, isEmail, isPhone, timeAgo } from "@/lib/utils";

const mori = "font-mori font-semibold";
const Ed = ({ children }: { children: React.ReactNode }) => <span className="font-editorial font-normal italic tracking-[-0.03em]">{children}</span>;
const MAX = 1000;
const visIcon = { pastors: Lock, team: Users, wall: HandHeart } as const;

export function PrayerPage() {
  const { prayers, hydrated } = useStore();
  const mine = hydrated ? prayers.filter((p) => p.isYou) : [];
  const wall = useMemo(
    () => (hydrated ? prayers.filter((p) => p.visibility === "wall" && p.wallApproved && p.status !== "archived").sort((a, b) => +new Date(b.update?.at ?? b.createdAt) - +new Date(a.update?.at ?? a.createdAt)) : []),
    [prayers, hydrated],
  );
  const [filter, setFilter] = useState<"all" | "answered">("all");
  const [more, setMore] = useState(false);
  const shown = wall.filter((p) => filter === "all" || p.status === "answered");

  return (
    <div className="overflow-x-clip bg-ink text-[#dcd2c5]">
      <SiteHeader />
      <main>
        {/* ---------- Hero + form ---------- */}
        <section className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-14 md:px-[60px] md:pt-[63px] lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <p className={cn(mori, "text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>Prayer</p>
            <h1 className={cn(mori, "mt-4 text-[clamp(52px,7.4vw,112px)] leading-[0.92] tracking-[-0.05em]")}>
              How can we <Ed>pray</Ed> for you?
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600 md:text-xl">
              Whatever you&apos;re carrying, you don&apos;t have to carry it alone. Share as much or as little as you want. Real people here will pray for you by name.
            </p>
            <ul className="mt-10 max-w-md space-y-4">
              {[
                { icon: Lock, t: "You choose who sees it", b: "Pastors only, our prayer team, or the prayer wall below." },
                { icon: EyeOff, t: "Anonymous is always OK", b: "Leave your name off and we'll still pray." },
                { icon: Phone, t: "Want to talk?", b: "Ask and a pastor will reach out, usually within a day or two." },
              ].map((x) => (
                <li key={x.t} className="flex gap-4">
                  <x.icon className="mt-0.5 size-5 shrink-0 text-[#0285ff]" strokeWidth={1.75} />
                  <div>
                    <p className={cn(mori, "text-[17px] tracking-[-0.02em]")}>{x.t}</p>
                    <p className="text-[15px] text-stone-500">{x.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Rise load delay={0.15} y={20}>
            <RequestForm />
          </Rise>
        </section>

        {/* ---------- Your requests ---------- */}
        {mine.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-5 pt-8 md:px-[60px]">
            <h2 className={cn(mori, "text-[clamp(32px,3.6vw,48px)] leading-[0.95] tracking-[-0.05em]")}>
              Your <Ed>requests</Ed>
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {mine.map((p) => (
                <MyRequest key={p.id} p={p} />
              ))}
            </ul>
          </section>
        )}

        {/* ---------- Prayer wall ---------- */}
        <section id="wall" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
                  Prayer <Ed>wall</Ed>
                </h2>
                <p className="mt-3 max-w-md text-[17px] text-stone-500">Take a minute to pray for someone. Tap &ldquo;I prayed&rdquo; so they know they&apos;re not alone.</p>
              </div>
              <div className="flex gap-2 py-1">
                {([["all", "All requests"], ["answered", "Answered prayers"]] as const).map(([id, l]) => (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    aria-pressed={filter === id}
                    className={cn(mori, "h-11 whitespace-nowrap rounded-[80px] border-2 px-5 text-[14px] uppercase tracking-[-0.04em] transition", filter === id ? "border-[#0285ff] bg-[#0285ff] text-black" : "border-[#dcd2c5]/40 hover:border-[#dcd2c5]")}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </Rise>
          {!hydrated ? (
            <div className="mt-10 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-56 animate-pulse rounded-[28px] bg-[#dcd2c5]/[0.05]" />)}</div>
          ) : (
            <>
              <ul className="mt-10 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
                {(more ? shown : shown.slice(0, 9)).map((p) => (
                  <WallCard key={p.id} p={p} />
                ))}
              </ul>
              {shown.length > 9 && (
                <button onClick={() => setMore(!more)} className={cn(mori, "mx-auto mt-6 flex h-12 items-center rounded-[80px] border-2 border-[#dcd2c5]/40 px-6 text-[14px] uppercase tracking-[-0.04em] transition hover:border-[#dcd2c5]")}>
                  {more ? "Show fewer" : `Show all ${shown.length}`}
                </button>
              )}
            </>
          )}
        </section>

        {/* ---------- Need someone now ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-[60px] md:py-32">
          <Rise>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border-2 border-[#dcd2c5]/80 p-7 md:p-9">
                <p className={cn(mori, "text-[clamp(28px,3vw,40px)] leading-[1] tracking-[-0.04em]")}>
                  Rather <Ed>talk</Ed> to someone?
                </p>
                <p className="mt-3 max-w-md text-[16px] leading-relaxed text-stone-600">Call the church office during the week, or find a pastor at the Connect Center after any service. We&apos;d love to pray with you in person.</p>
                <a href={`tel:${church.phone.replace(/\D/g, "")}`} className={cn(mori, "mt-6 inline-flex h-[52px] items-center gap-2 rounded-[80px] border-[3px] border-[#0285ff] px-6 text-[15px] uppercase tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black")}>
                  <Phone className="size-4" /> {church.phone}
                </a>
              </div>
              <div className="rounded-[28px] bg-[#dcd2c5]/[0.05] p-7 md:p-9">
                <p className={cn(mori, "text-[22px] tracking-[-0.03em]")}>In crisis right now?</p>
                <p className="mt-3 max-w-md text-[16px] leading-relaxed text-stone-600">
                  If you&apos;re thinking about hurting yourself, please call or text <a href="tel:988" className="font-semibold text-[#dcd2c5] underline underline-offset-4">988</a> (Suicide &amp; Crisis Lifeline) any time, day or night. In an emergency, call <a href="tel:911" className="font-semibold text-[#dcd2c5] underline underline-offset-4">911</a>.
                </p>
              </div>
            </div>
          </Rise>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------- The request form ---------- */

function RequestForm() {
  const { profile, submitPrayer } = useStore();
  const [category, setCategory] = useState<PrayerCategory | "">("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<PrayerVisibility>("team");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [wantsContact, setWantsContact] = useState(false);
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<PrayerVisibility | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!category) err.category = "Pick the one that fits best.";
    if (body.trim().length < 5) err.body = "Share a few words so we know how to pray.";
    if (wantsContact && !isEmail(contact) && !isPhone(contact)) err.contact = "Add an email or phone so a pastor can reach you.";
    setErrors(err);
    if (Object.keys(err).length) return;
    submitPrayer({ name: anonymous ? "" : name.trim(), anonymous, contact: contact.trim() || undefined, wantsContact, category: category as PrayerCategory, body: body.trim(), visibility });
    setSent(visibility);
  };

  const reset = () => {
    setSent(null);
    setCategory("");
    setBody("");
    setWantsContact(false);
    setErrors({});
  };

  return (
    <div className="rounded-[28px] border-2 border-[#dcd2c5]/80 p-6 md:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-6 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#0285ff] text-black">
              <Heart className="size-7" fill="currentColor" />
            </span>
            <h2 className={cn(mori, "mt-6 text-[clamp(36px,4vw,52px)] leading-[0.95] tracking-[-0.05em]")}>
              We&apos;re <Ed>praying</Ed> with you.
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-[16px] leading-relaxed text-stone-600">
              {sent === "pastors"
                ? "Your request went to our pastors only. It stays confidential."
                : sent === "team"
                  ? "Our prayer team will pray over your request this week."
                  : "Our team will take a quick look, then post it to the prayer wall so the church can pray with you."}
              {wantsContact ? " A pastor will reach out soon." : ""}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#wall" className={cn(mori, "inline-flex h-12 items-center rounded-[80px] bg-[#dcd2c5] px-6 text-[14px] uppercase tracking-[-0.04em] text-black transition hover:bg-[#f5f0e9]")}>
                Pray for others
              </a>
              <button onClick={reset} className={cn(mori, "inline-flex h-12 items-center rounded-[80px] border-2 border-[#dcd2c5]/40 px-6 text-[14px] uppercase tracking-[-0.04em] transition hover:border-[#dcd2c5]")}>
                Share another
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-7">
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-stone-800">What&apos;s it about?</legend>
              <div className="flex flex-wrap gap-2">
                {prayerCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={category === c.id}
                    onClick={() => { setCategory(c.id); setErrors((x) => ({ ...x, category: "" })); }}
                    className={cn("h-10 rounded-full border-2 px-4 text-[14px] transition", category === c.id ? "border-[#0285ff] bg-[#0285ff] text-black" : "border-[#dcd2c5]/25 text-[#dcd2c5] hover:border-[#dcd2c5]/60")}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {errors.category && <p className="mt-2 text-[13px] text-clay">{errors.category}</p>}
            </fieldset>

            <label className="block space-y-2">
              <span className="flex items-baseline justify-between text-sm font-medium text-stone-800">
                Your prayer request
                <span className={cn("text-xs font-normal", body.length > MAX * 0.9 ? "text-clay" : "text-stone-400")}>{body.length}/{MAX}</span>
              </span>
              <textarea
                value={body}
                maxLength={MAX}
                onChange={(e) => { setBody(e.target.value); setErrors((x) => ({ ...x, body: "" })); }}
                placeholder={category === "praise" ? "Tell us what God has done…" : "Share what's on your heart…"}
                aria-invalid={!!errors.body}
                className={cn("min-h-36 w-full resize-y rounded-2xl bg-white p-4 text-[16px] leading-relaxed text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500", errors.body && "ring-clay")}
              />
              {errors.body && <span className="block text-[13px] text-clay">{errors.body}</span>}
            </label>

            <fieldset>
              <legend className="mb-3 text-sm font-medium text-stone-800">Who can see it?</legend>
              <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
                {prayerVisibility.map((v) => {
                  const Icon = visIcon[v.id];
                  const on = visibility === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setVisibility(v.id)}
                      className={cn("rounded-2xl border-2 p-4 text-left transition", on ? "border-[#0285ff] bg-[#0285ff]/10" : "border-[#dcd2c5]/20 hover:border-[#dcd2c5]/50")}
                    >
                      <span className="flex items-center justify-between">
                        <Icon className={cn("size-5", on ? "text-[#0285ff]" : "text-stone-500")} strokeWidth={1.75} />
                        {on && <Check className="size-4 text-[#0285ff]" strokeWidth={3} />}
                      </span>
                      <span className={cn(mori, "mt-3 block text-[16px] tracking-[-0.02em]")}>{v.label}</span>
                      <span className="mt-1 block text-[13px] leading-snug text-stone-500">{v.body}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-3">
              <Field label="Your name" optional value={anonymous ? "" : name || ""} onChange={(e) => setName(e.target.value)} placeholder={profile.firstName || "First and last"} disabled={anonymous} autoComplete="name" />
              <Checkbox checked={anonymous} onChange={setAnonymous}>
                Keep me anonymous{visibility === "pastors" ? "" : visibility === "wall" ? " on the wall" : " to the prayer team"}
              </Checkbox>
            </div>

            <div className="space-y-3">
              <Checkbox checked={wantsContact} onChange={(v) => { setWantsContact(v); setErrors((x) => ({ ...x, contact: "" })); }}>
                I&apos;d like a pastor to reach out to me
              </Checkbox>
              {wantsContact && (
                <Field label="Best email or phone" value={contact} onChange={(e) => { setContact(e.target.value); setErrors((x) => ({ ...x, contact: "" })); }} error={errors.contact} placeholder={profile.email || profile.phone || "you@example.com"} autoComplete="email" />
              )}
            </div>

            <button type="submit" className={cn(mori, "group flex h-[67px] w-full items-center justify-between rounded-[80px] bg-[#dcd2c5] pl-8 pr-2 text-[16px] uppercase tracking-[-0.05em] text-black transition hover:bg-[#f5f0e9]")}>
              Send prayer request
              <span className="flex size-[51px] items-center justify-center rounded-full bg-[#0285ff]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/home/arrow.svg" alt="" width={30} height={30} className="transition duration-500 group-hover:rotate-45" />
              </span>
            </button>
            <p className="text-center text-xs text-stone-500">Simulated for this prototype. Nothing is sent.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Wall cards ---------- */

function WallCard({ p }: { p: PrayerRequest }) {
  const { prayed, prayFor } = useStore();
  const did = prayed.includes(p.id);
  const answered = p.status === "answered";
  return (
    <li className="mb-4 break-inside-avoid">
      <article className={cn("rounded-[28px] border-2 p-6 md:p-7", answered ? "border-[#0285ff]" : "border-[#dcd2c5]/25")}>
        <div className="flex items-center justify-between gap-3">
          <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">{prayerCategoryLabel(p.category)}</p>
          {answered && (
            <span className={cn(mori, "inline-flex items-center gap-1.5 rounded-full bg-[#0285ff] px-3 py-1 text-[12px] uppercase tracking-[-0.02em] text-black")}>
              <Sparkles className="size-3.5" /> Answered
            </span>
          )}
        </div>
        <p className="mt-4 text-[17px] leading-relaxed text-[#dcd2c5]">{p.body}</p>
        {p.update && (
          <div className="mt-4 rounded-2xl bg-[#dcd2c5]/[0.06] p-4">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#0285ff]">Update · {timeAgo(p.update.at)}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-stone-700">{p.update.body}</p>
          </div>
        )}
        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-[14px] text-stone-500">
            <span className="text-stone-700">{publicName(p)}</span> · {timeAgo(p.createdAt)}
          </p>
          <button
            onClick={() => {
              if (did) return;
              prayFor(p.id);
              toast("Thank you for praying", { description: `${publicName(p) === "Anonymous" ? "They'll" : `${publicName(p)} will`} see that someone prayed.` });
            }}
            aria-pressed={did}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-[14px] transition",
              did ? "border-[#0285ff] bg-[#0285ff]/10 text-[#0285ff]" : "border-[#dcd2c5]/30 hover:border-[#0285ff] hover:text-[#0285ff]",
            )}
          >
            <Heart className="size-4" fill={did ? "currentColor" : "none"} />
            {did ? "Prayed" : "I prayed"}
            {p.prayedCount > 0 && <span className="tabular-nums opacity-70">{p.prayedCount}</span>}
          </button>
        </div>
      </article>
    </li>
  );
}

/* ---------- The visitor's own requests ---------- */

function MyRequest({ p }: { p: PrayerRequest }) {
  const { updateMyPrayer, removeMyPrayer } = useStore();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [answered, setAnswered] = useState(false);
  const vis = prayerVisibility.find((v) => v.id === p.visibility)!;
  const VisIcon = visIcon[p.visibility];
  const status =
    p.status === "answered" ? "Answered" : p.visibility === "wall" && !p.wallApproved ? "Waiting for approval" : p.status === "new" ? "Received" : "Being prayed for";

  return (
    <li className={cn("rounded-[28px] border-2 p-6", p.status === "answered" ? "border-[#0285ff]" : "border-[#dcd2c5]/40")}>
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className={cn(mori, "rounded-full px-3 py-1 uppercase tracking-[-0.02em]", p.status === "answered" ? "bg-[#0285ff] text-black" : "bg-[#dcd2c5]/10 text-[#dcd2c5]")}>{status}</span>
        <span className="inline-flex items-center gap-1.5 text-stone-500"><VisIcon className="size-3.5" /> {vis.label}</span>
        <span className="text-stone-500">· {timeAgo(p.createdAt)}</span>
      </div>
      <p className="mt-4 text-[16px] leading-relaxed">{p.body}</p>
      {p.visibility === "wall" && p.wallApproved && p.prayedCount > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[14px] text-[#0285ff]"><Heart className="size-4" fill="currentColor" /> {p.prayedCount} {p.prayedCount === 1 ? "person has" : "people have"} prayed</p>
      )}
      {p.update && (
        <div className="mt-4 rounded-2xl bg-[#dcd2c5]/[0.06] p-4 text-[15px] text-stone-700">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#0285ff]">Your update</span>
          <p className="mt-1">{p.update.body}</p>
        </div>
      )}
      {editing ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={600}
            placeholder="How are things now?"
            aria-label="Your update"
            className="min-h-24 w-full rounded-2xl bg-white p-4 text-[16px] text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <Checkbox checked={answered} onChange={setAnswered}>This prayer was answered</Checkbox>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!text.trim()) return;
                updateMyPrayer(p.id, text.trim(), answered);
                setEditing(false);
                toast(answered ? "Praise God! Thanks for sharing." : "Update shared");
              }}
              className={cn(mori, "h-11 rounded-[80px] bg-[#dcd2c5] px-5 text-[14px] uppercase tracking-[-0.04em] text-black transition hover:bg-[#f5f0e9]")}
            >
              Share update
            </button>
            <button onClick={() => setEditing(false)} className="h-11 px-3 text-[14px] text-stone-500 hover:text-[#dcd2c5]">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => { setText(p.update?.body ?? ""); setAnswered(p.status === "answered"); setEditing(true); }} className={cn(mori, "h-10 rounded-[80px] border-2 border-[#dcd2c5]/40 px-4 text-[13px] uppercase tracking-[-0.04em] transition hover:border-[#dcd2c5]")}>
            {p.update ? "Edit update" : "Share an update"}
          </button>
          <button
            onClick={() => {
              removeMyPrayer(p.id);
              toast("Request removed");
            }}
            className="inline-flex h-10 items-center gap-1.5 px-2 text-[13px] text-stone-500 hover:text-[#dcd2c5]"
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      )}
    </li>
  );
}
