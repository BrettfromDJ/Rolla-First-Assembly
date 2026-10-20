import Link from "next/link";
import { Mark } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Mark className="size-12" />
      <h1 className="mt-8 font-display text-5xl text-stone-900">This door doesn&apos;t lead anywhere.</h1>
      <p className="mt-4 max-w-sm text-stone-500">But you&apos;re still welcome here. Let&apos;s get you back on track.</p>
      <Button asChild className="mt-8"><Link href="/">Back to Rolla First</Link></Button>
    </main>
  );
}
