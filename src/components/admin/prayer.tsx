"use client";

import { useState } from "react";
import { Archive, Check, Download, Eye, EyeOff, HandHeart, Heart, Inbox, Lock, MessageSquarePlus, PhoneCall, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { staff, staffById } from "@/lib/data";
import { prayerCategories, prayerCategoryLabel, prayerVisibility, publicName } from "@/lib/prayer";
import { useStore } from "@/lib/store";
import type { PrayerCategory, PrayerRequest } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { ACTING_AS } from "./helpers";

type Box = "inbox" | "call" | "wall" | "answered" | "archived" | "all";

const visIcon = { pastors: Lock, team: Users, wall: HandHeart } as const;
const pastors = staff.filter((s) => /pastor/i.test(s.role));

const needsCall = (p: PrayerRequest) => p.wantsContact && !p.contacted && p.status !== "archived";
const awaitingWall = (p: PrayerRequest) => p.visibility === "wall" && !p.wallApproved && p.status !== "archived";

/** Staff inbox for prayer requests: triage, approve for the wall, follow up, and keep notes. */
export function PrayerView({ query }: { query: string }) {
  const { prayers, hydrated } = useStore();
  const [box, setBox] = useState<Box>("inbox");
  const [category, setCategory] = useState<PrayerCategory | "">("");

  const counts = {
    inbox: prayers.filter((p) => p.status === "new" || p.status === "praying").length,
    newCount: prayers.filter((p) => p.status === "new").length,
    call: prayers.filter(needsCall).length,
    wall: prayers.filter(awaitingWall).length,
    answered: prayers.filter((p) => p.status === "answered").length,
    archived: prayers.filter((p) => p.status === "archived").length,
  };

  const q = query.trim().toLowerCase();
  const inBox = (p: PrayerRequest) =>
    box === "all" ||
    (box === "inbox" && (p.status === "new" || p.status === "praying")) ||
    (box === "call" && needsCall(p)) ||
    (box === "wall" && awaitingWall(p)) ||
    (box === "answered" && p.status === "answered") ||
    (box === "archived" && p.status === "archived");
  const visible = prayers
    .filter((p) => inBox(p) && (!category || p.category === category) && (!q || `${p.name} ${p.body} ${p.contact ?? ""}`.toLowerCase().includes(q)))
    .sort((a, b) => Number(b.status === "new") - Number(a.status === "new") || +new Date(b.createdAt) - +new Date(a.createdAt));

  const exportTeamList = () => {
    const list = prayers.filter((p) => p.visibility !== "pastors" && (p.status === "new" || p.status === "praying" || p.status === "answered") && (p.visibility !== "wall" || p.wallApproved || p.status !== "new"));
    const head = ["Date", "Name", "Category", "Request", "Update", "Status"];
    const lines = list.map((p) => [new Date(p.createdAt).toLocaleDateString("en-US"), publicName(p), prayerCategoryLabel(p.category), p.body, p.update?.body ?? "", p.status === "answered" ? "Answered" : "Praying"]);
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `prayer-team-list-${new Date().toLocaleDateString("en-CA")}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Prayer team list downloaded", { description: `${list.length} requests · pastors-only requests left out · first names only` });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Inbox} label="New requests" value={counts.newCount} sub="Not yet prayed over" ready={hydrated} warn={counts.newCount > 0} onClick={() => setBox("inbox")} />
        <Stat icon={PhoneCall} label="Want a call" value={counts.call} sub="Asked a pastor to reach out" ready={hydrated} warn={counts.call > 0} onClick={() => setBox("call")} />
        <Stat icon={Eye} label="Waiting for the wall" value={counts.wall} sub="Approve before it's public" ready={hydrated} warn={counts.wall > 0} onClick={() => setBox("wall")} />
        <Stat icon={Sparkles} label="Answered" value={counts.answered} sub="Praise reports to celebrate" ready={hydrated} onClick={() => setBox("answered")} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([
          ["inbox", "Praying", counts.inbox],
          ["call", "Want a call", counts.call],
          ["wall", "Wall approval", counts.wall],
          ["answered", "Answered", counts.answered],
          ["archived", "Archived", counts.archived],
          ["all", "All", prayers.length],
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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PrayerCategory | "")}
          aria-label="Category"
          className="h-10 rounded-full bg-white pl-4 pr-10 text-sm text-stone-700 ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500"
        >
          <option value="">All topics</option>
          {prayerCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <button onClick={exportTeamList} className="ml-auto flex h-10 items-center gap-2 rounded-full px-4 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300">
          <Download className="size-4" /> Prayer team list
        </button>
      </div>

      {!hydrated ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-stone-200/70" />)}</div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-stone-200/70">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400"><HandHeart className="size-5" /></span>
          <p className="mt-4 font-medium">{q ? "Nothing matches that search" : box === "call" ? "No one is waiting on a call" : box === "wall" ? "Nothing waiting for approval" : "Nothing here"}</p>
          <p className="mt-1 text-sm text-stone-500">New requests from the Prayer page land here right away.</p>
        </div>
      ) : (
        <ul className="grid gap-4 2xl:grid-cols-2">
          {visible.map((p) => (
            <RequestCard key={p.id} p={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestCard({ p }: { p: PrayerRequest }) {
  const { patchPrayer, addPrayerNote } = useStore();
  const [noting, setNoting] = useState(false);
  const [note, setNote] = useState("");
  const [answering, setAnswering] = useState(false);
  const [answer, setAnswer] = useState("");
  const vis = prayerVisibility.find((v) => v.id === p.visibility)!;
  const VisIcon = visIcon[p.visibility];
  const who = p.anonymous || !p.name ? "Anonymous" : p.name;

  const set = (patch: Parameters<typeof patchPrayer>[1], msg: string) => {
    patchPrayer(p.id, patch);
    toast(msg);
  };

  return (
    <li className={cn("flex flex-col rounded-2xl bg-white p-5 ring-1", p.status === "new" ? "ring-forest-700/60" : "ring-stone-200/70", p.status === "archived" && "opacity-60")}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar name={who} className={cn(p.anonymous && "bg-stone-100 text-stone-500")} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-stone-900">
            {who}
            {p.isYou && <span className="rounded-full bg-honey-soft px-1.5 py-0.5 text-[10px] font-semibold text-honey">YOU</span>}
            {p.status === "new" && <span className="rounded-full bg-forest-700 px-2 py-0.5 text-[10px] font-semibold uppercase text-ink">New</span>}
            {p.status === "answered" && <span className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-[11px] font-medium text-sage"><Sparkles className="size-3" /> Answered</span>}
          </p>
          <p className="mt-0.5 text-xs text-stone-400">
            {prayerCategoryLabel(p.category)} · {timeAgo(p.createdAt)}
            {p.contact ? ` · ${p.contact}` : ""}
          </p>
        </div>
        <span
          title={vis.body}
          className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs", p.visibility === "pastors" ? "bg-clay-soft text-clay" : "bg-stone-100 text-stone-600")}
        >
          <VisIcon className="size-3.5" /> {vis.label}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-stone-800">{p.body}</p>

      {p.update && (
        <div className="mt-3 rounded-xl bg-stone-50 p-3 text-sm">
          <p className="text-xs font-medium text-forest-500">Update {p.update.by === "requester" ? "from them" : `from ${staffById[p.update.by]?.name.split(" ")[0] ?? "staff"}`} · {timeAgo(p.update.at)}</p>
          <p className="mt-1 text-stone-700">{p.update.body}</p>
        </div>
      )}

      {/* Flags */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {p.wantsContact && (
          <button
            onClick={() => set({ contacted: !p.contacted }, p.contacted ? "Marked as not yet contacted" : `Marked ${who === "Anonymous" ? "them" : who.split(" ")[0]} as contacted`)}
            aria-pressed={!!p.contacted}
            className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 ring-1 transition", p.contacted ? "bg-sage-soft text-sage ring-sage/30" : "bg-clay-soft text-clay ring-clay/30 hover:ring-clay")}
          >
            {p.contacted ? <Check className="size-3.5" /> : <PhoneCall className="size-3.5" />}
            {p.contacted ? "Contacted" : "Wants a call · mark contacted"}
          </button>
        )}
        {p.visibility === "wall" && p.wallApproved && (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-stone-100 px-3 text-stone-600">
            <Heart className="size-3.5" /> {p.prayedCount} prayed on the wall
          </span>
        )}
        <label className="inline-flex h-8 items-center gap-1.5 rounded-full bg-stone-100 pl-3 text-stone-600">
          <span>Pastor</span>
          <select
            value={p.assigneeId ?? ""}
            onChange={(e) => set({ assigneeId: e.target.value || null }, e.target.value ? `Assigned to ${staffById[e.target.value].name}` : "Unassigned")}
            aria-label="Assigned pastor"
            className="h-8 rounded-full bg-transparent pl-1 pr-8 text-xs text-stone-800 focus:outline-none"
          >
            <option value="">Unassigned</option>
            {pastors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Notes */}
      {p.notes.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-stone-100 pt-3">
          {p.notes.map((n) => (
            <li key={n.id} className="text-sm">
              <span className="font-medium text-stone-800">{staffById[n.authorId]?.name.split(" ")[0] ?? n.authorId}</span>
              <span className="text-xs text-stone-400"> · {timeAgo(n.createdAt)} · staff only</span>
              <p className="text-stone-600">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
      {noting && (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && note.trim()) {
                addPrayerNote(p.id, note.trim(), ACTING_AS);
                setNote("");
                setNoting(false);
              }
            }}
            placeholder="Private note for staff…"
            aria-label="Staff note"
            className="h-10 min-w-0 flex-1 rounded-xl bg-stone-50 px-3 text-sm ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <button
            onClick={() => {
              if (!note.trim()) return;
              addPrayerNote(p.id, note.trim(), ACTING_AS);
              setNote("");
              setNoting(false);
            }}
            className="h-10 rounded-xl bg-forest-700 px-4 text-sm font-medium text-ink"
          >
            Save
          </button>
        </div>
      )}
      {answering && (
        <div className="mt-3 space-y-2">
          <input
            autoFocus
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="What happened? (optional, shown with the request)"
            aria-label="Answered prayer update"
            className="h-10 w-full rounded-xl bg-stone-50 px-3 text-sm ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                patchPrayer(p.id, { status: "answered", ...(answer.trim() ? { update: { body: answer.trim(), at: new Date().toISOString(), by: ACTING_AS } } : {}) });
                setAnswering(false);
                toast("Marked as answered", { description: "Praise God!" });
              }}
              className="h-9 rounded-xl bg-forest-700 px-4 text-sm font-medium text-ink"
            >
              Mark answered
            </button>
            <button onClick={() => setAnswering(false)} className="h-9 px-3 text-sm text-stone-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {awaitingWall(p) && (
          <>
            <Action primary icon={Eye} onClick={() => set({ wallApproved: true, status: p.status === "new" ? "praying" : p.status }, "Posted to the prayer wall")}>Approve for wall</Action>
            <Action icon={EyeOff} onClick={() => set({ visibility: "team" }, "Kept off the wall. Shared with the prayer team only.")}>Keep off wall</Action>
          </>
        )}
        {p.status === "new" && !awaitingWall(p) && <Action primary icon={HandHeart} onClick={() => set({ status: "praying" }, "Marked as prayed over")}>Mark prayed over</Action>}
        {(p.status === "new" || p.status === "praying") && !answering && <Action icon={Sparkles} onClick={() => { setAnswer(""); setAnswering(true); }}>Answered</Action>}
        {p.visibility === "wall" && p.wallApproved && p.status !== "archived" && <Action icon={EyeOff} onClick={() => set({ wallApproved: false, visibility: "team" }, "Removed from the prayer wall")}>Remove from wall</Action>}
        {!noting && <Action icon={MessageSquarePlus} onClick={() => setNoting(true)}>Note</Action>}
        {p.status !== "archived" ? (
          <Action icon={Archive} onClick={() => set({ status: "archived", ...(p.visibility === "wall" ? { wallApproved: false } : {}) }, "Archived")}>Archive</Action>
        ) : (
          <Action icon={Inbox} onClick={() => set({ status: "praying" }, "Moved back to Praying")}>Restore</Action>
        )}
      </div>
    </li>
  );
}

function Action({ icon: Icon, onClick, children, primary }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm transition", primary ? "bg-forest-700 font-medium text-ink hover:bg-forest-500" : "text-stone-600 ring-1 ring-stone-200 hover:text-stone-900 hover:ring-stone-300")}
    >
      <Icon className="size-4" />
      {children}
    </button>
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
