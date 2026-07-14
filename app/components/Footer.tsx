"use client";

import React, { useState } from "react";
import { Link } from "@/navigation";
import {
  ArrowUp,
  Mail,
  MapPin,
  Send,
  Phone,
  LucideIcon
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import BrandLogo from "@/app/components/BrandLogo";
import { BRAND as BRAND_META } from "@/lib/branding";

// --- CONTENT ---
const footerData = {
  mn: {
    slogan: "Монголын хамгийн том au pair зуучлалын төв.",
    exploreTitle: "Нүүр",
    exploreLinks: [
      { text: "Бидний тухай", href: "/about" },
      { text: "Хөтөлбөрүүд", href: "/programs" },
      { text: "Арга хэмжээ", href: "/events" },
      { text: "Мэдээ", href: "/news" },
    ],
    supportTitle: "Дэмжлэг",
    supportLinks: [
      { text: "Холбоо барих", href: "/contact" },
      { text: "Тусламж", href: "/help" },
      { text: "Нууцлалын бодлого", href: "/privacy" },
    ],
    contactTitle: "Холбоо барих",
    address: "Улаанбаатар, Монгол",
    email: "info@aupairmongolia.mn",
    phone: "+976 7000 0000",
    newsletterTitle: "Мэдээлэл авах",
    newsletterPlaceholder: "Таны имэйл хаяг",
    subscribeButton: "Бүртгүүлэх",
    copyright: `© ${new Date().getFullYear()} Au Pair Mongolia. Бүх эрх хуулиар хамгаалагдсан.`,
  },
  en: {
    slogan: "Mongolia's largest au pair agency.",
    exploreTitle: "Explore",
    exploreLinks: [
      { text: "About Us", href: "/about" },
      { text: "Programs", href: "/programs" },
      { text: "Events", href: "/events" },
      { text: "News", href: "/news" },
    ],
    supportTitle: "Support",
    supportLinks: [
      { text: "Contact Us", href: "/contact" },
      { text: "Help Center", href: "/help" },
      { text: "Privacy Policy", href: "/privacy" },
    ],
    contactTitle: "Get in Touch",
    address: "Ulaanbaatar, Mongolia",
    email: "info@aupairmongolia.mn",
    phone: "+976 7000 0000",
    newsletterTitle: "Stay Connected",
    newsletterPlaceholder: "Your email address",
    subscribeButton: "Subscribe",
    copyright: `© ${new Date().getFullYear()} Au Pair Mongolia. All rights reserved.`,
  },
};

const BRAND = {
  PRIMARY: "#C41E3A",
  ACCENT: "#1AABB8",
};

export default function AestheticFooter() {
  const locale = useLocale() as "en" | "mn";
  const d = footerData[locale] || footerData.en;

  return (
    <footer className="relative w-full pt-12 sm:pt-16 pb-24 sm:pb-8 font-sans transition-all duration-700 overflow-hidden bg-white">

      {/* ─── Brand color wash ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-gradient-to-t from-rose-100 via-red-50 to-transparent rounded-full blur-[100px] opacity-60" />
        <div className="absolute top-[0%] -right-[10%] w-[900px] h-[900px] bg-gradient-to-b from-cyan-100 via-teal-50 to-transparent rounded-full blur-[100px] opacity-50" />
        <div className={`absolute inset-0 opacity-[0.3] bg-[url('/noise.svg')] mix-blend-overlay`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* ─── 1. NEWSLETTER CARD ─── */}
        <div className="relative mb-12 sm:mb-24">
          <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-rose-200/40 bg-white border border-slate-50">

            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#C41E3A] via-[#1AABB8] to-[#F18F01]" />
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-cyan-50/40 opacity-50" />

            <div className="relative p-5 sm:p-8 md:p-12 lg:px-16 grid lg:grid-cols-2 gap-6 sm:gap-10 items-center">

              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-[#C41E3A] text-xs font-bold uppercase tracking-widest ring-1 ring-rose-100">
                  {d.newsletterTitle}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight text-slate-900">
                  {locale === 'mn' ? 'Хамтдаа' : "Don't Miss"} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C41E3A] to-[#1AABB8]">
                    {locale === 'mn' ? 'Холбогдоё' : 'Your Chance'}
                  </span>
                </h2>
              </div>

              <div className="relative w-full">
                <div className="flex items-center p-2 rounded-2xl shadow-sm border focus-within:ring-4 focus-within:ring-rose-100 transition-all bg-white border-slate-100 group">
                  <Mail className="ml-4 text-slate-400 shrink-0" size={20} />
                  <input
                    type="email"
                    placeholder={d.newsletterPlaceholder}
                    className="w-full bg-transparent px-4 py-3 text-sm font-semibold outline-none text-slate-800 placeholder:text-slate-400"
                  />
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C41E3A] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#9E1530] hover:scale-105 transition-all shadow-lg shadow-rose-500/30 shrink-0">
                    {d.subscribeButton} <Send size={14} className="-rotate-12 group-hover:rotate-0 transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── 2. FOOTER COLUMNS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start mb-16">

          <div className="md:col-span-12 lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <BrandLogo size={48} />
              <div className="flex flex-col">
                <span className="text-2xl font-black uppercase leading-none tracking-tight text-slate-900">
                  Au Pair
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-[#C41E3A] to-[#1AABB8]">
                  Mongolia
                </span>
              </div>
            </Link>
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm">
              {d.slogan}
            </p>
          </div>

          <div className="md:col-span-12 lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <SectionHeader color={BRAND.PRIMARY} label={d.exploreTitle} />
              <ul className="space-y-3">
                {d.exploreLinks.map((l, i) => (
                  <SimpleLink key={i} href={l.href} text={l.text} color={BRAND.PRIMARY} />
                ))}
              </ul>
            </div>
            <div>
              <SectionHeader color={BRAND.ACCENT} label={d.supportTitle} />
              <ul className="space-y-3">
                {d.supportLinks.map((l, i) => (
                  <SimpleLink key={i} href={l.href} text={l.text} color={BRAND.ACCENT} />
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-3">
            <SectionHeader color={BRAND.PRIMARY} label={d.contactTitle} />
            <div className="space-y-3 mt-4">
              <ContactItem
                icon={Phone}
                title={locale === 'mn' ? "Утас" : "Phone"}
                value={d.phone}
                bgColor="bg-rose-50"
                textColor="text-[#C41E3A]"
              />
              <ContactItem
                icon={Mail}
                title={locale === 'mn' ? "Имэйл" : "Email"}
                value={d.email}
                bgColor="bg-cyan-50"
                textColor="text-[#1AABB8]"
              />
              <ContactItem
                icon={MapPin}
                title={locale === 'mn' ? "Хаяг" : "Location"}
                value={d.address}
                bgColor="bg-slate-50"
                textColor="text-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 text-slate-500 text-center sm:text-left">
            {d.copyright}
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="p-3 rounded-full transition-colors hover:shadow-lg group bg-white text-slate-800 hover:bg-slate-50 border border-slate-100">
            <ArrowUp size={16} className="group-hover:text-[#C41E3A] transition-colors" />
          </button>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full text-center pointer-events-none select-none opacity-[0.03] hidden sm:block">
          <span className="text-[8rem] md:text-[12rem] font-black uppercase leading-none whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-b from-[#C41E3A] to-transparent">{BRAND_META.shortName}</span>
        </div>

      </div>
    </footer>
  );
}

// ─── HELPER COMPONENTS ───

const SectionHeader = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span
      className="w-2 h-2 rounded-full ring-2 ring-offset-1"
      style={{
        backgroundColor: color,
        // FIX: Use the Tailwind CSS variable for ring color
        "--tw-ring-color": color
      } as React.CSSProperties}
    />
    <h3 className="text-xs font-black uppercase tracking-[0.15em]" style={{ color }}>{label}</h3>
  </div>
);

const SimpleLink = ({ href, text, color }: { href: string, text: string, color: string }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <li>
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="text-sm font-bold transition-all duration-300 hover:translate-x-1 inline-block text-slate-500"
        // Valid standard CSS property 'color' works fine here
        style={{ color: hovered ? color : undefined }}
      >
        {text}
      </Link>
    </li>
  );
}

const ContactItem = ({ icon: Icon, title, value, bgColor, textColor }: { icon: LucideIcon, title: string, value: string, bgColor: string, textColor: string }) => (
  <div className="group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer bg-white border border-slate-100 hover:border-slate-200">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bgColor} ${textColor}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase opacity-70 mb-0.5">{title}</p>
      <p className={`text-sm font-bold truncate transition-colors duration-300 group-hover:${textColor} text-slate-800`}>
        {value}
      </p>
    </div>
  </div>
);