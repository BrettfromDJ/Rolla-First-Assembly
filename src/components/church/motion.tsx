"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Motion primitives for the church homepage. Everything here is decorative:
 * content renders in place for reduced-motion users and if JS is slow.
 */

const ease = [0.22, 1, 0.36, 1] as const;

/** Fade and rise into view once. */
export function Rise({ children, delay = 0, y = 28, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Headline lines that slide up from behind a mask on page load. */
export function MaskLines({ lines, className, delay = 0.1 }: { lines: React.ReactNode[]; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block"
            initial={reduce ? false : { y: "105%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.1, delay: delay + i * 0.12, ease }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Photo that wipes open from the bottom and settles from a slight zoom. */
export function WipeIn({ children, delay = 0, className, onLoad = false }: { children: React.ReactNode; delay?: number; className?: string; onLoad?: boolean }) {
  const reduce = useReducedMotion();
  const to = { clipPath: "inset(0% 0% 0% 0%)", scale: 1 };
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
      {...(onLoad ? { animate: { clipPath: to.clipPath } } : { whileInView: { clipPath: to.clipPath }, viewport: { once: true, margin: "-60px" } })}
      transition={{ duration: 1.2, delay, ease }}
    >
      <motion.div
        initial={reduce ? false : { scale: 1.18 }}
        {...(onLoad ? { animate: { scale: 1 } } : { whileInView: { scale: 1 }, viewport: { once: true, margin: "-60px" } })}
        transition={{ duration: 1.6, delay, ease }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Gentle, continuous drift for the hero "R" mark. */
export function Drift({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, rotate: -8, scale: 0.9 }}
      animate={reduce ? { opacity: 1, rotate: 0, scale: 1 } : { opacity: 1, rotate: [0, 2, 0], scale: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 1, delay: 0.5 },
        scale: { duration: 1.2, delay: 0.5, ease },
        rotate: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
        y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Children shift vertically at a different rate than the page scroll. */
export function Parallax({ children, amount = 60, className }: { children: React.ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [amount, -amount]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="size-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Banner image that slowly zooms out and drifts as it scrolls through. */
export function ScrollZoom({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.18, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-4%", "4%"]);
  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ scale, y }} className="size-full">
        {children}
      </motion.div>
    </div>
  );
}

type Word = { text: string; italic?: boolean; dim?: boolean; br?: boolean };

/** Mission headline: each word brightens in turn as the reader scrolls. */
export function ScrollWords({ words, className }: { words: Word[][]; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const flat = words.flat();
  let n = 0;
  return (
    <h2 ref={ref} className={className}>
      {words.map((line, li) => (
        <span key={li} className={li === 0 ? "block leading-none lg:pl-[24.55%]" : "mt-[0.04em] block leading-[0.84]"}>
          {line.map((w, wi) => {
            const i = n++;
            return (
              <span key={wi}>
                <ScrollWord progress={scrollYProgress} i={i} total={flat.length} target={w.dim ? 0.36 : 1} reduce={!!reduce}>
                  {w.italic ? <span className="font-editorial font-normal italic tracking-[-0.03em]">{w.text}</span> : w.text}
                </ScrollWord>
                {w.br ? <br /> : wi < line.length - 1 ? " " : null}
              </span>
            );
          })}
        </span>
      ))}
    </h2>
  );
}

function ScrollWord({ progress, i, total, target, reduce, children }: { progress: MotionValue<number>; i: number; total: number; target: number; reduce: boolean; children: React.ReactNode }) {
  const start = i / total;
  const opacity = useTransform(progress, [start, start + 1 / total], reduce ? [target, target] : [0.12, target]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/** Stagger children into view, e.g. cards or portraits. */
export function Stagger({ children, className, as = "div", gap = 0.09 }: { children: React.ReactNode; className?: string; as?: "div" | "ul"; gap?: number }) {
  const reduce = useReducedMotion();
  const Comp = as === "ul" ? motion.ul : motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </Comp>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};

export function StaggerItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp className={className} variants={staggerItem}>
      {children}
    </Comp>
  );
}
