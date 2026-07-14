"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthScreen, { AuthDivider, AuthError } from "@/app/components/auth/AuthScreen";
import GoogleButton from "@/app/components/auth/GoogleButton";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Нууц үг 8-аас дээш тэмдэгт байх ёстой.";
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const score = [hasLower, hasUpper, hasNumber].filter(Boolean).length;
  if (score < 2) {
    return "Нууц үг том үсэг, жижиг үсэг, тоо гэсэн 2-оос доошгүй ангиллыг агуулсан байх ёстой.";
  }
  return null;
}

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const signUpWithGoogle = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/api/auth/callback?next=/profile`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google бүртгэл амжилтгүй.");
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setError("Нэрээ оруулна уу.");
      return;
    }
    if (!trimmedEmail) {
      setError("И-мэйл хаягаа оруулна уу.");
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setError("Зөв и-мэйл хаяг оруулна уу.");
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.error === "An account with this email already exists"
            ? "Энэ и-мэйл хаягтай бүртгэл байна."
            : data.error || "Бүртгэл амжилтгүй болсон.";
        throw new Error(msg);
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        setSuccess(true);
        setTimeout(() => router.push("/sign-in"), 1800);
        return;
      }

      await fetch("/api/auth/session", { method: "POST" });
      router.push("/profile");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Бүртгэл амжилтгүй.");
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="liquid-chrome p-8 text-center max-w-sm w-full"
          style={{ borderRadius: 28 }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4"
            style={{ background: "var(--emerald-dim)" }}
          >
            <CheckCircle2 size={40} style={{ color: "var(--emerald)" }} />
          </div>
          <h2 className="text-[22px] font-black" style={{ color: "var(--label)" }}>
            Бүртгэл амжилттай!
          </h2>
          <p className="text-[14px] mt-2" style={{ color: "var(--label2)" }}>
            Нэвтрэх хуудас руу шилжиж байна...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthScreen
      title="Бүртгүүлэх"
      subtitle="И-мэйл болон нууц үгээр шинэ бүртгэл үүсгэнэ үү"
      footer={
        <p className="text-[14px]" style={{ color: "var(--label2)" }}>
          Аль хэдийн бүртгэлтэй юу?{" "}
          <Link href="/sign-in" className="font-bold press" style={{ color: "var(--blue)" }}>
            Нэвтрэх
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-1">
        <div className="input-group">
          <div className="input-row">
            <User size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Бүтэн нэр"
              disabled={busy}
              required
            />
          </div>
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
              required
            />
          </div>
          <div className="input-row">
            <Lock size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Нууц үг (8+ тэмдэгт)"
              disabled={busy}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="press flex-shrink-0"
            >
              {showPassword ? (
                <EyeOff size={18} style={{ color: "var(--label3)" }} />
              ) : (
                <Eye size={18} style={{ color: "var(--label3)" }} />
              )}
            </button>
          </div>
          <div className="input-row">
            <Lock size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Нууц үг давтах"
              disabled={busy}
              required
            />
          </div>
        </div>

        <p className="text-[11px] px-1 pt-2" style={{ color: "var(--label3)" }}>
          Нууц үг: 8+ тэмдэгт, том/жижиг үсэг, тоо агуулсан байх.
        </p>

        <AuthError message={error} />

        <button type="submit" disabled={busy} className="btn btn-primary btn-full mt-3">
          {busy ? (
            <span className="ios-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
          ) : (
            "Бүртгүүлэх"
          )}
        </button>
      </form>

      <AuthDivider />

      <GoogleButton
        label="Google-ээр бүртгүүлэх"
        onClick={signUpWithGoogle}
        disabled={busy}
      />
    </AuthScreen>
  );
}
