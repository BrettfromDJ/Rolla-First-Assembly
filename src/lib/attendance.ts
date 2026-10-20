import type { AttendanceCounts, AttendanceRecord, AttendanceService } from "./types";

export const attendanceServices: { id: AttendanceService; label: string; short: string; day: number }[] = [
  { id: "9:00", label: "Sunday 9:00 AM", short: "9:00", day: 0 },
  { id: "10:30", label: "Sunday 10:30 AM", short: "10:30", day: 0 },
  { id: "wed", label: "Wednesday 6:30 PM", short: "Wed", day: 3 },
];

/** Which areas get counted at each kind of service. */
export const attendanceAreas: { id: keyof AttendanceCounts; label: string; sunday: boolean; wednesday: boolean; hint?: string }[] = [
  { id: "auditorium", label: "Auditorium", sunday: true, wednesday: true, hint: "Adults, plus students on Sundays" },
  { id: "nursery", label: "Nursery", sunday: true, wednesday: true },
  { id: "preschool", label: "Preschool", sunday: true, wednesday: true },
  { id: "elementary", label: "Elementary", sunday: true, wednesday: true },
  { id: "students", label: "Students", sunday: false, wednesday: true, hint: "Youth room upstairs" },
];

export const areasFor = (service: AttendanceService) => attendanceAreas.filter((a) => (service === "wed" ? a.wednesday : a.sunday));

export const kidsTotal = (c: AttendanceCounts) => (c.nursery ?? 0) + (c.preschool ?? 0) + (c.elementary ?? 0);
export const inPersonTotal = (c: AttendanceCounts) => (c.auditorium ?? 0) + kidsTotal(c) + (c.students ?? 0);

/* ---------- Dates (local, YYYY-MM-DD) ---------- */

export const ymd = (d: Date) => d.toLocaleDateString("en-CA");
export const fromYmd = (s: string) => new Date(`${s}T12:00:00`);
export const addDays = (s: string, n: number) => {
  const d = fromYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
};

/** The most recent date (today included) that falls on `day` (0 = Sunday). */
export function lastDow(day: number, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() - ((d.getDay() - day + 7) % 7));
  return ymd(d);
}

/** Every date a service met between two dates (inclusive), oldest first. */
export function serviceDates(service: AttendanceService, start: string, end: string) {
  const day = service === "wed" ? 3 : 0;
  const out: string[] = [];
  for (let d = lastDow(day, fromYmd(end)); d >= start; d = addDays(d, -7)) out.unshift(d);
  return out;
}

/* ---------- Sample history ---------- */

function easter(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(new Date(year, month - 1, day));
}

/** A Sunday that usually draws a bigger (or smaller) crowd, with the note staff would leave. */
function specialSunday(date: string): { factor: number; note: string } | null {
  const d = fromYmd(date);
  const m = d.getMonth(), day = d.getDate();
  if (date === easter(d.getFullYear())) return { factor: 1.55, note: "Easter Sunday" };
  if (m === 4 && day >= 8 && day <= 14) return { factor: 1.18, note: "Mother's Day" };
  if (m === 7 && day >= 16 && day <= 22) return { factor: 1.12, note: "Back-to-school Sunday" };
  if (m === 11 && day >= 18 && day <= 24) return { factor: 1.3, note: "Christmas Sunday" };
  if (m === 6 && day <= 7) return { factor: 0.82, note: "Fourth of July weekend" };
  if (m === 0 && day >= 18 && day <= 24) return { factor: 0.7, note: "Snow and ice" };
  return null;
}

/** Summer dip, fall bump, and slow growth over the year. */
function season(date: string, start: string) {
  const m = fromYmd(date).getMonth();
  const s = m >= 5 && m <= 7 ? 0.87 : m === 8 || m === 9 ? 1.05 : 1;
  const weeks = (+fromYmd(date) - +fromYmd(start)) / (7 * 864e5);
  return s * (1 + weeks * 0.0016);
}

/** Deterministic noise so the sample looks the same on every load. */
function noise(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000 - 0.5;
}

const base: Record<AttendanceService, Required<AttendanceCounts>> = {
  "9:00": { auditorium: 138, nursery: 7, preschool: 12, elementary: 24, students: 0 },
  "10:30": { auditorium: 204, nursery: 11, preschool: 18, elementary: 33, students: 0 },
  wed: { auditorium: 58, nursery: 6, preschool: 10, elementary: 21, students: 46 },
};

/** About a year of counts. The latest couple of services are left blank, like a real week where nobody's entered them yet. */
export function buildSeedAttendance(today = new Date()): AttendanceRecord[] {
  const end = ymd(today);
  const start = addDays(end, -364);
  const out: AttendanceRecord[] = [];
  const lastSunday = lastDow(0, today);
  const lastWed = lastDow(3, today);
  for (const svc of attendanceServices) {
    for (const date of serviceDates(svc.id, start, end)) {
      if ((svc.id === "9:00" && date === lastSunday) || (svc.id === "wed" && date === lastWed)) continue;
      const special = svc.id === "wed" ? null : specialSunday(date);
      const summerWed = svc.id === "wed" && [5, 6].includes(fromYmd(date).getMonth()) ? 0.75 : 1;
      const f = season(date, start) * (special?.factor ?? 1) * summerWed;
      const counts: AttendanceCounts = {};
      for (const area of areasFor(svc.id)) {
        const n = base[svc.id][area.id] * f * (1 + noise(`${date}${svc.id}${area.id}`) * 0.16);
        counts[area.id] = Math.max(0, Math.round(n));
      }
      const total = inPersonTotal(counts);
      out.push({
        id: `att_${date}_${svc.id}`,
        date,
        service: svc.id,
        counts,
        firstTime: svc.id === "wed" ? undefined : Math.max(0, Math.round(total * (0.022 + noise(`${date}${svc.id}ft`) * 0.02) * (special && special.factor > 1.1 ? 2 : 1))),
        online: svc.id === "wed" ? undefined : Math.round((svc.id === "9:00" ? 95 : 160) * (special?.note === "Snow and ice" ? 2.6 : 1) * (1 + noise(`${date}${svc.id}on`) * 0.3)),
        note: special?.note,
        enteredBy: svc.id === "wed" ? "gannon" : "amber",
        updatedAt: new Date(fromYmd(addDays(date, svc.id === "wed" ? 1 : 1)).setHours(10)).toISOString(),
      });
    }
  }
  return out;
}
