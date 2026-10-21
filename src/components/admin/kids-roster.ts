import { toast } from "sonner";
import { kidGradeLabel, kidGradeOptions, kidsGroups } from "@/lib/data";
import type { KidInfo, Visitor } from "@/lib/types";

export type KidsGroup = (typeof kidsGroups)[number]["id"];

export const hasKids = (v: Visitor) => !!v.kids || !!v.students;
export const groupOf = (k: KidInfo) => kidGradeOptions.find((g) => g.id === k.grade)?.group;

/** Does this household have a kid in the given group? */
export const inGroup = (v: Visitor, g: KidsGroup) => (g === "students" ? !!v.students : !!v.kids?.kids.some((k) => groupOf(k) === g));

/** "8 mo" under two, otherwise "6 yrs". */
export function ageLabel(ymd: string) {
  const b = new Date(`${ymd}T12:00:00`);
  const now = new Date();
  const months = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth() - (now.getDate() < b.getDate() ? 1 : 0);
  return months < 24 ? `${Math.max(0, months)} mo` : `${Math.floor(months / 12)} yrs`;
}

/** Kids First roster as a CSV, in the shape Planning Center check-ins imports. */
export function downloadKidsRoster(people: Visitor[], group: KidsGroup | "") {
  const rows = people.flatMap((v) => v.kids?.kids.filter((k) => !group || groupOf(k) === group).map((k) => ({ v, k })) ?? []);
  const head = ["Child first name", "Last name", "Goes by", "Birthdate", "Age", "Gender", "Grade", "Room", "School", "Allergies / medical notes", "Parent", "Parent mobile", "Parent email", "Second guardian", "Second guardian phone", "Also allowed to pick up", "Emergency contact", "Member", "First Sunday", "Service"];
  const lines = rows.map(({ v, k }) => {
    const r = v.kids!;
    return [
      k.firstName, k.lastName, k.nickname ?? "", k.birthdate, ageLabel(k.birthdate), k.gender === "F" ? "Female" : k.gender === "M" ? "Male" : "",
      kidGradeLabel(k.grade), kidsGroups.find((g) => g.id === groupOf(k))?.label ?? "", k.school ?? "", k.medicalNotes ?? "",
      `${r.parent.firstName} ${r.parent.lastName}`, r.parent.phone, r.parent.email,
      r.secondGuardian ? `${r.secondGuardian.firstName} ${r.secondGuardian.lastName}` : "", r.secondGuardian?.phone ?? "",
      r.pickup.map((p) => `${p.name}${p.relationship ? ` (${p.relationship})` : ""}${p.phone ? ` ${p.phone}` : ""}`).join("; "),
      r.emergency ? `${r.emergency.name} ${r.emergency.phone}` : "",
      v.memberSince ? "Yes" : "No",
      new Date(r.date).toLocaleDateString("en-US"), r.service,
    ];
  });
  const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `kids-roster${group ? `-${group}` : ""}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Kids roster downloaded", { description: `${rows.length} kid${rows.length === 1 ? "" : "s"}` });
}
