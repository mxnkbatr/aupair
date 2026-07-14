import ProgramsClient from "./ProgramsClient";
import { getTabPrograms } from "@/lib/tab-data";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Our Programs | Au Pair Mongolia",
    description: "Explore our diverse volunteering programs: EDU-Volunteer, AND, and V-Club.",
  };
}

export const revalidate = 120;

export default async function ProgramsPage() {
  const programs = await getTabPrograms();
  return <ProgramsClient initialPrograms={programs} />;
}
