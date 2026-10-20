import { notFound } from "next/navigation";
import { DetailClient } from "./detail-client";
import { buildOfferings } from "@/lib/data";

export function generateStaticParams() {
  return buildOfferings().map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: buildOfferings().find((o) => o.id === id)?.title ?? "Explore" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!buildOfferings().some((o) => o.id === id)) notFound();
  return <DetailClient id={id} />;
}
