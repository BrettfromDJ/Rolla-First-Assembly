import { baptismDates, getOfferings } from "./data";
import type { CalendarCategory, CalendarEntry } from "./types";

/* ---------- The staff church calendar ---------- */

export type CalendarKind = "service" | "event" | "baptism" | "entry";

/** One thing on a given day, whatever it came from. */
export interface CalendarItem {
  id: string;
  title: string;
  short?: string; // label for the month grid
  kind: CalendarKind;
  category?: CalendarCategory;
  date: string; // YYYY-MM-DD
  allDay: boolean;
  start?: string; // "HH:MM"
  end?: string;
  location?: string;
  notes?: string;
  entryId?: string; // set for staff entries, so they can be edited
  href?: string; // where it lives on the site
}

export const calendarCategories: { id: CalendarCategory; label: string }[] = [
  { id: "meeting", label: "Meeting" },
  { id: "rehearsal", label: "Rehearsal" },
  { id: "event", label: "Event" },
  { id: "closure", label: "Office closed" },
  { id: "other", label: "Other" },
];
export const categoryLabel = (c: CalendarCategory) => calendarCategories.find((x) => x.id === c)?.label ?? c;

/** The filter groups shown above the calendar. */
export const calendarLayers = [
  { id: "service", label: "Services" },
  { id: "event", label: "Events" },
  { id: "baptism", label: "Baptisms" },
  { id: "entry", label: "Staff entries" },
] as const;
export type CalendarLayer = (typeof calendarLayers)[number]["id"];

export const ymd = (d: Date) => d.toLocaleDateString("en-CA");
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const addMin = (t: string, mins: number) => {
  const [h, m] = t.split(":").map(Number);
  const x = h * 60 + m + mins;
  return `${String(Math.floor(x / 60) % 24).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
};

/** "6:30 PM" */
export function clock(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** Everything between two days (inclusive), sorted by day then time. */
export function calendarItems(from: Date, to: Date, entries: CalendarEntry[]): CalendarItem[] {
  const start = ymd(from), end = ymd(to);
  const inRange = (d: string) => d >= start && d <= end;
  const out: CalendarItem[] = [];

  // Weekly services
  for (let d = new Date(from); ymd(d) <= end; d.setDate(d.getDate() + 1)) {
    const day = ymd(d);
    if (d.getDay() === 0) {
      out.push({ id: `svc-${day}-9`, title: "Sunday service", short: "Service", kind: "service", date: day, allDay: false, start: "09:00", end: "10:15", location: "Auditorium" });
      out.push({ id: `svc-${day}-10`, title: "Sunday service", short: "Service", kind: "service", date: day, allDay: false, start: "10:30", end: "11:45", location: "Auditorium" });
    }
    if (d.getDay() === 3) out.push({ id: `svc-${day}-wed`, title: "Wednesday night: adults, kids & youth", short: "Wed night", kind: "service", date: day, allDay: false, start: "18:30", end: "20:00", location: "Rolla First" });
  }

  // Baptism Sundays
  for (const b of baptismDates(6, new Date(from.getFullYear(), from.getMonth() - 1, 1))) {
    const day = ymd(b.date);
    if (inRange(day)) out.push({ id: `bap-${day}`, title: "Baptism Sunday", kind: "baptism", date: day, allDay: true, location: "During both services", href: "/baptism" });
  }

  // Events on the site (one-time events and dated sessions)
  for (const o of getOfferings()) {
    const dated = [...(o.date ? [{ id: o.id, title: o.title, date: o.date, mins: o.durationMin, location: o.location }] : []), ...(o.items ?? []).filter((i) => i.date).map((i) => ({ id: `${o.id}-${i.id}`, title: i.title, date: i.date!, mins: i.durationMin ?? o.durationMin, location: i.location ?? o.location }))];
    for (const e of dated) {
      const at = new Date(e.date);
      const day = ymd(at);
      if (!inRange(day)) continue;
      const s = hhmm(at);
      out.push({ id: `evt-${e.id}`, title: e.title, kind: "event", date: day, allDay: false, start: s, end: e.mins ? addMin(s, e.mins) : undefined, location: e.location, href: o.href ?? `/events/${o.id}` });
    }
  }

  // Staff entries (weekly ones repeat from their first date)
  for (const e of entries) {
    const days: string[] = [];
    if (e.repeat === "weekly") {
      const first = new Date(`${e.date}T12:00:00`);
      for (let d = new Date(first); ymd(d) <= end; d.setDate(d.getDate() + 7)) if (inRange(ymd(d))) days.push(ymd(d));
    } else if (inRange(e.date)) days.push(e.date);
    for (const day of days) out.push({ id: `ent-${e.id}-${day}`, title: e.title, kind: "entry", category: e.category, date: day, allDay: e.allDay, start: e.start, end: e.end, location: e.location, notes: e.notes, entryId: e.id });
  }

  return out.sort((a, b) => a.date.localeCompare(b.date) || Number(b.allDay) - Number(a.allDay) || (a.start ?? "").localeCompare(b.start ?? ""));
}

/** Sample staff entries, relative to today so the demo always has some. */
export function buildSeedCalendar(): CalendarEntry[] {
  const now = new Date();
  const nextDow = (dow: number, weeks = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7) + weeks * 7);
    return ymd(d);
  };
  const thanksgiving = (() => {
    const d = new Date(now.getFullYear(), 10, 1);
    d.setDate(1 + ((4 - d.getDay() + 7) % 7) + 21);
    return ymd(d);
  })();
  const stamp = now.toISOString();
  const e = (x: Omit<CalendarEntry, "createdBy" | "updatedAt">): CalendarEntry => ({ ...x, createdBy: "amber", updatedAt: stamp });
  const back = (d: string, weeks: number) => {
    const x = new Date(`${d}T12:00:00`);
    x.setDate(x.getDate() - weeks * 7);
    return ymd(x);
  };
  return [
    e({ id: "cal_staff", title: "Staff meeting", category: "meeting", date: back(nextDow(2), 8), allDay: false, start: "10:00", end: "11:00", repeat: "weekly", location: "Conference room" }),
    e({ id: "cal_worship", title: "Worship team rehearsal", category: "rehearsal", date: back(nextDow(4), 8), allDay: false, start: "19:00", end: "20:30", repeat: "weekly", location: "Auditorium" }),
    e({ id: "cal_board", title: "Church board meeting", category: "meeting", date: nextDow(1, 1), allDay: false, start: "18:30", end: "20:00", repeat: "none", location: "Conference room" }),
    e({ id: "cal_kidsteam", title: "Rolla First Kids volunteer training", category: "meeting", date: nextDow(6, 2), allDay: false, start: "09:00", end: "11:00", repeat: "none", location: "Kids area (downstairs)", notes: "Required for new volunteers. Pastor Micah leading." }),
    e({ id: "cal_thanks", title: "Office closed for Thanksgiving", category: "closure", date: thanksgiving, allDay: true, repeat: "none" }),
    e({ id: "cal_xmas", title: "Christmas Eve candlelight service", category: "event", date: `${now.getFullYear()}-12-24`, allDay: false, start: "17:00", end: "18:00", repeat: "none", location: "Auditorium" }),
  ];
}
