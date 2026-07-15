"use client";

import { ProgramPageClient } from "@/app/components/ProgramPageClient";
import { GraduationCap, BookOpen, Users, CalendarDays, Star } from "lucide-react";

const EDU_CONFIG = {
  id: "EDU",
  emoji: "🎓",
  gradientFrom: "#2BC4D0",
  gradientTo: "#128A95",
  accentBg: "bg-cyan-50",
  accentText: "text-cyan-700",
  btnBg: "bg-teal-500 hover:bg-teal-600",
  shadowColor: "shadow-teal-500/20",
  name: "EDU Бэлтгэл",
  shortDesc: "Гэр бүл · au pair бэлтгэлийн хөтөлбөр",
  duration: "3–12 сар",
  type: "Бэлтгэл",
  location: "Монгол улс",
  openSlots: 8,
  tags: [
    { label: "Бэлтгэл", bg: "bg-cyan-50 text-cyan-700" },
    { label: "Хэл", bg: "bg-teal-50 text-teal-700" },
    { label: "Гэр бүл", bg: "bg-rose-50 text-rose-700" },
  ],
  features: [
    {
      icon: GraduationCap,
      title: "Сургуулиудад зааварлагч болох",
      desc: "Дунд болон ахлах сургуулиудад хичээл заах, сурагчидтай биечлэн ажиллах.",
    },
    {
      icon: BookOpen,
      title: "Хэл, урлаг, технологи заах",
      desc: "Өөрийн мэргэжил, ур чадвараа сурагчидтай хуваалцах бүтэн боломж.",
    },
    {
      icon: Users,
      title: "Нийгмийн нөлөө",
      desc: "Боловсролын байгууллагуудтай хамтран ажиллаж, нийгэмд бодит өөрчлөлт гаргах.",
    },
    {
      icon: CalendarDays,
      title: "Уян хатан цагийн хуваарь",
      desc: "Таны амьдралын хэв маягт тохирсон цагийн хуваарь тогтоох боломжтой.",
    },
    {
      icon: Star,
      title: "APM-ийн бүрэн дэмжлэг",
      desc: "Сургалт, ментор, визний туслалцаа, орон сууц хайхад дэмжлэг.",
    },
  ],
  requirements: [
    "Дунд сургуулийн дипломтой байх (18+)",
    "Англи хэлний B1 ба дээш түвшин",
    "Хүүхэдтэй ажиллах идэвх, сонирхол",
    "3 сараас дээш оролцох боломж",
    "Нийгмийн хариуцлагатай байдал",
  ],
  whyJoin:
    "Гэр бүл, au pair аялалд бэлдэж, хэл·соёлын ур чадвараа дээшлүүлэх. APM-ийн бэлтгэл нь нийцүүлэлтээс өмнөх чухал алхам юм.",
  heroSub:
    "Гэр бүл, au pair-уудад зориулсан хэл, соёл, өдөр тутмын ур чадварын бэлтгэл — аяллаа итгэлтэйгээр эхлүүлээрэй.",
  steps: [
    { num: "1", title: "Өргөдөл гаргах", desc: "Энэ хуудсаас анкетаа бөглөж илгээнэ үү." },
    { num: "2", title: "Ярилцлага", desc: "APM-ийн баг 24 цагийн дотор холбогдоно." },
    { num: "3", title: "Сургалт", desc: "3 хоногийн бэлтгэл сургалтад хамрагдана." },
    { num: "4", title: "Хөтөлбөр эхлэх", desc: "Хуваарилагдсан сургуульдаа ажлаа эхэлнэ." },
  ],
};

export default function EduClient() {
  return <ProgramPageClient config={EDU_CONFIG} />;
}
