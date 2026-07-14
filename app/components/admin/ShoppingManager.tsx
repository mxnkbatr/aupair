"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, CheckCircle2, XCircle, Search, Package, Image as ImageIcon, Loader2
} from "lucide-react";
import Image from "next/image";
import { signedCloudinaryUpload } from "@/app/components/admin/upload";

export default function ShoppingManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/shopping");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetch(`/api/admin/shopping?id=${id}`, { method: "DELETE" });
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package size={24} className="text-[#C41E3A]" /> Shopping Market
          </h2>
          <p className="text-sm font-bold text-slate-400 mt-1">Manage your shop items, inventory, and categories</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#C41E3A] transition-all shadow-md active:scale-95"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-4">Product details</th>
              <th className="px-8 py-4">Price</th>
              <th className="px-8 py-4">Stock</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold italic">No items found in the market.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0">
                          <Image src={item.image} alt={item.name?.en || "Product"} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 shrink-0 border border-slate-200">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-slate-900 line-clamp-1">{item.name?.en || item.name?.mn}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-0.5">{item.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-emerald-600">{item.price}₮</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${item.stock > 0 ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-600"}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {item.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 bg-white border border-slate-200 rounded-lg text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 bg-white border border-slate-200 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ShoppingItemModal
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => { setIsModalOpen(false); fetchItems(); }}
        />
      )}
    </div>
  );
}

function ShoppingItemModal({ item, onClose, onSaved }: { item: any, onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({
    nameEn: item?.name?.en || "",
    nameMn: item?.name?.mn || "",
    nameDe: item?.name?.de || "",
    descEn: item?.description?.en || "",
    descMn: item?.description?.mn || "",
    descDe: item?.description?.de || "",
    price: item?.price || "",
    category: item?.category || "general",
    stock: item?.stock || 0,
    isActive: item ? item.isActive : true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState(item?.image || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payLoad = {
        ...(item && { id: item._id }),
        name: { en: formData.nameEn, mn: formData.nameMn, de: formData.nameDe },
        description: { en: formData.descEn, mn: formData.descMn, de: formData.descDe },
        price: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        isActive: formData.isActive,
        image: currentImage
      };

      if (imageFile) {
        const uploaded = await signedCloudinaryUpload({
          file: imageFile,
          folder: "APM/admin/shop",
          resourceType: "image",
        });
        payLoad.image = uploaded.secureUrl;
      }

      const method = item ? "PUT" : "POST";
      const res = await fetch("/api/admin/shopping", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payLoad)
      });
      
      if (res.ok) onSaved();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#FAFAFA]">
          <h3 className="text-xl font-black text-slate-900">
            {item ? "Edit Product" : "Add New Product"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <form id="shopping-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#C41E3A]">Name (EN)</label>
                <input required value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold focus:ring-[#C41E3A]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Name (MN)</label>
                <input required value={formData.nameMn} onChange={e => setFormData({...formData, nameMn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold focus:ring-blue-600" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Name (DE)</label>
                <input required value={formData.nameDe} onChange={e => setFormData({...formData, nameDe: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold focus:ring-amber-600" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (EN)</label>
                <textarea rows={3} value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (MN)</label>
                <textarea rows={3} value={formData.descMn} onChange={e => setFormData({...formData, descMn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (DE)</label>
                <textarea rows={3} value={formData.descDe} onChange={e => setFormData({...formData, descDe: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (₮)</label>
                <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-black text-emerald-600" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</label>
                <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold">
                  <option value="general">General</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div className="flex gap-6 items-center pt-4 border-t border-slate-100">
              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Product Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-xs" />
                {currentImage && !imageFile && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 max-w-[200px] truncate">Current: {currentImage}</p>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 items-center border border-slate-200">
                <input id="isActive" type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                <label htmlFor="isActive" className="text-xs font-black uppercase tracking-widest text-slate-700 cursor-pointer">Active in Store</label>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-[#FAFAFA] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 font-black uppercase tracking-widest text-xs text-slate-500 hover:text-slate-900 transition-colors">
            Cancel
          </button>
          <button form="shopping-form" type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-[#C41E3A] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {item ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
