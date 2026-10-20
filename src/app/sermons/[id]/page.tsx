import { notFound } from "next/navigation";
import { SermonDetail } from "@/components/sermons/sermon-detail";
import { sermonById, sermons } from "@/lib/sermons";

export function generateStaticParams() {
  return sermons.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = sermonById[id];
  return s ? { title: s.title, description: s.summary } : { title: "Sermons" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!sermonById[id]) notFound();
  return <SermonDetail id={id} />;
}
