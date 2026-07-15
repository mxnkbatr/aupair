import ProgramsClient from "./ProgramsClient";
import { getTabPrograms } from "@/lib/tab-data";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Our Programs | Au Pair Mongolia",
    description: "Explore Au Pair Mongolia pathways: EDU Prep, AND family care, and V-Club cultural exchange.",
  };
}

export const revalidate = 120;

export default async function ProgramsPage() {
  const programs = await getTabPrograms();
  return <ProgramsClient initialPrograms={programs} />;
}
