"use client";

import { ProgramPageClient } from "@/app/components/ProgramPageClient";
import { GraduationCap, BookOpen, Users, CalendarDays, Star } from "lucide-react";

const EDU_CONFIG = {
  id: "EDU",
  emoji: "🎓",
  gradientFrom: "#0ea5e9",
  gradientTo: "#3b82f6",
  accentBg: "bg-sky-50",
  accentText: "text-sky-600",
  btnBg: "bg-sky-500 hover:bg-sky-600",
  shadowColor: "shadow-sky-500/20",
  name: "EDU-Сайн дурын ажилтан",
  shortDesc: "Мэдлэгээ хуваалцаж, шинэ үеэ урамшуулах",
  duration: "3–12 сар",
  type: "Боловсрол",
  location: "Монгол улс",
  openSlots: 8,
  tags: [
    { label: "Сургалт", bg: "bg-sky-50 text-sky-700" },
    { label: "Хэл заалт", bg: "bg-blue-50 text-blue-700" },
    { label: "Залуучууд", bg: "bg-indigo-50 text-indigo-700" },
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
    "Монголын сургуулиудад өөрийн мэдлэгийг дамжуулж, нийгмийн хөгжилд биечлэн хувь нэмэр оруулах ховор боломж. Сурагчдын ирээдүйг гэрэлтүүлэх аялал эндээс эхэлнэ.",
  heroSub:
    "Сургууль, сургалтын төвүүдэд өөрийн мэдлэг, чадвараа хуваалцаж, залуу оюун ухааныг чадавхжуулан гэрэлт ирээдүйг хамтдаа бүтээцгээе.",
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
