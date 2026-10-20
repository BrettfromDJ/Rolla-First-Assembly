"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Car, Coffee, DoorOpen, Sprout, Armchair } from "lucide-react";
import { cn } from "@/lib/utils";

const stops = [
  { n: 1, icon: Car, title: "Park in a guest spot", body: "Turn in off Larkspur Lane. Guest parking is the first row, marked with blue signs.", x: 150, y: 400 },
  { n: 2, icon: DoorOpen, title: "Meet us at the welcome tent", body: "Right outside the main doors. Jamie and the team will say hi and answer anything.", x: 352, y: 300 },
  { n: 3, icon: Coffee, title: "Grab a coffee", body: "The lobby café opens at 8:30. Coffee, tea, and pastries are always free.", x: 420, y: 205 },
  { n: 4, icon: Sprout, title: "Check in the kids", body: "Kids Wing is to the left of the lobby. Look for the blue Kids Welcome desk.", x: 205, y: 160 },
  { n: 5, icon: Armchair, title: "Find a seat", body: "The auditorium doors open 10 minutes before. Sit anywhere. Really.", x: 600, y: 160 },
];

export function CampusMap() {
  const [active, setActive] = useState(1);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
      <div className="relative overflow-hidden rounded-[32px] bg-ink-2 ring-1 ring-stone-200/60">
        <svg viewBox="0 0 800 520" className="h-auto w-full" role="img" aria-label="Illustrated map of the Gather Church campus">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="#1c1c1c" strokeWidth="1" />
            </pattern>
            <pattern id="stripes" width="22" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 0V40" stroke="#2c2c2c" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="800" height="520" fill="url(#grid)" />

          {/* Road */}
          <rect x="0" y="462" width="800" height="58" fill="#1f1f1f" />
          <path d="M0 491H800" stroke="#3a3a3a" strokeWidth="3" strokeDasharray="22 18" />
          <text x="660" y="510" className="fill-stone-500" fontSize="13" fontFamily="var(--font-sans)" letterSpacing="2">LARKSPUR LN</text>

          {/* Parking */}
          <rect x="40" y="350" width="270" height="96" rx="14" fill="#181818" />
          <rect x="52" y="362" width="246" height="34" fill="url(#stripes)" />
          <rect x="52" y="400" width="246" height="34" fill="url(#stripes)" />
          <rect x="52" y="362" width="110" height="34" fill="#0f1f38" />
          <text x="60" y="384" fontSize="11" fontFamily="var(--font-sans)" className="fill-forest-700" fontWeight="600">GUEST</text>
          <path d="M310 446v16" stroke="#1f1f1f" strokeWidth="40" />

          {/* Path from parking to entrance */}
          <path d="M175 360 C 200 320, 300 330, 352 312" fill="none" stroke="#0a7cff" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />

          {/* Building */}
          <rect x="110" y="70" width="620" height="220" rx="26" fill="#151515" stroke="#2e2e2e" />
          <rect x="120" y="80" width="190" height="200" rx="18" fill="#2a1912" />
          <text x="140" y="108" fontSize="12" fontFamily="var(--font-sans)" fill="#ff8a5c" fontWeight="600" letterSpacing="1.5">KIDS WING</text>
          <rect x="320" y="150" width="170" height="130" rx="18" fill="#262013" />
          <text x="340" y="176" fontSize="12" fontFamily="var(--font-sans)" fill="#f2c75c" fontWeight="600" letterSpacing="1.5">LOBBY · CAFÉ</text>
          <rect x="500" y="80" width="220" height="200" rx="18" fill="#0f1f38" />
          <text x="520" y="108" fontSize="12" fontFamily="var(--font-sans)" fill="#8cc4ff" fontWeight="600" letterSpacing="1.5">AUDITORIUM</text>
          {/* Doors */}
          <rect x="370" y="284" width="70" height="10" rx="5" fill="#0a7cff" />

          {/* Trees */}
          {[
            [60, 90, 26], [62, 160, 18], [770, 340, 24], [740, 400, 16], [520, 350, 20], [560, 390, 14], [620, 360, 18], [80, 250, 20],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#1d2620" opacity="0.9" />
          ))}

          {/* Pins */}
          {stops.map((s) => {
            const on = active === s.n;
            return (
              <g key={s.n} transform={`translate(${s.x} ${s.y})`} className="cursor-pointer" onClick={() => setActive(s.n)} onMouseEnter={() => setActive(s.n)}>
                {on && (
                  <motion.circle r="26" fill="#0a7cff" initial={{ opacity: 0.35, scale: 0.6 }} animate={{ opacity: 0, scale: 1.6 }} transition={{ duration: 1.6, repeat: Infinity }} />
                )}
                <circle r="17" fill={on ? "#0a7cff" : "#171717"} stroke="#0a7cff" strokeWidth="2" />
                <text textAnchor="middle" dy="5" fontSize="14" fontWeight="600" fontFamily="var(--font-sans)" fill={on ? "#0e0e0e" : "#ebe4d8"}>
                  {s.n}
                </text>
              </g>
            );
          })}
        </svg>
        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-600 shadow-sm backdrop-blur">Not to scale · but close</span>
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
                className={cn("flex w-full gap-4 rounded-3xl p-4 text-left transition duration-300 md:p-5", on ? "bg-white shadow-soft" : "hover:bg-white/50")}
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
