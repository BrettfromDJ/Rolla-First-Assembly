import type { EventResponse, ExploreArea, Offering, OfferingKind } from "./types";
import { daysAgo, nextDow } from "./utils";

/** What kind of thing staff are posting; sets where it shows on the Events page. */
export const eventKinds: { id: string; label: string; area: ExploreArea; kind: OfferingKind; blurb: string }[] = [
  { id: "event", label: "Event", area: "events", kind: "event", blurb: "A one-time gathering: a potluck, a night of worship, a festival." },
  { id: "group", label: "Group", area: "groups", kind: "group", blurb: "Something that meets regularly that people join." },
  { id: "class", label: "Class or study", area: "faith", kind: "class", blurb: "A class, study, or series to grow in faith." },
  { id: "serve", label: "Serve opportunity", area: "serve", kind: "serve", blurb: "A chance to help, at church or around Rolla." },
];
export const kindFor = (o: Pick<Offering, "area">) => eventKinds.find((k) => k.area === o.area) ?? eventKinds[0];

/** How people respond. Each sets the button wording on the event page. */
export const responseTypes: { id: Offering["actionKind"]; label: string; action: string; cta: string; blurb: string }[] = [
  { id: "rsvp", label: "RSVP", action: "Count me in", cta: "RSVP", blurb: "People let you know they're coming." },
  { id: "signup", label: "Sign-up", action: "Sign me up", cta: "Sign up", blurb: "People save a spot. Best with a limit." },
  { id: "join", label: "Request to join", action: "Request to join", cta: "Learn more", blurb: "You approve each person, like a group." },
];

/** Photos staff can pick without uploading anything. */
export const eventPhotos = [
  { src: "/home/worship.jpg", label: "Night of worship" },
  { src: "/home/sanctuary.jpg", label: "Sanctuary" },
  { src: "/home/kids-worship.jpg", label: "Kids worship" },
  { src: "/home/hero-main.jpg", label: "Pastor Lance" },
  { src: "/home/closing-photo.webp", label: "Congregation" },
];

export function blankEvent(createdBy: string): Offering {
  const when = nextDow(6, 17, 0, 2);
  return {
    id: "",
    title: "",
    tag: "",
    kind: "event",
    area: "events",
    interests: ["people"],
    image: eventPhotos[0].src,
    summary: "",
    description: [],
    schedule: "",
    date: when.toISOString(),
    durationMin: 120,
    location: "Rolla First · The Gym",
    expect: [],
    hostIds: [createdBy],
    cta: "RSVP",
    action: "Count me in",
    actionKind: "rsvp",
    confirmTitle: "You're on the list!",
    confirmBody: "We'll see you there.",
    custom: true,
    status: "draft",
    allowGuests: true,
    createdBy,
    updatedAt: new Date().toISOString(),
  };
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/['’]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "event";

/** People coming, guests included. */
export const headcount = (responses: EventResponse[]) => responses.reduce((n, r) => n + 1 + (r.guests || 0), 0);

/* ---------- Samples so the builder isn't empty on day one ---------- */

export function buildSeedEvents(): { events: Offering[]; responses: EventResponse[] } {
  const festival = nextDow(6, 16, 0, 1);
  const potluck = nextDow(0, 12, 0, 5);
  const events: Offering[] = [
    {
      ...blankEvent("amber"),
      id: "fall-festival",
      title: "Fall Festival & Chili Cook-off",
      tag: "One night only",
      summary: "Hayrides, games, a bounce house, and the great Rolla First chili cook-off. Bring the whole family.",
      description: [
        "Our biggest family night of the fall. Kids games and a bounce house in the north lot, hayrides around the block, and a bonfire with s'mores as the sun goes down.",
        "Think your chili is the best in Phelps County? Enter the cook-off. Everyone else gets to taste and vote.",
      ],
      schedule: "Saturday afternoon",
      date: festival.toISOString(),
      durationMin: 180,
      location: "Rolla First · North parking lot",
      expect: ["Free chili, hot dogs, and cider", "Games and a bounce house for kids", "Hayrides and a bonfire", "Wear layers. It gets chilly after dark."],
      hostIds: ["amber", "micah"],
      image: "/home/closing-photo.webp",
      interests: ["people", "family"],
      actionKind: "rsvp",
      action: "Count me in",
      cta: "RSVP",
      confirmTitle: "See you at the festival!",
      confirmBody: "Bring a lawn chair and a big appetite. If you're entering the cook-off, set up starts at 3:30.",
      capacity: 300,
      allowGuests: true,
      question: "Entering the chili cook-off?",
      status: "published",
    },
    {
      ...blankEvent("lance"),
      id: "thanksgiving-potluck",
      title: "Thanksgiving Potluck",
      tag: "After the 10:30",
      summary: "One big table after church. We'll bring the turkey; you bring a side.",
      description: ["Stay after the 10:30 service for a family-style Thanksgiving meal in the Gym. Everyone's welcome, especially if you're new or far from family."],
      schedule: "Sunday after the 10:30 service",
      date: potluck.toISOString(),
      durationMin: 90,
      location: "Rolla First · The Gym",
      expect: ["Turkey and ham provided", "Bring a side or dessert to share", "Kids table with crafts"],
      hostIds: ["lance", "pam"],
      image: "/home/sanctuary.jpg",
      interests: ["people", "family", "home"],
      actionKind: "signup",
      action: "Sign me up",
      cta: "Sign up",
      confirmTitle: "You're signed up!",
      confirmBody: "We'll send a reminder the week before.",
      capacity: 160,
      allowGuests: true,
      question: "What side or dessert will you bring?",
      questionRequired: true,
      status: "draft",
    },
  ];
  const names = ["Tom Becker", "Jess Walker", "Kevin Otto", "Rachel Nguyen", "Amy Duncan", "Caleb Fry", "Linda Morgan", "Maria Lopez", "Brenda Hale", "Derek Simms", "Hannah Brooks", "Marcus Odum", "Grace Liu", "Jordan Ellis"];
  const answers = ["Yes! My smoky brisket chili", "", "No, just eating", "", "Yes, white chicken chili", "", "", "Yes, my grandma's recipe", "", "No", "", "Yes, five-alarm", "", ""];
  const responses: EventResponse[] = names.map((n, i) => ({
    id: `resp_seed${i}`,
    eventId: "fall-festival",
    name: n,
    contact: `${n.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    guests: [3, 1, 0, 2, 4, 0, 1, 3, 0, 2, 3, 2, 1, 0][i],
    answer: answers[i] || undefined,
    createdAt: daysAgo(i % 6, 9 + i),
  }));
  return { events, responses };
}
