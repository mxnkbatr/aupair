"use client";

import React, { useState } from "react";
import DataTable, { Column } from "./DataTable";
import type { ProgramQuestion, ProgramQuestionType } from "@/lib/programQuestions";
import { newQuestionId, sortQuestions } from "@/lib/programQuestions";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

type Program = {
  _id: string;
  code: string;
  slug: string;
  emoji: string;
  color?: string;
  gradFrom?: string;
  gradTo?: string;
  name?: { mn?: string; en?: string };
  description?: { mn?: string; en?: string };
  duration?: string;
  location?: string;
  slots?: number;
  active?: boolean;
  order?: number;
  applicationQuestions?: ProgramQuestion[];
};

const QUESTION_TYPES: { value: ProgramQuestionType; label: string }[] = [
  { value: "text", label: "Текст" },
  { value: "textarea", label: "Урт текст" },
  { value: "number", label: "Тоо" },
  { value: "select", label: "Сонголт" },
  { value: "email", label: "Имэйл" },
  { value: "phone", label: "Утас" },
];

const emptyForm = {
  code: "",
  slug: "",
  emoji: "🌍",
  color: "#C41E3A",
  gradFrom: "#C41E3A",
  gradTo: "#3b82f6",
  nameMn: "",
  nameEn: "",
  descMn: "",
  descEn: "",
  href: "",
  duration: "",
  location: "",
  slots: 10,
  order: 0,
  active: true,
  applicationQuestions: [] as ProgramQuestion[],
};

export default function ProgramsManager({
  programs,
  onRefresh,
}: {
  programs: Program[];
  onRefresh: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (p: Program) => {
    setEditingId(p._id);
    setShowForm(true);
    setForm({
      code: p.code,
      slug: p.slug,
      emoji: p.emoji || "🌍",
      color: p.color || "#C41E3A",
      gradFrom: p.gradFrom || "#C41E3A",
      gradTo: p.gradTo || "#3b82f6",
      nameMn: p.name?.mn || "",
      nameEn: p.name?.en || "",
      descMn: p.description?.mn || "",
      descEn: p.description?.en || "",
      href: `/programs/${p.slug}`,
      duration: p.duration || "",
      location: p.location || "",
      slots: p.slots || 10,
      order: p.order || 0,
      active: p.active !== false,
      applicationQuestions: sortQuestions(p.applicationQuestions || []),
    });
  };

  const updateQuestion = (index: number, patch: Partial<ProgramQuestion>) => {
    setForm((prev) => {
      const next = [...prev.applicationQuestions];
      next[index] = { ...next[index], ...patch };
      return { ...prev, applicationQuestions: next };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      applicationQuestions: [
        ...prev.applicationQuestions,
        {
          id: newQuestionId(),
          label: { mn: "Шинэ асуулт", en: "" },
          type: "text",
          required: false,
          options: [],
          order: prev.applicationQuestions.length,
        },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      applicationQuestions: prev.applicationQuestions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i })),
    }));
  };

  const moveQuestion = (index: number, dir: -1 | 1) => {
    setForm((prev) => {
      const list = [...prev.applicationQuestions];
      const target = index + dir;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return {
        ...prev,
        applicationQuestions: list.map((q, i) => ({ ...q, order: i })),
      };
    });
  };

  const save = async () => {
    if (!form.code.trim()) return alert("Code шаардлагатай");
    setBusy(true);
    try {
      const payload = {
        id: editingId,
        code: form.code.toUpperCase(),
        slug: form.slug || form.code.toLowerCase(),
        emoji: form.emoji,
        color: form.color,
        gradFrom: form.gradFrom,
        gradTo: form.gradTo,
        name: { mn: form.nameMn, en: form.nameEn },
        description: { mn: form.descMn, en: form.descEn },
        href: form.href || `/programs/${form.slug || form.code.toLowerCase()}`,
        duration: form.duration,
        location: form.location,
        slots: form.slots,
        order: form.order,
        active: form.active,
        applicationQuestions: sortQuestions(form.applicationQuestions).map((q, i) => ({
          ...q,
          order: i,
          options: q.type === "select" ? (q.options || []).filter(Boolean) : [],
        })),
      };
      const res = await fetch("/api/admin/programs", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      reset();
      onRefresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Алдаа");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Энэ хөтөлбөрийг устгах уу?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/programs?id=${id}`, { method: "DELETE" });
      onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (p: Program) => {
    setBusy(true);
    try {
      await fetch("/api/admin/programs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p._id, active: !p.active }),
      });
      onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const columns: Array<Column<Program>> = [
    {
      key: "code",
      header: "Хөтөлбөр",
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{p.emoji}</span>
          <div>
            <div className="font-bold">{p.name?.mn || p.code}</div>
            <div className="text-xs" style={{ color: "var(--label3)" }}>{p.code}</div>
          </div>
        </div>
      ),
      sortValue: (p) => p.code,
    },
    {
      key: "questions",
      header: "Асуулт",
      render: (p) => <span>{p.applicationQuestions?.length ?? 0}</span>,
      sortValue: (p) => p.applicationQuestions?.length || 0,
    },
    {
      key: "slots",
      header: "Байр",
      render: (p) => <span>{p.slots ?? "—"}</span>,
      sortValue: (p) => p.slots || 0,
    },
    {
      key: "active",
      header: "Төлөв",
      render: (p) => (
        <button
          type="button"
          onClick={() => toggleActive(p)}
          className="badge press"
          style={{
            background: p.active ? "var(--emerald-dim)" : "var(--red-dim)",
            color: p.active ? "var(--emerald)" : "var(--red)",
          }}
        >
          {p.active ? "Идэвхтэй" : "Идэвхгүй"}
        </button>
      ),
      sortValue: (p) => (p.active ? 1 : 0),
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost btn-sm press" onClick={() => startEdit(p)}>
            Засах
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm press"
            style={{ color: "var(--red)" }}
            onClick={() => remove(p._id)}
          >
            Устгах
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="card p-5 flex items-center justify-between gap-3">
        <div>
          <div className="t-title3">Хөтөлбөрүүд</div>
          <div className="t-caption">Хөтөлбөр нээх, засах, бүртгэлийн асуулт тохируулах</div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm press"
          onClick={() => {
            reset();
            setShowForm(true);
          }}
        >
          + Нэмэх
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <div className="t-headline">{editingId ? "Хөтөлбөр засах" : "Шинэ хөтөлбөр"}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ["code", "Код (EDU)", form.code, (v: string) => setForm({ ...form, code: v })],
              ["slug", "Slug", form.slug, (v: string) => setForm({ ...form, slug: v })],
              ["emoji", "Emoji", form.emoji, (v: string) => setForm({ ...form, emoji: v })],
              ["nameMn", "Нэр (MN)", form.nameMn, (v: string) => setForm({ ...form, nameMn: v })],
              ["nameEn", "Нэр (EN)", form.nameEn, (v: string) => setForm({ ...form, nameEn: v })],
              ["descMn", "Тайлбар (MN)", form.descMn, (v: string) => setForm({ ...form, descMn: v })],
              ["duration", "Хугацаа", form.duration, (v: string) => setForm({ ...form, duration: v })],
              ["location", "Байршил", form.location, (v: string) => setForm({ ...form, location: v })],
              ["slots", "Байр (тоо)", String(form.slots), (v: string) => setForm({ ...form, slots: Number(v) || 0 })],
            ].map((row) => {
              const [key, label, val, onChange] = row as [string, string, string, (v: string) => void];
              return (
              <label key={key} className="block">
                <span className="t-caption2 block mb-1">{label}</span>
                <input
                  className="input"
                  value={val}
                  onChange={(e) => onChange(e.target.value)}
                />
              </label>
            );
            })}
          </div>

          <div className="border-t pt-4" style={{ borderColor: "var(--sep)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="t-headline">Бүртгэлийн асуултууд</div>
                <div className="t-caption">Хэрэглэгч хөтөлбөрт бүртгүүлэхэд асуух асуултууд</div>
              </div>
              <button type="button" className="btn btn-secondary btn-sm press" onClick={addQuestion}>
                <Plus size={14} /> Асуулт нэмэх
              </button>
            </div>

            {form.applicationQuestions.length === 0 ? (
              <p className="t-caption p-4 rounded-xl text-center" style={{ background: "var(--fill2)" }}>
                Асуулт байхгүй. «Асуулт нэмэх» дарж эхлээрэй.
              </p>
            ) : (
              <div className="space-y-3">
                {form.applicationQuestions.map((q, index) => (
                  <div key={q.id} className="p-4 rounded-xl space-y-3" style={{ background: "var(--fill3)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="t-caption font-bold">#{index + 1}</span>
                      <div className="flex gap-1">
                        <button type="button" className="btn btn-ghost btn-sm press" onClick={() => moveQuestion(index, -1)}>
                          <ChevronUp size={14} />
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm press" onClick={() => moveQuestion(index, 1)}>
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm press"
                          style={{ color: "var(--red)" }}
                          onClick={() => removeQuestion(index)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="block">
                        <span className="t-caption2 block mb-1">Асуулт (MN)</span>
                        <input
                          className="input"
                          value={q.label.mn}
                          onChange={(e) =>
                            updateQuestion(index, { label: { ...q.label, mn: e.target.value } })
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="t-caption2 block mb-1">Төрөл</span>
                        <select
                          className="input"
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(index, { type: e.target.value as ProgramQuestionType })
                          }
                        >
                          {QUESTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {q.type === "select" && (
                      <label className="block">
                        <span className="t-caption2 block mb-1">Сонголтууд (таслалаар)</span>
                        <input
                          className="input"
                          value={(q.options || []).join(", ")}
                          onChange={(e) =>
                            updateQuestion(index, {
                              options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          placeholder="A1, A2, B1, B2"
                        />
                      </label>
                    )}

                    <label className="flex items-center gap-2 t-caption">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                      />
                      Заавал бөглөх
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" className="btn btn-primary press" disabled={busy} onClick={save}>
              {busy ? "..." : "Хадгалах"}
            </button>
            <button type="button" className="btn btn-ghost press" onClick={reset}>
              Болих
            </button>
          </div>
        </div>
      )}

      <DataTable rows={programs} columns={columns} getSearchText={(p) => `${p.code} ${p.name?.mn} ${p.name?.en}`} />
    </div>
  );
}
