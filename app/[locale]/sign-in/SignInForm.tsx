"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthScreen, { AuthDivider, AuthError } from "@/app/components/auth/AuthScreen";
import GoogleButton from "@/app/components/auth/GoogleButton";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const finishLogin = async () => {
    await fetch("/api/auth/session", { method: "POST" });
    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("И-мэйл хаягаа оруулна уу.");
      return;
    }
    if (!password) {
      setError("Нууц үгээ оруулна уу.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        throw new Error("И-мэйл эсвэл нууц үг буруу байна.");
      }
      await finishLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Нэвтрэхэд алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const next = encodeURIComponent(callbackUrl.startsWith("/") ? callbackUrl : "/");
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/api/auth/callback?next=${next}`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google нэвтрэлт амжилтгүй.");
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title="Нэвтрэх"
      subtitle="И-мэйл болон нууц үгээрээ нэвтэрнэ үү"
      footer={
        <p className="text-[14px]" style={{ color: "var(--label2)" }}>
          Бүртгэлгүй юу?{" "}
          <Link href="/sign-up" className="font-bold press" style={{ color: "var(--blue)" }}>
            Бүртгүүлэх
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-1">
        <div className="input-group">
          <div className="input-row">
            <Mail size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="И-мэйл хаяг"
              disabled={busy}
            />
          </div>
          <div className="input-row">
            <Lock size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Нууц үг"
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="press flex-shrink-0"
              aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}
            >
              {showPassword ? (
                <EyeOff size={18} style={{ color: "var(--label3)" }} />
              ) : (
                <Eye size={18} style={{ color: "var(--label3)" }} />
              )}
            </button>
          </div>
        </div>

        <AuthError message={error} />

        <button type="submit" disabled={busy} className="btn btn-primary btn-full mt-2">
          {busy ? (
            <span className="ios-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
          ) : (
            "Нэвтрэх"
          )}
        </button>
      </form>

      <AuthDivider />

      <GoogleButton
        label="Google-ээр нэвтрэх"
        onClick={signInWithGoogle}
        disabled={busy}
      />
    </AuthScreen>
  );
}
