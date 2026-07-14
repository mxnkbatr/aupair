"use client";

import React, { useState } from "react";
import Image from "next/image";
import DataTable, { Column } from "./DataTable";
import { signedCloudinaryUpload } from "./upload";
import { ArrowUp, ArrowDown } from "lucide-react";

type BannerRow = {
  _id: string;
  title?: { mn?: string; en?: string };
  subtitle?: { mn?: string; en?: string };
  image?: string;
  link?: string;
  active?: boolean;
  order?: number;
  intervalSec?: number;
};

const empty = {
  titleMn: "",
  titleEn: "",
  subtitleMn: "",
  subtitleEn: "",
  image: "/banners/shoebox-project.png",
  link: "",
  active: true,
  order: 0,
  intervalSec: 8,
};

export default function BannersManager({
  banners,
  onRefresh,
}: {
  banners: BannerRow[];
  onRefresh: () => void;
}) {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (b: BannerRow) => {
    setEditingId(b._id);
    setShowForm(true);
    setForm({
      titleMn: b.title?.mn || "",
      titleEn: b.title?.en || "",
      subtitleMn: b.subtitle?.mn || "",
      subtitleEn: b.subtitle?.en || "",
      image: b.image || empty.image,
      link: b.link || "",
      active: b.active !== false,
      order: b.order ?? 0,
      intervalSec: b.intervalSec ?? 5,
    });
  };

  const save = async () => {
    if (!form.titleMn.trim()) {
      setError("Гарчиг (MN) оруулна уу.");
      return;
    }
    if (!form.image.trim()) {
      setError("Зураг оруулна уу.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const payload = {
        id: editingId,
        title: { mn: form.titleMn, en: form.titleEn || form.titleMn },
        subtitle: { mn: form.subtitleMn, en: form.subtitleEn || form.subtitleMn },
        image: form.image,
        link: form.link,
        active: form.active,
        order: form.order,
        intervalSec: form.intervalSec,
      };
      const res = await fetch("/api/admin/banners", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Хадгалахад алдаа");
      reset();
      onRefresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Алдаа");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Энэ баннерыг устгах уу?")) return;
    await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  const reorder = async (id: string, dir: -1 | 1) => {
    const sorted = [...banners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex((b) => b._id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const aOrder = a.order ?? idx;
    const bOrder = b.order ?? swapIdx;

    const toPayload = (row: BannerRow, order: number) => ({
      id: row._id,
      title: { mn: row.title?.mn || "", en: row.title?.en || "" },
      subtitle: { mn: row.subtitle?.mn || "", en: row.subtitle?.en || "" },
      image: row.image,
      link: row.link || "",
      active: row.active !== false,
      order,
      intervalSec: row.intervalSec ?? 5,
    });

    setBusy(true);
    try {
      await Promise.all([
        fetch("/api/admin/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(a, bOrder)),
        }),
        fetch("/api/admin/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(b, aOrder)),
        }),
      ]);
      onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const onImagePick = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { secureUrl } = await signedCloudinaryUpload({ file, folder: "APM/banners" });
      setForm((f) => ({ ...f, image: secureUrl }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Зураг байршуулахад алдаа");
    } finally {
      setUploading(false);
    }
  };

  const columns: Array<Column<BannerRow>> = [
    {
      key: "preview",
      header: "Зураг",
      render: (b) => (
        <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-[var(--fill2)]">
          {b.image && (
            <Image src={b.image} alt="" fill className="object-cover" sizes="96px" />
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Гарчиг",
      render: (b) => (
        <div>
          <div className="font-semibold">{b.title?.mn}</div>
          <div className="t-caption">{b.subtitle?.mn}</div>
        </div>
      ),
      sortValue: (b) => b.title?.mn || "",
    },
    {
      key: "order",
      header: "Дараалал",
      render: (b) => (
        <div className="flex items-center gap-1">
          <span className="badge" style={{ background: "var(--fill2)" }}>{b.order ?? 0}</span>
          <button type="button" className="press p-1" onClick={() => reorder(b._id, -1)} disabled={busy}>
            <ArrowUp size={14} />
          </button>
          <button type="button" className="press p-1" onClick={() => reorder(b._id, 1)} disabled={busy}>
            <ArrowDown size={14} />
          </button>
        </div>
      ),
    },
    {
      key: "active",
      header: "Идэвх",
      render: (b) => (
        <span
          className="badge"
          style={{
            background: b.active !== false ? "var(--emerald-dim)" : "var(--fill2)",
            color: b.active !== false ? "var(--emerald)" : "var(--label3)",
          }}
        >
          {b.active !== false ? "Идэвхтэй" : "Унтраасан"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (b) => (
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost btn-sm press" onClick={() => startEdit(b)}>
            Засах
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm press"
            style={{ color: "var(--red)" }}
            onClick={() => remove(b._id)}
          >
            Устгах
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="card p-5 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="t-title3">Баннер</div>
          <div className="t-caption">Нүүр хуудасны слайдер — олон зураг ээлжлэн харагдана</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm press"
            onClick={async () => {
              await fetch("/api/admin/banners", { method: "PATCH" });
              onRefresh();
            }}
          >
            Анхны өгөгдөл
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm press"
            onClick={() => {
              setEditingId(null);
              setForm({ ...empty, order: banners.length });
              setShowForm(true);
            }}
          >
            + Баннер нэмэх
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <div className="t-headline">{editingId ? "Баннер засах" : "Шинэ баннер"}</div>

          {form.image && (
            <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: "21/9" }}>
              <Image src={form.image} alt="preview" fill className="object-cover" sizes="800px" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ["titleMn", "Гарчиг MN", form.titleMn],
              ["titleEn", "Гарчиг EN", form.titleEn],
              ["subtitleMn", "Дэд гарчиг MN", form.subtitleMn],
              ["subtitleEn", "Дэд гарчиг EN", form.subtitleEn],
              ["link", "Холбоос (/events)", form.link],
              ["image", "Зураг URL", form.image],
            ].map(([k, label, val]) => (
              <label key={k} className="block">
                <span className="t-caption2 block mb-1">{label}</span>
                <input
                  className="input"
                  value={val as string}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}

            <label className="block">
              <span className="t-caption2 block mb-1">Дараалал</span>
              <input
                type="number"
                className="input"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </label>

            <label className="block">
              <span className="t-caption2 block mb-1">Солигдох хугацаа (сек)</span>
              <input
                type="number"
                min={5}
                max={30}
                className="input"
                value={form.intervalSec}
                onChange={(e) => setForm({ ...form, intervalSec: Number(e.target.value) })}
              />
            </label>

            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span className="t-subhead">Идэвхтэй (нүүр дээр харагдана)</span>
            </label>

            <label className="block md:col-span-2">
              <span className="t-caption2 block mb-1">Зураг байршуулах</span>
              <input
                type="file"
                accept="image/*"
                className="input"
                disabled={uploading}
                onChange={(e) => onImagePick(e.target.files?.[0] || null)}
              />
              {uploading && <p className="t-caption mt-1">Байршуулж байна…</p>}
            </label>
          </div>

          {error && <p className="t-footnote" style={{ color: "var(--red)" }}>{error}</p>}

          <div className="flex gap-2">
            <button type="button" className="btn btn-primary press" disabled={busy || uploading} onClick={save}>
              Хадгалах
            </button>
            <button type="button" className="btn btn-ghost press" onClick={reset}>
              Болих
            </button>
          </div>
        </div>
      )}

      <DataTable
        rows={[...banners].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))}
        columns={columns}
        getSearchText={(b) => `${b.title?.mn} ${b.title?.en} ${b.subtitle?.mn}`}
      />
    </div>
  );
}
