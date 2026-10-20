import { getOfferings } from "./data";
import type { FollowUps, InterestId, Offering } from "./types";

export type FollowUpKey = "people" | "faith" | "family" | "home" | "serve";

/** Max follow-up screens, so choosing many interests never means a long questionnaire. */
export const MAX_FOLLOW_UPS = 2;

export function followUpsFor(selected: InterestId[]): FollowUpKey[] {
  return selected.slice(0, MAX_FOLLOW_UPS);
}

function answerKeys(f: FollowUps): string[] {
  return [
    ...f.vibes,
    f.groupSize ?? "",
    f.faithStage ?? "",
    ...f.ageGroups,
    ...f.homeTopics,
    ...f.serveAreas,
  ].filter(Boolean);
}

function score(o: Offering, selected: InterestId[], keys: string[]) {
  let s = 0;
  selected.forEach((id, i) => {
    if (o.interests[0] === id) s += 12 - i;
    else if (o.interests.includes(id)) s += 5 - i * 0.5;
  });
  for (const k of o.matchKeys ?? []) if (keys.includes(k)) s += 3;
  return s;
}

/**
 * Picks a short, personal set: the best match for each chosen interest first
 * (so multiple interests are all represented), then fills with the next best.
 */
export function recommend(selected: InterestId[], f: FollowUps, count = 3): Offering[] {
  const all = getOfferings();
  if (selected.length === 0) {
    return ["coffee-welcome", "small-groups", "discover"].map((id) => all.find((o) => o.id === id)!);
  }
  const keys = answerKeys(f);
  const ranked = [...all]
    .map((o) => ({ o, s: score(o, selected, keys) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  const picks: Offering[] = [];
  for (const id of selected) {
    if (picks.length >= count) break;
    const best = ranked.find((x) => x.o.interests[0] === id && !picks.includes(x.o));
    if (best) picks.push(best.o);
  }
  for (const x of ranked) {
    if (picks.length >= count) break;
    if (!picks.includes(x.o)) picks.push(x.o);
  }
  return picks;
}

/** A short line explaining why something was recommended. */
export function reasonFor(o: Offering, selected: InterestId[], f: FollowUps): string {
  const keys = answerKeys(f);
  const reasons: Record<string, string> = {
    coffee: "You said coffee and conversation",
    outdoors: "You like getting outside",
    food: "You're into food and hangouts",
    "small-groups": "You're open to a small group",
    "bible-study": "You mentioned Bible studies",
    small: "You prefer smaller gatherings",
    large: "You like bigger events",
    curious: "Great for curious minds",
    exploring: "Made for people exploring",
    returning: "A gentle way back in",
    deeper: "For going deeper",
    babies: "Your little ones are covered",
    elementary: "Built for elementary kids",
    middle: "Includes students",
    high: "Includes students",
    parents: "Made for parents",
    story: "You wanted our story",
    pastors: "You wanted to meet the pastors",
    membership: "You asked about belonging",
    hospitality: "You love hospitality",
    outreach: "You care about our city",
    kids: "You'd love serving kids",
    production: "You're into music and production",
    care: "You have a heart for care",
  };
  const hit = (o.matchKeys ?? []).find((k) => keys.includes(k) && reasons[k]);
  if (hit) return reasons[hit];
  const labels: Record<InterestId, string> = {
    people: "Because you want to meet people",
    home: "Because you're looking for a church home",
    faith: "Because you're exploring faith",
    family: "Because you're connecting your family",
    serve: "Because you want to make a difference",
  };
  const i = selected.includes(o.interests[0]) ? o.interests[0] : selected.find((s) => o.interests.includes(s));
  return i ? labels[i] : "A great first step";
}
