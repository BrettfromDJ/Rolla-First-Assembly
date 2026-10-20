import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { church } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="bg-forest-900 text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8 md:py-20">
        <div className="space-y-5">
          <Logo inverted />
          <p className="max-w-xs text-[15px] leading-relaxed text-paper/60">
            A church for people who are still figuring it out. Which is to say, all of us.
          </p>
        </div>
        <div className="space-y-3 text-[15px]">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-paper/40">Sundays</p>
          <p>9:00 &amp; 11:00 AM</p>
          <p className="text-paper/60">{church.serviceLength}</p>
        </div>
        <div className="space-y-3 text-[15px]">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-paper/40">Find us</p>
          <p>{church.address}</p>
          <p className="text-paper/60">{church.city}</p>
          <a href={church.mapsUrl} target="_blank" rel="noreferrer" className="inline-block text-forest-500 underline-offset-4 hover:underline">
            Get directions
          </a>
        </div>
        <div className="space-y-3 text-[15px]">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-paper/40">Explore</p>
          <ul className="space-y-2.5 text-paper/80">
            <li><Link className="hover:text-paper" href="/visit">Plan a visit</Link></li>
            <li><Link className="hover:text-paper" href="/connect">Get connected</Link></li>
            <li><Link className="hover:text-paper" href="/explore">Groups &amp; events</Link></li>
            <li><a className="hover:text-paper" href={`mailto:${church.email}`}>{church.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-paper/40 md:px-8">
          Gather Church is a fictional church created for this prototype. Names, places, and events are illustrative.
        </p>
      </div>
    </footer>
  );
}
