import { connectToDB } from "@/lib/db";
import ShoppingItem from "@/lib/models/ShoppingItem";
import ShopClient from "./ShopClient";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: "Shop - APM",
    description: "Discover our premium items and exclusive offers.",
  };
}

export const revalidate = 60;

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  await connectToDB();
  const res = await ShoppingItem.find({ isActive: true })
    .select("_id name price image category isActive createdAt updatedAt")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const items = res.map((item: any) => ({
    ...item,
    _id: item._id.toString(),
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  }));

  return (
    <ShopClient items={items} locale={locale} />
  );
}
