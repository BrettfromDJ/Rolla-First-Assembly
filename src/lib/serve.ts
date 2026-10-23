import type { ServeFrequency, ServeSignup, ServeTime } from "./types";
import { daysAgo } from "./utils";

export type ServeArea = "welcome" | "coffee" | "kids" | "youth" | "worship" | "production";

export const serveAreas: { id: ServeArea; label: string }[] = [
  { id: "welcome", label: "Welcome & guests" },
  { id: "coffee", label: "Coffee ministry" },
  { id: "kids", label: "Kids" },
  { id: "youth", label: "Youth" },
  { id: "worship", label: "Worship" },
  { id: "production", label: "Production" },
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
  commitment?: string;
  leaderId: string;
  coLeaderId?: string; // teams led by two people
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
    when: "Sundays: 8:30 to 10:15 AM for first service, 10:00 to 10:45 AM for second",
    times: ["9:00", "10:30"],
    commitment: "One Sunday a month",
    leaderId: "amber",
    minAge: 13,
    serving: 34,
    goal: 40,
  },
  {
    id: "coffee",
    name: "Coffee Team",
    area: "coffee",
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
    name: "Rolla First Kids",
    area: "kids",
    tagline: "Help kids know they're loved by God and by us.",
    does: ["Lead a small group or help in a classroom", "Rock babies and play with toddlers in the nursery", "Run check-in at the Kids Welcome desk"],
    roles: ["Nursery", "Preschool", "Elementary small group", "Check-in desk"],
    when: "Sundays during either service",
    times: ["9:00", "10:30"],
    commitment: "One Sunday a month",
    leaderId: "micah",
    coLeaderId: "pam",
    minAge: 18,
    teensWith: "Teens 13+ can help alongside an adult leader.",
    backgroundCheck: true,
    serving: 21,
    goal: 36,
  },
  {
    id: "students",
    name: "Youth Leaders",
    area: "youth",
    tagline: "Walk with middle and high schoolers on Wednesday nights.",
    does: ["Lead a small group of students", "Hang out, play games, and listen well", "Help with events, camps, and trips"],
    roles: ["Small group leader", "Event helper"],
    when: "Wednesday evening service, youth room upstairs",
    times: ["wed"],
    leaderId: "gannon",
    minAge: 21,
    backgroundCheck: true,
    serving: 9,
    goal: 14,
  },
  {
    id: "worship",
    name: "Worship Team",
    area: "worship",
    tagline: "Lead the church in singing on Sundays.",
    does: ["Sing or play with the band", "Rehearse Thursday evenings", "Learn new songs and grow as a worshiper"],
    roles: ["Vocals", "Keys", "Electric guitar", "Acoustic guitar", "Bass", "Drums"],
    when: "Sundays plus Thursday rehearsal",
    times: ["9:00", "10:30"],
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
    area: "production",
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
];

export const teamById = Object.fromEntries(serveTeams.map((t) => [t.id, t])) as Record<string, ServeTeam>;

/** Teams furthest from their goal come first. */
export const mostNeeded = [...serveTeams].sort((a, b) => a.serving / a.goal - b.serving / b.goal).slice(0, 3);

export const serveTimeOptions: { id: ServeTime; label: string }[] = [
  { id: "9:00", label: "Sunday 9:00" },
  { id: "10:30", label: "Sunday 10:30" },
  { id: "wed", label: "Wednesday night" },
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
  { teamId: "worship", firstName: "Priya", lastName: "Natarajan", roles: ["Vocals"], times: ["10:30"], frequency: "biweekly", status: "new", days: 1, experience: "Sang in choir through college." },
  { teamId: "kids-first", firstName: "Eli", lastName: "Washington", roles: ["Elementary small group"], times: ["9:00"], frequency: "biweekly", status: "shadowing", backgroundCheck: "cleared", days: 12 },
  { teamId: "production", firstName: "Caleb", lastName: "Fry", roles: ["Slides", "Livestream camera"], times: ["10:30"], frequency: "biweekly", status: "new", teen: true, days: 2 },
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
