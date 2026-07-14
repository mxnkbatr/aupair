"use client";

import React, { useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { Link } from "@/navigation";
import { Trash2, Plus, Minus, ArrowRight, Tag, X } from "lucide-react";
import Image from "next/image";
import { IOSAlert } from "@/app/components/iOSAlert";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import PremiumSectionHeader from "@/app/components/PremiumSectionHeader";

type AppliedPromo = {
  code: string;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
};

export default function CartClient({ locale }: { locale: string }) {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  const payableTotal = useMemo(
    () => (appliedPromo ? appliedPromo.finalAmount : total),
    [appliedPromo, total]
  );

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoBusy(true);
    setPromoError("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoInput.trim(),
          context: "shop",
          items: items.map((i) => ({
            id: i._id,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!data.valid) throw new Error(data.error || "Промо код буруу");
      setAppliedPromo({
        code: data.code,
        discountPercent: data.discountPercent,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
      });
    } catch (e: unknown) {
      setAppliedPromo(null);
      setPromoError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setPromoBusy(false);
    }
  };

  const clearPromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qpay/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payableTotal,
          description: "APM Shop Order",
          promoCode: appliedPromo?.code,
          items: items.map((i) => ({
            id: i._id,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (data.qPay_url) {
        window.location.href = data.qPay_url;
      } else {
        setAlert({
          title: "Алдаа",
          message: data.error || "Төлбөрийн нэхэмжлэл үүсгэхэд алдаа гарлаа.",
        });
      }
    } catch (e) {
      console.error(e);
      setAlert({ title: "Алдаа", message: "Дахин оролдоно уу." });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <PremiumPageShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] pt-8 text-center">
          <div className="icon-box mx-auto mb-4" style={{ background: "var(--fill2)", color: "var(--label3)" }}>
            <Trash2 size={24} />
          </div>
          <h2 className="t-headline">Сагс хоосон байна</h2>
          <Link href="/shop" className="mt-4 text-blue-500 font-semibold press">
            Дэлгүүр рүү буцах
          </Link>
          <IOSAlert
            isOpen={!!alert}
            onClose={() => setAlert(null)}
            title={alert?.title || ""}
            message={alert?.message || ""}
            type="error"
            confirmText="Ойлголоо"
          />
        </div>
      </PremiumPageShell>
    );
  }

  return (
    <PremiumPageShell bottomPad={false} className="pb-48">
      <div className="space-y-4 pt-2">
        <PremiumSectionHeader title="Миний сагс" subtitle={`${items.length} бүтээгдэхүүн`} />

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="card p-3 flex gap-4 items-center">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={item.image} alt="Product" fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] truncate" style={{ color: "var(--label)" }}>
                  {item.name[locale as keyof typeof item.name] || item.name.en}
                </p>
                <p className="text-[13px] font-bold mt-1 text-blue-500">
                  ₮{item.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 bg-gray-100 rounded-full press">
                    <Minus size={14} />
                  </button>
                  <span className="text-[13px] font-semibold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 bg-gray-100 rounded-full press">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeFromCart(item._id)} className="p-1 ml-auto text-red-500 press">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="liquid-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Tag size={16} style={{ color: "var(--orange)" }} />
            <span className="text-[14px] font-bold">Промо код</span>
          </div>
          {appliedPromo ? (
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--emerald-dim)" }}>
              <div>
                <p className="font-bold" style={{ color: "var(--emerald)" }}>{appliedPromo.code}</p>
                <p className="text-xs" style={{ color: "var(--label2)" }}>
                  -{appliedPromo.discountPercent}% (₮{appliedPromo.discountAmount.toLocaleString()})
                </p>
              </div>
              <button type="button" onClick={clearPromo} className="press p-1">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="SUMMER20"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="btn btn-secondary press"
                disabled={promoBusy}
                onClick={applyPromo}
              >
                {promoBusy ? "..." : "Хэрэглэх"}
              </button>
            </div>
          )}
          {promoError && (
            <p className="text-xs" style={{ color: "var(--red)" }}>{promoError}</p>
          )}
        </div>

        <div
          className="fixed left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-50"
          style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
        >
          {appliedPromo && (
            <div className="flex justify-between text-sm mb-1" style={{ color: "var(--label2)" }}>
              <span>Хөнгөлөлт:</span>
              <span style={{ color: "var(--emerald)" }}>-₮{appliedPromo.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-semibold text-gray-500">Нийт дүн:</span>
            <div className="text-right">
              {appliedPromo && (
                <span className="text-sm line-through mr-2" style={{ color: "var(--label3)" }}>
                  ₮{total.toLocaleString()}
                </span>
              )}
              <span className="text-xl font-black text-blue-500">₮{payableTotal.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 press disabled:opacity-50"
          >
            {loading ? "Уншиж байна..." : "Төлбөр төлөх (QPay)"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
      <IOSAlert
        isOpen={!!alert}
        onClose={() => setAlert(null)}
        title={alert?.title || ""}
        message={alert?.message || ""}
        type="error"
        confirmText="Ойлголоо"
      />
    </PremiumPageShell>
  );
}
