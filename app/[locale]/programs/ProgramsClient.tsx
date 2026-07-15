"use client";
import React, { useState, useEffect } from "react";
import { Link } from "@/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Clock, Globe, CheckCircle2, ArrowRight,
  Star, Users, BookOpen, Heart, Zap, GraduationCap,
  CalendarDays, MapPin, Sparkles, ChevronLeft, ChevronRight
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";

import PremiumPageShell from "@/app/components/PremiumPageShell";
import PremiumSectionHeader from "@/app/components/PremiumSectionHeader";
import { programColorsByCode, PROGRAM_COLORS } from "@/lib/color-system";

const FALLBACK_PROGRAMS = [
  {
    id: "EDU", emoji: "🎓",
    color: PROGRAM_COLORS.edu.main,
    gradFrom: PROGRAM_COLORS.edu.gradFrom,
    gradTo: PROGRAM_COLORS.edu.gradTo,
    iconBg: PROGRAM_COLORS.edu.soft,
    iconColor: PROGRAM_COLORS.edu.main,
    nameKey: "prog_edu", descKey: "prog_edu_desc",
    href: "/programs/edu", duration: "3–12 сар",
    location: "Монгол улс", slots: 8,
    tags: ["Бэлтгэл", "Гэр бүл", "Хэл"],
    features: [
      { I: GraduationCap, t: "Гэр бүлд зориулсан бэлтгэл сургалт" },
      { I: BookOpen,       t: "Хэл, соёл, өдөр тутмын ур чадвар" },
      { I: Users,          t: "Au pair / гэр бүлийн чиглэл" },
      { I: CalendarDays,   t: "Уян хатан цагийн хуваарь" },
      { I: Star,           t: "APM-ийн бүрэн дэмжлэг, ментор" },
    ],
    why: "Гэр бүл, au pair аялалд бэлдэж, соёлын солилцоонд итгэлтэйгээр орох боломж.",
  },
  {
    id: "AND", emoji: "🤝",
    color: PROGRAM_COLORS.and.main,
    gradFrom: PROGRAM_COLORS.and.gradFrom,
    gradTo: PROGRAM_COLORS.and.gradTo,
    iconBg: PROGRAM_COLORS.and.soft,
    iconColor: PROGRAM_COLORS.and.main,
    nameKey: "prog_and", descKey: "prog_and_desc",
    href: "/programs/and", duration: "Уян хатан",
    location: "Улаанбаатар", slots: 12,
    tags: ["Гэр бүл", "Хүүхэд", "Халамж"],
    features: [
      { I: Heart,       t: "Гэр бүл, хүүхдэд асрамжийн дэмжлэг" },
      { I: Users,       t: "Гэр бүлтэй хамтран ажиллах" },
      { I: CalendarDays,t: "7 хоногт 2–3 удаа уулзах" },
      { I: MapPin,      t: "UB дахь хамтрагч гэр бүлүүд" },
      { I: Star,        t: "Урьдчилсан сургалт ба удирдамж" },
    ],
    why: "Гэр бүлд тусалж, хүүхдэд халамжтай орчин бүрдүүлэх — au pair хэв маягийн суурь.",
  },
  {
    id: "VCLUB", emoji: "🌍",
    color: PROGRAM_COLORS.vclub.main,
    gradFrom: PROGRAM_COLORS.vclub.gradFrom,
    gradTo: PROGRAM_COLORS.vclub.gradTo,
    iconBg: PROGRAM_COLORS.vclub.soft,
    iconColor: PROGRAM_COLORS.vclub.main,
    nameKey: "prog_vclub", descKey: "prog_vclub_desc",
    href: "/programs/vclub", duration: "Арга хэмжээгээр",
    location: "Монгол улс", slots: 20,
    tags: ["Солилцоо", "Сүлжээ", "Уулзалт"],
    features: [
      { I: Zap,      t: "Соёлын уулзалт, арга хэмжээнд оролцох" },
      { I: Users,    t: "Гэр бүл · au pair нийгэмлэгт нэгдэх" },
      { I: Star,     t: "Манлайлал, ур чадвар хөгжүүлэх" },
      { I: Globe,    t: "Олон улсын солилцооны холбоо" },
      { I: Sparkles, t: "Нийгмийн томоохон санаачилгуудад нэгдэх" },
    ],
    why: "V-Club бол соёлын солилцоо, найз нөхөд, дэлхийн холбоо тогтоох — au pair олон нийтийн төв.",
  },
];

function mapApiToProg(p: any): Prog {
  const icons = [GraduationCap, BookOpen, Users, Star, Globe];
  const colors = programColorsByCode(p.code || p.slug);
  return {
    id: p.code,
    emoji: p.emoji || "🌍",
    color: p.color || colors.main,
    gradFrom: p.gradFrom || colors.gradFrom,
    gradTo: p.gradTo || colors.gradTo,
    iconBg: colors.soft,
    iconColor: p.color || colors.main,
    nameKey: p.name?.mn || p.code,
    descKey: p.description?.mn || "",
    href: p.href || `/programs/${p.slug}`,
    duration: p.duration || "",
    location: p.location || "",
    slots: p.slots || 0,
    tags: p.tags || [],
    features: (p.features || []).map((f: any, i: number) => ({
      I: icons[i % icons.length],
      t: f.mn || f.en || "",
    })),
    why: p.why?.mn || p.why?.en || "",
  };
}

type Prog = typeof FALLBACK_PROGRAMS[0];

function programTitle(p: Prog, nt: (k: string) => string) {
  return p.nameKey.startsWith("prog_") ? nt(p.nameKey) : p.nameKey;
}
function programDesc(p: Prog, nt: (k: string) => string) {
  return p.descKey.startsWith("prog_") ? nt(p.descKey) : p.descKey;
}

/* ── Card ── */
function ProgCard({ p, onTap, nt }: { p: Prog; onTap: () => void; nt: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      onClick={onTap}
      tabIndex={0}
      className="relative overflow-hidden press p-5"
      style={{ 
        background: "var(--card)", 
        borderRadius: "32px",
        boxShadow: `0 20px 40px -12px ${p.color}35`,
        border: "0.5px solid var(--sep)"
      }}
    >
      {/* Subtle gradient background glow */}
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: p.color }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header: Icon & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-14 h-14 rounded-[18px] flex items-center justify-center text-3xl shadow-sm"
            style={{ background: `linear-gradient(135deg, ${p.gradFrom}, ${p.gradTo})` }}
          >
            {p.emoji}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="badge text-[10px] uppercase tracking-widest font-black" style={{ background: p.iconBg, color: p.iconColor }}>
              {p.id} Хөтөлбөр
            </span>
            <span className="text-[12px] font-bold" style={{ color: "var(--label3)" }}>
              {p.slots} нэр
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[20px] font-black leading-tight tracking-tight mb-3" style={{ color: "var(--label)" }}>
          {programTitle(p, nt)}
        </h3>

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "var(--label2)" }}>
            <Clock size={14} style={{ color: p.color }} />
            {p.duration}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "var(--label2)" }}>
            <MapPin size={14} style={{ color: p.color }} />
            {p.location}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {p.tags.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold"
              style={{ background: "var(--fill2)", color: "var(--label2)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer / CTA */}
        <div className="mt-auto pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--sep)" }}>
          <span className="text-[13px] font-bold" style={{ color: p.color }}>
            Дэлгэрэнгүй үзэх
          </span>
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
            style={{ background: p.color }}
          >
            <ArrowRight size={14} strokeWidth={3} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Detail ── */
function ProgDetail({ p, onBack, nt, signed }: { p: Prog; onBack: () => void; nt: any; signed: boolean }) {
  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className="space-y-4"
    >
      {/* Back nav */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 pt-2 press"
        style={{ color: "var(--blue)" }}
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
        <span className="t-subhead font-semibold">Хөтөлбөрүүд</span>
      </button>

      {/* Hero */}
      <div
        className="relative overflow-hidden p-5"
        style={{
          borderRadius: "var(--r-2xl)",
          background: `linear-gradient(135deg, ${p.gradFrom}, ${p.gradTo})`,
          minHeight: 160,
        }}
      >
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-15 bg-white pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-10 bg-white pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="inline-block px-2.5 py-1 rounded-lg mb-3" style={{ background: "rgba(0,0,0,0.2)" }}>
              <span className="t-caption2 text-white/80 uppercase">{p.id} хөтөлбөр</span>
            </div>
            <h2 className="text-white font-bold text-[22px] leading-tight mb-3">
              {programTitle(p, nt)}
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Clock, label: p.duration },
                { icon: MapPin, label: p.location },
                { icon: Users, label: `${p.slots} нэр` },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                  style={{ background: "rgba(0,0,0,0.2)" }}
                >
                  <Icon size={11} color="rgba(255,255,255,0.8)" />
                  <span className="text-[11px] font-semibold text-white/85">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <span className="text-6xl flex-shrink-0">{p.emoji}</span>
        </div>
      </div>

      {/* Info sections */}
      <div className="card overflow-hidden">
        {/* About */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-box-sm" style={{ background: p.iconBg, color: p.iconColor }}>
              <Globe size={17} />
            </div>
            <span className="t-headline">Хөтөлбөрийн тухай</span>
          </div>
          <p className="t-body" style={{ color: "var(--label2)" }}>{programDesc(p, nt)}</p>
        </div>

        <div className="divider mx-4" />

        {/* Features */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-box-sm" style={{ background: p.iconBg, color: p.iconColor }}>
              <CheckCircle2 size={17} />
            </div>
            <span className="t-headline">Юу хийх вэ?</span>
          </div>
          <div className="space-y-3">
            {p.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="icon-box-sm flex-shrink-0 mt-0.5" style={{ background: p.iconBg, color: p.iconColor }}>
                  <f.I size={13} />
                </div>
                <span className="t-subhead flex-1" style={{ color: "var(--label2)" }}>{f.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="divider mx-4" />

        {/* Why */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-box-sm" style={{ background: p.iconBg, color: p.iconColor }}>
              <Star size={17} />
            </div>
            <span className="t-headline">Яагаад нэгдэх вэ?</span>
          </div>
          <p className="t-body" style={{ color: "var(--label2)" }}>{p.why}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 px-1">
        {p.tags.map(tag => (
          <span key={tag} className="badge" style={{ background: p.iconBg, color: p.iconColor }}>
            {tag}
          </span>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="grid grid-cols-2 gap-3 pb-6">
        <Link href={p.href} className="btn btn-ghost btn-sm text-center">
          Бүрэн мэдээлэл
        </Link>
        <Link
          href={signed ? `/programs/apply?p=${p.id}` : "/register"}
          prefetch={signed}
          className="btn btn-primary btn-sm text-center"
          style={{ background: p.color }}
        >
          {signed ? "Өргөдөл →" : "Бүртгүүлэх →"}
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Main ── */
export default function ProgramsClient({ initialPrograms }: { initialPrograms?: any[] }) {
  const nt = useTranslations("navbar");
  const { status } = useSession();
  const signed = status === "authenticated";
  const [sel, setSel] = useState<Prog | null>(null);
  const [filter, setFilter] = useState("all");
  const [programs, setPrograms] = useState<Prog[]>(() =>
    initialPrograms?.length ? initialPrograms.map(mapApiToProg) : FALLBACK_PROGRAMS
  );

  useEffect(() => {
    if (initialPrograms?.length) return;
    fetch("/api/programs")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPrograms(data.map(mapApiToProg));
        }
      })
      .catch(() => {});
  }, [initialPrograms]);

  const list = filter === "all" ? programs : programs.filter(p => p.id === filter);

  const FILTERS = [
    { id: "all", label: "Бүгд", color: "var(--label)" },
    ...programs.map((p) => ({ id: p.id, label: `${p.emoji} ${p.id}`, color: p.color })),
  ];

  return (
    <PremiumPageShell>
        <AnimatePresence mode="wait">
          {!sel ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5 pt-2"
            >
              <PremiumSectionHeader
                title="APM Хөтөлбөрүүд"
                subtitle="Гэр бүл · Au pair · Солилцоо"
              />

              {/* Segmented filter */}
              <div className="premium-filter-row">
                {FILTERS.map(f => {
                  const isActive = filter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`premium-filter-pill press ${isActive ? "on" : ""}`}
                      style={
                        isActive
                          ? {
                              background: `linear-gradient(180deg, ${f.color}ee, ${f.color})`,
                              borderColor: "rgba(255,255,255,0.22)",
                              boxShadow: `0 4px 14px ${f.color}44, inset 0 1px 0 rgba(255,255,255,0.25)`,
                              color: "white",
                            }
                          : undefined
                      }
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Cards */}
              <div className="space-y-4 stagger">
                {list.map((p) => (
                  <ProgCard key={p.id} p={p} onTap={() => setSel(p)} nt={nt} />
                ))}
              </div>

              {/* Guest CTA */}
              {!signed && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="premium-cta press">
                    <div className="premium-cta__content">
                      <p className="premium-cta__eyebrow">Гишүүнчлэл</p>
                      <p className="premium-cta__title">Нэгдэхэд бэлэн үү?</p>
                      <p className="premium-cta__sub">Бүртгүүлж хөтөлбөрт өргөдлөө гаргаарай</p>
                    </div>
                    <Link href="/register" className="premium-cta__btn press">
                      Эхлэх
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <ProgDetail key="detail" p={sel} onBack={() => setSel(null)} nt={nt} signed={signed} />
          )}
        </AnimatePresence>
    </PremiumPageShell>
  );
}
