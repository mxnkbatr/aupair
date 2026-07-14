"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Heart, Globe, Users, Sparkles, Mail, Phone, MapPin, Star } from "lucide-react";
import { Link } from "@/navigation";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import PremiumSectionHeader from "@/app/components/PremiumSectionHeader";

const STATS = [
  { value: "50+", label: { mn: "Үндэсний төсөл", en: "National projects" } },
  { value: "2007", label: { mn: "Үүсгэн байгуулагдсан", en: "Founded" } },
  { value: "10K+", label: { mn: "Сайн дурынхан", en: "Volunteers" } },
  { value: "3", label: { mn: "Хөтөлбөр", en: "Programs" } },
];

const VALUES = [
  {
    icon: Heart, color: "var(--red)", bg: "var(--red-dim)",
    title: { mn: "Сайн дурын сэтгэл", en: "Volunteer Spirit" },
    desc: { mn: "Бидний үйл ажиллагааны цөм нь сайн дурынхны хүсэл тэмүүлэл юм.", en: "The passion of volunteers is at the core of our operations." },
  },
  {
    icon: Globe, color: "var(--blue)", bg: "var(--blue-dim)",
    title: { mn: "Дэлхийн нөлөө", en: "Global Impact" },
    desc: { mn: "Орон нутгийн үйлсээрээ дамжуулан дэлхийн өөрчлөлтийг бий болгохыг зорьдог.", en: "Creating global change through impactful local action." },
  },
  {
    icon: Users, color: "var(--emerald)", bg: "var(--emerald-dim)",
    title: { mn: "Олон нийтийн хөгжил", en: "Community Building" },
    desc: { mn: "Хамтдаа илүү хүчирхэг, ээлтэй нийгмийг цогцлоон бэхжүүлдэг.", en: "Strengthening bonds to build more resilient communities." },
  },
  {
    icon: Sparkles, color: "var(--orange)", bg: "var(--orange-dim)",
    title: { mn: "Дур хүсэл ба халамж", en: "Passion & Care" },
    desc: { mn: "Хийж буй бүх зүйлдээ чин сэтгэлийн хандлага, халамжийг шингээдэг.", en: "Infusing genuine passion into everything we undertake." },
  },
];

const PROGRAMS = [
  { emoji: "📚", name: "APM EDU", desc: { mn: "Боловсролын хөтөлбөр", en: "Education Program" }, href: "/programs/edu", color: "var(--blue)" },
  { emoji: "🤝", name: "AND Program", desc: { mn: "Хамтын ажиллагааны хөтөлбөр", en: "Collaboration Program" }, href: "/programs/and", color: "var(--emerald)" },
  { emoji: "🏆", name: "V-CLUB", desc: { mn: "Клубын хөтөлбөр", en: "Club Program" }, href: "/programs/vclub", color: "var(--orange)" },
];

const HIGHLIGHTS = [
  { mn: "Нийгмийн ажлын багш, зөвлөх мэргэжилтэн", en: "Certified Social Work Teacher and Consultant" },
  { mn: "50 гаруй үндэсний хэмжээний төсөл удирдсан", en: "Led over 50 national-level projects" },
  { mn: "Олон нийтийн оролцоо ба залуучуудын хөгжлийн мэргэжилтэн", en: "Specialist in community engagement and youth development" },
];

export default function AboutClient() {
  const locale = useLocale() as "mn" | "en";
  const t = (f: { mn: string; en: string }) => f[locale] || f.mn;

  return (
    <PremiumPageShell>
      <div className="space-y-8 pb-8 pt-2">

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <PremiumSectionHeader
            title={locale === "mn" ? "Бидний тухай" : "About Us"}
            subtitle={locale === "mn" ? "2007 оноос хойш хүмүүнлэг нийгмийг байгуулж байна" : "Building a humane society since 2007"}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="grid grid-cols-2 gap-3"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + i * 0.04 }}
              className="card p-4 text-center"
            >
              <p className="text-[28px] font-black" style={{ color: "var(--blue)" }}>{s.value}</p>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--label3)" }}>{t(s.label)}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
          <div className="relative h-44 w-full">
            <Image
              src="https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390121/tsevlee_mnzwhq.jpg"
              alt="APM Mission"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ background: "var(--blue)", color: "white" }}
              >
                {locale === "mn" ? "Эрхэм зорилго" : "Our Mission"}
              </span>
            </div>
          </div>
          <div className="p-5">
            <p className="text-[14px] leading-relaxed font-medium" style={{ color: "var(--label2)" }}>
              {locale === "mn"
                ? "Монголын Au Pair төв нь бүтээлч оролцоо бүхий хүмүүнлэг, иргэний ардчилсан нийгмийг бүтээхэд хувь нэмрээ оруулах эрхэм зорилготойгоор 2007 оноос хойш 50 гаруй үндэсний төсөл, хөтөлбөрийг амжилттай хэрэгжүүлж байна."
                : "Since 2007, APM has pursued the goal of building a humane, democratic society through creative volunteerism, implementing over 50 national projects in education, child protection, and sustainable livelihoods."}
            </p>
          </div>
        </motion.div>

        {/* Founder */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: "var(--blue-dim)" }}>
              <Image
                src="https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390121/tsevlee_mnzwhq.jpg"
                alt="Founder"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="t-title2">{locale === "mn" ? "Б. Цэвэлмаа" : "B. Tsevelmaa"}</h3>
              <p className="text-[12px] font-medium" style={{ color: "var(--blue)" }}>
                {locale === "mn" ? "Үүсгэн байгуулагч" : "Founder & Consultant"}
              </p>
            </div>
          </div>

          <p className="text-[13px] leading-relaxed" style={{ color: "var(--label2)" }}>
            {locale === "mn"
              ? "Сайн дурын үйлсээр дамжуулан эерэг өөрчлөлтийг бүтээх хүсэл тэмүүлэл минь Монголын Au Pair төвийг үүсгэн байгуулахад хүргэсэн юм. Таныг энэхүү үнэ цэнтэй аялалд нэгдэхийг урьж байна."
              : "My passion for creating positive change through volunteerism led me to establish APM. I invite you to join us on this invaluable journey."}
          </p>

          <div className="pt-2 border-t space-y-2" style={{ borderColor: "var(--sep)" }}>
            {HIGHLIGHTS.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: "var(--blue-dim)" }}
                >
                  <Star size={10} style={{ color: "var(--blue)" }} />
                </div>
                <p className="text-[12px] font-medium" style={{ color: "var(--label2)" }}>{t(h)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <div className="space-y-3">
          <p className="sec-label">{locale === "mn" ? "Үнэт зүйлс" : "Core Values"}</p>
          <div className="space-y-3">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card p-4 flex items-start gap-4"
              >
                <div className="icon-box flex-shrink-0" style={{ background: v.bg, color: v.color }}>
                  <v.icon size={20} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold mb-0.5" style={{ color: "var(--label)" }}>{t(v.title)}</h4>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--label2)" }}>{t(v.desc)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Programs */}
        <div className="space-y-3">
          <p className="sec-label">{locale === "mn" ? "Хөтөлбөрүүд" : "Programs"}</p>
          <div className="space-y-2">
            {PROGRAMS.map((p, i) => (
              <Link key={i} href={p.href} className="card p-4 flex items-center gap-4 press block">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${p.color}18` }}
                >
                  {p.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold" style={{ color: "var(--label)" }}>{p.name}</p>
                  <p className="text-[12px]" style={{ color: "var(--label3)" }}>{t(p.desc)}</p>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <p className="sec-label">{locale === "mn" ? "Холбоо барих" : "Contact"}</p>
          <div className="card p-2">
            {[
              { icon: <Mail size={15} />, text: "info@aupairmongolia.mn", color: "var(--blue)", bg: "var(--blue-dim)" },
              { icon: <Phone size={15} />, text: "+976 99-XX-XXXX", color: "var(--emerald)", bg: "var(--emerald-dim)" },
              { icon: <MapPin size={15} />, text: locale === "mn" ? "Улаанбаатар, Монгол" : "Ulaanbaatar, Mongolia", color: "var(--orange)", bg: "var(--orange-dim)" },
            ].map((c, i, arr) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="icon-box-sm" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--label)" }}>{c.text}</p>
                </div>
                {i < arr.length - 1 && <div className="h-px mx-3" style={{ background: "var(--sep)" }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1 pt-4">
          <p className="text-[13px] font-bold" style={{ color: "var(--label)" }}>Au Pair Mongolia</p>
          <p className="text-[11px]" style={{ color: "var(--label4)" }}>© 2007–{new Date().getFullYear()} · APM</p>
        </div>

      </div>
    </PremiumPageShell>
  );
}
