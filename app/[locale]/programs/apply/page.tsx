import { Metadata } from "next";
import ProgramsApplyClient from "./ProgramsApplyClient";
import { getTabPrograms } from "@/lib/tab-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "mn" ? "Өргөдөл гаргах – APM" : "Apply to program – APM",
    description: "APM хөтөлбөрт өргөдөл гаргах",
  };
}

export default async function ProgramsApplyPage() {
  const programs = await getTabPrograms();
  return <ProgramsApplyClient initialPrograms={programs as any} />;
}
