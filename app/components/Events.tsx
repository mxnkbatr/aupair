"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import {
  ArrowUpRight,
  Clock,
  MapPin,
  Loader2,
  ChevronRight,
  BookOpen,
  User,
  PlayCircle
} from "lucide-react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence
} from "framer-motion";
import { useIsMobile, Motion as motion } from "./MotionProxy";
import { clientCache } from "@/lib/client-cache";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";

// --- CONFIG & BRAND ---
const BRAND = {
  PRIMARY: "#C41E3A",
  PRIMARY_SOFT: "rgba(14, 165, 233, 0.15)",
  SECONDARY: "#F0F9FF",     // Ice white overlay
  ACCENT: "#1AABB8",        // Lighter Sky (was GREEN)
  ACCENT_SOFT: "rgba(56, 189, 248, 0.15)",
  DARK: "#0F172A",          // Slate 900
};

const TABS = [
  { id: 'blogs', en: 'News & Blogs', mn: 'Мэдээлэл', de: 'Nachrichten & Blogs' },
  { id: 'events', en: 'Events', mn: 'Арга Хэмжээ', de: 'Veranstaltungen' },
] as const;

const EVENT_CATEGORIES = [
  { id: 'all', en: 'All Events', mn: 'Бүгд', de: 'Alle Veranstaltungen' },
  { id: 'campaign', en: 'Campaigns', mn: 'Аяны Ажил', de: 'Kampagnen' },
  { id: 'workshop', en: 'Workshops', mn: 'Сургалт', de: 'Workshops' },
  { id: 'fundraiser', en: 'Fundraisers', mn: 'Хандив', de: 'Spendenaktionen' },
] as const;

const BLOG_CATEGORIES = [
  { id: 'all', en: 'All Posts', mn: 'Бүгд', de: 'Alle Beiträge' },
  { id: 'tips', en: 'Guides & Tips', mn: 'Зөвлөгөө', de: 'Anleitungen & Tipps' },
  { id: 'vlog', en: 'Vlogs', mn: 'Влог', de: 'Vlogs' },
  { id: 'news', en: 'Company News', mn: 'Мэдээ', de: 'Unternehmens-News' },
] as const;

// --- SUB-COMPONENT: BRANDED CARD ---

// Sub-component for desktop-only interactive effects to save mobile CPU
const InteractiveCardWrapper = ({ children, isMobile }: { children: (rotateX: any, rotateY: any, handleMouseMove: any, handleMouseLeave: any) => React.ReactNode, isMobile: boolean }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return children(rotateX, rotateY, handleMouseMove, handleMouseLeave);
};

const ContentCard = ({ item, lang, isDark, isMobile, type }: any) => {
  // Calculate date client-side to avoid hydration mismatch
  const [dateObj, setDateObj] = useState({ day: "00", month: "..." });

  useEffect(() => {
    if (item.date) {
      const d = new Date(typeof item.date === 'string' ? item.date.replace(/-/g, "/") : item.date);
      setDateObj({
        day: d.getDate().toString().padStart(2, '0'),
        month: d.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', { month: 'short' }).toUpperCase()
      });
    }
  }, [item.date, lang]);

  const isBlog = type === 'blogs';
  const authorName = typeof item.author === 'string' ? item.author : (item.author?.[lang] || item.author?.en);

  const renderCard = (rotateX: any = 0, rotateY: any = 0, handleMouseMove?: any, handleMouseLeave?: any) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.96 }}
      style={{
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        press active:scale-95 transition-transform
        relative group rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer h-full min-h-[320px] sm:min-h-[400px] border transition-all duration-500
        ${isDark
          ? "bg-slate-900/50 border-white/5 shadow-none hover:bg-slate-800"
          : "bg-white border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(14,165,233,0.15)]"
        }
      `}
    >
      {/* --- IMAGE SECTION --- */}
      <div className="absolute inset-0 h-full w-full pointer-events-none">
        <Image
          src={item.image || "/logo.jpg"}
          alt={item.title[lang] || "Content"}
          fill
          priority={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 sm:group-hover:scale-110 opacity-100"
          quality={75}
        />

        {/* Gradient Overlay - Stronger at bottom for text readability */}
        <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 sm:group-hover:opacity-90 transition-opacity`} />

        {/* Play Button for Vlogs */}
        {item.category === 'vlog' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 group-hover:scale-110 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl">
              <PlayCircle className="w-8 h-8 text-white fill-white/20" />
            </div>
          </div>
        )}
      </div>

      {/* --- FLOATING DATE --- */}
      <div className="absolute top-6 left-6 z-20 flex flex-col items-center justify-center rounded-2xl w-14 h-16 bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
        <span className="text-xl font-black leading-none">{dateObj.day}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{dateObj.month}</span>
      </div>

      {/* --- CONTENT DETAILS --- */}
      <div className="absolute bottom-0 left-0 w-full p-5 sm:p-8 z-20 flex flex-col justify-end h-full pointer-events-none">
        <div className="transform transition-transform duration-500 sm:group-hover:-translate-y-2 pointer-events-auto">

          {/* Tags / Metadata */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-sky-700 border border-sky-200/50 backdrop-blur-md"
              style={{ backgroundColor: BRAND.ACCENT_SOFT }}
            >
              {item.category}
            </span>

            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {isBlog ? (
                <><User size={12} style={{ color: BRAND.PRIMARY }} /> {authorName}</>
              ) : (
                <><MapPin size={12} style={{ color: BRAND.PRIMARY }} /> {item.location?.[lang] || item.location?.en || 'Online'}</>
              )}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-2xl font-black leading-none tracking-tight mb-2 sm:mb-3 text-white line-clamp-2 group-hover:text-sky-300 transition-colors">
            {item.title[lang] || item.title.en}
          </h3>

          {/* Time or Read Time */}
          <div className="text-xs font-bold flex items-center gap-2 mb-4 text-slate-300">
            {isBlog ? (
              <> <BookOpen size={14} style={{ color: BRAND.ACCENT }} /> {item.readTime || "5 min read"} </>
            ) : (
              <> <Clock size={14} style={{ color: BRAND.ACCENT }} /> {item.timeString} </>
            )}
          </div>
        </div>

        {/* Read More Button */}
        <div className="h-0 overflow-hidden sm:group-hover:h-auto sm:group-hover:pb-1 transition-all duration-500 opacity-0 sm:group-hover:opacity-100 pointer-events-auto">
          <div className="w-full h-[1px] bg-white/20 mb-4" />
          <Link href={`/${isBlog ? 'news' : 'events'}/${item._id}`} className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-white hover:gap-4 transition-all">
            {lang === 'mn' ? 'Дэлгэрэнгүй' : 'Read More'}
            <span className="p-1.5 rounded-full text-white shadow-lg" style={{ backgroundColor: BRAND.PRIMARY }}>
              <ArrowUpRight size={10} />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );

  if (isMobile) return renderCard();

  return (
    <InteractiveCardWrapper isMobile={isMobile}>
      {(rotateX, rotateY, onMouseMove, onMouseLeave) => renderCard(rotateX, rotateY, onMouseMove, onMouseLeave)}
    </InteractiveCardWrapper>
  );
};

// --- MAIN SECTION ---
export default function LatestUpdatesSection({
  isHorizontal = false,
  compact = false,
  defaultTab = 'blogs',
}: {
  isHorizontal?: boolean;
  compact?: boolean;
  defaultTab?: 'events' | 'blogs';
}) {
  const lang = useLocale() as any;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<'events' | 'blogs'>(defaultTab);
  const [filter, setFilter] = useState("all");

  const [events, setEvents] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme check
  const isDark = mounted && (theme === 'dark');

  const categories = activeTab === "events" ? EVENT_CATEGORIES : BLOG_CATEGORIES;

  // Fetch Events & Blogs (use shared client cache when available)
  useEffect(() => {
    async function fetchData() {
      const cachedEvents = clientCache.get<any[]>('/api/events');
      const cachedNews = clientCache.get<any[]>('/api/news');
      if (cachedEvents) setEvents(cachedEvents);
      if (cachedNews) {
        setBlogs(cachedNews.map((blog: any) => ({
          ...blog,
          date: blog.publishedDate,
          category: blog.tags?.[0] || 'General',
          readTime: "3 min read"
        })));
      }
      if (cachedEvents && cachedNews) {
        setLoading(false);
        if (clientCache.age('/api/events') < 60_000 && clientCache.age('/api/news') < 60_000) return;
      }

      try {
        const results = await Promise.allSettled([
          fetch('/api/events').then(r => r.ok ? r.json() : Promise.reject('Failed to fetch events')),
          fetch('/api/news').then(r => r.ok ? r.json() : Promise.reject('Failed to fetch news'))
        ]);

        if (results[0].status === 'fulfilled') {
          clientCache.set('/api/events', results[0].value);
          setEvents(results[0].value);
        }

        if (results[1].status === 'fulfilled') {
          clientCache.set('/api/news', results[1].value);
          const data = results[1].value;
          const mappedBlogs = data.map((blog: any) => ({
            ...blog,
            date: blog.publishedDate,
            category: blog.tags?.[0] || 'General',
            readTime: "3 min read"
          }));
          setBlogs(mappedBlogs);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayedItems = activeTab === 'events' ? events : blogs;
  const filteredItems = displayedItems.filter(item => filter === 'all' || item.category === filter);

  if (!mounted) return null;

  if (isHorizontal) {
    if (loading) {
      return (
        <>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 animate-pulse rounded-3xl"
              style={{ width: 190, height: 250, background: "var(--fill2)" }}
            />
          ))}
        </>
      );
    }
    return (
      <>
        {displayedItems.slice(0, 6).map((item) => {
          const title = item.title?.[lang] || item.title?.en || "No Title";
          const isBlog = activeTab === "blogs";
          const dateStr = item.date
            ? new Date(item.date)
                .toLocaleDateString("en-US", { month: "short", day: "numeric" })
                .toUpperCase()
            : "";
          return (
            <Link
              key={item._id}
              href={`/${isBlog ? "news" : "events"}/${item._id}`}
              className="flex-shrink-0 press relative overflow-hidden block"
              style={{ width: 190, height: 250, borderRadius: "var(--r-2xl)" }}
            >
              {/* Image */}
              <div className="absolute inset-0 bg-slate-200">
                <Image
                  src={item.image || "/logo.jpg"}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="190px"
                  priority={true}
                />
              </div>
              {/* Gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
                }}
              />
              {/* Date badge */}
              <div
                className="absolute top-3 left-3 px-2 py-1 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "0.5px solid rgba(255,255,255,0.3)",
                }}
              >
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  {dateStr}
                </span>
              </div>
              {/* Category */}
              <div
                className="absolute top-3 right-3 px-2 py-1 rounded-xl"
                style={{ background: "var(--blue)" }}
              >
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                  {item.category || "General"}
                </span>
              </div>
              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-[14px] leading-snug line-clamp-2">
                  {title}
                </h3>
                {item.timeString && (
                  <p className="text-white/60 text-[11px] font-medium mt-1 flex items-center gap-1">
                    <Clock size={10} /> {item.timeString}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="space-y-6">
          <div className="seg">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setFilter('all'); }}
                  className={`seg-item ${isActive ? 'on' : ''}`}
                >
                  {(tab as any)[lang]}
                </button>
              )
            })}
          </div>

          <div>
            <h2 className="t-large-title">
              {activeTab === 'events'
                ? (lang === 'mn' ? 'Арга Хэмжээ' : 'Upcoming Events')
                : (lang === 'mn' ? 'Мэдээлэл' : 'Latest Insights')
              }
            </h2>
            <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>
              {activeTab === 'events' 
                ? (lang === 'mn' ? 'Ойрын хугацаанд болох үйл ажиллагаанууд' : 'Upcoming activities and gatherings')
                : (lang === 'mn' ? 'Сүүлийн үеийн мэдээ, зөвлөгөө' : 'Recent news and helpful guides')
              }
            </p>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="overflow-x-auto no-scroll -mx-4 px-4">
            <div className="flex gap-2">
              {categories.map((cat) => {
                const isActive = filter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className="badge press"
                    style={{ 
                      background: isActive ? 'var(--blue)' : 'var(--fill2)', 
                      color: isActive ? 'white' : 'var(--label2)',
                      padding: '8px 16px',
                      fontSize: 12
                    }}
                  >
                    {(cat as any)[lang]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* GRID CONTENT */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="ios-spinner" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {filteredItems.map((item) => {
                const title = item.title[lang] || item.title.en;
                const isBlog = activeTab === 'blogs';
                const d = new Date(item.date);
                const dateStr = d.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', { month: 'short', day: 'numeric' });

                return (
                  <motion.div
                    key={item._id}
                    className="card overflow-hidden press flex flex-col"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link href={`/${isBlog ? 'news' : 'events'}/${item._id}`} className="block h-full">
                      <div className="relative h-44 bg-slate-100">
                        <Image
                          src={item.image || "/logo.jpg"}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--blue)' }}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                        <div>
                          <h3 className="t-headline line-clamp-2">{title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="t-caption flex items-center gap-1">
                              <Clock size={11} /> {isBlog ? item.readTime : item.timeString}
                            </span>
                            <span className="t-caption flex items-center gap-1">
                              <MapPin size={11} /> {dateStr}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="t-caption font-semibold flex items-center gap-0.5" style={{ color: 'var(--blue)' }}>
                            {lang === 'mn' ? 'Үзэх' : 'View'} <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="t-headline">Хоосон байна</p>
            </div>
          )}
        </div>

        {/* FOOTER CTA */}
        <div className="pt-4 flex justify-center">
          <Link href={activeTab === 'events' ? '/events' : '/news'} className="btn btn-ghost btn-full">
            {activeTab === 'events'
              ? (lang === 'mn' ? 'Бүх арга хэмжээг харах' : 'View All Events')
              : (lang === 'mn' ? 'Бүх нийтлэлийг унших' : 'View All Posts')
            }
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}