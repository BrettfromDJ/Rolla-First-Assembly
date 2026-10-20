"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const tones = {
  forest: "from-forest-700 via-forest-600 to-forest-800",
  sage: "from-sage via-forest-300 to-forest-500",
  honey: "from-honey-soft via-honey to-clay",
  clay: "from-clay-soft via-clay to-forest-800",
  sand: "from-paper-2 via-sand to-stone-300",
} as const;

export type Tone = keyof typeof tones;

/**
 * Photography with a graceful, on-brand fallback. If the remote image fails,
 * we show a warm gradient with a soft arch motif instead of a broken icon.
 */
export function Photo({
  src,
  alt,
  className,
  imgClassName,
  tone = "forest",
  priority,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  tone?: Tone;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const el = ref.current;
    if (el?.complete) setState(el.naturalWidth > 0 ? "ok" : "error");
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-sand", className)}>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
          tones[tone],
          state === "ok" ? "opacity-0" : "opacity-100",
        )}
      >
        {state === "error" && (
          <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${120 - i * 26} 320 V${170 - i * 6} a${80 + i * 26} ${80 + i * 26} 0 0 1 ${160 + i * 52} 0 V320`}
                fill="none"
                stroke="white"
                strokeWidth="1.2"
              />
            ))}
            <circle cx="200" cy="200" r="10" fill="white" />
          </svg>
        )}
      </div>
      {state !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("ok")}
          onError={() => setState("error")}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out",
            state === "ok" ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
      {children}
    </div>
  );
}
