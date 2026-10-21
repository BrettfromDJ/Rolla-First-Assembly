"use client";

import { CountUp } from "@/components/church/motion";
import { useMemo, useState } from "react";
import { Baby, ChevronRight, Download, HeartPulse, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { kidGradeLabel, kidGradeOptions, kidsGroups } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { KidInfo, Visitor } from "@/lib/types";
import { cn, formatShortDay } from "@/lib/utils";
import { fullName, stageStyle } from "./helpers";

type Show = "all" | "kids" | "nokids";
type Group = (typeof kidsGroups)[number]["id"];

const hasKids = (v: Visitor) => !!v.kids || !!v.students;
const groupOf = (k: KidInfo) => kidGradeOptions.find((g) => g.id === k.grade)?.group;
const birth = (ymd: string) => new Date(`${ymd}T12:00:00`);

/** "8 mo" under two, otherwise "6 yrs". */
function ageLabel(ymd: string) {
  const b = birth(ymd);
  const now = new Date();
  const months = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth() - (now.getDate() < b.getDate() ? 1 : 0);
  return months < 24 ? `${Math.max(0, months)} mo` : `${Math.floor(months / 12)} yrs`;
}

/** Everyone with an account, with their kids from Kids First pre-registration. */
export function MembersView({ query, onOpen }: { query: string; onOpen: (visitorId: string) => void }) {
  const { allVisitors, hydrated } = useStore();
  const [show, setShow] = useState<Show>("all");
  const [group, setGroup] = useState<Group | "">("");

  const members = useMemo(
    () => [...allVisitors].sort((a, b) => Number(!!b.isYou) - Number(!!a.isYou) || Number(!!b.kids) - Number(!!a.kids) || fullName(a).localeCompare(fullName(b))),
    [allVisitors],
  );

  const q = query.trim().toLowerCase();
  const matches = (v: Visitor) => {
    if (!q) return true;
    const kids = v.kids?.kids.map((k) => `${k.firstName} ${k.nickname ?? ""} ${k.lastName}`).join(" ") ?? "";
    const guardians = v.kids ? `${v.kids.parent.firstName} ${v.kids.parent.lastName} ${v.kids.secondGuardian?.firstName ?? ""}` : "";
    return `${fullName(v)} ${v.email} ${v.phone} ${kids} ${guardians}`.toLowerCase().includes(q);
  };
  const visible = members.filter(
    (v) =>
      matches(v) &&
      (show === "all" || (show === "kids" ? hasKids(v) : !hasKids(v))) &&
      (!group || (group === "students" ? !!v.students : !!v.kids?.kids.some((k) => groupOf(k) === group))),
  );

  const allKids = members.flatMap((v) => v.kids?.kids.map((k) => ({ v, k })) ?? []);
  const shownKids = visible.flatMap((v) => v.kids?.kids.filter((k) => !group || groupOf(k) === group).map((k) => ({ v, k })) ?? []);
  const groupCount = (g: Group) =>
    g === "students" ? members.reduce((n, v) => n + (v.students?.students.length ?? 0), 0) : allKids.filter(({ k }) => groupOf(k) === g).length;

  const exportCsv = () => {
    const head = ["Child first name", "Last name", "Goes by", "Birthdate", "Age", "Gender", "Grade", "Room", "School", "Allergies / medical notes", "Parent", "Parent mobile", "Parent email", "Second guardian", "Second guardian phone", "Also allowed to pick up", "Emergency contact", "First Sunday", "Service"];
    const lines = shownKids.map(({ v, k }) => {
      const r = v.kids!;
      return [
        k.firstName, k.lastName, k.nickname ?? "", k.birthdate, ageLabel(k.birthdate), k.gender === "F" ? "Female" : k.gender === "M" ? "Male" : "",
        kidGradeLabel(k.grade), kidsGroups.find((g) => g.id === groupOf(k))?.label ?? "", k.school ?? "", k.medicalNotes ?? "",
        `${r.parent.firstName} ${r.parent.lastName}`, r.parent.phone, r.parent.email,
        r.secondGuardian ? `${r.secondGuardian.firstName} ${r.secondGuardian.lastName}` : "", r.secondGuardian?.phone ?? "",
        r.pickup.map((p) => `${p.name}${p.relationship ? ` (${p.relationship})` : ""}${p.phone ? ` ${p.phone}` : ""}`).join("; "),
        r.emergency ? `${r.emergency.name} ${r.emergency.phone}` : "",
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
    toast("Kids roster downloaded", { description: `${shownKids.length} kid${shownKids.length === 1 ? "" : "s"}` });
  };

  return (
    <div className="space-y-6">
      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Users} label="Members" value={members.length} sub="Everyone with an account" ready={hydrated} />
        <Stat icon={Users} label="Families with kids" value={members.filter(hasKids).length} sub="Pre-registered for Kids First" ready={hydrated} />
        <Stat icon={Baby} label="Kids registered" value={allKids.length} sub={kidsGroups.filter((g) => g.id !== "students").map((g) => `${groupCount(g.id)} ${g.label.toLowerCase()}`).join(" · ")} ready={hydrated} />
        <Stat icon={HeartPulse} label="Allergies & medical" value={allKids.filter(({ k }) => k.medicalNotes).length} sub="Printed on name tags" ready={hydrated} warn />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {([["all", "Everyone"], ["kids", "Has kids registered"], ["nokids", "No kids registered"]] as const).map(([id, label]) => (
          <Pill key={id} on={show === id} onClick={() => { setShow(id); if (id === "nokids") setGroup(""); }}>{label}</Pill>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:block" />
        {kidsGroups.map((g) => (
          <Pill key={g.id} on={group === g.id} onClick={() => { setGroup(group === g.id ? "" : g.id); if (show === "nokids") setShow("all"); }}>
            {g.label} <span className="ml-1 tabular-nums opacity-60">{hydrated ? groupCount(g.id) : ""}</span>
          </Pill>
        ))}
        <button onClick={exportCsv} disabled={!shownKids.length} className="ml-auto flex h-10 items-center gap-2 rounded-full px-4 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300 disabled:opacity-40">
          <Download className="size-4" /> Download kids roster
        </button>
      </div>

      {/* List */}
      {!hydrated ? (
        <div className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-stone-200/70">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-stone-100" />)}</div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-stone-200/70">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400"><Users className="size-5" /></span>
          <p className="mt-4 font-medium">{q ? "No one matches that search" : "No members here yet"}</p>
          <p className="mt-1 text-sm text-stone-500">Families who pre-register on the Kids page show up here right away.</p>
        </div>
      ) : (
        <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200/70">
          <li className="hidden grid-cols-[minmax(220px,1fr)_minmax(0,2fr)_150px_24px] gap-4 px-5 py-2.5 text-xs text-stone-400 lg:grid">
            <span>Member</span>
            <span>Kids</span>
            <span>First Sunday</span>
            <span />
          </li>
          {visible.map((v) => (
            <li key={v.id}>
              <button
                onClick={() => onOpen(v.id)}
                className={cn("grid w-full gap-3 px-5 py-4 text-left transition hover:bg-stone-50 lg:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)_150px_24px] lg:items-center lg:gap-4", v.isYou && "bg-honey-soft/30")}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar name={fullName(v)} src={v.photo} className={cn(v.isYou && "bg-forest-700 text-ink")} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-medium text-stone-900">
                      <span className="truncate">{fullName(v)}</span>
                      {v.isYou && <span className="rounded-full bg-honey-soft px-1.5 py-0.5 text-[10px] font-semibold text-honey">YOU</span>}
                    </span>
                    <span className="block truncate text-xs text-stone-400">
                      {v.kids?.secondGuardian ? `with ${v.kids.secondGuardian.firstName} · ` : ""}
                      {v.kids?.parent.phone || v.phone || v.email}
                    </span>
                  </span>
                </span>

                <span className="flex min-w-0 flex-wrap gap-1.5">
                  {hasKids(v) ? (
                    <>
                    {v.kids?.kids.map((k, i) => (
                      <span
                        key={i}
                        title={k.medicalNotes ? `Medical: ${k.medicalNotes}` : undefined}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1",
                          group && groupOf(k) !== group ? "opacity-40" : "",
                          k.medicalNotes ? "bg-clay/10 text-stone-800 ring-clay/40" : "bg-stone-50 text-stone-700 ring-stone-200",
                        )}
                      >
                        <span className="font-medium">{k.nickname || k.firstName}</span>
                        <span className="text-stone-500">{kidGradeLabel(k.grade)} · {ageLabel(k.birthdate)}</span>
                        {k.medicalNotes && <HeartPulse className="size-3.5 text-clay" aria-label="Has allergies or medical notes" />}
                      </span>
                    ))}
                    {v.students?.students.map((st, i) => (
                      <span
                        key={`s${i}`}
                        title={st.medicalNotes ? `Medical: ${st.medicalNotes}` : undefined}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1",
                          group && group !== "students" ? "opacity-40" : "",
                          st.medicalNotes ? "bg-clay/10 text-stone-800 ring-clay/40" : "bg-forest-50 text-stone-700 ring-forest-700/30",
                        )}
                      >
                        <span className="font-medium">{st.firstName}</span>
                        <span className="text-stone-500">{st.grade}th · Wednesdays</span>
                        {st.medicalNotes && <HeartPulse className="size-3.5 text-clay" aria-label="Has allergies or medical notes" />}
                      </span>
                    ))}
                    </>
                  ) : (
                    <span className="text-xs text-stone-400">No kids registered{v.household ? ` · ${v.household}` : ""}</span>
                  )}
                </span>

                <span className="text-sm text-stone-600">
                  {v.kids ? (
                    <>
                      {formatShortDay(v.kids.date)} <span className="text-stone-400">· {v.kids.service}</span>
                    </>
                  ) : v.students ? (
                    <>
                      {formatShortDay(v.students.date)} <span className="text-stone-400">· Wed</span>
                    </>
                  ) : (
                    <span className={cn("inline-flex items-center gap-1.5 text-xs text-stone-400")}>
                      <span className={cn("size-1.5 rounded-full", stageStyle[v.stage].dot)} /> {v.stage}
                    </span>
                  )}
                </span>
                <ChevronRight className="hidden size-4 text-stone-300 lg:block" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn("flex h-10 items-center rounded-full px-4 text-sm ring-1 transition", on ? "bg-forest-700 font-medium text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}
    >
      {children}
    </button>
  );
}

function Stat({ icon: Icon, label, value, sub, warn, ready }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; sub: string; warn?: boolean; ready: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70 md:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-stone-500">{label}</span>
        <Icon className={cn("size-4", warn && value > 0 ? "text-clay" : "text-stone-300")} />
      </div>
      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{ready ? <CountUp value={value} /> : "–"}</p>
      <p className="mt-2 truncate text-xs text-stone-400">{ready ? sub : ""}</p>
    </div>
  );
}
