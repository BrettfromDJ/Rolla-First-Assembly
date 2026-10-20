import { getOffering } from "@/lib/data";
import type { Rsvp, Stage, Visitor } from "@/lib/types";

export const stages: Stage[] = ["Planning a visit", "First-time visitor", "Getting connected", "Event RSVP", "Connected"];

export const stageStyle: Record<Stage, { pill: string; dot: string; bar: string }> = {
  "Planning a visit": { pill: "bg-sky-soft text-[#2f5361]", dot: "bg-[#6b93a3]", bar: "bg-[#9fbac4]" },
  "First-time visitor": { pill: "bg-honey-soft text-[#7a5a17]", dot: "bg-honey", bar: "bg-honey" },
  "Getting connected": { pill: "bg-clay-soft text-[#8a432a]", dot: "bg-clay", bar: "bg-clay" },
  "Event RSVP": { pill: "bg-sage-soft text-forest-700", dot: "bg-forest-400", bar: "bg-forest-400" },
  Connected: { pill: "bg-forest-700 text-paper", dot: "bg-forest-700", bar: "bg-forest-700" },
};

export const ACTING_AS = "jamie";

export function rsvpInfo(r: Rsvp) {
  const o = getOffering(r.offeringId);
  const item = o?.items?.find((i) => i.id === r.itemId);
  return {
    o,
    title: item?.title ?? o?.title ?? "Event",
    parent: item ? o?.title : undefined,
    date: item?.date ?? (item ? undefined : o?.date),
    kind: o?.actionKind ?? "rsvp",
  };
}

export function isRecent(iso: string, days = 14) {
  return Date.now() - new Date(iso).getTime() < days * 86400000 && new Date(iso).getTime() <= Date.now() + 7 * 86400000;
}

export function needsAttention(v: Visitor) {
  const overdue = v.tasks.some((t) => !t.done && new Date(t.dueDate).getTime() < Date.now());
  return v.status === "Needs follow-up" || overdue;
}

export function nextAction(v: Visitor): { label: string; due?: string; overdue?: boolean } {
  const open = v.tasks.filter((t) => !t.done).sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))[0];
  if (open) return { label: open.title, due: open.dueDate, overdue: new Date(open.dueDate).getTime() < Date.now() };
  if (v.status === "Needs follow-up" && !v.assigneeId) return { label: "Assign a welcome team member" };
  const byStage: Record<Stage, string> = {
    "Planning a visit": "Welcome them on Sunday",
    "First-time visitor": "Send a welcome note",
    "Getting connected": "Suggest a group to try",
    "Event RSVP": "Say hi at the event",
    Connected: "Check in next month",
  };
  return { label: byStage[v.stage] };
}

export function fullName(v: Visitor) {
  return `${v.firstName}${v.lastName ? ` ${v.lastName}` : ""}`;
}
