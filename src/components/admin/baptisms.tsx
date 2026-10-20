"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, Check, Download, Droplets, MessageSquareQuote, PhoneCall, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { baptism as baptismInfo, baptismDates, staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { BaptismRegistration, ServiceTime, Visitor } from "@/lib/types";
import { cn, formatDate, formatShortDay, timeAgo } from "@/lib/utils";

type Row = { v: Visitor; b: BaptismRegistration };
type Flag = "classAttended" | "pastorContacted" | "baptized";

const ageLabel = { adult: "Adult", student: "Student", child: "Child" } as const;
const dayKey = (iso: string) => new Date(iso).toDateString();

/** Staff view of every baptism registration, grouped by Sunday and service. */
export function BaptismsView({ query, onOpen }: { query: string; onOpen: (visitorId: string) => void }) {
  const { allVisitors, patchBaptism, hydrated } = useStore();
  const upcoming = useMemo(() => (hydrated ? baptismDates(3) : []), [hydrated]);

  const rows: Row[] = useMemo(
    () => allVisitors.filter((v) => v.baptism).map((v) => ({ v, b: v.baptism! })).sort((a, b) => +new Date(a.b.date) - +new Date(b.b.date)),
    [allVisitors],
  );

  // Every Sunday that has registrations, plus the next scheduled one even if it's empty.
  const sundays = useMemo(() => {
    const keys = new Map<string, Date>();
    for (const d of upcoming.slice(0, 2)) keys.set(d.date.toDateString(), d.date);
    for (const r of rows) keys.set(dayKey(r.b.date), new Date(r.b.date));
    return [...keys.values()].sort((a, b) => +a - +b);
  }, [rows, upcoming]);

  const [picked, setPicked] = useState<string | "all" | null>(null);
  const active = picked ?? (sundays[0] ? sundays[0].toDateString() : "all");

  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      (active === "all" || dayKey(r.b.date) === active) &&
      (!q || `${r.b.firstName} ${r.b.lastName} ${r.b.parentName ?? ""} ${r.v.firstName} ${r.v.lastName}`.toLowerCase().includes(q)),
  );

  const totals = {
    people: visible.length,
    seats: visible.reduce((n, r) => n + r.b.guests, 0),
    classPending: visible.filter((r) => !r.b.classAttended).length,
    toContact: visible.filter((r) => !r.b.pastorContacted).length,
    stories: visible.filter((r) => r.b.okToShare && r.b.story).length,
  };
  const classDay = active !== "all" ? upcoming.find((d) => d.date.toDateString() === active)?.classDate ?? rows.find((r) => dayKey(r.b.date) === active && r.b.classDate)?.b.classDate : undefined;

  const toggle = (r: Row, flag: Flag) => {
    const on = !r.b[flag];
    const who = r.b.firstName;
    const label = {
      classAttended: on ? `${who} attended the Baptism Class` : `Class attendance cleared for ${who}`,
      pastorContacted: on ? `Pastor reached out to ${who} about baptism` : `Baptism follow-up reopened for ${who}`,
      baptized: on ? `${who} was baptized` : `Baptism unmarked for ${who}`,
    }[flag];
    patchBaptism(r.v.id, { [flag]: on }, label);
    if (on && flag === "baptized") toast(`${who} was baptized`, { description: "Celebrate! Logged on their timeline." });
  };

  const exportCsv = () => {
    const head = ["Sunday", "Service", "Name", "Age group", "Parent/guardian", "Contact", "Guests", "Class", "Class attended", "Pastor contacted", "Baptized", "OK to share story", "Story"];
    const lines = visible.map(({ b }) => [
      new Date(b.date).toLocaleDateString("en-US"), b.service, `${b.firstName} ${b.lastName}`, ageLabel[b.age], b.parentName ?? "", b.contact, b.guests,
      new Date(b.classDate).toLocaleDateString("en-US"), b.classAttended ? "Yes" : "No", b.pastorContacted ? "Yes" : "No", b.baptized ? "Yes" : "No", b.okToShare ? "Yes" : "No", b.story ?? "",
    ]);
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `baptisms-${active === "all" ? "all" : new Date(active).toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Spreadsheet downloaded", { description: `${visible.length} registration${visible.length === 1 ? "" : "s"}` });
  };

  const services: ServiceTime[] = ["9:00", "10:30"];
  const stories = visible.filter((r) => r.b.okToShare && r.b.story);

  return (
    <div className="space-y-6">
      {/* Sunday picker */}
      <div className="flex flex-wrap items-center gap-2">
        {sundays.map((d) => {
          const key = d.toDateString();
          const n = rows.filter((r) => dayKey(r.b.date) === key).length;
          return (
            <button
              key={key}
              onClick={() => setPicked(key)}
              aria-pressed={active === key}
              className={cn("flex h-10 items-center gap-2 rounded-full px-4 text-sm ring-1 transition", active === key ? "bg-forest-700 font-medium text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}
            >
              {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active === key ? "bg-ink/15" : "bg-stone-100 text-stone-500")}>{n}</span>
            </button>
          );
        })}
        <button
          onClick={() => setPicked("all")}
          aria-pressed={active === "all"}
          className={cn("flex h-10 items-center rounded-full px-4 text-sm ring-1 transition", active === "all" ? "bg-forest-700 font-medium text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}
        >
          All registrations
        </button>
        <button onClick={exportCsv} disabled={!visible.length} className="ml-auto flex h-10 items-center gap-2 rounded-full px-4 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300 disabled:opacity-40">
          <Download className="size-4" /> Download list
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat icon={Droplets} label="Being baptized" value={totals.people} sub={active === "all" ? "All dates" : formatShortDay(new Date(active).toISOString())} />
        <Stat icon={Users} label="Seats to save" value={totals.seats} sub="Friends & family" />
        <Stat icon={BookOpenCheck} label="Class not yet attended" value={totals.classPending} sub={classDay ? `Class ${formatShortDay(new Date(classDay).toISOString())} · ${baptismInfo.classTime}` : "Sunday before at noon"} warn={totals.classPending > 0} />
        <Stat icon={PhoneCall} label="Need a pastor call" value={totals.toContact} sub="Not yet contacted" warn={totals.toContact > 0} />
        <Stat icon={MessageSquareQuote} label="Stories to share" value={totals.stories} sub="Said yes to sharing" className="col-span-2 md:col-span-1" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1fr_340px]">
        {/* Roster */}
        <section className="min-w-0 space-y-6" aria-label="Baptism registrations">
          {!hydrated ? (
            <div className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-stone-200/70">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-stone-100" />)}</div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-stone-200/70">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400"><Droplets className="size-5" /></span>
              <p className="mt-4 font-medium">{q ? "No one matches that search" : "No registrations for this Sunday yet"}</p>
              <p className="mt-1 text-sm text-stone-500">New sign-ups from the Baptism page show up here right away.</p>
            </div>
          ) : (
            (active === "all" ? sundays.filter((d) => visible.some((r) => dayKey(r.b.date) === d.toDateString())) : [new Date(active)]).map((d) =>
              services.map((svc) => {
                const group = visible.filter((r) => dayKey(r.b.date) === d.toDateString() && r.b.service === svc);
                if (!group.length) return null;
                return (
                  <div key={`${d.toDateString()}-${svc}`} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200/70">
                    <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5">
                      <h3 className="font-medium">
                        {active === "all" && <span className="text-stone-500">{formatShortDay(d.toISOString())} · </span>}
                        {svc} AM service
                      </h3>
                      <span className="text-xs text-stone-400">
                        {group.length} being baptized · {group.reduce((n, r) => n + r.b.guests, 0)} guests
                      </span>
                    </div>

                    {/* Desktop table */}
                    <table className="hidden w-full text-left text-sm md:table">
                      <thead>
                        <tr className="text-xs text-stone-400">
                          <th className="py-2.5 pl-5 pr-3 font-medium">Name</th>
                          <th className="px-3 font-medium">Guests</th>
                          <th className="px-3 font-medium">Story</th>
                          <th className="px-3 text-center font-medium">Class</th>
                          <th className="px-3 text-center font-medium">Pastor call</th>
                          <th className="px-3 pr-5 text-center font-medium">Baptized</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {group.map((r) => (
                          <tr key={r.v.id} className={cn("transition hover:bg-stone-50", r.v.isYou && "bg-honey-soft/30")}>
                            <td className="py-3 pl-5 pr-3">
                              <button onClick={() => onOpen(r.v.id)} className="flex items-center gap-3 text-left">
                                <Avatar name={`${r.b.firstName} ${r.b.lastName}`} src={r.b.age === "adult" ? r.v.photo : undefined} className={cn(r.v.isYou && "bg-forest-700 text-ink")} />
                                <span className="min-w-0">
                                  <span className="flex items-center gap-2 font-medium text-stone-900">
                                    {r.b.firstName} {r.b.lastName}
                                    {r.b.age !== "adult" && <AgeTag age={r.b.age} />}
                                    {r.v.isYou && <span className="rounded-full bg-honey-soft px-1.5 py-0.5 text-[10px] font-semibold text-honey">YOU</span>}
                                  </span>
                                  <span className="block truncate text-xs text-stone-400">
                                    {r.b.age === "child" ? `Parent: ${r.b.parentName}` : r.b.age === "student" ? `Parent: ${r.v.firstName} ${r.v.lastName}` : r.b.contact} · registered {timeAgo(r.b.createdAt)}
                                  </span>
                                </span>
                              </button>
                            </td>
                            <td className="px-3 tabular-nums text-stone-600">{r.b.guests}</td>
                            <td className="px-3">
                              {r.b.story ? (
                                <span title={r.b.story} className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs", r.b.okToShare ? "bg-forest-100 text-forest-300" : "bg-stone-100 text-stone-500")}>
                                  <MessageSquareQuote className="size-3.5" /> {r.b.okToShare ? "OK to share" : "Private"}
                                </span>
                              ) : (
                                <span className="text-xs text-stone-300">—</span>
                              )}
                            </td>
                            <td className="px-3 text-center"><Toggle on={!!r.b.classAttended} onClick={() => toggle(r, "classAttended")} label={`Class attended: ${r.b.firstName}`} /></td>
                            <td className="px-3 text-center"><Toggle on={!!r.b.pastorContacted} onClick={() => toggle(r, "pastorContacted")} label={`Pastor contacted: ${r.b.firstName}`} /></td>
                            <td className="px-3 pr-5 text-center"><Toggle on={!!r.b.baptized} onClick={() => toggle(r, "baptized")} label={`Baptized: ${r.b.firstName}`} strong /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile list */}
                    <ul className="divide-y divide-stone-100 md:hidden">
                      {group.map((r) => (
                        <li key={r.v.id} className="space-y-3 p-4">
                          <button onClick={() => onOpen(r.v.id)} className="flex w-full items-center gap-3 text-left">
                            <Avatar name={`${r.b.firstName} ${r.b.lastName}`} src={r.b.age === "adult" ? r.v.photo : undefined} />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2 font-medium">{r.b.firstName} {r.b.lastName} {r.b.age !== "adult" && <AgeTag age={r.b.age} />}</span>
                              <span className="block text-xs text-stone-400">{r.b.guests} guests{r.b.story ? ` · story ${r.b.okToShare ? "OK to share" : "private"}` : ""}</span>
                            </span>
                          </button>
                          <div className="flex flex-wrap gap-2">
                            <Chip on={!!r.b.classAttended} onClick={() => toggle(r, "classAttended")}>Class</Chip>
                            <Chip on={!!r.b.pastorContacted} onClick={() => toggle(r, "pastorContacted")}>Pastor call</Chip>
                            <Chip on={!!r.b.baptized} onClick={() => toggle(r, "baptized")}>Baptized</Chip>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }),
            )
          )}
        </section>

        {/* Side: stories + day-of */}
        <aside className="space-y-6 2xl:self-start">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70">
            <h3 className="px-1 font-medium">Stories to share</h3>
            <p className="px-1 text-xs text-stone-400">They said yes. Always confirm with them before the service.</p>
            {stories.length ? (
              <ul className="mt-3 space-y-2">
                {stories.map((r) => (
                  <li key={r.v.id}>
                    <button onClick={() => onOpen(r.v.id)} className="w-full rounded-xl bg-stone-50 p-3 text-left text-sm transition hover:bg-stone-100">
                      <p className="text-stone-800">&ldquo;{r.b.story}&rdquo;</p>
                      <p className="mt-1.5 text-xs text-stone-400">{r.b.firstName} {r.b.lastName} · {formatDate(r.b.date)}, {r.b.service}</p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-stone-200 p-4 text-sm text-stone-400">No shareable stories for this Sunday yet.</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70">
            <h3 className="px-1 font-medium">Day-of checklist</h3>
            <ul className="mt-3 space-y-2 px-1 text-sm text-stone-600">
              <li className="flex justify-between"><span>Baptism shirts</span><span className="tabular-nums text-stone-900">{totals.people}</span></li>
              <li className="flex justify-between"><span>Towels (with spares)</span><span className="tabular-nums text-stone-900">{totals.people ? totals.people + 2 : 0}</span></li>
              <li className="flex justify-between"><span>Reserved seats up front</span><span className="tabular-nums text-stone-900">{totals.seats}</span></li>
              <li className="flex justify-between"><span>Kids (Pastor Micah)</span><span className="tabular-nums text-stone-900">{visible.filter((r) => r.b.age === "child").length}</span></li>
            </ul>
            <div className="mt-4 flex items-center gap-3 border-t border-stone-100 px-1 pt-4">
              <Avatar name={staffById[baptismInfo.hostId].name} src={staffById[baptismInfo.hostId].photo} className="size-8" />
              <p className="text-xs text-stone-500">{staffById[baptismInfo.hostId].name} leads the class · {baptismInfo.classLocation}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, warn, className }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; sub: string; warn?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-white p-4 ring-1 ring-stone-200/70 md:p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-stone-500">{label}</span>
        <Icon className={cn("size-4", warn ? "text-clay" : "text-stone-300")} />
      </div>
      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{value}</p>
      <p className="mt-2 truncate text-xs text-stone-400">{sub}</p>
    </div>
  );
}

function Toggle({ on, onClick, label, strong }: { on: boolean; onClick: () => void; label: string; strong?: boolean }) {
  return (
    <button
      onClick={onClick}
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full ring-1 transition",
        on ? (strong ? "bg-forest-700 text-ink ring-forest-700" : "bg-forest-100 text-forest-300 ring-forest-700/40") : "text-transparent ring-stone-300 hover:ring-forest-500",
      )}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </button>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} role="checkbox" aria-checked={on} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs ring-1 transition", on ? "bg-forest-100 text-forest-300 ring-forest-700/40" : "text-stone-500 ring-stone-200")}>
      {on && <Check className="size-3" strokeWidth={3} />} {children}
    </button>
  );
}

function AgeTag({ age }: { age: "student" | "child" }) {
  return <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", age === "child" ? "bg-clay-soft text-clay" : "bg-sky-soft text-sky")}>{ageLabel[age]}</span>;
}
