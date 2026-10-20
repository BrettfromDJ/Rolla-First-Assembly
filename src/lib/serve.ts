import type { ServeFrequency, ServeSignup, ServeTime } from "./types";
import { daysAgo } from "./utils";

export type ServeArea = "welcome" | "kids" | "music" | "care" | "behind";

export const serveAreas: { id: ServeArea; label: string }[] = [
  { id: "welcome", label: "Welcome & guests" },
  { id: "kids", label: "Kids & students" },
  { id: "music", label: "Worship & production" },
  { id: "care", label: "Prayer & care" },
  { id: "behind", label: "Behind the scenes" },
];

export interface ServeTeam {
  id: string;
  name: string;
  area: ServeArea;
  tagline: string;
  does: string[];
  roles: string[];
  when: string;
  times: ServeTime[];
  commitment: string;
  leaderId: string;
  minAge?: number;
  teensWith?: string; // how teens can help, when they can't serve alone
  backgroundCheck?: boolean;
  audition?: boolean;
  /** Volunteers already serving, and how many the team needs to run well. */
  serving: number;
  goal: number;
}

export const serveTeams: ServeTeam[] = [
  {
    id: "welcome",
    name: "Welcome Team",
    area: "welcome",
    tagline: "Be the first smile people see on Sunday.",
    does: ["Greet people at the doors and in the parking lots", "Help guests find the kids area, coffee, and a seat", "Staff the Connect Center after each service"],
    roles: ["Greeter", "Parking lot", "Usher", "Connect Center"],
    when: "Sundays, 30 minutes before either service",
    times: ["9:00", "10:30"],
    commitment: "One or two Sundays a month",
    leaderId: "amber",
    minAge: 13,
    serving: 34,
    goal: 40,
  },
  {
    id: "coffee",
    name: "Coffee Team",
    area: "welcome",
    tagline: "Pour coffee, start conversations.",
    does: ["Brew and serve coffee in the Gym before and between services", "Keep the coffee bar stocked and tidy", "Learn names and say hello"],
    roles: ["Barista", "Setup crew"],
    when: "Sundays from 8:15 AM",
    times: ["9:00", "10:30"],
    commitment: "One Sunday a month",
    leaderId: "amber",
    minAge: 16,
    serving: 14,
    goal: 16,
  },
  {
    id: "kids-first",
    name: "Kids First",
    area: "kids",
    tagline: "Help kids know they're loved by God and by us.",
    does: ["Lead a small group or help in a classroom", "Rock babies and play with toddlers in the nursery", "Run check-in at the Kids Welcome desk"],
    roles: ["Nursery", "Preschool", "Elementary small group", "Check-in desk"],
    when: "Sundays during either service",
    times: ["9:00", "10:30"],
    commitment: "Two Sundays a month (you still go to the other service)",
    leaderId: "debbie",
    minAge: 18,
    teensWith: "Students 13+ can help alongside an adult leader.",
    backgroundCheck: true,
    serving: 21,
    goal: 36,
  },
  {
    id: "students",
    name: "Student Leaders",
    area: "kids",
    tagline: "Walk with middle and high schoolers on Wednesday nights.",
    does: ["Lead a small group of students", "Hang out, play games, and listen well", "Help with events, camps, and trips"],
    roles: ["Small group leader", "Event helper"],
    when: "Wednesdays, 6:00 to 8:00 PM, youth room upstairs",
    times: ["wed"],
    commitment: "Most Wednesdays during the school year",
    leaderId: "gannon",
    minAge: 21,
    backgroundCheck: true,
    serving: 9,
    goal: 14,
  },
  {
    id: "worship",
    name: "Worship Team",
    area: "music",
    tagline: "Lead the church in singing on Sundays.",
    does: ["Sing or play with the band", "Rehearse Thursday evenings", "Learn new songs and grow as a worshiper"],
    roles: ["Vocals", "Keys", "Electric guitar", "Acoustic guitar", "Bass", "Drums"],
    when: "Sundays plus Thursday rehearsal",
    times: ["9:00", "10:30", "weekday"],
    commitment: "Two Sundays a month",
    leaderId: "gannon",
    minAge: 15,
    audition: true,
    serving: 18,
    goal: 20,
  },
  {
    id: "production",
    name: "Production",
    area: "music",
    tagline: "Run sound, lights, slides, and the livestream.",
    does: ["Run lyrics and sermon slides", "Mix sound or run lights", "Operate a livestream camera"],
    roles: ["Slides", "Audio", "Lighting", "Livestream camera"],
    when: "Sundays, arrive by 8:00 AM",
    times: ["9:00", "10:30"],
    commitment: "Two Sundays a month",
    leaderId: "garrett",
    minAge: 13,
    serving: 11,
    goal: 18,
  },
  {
    id: "prayer",
    name: "Prayer Team",
    area: "care",
    tagline: "Pray with people after services and over every request.",
    does: ["Pray with people at the front after each service", "Pray through the week's prayer requests", "Keep everything shared with you confidential"],
    roles: ["Prayer after service", "Weekly prayer list"],
    when: "Sundays after service, or from home during the week",
    times: ["9:00", "10:30", "weekday"],
    commitment: "Weekly from home, or one Sunday a month",
    leaderId: "lance",
    minAge: 18,
    serving: 12,
    goal: 15,
  },
  {
    id: "care",
    name: "Care & Meals",
    area: "care",
    tagline: "Show up for families when life gets hard.",
    does: ["Bring a meal after a new baby, surgery, or loss", "Help with funeral receptions", "Visit or call people who can't make it to church"],
    roles: ["Meals", "Funeral receptions", "Visits and calls"],
    when: "Weekdays, as needs come up",
    times: ["weekday"],
    commitment: "When you're available. We'll text when there's a need.",
    leaderId: "pam",
    minAge: 18,
    serving: 26,
    goal: 30,
  },
  {
    id: "baptism",
    name: "Baptism Team",
    area: "care",
    tagline: "Help make baptism Sundays unforgettable.",
    does: ["Set out shirts and towels and help people get ready", "Guide families to their saved seats", "Take photos people will treasure"],
    roles: ["Changing rooms", "Family host", "Photographer"],
    when: "The second Sunday of each month",
    times: ["9:00", "10:30"],
    commitment: "Once a month",
    leaderId: "lance",
    minAge: 16,
    serving: 6,
    goal: 8,
  },
  {
    id: "facilities",
    name: "Facilities & Grounds",
    area: "behind",
    tagline: "Keep our building and grounds ready for people.",
    does: ["Join a Saturday workday a few times a year", "Help with small repairs and setup", "Mow, trim, and plant in spring and summer"],
    roles: ["Workdays", "Handyman", "Grounds"],
    when: "Saturdays and occasional weekdays",
    times: ["saturday", "weekday"],
    commitment: "A few Saturdays a year",
    leaderId: "garrett",
    minAge: 13,
    serving: 15,
    goal: 20,
  },
];

export const teamById = Object.fromEntries(serveTeams.map((t) => [t.id, t])) as Record<string, ServeTeam>;

/** Teams furthest from their goal come first. */
export const mostNeeded = [...serveTeams].sort((a, b) => a.serving / a.goal - b.serving / b.goal).slice(0, 3);

export const serveTimeOptions: { id: ServeTime; label: string }[] = [
  { id: "9:00", label: "Sunday 9:00" },
  { id: "10:30", label: "Sunday 10:30" },
  { id: "wed", label: "Wednesday night" },
  { id: "weekday", label: "Weekdays" },
  { id: "saturday", label: "Saturdays" },
];
export const serveTimeLabel = (id: ServeTime) => serveTimeOptions.find((t) => t.id === id)?.label ?? id;

export const frequencyOptions: { id: ServeFrequency; label: string }[] = [
  { id: "weekly", label: "Every week" },
  { id: "biweekly", label: "Every other week" },
  { id: "monthly", label: "Once a month" },
  { id: "events", label: "Now and then" },
];
export const frequencyLabel = (id: ServeFrequency) => frequencyOptions.find((f) => f.id === id)?.label ?? id;

/* ---------- Sample sign-ups for the staff view ---------- */

type Seed = Omit<ServeSignup, "id" | "email" | "phone" | "notes" | "createdAt" | "teen" | "shadowFirst"> & { days: number; teen?: boolean; shadowFirst?: boolean };

const seeds: Seed[] = [
  { teamId: "kids-first", firstName: "Hannah", lastName: "Brooks", roles: ["Nursery"], times: ["10:30"], frequency: "biweekly", status: "new", backgroundCheck: "needed", days: 0, experience: "I taught preschool for three years before Ava was born." },
  { teamId: "production", firstName: "Jordan", lastName: "Ellis", roles: ["Audio"], times: ["9:00"], frequency: "biweekly", status: "contacted", days: 4, experience: "Ran sound at my last church for two years." },
  { teamId: "welcome", firstName: "Grace", lastName: "Liu", roles: ["Greeter", "Connect Center"], times: ["10:30"], frequency: "monthly", status: "serving", days: 21 },
  { teamId: "coffee", firstName: "Maya", lastName: "Chen", roles: ["Barista"], times: ["9:00"], frequency: "monthly", status: "shadowing", days: 6, shadowFirst: true },
  { teamId: "students", firstName: "Marcus", lastName: "Odum", roles: ["Small group leader"], times: ["wed"], frequency: "weekly", status: "contacted", backgroundCheck: "sent", days: 9 },
  { teamId: "worship", firstName: "Priya", lastName: "Natarajan", roles: ["Vocals"], times: ["10:30", "weekday"], frequency: "biweekly", status: "new", days: 1, experience: "Sang in choir through college." },
  { teamId: "kids-first", firstName: "Eli", lastName: "Washington", roles: ["Elementary small group"], times: ["9:00"], frequency: "biweekly", status: "shadowing", backgroundCheck: "cleared", days: 12 },
  { teamId: "production", firstName: "Caleb", lastName: "Fry", roles: ["Slides", "Livestream camera"], times: ["10:30"], frequency: "biweekly", status: "new", teen: true, days: 2 },
  { teamId: "care", firstName: "Linda", lastName: "Morgan", roles: ["Meals", "Visits and calls"], times: ["weekday"], frequency: "events", status: "serving", days: 30 },
  { teamId: "prayer", firstName: "Olivia", lastName: "Grant", roles: ["Weekly prayer list"], times: ["weekday"], frequency: "weekly", status: "new", days: 3 },
  { teamId: "facilities", firstName: "Ben", lastName: "Carter", roles: ["Handyman"], times: ["saturday"], frequency: "events", status: "not-now", days: 18 },
];

export function buildSeedServe(): ServeSignup[] {
  return seeds.map(({ days, teen, shadowFirst, ...s }, i) => ({
    ...s,
    id: `sv_seed${i + 1}`,
    email: `${s.firstName}.${s.lastName}`.toLowerCase() + "@example.com",
    phone: `(573) 555-02${String(10 + i).padStart(2, "0")}`,
    teen: !!teen,
    shadowFirst: !!shadowFirst,
    shadowDate: s.status === "shadowing" ? (() => { const d = new Date(); d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)); return d.toLocaleDateString("en-CA"); })() : undefined,
    notes: [],
    createdAt: daysAgo(days, 9 + (i % 9)),
  }));
}
