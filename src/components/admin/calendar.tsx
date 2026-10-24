"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { calendarCategories, calendarItems, calendarLayers, categoryLabel, clock, ymd, type CalendarItem, type CalendarLayer } from "@/lib/calendar";
import type { CalendarCategory, CalendarEntry } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { ACTING_AS } from "./helpers";
import { Area, Input } from "./events";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Dot / bar color for an item. */
function tone(i: Pick<CalendarItem, "kind" | "category">) {
  if (i.kind === "service") return "bg-stone-400";
  if (i.kind === "event") return "bg-forest-500";
  if (i.kind === "baptism") return "bg-sage";
  return { meeting: "bg-honey", rehearsal: "bg-sky", event: "bg-forest-500", closure: "bg-clay", other: "bg-stone-300" }[i.category ?? "other"];
}
const layerTone: Record<CalendarLayer, string> = { service: "bg-stone-400", event: "bg-forest-500", baptism: "bg-sage", entry: "bg-honey" };

type Draft = Omit<CalendarEntry, "createdBy" | "updatedAt">;
const blank = (date: string): Draft => ({ id: uid("cal"), title: "", category: "meeting", date, allDay: false, start: "10:00", end: "11:00", repeat: "none", location: "", notes: "" });

/** The staff church calendar: services, events, baptisms and hand-entered meetings and closings in one month view. */
export function CalendarView() {
  const { calendar, hydrated } = useStore();
  const today = ymd(new Date());
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(today);
  const [layers, setLayers] = useState<CalendarLayer[]>(["service", "event", "baptism", "entry"]);
  const [editing, setEditing] = useState<Draft | null>(null);

  // Six weeks starting on the Sunday on or before the 1st.
  const days = useMemo(() => {
    const first = new Date(month);
    first.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(first);
      d.setDate(first.getDate() + i);
      return d;
    });
  }, [month]);

  const items = useMemo(
    () => (hydrated ? calendarItems(days[0], days[41], calendar).filter((i) => layers.includes(i.kind)) : []),
    [hydrated, days, calendar, layers],
  );
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarItem[]>();
    for (const i of items) m.set(i.date, [...(m.get(i.date) ?? []), i]);
    return m;
  }, [items]);

  const go = (by: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1));
  const jumpToday = () => {
    const d = new Date();
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(today);
  };
  const dayItems = byDay.get(selected) ?? [];
  const selectedDate = new Date(`${selected}T12:00:00`);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => go(-1)} aria-label="Previous month" className="flex size-10 items-center justify-center rounded-full ring-1 ring-stone-200 transition hover:ring-stone-300"><ChevronLeft className="size-4" /></button>
          <button onClick={() => go(1)} aria-label="Next month" className="flex size-10 items-center justify-center rounded-full ring-1 ring-stone-200 transition hover:ring-stone-300"><ChevronRight className="size-4" /></button>
        </div>
        <h2 className="min-w-[10rem] text-xl font-semibold tracking-[-0.01em]" aria-live="polite">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
        <button onClick={jumpToday} className="h-10 rounded-full px-4 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300">Today</button>
        <Button className="ml-auto" onClick={() => setEditing(blank(selected))}><Plus /> Add to calendar</Button>
      </div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
        {calendarLayers.map((l) => {
          const on = layers.includes(l.id);
          return (
            <button
              key={l.id}
              onClick={() => setLayers(on ? layers.filter((x) => x !== l.id) : [...layers, l.id])}
              aria-pressed={on}
              className={cn("flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm ring-1 transition", on ? "bg-white text-stone-800 ring-stone-300" : "text-stone-400 ring-stone-200/70 hover:text-stone-600")}
            >
              <span className={cn("size-2 rounded-full", layerTone[l.id], !on && "opacity-30")} />
              {l.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Month */}
        <section aria-label="Month" className="min-w-0 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200/70">
          <div className="grid grid-cols-7 border-b border-stone-100">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-2.5 text-center text-xs font-medium text-stone-400">{w}</span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const key = ymd(d);
              const list = byDay.get(key) ?? [];
              const inMonth = d.getMonth() === month.getMonth();
              const isToday = key === today;
              const isSel = key === selected;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  aria-pressed={isSel}
                  aria-label={`${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}, ${list.length} item${list.length === 1 ? "" : "s"}`}
                  className={cn(
                    "relative flex min-h-[64px] flex-col items-stretch gap-1 border-stone-100 p-1.5 text-left transition md:min-h-[112px] md:p-2",
                    i % 7 !== 6 && "border-r",
                    i < 35 && "border-b",
                    !inMonth && "bg-stone-50/60",
                    isSel ? "bg-forest-50 ring-2 ring-inset ring-forest-700" : "hover:bg-stone-50",
                  )}
                >
                  <span className={cn("flex size-7 items-center justify-center self-center rounded-full text-sm tabular-nums md:self-start", isToday ? "bg-forest-700 font-semibold text-ink" : inMonth ? "text-stone-800" : "text-stone-300")}>{d.getDate()}</span>
                  {/* Phones: dots */}
                  <span className="flex flex-wrap justify-center gap-0.5 md:hidden">
                    {list.slice(0, 4).map((x) => <span key={x.id} className={cn("size-1.5 rounded-full", tone(x))} />)}
                  </span>
                  {/* Larger screens: labeled bars */}
                  <span className="hidden min-w-0 flex-col gap-0.5 md:flex">
                    {list.slice(0, 3).map((x) => (
                      <span key={x.id} className={cn("flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] leading-tight", inMonth ? "text-stone-700" : "text-stone-400")}>
                        <span className={cn("size-1.5 shrink-0 rounded-full", tone(x))} />
                        <span className="truncate">{x.allDay ? "" : <span className="text-stone-400">{clock(x.start!).replace(":00", "").replace(" ", "").toLowerCase()} </span>}{x.short ?? x.title}</span>
                      </span>
                    ))}
                    {list.length > 3 && <span className="px-1.5 text-[11px] text-stone-400">+{list.length - 3} more</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected day */}
        <aside aria-label="Selected day" className="rounded-2xl bg-white p-5 ring-1 ring-stone-200/70 2xl:self-start">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-stone-500">{selected === today ? "Today" : selectedDate.toLocaleDateString("en-US", { weekday: "long" })}</p>
              <h3 className="text-lg font-semibold tracking-[-0.01em]">{selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</h3>
            </div>
            <button onClick={() => setEditing(blank(selected))} aria-label="Add to this day" className="flex size-9 items-center justify-center rounded-full ring-1 ring-stone-200 transition hover:ring-stone-300"><Plus className="size-4" /></button>
          </div>
          {dayItems.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-stone-200 px-4 py-6 text-center text-sm text-stone-400">Nothing on the calendar.</p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {dayItems.map((x) => {
                const entry = x.entryId ? calendar.find((e) => e.id === x.entryId) : undefined;
                const body = (
                  <>
                    <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", tone(x))} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-stone-900">{x.title}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500">
                        <span className="inline-flex items-center gap-1"><Clock className="size-3" />{x.allDay ? "All day" : `${clock(x.start!)}${x.end ? ` – ${clock(x.end)}` : ""}`}</span>
                        {x.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{x.location}</span>}
                        {entry?.repeat === "weekly" && <span className="inline-flex items-center gap-1"><Repeat className="size-3" />Every week</span>}
                      </span>
                      {x.notes && <span className="mt-1.5 block text-xs leading-relaxed text-stone-500">{x.notes}</span>}
                    </span>
                    <span className="shrink-0 text-[11px] text-stone-400">{x.kind === "entry" ? categoryLabel(x.category!) : x.kind === "service" ? "Service" : x.kind === "baptism" ? "Baptism" : "Event"}</span>
                  </>
                );
                return (
                  <li key={x.id}>
                    {entry ? (
                      <button onClick={() => setEditing({ ...entry })} className="flex w-full gap-3 py-3 text-left text-sm transition hover:bg-stone-50">{body}</button>
                    ) : x.href ? (
                      <Link href={x.href} target="_blank" className="group flex gap-3 py-3 text-sm">
                        {body}
                        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-stone-300 transition group-hover:text-stone-600" />
                      </Link>
                    ) : (
                      <div className="flex gap-3 py-3 text-sm">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-stone-400">Staff entries can be edited here. Events come from the Events tab; services and baptism Sundays are added automatically.</p>
        </aside>
      </div>

      <EntrySheet draft={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

/* ---------- Add / edit a staff entry ---------- */

function EntrySheet({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const { calendar, saveCalendarEntry, deleteCalendarEntry } = useStore();
  const [d, setD] = useState<Draft | null>(draft);
  const [shownId, setShownId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (draft && draft.id !== shownId) {
    setShownId(draft.id);
    setD(draft);
    setErrors({});
  }
  const exists = !!d && calendar.some((e) => e.id === d.id);
  const set = (patch: Partial<Draft>) => setD((x) => (x ? { ...x, ...patch } : x));

  const save = () => {
    if (!d) return;
    const e: Record<string, string> = {};
    if (!d.title.trim()) e.title = "Give it a name.";
    if (!d.date) e.date = "Pick a date.";
    if (!d.allDay && d.start && d.end && d.end <= d.start) e.end = "End after it starts.";
    setErrors(e);
    if (Object.keys(e).length) return;
    saveCalendarEntry({ ...d, title: d.title.trim(), location: d.location?.trim() || undefined, notes: d.notes?.trim() || undefined, start: d.allDay ? undefined : d.start, end: d.allDay ? undefined : d.end }, ACTING_AS);
    toast(exists ? "Calendar updated" : "Added to the calendar", { description: d.title.trim() });
    onClose();
  };

  return (
    <Sheet open={!!draft} onOpenChange={(o) => !o && onClose()} title={exists ? "Edit calendar entry" : "Add to the calendar"} side="right">
      {d && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-6 pt-2">
            <Input label="What is it?" value={d.title} onChange={(v) => set({ title: v })} error={errors.title} placeholder="Staff meeting" max={80} />
            <div className="space-y-2">
              <span className="block text-sm font-medium text-stone-800">Type</span>
              <div className="flex flex-wrap gap-2">
                {calendarCategories.map((c) => (
                  <button key={c.id} onClick={() => set({ category: c.id as CalendarCategory, allDay: c.id === "closure" ? true : d.allDay })} aria-pressed={d.category === c.id} className={cn("flex h-9 items-center gap-2 rounded-full px-3.5 text-sm ring-1 transition", d.category === c.id ? "bg-forest-700 font-medium text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}>
                    <span className={cn("size-2 rounded-full", tone({ kind: "entry", category: c.id as CalendarCategory }))} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Date" type="date" value={d.date} onChange={(v) => set({ date: v })} error={errors.date} />
              <label className="flex items-center gap-3 self-end rounded-xl px-1 pb-3 text-sm text-stone-700">
                <input type="checkbox" checked={d.allDay} onChange={(e) => set({ allDay: e.target.checked })} className="size-4 accent-[#0285ff]" />
                All day
              </label>
            </div>
            {!d.allDay && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Starts" type="time" value={d.start ?? ""} onChange={(v) => set({ start: v })} />
                <Input label="Ends" type="time" value={d.end ?? ""} onChange={(v) => set({ end: v })} error={errors.end} />
              </div>
            )}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-stone-800">Repeats</span>
              <div className="flex h-12 rounded-xl bg-stone-50 p-1 ring-1 ring-stone-200">
                {([["none", "Doesn't repeat"], ["weekly", `Every ${new Date(`${d.date || ymd(new Date())}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" })}`]] as const).map(([id, label]) => (
                  <button key={id} onClick={() => set({ repeat: id })} aria-pressed={d.repeat === id} className={cn("flex-1 rounded-lg text-sm transition", d.repeat === id ? "bg-white font-medium text-stone-900 shadow-sm ring-1 ring-stone-200" : "text-stone-500")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Where" value={d.location ?? ""} onChange={(v) => set({ location: v })} optional placeholder="Conference room" />
            <Area label="Notes" value={d.notes ?? ""} onChange={(v) => set({ notes: v })} optional placeholder="Who's leading, what to bring, anything the team should know." />
          </div>
          <div className="flex items-center gap-2 border-t border-stone-100 px-6 py-4">
            {exists && (
              <button
                onClick={() => {
                  deleteCalendarEntry(d.id);
                  toast("Removed from the calendar", { description: d.repeat === "weekly" ? "Every week of it." : d.title });
                  onClose();
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-stone-500 transition hover:bg-stone-100 hover:text-clay"
              >
                <Trash2 className="size-4" /> Delete
              </button>
            )}
            <button onClick={onClose} className="ml-auto h-10 rounded-full px-4 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-900">Cancel</button>
            <Button onClick={save}><CalendarDays /> {exists ? "Save" : "Add"}</Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
