import { church, staff, staffById } from "./data";
import type { Person, ServiceTime } from "./types";

/* ---------- What staff can change from the admin's Website tab ---------- */

export interface SiteStaff extends Person {
  onSite: boolean; // shown in "Pastors & leadership" on the homepage
  custom?: boolean; // added in the admin (can be deleted; built-in staff can only be hidden)
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  linkLabel?: string;
  href?: string;
  until?: string; // YYYY-MM-DD; hidden from the site after this day
  published: boolean;
  createdAt: string;
}

export type AlertTone = "urgent" | "info";

export interface SiteAlert {
  on: boolean;
  tone: AlertTone;
  message: string;
  linkLabel?: string;
  href?: string;
  updatedAt?: string;
  by?: string;
}

export interface SiteSettings {
  /** 24-hour "HH:MM". The first and second Sunday service keep their ids ("9:00", "10:30") everywhere else. */
  sunday: [string, string];
  wednesday: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  alert: SiteAlert;
  announcements: Announcement[];
  staff: SiteStaff[];
  updatedAt?: string;
  updatedBy?: string;
}

const iso = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-CA");
};

export function defaultSite(): SiteSettings {
  return {
    sunday: ["09:00", "10:30"],
    wednesday: "18:30",
    phone: church.phone,
    email: church.email,
    address: church.address,
    city: church.city,
    alert: { on: false, tone: "urgent", message: "" },
    announcements: [
      {
        id: "ann_fall-festival",
        title: "Fall Festival is coming",
        body: "Games, chili, and a trunk-or-treat for the kids. Bring a friend and a lawn chair.",
        linkLabel: "Get the details",
        href: "/events/fall-festival",
        until: iso(30),
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "ann_baptism",
        title: "Baptism Sunday",
        body: "Ready to take the next step? Sign up and Pastor Lance will reach out before the big day.",
        linkLabel: "Sign up",
        href: "/baptism",
        published: true,
        createdAt: new Date().toISOString(),
      },
    ],
    staff: staff.map((s) => ({ ...s, onSite: true })),
  };
}

/** Fills in anything an older save is missing. */
export function mergeSite(saved: Partial<SiteSettings> | undefined): SiteSettings {
  const d = defaultSite();
  if (!saved) return d;
  return { ...d, ...saved, alert: { ...d.alert, ...saved.alert }, staff: saved.staff?.length ? saved.staff : d.staff };
}

let current: SiteSettings | null = null;

/** The latest settings, for helpers outside React (set by the store on every render). */
export function registerSite(s: SiteSettings) {
  current = s;
  registerSiteStaff(s.staff);
}
export const currentSite = () => current ?? defaultSite();

/** Keeps the shared staff lookup (used for assignments, hosts and bylines) in step with edits. */
export function registerSiteStaff(list: SiteStaff[]) {
  for (const s of list) {
    const { onSite: _onSite, custom: _custom, ...person } = s;
    if (staffById[s.id]) Object.assign(staffById[s.id], person);
    else staffById[s.id] = { ...person };
  }
}

/* ---------- Formatting ---------- */

/** "09:00" -> "9:00"; "18:30" -> "6:30". */
export function clock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`;
}

export const meridiem = (hhmm: string) => (Number(hhmm.split(":")[0]) < 12 ? "AM" : "PM");

/** "9:00 AM" */
export const clockFull = (hhmm: string) => `${clock(hhmm)} ${meridiem(hhmm)}`;

/** "9:00 & 10:30 AM", or "9:00 AM & 12:00 PM" when they straddle noon. */
export function sundayLine(s: SiteSettings) {
  const [a, b] = s.sunday;
  return meridiem(a) === meridiem(b) ? `${clock(a)} & ${clock(b)} ${meridiem(b)}` : `${clockFull(a)} & ${clockFull(b)}`;
}

/** The display time for a service id ("9:00" is the first service, "10:30" the second). */
export const serviceClock = (s: SiteSettings, id: ServiceTime) => clock(s.sunday[id === "9:00" ? 0 : 1]);

/** Sets the hours on a date to the start of that service. */
export function atService(date: Date, s: SiteSettings, id: ServiceTime) {
  const [h, m] = s.sunday[id === "9:00" ? 0 : 1].split(":").map(Number);
  date.setHours(h, m, 0, 0);
  return date;
}

/** Minutes after midnight, plus or minus an offset, back to "HH:MM". */
export function addMinutes(hhmm: string, mins: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const t = (((h * 60 + m + mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** Announcements visitors should see today. */
export function liveAnnouncements(s: SiteSettings) {
  const today = new Date().toLocaleDateString("en-CA");
  return s.announcements.filter((a) => a.published && (!a.until || a.until >= today));
}

/** "9:00 & 10:30", for big figures where AM is implied. */
export const sundayShort = (s: SiteSettings) => `${clock(s.sunday[0])} & ${clock(s.sunday[1])}`;
