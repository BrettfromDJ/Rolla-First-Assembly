/**
 * Sample sermon library. Swap in the church's real messages (or feed this from YouTube / a podcast host);
 * every page reads from here.
 */

export type SeriesArtTone = "night" | "rings" | "cream" | "blue";

export interface SermonSeries {
  id: string;
  title: string;
  /** One word of the title set in the italic serif on the artwork. */
  accent?: string;
  blurb: string;
  tone: SeriesArtTone;
}

export interface Sermon {
  id: string;
  title: string;
  seriesId: string;
  part?: number;
  speakerId: string;
  date: string; // YYYY-MM-DD
  passage: string;
  book: string;
  minutes: number;
  summary: string;
  points: string[];
  questions: string[];
  topics: string[];
}

export const sermonSeries: SermonSeries[] = [
  { id: "unhurried", title: "Unhurried", blurb: "Jesus was never in a rush, and he never missed what mattered. A series on rest, margin, and a life that isn't running on empty.", tone: "night" },
  { id: "better-together", title: "Better Together", accent: "Together", blurb: "We weren't made to follow Jesus alone. Five weeks on friendship, the table, and what it looks like to be the church for each other.", tone: "rings" },
  { id: "summer-psalms", title: "Summer in the Psalms", accent: "Psalms", blurb: "The prayer book of the Bible, one psalm at a time. Honest words for every season: joy, fear, regret, and praise.", tone: "cream" },
  { id: "special", title: "Special Sundays", accent: "Special", blurb: "Messages from Easter, Mother's Day, and other days we gather to celebrate.", tone: "blue" },
];

export const seriesById = Object.fromEntries(sermonSeries.map((s) => [s.id, s])) as Record<string, SermonSeries>;

export const sermons: Sermon[] = [
  /* ---------- Unhurried ---------- */
  {
    id: "be-still",
    title: "Be Still",
    seriesId: "unhurried",
    part: 4,
    speakerId: "lance",
    date: "2026-10-18",
    passage: "Psalm 46",
    book: "Psalms",
    minutes: 38,
    summary: "When everything around us is shaking, God invites us to stop striving and know that he is God. Stillness isn't doing nothing. It's trusting someone.",
    points: ["Stillness starts with knowing who God is, not with emptying your calendar.", "Our striving is often a quiet way of saying God can't be trusted.", "Being still is a practice. Start with ten minutes a day."],
    questions: ["What does your mind do when things get quiet?", "Where in your life are you striving instead of trusting?", "What would ten minutes of stillness look like in your week?"],
    topics: ["Rest", "Prayer", "Anxiety"],
  },
  {
    id: "busy-isnt-a-fruit",
    title: "Busy Isn't a Fruit of the Spirit",
    seriesId: "unhurried",
    part: 3,
    speakerId: "garrett",
    date: "2026-10-11",
    passage: "Galatians 5:22–25",
    book: "Galatians",
    minutes: 41,
    summary: "We wear busyness like a badge of honor. But love, joy, and peace grow at the pace of walking, not running.",
    points: ["Hurry and love can't live in the same heart for long.", "Fruit grows slowly, and that's by design.", "Keeping in step with the Spirit means letting him set the pace."],
    questions: ["Which fruit of the Spirit is hardest to grow when you're busy?", "Who in your life gets the hurried version of you?", "What's one thing you could say no to this month?"],
    topics: ["Rest", "Holy Spirit", "Character"],
  },
  {
    id: "rhythm-of-rest",
    title: "The Rhythm of Rest",
    seriesId: "unhurried",
    part: 2,
    speakerId: "lance",
    date: "2026-10-04",
    passage: "Exodus 20:8–11",
    book: "Exodus",
    minutes: 36,
    summary: "Sabbath isn't a rule to keep. It's a gift to receive. God built rest into creation before we ever needed it.",
    points: ["God rested, not because he was tired, but to show us how to live.", "Sabbath is a weekly reminder that the world keeps spinning without us.", "Rest is an act of trust and a form of worship."],
    questions: ["What did rest look like in the home you grew up in?", "What makes a day of rest hard for you?", "What would a simple Sabbath look like for your family?"],
    topics: ["Rest", "Family", "Worship"],
  },
  {
    id: "come-away",
    title: "Come Away",
    seriesId: "unhurried",
    part: 1,
    speakerId: "lance",
    date: "2026-09-27",
    passage: "Mark 6:30–32",
    book: "Mark",
    minutes: 39,
    summary: "After the busiest stretch of ministry, Jesus didn't push his friends harder. He said, \"Come away with me and rest a while.\"",
    points: ["Jesus notices when you're worn out.", "Rest isn't a reward for finishing everything. It's an invitation in the middle of it.", "Coming away means coming to someone, not just getting away from something."],
    questions: ["What's draining you right now?", "When was the last time you felt truly rested?", "Where could you \"come away\" with Jesus this week?"],
    topics: ["Rest", "Jesus"],
  },

  /* ---------- Better Together ---------- */
  {
    id: "one-body",
    title: "One Body",
    seriesId: "better-together",
    part: 5,
    speakerId: "lance",
    date: "2026-09-20",
    passage: "1 Corinthians 12:12–27",
    book: "1 Corinthians",
    minutes: 42,
    summary: "Every person in the church matters, and every person is needed. The body isn't complete without you.",
    points: ["You belong to the body because you belong to Jesus.", "Different gifts aren't a problem to fix. They're the point.", "When one part hurts, we all hurt together."],
    questions: ["Have you ever felt like you didn't fit in a church?", "What gifts have others seen in you?", "Who in our church family could use some care this week?"],
    topics: ["Church", "Serving", "Community"],
  },
  {
    id: "dont-give-up-meeting",
    title: "Don't Give Up Meeting Together",
    seriesId: "better-together",
    part: 4,
    speakerId: "gannon",
    date: "2026-09-13",
    passage: "Hebrews 10:23–25",
    book: "Hebrews",
    minutes: 35,
    summary: "It's easy to drift. Showing up for each other, week after week, is one of the ways faith stays alive.",
    points: ["Faith is meant to be shared out loud.", "Encouragement is a choice we make before we feel like it.", "Showing up is half of loving people well."],
    questions: ["What makes it hard for you to show up consistently?", "Who encouraged your faith when you were younger?", "Who could you encourage this week?"],
    topics: ["Community", "Church", "Students"],
  },
  {
    id: "carry-each-other",
    title: "Carry Each Other",
    seriesId: "better-together",
    part: 3,
    speakerId: "lance",
    date: "2026-09-06",
    passage: "Galatians 6:1–5",
    book: "Galatians",
    minutes: 40,
    summary: "Real community isn't just sharing the good days. It's helping each other carry the heavy ones.",
    points: ["Carrying burdens starts with noticing them.", "Gentle restoration beats quiet judgment.", "Letting others help you is part of following Jesus too."],
    questions: ["Is it easier for you to help or to be helped?", "What burden are you carrying alone right now?", "How can your group carry someone this month?"],
    topics: ["Community", "Grace"],
  },
  {
    id: "the-table",
    title: "The Table",
    seriesId: "better-together",
    part: 2,
    speakerId: "brice",
    date: "2026-08-30",
    passage: "Acts 2:42–47",
    book: "Acts",
    minutes: 37,
    summary: "The first church grew around kitchen tables. Something holy happens when we eat together and open our homes.",
    points: ["The early church was devoted to each other, not just to meetings.", "Hospitality is a ministry anyone can do.", "Ordinary meals can be sacred moments."],
    questions: ["What's your favorite memory around a table?", "What keeps us from inviting people over?", "Who could you share a meal with this month?"],
    topics: ["Community", "Hospitality"],
  },
  {
    id: "made-for-more-than-me",
    title: "Made for More Than Me",
    seriesId: "better-together",
    part: 1,
    speakerId: "lance",
    date: "2026-08-23",
    passage: "Ecclesiastes 4:9–12",
    book: "Ecclesiastes",
    minutes: 38,
    summary: "Two are better than one. God designed us for friendship, and a cord of three strands is not quickly broken.",
    points: ["Loneliness is real, and God cares about it.", "We grow faster and stand stronger together.", "Jesus is the third strand that holds us together."],
    questions: ["Who are your \"two are better than one\" people?", "When have you felt most alone?", "What's one step toward deeper friendship you could take?"],
    topics: ["Community", "Friendship"],
  },

  /* ---------- Summer in the Psalms ---------- */
  {
    id: "let-everything-praise",
    title: "Let Everything Praise",
    seriesId: "summer-psalms",
    speakerId: "gannon",
    date: "2026-08-16",
    passage: "Psalm 150",
    book: "Psalms",
    minutes: 33,
    summary: "The Psalms end in a shout. After every tear and question, the last word is praise.",
    points: ["Praise isn't pretending everything is fine.", "Worship is for the whole person and the whole church.", "God is worthy of praise in every season."],
    questions: ["What song helps you worship when life is hard?", "What are you thankful for this week?", "How can worship shape your Monday, not just your Sunday?"],
    topics: ["Worship", "Praise"],
  },
  {
    id: "where-does-my-help-come-from",
    title: "Where Does My Help Come From?",
    seriesId: "summer-psalms",
    speakerId: "brice",
    date: "2026-07-26",
    passage: "Psalm 121",
    book: "Psalms",
    minutes: 36,
    summary: "We look to a lot of hills for help. This psalm points past all of them to the Maker of heaven and earth.",
    points: ["Everyone is looking somewhere for help.", "The God who made the mountains never sleeps.", "He watches over your coming and going, today and forever."],
    questions: ["Where do you tend to look first when you need help?", "When have you seen God watch over you?", "What fear do you need to hand to him today?"],
    topics: ["Trust", "Anxiety", "Prayer"],
  },
  {
    id: "create-in-me",
    title: "Create in Me a Clean Heart",
    seriesId: "summer-psalms",
    speakerId: "lance",
    date: "2026-07-12",
    passage: "Psalm 51",
    book: "Psalms",
    minutes: 41,
    summary: "David's prayer after his worst failure shows us the way home. God doesn't just forgive. He makes us new.",
    points: ["Honest confession is the doorway to freedom.", "God's mercy is bigger than your worst moment.", "A broken heart is not the end of the story."],
    questions: ["Why is it hard to admit when we're wrong?", "What does it look like to receive forgiveness, not just ask for it?", "Where do you need a fresh start?"],
    topics: ["Grace", "Forgiveness"],
  },
  {
    id: "fully-known",
    title: "Fully Known",
    seriesId: "summer-psalms",
    speakerId: "garrett",
    date: "2026-06-21",
    passage: "Psalm 139",
    book: "Psalms",
    minutes: 39,
    summary: "God knows every part of you, and he still draws near. You can't outrun his love.",
    points: ["Being fully known can feel scary until you know you're fully loved.", "You were made on purpose, with care.", "There's nowhere you can go that God won't be there."],
    questions: ["What part of you is hardest to believe God loves?", "How does knowing you were \"knit together\" change how you see yourself?", "Who needs to hear that they're fully known and loved?"],
    topics: ["Identity", "God's love"],
  },
  {
    id: "the-lord-is-my-shepherd",
    title: "The Lord Is My Shepherd",
    seriesId: "summer-psalms",
    speakerId: "lance",
    date: "2026-06-07",
    passage: "Psalm 23",
    book: "Psalms",
    minutes: 37,
    summary: "The most famous psalm isn't just for funerals. It's a picture of how God leads us through every valley.",
    points: ["A shepherd leads from close by, not from far away.", "Even the darkest valley is walked through, not lived in.", "Goodness and mercy are following you."],
    questions: ["Which line of Psalm 23 means the most to you, and why?", "What valley are you walking through?", "Where have you seen God's goodness follow you?"],
    topics: ["Trust", "Grief", "Comfort"],
  },

  /* ---------- Special Sundays ---------- */
  {
    id: "a-mothers-faith",
    title: "A Mother's Faith",
    seriesId: "special",
    speakerId: "lance",
    date: "2026-05-10",
    passage: "2 Timothy 1:3–7",
    book: "2 Timothy",
    minutes: 34,
    summary: "Timothy's faith started with his grandmother and mother. Faith passed down quietly can change generations.",
    points: ["Faith is often caught more than taught.", "Every generation needs someone to go first.", "God gives a spirit of power, love, and self-control, not fear."],
    questions: ["Who first showed you what faith looks like?", "What do you hope gets passed down from you?", "How can our church honor moms and mothering figures well?"],
    topics: ["Family", "Parenting"],
  },
  {
    id: "he-is-not-here",
    title: "He Is Not Here",
    seriesId: "special",
    speakerId: "lance",
    date: "2026-04-05",
    passage: "Matthew 28:1–10",
    book: "Matthew",
    minutes: 32,
    summary: "Easter Sunday. The tomb is empty, and everything is different now. Because he lives, death doesn't get the last word.",
    points: ["The resurrection is the hinge of history.", "Jesus meets fearful people with \"Don't be afraid.\"", "Good news is meant to be told."],
    questions: ["What would change if you really believed Jesus is alive?", "Where do you need to hear \"Don't be afraid\"?", "Who will you tell about the hope of Easter?"],
    topics: ["Easter", "Hope", "Jesus"],
  },
];

export const sermonById = Object.fromEntries(sermons.map((s) => [s.id, s])) as Record<string, Sermon>;

/** Newest first. */
export const sermonsByDate = [...sermons].sort((a, b) => (a.date < b.date ? 1 : -1));
export const latestSermon = sermonsByDate[0];
export const currentSeries = seriesById[latestSermon.seriesId];

export const seriesSermons = (seriesId: string) => sermons.filter((s) => s.seriesId === seriesId).sort((a, b) => (a.date < b.date ? -1 : 1));
export const sermonBooks = [...new Set(sermons.map((s) => s.book))].sort();
export const sermonTopics = [...new Set(sermons.flatMap((s) => s.topics))].sort();

export const sermonDate = (ymd: string, opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }) =>
  new Date(`${ymd}T12:00:00`).toLocaleDateString("en-US", opts);

/** Opens the passage in the Bible app (any translation the reader prefers). */
export const bibleLink = (passage: string) => `https://www.bible.com/search/bible?q=${encodeURIComponent(passage.replace("–", "-"))}`;
