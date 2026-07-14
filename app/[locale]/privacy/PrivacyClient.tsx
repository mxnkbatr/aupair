"use client";

import React from "react";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import PremiumSectionHeader from "@/app/components/PremiumSectionHeader";

type Section = {
  title: { mn: string; en: string };
  body: { mn: string[]; en: string[] };
};

const UPDATED = "2026-07-14";

const SECTIONS: Section[] = [
  {
    title: {
      mn: "1. Танилцуулга",
      en: "1. Introduction",
    },
    body: {
      mn: [
        "Au Pair Mongolia (\"APM\", \"бид\") нь Au Pair Mongolia апп болон холбогдох вэб үйлчилгээгээр дамжуулан цуглуулсан хувийн мэдээллийг хамгаалахыг эрхэмлэдэг.",
        "Энэхүү нууцлалын бодлого нь бид ямар мэдээлэл цуглуулдаг, хэрхэн ашигладаг, хэнтэй хуваалцдаг, мөн таны эрхийг тайлбарлана.",
      ],
      en: [
        "Au Pair Mongolia (\"APM\", \"we\", \"us\") respects your privacy when you use the Au Pair Mongolia app and related web services.",
        "This Privacy Policy explains what information we collect, how we use it, with whom we share it, and the rights you have.",
      ],
    },
  },
  {
    title: {
      mn: "2. Бидний цуглуулдаг мэдээлэл",
      en: "2. Information we collect",
    },
    body: {
      mn: [
        "Бүртгэл ба профайл: нэр, имэйл, утасны дугаар, профилийн зураг болон таны өгсөн бусад профайл мэдээлэл.",
        "Өргөдөл ба хөтөлбөр: сайн дурын хөтөлбөр, эвент, сургалтад бүртгүүлэхэд оруулсан мэдээлэл, баримт бичиг.",
        "Төхөөрөмж ба апп: төхөөрөмжийн төрөл, үйлдлийн систем, аппын хувилбар, push notification token.",
        "Камер / зургийн сан: зөвхөн та зөвшөөрсөн үед профайл эсвэл өргөдлийн зураг сонгох/авах зорилгоор.",
        "Төлбөр (хэрэв ашиглавал): худалдан авалт хийхэд төлбөрийн үйлчилгээний (жишээ нь QPay) шаардлагатай мэдээлэл. Бид картынгын бүрэн мэдээллийг хадгалахгүй.",
        "Холбоо барих: таны илгээсэн мессеж, имэйл, санал хүсэлт.",
      ],
      en: [
        "Account & profile: name, email, phone number, profile photo, and other profile details you provide.",
        "Applications & programs: information and documents submitted for volunteer programs, events, and lessons.",
        "Device & app: device type, OS, app version, and push notification tokens.",
        "Camera / photo library: only when you grant permission, to take or select photos for your profile or applications.",
        "Payments (if used): information needed to process purchases via payment providers (e.g. QPay). We do not store full card numbers.",
        "Communications: messages, emails, and feedback you send to us.",
      ],
    },
  },
  {
    title: {
      mn: "3. Мэдээллийг хэрхэн ашигладаг вэ",
      en: "3. How we use information",
    },
    body: {
      mn: [
        "Бүртгэл үүсгэх, нэвтрүүлэх, профайл удирдах.",
        "Хөтөлбөр, эвент, сургалт, дэлгүүрийн үйлчилгээг үзүүлэх.",
        "Өргөдөл боловсруулах, холбоо барих, дэмжлэг үзүүлэх.",
        "Push мэдэгдэл, чухал шинэчилэл, боломжийн мэдээлэл илгээх (та зөвшөөрсөн үед).",
        "Аюулгүй байдал хангах, буруу ашиглалтаас сэргийлэх, хууль эрх зүйн үүргээ биелүүлэх.",
        "Үйлчилгээг сайжруулах (ерөнхий статистик, алдааны шинжилгээ).",
      ],
      en: [
        "Create and manage your account and profile.",
        "Provide programs, events, lessons, shop, and related services.",
        "Process applications, communicate with you, and provide support.",
        "Send push notifications and important updates when you allow them.",
        "Protect security, prevent abuse, and meet legal obligations.",
        "Improve our services using aggregated analytics where appropriate.",
      ],
    },
  },
  {
    title: {
      mn: "4. Гуравдагч тал / үйлчилгээ үзүүлэгч",
      en: "4. Third parties & providers",
    },
    body: {
      mn: [
        "Бид үйлчилгээгээ ажиллуулахын тулд найдвартай үйлчилгээ үзүүлэгчдийг ашиглаж болно. Тухайлбал:",
        "• Бүртгэл / өгөгдлийн сан: Supabase, MongoDB",
        "• Зураг хадгалалт: Cloudinary",
        "• Push мэдэгдэл: Firebase Cloud Messaging",
        "• Төлбөр: QPay болон бусад төлбөрийн систем",
        "• Нэвтрэлт: Google (хэрэв ашигласан бол)",
        "Эдгээр талууд зөвхөн үйлчилгээ үзүүлэхэд шаардлагатай хэмжээгээр мэдээлэлд хандаж, өөрийн нууцлалын бодлогыг баримтална.",
      ],
      en: [
        "We use trusted service providers to operate the app, including:",
        "• Authentication / databases: Supabase, MongoDB",
        "• Image hosting: Cloudinary",
        "• Push notifications: Firebase Cloud Messaging",
        "• Payments: QPay and similar providers",
        "• Sign-in: Google (when enabled)",
        "These providers may process data only as needed to deliver their services and under their own privacy terms.",
      ],
    },
  },
  {
    title: {
      mn: "5. Зургийн сан ба камер",
      en: "5. Photo library & camera",
    },
    body: {
      mn: [
        "Апп нь профилийн зураг болон өргөдлийн зураг сонгох/авах зорилгоор камер болон зургийн санд хандах API ашиглаж болно.",
        "Зөвшөөрөл өгөхгүй бол эдгээр онцлогийг ашиглах боломжгүй. Та төхөөрөмжийнхөө тохиргооноос зөвшөөрлийг хэзээ ч цуцалж болно.",
      ],
      en: [
        "The app may use camera and photo library APIs so you can take or choose photos for your profile and applications.",
        "If you deny permission, those features will not work. You can change permissions anytime in your device settings.",
      ],
    },
  },
  {
    title: {
      mn: "6. Мэдээлэл хадгалалт ба аюулгүй байдал",
      en: "6. Retention & security",
    },
    body: {
      mn: [
        "Бид мэдээллийг үйлчилгээ үзүүлэх, хууль ёсны зорилгод шаардлагатай хугацаанд хадгална.",
        "Хадгалалтын аюулгүй байдлыг хангахын тулд техникийн болон зохион байгуулалтын арга хэмжээ авна. Гэхдээ интернэтээр дамжуулах нэг ч систем 100% аюулгүй биш гэдгийг анхаарна уу.",
      ],
      en: [
        "We keep personal data only as long as needed to provide the service and meet legal requirements.",
        "We use technical and organizational measures to protect data, but no internet transmission or storage system is 100% secure.",
      ],
    },
  },
  {
    title: {
      mn: "7. Таны эрх",
      en: "7. Your rights",
    },
    body: {
      mn: [
        "Та өөрийн хувийн мэдээллийг нэвтрэх, засах, устгуулах, боловсруулалтыг хязгаарлах хүсэлт гаргаж болно.",
        "Бүртгэл устгах эсвэл мэдээлэлтэй холбоотой хүсэлтийг доорх имэйл хаягаар илгээнэ үү. Хуулийн шаардлагын дагуу хариу өгнө.",
      ],
      en: [
        "You may request access to, correction of, or deletion of your personal data, and may ask us to restrict processing where applicable.",
        "To delete your account or make a privacy request, contact us using the email below. We will respond as required by applicable law.",
      ],
    },
  },
  {
    title: {
      mn: "8. Хүүхдийн нууцлал",
      en: "8. Children’s privacy",
    },
    body: {
      mn: [
        "Манай үйлчилгээ нь ерөнхийдөө сайн дурын хөтөлбөрт оролцох боломжтой хэрэглэгчдэд зориулагдсан. 13-аас доош насны хүүхдээс мэдээлэл санаатайгаар цуглуулахгүй.",
        "Хэрэв хүүхдийн мэдээлэл цуглуулсан гэж үзвэл бидэнтэй холбогдоорой — бид устгах арга хэмжээ авна.",
      ],
      en: [
        "Our services are intended for users who can participate in volunteer programs. We do not knowingly collect personal data from children under 13.",
        "If you believe a child has provided us data, contact us and we will take steps to delete it.",
      ],
    },
  },
  {
    title: {
      mn: "9. Бодлогын өөрчлөлт",
      en: "9. Changes to this policy",
    },
    body: {
      mn: [
        "Бид энэхүү бодлогыг шинэчилж болно. Өөрчлөлтийг энэ хуудсанд нийтэлж, \"Сүүлд шинэчилсэн\" огноог шинэчилнэ. Чухал өөрчлөлтийн үед апп эсвэл имэйлээр мэдэгдэж болно.",
      ],
      en: [
        "We may update this Privacy Policy from time to time. We will post the updated version on this page and revise the \"Last updated\" date. For material changes, we may notify you in the app or by email.",
      ],
    },
  },
  {
    title: {
      mn: "10. Холбоо барих",
      en: "10. Contact us",
    },
    body: {
      mn: [
        "Нууцлалтай холбоотой асуулт, хүсэлтийг дараах хаягаар илгээнэ үү:",
        "Au Pair Mongolia",
        "Имэйл: volunteercenter22@gmail.com",
        "Утас: +976 9599 7999",
        "Хаяг: Time Center, 504 тоот, Улаанбаатар, Монгол",
      ],
      en: [
        "For privacy questions or requests, contact:",
        "Au Pair Mongolia",
        "Email: volunteercenter22@gmail.com",
        "Phone: +976 9599 7999",
        "Address: Time Center, Room 504, Ulaanbaatar, Mongolia",
      ],
    },
  },
];

export default function PrivacyClient() {
  const locale = useLocale() as "mn" | "en" | "de";
  const lang: "mn" | "en" = locale === "en" ? "en" : "mn";

  return (
    <PremiumPageShell>
      <div className="space-y-6 pb-8 pt-2">
        <PremiumSectionHeader
          title={lang === "mn" ? "Нууцлалын бодлого" : "Privacy Policy"}
          subtitle={
            lang === "mn"
              ? `Сүүлд шинэчилсэн: ${UPDATED}`
              : `Last updated: ${UPDATED}`
          }
        />

        <div className="card p-5 space-y-6">
          {SECTIONS.map((section) => (
            <section key={section.title.en} className="space-y-2">
              <h2
                className="text-[15px] font-bold"
                style={{ color: "var(--label)" }}
              >
                {section.title[lang]}
              </h2>
              <div className="space-y-2">
                {section.body[lang].map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="text-[13px] leading-relaxed font-medium"
                    style={{ color: "var(--label2)" }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="text-[12px] text-center font-medium" style={{ color: "var(--label3)" }}>
          <Link href="/contact" className="underline underline-offset-2">
            {lang === "mn" ? "Холбоо барих" : "Contact us"}
          </Link>
          {" · "}
          <Link href="/about" className="underline underline-offset-2">
            {lang === "mn" ? "Бидний тухай" : "About APM"}
          </Link>
        </p>
      </div>
    </PremiumPageShell>
  );
}
