import type { PrayerCategory, PrayerRequest, PrayerVisibility } from "./types";
import { daysAgo } from "./utils";

export const prayerCategories: { id: PrayerCategory; label: string }[] = [
  { id: "health", label: "Health & healing" },
  { id: "family", label: "Family" },
  { id: "grief", label: "Grief & loss" },
  { id: "work", label: "Work & finances" },
  { id: "faith", label: "Faith" },
  { id: "relationships", label: "Relationships" },
  { id: "praise", label: "Praise report" },
  { id: "other", label: "Something else" },
];
export const prayerCategoryLabel = (id: PrayerCategory) => prayerCategories.find((c) => c.id === id)?.label ?? id;

export const prayerVisibility: { id: PrayerVisibility; label: string; body: string }[] = [
  { id: "pastors", label: "Pastors only", body: "Only our pastoral staff will see it. Kept confidential." },
  { id: "team", label: "Prayer team", body: "Shared with our trusted prayer team, who pray over every request each week." },
  { id: "wall", label: "Prayer wall", body: "Posted on this page so the church can pray too. We review it first and only show your first name." },
];

/** How a request is credited in public: first name only, or "Anonymous". */
export function publicName(r: Pick<PrayerRequest, "name" | "anonymous">) {
  return r.anonymous || !r.name.trim() ? "Anonymous" : r.name.trim().split(/\s+/)[0];
}

type Seed = Partial<PrayerRequest> & Pick<PrayerRequest, "name" | "category" | "body" | "visibility" | "status"> & { days: number; hour?: number };

const seeds: Seed[] = [
  { name: "Rachel Nguyen", category: "health", visibility: "wall", wallApproved: true, status: "praying", prayedCount: 41, days: 2, body: "My dad starts chemo on Thursday. Please pray for strength for him and peace for our family as we figure out this new normal." },
  { name: "Tom Becker", category: "praise", visibility: "wall", wallApproved: true, status: "answered", prayedCount: 63, days: 19, body: "Asked for prayer last month about finding work after being laid off.", update: { body: "I start at Phelps Health on Monday! Thank you all for praying. God is faithful.", at: daysAgo(3), by: "requester" } },
  { name: "", anonymous: true, category: "relationships", visibility: "wall", wallApproved: true, status: "praying", prayedCount: 28, days: 4, body: "Pray for my marriage. We're both trying, but it's hard right now. Pray for patience and honest conversations." },
  { name: "Jess Walker", category: "family", visibility: "wall", wallApproved: true, status: "praying", prayedCount: 35, days: 6, body: "Our son leaves for basic training next week. Pray for his safety and that he stays close to Jesus while he's away." },
  { name: "Kevin Otto", category: "faith", visibility: "wall", wallApproved: true, status: "praying", prayedCount: 19, days: 9, body: "I've been coming back to church after a long time away. Pray that I'd keep showing up and find a group to belong to." },
  { name: "Linda Morgan", category: "grief", visibility: "wall", wallApproved: true, status: "praying", prayedCount: 52, days: 11, body: "My husband of 46 years went home to be with the Lord. I know where he is, but the house is so quiet. Please pray for comfort." },
  { name: "", anonymous: true, category: "work", visibility: "wall", wallApproved: true, status: "praying", prayedCount: 14, days: 13, body: "Money is really tight this month after a car repair. Pray for provision and wisdom." },
  { name: "Maria Lopez", category: "praise", visibility: "wall", wallApproved: true, status: "answered", prayedCount: 47, days: 30, body: "Please pray for my mom's surgery on the 14th.", update: { body: "Surgery went perfectly and she's home recovering. Thank you, church family!", at: daysAgo(12), by: "requester" } },
  { name: "Caleb Fry", category: "health", visibility: "wall", status: "new", prayedCount: 0, days: 0, hour: 7, wantsContact: false, body: "Pray for my grandma, Ruth. She fell and broke her hip and is in the hospital in Springfield." },
  { name: "Amy Duncan", category: "family", visibility: "wall", status: "new", prayedCount: 0, days: 1, contact: "amy.duncan@example.com", wantsContact: true, body: "We're in the middle of adopting a little girl and the court date keeps moving. Pray for patience and for her." },
  { name: "Derek Simms", category: "grief", visibility: "pastors", status: "new", prayedCount: 0, days: 0, hour: 9, contact: "(573) 555-0187", wantsContact: true, body: "My brother died by suicide last weekend. I don't know how to tell my kids. I'd really like to talk to a pastor." },
  { name: "", anonymous: true, category: "other", visibility: "pastors", status: "new", prayedCount: 0, days: 1, wantsContact: false, body: "Struggling with addiction and nobody knows. I'm not ready to talk yet but please pray for me." },
  { name: "Hannah Brooks", category: "health", visibility: "team", status: "praying", prayedCount: 0, days: 5, contact: "hannah.brooks@example.com", wantsContact: true, contacted: true, assigneeId: "pam", body: "Our baby Ava has her follow-up with the cardiologist this Friday. Pray for good news.", notes: [] },
  { name: "Marcus Odum", category: "work", visibility: "team", status: "praying", prayedCount: 0, days: 8, contact: "marcus.odum@example.com", wantsContact: false, body: "Big interview for a promotion this week. Pray I'd be calm and that God's will is done either way." },
  { name: "Grace Liu", category: "faith", visibility: "team", status: "answered", prayedCount: 0, days: 24, body: "Pray for my roommate. She's been asking questions about faith.", update: { body: "She came to church with me Sunday and wants to try Discover Christianity!", at: daysAgo(4), by: "requester" } },
  { name: "Brenda Hale", category: "health", visibility: "pastors", status: "praying", prayedCount: 0, days: 7, contact: "(573) 555-0133", wantsContact: true, contacted: true, assigneeId: "lance", body: "Biopsy results come back next week. I'm scared. Would love a call.", notes: [] },
];

export function buildSeedPrayers(): PrayerRequest[] {
  return seeds.map(({ days, hour, ...s }, i) => ({
    id: `pr_seed${i + 1}`,
    anonymous: false,
    wantsContact: false,
    prayedCount: 0,
    notes: [],
    assigneeId: null,
    ...s,
    createdAt: daysAgo(days, hour ?? 10 + (i % 8)),
  }));
}
