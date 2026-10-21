"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getOffering, registerCustomOfferings } from "./data";
import { buildSeedEvents, slugify } from "./event-builder";
import { buildSeedVisitors } from "./seed";
import { buildSeedAttendance } from "./attendance";
import { buildSeedPrayers } from "./prayer";
import { buildSeedServe } from "./serve";
import { autoFill, buildSeedSchedule, defaultScheduleSettings } from "./schedule";
import { uid } from "./utils";
import { defaultSite, mergeSite, registerSite, type SiteSettings } from "./site";
import type {
  Activity,
  AttendanceRecord,
  EventResponse,
  Offering,
  Assignment,
  ScheduleSettings,
  Volunteer,
  PrayerRequest,
  ServeSignup,
  BaptismRegistration,
  KidsRegistration,
  StudentsRegistration,
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
  kids: null,
  students: null,
  rsvps: [],
  createdAt: new Date().toISOString(),
});

const freshOverlay = (): VisitorOverlay => ({ notes: [], tasks: [], activity: [] });

/** Bump when the sample data changes, so saved demos pick up the new examples. */
const SEED_VERSION = 5;

interface State {
  profile: Profile;
  visitors: Visitor[];
  overlay: VisitorOverlay;
  attendance: AttendanceRecord[];
  prayers: PrayerRequest[];
  prayed: string[]; // prayer ids this browser has prayed for
  sermonNotes: Record<string, string>; // the visitor's own notes, by sermon id
  serve: ServeSignup[];
  schedule: { volunteers: Volunteer[]; assignments: Assignment[]; settings: ScheduleSettings };
  events: Offering[]; // built by staff in the admin
  responses: EventResponse[]; // RSVPs and sign-ups for those events
  hiddenOfferings: string[]; // built-in events staff took off the site
  site: SiteSettings; // what staff edit in the admin's Website tab
  seedVersion?: number;
}

const seedEvents = () => buildSeedEvents();

const freshState = (): State => ({ profile: freshProfile(), visitors: buildSeedVisitors(), overlay: freshOverlay(), attendance: buildSeedAttendance(), prayers: buildSeedPrayers(), prayed: [], sermonNotes: {}, serve: buildSeedServe(), schedule: { ...buildSeedSchedule(), settings: defaultScheduleSettings }, ...seedEvents(), hiddenOfferings: [], site: defaultSite(), seedVersion: SEED_VERSION });

export type VisitorPatch = Partial<Pick<Visitor, "stage" | "assigneeId" | "status" | "memberSince">>;

interface Store extends State {
  hydrated: boolean;
  you: Visitor | null;
  allVisitors: Visitor[];
  updateProfile: (p: Partial<Profile>) => void;
  savePlan: (plan: Omit<VisitPlan, "createdAt">) => void;
  saveBaptism: (reg: Omit<BaptismRegistration, "createdAt">) => void;
  cancelBaptism: () => void;
  saveKids: (reg: Omit<KidsRegistration, "createdAt">) => void;
  saveStudents: (reg: Omit<StudentsRegistration, "createdAt">) => void;
  cancelStudents: () => void;
  cancelKids: () => void;
  addRsvp: (r: { offeringId: string; itemId?: string; message?: string; guests?: number; answer?: string }) => Rsvp;
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
  patchBaptism: (id: string, patch: Pick<BaptismRegistration, "pastorContacted" | "baptized">, label: string) => void;
  /** Adds or replaces the count for one service on one date. */
  saveAttendance: (r: Omit<AttendanceRecord, "id" | "updatedAt">) => void;
  deleteAttendance: (id: string) => void;
  /* prayer */
  submitPrayer: (r: Pick<PrayerRequest, "name" | "anonymous" | "contact" | "wantsContact" | "category" | "body" | "visibility">) => string;
  prayFor: (id: string) => void;
  /** The requester adds an update, optionally marking it answered. */
  updateMyPrayer: (id: string, body: string, answered: boolean) => void;
  removeMyPrayer: (id: string) => void;
  patchPrayer: (id: string, patch: Partial<Pick<PrayerRequest, "status" | "wallApproved" | "assigneeId" | "contacted" | "visibility" | "update">>) => void;
  addPrayerNote: (id: string, body: string, authorId: string) => void;
  /* sermons */
  saveSermonNote: (sermonId: string, text: string) => void;
  /* serving */
  submitServe: (s: Omit<ServeSignup, "id" | "status" | "notes" | "createdAt" | "isYou">) => void;
  cancelMyServe: (id: string) => void;
  patchServe: (id: string, patch: Partial<Pick<ServeSignup, "status" | "backgroundCheck" | "shadowDate">>) => void;
  addServeNote: (id: string, body: string, authorId: string) => void;
  /* scheduling */
  assignVolunteer: (spot: Pick<Assignment, "date" | "service" | "teamId" | "position" | "slot">, volunteerId: string) => void;
  setAssignment: (id: string, patch: Partial<Pick<Assignment, "status" | "reason">>) => void;
  removeAssignment: (id: string) => void;
  /** Fills a Sunday's open spots for a team; returns how many were filled. */
  autoFillSunday: (date: string, teamId: string) => { filled: number; stretched: number };
  toggleBlockout: (volunteerId: string, date: string) => void;
  updateScheduleSettings: (patch: Partial<ScheduleSettings>) => void;
  /* event builder */
  /** Creates (when id is blank) or updates a staff event. Returns its id. */
  saveEvent: (o: Offering) => string;
  deleteEvent: (id: string) => void;
  toggleHiddenOffering: (id: string) => void;
  removeResponse: (id: string) => void;
  /* website */
  updateSite: (patch: Partial<SiteSettings>, by: string) => void;
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
  const touched = p.firstName || p.interests.length || p.visitPlan || p.rsvps.length || p.onboardingComplete || p.baptism || p.kids || p.students;
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
  if (p.kids) {
    const names = p.kids.kids.map((k) => k.firstName).join(" & ");
    const d = new Date(p.kids.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    activity.push({ id: "you_kids", kind: "kids", label: `Pre-registered ${names} for Kids First (${d}, ${p.kids.service})`, at: p.kids.createdAt });
  }
  if (p.students) {
    const names = p.students.students.map((k) => k.firstName).join(" & ");
    const d = new Date(p.students.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    activity.push({ id: "you_students", kind: "students", label: `Signed up ${names} for Wednesday Students (starting ${d})`, at: p.students.createdAt });
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
    memberSince: o.memberSince ?? null,
    rsvps: p.rsvps,
    visitPlan: p.visitPlan,
    baptism: p.baptism,
    kids: p.kids,
    students: p.students,
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
          profile: {
            ...freshProfile(),
            ...parsed.profile,
            followUps: { ...emptyFollowUps(), ...parsed.profile?.followUps },
            // Kids pre-registrations saved before the Planning Center fields existed are dropped.
            kids: parsed.profile?.kids?.parent ? parsed.profile.kids : null,
          },
          // Older saves get the latest sample visitors; the visitor's own profile is kept.
          visitors: parsed.visitors?.length && parsed.seedVersion === SEED_VERSION ? parsed.visitors : buildSeedVisitors(),
          overlay: { ...freshOverlay(), ...parsed.overlay },
          attendance: parsed.attendance ?? buildSeedAttendance(),
          prayers: parsed.prayers ?? buildSeedPrayers(),
          prayed: parsed.prayed ?? [],
          sermonNotes: parsed.sermonNotes ?? {},
          serve: parsed.serve ?? buildSeedServe(),
          ...(parsed.events ? { events: parsed.events, responses: parsed.responses ?? [] } : seedEvents()),
          hiddenOfferings: parsed.hiddenOfferings ?? [],
          site: mergeSite(parsed.site),
          schedule: parsed.schedule?.volunteers ? { ...parsed.schedule, settings: { ...defaultScheduleSettings, ...parsed.schedule.settings } } : { ...buildSeedSchedule(), settings: defaultScheduleSettings },
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

  const saveKids = useCallback((reg: Omit<KidsRegistration, "createdAt">) => {
    setState((s) => {
      return {
        ...s,
        profile: {
          ...s.profile,
          firstName: s.profile.firstName || reg.parent.firstName,
          email: s.profile.email || reg.parent.email,
          phone: s.profile.phone || reg.parent.phone,
          kids: { ...reg, createdAt: new Date().toISOString() },
        },
      };
    });
  }, []);

  const saveStudents = useCallback((reg: Omit<StudentsRegistration, "createdAt">) => {
    setState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        firstName: s.profile.firstName || reg.parent.firstName,
        email: s.profile.email || reg.parent.email,
        phone: s.profile.phone || reg.parent.phone,
        students: { ...reg, createdAt: new Date().toISOString() },
      },
    }));
  }, []);

  const cancelStudents = useCallback(() => {
    setState((s) => ({ ...s, profile: { ...s.profile, students: null } }));
  }, []);

  const saveAttendance = useCallback((r: Omit<AttendanceRecord, "id" | "updatedAt">) => {
    const rec: AttendanceRecord = { ...r, id: `att_${r.date}_${r.service}`, updatedAt: new Date().toISOString() };
    setState((s) => ({ ...s, attendance: [...s.attendance.filter((a) => a.id !== rec.id), rec] }));
  }, []);

  const deleteAttendance = useCallback((id: string) => {
    setState((s) => ({ ...s, attendance: s.attendance.filter((a) => a.id !== id) }));
  }, []);

  const editPrayer = useCallback((id: string, fn: (p: PrayerRequest) => Partial<PrayerRequest>) => {
    setState((s) => ({ ...s, prayers: s.prayers.map((p) => (p.id === id ? { ...p, ...fn(p) } : p)) }));
  }, []);

  const submitPrayer = useCallback((r: Pick<PrayerRequest, "name" | "anonymous" | "contact" | "wantsContact" | "category" | "body" | "visibility">) => {
    const id = uid("pr");
    const req: PrayerRequest = { ...r, id, status: "new", prayedCount: 0, notes: [], assigneeId: null, isYou: true, createdAt: new Date().toISOString() };
    setState((s) => ({
      ...s,
      prayers: [req, ...s.prayers],
      profile: {
        ...s.profile,
        firstName: s.profile.firstName || r.name.trim().split(/\s+/)[0] || "",
        email: s.profile.email || (r.contact?.includes("@") ? r.contact : ""),
        phone: s.profile.phone || (r.contact && !r.contact.includes("@") ? r.contact : ""),
      },
    }));
    return id;
  }, []);

  const prayFor = useCallback((id: string) => {
    setState((s) =>
      s.prayed.includes(id)
        ? s
        : { ...s, prayed: [...s.prayed, id], prayers: s.prayers.map((p) => (p.id === id ? { ...p, prayedCount: p.prayedCount + 1 } : p)) },
    );
  }, []);

  const updateMyPrayer = useCallback(
    (id: string, body: string, answered: boolean) =>
      editPrayer(id, (p) => ({ update: { body, at: new Date().toISOString(), by: "requester" }, status: answered ? "answered" : p.status })),
    [editPrayer],
  );

  const removeMyPrayer = useCallback((id: string) => {
    setState((s) => ({ ...s, prayers: s.prayers.filter((p) => !(p.id === id && p.isYou)) }));
  }, []);

  const patchPrayer = useCallback(
    (id: string, patch: Partial<Pick<PrayerRequest, "status" | "wallApproved" | "assigneeId" | "contacted" | "visibility" | "update">>) => editPrayer(id, () => patch),
    [editPrayer],
  );

  const addPrayerNote = useCallback(
    (id: string, body: string, authorId: string) =>
      editPrayer(id, (p) => ({ notes: [{ id: uid("note"), body, authorId, createdAt: new Date().toISOString() }, ...p.notes] })),
    [editPrayer],
  );

  const saveSermonNote = useCallback((sermonId: string, text: string) => {
    setState((s) => ({ ...s, sermonNotes: { ...s.sermonNotes, [sermonId]: text } }));
  }, []);

  const submitServe = useCallback((sv: Omit<ServeSignup, "id" | "status" | "notes" | "createdAt" | "isYou">) => {
    const rec: ServeSignup = { ...sv, id: uid("sv"), status: "new", notes: [], isYou: true, createdAt: new Date().toISOString() };
    setState((s) => ({
      ...s,
      // Signing up again for the same team replaces the earlier sign-up.
      serve: [rec, ...s.serve.filter((x) => !(x.isYou && x.teamId === sv.teamId))],
      profile: {
        ...s.profile,
        firstName: s.profile.firstName || sv.firstName,
        email: s.profile.email || sv.email,
        phone: s.profile.phone || sv.phone,
      },
    }));
  }, []);

  const cancelMyServe = useCallback((id: string) => {
    setState((s) => ({ ...s, serve: s.serve.filter((x) => !(x.id === id && x.isYou)) }));
  }, []);

  const patchServe = useCallback((id: string, patch: Partial<Pick<ServeSignup, "status" | "backgroundCheck" | "shadowDate">>) => {
    setState((s) => ({ ...s, serve: s.serve.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, []);

  const addServeNote = useCallback((id: string, body: string, authorId: string) => {
    setState((s) => ({
      ...s,
      serve: s.serve.map((x) => (x.id === id ? { ...x, notes: [{ id: uid("note"), body, authorId, createdAt: new Date().toISOString() }, ...x.notes] } : x)),
    }));
  }, []);

  const editSchedule = useCallback((fn: (sch: State["schedule"]) => Partial<State["schedule"]>) => {
    setState((s) => ({ ...s, schedule: { ...s.schedule, ...fn(s.schedule) } }));
  }, []);

  const assignVolunteer = useCallback(
    (spot: Pick<Assignment, "date" | "service" | "teamId" | "position" | "slot">, volunteerId: string) =>
      editSchedule((sch) => ({
        assignments: [
          ...sch.assignments.filter((a) => !(a.date === spot.date && a.service === spot.service && a.teamId === spot.teamId && a.position === spot.position && a.slot === spot.slot && a.status !== "declined")),
          { ...spot, id: uid("as"), volunteerId, status: "pending", assignedAt: new Date().toISOString() },
        ],
      })),
    [editSchedule],
  );

  const setAssignment = useCallback(
    (id: string, patch: Partial<Pick<Assignment, "status" | "reason">>) =>
      editSchedule((sch) => ({ assignments: sch.assignments.map((a) => (a.id === id ? { ...a, ...patch, respondedAt: new Date().toISOString() } : a)) })),
    [editSchedule],
  );

  const removeAssignment = useCallback((id: string) => editSchedule((sch) => ({ assignments: sch.assignments.filter((a) => a.id !== id) })), [editSchedule]);

  const autoFillSunday = useCallback(
    (date: string, teamId: string) => {
      const { added, stretched } = autoFill(state.schedule.volunteers, state.schedule.assignments, date, teamId);
      if (added.length) editSchedule((sch) => ({ assignments: [...sch.assignments, ...added] }));
      return { filled: added.length, stretched };
    },
    [state.schedule, editSchedule],
  );

  const toggleBlockout = useCallback(
    (volunteerId: string, date: string) =>
      editSchedule((sch) => ({
        volunteers: sch.volunteers.map((v) => (v.id === volunteerId ? { ...v, blockouts: v.blockouts.includes(date) ? v.blockouts.filter((d) => d !== date) : [...v.blockouts, date] } : v)),
      })),
    [editSchedule],
  );

  const updateScheduleSettings = useCallback((patch: Partial<ScheduleSettings>) => editSchedule((sch) => ({ settings: { ...sch.settings, ...patch } })), [editSchedule]);

  const cancelKids = useCallback(() => {
    setState((s) => ({ ...s, profile: { ...s.profile, kids: null } }));
  }, []);

  const cancelBaptism = useCallback(() => {
    setState((s) => ({ ...s, profile: { ...s.profile, baptism: null } }));
  }, []);

  const addRsvp = useCallback((r: { offeringId: string; itemId?: string; message?: string; guests?: number; answer?: string }) => {
    const rsvp: Rsvp = { id: uid("rsvp"), ...r, createdAt: new Date().toISOString() };
    setState((s) => {
      const custom = s.events.some((e) => e.id === r.offeringId);
      const response: EventResponse | null = custom
        ? { id: `resp_${rsvp.id}`, eventId: r.offeringId, name: s.profile.firstName || "Guest", contact: s.profile.email || s.profile.phone, guests: r.guests ?? 0, answer: r.answer, message: r.message, isYou: true, createdAt: rsvp.createdAt }
        : null;
      return { ...s, profile: { ...s.profile, rsvps: [...s.profile.rsvps, rsvp] }, responses: response ? [...s.responses, response] : s.responses };
    });
    return rsvp;
  }, []);

  const cancelRsvp = useCallback((id: string) => {
    setState((s) => ({ ...s, profile: { ...s.profile, rsvps: s.profile.rsvps.filter((r) => r.id !== id) }, responses: s.responses.filter((x) => x.id !== `resp_${id}`) }));
  }, []);

  const eventsRef = useRef(state.events);
  eventsRef.current = state.events;

  const saveEvent = useCallback((o: Offering) => {
    // New events get a readable id from the title (fall-festival, fall-festival-2, …), worked out before saving.
    let id = o.id;
    if (!id) {
      const base = slugify(o.title);
      id = base;
      for (let n = 2; eventsRef.current.some((e) => e.id === id) || getOffering(id); n++) id = `${base}-${n}`;
    }
    const saved: Offering = { ...o, id, custom: true, updatedAt: new Date().toISOString() };
    setState((s) => ({ ...s, events: s.events.some((e) => e.id === id) ? s.events.map((e) => (e.id === id ? saved : e)) : [saved, ...s.events] }));
    return id;
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id), responses: s.responses.filter((r) => r.eventId !== id) }));
  }, []);

  const toggleHiddenOffering = useCallback((id: string) => {
    setState((s) => ({ ...s, hiddenOfferings: s.hiddenOfferings.includes(id) ? s.hiddenOfferings.filter((x) => x !== id) : [...s.hiddenOfferings, id] }));
  }, []);

  const updateSite = useCallback((patch: Partial<SiteSettings>, by: string) => {
    setState((s) => ({ ...s, site: { ...s.site, ...patch, updatedAt: new Date().toISOString(), updatedBy: by } }));
  }, []);

  const removeResponse = useCallback((id: string) => {
    setState((s) => ({ ...s, responses: s.responses.filter((r) => r.id !== id) }));
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
    (id: string, fn: (v: { stage?: Stage; assigneeId?: string | null; status?: FollowStatus; memberSince?: string | null; notes: Note[]; tasks: Task[]; activity: Activity[] }) => Partial<VisitorOverlay>) => {
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
    (id: string, patch: Pick<BaptismRegistration, "pastorContacted" | "baptized">, label: string) => {
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

  // Staff-built events join the shared offering list every page reads from.
  registerCustomOfferings(state.events, state.hiddenOfferings);
  registerSite(state.site);

  const value: Store = {
    ...state,
    hydrated,
    you,
    allVisitors,
    updateProfile,
    savePlan,
    saveBaptism,
    cancelBaptism,
    saveKids,
    saveStudents,
    cancelStudents,
    cancelKids,
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
    saveAttendance,
    deleteAttendance,
    submitPrayer,
    prayFor,
    updateMyPrayer,
    removeMyPrayer,
    patchPrayer,
    addPrayerNote,
    saveSermonNote,
    submitServe,
    cancelMyServe,
    patchServe,
    addServeNote,
    assignVolunteer,
    setAssignment,
    removeAssignment,
    autoFillSunday,
    toggleBlockout,
    updateScheduleSettings,
    saveEvent,
    deleteEvent,
    toggleHiddenOffering,
    removeResponse,
    updateSite,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The editable website settings (service times, alert, announcements, staff). */
export function useSite() {
  return useStore().site;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
