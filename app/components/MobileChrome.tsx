"use client";

import React, { useState, useEffect } from "react";
import { BRAND } from "@/lib/branding";
import BrandLogo from "@/app/components/BrandLogo";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Plane, Ticket, BookOpen,
  Search, Bell, Menu, X, ChevronRight, ArrowRight,
  User, Settings, LogOut, Info, ShoppingBag,
  ClipboardList, History,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { signOutToSignIn } from "@/lib/auth-signout";
import { formatRelativeTime } from "@/lib/format-time";

import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";

type Tab = { id: string; href: string; label: { en: string; mn: string }; Icon: any; FilledIcon?: any };

const TABS: Tab[] = [
  { id: "home",      href: "/",          label: { en: "Home",     mn: "Нүүр"    }, Icon: Home },
  { id: "programs",  href: "/programs",  label: { en: "Programs", mn: "Хөтөлбөр" }, Icon: Plane },
  { id: "shop",      href: "/shop",      label: { en: "Shop",     mn: "Дэлгүүр" }, Icon: ShoppingBag },
  { id: "lessons",   href: "/lessons",   label: { en: "Learn",    mn: "Сургалт" }, Icon: BookOpen },
  { id: "profile",   href: "/profile",   label: { en: "Profile",  mn: "Профайл" }, Icon: User },
];

const AUTH_PATHS = ["/sign-in", "/sign-up", "/register", "/admin"];

const MENU_ITEMS = [
  {
    label: "Арга хэмжээ",
    sub: "Ойрын эвент, бүртгэл",
    href: "/events",
    icon: Ticket,
  },
  {
    label: "Миний өргөдөл",
    sub: "Хөтөлбөрт нэгдэх",
    href: "/programs/apply",
    icon: ClipboardList,
  },
  {
    label: "Сагс",
    sub: "Захиалга баталгаажуулах",
    href: "/cart",
    icon: ShoppingBag,
  },
  {
    label: "Тохиргоо",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Тухай",
    href: "/about",
    icon: Info,
  },
];

import { useCart } from "@/app/context/CartContext";

const PREFETCH_ROUTES = ["/", "/programs", "/shop", "/events", "/lessons", "/profile"];

export default function MobileChrome() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [visible, setVisible] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [notifications, setNotifications] = useState<
    Array<{ _id: string; type: string; title: string; body: string; createdAt: string; readAt?: string | null }>
  >([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* Warm RSC payloads for tab routes — native apps keep screens in memory */
  useEffect(() => {
    const run = () => {
      PREFETCH_ROUTES.forEach((href) => {
        try {
          router.prefetch(href);
        } catch {
          /* noop */
        }
      });
    };
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(run, { timeout: 5000 });
    } else {
      timerId = setTimeout(run, 5000);
    }
    return () => {
      if (idleId != null) window.cancelIdleCallback?.(idleId);
      if (timerId != null) clearTimeout(timerId);
    };
  }, [router]);

  useEffect(() => {
    if (status !== "authenticated") {
      setNotifications([]);
      return;
    }
    fetch("/api/user/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    const onRefresh = () => {
      if (status !== "authenticated") return;
      fetch("/api/user/notifications", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { notifications: [] }))
        .then((d) => setNotifications(d.notifications || []))
        .catch(() => {});
    };
    window.addEventListener("APM:notifications-changed", onRefresh);
    return () => window.removeEventListener("APM:notifications-changed", onRefresh);
  }, [status]);

  useEffect(() => {
    if (!showNotif || status !== "authenticated") return;
    setNotifLoading(true);
    fetch("/api/user/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, [showNotif, status]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  function notifEmoji(type: string) {
    if (type.includes("event")) return "🎉";
    if (type.includes("course") || type.includes("lesson")) return "📚";
    if (type.includes("order") || type.includes("shop")) return "🛍";
    if (type.includes("application")) return "📋";
    return "🔔";
  }

  /* Hide on auth + admin pages */
  useEffect(() => {
    setVisible(!AUTH_PATHS.some(p => pathname.includes(p)));
  }, [pathname]);

  /* Close overlays on route change */
  useEffect(() => {
    setShowMenu(false);
    setShowNotif(false);
    setShowSearch(false);
  }, [pathname]);

  if (!isMounted || !visible) return null;

  const user = session?.user as any;
  const overlayOpen = showMenu || showSearch || showNotif;
  const headerTop = "var(--native-header-offset)";

  return (
    <>
      {/* ══════════════ FLOATING HEADER PILL ══════════════ */}
      <div className="fixed top-0 left-0 right-0 z-[100] lg:hidden px-3 pt-safe native-chrome-top">
        <div className="liquid-chrome mt-2 px-4 flex items-center justify-between native-chrome-panel">
          <Link href="/" prefetch className="flex items-center gap-2.5 press min-w-0">
            <BrandLogo size={32} priority />
            <div className="leading-none min-w-0">
              <div className="text-[13px] font-black tracking-tight premium-brand-title truncate">
                {BRAND.shortName}
              </div>
              <div
                className="text-[10px] font-semibold truncate"
                style={{ color: "var(--blue)" }}
              >
                Au Pair
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Link
              href="/cart"
              prefetch
              className="native-chrome-action native-chrome-action--glass press"
              aria-label="Сагс"
            >
              <ShoppingBag size={17} strokeWidth={2.2} />
              {cartCount > 0 && <span className="native-chrome-action__dot" aria-hidden />}
            </Link>
            <button
              type="button"
              onClick={() => { setShowSearch(true); setShowMenu(false); setShowNotif(false); }}
              className="native-chrome-action native-chrome-action--glass press"
              aria-label="Хайх"
            >
              <Search size={17} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={() => { setShowNotif(v => !v); setShowMenu(false); setShowSearch(false); }}
              className={`native-chrome-action press ${showNotif ? "native-chrome-action--on" : "native-chrome-action--fill"}`}
              aria-label="Мэдэгдэл"
            >
              <Bell size={17} strokeWidth={2.2} />
              {unreadCount > 0 && !showNotif && (
                <span className="native-chrome-action__badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setShowMenu(v => !v); setShowNotif(false); setShowSearch(false); }}
              className={`native-chrome-action press ${showMenu ? "native-chrome-action--on" : "native-chrome-action--fill"}`}
              aria-label="Цэс"
            >
              {showMenu
                ? <X size={17} strokeWidth={2.5} color="white" />
                : <Menu size={17} strokeWidth={2.2} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ BOTTOM TAB BAR (floating liquid) ══════════════ */}
      {!overlayOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden liquid-tab-dock pointer-events-none native-chrome-bottom"
        >
          <div className="liquid-chrome liquid-tab-bar pointer-events-auto">
            <div className="grid grid-cols-5 w-full">
              {TABS.map(({ id, Icon, href, label }) => {
                const active =
                  id === "profile"
                    ? pathname === "/profile" || pathname.startsWith("/profile/")
                    : pathname === href || (href !== "/" && pathname.startsWith(href));
                const text = locale === "mn" ? label.mn : label.en;

                return (
                  <Link
                    key={id}
                    href={href}
                    prefetch
                    onTouchStart={() => {
                      try {
                        router.prefetch(href);
                      } catch {
                        /* noop */
                      }
                    }}
                    onClick={() => hapticImpact(ImpactStyle.Light)}
                    className={`press flex flex-col items-center justify-center pt-2 pb-1 relative native-tab-item ${active ? "on" : ""}`}
                  >
                    {active && <span className="native-tab-pill" aria-hidden />}
                    <span className="relative z-10">
                      <Icon
                        size={23}
                        strokeWidth={active ? 2.4 : 1.8}
                        style={{ color: active ? "var(--blue)" : "var(--label3)" }}
                      />
                    </span>
                    <span
                      className="text-[10px] font-bold mt-0.5 relative z-10"
                      style={{
                        color: active ? "var(--blue)" : "var(--label3)",
                        letterSpacing: "-0.2px",
                      }}
                    >
                      {text}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ SEARCH OVERLAY ══════════════ */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed left-3 right-3 z-[99] lg:hidden px-4 pb-4 liquid-glass"
            style={{
              top: `calc(${headerTop} + 6px)`,
              borderRadius: 22,
            }}
          >
            <div className="pt-3">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "var(--fill2)" }}
              >
                <Search size={16} style={{ color: "var(--label3)", flexShrink: 0 }} />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Хайх..."
                  className="flex-1 bg-transparent text-[15px] outline-none"
                  style={{ color: "var(--label)" }}
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")}>
                    <X size={15} style={{ color: "var(--label3)" }} />
                  </button>
                )}
              </div>
              {/* Quick links */}
              {!searchQ && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { label: "Хөтөлбөр", href: "/programs" },
                    { label: "Арга хэмжээ", href: "/events" },
                    { label: "Сургалт", href: "/lessons" },
                    { label: "Дэлгүүр", href: "/shop" },
                  ].map(q => (
                    <Link
                      key={q.label}
                      href={q.href}
                      prefetch
                      onClick={() => { setShowSearch(false); setSearchQ(""); }}
                      className="px-3 py-1.5 rounded-xl text-[13px] font-medium press"
                      style={{ background: "var(--fill2)", color: "var(--label2)" }}
                    >
                      {q.label}
                    </Link>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setShowSearch(false); setSearchQ(""); }}
                className="mt-3 w-full text-center text-[13px] font-semibold py-2 press"
                style={{ color: "var(--blue)" }}
              >
                Хаах
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ NOTIFICATION PANEL ══════════════ */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            key="notif"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed right-4 z-[99] lg:hidden overflow-hidden liquid-card"
            style={{
              top: `calc(${headerTop} + 8px)`,
              width: 288,
            }}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--sep)" }}>
              <span className="font-bold text-[15px]" style={{ color: "var(--label)" }}>Мэдэгдэл</span>
              <button onClick={() => setShowNotif(false)}>
                <X size={16} style={{ color: "var(--label3)" }} />
              </button>
            </div>
            {status !== "authenticated" ? (
              <div className="px-4 py-6 text-center">
                <p className="text-[13px]" style={{ color: "var(--label2)" }}>Мэдэгдэл харахын тулд нэвтэрнэ үү</p>
                <Link
                  href="/sign-in"
                  onClick={() => setShowNotif(false)}
                  className="inline-block mt-3 text-[13px] font-semibold press"
                  style={{ color: "var(--blue)" }}
                >
                  Нэвтрэх
                </Link>
              </div>
            ) : notifLoading ? (
              <div className="px-4 py-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "var(--fill2)" }} />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] font-medium" style={{ color: "var(--label)" }}>Мэдэгдэл байхгүй</p>
                <p className="text-[11px] mt-1" style={{ color: "var(--label3)" }}>Шинэ мэдээлэл энд харагдана</p>
              </div>
            ) : (
              notifications.slice(0, 8).map((n, i) => (
                <div key={n._id}>
                  <div className="flex items-start gap-3 px-4 py-3 press active:bg-black/5">
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "var(--fill2)" }}
                    >
                      {notifEmoji(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: "var(--label)" }}>
                        {n.title || "APM"}
                      </p>
                      <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: "var(--label3)" }}>
                        {n.body}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: "var(--label4)" }}>
                        {formatRelativeTime(n.createdAt, locale)}
                      </p>
                    </div>
                    {!n.readAt && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: "var(--blue)" }} />
                    )}
                  </div>
                  {i < Math.min(notifications.length, 8) - 1 && (
                    <div className="h-px ml-16" style={{ background: "var(--sep)" }} />
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ MENU OVERLAY ══════════════ */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 z-[105] lg:hidden"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed left-3 right-3 z-[106] lg:hidden flex flex-col liquid-chrome overflow-hidden"
              style={{
                top: `calc(${headerTop} + 8px)`,
                bottom: "calc(max(env(safe-area-inset-bottom, 0px), 12px) + 12px)",
                borderRadius: 28,
                boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              }}
            >
              {user ? (
                <Link
                  href="/profile"
                  prefetch
                  onClick={() => setShowMenu(false)}
                  className="mx-4 mt-4 flex items-center gap-3 p-3.5 press liquid-card"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[16px]"
                    style={{ background: "var(--blue)" }}
                  >
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] truncate" style={{ color: "var(--label)" }}>
                      {user.name}
                    </p>
                    <p className="text-[12px] truncate mt-0.5" style={{ color: "var(--label3)" }}>
                      {user.email || user.phone || "Профайл харах"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--blue)" }}>
                    <History size={14} />
                    <ChevronRight size={16} style={{ color: "var(--label3)" }} />
                  </div>
                </Link>
              ) : (
                <div className="mx-4 mt-4 p-4 liquid-card">
                  <p className="font-bold text-[15px]" style={{ color: "var(--label)" }}>Сайн уу!</p>
                  <p className="text-[12px] mt-1" style={{ color: "var(--label3)" }}>
                    Нэвтэрч профайл, түүхээ хараарай
                  </p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-2 px-1"
                  style={{ color: "var(--label3)" }}
                >
                  Цэс
                </p>
                <div className="overflow-hidden liquid-card" style={{ borderRadius: 20 }}>
                  {MENU_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          prefetch
                          onClick={() => setShowMenu(false)}
                          className="press flex items-center gap-3 px-4 py-3.5"
                          style={{ background: isActive ? "var(--blue-dim)" : "transparent" }}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: isActive ? "var(--blue)" : "var(--fill2)" }}
                          >
                            <Icon size={16} color={isActive ? "white" : "var(--label2)"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[14px] font-semibold"
                              style={{ color: isActive ? "var(--blue)" : "var(--label)" }}
                            >
                              {item.label}
                            </p>
                            {item.sub && (
                              <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--label3)" }}>
                                {item.sub}
                              </p>
                            )}
                          </div>
                          <ChevronRight size={14} style={{ color: "var(--label3)" }} />
                        </Link>
                        {i < MENU_ITEMS.length - 1 && (
                          <div className="h-px ml-[60px]" style={{ background: "var(--sep)" }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-center mt-4 px-2" style={{ color: "var(--label3)" }}>
                  Үндсэн хэсгүүд доод tab-аар шилжинэ
                </p>
              </div>

              <div
                className="px-4 flex-shrink-0 pt-2"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 16px)" }}
              >
                {user ? (
                  <button
                    type="button"
                    onClick={() => void signOutToSignIn(locale)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-semibold press"
                    style={{ background: "var(--red-dim)", color: "var(--red)", border: "0.5px solid rgba(239,68,68,0.2)" }}
                  >
                    <LogOut size={16} />
                    Гарах
                  </button>
                ) : (
                  <Link
                    href="/sign-in"
                    prefetch
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-bold text-white press"
                    style={{ background: "var(--blue)" }}
                  >
                    Нэвтрэх <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
