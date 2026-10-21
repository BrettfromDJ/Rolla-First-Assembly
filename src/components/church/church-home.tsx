import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClosingScroll } from "./closing-scroll";
import { Drift, MaskLines, Rise, SettleIn, WordsIn, Stagger, StaggerItem, WipeIn } from "./motion";
import { cn } from "@/lib/utils";
import { churchLinks } from "@/lib/data";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PlanVisitLink, WelcomeBackBar } from "./visitor-hooks";
import { Announcements, LeadershipStrip, SundayTimesCaps, WednesdayTimeCaps } from "@/components/site/site-bits";

/**
 * Rolla First homepage, implemented from the Figma file
 * "Rolla-First-Website" (frame "Desktop - 4", node 37:550).
 *
 * Imagery and icons live in /public/home (supplied by the church, matching
 * that frame). Motion helpers live in ./motion and all respect reduced motion.
 */

const A = (f: string) => `/home/${f}`;

/* ---------- Building blocks ---------- */

/** 62px circle (cream or blue) holding the supplied 38px arrow. */
function Arrow({ tone }: { tone: "cream" | "blue" }) {
  return (
    <span className={cn("flex size-[62px] shrink-0 items-center justify-center rounded-full transition duration-500 ease-out group-hover:scale-110", tone === "cream" ? "bg-[#dcd2c5]" : "bg-[#0285ff]")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={A("arrow.svg")} alt="" width={38} height={38} className="transition duration-500 ease-out group-hover:rotate-45" />
    </span>
  );
}

/** Headline italics use PP Editorial New; everything else is PP Mori. */
function Ed({ children }: { children: React.ReactNode }) {
  return <span className="font-editorial font-normal italic tracking-[-0.03em]">{children}</span>;
}

const mori = "font-mori font-semibold";

/* ---------- Page ---------- */

export function ChurchHome() {
  return (
    <div className="overflow-x-clip bg-ink text-[#dcd2c5]">
      <Rise load y={-16} className="relative z-20">
        <SiteHeader />
      </Rise>
      <WelcomeBackBar />
      <div className="mx-auto max-w-[1440px] px-5 md:px-[60px]">


        {/* Hero */}
        <section className="relative grid gap-10 pt-16 md:pt-[63px] lg:grid-cols-[minmax(0,562fr)_minmax(0,427fr)_minmax(0,44fr)_minmax(0,287fr)] lg:gap-0">
          <div className="flex flex-col items-start lg:pb-0">
            <h1 className={cn(mori, "text-[clamp(48px,5.7vw,82px)] leading-none tracking-[-0.05em] text-[#0285ff]")}>
              <MaskLines
                lines={[
                  <span key="l1">
                    Where <Ed>faith</Ed>
                  </span>,
                  "feels like family",
                ]}
              />
            </h1>
            <Rise load delay={0.45} y={16}>
              <p className={cn(mori, "mt-[28px] text-[16px] uppercase leading-[1.1] tracking-[-0.03em]")}>Belong. Believe. Become.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={A("underline.svg")} alt="" width={202} height={11} className="mt-[14px]" />
            </Rise>
            <Rise load delay={0.6} y={16}>
            <PlanVisitLink
              plannedLabel="SEE YOUR PLAN"
              className={cn(mori, "mt-[33px] flex h-[67px] w-[289px] items-center justify-center rounded-[80px] border-[3px] border-[#0285ff] text-[16px] leading-none tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black")}
            >
              PLAN YOUR VISIT
            </PlanVisitLink>
            </Rise>
          </div>

          <div className="relative lg:mt-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Drift className="pointer-events-none absolute left-[37%] top-[-142px] z-10 hidden lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={A("r-mark.svg")} alt="" width={254} height={233} />
            </Drift>
            <WipeIn delay={0.25}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={A("hero-main.jpg")}
              alt="Pastor Lance leading worship with arms raised, a guitarist behind him"
              width={427}
              height={471}
              fetchPriority="high"
              className="aspect-[427/471] h-auto w-full object-cover"
            />
            </WipeIn>
          </div>

          <div className="hidden lg:block" />

          <div className="flex flex-col lg:mt-[200px]">
            <Rise load delay={0.55} y={16}>
              <p className={cn(mori, "text-[42px] leading-none tracking-[-0.05em]")}>@2026</p>
              <p className={cn(mori, "mt-[12px] max-w-[256px] text-[15px] uppercase leading-none")}>
                More than you ask, think or imagine According to His power working in us
              </p>
            </Rise>
            <WipeIn delay={0.45} className="mt-8 w-full max-w-[287px] lg:mt-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={A("hero-side.png")}
                alt="A worship leader singing and playing acoustic guitar on stage"
                width={287}
                height={327}
                className="aspect-[287/327] h-auto w-full object-cover"
              />
            </WipeIn>
          </div>
        </section>

        {/* Service times */}
        <Rise><section aria-label="Service times" className="mt-[45px] grid bg-[#0285ff] p-[3px] md:grid-cols-[462px_1fr]">
          <p className={cn(mori, "px-[77px] py-10 text-[26px] leading-none tracking-[-0.03em] text-black max-md:px-6 md:self-center")}>
            Come join us <Ed>every</Ed>
            <br />
            Sunday &amp; Wednesday
            <PlanVisitLink className="mt-5 flex items-center gap-2 text-[15px] tracking-[-0.03em] text-black underline decoration-black/40 underline-offset-4 transition hover:decoration-black">
              Let us know you&apos;re coming <ArrowRight className="size-4" />
            </PlanVisitLink>
          </p>
          <div className="grid border border-[rgba(220,210,197,0.24)] bg-ink md:min-h-[177px] md:grid-cols-[381px_1px_1fr]">
            <div className="px-6 pt-8 md:pl-[120px] md:pr-0 md:pt-[53px]">
              <p className={cn(mori, "text-[26px] leading-none tracking-[-0.03em]")}>Wednesday’s</p>
              <p className="mt-[8px] font-magda text-[14px] uppercase leading-none tracking-[-0.03em] opacity-60">(ADULT and Youth)</p>
              <p className={cn(mori, "mt-[6px] text-[15px] uppercase leading-none")}><WednesdayTimeCaps /></p>
            </div>
            <span aria-hidden className="hidden h-[115px] w-px self-center bg-[#dcd2c5]/30 md:block" />
            <div className="px-6 pb-8 pt-6 md:pl-[86px] md:pr-0 md:pt-[53px]">
              <p className={cn(mori, "text-[26px] leading-none tracking-[-0.03em]")}>Sunday’s</p>
              <p className={cn(mori, "mt-[8px] text-[15px] uppercase leading-none")}><SundayTimesCaps /></p>
            </div>
          </div>
        </section></Rise>

        <Announcements />

        {/* Mission */}
        <section id="mission" className="scroll-mt-10 pt-[61px]">
          <div className="relative">
            <p className={cn(mori, "text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff] lg:absolute lg:left-[11px] lg:top-[47px]")}>Our mission</p>
            <WordsIn
              className={cn(mori, "mt-4 text-[clamp(34px,5.7vw,82px)] tracking-[-0.05em] lg:mt-0")}
              words={[
                [{ text: "Helping", dim: true }, { text: "people", dim: true }, { text: "come", italic: true }],
                [
                  { text: "to" }, { text: "know," }, { text: "commit", italic: true }, { text: "to" }, { text: "follow,", br: true },
                  { text: "&" }, { text: "continue" }, { text: "to" }, { text: "serve", italic: true }, { text: "Jesus" },
                ],
              ]}
            />
          </div>
        </section>

        {/* Give / Events / Sermons */}
        <Stagger className="mt-[71px] grid gap-[32px] md:grid-cols-[193px_1fr_1fr]">
          <StaggerItem index={0}>
          <a
            href={churchLinks.give}
            className="group flex h-full min-h-[200px] flex-col items-center justify-end gap-[28px] rounded-[280px] border-4 border-[#0285ff] bg-[#0285ff] pb-[38px] transition duration-500 ease-out hover:-translate-y-2 md:h-[439px]"
          >
            <span className={cn(mori, "text-[26px] leading-none tracking-[-0.03em] text-black")}>Give online</span>
            <Arrow tone="cream" />
          </a>
          </StaggerItem>
          {[
            { label: "Events", href: "/events?area=events" },
            { label: "Sermons", href: churchLinks.sermons },
          ].map((c) => (
            <StaggerItem key={c.label} index={c.label === "Events" ? 1 : 2}>
            <Link
              href={c.href}
              className="group relative flex h-full min-h-[220px] items-end justify-between overflow-hidden rounded-[60px] border-4 border-[#dcd2c5] pb-[38px] pl-[46px] pr-[34px] transition duration-500 ease-out hover:-translate-y-2 hover:border-[#0285ff] md:h-[439px]"
            >
              <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-[#0285ff]/[0.07] transition-transform duration-700 ease-out group-hover:scale-y-100" />
              <span className={cn(mori, "relative pb-[18px] text-[26px] leading-none tracking-[-0.03em]")}>{c.label}</span>
              <span className="relative"><Arrow tone="blue" /></span>
            </Link>
            </StaggerItem>
          ))}
        </Stagger>

        {/* A Night of Worship */}
        <Rise><section aria-label="A Night of Worship" className="group relative mt-[105px] aspect-[4/5] overflow-hidden @container sm:aspect-[1321/523]">
          <SettleIn className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={A("worship.jpg")} alt="Gannon singing and playing guitar during a night of worship" width={1321} height={523} loading="lazy" className="size-full object-cover" />
          </SettleIn>
          <h2 className="absolute left-[4.16%] top-[11.5%] font-editorial font-normal text-[clamp(48px,6.2cqw,82px)] leading-[0.94] tracking-[-0.05em] text-[#0285ff]">
            A Night
            <br />
            of Worship
          </h2>
          <p className={cn(mori, "absolute right-[4.62%] top-[13.58%] w-[364px] max-w-[60%] text-right text-[16px] uppercase leading-[1.1] tracking-[-0.03em] max-sm:hidden")}>
            A night to encounter God
          </p>
          <p className="absolute bottom-[14.34%] left-[4.16%] font-magda text-[14px] uppercase leading-none tracking-[-0.03em] opacity-60">SUNDAY, JUNE 06 AT 8:30PM</p>
          <Link href="/events?area=events" aria-label="See A Night of Worship" className="group absolute bottom-[11.47%] right-[4.62%]">
            <Arrow tone="blue" />
          </Link>
        </section></Rise>

        {/* Pastors & leadership */}
        <Rise><section aria-labelledby="pastors" className="mt-[106px]">
          <div className="grid gap-6 md:grid-cols-[536px_1fr] md:gap-x-0">
            <h2 id="pastors" className={cn(mori, "text-[clamp(48px,5.7vw,82px)] leading-[0.9] tracking-[-0.05em] text-[#0285ff]")}>
              <Ed>Pastors</Ed> &amp;
              <br />
              leadership
            </h2>
            <div className="md:pt-[57px]">
              <p className={cn(mori, "max-w-[297px] text-[15px] uppercase leading-none")}>
                Our leaders are passionate about people, grounded in faith, and committed to helping others encounter God in a real and meaningful way.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={A("underline.svg")} alt="" width={202} height={11} className="ml-[33px] mt-[6px]" />
            </div>
          </div>
        </section></Rise>
      </div>

      {/* Full-bleed, horizontally scrollable leadership strip */}
      <div className="mx-auto max-w-[1440px]">
        <LeadershipStrip />
      </div>

      {/* Closing */}
      <ClosingScroll photo={A("closing-photo.webp")} />
      <div className="relative z-10 -mt-6 flex justify-center px-5 pb-16 md:-mt-10">
        <Link
          href="/connect"
          className={cn(mori, "group flex h-[67px] items-center gap-3 rounded-[80px] bg-[#0285ff] pl-8 pr-2 text-[16px] uppercase leading-none tracking-[-0.05em] text-black transition hover:brightness-110")}
        >
          Find your place
          <span className="flex size-[51px] items-center justify-center rounded-full bg-[#dcd2c5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={A("arrow.svg")} alt="" width={30} height={30} className="transition duration-500 ease-out group-hover:rotate-45" />
          </span>
        </Link>
      </div>

      {/* Footer */}
      <Rise>
        <SiteFooter />
      </Rise>
    </div>
  );
}
