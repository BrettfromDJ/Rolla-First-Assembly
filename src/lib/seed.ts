import { portraits } from "./images";
import { daysAgo, daysFromNow, nextDow } from "./utils";
import { baptismDates } from "./data";
import type { Activity, BaptismAge, BaptismRegistration, FollowUps, KidInfo, KidsRegistration, PickupPerson, InterestId, Note, Stage, Task, Visitor, FollowStatus, Rsvp } from "./types";

const emptyF: FollowUps = { vibes: [], groupSize: null, faithStage: null, ageGroups: [], homeTopics: [], serveAreas: [] };

let n = 0;
const id = (p: string) => `${p}_seed${++n}`;

function v(input: {
  first: string;
  last: string;
  photo?: string;
  visitedDaysAgo: number;
  source: string;
  interests: InterestId[];
  f?: Partial<FollowUps>;
  stage: Stage;
  assignee: string | null;
  status: FollowStatus;
  household?: string;
  rsvps?: { offeringId: string; itemId?: string; daysAgo: number }[];
  notes?: { by: string; body: string; daysAgo: number }[];
  tasks?: { title: string; dueIn: number; who: string | null; done?: boolean }[];
  activity: { kind: Activity["kind"]; label: string; daysAgo: number; hour?: number }[];
  plannedSunday?: { service: "9:00" | "10:30"; kids: number };
  baptism?: {
    slot: 0 | 1; // which upcoming baptism Sunday
    service: "9:00" | "10:30";
    age?: BaptismAge;
    first?: string; // the person being baptized, if not the visitor (child or student)
    story?: string;
    share?: boolean;
    guests: number;
    daysAgo: number;
    classAttended?: boolean;
    pastorContacted?: boolean;
  };
  kids?: {
    // [first name, age in months, gender, grade id, medical notes?, nickname?]
    list: [string, number, "M" | "F", string, string?, string?][];
    service: "9:00" | "10:30";
    daysAgo: number;
    second?: string; // second guardian's first name
    pickup?: PickupPerson[];
    school?: string;
  };
}): Visitor {
  const phone = `(573) 555-0${100 + n}`.slice(0, 14);
  const email = `${input.first}.${input.last}`.toLowerCase().replace(/[^a-z.]/g, "") + "@example.com";
  const rsvps: Rsvp[] = (input.rsvps ?? []).map((r) => ({ id: id("rsvp"), offeringId: r.offeringId, itemId: r.itemId, createdAt: daysAgo(r.daysAgo) }));
  const notes: Note[] = (input.notes ?? []).map((x) => ({ id: id("note"), authorId: x.by, body: x.body, createdAt: daysAgo(x.daysAgo, 14) }));
  const tasks: Task[] = (input.tasks ?? []).map((t) => ({
    id: id("task"),
    title: t.title,
    dueDate: daysFromNow(t.dueIn, 12).toISOString(),
    assigneeId: t.who,
    done: !!t.done,
    createdAt: daysAgo(Math.max(1, -t.dueIn + 2)),
  }));
  let baptism: BaptismRegistration | null = null;
  if (input.baptism) {
    const b = input.baptism;
    const slot = baptismDates(2)[b.slot];
    const date = new Date(slot.date);
    date.setHours(b.service === "9:00" ? 9 : 10, b.service === "9:00" ? 0 : 30, 0, 0);
    const age = b.age ?? "adult";
    baptism = {
      firstName: b.first ?? input.first,
      lastName: input.last,
      contact: email,
      age,
      parentName: age === "child" ? `${input.first} ${input.last}` : undefined,
      date: date.toISOString(),
      service: b.service,
      classDate: slot.classDate.toISOString(),
      story: b.story,
      okToShare: !!b.share,
      guests: b.guests,
      createdAt: daysAgo(b.daysAgo),
      classAttended: b.classAttended,
      pastorContacted: b.pastorContacted,
    };
    const d = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    input.activity.push({ kind: "baptism", label: `Registered${b.first ? ` ${b.first}` : ""} for baptism on ${d} (${b.service} service)`, daysAgo: b.daysAgo, hour: 20 });
  }
  let kids: KidsRegistration | null = null;
  if (input.kids) {
    const k = input.kids;
    const date = nextDow(0, k.service === "9:00" ? 9 : 10, k.service === "9:00" ? 0 : 30);
    const list: KidInfo[] = k.list.map(([first, months, gender, grade, medical, nickname]) => {
      const b = new Date();
      b.setMonth(b.getMonth() - months, 10);
      return { firstName: first, lastName: input.last, nickname, birthdate: b.toLocaleDateString("en-CA"), gender, grade, school: months >= 60 ? k.school : undefined, medicalNotes: medical };
    });
    kids = {
      parent: { firstName: input.first, lastName: input.last, phone, email },
      secondGuardian: k.second ? { firstName: k.second, lastName: input.last, phone: "(573) 555-0177" } : undefined,
      kids: list,
      pickup: k.pickup ?? [],
      date: date.toISOString(),
      service: k.service,
      createdAt: daysAgo(k.daysAgo),
    };
    const d = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    input.activity.push({ kind: "kids", label: `Pre-registered ${list.map((x) => x.firstName).join(" & ")} for Kids First (${d}, ${k.service})`, daysAgo: k.daysAgo, hour: 19 });
  }
  const activity: Activity[] = input.activity.map((a) => ({ id: id("act"), kind: a.kind, label: a.label, at: daysAgo(a.daysAgo, a.hour ?? 11) }));
  return {
    id: id("v"),
    firstName: input.first,
    lastName: input.last,
    email,
    phone,
    photo: input.photo,
    firstVisit: daysAgo(input.visitedDaysAgo, 9),
    source: input.source,
    interests: input.interests,
    followUps: { ...emptyF, ...input.f },
    stage: input.stage,
    assigneeId: input.assignee,
    status: input.status,
    household: input.household,
    rsvps,
    visitPlan: input.plannedSunday
      ? {
          firstName: input.first,
          contact: email,
          service: input.plannedSunday.service,
          bringingKids: input.plannedSunday.kids > 0,
          kidsCount: input.plannedSunday.kids,
          date: nextDow(0, 9).toISOString(),
          createdAt: daysAgo(input.visitedDaysAgo),
        }
      : null,
    baptism,
    kids,
    notes,
    tasks,
    activity: activity.sort((a, b) => +new Date(b.at) - +new Date(a.at)),
  };
}

export function buildSeedVisitors(): Visitor[] {
  n = 0;
  return [
    v({
      first: "Maya", last: "Chen", photo: portraits.v1, visitedDaysAgo: 2, source: "Connect card",
      interests: ["people", "faith"], f: { vibes: ["coffee", "small-groups"], groupSize: "small", faithStage: "exploring" },
      stage: "Event RSVP", assignee: "amber", status: "Needs follow-up",
      rsvps: [{ offeringId: "coffee-welcome", daysAgo: 1 }],
      tasks: [{ title: "Say hi at Coffee with the Welcome Team", dueIn: 4, who: "amber" }],
      activity: [
        { kind: "visit", label: "Attended the 10:30 service", daysAgo: 2 },
        { kind: "onboarding", label: "Completed onboarding", daysAgo: 2, hour: 14 },
        { kind: "rsvp", label: "RSVP'd to Coffee with the Welcome Team", daysAgo: 1 },
      ],
    }),
    v({
      first: "Jordan", last: "Ellis",
      baptism: { slot: 0, service: "9:00", guests: 2, daysAgo: 4, share: false }, photo: portraits.v2, visitedDaysAgo: 9, source: "Plan a visit",
      interests: ["home", "serve"], f: { homeTopics: ["pastors", "membership"], serveAreas: ["production"] },
      stage: "Getting connected", assignee: "garrett", status: "Contacted",
      notes: [{ by: "garrett", body: "Great conversation after service. Jordan used to run sound at their old church, so they might be a fit for production. Following up Thursday.", daysAgo: 6 }],
      tasks: [{ title: "Introduce Jordan to Leo (Production)", dueIn: 1, who: "garrett" }, { title: "Send welcome note", dueIn: -7, who: "amber", done: true }],
      activity: [
        { kind: "plan", label: "Planned a visit for the 9:00 service", daysAgo: 12 },
        { kind: "visit", label: "Attended the 9:00 service", daysAgo: 9 },
        { kind: "contacted", label: "Garrett Smith marked as contacted", daysAgo: 6 },
      ],
    }),
    v({
      first: "Lucia", last: "Alvarado",
      baptism: { slot: 0, service: "10:30", age: "child", first: "Mateo", guests: 8, daysAgo: 0 },
      kids: { list: [["Mateo", 92, "M", "2"], ["Isabel", 52, "F", "prek", "Dairy allergy", "Isa"]], service: "9:00", daysAgo: 0, second: "Diego", school: "Harry S. Truman Elementary", pickup: [{ name: "Rosa Alvarado", relationship: "Grandma", phone: "(573) 555-0190" }] }, visitedDaysAgo: 0, source: "Plan a visit", household: "2 adults · 2 kids",
      interests: ["family", "people"], f: { ageGroups: ["babies", "elementary"], vibes: ["food"] },
      stage: "Planning a visit", assignee: "micah", status: "Needs follow-up",
      plannedSunday: { service: "9:00", kids: 2 },
      tasks: [{ title: "Have kids' name tags ready for Sunday", dueIn: 3, who: "micah" }],
      activity: [{ kind: "plan", label: "Planned a visit for the 9:00 service · 2 kids", daysAgo: 0, hour: 8 }],
    }),
    v({
      first: "Priya", last: "Natarajan",
      baptism: { slot: 1, service: "10:30", story: "Six months ago I didn't know what I believed. Discover Christianity changed everything.", share: true, guests: 3, daysAgo: 3 }, photo: portraits.v3, visitedDaysAgo: 16, source: "Connect card",
      interests: ["faith"], f: { faithStage: "curious" },
      stage: "Event RSVP", assignee: "garrett", status: "Contacted",
      rsvps: [{ offeringId: "discover", daysAgo: 10 }],
      notes: [{ by: "garrett", body: "Grew up without any church background. Lots of thoughtful questions about suffering. Signed up for Discover Christianity.", daysAgo: 12 }],
      activity: [
        { kind: "visit", label: "Attended the 10:30 service", daysAgo: 16 },
        { kind: "question", label: "Sent a question to Ask a Pastor", daysAgo: 14 },
        { kind: "rsvp", label: "Signed up for Discover Christianity", daysAgo: 10 },
      ],
    }),
    v({
      first: "Marcus", last: "Odum", photo: portraits.v4, visitedDaysAgo: 4, source: "Connect card",
      kids: { list: [["Jayden", 126, "M", "5", "Asthma, inhaler in backpack", "Jay"]], service: "10:30", daysAgo: 3, school: "Mark Twain Elementary" },
      interests: ["serve"], f: { serveAreas: ["outreach", "behind"] },
      stage: "First-time visitor", assignee: null, status: "Needs follow-up",
      activity: [{ kind: "visit", label: "Attended the 9:00 service", daysAgo: 4 }],
    }),
    v({
      first: "Hannah", last: "Brooks",
      kids: { list: [["Ava", 8, "F", "infant"], ["Owen", 40, "M", "p3"]], service: "10:30", daysAgo: 10, second: "Tyler", pickup: [{ name: "Carol Brooks", relationship: "Grandma" }] },
      baptism: { slot: 0, service: "10:30", story: "I grew up around church but never made it my own. This year, through my Trail & Table group, I finally did.", share: true, guests: 6, daysAgo: 9, pastorContacted: true }, visitedDaysAgo: 31, source: "Plan a visit",
      interests: ["people", "home"], f: { vibes: ["outdoors", "food"], groupSize: "either", homeTopics: ["story"] },
      stage: "Connected", assignee: "amber", status: "Contacted",
      rsvps: [{ offeringId: "small-groups", itemId: "g-trail", daysAgo: 22 }],
      notes: [{ by: "amber", body: "Joined Trail & Table and loves it. Owen says she's already bringing friends.", daysAgo: 8 }],
      activity: [
        { kind: "visit", label: "Attended the 10:30 service", daysAgo: 31 },
        { kind: "join", label: "Requested to join Trail & Table", daysAgo: 22 },
        { kind: "stage", label: "Moved to Connected", daysAgo: 8 },
      ],
    }),
    v({
      first: "Eli", last: "Washington",
      baptism: { slot: 1, service: "9:00", guests: 1, daysAgo: 2 }, photo: portraits.v5, visitedDaysAgo: 3, source: "Connect card",
      interests: ["faith", "people"], f: { faithStage: "returning", vibes: ["bible-study"] },
      stage: "Getting connected", assignee: "gannon", status: "Waiting to hear back",
      tasks: [{ title: "Follow up about Wednesday Word", dueIn: 0, who: "gannon" }],
      notes: [{ by: "gannon", body: "Left a voicemail. Eli mentioned it's been about ten years since he's been to church.", daysAgo: 1 }],
      activity: [
        { kind: "visit", label: "Attended the 9:00 service", daysAgo: 3 },
        { kind: "onboarding", label: "Completed onboarding", daysAgo: 3, hour: 15 },
      ],
    }),
    v({
      first: "Sofia", last: "Martinez",
      baptism: { slot: 0, service: "10:30", age: "student", first: "Daniela", story: "I gave my life to Jesus at youth camp this summer.", share: true, guests: 4, daysAgo: 1 }, visitedDaysAgo: 1, source: "Plan a visit",
      interests: ["family"], f: { ageGroups: ["middle", "high"] },
      stage: "Event RSVP", assignee: null, status: "Needs follow-up", household: "1 adult · 2 students",
      rsvps: [{ offeringId: "family-events", itemId: "f-students", daysAgo: 1 }],
      activity: [
        { kind: "visit", label: "Attended the 10:30 service", daysAgo: 1 },
        { kind: "rsvp", label: "RSVP'd to Student Night Kickoff", daysAgo: 1, hour: 16 },
      ],
    }),
    v({
      first: "Ben", last: "Carter", visitedDaysAgo: 0, source: "Plan a visit",
      interests: ["home"], f: { homeTopics: ["sundays"] },
      stage: "Planning a visit", assignee: "amber", status: "Needs follow-up",
      plannedSunday: { service: "10:30", kids: 0 },
      activity: [{ kind: "plan", label: "Planned a visit for the 10:30 service", daysAgo: 0, hour: 7 }],
    }),
    v({
      first: "Grace", last: "Liu",
      baptism: { slot: 0, service: "9:00", story: "Serving on the Welcome Team showed me what it looks like to follow Jesus with your whole life.", share: true, guests: 3, daysAgo: 6, pastorContacted: true }, visitedDaysAgo: 23, source: "Connect card",
      interests: ["serve", "people"], f: { serveAreas: ["hospitality"], vibes: ["serving"] },
      stage: "Connected", assignee: "amber", status: "Contacted",
      rsvps: [{ offeringId: "serve-sunday", daysAgo: 18 }],
      notes: [{ by: "amber", body: "Grace is a natural! Joined the Welcome Team rotation.", daysAgo: 10 }],
      activity: [
        { kind: "visit", label: "Attended the 9:00 service", daysAgo: 23 },
        { kind: "rsvp", label: "Signed up for Serve This Sunday", daysAgo: 18 },
        { kind: "stage", label: "Moved to Connected", daysAgo: 10 },
      ],
    }),
    v({
      first: "Noah", last: "Patel", visitedDaysAgo: 6, source: "Connect card",
      kids: { list: [["Arya", 16, "F", "p1", "Peanut and tree nut allergy (EpiPen in diaper bag)"]], service: "9:00", daysAgo: 5 },
      interests: ["people"], f: { vibes: ["food", "outdoors"], groupSize: "large" },
      stage: "First-time visitor", assignee: "gannon", status: "Needs follow-up",
      tasks: [{ title: "Invite Noah to Pizza in the Park", dueIn: -1, who: "gannon" }],
      activity: [{ kind: "visit", label: "Attended the 10:30 service", daysAgo: 6 }],
    }),
    v({
      first: "Olivia", last: "Grant",
      baptism: { slot: 1, service: "10:30", story: "I was baptized as a baby, but I want to do this as my own decision now.", share: false, guests: 5, daysAgo: 5, pastorContacted: true }, visitedDaysAgo: 12, source: "Connect card",
      interests: ["faith", "home"], f: { faithStage: "deeper", homeTopics: ["membership"] },
      stage: "Event RSVP", assignee: "garrett", status: "Contacted",
      rsvps: [{ offeringId: "membership", daysAgo: 7 }],
      activity: [
        { kind: "visit", label: "Attended the 9:00 service", daysAgo: 12 },
        { kind: "rsvp", label: "Signed up for Discover Membership", daysAgo: 7 },
        { kind: "contacted", label: "Garrett Smith marked as contacted", daysAgo: 6 },
      ],
    }),
  ];
}
