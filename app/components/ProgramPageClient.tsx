"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock, MapPin, ChevronRight, CheckCircle2,
  Star, Users, Globe, Heart, Zap, GraduationCap,
  BookOpen, CalendarDays, ArrowRight, Sparkles,
  ArrowLeft, Send, Loader2, User, Mail, Phone,
  ChevronDown, X
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { IOSAlert, IOSSheet } from "./iOSAlert";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface ProgramConfig {
  id: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  accentBg: string;
  accentText: string;
  btnBg: string;
  shadowColor: string;
  name: string;
  shortDesc: string;
  duration: string;
  type: string;
  location: string;
  openSlots: number;
  tags: { label: string; bg: string }[];
  features: { icon: React.ElementType; title: string; desc: string }[];
  requirements: string[];
  whyJoin: string;
  heroSub: string;
  steps: { num: string; title: string; desc: string }[];
}

// ─── APPLY FORM ──────────────────────────────────────────────────────────────
function ApplyForm({
  prog,
  onClose,
  onSuccess,
}: {
  prog: ProgramConfig;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    age: "", level: "B1", message: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.message) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, program: prog.id }),
      });
      if (res.ok) onSuccess();
      else throw new Error("Failed");
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IOSSheet isOpen={true} onClose={onClose} title="Өргөдөл гаргах">
      <div className="p-6 space-y-5">
          {/* Program info card */}
          <div
            className="card p-4 flex items-center gap-4"
            style={{ background: `linear-gradient(135deg, ${prog.gradientFrom}15, ${prog.gradientTo}10)` }}
          >
            <span className="text-4xl">{prog.emoji}</span>
            <div className="flex-1">
              <div className="t-headline" style={{ fontSize: 15 }}>{prog.name}</div>
              <div className="t-footnote">{prog.duration} · {prog.location}</div>
            </div>
          </div>

          <div className="input-group">
            <div className="input-row">
              <User size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} />
              <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Нэр" />
            </div>
            <div className="input-row">
              <User size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} />
              <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Овог" />
            </div>
            <div className="input-row">
              <Mail size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} />
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Имэйл хаяг" />
            </div>
            <div className="input-row">
              <Phone size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} />
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Утасны дугаар" />
            </div>
            <div className="input-row">
              <CalendarDays size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} />
              <input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="Нас" />
            </div>
            <div className="input-row">
              <Globe size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} />
              <select value={form.level} onChange={(e) => set("level", e.target.value)} className="flex-1">
                <option value="A1">A1 — Анхан шат</option>
                <option value="A2">A2 — Суурь</option>
                <option value="B1">B1 — Дунд</option>
                <option value="B2">B2 — Дунд дээш</option>
                <option value="C1">C1 — Ахисан</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="t-caption2 uppercase tracking-widest ml-1">Урам зоригийн захиа</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Яагаад энэ хөтөлбөрт орохыг хүсэж байгаагаа бичнэ үү..."
              className="input"
              style={{ borderRadius: 'var(--r-xl)' }}
            />
          </div>

          {error && <p className="t-caption text-center" style={{ color: 'var(--red)' }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !form.firstName || !form.email || !form.message}
            className="btn btn-primary btn-full"
            style={{ opacity: (loading || !form.firstName || !form.email || !form.message) ? 0.5 : 1 }}
          >
            {loading ? <div className="ios-spinner !w-5 !h-5" /> : <>Өргөдөл илгээх <Send size={16} className="ml-2" /></>}
          </button>
          <div className="pb-8" />
      </div>
      
      <IOSAlert 
        isOpen={!!error} 
        onClose={() => setError(null)} 
        title="Алдаа" 
        message={error || ""} 
        type="error" 
      />
    </IOSSheet>
  );
}

// ─── SUCCESS SCREEN ──────────────────────────────────────────────────────────
function SuccessScreen({ prog, onDashboard }: { prog: ProgramConfig; onDashboard: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="page flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="icon-box" style={{ background: 'var(--blue-dim)', color: 'var(--blue)', width: 80, height: 80, borderRadius: 40 }}>
        <CheckCircle2 size={40} />
      </div>
      <h2 className="t-title1 mt-6 mb-2">Амжилттай!</h2>
      <p className="t-subhead mb-8" style={{ color: 'var(--label2)' }}>
        Таны өргөдөл {prog.name}-д хүргэгдлээ. APM-ийн баг 24 цагийн дотор холбогдох болно.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={onDashboard} className="btn btn-primary btn-full">
          Миний хуудас руу →
        </button>
        <Link href="/programs" className="btn btn-ghost btn-full">
          Хөтөлбөрүүд харах
        </Link>
      </div>
    </motion.div>
  );
}

// ─── MAIN PROGRAM PAGE ───────────────────────────────────────────────────────
export function ProgramPageClient({ config }: { config: ProgramConfig }) {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApplyClick = () => {
    if (!isSignedIn) {
      window.location.href = "/register";
    } else {
      setShowForm(true);
    }
  };

  if (success) return <SuccessScreen prog={config} onDashboard={() => (window.location.href = "/dashboard")} />;

  return (
    <>
      <div className="page">
        <div className="page-inner space-y-5">
          {/* Back */}
          <Link href="/programs" className="inline-flex items-center gap-1 t-caption font-semibold press" style={{ color: 'var(--blue)' }}>
            <ArrowLeft size={16} /> Хөтөлбөрүүд
          </Link>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})` }}
          >
            <div
              className="absolute right-0 top-0 w-56 h-56 rounded-full opacity-15"
              style={{ background: "white", filter: "blur(50px)", transform: "translate(30%, -30%)" }}
            />
            <div className="relative z-10 flex items-start gap-5">
              <span className="text-6xl flex-shrink-0">{config.emoji}</span>
              <div>
                <div className="t-caption2 text-white/60 uppercase tracking-widest mb-1">{config.id} · APM хөтөлбөр</div>
                <h1 className="t-title2 text-white leading-tight mb-3">{config.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold text-white/85 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                    <Clock size={10} /> {config.duration}
                  </span>
                  <span className="text-[11px] font-bold text-white/85 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                    <MapPin size={10} /> {config.location}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* About */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="icon-box" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                <Globe size={18} />
              </div>
              <h2 className="t-headline">Хөтөлбөрийн тухай</h2>
            </div>
            <p className="t-subhead" style={{ color: 'var(--label2)', lineHeight: 1.6 }}>{config.heroSub}</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {config.tags.map((t) => (
                <span key={t.label} className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>{t.label}</span>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="icon-box" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                <Sparkles size={18} />
              </div>
              <h2 className="t-headline">Юу хийх вэ?</h2>
            </div>
            <div className="space-y-5">
              {config.features.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="icon-box-sm" style={{ background: 'var(--blue-dim)', color: 'var(--blue)', marginTop: 2 }}>
                    <f.icon size={16} />
                  </div>
                  <div>
                    <div className="t-headline" style={{ fontSize: 15 }}>{f.title}</div>
                    <div className="t-subhead" style={{ color: 'var(--label2)', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Requirements */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-box" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                <CheckCircle2 size={18} />
              </div>
              <h2 className="t-headline">Шаардлага</h2>
            </div>
            <div className="space-y-3">
              {config.requirements.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--blue-dim)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--blue)' }} />
                  </div>
                  <span className="t-subhead" style={{ color: 'var(--label)' }}>{r}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* How to join steps */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="icon-box" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                <ArrowRight size={18} />
              </div>
              <h2 className="t-headline">Хэрхэн нэгдэх вэ?</h2>
            </div>
            <div className="space-y-4">
              {config.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})` }}
                  >
                    {s.num}
                  </div>
                  <div>
                    <div className="t-headline" style={{ fontSize: 15 }}>{s.title}</div>
                    <div className="t-subhead" style={{ color: 'var(--label2)', fontSize: 13 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Why Join */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="card p-6 text-center"
            style={{ background: 'var(--bg-dark)' }}
          >
            <div className="text-3xl mb-3">⭐</div>
            <p className="t-subhead" style={{ color: 'white', opacity: 0.85, lineHeight: 1.6 }}>{config.whyJoin}</p>
          </motion.div>

          {/* Apply CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-3 pb-8">
            <button
              onClick={handleApplyClick}
              className="btn btn-primary btn-full py-5 text-[17px]"
            >
              {isSignedIn ? "Өргөдөл гаргах" : "Бүртгүүлж өргөдөл гаргах"} <ArrowRight size={18} className="ml-2" />
            </button>
            {!isSignedIn && (
              <Link href="/sign-in" className="btn btn-ghost btn-full">
                Аль хэдийн гишүүн бол нэвтрэх
              </Link>
            )}
          </motion.div>

        </div>
      </div>

      {/* Apply Form Sheet */}
      <AnimatePresence>
        {showForm && (
          <ApplyForm
            prog={config}
            onClose={() => setShowForm(false)}
            onSuccess={() => { setShowForm(false); setSuccess(true); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
