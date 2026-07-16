import type { Metadata, Viewport } from "next";

import "../globals.css";
import AuthProvider from "../components/AuthProvider";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import NetworkBanner from "../components/NetworkBanner";
import PushRegister from "../components/PushRegister";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { CartProvider } from "../context/CartContext";
import ThemeProvider from "../components/ThemeProvider";
import BackgroundPrefetch from "../components/BackgroundPrefetch";
import AppSplash from "../components/AppSplash";
import AppShell from "../components/AppShell";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.descriptorMn,
  manifest: "/manifest.webmanifest",
  applicationName: BRAND.shortName,
  appleWebApp: {
    capable: true,
    title: BRAND.shortName,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: BRAND.icon192, sizes: "192x192", type: "image/png" },
      { url: BRAND.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: BRAND.appleTouchIcon,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND.colors.creamLight },
    { media: "(prefers-color-scheme: dark)", color: BRAND.colors.backgroundDark },
  ],
};

const locales = ['en', 'mn', 'de'];

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <AuthProvider>
      <CartProvider>
        <html lang={locale} suppressHydrationWarning className="">
        <head>
          <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />

          <meta name="apple-mobile-web-app-title" content={BRAND.shortName} />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-touch-fullscreen" content="yes" />
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body className="font-sans overscroll-none bg-[var(--bg)] dark:bg-[#0F172A]" suppressHydrationWarning>
          <AppSplash />
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
              <ServiceWorkerRegister />
              <BackgroundPrefetch />
              <PushRegister />
              <NetworkBanner />
              <AppShell>{children}</AppShell>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
      </CartProvider>
    </AuthProvider>
  );
}
