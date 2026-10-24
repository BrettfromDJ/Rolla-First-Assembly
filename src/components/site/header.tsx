"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { churchLinks } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const mori = "font-mori font-semibold";

export const siteNav = [
  { href: "/#mission", label: "Mission" },
  { href: "/visit", label: "New here" },
  { href: "/kids", label: "Kids" },
  { href: "/events", label: "Events" },
  { href: "/baptism", label: "Baptism" },
  { href: "/prayer", label: "Prayer" },
  { href: churchLinks.sermons, label: "Sermons" },
  { href: churchLinks.give, label: "Giving" },
];

/** The Rolla First header, shared by every visitor-facing page (including the homepage). */
export function SiteHeader() {
  const path = usePathname();
  const { profile, hydrated } = useStore();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const name = hydrated ? profile.firstName || profile.visitPlan?.firstName : "";
  const hasProfile = hydrated && (!!name || profile.onboardingComplete || profile.rsvps.length > 0 || !!profile.visitPlan);

  return (
    <header className="relative z-40 mx-auto max-w-[1440px] px-5 pt-6 md:px-[60px] md:pt-[42px]">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-[40px] min-[1500px]:gap-[59px]">
          <Link href="/" aria-label="Rolla First home" className="text-[#dcd2c5]">
            <Logo className="h-[16px] w-auto fill-[#dcd2c5]" />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-[24px] min-[1360px]:flex min-[1500px]:gap-[32px]">
            {siteNav.map((n) => {
              const active = n.href.startsWith("/") && n.href !== "/#mission" && path.startsWith(n.href);
              return (
                <Link
                  key={n.label}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    mori,
                    "relative whitespace-nowrap text-[22px] leading-none tracking-[-0.05em] transition after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-[#0285ff] after:transition-transform after:duration-500 hover:text-[#0285ff] hover:after:scale-x-100",
                    active ? "text-[#0285ff] after:scale-x-100" : "text-[#dcd2c5] after:scale-x-0",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {hasProfile && (
            <Link
              href="/me"
              className={cn(mori, "hidden h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-[80px] border-2 border-[#dcd2c5]/40 pl-1.5 pr-5 text-[15px] leading-none tracking-[-0.03em] text-[#dcd2c5] transition hover:border-[#dcd2c5] sm:flex md:h-[57px] md:pl-2")}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#0285ff] text-[13px] text-black md:size-10">{(name || "Y")[0].toUpperCase()}</span>
              {name ? `Hi, ${name}` : "My Rolla First"}
            </Link>
          )}
          <Link
            href="/events"
            className={cn(mori, "hidden h-[44px] shrink-0 items-center whitespace-nowrap rounded-[80px] bg-[#0285ff] px-6 text-[14px] uppercase leading-none tracking-[-0.05em] text-black transition hover:brightness-110 sm:flex md:h-[57px] md:px-8 md:text-[16px]")}
          >
            Upcoming events
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[#dcd2c5]/40 text-[#dcd2c5] min-[1360px]:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden min-[1360px]:hidden"
          >
            <ul className="mt-6 border-t border-[#dcd2c5]/15">
              {[...siteNav, { href: "/youth", label: "Youth" }, { href: "/young-adults", label: "Young Adults" }, { href: "/serve", label: "Serve" }, { href: "/me", label: "My Rolla First" }].map((n) => (
                <li key={n.label} className="border-b border-[#dcd2c5]/15">
                  <Link href={n.href} className={cn(mori, "flex items-center justify-between py-4 text-[28px] leading-none tracking-[-0.05em] text-[#dcd2c5]")}>
                    {n.label}
                    <ArrowUpRight className="size-5 text-[#0285ff]" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/events" className={cn(mori, "mt-6 flex h-[52px] items-center justify-center rounded-[80px] bg-[#0285ff] text-[15px] uppercase tracking-[-0.05em] text-black sm:hidden")}>
              Upcoming events
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
