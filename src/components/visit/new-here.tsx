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
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex h-full min-h-64 w-full flex-col justify-between gap-10 overflow-hidden p-7 text-left transition duration-300 md:min-h-80 md:p-8",
        blue
          ? "rounded-[44px] bg-forest-700 text-ink hover:bg-forest-500 md:rounded-[999px] md:items-center md:px-10 md:py-12 md:text-center"
          : "rounded-[28px] text-paper ring-2 ring-paper/85 hover:bg-paper/[0.04]",
      )}
    >
      <span className={cn("flex items-center gap-2", blue && "md:flex-col")}>
        <span className={cn("flex size-10 items-center justify-center rounded-full", blue ? "bg-ink/10" : "bg-paper/10 text-forest-500")}>{icon}</span>
        <span className={cn("eyebrow", blue ? "text-ink/60" : "text-stone-500")}>{eyebrow}</span>
      </span>
      <span className={cn("block", blue && "md:flex md:flex-col md:items-center")}>
        <span className={cn("block font-display text-[34px] leading-[0.98] md:text-[40px]", !blue && "pr-16")}>{title}</span>
        <span className={cn("mt-3 block text-[15px]", blue ? "text-ink/70" : "text-stone-500")}>{body}</span>
        <span
          className={cn(
            "mt-7 flex size-14 items-center justify-center rounded-full transition duration-300 group-hover:rotate-45",
            blue ? "bg-paper text-ink" : "bg-forest-700 text-ink",
            !blue && "absolute bottom-7 right-7 mt-0 md:bottom-8 md:right-8",
          )}
        >
          <ArrowUpRight className="size-6" strokeWidth={1.5} />
        </span>
      </span>
    </button>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-stone-200 border-y border-stone-200">
      {faqs.map((f, i) => {
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
