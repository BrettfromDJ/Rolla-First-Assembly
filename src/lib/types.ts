export type InterestId = "people" | "home" | "faith" | "family" | "serve";

export type FaithStage = "curious" | "exploring" | "returning" | "deeper";
export type GroupSize = "small" | "large" | "either";
export type VisitPath = "planning" | "visited";
export type ServiceTime = "9:00" | "11:00";

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
  createdAt: string;
}

/* ---------- Content ---------- */

export interface Person {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio?: string;
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
  kind: "visit" | "plan" | "onboarding" | "rsvp" | "contacted" | "assigned" | "note" | "task" | "stage" | "join" | "question";
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
