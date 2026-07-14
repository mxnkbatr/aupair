import AboutClient from "./AboutClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "mn" ? "Бидний тухай – APM" : "About Us – APM",
    description: locale === "mn"
      ? "Монголын Au Pair Төв – 2007 оноос хойш хүмүүнлэг нийгмийг байгуулж байна."
      : "Au Pair Mongolia – Building a humane society since 2007.",
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
