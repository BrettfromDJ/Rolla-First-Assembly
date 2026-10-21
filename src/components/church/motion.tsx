"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Motion for the church homepage, built so content can never get stuck hidden:
 *
 * - Load animations (`load`, MaskLines, WipeIn, Drift) are plain CSS keyframes.
 *   They always run to completion and need no JavaScript.
 * - Scroll reveals render visible. Only sections that start below the fold are
 *   "armed" (hidden) after mount, then revealed when they enter the viewport.
 *
 * Styles live in globals.css under "Church homepage motion".
 */

type Css = React.CSSProperties & Record<`--${string}`, string | number>;

/** Arms an element only if it is below the fold when the page mounts, then reveals it on entry. */
function useReveal<T extends HTMLElement>(margin = "0px 0px -80px 0px") {
  const ref = useRef<T>(null);
  const [state, setState] = useState<"armed" | "shown" | undefined>(undefined);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already on screen: leave it visible
    setState("armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, state] as const;
}

/** Fade and rise. With `load`, plays once on page load (CSS only); otherwise when scrolled into view. */
export function Rise({ children, delay = 0, y = 28, className, load }: { children: React.ReactNode; delay?: number; y?: number; className?: string; load?: boolean }) {
  const [ref, state] = useReveal<HTMLDivElement>();
  const style: Css = { "--rd": `${delay}s`, "--ry": `${y}px` };
  if (load)
    return (
      <div className={cn("m-load-rise", className)} style={style}>
        {children}
      </div>
    );
  return (
    <div ref={ref} data-reveal={state} className={cn("m-rise", className)} style={style}>
      {children}
    </div>
  );
}

/** Headline lines that slide up from behind a mask on page load. */
export function MaskLines({ lines, className, delay = 0.1 }: { lines: React.ReactNode[]; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
          <span className="m-line block" style={{ "--rd": `${delay + i * 0.12}s` } as Css}>
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Photo that wipes open from the bottom and settles from a slight zoom on page load. */
export function WipeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string; onLoad?: boolean }) {
  return (
    <div className={cn("m-wipe overflow-hidden", className)} style={{ "--rd": `${delay}s` } as Css}>
      <div className="m-wipe-inner">{children}</div>
    </div>
  );
}

/** Fades in, then drifts gently forever (the hero "R"). */
export function Drift({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="m-drift">{children}</div>
    </div>
  );
}

/** Banner image that settles from a slight zoom when scrolled into view. */
export function SettleIn({ children, className }: { children: React.ReactNode; className?: string }) {
  const [ref, state] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-reveal={state} className={cn("m-settle overflow-hidden", className)}>
      <div className="size-full">{children}</div>
    </div>
  );
}

type Word = { text: string; italic?: boolean; dim?: boolean; br?: boolean };

/** Mission headline: words brighten one after another when it scrolls into view. */
export function WordsIn({ words, className }: { words: Word[][]; className?: string }) {
  const [ref, state] = useReveal<HTMLHeadingElement>("0px 0px -120px 0px");
  let n = 0;
  return (
    <h2 ref={ref} data-reveal={state} className={cn("m-words", className)}>
      {words.map((line, li) => (
        <span key={li} className={li === 0 ? "block leading-none lg:pl-[24.55%]" : "mt-[0.04em] block leading-[0.84]"}>
          {line.map((w, wi) => {
            const i = n++;
            return (
              <span key={wi}>
                <span className="m-word" style={{ "--o": w.dim ? 0.36 : 1, "--i": i } as Css}>
                  {w.italic ? <span className="font-editorial font-normal italic tracking-[-0.03em]">{w.text}</span> : w.text}
                </span>
                {w.br ? <br /> : wi < line.length - 1 ? " " : null}
              </span>
            );
          })}
        </span>
      ))}
    </h2>
  );
}

/** Children (StaggerItem) rise into view one after another. */
export function Stagger({ children, className, as = "div", gap = 0.09 }: { children: React.ReactNode; className?: string; as?: "div" | "ul"; gap?: number }) {
  const [ref, state] = useReveal<HTMLDivElement & HTMLUListElement>();
  const Comp = as;
  return (
    <Comp ref={ref} data-reveal={state} className={cn("m-stagger", className)} style={{ "--gap": `${gap}s` } as Css}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div", index = 0 }: { children: React.ReactNode; className?: string; as?: "div" | "li"; index?: number }) {
  const Comp = as;
  return (
    <Comp className={cn("m-stagger-item", className)} style={{ "--i": index } as Css}>
      {children}
    </Comp>
  );
}

/**
 * A list or grid whose items rise in one after another when it scrolls into view.
 * A drop-in for the wrapping element: <RevealGroup as="ul" className="grid ...">.
 */
export function RevealGroup({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "ul" | "ol" }) {
  const [ref, state] = useReveal<HTMLDivElement & HTMLUListElement & HTMLOListElement>();
  const Comp = as;
  return (
    <Comp ref={ref} data-reveal={state} className={cn("m-group", className)}>
      {children}
    </Comp>
  );
}

/**
 * Counts up to a number the first time it's on screen. Accepts plain numbers or text that starts with one
 * ("462", "1,284", "14/18"); only the leading number animates and the rest stays as written.
 */
export function CountUp({ value, duration = 1100 }: { value: string | number; duration?: number }) {
  const text = String(value);
  const m = text.match(/^(\d[\d,]*)(.*)$/s);
  const target = m ? Number(m[1].replace(/,/g, "")) : NaN;
  const rest = m ? m[2] : "";
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(target) || target === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 4);
        setShown(p < 1 ? Math.round(target * eased) : null);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      setShown(0);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        run();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  if (!m) return <>{text}</>;
  return (
    <span ref={ref} className="tabular-nums">
      {shown === null ? m[1] : shown.toLocaleString("en-US")}
      {rest}
    </span>
  );
}
