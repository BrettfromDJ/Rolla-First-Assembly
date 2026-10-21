"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Camera, EyeOff, Megaphone, Plus, Trash2, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { clock, clockFull, sundayLine, type AlertTone, type Announcement, type SiteAlert, type SiteSettings, type SiteStaff } from "@/lib/site";
import { cn, timeAgo, uid } from "@/lib/utils";
import { ACTING_AS } from "./helpers";
import { Area, Group, Input, resizeImage } from "./events";

const presets = (live: string): { label: string; message: string; tone: AlertTone }[] => [
  { label: "Cancelled for snow", message: `Services are cancelled today because of snow and ice. Join us online at ${live}.`, tone: "urgent" },
  { label: "Online only", message: `We're meeting online only this Sunday. Watch live at ${live}.`, tone: "urgent" },
  { label: "Delayed start", message: "Bad roads this morning: we're starting one hour late. Stay safe out there.", tone: "urgent" },
  { label: "Office closed", message: "The church office is closed today. Leave a message and we'll call you back tomorrow.", tone: "info" },
];

type Draft = Omit<SiteSettings, "alert" | "updatedAt" | "updatedBy">;
const draftOf = (s: SiteSettings): Draft => ({ sunday: s.sunday, wednesday: s.wednesday, phone: s.phone, email: s.email, address: s.address, city: s.city, announcements: s.announcements, staff: s.staff });

/** Staff edit the public website here: alert banner, service times, announcements, staff and contact info. */
export function SiteEditor() {
  const { site, updateSite, hydrated } = useStore();
  const [draft, setDraft] = useState<Draft>(() => draftOf(site));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const saved = JSON.stringify(draftOf(site));
  const dirty = hydrated && JSON.stringify(draft) !== saved;

  // Pick up the saved settings once they load (and after saving).
  useEffect(() => {
    setDraft(draftOf(site));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, saved]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const setAnn = (id: string, patch: Partial<Announcement>) => set({ announcements: draft.announcements.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const setStaff = (id: string, patch: Partial<SiteStaff>) => set({ staff: draft.staff.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const moveStaff = (i: number, by: number) => {
    const list = [...draft.staff];
    const [p] = list.splice(i, 1);
    list.splice(i + by, 0, p);
    set({ staff: list });
  };

  const save = () => {
    const e: Record<string, string> = {};
    if (draft.sunday[1] <= draft.sunday[0]) e.sunday = "The second service needs to start after the first.";
    draft.announcements.forEach((a) => {
      if (a.published && !a.title.trim()) e[`ann-${a.id}`] = "Give it a title, or turn it off.";
    });
    draft.staff.forEach((s) => {
      if (!s.name.trim()) e[`staff-${s.id}`] = "Add a name.";
    });
    if (!draft.phone.trim()) e.phone = "Add a phone number.";
    if (!draft.email.includes("@")) e.email = "Add an email address.";
    setErrors(e);
    if (Object.keys(e).length) {
      toast("A few things need attention", { description: Object.values(e)[0] });
      return;
    }
    updateSite(draft, ACTING_AS);
    toast("Website updated", { description: "Your changes are live on the site." });
  };

  const live = draft.announcements.filter((a) => a.published).length;

  return (
    <div className="pb-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">Website</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">Site editor</h1>
          <p className="mt-1 text-sm text-stone-500" suppressHydrationWarning>
            {hydrated && site.updatedAt ? `Last updated by ${staffById[site.updatedBy ?? ""]?.name.split(" ")[0] ?? "staff"} ${timeAgo(site.updatedAt).toLowerCase()}` : "Change what visitors see, no code needed."}
          </p>
        </div>
        <Link href="/" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300">
          View site <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="max-w-4xl space-y-14">
        <AlertEditor />

        {/* Service times */}
        <Group title="Service times" hint="Shown on the homepage, Plan a visit, Kids, Students, Sermons and the footer.">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="First Sunday service" type="time" value={draft.sunday[0]} onChange={(v) => set({ sunday: [v, draft.sunday[1]] })} />
            <Input label="Second Sunday service" type="time" value={draft.sunday[1]} onChange={(v) => set({ sunday: [draft.sunday[0], v] })} error={errors.sunday} />
            <Input label="Wednesday night" type="time" value={draft.wednesday} onChange={(v) => set({ wednesday: v })} />
          </div>
          <p className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Visitors will see: <span className="font-medium text-stone-900">Sundays at {sundayLine({ ...site, ...draft })} · Wednesdays at {clockFull(draft.wednesday)}</span>
          </p>
        </Group>

        {/* Announcements */}
        <Group title="Homepage announcements" hint={`${live} showing on the homepage, under service times. Each one hides itself after its end date.`}>
          {draft.announcements.length === 0 && <p className="rounded-2xl border border-dashed border-stone-200 px-4 py-6 text-center text-sm text-stone-400">No announcements. The homepage section hides when there are none.</p>}
          <ul className="space-y-3">
            {draft.announcements.map((a) => (
              <li key={a.id} className={cn("rounded-[28px] p-5 ring-1 transition md:p-6", a.published ? "bg-white ring-stone-200" : "bg-stone-50 ring-stone-200/60")}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", a.published ? "text-forest-500" : "text-stone-400")}>
                    {a.published ? <><span className="size-1.5 rounded-full bg-forest-500" /> Showing</> : <><EyeOff className="size-3.5" /> Hidden</>}
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch on={a.published} onChange={(v) => setAnn(a.id, { published: v })} label={`Show "${a.title || "announcement"}" on the homepage`} />
                    <button onClick={() => set({ announcements: draft.announcements.filter((x) => x.id !== a.id) })} aria-label="Delete announcement" className="flex size-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-clay">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Input label="Title" value={a.title} onChange={(v) => setAnn(a.id, { title: v })} error={errors[`ann-${a.id}`]} max={60} placeholder="Fall Festival is coming" />
                  <Area label="Details" value={a.body} onChange={(v) => setAnn(a.id, { body: v })} optional placeholder="One or two sentences." />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input label="Button text" value={a.linkLabel ?? ""} onChange={(v) => setAnn(a.id, { linkLabel: v })} optional placeholder="Learn more" />
                    <Input label="Button link" value={a.href ?? ""} onChange={(v) => setAnn(a.id, { href: v })} optional placeholder="/events" />
                    <Input label="Show until" type="date" value={a.until ?? ""} onChange={(v) => setAnn(a.id, { until: v || undefined })} optional />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => set({ announcements: [...draft.announcements, { id: uid("ann"), title: "", body: "", published: true, createdAt: new Date().toISOString() }] })}
            className="flex w-full items-center justify-center gap-2 rounded-[28px] border-2 border-dashed border-stone-200 py-4 text-sm text-stone-500 transition hover:border-stone-300 hover:text-stone-800"
          >
            <Plus className="size-4" /> Add announcement
          </button>
        </Group>

        {/* Staff */}
        <Group title="Pastors & leadership" hint="The homepage shows everyone switched on, in this order. Bios appear over their photo.">
          <ul className="grid gap-3 md:grid-cols-2">
            {draft.staff.map((s, i) => (
              <li key={s.id} className={cn("rounded-[28px] p-5 ring-1 transition", s.onSite ? "bg-white ring-stone-200" : "bg-stone-50 ring-stone-200/60")}>
                <div className="flex items-start gap-4">
                  <label className="group relative shrink-0 cursor-pointer" title="Change photo">
                    {s.photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={s.photo} alt="" className={cn("h-24 w-[68px] rounded-2xl object-cover object-top", !s.onSite && "opacity-50")} />
                    ) : (
                      <Avatar name={s.name || "?"} className="h-24 w-[68px] rounded-2xl text-lg" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                      <Camera className="size-5 text-paper" />
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      aria-label={`Upload a photo of ${s.name || "this person"}`}
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                          setStaff(s.id, { photo: await resizeImage(f, 680) });
                        } catch {
                          toast("That photo didn't work", { description: "Try a JPG or PNG." });
                        }
                      }}
                    />
                  </label>
                  <div className="min-w-0 flex-1 space-y-2">
                    <SmallInput value={s.name} onChange={(v) => setStaff(s.id, { name: v })} placeholder="Full name" label="Name" strong error={errors[`staff-${s.id}`]} />
                    <SmallInput value={s.role} onChange={(v) => setStaff(s.id, { role: v })} placeholder="Role" label="Role" />
                    <SmallInput value={s.email ?? ""} onChange={(v) => setStaff(s.id, { email: v })} placeholder="Email" label="Email" />
                  </div>
                </div>
                <textarea
                  value={s.bio ?? ""}
                  onChange={(e) => setStaff(s.id, { bio: e.target.value })}
                  maxLength={180}
                  placeholder="A short bio (optional): family, how long they've been here, what they love."
                  aria-label={`Bio for ${s.name}`}
                  className="mt-3 min-h-20 w-full resize-y rounded-xl bg-stone-50 p-3 text-sm leading-relaxed text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-stone-600">
                    <Switch on={s.onSite} onChange={(v) => setStaff(s.id, { onSite: v })} label={`Show ${s.name} on the homepage`} />
                    {s.onSite ? "On the homepage" : "Hidden"}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconButton label="Move earlier" disabled={i === 0} onClick={() => moveStaff(i, -1)}><ArrowUp className="size-4" /></IconButton>
                    <IconButton label="Move later" disabled={i === draft.staff.length - 1} onClick={() => moveStaff(i, 1)}><ArrowDown className="size-4" /></IconButton>
                    {s.custom && <IconButton label={`Remove ${s.name}`} onClick={() => set({ staff: draft.staff.filter((x) => x.id !== s.id) })}><Trash2 className="size-4" /></IconButton>}
                  </span>
                </div>
              </li>
            ))}
            <li>
              <button
                onClick={() => set({ staff: [...draft.staff, { id: uid("staff"), name: "", role: "", photo: "", email: "", onSite: true, custom: true }] })}
                className="flex size-full min-h-40 items-center justify-center gap-2 rounded-[28px] border-2 border-dashed border-stone-200 text-sm text-stone-500 transition hover:border-stone-300 hover:text-stone-800"
              >
                <Plus className="size-4" /> Add a person
              </button>
            </li>
          </ul>
        </Group>

        {/* Contact */}
        <Group title="Contact & address" hint="Used in the footer and on Plan a visit.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Phone" type="tel" value={draft.phone} onChange={(v) => set({ phone: v })} error={errors.phone} />
            <Input label="Email" type="email" value={draft.email} onChange={(v) => set({ email: v })} error={errors.email} />
            <Input label="Street address" value={draft.address} onChange={(v) => set({ address: v })} />
            <Input label="City, state, ZIP" value={draft.city} onChange={(v) => set({ city: v })} />
          </div>
        </Group>
      </div>

      {/* Save bar */}
      <div className={cn("fixed inset-x-0 bottom-0 z-30 transition-[transform,visibility] duration-300 lg:left-[248px]", dirty ? "visible translate-y-0" : "invisible translate-y-full")} aria-hidden={!dirty}>
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 pb-5 md:px-8">
          <div className="flex w-full items-center gap-2 rounded-[28px] bg-white p-3 pl-5 shadow-soft ring-1 ring-stone-200 sm:gap-3">
            <p className="mr-auto text-sm text-stone-700"><span className="hidden sm:inline">You have u</span><span className="sm:hidden">U</span>nsaved changes</p>
            <button onClick={() => { setDraft(draftOf(site)); setErrors({}); }} tabIndex={dirty ? 0 : -1} className="h-10 rounded-full px-4 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-900">Discard</button>
            <Button onClick={save} tabIndex={dirty ? 0 : -1}>Save &amp; publish</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Alert banner (goes live right away) ---------- */

function AlertEditor() {
  const { site, updateSite } = useStore();
  const [a, setA] = useState<SiteAlert>(site.alert);
  const savedKey = JSON.stringify(site.alert);
  useEffect(() => setA(site.alert), [savedKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const changed = JSON.stringify(a) !== savedKey;

  const publish = (next: SiteAlert, msg: string) => {
    const stamped = { ...next, updatedAt: new Date().toISOString(), by: ACTING_AS };
    const before = site.alert;
    updateSite({ alert: stamped }, ACTING_AS);
    toast(msg, next.on ? { description: "It's at the top of every page.", action: { label: "Undo", onClick: () => updateSite({ alert: before }, ACTING_AS) } } : undefined);
  };

  return (
    <section className={cn("rounded-[28px] p-5 ring-1 md:p-7", site.alert.on ? "bg-[#f2b134]/10 ring-[#f2b134]/60" : "bg-white ring-stone-200")} aria-labelledby="alert-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="alert-title" className="flex items-center gap-2 text-lg font-semibold tracking-[-0.01em] text-stone-900">
            <TriangleAlert className="size-5 text-[#f2b134]" /> Alert banner
          </h2>
          <p className="text-sm text-stone-500">
            {site.alert.on ? <span className="font-medium text-[#f2b134]">Live now on every page.</span> : "Off. Use it for weather, closings and last-minute changes."}
          </p>
        </div>
        {site.alert.on && (
          <Button variant="secondary" onClick={() => publish({ ...site.alert, on: false }, "Alert turned off")}>
            <X /> Turn off
          </Button>
        )}
      </div>

      {!site.alert.on && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-stone-800">One click to go live</p>
          <div className="flex flex-wrap gap-2">
            {presets(clock(site.sunday[1])).map((p) => (
              <button
                key={p.label}
                onClick={() => publish({ on: true, tone: p.tone, message: p.message, href: p.tone === "urgent" ? "/sermons" : undefined, linkLabel: p.tone === "urgent" ? "Watch online" : undefined }, "Alert is live")}
                className="h-10 rounded-full px-4 text-sm text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-50 hover:ring-stone-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3 border-t border-stone-100 pt-6">
        <Input label="Message" value={a.message} onChange={(v) => setA({ ...a, message: v })} max={140} placeholder="Services are cancelled today because of snow." />
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input label="Link text" value={a.linkLabel ?? ""} onChange={(v) => setA({ ...a, linkLabel: v || undefined })} optional placeholder="Watch online" />
          <Input label="Link" value={a.href ?? ""} onChange={(v) => setA({ ...a, href: v || undefined })} optional placeholder="/sermons" />
          <div className="space-y-2">
            <span className="block text-sm font-medium text-stone-800">Style</span>
            <div className="flex h-12 rounded-xl bg-stone-50 p-1 ring-1 ring-stone-200">
              {(["urgent", "info"] as const).map((t) => (
                <button key={t} onClick={() => setA({ ...a, tone: t })} aria-pressed={a.tone === t} className={cn("flex items-center gap-1.5 rounded-lg px-3 text-sm transition", a.tone === t ? "bg-white font-medium text-stone-900 shadow-sm ring-1 ring-stone-200" : "text-stone-500")}>
                  {t === "urgent" ? <TriangleAlert className="size-3.5" /> : <Megaphone className="size-3.5" />}
                  {t === "urgent" ? "Urgent" : "Heads up"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {a.message.trim() && (
          <div aria-label="Preview" className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-black", a.tone === "urgent" ? "bg-[#f2b134]" : "bg-[#dcd2c5]")}>
            {a.tone === "urgent" ? <TriangleAlert className="size-4 shrink-0" /> : <Megaphone className="size-4 shrink-0" />}
            <span className="font-mori font-semibold">{a.message}</span>
            {a.href && <span className="font-mori font-semibold underline underline-offset-4">{a.linkLabel || "Learn more"}</span>}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          {site.alert.on ? (
            <Button onClick={() => publish({ ...a, on: true }, "Alert updated")} disabled={!changed || !a.message.trim()}>Update alert</Button>
          ) : (
            <Button onClick={() => publish({ ...a, on: true }, "Alert is live")} disabled={!a.message.trim()}>Turn on alert</Button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Small parts ---------- */

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-forest-700" : "bg-stone-200")}>
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-paper transition-all", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

function SmallInput({ value, onChange, placeholder, label, strong, error }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; strong?: boolean; error?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      aria-invalid={!!error}
      title={error}
      className={cn(
        "h-9 w-full rounded-lg bg-transparent px-2 text-sm ring-1 ring-transparent transition placeholder:text-stone-400 hover:ring-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500",
        strong ? "text-[16px] font-medium text-stone-900" : "text-stone-600",
        error && "ring-clay",
      )}
    />
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="flex size-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-800 disabled:opacity-30 disabled:hover:bg-transparent">
      {children}
    </button>
  );
}
