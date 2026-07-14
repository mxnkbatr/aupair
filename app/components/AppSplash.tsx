"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND } from "@/lib/branding";
import BrandLogo from "./BrandLogo";

const STORAGE_KEY = "apm-splash-dismissed";
const MIN_VISIBLE_MS = 450;
const FADE_OUT_MS = 220;

export default function AppSplash() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "exiting">("hidden");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    setPhase("visible");
    const started = Date.now();

    const dismiss = () => {
      const elapsed = Date.now() - started;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(() => setPhase("exiting"), wait);
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
      const fallback = window.setTimeout(dismiss, 3000);
      return () => {
        window.removeEventListener("load", dismiss);
        window.clearTimeout(fallback);
      };
    }
  }, []);

  useEffect(() => {
    if (phase !== "exiting") return;
    const t = window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setPhase("hidden");
    }, FADE_OUT_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <AnimatePresence>
      {phase !== "hidden" && (
        <motion.div
          key="app-splash"
          role="status"
          aria-label="Loading"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exiting" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_OUT_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
          className="app-splash"
        >
          <div className="app-splash__cream-wash" aria-hidden />

          <motion.div
            className="app-splash__card"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandLogo size={112} priority className="app-splash__logo-icon" />

            <motion.div
              className="app-splash__brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.45 }}
            >
              <p className="app-splash__brand-name">Au Pair</p>
              <div className="app-splash__brand-rule">
                <span className="app-splash__brand-line" />
                <span className="app-splash__brand-of">Mongolia</span>
                <span className="app-splash__brand-line" />
              </div>
            </motion.div>

            <motion.p
              className="app-splash__tagline"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
            >
              {BRAND.taglineMn}
            </motion.p>

            <div className="app-splash__progress" aria-hidden>
              <motion.div
                className="app-splash__progress-bar"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: phase === "exiting" ? 1 : 0.92 }}
                transition={{
                  duration: phase === "exiting" ? 0.3 : MIN_VISIBLE_MS / 1000,
                  ease: phase === "exiting" ? "easeOut" : [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </motion.div>

          <motion.p
            className="app-splash__footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
          >
            {BRAND.descriptorMn}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
