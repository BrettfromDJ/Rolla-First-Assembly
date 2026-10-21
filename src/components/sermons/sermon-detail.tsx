"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Check, Headphones, Link2, Mail } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RevealGroup, Rise } from "@/components/church/motion";
import { staffById } from "@/lib/data";
import { bibleLink, seriesById, seriesSermons, sermonById, sermonDate, sermonsByDate } from "@/lib/sermons";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SermonPlayer } from "./player";
import { SeriesArt } from "./series-art";

const mori = "font-mori font-semibold";

export function SermonDetail({ id }: { id: string }) {
  const s = sermonById[id];
  const series = seriesById[s.seriesId];
  const speaker = staffById[s.speakerId];
  const inSeries = seriesSermons(s.seriesId);
  const idx = sermonsByDate.findIndex((x) => x.id === s.id);
  const newer = sermonsByDate[idx - 1];
  const older = sermonsByDate[idx + 1];

  const share = async () => {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title: s.title, text: `"${s.title}" from Rolla First`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied", { description: "Paste it anywhere to share this message." });
      }
    } catch {
      /* the share sheet was closed */
    }
  };

  return (
    <div className="overflow-x-clip bg-ink text-[#dcd2c5]">
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-5 pb-24 pt-10 md:px-[60px] md:pb-32 md:pt-14">
        <Link href="/sermons" className="inline-flex items-center gap-2 text-[15px] text-stone-500 transition hover:text-[#dcd2c5]">
          <ArrowLeft className="size-4" /> All sermons
        </Link>

        {/* ---------- Video + title ---------- */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <SermonPlayer sermon={s} />
          <div className="lg:self-end">
            <Link href={`/sermons?series=${series.id}`} className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60 transition hover:text-[#0285ff] hover:opacity-100">
              {series.title}
              {s.part ? ` · Part ${s.part}` : ""}
            </Link>
            <h1 className={cn(mori, "m-title mt-3 text-[clamp(44px,5.4vw,80px)] leading-[0.92] tracking-[-0.05em]")}>{s.title}</h1>
            <p className="mt-4 text-[16px] text-stone-500">{sermonDate(s.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
            <div className="mt-6 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={speaker.photo} alt="" width={48} height={48} className="size-12 rounded-full object-cover object-top" />
              <div>
                <p className={cn(mori, "text-[16px]")}>{speaker.name}</p>
                <p className="text-sm text-[#0285ff]">{speaker.role}</p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <a href={bibleLink(s.passage)} target="_blank" rel="noreferrer" className={cn(mori, "inline-flex h-11 items-center gap-2 rounded-[80px] border-2 border-[#dcd2c5]/40 px-5 text-[14px] uppercase tracking-[-0.04em] transition hover:border-[#dcd2c5]")}>
                <BookOpen className="size-4" /> {s.passage}
              </a>
              <button onClick={() => toast("Audio is coming soon", { description: "The podcast feed will play here once it's connected." })} className={cn(mori, "inline-flex h-11 items-center gap-2 rounded-[80px] border-2 border-[#dcd2c5]/40 px-5 text-[14px] uppercase tracking-[-0.04em] transition hover:border-[#dcd2c5]")}>
                <Headphones className="size-4" /> Listen
              </button>
              <button onClick={share} className={cn(mori, "inline-flex h-11 items-center gap-2 rounded-[80px] border-2 border-[#dcd2c5]/40 px-5 text-[14px] uppercase tracking-[-0.04em] transition hover:border-[#dcd2c5]")}>
                <Link2 className="size-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Notes ---------- */}
        <div className="mt-20 grid gap-12 md:mt-28 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <p className="max-w-2xl text-[22px] leading-[1.45] tracking-[-0.01em] md:text-[26px]">{s.summary}</p>

            <h2 className={cn(mori, "mt-14 text-[clamp(32px,3.4vw,48px)] leading-[0.95] tracking-[-0.05em]")}>Big ideas</h2>
            <ol className="mt-6 border-t border-[#dcd2c5]/15">
              {s.points.map((pt, i) => (
                <li key={i} className="flex gap-6 border-b border-[#dcd2c5]/15 py-6 md:gap-10">
                  <span className={cn(mori, "w-10 shrink-0 text-[34px] leading-none tracking-[-0.05em] text-[#0285ff]")}>{i + 1}</span>
                  <p className="max-w-xl text-[18px] leading-relaxed">{pt}</p>
                </li>
              ))}
            </ol>

            <div className="mt-14 rounded-[28px] bg-[#dcd2c5]/[0.05] p-7 md:p-9">
              <h2 className={cn(mori, "text-[26px] tracking-[-0.04em]")}>Talk about it</h2>
              <p className="mt-1 text-[15px] text-stone-500">For your small group, your family, or a friend over coffee.</p>
              <ol className="mt-6 space-y-4">
                {s.questions.map((qn, i) => (
                  <li key={i} className="flex gap-4 text-[17px] leading-relaxed">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0285ff] font-mori text-[13px] font-semibold text-black">{i + 1}</span>
                    {qn}
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {s.topics.map((t) => (
                <span key={t} className="rounded-full border-2 border-[#dcd2c5]/20 px-3.5 py-1.5 text-[13px] text-stone-600">{t}</span>
              ))}
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <MyNotes id={s.id} title={s.title} />
            <div className="rounded-[28px] border-2 border-[#dcd2c5]/25 p-6">
              <p className={cn(mori, "text-[18px] tracking-[-0.03em]")}>Questions about this message?</p>
              <p className="mt-1.5 text-[15px] text-stone-500">{speaker.name.split(" ")[0]} would love to hear from you.</p>
              <a href={`mailto:${speaker.email}?subject=${encodeURIComponent(`About "${s.title}"`)}`} className={cn(mori, "mt-4 inline-flex h-11 items-center gap-2 rounded-[80px] border-[3px] border-[#0285ff] px-5 text-[14px] uppercase tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black")}>
                <Mail className="size-4" /> Email {speaker.name.split(" ")[0]}
              </a>
            </div>
          </aside>
        </div>

        {/* ---------- Series + next ---------- */}
        {inSeries.length > 1 && (
          <section className="mt-24 md:mt-32">
            <Rise>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className={cn(mori, "text-[clamp(32px,3.6vw,52px)] leading-[0.95] tracking-[-0.05em]")}>More from {series.title}</h2>
                <Link href={`/sermons?series=${series.id}`} className="text-[15px] text-stone-500 transition hover:text-[#dcd2c5]">See the whole series</Link>
              </div>
            </Rise>
            <RevealGroup as="ul" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {inSeries.map((x) => {
                const here = x.id === s.id;
                return (
                  <li key={x.id}>
                    <Link href={`/sermons/${x.id}`} aria-current={here ? "page" : undefined} className={cn("group block", here && "pointer-events-none")}>
                      <div className={cn("relative overflow-hidden rounded-[20px]", here && "ring-2 ring-[#0285ff] ring-offset-4 ring-offset-ink")}>
                        <SeriesArt series={series} label={false} />
                      </div>
                      <p className="mt-3 font-magda text-[12px] uppercase tracking-[0.04em] opacity-60">{here ? "Watching now" : sermonDate(x.date, { month: "short", day: "numeric" })}</p>
                      <p className={cn(mori, "mt-1 text-[20px] leading-[1.1] tracking-[-0.03em] transition group-hover:text-[#0285ff]", here && "text-[#0285ff]")}>{x.title}</p>
                    </Link>
                  </li>
                );
              })}
            </RevealGroup>
          </section>
        )}

        <nav aria-label="More messages" className="mt-20 grid gap-4 border-t border-[#dcd2c5]/15 pt-10 sm:grid-cols-2">
          {older ? (
            <Link href={`/sermons/${older.id}`} className="group">
              <p className="text-[14px] text-stone-500">Previous message</p>
              <p className={cn(mori, "mt-1 text-[22px] tracking-[-0.03em] transition group-hover:text-[#0285ff]")}>{older.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link href={`/sermons/${newer.id}`} className="group sm:text-right">
              <p className="text-[14px] text-stone-500">Next message</p>
              <p className={cn(mori, "mt-1 text-[22px] tracking-[-0.03em] transition group-hover:text-[#0285ff]")}>{newer.title}</p>
            </Link>
          )}
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}

/** Personal notes, saved in this browser as you type. */
function MyNotes({ id, title }: { id: string; title: string }) {
  const { sermonNotes, saveSermonNote, hydrated } = useStore();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (hydrated && !loaded.current) {
      loaded.current = true;
      setText(sermonNotes[id] ?? "");
    }
  }, [hydrated, id, sermonNotes]);

  const change = (v: string) => {
    setText(v);
    setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveSermonNote(id, v);
      setSaved(true);
    }, 500);
  };

  return (
    <div className="rounded-[28px] border-2 border-[#dcd2c5]/80 p-6">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="my-notes" className={cn(mori, "text-[18px] tracking-[-0.03em]")}>Your notes</label>
        <span className={cn("inline-flex items-center gap-1 text-[12px] text-stone-500 transition", saved ? "opacity-100" : "opacity-0")} aria-live="polite">
          <Check className="size-3.5" /> Saved
        </span>
      </div>
      <textarea
        id="my-notes"
        value={text}
        onChange={(e) => change(e.target.value)}
        placeholder={`What stood out to you in "${title}"?`}
        className="mt-3 min-h-48 w-full resize-y rounded-2xl bg-white p-4 text-[16px] leading-relaxed text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
      />
      <p className="mt-2 text-[13px] text-stone-500">Private to you and saved on this device.</p>
    </div>
  );
}
