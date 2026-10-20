import { redirect } from "next/navigation";
import { DetailClient } from "./detail-client";
import { buildOfferings } from "@/lib/data";

export function generateStaticParams() {
  return buildOfferings().map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: buildOfferings().find((o) => o.id === id)?.title ?? "Event" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = buildOfferings().find((x) => x.id === id);
  if (o?.href) redirect(o.href);
  // Unknown ids may be events staff built in the admin; the browser looks those up.
  return <DetailClient id={id} />;
}
