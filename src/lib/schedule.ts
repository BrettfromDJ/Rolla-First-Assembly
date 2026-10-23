import type { Assignment, ScheduleSettings, ServiceTime, Volunteer } from "./types";

/* ---------- What each scheduled team needs every Sunday, per service ---------- */

export const scheduledTeams: { id: string; name: string; positions: { name: string; spots: number }[] }[] = [
  {
    id: "kids-first",
    name: "Rolla First Kids",
    positions: [
      { name: "Nursery", spots: 2 },
      { name: "Preschool", spots: 2 },
      { name: "Elementary small group", spots: 3 },
      { name: "Check-in desk", spots: 2 },
    ],
  },
  {
    id: "welcome",
    name: "Welcome Team",
    positions: [
      { name: "Greeter", spots: 3 },
      { name: "Parking lot", spots: 2 },
      { name: "Connect Center", spots: 1 },
    ],
  },
  { id: "coffee", name: "Coffee Team", positions: [{ name: "Barista", spots: 2 }] },
  {
    id: "production",
    name: "Production",
    positions: [
      { name: "Slides", spots: 1 },
      { name: "Audio", spots: 1 },
      { name: "Lighting", spots: 1 },
      { name: "Livestream camera", spots: 1 },
    ],
  },
];

export const services: ServiceTime[] = ["9:00", "10:30"];

export const defaultScheduleSettings: ScheduleSettings = { reminders: true, daysBefore: 3, time: "18:00", dayOf: true, dayOfTime: "07:30" };

/* ---------- Dates ---------- */

const ymd = (d: Date) => d.toLocaleDateString("en-CA");
export const fromYmd = (s: string) => new Date(`${s}T12:00:00`);

/** The next `count` Sundays, starting with today if it's Sunday. */
export function upcomingSundays(count = 6, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return Array.from({ length: count }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i * 7);
    return ymd(x);
  });
}

const weeksBetween = (a: string, b: string) => Math.round((+fromYmd(a) - +fromYmd(b)) / (7 * 864e5));

/** When the automatic reminder for a Sunday goes out. */
export function reminderAt(date: string, s: ScheduleSettings) {
  const d = fromYmd(date);
  d.setDate(d.getDate() - s.daysBefore);
  const [h, m] = s.time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}
export function dayOfAt(date: string, s: ScheduleSettings) {
  const d = fromYmd(date);
  const [h, m] = s.dayOfTime.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

export const timeLabel = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export function reminderText(v: Pick<Volunteer, "firstName">, a: Pick<Assignment, "date" | "service" | "position" | "teamId">, kind: "scheduled" | "reminder" | "dayOf") {
  const day = fromYmd(a.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const team = scheduledTeams.find((t) => t.id === a.teamId)?.name ?? "your team";
  const arrive = a.teamId === "production" ? "8:00" : a.service === "9:00" ? "8:30" : "10:00";
  if (kind === "scheduled") return `Hi ${v.firstName}! You're scheduled for ${team} (${a.position}) at the ${a.service} service on ${day}. Reply YES to confirm or NO if you can't make it. Thank you! - Rolla First`;
  if (kind === "reminder") return `Reminder: you're serving ${a.position} with ${team} this ${day}, ${a.service} service. Please arrive by ${arrive}. Reply NO if something came up. Thanks, ${v.firstName}!`;
  return `Good morning ${v.firstName}! See you today for ${a.position} at the ${a.service} service. Arrive by ${arrive}. Thank you for serving!`;
}

/* ---------- Who can fill a spot ---------- */

export type Candidate = { v: Volunteer; reason?: string; recent: number; score: number };

/**
 * Everyone on the team who can do this position, best fits first. People who are away, already serving
 * that morning, or said no to this exact Sunday come last, with the reason.
 */
export function candidatesFor(volunteers: Volunteer[], assignments: Assignment[], spot: { date: string; service: ServiceTime; teamId: string; position: string }): Candidate[] {
  return volunteers
    .filter((v) => v.teamId === spot.teamId && v.positions.includes(spot.position))
    .map((v) => {
      const mine = assignments.filter((a) => a.volunteerId === v.id && a.status !== "declined");
      const sameDay = mine.find((a) => a.date === spot.date);
      const declined = assignments.some((a) => a.volunteerId === v.id && a.date === spot.date && a.status === "declined");
      const recent = mine.filter((a) => Math.abs(weeksBetween(a.date, spot.date)) < 4).length;
      const tooSoon =
        (v.frequency === "monthly" && mine.some((a) => a.date !== spot.date && Math.abs(weeksBetween(a.date, spot.date)) < 4)) ||
        (v.frequency === "biweekly" && mine.some((a) => a.date !== spot.date && Math.abs(weeksBetween(a.date, spot.date)) < 2));
      let reason: string | undefined;
      if (v.blockouts.includes(spot.date)) reason = "Away this Sunday";
      else if (declined) reason = "Said they can't make it";
      else if (sameDay) reason = `Already serving ${sameDay.position} at ${sameDay.service}`;
      let score = recent * 10 + (tooSoon ? 25 : 0) + (v.service !== "either" && v.service !== spot.service ? 6 : 0);
      if (reason) score += 1000;
      return { v, reason, recent, score };
    })
    .sort((a, b) => a.score - b.score || a.v.firstName.localeCompare(b.v.firstName));
}

/** Every open spot on a Sunday for one team. */
export function openSpots(assignments: Assignment[], date: string, teamId: string) {
  const team = scheduledTeams.find((t) => t.id === teamId)!;
  const out: { service: ServiceTime; position: string; slot: number }[] = [];
  for (const service of services)
    for (const p of team.positions)
      for (let slot = 0; slot < p.spots; slot++)
        if (!assignments.some((a) => a.date === date && a.service === service && a.teamId === teamId && a.position === p.name && a.slot === slot && a.status !== "declined"))
          out.push({ service, position: p.name, slot });
  return out;
}

/**
 * Fill open spots with the best available person. First pass only asks people who are due to serve
 * (per how often they said); the second pass asks people who served recently, so a short-handed team
 * still gets covered. Nobody away, already serving that morning, or who said no is ever scheduled.
 * Returns only the new assignments, and how many came from the second pass.
 */
export function autoFill(volunteers: Volunteer[], assignments: Assignment[], date: string, teamId: string, now = new Date().toISOString()) {
  const added: Assignment[] = [];
  let stretched = 0;
  for (const pass of [0, 1]) {
    for (const spot of openSpots([...assignments, ...added], date, teamId)) {
      const pool = [...assignments, ...added];
      const best = candidatesFor(volunteers, pool, { date, teamId, ...spot }).find((c) => !c.reason && (pass === 1 || c.score < 25));
      if (!best) continue;
      if (pass === 1) stretched++;
      added.push({ id: `as_${date}_${spot.service}_${teamId}_${spot.position}_${spot.slot}_${best.v.id}`, date, teamId, ...spot, volunteerId: best.v.id, status: "pending", assignedAt: now });
    }
  }
  return { added, stretched };
}

/* ---------- Sample roster and schedule ---------- */

const first = ["Lauren", "Josh", "Megan", "Tyler", "Brooke", "Caleb", "Hannah", "Nate", "Kelsey", "Andrew", "Rachel", "Logan", "Abby", "Ethan", "Jenna", "Mark", "Sara", "Luke", "Emily", "Ryan", "Katie", "Sam", "Olivia", "Ben", "Grace", "Zach", "Molly", "Evan", "Anna", "Cody", "Leah", "Drew", "Paige", "Travis", "Erin", "Jake", "Kayla", "Matt", "Holly", "Chris", "Allie", "Dylan", "Beth", "Garrett", "Tara", "Kyle"];
const last = ["Miller", "Davis", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Young", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Parker", "Collins", "Edwards", "Stewart", "Morris", "Murphy", "Cook", "Rogers"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

const rosterPlan: Record<string, { count: number; mix: string[][] }> = {
  "kids-first": { count: 22, mix: [["Nursery"], ["Nursery", "Preschool"], ["Preschool"], ["Elementary small group"], ["Elementary small group"], ["Elementary small group", "Check-in desk"], ["Check-in desk"]] },
  welcome: { count: 16, mix: [["Greeter"], ["Greeter", "Connect Center"], ["Parking lot"], ["Greeter", "Parking lot"], ["Connect Center"]] },
  coffee: { count: 7, mix: [["Barista"]] },
  production: { count: 9, mix: [["Slides"], ["Audio"], ["Lighting"], ["Livestream camera"], ["Slides", "Livestream camera"], ["Audio", "Lighting"]] },
};

export function buildSeedSchedule(today = new Date()): { volunteers: Volunteer[]; assignments: Assignment[] } {
  const sundays = upcomingSundays(6, today);
  const volunteers: Volunteer[] = [];
  let n = 0;
  for (const [teamId, plan] of Object.entries(rosterPlan)) {
    for (let i = 0; i < plan.count; i++, n++) {
      const r = hash(`${teamId}${i}`);
      volunteers.push({
        id: `vol_${teamId}_${i}`,
        firstName: first[n % first.length],
        lastName: last[(n * 7 + 3) % last.length],
        phone: `(573) 555-${String(3000 + n * 17).slice(-4)}`,
        teamId,
        positions: plan.mix[i % plan.mix.length],
        service: r < 0.4 ? "9:00" : r < 0.8 ? "10:30" : "either",
        frequency: r < 0.15 ? "weekly" : r < 0.75 ? "biweekly" : "monthly",
        // A few people are away on one of the coming Sundays.
        blockouts: hash(`${teamId}${i}away`) < 0.18 ? [sundays[Math.floor(hash(`${teamId}${i}wk`) * 4)]] : [],
      });
    }
  }

  let assignments: Assignment[] = [];
  sundays.forEach((date, w) => {
    for (const t of scheduledTeams) {
      const { added } = autoFill(volunteers, assignments, date, t.id, new Date(+today - (14 - w) * 864e5).toISOString());
      // Later Sundays aren't fully planned yet: leave a few spots open.
      const kept = added.filter((a) => hash(`${a.id}keep`) > (w < 2 ? 0.05 : 0.18));
      assignments = [...assignments, ...kept];
    }
  });

  // Responses: most people have confirmed the next two Sundays; a few said they can't.
  assignments = assignments.map((a) => {
    const w = sundays.indexOf(a.date);
    const r = hash(`${a.id}resp`);
    const confirmRate = w === 0 ? 0.78 : w === 1 ? 0.6 : 0.3;
    if (w <= 1 && r > 0.94) {
      return { ...a, status: "declined", reason: ["Out of town for a wedding", "Kids are sick", "Working a shift", "Family in town"][Math.floor(hash(`${a.id}why`) * 4)], respondedAt: new Date(+today - 864e5).toISOString() };
    }
    if (r < confirmRate) return { ...a, status: "confirmed", respondedAt: new Date(+today - Math.floor(r * 5) * 864e5).toISOString() };
    return a;
  });

  return { volunteers, assignments };
}
