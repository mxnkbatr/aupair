"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { staggerContainer, staggerItem, springSnappy } from "@/lib/motion";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import PremiumSectionHeader from "@/app/components/PremiumSectionHeader";
import ShopProductCard, { formatShopCategory } from "@/app/components/ShopProductCard";

const T = {
  shopTitle: { en: "Our Shop", mn: "Дэлгүүр", de: "Unser Shop" },
  notFound: { en: "No items found", mn: "Бүтээгдэхүүн олдсонгүй", de: "Keine Artikel gefunden" },
  notFoundSub: {
    en: "Check back soon for new arrivals!",
    mn: "Удахгүй шинэ бүтээгдэхүүн нэмэгдэнэ!",
    de: "Schauen Sie bald wieder vorbei!",
  },
  catAll: { en: "All", mn: "Бүгд", de: "Alle" },
} as const;

export default function ShopClient({
  items = [],
  locale = "en",
  isHorizontal = false,
}: {
  items?: any[];
  locale?: string;
  isHorizontal?: boolean;
}) {
  const [filter, setFilter] = useState("all");
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(items.map((item: any) => item.category).filter(Boolean)))],
    [items]
  );
  const filteredItems = useMemo(
    () => items.filter((item: any) => filter === "all" || item.category === filter),
    [items, filter]
  );

  if (isHorizontal) {
    return (
      <>
        {items.map((item: any, i: number) => (
          <ShopProductCard
            key={item._id}
            item={item}
            locale={locale}
            index={i}
            variant="horizontal"
            animated={false}
          />
        ))}
      </>
    );
  }

  return (
    <PremiumPageShell>
      <motion.div
        className="space-y-4 pt-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <PremiumSectionHeader
            title={T.shopTitle[locale as keyof typeof T.shopTitle] || T.shopTitle.en}
            subtitle="APM merchandise"
          />
        </motion.div>

        <motion.div variants={staggerItem} className="premium-filter-row">
          {categories.slice(0, 6).map((cat: any) => {
            const on = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`premium-filter-pill press ${on ? "on" : ""}`}
                style={
                  on
                    ? {
                        background: "linear-gradient(180deg, #FFAA22 0%, var(--module-shop) 100%)",
                        borderColor: "rgba(255,255,255,0.22)",
                        boxShadow: "0 4px 14px rgba(232, 145, 10, 0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
                        color: "white",
                      }
                    : undefined
                }
              >
                {cat === "all"
                  ? T.catAll[locale as keyof typeof T.catAll] || T.catAll.en
                  : formatShopCategory(cat, locale)}
              </button>
            );
          })}
        </motion.div>

        <div className="min-h-[400px]">
          {filteredItems.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item: any, i: number) => (
                  <ShopProductCard key={item._id} item={item} locale={locale} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div variants={staggerItem} className="premium-empty-state">
              <div className="premium-empty-state__icon">
                <ShoppingBag size={26} strokeWidth={2} style={{ color: "var(--module-shop)" }} />
              </div>
              <p className="premium-empty-state__title">
                {T.notFound[locale as keyof typeof T.notFound] || T.notFound.en}
              </p>
              <p className="premium-empty-state__sub">
                {T.notFoundSub[locale as keyof typeof T.notFoundSub] || T.notFoundSub.en}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </PremiumPageShell>
  );
}
