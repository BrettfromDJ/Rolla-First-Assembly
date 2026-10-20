import Link from "next/link";
import { church, churchLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

const mori = "font-mori font-semibold";

const socials = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["youtube", "YouTube"],
] as const;

/** The Rolla First footer, shared by every visitor-facing page (including the homepage). */
export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1440px] px-5 pb-[112px] pt-[22px] text-[#dcd2c5] md:px-[60px]">
      <div className="flex flex-col justify-between gap-12 md:flex-row md:items-start">
        <div>
          <p className={cn(mori, "text-[32px] leading-none tracking-[-0.01em] text-[#0285ff]")}>FOLLOW ROLLA FIRST</p>
          <ul className="mt-[32px] flex gap-[20px]">
            {socials.map(([key, label]) => (
              <li key={key}>
                <a
                  href={churchLinks[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Rolla First on ${label}`}
                  className="group relative flex size-[100px] items-center justify-center transition duration-500 ease-out hover:-translate-y-1"
                >
                  <span aria-hidden className="absolute inset-0 rounded-[60px] border-4 border-[#0285ff] opacity-30 transition duration-500 group-hover:opacity-100" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/home/icon-${key}.svg`} alt="" width={32} height={32} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-10 text-[15px] leading-snug sm:grid-cols-3 md:gap-14">
          <div className="space-y-2">
            <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Sundays</p>
            <p className={mori}>9:00 &amp; 10:30 AM</p>
            <p className="pt-2 font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Wednesdays</p>
            <p className={mori}>6:30 PM · Adults &amp; youth</p>
          </div>
          <div className="space-y-2">
            <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Find us</p>
            <p className={mori}>{church.address}</p>
            <p className="opacity-70">{church.city}</p>
            <a href={church.mapsUrl} target="_blank" rel="noreferrer" className={cn(mori, "inline-flex h-9 items-center rounded-[80px] bg-[#0285ff] px-4 text-[13px] text-black transition hover:brightness-110")}>
              Get directions
            </a>
          </div>
          <div className="space-y-2">
            <p className="font-magda text-[13px] uppercase tracking-[0.04em] opacity-60">Say hello</p>
            <a href={`tel:${church.phone.replace(/\D/g, "")}`} className={cn(mori, "block hover:text-[#0285ff]")}>{church.phone}</a>
            <a href={`mailto:${church.email}`} className={cn(mori, "block hover:text-[#0285ff]")}>{church.email}</a>
            <Link href="/visit" className={cn(mori, "block text-[#0285ff] hover:underline")}>Plan your first visit</Link>
            <Link href="/baptism" className={cn(mori, "block text-[#0285ff] hover:underline")}>Get baptized</Link>
            <Link href="/kids" className={cn(mori, "block text-[#0285ff] hover:underline")}>Kids First</Link>
          </div>
        </div>
      </div>
      <p className="mt-[48px] font-magda text-[14px] uppercase leading-none tracking-[-0.03em] opacity-60">© 2026 ROLLA FIRST ASSEMBLY</p>
    </footer>
  );
}
