import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ClosingScroll } from "./closing-scroll";
import { Drift, MaskLines, Rise, SettleIn, WordsIn, Stagger, StaggerItem, WipeIn } from "./motion";
import { cn } from "@/lib/utils";

/**
 * Rolla First homepage, implemented from the Figma file
 * "Rolla-First-Website" (frame "Desktop - 4", node 37:550).
 *
 * Imagery and icons live in /public/home (supplied by the church, matching
 * that frame). Motion helpers live in ./motion and all respect reduced motion.
 */

const A = (f: string) => `/home/${f}`;

/** Destinations that live outside this prototype. Swap in the church's real URLs. */
export const churchLinks = {
  give: "https://rollafirst.church",
  sermons: "https://rollafirst.church",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
};

const nav = [
  { label: "Mission", href: "#mission" },
  { label: "Giving", href: churchLinks.give },
  { label: "Sermons", href: churchLinks.sermons },
  { label: "Events", href: "/explore?area=events" },
];

/** Portraits are 340×605 (or 2×) in /public/home/team. */
const pastors: { first: string; last: string; role: string; email: string; image: string }[] = [
  { first: "Lance", last: "Langenberg", role: "Lead Pastor", email: "pastorlance@rollafirst.church", image: "team/lance-langenberg.jpg" },
  { first: "Garrett", last: "Smith", role: "Executive Pastor", email: "pastorgarrett@rollafirst.church", image: "team/garrett-smith.jpg" },
  { first: "Gannon", last: "Breig", role: "Youth / Worship Pastor", email: "pastorgannon@rollafirst.church", image: "team/gannon-breig.jpg" },
  { first: "Micah", last: "Wells", role: "Children's Pastor", email: "pastormicah@rollafirst.church", image: "team/micah-wells.jpg" },
  { first: "Pam", last: "Bales", role: "Children's Discipleship Pastor", email: "pastorpam@rollafirst.church", image: "team/pam-bales.jpg" },
  { first: "Amber", last: "Eckelkamp", role: "Administrative Assistant", email: "office@rollafirst.church", image: "team/amber-eckelkamp.jpg" },
  { first: "Brice", last: "Adams", role: "Belle Campus Pastor", email: "pastorbrice@rollafirst.church", image: "team/brice-adams.jpg" },
  { first: "Debbie", last: "Skyles", role: "Kid's First Director", email: "debbie@rollafirst.church", image: "team/debbie-skyles.jpg" },
];

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
      <div className="mx-auto max-w-[1440px] px-5 md:px-[60px]">
        {/* Header */}
        <Rise y={-16} className="relative z-20"><header className="flex items-center justify-between gap-6 pt-6 md:pt-[42px]">
          <div className="flex items-center gap-[59px]">
            <Link href="/" aria-label="Rolla First home" className="text-[#dcd2c5]">
              <Logo className="h-[16px] w-auto fill-[#dcd2c5]" />
            </Link>
            <nav aria-label="Main" className="hidden items-center gap-[36px] lg:flex">
              {nav.map((n) => (
                <Link key={n.label} href={n.href} className={cn(mori, "relative text-[22px] leading-none tracking-[-0.05em] transition after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#0285ff] after:transition-transform after:duration-500 hover:text-[#0285ff] hover:after:scale-x-100")}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/explore?area=events"
            className={cn(mori, "flex h-[44px] items-center rounded-[80px] bg-[#0285ff] px-6 text-[14px] uppercase leading-none tracking-[-0.05em] text-black transition hover:brightness-110 md:h-[57px] md:px-8 md:text-[16px]")}
          >
            Upcoming events
          </Link>
        </header></Rise>

        {/* Hero */}
        <section className="relative grid gap-10 pt-16 md:pt-[63px] lg:grid-cols-[minmax(0,562fr)_minmax(0,427fr)_minmax(0,44fr)_minmax(0,287fr)] lg:gap-0">
          <div className="flex flex-col items-start lg:pb-0">
            <h1 className={cn(mori, "text-[clamp(48px,5.7vw,82px)] leading-none tracking-[-0.05em] text-[#0285ff]")}>
              <MaskLines
                lines={[
                  <>
                    Where <Ed>faith</Ed>
                  </>,
                  "feels like family",
                ]}
              />
            </h1>
            <Rise delay={0.45} y={16}>
              <p className={cn(mori, "mt-[28px] text-[16px] uppercase leading-[1.1] tracking-[-0.03em]")}>Belong. Believe. Become.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={A("underline.svg")} alt="" width={202} height={11} className="mt-[14px]" />
            </Rise>
            <Rise delay={0.6} y={16}>
            <Link
              href="#mission"
              className={cn(mori, "mt-[33px] flex h-[67px] w-[289px] items-center justify-center rounded-[80px] border-[3px] border-[#0285ff] text-[16px] leading-none tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black")}
            >
              SEE OUR MISSION
            </Link>
            </Rise>
          </div>

          <div className="relative lg:mt-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Drift className="pointer-events-none absolute left-[37%] top-[-142px] z-10 hidden lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={A("r-mark.svg")} alt="" width={254} height={233} />
            </Drift>
            <WipeIn onLoad delay={0.25}>
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
            <Rise delay={0.55} y={16}>
              <p className={cn(mori, "text-[42px] leading-none tracking-[-0.05em]")}>@2026</p>
              <p className={cn(mori, "mt-[12px] max-w-[256px] text-[15px] uppercase leading-none")}>
                More than you ask, think or imagine According to His power working in us
              </p>
            </Rise>
            <WipeIn onLoad delay={0.45} className="mt-8 w-full max-w-[287px] lg:mt-auto">
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
          </p>
          <div className="grid border border-[rgba(220,210,197,0.24)] bg-ink md:min-h-[177px] md:grid-cols-[381px_1px_1fr]">
            <div className="px-6 pt-8 md:pl-[120px] md:pr-0 md:pt-[53px]">
              <p className={cn(mori, "text-[26px] leading-none tracking-[-0.03em]")}>Wednesday’s</p>
              <p className="mt-[8px] font-magda text-[14px] uppercase leading-none tracking-[-0.03em] opacity-60">(ADULT and Youth)</p>
              <p className={cn(mori, "mt-[6px] text-[15px] uppercase leading-none")}>6:30PM</p>
            </div>
            <span aria-hidden className="hidden h-[115px] w-px self-center bg-[#dcd2c5]/30 md:block" />
            <div className="px-6 pb-8 pt-6 md:pl-[86px] md:pr-0 md:pt-[53px]">
              <p className={cn(mori, "text-[26px] leading-none tracking-[-0.03em]")}>Sunday’s</p>
              <p className={cn(mori, "mt-[8px] text-[15px] uppercase leading-none")}>9:00 AM &amp; 10:30AM</p>
            </div>
          </div>
        </section></Rise>

        {/* Mission */}
        <section id="mission" className="scroll-mt-10 pt-[61px]">
          <div className="relative">
            <p className={cn(mori, "text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff] lg:absolute lg:left-[11px] lg:top-[47px]")}>Our mission</p>
            <WordsIn
              className={cn(mori, "mt-4 text-[clamp(34px,7.78vw,112px)] tracking-[-0.05em] lg:mt-0")}
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
          <StaggerItem>
          <a
            href={churchLinks.give}
            className="group flex h-full min-h-[200px] flex-col items-center justify-end gap-[28px] rounded-[280px] border-4 border-[#0285ff] bg-[#0285ff] pb-[38px] transition duration-500 ease-out hover:-translate-y-2 md:h-[439px]"
          >
            <span className={cn(mori, "text-[26px] leading-none tracking-[-0.03em] text-black")}>Give online</span>
            <Arrow tone="cream" />
          </a>
          </StaggerItem>
          {[
            { label: "Events", href: "/explore?area=events" },
            { label: "Sermons", href: churchLinks.sermons },
          ].map((c) => (
            <StaggerItem key={c.label}>
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
          <h2 className="absolute left-[4.16%] top-[11.5%] font-editorial font-normal text-[clamp(48px,8.48cqw,112px)] leading-[0.94] tracking-[-0.05em] text-[#0285ff]">
            A Night
            <br />
            of Worship
          </h2>
          <p className={cn(mori, "absolute right-[4.62%] top-[13.58%] w-[364px] max-w-[60%] text-right text-[16px] uppercase leading-[1.1] tracking-[-0.03em] max-sm:hidden")}>
            A night to encounter God
          </p>
          <p className="absolute bottom-[14.34%] left-[4.16%] font-magda text-[14px] uppercase leading-none tracking-[-0.03em] opacity-60">SUNDAY, JUNE 06 AT 8:30PM</p>
          <Link href="/explore?area=events" aria-label="See A Night of Worship" className="group absolute bottom-[11.47%] right-[4.62%]">
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
        <Stagger as="ul" gap={0.07} className="no-scrollbar mt-[48px] flex overflow-x-auto overflow-y-hidden md:mt-[67px]">
          {pastors.map((p) => (
            <StaggerItem as="li" key={`${p.first}-${p.last}`} className="group w-[min(340px,78vw)] shrink-0 snap-start">
              <div className="flex flex-col items-end text-right">
                <p className={cn(mori, "text-[26px] uppercase leading-none tracking-[-0.03em]")}>
                  {p.first}
                  <br />
                  {p.last}
                </p>
                <p className={cn(mori, "mt-[8px] text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>{p.role}</p>
                <a href={`mailto:${p.email}`} className={cn(mori, "mt-[10px] inline-block text-[16px] leading-none tracking-[-0.03em] opacity-80 transition hover:text-[#0285ff] hover:opacity-100")}>
                  {p.email}
                </a>
              </div>
              <div className="relative mt-[18px] aspect-[340/605] overflow-hidden bg-[#1a1a1a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A(p.image)} alt={`${p.first} ${p.last}, ${p.role}`} width={340} height={605} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* Closing */}
      <ClosingScroll photo={A("closing-photo.webp")} />

      {/* Footer */}
      <Rise><footer className="mx-auto max-w-[1440px] px-5 pb-[112px] pt-[22px] md:px-[60px]">
        <p className={cn(mori, "text-[32px] leading-none tracking-[-0.01em] text-[#0285ff]")}>FOLLOW ROLLA FIRST</p>
        <ul className="mt-[32px] flex gap-[20px]">
          {(
            [
              ["facebook", "Facebook"],
              ["instagram", "Instagram"],
              ["youtube", "YouTube"],
            ] as const
          ).map(([key, label]) => (
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
                <img src={A(`icon-${key}.svg`)} alt="" width={32} height={32} />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-[32px] font-magda text-[14px] uppercase leading-none tracking-[-0.03em] opacity-60">2026 ROLLA FIRST ASSEMBLY</p>
      </footer></Rise>
    </div>
  );
}
