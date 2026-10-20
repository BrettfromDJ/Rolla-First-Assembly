"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getOffering } from "./data";
import { buildSeedVisitors } from "./seed";
import { uid } from "./utils";
import type {
  Activity,
  BaptismRegistration,
  FollowStatus,
  FollowUps,
  Note,
  Profile,
  Rsvp,
  Stage,
  Task,
  VisitPlan,
  Visitor,
  VisitorOverlay,
} from "./types";

const KEY = "gather:prototype:v1";

export const emptyFollowUps = (): FollowUps => ({
  vibes: [],
  groupSize: null,
  faithStage: null,
  ageGroups: [],
  homeTopics: [],
  serveAreas: [],
});

const freshProfile = (): Profile => ({
  id: "you",
  path: null,
  firstName: "",
  email: "",
  phone: "",
  consent: false,
  interests: [],
  followUps: emptyFollowUps(),
  onboardingComplete: false,
  onboardingCompletedAt: null,
  skippedContact: false,
  visitPlan: null,
  baptism: null,
  rsvps: [],
  createdAt: new Date().toISOString(),
});

const freshOverlay = (): VisitorOverlay => ({ notes: [], tasks: [], activity: [] });

/** Bump when the sample data changes, so saved demos pick up the new examples. */
const SEED_VERSION = 2;

interface State {
  profile: Profile;
  visitors: Visitor[];
  overlay: VisitorOverlay;
  seedVersion?: number;
}

const freshState = (): State => ({ profile: freshProfile(), visitors: buildSeedVisitors(), overlay: freshOverlay(), seedVersion: SEED_VERSION });

export type VisitorPatch = Partial<Pick<Visitor, "stage" | "assigneeId" | "status">>;

interface Store extends State {
  hydrated: boolean;
  you: Visitor | null;
  allVisitors: Visitor[];
  updateProfile: (p: Partial<Profile>) => void;
  savePlan: (plan: Omit<VisitPlan, "createdAt">) => void;
  saveBaptism: (reg: Omit<BaptismRegistration, "createdAt">) => void;
  cancelBaptism: () => void;
  addRsvp: (r: { offeringId: string; itemId?: string; message?: string }) => Rsvp;
  cancelRsvp: (id: string) => void;
  hasRsvp: (offeringId: string, itemId?: string) => Rsvp | undefined;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
  resetAll: () => void;
  /* staff */
  patchVisitor: (id: string, patch: VisitorPatch, activityLabel?: string, kind?: Activity["kind"]) => void;
  addNote: (id: string, body: string, authorId: string) => void;
  addTask: (id: string, task: Omit<Task, "id" | "createdAt" | "done">) => void;
  toggleTask: (id: string, taskId: string) => void;
  patchBaptism: (id: string, patch: Pick<BaptismRegistration, "classAttended" | "pastorContacted" | "baptized">, label: string) => void;
}

const Ctx = createContext<Store | null>(null);

/* ---------- Turning the live prototype visitor into a staff-facing record ---------- */

function derivedStage(p: Profile): Stage {
  if (p.rsvps.length > 0) return "Event RSVP";
  if (p.onboardingComplete) return "Getting connected";
  if (p.visitPlan && p.path !== "visited") return "Planning a visit";
  return "First-time visitor";
}

function rsvpLabel(r: Rsvp) {
  const o = getOffering(r.offeringId);
  const item = o?.items?.find((i) => i.id === r.itemId);
  const name = item?.title ?? o?.title ?? "an event";
  if (o?.actionKind === "join") return `Requested to join ${name}`;
  if (o?.actionKind === "question") return "Sent a question to Ask a Pastor";
  if (o?.actionKind === "signup") return `Signed up for ${name}`;
  return `RSVP'd to ${name}`;
}

const kidsLabel = (n: number) => (n > 0 ? `${n} kid${n === 1 ? "" : "s"}` : "kids");

function profileToVisitor(p: Profile, o: VisitorOverlay): Visitor | null {
  const touched = p.firstName || p.interests.length || p.visitPlan || p.rsvps.length || p.onboardingComplete || p.baptism;
  if (!touched) return null;
  const activity: Activity[] = [...o.activity];
  if (p.visitPlan) {
    const kids = p.visitPlan.bringingKids ? ` · bringing ${kidsLabel(p.visitPlan.kidsCount)}` : "";
    activity.push({ id: "you_plan", kind: "plan", label: `Planned a visit for the ${p.visitPlan.service} service${kids}`, at: p.visitPlan.createdAt });
  }
  if (p.baptism) {
    const d = new Date(p.baptism.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const who = p.baptism.age === "child" ? ` for ${p.baptism.firstName}` : "";
    activity.push({ id: "you_baptism", kind: "baptism", label: `Registered${who} for baptism on ${d} (${p.baptism.service} service)`, at: p.baptism.createdAt });
  }
  if (p.path === "visited") activity.push({ id: "you_visit", kind: "visit", label: "Visited a Sunday service", at: p.createdAt });
  if (p.onboardingCompletedAt) activity.push({ id: "you_onb", kind: "onboarding", label: "Completed onboarding", at: p.onboardingCompletedAt });
  for (const r of p.rsvps) {
    const kind = getOffering(r.offeringId)?.actionKind;
    activity.push({ id: `you_${r.id}`, kind: kind === "join" ? "join" : kind === "question" ? "question" : "rsvp", label: rsvpLabel(r), at: r.createdAt });
  }
  activity.sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return {
    id: "you",
    isYou: true,
    firstName: p.firstName || p.visitPlan?.firstName || "Guest",
    lastName: "",
    email: p.email || (p.visitPlan?.contact.includes("@") ? p.visitPlan.contact : ""),
    phone: p.phone || (p.visitPlan && !p.visitPlan.contact.includes("@") ? p.visitPlan.contact : ""),
    firstVisit: p.visitPlan?.date && p.path !== "visited" ? p.visitPlan.date : p.createdAt,
    source: p.visitPlan ? "Plan a visit" : "Online onboarding",
    interests: p.interests,
    followUps: p.followUps,
    stage: o.stage ?? derivedStage(p),
    assigneeId: o.assigneeId ?? null,
    status: o.status ?? "Needs follow-up",
    rsvps: p.rsvps,
    visitPlan: p.visitPlan,
    baptism: p.baptism,
    household: p.visitPlan?.bringingKids ? `Bringing ${kidsLabel(p.visitPlan.kidsCount)}` : undefined,
    notes: o.notes,
    tasks: o.tasks,
    activity,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(freshState);
  const [hydrated, setHydrated] = useState(false);
  const skipWrite = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        setState({
          profile: { ...freshProfile(), ...parsed.profile, followUps: { ...emptyFollowUps(), ...parsed.profile?.followUps } },
          // Older saves get the latest sample visitors; the visitor's own profile is kept.
          visitors: parsed.visitors?.length && parsed.seedVersion === SEED_VERSION ? parsed.visitors : buildSeedVisitors(),
          overlay: { ...freshOverlay(), ...parsed.overlay },
          seedVersion: SEED_VERSION,
        });
      }
    } catch {
      /* corrupted or unavailable storage: start fresh */
    }
    setHydrated(true);

    // Keep tabs in sync, so the admin dashboard updates while you onboard in another tab.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        skipWrite.current = true;
        setState(JSON.parse(e.newValue));
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const updateProfile = useCallback((p: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  }, []);

  const savePlan = useCallback((plan: Omit<VisitPlan, "createdAt">) => {
    setState((s) => {
      const isEmail = plan.contact.includes("@");
      return {
        ...s,
        profile: {
          ...s.profile,
          path: s.profile.path ?? "planning",
          firstName: s.profile.firstName || plan.firstName,
          email: isEmail ? plan.contact : s.profile.email,
          phone: !isEmail ? plan.contact : s.profile.phone,
          visitPlan: { ...plan, createdAt: new Date().toISOString() },
        },
      };
    });
  }, []);

  const saveBaptism = useCallback((reg: Omit<BaptismRegistration, "createdAt">) => {
    setState((s) => {
      const isEmail = reg.contact.includes("@");
      // A parent registering a child keeps their own name on the profile.
      const selfName = reg.age === "child" ? reg.parentName?.split(" ")[0] ?? "" : reg.firstName;
      return {
        ...s,
        profile: {
          ...s.profile,
          firstName: s.profile.firstName || selfName,
          email: isEmail ? s.profile.email || reg.contact : s.profile.email,
          phone: !isEmail ? s.profile.phone || reg.contact : s.profile.phone,
          baptism: { ...reg, createdAt: new Date().toISOString() },
        },
      };
    });
  }, []);

  const cancelBaptism = useCallback(() => {
    setState((s) => ({ ...s, profile: { ...s.profile, baptism: null } }));
  }, []);

  const addRsvp = useCallback((r: { offeringId: string; itemId?: string; message?: string }) => {
    const rsvp: Rsvp = { id: uid("rsvp"), ...r, createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, profile: { ...s.profile, rsvps: [...s.profile.rsvps, rsvp] } }));
    return rsvp;
  }, []);

  const cancelRsvp = useCallback((id: string) => {
    setState((s) => ({ ...s, profile: { ...s.profile, rsvps: s.profile.rsvps.filter((r) => r.id !== id) } }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) =>
      s.profile.onboardingComplete
        ? s
        : { ...s, profile: { ...s.profile, onboardingComplete: true, onboardingCompletedAt: new Date().toISOString() } },
    );
  }, []);

  const restartOnboarding = useCallback(() => {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, interests: [], followUps: emptyFollowUps(), onboardingComplete: false, skippedContact: false },
    }));
  }, []);

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setState(freshState());
  }, []);

  /* ---------- staff actions ---------- */

  const editVisitor = useCallback(
    (id: string, fn: (v: { stage?: Stage; assigneeId?: string | null; status?: FollowStatus; notes: Note[]; tasks: Task[]; activity: Activity[] }) => Partial<VisitorOverlay>) => {
      setState((s) => {
        if (id === "you") return { ...s, overlay: { ...s.overlay, ...fn(s.overlay) } };
        return { ...s, visitors: s.visitors.map((v) => (v.id === id ? { ...v, ...fn(v) } : v)) };
      });
    },
    [],
  );

  const act = (kind: Activity["kind"], label: string): Activity => ({ id: uid("act"), kind, label, at: new Date().toISOString() });

  const patchVisitor = useCallback(
    (id: string, patch: VisitorPatch, label?: string, kind: Activity["kind"] = "stage") => {
      editVisitor(id, (v) => ({ ...patch, activity: label ? [act(kind, label), ...v.activity] : v.activity }));
    },
    [editVisitor],
  );

  const addNote = useCallback(
    (id: string, body: string, authorId: string) => {
      editVisitor(id, (v) => ({
        notes: [{ id: uid("note"), body, authorId, createdAt: new Date().toISOString() }, ...v.notes],
        activity: [act("note", "Internal note added"), ...v.activity],
      }));
    },
    [editVisitor],
  );

  const addTask = useCallback(
    (id: string, task: Omit<Task, "id" | "createdAt" | "done">) => {
      editVisitor(id, (v) => ({
        tasks: [{ ...task, id: uid("task"), done: false, createdAt: new Date().toISOString() }, ...v.tasks],
        activity: [act("task", `Follow-up created: ${task.title}`), ...v.activity],
      }));
    },
    [editVisitor],
  );

  const toggleTask = useCallback(
    (id: string, taskId: string) => {
      editVisitor(id, (v) => {
        const t = v.tasks.find((x) => x.id === taskId);
        const done = !t?.done;
        return {
          tasks: v.tasks.map((x) => (x.id === taskId ? { ...x, done } : x)),
          activity: done && t ? [act("task", `Completed: ${t.title}`), ...v.activity] : v.activity,
        };
      });
    },
    [editVisitor],
  );

  const patchBaptism = useCallback(
    (id: string, patch: Pick<BaptismRegistration, "classAttended" | "pastorContacted" | "baptized">, label: string) => {
      setState((s) => {
        const entry: Activity = { id: uid("act"), kind: "baptism", label, at: new Date().toISOString() };
        if (id === "you") {
          if (!s.profile.baptism) return s;
          return { ...s, profile: { ...s.profile, baptism: { ...s.profile.baptism, ...patch } }, overlay: { ...s.overlay, activity: [entry, ...s.overlay.activity] } };
        }
        return {
          ...s,
          visitors: s.visitors.map((v) => (v.id === id && v.baptism ? { ...v, baptism: { ...v.baptism, ...patch }, activity: [entry, ...v.activity] } : v)),
        };
      });
    },
    [],
  );

  const you = useMemo(() => profileToVisitor(state.profile, state.overlay), [state.profile, state.overlay]);
  const allVisitors = useMemo(() => (you ? [you, ...state.visitors] : state.visitors), [you, state.visitors]);

  const hasRsvp = useCallback(
    (offeringId: string, itemId?: string) =>
      state.profile.rsvps.find((r) => r.offeringId === offeringId && (itemId ? r.itemId === itemId : !r.itemId)),
    [state.profile.rsvps],
  );

  const value: Store = {
    ...state,
    hydrated,
    you,
    allVisitors,
    updateProfile,
    savePlan,
    saveBaptism,
    cancelBaptism,
    addRsvp,
    cancelRsvp,
    hasRsvp,
    completeOnboarding,
    restartOnboarding,
    resetAll,
    patchVisitor,
    addNote,
    addTask,
    toggleTask,
    patchBaptism,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
