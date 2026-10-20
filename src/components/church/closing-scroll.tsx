"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

const mori = "font-mori font-semibold";

/**
 * Closing statement: two tilted headlines that slide in opposite directions as
 * the section scrolls through the viewport. The tan line passes behind the
 * photo, the blue line in front, matching the reference recording.
 */
export function ClosingScroll({ photo }: { photo: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const left = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["6%", "-6%"]);
  const right = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  const line = (children: React.ReactNode) => (
    <>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} aria-hidden={i > 0 || undefined}>
          {children}{" "}
        </span>
      ))}
    </>
  );

  return (
    <section ref={ref} aria-label="Come worship with us. There's a place for you here." className="relative mx-auto mt-[60px] aspect-[1440/790] max-w-[1440px] @container">
      {/* Top line, behind the photo */}
      <div className="pointer-events-none absolute left-1/2 top-[41.9%] -translate-x-1/2 -translate-y-1/2 -rotate-[5.54deg]">
        <motion.p style={{ x: left }} className={cn(mori, "whitespace-nowrap text-[8.47cqw] leading-none tracking-[-0.05em] text-[#dcd2c5]")}>
          {line(
            <>
              Come <span className="font-editorial italic tracking-[-0.03em]">worship</span> with us.
            </>,
          )}
        </motion.p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt="Pastor Lance worshiping with his hand on his heart"
        width={427}
        height={698}
        loading="lazy"
        className="absolute left-[35.21%] top-[8.23%] h-[88.35%] w-[29.65%]"
      />

      {/* Bottom line, in front of the photo */}
      <div className="pointer-events-none absolute left-1/2 top-[55.19%] -translate-x-1/2 -translate-y-1/2 -rotate-[5.54deg]">
        <motion.p style={{ x: right }} className={cn(mori, "whitespace-nowrap text-[8.47cqw] leading-none tracking-[-0.05em] text-[#0285ff]")}>
          {line(<>There’s a place for you here.</>)}
        </motion.p>
      </div>
    </section>
  );
}
