"use client";

import React from "react";
import { BRAND } from "@/lib/branding";
import BrandLogo from "@/app/components/BrandLogo";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBack?: boolean;
};

export default function AuthScreen({
  title,
  subtitle,
  children,
  footer,
  showBack = true,
}: AuthScreenProps) {
  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden auth-screen"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {showBack && (
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-3" style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 12px)" }}>
          <Link
            href="/"
            className="press inline-flex items-center gap-1 px-3 py-2 rounded-full liquid-chrome text-[13px] font-semibold"
            style={{ color: "var(--label2)" }}
          >
            <ChevronLeft size={16} />
            Буцах
          </Link>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-6 py-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <BrandLogo size={88} priority className="mb-6 mx-auto" />
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: "var(--blue)" }}
          >
            Au Pair Mongolia
          </p>
          <h1 className="text-[28px] font-black tracking-tight leading-tight" style={{ color: "var(--label)" }}>
            {title}
          </h1>
          <p className="text-[14px] mt-2 font-medium" style={{ color: "var(--label2)" }}>
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="liquid-chrome p-5"
          style={{ borderRadius: 28 }}
        >
          {children}
        </motion.div>

        {footer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="mt-6 text-center"
          >
            {footer}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "var(--sep)" }} />
      <span className="text-[12px] font-semibold" style={{ color: "var(--label3)" }}>
        эсвэл
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--sep)" }} />
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-[13px] text-center py-3 px-4 rounded-2xl font-medium mb-4"
      style={{ background: "var(--red-dim)", color: "var(--red)" }}
    >
      {message}
    </motion.p>
  );
}
