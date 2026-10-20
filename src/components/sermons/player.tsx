"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import { churchLinks } from "@/lib/data";
import { seriesById, type Sermon } from "@/lib/sermons";
import { cn } from "@/lib/utils";
import { SeriesArt } from "./series-art";

/**
 * The sermon video. Until the church's YouTube channel is connected there's no video to load,
 * so pressing play explains that and links to the channel instead of pretending to play.
 */
export function SermonPlayer({ sermon, className }: { sermon: Sermon; className?: string }) {
  const [asked, setAsked] = useState(false);
  return (
    <div className={cn("relative overflow-hidden rounded-[28px]", className)}>
      <SeriesArt series={seriesById[sermon.seriesId]} />
      {!asked ? (
        <button
          onClick={() => setAsked(true)}
          aria-label={`Play ${sermon.title}`}
          className="group absolute inset-0 flex items-center justify-center bg-black/0 transition hover:bg-black/15"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-[#dcd2c5] text-black shadow-2xl transition duration-300 group-hover:scale-105 md:size-20">
            <Play className="ml-1 size-6 md:size-7" fill="currentColor" />
          </span>
          <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-[13px] tabular-nums text-[#dcd2c5] backdrop-blur md:bottom-5 md:right-5">{sermon.minutes} min</span>
        </button>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center text-[#dcd2c5] backdrop-blur-sm">
          <button onClick={() => setAsked(false)} aria-label="Close" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-[#dcd2c5]/10 hover:bg-[#dcd2c5]/20">
            <X className="size-4" />
          </button>
          <p className="max-w-sm font-mori text-[18px] font-semibold tracking-[-0.03em] md:text-[22px]">The video will play right here once our YouTube channel is connected.</p>
          <a href={churchLinks.youtube} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-[80px] bg-[#0285ff] px-5 font-mori text-[14px] font-semibold uppercase tracking-[-0.04em] text-black transition hover:brightness-110">
            Watch on YouTube
          </a>
        </div>
      )}
    </div>
  );
}
