"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Megaphone, TriangleAlert, X } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/church/motion";
import { useSite } from "@/lib/store";
import { clock, clockFull, liveAnnouncements, sundayLine } from "@/lib/site";
import { cn } from "@/lib/utils";

/*
 * Small pieces of the public site that read from the admin's Website tab.
 * They render the defaults on the server, then pick up saved edits in the browser.
 */

const mori = "font-mori font-semibold";

/** "9:00 & 10:30 AM" */
export function SundayTimes() {
  return <>{sundayLine(useSite())}</>;
}

/** "6:30 PM" */
export function WednesdayTime() {
  return <>{clockFull(useSite().wednesday)}</>;
}

/** The church's phone, email and address, as edited by staff. */
export function ChurchContact({ field }: { field: "phone" | "email" | "address" | "city" }) {
  return <>{useSite()[field]}</>;
}

export function PhoneLink({ className }: { className?: string }) {
  const { phone } = useSite();
  return <a href={`tel:${phone.replace(/\D/g, "")}`} className={className}>{phone}</a>;
}

export function EmailLink({ className }: { className?: string }) {
  const { email } = useSite();
  return <a href={`mailto:${email}`} className={className}>{email}</a>;
}

/** Homepage "Service times" figures: "9:00 AM & 10:30AM" in the Figma's spacing. */
export function SundayTimesCaps() {
  const [a, b] = useSite().sunday;
  return <>{clockFull(a)} &amp; {clock(b)}{clockFull(b).slice(-2)}</>;
}

/** "6:30PM" */
export function WednesdayTimeCaps() {
  const w = useSite().wednesday;
  return <>{clock(w)}{clockFull(w).slice(-2)}</>;
}

/* ---------- Alert banner ---------- */

const DISMISS_KEY = "gather:alert-dismissed";

/** A full-width notice above the header, like "Services cancelled for snow". */
export function SiteAlertBanner() {
  const { alert } = useSite();
  const [dismissed, setDismissed] = useState<string | null>(null);
  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY));
    } catch {}
  }, []);

  const stamp = `${alert.updatedAt ?? ""}|${alert.message}`;
  if (!alert.on || !alert.message.trim() || dismissed === stamp) return null;
  const urgent = alert.tone === "urgent";
  const Icon = urgent ? TriangleAlert : Megaphone;

  return (
    <div role={urgent ? "alert" : "status"} className={cn("relative z-50", urgent ? "bg-[#f2b134] text-black" : "bg-[#dcd2c5] text-black")}>
      <div className="mx-auto flex max-w-[1440px] items-start gap-3 px-5 py-3 md:items-center md:px-[60px]">
        <Icon className="mt-0.5 size-5 shrink-0 md:mt-0" />
        <p className="min-w-0 flex-1 text-[15px] leading-snug">
          <span className={mori}>{alert.message}</span>
          {alert.href && (
            <Link href={alert.href} className={cn(mori, "ml-2 inline-flex items-center gap-1 underline decoration-black/40 underline-offset-4 hover:decoration-black")}>
              {alert.linkLabel || "Learn more"} <ArrowRight className="size-3.5" />
            </Link>
          )}
        </p>
        <button
          onClick={() => {
            setDismissed(stamp);
            try {
              sessionStorage.setItem(DISMISS_KEY, stamp);
            } catch {}
          }}
          aria-label="Hide this notice"
          className="-m-1.5 flex size-8 shrink-0 items-center justify-center rounded-full transition hover:bg-black/10"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Homepage announcements ---------- */

export function Announcements() {
  const site = useSite();
  const list = liveAnnouncements(site);
  if (!list.length) return null;
  return (
    <section aria-labelledby="announcements" className="mt-[72px]">
      <h2 id="announcements" className={cn(mori, "text-[16px] uppercase leading-none tracking-[-0.03em] text-[#0285ff]")}>Announcements</h2>
      <Stagger as="ul" className={cn("mt-6 grid gap-4", list.length > 1 && "md:grid-cols-2", list.length > 2 && "lg:grid-cols-3")}>
        {list.map((a, i) => (
          <StaggerItem as="li" index={i} key={a.id} className="flex">
            <div className="flex w-full flex-col rounded-[28px] border-2 border-[#dcd2c5]/25 p-7 md:p-8">
              <p className={cn(mori, "text-[26px] leading-[1.05] tracking-[-0.04em]")}>{a.title}</p>
              {a.body && <p className="mt-3 max-w-[52ch] text-[17px] leading-relaxed text-[#dcd2c5]/75">{a.body}</p>}
              {a.href && (
                <Link href={a.href} className={cn(mori, "group mt-auto inline-flex items-center gap-2 self-start pt-6 text-[15px] uppercase tracking-[-0.04em] text-[#0285ff]")}>
                  {a.linkLabel || "Learn more"} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* ---------- Homepage leadership strip ---------- */

export function LeadershipStrip() {
  const people = useSite().staff.filter((s) => s.onSite);
  return (
    <Stagger as="ul" gap={0.07} className="no-scrollbar mt-[48px] flex overflow-x-auto overflow-y-hidden md:mt-[67px]">
      {people.map((p, i) => {
        const [first, ...rest] = p.name.split(" ");
        return (
          <StaggerItem as="li" index={i} key={p.id} className="group w-[min(340px,78vw)] shrink-0 snap-start">
            <div className="flex flex-col items-end text-right">
              <p className={cn(mori, "text-[26px] uppercase leading-none tracking-[-0.03em]")}>
                {first}
                <br />
                {rest.join(" ")}
              </p>
              <p className={cn(mori, "mt-[8px] text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>{p.role}</p>
              {p.email && (
                <a href={`mailto:${p.email}`} className={cn(mori, "mt-[10px] inline-block text-[16px] leading-none tracking-[-0.03em] opacity-80 transition hover:text-[#0285ff] hover:opacity-100")}>
                  {p.email}
                </a>
              )}
            </div>
            <div className="relative mt-[18px] aspect-[340/605] overflow-hidden bg-[#1a1a1a]">
              {p.photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.photo} alt={`${p.name}, ${p.role}`} width={340} height={605} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
              ) : (
                <span className={cn(mori, "absolute inset-0 flex items-center justify-center text-[64px] tracking-[-0.05em] text-[#dcd2c5]/20")}>{first[0]}{rest.join(" ")[0] ?? ""}</span>
              )}
              {p.bio && (
                <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-5 pb-5 pt-16 text-[15px] leading-snug text-[#dcd2c5]">{p.bio}</p>
              )}
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
