import { cn } from "@/lib/utils";
import type { SermonSeries } from "@/lib/sermons";

/**
 * Typographic series artwork, drawn in code so every series has a cover until real graphics exist.
 * Sizes with its container, so it works as a thumbnail or a full-width poster.
 */
export function SeriesArt({ series, className, label = true }: { series: SermonSeries; className?: string; label?: boolean }) {
  const words = series.title.split(" ");
  const title = words.map((w, i) => (
    <span key={i} className={cn(w === series.accent && "font-editorial font-normal italic tracking-[-0.03em]")}>
      {w}
      {i < words.length - 1 ? " " : ""}
    </span>
  ));

  const tone = {
    night: { bg: "bg-[radial-gradient(120%_120%_at_85%_0%,#0b3b7a_0%,#081426_45%,#080808_100%)]", ink: "text-[#dcd2c5]", sub: "text-[#dcd2c5]/55" },
    rings: { bg: "bg-[#0285ff]", ink: "text-black", sub: "text-black/55" },
    cream: { bg: "bg-[#dcd2c5]", ink: "text-black", sub: "text-black/50" },
    blue: { bg: "bg-[linear-gradient(160deg,#0285ff_0%,#0a3f86_70%,#081426_100%)]", ink: "text-[#dcd2c5]", sub: "text-[#dcd2c5]/60" },
  }[series.tone];

  return (
    <div className={cn("@container relative isolate aspect-video overflow-hidden", tone.bg, className)} aria-hidden>
      {series.tone === "night" && (
        <span className="absolute -right-[12%] top-1/2 -z-10 aspect-square w-[62%] -translate-y-1/2 rounded-full border border-[#dcd2c5]/20" />
      )}
      {series.tone === "rings" &&
        [38, 58, 78, 98].map((w) => (
          <span key={w} className="absolute -bottom-[30%] right-[-8%] -z-10 aspect-square rounded-full border-2 border-black/15" style={{ width: `${w}%` }} />
        ))}
      {series.tone === "cream" && <span className="absolute right-[9%] top-[14%] -z-10 aspect-square w-[22%] rounded-full bg-[#0285ff]" />}
      {series.tone === "blue" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/home/r-mark.svg" alt="" className="absolute -right-[4%] top-1/2 -z-10 w-[44%] -translate-y-1/2 opacity-30" />
      )}
      <div className="flex h-full flex-col justify-end p-[6cqw]">
        {label && <p className={cn("font-mori text-[3.2cqw] font-semibold uppercase tracking-[0.06em]", tone.sub)}>Rolla First · Series</p>}
        <p className={cn("mt-[1.5cqw] max-w-[85%] font-mori text-[11cqw] font-semibold leading-[0.9] tracking-[-0.05em]", tone.ink)}>{title}</p>
      </div>
    </div>
  );
}
