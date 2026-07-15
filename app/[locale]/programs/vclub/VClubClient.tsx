"use client";

import { ProgramPageClient } from "@/app/components/ProgramPageClient";
import { Zap, Users, Star, Globe, Sparkles } from "lucide-react";

const VCLUB_CONFIG = {
  id: "VCLUB",
  emoji: "🌍",
  gradientFrom: "#f59e0b",
  gradientTo: "#f97316",
  accentBg: "bg-amber-50",
  accentText: "text-amber-600",
  btnBg: "bg-amber-500 hover:bg-amber-600",
  shadowColor: "shadow-amber-500/20",
  name: "V-Club",
  shortDesc: "Соёлын солилцооны нийгэмлэг",
  duration: "Арга хэмжээгээр",
  type: "Солилцоо / Сүлжээ",
  location: "Монгол улс",
  openSlots: 20,
  tags: [
    { label: "Арга хэмжээ", bg: "bg-amber-50 text-amber-700" },
    { label: "Сүлжээ", bg: "bg-orange-50 text-orange-700" },
    { label: "Манлайлал", bg: "bg-yellow-50 text-yellow-700" },
  ],
  features: [
    {
      icon: Zap,
      title: "Олон нийтийн арга хэмжээнд оролцох",
      desc: "APM-ийн зохион байгуулдаг соёлын уулзалт, арга хэмжээнд идэвхтэй оролцоно.",
    },
    {
      icon: Users,
      title: "Олон улсын солилцооны сүлжээ",
      desc: "20+ улсын гэр бүл, au pair-тай холбогдож, туршлага хуваалцах боломж.",
    },
    {
      icon: Star,
      title: "Манлайлал ба ур чадвар",
      desc: "Арга хэмжээ зохион байгуулах, команд удирдах ур чадвар хөгжүүлнэ.",
    },
    {
      icon: Globe,
      title: "Дэлхийн холбоо тогтоох",
      desc: "Олон улсын au pair, гэр бүлтэй байнгын харилцаа холбоо тогтоох.",
    },
    {
      icon: Sparkles,
      title: "Нийгмийн санаачилга",
      desc: "Монголын нийгмийн тулгамдсан асуудлыг шийдвэрлэх томоохон санаачилгуудад нэгдэх.",
    },
  ],
  requirements: [
    "16 нас хүрсэн байх",
    "Нийгмийн идэвхтэй, арга хэмжээнд дуртай",
    "Сард дор хаяж 1–2 арга хэмжээнд оролцох",
    "Хамтын ажиллагааны сэтгэлгээ",
    "Монгол болон/эсвэл Англи хэлний мэдлэг",
  ],
  whyJoin:
    "V-Club бол зүгээр нэг клуб биш — энэ бол соёлын солилцоо, дэлхийн холбоо, au pair олон нийтийн төв юм.",
  heroSub:
    "Гэр бүл, au pair-тай холбогдож, туршлагаа хуваалцан, соёлын солилцооны арга хэмжээнд нэгдээрэй.",
  steps: [
    { num: "1", title: "Өргөдөл гаргах", desc: "Энэ хуудсаас анкетаа бөглөж илгээнэ үү." },
    { num: "2", title: "Гишүүнчлэл баталгаажих", desc: "APM-ийн баг 24 цагт холбогдоно." },
    { num: "3", title: "Эхний арга хэмжээнд оролцох", desc: "Ойрын арга хэмжээний мэдээлэл хүлээн авна." },
    { num: "4", title: "Идэвхтэй гишүүн болох", desc: "V-Club-ийн бүрэн гишүүнчлэлийн эрх нээгдэнэ." },
  ],
};

export default function VClubClient() {
  return <ProgramPageClient config={VCLUB_CONFIG} />;
}
