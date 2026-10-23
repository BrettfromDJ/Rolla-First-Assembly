"use client";

import { CountUp } from "@/components/church/motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Baby, CalendarDays, Download, Minus, Pencil, Plus, Sparkles, Trash2, TrendingDown, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { staffById } from "@/lib/data";
import { useStore } from "@/lib/store";
import {
  addDays,
  areasFor,
  attendanceAreas,
  attendanceServices,
  fromYmd,
  inPersonTotal,
  kidsTotal,
  lastDow,
  serviceDates,
  ymd,
} from "@/lib/attendance";
import type { AttendanceCounts, AttendanceRecord, AttendanceService } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { ACTING_AS } from "./helpers";

/* Series colors: validated as a set against the dashboard card surface (#121212). */
const SERIES: Record<AttendanceService, string> = { "9:00": "#3987e5", "10:30": "#d95926", wed: "#199e70" };
const INK = { avg: "#c9c3b8", grid: "#2a2a2a", axis: "#3b3b3a", muted: "#77736c", surface: "#121212", bar: "#b3ada3" };

type Range = "8w" | "3m" | "6m" | "12m";
type Scope = "sunday" | "9:00" | "10:30" | "wed";

const ranges: { id: Range; label: string; days: number }[] = [
  { id: "8w", label: "Last 8 weeks", days: 56 },
  { id: "3m", label: "Last 3 months", days: 91 },
  { id: "6m", label: "Last 6 months", days: 182 },
  { id: "12m", label: "Last 12 months", days: 364 },
];
const scopes: { id: Scope; label: string }[] = [
  { id: "sunday", label: "All Sunday services" },
  { id: "9:00", label: "9:00 AM" },
  { id: "10:30", label: "10:30 AM" },
  { id: "wed", label: "Wednesday" },
];

const serviceLabel = (s: AttendanceService) => attendanceServices.find((x) => x.id === s)!.label;
const shortDate = (d: string) => fromYmd(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

type Week = { date: string; byService: Partial<Record<AttendanceService, AttendanceRecord>>; total: number; complete: boolean; note?: string };

/** Staff view of hand-counted attendance: trends, a per-service breakdown, and the log of every count. */
export function AttendanceView() {
  const { attendance, hydrated } = useStore();
  const [range, setRange] = useState<Range>("3m");
  const [scope, setScope] = useState<Scope>("sunday");
  const [editing, setEditing] = useState<{ open: boolean; date?: string; service?: AttendanceService }>({ open: false });

  const today = useMemo(() => (hydrated ? ymd(new Date()) : ""), [hydrated]);
  const days = ranges.find((r) => r.id === range)!.days;
  const start = today ? addDays(today, -days + 1) : "";
  const prevStart = today ? addDays(start, -days) : "";

  const byKey = useMemo(() => new Map(attendance.map((a) => [`${a.date}|${a.service}`, a])), [attendance]);
  const services: AttendanceService[] = scope === "sunday" ? ["9:00", "10:30"] : [scope];

  /** One row per meeting date for the services in scope, oldest first. */
  const weeksBetween = (from: string, to: string): Week[] => {
    if (!from) return [];
    return serviceDates(services[0], from, to).map((date) => {
      const byService: Week["byService"] = {};
      for (const s of services) {
        const r = byKey.get(`${date}|${s}`);
        if (r) byService[s] = r;
      }
      const recs = Object.values(byService);
      return {
        date,
        byService,
        total: recs.reduce((n, r) => n + inPersonTotal(r!.counts), 0),
        complete: recs.length === services.length,
        note: recs.find((r) => r?.note)?.note,
      };
    });
  };
  const weeks = useMemo(() => weeksBetween(start, today), [start, today, scope, byKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const prevWeeks = useMemo(() => weeksBetween(prevStart, addDays(start, -1)), [prevStart, start, scope, byKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const complete = weeks.filter((w) => w.complete);
  const prevComplete = prevWeeks.filter((w) => w.complete);

  const average = avg(complete.map((w) => w.total));
  const prevAverage = avg(prevComplete.map((w) => w.total));
  const latest = [...weeks].reverse().find((w) => Object.keys(w.byService).length > 0);
  const kidsAvg = avg(complete.map((w) => Object.values(w.byService).reduce((n, r) => n + kidsTotal(r!.counts), 0)));
  const firstTime = weeks.reduce((n, w) => n + Object.values(w.byService).reduce((m, r) => m + (r!.firstTime ?? 0), 0), 0);
  const prevFirstTime = prevWeeks.reduce((n, w) => n + Object.values(w.byService).reduce((m, r) => m + (r!.firstTime ?? 0), 0), 0);

  // Services in the last 8 weeks that nobody has entered yet (any service, not just the filter).
  const missing = useMemo(() => {
    if (!today) return [];
    const from = addDays(today, -55);
    return attendanceServices
      .flatMap((s) => serviceDates(s.id, from, today).map((date) => ({ date, service: s.id })))
      .filter((m) => !byKey.has(`${m.date}|${m.service}`))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [today, byKey]);

  const open = (date?: string, service?: AttendanceService) => setEditing({ open: true, date, service });
  const scopeName = scope === "sunday" ? "Sunday" : scope === "wed" ? "Wednesday" : `${scope} service`;

  if (!hydrated) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-stone-200/70" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters: scope everything below */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={range} onChange={(v) => setRange(v as Range)} label="Date range" options={ranges.map((r) => ({ v: r.id, l: r.label }))} />
        <Select value={scope} onChange={(v) => setScope(v as Scope)} label="Service" options={scopes.map((s) => ({ v: s.id, l: s.label }))} />
        <Button size="sm" className="ml-auto" onClick={() => open()}>
          <Plus /> Enter attendance
        </Button>
      </div>

      {missing.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl bg-honey-soft/40 p-4 ring-1 ring-honey/30 sm:flex-row sm:items-center">
          <AlertTriangle className="size-5 shrink-0 text-honey" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-stone-900">
              {missing.length} service{missing.length === 1 ? " hasn't" : "s haven't"} been counted yet
            </p>
            <p className="text-stone-500">Missing services are left out of averages, not counted as zero.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {missing.slice(0, 4).map((m) => (
              <button key={`${m.date}${m.service}`} onClick={() => open(m.date, m.service)} className="h-9 rounded-full bg-white px-3.5 text-sm ring-1 ring-stone-200 transition hover:ring-forest-500">
                {shortDate(m.date)} · {attendanceServices.find((s) => s.id === m.service)!.short}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Users} label={`Average ${scopeName}`} value={fmt(average)} delta={pct(average, prevAverage)} sub={prevAverage ? `vs previous ${days / 7 >= 12 ? `${Math.round(days / 30.4)} months` : `${days / 7} weeks`}` : "Complete weeks only"} />
        <Stat
          icon={CalendarDays}
          label={latest ? `${scope === "wed" ? "Last Wednesday" : "Last Sunday"} · ${shortDate(latest.date)}` : "Latest"}
          value={latest ? fmt(latest.total) : "–"}
          delta={latest?.complete ? pct(latest.total, average) : undefined}
          sub={latest && !latest.complete ? `Partial: ${services.filter((s) => !latest.byService[s]).map((s) => attendanceServices.find((x) => x.id === s)!.short).join(", ")} not entered` : "vs average"}
          warn={!!latest && !latest.complete}
        />
        <Stat icon={Baby} label="Kids & nursery" value={fmt(kidsAvg)} sub={average ? `${Math.round((kidsAvg / average) * 100)}% of an average ${scope === "wed" ? "night" : "Sunday"}` : "Average"} />
        <Stat icon={Sparkles} label="First-time guests" value={scope === "wed" ? "–" : fmt(firstTime)} delta={scope === "wed" ? undefined : pct(firstTime, prevFirstTime)} sub={scope === "wed" ? "Not tracked on Wednesdays" : "In this period"} />
      </div>

      {/* Trend */}
      <Card
        title={scope === "wed" ? "Wednesday nights" : scope === "sunday" ? "Sunday attendance" : `${scope} service`}
        sub={`In-person headcount${weeks.length > 20 ? "" : " each week"}. Hover a week for details.`}
        legend={[...services.map((s) => ({ color: SERIES[s], label: scope === "sunday" ? attendanceServices.find((x) => x.id === s)!.short : serviceLabel(s), kind: "rect" as const })), { color: INK.avg, label: "4-week average", kind: "line" as const }]}
      >
        <TrendChart weeks={weeks} services={services} onPick={(d, s) => open(d, s)} />
      </Card>

      <div className="grid gap-6 2xl:grid-cols-[1fr_1.4fr]">
        <Card title="Where people are" sub={`Average per ${scope === "wed" ? "Wednesday" : scope === "sunday" ? "Sunday (both services)" : "service"}`}>
          <AreaBars weeks={complete} services={services} />
        </Card>
        <Card title="By service" sub="Every service in this date range">
          <ServiceTable byKey={byKey} start={start} end={today} />
        </Card>
      </div>

      <AttendanceLog byKey={byKey} start={start} end={today} services={services} onEdit={open} scopeName={scopeName} />

      <AttendanceSheet {...editing} onOpenChange={(o) => setEditing((e) => ({ ...e, open: o }))} />
    </div>
  );
}

const pct = (now: number, before: number) => (before > 0 && now > 0 ? ((now - before) / before) * 100 : undefined);

/* ---------- Pieces ---------- */

function Stat({ icon: Icon, label, value, sub, delta, warn }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; delta?: number; warn?: boolean }) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200/70 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] text-stone-500">{label}</span>
        <Icon className={cn("size-4 shrink-0", warn ? "text-honey" : "text-stone-300")} />
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <p className="text-[32px] font-semibold leading-none tracking-[-0.02em]"><CountUp value={value} /></p>
        {delta !== undefined && Math.abs(delta) >= 0.5 && (
          <span className={cn("inline-flex items-center gap-1 text-xs font-medium", up ? "text-sage" : "text-clay")}>
            {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {up ? "+" : "−"}
            {Math.abs(delta).toFixed(0)}%
          </span>
        )}
      </div>
      <p className={cn("mt-2 truncate text-xs", warn ? "text-honey" : "text-stone-400")}>{sub}</p>
    </div>
  );
}

function Card({ title, sub, legend, children }: { title: string; sub?: string; legend?: { color: string; label: string; kind: "rect" | "line" }[]; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl bg-white p-4 ring-1 ring-stone-200/70 md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-stone-900">{title}</h3>
          {sub && <p className="text-xs text-stone-400">{sub}</p>}
        </div>
        {legend && (
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-1.5">
                {l.kind === "rect" ? <span className="size-2.5 rounded-[3px]" style={{ background: l.color }} /> : <span className="h-0.5 w-3.5 rounded-full" style={{ background: l.color }} />}
                {l.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {children}
    </section>
  );
}

function Select({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: { v: string; l: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-10 rounded-full bg-white pl-4 pr-10 text-sm text-stone-700 ring-1 ring-stone-200 transition focus:outline-none focus:ring-2 focus:ring-forest-500"
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const ticks = [];
  for (let v = 0; v <= max + step * 0.001 || ticks.length < 2; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

/* ---------- Trend: stacked weekly columns + 4-week average ---------- */

function TrendChart({ weeks, services, onPick }: { weeks: Week[]; services: AttendanceService[]; onPick: (date: string, service?: AttendanceService) => void }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 260, top = 16, bottom = 28, left = 40, right = 8;
  const plotW = Math.max(0, width - left - right), plotH = H - top - bottom;

  const max = Math.max(1, ...weeks.map((w) => w.total));
  const ticks = niceTicks(max);
  const yMax = ticks[ticks.length - 1];
  const y = (v: number) => top + plotH - (v / yMax) * plotH;
  const band = weeks.length ? plotW / weeks.length : 0;
  const barW = Math.max(3, Math.min(24, band - 4));
  const x = (i: number) => left + band * i + band / 2;

  // Rolling 4-week average over complete weeks only.
  const rolling = weeks.map((_, i) => {
    const win = weeks.slice(Math.max(0, i - 3), i + 1).filter((w) => w.complete);
    return win.length >= 2 && weeks[i].complete ? avg(win.map((w) => w.total)) : null;
  });
  const avgPath = rolling
    .map((v, i) => (v === null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`))
    .reduce<string[]>((segs, p, i) => {
      if (p === null) return segs;
      if (i === 0 || rolling[i - 1] === null) segs.push(`M${p}`);
      else segs[segs.length - 1] += ` L${p}`;
      return segs;
    }, [])
    .join(" ");

  // Month labels at the first meeting of each month.
  const monthTicks = weeks
    .map((w, i) => ({ i, d: fromYmd(w.date) }))
    .filter(({ i, d }) => i === 0 || d.getMonth() !== fromYmd(weeks[i - 1].date).getMonth());
  // Drop labels that would crowd the next one (e.g. a partial first month).
  const labels = monthTicks.filter(({ i }, k) => {
    const next = monthTicks[k + 1];
    return !next || x(next.i) - x(i) >= 36;
  });

  const h = hover !== null ? weeks[hover] : null;
  const missingAny = weeks.some((w) => !w.complete);

  return (
    <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={H} role="img" aria-label={`Weekly attendance, ${weeks.length} weeks. Full numbers are in the log below.`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={left} x2={width - right} y1={y(t)} y2={y(t)} stroke={t === 0 ? INK.axis : INK.grid} strokeWidth={1} />
              <text x={left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-stone-400 text-[11px] tabular-nums">
                {t >= 1000 ? `${t / 1000}K` : t}
              </text>
            </g>
          ))}
          {labels.map(({ i, d }) => (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-stone-400 text-[11px]">
              {d.toLocaleDateString("en-US", { month: "short" })}
            </text>
          ))}

          {weeks.map((w, i) => {
            let acc = 0;
            const segs = services.map((s, k) => {
              const r = w.byService[s];
              if (!r) return null;
              const v = inPersonTotal(r.counts);
              const y0 = y(acc), y1 = y(acc + v);
              acc += v;
              const isTop = !services.slice(k + 1).some((n) => w.byService[n]);
              const hgt = Math.max(0, y0 - y1 - (k > 0 ? 2 : 0)); // 2px surface gap between stacked segments
              const r4 = isTop ? Math.min(4, barW / 2, hgt) : 0;
              const bx = x(i) - barW / 2, by = y1;
              return (
                <path
                  key={s}
                  d={`M${bx},${by + hgt} V${by + r4} Q${bx},${by} ${bx + r4},${by} H${bx + barW - r4} Q${bx + barW},${by} ${bx + barW},${by + r4} V${by + hgt} Z`}
                  fill={SERIES[s]}
                  opacity={hover === null || hover === i ? 1 : 0.55}
                />
              );
            });
            return (
              <g key={w.date} className="m-grow-y" style={{ "--gd": `${i * 18}ms` } as React.CSSProperties}>
                {segs}
                {!w.complete && (
                  <circle cx={x(i)} cy={y(acc) - (acc ? 10 : 6)} r={4} fill="none" stroke={INK.muted} strokeWidth={1.5}>
                    <title>Not fully counted</title>
                  </circle>
                )}
                {w.note && w.complete && <circle cx={x(i)} cy={y(w.total) - 9} r={2.5} fill={INK.avg} />}
              </g>
            );
          })}

          {avgPath && <path d={avgPath} pathLength={1} className="m-draw" style={{ "--gd": "0.5s" } as React.CSSProperties} fill="none" stroke={INK.avg} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}

          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={top} y2={top + plotH} stroke={INK.axis} strokeWidth={1} pointerEvents="none" />}

          {/* Hit areas: the whole band, not just the bar */}
          {weeks.map((w, i) => (
            <rect
              key={w.date}
              x={left + band * i}
              y={top}
              width={band}
              height={plotH}
              fill="transparent"
              onPointerMove={() => setHover(i)}
              onClick={() => {
                const firstMissing = services.find((s) => !w.byService[s]);
                onPick(w.date, firstMissing ?? services[0]);
              }}
              className="cursor-pointer"
            />
          ))}
        </svg>
      )}

      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 w-52 rounded-xl bg-stone-100 p-3 text-xs shadow-lg ring-1 ring-stone-200"
          style={{ left: Math.min(Math.max(0, x(hover) + 12), Math.max(0, width - 216)) }}
        >
          <p className="text-stone-500">{fromYmd(h.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
          {services.length > 1 && (
            <p className="mt-1 text-base font-semibold text-stone-900">
              {h.complete ? fmt(h.total) : "Partial"} <span className="text-xs font-normal text-stone-500">{h.complete ? "total" : `${fmt(h.total)} so far`}</span>
            </p>
          )}
          <ul className="mt-1.5 space-y-1">
            {services.map((s) => {
              const r = h.byService[s];
              return (
                <li key={s} className="flex items-center gap-2">
                  <span className="h-0.5 w-3 rounded-full" style={{ background: SERIES[s] }} />
                  <span className="font-semibold text-stone-900">{r ? fmt(inPersonTotal(r.counts)) : "—"}</span>
                  <span className="text-stone-500">{attendanceServices.find((x) => x.id === s)!.short}{r ? ` · ${kidsTotal(r.counts)} kids` : " · not entered"}</span>
                </li>
              );
            })}
            {rolling[hover] !== null && (
              <li className="flex items-center gap-2">
                <span className="h-0.5 w-3 rounded-full" style={{ background: INK.avg }} />
                <span className="font-semibold text-stone-900">{fmt(rolling[hover]!)}</span>
                <span className="text-stone-500">4-week average</span>
              </li>
            )}
          </ul>
          {h.note && <p className="mt-2 border-t border-stone-200 pt-2 text-stone-700">{h.note}</p>}
          <p className="mt-2 text-stone-400">{h.complete ? "Click to edit" : "Click to enter the count"}</p>
        </div>
      )}
      {missingAny && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
          <svg width="10" height="10" aria-hidden><circle cx="5" cy="5" r="3.5" fill="none" stroke={INK.muted} strokeWidth="1.5" /></svg>
          Not fully counted yet. Left out of the average.
        </p>
      )}
    </div>
  );
}

/* ---------- Where people are: average per area ---------- */

function AreaBars({ weeks, services }: { weeks: Week[]; services: AttendanceService[] }) {
  const isWed = services.includes("wed");
  const areas = attendanceAreas.filter((a) => (isWed ? a.wednesday : a.sunday));
  const rows = areas.map((a) => ({
    ...a,
    value: avg(weeks.map((w) => Object.values(w.byService).reduce((n, r) => n + (r!.counts[a.id] ?? 0), 0))),
  }));
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((n, r) => n + r.value, 0);
  if (!weeks.length) return <p className="py-8 text-center text-sm text-stone-400">No complete counts in this range.</p>;
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.id} className="grid grid-cols-[96px_1fr] items-center gap-3 text-sm">
          <span className="text-stone-600">{r.label}</span>
          <span className="flex items-center gap-2.5">
            <span className="m-grow-x h-4 rounded-r-[4px]" style={{ width: `${(r.value / max) * 82}%`, minWidth: 3, background: INK.bar }} />
            <span className="whitespace-nowrap tabular-nums text-stone-900">
              {fmt(r.value)} <span className="text-xs text-stone-400">{total ? `${Math.round((r.value / total) * 100)}%` : ""}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- By service summary ---------- */

function ServiceTable({ byKey, start, end }: { byKey: Map<string, AttendanceRecord>; start: string; end: string }) {
  const rows = attendanceServices.map((s) => {
    const dates = serviceDates(s.id, start, end);
    const recs = dates.map((d) => byKey.get(`${d}|${s.id}`)).filter(Boolean) as AttendanceRecord[];
    const totals = recs.map((r) => ({ r, t: inPersonTotal(r.counts) }));
    const hi = totals.reduce<(typeof totals)[number] | null>((a, b) => (!a || b.t > a.t ? b : a), null);
    const lo = totals.reduce<(typeof totals)[number] | null>((a, b) => (!a || b.t < a.t ? b : a), null);
    const online = recs.filter((r) => r.online !== undefined);
    return { s, dates, recs, average: avg(totals.map((x) => x.t)), kids: avg(recs.map((r) => kidsTotal(r.counts))), hi, lo, online: online.length ? avg(online.map((r) => r.online!)) : null };
  });
  return (
    <div className="-mx-4 overflow-x-auto overflow-y-hidden px-4 md:-mx-5 md:px-5">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="text-xs text-stone-400">
            <th className="pb-2 pr-3 font-medium">Service</th>
            <th className="px-3 pb-2 text-right font-medium">Average</th>
            <th className="px-3 pb-2 text-right font-medium">Kids</th>
            <th className="px-3 pb-2 font-medium">Highest</th>
            <th className="px-3 pb-2 font-medium">Lowest</th>
            <th className="px-3 pb-2 text-right font-medium">Online</th>
            <th className="pb-2 pl-3 text-right font-medium">Counted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 tabular-nums">
          {rows.map(({ s, dates, recs, average, kids, hi, lo, online }) => (
            <tr key={s.id}>
              <td className="py-3 pr-3">
                <span className="flex items-center gap-2 whitespace-nowrap text-stone-900">
                  <span className="size-2.5 rounded-[3px]" style={{ background: SERIES[s.id] }} />
                  {s.label}
                </span>
              </td>
              <td className="px-3 text-right font-medium text-stone-900">{recs.length ? fmt(average) : "–"}</td>
              <td className="px-3 text-right text-stone-600">{recs.length ? fmt(kids) : "–"}</td>
              <td className="whitespace-nowrap px-3 text-stone-600">{hi ? <>{fmt(hi.t)} <span className="text-xs text-stone-400">{shortDate(hi.r.date)}</span></> : "–"}</td>
              <td className="whitespace-nowrap px-3 text-stone-600">{lo ? <>{fmt(lo.t)} <span className="text-xs text-stone-400">{shortDate(lo.r.date)}</span></> : "–"}</td>
              <td className="px-3 text-right text-stone-600">{online === null ? "–" : fmt(online)}</td>
              <td className={cn("pl-3 text-right", recs.length < dates.length ? "text-honey" : "text-stone-400")}>
                {recs.length}/{dates.length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- The log: every service in range, counted or not ---------- */

function AttendanceLog({ byKey, start, end, services, onEdit, scopeName }: { byKey: Map<string, AttendanceRecord>; start: string; end: string; services: AttendanceService[]; onEdit: (d: string, s: AttendanceService) => void; scopeName: string }) {
  const [all, setAll] = useState(false);
  const rows = services
    .flatMap((s) => serviceDates(s, start, end).map((date) => ({ date, service: s, r: byKey.get(`${date}|${s}`) })))
    .sort((a, b) => (a.date === b.date ? (a.service < b.service ? -1 : 1) : a.date < b.date ? 1 : -1));
  const shown = all ? rows : rows.slice(0, 12);
  const isWed = services.includes("wed");
  const areas = attendanceAreas.filter((a) => (isWed ? a.wednesday : a.sunday));

  const exportCsv = () => {
    const head = ["Date", "Service", ...areas.map((a) => a.label), "In-person total", "First-time guests", "Online", "Note", "Entered by", "Last updated"];
    const lines = rows.map(({ date, service, r }) => [
      date, serviceLabel(service),
      ...areas.map((a) => r?.counts[a.id] ?? ""),
      r ? inPersonTotal(r.counts) : "Not entered",
      r?.firstTime ?? "", r?.online ?? "", r?.note ?? "",
      r ? staffById[r.enteredBy]?.name ?? r.enteredBy : "", r ? new Date(r.updatedAt).toLocaleString("en-US") : "",
    ]);
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${scopeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${start}-to-${end}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Attendance downloaded", { description: `${rows.length} services` });
  };

  return (
    <section className="rounded-2xl bg-white ring-1 ring-stone-200/70">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-4 py-3.5 md:px-5">
        <div>
          <h3 className="font-medium text-stone-900">Every count</h3>
          <p className="text-xs text-stone-400">Newest first. Click a row to fix a number.</p>
        </div>
        <button onClick={exportCsv} className="flex h-9 items-center gap-2 rounded-full px-3.5 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-stone-900 hover:ring-stone-300">
          <Download className="size-4" /> Download spreadsheet
        </button>
      </div>
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="text-xs text-stone-400">
              <th className="py-2.5 pl-5 pr-3 font-medium">Date</th>
              <th className="px-3 font-medium">Service</th>
              {areas.map((a) => (
                <th key={a.id} className="px-3 text-right font-medium">{a.label}</th>
              ))}
              <th className="px-3 text-right font-medium">Total</th>
              <th className="px-3 text-right font-medium">New</th>
              <th className="px-3 font-medium">Note</th>
              <th className="px-3 pr-5 font-medium">Entered by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 tabular-nums">
            {shown.map(({ date, service, r }) => (
              <tr key={`${date}${service}`} onClick={() => onEdit(date, service)} className={cn("cursor-pointer transition hover:bg-stone-50", !r && "bg-honey-soft/20")}>
                <td className="whitespace-nowrap py-3 pl-5 pr-3 text-stone-900">{fromYmd(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</td>
                <td className="whitespace-nowrap px-3 text-stone-600">
                  <span className="flex items-center gap-2"><span className="size-2 rounded-[2px]" style={{ background: SERIES[service] }} />{attendanceServices.find((s) => s.id === service)!.short}</span>
                </td>
                {r ? (
                  <>
                    {areas.map((a) => (
                      <td key={a.id} className="px-3 text-right text-stone-600">{r.counts[a.id] ?? <span className="text-stone-300">—</span>}</td>
                    ))}
                    <td className="px-3 text-right font-medium text-stone-900">{fmt(inPersonTotal(r.counts))}</td>
                    <td className="px-3 text-right text-stone-600">{r.firstTime ?? <span className="text-stone-300">—</span>}</td>
                    <td className="max-w-[180px] truncate px-3 text-stone-500" title={r.note}>{r.note ?? ""}</td>
                    <td className="whitespace-nowrap px-3 pr-5 text-xs text-stone-400">{staffById[r.enteredBy]?.name.split(" ")[0] ?? r.enteredBy} · {timeAgo(r.updatedAt)}</td>
                  </>
                ) : (
                  <td colSpan={areas.length + 4} className="px-3 pr-5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-honey"><Plus className="size-3.5" /> Not entered yet. Click to add the count.</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 12 && (
        <button onClick={() => setAll(!all)} className="w-full border-t border-stone-100 py-3 text-sm text-stone-500 transition hover:text-stone-900">
          {all ? "Show fewer" : `Show all ${rows.length}`}
        </button>
      )}
    </section>
  );
}

/* ---------- Manual entry ---------- */

function AttendanceSheet({ open, onOpenChange, date: initialDate, service: initialService }: { open: boolean; onOpenChange: (o: boolean) => void; date?: string; service?: AttendanceService }) {
  const { attendance, saveAttendance, deleteAttendance } = useStore();
  const [date, setDate] = useState("");
  const [service, setService] = useState<AttendanceService>("10:30");
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [firstTime, setFirstTime] = useState("");
  const [online, setOnline] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const existing = attendance.find((a) => a.date === date && a.service === service);

  // Load whatever is already saved for this date + service.
  const load = (d: string, s: AttendanceService) => {
    const r = attendance.find((a) => a.date === d && a.service === s);
    setCounts(Object.fromEntries(Object.entries(r?.counts ?? {}).map(([k, v]) => [k, String(v)])));
    setFirstTime(r?.firstTime !== undefined ? String(r.firstTime) : "");
    setOnline(r?.online !== undefined ? String(r.online) : "");
    setNote(r?.note ?? "");
    setError("");
  };

  useEffect(() => {
    if (!open) return;
    const s = initialService ?? (new Date().getDay() >= 3 && new Date().getDay() < 6 ? "wed" : "10:30");
    const d = initialDate ?? lastDow(s === "wed" ? 3 : 0);
    setService(s);
    setDate(d);
    load(d, s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const areas = areasFor(service);
  const parsed: AttendanceCounts = Object.fromEntries(areas.filter((a) => counts[a.id] !== undefined && counts[a.id] !== "").map((a) => [a.id, Math.max(0, parseInt(counts[a.id], 10) || 0)]));
  const total = inPersonTotal(parsed);
  const wantDay = service === "wed" ? 3 : 0;
  const dayOk = !date || fromYmd(date).getDay() === wantDay;

  const pick = (d: string, s: AttendanceService) => {
    setDate(d);
    setService(s);
    load(d, s);
  };

  const save = () => {
    if (!date) return setError("Pick a date.");
    if (!dayOk) return setError(`That date isn't a ${service === "wed" ? "Wednesday" : "Sunday"}.`);
    if (date > ymd(new Date())) return setError("That service hasn't happened yet.");
    if (!Object.keys(parsed).length) return setError("Add at least one count.");
    const num = (v: string) => (v.trim() === "" ? undefined : Math.max(0, parseInt(v, 10) || 0));
    saveAttendance({ date, service, counts: parsed, firstTime: num(firstTime), online: num(online), note: note.trim() || undefined, enteredBy: ACTING_AS });
    toast(existing ? "Attendance updated" : "Attendance saved", { description: `${serviceLabel(service)}, ${shortDate(date)}: ${fmt(total)} in person` });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Enter attendance" side="right" hideTitle>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 pr-14 md:p-6 md:pr-14">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-stone-900">{existing ? "Update attendance" : "Enter attendance"}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {existing ? `Last entered by ${staffById[existing.enteredBy]?.name ?? existing.enteredBy}, ${timeAgo(existing.updatedAt)}.` : "From the clicker counts and the Rolla First Kids check-in sheet."}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-stone-800">Service</p>
          <div role="radiogroup" aria-label="Service" className="grid grid-cols-3 gap-2">
            {attendanceServices.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={service === s.id}
                onClick={() => pick(s.id === "wed" ? (fromYmd(date || ymd(new Date())).getDay() === 3 ? date : lastDow(3)) : fromYmd(date || ymd(new Date())).getDay() === 0 ? date : lastDow(0), s.id)}
                className={cn("flex h-11 items-center justify-center gap-2 rounded-xl text-sm ring-1 transition", service === s.id ? "bg-forest-700 font-medium text-ink ring-forest-700" : "bg-white text-stone-700 ring-stone-200 hover:ring-stone-300")}
              >
                <span className="size-2 rounded-[2px]" style={{ background: service === s.id ? "currentColor" : SERIES[s.id] }} />
                {s.short === "Wed" ? "Wed 6:30" : s.short}
              </button>
            ))}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-800">Date</span>
          <input
            type="date"
            value={date}
            max={ymd(new Date())}
            onChange={(e) => pick(e.target.value, service)}
            className={cn("h-11 w-full rounded-xl bg-white px-3 text-[16px] text-stone-900 ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500", !dayOk && "ring-clay")}
          />
          {!dayOk && <span className="block text-[13px] text-clay">That date isn&apos;t a {service === "wed" ? "Wednesday" : "Sunday"}.</span>}
        </label>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-stone-800">Headcount</p>
            <p className="text-xs text-stone-400">Leave blank if it wasn&apos;t counted</p>
          </div>
          <ul className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
            {areas.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-stone-900">{a.label}</p>
                  {a.hint && <p className="text-xs text-stone-400">{a.hint}</p>}
                </div>
                <Stepper label={a.label} value={counts[a.id] ?? ""} onChange={(v) => { setCounts((c) => ({ ...c, [a.id]: v })); setError(""); }} />
              </li>
            ))}
            <li className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium text-stone-900">In person</p>
              <p className="text-lg font-semibold tabular-nums text-stone-900">{fmt(total)}</p>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NumberField label="First-time guests" hint="Already in the count" value={firstTime} onChange={setFirstTime} disabled={service === "wed"} />
          <NumberField label="Online views" hint="Livestream, separate" value={online} onChange={setOnline} disabled={service === "wed"} />
        </div>

        <Textarea label="Note" optional value={note} onChange={(e) => setNote(e.target.value)} placeholder="Easter, snow, guest speaker, VBS kickoff…" className="[&_textarea]:min-h-20" />

        {error && <p className="text-sm text-clay" role="alert">{error}</p>}

        <div className="flex gap-2">
          <Button className="flex-1" onClick={save}>
            <Pencil /> {existing ? "Save changes" : "Save attendance"}
          </Button>
          {existing && (
            <Button
              variant="secondary"
              aria-label="Delete this count"
              onClick={() => {
                deleteAttendance(existing.id);
                toast("Count deleted", { description: `${serviceLabel(service)}, ${shortDate(date)}` });
                onOpenChange(false);
              }}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const n = parseInt(value, 10) || 0;
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(String(Math.max(0, n - 1)))} aria-label={`One fewer in ${label}`} className="flex size-9 items-center justify-center rounded-full text-stone-500 ring-1 ring-stone-200 transition hover:text-stone-900">
        <Minus className="size-4" />
      </button>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={label}
        value={value}
        placeholder="—"
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        className="h-9 w-16 rounded-lg bg-transparent text-center text-[16px] tabular-nums text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-forest-500"
      />
      <button type="button" onClick={() => onChange(String(n + 1))} aria-label={`One more in ${label}`} className="flex size-9 items-center justify-center rounded-full text-stone-500 ring-1 ring-stone-200 transition hover:text-stone-900">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function NumberField({ label, hint, value, onChange, disabled }: { label: string; hint: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className={cn("block space-y-1.5", disabled && "opacity-40")}>
      <span className="text-sm font-medium text-stone-800">{label}</span>
      <input
        inputMode="numeric"
        disabled={disabled}
        value={disabled ? "" : value}
        placeholder={disabled ? "Sundays only" : "—"}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
        className="h-11 w-full rounded-xl bg-white px-3 text-[16px] tabular-nums text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-forest-500"
      />
      <span className="block text-xs text-stone-400">{hint}</span>
    </label>
  );
}
