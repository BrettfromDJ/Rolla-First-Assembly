"use client";

import { useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Footprints,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Sparkles,
  StickyNote,
  UserPlus,
  Users,
  ArrowRightLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InterestChip } from "@/components/ui/interest-icon";
import {
  ageGroupOptions,
  faithStageOptions,
  groupSizeOptions,
  homeTopicOptions,
  interestShort,
  serveAreaOptions,
  staffById,
  vibeOptions,
  welcomeTeam,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import type { Activity, Stage, Visitor } from "@/lib/types";
import { cn, daysFromNow, formatDate, formatShortDay, formatTime, timeAgo } from "@/lib/utils";
import { ACTING_AS, fullName, rsvpInfo, stageStyle, stages } from "./helpers";

const actIcon: Record<Activity["kind"], React.ComponentType<{ className?: string }>> = {
  visit: Footprints,
  plan: CalendarDays,
  onboarding: Sparkles,
  rsvp: CalendarCheck,
  join: Users,
  question: HelpCircle,
  contacted: MessageSquare,
  assigned: UserPlus,
  note: StickyNote,
  task: ClipboardList,
  stage: ArrowRightLeft,
};

const label = (opts: readonly { id: string; label: string }[], ids: string[]) =>
  ids.map((id) => opts.find((o) => o.id === id)?.label).filter(Boolean) as string[];

export function VisitorPanel({ visitor, onOpenChange }: { visitor: Visitor | null; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={!!visitor} onOpenChange={onOpenChange} side="right" title={visitor ? fullName(visitor) : "Visitor"} hideTitle>
      {visitor && <PanelBody key={visitor.id} v={visitor} />}
    </Sheet>
  );
}

function PanelBody({ v }: { v: Visitor }) {
  const { patchVisitor, addNote, addTask, toggleTask } = useStore();
  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("1");
  const [taskWho, setTaskWho] = useState<string>(v.assigneeId ?? ACTING_AS);
  const [showTask, setShowTask] = useState(false);

  const f = v.followUps;
  const selections = [
    { q: "Kind of thing", a: label(vibeOptions, f.vibes) },
    { q: "Group size", a: label(groupSizeOptions, f.groupSize ? [f.groupSize] : []) },
    { q: "Faith journey", a: label(faithStageOptions, f.faithStage ? [f.faithStage] : []) },
    { q: "Age groups", a: label(ageGroupOptions, f.ageGroups) },
    { q: "Getting to know us", a: label(homeTopicOptions, f.homeTopics) },
    { q: "Ways to help", a: label(serveAreaOptions, f.serveAreas) },
  ].filter((s) => s.a.length);

  const assignee = v.assigneeId ? staffById[v.assigneeId] : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-stone-100 px-6 pb-5 pt-6">
        <div className="flex items-start gap-4 pr-10">
          <Avatar name={fullName(v)} src={v.photo} className={cn("size-14 text-base", v.isYou && "bg-forest-700 text-ink")} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-stone-900">{fullName(v)}</h2>
              {v.isYou && <span className="rounded-full bg-honey-soft px-2 py-0.5 text-[11px] font-semibold text-honey">You · live demo</span>}
            </div>
            <p className="mt-0.5 text-sm text-stone-500">
              {v.source} · First visit {formatDate(v.firstVisit)}
              {v.household ? ` · ${v.household}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {v.email ? (
                <a href={`mailto:${v.email}`} className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900"><Mail className="size-3.5" />{v.email}</a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-stone-400"><Mail className="size-3.5" />No email shared</span>
              )}
              {v.phone && <span className="inline-flex items-center gap-1.5 text-stone-600"><Phone className="size-3.5" />{v.phone}</span>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-stone-400">Stage</span>
            <select
              value={v.stage}
              onChange={(e) => {
                const s = e.target.value as Stage;
                patchVisitor(v.id, { stage: s }, `Stage changed to ${s}`, "stage");
                toast(`Moved to ${s}`);
              }}
              className="h-10 w-full rounded-xl bg-stone-50 px-3 text-sm ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              {stages.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-stone-400">Assigned to</span>
            <select
              value={v.assigneeId ?? ""}
              onChange={(e) => {
                const id = e.target.value || null;
                patchVisitor(v.id, { assigneeId: id }, id ? `Assigned to ${staffById[id].name}` : "Unassigned", "assigned");
                toast(id ? `Assigned to ${staffById[id].name.split(" ")[0]}` : "Unassigned", { description: id ? "Simulated: no notification was sent." : undefined });
              }}
              className="h-10 w-full rounded-xl bg-stone-50 px-3 text-sm ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="">Unassigned</option>
              {welcomeTeam.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm">
            <span className={cn("size-2 rounded-full", v.status === "Contacted" ? "bg-forest-500" : v.status === "Waiting to hear back" ? "bg-honey" : "bg-clay")} />
            <span className="text-stone-700">{v.status}</span>
          </span>
          {v.status === "Contacted" ? (
            <button
              onClick={() => { patchVisitor(v.id, { status: "Needs follow-up" }, "Marked as needing follow-up", "contacted"); toast("Marked as needing follow-up"); }}
              className="text-xs text-stone-500 hover:text-stone-900"
            >
              Undo
            </button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                patchVisitor(v.id, { status: "Contacted" }, `${staffById[ACTING_AS].name} marked as contacted`, "contacted");
                toast(`${v.firstName} marked as contacted`, { description: "Simulated: no message was sent." });
              }}
            >
              <Check /> Mark as contacted
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
        <Section title="Interests">
          {v.interests.length ? (
            <div className="flex flex-wrap gap-1.5">{v.interests.map((i) => <InterestChip key={i} id={i} label={interestShort[i]} />)}</div>
          ) : (
            <Empty>No interests shared yet.</Empty>
          )}
        </Section>

        <Section title="Onboarding selections">
          {selections.length ? (
            <dl className="divide-y divide-stone-100 rounded-2xl ring-1 ring-stone-200/70">
              {selections.map((s) => (
                <div key={s.q} className="flex gap-4 px-4 py-3 text-sm">
                  <dt className="w-36 shrink-0 text-stone-400">{s.q}</dt>
                  <dd className="text-stone-800">{s.a.join(", ")}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <Empty>They skipped the follow-up questions.</Empty>
          )}
        </Section>

        <Section title="Event registrations">
          {v.visitPlan || v.rsvps.length ? (
            <ul className="space-y-2">
              {v.visitPlan && (
                <li className="flex items-center gap-3 rounded-2xl bg-sky-soft/50 px-4 py-3 text-sm">
                  <CalendarDays className="size-4 text-sky" />
                  <span className="flex-1 text-stone-800">Sunday service · {v.visitPlan.service} AM{v.visitPlan.bringingKids ? ` · ${v.visitPlan.kidsCount || ""} kid${v.visitPlan.kidsCount === 1 ? "" : "s"}` : ""}</span>
                  <span className="text-stone-500">{formatShortDay(v.visitPlan.date)}</span>
                </li>
              )}
              {v.rsvps.map((r) => {
                const info = rsvpInfo(r);
                return (
                  <li key={r.id} className="rounded-2xl bg-stone-50 px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      {info.kind === "join" ? <Users className="size-4 text-forest-600" /> : info.kind === "question" ? <HelpCircle className="size-4 text-forest-600" /> : <CalendarCheck className="size-4 text-forest-600" />}
                      <span className="flex-1 text-stone-800">
                        {info.title}
                        {info.parent && <span className="text-stone-400"> · {info.parent}</span>}
                      </span>
                      <span className="text-stone-500">{info.date ? `${formatShortDay(info.date)} · ${formatTime(info.date)}` : info.kind === "join" ? "Join request" : info.kind === "question" ? "Question" : ""}</span>
                    </div>
                    {r.message && <p className="mt-2 rounded-xl bg-white p-3 text-stone-600 ring-1 ring-stone-200/70">&ldquo;{r.message}&rdquo;</p>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>No registrations yet.</Empty>
          )}
        </Section>

        <Section
          title="Follow-up tasks"
          action={
            <button onClick={() => setShowTask((s) => !s)} className="inline-flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-300">
              <Plus className="size-3.5" /> New task
            </button>
          }
        >
          {showTask && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskTitle.trim()) return;
                addTask(v.id, { title: taskTitle.trim(), dueDate: daysFromNow(Number(taskDue), 12).toISOString(), assigneeId: taskWho || null });
                setTaskTitle("");
                setShowTask(false);
                toast("Follow-up task created");
              }}
              className="mb-3 space-y-2 rounded-2xl bg-stone-50 p-3"
            >
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder={`e.g. Text ${v.firstName} about Sunday`}
                autoFocus
                className="h-10 w-full rounded-xl bg-white px-3 text-sm ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <div className="flex gap-2">
                <select value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="h-9 flex-1 rounded-xl bg-white px-2 text-sm ring-1 ring-stone-200">
                  <option value="0">Today</option>
                  <option value="1">Tomorrow</option>
                  <option value="3">In 3 days</option>
                  <option value="7">Next week</option>
                </select>
                <select value={taskWho} onChange={(e) => setTaskWho(e.target.value)} className="h-9 flex-1 rounded-xl bg-white px-2 text-sm ring-1 ring-stone-200">
                  {welcomeTeam.map((s) => <option key={s.id} value={s.id}>{s.name.split(" ")[0]}</option>)}
                </select>
                <Button size="sm" type="submit" disabled={!taskTitle.trim()}>Add</Button>
              </div>
            </form>
          )}
          {v.tasks.length ? (
            <ul className="space-y-1">
              {v.tasks.map((t) => {
                const overdue = !t.done && new Date(t.dueDate).getTime() < Date.now();
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => { toggleTask(v.id, t.id); if (!t.done) toast("Task complete", { description: t.title }); }}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-stone-50"
                      aria-pressed={t.done}
                    >
                      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full ring-1 transition", t.done ? "bg-forest-600 ring-forest-600" : "ring-stone-300")}>
                        {t.done && <Check className="size-3 text-ink" strokeWidth={3} />}
                      </span>
                      <span className={cn("flex-1", t.done ? "text-stone-400 line-through" : "text-stone-800")}>{t.title}</span>
                      <span className={cn("text-xs", overdue ? "font-medium text-clay" : "text-stone-400")}>
                        {overdue ? "Overdue" : formatShortDay(t.dueDate)}
                      </span>
                      {t.assigneeId && <Avatar name={staffById[t.assigneeId].name} src={staffById[t.assigneeId].photo} className="size-6 text-[10px]" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            !showTask && <Empty>No open follow-ups. Nice.</Empty>
          )}
        </Section>

        <Section title="Internal notes">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              addNote(v.id, note.trim(), ACTING_AS);
              setNote("");
              toast("Note saved");
            }}
            className="rounded-2xl ring-1 ring-stone-200 focus-within:ring-2 focus-within:ring-forest-500"
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the team. Visitors never see these."
              className="block min-h-20 w-full resize-none rounded-t-2xl bg-transparent p-3 text-sm focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-stone-100 px-3 py-2">
              <span className="text-xs text-stone-400">Posting as {staffById[ACTING_AS].name}</span>
              <Button size="sm" type="submit" disabled={!note.trim()}>Save note</Button>
            </div>
          </form>
          {v.notes.length > 0 && (
            <ul className="mt-3 space-y-3">
              {v.notes.map((n) => (
                <li key={n.id} className="flex gap-3">
                  <Avatar name={staffById[n.authorId]?.name ?? "Staff"} src={staffById[n.authorId]?.photo} className="size-7 text-[10px]" />
                  <div className="flex-1 rounded-2xl rounded-tl-md bg-honey-soft/60 px-3.5 py-2.5 text-sm">
                    <p className="text-xs text-stone-500"><span className="font-medium text-stone-700">{staffById[n.authorId]?.name}</span> · {timeAgo(n.createdAt)}</p>
                    <p className="mt-1 text-stone-800">{n.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Activity">
          <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-stone-200">
            {v.activity.map((a) => {
              const Icon = actIcon[a.kind] ?? CheckCircle2;
              return (
                <li key={a.id} className="relative flex items-start gap-3 text-sm">
                  <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-stone-200">
                    <Icon className="size-3.5 text-stone-500" />
                  </span>
                  <div className="pt-1">
                    <p className="text-stone-800">{a.label}</p>
                    <p className="text-xs text-stone-400">{timeAgo(a.at)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>

        {assignee && (
          <p className="pb-4 text-center text-xs text-stone-400">
            {assignee.name} is {v.firstName}&apos;s point person.
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-stone-200 px-4 py-3 text-sm text-stone-400">{children}</p>;
}
