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
  guests?: number; // extra people coming along (staff-built events)
  answer?: string; // answer to the event's own question
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
  students: StudentsRegistration | null;
  createdAt: string;
}

/**
 * Rolla First Kids pre-registration. Fields mirror what Planning Center People / Check-Ins
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

/** A parent signing up 7th–12th graders for Wednesday nights (mirrors Planning Center fields like Rolla First Kids). */
export interface StudentInfo {
  firstName: string;
  lastName: string;
  grade: string; // "6"…"12"
  school?: string;
  medicalNotes?: string;
  phone?: string; // the student's own cell, for group texts (with the parent's OK)
}

export interface StudentsRegistration {
  parent: Guardian & { email: string };
  students: StudentInfo[];
  parentTexts: boolean; // weekly parent updates by text
  studentTexts: boolean; // OK to add the student to the youth group text
  date: string; // ISO of their first Wednesday (6:30 PM)
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
  story?: string;
  okToShare: boolean;
  guests: number;
  createdAt: string;
  /* Tracked by staff in the Baptisms tab */
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
  /* Set on events staff build in the admin Event builder */
  custom?: boolean;
  status?: "draft" | "published";
  capacity?: number; // total people, guests included
  allowGuests?: boolean;
  question?: string; // one extra question on the RSVP form
  questionRequired?: boolean;
  closesAt?: string; // ISO, when sign-ups close
  createdBy?: string;
  updatedAt?: string;
}

/** Someone who RSVP'd or signed up for a staff-built event. */
export interface EventResponse {
  id: string;
  eventId: string;
  name: string;
  contact: string;
  guests: number;
  answer?: string;
  message?: string;
  isYou?: boolean;
  createdAt: string;
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
  kind: "household" | "member" | "visit" | "plan" | "baptism" | "kids" | "students" | "onboarding" | "rsvp" | "contacted" | "assigned" | "note" | "task" | "stage" | "join" | "question";
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
  students?: StudentsRegistration | null;
  household?: string;
  /** Set when they become a member. Everyone else is a guest. */
  memberSince?: string | null;
  birthday?: string; // YYYY-MM-DD (adults; kids' birthdates live on their registration)
  notes: Note[];
  tasks: Task[];
  activity: Activity[];
  isYou?: boolean;
}

/** A family record: the adults who live together, plus the kids on their registrations. */
export interface Household {
  id: string;
  name: string; // "The Henderson family"
  memberIds: string[]; // visitor ids of the adults
  anniversary?: string; // YYYY-MM-DD wedding date
  createdAt: string;
}

/** Staff-side edits layered on top of the live prototype visitor ("you"). */
export interface VisitorOverlay {
  stage?: Stage;
  assigneeId?: string | null;
  status?: FollowStatus;
  memberSince?: string | null;
  birthday?: string;
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

/* ---------- Prayer requests ---------- */

export type PrayerCategory = "health" | "family" | "grief" | "work" | "faith" | "relationships" | "praise" | "other";
/** Who can see it: pastors only, the prayer team, or the public prayer wall (after staff approve it). */
export type PrayerVisibility = "pastors" | "team" | "wall";
export type PrayerStatus = "new" | "praying" | "answered" | "archived";

export interface PrayerRequest {
  id: string;
  name: string; // may be blank when anonymous
  anonymous: boolean; // hide the name everywhere except from pastors
  contact?: string;
  wantsContact: boolean; // asked for someone to reach out
  category: PrayerCategory;
  body: string;
  visibility: PrayerVisibility;
  wallApproved?: boolean; // staff approved it for the public wall
  status: PrayerStatus;
  prayedCount: number;
  update?: { body: string; at: string; by: "requester" | string }; // answered-prayer or progress update
  assigneeId?: string | null;
  contacted?: boolean;
  notes: Note[];
  isYou?: boolean; // submitted from this browser
  createdAt: string;
}

/* ---------- Serving (volunteer teams) ---------- */

export type ServeTime = "9:00" | "10:30" | "wed" | "weekday" | "saturday";
export type ServeFrequency = "weekly" | "biweekly" | "monthly" | "events";
export type ServeStatus = "new" | "contacted" | "shadowing" | "serving" | "not-now";
export type BackgroundCheck = "needed" | "sent" | "cleared";

export interface ServeSignup {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  teen: boolean; // under 18 (needs a parent's OK, and some teams have age limits)
  roles: string[];
  times: ServeTime[];
  frequency: ServeFrequency;
  experience?: string;
  shadowFirst: boolean;
  status: ServeStatus;
  backgroundCheck?: BackgroundCheck; // only for teams that require one
  shadowDate?: string; // YYYY-MM-DD
  notes: Note[];
  isYou?: boolean;
  createdAt: string;
}

/* ---------- Volunteer scheduling ---------- */

export interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  teamId: string;
  positions: string[];
  service: ServiceTime | "either"; // the service they usually serve
  frequency: "weekly" | "biweekly" | "monthly";
  blockouts: string[]; // YYYY-MM-DD Sundays they've said they're away
}

export type AssignmentStatus = "pending" | "confirmed" | "declined";

export interface Assignment {
  id: string;
  date: string; // YYYY-MM-DD (a Sunday)
  service: ServiceTime;
  teamId: string;
  position: string;
  slot: number; // which of that position's spots (0-based)
  volunteerId: string;
  status: AssignmentStatus;
  reason?: string; // why they can't make it
  assignedAt: string;
  respondedAt?: string;
}

export interface ScheduleSettings {
  reminders: boolean;
  daysBefore: number; // reminder text this many days before
  time: string; // "18:00"
  dayOf: boolean; // a second text the morning of
  dayOfTime: string; // "07:30"
}

/* ---------- Church calendar (staff only) ---------- */

export type CalendarCategory = "meeting" | "rehearsal" | "event" | "closure" | "other";

/** Something staff put on the church calendar by hand: meetings, rehearsals, closings. */
export interface CalendarEntry {
  id: string;
  title: string;
  category: CalendarCategory;
  date: string; // YYYY-MM-DD (first occurrence)
  allDay: boolean;
  start?: string; // "HH:MM"
  end?: string; // "HH:MM"
  repeat: "none" | "weekly";
  location?: string;
  notes?: string;
  createdBy: string;
  updatedAt: string;
}
