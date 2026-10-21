"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Lock, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";
import { Photo } from "@/components/ui/photo";
import { Button } from "@/components/ui/button";
import { Field, Checkbox } from "@/components/ui/field";
import { InterestIcon, interestTone } from "@/components/ui/interest-icon";
import { ChoiceCard, Pills, SingleList, Tiles } from "./options";
import { FeatureCard, OfferingCard, OfferingRow } from "@/components/events/offering-cards";
import {
  ageGroupOptions,
  faithStageOptions,
  groupSizeOptions,
  homeTopicOptions,
  interests as interestList,
  serveAreaOptions,
  vibeOptions,
} from "@/lib/data";
import { img } from "@/lib/images";
import { followUpsFor, reasonFor, recommend, type FollowUpKey } from "@/lib/recommend";
import { useStore } from "@/lib/store";
import type { FollowUps, InterestId } from "@/lib/types";
import { cn, isEmail, isPhone } from "@/lib/utils";

type StepId = "interests" | `fu:${FollowUpKey}` | "about" | "results";

const panel: Record<string, { src: string; quote: string; who: string }> = {
  interests: { src: img.gathering, quote: "I came looking for a church. I\u00a0found a family.", who: "Maya, joined in 2024" },
  "fu:people": { src: img.dinner, quote: "Tuesday dinners are the best part of my week.", who: "Jordan, Twenties & Thirties" },
  "fu:faith": { src: img.reading, quote: "Nobody made me feel dumb for asking questions.", who: "Priya, Discover Christianity" },
  "fu:family": { src: img.family, quote: "My kids ask to go to church. Every week.", who: "Lucia, mom of two" },
  "fu:home": { src: img.venue, quote: "It felt like home before I knew anyone's name.", who: "Olivia, member since 2023" },
  "fu:serve": { src: img.volunteers, quote: "Serving on Saturdays is how I met my best friends.", who: "Grace, Food Pantry Crew" },
  about: { src: img.conversation, quote: "Someone texted me the day after my first visit. It meant a lot.", who: "Eli, first visit last month" },
};

const ease = [0.22, 1, 0.36, 1] as const;

export function ConnectFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const store = useStore();
  const { profile, hydrated, updateProfile, completeOnboarding, restartOnboarding } = store;

  const [step, setStep] = useState<StepId>("interests");
  const [dir, setDir] = useState(1);
  const started = useRef(false);

  // Decide where to begin once saved state is loaded.
  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    if (params.get("edit")) setStep("interests");
    else if (profile.onboardingComplete) setStep("results");
  }, [hydrated, params, profile.onboardingComplete]);

  const steps: StepId[] = useMemo(
    () => ["interests", ...followUpsFor(profile.interests).map((k) => `fu:${k}` as StepId), "about", "results"],
    [profile.interests],
  );
  const i = Math.max(0, steps.indexOf(step));

  const go = (to: StepId) => {
    setDir(steps.indexOf(to) >= i ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const next = () => go(steps[Math.min(i + 1, steps.length - 1)]);
  const back = () => (i === 0 ? router.push(profile.onboardingComplete ? "/me" : "/") : go(steps[i - 1]));

  useEffect(() => {
    if (step === "results") completeOnboarding();
  }, [step, completeOnboarding]);

  // Overall progress across the four phases
  const fuSteps = steps.filter((s) => s.startsWith("fu:"));
  const phase = step === "interests" ? 0 : step.startsWith("fu:") ? 1 : step === "about" ? 2 : 3;
  const fuFrac = step.startsWith("fu:") ? (fuSteps.indexOf(step) + 1) / fuSteps.length : 1;
  const segments = [0, 1, 2, 3].map((p) => (p < phase ? 1 : p === phase ? (p === 1 ? fuFrac : 1) : 0));

  const isResults = step === "results";
  const pane = panel[step] ?? panel.interests;

  return (
    <div className={cn("min-h-dvh", isResults ? "bg-ink" : "bg-ink lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]")}>
      {/* Immersive photo panel */}
      {!isResults && (
        <aside className="sticky top-0 hidden h-dvh p-3 lg:block">
          <div className="relative h-full overflow-hidden rounded-[28px]">
            <AnimatePresence initial={false}>
              <motion.div key={pane.src} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease }}>
                <Photo src={pane.src} alt="" tone="forest" className="h-full w-full" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
            <Link href="/" className="absolute left-8 top-8" aria-label="Rolla First home">
              <Logo inverted />
            </Link>
            <AnimatePresence mode="wait">
              <motion.figure key={pane.quote} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.5, ease }} className="absolute inset-x-8 bottom-20 text-paper">
                <blockquote className="font-display text-4xl leading-[1.08] xl:text-5xl">&ldquo;{pane.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm text-paper/70">{pane.who}</figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </aside>
      )}

      <div className="relative flex min-h-dvh flex-col">
        {/* Top bar */}
        <header className={cn("sticky top-0 z-30 bg-ink/85 backdrop-blur-xl", isResults && "border-b border-stone-200/60")}>
          <div className={cn("mx-auto flex h-16 items-center gap-4 px-5 md:px-8", isResults ? "max-w-7xl" : "max-w-2xl")}>
            {isResults ? (
              <Link href="/" aria-label="Rolla First home"><Logo /></Link>
            ) : (
              <>
                <button onClick={back} className="-ml-2 flex size-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-900/5" aria-label="Back">
                  <ArrowLeft className="size-5" />
                </button>
                <div className="flex flex-1 gap-1.5" role="progressbar" aria-label="Onboarding progress" aria-valuemin={1} aria-valuemax={4} aria-valuenow={phase + 1}>
                  {segments.map((f, k) => (
                    <span key={k} className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200">
                      <motion.span className="block h-full rounded-full bg-forest-600" initial={false} animate={{ width: `${f * 100}%` }} transition={{ duration: 0.5, ease }} />
                    </span>
                  ))}
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-stone-400">{phase + 1}/4</span>
              </>
            )}
            {isResults ? (
              <div className="ml-auto flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => go("interests")}><SlidersHorizontal /> <span className="hidden sm:inline">Edit answers</span></Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    restartOnboarding();
                    go("interests");
                    toast("Starting fresh", { description: "Your contact info is saved. Everything else is reset." });
                  }}
                >
                  <RotateCcw /> <span className="hidden sm:inline">Start over</span>
                </Button>
              </div>
            ) : (
              <Link href={profile.onboardingComplete ? "/me" : "/"} className="flex size-10 items-center justify-center rounded-full text-stone-500 hover:bg-stone-900/5 lg:hidden" aria-label="Exit">
                <X className="size-5" />
              </Link>
            )}
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: dir * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -32 }}
              transition={{ duration: 0.35, ease }}
              className="flex flex-1 flex-col"
            >
              {!hydrated ? (
                <div className="flex flex-1 items-center justify-center"><span className="size-6 animate-spin rounded-full border-2 border-stone-300 border-t-forest-600" /></div>
              ) : step === "interests" ? (
                <InterestsStep onNext={next} />
              ) : step.startsWith("fu:") ? (
                <FollowUpStep k={step.slice(3) as FollowUpKey} onNext={next} />
              ) : step === "about" ? (
                <AboutStep onNext={next} onSkip={() => { updateProfile({ skippedContact: true }); next(); }} />
              ) : (
                <ResultsStep onEdit={() => go("interests")} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ---------- Shared step chrome ---------- */

function StepShell({ eyebrow, title, body, children, footer }: { eyebrow?: string; title: string; body?: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-10 pt-6 md:px-8 md:pt-14">
        {eyebrow && <p className="text-sm font-medium text-forest-600">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-[44px] leading-[1] tracking-[-0.02em] text-stone-900 text-balance md:text-6xl">{title}</h1>
        {body && <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-stone-500">{body}</p>}
        <div className="mt-9">{children}</div>
      </div>
      <div className="sticky bottom-0 z-20 border-t border-stone-200/60 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-5 py-4 md:px-8">{footer}</div>
      </div>
    </>
  );
}

/* ---------- Step 1 ---------- */

function InterestsStep({ onNext }: { onNext: () => void }) {
  const { profile, updateProfile } = useStore();
  const selected = profile.interests;
  const toggle = (id: InterestId) =>
    updateProfile({ interests: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] });

  const name = profile.firstName || profile.visitPlan?.firstName;
  const eyebrow = profile.path === "visited" ? `Thanks for visiting${name ? `, ${name}` : ""}!` : name ? `Hi, ${name}` : "Welcome";

  return (
    <StepShell
      eyebrow={eyebrow}
      title="What brings you here?"
      body="Everyone's journey looks a little different. Tell us what you're looking for."
      footer={
        <>
          <p className="text-sm text-stone-500" aria-live="polite">
            {selected.length === 0 ? "Choose as many as you like" : `${selected.length} selected`}
          </p>
          <Button size="lg" onClick={onNext} disabled={selected.length === 0}>
            Continue <ArrowRight />
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {interestList.map((it, idx) => (
          <ChoiceCard
            key={it.id}
            index={idx}
            selected={selected.includes(it.id)}
            onToggle={() => toggle(it.id)}
            icon={<InterestIcon id={it.id} className="size-[22px]" />}
            iconTone={interestTone[it.id]}
            title={it.title}
            body={it.description}
          />
        ))}
      </div>
    </StepShell>
  );
}

/* ---------- Step 2: conditional follow-ups ---------- */

function FollowUpStep({ k, onNext }: { k: FollowUpKey; onNext: () => void }) {
  const { profile, updateProfile } = useStore();
  const f = profile.followUps;
  const set = (patch: Partial<FollowUps>) => updateProfile({ followUps: { ...f, ...patch } });
  const extra = profile.interests.length - followUpsFor(profile.interests).length;

  const answered =
    k === "people" ? f.vibes.length > 0 || !!f.groupSize
    : k === "faith" ? !!f.faithStage
    : k === "family" ? f.ageGroups.length > 0
    : k === "home" ? f.homeTopics.length > 0
    : f.serveAreas.length > 0;

  const copy: Record<FollowUpKey, { title: string; body: string }> = {
    people: { title: "What sounds like your kind of thing?", body: "Pick anything that sounds fun. We'll point you to the right people." },
    faith: { title: "Where are you on your faith journey?", body: "There's no wrong answer. Wherever you are is a great place to start." },
    family: { title: "Who's coming along?", body: "Choose the age groups in your family, so we can share what's made for them." },
    home: { title: "What would help you get to know us?", body: "Finding a church home takes time. Let's start with what matters to you." },
    serve: { title: "Where would you love to help?", body: "No experience needed. Most people start by trying something once." },
  };

  return (
    <StepShell
      eyebrow={`A little more about ${({ people: "meeting people", faith: "faith", family: "your family", home: "finding a home", serve: "serving" } as const)[k]}`}
      title={copy[k].title}
      body={copy[k].body}
      footer={
        <>
          <Button variant="ghost" onClick={onNext} className="-ml-3 text-stone-500">Skip</Button>
          <Button size="lg" onClick={onNext}>
            {answered ? "Continue" : "Not sure yet"} <ArrowRight />
          </Button>
        </>
      }
    >
      {k === "people" && (
        <div className="space-y-12">
          <Pills label="Your kind of thing" options={vibeOptions} value={f.vibes} onChange={(vibes) => set({ vibes })} />
          <div>
            <h2 className="mb-4 text-lg font-medium text-stone-900">How do you like to gather?</h2>
            <SingleList columns label="Group size" options={groupSizeOptions} value={f.groupSize} onChange={(groupSize) => set({ groupSize })} />
          </div>
        </div>
      )}
      {k === "faith" && <SingleList label="Faith journey" options={faithStageOptions} value={f.faithStage} onChange={(faithStage) => set({ faithStage })} />}
      {k === "family" && <Tiles label="Age groups" options={ageGroupOptions} value={f.ageGroups} onChange={(ageGroups) => set({ ageGroups })} />}
      {k === "home" && <Pills label="Getting to know us" options={homeTopicOptions} value={f.homeTopics} onChange={(homeTopics) => set({ homeTopics })} />}
      {k === "serve" && <Pills label="Ways to help" options={serveAreaOptions} value={f.serveAreas} onChange={(serveAreas) => set({ serveAreas })} />}

      {extra > 0 && k === followUpsFor(profile.interests).at(-1) && (
        <p className="mt-10 text-sm text-stone-400">
          We&apos;ll keep the rest short. Your other {extra === 1 ? "interest" : `${extra} interests`} will still shape your recommendations.
        </p>
      )}
    </StepShell>
  );
}

/* ---------- Step 3 ---------- */

function AboutStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { profile, updateProfile } = useStore();
  const [firstName, setFirstName] = useState(profile.firstName || profile.visitPlan?.firstName || "");
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [consent, setConsent] = useState(profile.consent);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const err: typeof errors = {};
    if (!firstName.trim()) err.name = "What should we call you?";
    if (!email.trim()) err.email = "We'll need an email to stay in touch.";
    else if (!isEmail(email)) err.email = "That email doesn't look quite right.";
    if (phone.trim() && !isPhone(phone)) err.phone = "Add a 10-digit number, or leave it blank.";
    setErrors(err);
    if (Object.keys(err).length) return;
    updateProfile({ firstName: firstName.trim(), email: email.trim(), phone: phone.trim(), consent, skippedContact: false });
    onNext();
  };

  return (
    <StepShell
      eyebrow="Almost there"
      title="Let's get to know you"
      body="So we can help you get connected with the right people."
      footer={
        <>
          <Button variant="ghost" onClick={onSkip} className="-ml-3 text-stone-500">Skip for now</Button>
          <Button size="lg" onClick={() => submit()}>Show my next steps <ArrowRight /></Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field label="First name" value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} error={errors.name} autoComplete="given-name" placeholder="Sarah" autoFocus />
        <Field label="Email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} error={errors.email} autoComplete="email" placeholder="sarah@example.com" />
        <Field label="Phone" optional type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((x) => ({ ...x, phone: undefined })); }} error={errors.phone} autoComplete="tel" placeholder="(573) 555-0123" hint="Some people prefer a text. Totally up to you." />
        <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-stone-200/70">
          <Checkbox checked={consent} onChange={setConsent}>
            <span className="font-medium text-stone-800">Yes, someone can reach out personally.</span>
            <span className="mt-0.5 block text-stone-500">A quick hello from our welcome team. No mailing lists, no spam.</span>
          </Checkbox>
        </div>
        <p className="flex items-center gap-2 text-[13px] text-stone-400">
          <Lock className="size-3.5" /> We never share your info. Ever.
        </p>
        <button type="submit" className="sr-only">Continue</button>
      </form>
    </StepShell>
  );
}

/* ---------- Step 4 ---------- */

function ResultsStep({ onEdit }: { onEdit: () => void }) {
  const { profile } = useStore();
  const recs = useMemo(() => recommend(profile.interests, profile.followUps, 6), [profile.interests, profile.followUps]);
  const [top, ...rest] = recs;
  const pair = rest.slice(0, 2);
  const more = rest.slice(2);
  const name = profile.firstName;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-10 md:px-8 md:pt-16">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-sm font-medium text-forest-600">{name ? `For you, ${name}` : "Just for you"}</p>
          <h1 className="mt-3 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[-0.025em] text-stone-900 text-balance">
            Here&apos;s where you could start
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-500">A few ways to find your place, based on what you shared.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {profile.interests.map((id) => (
            <button key={id} onClick={onEdit} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition hover:opacity-80", interestTone[id])}>
              <InterestIcon id={id} className="size-4" /> {interestList.find((x) => x.id === id)?.title}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-12 space-y-5 md:mt-16">
        {top && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease }}>
            <FeatureCard o={top} reason={reasonFor(top, profile.interests, profile.followUps)} />
          </motion.div>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          {pair.map((o, k) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + k * 0.08, duration: 0.7, ease }} className="flex">
              <OfferingCard o={o} reason={reasonFor(o, profile.interests, profile.followUps)} className="flex-1" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid gap-10 border-t border-stone-200 pt-12 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-4xl leading-tight text-stone-900">Your home base is ready</h2>
          <p className="mt-3 max-w-sm text-stone-500">Everything you saved, plus what&apos;s coming up, all in one place. Come back anytime.</p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/me">Go to My Rolla First <ArrowRight /></Link>
          </Button>
          {profile.skippedContact && (
            <p className="mt-6 max-w-sm text-sm text-stone-400">
              You skipped sharing contact info, and that&apos;s okay. We&apos;ll just ask for a name when you RSVP.
            </p>
          )}
        </div>
        {more.length > 0 && (
          <div>
            <p className="mb-2 px-2 text-sm font-medium text-stone-500">Also worth a look</p>
            <div className="space-y-1">
              {more.map((o) => (
                <OfferingRow key={o.id} o={o} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
