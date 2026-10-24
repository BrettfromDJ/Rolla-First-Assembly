import { nextDow } from "./utils";

/** Wednesday nights for 7th–12th grade, led by Pastor Gannon in the youth room upstairs (above the Gym). */
export const studentsInfo = {
  day: "Wednesdays",
  time: "6:30 PM",
  ends: "8:00 PM",
  room: "Youth room, upstairs above the Gym",
  leaderId: "gannon",
};

export const studentGrades = ["7", "8", "9", "10", "11", "12"].map((g) => ({ id: g, label: `${g}th` }));
export const gradeLabel = (g: string) => `${g}th grade`;
export const isMiddleSchool = (g: string) => Number(g) <= 8;

export const studentGroups = [
  { id: "ms", label: "Middle School", grades: "7th & 8th grade", blurb: "Loud games, real questions, and small groups by grade with the same leaders every week." },
  { id: "hs", label: "High School", grades: "9th – 12th grade", blurb: "Honest conversations about faith and life, leadership opportunities, and friends who have your back." },
];

/** What a Wednesday night looks like. */
export const wednesdayFlow = [
  { time: "6:15", title: "Doors open", body: "Snacks, music, foosball, and hanging out. Come early." },
  { time: "6:30", title: "Games & worship", body: "A big group game, then a few songs with the student worship team." },
  { time: "7:00", title: "Message", body: "Pastor Gannon (or a guest) teaches for about 20 minutes. Real life, straight from the Bible." },
  { time: "7:30", title: "Small groups", body: "Split up by grade and gender with the same adult leaders each week." },
  { time: "8:00", title: "Pickup", body: "Parents pick up at the Gym doors. Students stay inside until you arrive." },
];

/** Upcoming student events, dated relative to today so the sample never goes stale. */
export function studentEvents(today = new Date()) {
  const at = (dow: number, h: number, m: number, w: number) => nextDow(dow, h, m, w, today).toISOString();
  return [
    { id: "s-night", title: "Bring-a-Friend Night", date: at(3, 18, 30, 1), place: "Youth room", body: "Our biggest Wednesday of the fall. Pizza, a giant game, and a message for anyone checking out faith.", tag: "6th–12th" },
    { id: "s-serve", title: "Serve Saturday", date: at(6, 9, 0, 2), place: "Meet at the Gym", body: "A morning helping at the Rolla Community Food Pantry and doing yard work for neighbors. Lunch after.", tag: "6th–12th" },
    { id: "s-lockin", title: "Middle School Lock-in", date: at(5, 19, 0, 4), place: "Rolla First", body: "Games all night, dodgeball, a midnight pancake breakfast, and very little sleep. Pickup Saturday at 7 AM.", tag: "6th–8th" },
    { id: "s-retreat", title: "Winter Retreat", date: at(5, 17, 0, 10), place: "Camp in the Ozarks", body: "Three days away with worship, sledding, and time to grow. Deposits due a month before. Scholarships available.", tag: "9th–12th" },
  ];
}

export const studentsFaqs = [
  { q: "Does my student need to sign up first?", a: "No. Anyone in 7th–12th grade can walk in any Wednesday. Signing up just helps us learn their name, get your contact info, and send you updates." },
  { q: "Where do I drop off and pick up?", a: "Drop off and pick up at the Gym doors. The youth room is upstairs above the Gym. Students stay inside until a parent or approved driver arrives." },
  { q: "Who are the leaders?", a: "Pastor Gannon and a team of adult volunteers. Every leader is 21 or older, background-checked, and trained, and leaders are never alone with a student." },
  { q: "What about Sunday mornings?", a: "On Sundays, students sit with their families in the 9:00 or 10:30 service. Many also serve on the Welcome, Production, or worship teams." },
  { q: "How will I know what's coming up?", a: "Check the box for parent texts when you sign up. You'll get one short update a week with events, permission slips, and anything you need to know. You can also follow our youth Facebook page for photos and reminders." },
  { q: "Does anything cost money?", a: "Wednesday nights are free. Some trips and camps have a cost, and we never want money to keep a student home. Ask Pastor Gannon about scholarships." },
];
