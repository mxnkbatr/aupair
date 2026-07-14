"use client";

import React, { useState } from "react";
import { Link } from "@/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { useLocale } from "next-intl";
import { signOutToSignIn } from "@/lib/auth-signout";
import { Motion as motion } from "./MotionProxy";
import { useTranslations } from "next-intl";
import { LogOut, User as UserIcon } from "lucide-react";

interface AuthActionsProps {
  BRAND: { RED: string };
  isMobile?: boolean;
}

const AuthActions = ({ BRAND, isMobile }: AuthActionsProps) => {
  const locale = useLocale();
  const t = useTranslations("Auth");
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const user = session?.user;
  const isAdmin = (user as any)?.role === 'admin';
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";

  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        {!isSignedIn ? (
          <Link href="/sign-in">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="px-5 h-10 rounded-full text-white text-[11px] font-black tracking-widest uppercase shadow-lg shadow-[#C41E3A]/25 border border-white/20 whitespace-nowrap"
              style={{ backgroundColor: BRAND.RED }}
            >
              {t('signIn')}
            </motion.button>
          </Link>
        ) : (
          <div className="ml-1 scale-105 drop-shadow-lg w-8 h-8 flex items-center justify-center relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border-2 flex items-center justify-center text-slate-500"
              style={{ borderColor: BRAND.RED }}
            >
              {user?.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} />
              )}
            </button>
            {dropdownOpen && (
              <div className="absolute top-10 right-0 bg-white shadow-xl rounded-xl border border-slate-100 overflow-hidden w-40 z-50">
                <Link href={dashboardHref} className="block px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100">
                  {t('dashboard')}
                </Link>
                <button
                  type="button"
                  onClick={() => void signOutToSignIn(locale)}
                  className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {isSignedIn ? (
        <div className="flex items-center gap-3 relative">
          <Link
            href={dashboardHref}
            className="text-[9px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 border-b-2 hidden xl:block"
            style={{ borderColor: BRAND.RED }}
          >
            {t('dashboard')}
          </Link>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border-2 flex items-center justify-center text-slate-500 hover:shadow-md transition-all"
              style={{ borderColor: BRAND.RED }}
            >
              {user?.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} />
              )}
            </button>
            {dropdownOpen && (
              <div className="absolute top-10 right-0 bg-white shadow-xl rounded-xl border border-slate-100 overflow-hidden w-40 z-50">
                <div className="px-4 py-2 border-b border-slate-100 pb-3">
                  <p className="text-xs font-black truncate">{user?.name || "User"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <Link onClick={() => setDropdownOpen(false)} href={dashboardHref} className="block px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100">
                  {t('dashboard')}
                </Link>
                <button
                  type="button"
                  onClick={() => void signOutToSignIn(locale)}
                  className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Link href="/sign-in">
          <button
            className="px-5 py-2 min-w-[80px] rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all active:scale-95 hover:brightness-110"
            style={{ backgroundColor: BRAND.RED }}
          >
            {t('signIn')}
          </button>
        </Link>
      )}
    </>
  );
};

export default AuthActions;
