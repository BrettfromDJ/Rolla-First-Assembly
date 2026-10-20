"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** A large, tappable card for choosing an interest. */
export function ChoiceCard({
  selected,
  onToggle,
  icon,
  iconTone,
  title,
  body,
  index = 0,
}: {
  selected: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  iconTone: string;
  title: string;
  body: string;
  index?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group relative flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left ring-1 transition-[box-shadow,background-color] duration-200 sm:p-5",
        selected ? "ring-2 ring-forest-600 shadow-soft" : "ring-stone-200/80 hover:ring-stone-300 hover:shadow-soft",
      )}
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
          selected ? "bg-forest-700 text-paper" : iconTone,
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-medium text-stone-900">{title}</span>
        <span className="mt-0.5 block text-[14px] leading-snug text-stone-500">{body}</span>
      </span>
      <Tick on={selected} />
    </motion.button>
  );
}

export function Tick({ on, className }: { on: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full ring-1 transition-all duration-200",
        on ? "bg-forest-600 ring-forest-600" : "ring-stone-300",
        className,
      )}
    >
      <motion.span initial={false} animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
        <Check className="size-3.5 text-paper" strokeWidth={3} />
      </motion.span>
    </span>
  );
}

/** Pill toggles for lighter-weight multi-select questions. */
export function Pills({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2.5">
      {options.map((o, i) => {
        const on = value.includes(o.id);
        return (
          <motion.button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.id) : [...value, o.id])}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.4 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] ring-1 transition-colors duration-200",
              on ? "bg-forest-700 text-paper ring-forest-700" : "bg-white text-stone-800 ring-stone-200 hover:ring-stone-300",
            )}
          >
            <motion.span initial={false} animate={{ width: on ? 16 : 0, opacity: on ? 1 : 0 }} className="inline-flex overflow-hidden">
              <Check className="size-4 shrink-0" strokeWidth={2.5} />
            </motion.span>
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}

/** Single-choice list with supporting hint text. */
export function SingleList<T extends string>({
  options,
  value,
  onChange,
  label,
  columns,
}: {
  options: readonly { id: T; label: string; hint?: string }[];
  value: T | null;
  onChange: (v: T) => void;
  label: string;
  columns?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-2.5", columns && "sm:grid-cols-3")}>
      {options.map((o, i) => {
        const on = value === o.id;
        return (
          <motion.button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            whileTap={{ scale: 0.985 }}
            className={cn(
              "flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left ring-1 transition duration-200",
              on ? "ring-2 ring-forest-600" : "ring-stone-200 hover:ring-stone-300",
              columns && "sm:flex-col sm:items-start sm:gap-3",
            )}
          >
            <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full ring-1 transition", on ? "ring-[6px] ring-forest-600" : "ring-stone-300", columns && "sm:order-last")} aria-hidden />
            <span className="flex-1">
              <span className="block font-medium text-stone-900">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-sm text-stone-500">{o.hint}</span>}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/** Multi-select tiles (e.g. age groups). */
export function Tiles({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: string; label: string; hint?: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-2.5">
      {options.map((o, i) => {
        const on = value.includes(o.id);
        return (
          <motion.button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.id) : [...value, o.id])}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative flex min-h-28 flex-col justify-between rounded-2xl bg-white p-4 text-left ring-1 transition duration-200",
              on ? "ring-2 ring-forest-600" : "ring-stone-200 hover:ring-stone-300",
              i === options.length - 1 && options.length % 2 === 1 && "col-span-2 min-h-0",
            )}
          >
            <Tick on={on} className="absolute right-3.5 top-3.5" />
            {o.hint && <span className="font-display text-2xl text-stone-400">{o.hint}</span>}
            <span className="mt-3 pr-6 font-medium text-stone-900">{o.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
