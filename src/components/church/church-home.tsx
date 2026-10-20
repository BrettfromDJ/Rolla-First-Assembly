import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

/**
 * Rolla First homepage, implemented from the Figma file
 * "Rolla-First-Website" (frame "Desktop - 4", node 37:550).
 *
 * Imagery and icons live in /public/home and are exported from that frame.
 * Several photos are shown through the design's own mask shapes, so each
 * masked slot reproduces the frame's geometry as percentages of its box.
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

const pastors = [
  { first: "Lance", last: "Langenberg", role: "Lead Pastor", photo: "pastor-1.png" },
  { first: "Garrett", last: "Smith", role: "Executive Pastor", photo: "pastor-2.png" },
  { first: "Gannon", last: "Breig", role: "Youth / Worship Pastor", photo: "pastor-3.png" },
  { first: "Micah", last: "Wells", role: "Children's Pastor", photo: "pastor-4.png" },
  { first: "Lance", last: "Langenberg", role: "Lead Pastor", photo: "pastor-5.png" },
];

/* ---------- Building blocks ---------- */

type Layer = { src: string; left: string; top: string; width: string; height: string; blend?: string; cover?: boolean };

/** A photo slot clipped by one of the design's mask images. Layers are stacked in design order. */
function Masked({ mask, layers, className }: { mask: string; layers: Layer[]; className?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ maskImage: `url("${A(mask)}")`, maskSize: "100% 100%", maskRepeat: "no-repeat", WebkitMaskImage: `url("${A(mask)}")`, WebkitMaskSize: "100% 100%", WebkitMaskRepeat: "no-repeat" }}
    >
      {layers.map((l, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={A(l.src)}
          alt=""
          className="pointer-events-none absolute max-w-none object-cover"
          style={{ left: l.left, top: l.top, width: l.width, height: l.height, mixBlendMode: l.blend as React.CSSProperties["mixBlendMode"] }}
        />
      ))}
    </div>
  );
}

function Arrow({ tone }: { tone: "cream" | "blue" }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={A(`arrow-${tone}.svg`)} alt="" width={62} height={62} className="shrink-0 transition duration-300 group-hover:rotate-45" />;
}

/** Headline italics use PP Editorial New; everything else is PP Mori. */
function Ed({ children }: { children: React.ReactNode }) {
  return <span className="font-editorial italic tracking-[-0.03em]">{children}</span>;
}

const mori = "font-mori font-semibold";

/* ---------- Page ---------- */

export function ChurchHome() {
  return (
    <div className="overflow-x-hidden bg-ink text-[#dcd2c5]">
      <div className="mx-auto max-w-[1440px] px-5 md:px-[60px]">
        {/* Header */}
        <header className="flex items-center justify-between gap-6 pt-6 md:pt-[42px]">
          <div className="flex items-center gap-[59px]">
            <Link href="/" aria-label="Rolla First home" className="text-[#dcd2c5]">
              <Logo className="h-[16px] w-auto fill-[#dcd2c5]" />
            </Link>
            <nav aria-label="Main" className="hidden items-center gap-[36px] lg:flex">
              {nav.map((n) => (
                <Link key={n.label} href={n.href} className={cn(mori, "text-[22px] leading-none tracking-[-0.05em] transition hover:text-[#0285ff]")}>
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
        </header>

        {/* Hero */}
        <section className="relative grid gap-10 pt-16 md:pt-[63px] lg:grid-cols-[minmax(0,562fr)_minmax(0,427fr)_minmax(0,44fr)_minmax(0,287fr)] lg:gap-0">
          <div className="flex flex-col items-start lg:pb-0">
            <h1 className={cn(mori, "text-[clamp(48px,5.7vw,82px)] leading-none tracking-[-0.05em] text-[#0285ff]")}>
              Where <Ed>faith</Ed>
              <br />
              feels like family
            </h1>
            <p className={cn(mori, "mt-[28px] text-[16px] uppercase leading-[1.1] tracking-[-0.03em]")}>Belong. Believe. Become.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={A("underline.svg")} alt="" width={202} height={11} className="mt-[17px]" />
            <Link
              href="#mission"
              className={cn(mori, "mt-[33px] flex h-[67px] w-[289px] items-center justify-center rounded-[80px] border-[3px] border-[#0285ff] text-[16px] leading-none tracking-[-0.05em] text-[#0285ff] transition hover:bg-[#0285ff] hover:text-black")}
            >
              SEE OUR MISSION
            </Link>
          </div>

          <div className="relative lg:mt-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={A("r-mark.svg")} alt="" width={253} height={232} className="pointer-events-none absolute left-[37%] top-[-142px] z-10 hidden lg:block" />
            <Masked
              mask="hero-mask.png"
              className="aspect-[427/471] w-full"
              layers={[
                { src: "texture.png", left: "-26.23%", top: "-40.98%", width: "362.06%", height: "328.24%", blend: "overlay" },
                { src: "hero-photo.png", left: "-100.47%", top: "-24.63%", width: "311.48%", height: "205.1%" },
              ]}
            />
          </div>

          <div className="hidden lg:block" />

          <div className="flex flex-col lg:mt-[200px]">
            <p className={cn(mori, "text-[42px] leading-none tracking-[-0.05em]")}>@2026</p>
            <p className={cn(mori, "mt-[12px] max-w-[256px] text-[15px] uppercase leading-none")}>
              More than you ask, think or imagine According to His power working in us
            </p>
            <Masked
              mask="side-mask.png"
              className="mt-8 aspect-[287/327] w-full max-w-[287px] lg:mt-auto"
              layers={[
                { src: "side-photo-base.png", left: "0", top: "0", width: "100%", height: "100%" },
                { src: "texture.png", left: "-39.02%", top: "-59.02%", width: "538.68%", height: "472.78%", blend: "overlay" },
                { src: "side-photo-top.png", left: "0", top: "0", width: "100%", height: "100%" },
              ]}
            />
          </div>
        </section>

        {/* Service times */}
        <section aria-label="Service times" className="mt-[45px] grid bg-[#0285ff] p-[3px] md:grid-cols-[462px_1fr]">
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={A("divider.svg")} alt="" width={1} height={115} className="hidden self-center md:block" />
            <div className="px-6 pb-8 pt-6 md:pl-[86px] md:pr-0 md:pt-[53px]">
              <p className={cn(mori, "text-[26px] leading-none tracking-[-0.03em]")}>Sunday’s</p>
              <p className={cn(mori, "mt-[8px] text-[15px] uppercase leading-none")}>9:00 AM &amp; 10:30AM</p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section id="mission" className="scroll-mt-10 pt-[61px]">
          <div className="relative">
            <p className={cn(mori, "text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff] lg:absolute lg:left-[11px] lg:top-[47px]")}>Our mission</p>
            <h2 className={cn(mori, "mt-4 text-[clamp(34px,7.78vw,112px)] tracking-[-0.05em] lg:mt-0")}>
              <span className="block leading-none lg:pl-[24.55%]">
                <span className="text-[rgba(220,210,197,0.36)]">Helping people</span> <Ed>come</Ed>
              </span>
              <span className="mt-[0.04em] block leading-[0.84]">
                to know, <Ed>commit</Ed> to follow,
                <br />
                &amp; continue to <Ed>serve</Ed> Jesus
              </span>
            </h2>
          </div>
        </section>

        {/* Give / Events / Sermons */}
        <section aria-label="Get involved" className="mt-[71px] grid gap-[32px] md:grid-cols-[193px_1fr_1fr]">
          <a
            href={churchLinks.give}
            className="group flex min-h-[200px] flex-col items-center justify-end gap-[28px] rounded-[280px] border-4 border-[#0285ff] bg-[#0285ff] pb-[38px] md:h-[439px]"
          >
            <span className={cn(mori, "text-[26px] leading-none tracking-[-0.03em] text-black")}>Give online</span>
            <Arrow tone="cream" />
          </a>
          {[
            { label: "Events", href: "/explore?area=events" },
            { label: "Sermons", href: churchLinks.sermons },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group flex min-h-[220px] items-end justify-between rounded-[60px] border-4 border-[#dcd2c5] pb-[38px] pl-[46px] pr-[34px] transition hover:bg-[#dcd2c5]/[0.04] md:h-[439px]"
            >
              <span className={cn(mori, "pb-[18px] text-[26px] leading-none tracking-[-0.03em]")}>{c.label}</span>
              <Arrow tone="blue" />
            </Link>
          ))}
        </section>

        {/* A Night of Worship */}
        <section aria-label="A Night of Worship" className="relative mt-[105px] aspect-[4/5] overflow-hidden @container sm:aspect-[1321/523]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={A("worship-bg.png")} alt="" className="absolute inset-0 size-full object-cover" />
          <Masked
            mask="worship-mask.png"
            className="absolute inset-0"
            layers={[
              { src: "texture.png", left: "-8.48%", top: "-36.9%", width: "117.03%", height: "295.6%", blend: "soft-light" },
              { src: "worship-photo.png", left: "-5.22%", top: "-68.83%", width: "103.33%", height: "391.59%" },
            ]}
          />
          <h2 className="absolute left-[4.16%] top-[11.5%] font-editorial text-[clamp(48px,8.48cqw,112px)] leading-[0.94] tracking-[-0.05em] text-[#0285ff]">
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
        </section>

        {/* Pastors & leadership */}
        <section aria-labelledby="pastors" className="mt-[106px]">
          <div className="grid gap-6 md:grid-cols-[536px_1fr]">
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
        </section>
      </div>

      {/* Full-bleed, horizontally scrollable leadership strip */}
      <div className="mx-auto max-w-[1440px]">
        <ul className="no-scrollbar mt-[48px] flex snap-x snap-mandatory overflow-x-auto md:mt-[67px]">
          {pastors.map((p, i) => (
            <li key={i} className="w-[min(340px,78vw)] shrink-0 snap-start">
              <div className="text-right">
                <p className={cn(mori, "text-[26px] uppercase leading-none tracking-[-0.03em]")}>
                  {p.first}
                  <br />
                  {p.last}
                </p>
                <p className={cn(mori, "mt-[8px] text-[16px] uppercase leading-[1.1] tracking-[-0.03em] text-[#0285ff]")}>{p.role}</p>
              </div>
              <div className="relative mt-[18px] aspect-[340/605] bg-[#d9d9d9]">
                <Masked
                  mask="pastor-mask.svg"
                  className="absolute inset-0"
                  layers={[{ src: p.photo, left: "-23.53%", top: "-20.17%", width: "147.06%", height: "123.97%" }]}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Closing */}
      <section aria-label="There's a place for you here" className="relative mx-auto mt-[60px] aspect-[1440/790] max-w-[1440px] @container">
        <p className={cn(mori, "pointer-events-none absolute left-[49.56%] top-[41.9%] -translate-x-1/2 -translate-y-1/2 -rotate-[5.54deg] whitespace-nowrap text-[8.47cqw] leading-none tracking-[-0.05em] text-[#0285ff]")}>
          There’s a Place for you here
        </p>
        <Masked
          mask="closing-mask.png"
          className="absolute left-[35.21%] top-[8.23%] h-[88.35%] w-[29.65%]"
          layers={[
            { src: "closing-photo-1.png", left: "-61.83%", top: "-67.62%", width: "232.08%", height: "213.18%" },
            { src: "texture.png", left: "-26.23%", top: "-27.65%", width: "362.06%", height: "221.49%", blend: "darken" },
            { src: "closing-photo-2.png", left: "-61.83%", top: "-67.62%", width: "232.08%", height: "213.18%" },
          ]}
        />
        <p className={cn(mori, "pointer-events-none absolute left-[66.08%] top-[55.19%] -translate-x-1/2 -translate-y-1/2 -rotate-[5.54deg] whitespace-nowrap text-[8.47cqw] leading-none tracking-[-0.05em] text-[#ffffff]")}>
          Come <Ed>worship</Ed> with us come worship With Us
        </p>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-[1440px] px-5 pb-[112px] pt-[22px] md:px-[60px]">
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
                className="relative flex size-[100px] items-center justify-center transition hover:scale-105"
              >
                <span aria-hidden className="absolute inset-0 rounded-[60px] border-4 border-[#0285ff] opacity-30" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={A(`icon-${key}.svg`)} alt="" width={32} height={32} />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-[32px] font-magda text-[14px] uppercase leading-none tracking-[-0.03em] opacity-60">2026 ROLLA FIRST ASSEMBLY</p>
      </footer>
    </div>
  );
}
