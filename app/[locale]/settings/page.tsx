"use client";

import React, { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Link, useRouter } from "@/navigation";
import { signOutToSignIn } from "@/lib/auth-signout";
import { motion } from "framer-motion";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import PremiumSectionHeader from "@/app/components/PremiumSectionHeader";
import {
  Moon, Sun, Globe, Bell, BellOff, Shield,
  Info, ChevronRight, LogOut, Trash2, Volume2
} from "lucide-react";

type IOSToggleProps = { checked: boolean; onChange: () => void; color?: string };

function IOSToggle({ checked, onChange, color = "var(--blue)" }: IOSToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative flex-shrink-0 transition-all duration-300 press"
      style={{
        width: 51, height: 31,
        borderRadius: 999,
        background: checked ? color : "var(--fill3)",
      }}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-[2px] w-[27px] h-[27px] rounded-full shadow-md"
        style={{ background: "white" }}
      />
    </button>
  );
}

const LANGS = [
  { code: "mn", label: "Монгол", flag: "🇲🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export default function SettingsPage() {
  const locale = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notif, setNotif] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLang, setShowLang] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/user/settings")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.settings) { setNotif(d.settings.notificationsEnabled ?? true); } })
      .catch(() => {});
  }, []);

  const saveNotif = async (val: boolean) => {
    setNotif(val);
    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationsEnabled: val }),
      });
    } finally {
      setSaving(false);
    }
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <PremiumPageShell>
      <div className="space-y-6 pb-6 pt-2">

        <PremiumSectionHeader
          title={locale === "mn" ? "Тохиргоо" : "Settings"}
          subtitle={saving ? (locale === "mn" ? "Хадгалж байна…" : "Saving…") : "APM app"}
        />

        {/* Appearance */}
        <section className="space-y-2">
          <p className="sec-label">{locale === "mn" ? "Гадаад төрх" : "Appearance"}</p>
          <div className="card p-2">
            <div className="flex items-center gap-3 px-3 py-3.5 press" onClick={() => mounted && setTheme(isDark ? "light" : "dark")} role="button">
              <div className="icon-box-sm" style={{ background: isDark ? "#2C2C2E" : "#FFF3CC", color: isDark ? "#F5C518" : "#F59E0B" }}>
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold" style={{ color: "var(--label)" }}>Dark mode</p>
                <p className="text-[12px]" style={{ color: "var(--label3)" }}>
                  {isDark ? (locale === "mn" ? "Идэвхтэй" : "Enabled") : (locale === "mn" ? "Идэвхгүй" : "Disabled")}
                </p>
              </div>
              <IOSToggle checked={isDark} onChange={() => mounted && setTheme(isDark ? "light" : "dark")} color="var(--label)" />
            </div>

            <div className="h-px mx-3" style={{ background: "var(--sep)" }} />

            <div
              className="flex items-center gap-3 px-3 py-3.5 press"
              onClick={() => setShowLang(v => !v)}
              role="button"
            >
              <div className="icon-box-sm" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                <Globe size={16} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold" style={{ color: "var(--label)" }}>
                  {locale === "mn" ? "Хэл" : "Language"}
                </p>
                <p className="text-[12px]" style={{ color: "var(--label3)" }}>
                  {LANGS.find(l => l.code === locale)?.flag} {LANGS.find(l => l.code === locale)?.label}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "var(--label3)", transform: showLang ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
            </div>

            {showLang && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-1">
                  {LANGS.map(lang => (
                    <a
                      key={lang.code}
                      href={`/${lang.code}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl press"
                      style={{
                        background: locale === lang.code ? "var(--blue-dim)" : "transparent",
                      }}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span
                        className="text-[14px] font-semibold"
                        style={{ color: locale === lang.code ? "var(--blue)" : "var(--label)" }}
                      >
                        {lang.label}
                      </span>
                      {locale === lang.code && (
                        <div className="ml-auto w-2 h-2 rounded-full" style={{ background: "var(--blue)" }} />
                      )}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-2">
          <p className="sec-label">{locale === "mn" ? "Мэдэгдэл" : "Notifications"}</p>
          <div className="card p-2">
            <div className="flex items-center gap-3 px-3 py-3.5">
              <div className="icon-box-sm" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                {notif ? <Bell size={16} /> : <BellOff size={16} />}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold" style={{ color: "var(--label)" }}>Push notification</p>
                <p className="text-[12px]" style={{ color: "var(--label3)" }}>
                  {notif ? (locale === "mn" ? "Идэвхтэй" : "Enabled") : (locale === "mn" ? "Идэвхгүй" : "Disabled")}
                </p>
              </div>
              <IOSToggle checked={notif} onChange={() => saveNotif(!notif)} />
            </div>

            <div className="h-px mx-3" style={{ background: "var(--sep)" }} />

            <div className="flex items-center gap-3 px-3 py-3.5">
              <div className="icon-box-sm" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>
                <Volume2 size={16} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold" style={{ color: "var(--label)" }}>
                  {locale === "mn" ? "Чичиргэлт" : "Haptics"}
                </p>
                <p className="text-[12px]" style={{ color: "var(--label3)" }}>
                  {haptic ? (locale === "mn" ? "Идэвхтэй" : "Enabled") : (locale === "mn" ? "Идэвхгүй" : "Disabled")}
                </p>
              </div>
              <IOSToggle checked={haptic} onChange={() => setHaptic(v => !v)} color="var(--emerald)" />
            </div>
          </div>
        </section>

        {/* About & Legal */}
        <section className="space-y-2">
          <p className="sec-label">{locale === "mn" ? "Бусад" : "More"}</p>
          <div className="card p-2">
            {[
              { icon: <Info size={16} />, label: locale === "mn" ? "APM тухай" : "About APM", href: "/about", color: "var(--blue)", bg: "var(--blue-dim)" },
              { icon: <Shield size={16} />, label: locale === "mn" ? "Нууцлалын бодлого" : "Privacy Policy", href: "/privacy", color: "var(--orange)", bg: "var(--orange-dim)" },
            ].map((item, i, arr) => (
              <React.Fragment key={item.label}>
                <Link href={item.href} className="flex items-center gap-3 px-3 py-3.5 press">
                  <div className="icon-box-sm" style={{ background: item.bg, color: item.color }}>
                    {item.icon}
                  </div>
                  <p className="flex-1 text-[14px] font-semibold" style={{ color: "var(--label)" }}>{item.label}</p>
                  <ChevronRight size={16} style={{ color: "var(--label3)" }} />
                </Link>
                {i < arr.length - 1 && <div className="h-px mx-3" style={{ background: "var(--sep)" }} />}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Account actions */}
        <section className="space-y-2">
          <p className="sec-label">{locale === "mn" ? "Бүртгэл" : "Account"}</p>
          <div className="card p-2">
            <button
              onClick={() => void signOutToSignIn(locale)}
              className="flex items-center gap-3 px-3 py-3.5 w-full press"
            >
              <div className="icon-box-sm" style={{ background: "var(--red-dim)", color: "var(--red)" }}>
                <LogOut size={16} />
              </div>
              <p className="flex-1 text-left text-[14px] font-semibold" style={{ color: "var(--red)" }}>
                {locale === "mn" ? "Гарах" : "Sign out"}
              </p>
            </button>
          </div>
        </section>

        {/* App version */}
        <p className="text-center text-[11px]" style={{ color: "var(--label4)" }}>
          APM v1.0.0 · {locale === "mn" ? "Монголын Au Pair Төв" : "Au Pair Mongolia"}
        </p>

      </div>
    </PremiumPageShell>
  );
}
