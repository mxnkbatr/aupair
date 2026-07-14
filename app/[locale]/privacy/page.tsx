import { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "mn"
        ? "Нууцлалын бодлого – Au Pair Mongolia"
        : "Privacy Policy – Au Pair Mongolia",
    description:
      locale === "mn"
        ? "Au Pair Mongolia (APM) апп болон вэбсайтын нууцлалын бодлого."
        : "Privacy policy for the Au Pair Mongolia (APM) app and website.",
  };
}

export default function PrivacyPage() {
  return <PrivacyClient />;
}
