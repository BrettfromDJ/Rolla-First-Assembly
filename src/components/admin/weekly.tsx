"use client";

import { CountUp } from "@/components/church/motion";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Baby, Cake, CalendarClock, Droplets, HandHeart, Heart, ListChecks, Lock, PhoneCall, Sparkles, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { baptismDates, staffById } from "@/lib/data";
import { addDays, inPersonTotal, kidsTotal, lastDow, ymd } from "@/lib/attendance";
import { openSpots, scheduledTeams, upcomingSundays } from "@/lib/schedule";
import { prayerCategoryLabel } from "@/lib/prayer";
import { useStore } from "@/lib/store";
import type { Visitor } from "@/lib/types";
import { cn, greeting, timeAgo } from "@/lib/utils";
import { fullName, stageStyle } from "./helpers";

type Tab = "people" | "baptisms" | "attendance" | "prayer" | "volunteers" | "schedule";

const day = (d: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", opts);
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/** One screen for Monday morning: last Sunday, new people, prayer, baptisms, volunteers, and what needs doing this week. */
export function WeeklyView({ go, openVisitor }: { go: (t: Tab) => void; openVisitor: (id: string) => void }) {
  const { allVisitors, attendance, prayers, serve, schedule, households, hydrated } = useStore();

  const data = useMemo(() => {
    if (!hydrated) return null;
    const now = new Date();
    const today = ymd(now);
    const weekAgo = Date.now() - 7 * 864e5;

    /* ---- Attendance: the last 13 Sundays ---- */
    const sundays = Array.from({ length: 13 }, (_, i) => addDays(lastDow(0, now), -7 * (12 - i)));
    const weeks = sundays.map((d) => {
      const recs = attendance.filter((a) => a.date === d && a.service !== "wed");
      return {
        date: d,
        total: recs.reduce((n, r) => n + inPersonTotal(r.counts), 0),
        kids: recs.reduce((n, r) => n + kidsTotal(r.counts), 0),
        firstTime: recs.reduce((n, r) => n + (r.firstTime ?? 0), 0),
        online: recs.reduce((n, r) => n + (r.online ?? 0), 0),
        byService: Object.fromEntries(recs.map((r) => [r.service, inPersonTotal(r.counts)])) as Record<string, number>,
        complete: recs.length === 2,
        any: recs.length > 0,
        note: recs.find((r) => r.note)?.note,
      };
    });
    const last = weeks[weeks.length - 1];
    const prior = weeks.slice(-5, -1).filter((w) => w.complete);
    const avg4 = prior.length ? prior.reduce((n, w) => n + w.total, 0) / prior.length : 0;

    /* ---- People ---- */
    const newPeople = allVisitors.filter((v) => +new Date(v.firstVisit) >= weekAgo && +new Date(v.firstVisit) <= Date.now() + 7 * 864e5).sort((a, b) => +new Date(b.firstVisit) - +new Date(a.firstVisit));
    const tasks = allVisitors
      .flatMap((v) => v.tasks.filter((t) => !t.done && +new Date(t.dueDate) <= Date.now() + 7 * 864e5).map((t) => ({ v, t, overdue: +new Date(t.dueDate) < Date.now() })))
      .sort((a, b) => +new Date(a.t.dueDate) - +new Date(b.t.dueDate));
    const unassigned = allVisitors.filter((v) => v.status === "Needs follow-up" && !v.assigneeId);

    /* ---- Prayer ---- */
    const prayerNew = prayers.filter((p) => p.status === "new");
    const prayerCall = prayers.filter((p) => p.wantsContact && !p.contacted && p.status !== "archived");
    const prayerWall = prayers.filter((p) => p.visibility === "wall" && !p.wallApproved && p.status !== "archived");
    const answered = prayers.filter((p) => p.status === "answered" && p.update && +new Date(p.update.at) >= weekAgo);

    /* ---- Baptisms ---- */
    const nextBaptism = baptismDates(1)[0]?.date;
    const baptismKey = nextBaptism ? nextBaptism.toDateString() : "";
    const baptisms = allVisitors.filter((v) => v.baptism && new Date(v.baptism.date).toDateString() === baptismKey);

    /* ---- This coming Sunday ---- */
    const sunday = upcomingSundays(1, now)[0];
    const coverage = scheduledTeams.map((t) => ({ t, open: openSpots(schedule.assignments, sunday, t.id).length }));
    const cantMake = schedule.assignments.filter((a) => a.date === sunday && a.status === "declined").length;
    const waiting = schedule.assignments.filter((a) => a.date === sunday && a.status === "pending").length;
    const kidsComing = allVisitors.filter((v) => v.kids && v.kids.date.slice(0, 10) <= addDays(sunday, 1) && v.kids.date.slice(0, 10) >= today);
    const newVolunteers = serve.filter((s) => s.status === "new");
    const joined = serve.filter((s) => s.status === "serving" && +new Date(s.createdAt) >= Date.now() - 30 * 864e5);

    /* ---- Birthdays & anniversaries: the next 14 days ---- */
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcoming = (ymdStr: string) => {
      const [y, m, dd] = ymdStr.split("-").map(Number);
      let next = new Date(now.getFullYear(), m - 1, dd);
      if (next < midnight) next = new Date(now.getFullYear() + 1, m - 1, dd);
      const inDays = Math.round((+next - +midnight) / 864e5);
      return { inDays, years: next.getFullYear() - y, next };
    };
    const whenLabel = (inDays: number, next: Date) => (inDays === 0 ? "Today" : inDays === 1 ? "Tomorrow" : next.toLocaleDateString("en-US", inDays < 7 ? { weekday: "long" } : { weekday: "short", month: "short", day: "numeric" }));
    type Dated = { key: string; kind: "birthday" | "anniversary"; title: string; detail: string; inDays: number; when: string; openId: string };
    const dates: Dated[] = [];
    for (const v of allVisitors) {
      const family = households.find((h) => h.memberIds.includes(v.id))?.name;
      if (v.birthday) {
        const u = upcoming(v.birthday);
        if (u.inDays <= 14) dates.push({ key: `b-${v.id}`, kind: "birthday", title: fullName(v), detail: u.years % 10 === 0 ? `Turns ${u.years}` : "Birthday", inDays: u.inDays, when: whenLabel(u.inDays, u.next), openId: v.id });
      }
      const kids = [...(v.kids?.kids ?? [])];
      for (const k of kids) {
        const u = upcoming(k.birthdate);
        if (u.inDays <= 14) dates.push({ key: `k-${v.id}-${k.firstName}`, kind: "birthday", title: `${k.nickname || k.firstName} ${k.lastName}`, detail: `Turns ${u.years} · ${family ?? `${v.firstName}'s kid`}`, inDays: u.inDays, when: whenLabel(u.inDays, u.next), openId: v.id });
      }
    }
    for (const h of households) {
      if (!h.anniversary || h.memberIds.length < 2) continue;
      const u = upcoming(h.anniversary);
      const names = h.memberIds.map((id) => allVisitors.find((x) => x.id === id)).filter(Boolean) as Visitor[];
      if (u.inDays <= 14 && names.length) dates.push({ key: `a-${h.id}`, kind: "anniversary", title: `${names.map((x) => x.firstName).join(" & ")} ${names[0].lastName}`, detail: `${u.years} year${u.years === 1 ? "" : "s"} married`, inDays: u.inDays, when: whenLabel(u.inDays, u.next), openId: names[0].id });
    }
    dates.sort((a, b) => a.inDays - b.inDays || a.title.localeCompare(b.title));

    return { dates, weeks, last, avg4, newPeople, tasks, unassigned, prayerNew, prayerCall, prayerWall, answered, nextBaptism, baptisms, sunday, coverage, cantMake, waiting, kidsComing, newVolunteers, joined };
  }, [hydrated, allVisitors, attendance, prayers, serve, schedule, households]);

  if (!data) {
    return <div className="grid gap-4 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-stone-200/70" />)}</div>;
  }
  const d = data;
  const delta = d.last.complete && d.avg4 ? ((d.last.total - d.avg4) / d.avg4) * 100 : null;
  const openTotal = d.coverage.reduce((n, c) => n + c.open, 0);
  const todo = d.tasks.length + d.unassigned.length + d.prayerCall.length + d.prayerWall.length + d.newVolunteers.length;

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">Week of {day(d.last.date, { month: "long", day: "numeric" })}</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">{greeting()}, here&apos;s your week</h1>
        </div>
        <p className="text-sm text-stone-500">
          {todo ? (
            <>
              <span className="font-medium text-stone-900">{todo} things</span> need someone this week
            </>
          ) : (
            "Nothing waiting on anyone. Enjoy your Monday."
          )}
        </p>
      </div>

      {/* ---------- Last Sunday ---------- */}
      <button onClick={() => go("attendance")} className="group block w-full rounded-2xl bg-white p-5 text-left ring-1 ring-stone-200/70 transition hover:ring-stone-300 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr] lg:items-end">
          <div>
            <p className="text-sm text-stone-500">Last Sunday · {day(d.last.date, { weekday: "long", month: "long", day: "numeric" })}</p>
            {d.last.any ? (
              <>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-[56px] font-semibold leading-none tracking-[-0.03em]"><CountUp value={fmt(d.last.total)} duration={1400} /></p>
                  <p className="text-sm text-stone-500">in person</p>
                  {delta !== null && Math.abs(delta) >= 0.5 && (
                    <span className={cn("text-sm font-medium", delta >= 0 ? "text-sage" : "text-clay")}>
                      {delta >= 0 ? "+" : "−"}
                      {Math.abs(delta).toFixed(0)}% vs 4-week average
                    </span>
                  )}
                </div>
                {!d.last.complete && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-honey">
                    <AlertTriangle className="size-4" /> Partial: {["9:00", "10:30"].filter((s) => d.last.byService[s] === undefined).join(" & ")} count not entered yet
                  </p>
                )}
                <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
                  <Fig label="9:00" value={d.last.byService["9:00"]} />
                  <Fig label="10:30" value={d.last.byService["10:30"]} />
                  <Fig label="Kids & nursery" value={d.last.kids} />
                  <Fig label="Online views" value={d.last.online} />
                </dl>
              </>
            ) : (
              <p className="mt-3 text-[15px] text-honey">No attendance entered for last Sunday yet. Tap to add it.</p>
            )}
          </div>
          <Sparkline weeks={d.weeks} />
        </div>
      </button>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {/* ---------- New people ---------- */}
        <Card icon={UserPlus} title="New people" stat={`${d.last.firstTime || d.newPeople.length}`} statLabel={d.last.firstTime ? "first-time guests Sunday" : "new this week"} onMore={() => go("people")} more="All people">
          {d.newPeople.length ? (
            <ul className="divide-y divide-stone-100">
              {d.newPeople.slice(0, 5).map((v) => (
                <PersonRow key={v.id} v={v} onClick={() => openVisitor(v.id)} />
              ))}
            </ul>
          ) : (
            <Empty>No new visitors have filled out a card or planned a visit this week.</Empty>
          )}
        </Card>

        {/* ---------- Follow-ups due ---------- */}
        <Card icon={ListChecks} title="Follow-ups due" stat={String(d.tasks.length + d.unassigned.length)} statLabel={`${d.tasks.filter((t) => t.overdue).length} overdue`} warn={d.tasks.some((t) => t.overdue)} onMore={() => go("people")} more="Open the list">
          {d.tasks.length || d.unassigned.length ? (
            <ul className="divide-y divide-stone-100">
              {d.unassigned.slice(0, 2).map((v) => (
                <li key={`u${v.id}`}>
                  <button onClick={() => openVisitor(v.id)} className="flex w-full items-center gap-3 py-2.5 text-left text-sm">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-clay-soft text-clay"><UserPlus className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-stone-900">Assign someone to {fullName(v)}</span>
                      <span className="block text-xs text-stone-400">Needs follow-up · no one assigned</span>
                    </span>
                  </button>
                </li>
              ))}
              {d.tasks.slice(0, 5).map(({ v, t, overdue }) => (
                <li key={t.id}>
                  <button onClick={() => openVisitor(v.id)} className="flex w-full items-center gap-3 py-2.5 text-left text-sm">
                    {t.assigneeId && staffById[t.assigneeId] ? <Avatar name={staffById[t.assigneeId].name} src={staffById[t.assigneeId].photo} className="size-8" /> : <span className="size-8 shrink-0 rounded-full bg-stone-100" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-stone-900">{t.title}</span>
                      <span className={cn("block text-xs", overdue ? "text-clay" : "text-stone-400")}>
                        {overdue ? "Overdue · " : "Due "}{new Date(t.dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {fullName(v)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Every follow-up is done. Nice work, team.</Empty>
          )}
        </Card>

        {/* ---------- Prayer ---------- */}
        <Card icon={HandHeart} title="Prayer requests" stat={String(d.prayerNew.length)} statLabel="new" warn={d.prayerCall.length > 0} onMore={() => go("prayer")} more="Open prayer">
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {d.prayerCall.length > 0 && <Chip tone="warn" icon={PhoneCall}>{d.prayerCall.length} want a call</Chip>}
            {d.prayerWall.length > 0 && <Chip icon={AlertTriangle}>{d.prayerWall.length} waiting for wall approval</Chip>}
          </div>
          {d.prayerNew.length ? (
            <ul className="space-y-2">
              {d.prayerNew.slice(0, 3).map((p) => (
                <li key={p.id} className="rounded-xl bg-stone-50 p-3 text-sm">
                  <p className="flex items-center gap-1.5 text-xs text-stone-400">
                    {p.visibility === "pastors" && <Lock className="size-3 text-clay" />}
                    {p.anonymous || !p.name ? "Anonymous" : p.name} · {prayerCategoryLabel(p.category)} · {timeAgo(p.createdAt)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-stone-700">{p.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No new requests since they were last prayed over.</Empty>
          )}
        </Card>

        {/* ---------- Baptisms ---------- */}
        <Card
          icon={Droplets}
          title="Baptisms coming up"
          stat={String(d.baptisms.length)}
          statLabel={d.nextBaptism ? `on ${d.nextBaptism.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "scheduled"}
          warn={d.baptisms.some((v) => !v.baptism!.pastorContacted)}
          onMore={() => go("baptisms")}
          more="Open baptisms"
        >
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {d.baptisms.filter((v) => !v.baptism!.pastorContacted).length > 0 && <Chip tone="warn" icon={PhoneCall}>{d.baptisms.filter((v) => !v.baptism!.pastorContacted).length} still need a pastor call</Chip>}
            {d.baptisms.filter((v) => v.baptism!.okToShare && v.baptism!.story).length > 0 && <Chip icon={Sparkles}>{d.baptisms.filter((v) => v.baptism!.okToShare && v.baptism!.story).length} stories to share</Chip>}
          </div>
          {d.baptisms.length ? (
            <ul className="flex flex-wrap gap-2">
              {d.baptisms.map((v) => (
                <li key={v.id}>
                  <button onClick={() => openVisitor(v.id)} className="inline-flex items-center gap-2 rounded-full bg-stone-50 py-1 pl-1 pr-3 text-sm ring-1 ring-stone-200 hover:ring-stone-300">
                    <Avatar name={`${v.baptism!.firstName} ${v.baptism!.lastName}`} src={v.baptism!.age === "adult" ? v.photo : undefined} className="size-7 text-[11px]" />
                    {v.baptism!.firstName} {v.baptism!.lastName}
                    <span className="text-xs text-stone-400">{v.baptism!.service}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No one registered for the next baptism yet.</Empty>
          )}
        </Card>

        {/* ---------- This Sunday's teams ---------- */}
        <Card icon={CalendarClock} title={`Volunteers for ${day(d.sunday)}`} stat={String(openTotal)} statLabel="open spots" warn={openTotal > 0} onMore={() => go("schedule")} more="Open schedule">
          <ul className="space-y-2.5">
            {d.coverage.map(({ t, open }) => (
              <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-stone-700">{t.name}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs", open ? "bg-clay-soft text-clay" : "bg-sage-soft text-sage")}>{open ? `${open} open` : "Fully staffed"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-stone-400">
            {d.cantMake} can&apos;t make it · {d.waiting} haven&apos;t confirmed
            {d.newVolunteers.length ? ` · ${d.newVolunteers.length} new volunteer sign-up${d.newVolunteers.length === 1 ? "" : "s"}` : ""}
          </p>
        </Card>

        {/* ---------- Birthdays & anniversaries ---------- */}
        <Card icon={Cake} title="Birthdays & anniversaries" stat={String(d.dates.length)} statLabel="in the next two weeks" onMore={() => go("people")} more="Open People">
          {d.dates.length ? (
            <ul className="divide-y divide-stone-100">
              {d.dates.slice(0, 7).map((x) => (
                <li key={x.key}>
                  <button onClick={() => openVisitor(x.openId)} className="flex w-full items-center gap-3 py-2.5 text-left text-sm">
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", x.kind === "anniversary" ? "bg-clay/10 text-clay" : "bg-honey-soft text-honey")}>
                      {x.kind === "anniversary" ? <Heart className="size-4" /> : <Cake className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-stone-800">{x.title}</span>
                      <span className="block truncate text-xs text-stone-500">{x.detail}</span>
                    </span>
                    <span className={cn("shrink-0 text-xs", x.inDays === 0 ? "font-medium text-forest-500" : "text-stone-400")}>{x.when}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No birthdays or anniversaries in the next two weeks.</Empty>
          )}
        </Card>

        {/* ---------- Kids & celebrate ---------- */}
        <Card icon={Heart} title="Celebrate" stat={String(d.answered.length + d.joined.length)} statLabel="wins this week" onMore={() => go("prayer")} more="Answered prayers" className="lg:col-span-2 2xl:col-span-3">
          <ul className="grid gap-2.5 text-sm lg:grid-cols-2">
            {d.answered.slice(0, 2).map((p) => (
              <li key={p.id} className="rounded-xl bg-sage-soft/60 p-3">
                <p className="text-xs text-sage">Answered prayer · {p.anonymous || !p.name ? "Anonymous" : p.name.split(" ")[0]}</p>
                <p className="mt-1 line-clamp-2 text-stone-700">{p.update!.body}</p>
              </li>
            ))}
            {d.joined.length > 0 && (
              <li className="flex items-center gap-2 text-stone-700">
                <Users className="size-4 text-forest-500" /> {d.joined.length} {d.joined.length === 1 ? "person" : "people"} joined a serve team this month
              </li>
            )}
            {d.kidsComing.length > 0 && (
              <li className="flex items-center gap-2 text-stone-700">
                <Baby className="size-4 text-forest-500" /> {d.kidsComing.reduce((n, v) => n + v.kids!.kids.length, 0)} kids pre-registered for this Sunday
              </li>
            )}
            {!d.answered.length && !d.joined.length && !d.kidsComing.length && <Empty>Nothing yet. It&apos;s only Monday.</Empty>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Pieces ---------- */

function Card({ icon: Icon, title, stat, statLabel, warn, onMore, more, className, children }: { icon: React.ComponentType<{ className?: string }>; title: string; stat: string; statLabel: string; warn?: boolean; onMore: () => void; more: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("flex flex-col rounded-2xl bg-white p-5 ring-1 ring-stone-200/70", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-medium text-stone-500">
            <Icon className={cn("size-4", warn ? "text-clay" : "text-forest-500")} /> {title}
          </h2>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-[32px] font-semibold leading-none tracking-[-0.02em]"><CountUp value={stat} /></span>
            <span className="text-sm text-stone-500">{statLabel}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 flex-1">{children}</div>
      <button onClick={onMore} className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm text-forest-500 hover:underline">
        {more} <ArrowRight className="size-3.5" />
      </button>
    </section>
  );
}

function PersonRow({ v, onClick }: { v: Visitor; onClick: () => void }) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-center gap-3 py-2.5 text-left text-sm">
        <Avatar name={fullName(v)} src={v.photo} className={cn("size-8", v.isYou && "bg-forest-700 text-ink")} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-stone-900">{fullName(v)}</span>
          <span className="block truncate text-xs text-stone-400">
            {v.source} · {v.assigneeId ? `with ${staffById[v.assigneeId]?.name.split(" ")[0]}` : "not assigned"}
          </span>
        </span>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px]", stageStyle[v.stage].pill)}>{v.stage}</span>
      </button>
    </li>
  );
}

function Fig({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <dt className="text-xs text-stone-400">{label}</dt>
      <dd className="mt-0.5 text-lg font-medium tabular-nums text-stone-900">{value === undefined ? "–" : fmt(value)}</dd>
    </div>
  );
}

function Chip({ children, icon: Icon, tone }: { children: React.ReactNode; icon: React.ComponentType<{ className?: string }>; tone?: "warn" }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", tone === "warn" ? "bg-clay-soft text-clay" : "bg-stone-100 text-stone-600")}>
      <Icon className="size-3.5" /> {children}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-stone-500">{children}</p>;
}

/** Twelve weeks of Sunday totals: the trend in a quiet ink, last Sunday in blue. */
function Sparkline({ weeks }: { weeks: { date: string; total: number; complete: boolean }[] }) {
  const pts = weeks.filter((w) => w.complete);
  if (pts.length < 3) return null;
  const W = 100, H = 40;
  const max = Math.max(...pts.map((p) => p.total)), min = Math.min(...pts.map((p) => p.total));
  const x = (i: number) => (i / (weeks.length - 1)) * W;
  const y = (v: number) => H - 4 - ((v - min) / Math.max(1, max - min)) * (H - 8);
  const line = weeks
    .map((w, i) => (w.complete ? `${x(i).toFixed(2)},${y(w.total).toFixed(2)}` : null))
    .reduce<string[]>((segs, p, i) => {
      if (!p) return segs;
      if (i === 0 || !weeks[i - 1].complete) segs.push(`M${p}`);
      else segs[segs.length - 1] += ` L${p}`;
      return segs;
    }, [])
    .join(" ");
  const lastIdx = weeks.map((w) => w.complete).lastIndexOf(true);
  const lastPt = weeks[lastIdx];
  return (
    <div>
      <div className="relative h-24 w-full">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label={`Sunday attendance for the last ${weeks.length} weeks, from ${fmt(pts[0].total)} to ${fmt(pts[pts.length - 1].total)}`}>
          <path d={line} pathLength={1} className="m-draw" fill="none" stroke="#77736c" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <span
          className="m-fade-late absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3987e5] ring-2 ring-white"
          style={{ left: `${(x(lastIdx) / W) * 100}%`, top: `${(y(lastPt.total) / H) * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-stone-400">
        <span>{day(weeks[0].date)}</span>
        <span>12 weeks of Sundays</span>
        <span>{day(lastPt.date)}</span>
      </div>
    </div>
  );
}
