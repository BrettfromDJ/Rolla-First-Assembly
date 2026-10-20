"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { faqs } from "@/lib/data";
import { cn } from "@/lib/utils";

/* Pieces carried over from the retired "New here" landing page. */

const ease = [0.22, 1, 0.36, 1] as const;

export function PathCard({
  onClick,
  eyebrow,
  title,
  body,
  icon,
  variant,
}: {
  onClick: () => void;
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  variant: "light" | "glass";
}) {
  const blue = variant === "light";
  // Both cards share one shape and layout; path one is just filled blue.
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex h-full min-h-64 w-full flex-col justify-between gap-10 overflow-hidden rounded-[28px] p-7 text-left ring-2 transition duration-300 md:min-h-80 md:p-8",
        blue ? "bg-forest-700 text-ink ring-forest-700 hover:bg-forest-500 hover:ring-forest-500" : "text-paper ring-paper/85 hover:bg-paper/[0.04]",
      )}
    >
      <span className="flex items-center gap-2">
        <span className={cn("flex size-10 items-center justify-center rounded-full", blue ? "bg-ink/10" : "bg-paper/10 text-forest-500")}>{icon}</span>
        <span className={cn("eyebrow", blue ? "text-ink/60" : "text-stone-500")}>{eyebrow}</span>
      </span>
      <span className="block">
        <span className="block pr-16 font-display text-[34px] leading-[0.98] md:text-[40px]">{title}</span>
        <span className={cn("mt-3 block pr-16 text-[15px]", blue ? "text-ink/70" : "text-stone-500")}>{body}</span>
        <span
          className={cn(
            "absolute bottom-7 right-7 flex size-14 items-center justify-center rounded-full transition duration-300 group-hover:rotate-45 md:bottom-8 md:right-8",
            blue ? "bg-paper text-ink" : "bg-forest-700 text-ink",
          )}
        >
          <ArrowUpRight className="size-6" strokeWidth={1.5} />
        </span>
      </span>
    </button>
  );
}

export function Faq({ items = faqs }: { items?: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-stone-200 border-y border-stone-200">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q}>
            <h3>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium text-stone-900 md:text-xl"
              >
                {f.q}
                <Plus className={cn("size-5 shrink-0 text-stone-400 transition duration-300", isOpen && "rotate-45 text-forest-600")} />
              </button>
            </h3>
            <motion.div
              id={`faq-${i}`}
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <p className="max-w-2xl pb-6 text-[17px] leading-relaxed text-stone-600">{f.a}</p>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
