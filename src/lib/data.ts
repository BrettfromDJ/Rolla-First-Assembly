import { img } from "./images";
import { nextDow } from "./utils";
import type { InterestId, Offering, Person } from "./types";

export const church = {
  name: "Rolla First Assembly",
  short: "Rolla First",
  address: "1608 N Oak St",
  city: "Rolla, MO 65401",
  phone: "(573) 364-1266",
  email: "office@rollafirst.church",
  services: ["9:00", "10:30"] as const,
  wednesday: "6:30 PM",
  serviceLength: "About 70 minutes",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=1608+N+Oak+St+Rolla+MO+65401",
};

/** Destinations outside this prototype. Swap in the church's real URLs. */
export const churchLinks = {
  give: "https://rollafirst.church",
  sermons: "https://rollafirst.church",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
};

/* ---------- People (the Rolla First team) ---------- */

const t = (f: string) => `/home/team/${f}`;

export const staff: Person[] = [
  { id: "lance", name: "Lance Langenberg", role: "Lead Pastor", photo: t("lance-langenberg.jpg"), email: "pastorlance@rollafirst.church" },
  { id: "garrett", name: "Garrett Smith", role: "Executive Pastor", photo: t("garrett-smith.jpg"), email: "pastorgarrett@rollafirst.church" },
  { id: "gannon", name: "Gannon Breig", role: "Youth / Worship Pastor", photo: t("gannon-breig.jpg"), email: "pastorgannon@rollafirst.church" },
  { id: "micah", name: "Micah Wells", role: "Children's Pastor", photo: t("micah-wells.jpg"), email: "pastormicah@rollafirst.church" },
  { id: "pam", name: "Pam Bales", role: "Children's Discipleship Pastor", photo: t("pam-bales.jpg"), email: "pastorpam@rollafirst.church" },
  { id: "amber", name: "Amber Eckelkamp", role: "Administrative Assistant", photo: t("amber-eckelkamp.jpg"), email: "office@rollafirst.church" },
  { id: "brice", name: "Brice Adams", role: "Belle Campus Pastor", photo: t("brice-adams.jpg"), email: "pastorbrice@rollafirst.church" },
  { id: "debbie", name: "Debbie Skyles", role: "Kid's First Director", photo: t("debbie-skyles.jpg"), email: "debbie@rollafirst.church" },
];

export const staffById = Object.fromEntries(staff.map((s) => [s.id, s])) as Record<string, Person>;

/** Team members who can be assigned to follow up with visitors. */
export const welcomeTeam = ["amber", "garrett", "lance", "gannon", "micah", "pam", "debbie", "brice"].map((id) => staffById[id]);

/* ---------- Interests ---------- */

export const interests: { id: InterestId; title: string; description: string; tone: string }[] = [
  { id: "people", title: "Meet new people", description: "Find friends and community.", tone: "honey" },
  { id: "home", title: "Find a church home", description: "Get to know who we are.", tone: "forest" },
  { id: "faith", title: "Explore faith", description: "Ask questions and learn more.", tone: "sky" },
  { id: "family", title: "Connect my family", description: "Discover kids, students, and family opportunities.", tone: "clay" },
  { id: "serve", title: "Make a difference", description: "Find ways to get involved and serve.", tone: "sage" },
];

export const interestById = Object.fromEntries(interests.map((i) => [i.id, i])) as Record<
  InterestId,
  (typeof interests)[number]
>;

export const interestShort: Record<InterestId, string> = {
  people: "Meeting people",
  home: "Church home",
  faith: "Exploring faith",
  family: "Family",
  serve: "Serving",
};

/* ---------- Follow-up questions ---------- */

export const vibeOptions = [
  { id: "coffee", label: "Coffee and conversation" },
  { id: "small-groups", label: "Small groups" },
  { id: "food", label: "Food and hangouts" },
  { id: "outdoors", label: "Outdoor activities" },
  { id: "bible-study", label: "Bible studies" },
  { id: "serving", label: "Serving together" },
];

export const groupSizeOptions = [
  { id: "small", label: "Small and cozy", hint: "A handful of people" },
  { id: "large", label: "The more the merrier", hint: "Bigger events" },
  { id: "either", label: "Either works", hint: "Surprise me" },
] as const;

export const faithStageOptions = [
  { id: "curious", label: "Just curious", hint: "I'm not sure what I believe, and that's okay." },
  { id: "exploring", label: "Exploring Christianity", hint: "I want to understand what it's all about." },
  { id: "returning", label: "Returning to faith", hint: "It's been a while. I'm finding my way back." },
  { id: "deeper", label: "Looking to grow deeper", hint: "Faith matters to me and I want more of it." },
] as const;

export const ageGroupOptions = [
  { id: "babies", label: "Babies and toddlers", hint: "0–3" },
  { id: "elementary", label: "Elementary school", hint: "K–5th" },
  { id: "middle", label: "Middle school", hint: "6th–8th" },
  { id: "high", label: "High school", hint: "9th–12th" },
  { id: "parents", label: "Parents and families", hint: "For the grown-ups" },
];

export const homeTopicOptions = [
  { id: "story", label: "Our story and beliefs" },
  { id: "pastors", label: "Meeting the pastors" },
  { id: "membership", label: "What belonging looks like" },
  { id: "sundays", label: "How Sundays work" },
];

export const serveAreaOptions = [
  { id: "hospitality", label: "Hospitality and welcome" },
  { id: "kids", label: "Kids and students" },
  { id: "production", label: "Music and production" },
  { id: "outreach", label: "Local outreach" },
  { id: "care", label: "Prayer and care" },
  { id: "behind", label: "Behind the scenes" },
];

/* ---------- Offerings (recommendations, events, groups, serving) ---------- */

const iso = (d: Date) => d.toISOString();

export function buildOfferings(): Offering[] {
  const sun = (h: number, m = 0, w = 0) => iso(nextDow(0, h, m, w));
  return [
    /* Meet new people */
    {
      id: "coffee-welcome",
      title: "Coffee with the Welcome Team",
      tag: "After service",
      kind: "event",
      area: "events",
      interests: ["people", "home"],
      image: img.latte,
      summary: "A casual opportunity to meet a few friendly faces after service.",
      description: [
        "No agenda, no sign-up sheet, no pressure. Just good coffee and a few people who'd love to know your name.",
        "We'll save a spot at the long table by the windows. Come as you are, stay as long as you like.",
      ],
      schedule: "Sundays · After the 10:30 service",
      date: sun(11, 45),
      durationMin: 45,
      location: "The Gym (downstairs), at the coffee bar",
      expect: [
        "Fresh coffee and a comfy spot to sit",
        "Short, easy introductions, and only if you want to",
        "A small welcome gift to take home",
        "Answers to any questions about Rolla First",
      ],
      hostIds: ["amber", "amber"],
      cta: "Save my seat",
      action: "Save my seat",
      actionKind: "rsvp",
      confirmTitle: "You're all set!",
      confirmBody: "We can't wait to meet you. Someone from our welcome team will be there to say hello.",
      matchKeys: ["coffee", "small", "either", "hospitality", "sundays"],
    },
    {
      id: "small-groups",
      title: "Find a Small Group",
      tag: "Weekly",
      kind: "group",
      area: "groups",
      interests: ["people", "faith"],
      image: img.dinner,
      summary: "Discover smaller communities that share your interests.",
      description: [
        "Sunday is great, but life happens in smaller circles. Groups meet in homes, coffee shops, and parks across town.",
        "Every group shares a meal or a snack, talks honestly about life and faith, and looks out for each other.",
      ],
      schedule: "Most weeknights · Across town",
      location: "Homes and spaces around Rolla",
      expect: [
        "8–12 people, usually around a table",
        "Conversation, not a lecture",
        "Try a group twice before deciding. No hard feelings either way.",
      ],
      hostIds: ["garrett"],
      cta: "Explore groups",
      action: "Request to join",
      actionKind: "join",
      confirmTitle: "Request sent!",
      confirmBody: "The group leader will reach out within a couple of days to say hi and share the details.",
      itemsTitle: "Groups with open seats",
      items: [
        { id: "g-young", title: "Twenties & Thirties", meta: "Tuesdays · 7:00 PM", location: "The Bells' house, near Ber Juan Park", leader: "Garrett & Ashley Smith", description: "Dinner, honest conversation, and the occasional board game tournament.", tags: ["Food", "Conversation"], spots: 3 },
        { id: "g-trail", title: "Trail & Table", meta: "Saturdays · 8:00 AM", location: "Meets at the Lions Club Park trailhead", leader: "Owen Price", description: "A morning hike followed by breakfast tacos. All paces welcome.", tags: ["Outdoors"], spots: 6 },
        { id: "g-parents", title: "Parents of Littles", meta: "Thursdays · 6:30 PM", location: "Rolla First · Kids area", leader: "Micah Wells", description: "Childcare included. Real talk about parenting, marriage, and survival.", tags: ["Family", "Childcare"], spots: 4 },
        { id: "g-study", title: "Wednesday Word", meta: "Wednesdays · 7:00 PM", location: "Rolla First · Auditorium", leader: "Garrett Smith", description: "A slow, thoughtful walk through the Gospel of John. Questions encouraged.", tags: ["Bible study"], spots: 5 },
      ],
      matchKeys: ["small-groups", "small", "food", "outdoors", "bible-study"],
    },
    {
      id: "hangouts",
      title: "Upcoming Hangouts",
      tag: "This month",
      kind: "event",
      area: "events",
      interests: ["people"],
      image: img.gathering,
      summary: "Connect with people at casual gatherings throughout the month.",
      description: [
        "Low-key ways to meet people without the pressure of committing to anything.",
        "Bring a friend, come solo, leave early. It's all good.",
      ],
      schedule: "A few times a month",
      location: "Around Rolla",
      expect: ["Easy, open-door events", "Name tags (optional, but helpful)", "Someone from the welcome team at every one"],
      hostIds: ["amber", "gannon"],
      cta: "See events",
      action: "Count me in",
      actionKind: "rsvp",
      confirmTitle: "You're on the list!",
      confirmBody: "We'll save you a spot. Someone from our welcome team will be looking out for you.",
      itemsTitle: "Coming up",
      items: [
        { id: "h-pizza", title: "Pizza in the Park", meta: "", location: "Ber Juan Park pavilion", leader: "Welcome Team", description: "Wood-fired pizza, lawn games, and plenty of shade.", tags: ["Food", "Outdoors"], date: iso(nextDow(6, 17, 30, 0)), durationMin: 120 },
        { id: "h-trivia", title: "Trivia Night", meta: "", location: "Public House Brewing Co.", leader: "Gannon Breig", description: "Form a team or join one. Bragging rights only.", tags: ["Food"], date: iso(nextDow(4, 19, 0, 1)), durationMin: 120 },
        { id: "h-hike", title: "Sunrise Hike", meta: "", location: "Mark Twain National Forest trailhead", leader: "Owen Price", description: "An easy 3-mile loop, coffee at the top.", tags: ["Outdoors"], date: iso(nextDow(6, 7, 0, 2)), durationMin: 150 },
      ],
      matchKeys: ["food", "outdoors", "large", "either"],
    },

    /* Explore faith */
    {
      id: "discover",
      title: "Discover Christianity",
      tag: "4-week class",
      kind: "class",
      area: "faith",
      interests: ["faith"],
      image: img.reading,
      summary: "Four relaxed conversations about the big questions. No experience needed.",
      description: [
        "Who was Jesus? Why does it matter? What about doubt, suffering, and science? We'll talk about all of it.",
        "Each week includes dinner, a short talk, and small-table conversation. Skeptics are especially welcome.",
      ],
      schedule: "Sundays · 5:30 PM · Starts soon",
      date: sun(17, 30, 1),
      durationMin: 90,
      location: "Rolla First · The Gym",
      expect: ["Dinner every week, on us", "A 20-minute talk, then open conversation", "No question is off limits", "You won't be asked to pray or read aloud"],
      hostIds: ["garrett"],
      cta: "Save my seat",
      action: "Save my seat",
      actionKind: "signup",
      confirmTitle: "You're signed up!",
      confirmBody: "Pastor Garrett will send a short note before the first session. Dinner's at 5:30. Come hungry.",
      matchKeys: ["curious", "exploring"],
    },
    {
      id: "ask-pastor",
      title: "Ask a Pastor",
      tag: "Anytime",
      kind: "conversation",
      area: "faith",
      interests: ["faith", "home"],
      image: img.conversation,
      summary: "Got a question? Big or small, send it our way. A real person will reply.",
      description: [
        "Some questions are easier to ask one-on-one. Send yours, and one of our pastors will reply personally, usually within two days.",
        "Prefer to talk in person? Just say so and we'll grab coffee.",
      ],
      schedule: "Replies within 2 days",
      location: "Over email, or coffee if you'd like",
      expect: ["A thoughtful, personal reply", "No sales pitch", "Your question stays private"],
      hostIds: ["lance", "garrett"],
      cta: "Ask a question",
      action: "Send my question",
      actionKind: "question",
      confirmTitle: "Question sent!",
      confirmBody: "Thanks for trusting us with it. Pastor Garrett or Pastor Lance will reply personally within a couple of days.",
      matchKeys: ["curious", "returning", "exploring", "pastors"],
    },
    {
      id: "bible-study",
      title: "Join a Bible Study",
      tag: "Weekly",
      kind: "group",
      area: "faith",
      interests: ["faith"],
      image: img.openBook,
      summary: "Read, ask, and wrestle with Scripture alongside others.",
      description: [
        "Whether you've read the Bible a hundred times or never opened one, there's a seat for you.",
        "Studies run in six-week seasons, so it's easy to jump in.",
      ],
      schedule: "Weekly · Mornings & evenings",
      location: "Rolla First and online",
      expect: ["A printed guide, so you can follow along", "Short readings, long conversations", "Coffee, always"],
      hostIds: ["garrett"],
      cta: "Find a study",
      action: "Request to join",
      actionKind: "join",
      confirmTitle: "Request sent!",
      confirmBody: "Pastor Garrett will follow up with this season's reading plan and everything you need for week one.",
      itemsTitle: "This season's studies",
      items: [
        { id: "b-john", title: "The Gospel of John", meta: "Wednesdays · 7:00 PM", location: "The Library", leader: "Garrett Smith", description: "A slow read through the life of Jesus.", spots: 5 },
        { id: "b-psalms", title: "Psalms at Sunrise", meta: "Fridays · 6:30 AM", location: "The Gym coffee bar", leader: "Henry Osei", description: "Poetry, prayer, and pastries before work.", spots: 8 },
        { id: "b-women", title: "Women in the Word", meta: "Tuesdays · 9:30 AM", location: "Room 201 · Childcare available", leader: "Ruth Alvarez", description: "Studying Ruth and Esther this season.", spots: 6 },
      ],
      matchKeys: ["bible-study", "deeper", "returning"],
    },

    /* Connect my family */
    {
      id: "kids-ministry",
      title: "Explore Kids First",
      tag: "Every Sunday",
      kind: "event",
      area: "events",
      interests: ["family"],
      image: img.kidsPlay,
      summary: "Safe, joyful spaces for kids from birth through 5th grade, during both services.",
      description: [
        "While you're in the service, your kids are learning, playing, and being known by name.",
        "Every volunteer is background-checked and trained. Your first visit includes a quick tour so you can see everything.",
      ],
      schedule: "Sundays · 9:00 & 10:30",
      date: sun(8, 45),
      durationMin: 85,
      location: "Kids area (downstairs) · Follow the blue signs",
      expect: ["A 2-minute check-in at the Kids Welcome desk", "A matching security tag for you and your child", "Age-specific rooms with trained leaders", "We'll text you if your child needs you"],
      hostIds: ["micah"],
      cta: "Plan for my kids",
      action: "Pre-register my kids",
      actionKind: "signup",
      confirmTitle: "You're pre-registered!",
      confirmBody: "Micah and the Kids team will have name tags ready. Look for the blue Kids Welcome desk when you arrive.",
      itemsTitle: "Age groups",
      items: [
        { id: "k-nursery", title: "Nursery", meta: "Birth – 2 years", location: "Rooms 110–112", leader: "Ms. Carla", description: "Rocking chairs, soft toys, and very patient grown-ups." },
        { id: "k-preschool", title: "Preschool", meta: "3 – 5 years", location: "Rooms 114–116", leader: "Mr. Andre", description: "Songs, crafts, and a Bible story at their level." },
        { id: "k-elementary", title: "Elementary", meta: "K – 5th grade", location: "The Treehouse", leader: "Micah Wells", description: "Big-group worship, small-group conversation, and lots of energy." },
      ],
      matchKeys: ["babies", "elementary", "kids"],
      href: "/kids",
    },
    {
      id: "family-team",
      title: "Meet the Family Team",
      tag: "Sundays",
      kind: "conversation",
      area: "events",
      interests: ["family"],
      image: img.family,
      summary: "A quick hello with the people who'll care for your kids and students.",
      description: [
        "Every parent has questions. Meet Micah and Gannon for a 15-minute chat and a tour of the kids area downstairs and the youth room upstairs.",
        "It's the fastest way to feel at ease about dropping your kids off.",
      ],
      schedule: "Sundays · Between services",
      date: sun(10, 15),
      durationMin: 20,
      location: "Kids Welcome desk",
      expect: ["A walk-through of the rooms", "Answers on safety and check-in", "Info on student programs for 6th–12th"],
      hostIds: ["micah", "gannon"],
      cta: "Book a tour",
      action: "Book my tour",
      actionKind: "rsvp",
      confirmTitle: "Tour booked!",
      confirmBody: "Pastor Micah will meet you at the Kids Welcome desk. Take your time. There's no rush.",
      matchKeys: ["parents", "middle", "high", "babies", "elementary"],
    },
    {
      id: "family-events",
      title: "Upcoming Family Events",
      tag: "This month",
      kind: "event",
      area: "events",
      interests: ["family", "people"],
      image: img.kids,
      summary: "Fun, simple ways to meet other families.",
      description: ["Bring the whole crew. These events are designed so kids have fun and parents actually get to talk."],
      schedule: "Monthly",
      location: "Rolla First and around town",
      expect: ["Kid-friendly food", "Activities for every age", "Strollers welcome"],
      hostIds: ["micah"],
      cta: "See events",
      action: "Count us in",
      actionKind: "rsvp",
      confirmTitle: "You're on the list!",
      confirmBody: "We'll save a spot for your family. Pastor Micah will be there with a big hello.",
      itemsTitle: "Coming up",
      items: [
        { id: "f-movie", title: "Family Movie Night", meta: "", location: "The Commons", leader: "Kids Team", description: "Popcorn, blankets, and a classic. PJs encouraged.", date: iso(nextDow(5, 18, 30, 0)), durationMin: 150 },
        { id: "f-pumpkin", title: "Pumpkin Patch Morning", meta: "", location: "Rolling Hills Farm", leader: "Micah Wells", description: "Hayrides, cider, and the great pumpkin hunt.", date: iso(nextDow(6, 10, 0, 1)), durationMin: 180 },
        { id: "f-students", title: "Student Night Kickoff", meta: "", location: "Youth room (upstairs)", leader: "Gannon Breig", description: "For 6th–12th graders. Games, food, and a short talk.", date: iso(nextDow(3, 18, 30, 0)), durationMin: 120 },
      ],
      matchKeys: ["parents", "middle", "high", "elementary"],
    },

    /* Find a church home */
    {
      id: "our-story",
      title: "Our Story",
      tag: "5-minute read",
      kind: "story",
      area: "faith",
      interests: ["home"],
      image: img.venue,
      summary: "Who we are, what we believe, and where we're headed.",
      description: [
        "Rolla First is a place where faith feels like family. Our mission is simple: helping people come to know, commit to follow, and continue to serve Jesus.",
        "Belong. Believe. Become. You're welcome to belong here before you've figured everything out.",
        "At Newcomers Lunch, Pastor Lance shares our story, what we believe, and where we're headed, with plenty of time for your questions.",
      ],
      schedule: "Monthly Newcomers Lunch",
      date: sun(12, 30, 2),
      durationMin: 75,
      location: "The Gym",
      expect: ["Lunch with Pastor Lance", "Our story, beliefs, and what's next", "Plenty of time for questions"],
      hostIds: ["lance"],
      cta: "Read our story",
      action: "Join Newcomers Lunch",
      actionKind: "rsvp",
      confirmTitle: "See you at lunch!",
      confirmBody: "Pastor Lance is looking forward to meeting you. Lunch is on us.",
      matchKeys: ["story", "sundays"],
    },
    {
      id: "meet-pastors",
      title: "Meet the Pastors",
      tag: "After service",
      kind: "conversation",
      area: "events",
      interests: ["home"],
      image: img.handshake,
      summary: "Say hello to the people who lead Rolla First. They'd genuinely love to meet you.",
      description: ["After each service, our pastors hang out near the front by the welcome sign. Come say hi, ask anything, or just put a face to a name."],
      schedule: "Sundays · After each service",
      date: sun(10, 15),
      durationMin: 20,
      location: "Front of the Auditorium, by the welcome sign",
      expect: ["A quick, friendly hello", "Ask anything about Rolla First", "Prayer, if you'd like it"],
      hostIds: ["lance", "garrett"],
      cta: "Say hello",
      action: "Let them know I'm coming",
      actionKind: "rsvp",
      confirmTitle: "They'll be looking for you!",
      confirmBody: "Pastor Lance and Pastor Garrett will be up front after the service. Come say hi.",
      matchKeys: ["pastors"],
    },
    {
      id: "membership",
      title: "Discover Membership",
      tag: "Single session",
      kind: "class",
      area: "faith",
      interests: ["home"],
      image: img.studyTable,
      summary: "What it looks like to call Rolla First home. Come learn. There's no commitment.",
      description: [
        "Membership at Rolla First isn't about a card in your wallet. It's about saying, \"These are my people.\"",
        "This one-afternoon class covers what we believe, how we're organized, and how to take a next step if you're ready.",
      ],
      schedule: "Once a month · Sunday afternoon",
      date: sun(13, 0, 3),
      durationMin: 120,
      location: "Rolla First · Auditorium",
      expect: ["Lunch and childcare provided", "Our beliefs, explained simply", "No pressure to join that day"],
      hostIds: ["lance", "garrett"],
      cta: "Learn more",
      action: "Save my seat",
      actionKind: "signup",
      confirmTitle: "You're signed up!",
      confirmBody: "Pastor Garrett will send a short reminder the week before. Childcare is on us.",
      matchKeys: ["membership", "deeper"],
    },

    /* Make a difference */
    {
      id: "volunteer-teams",
      title: "Explore Volunteer Teams",
      tag: "Flexible",
      kind: "serve",
      area: "serve",
      interests: ["serve"],
      image: img.volunteers,
      summary: "Find a team that fits your gifts and your schedule.",
      description: [
        "Serving is one of the fastest ways to make friends. Most teams serve once or twice a month, and you can try one before committing.",
      ],
      schedule: "Once or twice a month",
      location: "Rolla First",
      expect: ["A shadow shift with a team leader", "Training when you need it", "Switch teams anytime"],
      hostIds: ["brice"],
      cta: "Explore teams",
      action: "I'd like to try this",
      actionKind: "join",
      confirmTitle: "Great choice!",
      confirmBody: "The team leader will reach out to set up a shadow shift. No commitment until you're ready.",
      itemsTitle: "Teams looking for people",
      items: [
        { id: "t-welcome", title: "Welcome Team", meta: "Sundays · 2x/month", location: "Main entrance & parking lots", leader: "Amber Eckelkamp", description: "Greeters, coffee, and the first smile people see.", tags: ["hospitality"] },
        { id: "t-kids", title: "Kids Team", meta: "Sundays · 2x/month", location: "Kids area (downstairs)", leader: "Micah Wells", description: "Lead a small group or help with check-in. Background check required.", tags: ["kids"] },
        { id: "t-production", title: "Production Team", meta: "Sundays · 1x/month", location: "Auditorium", leader: "Leo Park", description: "Sound, lights, slides, and livestream. We'll train you.", tags: ["production"] },
        { id: "t-care", title: "Prayer & Care", meta: "Flexible", location: "Prayer room & meals", leader: "Ruth Alvarez", description: "Pray with people after services or bring meals to families in need.", tags: ["care"] },
      ],
      matchKeys: ["hospitality", "kids", "production", "care", "behind", "serving"],
    },
    {
      id: "outreach",
      title: "Local Outreach",
      tag: "This month",
      kind: "serve",
      area: "serve",
      interests: ["serve", "people"],
      image: img.helping,
      summary: "Show up for Rolla alongside people who care about it.",
      description: ["We partner with local schools, food pantries, and nonprofits. Join a one-time project, no long-term commitment needed."],
      schedule: "One-time projects",
      location: "Across Rolla",
      expect: ["Projects for every ability", "Kid-friendly options marked", "Lunch for volunteers"],
      hostIds: ["brice"],
      cta: "See projects",
      action: "Sign me up",
      actionKind: "rsvp",
      confirmTitle: "You're signed up!",
      confirmBody: "We'll send the details a few days before. Thanks for showing up for our city.",
      itemsTitle: "Upcoming projects",
      items: [
        { id: "o-pantry", title: "Food Pantry Saturday", meta: "", location: "Rolla Community Pantry", leader: "Brice Adams", description: "Sort, pack, and hand out groceries for local families.", tags: ["outreach"], date: iso(nextDow(6, 9, 0, 0)), durationMin: 180 },
        { id: "o-school", title: "Teacher Appreciation Breakfast", meta: "", location: "Mark Twain Elementary", leader: "Brice Adams", description: "Cook and serve breakfast for teachers before the bell.", tags: ["outreach"], date: iso(nextDow(5, 6, 30, 1)), durationMin: 120 },
        { id: "o-coats", title: "Coat Drive Sort", meta: "", location: "Rolla First · The Gym", leader: "Ruth Alvarez", description: "Kid-friendly! Sort donated coats before winter.", tags: ["outreach"], date: iso(nextDow(0, 13, 0, 1)), durationMin: 90 },
      ],
      matchKeys: ["outreach", "serving", "large"],
    },
    {
      id: "serve-sunday",
      title: "Serve This Sunday",
      tag: "One Sunday",
      kind: "serve",
      area: "serve",
      interests: ["serve", "people"],
      image: img.cafe,
      summary: "Try serving for one morning. Pour coffee, greet people, and see how it feels.",
      description: ["The easiest way to find ways to serve is to try one. Join the coffee team for one Sunday, with a buddy right beside you the whole time."],
      schedule: "Sundays · Before the 9:00 service",
      date: sun(8, 15),
      durationMin: 60,
      location: "The Gym coffee bar (downstairs)",
      expect: ["Arrive at 8:15, done by 9:15", "A buddy the whole time", "Free coffee, obviously"],
      hostIds: ["amber"],
      cta: "Try it once",
      action: "Count me in",
      actionKind: "signup",
      confirmTitle: "You're in!",
      confirmBody: "Someone from our team will meet you at the coffee bar in the gym at 8:15 with an apron and a smile.",
      matchKeys: ["hospitality", "serving", "coffee", "behind"],
    },
    {
      id: "baptism",
      title: "Baptism",
      tag: "Monthly",
      kind: "class",
      area: "faith",
      interests: ["faith", "home"],
      image: "/home/hero-main.jpg",
      summary: "Take the next step. A public way of saying, \"I'm following Jesus.\"",
      description: ["Baptism Sundays happen once a month during both services, with a short class the Sunday before."],
      schedule: "Second Sunday of every month",
      date: baptismDates(1)[0]?.date.toISOString(),
      durationMin: 70,
      location: "Rolla First · Auditorium",
      expect: ["A short class the Sunday before", "A pastor beside you the whole time", "Seats saved for your family"],
      hostIds: ["lance"],
      cta: "Learn more",
      action: "Register",
      actionKind: "signup",
      confirmTitle: "You're registered!",
      confirmBody: "Pastor Lance will reach out this week.",
      matchKeys: ["deeper", "returning", "membership", "exploring"],
      href: "/baptism",
    },
  ];
}

let cached: { day: string; list: Offering[] } | null = null;

export function getOfferings(): Offering[] {
  const day = new Date().toDateString();
  if (!cached || cached.day !== day) cached = { day, list: buildOfferings() };
  return cached.list;
}

export function getOffering(id: string): Offering | undefined {
  return getOfferings().find((o) => o.id === id);
}

export const faqs = [
  { q: "What should I wear?", a: "Whatever you're comfortable in. You'll see jeans, sneakers, and the occasional Sunday best. Nobody's checking." },
  { q: "What about my kids?", a: "Kids First runs during both services for birth through 5th grade. Check-in takes about two minutes, and every leader is background-checked and trained." },
  { q: "Will I be singled out?", a: "Never. We won't ask you to stand up, raise your hand, or introduce yourself. Visit at your own pace." },
  { q: "Do I need to give money?", a: "No. Giving is for people who call Rolla First home. Guests are our guests." },
  { q: "I'm not sure what I believe. Is that okay?", a: "Absolutely. Lots of people here are asking questions. You're welcome exactly as you are." },
  { q: "Where do I park?", a: "Anywhere you like. We have lots north of the building across 17th St, south of the building, and across Oak St. Then head to the main entrance on Oak St." },
];

/* ---------- Baptism ---------- */

/**
 * Baptism Sundays are the second Sunday of each month, during both services.
 * The Baptism Class is the Sunday before, at noon in the Gym.
 * Change the rule here and every date on the site follows.
 */
export const baptism = {
  rule: "Second Sunday of every month",
  classTime: "12:00 PM",
  classMinutes: 45,
  classLocation: "The Gym (downstairs)",
  hostId: "lance",
};

function secondSunday(year: number, month: number) {
  const d = new Date(year, month, 1);
  d.setDate(1 + ((7 - d.getDay()) % 7) + 7);
  return d;
}

/** Upcoming baptism Sundays, skipping any whose class has already passed. */
export function baptismDates(count = 3, from = new Date()) {
  const out: { date: Date; classDate: Date }[] = [];
  for (let m = 0; out.length < count && m < 24; m++) {
    const sunday = secondSunday(from.getFullYear(), from.getMonth() + m);
    const classDate = new Date(sunday);
    classDate.setDate(classDate.getDate() - 7);
    classDate.setHours(12, 0, 0, 0);
    if (classDate.getTime() < from.getTime()) continue;
    sunday.setHours(9, 0, 0, 0);
    out.push({ date: sunday, classDate });
  }
  return out;
}

/* ---------- Kids First ---------- */

export const kidsGroups = [
  { id: "nursery", label: "Nursery", ages: "Birth – 2", room: "Nursery", blurb: "Rocking chairs, soft toys, and very patient grown-ups. We'll follow your routine." },
  { id: "preschool", label: "Preschool", ages: "Ages 3 – 5", room: "Preschool room", blurb: "Songs, crafts, snacks, and a Bible story told at their level." },
  { id: "elementary", label: "Elementary", ages: "K – 5th grade", room: "Elementary room", blurb: "Big-group worship, a Bible lesson that sticks, and small groups with the same leaders each week." },
  { id: "students", label: "Students", ages: "6th – 12th grade", room: "Youth room (upstairs)", blurb: "Wednesday nights at 6:30 PM with Pastor Gannon. Sundays, students sit with their families in the service." },
] as const;

/** Options for "which group" when a parent pre-registers a child (students meet separately). */
export const kidGradeOptions = [
  { id: "nursery", label: "Nursery (birth–2)", group: "nursery" },
  { id: "preschool", label: "Preschool (3–5)", group: "preschool" },
  { id: "k", label: "Kindergarten", group: "elementary" },
  { id: "1", label: "1st grade", group: "elementary" },
  { id: "2", label: "2nd grade", group: "elementary" },
  { id: "3", label: "3rd grade", group: "elementary" },
  { id: "4", label: "4th grade", group: "elementary" },
  { id: "5", label: "5th grade", group: "elementary" },
] as const;

export const kidGradeLabel = (id: string) => kidGradeOptions.find((g) => g.id === id)?.label ?? id;
