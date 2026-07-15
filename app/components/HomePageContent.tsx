"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/hooks/useSession";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import {
  ArrowRight,
  Users,
  ShoppingBag,
  BookOpen,
  Ticket,
  ClipboardList,
  HeartHandshake,
  Sparkles,
  GraduationCap,
  FileText,
} from "lucide-react";
import { BRAND } from "@/lib/branding";

import LazySection from "./LazySection";
import PremiumSectionHeader from "./PremiumSectionHeader";
import PremiumPageShell from "./PremiumPageShell";
import HomeUpcomingEvents from "./HomeUpcomingEvents";
import { PROGRAM_COLORS, programColorsBySlug, type ProgramId } from "@/lib/color-system";

const ShopClient = dynamic(() => import("@/app/[locale]/shop/ShopClient"), { ssr: false });

const QUICK_ACTIONS_FALLBACK = [
  {
    id: "edu",
    slug: "edu",
    emoji: "🎓",
    label: { mn: "EDU", en: "EDU" },
    sub: { mn: "Гэр бүлд бэлтгэх", en: "Host-family prep" },
    href: "/programs/edu",
  },
  {
    id: "and",
    slug: "and",
    emoji: "🤝",
    label: { mn: "АНД", en: "AND" },
    sub: { mn: "Гэр бүл · хүүхэд", en: "Family · childcare" },
    href: "/programs/and",
  },
  {
    id: "vclub",
    slug: "vclub",
    emoji: "🌍",
    label: { mn: "V-Club", en: "V-Club" },
    sub: { mn: "Соёлын солилцоо", en: "Cultural exchange" },
    href: "/programs/vclub",
  },
];

const NAV_GRID = [
  { id: "programs", href: "/programs", label: { mn: "Хөтөлбөр", en: "Programs" }, icon: Users, tone: "programs" as const },
  { id: "events", href: "/events", label: { mn: "Уулзалт", en: "Events" }, icon: Ticket, tone: "events" as const },
  { id: "lessons", href: "/lessons", label: { mn: "Бэлтгэл", en: "Prep" }, icon: BookOpen, tone: "lessons" as const },
  { id: "shop", href: "/shop", label: { mn: "Дэлгүүр", en: "Shop" }, icon: ShoppingBag, tone: "shop" as const },
  { id: "apply", href: "/programs/apply", label: { mn: "Өргөдөл", en: "Apply" }, icon: ClipboardList, tone: "programs" as const },
  { id: "families", href: "/about", label: { mn: "Гэр бүл", en: "Families" }, icon: HeartHandshake, tone: "lessons" as const },
];

type Loc = "mn" | "en";

export default function HomePageContent({
  shopItems,
  initialPrograms,
  initialBanners,
  locale: localeProp,
}: {
  shopItems?: any[];
  initialBanners?: any[];
  initialPrograms?: any[];
  locale?: string;
}) {
  const intlLocale = useLocale();
  const loc = ((localeProp || intlLocale) === "en" ? "en" : "mn") as Loc;
  const copy = (mn: string, en: string) => (loc === "en" ? en : mn);

  const mapPrograms = (data: any[]) =>
    data.map((p: any) => {
      const raw = String(p.slug || p.code?.toLowerCase() || "edu");
      const slug: ProgramId = raw === "and" || raw === "vclub" ? raw : "edu";
      return {
        id: slug,
        slug,
        emoji: p.emoji || PROGRAM_COLORS[slug].emoji,
        label: p.name?.[loc] || p.name?.mn || p.code,
        sub: p.description?.[loc] || p.description?.mn || "",
        href: p.href || `/programs/${slug}`,
      };
    });

  const [items] = useState<any[]>(shopItems || []);
  const [programs] = useState(() => {
    if (initialPrograms?.length) return mapPrograms(initialPrograms);
    return QUICK_ACTIONS_FALLBACK.map((p) => ({
      ...p,
      label: p.label[loc],
      sub: p.sub[loc],
    }));
  });
  const [mounted, setMounted] = useState(false);
  const { status } = useSession();
  const isSignedIn = mounted && status === "authenticated";

  useEffect(() => { setMounted(true); }, []);

  const featured = useMemo(() => {
    const banner = initialBanners?.[0];
    if (banner) {
      return {
        title: banner.title || copy("Онцлох хөтөлбөр", "Featured program"),
        subtitle: banner.subtitle || BRAND.taglineMn,
        image: banner.image,
        href: banner.link || "/programs",
        type: "banner" as const,
      };
    }
    const program = programs[0];
    if (program) {
      return {
        title: program.label,
        subtitle: program.sub || copy("Au pair хөтөлбөрт нэгдэх", "Join an au pair program"),
        image: null,
        href: program.href,
        emoji: program.emoji,
        type: "program" as const,
      };
    }
    return {
      title: copy("Au Pair Mongolia", "Au Pair Mongolia"),
      subtitle: BRAND.descriptorMn,
      image: null,
      href: "/programs",
      type: "fallback" as const,
    };
  }, [initialBanners, programs, loc]);

  return (
    <PremiumPageShell className="home-dash" padded={false}>

      {/* 1. Featured opportunity */}
      <section className="px-5 pt-4 anim-fade">
        <PremiumSectionHeader
          title={copy("Онцлох боломж", "Featured for you")}
          subtitle={copy("Танд санал болгож байна", "Matching & exchange picks")}
        />
        <Link href={featured.href} className="home-featured press mt-3 block">
          {featured.image ? (
            <div
              className="home-featured__bg"
              style={{ backgroundImage: `url(${featured.image})` }}
              aria-hidden
            />
          ) : (
            <div className="home-featured__bg home-featured__bg--gradient" aria-hidden>
              {"emoji" in featured && featured.emoji ? (
                <span className="home-featured__emoji">{featured.emoji}</span>
              ) : (
                <Sparkles size={32} strokeWidth={1.8} />
              )}
            </div>
          )}
          <div className="home-featured__overlay" aria-hidden />
          <div className="home-featured__content">
            <span className="home-featured__tag">{copy("Онцлох", "Featured")}</span>
            <h2 className="home-featured__title">{featured.title}</h2>
            <p className="home-featured__sub">{featured.subtitle}</p>
            <span className="home-featured__cta">
              {copy("Дэлгэрэнгүй", "Learn more")}
              <ArrowRight size={15} />
            </span>
          </div>
        </Link>
      </section>

      {/* 2. Compact quick nav */}
      <section className="px-5 mt-5 anim-in anim-in-delay-1">
        <div className="home-quick-grid">
          {NAV_GRID.map(({ id, href, label, icon: Icon, tone }) => (
            <Link key={id} href={href} className={`home-quick-item home-quick-item--${tone} press`}>
              <span className="home-quick-item__icon">
                <Icon size={20} strokeWidth={2.1} />
              </span>
              <span className="home-quick-item__label">{label[loc]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Personalized — signed-in only */}
      {isSignedIn && (
        <section className="px-5 mt-7 anim-in anim-in-delay-2">
          <PremiumSectionHeader
            title={copy("Таны аялал", "Your journey")}
            subtitle={copy("Хурдан холбоос", "Quick links")}
          />
          <div className="home-you-grid mt-4">
            <Link href="/programs/apply" className="home-you-card press">
              <FileText size={20} strokeWidth={2} />
              <span className="home-you-card__title">{copy("Миний өргөдөл", "My application")}</span>
              <span className="home-you-card__sub">{copy("Төлөв шалгах", "Check status")}</span>
            </Link>
            <Link href="/events" className="home-you-card press">
              <Ticket size={20} strokeWidth={2} />
              <span className="home-you-card__title">{copy("Ирэх уулзалт", "Upcoming events")}</span>
              <span className="home-you-card__sub">{copy("Бүртгүүлэх", "Register")}</span>
            </Link>
            <Link href="/lessons" className="home-you-card press">
              <GraduationCap size={20} strokeWidth={2} />
              <span className="home-you-card__title">{copy("Бэлтгэл", "Prep lessons")}</span>
              <span className="home-you-card__sub">{copy("Үргэлжлүүлэх", "Continue")}</span>
            </Link>
          </div>
        </section>
      )}

      {/* 5. Upcoming events */}
      <section className="px-5 mt-8">
        <PremiumSectionHeader
          title={copy("Удахгүй болох уулзалт", "Upcoming gatherings")}
          subtitle={copy("Гэр бүл · au pair олон нийт", "Families · au pair community")}
          href="/events"
        />
        <LazySection
          placeholder={
            <div className="home-events-list mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="home-event-row home-event-row--skeleton animate-pulse" />
              ))}
            </div>
          }
        >
          <div className="mt-4">
            <HomeUpcomingEvents limit={3} />
          </div>
        </LazySection>
      </section>

      {/* 6. Recommended programs */}
      <section className="mt-8 anim-in">
        <div className="px-5">
          <PremiumSectionHeader
            title={copy("Танд санал болгох", "Recommended for you")}
            subtitle={copy("Au pair хөтөлбөрүүд", "Au pair pathways")}
            href="/programs"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto no-scroll px-5 pb-1 mt-4 snap-x-mandatory">
          {programs.map((a) => {
            const slug = (a.slug || a.id || "edu") as ProgramId;
            const chipClass =
              slug === "and" ? "program-chip--and" : slug === "vclub" ? "program-chip--vclub" : "program-chip--edu";
            const colors = programColorsBySlug(slug);
            return (
              <div key={a.id} className="snap-start">
                <Link
                  href={a.href}
                  className={`flex-shrink-0 press block program-chip premium-program-card ${chipClass}`}
                  style={{ width: 148 }}
                >
                  <div className="p-3.5 h-[120px] flex flex-col justify-between">
                    <span className="text-[28px] leading-none">{a.emoji}</span>
                    <div>
                      <p className="font-bold text-[13px] leading-tight" style={{ color: "var(--label)" }}>
                        {a.label}
                      </p>
                      <p className="text-[10px] font-semibold mt-0.5 line-clamp-1" style={{ color: colors.onSoft }}>
                        {a.sub}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          <div className="snap-start">
            <Link href="/programs/apply" className="premium-apply-card press" style={{ width: 148, height: 120 }}>
              <span className="premium-apply-card__label">{copy("Өргөдөл", "Apply")}</span>
              <span className="premium-apply-card__title text-[14px]">
                {copy("Нэгдэх", "Get started")}
              </span>
              <ArrowRight size={16} className="premium-apply-card__icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Shop preview */}
      {items.length > 0 && (localeProp || loc) && (
        <LazySection
          placeholder={
            <div className="mt-8 px-5">
              <div className="flex gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 rounded-3xl animate-pulse premium-skeleton"
                    style={{ width: 140, height: 180 }}
                  />
                ))}
              </div>
            </div>
          }
        >
          <section className="mt-8">
            <div className="px-5">
              <PremiumSectionHeader
                title={copy("Дэлгүүр", "Shop")}
                subtitle={copy("APM бүтээгдэхүүн", "APM merch")}
                href="/shop"
              />
            </div>
            <div className="flex overflow-x-auto gap-3 px-5 pb-3 mt-4 no-scroll">
              <ShopClient items={items.slice(0, 4)} locale={localeProp || loc} isHorizontal />
            </div>
          </section>
        </LazySection>
      )}

      <footer className="px-5 mt-10 pb-4 text-center">
        <p className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--label3)" }}>
          {BRAND.name}
        </p>
        <p className="text-[10px] mt-1" style={{ color: "var(--label4)" }}>
          {copy(BRAND.taglineMn, BRAND.tagline)}
        </p>
      </footer>
    </PremiumPageShell>
  );
}
