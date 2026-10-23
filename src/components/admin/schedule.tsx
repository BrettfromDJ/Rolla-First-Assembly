"use client";

import { CountUp } from "@/components/church/motion";
import { useMemo, useState } from "react";
import { Ban, BellRing, Check, CircleHelp, Download, MessageSquare, Plane, Sparkles, UserMinus, UserPlus, Users, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { staffById } from "@/lib/data";
import { teamById } from "@/lib/serve";
import {
  candidatesFor,
  dayOfAt,
  fromYmd,
  openSpots,
  reminderAt,
  reminderText,
  scheduledTeams,
  services,
  timeLabel,
  upcomingSundays,
} from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { Assignment, ServiceTime, Volunteer } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

const fullName = (v: Volunteer) => `${v.firstName} ${v.lastName}`;
const dayLabel = (d: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) => fromYmd(d).toLocaleDateString("en-US", opts);
const whenLabel = (d: Date) => `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
const declineReasons = ["Out of town", "Sick", "Working", "Family plans", "Something came up"];

type Spot = { date: string; service: ServiceTime; teamId: string; position: string; slot: number };

/** Sunday volunteer scheduling: who's serving, who can't, open spots, and the reminder texts that go out automatically. */
export function ScheduleView({ query }: { query: string }) {
  const { schedule, hydrated, autoFillSunday } = useStore();
  const { volunteers, assignments, settings } = schedule;
  const sundays = useMemo(() => (hydrated ? upcomingSundays(6) : []), [hydrated]);
  const [date, setDate] = useState<string | null>(null);
  const [teamId, setTeamId] = useState("kids-first");
  const [picking, setPicking] = useState<Spot | null>(null);
  const day = date ?? sundays[0];
  const team = scheduledTeams.find((t) => t.id === teamId)!;
  const byId = useMemo(() => new Map(volunteers.map((v) => [v.id, v])), [volunteers]);

  if (!hydrated || !day) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-stone-200/70" />)}</div>;
  }

  const here = assignments.filter((a) => a.date === day && a.teamId === teamId);
  const active = here.filter((a) => a.status !== "declined");
  const declined = here.filter((a) => a.status === "declined");
  const totalSpots = team.positions.reduce((n, p) => n + p.spots, 0) * services.length;
  const open = openSpots(assignments, day, teamId);
  const confirmed = active.filter((a) => a.status === "confirmed").length;
  const waiting = active.filter((a) => a.status === "pending").length;
  const away = volunteers.filter((v) => v.teamId === teamId && v.blockouts.includes(day));
  const q = query.trim().toLowerCase();
  const matches = (a: Assignment) => !q || fullName(byId.get(a.volunteerId)!).toLowerCase().includes(q);

  const fill = () => {
    const { filled, stretched } = autoFillSunday(day, teamId);
    toast(filled ? `Filled ${filled} open spot${filled === 1 ? "" : "s"}` : "No one available for the open spots", {
      description: filled
        ? `Each person gets a text asking them to confirm.${stretched ? ` ${stretched} ${stretched === 1 ? "is" : "are"} serving more often than they asked, so this team could use more people.` : ""}`
        : "Everyone who does these positions is away, already serving that morning, or said no.",
    });
  };

  const exportCsv = () => {
    const head = ["Sunday", "Service", "Team", "Position", "Volunteer", "Phone", "Status", "Note"];
    const lines = sundays.flatMap((d) =>
      assignments
        .filter((a) => a.date === d && a.teamId === teamId)
        .sort((a, b) => (a.service + a.position + a.slot).localeCompare(b.service + b.position + b.slot))
        .map((a) => {
          const v = byId.get(a.volunteerId)!;
          return [dayLabel(d), a.service, team.name, a.position, fullName(v), v.phone, a.status === "declined" ? "Can't make it" : a.status === "confirmed" ? "Confirmed" : "Waiting", a.reason ?? ""];
        }),
    );
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule-${teamId}-${sundays[0]}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Schedule downloaded", { description: `${team.name}, next ${sundays.length} Sundays` });
  };

  return (
    <div className="space-y-6">
      {/* Sunday + team pickers */}
      <div className="space-y-3">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto overflow-y-hidden px-5 py-1 md:-mx-1 md:px-1">
          {sundays.map((d, i) => {
            const n = openSpots(assignments, d, teamId).length;
            const on = d === day;
            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                aria-pressed={on}
                className={cn("flex h-14 shrink-0 flex-col items-start justify-center rounded-2xl px-4 text-left ring-1 transition", on ? "bg-forest-700 text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}
              >
                <span className={cn("text-[11px]", on ? "text-ink/70" : "text-stone-400")}>{i === 0 ? "This Sunday" : i === 1 ? "Next Sunday" : `In ${i} weeks`}</span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  {dayLabel(d, { month: "short", day: "numeric" })}
                  {n > 0 && <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", on ? "bg-ink/15" : "bg-clay-soft text-clay")}>{n} open</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto overflow-y-hidden px-5 py-1 md:-mx-1 md:px-1 lg:flex-1">
          {scheduledTeams.map((t) => {
            const n = openSpots(assignments, day, t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setTeamId(t.id)}
                aria-pressed={t.id === teamId}
                className={cn("flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm ring-1 transition", t.id === teamId ? "bg-forest-700 font-medium text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}
              >
                {t.name}
                {n > 0 && <span className={cn("rounded-full px-1.5 text-xs tabular-nums", t.id === teamId ? "bg-ink/15" : "bg-stone-100 text-stone-500")}>{n}</span>}
              </button>
            );
          })}
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
            <button onClick={exportCsv} className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300">
              <Download className="size-4" /> Download
            </button>
            <button onClick={fill} disabled={!open.length} className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-forest-700 px-4 text-sm font-medium text-ink transition hover:bg-forest-500 disabled:opacity-40">
              <Wand2 className="size-4" /> Fill open spots
            </button>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Users} label="Spots filled" value={`${active.length}/${totalSpots}`} sub={`${team.name}, ${dayLabel(day)}`} />
        <Stat icon={Check} label="Confirmed" value={String(confirmed)} sub={waiting ? `${waiting} still waiting to reply` : "Everyone has replied"} />
        <Stat icon={Ban} label="Can't make it" value={String(declined.length + away.length)} sub={`${declined.length} said no · ${away.length} away`} warn={declined.length > 0} />
        <Stat icon={UserPlus} label="Open spots" value={String(open.length)} sub={open.length ? "Tap one to find someone" : "Fully staffed"} warn={open.length > 0} />
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Roster for the day */}
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <section key={service} className="rounded-2xl bg-white ring-1 ring-stone-200/70">
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5">
                <h3 className="font-medium">{service} AM service</h3>
                <span className="text-xs text-stone-400">
                  {active.filter((a) => a.service === service).length}/{totalSpots / 2} filled
                </span>
              </div>
              <div className="divide-y divide-stone-100">
                {team.positions.map((p) => (
                  <div key={p.name} className="px-5 py-3.5">
                    <p className="mb-2 text-xs font-medium text-stone-400">{p.name}</p>
                    <ul className="space-y-1.5">
                      {Array.from({ length: p.spots }, (_, slot) => {
                        const spot: Spot = { date: day, service, teamId, position: p.name, slot };
                        const a = active.find((x) => x.service === service && x.position === p.name && x.slot === slot);
                        const said = declined.filter((x) => x.service === service && x.position === p.name && x.slot === slot);
                        return (
                          <li key={slot}>
                            {a ? (
                              <SlotRow a={a} v={byId.get(a.volunteerId)!} dim={!matches(a)} onSwap={() => setPicking(spot)} />
                            ) : (
                              <button onClick={() => setPicking(spot)} className="flex h-11 w-full items-center gap-2 rounded-xl border-2 border-dashed border-clay/40 px-3 text-sm text-clay transition hover:border-clay hover:bg-clay-soft">
                                <UserPlus className="size-4" /> Open spot
                                {said.length > 0 && <span className="ml-auto truncate text-xs text-stone-500">{byId.get(said[said.length - 1].volunteerId)?.firstName} can&apos;t make it</span>}
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Side panel */}
        <aside className="space-y-4 2xl:self-start">
          <CantMakeIt declined={declined} away={away} byId={byId} onFind={(a) => setPicking({ date: a.date, service: a.service, teamId: a.teamId, position: a.position, slot: a.slot })} openKeys={new Set(open.map((o) => `${o.service}|${o.position}|${o.slot}`))} />
          <Reminders day={day} teamName={team.name} here={active} byId={byId} />
          <TextLog day={day} here={here} byId={byId} />
        </aside>
      </div>

      <Roster teamId={teamId} sundays={sundays} />

      <PickSheet spot={picking} onClose={() => setPicking(null)} />
    </div>
  );
}

/* ---------- One filled spot ---------- */

function SlotRow({ a, v, dim, onSwap }: { a: Assignment; v: Volunteer; dim: boolean; onSwap: () => void }) {
  const { setAssignment, removeAssignment } = useStore();
  const [menu, setMenu] = useState<"none" | "actions" | "decline">("none");
  return (
    <div className={cn("rounded-xl bg-stone-50 transition", dim && "opacity-40")}>
      <button onClick={() => setMenu(menu === "none" ? "actions" : "none")} aria-expanded={menu !== "none"} className="flex h-11 w-full items-center gap-2.5 px-3 text-left text-sm">
        <Avatar name={fullName(v)} className="size-7 text-[11px]" />
        <span className="min-w-0 flex-1 truncate text-stone-900">{fullName(v)}</span>
        {a.status === "confirmed" ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-[11px] font-medium text-sage"><Check className="size-3" /> Confirmed</span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-honey-soft px-2 py-0.5 text-[11px] font-medium text-honey"><CircleHelp className="size-3" /> Waiting</span>
        )}
      </button>
      {menu === "actions" && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-3">
          {a.status !== "confirmed" && (
            <MiniButton icon={Check} onClick={() => { setAssignment(a.id, { status: "confirmed" }); setMenu("none"); toast(`${v.firstName} is confirmed`); }}>Confirmed</MiniButton>
          )}
          <MiniButton icon={Ban} onClick={() => setMenu("decline")}>Can&apos;t make it</MiniButton>
          <MiniButton icon={Users} onClick={() => { setMenu("none"); onSwap(); }}>Swap</MiniButton>
          <MiniButton icon={UserMinus} onClick={() => { removeAssignment(a.id); toast(`${v.firstName} removed`, { description: "The spot is open again." }); }}>Remove</MiniButton>
        </div>
      )}
      {menu === "decline" && (
        <div className="px-3 pb-3">
          <p className="mb-1.5 text-xs text-stone-500">Why can&apos;t {v.firstName} make it?</p>
          <div className="flex flex-wrap gap-1.5">
            {declineReasons.map((r) => (
              <MiniButton
                key={r}
                onClick={() => {
                  setAssignment(a.id, { status: "declined", reason: r });
                  setMenu("none");
                  toast(`${v.firstName} can't make it`, { description: "The spot is open. Tap it to find a sub." });
                }}
              >
                {r}
              </MiniButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniButton({ icon: Icon, onClick, children }: { icon?: React.ComponentType<{ className?: string }>; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-xs text-stone-700 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300">
      {Icon && <Icon className="size-3.5" />}
      {children}
    </button>
  );
}

/* ---------- Side panel cards ---------- */

function CantMakeIt({ declined, away, byId, onFind, openKeys }: { declined: Assignment[]; away: Volunteer[]; byId: Map<string, Volunteer>; onFind: (a: Assignment) => void; openKeys: Set<string> }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70">
      <h3 className="px-1 font-medium">Can&apos;t make it</h3>
      {declined.length === 0 && away.length === 0 ? (
        <p className="mt-2 px-1 text-sm text-stone-500">Nobody has said no this Sunday.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {declined.map((a) => {
            const v = byId.get(a.volunteerId)!;
            const stillOpen = openKeys.has(`${a.service}|${a.position}|${a.slot}`);
            return (
              <li key={a.id} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm">
                <Ban className="size-4 shrink-0 text-clay" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-stone-900">{fullName(v)}</p>
                  <p className="truncate text-xs text-stone-500">{a.position} · {a.service}{a.reason ? ` · ${a.reason}` : ""}</p>
                </div>
                {stillOpen ? (
                  <button onClick={() => onFind(a)} className="shrink-0 rounded-full bg-forest-700 px-3 py-1.5 text-xs font-medium text-ink">Find a sub</button>
                ) : (
                  <span className="shrink-0 text-xs text-sage">Covered</span>
                )}
              </li>
            );
          })}
          {away.map((v) => (
            <li key={v.id} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm">
              <Plane className="size-4 shrink-0 text-stone-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-stone-900">{fullName(v)}</p>
                <p className="text-xs text-stone-500">Away this Sunday · won&apos;t be scheduled</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Reminders({ day, teamName, here, byId }: { day: string; teamName: string; here: Assignment[]; byId: Map<string, Volunteer> }) {
  const { schedule, updateScheduleSettings } = useStore();
  const s = schedule.settings;
  const now = new Date();
  const at = reminderAt(day, s);
  const morning = dayOfAt(day, s);
  const sent = now >= at;
  const sample = here[0];

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70">
      <div className="flex items-center justify-between gap-3 px-1">
        <h3 className="flex items-center gap-2 font-medium"><BellRing className="size-4 text-forest-500" /> Reminder texts</h3>
        <button
          role="switch"
          aria-checked={s.reminders}
          aria-label="Automatic reminder texts"
          onClick={() => updateScheduleSettings({ reminders: !s.reminders })}
          className={cn("relative h-6 w-11 rounded-full transition", s.reminders ? "bg-forest-700" : "bg-stone-200")}
        >
          <span className={cn("absolute top-0.5 size-5 rounded-full bg-paper transition-all", s.reminders ? "left-[22px]" : "left-0.5")} />
        </button>
      </div>
      {s.reminders ? (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 px-1 text-sm text-stone-600">
            Text everyone
            <select value={s.daysBefore} onChange={(e) => updateScheduleSettings({ daysBefore: Number(e.target.value) })} aria-label="Days before" className="h-8 rounded-full bg-stone-50 pl-3 pr-9 text-sm ring-1 ring-stone-200">
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} day{n === 1 ? "" : "s"}</option>)}
            </select>
            before at
            <select value={s.time} onChange={(e) => updateScheduleSettings({ time: e.target.value })} aria-label="Reminder time" className="h-8 rounded-full bg-stone-50 pl-3 pr-9 text-sm ring-1 ring-stone-200">
              {["09:00", "12:00", "17:00", "18:00", "19:00"].map((t) => <option key={t} value={t}>{timeLabel(t)}</option>)}
            </select>
          </div>
          <label className="mt-2 flex cursor-pointer items-center gap-2 px-1 text-sm text-stone-600">
            <input type="checkbox" checked={s.dayOf} onChange={(e) => updateScheduleSettings({ dayOf: e.target.checked })} className="size-4 accent-[#0285ff]" />
            Plus a good-morning text at {timeLabel(s.dayOfTime)}
          </label>
          <div className={cn("mt-3 rounded-xl p-3 text-sm", sent ? "bg-sage-soft text-sage" : "bg-forest-50 text-forest-300")}>
            {sent ? `Sent ${whenLabel(at)} to ${here.length} people on ${teamName}.` : `Goes out ${whenLabel(at)} to ${here.length} people on ${teamName}.`}
            {s.dayOf && <span className="block text-xs opacity-80">Good-morning text {now >= morning ? "sent" : "goes out"} {whenLabel(morning)}.</span>}
          </div>
          {sample && (
            <div className="mt-3">
              <p className="px-1 text-xs text-stone-400">What {byId.get(sample.volunteerId)?.firstName} will get</p>
              <p className="mt-1.5 rounded-2xl rounded-bl-md bg-stone-100 p-3 text-sm leading-relaxed text-stone-700">{reminderText(byId.get(sample.volunteerId)!, sample, "reminder")}</p>
            </div>
          )}
          <button
            onClick={() => toast(`Reminder sent to ${here.length} people`, { description: "Simulated. Texts send once a texting service is connected." })}
            disabled={!here.length}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 disabled:opacity-40"
          >
            <MessageSquare className="size-4" /> Send a reminder now
          </button>
        </>
      ) : (
        <p className="mt-2 px-1 text-sm text-stone-500">Automatic reminders are off. People still get a text when they&apos;re scheduled.</p>
      )}
    </div>
  );
}

function TextLog({ day, here, byId }: { day: string; here: Assignment[]; byId: Map<string, Volunteer> }) {
  const { schedule } = useStore();
  const s = schedule.settings;
  const now = Date.now();
  const at = reminderAt(day, s).getTime();
  const items = here
    .flatMap((a) => {
      const v = byId.get(a.volunteerId)!;
      const out: { at: number; v: Volunteer; out: boolean; text: string }[] = [{ at: +new Date(a.assignedAt), v, out: true, text: reminderText(v, a, "scheduled") }];
      if (a.respondedAt) out.push({ at: +new Date(a.respondedAt), v, out: false, text: a.status === "confirmed" ? "YES" : a.status === "declined" ? `NO${a.reason ? `, ${a.reason.toLowerCase()}. Sorry!` : ""}` : "" });
      if (s.reminders && now >= at && a.status !== "declined") out.push({ at, v, out: true, text: reminderText(v, a, "reminder") });
      return out;
    })
    .filter((x) => x.text)
    .sort((a, b) => b.at - a.at)
    .slice(0, 8);

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70">
      <h3 className="px-1 font-medium">Recent texts</h3>
      <p className="px-1 text-xs text-stone-400">Simulated until a texting service is connected</p>
      {items.length === 0 ? (
        <p className="mt-2 px-1 text-sm text-stone-500">No texts yet for this Sunday.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((m, i) => (
            <li key={i} className={cn("flex flex-col", m.out ? "items-start" : "items-end")}>
              <span className="mb-1 text-[11px] text-stone-400">{m.out ? `To ${m.v.firstName}` : `${m.v.firstName} replied`} · {timeAgo(new Date(m.at).toISOString())}</span>
              <span className={cn("max-w-[92%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed", m.out ? "rounded-bl-md bg-stone-100 text-stone-700" : "rounded-br-md bg-forest-700 text-ink")}>{m.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Team roster ---------- */

function Roster({ teamId, sundays }: { teamId: string; sundays: string[] }) {
  const { schedule, toggleBlockout } = useStore();
  const [open, setOpen] = useState(false);
  const people = schedule.volunteers.filter((v) => v.teamId === teamId).sort((a, b) => a.firstName.localeCompare(b.firstName));
  const leader = staffById[teamById[teamId]?.leaderId];
  return (
    <section className="rounded-2xl bg-white ring-1 ring-stone-200/70">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span>
          <span className="block font-medium">Team roster · {people.length} people</span>
          <span className="text-xs text-stone-400">Who can serve where, how often, and which Sundays they&apos;re away{leader ? ` · led by ${leader.name}` : ""}</span>
        </span>
        <span className="text-sm text-forest-500">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="overflow-x-auto overflow-y-hidden border-t border-stone-100">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="text-xs text-stone-400">
                <th className="py-2.5 pl-5 pr-3 font-medium">Name</th>
                <th className="px-3 font-medium">Can do</th>
                <th className="px-3 font-medium">Usually</th>
                <th className="px-3 font-medium">How often</th>
                <th className="px-3 text-right font-medium">Next 6 Sundays</th>
                <th className="px-3 pr-5 font-medium">Away</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {people.map((v) => {
                const n = schedule.assignments.filter((a) => a.volunteerId === v.id && a.status !== "declined" && sundays.includes(a.date)).length;
                return (
                  <tr key={v.id}>
                    <td className="py-3 pl-5 pr-3">
                      <span className="block text-stone-900">{fullName(v)}</span>
                      <span className="text-xs text-stone-400">{v.phone}</span>
                    </td>
                    <td className="px-3 text-stone-600">{v.positions.join(", ")}</td>
                    <td className="px-3 text-stone-600">{v.service === "either" ? "Either" : v.service}</td>
                    <td className="px-3 text-stone-600">{v.frequency === "weekly" ? "Weekly" : v.frequency === "biweekly" ? "Every other week" : "Monthly"}</td>
                    <td className="px-3 text-right tabular-nums text-stone-900">{n}</td>
                    <td className="px-3 pr-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {v.blockouts.filter((d) => sundays.includes(d)).map((d) => (
                          <button key={d} onClick={() => toggleBlockout(v.id, d)} className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 hover:text-clay" aria-label={`Remove away date ${dayLabel(d)}`}>
                            {dayLabel(d, { month: "short", day: "numeric" })} <X className="size-3" />
                          </button>
                        ))}
                        <select
                          value=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            toggleBlockout(v.id, e.target.value);
                            toast(`${v.firstName} is marked away ${dayLabel(e.target.value)}`, { description: "They won't be suggested for that Sunday." });
                          }}
                          aria-label={`Mark ${v.firstName} away`}
                          className="h-7 rounded-full bg-transparent pl-2 pr-8 text-xs text-stone-500 ring-1 ring-stone-200"
                        >
                          <option value="">+ Away</option>
                          {sundays.filter((d) => !v.blockouts.includes(d)).map((d) => (
                            <option key={d} value={d}>{dayLabel(d)}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ---------- Pick someone for a spot ---------- */

function PickSheet({ spot, onClose }: { spot: Spot | null; onClose: () => void }) {
  const { schedule, assignVolunteer } = useStore();
  const [last, setLast] = useState<Spot | null>(spot);
  if (spot && spot !== last) setLast(spot);
  const s = spot ?? last;
  const list = s ? candidatesFor(schedule.volunteers, schedule.assignments, s) : [];
  const current = s && schedule.assignments.find((a) => a.date === s.date && a.service === s.service && a.teamId === s.teamId && a.position === s.position && a.slot === s.slot && a.status !== "declined");

  return (
    <Sheet open={!!spot} onOpenChange={(o) => !o && onClose()} side="right" title="Fill a spot">
      {s && (
        <div className="min-h-0 flex-1 overflow-y-auto p-5 pt-2 md:p-6 md:pt-2">
          <p className="text-sm text-stone-500">
            {s.position} · {s.service} AM · {dayLabel(s.date, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-forest-50 p-3 text-sm text-forest-300">
            <Sparkles className="size-4 shrink-0" /> Best fits first: people who prefer this service and haven&apos;t served lately.
          </p>
          <ul className="mt-4 space-y-2">
            {list.map(({ v, reason, recent }) => {
              const blocked = reason === "Away this Sunday" || reason === "Said they can't make it";
              const isCurrent = current && current.volunteerId === v.id;
              return (
                <li key={v.id}>
                  <button
                    disabled={blocked || !!isCurrent}
                    onClick={() => {
                      assignVolunteer(s, v.id);
                      toast(`${v.firstName} is scheduled`, { description: `A text went to ${v.phone} asking them to confirm.` });
                      onClose();
                    }}
                    className={cn("flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 transition", blocked || isCurrent ? "cursor-not-allowed bg-stone-50 opacity-50 ring-transparent" : "bg-white ring-stone-200 hover:ring-forest-500")}
                  >
                    <Avatar name={fullName(v)} className="size-9" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-900">{fullName(v)}{isCurrent ? " (scheduled)" : ""}</span>
                      <span className={cn("block truncate text-xs", reason ? "text-clay" : "text-stone-500")}>
                        {reason ?? `${recent ? `On ${recent} other Sunday${recent === 1 ? "" : "s"} within a month` : "Free within a month"} · usually ${v.service === "either" ? "either service" : v.service} · ${v.frequency === "weekly" ? "weekly" : v.frequency === "biweekly" ? "every other week" : "monthly"}`}
                      </span>
                    </span>
                    {!blocked && !isCurrent && <UserPlus className="size-4 shrink-0 text-forest-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {list.length === 0 && <p className="mt-4 text-sm text-stone-500">No one on this team does {s.position} yet.</p>}
        </div>
      )}
    </Sheet>
  );
}

function Stat({ icon: Icon, label, value, sub, warn }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70 md:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-stone-500">{label}</span>
        <Icon className={cn("size-4", warn ? "text-clay" : "text-stone-300")} />
      </div>
      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em]"><CountUp value={value} /></p>
      <p className="mt-2 truncate text-xs text-stone-400">{sub}</p>
    </div>
  );
}
