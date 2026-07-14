import { notFound } from "next/navigation";
import { getEventById } from "@/lib/tab-data";
import EventDetailClient from "./EventDetailClient";
import { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "Event – APM" };
  const title =
    locale === "en"
      ? (event as any).title?.en
      : (event as any).title?.mn || (event as any).title?.en;
  return {
    title: `${title || "Event"} – APM`,
    description:
      locale === "en"
        ? (event as any).description?.en
        : (event as any).description?.mn,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return <EventDetailClient initialEvent={event as any} />;
}
