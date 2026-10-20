"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Armchair, Car, Coffee, DoorOpen, Sprout, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Illustrated campus map, traced from an aerial view of the building at
 * N Oak St & E 17th St. North is up.
 */
const stops = [
  { n: 1, icon: Car, title: "Park in any lot", body: "Lots north of the building (across 17th St), south of the building, and across Oak St are all yours.", x: 448, y: 545 },
  { n: 2, icon: DoorOpen, title: "Come in the main entrance", body: "On the west side of the building, facing Oak St. The welcome team will be right inside to say hi.", x: 334, y: 296 },
  { n: 3, icon: Coffee, title: "Grab a coffee in the gym", body: "Head downstairs to the gym. Coffee, tea, and pastries are always free.", x: 442, y: 380 },
  { n: 4, icon: Sprout, title: "Check in the kids", body: "The kids area is downstairs too. Look for the blue Kids Welcome desk.", x: 510, y: 318 },
  { n: 5, icon: Armchair, title: "Find a seat in the auditorium", body: "Doors open 10 minutes before. Sit anywhere. Really.", x: 510, y: 272 },
  { n: 6, icon: Users, title: "Students, head upstairs", body: "6th–12th graders meet in the youth room upstairs on Wednesday nights.", x: 497, y: 424 },
];

const C = {
  ground: "#121212",
  road: "#1f1f1f",
  roadLine: "#3a3a3a",
  lot: "#171717",
  stripe: "#2c2c2c",
  house: "#1b1b1b",
  tree: "#18211b",
  building: "#151515",
  edge: "#3b3b3a",
  blue: "#0a7cff",
  cream: "#ebe4d8",
  dim: "#77736c",
};

function Lot({ x, y, w, h, rows = 2, label }: { x: number; y: number; w: number; h: number; rows?: number; label?: string }) {
  const rowH = h / rows;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={C.lot} stroke={C.stripe} />
      {Array.from({ length: rows }).map((_, r) => (
        <g key={r}>
          {Array.from({ length: Math.floor((w - 16) / 16) }).map((__, i) => (
            <line key={i} x1={x + 12 + i * 16} x2={x + 12 + i * 16} y1={y + r * rowH + 8} y2={y + r * rowH + rowH * 0.42} stroke={C.stripe} strokeWidth="1.5" />
          ))}
        </g>
      ))}
      <g transform={`translate(${x + w - 18} ${y + 18})`}>
        <circle r="10" fill={C.blue} />
        <text textAnchor="middle" dy="4" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)" fill="#0e0e0e">P</text>
      </g>
      {label && (
        <text x={x + 10} y={y + h - 9} fontSize="9" fontFamily="var(--font-sans)" fill={C.dim} letterSpacing="1.2">
          {label}
        </text>
      )}
    </g>
  );
}

function Zone({ x, y, w, h, fill, title, sub }: { x: number; y: number; w: number; h: number; fill: string; title: string; sub?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={fill} />
      <text x={x + 8} y={y + 15} fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" fill={C.cream} letterSpacing="1.2">
        {title}
      </text>
      {sub && (
        <text x={x + 8} y={y + 27} fontSize="8.5" fontFamily="var(--font-sans)" fill={C.dim}>
          {sub}
        </text>
      )}
    </g>
  );
}

export function CampusMap() {
  const [active, setActive] = useState(1);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
      <div className="relative overflow-hidden rounded-[32px] bg-ink-2 ring-1 ring-stone-200/60">
        <svg viewBox="40 40 560 640" className="h-auto w-full" role="img" aria-label="Map of the church campus at N Oak St and E 17th St, showing parking lots, the main entrance, gym, kids area, auditorium, and youth room">
          <rect x="0" y="0" width="800" height="720" fill={C.ground} />

          {/* Neighborhood context */}
          {[
            [160, 340, 76, 44], [70, 470, 60, 50], [190, 545, 70, 70], [80, 600, 60, 60], [150, 650, 50, 40],
            [560, 250, 40, 34], [575, 380, 30, 60],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill={C.house} />
          ))}
          {[
            [70, 60, 22], [120, 60, 16], [230, 120, 12], [72, 300, 16], [125, 360, 18], [250, 470, 14], [240, 640, 18],
            [560, 300, 20], [575, 460, 22], [565, 600, 18], [520, 60, 18],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={C.tree} />
          ))}

          {/* Streets */}
          <rect x="276" y="0" width="48" height="720" fill={C.road} />
          <rect x="0" y="184" width="800" height="50" fill={C.road} />
          <path d="M300 0V184M300 234V720" stroke={C.roadLine} strokeWidth="1.5" strokeDasharray="10 10" />
          <path d="M0 209H276M324 209H800" stroke={C.roadLine} strokeWidth="1.5" strokeDasharray="10 10" />
          <text x="306" y="600" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill={C.dim} letterSpacing="2.5" transform="rotate(-90 306 600)">N OAK ST</text>
          <text x="96" y="213" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill={C.dim} letterSpacing="2.5">E 17TH ST</text>
          <text x="420" y="213" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill={C.dim} letterSpacing="2.5">E 17TH ST</text>

          {/* Parking */}
          <Lot x={78} y={86} w={188} h={92} label="NORTHWEST LOT" />
          <Lot x={342} y={40} w={182} h={138} rows={3} label="NORTH LOT" />
          <Lot x={70} y={244} w={198} h={84} label="WEST LOT" />
          <Lot x={345} y={470} w={207} h={192} rows={4} label="SOUTH LOT" />

          {/* Walking routes to the entrance */}
          <g fill="none" stroke={C.blue} strokeWidth="2.5" strokeDasharray="1 8" strokeLinecap="round" opacity="0.9">
            <path d="M430 178 V 238 H 334 V 296" />
            <path d="M268 286 H 334" />
            <path d="M420 470 V 456 H 334 V 296" />
          </g>

          {/* Building */}
          <path d="M351 242 H532 V452 H497 V466 H437 V398 H354 V340 H351 Z" fill={C.building} stroke={C.edge} strokeWidth="1.5" />
          <Zone x={395} y={248} w={131} h={48} fill="#0f1f38" title="AUDITORIUM" />
          <Zone x={395} y={300} w={131} h={36} fill="#13231b" title="KIDS" sub="downstairs" />
          <Zone x={358} y={342} w={104} h={52} fill="#262013" title="GYM · COFFEE" sub="downstairs" />
          <Zone x={467} y={342} w={59} h={104} fill="#1c1626" title="YOUTH" sub="upstairs" />
          <text x="358" y="262" fontSize="9" fontWeight="600" fontFamily="var(--font-sans)" fill={C.cream} letterSpacing="1">ENTRY</text>
          {/* Main doors on the Oak St side */}
          <rect x="347" y="280" width="8" height="34" rx="4" fill={C.blue} />

          {/* North arrow */}
          <g transform="translate(578 76)">
            <circle r="16" fill="none" stroke={C.edge} />
            <path d="M0 -10 L5 4 L0 1 L-5 4 Z" fill={C.cream} />
          </g>

          {/* Pins */}
          {stops.map((s) => {
            const on = active === s.n;
            return (
              <g key={s.n} transform={`translate(${s.x} ${s.y})`} className="cursor-pointer" onClick={() => setActive(s.n)} onMouseEnter={() => setActive(s.n)}>
                {on && (
                  <motion.circle r="20" fill={C.blue} initial={{ opacity: 0.4, scale: 0.6 }} animate={{ opacity: 0, scale: 1.7 }} transition={{ duration: 1.6, repeat: Infinity }} />
                )}
                <circle r="13" fill={on ? C.blue : "#171717"} stroke={C.blue} strokeWidth="2" />
                <text textAnchor="middle" dy="4.5" fontSize="12.5" fontWeight="700" fontFamily="var(--font-sans)" fill={on ? "#0e0e0e" : C.cream}>
                  {s.n}
                </text>
              </g>
            );
          })}
        </svg>
        <span className="absolute bottom-4 left-4 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-medium text-stone-500 ring-1 ring-stone-200 backdrop-blur">N Oak St &amp; E 17th St</span>
      </div>

      <ol className="space-y-2">
        {stops.map((s) => {
          const on = active === s.n;
          const Icon = s.icon;
          return (
            <li key={s.n}>
              <button
                onClick={() => setActive(s.n)}
                onMouseEnter={() => setActive(s.n)}
                aria-pressed={on}
                className={cn("flex w-full gap-4 rounded-3xl p-4 text-left transition duration-300 md:p-5", on ? "bg-white shadow-soft ring-1 ring-stone-200" : "hover:bg-white/50")}
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition", on ? "bg-forest-700 text-ink" : "bg-stone-200/70 text-stone-600")}>
                  {s.n}
                </span>
                <span>
                  <span className="flex items-center gap-2 font-medium text-stone-900">
                    {s.title} <Icon className={cn("size-4 transition", on ? "text-forest-500" : "text-stone-300")} />
                  </span>
                  <span className={cn("mt-1 block text-[15px] leading-relaxed transition-colors", on ? "text-stone-600" : "text-stone-400")}>{s.body}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
