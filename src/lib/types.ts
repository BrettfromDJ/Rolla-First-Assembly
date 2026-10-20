export type InterestId = "people" | "home" | "faith" | "family" | "serve";

export type FaithStage = "curious" | "exploring" | "returning" | "deeper";
export type GroupSize = "small" | "large" | "either";
export type VisitPath = "planning" | "visited";
export type ServiceTime = "9:00" | "10:30";

export interface FollowUps {
  vibes: string[]; // Meet new people
  groupSize: GroupSize | null; // Meet new people
  faithStage: FaithStage | null; // Explore faith
  ageGroups: string[]; // Connect my family
  homeTopics: string[]; // Find a church home
  serveAreas: string[]; // Make a difference
}

export interface VisitPlan {
  firstName: string;
  contact: string;
  service: ServiceTime;
  bringingKids: boolean;
  kidsCount: number;
  date: string; // ISO date of the Sunday
  createdAt: string;
}

export interface Rsvp {
  id: string;
  offeringId: string;
  itemId?: string;
  message?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  path: VisitPath | null;
  firstName: string;
  email: string;
  phone: string;
  consent: boolean;
  interests: InterestId[];
  followUps: FollowUps;
  onboardingComplete: boolean;
  onboardingCompletedAt: string | null;
  skippedContact: boolean;
  visitPlan: VisitPlan | null;
  rsvps: Rsvp[];
  baptism: BaptismRegistration | null;
  kids: KidsRegistration | null;
  createdAt: string;
}

/**
 * Kids First pre-registration. Fields mirror what Planning Center People / Check-Ins
 * stores, so a family can later be sent there as a household with a person per member.
 */
export interface KidInfo {
  firstName: string;
  lastName: string;
  nickname?: string;
  birthdate: string; // YYYY-MM-DD
  gender: "M" | "F" | "";
  grade: string; // kidGradeOptions id, e.g. "infant" | "prek" | "k" | "1"…"5"
  school?: string;
  medicalNotes?: string; // allergies + medical notes; prints on the name tag
}

export interface Guardian {
  firstName: string;
  lastName: string;
  phone: string; // mobile, used for check-in texts
  email?: string;
}

export interface PickupPerson {
  name: string;
  relationship?: string;
  phone?: string;
}

export interface KidsRegistration {
  parent: Guardian & { email: string };
  secondGuardian?: Guardian;
  kids: KidInfo[];
  pickup: PickupPerson[]; // other trusted adults allowed to pick up
  emergency?: { name: string; phone: string };
  date: string; // ISO of their first Sunday (service start)
  service: ServiceTime;
  notes?: string;
  createdAt: string;
}

export type BaptismAge = "adult" | "student" | "child";

export interface BaptismRegistration {
  firstName: string;
  lastName: string;
  contact: string;
  age: BaptismAge;
  parentName?: string;
  date: string; // ISO of the baptism Sunday (service start)
  service: ServiceTime;
  classDate: string; // ISO of the class they'll attend
  story?: string;
  okToShare: boolean;
  guests: number;
  createdAt: string;
  /* Tracked by staff in the Baptisms tab */
  classAttended?: boolean;
  pastorContacted?: boolean;
  baptized?: boolean;
}

/* ---------- Content ---------- */

export interface Person {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio?: string;
  email?: string;
}

export type OfferingKind = "event" | "group" | "class" | "serve" | "conversation" | "story";
export type ExploreArea = "groups" | "events" | "faith" | "serve";

export interface SubItem {
  id: string;
  title: string;
  meta: string;
  location: string;
  leader: string;
  description: string;
  tags?: string[];
  spots?: number;
  date?: string; // ISO
  durationMin?: number;
}

export interface Offering {
  id: string;
  title: string;
  tag: string;
  kind: OfferingKind;
  area: ExploreArea;
  interests: InterestId[];
  image: string;
  summary: string;
  description: string[];
  schedule: string; // human: "Sundays · After each service"
  date?: string; // ISO of next occurrence
  durationMin?: number;
  location: string;
  expect: string[];
  hostIds: string[];
  cta: string; // card CTA
  action: string; // primary action on detail
  actionKind: "rsvp" | "join" | "question" | "signup";
  confirmTitle: string;
  confirmBody: string;
  items?: SubItem[];
  itemsTitle?: string;
  matchKeys?: string[]; // follow-up answers that boost this
  href?: string; // set when the offering has its own page (e.g. /baptism)
}

/* ---------- Admin ---------- */

export type Stage =
  | "Planning a visit"
  | "First-time visitor"
  | "Getting connected"
  | "Event RSVP"
  | "Connected";

export type FollowStatus = "Needs follow-up" | "Contacted" | "Waiting to hear back";

export interface Note {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  assigneeId: string | null;
  done: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  kind: "visit" | "plan" | "baptism" | "kids" | "onboarding" | "rsvp" | "contacted" | "assigned" | "note" | "task" | "stage" | "join" | "question";
  label: string;
  at: string;
}

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  firstVisit: string;
  source: string;
  interests: InterestId[];
  followUps: FollowUps;
  stage: Stage;
  assigneeId: string | null;
  status: FollowStatus;
  rsvps: Rsvp[];
  visitPlan?: VisitPlan | null;
  baptism?: BaptismRegistration | null;
  kids?: KidsRegistration | null;
  household?: string;
  notes: Note[];
  tasks: Task[];
  activity: Activity[];
  isYou?: boolean;
}

/** Staff-side edits layered on top of the live prototype visitor ("you"). */
export interface VisitorOverlay {
  stage?: Stage;
  assigneeId?: string | null;
  status?: FollowStatus;
  notes: Note[];
  tasks: Task[];
  activity: Activity[];
}

/* ---------- Attendance (counted by hand, entered by staff) ---------- */

export type AttendanceService = "9:00" | "10:30" | "wed";

/** Headcounts per area. Any area left blank wasn't counted; it's not the same as zero. */
export interface AttendanceCounts {
  auditorium?: number; // adults (and students on Sundays, who sit with their families)
  nursery?: number;
  preschool?: number;
  elementary?: number;
  students?: number; // Wednesday youth room
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD, local
  service: AttendanceService;
  counts: AttendanceCounts;
  firstTime?: number; // first-time guests (already included in the counts)
  online?: number; // livestream views, tracked separately from in-person
  note?: string;
  enteredBy: string; // staff id
  updatedAt: string;
}
