"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Radio, Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RevealGroup, Rise } from "@/components/church/motion";
import { church, churchLinks, staffById } from "@/lib/data";
import {
  currentSeries,
  latestSermon,
  seriesById,
  seriesSermons,
  sermonBooks,
  sermonDate,
  sermonSeries,
  sermonsByDate,
  type Sermon,
} from "@/lib/sermons";
import { cn } from "@/lib/utils";
import { SeriesArt } from "./series-art";
import { SermonPlayer } from "./player";

const mori = "font-mori font-semibold";
const Ed = ({ children }: { children: React.ReactNode }) => <span className="font-editorial font-normal italic tracking-[-0.03em]">{children}</span>;
const speakers = [...new Set(sermonsByDate.map((s) => s.speakerId))].map((id) => staffById[id]);

export function SermonsPage() {
  const [series, setSeries] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [book, setBook] = useState("");
  const [query, setQuery] = useState("");
  const [all, setAll] = useState(false);

  // Deep link: /sermons?series=better-together
  useEffect(() => {
    const s = new URLSearchParams(location.search).get("series");
    if (s && seriesById[s]) setSeries(s);
  }, []);

  const q = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      sermonsByDate.filter(
        (s) =>
          (!series || s.seriesId === series) &&
          (!speaker || s.speakerId === speaker) &&
          (!book || s.book === book) &&
          (!q || `${s.title} ${s.passage} ${s.summary} ${s.topics.join(" ")} ${staffById[s.speakerId].name} ${seriesById[s.seriesId].title}`.toLowerCase().includes(q)),
      ),
    [series, speaker, book, q],
  );
  const filtered = !!(series || speaker || book || q);
  const shown = all || filtered ? list : list.slice(0, 9);
  const latestSpeaker = staffById[latestSermon.speakerId];

  const pickSeries = (id: string) => {
    setSeries(id);
    setAll(false);
    document.getElementById("all-messages")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="overflow-x-clip bg-ink text-[#dcd2c5]">
      <SiteHeader />
      <main>
        {/* ---------- Hero ---------- */}
        <section className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-12 pt-14 md:px-[60px] md:pt-[63px] lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className={cn(mori, "m-load-rise text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>Sermons</p>
            <h1 className={cn(mori, "m-title mt-4 text-[clamp(52px,6.4vw,82px)] leading-[0.92] tracking-[-0.05em]")}>
              Messages from <Ed>Sunday</Ed>
            </h1>
            <p className="m-load-rise mt-6 max-w-lg text-lg leading-relaxed text-stone-600 md:text-xl" style={{ "--rd": "0.45s" } as React.CSSProperties}>Missed a week, or want to hear it again? Watch, listen, and take notes on every message.</p>
          </div>
          <Rise load delay={0.2} y={20}>
            <LiveCard />
          </Rise>
        </section>

        {/* ---------- Latest message ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 md:px-[60px]">
          <Rise>
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-14">
              <SermonPlayer sermon={latestSermon} />
              <div>
                <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">
                  Latest message · {sermonDate(latestSermon.date, { month: "long", day: "numeric" })}
                </p>
                <h2 className={cn(mori, "mt-3 text-[clamp(40px,4.6vw,68px)] leading-[0.95] tracking-[-0.05em]")}>{latestSermon.title}</h2>
                <p className="mt-3 text-[16px] text-stone-500">
                  {seriesById[latestSermon.seriesId].title}
                  {latestSermon.part ? `, part ${latestSermon.part}` : ""} · {latestSermon.passage}
                </p>
                <p className="mt-5 max-w-md text-[17px] leading-relaxed text-stone-600">{latestSermon.summary}</p>
                <div className="mt-6 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={latestSpeaker.photo} alt="" width={48} height={48} className="size-12 rounded-full object-cover object-top" />
                  <div>
                    <p className={cn(mori, "text-[16px]")}>{latestSpeaker.name}</p>
                    <p className="text-sm text-[#0285ff]">{latestSpeaker.role}</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/sermons/${latestSermon.id}`} className={cn(mori, "group inline-flex h-[57px] items-center gap-3 rounded-[80px] bg-[#dcd2c5] pl-6 pr-1.5 text-[15px] uppercase tracking-[-0.05em] text-black transition hover:bg-[#f5f0e9]")}>
                    Notes &amp; discussion
                    <span className="flex size-[45px] items-center justify-center rounded-full bg-[#0285ff]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/home/arrow.svg" alt="" width={26} height={26} className="transition duration-500 group-hover:rotate-45" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </Rise>
        </section>

        {/* ---------- Current series ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <div className="grid gap-10 rounded-[28px] border-2 border-[#dcd2c5]/80 p-6 md:p-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
              <div>
                <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Current series</p>
                <h2 className={cn(mori, "mt-3 text-[clamp(40px,5vw,72px)] leading-[0.95] tracking-[-0.05em]")}>{currentSeries.title}</h2>
                <p className="mt-4 max-w-md text-[17px] leading-relaxed text-stone-600">{currentSeries.blurb}</p>
                <p className="mt-6 text-[15px] text-stone-500">
                  {seriesSermons(currentSeries.id).length} messages so far · {sermonDate(seriesSermons(currentSeries.id)[0].date, { month: "short", day: "numeric" })} to {sermonDate(latestSermon.date, { month: "short", day: "numeric" })}
                </p>
              </div>
              <RevealGroup as="ol" className="self-start border-t border-[#dcd2c5]/15">
                {seriesSermons(currentSeries.id).map((s, i) => (
                  <li key={s.id}>
                    <Link href={`/sermons/${s.id}`} className="group flex items-center gap-5 border-b border-[#dcd2c5]/15 py-5 md:gap-8">
                      <span className={cn(mori, "w-10 shrink-0 text-[34px] leading-none tracking-[-0.05em] text-[#0285ff]")}>{s.part ?? i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className={cn(mori, "block text-[22px] leading-[1.1] tracking-[-0.03em] transition group-hover:text-[#0285ff]")}>{s.title}</span>
                        <span className="mt-1 block text-[14px] text-stone-500">
                          {sermonDate(s.date, { month: "short", day: "numeric" })} · {staffById[s.speakerId].name} · {s.passage}
                        </span>
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/home/arrow.svg" alt="" width={26} height={26} className="hidden shrink-0 invert transition duration-500 group-hover:rotate-45 sm:block" />
                    </Link>
                  </li>
                ))}
              </RevealGroup>
            </div>
          </Rise>
        </section>

        {/* ---------- All messages ---------- */}
        <section id="all-messages" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 pt-24 md:px-[60px] md:pt-32">
          <Rise>
            <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
              Every <Ed>message</Ed>
            </h2>
          </Rise>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <label className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, topics, passages"
                aria-label="Search sermons"
                className="h-12 w-full rounded-full border-2 border-[#dcd2c5]/25 bg-transparent pl-11 pr-4 text-[15px] text-[#dcd2c5] placeholder:text-stone-500 focus:border-[#0285ff] focus:outline-none"
              />
            </label>
            <FilterSelect label="Series" value={series} onChange={setSeries} options={sermonSeries.map((s) => ({ v: s.id, l: s.title }))} />
            <FilterSelect label="Speaker" value={speaker} onChange={setSpeaker} options={speakers.map((p) => ({ v: p.id, l: p.name }))} />
            <FilterSelect label="Book" value={book} onChange={setBook} options={sermonBooks.map((b) => ({ v: b, l: b }))} />
            {filtered && (
              <button
                onClick={() => { setSeries(""); setSpeaker(""); setBook(""); setQuery(""); }}
                className="inline-flex h-12 items-center gap-1.5 px-3 text-[14px] text-stone-500 hover:text-[#dcd2c5]"
              >
                <X className="size-4" /> Clear
              </button>
            )}
          </div>

          {list.length === 0 ? (
            <div className="mt-10 rounded-[28px] border-2 border-dashed border-[#dcd2c5]/20 px-6 py-16 text-center">
              <p className={cn(mori, "text-[22px] tracking-[-0.03em]")}>No messages match that.</p>
              <p className="mt-2 text-stone-500">Try a different word, or clear the filters.</p>
            </div>
          ) : (
            <>
              <p className="mt-6 text-[14px] text-stone-500">
                {list.length} message{list.length === 1 ? "" : "s"}
                {series ? ` in ${seriesById[series].title}` : ""}
              </p>
              <RevealGroup as="ul" className="mt-4 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((s) => (
                  <SermonCard key={s.id} s={s} />
                ))}
              </RevealGroup>
              {!filtered && list.length > shown.length && (
                <button onClick={() => setAll(true)} className={cn(mori, "mx-auto mt-10 flex h-12 items-center rounded-[80px] border-2 border-[#dcd2c5]/40 px-6 text-[14px] uppercase tracking-[-0.04em] transition hover:border-[#dcd2c5]")}>
                  Show all {list.length}
                </button>
              )}
            </>
          )}
        </section>

        {/* ---------- Series ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-[60px] md:py-32">
          <Rise>
            <h2 className={cn(mori, "text-[clamp(40px,5.2vw,72px)] leading-[0.95] tracking-[-0.05em]")}>
              Browse by <Ed>series</Ed>
            </h2>
          </Rise>
          <RevealGroup as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sermonSeries.map((s) => {
              const n = seriesSermons(s.id).length;
              return (
                <li key={s.id}>
                  <button onClick={() => pickSeries(s.id)} className="group block w-full text-left">
                    <SeriesArt series={s} label={false} className="rounded-[20px] transition duration-500 group-hover:-translate-y-1" />
                    <p className={cn(mori, "mt-4 text-[20px] tracking-[-0.03em] transition group-hover:text-[#0285ff]")}>{s.title}</p>
                    <p className="text-[14px] text-stone-500">{n} message{n === 1 ? "" : "s"}</p>
                  </button>
                </li>
              );
            })}
          </RevealGroup>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function SermonCard({ s }: { s: Sermon }) {
  const p = staffById[s.speakerId];
  return (
    <li>
      <Link href={`/sermons/${s.id}`} className="group block rounded-[20px] focus-visible:outline-none">
        <div className="relative overflow-hidden rounded-[20px] ring-0 ring-[#0285ff] ring-offset-4 ring-offset-ink transition-shadow group-focus-visible:ring-2">
          <SeriesArt series={seriesById[s.seriesId]} label={false} className="transition duration-700 group-hover:scale-[1.04]" />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[12px] tabular-nums text-[#dcd2c5] backdrop-blur">{s.minutes} min</span>
        </div>
        <p className="mt-4 font-magda text-[12px] uppercase tracking-[0.04em] opacity-60">{sermonDate(s.date)}</p>
        <h3 className={cn(mori, "mt-1.5 text-[24px] leading-[1.05] tracking-[-0.04em] transition group-hover:text-[#0285ff]")}>{s.title}</h3>
        <p className="mt-2 flex items-center gap-2 text-[14px] text-stone-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.photo} alt="" width={24} height={24} className="size-6 rounded-full object-cover object-top" />
          {p.name} · <BookOpen className="size-3.5" /> {s.passage}
        </p>
      </Link>
    </li>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={cn(
        "h-12 rounded-full border-2 bg-transparent pl-5 pr-11 text-[15px] transition focus:border-[#0285ff] focus:outline-none",
        value ? "border-[#0285ff] text-[#0285ff]" : "border-[#dcd2c5]/25 text-[#dcd2c5] hover:border-[#dcd2c5]/60",
      )}
    >
      <option value="">All {label === "Series" ? "series" : label === "Speaker" ? "speakers" : "books"}</option>
      {options.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}

/** When the next livestream starts, counted down after the page loads (so the server and browser agree). */
function LiveCard() {
  const [next, setNext] = useState<{ when: Date; live: boolean } | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const times = church.services.map((t) => t.split(":").map(Number));
      for (let d = 0; d < 8; d++) {
        const day = new Date(now);
        day.setDate(now.getDate() + d);
        if (day.getDay() !== 0) continue;
        for (const [h, m] of times) {
          const start = new Date(day);
          start.setHours(h, m, 0, 0);
          const end = new Date(start.getTime() + 75 * 60_000);
          if (now < end) return setNext({ when: start, live: now >= start });
        }
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const countdown = (() => {
    if (!next) return "";
    if (next.live) return "Live now";
    const mins = Math.round((next.when.getTime() - Date.now()) / 60_000);
    const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
    return d > 0 ? `in ${d} day${d === 1 ? "" : "s"}, ${h} hr` : h > 0 ? `in ${h} hr ${m} min` : `in ${m} min`;
  })();

  return (
    <div className="relative overflow-hidden m-sheen rounded-[28px] bg-[#0285ff] p-7 text-black md:p-9">
      <Radio aria-hidden className="pointer-events-none absolute -right-6 -top-6 size-44 text-black/[0.07]" strokeWidth={1.25} />
      <p className="flex items-center gap-2 font-mori text-[15px] font-semibold uppercase tracking-[-0.03em] text-black/60">
        {next?.live && <span className="size-2.5 animate-pulse rounded-full bg-black" />}
        Watch live
      </p>
      <p className={cn(mori, "mt-3 text-[clamp(44px,4.6vw,68px)] leading-[0.9] tracking-[-0.05em]")}>Sundays {church.services.join(" & ")}</p>
      <p className="mt-3 min-h-[1.5em] text-[17px] text-black/75">
        {next ? (next.live ? "We're live right now." : `Next service ${next.when.toLocaleDateString("en-US", { weekday: "long" })} at ${next.when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}, ${countdown}.`) : " "}
      </p>
      <a href={churchLinks.youtube} target="_blank" rel="noreferrer" className={cn(mori, "mt-6 inline-flex h-12 items-center rounded-[80px] bg-black px-6 text-[14px] uppercase tracking-[-0.04em] text-[#dcd2c5] transition hover:bg-black/80")}>
        {next?.live ? "Join the livestream" : "Watch on YouTube"}
      </a>
    </div>
  );
}
