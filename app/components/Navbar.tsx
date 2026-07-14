"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname } from "@/navigation";
import BrandLogo from "./BrandLogo";
import {
  Home,
  BookOpen,
  ShoppingBag,
  Ticket,
  Plane,
  ChevronDown,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";
import { useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Motion as motion } from "./MotionProxy";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { useIsMobile } from "./MotionProxy";
import LanguageToggle from "./LanguageToggle";
import AuthActions from "./AuthActions";

// --- COLOR PALETTE CONFIGURATION ---
const BRAND = {
  RED: "#C41E3A",
  GREEN: "#1AABB8",
  WHITE: "#FFFFFF",
};

export default function Navbar() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();



  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldBeScrolled = latest > 50;
    if (shouldBeScrolled !== isScrolled) {
      setIsScrolled(shouldBeScrolled);
    }
  });



  const desktopNav = [
    { name: t("home"), href: "/" },
    { name: t("about"), href: "/about" },
    { name: t("program"), href: "/programs", hasDropdown: true },
    { name: t("events"), href: "/events" },
    { name: t("lessons"), href: "/lessons" },
    { name: t("shop"), href: "/shop" },
  ];



  const VCM_PROGRAMS = [
    { code: "AND", name: t("prog_and"), desc: t("prog_and_desc"), href: "/programs/and", flag: "🤝" },
    { code: "EDU", name: t("prog_edu"), desc: t("prog_edu_desc"), href: "/programs/edu", flag: "📚" },
    { code: "VCLUB", name: t("prog_vclub"), desc: t("prog_vclub_desc"), href: "/programs/vclub", flag: "🌍" },
  ];
  const language = locale === "mn" ? "mn" : locale === "en" ? "en" : "de";
  return (
    <>
      <motion.header
        className="fixed top-5 left-0 right-0 hidden lg:flex justify-center pointer-events-none z-[999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <nav
          onMouseLeave={() => setHoveredNav(null)}
          style={{ WebkitBackdropFilter: "blur(12px)" }}
          className={`
          z-[100] transform-gpu pointer-events-auto flex items-center justify-between transition-[background-color,border-color,shadow,padding] duration-700 relative
          w-[98%] xl:w-[1250px] py-3 px-6 rounded-full border backdrop-blur-xl text-slate-800 drop-shadow-sm
          ${isScrolled
              ? "bg-white/95 border-[#C41E3A]/20 shadow-[0_20px_40px_-15px_rgba(196,30,58,0.2)]"
              : "bg-white/60 border-white/50 shadow-xl"}
        `}>
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <BrandLogo size={40} priority className="transition-transform duration-500 group-hover:scale-105" />
            <span className="font-sans font-black text-lg tracking-tight uppercase" style={{ color: BRAND.RED }}>
              {t("logo")}
            </span>
          </Link>

          <div className="flex items-center gap-1 bg-current/5 p-1 rounded-full mx-2 relative">
            {desktopNav.map((item) => {
              const isActive = pathname === item.href || (item.hasDropdown && pathname.startsWith(item.href));

              return (
                <div key={item.href} className="relative" onMouseEnter={() => item.hasDropdown && setHoveredNav(item.href)}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                      ${isActive
                        ? "bg-[#C41E3A] text-white shadow-lg shadow-[#C41E3A]/30"
                        : "text-slate-800 opacity-80 hover:opacity-100 hover:text-[#C41E3A] hover:bg-rose-50 shadow-none"}`
                    }
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown size={10} className="mt-0.5" />}
                  </Link>

                  <AnimatePresence>
                    {item.hasDropdown && hoveredNav === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ WebkitBackdropFilter: "blur(16px)" }}
                        className="absolute top-full left-1/2 mt-4 w-[340px] p-3 rounded-3xl border shadow-2xl z-[100] backdrop-blur-2xl bg-white/95 border-sky-100 text-slate-800 origin-top"
                      >
                        <div className="flex flex-col gap-1">
                          {VCM_PROGRAMS.map((program) => (
                            <Link
                              key={program.code}
                              href={program.href}
                              className="group flex items-start gap-4 p-3 rounded-2xl transition-all border duration-300 shadow-sm border-transparent hover:bg-sky-50 hover:border-sky-100"
                            >
                              <span className="text-3xl shadow-sm rounded-md overflow-hidden">{program.flag}</span>
                              <div>
                                <div className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-2 transition-colors group-hover:text-[var(--hover-color)]"
                                  style={{ '--hover-color': BRAND.GREEN } as React.CSSProperties}
                                >
                                  {program.name}
                                  <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">→</span>
                                </div>
                                <p className="text-[10px] leading-relaxed opacity-60 font-medium">{program.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle />
            <div className="h-5 w-[1px] bg-current/10 mx-1" />
            <AuthActions BRAND={BRAND} isMobile={false} />
          </div>
        </nav>
      </motion.header>
    </>
  );
}
