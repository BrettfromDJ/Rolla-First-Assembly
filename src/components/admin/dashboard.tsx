"use client";

import { CountUp } from "@/components/church/motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Inbox,
  LayoutGrid,
  ListChecks,
  Search,
  Sparkles,
  UserRoundPlus,
  Users,
  X,
  FlaskConical,
  Droplets,
  Baby,
  BarChart3,
  HandHeart,
  UsersRound,
  CalendarRange,
  Sun,
  CalendarPlus,
  BadgeCheck,
  Download,
  HeartPulse,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { VisitorPanel } from "./visitor-panel";
import { BaptismsView } from "./baptisms";
import { PersonTag } from "./visitor-panel";
import { downloadKidsRoster, groupOf, hasKids, inGroup, type KidsGroup } from "./kids-roster";
import { AttendanceView } from "./attendance";
import { PrayerView } from "./prayer";
import { VolunteersView } from "./volunteers";
import { ScheduleView } from "./schedule";
import { WeeklyView } from "./weekly";
import { EventsView } from "./events";
import { interests as interestList, interestShort, kidsGroups, staffById, welcomeTeam } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { InterestId, Stage, Visitor } from "@/lib/types";
import { cn, formatDate, formatShortDay, greeting, relativeDay } from "@/lib/utils";
import { ACTING_AS, fullName, isMember, isRecent, needsAttention, nextAction, rsvpInfo, stageStyle, stages } from "./helpers";

type Tab = "week" | "people" | "baptisms" | "attendance" | "prayer" | "volunteers" | "schedule" | "events";
type View = "all" | "attention" | "mine" | "new" | "planning" | "requests" | "rsvps";
type Who = "all" | "guests" | "members";

const whoLabel: Record<Who, string> = { all: "Everyone", guests: "Guests", members: "Members" };

export function Dashboard() {
  const store = useStore();
  const { allVisitors, hydrated } = store;
  const [view, setView] = useState<View>("all");
  const [who, setWho] = useState<Who>("all");
  const [family, setFamily] = useState<KidsGroup | "kids" | "">("");
  const [tab, setTabState] = useState<Tab>("week");
  const setTab = (t: Tab) => {
    setTabState(t);
    history.replaceState(null, "", t === "week" ? location.pathname : `#${t}`);
  };
  useEffect(() => {
    const h = location.hash.slice(1);
    if (h === "visitors" || h === "members") setTabState("people");
    if (h === "people" || h === "baptisms" || h === "attendance" || h === "prayer" || h === "volunteers" || h === "schedule" || h === "events") setTabState(h);
  }, []);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage | "">("");
  const [interest, setInterest] = useState<InterestId | "">("");
  const [assignee, setAssignee] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = allVisitors.find((v) => v.id === selectedId) ?? null;

  const metrics = useMemo(() => {
    const now = Date.now();
    const guests = allVisitors.filter((v) => !isMember(v));
    const rs = guests.flatMap((v) => v.rsvps.map((r) => ({ v, ...rsvpInfo(r) })));
    return {
      new: guests.filter((v) => isRecent(v.firstVisit) && !(v.stage === "Planning a visit")).length,
      planning: guests.filter((v) => v.stage === "Planning a visit" || (v.visitPlan && new Date(v.visitPlan.date).getTime() > now)).length,
      requests: rs.filter((r) => r.kind === "join" || r.kind === "question").length,
      upcoming: rs.filter((r) => r.date && new Date(r.date).getTime() > now).length,
      attention: allVisitors.filter(needsAttention).length,
    };
  }, [allVisitors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return allVisitors.filter((v) => {
      if (who === "guests" && isMember(v)) return false;
      if (who === "members" && !isMember(v)) return false;
      if (family === "kids" ? !hasKids(v) : family && !inGroup(v, family)) return false;
      if (["new", "planning", "requests", "rsvps"].includes(view) && isMember(v)) return false;
      if (view === "attention" && !needsAttention(v)) return false;
      if (view === "mine" && v.assigneeId !== ACTING_AS) return false;
      if (view === "new" && !(isRecent(v.firstVisit) && v.stage !== "Planning a visit")) return false;
      if (view === "planning" && !(v.stage === "Planning a visit" || (v.visitPlan && new Date(v.visitPlan.date).getTime() > now))) return false;
      if (view === "requests" && !v.rsvps.some((r) => ["join", "question"].includes(rsvpInfo(r).kind))) return false;
      if (view === "rsvps" && !v.rsvps.some((r) => { const d = rsvpInfo(r).date; return d && new Date(d).getTime() > now; })) return false;
      if (stage && (v.stage !== stage || isMember(v))) return false;
      if (interest && !v.interests.includes(interest)) return false;
      if (assignee === "none" ? v.assigneeId : assignee && v.assigneeId !== assignee) return false;
      if (q && !searchText(v).includes(q)) return false;
      return true;
    });
  }, [allVisitors, view, who, family, query, stage, interest, assignee]);

  const stageCounts = useMemo(() => stages.map((s) => ({ s, n: allVisitors.filter((v) => v.stage === s && !isMember(v)).length })), [allVisitors]);
  const memberStats = useMemo(() => {
    const members = allVisitors.filter(isMember);
    const kids = members.flatMap((v) => [...(v.kids?.kids ?? []), ...(v.students?.students ?? [])]);
    return { families: members.filter(hasKids).length, kids: kids.length, medical: kids.filter((k) => k.medicalNotes).length };
  }, [allVisitors]);
  const counts = useMemo(() => {
    const members = allVisitors.filter(isMember);
    const kids = allVisitors.flatMap((v) => v.kids?.kids ?? []);
    return {
      all: allVisitors.length,
      guests: allVisitors.length - members.length,
      members: members.length,
      families: allVisitors.filter(hasKids).length,
      group: (g: KidsGroup) => (g === "students" ? allVisitors.reduce((n, v) => n + (v.students?.students.length ?? 0), 0) : kids.filter((k) => groupOf(k) === g).length),
    };
  }, [allVisitors]);
  const myTasks = useMemo(
    () =>
      allVisitors
        .flatMap((v) => v.tasks.filter((t) => !t.done && t.assigneeId === ACTING_AS).map((t) => ({ t, v })))
        .sort((a, b) => +new Date(a.t.dueDate) - +new Date(b.t.dueDate)),
    [allVisitors],
  );

  const hasFilters = !!(query || stage || interest || assignee || family || view !== "all");
  const clear = () => { setQuery(""); setStage(""); setInterest(""); setAssignee(""); setFamily(""); setView("all"); };
  /** Jump to the People tab with one sidebar shortcut applied. */
  const goPeople = (next: { who?: Who; view?: View; family?: KidsGroup | "kids" | ""; stage?: Stage | "" }) => {
    setWho(next.who ?? "all");
    setView(next.view ?? "all");
    setFamily(next.family ?? "");
    setStage(next.stage ?? "");
    setTab("people");
  };
  const me = staffById[ACTING_AS];

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-900 lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-stone-200/70 bg-white px-4 py-5 lg:flex">
        <div className="px-2">
          <Logo />
          <p className="mt-2 text-xs text-stone-400">Welcome Team</p>
        </div>
        <nav className="mt-8 space-y-0.5" aria-label="Views">
          <button
            onClick={() => setTab("week")}
            className={cn("mb-4 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition", tab === "week" ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-50")}
          >
            <Sun className="size-4 text-stone-400" />
            <span className="flex-1 text-left">This week</span>
          </button>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">People</p>
          {([
            { label: "Everyone", icon: Users, n: counts.all, on: who === "all" && view === "all" && !family && !stage, go: {} },
            { label: "Guests", icon: UserRound, n: counts.guests, on: who === "guests" && view === "all" && !family && !stage, go: { who: "guests" } },
            { label: "Members", icon: BadgeCheck, n: counts.members, on: who === "members" && view === "all" && !family, go: { who: "members" } },
            { label: "Families with kids", icon: Baby, n: counts.families, on: family === "kids" && who === "all" && view === "all", go: { family: "kids" } },
            { label: "Needs attention", icon: AlertCircle, n: metrics.attention, on: view === "attention" && who === "all", go: { view: "attention" } },
            { label: "Assigned to me", icon: ListChecks, n: allVisitors.filter((v) => v.assigneeId === ACTING_AS).length, on: view === "mine" && who === "all", go: { view: "mine" } },
          ] as const).map((x) => (
            <button
              key={x.label}
              onClick={() => goPeople(x.go)}
              className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition", tab === "people" && x.on ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-50")}
            >
              <x.icon className="size-4 text-stone-400" />
              <span className="flex-1 text-left">{x.label}</span>
              <span className="text-xs tabular-nums text-stone-400">{hydrated ? x.n : "–"}</span>
            </button>
          ))}
          <p className="px-3 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">Guest journey</p>
          {stageCounts.map(({ s, n }) => (
            <button
              key={s}
              onClick={() => (tab === "people" && stage === s ? setStage("") : goPeople({ who: "guests", stage: s }))}
              className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition", tab === "people" && stage === s ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-50")}
            >
              <span className={cn("size-2 rounded-full", stageStyle[s].dot)} />
              <span className="flex-1 text-left">{s}</span>
              <span className="text-xs tabular-nums text-stone-400">{hydrated ? n : "–"}</span>
            </button>
          ))}
          <p className="px-3 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">Ministry</p>
          <button
            onClick={() => setTab("attendance")}
            className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition", tab === "attendance" ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-50")}
          >
            <BarChart3 className="size-4 text-stone-400" />
            <span className="flex-1 text-left">Attendance</span>
          </button>
          <button
            onClick={() => setTab("prayer")}
            className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition", tab === "prayer" ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-50")}
          >
            <HandHeart className="size-4 text-stone-400" />
            <span className="flex-1 text-left">Prayer requests</span>
            {hydrated && store.prayers.some((p) => p.status === "new") && (
              <span className="rounded-full bg-forest-700 px-1.5 text-xs font-medium tabular-nums text-ink">{store.prayers.filter((p) => p.status === "new").length}</span>
            )}
          </button>
          <button
            onClick={() => setTab("volunteers")}
            className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition", tab === "volunteers" ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-50")}
          >
            <UsersRound className="size-4 text-stone-400" />
            <span className="flex-1 text-left">Volunteers</span>
            {hydrated && store.serve.some((v) => v.status === "new") && (
              <span className="rounded-full bg-forest-700 px-1.5 text-xs font-medium tabular-nums text-ink">{store.serve.filter((v) => v.status === "new").length}</span>
            )}
          </button>
          <button
            onClick={() => setTab("schedule")}
            className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition", tab === "schedule" ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-50")}
          >
            <CalendarRange className="size-4 text-stone-400" />
            <span className="flex-1 text-left">Schedule</span>
          </button>
          <button
            onClick={() => setTab("events")}
            className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition", tab === "events" ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-50")}
          >
            <CalendarPlus className="size-4 text-stone-400" />
            <span className="flex-1 text-left">Events</span>
          </button>
          <button
            onClick={() => setTab("baptisms")}
            className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition", tab === "baptisms" ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-50")}
          >
            <Droplets className="size-4 text-stone-400" />
            <span className="flex-1 text-left">Baptisms</span>
            <span className="text-xs tabular-nums text-stone-400">{hydrated ? allVisitors.filter((v) => v.baptism).length : "–"}</span>
          </button>
        </nav>
        <div className="mt-auto space-y-3">
          <Link href="/" className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-stone-600 hover:bg-stone-50">
            View visitor site <ArrowUpRight className="size-4 text-stone-400" />
          </Link>
          <div className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3">
            <Avatar name={me.name} src={me.photo} className="size-8" />
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">{me.name}</p>
              <p className="truncate text-xs text-stone-500">{me.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 pb-24">
        <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-stone-50/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-4 px-5 md:px-8">
            <div className="lg:hidden"><Logo /></div>
            <div className={cn("relative ml-auto w-full max-w-sm", (tab === "attendance" || tab === "week") && "invisible")}>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${tab === "events" ? "events" : tab === "people" ? "people & kids" : tab === "prayer" ? "prayer requests" : tab === "schedule" ? "volunteers" : tab}`}
                aria-label={`Search ${tab === "people" ? "people & kids" : tab === "prayer" ? "prayer requests" : tab}`}
                className="h-10 w-full rounded-full bg-white pl-10 pr-4 text-sm ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-honey-soft px-3 py-1.5 text-xs font-medium text-honey md:inline-flex" title="Prototype: nothing is sent">
              <FlaskConical className="size-3.5" /> Simulated · nothing is sent
            </span>
          </div>
        </header>

        <div className="px-5 pt-6 md:px-8">
          <div className="border-b border-stone-200/70">
          <div role="tablist" aria-label="Dashboard sections" className="no-scrollbar -mb-px flex gap-1 overflow-x-auto overflow-y-hidden">
            {([
              ["week", "This week", Sun],
              ["people", "People", Users],
              ["baptisms", "Baptisms", Droplets],
              ["attendance", "Attendance", BarChart3],
              ["prayer", "Prayer", HandHeart],
              ["volunteers", "Volunteers", UsersRound],
              ["schedule", "Schedule", CalendarRange],
              ["events", "Events", CalendarPlus],
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => (id === "people" && tab !== "people" ? goPeople({}) : setTab(id))}
                className={cn("flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-2.5 pb-3 pt-1 text-sm transition sm:px-3", tab === id ? "border-forest-700 font-medium text-stone-900" : "border-transparent text-stone-500 hover:text-stone-800")}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
          </div>
        </div>
        {tab === "events" ? (
          <div key={tab} className="m-tab px-5 pt-8 md:px-8">
            <div className="mb-6">
              <p className="text-sm text-stone-500">Ministry</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Events</h1>
              <p className="mt-1 text-sm text-stone-500">Create events, RSVPs, and sign-ups. Published events show on the site right away.</p>
            </div>
            <EventsView query={query} />
          </div>
        ) : tab === "week" ? (
          <div key={tab} className="m-tab px-5 pt-8 md:px-8">
            <WeeklyView go={(t) => (t === "people" ? goPeople({}) : setTab(t))} openVisitor={setSelectedId} />
          </div>
        ) : tab === "schedule" ? (
          <div key={tab} className="m-tab px-5 pt-8 md:px-8">
            <div className="mb-6">
              <p className="text-sm text-stone-500">Volunteers</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Sunday schedule</h1>
            </div>
            <ScheduleView query={query} />
          </div>
        ) : tab === "volunteers" ? (
          <div key={tab} className="m-tab px-5 pt-8 md:px-8">
            <div className="mb-6">
              <p className="text-sm text-stone-500">Ministry</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Volunteers</h1>
            </div>
            <VolunteersView query={query} />
          </div>
        ) : tab === "prayer" ? (
          <div key={tab} className="m-tab px-5 pt-8 md:px-8">
            <div className="mb-6">
              <p className="text-sm text-stone-500">Ministry</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Prayer requests</h1>
            </div>
            <PrayerView query={query} />
          </div>
        ) : tab === "attendance" ? (
          <div key={tab} className="m-tab px-5 pt-8 md:px-8">
            <div className="mb-6">
              <p className="text-sm text-stone-500">Ministry</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Attendance</h1>
            </div>
            <AttendanceView />
          </div>
        ) : tab === "baptisms" ? (
          <div key={tab} className="m-tab px-5 pt-8 md:px-8">
            <div className="mb-6">
              <p className="text-sm text-stone-500">Ministry</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Baptisms</h1>
            </div>
            <BaptismsView query={query} onOpen={setSelectedId} />
          </div>
        ) : (
        <div key={tab} className="m-tab px-5 pt-8 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500" suppressHydrationWarning>{hydrated ? `${greeting()}, ${me.name.split(" ")[0]}` : " "}</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">People</h1>
            </div>
            {hydrated && store.you && (
              <button onClick={() => setSelectedId("you")} className="group flex items-center gap-3 rounded-2xl bg-white py-2 pl-2 pr-4 text-left ring-1 ring-honey/60 transition hover:ring-honey">
                <Avatar name={store.you.firstName} className="size-9 bg-forest-700 text-ink" />
                <span className="text-sm">
                  <span className="flex items-center gap-1.5 font-medium"><Sparkles className="size-3.5 text-honey" /> Your demo profile is here</span>
                  <span className="text-stone-500">{store.you.firstName} · {store.you.memberSince ? "Member" : store.you.stage}</span>
                </span>
                <ChevronRight className="size-4 text-stone-300 transition group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          {/* Everyone / Guests / Members */}
          <div role="radiogroup" aria-label="Show" className="mt-6 inline-flex rounded-full bg-white p-1 ring-1 ring-stone-200/70">
            {(["all", "guests", "members"] as const).map((w) => (
              <button
                key={w}
                role="radio"
                aria-checked={who === w}
                onClick={() => { setWho(w); if (w === "members") { setStage(""); if (["new", "planning", "requests", "rsvps"].includes(view)) setView("all"); } }}
                className={cn("flex h-9 items-center gap-2 rounded-full px-4 text-sm transition", who === w ? "bg-forest-700 font-medium text-ink" : "text-stone-600 hover:text-stone-900")}
              >
                {whoLabel[w]} <span className="tabular-nums opacity-60">{hydrated ? counts[w] : ""}</span>
              </button>
            ))}
          </div>

          {/* Metrics */}
          {who === "members" ? (
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric label="Members" sub="Joined the church" value={counts.members} icon={BadgeCheck} active={false} onClick={() => setFamily("")} ready={hydrated} />
              <Metric label="Families with kids" sub="Kids or students registered" value={memberStats.families} icon={Baby} active={family === "kids"} onClick={() => setFamily(family === "kids" ? "" : "kids")} ready={hydrated} />
              <Metric label="Kids & students" sub="In member families" value={memberStats.kids} icon={Users} active={false} onClick={() => setFamily("kids")} ready={hydrated} />
              <Metric label="Allergies & medical" sub="Printed on name tags" value={memberStats.medical} icon={HeartPulse} accent active={false} onClick={() => setFamily("kids")} ready={hydrated} />
            </div>
          ) : (
          <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Metric label="New guests" sub="Last 14 days" value={metrics.new} icon={UserRoundPlus} active={view === "new"} onClick={() => setView(view === "new" ? "all" : "new")} ready={hydrated} />
            <Metric label="Planning a visit" sub="Coming soon" value={metrics.planning} icon={CalendarDays} active={view === "planning"} onClick={() => setView(view === "planning" ? "all" : "planning")} ready={hydrated} />
            <Metric label="Connection requests" sub="Groups, teams & questions" value={metrics.requests} icon={Inbox} active={view === "requests"} onClick={() => setView(view === "requests" ? "all" : "requests")} ready={hydrated} />
            <Metric label="Upcoming RSVPs" sub="Events ahead" value={metrics.upcoming} icon={CalendarCheck} active={view === "rsvps"} onClick={() => setView(view === "rsvps" ? "all" : "rsvps")} ready={hydrated} />
            <Metric label="Need follow-up" sub="Waiting on us" value={metrics.attention} icon={AlertCircle} accent className="col-span-2 md:col-span-1" active={view === "attention"} onClick={() => setView(view === "attention" ? "all" : "attention")} ready={hydrated} />
          </div>

          {/* Journey bar */}
          <div className="mt-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200/70">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Guest journey</p>
              <p className="text-xs text-stone-400">{counts.guests} guests · becoming a member ends the journey</p>
            </div>
            <div className="mt-4 flex h-2.5 gap-1 overflow-hidden rounded-full">
              {stageCounts.map(({ s, n }) => (
                <motion.button
                  key={s}
                  aria-label={`${s}: ${n}`}
                  onClick={() => { setStage(stage === s ? "" : s); if (who === "all") setWho("guests"); }}
                  initial={false}
                  animate={{ flexGrow: hydrated ? Math.max(n, 0.15) : 1 }}
                  className={cn("h-full min-w-1 rounded-full transition-opacity", stageStyle[s].bar, stage && stage !== s && "opacity-25")}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {stageCounts.map(({ s, n }) => (
                <button key={s} onClick={() => { setStage(stage === s ? "" : s); if (who === "all") setWho("guests"); }} className={cn("flex items-center gap-1.5 text-xs transition", stage && stage !== s ? "text-stone-300" : "text-stone-500 hover:text-stone-800")}>
                  <span className={cn("size-1.5 rounded-full", stageStyle[s].dot)} /> {s} <span className="tabular-nums text-stone-400">{hydrated ? n : ""}</span>
                </button>
              ))}
            </div>
          </div>
          </>
          )}

          <div className="mt-8 grid gap-6 2xl:grid-cols-[1fr_320px]">
            {/* Table */}
            <section className="min-w-0 rounded-2xl bg-white ring-1 ring-stone-200/70" aria-labelledby="people-title">
              <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 p-4">
                <h2 id="people-title" className="mr-auto px-1 font-medium">
                  {view === "all" ? whoLabel[who] : { attention: "Needs attention", mine: "Assigned to me", new: "New guests", planning: "Planning a visit", requests: "Connection requests", rsvps: "Upcoming RSVPs" }[view]}
                  <span className="ml-2 text-sm font-normal text-stone-400">{hydrated ? filtered.length : ""}</span>
                </h2>
                {who !== "members" && <Filter value={stage} onChange={(v) => { setStage(v as Stage | ""); if (v && who === "all") setWho("guests"); }} label="Stage" options={stages.map((s) => ({ v: s, l: s }))} />}
                <Filter value={family} onChange={(v) => setFamily(v as KidsGroup | "kids" | "")} label="Kids" allLabel="Kids: Any" options={[{ v: "kids", l: "Has kids registered" }, ...kidsGroups.map((g) => ({ v: g.id, l: `${g.label} (${counts.group(g.id)})` }))]} />
                <Filter value={interest} onChange={(v) => setInterest(v as InterestId | "")} label="Interest" options={interestList.map((i) => ({ v: i.id, l: interestShort[i.id] }))} />
                <Filter value={assignee} onChange={setAssignee} label="Assigned" options={[{ v: "none", l: "Unassigned" }, ...welcomeTeam.map((s) => ({ v: s.id, l: s.name }))]} />
                {hasFilters && (
                  <button onClick={clear} className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm text-stone-500 hover:bg-stone-100">
                    <X className="size-3.5" /> Clear
                  </button>
                )}
                {family && (
                  <button
                    onClick={() => downloadKidsRoster(filtered, family === "kids" ? "" : family)}
                    disabled={!filtered.some((v) => v.kids)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300 disabled:opacity-40"
                  >
                    <Download className="size-3.5" /> Kids roster
                  </button>
                )}
              </div>

              {!hydrated ? (
                <div className="space-y-2 p-4">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-stone-100" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-16 text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400"><LayoutGrid className="size-5" /></span>
                  <p className="mt-4 font-medium">No one matches those filters</p>
                  <p className="mt-1 text-sm text-stone-500">Try a different search, or clear filters to see everyone.</p>
                  <button onClick={() => { clear(); setWho("all"); }} className="mt-4 text-sm font-medium text-forest-600 hover:text-forest-300">Clear filters</button>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead>
                        <tr className="text-xs text-stone-400">
                          {["Name", "Journey", "Assigned", "Next action"].map((h) => (
                            <th key={h} className="px-4 py-3 font-medium first:pl-5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filtered.map((v) => <Row key={v.id} v={v} onOpen={() => setSelectedId(v.id)} />)}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile list */}
                  <ul className="divide-y divide-stone-100 md:hidden">
                    {filtered.map((v) => (
                      <li key={v.id}>
                        <button onClick={() => setSelectedId(v.id)} className="flex w-full items-center gap-3 p-4 text-left">
                          <Avatar name={fullName(v)} src={v.photo} className={cn(v.isYou && "bg-forest-700 text-ink")} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{fullName(v)} {v.isYou && <span className="text-xs text-honey">· You</span>}</p>
                            <p className="truncate text-xs text-stone-500">{isMember(v) ? `Member since ${new Date(v.memberSince!).getFullYear()}` : nextAction(v).label}</p>
                          </div>
                          {isMember(v) ? <PersonTag v={v} /> : <StagePill s={v.stage} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* My tasks */}
            <aside className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70 2xl:self-start" aria-labelledby="tasks-title">
              <div className="flex items-center justify-between px-1">
                <h2 id="tasks-title" className="font-medium">My follow-ups</h2>
                <span className="text-xs text-stone-400">{hydrated ? myTasks.length : ""}</span>
              </div>
              {hydrated && myTasks.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-stone-200 p-4 text-sm text-stone-400">All caught up. Go get a coffee.</p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {myTasks.map(({ t, v }) => {
                    const overdue = new Date(t.dueDate).getTime() < Date.now();
                    return (
                      <li key={t.id}>
                        <div className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-stone-50">
                          <button onClick={() => store.toggleTask(v.id, t.id)} aria-label={`Complete: ${t.title}`} className="mt-0.5 size-5 shrink-0 rounded-full ring-1 ring-stone-300 transition hover:bg-forest-50 hover:ring-forest-500" />
                          <button onClick={() => setSelectedId(v.id)} className="min-w-0 flex-1 text-left">
                            <p className="text-sm text-stone-800">{t.title}</p>
                            <p className={cn("text-xs", overdue ? "text-clay" : "text-stone-400")}>{fullName(v)} · {overdue ? "Overdue" : relativeDay(t.dueDate)}</p>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>
          </div>
        </div>
        )}
      </main>

      <VisitorPanel visitor={selected} onOpenChange={(o) => !o && setSelectedId(null)} />
    </div>
  );
}

function Metric({ label, sub, value, icon: Icon, onClick, active, accent, ready, className }: { className?: string; label: string; sub: string; value: number; icon: React.ComponentType<{ className?: string }>; onClick: () => void; active: boolean; accent?: boolean; ready: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl p-4 text-left ring-1 transition md:p-5",
        className,
        active ? "bg-forest-800 text-paper ring-forest-800" : "bg-white ring-stone-200/70 hover:ring-stone-300",
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-[13px]", active ? "text-paper/80" : "text-stone-500")}>{label}</span>
        <Icon className={cn("size-4", active ? "text-honey" : accent && value > 0 ? "text-clay" : "text-stone-300")} />
      </div>
      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{ready ? <CountUp value={value} /> : "–"}</p>
      <p className={cn("mt-2 text-xs", active ? "text-paper/60" : "text-stone-400")}>{sub}</p>
    </button>
  );
}

function Filter({ value, onChange, label, allLabel, options }: { value: string; onChange: (v: string) => void; label: string; allLabel?: string; options: { v: string; l: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={cn(
        "h-9 rounded-full pl-3.5 pr-10 text-sm ring-1 transition focus:outline-none focus:ring-2 focus:ring-forest-500",
        value ? "bg-forest-50 text-forest-300 ring-forest-200" : "bg-white text-stone-600 ring-stone-200",
      )}
    >
      <option value="">{allLabel ?? `${label}: All`}</option>
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function StagePill({ s }: { s: Stage }) {
  return <span className={cn("inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", stageStyle[s].pill)}>{s}</span>;
}

/** Name, contact, kids and guardians: everything the search box looks through. */
function searchText(v: Visitor) {
  const kids = v.kids?.kids.map((k) => `${k.firstName} ${k.nickname ?? ""} ${k.lastName}`).join(" ") ?? "";
  const students = v.students?.students.map((k) => `${k.firstName} ${k.lastName}`).join(" ") ?? "";
  const guardian = v.kids?.secondGuardian?.firstName ?? "";
  return `${fullName(v)} ${v.email} ${v.phone} ${kids} ${students} ${guardian}`.toLowerCase();
}

function Row({ v, onOpen }: { v: Visitor; onOpen: () => void }) {
  const a = v.assigneeId ? staffById[v.assigneeId] : null;
  const next = nextAction(v);
  const member = isMember(v);
  return (
    <tr
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      tabIndex={0}
      className={cn("cursor-pointer transition hover:bg-stone-50 focus:bg-stone-50 focus:outline-none", v.isYou && "bg-honey-soft/30")}
    >
      <td className="py-3 pl-5 pr-4">
        <div className="flex items-center gap-3">
          <Avatar name={fullName(v)} src={v.photo} className={cn(v.isYou && "bg-forest-700 text-ink")} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-medium text-stone-900">
              <span className="truncate">{fullName(v)}</span>
              {v.isYou && <span className="rounded-full bg-honey-soft px-1.5 py-0.5 text-[10px] font-semibold text-honey">YOU</span>}
              {member && <PersonTag v={v} />}
            </p>
            <p className="max-w-[220px] truncate text-xs text-stone-400">{v.email || v.phone || "No contact info"}</p>
          </div>
        </div>
      </td>
            <td className="px-4 py-3">
        {member ? (
          <span className="whitespace-nowrap text-stone-600">Member since {new Date(v.memberSince!).getFullYear()}</span>
        ) : (
          <>
            <StagePill s={v.stage} />
            <span className="mt-1 block text-xs text-stone-400">First visit {formatDate(v.firstVisit)}</span>
          </>
        )}
      </td>
      <td className="px-4 py-3">
        {a ? (
          <span className="flex items-center gap-2 text-stone-700"><Avatar name={a.name} src={a.photo} className="size-6 text-[10px]" />{a.name.split(" ")[0]}</span>
        ) : member ? (
          <span className="text-xs text-stone-300">—</span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-dashed border-stone-300 px-2 py-0.5 text-xs text-stone-400">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3">
        <p className={cn("max-w-[220px] truncate", next.overdue ? "text-clay" : member && next.label === "Nothing due" ? "text-stone-400" : "text-stone-700")}>{next.label}</p>
        {next.due && <p className={cn("text-xs", next.overdue ? "text-clay/80" : "text-stone-400")}>{next.overdue ? "Overdue" : `Due ${formatShortDay(next.due)}`}</p>}
      </td>
    </tr>
  );
}
