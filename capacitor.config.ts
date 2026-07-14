import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Do not import dotenv here — Appflow runs `cap config --json` and parses stdout.
 * dotenv@17 prints a banner that breaks that JSON parse.
 * Set CAPACITOR_SERVER_URL / NEXT_PUBLIC_APP_URL in Appflow env (or your shell locally).
 */
const productionUrl = "https://aupair-mongolia.vercel.app";
const isDev = process.env.NODE_ENV === "development";
const serverUrl =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (isDev ? "http://localhost:3000" : productionUrl);

const config: CapacitorConfig = {
  appId: "mn.aupair.app",
  appName: "Au Pair Mongolia",
  webDir: "public",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
          androidScheme: serverUrl.startsWith("https") ? "https" : "http",
        },
      }
    : {}),
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: "#FFF9F8",
      showSpinner: false,
      androidSplashResourceName: "splash",
    },
    StatusBar: {
      overlaysWebView: true,
      backgroundColor: "#FFF9F8",
      style: "LIGHT",
    },
  },
};

export default config;
