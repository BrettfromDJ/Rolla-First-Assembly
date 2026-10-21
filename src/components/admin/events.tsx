"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Copy, Download, Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { OfferingCard } from "@/components/events/offering-cards";
import { builtInOfferings, interests, staff, staffById } from "@/lib/data";
import { blankEvent, eventKinds, eventPhotos, headcount, kindFor, responseTypes } from "@/lib/event-builder";
import { useStore } from "@/lib/store";
import type { EventResponse, InterestId, Offering } from "@/lib/types";
import { cn, formatDay, formatTime, timeAgo } from "@/lib/utils";
import { ACTING_AS } from "./helpers";

type Filter = "all" | "published" | "draft" | "past";

const isPast = (o: Offering) => !!o.date && +new Date(o.date) + (o.durationMin ?? 60) * 60_000 < Date.now();
const whenText = (o: Offering) => (o.date ? `${formatDay(o.date)} · ${formatTime(o.date)}` : o.schedule || "No date yet");

/** Staff build events, RSVPs, and sign-ups here; published ones appear on the site right away. */
export function EventsView({ query }: { query: string }) {
  const { events, responses, hiddenOfferings, hydrated, saveEvent, toggleHiddenOffering } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<Offering | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [showBuiltIn, setShowBuiltIn] = useState(false);

  const q = query.trim().toLowerCase();
  const list = events
    .filter((o) => (filter === "all" ? true : filter === "past" ? isPast(o) : o.status === filter && !isPast(o)))
    .filter((o) => !q || `${o.title} ${o.summary} ${o.location}`.toLowerCase().includes(q))
    .sort((a, b) => +new Date(a.date ?? a.updatedAt ?? 0) - +new Date(b.date ?? b.updatedAt ?? 0));
  const count = (f: Filter) => events.filter((o) => (f === "all" ? true : f === "past" ? isPast(o) : o.status === f && !isPast(o))).length;

  if (!hydrated) return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-stone-200/70" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {([["all", "All"], ["published", "Live on site"], ["draft", "Drafts"], ["past", "Past"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={cn("flex h-10 items-center gap-2 rounded-full px-4 text-sm ring-1 transition", filter === id ? "bg-forest-700 font-medium text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}
          >
            {label}
            <span className={cn("rounded-full px-1.5 text-xs tabular-nums", filter === id ? "bg-ink/15" : "bg-stone-100 text-stone-500")}>{count(id)}</span>
          </button>
        ))}
        <button onClick={() => setEditing(blankEvent(ACTING_AS))} className="ml-auto flex h-10 items-center gap-2 rounded-full bg-forest-700 px-4 text-sm font-medium text-ink transition hover:bg-forest-500">
          <Plus className="size-4" /> New event
        </button>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-stone-200/70">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400"><CalendarDays className="size-5" /></span>
          <p className="mt-4 font-medium">{q ? "No events match that search" : "No events here yet"}</p>
          <p className="mt-1 text-sm text-stone-500">Create one and it shows up on the Events page as soon as you publish.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((o) => {
            const rs = responses.filter((r) => r.eventId === o.id);
            const n = headcount(rs);
            const past = isPast(o);
            return (
              <li key={o.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200/70 sm:flex-row sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.image} alt="" className="aspect-[16/10] w-full shrink-0 rounded-xl object-cover sm:w-32" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-stone-900">{o.title || "Untitled event"}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", past ? "bg-stone-100 text-stone-500" : o.status === "published" ? "bg-sage-soft text-sage" : "bg-honey-soft text-honey")}>
                      {past ? "Past" : o.status === "published" ? "Live on site" : "Draft"}
                    </span>
                    <span className="text-xs text-stone-400">{kindFor(o).label} · {responseTypes.find((r) => r.id === o.actionKind)?.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{whenText(o)} · {o.location}</p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="text-sm tabular-nums text-stone-700">
                      {n} {n === 1 ? "person" : "people"}{o.capacity ? ` of ${o.capacity}` : ""}
                    </span>
                    {o.capacity ? (
                      <span className="block h-1.5 w-32 overflow-hidden rounded-full bg-forest-100">
                        <span className="m-grow-x block h-full rounded-full bg-forest-700" style={{ width: `${Math.min(100, (n / o.capacity) * 100)}%` }} />
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Action icon={Users} onClick={() => setViewing(o.id)}>Responses{rs.length ? ` (${rs.length})` : ""}</Action>
                  <Action icon={Pencil} onClick={() => setEditing(o)}>Edit</Action>
                  <a href={`/events/${o.id}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900">
                    <Eye className="size-4" /> {o.status === "published" ? "View" : "Preview"}
                  </a>
                  <Action
                    icon={Copy}
                    onClick={() => {
                      saveEvent({ ...o, id: "", title: `${o.title} (copy)`, status: "draft" });
                      toast("Copied as a draft", { description: "Change the date and details, then publish." });
                    }}
                  >
                    Duplicate
                  </Action>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Built-in events */}
      <section className="rounded-2xl bg-white ring-1 ring-stone-200/70">
        <button onClick={() => setShowBuiltIn(!showBuiltIn)} aria-expanded={showBuiltIn} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
          <span>
            <span className="block font-medium">Events that came with the site · {builtInOfferings().length}</span>
            <span className="text-xs text-stone-400">Hide any that aren&apos;t real or have ended. {hiddenOfferings.length ? `${hiddenOfferings.length} hidden.` : ""}</span>
          </span>
          <span className="text-sm text-forest-500">{showBuiltIn ? "Hide list" : "Show list"}</span>
        </button>
        {showBuiltIn && (
          <ul className="divide-y divide-stone-100 border-t border-stone-100">
            {builtInOfferings().map((o) => {
              const hidden = hiddenOfferings.includes(o.id);
              return (
                <li key={o.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                  <span className={cn("min-w-0 flex-1", hidden && "opacity-50")}>
                    <span className="block truncate text-stone-900">{o.title}</span>
                    <span className="text-xs text-stone-400">{o.schedule}</span>
                  </span>
                  <button
                    onClick={() => {
                      toggleHiddenOffering(o.id);
                      toast(hidden ? `${o.title} is back on the site` : `${o.title} is hidden`);
                    }}
                    className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs ring-1 transition", hidden ? "text-stone-500 ring-stone-200" : "bg-sage-soft text-sage ring-sage/30")}
                  >
                    {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    {hidden ? "Hidden" : "Shown on site"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editing && <Editor initial={editing} onClose={() => setEditing(null)} />}
      <ResponsesSheet eventId={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

function Action({ icon: Icon, onClick, children }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300">
      <Icon className="size-4" /> {children}
    </button>
  );
}

/* ---------- The builder ---------- */

const toLocalDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-CA") : "");
const toLocalTime = (iso?: string) => (iso ? new Date(iso).toTimeString().slice(0, 5) : "18:00");
const combine = (date: string, time: string) => (date ? new Date(`${date}T${time || "18:00"}:00`).toISOString() : undefined);

/** Shrinks an uploaded photo so it fits comfortably in browser storage. */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function Editor({ initial, onClose }: { initial: Offering; onClose: () => void }) {
  const { saveEvent, deleteEvent, responses } = useStore();
  const [o, setO] = useState<Offering>(initial);
  const [repeats, setRepeats] = useState(!initial.date);
  const [date, setDate] = useState(toLocalDate(initial.date));
  const [time, setTime] = useState(toLocalTime(initial.date));
  const [details, setDetails] = useState(initial.description.join("\n\n"));
  const [expect, setExpect] = useState<string[]>(initial.expect.length ? initial.expect : [""]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isNew = !initial.id;
  const set = (patch: Partial<Offering>) => setO((x) => ({ ...x, ...patch }));
  const responseCount = responses.filter((r) => r.eventId === initial.id).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Everything the visitor-facing card needs, kept in sync as staff type.
  const preview: Offering = useMemo(() => {
    const iso = repeats ? undefined : combine(date, time);
    return {
      ...o,
      id: o.id || "preview",
      title: o.title || "Your event title",
      summary: o.summary || "A short description people see on the card.",
      description: details.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      expect: expect.map((e) => e.trim()).filter(Boolean),
      date: iso,
      schedule: repeats ? o.schedule : iso ? new Date(iso).toLocaleDateString("en-US", { weekday: "long" }) : "",
      tag: o.tag || (repeats ? "Ongoing" : iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "New"),
    };
  }, [o, repeats, date, time, details, expect]);

  const save = (status: "draft" | "published") => {
    const e: Record<string, string> = {};
    if (!o.title.trim()) e.title = "Give it a name.";
    if (!o.summary.trim()) e.summary = "Add a sentence about it.";
    if (!repeats && !date) e.date = "Pick a date, or switch to \"Repeats\".";
    if (repeats && !o.schedule.trim()) e.schedule = "Say when it meets, like \"Tuesdays at 6:30 PM\".";
    if (!o.location.trim()) e.location = "Where is it?";
    if (!o.hostIds.length) e.hosts = "Pick at least one host.";
    if (o.capacity !== undefined && o.capacity < 1) e.capacity = "Use a number above zero, or leave it blank.";
    setErrors(e);
    if (Object.keys(e).length) {
      toast("A few things need attention", { description: Object.values(e)[0] });
      return;
    }
    const id = saveEvent({ ...preview, id: o.id, title: o.title.trim(), summary: o.summary.trim(), status });
    toast(status === "published" ? (initial.status === "published" ? "Event updated" : "Event published") : "Draft saved", {
      description: status === "published" ? `Live at /events/${id}` : "Only staff can see it until you publish.",
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-ink" role="dialog" aria-modal aria-label={isNew ? "New event" : `Edit ${initial.title}`}>
      <header className="flex items-center gap-3 border-b border-stone-200/70 px-5 py-3 md:px-8">
        <button onClick={onClose} aria-label="Close" className="flex size-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900"><X className="size-5" /></button>
        <p className="min-w-0 flex-1 truncate font-medium">{isNew ? "New event" : `Edit · ${initial.title}`}</p>
        {!isNew && (
          confirmDelete ? (
            <span className="flex items-center gap-2 text-sm">
              <span className="hidden text-stone-500 sm:inline">{responseCount ? `Delete it and ${responseCount} responses?` : "Delete this event?"}</span>
              <button onClick={() => { deleteEvent(initial.id); toast("Event deleted"); onClose(); }} className="h-9 rounded-full bg-clay px-3.5 text-sm font-medium text-ink">Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="h-9 px-2 text-stone-500">Keep</button>
            </span>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-sm text-stone-500 hover:text-clay sm:inline-flex"><Trash2 className="size-4" /> Delete</button>
          )
        )}
        <button onClick={() => save("draft")} className="h-9 rounded-full px-4 text-sm text-stone-700 ring-1 ring-stone-200 hover:ring-stone-300">{initial.status === "published" ? "Move to drafts" : "Save draft"}</button>
        <button onClick={() => save("published")} className="h-9 rounded-full bg-forest-700 px-4 text-sm font-medium text-ink hover:bg-forest-500">{initial.status === "published" ? "Update" : "Publish"}</button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-8 md:px-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-10">
            <Group title="What is it?">
              <div className="grid gap-2 sm:grid-cols-2">
                {eventKinds.map((k) => (
                  <Choice key={k.id} on={o.area === k.area} onClick={() => set({ area: k.area, kind: k.kind })} title={k.label} body={k.blurb} />
                ))}
              </div>
              <Input label="Name" value={o.title} onChange={(v) => set({ title: v })} error={errors.title} placeholder="Fall Festival & Chili Cook-off" />
              <Input label="Short description" value={o.summary} onChange={(v) => set({ summary: v })} error={errors.summary} placeholder="One or two sentences for the event card." max={180} />
              <Area label="Details" optional value={details} onChange={setDetails} placeholder="Everything else people should know. Leave a blank line between paragraphs." />
              <Input label="Label on the photo" optional value={o.tag} onChange={(v) => set({ tag: v })} placeholder={preview.tag} max={28} />
            </Group>

            <Group title="When and where">
              <div className="flex gap-2">
                <Seg on={!repeats} onClick={() => setRepeats(false)}>One date</Seg>
                <Seg on={repeats} onClick={() => setRepeats(true)}>Repeats</Seg>
              </div>
              {repeats ? (
                <Input label="When it meets" value={o.schedule} onChange={(v) => set({ schedule: v })} error={errors.schedule} placeholder="Tuesdays at 6:30 PM" />
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input label="Date" type="date" value={date} onChange={setDate} error={errors.date} />
                  <Input label="Starts" type="time" value={time} onChange={setTime} />
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-stone-800">Length</span>
                    <select value={o.durationMin ?? 120} onChange={(e) => set({ durationMin: Number(e.target.value) })} className="h-12 w-full rounded-xl bg-white pl-3 text-[15px] ring-1 ring-stone-200">
                      {[30, 45, 60, 90, 120, 150, 180, 240, 480].map((m) => (
                        <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} hour${m === 60 ? "" : "s"}`}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              <Input label="Location" value={o.location} onChange={(v) => set({ location: v })} error={errors.location} placeholder="Rolla First · The Gym" />
            </Group>

            <Group title="Photo">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[...eventPhotos, ...(eventPhotos.some((p) => p.src === o.image) ? [] : [{ src: o.image, label: "Your photo" }])].map((p) => (
                  <button key={p.src} onClick={() => set({ image: p.src })} aria-pressed={o.image === p.src} aria-label={p.label} className={cn("overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-ink transition", o.image === p.src ? "ring-forest-700" : "ring-transparent hover:ring-stone-300")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-stone-300 text-xs text-stone-500 hover:border-forest-700 hover:text-forest-500">
                  <ImagePlus className="size-5" /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        set({ image: await resizeImage(f) });
                      } catch {
                        toast("That photo didn't work", { description: "Try a JPG or PNG." });
                      }
                    }}
                  />
                </label>
              </div>
            </Group>

            <Group title="Who's hosting?">
              <div className="flex flex-wrap gap-2">
                {staff.map((s) => {
                  const on = o.hostIds.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => set({ hostIds: on ? o.hostIds.filter((x) => x !== s.id) : [...o.hostIds, s.id] })} aria-pressed={on} className={cn("inline-flex h-10 items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-sm ring-1 transition", on ? "bg-forest-700 text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.photo} alt="" className="size-8 rounded-full object-cover object-top" />
                      {s.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
              {errors.hosts && <p className="text-[13px] text-clay">{errors.hosts}</p>}
              <div>
                <p className="mb-2 text-sm font-medium text-stone-800">Who&apos;s it for? <span className="font-normal text-stone-400">Helps us recommend it</span></p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((it) => {
                    const on = o.interests.includes(it.id);
                    return (
                      <button key={it.id} onClick={() => set({ interests: on && o.interests.length > 1 ? o.interests.filter((x) => x !== it.id) : on ? o.interests : [...o.interests, it.id as InterestId] })} aria-pressed={on} className={cn("h-9 rounded-full px-3.5 text-sm ring-1 transition", on ? "bg-forest-700 text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200")}>
                        {it.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Group>

            <Group title="What to expect" hint="Short bullet points, like what's provided or what to bring.">
              <ul className="space-y-2">
                {expect.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <input value={line} onChange={(e) => setExpect((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))} placeholder={["Free food and drinks", "Kids welcome", "Bring a lawn chair"][i % 3]} aria-label={`What to expect ${i + 1}`} className="h-11 min-w-0 flex-1 rounded-xl bg-white px-3 text-[15px] ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500" />
                    <button onClick={() => setExpect((xs) => (xs.length > 1 ? xs.filter((_, j) => j !== i) : [""]))} aria-label="Remove line" className="flex size-11 shrink-0 items-center justify-center rounded-xl text-stone-400 ring-1 ring-stone-200 hover:text-clay"><X className="size-4" /></button>
                  </li>
                ))}
              </ul>
              {expect.length < 8 && (
                <button onClick={() => setExpect((xs) => [...xs, ""])} className="inline-flex items-center gap-1.5 text-sm text-forest-500"><Plus className="size-4" /> Add a line</button>
              )}
            </Group>

            <Group title="How do people respond?">
              <div className="grid gap-2 sm:grid-cols-3">
                {responseTypes.map((r) => (
                  <Choice key={r.id} on={o.actionKind === r.id} onClick={() => set({ actionKind: r.id, action: r.action, cta: r.cta })} title={r.label} body={r.blurb} />
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Limit" optional type="number" value={o.capacity ? String(o.capacity) : ""} onChange={(v) => set({ capacity: v ? Math.max(0, parseInt(v, 10) || 0) : undefined })} error={errors.capacity} placeholder="No limit" hint="Total people, guests included" />
                <Input label="Sign-ups close" optional type="date" value={toLocalDate(o.closesAt)} onChange={(v) => set({ closesAt: v ? new Date(`${v}T23:59:00`).toISOString() : undefined })} />
              </div>
              {o.actionKind !== "join" && (
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-700">
                  <input type="checkbox" checked={!!o.allowGuests} onChange={(e) => set({ allowGuests: e.target.checked })} className="size-4 accent-[#0285ff]" />
                  Let people bring guests
                </label>
              )}
              <Input label="Ask one question" optional value={o.question ?? ""} onChange={(v) => set({ question: v || undefined })} placeholder="Bringing a dish? Any food allergies?" />
              {o.question && (
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-700">
                  <input type="checkbox" checked={!!o.questionRequired} onChange={(e) => set({ questionRequired: e.target.checked })} className="size-4 accent-[#0285ff]" />
                  Require an answer
                </label>
              )}
            </Group>

            <Group title="After they respond">
              <Input label="Confirmation headline" value={o.confirmTitle} onChange={(v) => set({ confirmTitle: v })} placeholder="You're on the list!" />
              <Area label="Confirmation message" value={o.confirmBody} onChange={(v) => set({ confirmBody: v })} placeholder="Anything they should know before they come." />
            </Group>
          </div>

          {/* Live preview */}
          <aside className="space-y-3 lg:sticky lg:top-8 lg:self-start">
            <p className="text-sm font-medium text-stone-500">How it looks on the Events page</p>
            <div className="pointer-events-none">
              <OfferingCard o={preview} />
            </div>
            <p className="text-xs text-stone-400">
              {o.capacity ? `Up to ${o.capacity} people · ` : ""}
              Button says &ldquo;{o.action}&rdquo;
              {o.question ? ` · asks "${o.question}"` : ""}
            </p>
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.01em] text-stone-900">{title}</h2>
        {hint && <p className="text-sm text-stone-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Choice({ on, onClick, title, body }: { on: boolean; onClick: () => void; title: string; body: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={cn("rounded-2xl p-4 text-left ring-1 transition", on ? "bg-forest-50 ring-2 ring-forest-700" : "bg-white ring-stone-200 hover:ring-stone-300")}>
      <span className="block text-sm font-medium text-stone-900">{title}</span>
      <span className="mt-1 block text-xs leading-relaxed text-stone-500">{body}</span>
    </button>
  );
}

function Seg({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={cn("h-10 rounded-full px-4 text-sm ring-1 transition", on ? "bg-forest-700 font-medium text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200")}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, error, placeholder, optional, type = "text", hint, max }: { label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string; optional?: boolean; type?: string; hint?: string; max?: number }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-baseline justify-between text-sm font-medium text-stone-800">
        {label}
        {optional ? <span className="text-xs font-normal text-stone-400">Optional</span> : max ? <span className="text-xs font-normal text-stone-400">{value.length}/{max}</span> : null}
      </span>
      <input
        type={type}
        value={value}
        maxLength={max}
        min={type === "number" ? 1 : undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={cn("h-12 w-full rounded-xl bg-white px-3 text-[15px] text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500", error && "ring-clay")}
      />
      {error ? <span className="block text-[13px] text-clay">{error}</span> : hint ? <span className="block text-[13px] text-stone-500">{hint}</span> : null}
    </label>
  );
}

function Area({ label, value, onChange, placeholder, optional }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-baseline justify-between text-sm font-medium text-stone-800">
        {label}
        {optional && <span className="text-xs font-normal text-stone-400">Optional</span>}
      </span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-28 w-full resize-y rounded-xl bg-white p-3 text-[15px] leading-relaxed text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500" />
    </label>
  );
}

/* ---------- Who's coming ---------- */

function ResponsesSheet({ eventId, onClose }: { eventId: string | null; onClose: () => void }) {
  const { events, responses, removeResponse } = useStore();
  const [shownId, setShownId] = useState(eventId);
  if (eventId && eventId !== shownId) setShownId(eventId);
  const o = events.find((e) => e.id === (eventId ?? shownId));
  const rs: EventResponse[] = o ? responses.filter((r) => r.eventId === o.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) : [];
  const n = headcount(rs);

  const exportCsv = () => {
    if (!o) return;
    const head = ["Name", "Email or phone", "Guests", "Total", ...(o.question ? [o.question] : []), "Note", "Responded"];
    const lines = rs.map((r) => [r.name, r.contact, r.guests, 1 + r.guests, ...(o.question ? [r.answer ?? ""] : []), r.message ?? "", new Date(r.createdAt).toLocaleString("en-US")]);
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${o.id}-responses.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Responses downloaded", { description: `${rs.length} responses · ${n} people` });
  };

  const copyContacts = async () => {
    const list = rs.map((r) => r.contact).filter(Boolean).join(", ");
    try {
      await navigator.clipboard.writeText(list);
      toast("Copied", { description: "Paste into the To or BCC line of an email or text." });
    } catch {
      toast("Couldn't copy", { description: list.slice(0, 120) });
    }
  };

  return (
    <Sheet open={!!eventId} onOpenChange={(v) => !v && onClose()} side="right" title={o ? `${o.title} responses` : "Responses"}>
      {o && (
        <div className="min-h-0 flex-1 overflow-y-auto p-5 pt-2 md:p-6 md:pt-2">
          <p className="text-sm text-stone-500">{whenText(o)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70">
              <p className="text-xs text-stone-500">People coming</p>
              <p className="mt-1 text-[28px] font-semibold leading-none">{n}</p>
              <p className="mt-1 text-xs text-stone-400">{rs.length} responses{o.capacity ? ` · ${Math.max(0, o.capacity - n)} spots left` : ""}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70">
              <p className="text-xs text-stone-500">{o.question ? "Answered your question" : "Bringing guests"}</p>
              <p className="mt-1 text-[28px] font-semibold leading-none">{o.question ? rs.filter((r) => r.answer).length : rs.filter((r) => r.guests).length}</p>
              <p className="mt-1 truncate text-xs text-stone-400">{o.question ?? "of everyone who responded"}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Action icon={Download} onClick={exportCsv}>Download</Action>
            <Action icon={Copy} onClick={copyContacts}>Copy emails &amp; phones</Action>
          </div>
          {rs.length === 0 ? (
            <p className="mt-6 text-sm text-stone-500">No responses yet. Share the link: /events/{o.id}</p>
          ) : (
            <ul className="mt-5 divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200/70">
              {rs.map((r) => (
                <li key={r.id} className="flex items-start gap-3 p-4 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">
                      {r.name}
                      {r.guests ? <span className="font-normal text-stone-500"> + {r.guests}</span> : null}
                      {r.isYou && <span className="ml-2 rounded-full bg-honey-soft px-1.5 py-0.5 text-[10px] font-semibold text-honey">YOU</span>}
                    </p>
                    <p className="truncate text-xs text-stone-400">{r.contact} · {timeAgo(r.createdAt)}</p>
                    {r.answer && <p className="mt-1.5 text-stone-700">&ldquo;{r.answer}&rdquo;</p>}
                  </div>
                  <button onClick={() => { removeResponse(r.id); toast(`${r.name} removed`); }} aria-label={`Remove ${r.name}`} className="flex size-8 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-clay"><X className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-stone-400">Hosted by {o.hostIds.map((id) => staffById[id]?.name.split(" ")[0]).filter(Boolean).join(" & ")}</p>
        </div>
      )}
    </Sheet>
  );
}
