"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { BRAND } from "@/lib/branding";

/** Sync native status bar with APM cream / dark theme. */
export default function NativeStatusBar() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    void import("@capacitor/core").then(({ Capacitor }) => {
      if (!Capacitor.isNativePlatform()) return;

      void import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
        const isDark = resolvedTheme === "dark";
        const color = isDark ? BRAND.colors.backgroundDark : BRAND.colors.creamLight;

        void StatusBar.setOverlaysWebView({ overlay: true });
        void StatusBar.setBackgroundColor({ color });
        void StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      });
    });
  }, [resolvedTheme]);

  return null;
}
