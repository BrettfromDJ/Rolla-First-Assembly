"use client";

import { useState } from "react";
import { CalendarCheck, Download, MessageSquarePlus, ShieldCheck, Sparkles, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { staffById } from "@/lib/data";
import { frequencyLabel, serveTeams, serveTimeLabel, teamById } from "@/lib/serve";
import { useStore } from "@/lib/store";
import type { BackgroundCheck, ServeSignup, ServeStatus } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { ACTING_AS } from "./helpers";

type Box = "new" | "progress" | "serving" | "not-now" | "all";

const statusLabel: Record<ServeStatus, string> = {
  new: "New",
  contacted: "Contacted",
  shadowing: "Shadowing",
  serving: "Serving",
  "not-now": "Not right now",
};
const checkLabel: Record<BackgroundCheck, string> = { needed: "Check needed", sent: "Check sent", cleared: "Check cleared" };
const ymdLabel = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/** Staff view of volunteer sign-ups: follow up, track background checks and shadow Sundays, and see which teams need people. */
export function VolunteersView({ query }: { query: string }) {
  const { serve, hydrated } = useStore();
  const [box, setBox] = useState<Box>("new");
  const [team, setTeam] = useState("");

  const inBox = (s: ServeSignup) =>
    box === "all" ||
    (box === "new" && s.status === "new") ||
    (box === "progress" && (s.status === "contacted" || s.status === "shadowing")) ||
    (box === "serving" && s.status === "serving") ||
    (box === "not-now" && s.status === "not-now");
  const q = query.trim().toLowerCase();
  const visible = serve
    .filter((s) => inBox(s) && (!team || s.teamId === team) && (!q || `${s.firstName} ${s.lastName} ${s.email} ${teamById[s.teamId].name} ${s.roles.join(" ")}`.toLowerCase().includes(q)))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const counts = {
    new: serve.filter((s) => s.status === "new").length,
    progress: serve.filter((s) => s.status === "contacted" || s.status === "shadowing").length,
    serving: serve.filter((s) => s.status === "serving").length,
    notNow: serve.filter((s) => s.status === "not-now").length,
    checks: serve.filter((s) => s.backgroundCheck && s.backgroundCheck !== "cleared" && s.status !== "not-now").length,
    shadowing: serve.filter((s) => s.status === "shadowing").length,
  };

  const exportCsv = () => {
    const head = ["Signed up", "Team", "First name", "Last name", "Email", "Phone", "Under 18", "Roles", "Times", "How often", "Shadow first", "Status", "Background check", "Shadow date", "Experience"];
    const lines = visible.map((s) => [
      new Date(s.createdAt).toLocaleDateString("en-US"), teamById[s.teamId].name, s.firstName, s.lastName, s.email, s.phone, s.teen ? "Yes" : "No",
      s.roles.join("; "), s.times.map(serveTimeLabel).join("; "), frequencyLabel(s.frequency), s.shadowFirst ? "Yes" : "No",
      statusLabel[s.status], s.backgroundCheck ? checkLabel[s.backgroundCheck] : "", s.shadowDate ?? "", s.experience ?? "",
    ]);
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `volunteers${team ? `-${team}` : ""}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Volunteer list downloaded", { description: `${visible.length} sign-up${visible.length === 1 ? "" : "s"}` });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={UserPlus} label="New sign-ups" value={counts.new} sub="Waiting for a leader to reach out" warn={counts.new > 0} ready={hydrated} onClick={() => setBox("new")} />
        <Stat icon={ShieldCheck} label="Background checks" value={counts.checks} sub="Kids & student teams, not cleared" warn={counts.checks > 0} ready={hydrated} onClick={() => setBox("all")} />
        <Stat icon={CalendarCheck} label="Shadowing" value={counts.shadowing} sub="Trying a Sunday before joining" ready={hydrated} onClick={() => setBox("progress")} />
        <Stat icon={Sparkles} label="Joined a team" value={counts.serving} sub="From website sign-ups" ready={hydrated} onClick={() => setBox("serving")} />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {([
              ["new", "New", counts.new],
              ["progress", "In progress", counts.progress],
              ["serving", "Serving", counts.serving],
              ["not-now", "Not right now", counts.notNow],
              ["all", "All", serve.length],
            ] as const).map(([id, label, n]) => (
              <button
                key={id}
                onClick={() => setBox(id)}
                aria-pressed={box === id}
                className={cn("flex h-10 items-center gap-2 rounded-full px-4 text-sm ring-1 transition", box === id ? "bg-forest-700 font-medium text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}
              >
                {label}
                <span className={cn("rounded-full px-1.5 text-xs tabular-nums", box === id ? "bg-ink/15" : "bg-stone-100 text-stone-500")}>{hydrated ? n : "–"}</span>
              </button>
            ))}
            <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Team" className="h-10 rounded-full bg-white pl-4 pr-10 text-sm text-stone-700 ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500">
              <option value="">All teams</option>
              {serveTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button onClick={exportCsv} disabled={!visible.length} className="ml-auto flex h-10 items-center gap-2 rounded-full px-4 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300 disabled:opacity-40">
              <Download className="size-4" /> Download list
            </button>
          </div>

          {!hydrated ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-white ring-1 ring-stone-200/70" />)}</div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-stone-200/70">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400"><Users className="size-5" /></span>
              <p className="mt-4 font-medium">{q ? "No one matches that search" : "Nothing here right now"}</p>
              <p className="mt-1 text-sm text-stone-500">New sign-ups from the Serve page land here right away.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {visible.map((s) => (
                <SignupCard key={s.id} s={s} />
              ))}
            </ul>
          )}
        </div>

        {/* Team coverage */}
        <aside className="self-start rounded-2xl bg-white p-5 ring-1 ring-stone-200/70">
          <h3 className="font-medium text-stone-900">Team coverage</h3>
          <p className="text-xs text-stone-400">Volunteers serving vs. what each team needs</p>
          <ul className="mt-4 space-y-3.5">
            {[...serveTeams]
              .map((t) => ({ t, n: t.serving + serve.filter((s) => s.teamId === t.id && s.status === "serving").length }))
              .sort((a, b) => a.n / a.t.goal - b.n / b.t.goal)
              .map(({ t, n }) => {
                const pct = Math.min(1, n / t.goal);
                const short = t.goal - n;
                return (
                  <li key={t.id}>
                    <button onClick={() => { setTeam(t.id); setBox("all"); }} className="w-full text-left">
                      <span className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-stone-800">{t.name}</span>
                        <span className={cn("text-xs tabular-nums", short > 0 && pct < 0.75 ? "text-clay" : "text-stone-500")}>
                          {n}/{t.goal}
                          {short > 0 ? ` · needs ${short}` : " · full"}
                        </span>
                      </span>
                      <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-forest-100">
                        <span className="block h-full rounded-full bg-forest-700" style={{ width: `${pct * 100}%` }} />
                      </span>
                    </button>
                  </li>
                );
              })}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function SignupCard({ s }: { s: ServeSignup }) {
  const { patchServe, addServeNote } = useStore();
  const t = teamById[s.teamId];
  const [noting, setNoting] = useState(false);
  const [note, setNote] = useState("");
  const name = `${s.firstName} ${s.lastName}`;
  const saveNote = () => {
    if (!note.trim()) return;
    addServeNote(s.id, note.trim(), ACTING_AS);
    setNote("");
    setNoting(false);
  };

  return (
    <li className={cn("rounded-2xl bg-white p-5 ring-1", s.status === "new" ? "ring-forest-700/60" : "ring-stone-200/70", s.status === "not-now" && "opacity-60")}>
      <div className="flex flex-wrap items-start gap-3">
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-stone-900">
            {name}
            {s.isYou && <span className="rounded-full bg-honey-soft px-1.5 py-0.5 text-[10px] font-semibold text-honey">YOU</span>}
            {s.teen && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">Under 18</span>}
          </p>
          <p className="mt-0.5 text-xs text-stone-400">
            {s.email} · {s.phone} · signed up {timeAgo(s.createdAt).toLowerCase()}
          </p>
        </div>
        <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-medium text-forest-300">{t.name}</span>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div><dt className="text-xs text-stone-400">Wants to do</dt><dd className="text-stone-700">{s.roles.length ? s.roles.join(", ") : "Anything"}</dd></div>
        <div><dt className="text-xs text-stone-400">When</dt><dd className="text-stone-700">{s.times.map(serveTimeLabel).join(", ")}</dd></div>
        <div><dt className="text-xs text-stone-400">How often</dt><dd className="text-stone-700">{frequencyLabel(s.frequency)}{s.shadowFirst ? " · shadow first" : ""}</dd></div>
      </dl>
      {s.experience && <p className="mt-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-700">&ldquo;{s.experience}&rdquo;</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <Pick
          label="Status"
          value={s.status}
          onChange={(v) => {
            patchServe(s.id, { status: v as ServeStatus });
            toast(`${s.firstName}: ${statusLabel[v as ServeStatus]}`, { description: staffById[t.leaderId].name + " leads " + t.name });
          }}
          options={Object.entries(statusLabel).map(([v, l]) => ({ v, l }))}
        />
        {s.backgroundCheck && (
          <Pick
            label="Background"
            value={s.backgroundCheck}
            onChange={(v) => patchServe(s.id, { backgroundCheck: v as BackgroundCheck })}
            options={Object.entries(checkLabel).map(([v, l]) => ({ v, l }))}
            tone={s.backgroundCheck === "cleared" ? "good" : "warn"}
          />
        )}
        {(s.status === "shadowing" || s.status === "contacted") && (
          <label className="inline-flex h-8 items-center gap-1.5 rounded-full bg-stone-100 pl-3 pr-1 text-stone-600">
            Shadow Sunday
            <input
              type="date"
              value={s.shadowDate ?? ""}
              onChange={(e) => {
                patchServe(s.id, { shadowDate: e.target.value || undefined, ...(e.target.value && s.status === "contacted" ? { status: "shadowing" } : {}) });
                if (e.target.value) toast(`${s.firstName} shadows on ${ymdLabel(e.target.value)}`);
              }}
              aria-label="Shadow date"
              className="h-7 rounded-full bg-white px-2 text-xs text-stone-800 ring-1 ring-stone-200 focus:outline-none"
            />
          </label>
        )}
        {!noting && (
          <button onClick={() => setNoting(true)} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-stone-600 ring-1 ring-stone-200 hover:text-stone-900">
            <MessageSquarePlus className="size-3.5" /> Note
          </button>
        )}
      </div>

      {noting && (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveNote()}
            placeholder="Private note for staff…"
            aria-label="Staff note"
            className="h-10 min-w-0 flex-1 rounded-xl bg-stone-50 px-3 text-sm ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <button onClick={saveNote} className="h-10 rounded-xl bg-forest-700 px-4 text-sm font-medium text-ink">Save</button>
        </div>
      )}
      {s.notes.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-stone-100 pt-3">
          {s.notes.map((n) => (
            <li key={n.id} className="text-sm">
              <span className="font-medium text-stone-800">{staffById[n.authorId]?.name.split(" ")[0] ?? n.authorId}</span>
              <span className="text-xs text-stone-400"> · {timeAgo(n.createdAt)}</span>
              <p className="text-stone-600">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function Pick({ label, value, onChange, options, tone }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; tone?: "good" | "warn" }) {
  return (
    <label className={cn("inline-flex h-8 items-center gap-1 rounded-full pl-3", tone === "good" ? "bg-sage-soft text-sage" : tone === "warn" ? "bg-clay-soft text-clay" : "bg-stone-100 text-stone-600")}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="h-8 rounded-full bg-transparent pl-1 pr-8 text-xs font-medium focus:outline-none">
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </label>
  );
}

function Stat({ icon: Icon, label, value, sub, warn, ready, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; sub: string; warn?: boolean; ready: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-2xl bg-white p-4 text-left ring-1 ring-stone-200/70 transition hover:ring-stone-300 md:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-stone-500">{label}</span>
        <Icon className={cn("size-4", warn ? "text-clay" : "text-stone-300")} />
      </div>
      <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em]">{ready ? value : "–"}</p>
      <p className="mt-2 truncate text-xs text-stone-400">{sub}</p>
    </button>
  );
}
