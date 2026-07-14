"use client";

import React, { useState } from "react";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { UserPlus, LogIn, ArrowRight } from "lucide-react";
import AuthScreen from "@/app/components/auth/AuthScreen";

const OPTIONS = [
  {
    id: "new",
    title: "Шинэ гишүүн",
    desc: "Gmail-ээр бүртгүүлж, хөтөлбөрт нэгдэнэ.",
    icon: UserPlus,
    href: "/sign-up",
    accent: "var(--blue)",
    accentBg: "var(--blue-dim)",
  },
  {
    id: "existing",
    title: "Гишүүн болсон",
    desc: "Gmail болон нууц үгээр нэвтэрнэ.",
    icon: LogIn,
    href: "/sign-in",
    accent: "var(--emerald)",
    accentBg: "var(--emerald-dim)",
  },
] as const;

export default function RegisterPage() {
  const [selected, setSelected] = useState<(typeof OPTIONS)[number]["id"]>("new");
  const active = OPTIONS.find((o) => o.id === selected) ?? OPTIONS[0];

  return (
    <AuthScreen
      title="APM-д нэгдэх"
      subtitle="Та аль хувилбарыг сонгох вэ?"
      showBack
      footer={
        <Link href="/" className="text-[13px] font-medium press" style={{ color: "var(--label3)" }}>
          Нүүр хуудас руу буцах
        </Link>
      }
    >
      <div className="space-y-3">
        {OPTIONS.map((option) => {
          const isActive = selected === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className="w-full text-left press rounded-2xl p-4 transition-all"
              style={{
                background: isActive ? option.accentBg : "var(--fill3)",
                border: isActive ? `2px solid ${option.accent}` : "2px solid transparent",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isActive ? option.accent : "var(--fill2)",
                    color: isActive ? "white" : "var(--label2)",
                  }}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold" style={{ color: "var(--label)" }}>
                    {option.title}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--label2)" }}>
                    {option.desc}
                  </p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: isActive ? option.accent : "var(--sep-opaque)",
                    background: isActive ? option.accent : "transparent",
                  }}
                >
                  {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <motion.div layout className="mt-5">
        <Link
          href={active.href}
          className="btn btn-primary btn-full flex items-center justify-center gap-2"
        >
          {selected === "new" ? "Бүртгүүлэх" : "Нэвтрэх"}
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </AuthScreen>
  );
}
