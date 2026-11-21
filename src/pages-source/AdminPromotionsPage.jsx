'use client';

import { useEffect, useState, useRef } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import { useAdminTheme } from "@/context/AdminThemeContext";
import {
  FaTrashAlt,
  FaPlus,
  FaFileExcel,
  FaFileUpload,
  FaFileDownload,
  FaSyncAlt,
  FaEdit,
} from "react-icons/fa";
import {
  adminGetPromotions,
  adminCreatePromotion,
  adminUpdatePromotion,
  adminDeletePromotion,
  getPromotions,
  adminLogout,
} from "../services/api";
import {
  parsePromotionsCSV,
  generatePromotionsSampleCSV,
  exportPromotionsToCSV,
  downloadCSV,
} from "@/utils/csvHelper";
import { colors } from "../theme";
import { notify } from "@/components/admin/AdminToast";
import { SkeletonTable } from "@/components/admin/AdminSkeleton";

const emptyForm = {
  id: "",
  title: "",
  category: "",
  description: "",
  image: "",
  imageUrls: [""],
  items: [{ product: "", quantity: 1, price: "" }],
  totalQuantity: 0,
  totalPrice: 0,
  originalPrice: "",
  discount: "",
  shippingCost: "",
  displayOrder: 0,
  isActive: true,
};

const AdminPromotionsPage = () => {
  const { isDark } = useAdminTheme();

  const inputCls = isDark
    ? "w-full px-3 py-2 border border-slate-700 rounded-lg text-sm bg-[#0B0F19] text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
    : "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-pink-500 transition-colors";

  const labelCls = isDark
    ? "block mb-1.5 font-semibold text-xs text-slate-300"
    : "block mb-1.5 font-semibold text-xs text-slate-700";

  const removeBtnCls = isDark
    ? "px-3 py-1.5 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-950/40 text-xs font-semibold cursor-pointer transition-colors"
    : "px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 bg-white text-xs font-semibold cursor-pointer transition-colors";

  const addSubBtnCls = isDark
    ? "px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold cursor-pointer transition-colors"
    : "px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer shadow-2xs transition-colors";

  const [showForm, setShowForm] = useState(false);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [promotionImages, setPromotionImages] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setShowForm(false);
          setEditingId(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showForm]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      let data = await adminGetPromotions();
      if (!Array.isArray(data) || data.length === 0) {
        const publicData = await getPromotions();
        if (Array.isArray(publicData) && publicData.length > 0) {
          data = publicData;
        }
      }
      setPromos(Array.isArray(data) ? data : []);
    } catch (err) {
      try {
        const publicData = await getPromotions();
        if (Array.isArray(publicData) && publicData.length > 0) {
          setPromos(publicData);
          setError("");
          return;
        }
      } catch {
        // ignore fallback error
      }
      setError(err.message || "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOfficialPackages = async () => {
    try {
      setSyncing(true);
      setError("");
      const data = await adminGetPromotions();
      setPromos(Array.isArray(data) ? data : []);
    } catch (err) {
      await load();
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateItem = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.items];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, items: next };
    });
  };
  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product: "", quantity: 1, price: "" }],
    }));
  const removeItem = (index) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

  const updateImageUrl = (index, value) => {
    setForm((prev) => {
      const next = [...prev.imageUrls];
      next[index] = value;
      return { ...prev, imageUrls: next };
    });
  };
  const addImageUrl = () =>
    setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  const removeImageUrl = (index) =>
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const cleanedItems = form.items
      .map((item) => ({
        product: String(item.product || "").trim(),
        quantity: Number(item.quantity) || 0,
        price: item.price === "" || item.price == null ? 0 : Number(item.price),
      }))
      .filter((item) => item.product);

    const totalQuantity = cleanedItems.reduce(
      (sum, i) => sum + (Number(i.quantity) || 0),
      0,
    );
    const totalPrice = cleanedItems.reduce(
      (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0),
      0,
    );

    const payload = {
      id: form.id,
      title: form.title,
      category: form.category,
      description: form.description,
      image: form.image,
      images: form.imageUrls.map((u) => u.trim()).filter(Boolean),
      items: cleanedItems,
      totalQuantity,
      totalPrice,
      originalPrice: form.originalPrice === "" || form.originalPrice == null ? null : Number(form.originalPrice),
      discount: form.discount === "" || form.discount == null ? null : Number(form.discount),
      shippingCost: form.shippingCost === "" || form.shippingCost == null ? null : Number(form.shippingCost),
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
      promotionImages,
    };
    try {
      if (editingId) {
        const res = await adminUpdatePromotion(editingId, payload);
        const updated = res || payload;
        setPromos((prev) =>
          prev.map((p) =>
            p.id === editingId ? { ...p, ...payload, ...updated } : p
          )
        );
      } else {
        const created = await adminCreatePromotion(payload);
        setPromos((prev) => [created || payload, ...prev]);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      setPromotionImages([]);
      notify.success(`"${payload.title}" saved. The website is updated.`);
    } catch (err) {
      setError(err.message || "Failed to save promotion");
      notify.error(err.message || "Could not save the package. Please check the form.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setShowForm(true);
    setForm({
      id: p.id || "",
      title: p.title || "",
      category: p.category || "",
      description: p.description || "",
      image: p.image || "",
      imageUrls: p.images?.length ? p.images : [""],
      items: p.items?.length
        ? p.items
        : [{ product: "", quantity: 1, price: "" }],
      totalQuantity: p.totalQuantity ?? 0,
      totalPrice: p.totalPrice ?? 0,
      originalPrice: p.originalPrice ?? "",
      discount: p.discount ?? "",
      shippingCost: p.shippingCost ?? "",
      displayOrder: p.displayOrder ?? 0,
      isActive: p.isActive ?? true,
    });
    setPromotionImages([]);
  };

  const handleToggleActive = async (p) => {
    const updated = { ...p, isActive: !p.isActive };
    setPromos((prev) =>
      prev.map((item) => (item.id === p.id ? updated : item))
    );
    try {
      await adminUpdatePromotion(p.id, { isActive: updated.isActive });
      notify.success(updated.isActive ? `"${p.title}" is now visible on the website.` : `"${p.title}" is now hidden from the website.`);
    } catch (err) {
      setPromos((prev) => prev.map((item) => (item.id === p.id ? p : item))); // undo
      notify.error(err.message || "Could not change visibility.");
    }
  };

  const handleDelete = async (id) => {
    const name = promos.find((p) => p.id === id)?.title || id;
    if (!window.confirm(`Delete the package "${name}"?

This cannot be undone.`)) return;
    try {
      setSaving(true);
      await adminDeletePromotion(id);
      setPromos((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) {
        setShowForm(false);
        setEditingId(null);
      }
      notify.success(`"${name}" deleted.`);
    } catch (err) {
      setError(err.message || "Failed to delete promotion");
      notify.error(err.message || "Could not delete the package.");
    } finally {
      setSaving(false);
    }
  };

  const fileInputRef = useRef(null);

  const handleDownloadSampleTemplate = () => {
    const csvContent = generatePromotionsSampleCSV(promos);
    downloadCSV("kite-promotions-sample-template.csv", csvContent);
  };

  const handleExportPromotions = () => {
    const csvContent = exportPromotionsToCSV(promos);
    downloadCSV(
      `kite-promotions-export-${new Date().toISOString().slice(0, 10)}.csv`,
      csvContent
    );
  };

  const handleImportCsvFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result;
        if (!text) return;
        const { changed, summary, problems } = parsePromotionsCSV(text, promos);
        if (problems.length) {
          notify.error(`Please fix the file first: ${problems.slice(0, 3).join(" | ")}`);
          return;
        }
        if (!changed.length) {
          notify.success("Nothing to change: the file matches the packages already on the website.");
          return;
        }
        const confirmImport = window.confirm(
          `This file will update:\n\n${summary.join("\n")}\n\nSave these changes to the website now?`
        );
        if (!confirmImport) return;

        setSaving(true);
        for (const promo of changed) {
          await adminUpdatePromotion(promo.id, promo);
        }
        await load();
        notify.success(`Import finished: ${changed.length} package(s) updated. The website is updated.`);
      } catch (err) {
        notify.error("Import failed: " + (err.message || "Invalid file format"));
      } finally {
        setSaving(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <RequireAdminAuth>
      <AdminLayout>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-black ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Promotions &amp; Packages
              </h1>
              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Create, update, and delete promotions with easy item and image fields.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleImportCsvFile}
              />
              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs"
                }`}
                title="Download standard Excel/CSV template to fill out with promotions data"
              >
                <FaFileExcel className="text-emerald-500 text-sm" />
                <span>Sample Excel Doc</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700 text-pink-400 hover:bg-slate-700"
                    : "bg-white border-slate-300 text-pink-700 hover:bg-pink-50 shadow-2xs"
                }`}
                title="Import promotions from Excel/CSV file"
              >
                <FaFileUpload className="text-pink-500 text-sm" />
                <span>Import Excel/CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportPromotions}
                className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs"
                }`}
                title="Export all promotions to CSV file"
              >
                <FaFileDownload className="text-slate-400 text-sm" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleSyncOfficialPackages}
                disabled={syncing || loading}
                className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? "bg-[#161D2E] border-[#1E293B] text-sky-400 hover:bg-[#1E293B]"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
                }`}
                title="Restore and synchronize the 9 official rate-sheet packages"
              >
                <span className={syncing ? "animate-spin" : ""}>↻</span>
                <span>{syncing ? "Syncing..." : "Re-Sync Official Packages"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (showForm && !editingId) {
                    setShowForm(false);
                  } else {
                    setEditingId(null);
                    setForm(emptyForm);
                    setShowForm(true);
                  }
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-md shadow-pink-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <FaPlus className="text-xs" />
                <span>+ Add New Promotion</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold flex items-center justify-between">
              <div>
                <span>{error}</span>
                {String(error).toLowerCase().includes("unauthorized") && (
                  <p className="text-xs text-red-400 mt-1 font-normal">
                    Your admin session expired. Click &quot;Re-Login&quot; to refresh your session.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {String(error).toLowerCase().includes("unauthorized") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        adminLogout().finally(() => { window.location.href = '/admin/login'; });
                      }
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer"
                  >
                    Re-Login
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSyncOfficialPackages}
                  className="underline text-xs ml-2 cursor-pointer hover:text-red-600"
                >
                  Retry &amp; Sync
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className={`px-3 py-1.5 rounded-lg border ${
              isDark ? "bg-[#111726] border-[#1E293B] text-slate-300" : "bg-white border-slate-200 text-slate-700"
            }`}>
              Total Packages: <span className="text-sky-500 font-black">{promos.length}</span>
            </span>
            <span className={`px-3 py-1.5 rounded-lg border ${
              isDark ? "bg-[#111726] border-[#1E293B] text-slate-300" : "bg-white border-slate-200 text-slate-700"
            }`}>
              Free Delivery Bundles: <span className="text-emerald-500 font-black">{promos.filter(p => p.shippingCost === 0).length}</span>
            </span>
            <span className={`px-3 py-1.5 rounded-lg border ${
              isDark ? "bg-[#111726] border-[#1E293B] text-slate-300" : "bg-white border-slate-200 text-slate-700"
            }`}>
              Standard Rs. 200 Delivery: <span className="text-amber-500 font-black">{promos.filter(p => p.shippingCost !== 0).length}</span>
            </span>
          </div>

          {loading ? (
            <SkeletonTable rows={5} label="Loading packages" />
          ) : (
            <div className={`border rounded-2xl p-5 md:p-6 transition-colors shadow-sm ${
              isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                      isDark ? "border-[#1E293B] text-slate-300" : "border-slate-200 text-slate-700"
                    }`}>
                      <th className="text-left py-3 pr-3">Image</th>
                      <th className="text-left py-3 pr-4">Promotion</th>
                      <th className="text-left py-3 pr-4">Category</th>
                      <th className="text-left py-3 pr-4">Items / Qty</th>
                      <th className="text-left py-3 pr-4">Pricing &amp; Discount</th>
                      <th className="text-left py-3 pr-4">Shipping</th>
                      <th className="text-center py-3 px-3">Status</th>
                      <th className="text-right py-3 pl-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? "divide-y divide-[#1E293B]/60 text-slate-200" : "divide-y divide-slate-100 text-slate-800"}>
                    {promos.map((p) => {
                      const saveAmount = p.discount != null ? p.discount : (p.originalPrice && p.totalPrice ? p.originalPrice - p.totalPrice : null);
                      return (
                        <tr key={p.id} className={`transition-colors ${isDark ? "hover:bg-[#161D2E]" : "hover:bg-slate-50"}`}>
                          <td className="py-3 pr-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                              {p.image ? (
                                <img src={p.id === 'pkg-kite-smart-starter' ? '/packages-image/kite-smart-starter-v3.jpeg' : p.image?.src || p.image} alt={p.title} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] text-gray-400">No Img</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-sm leading-snug">{p.title}</p>
                            <span className={`font-mono text-xs ${isDark ? "text-sky-400" : "text-sky-600"}`}>{p.id}</span>
                          </td>
                          <td className="py-3 pr-4">{p.category}</td>
                          <td className="py-3 pr-4">
                            <p className="font-medium">{p.totalQuantity ?? "-"} pcs</p>
                            <p className="text-xs text-gray-500">({p.items?.length || 0} unique items)</p>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-col gap-0.5">
                              {p.originalPrice && (
                                <span className="line-through text-xs text-gray-400 font-medium">Rs. {p.originalPrice}</span>
                              )}
                              <span className="font-bold text-sm text-[#00AEEF]">
                                {p.totalPrice != null ? `Rs. ${p.totalPrice}` : "-"}
                              </span>
                              {saveAmount != null && saveAmount > 0 && (
                                <span className="text-[11px] font-bold text-emerald-600">Save Rs. {saveAmount}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-xs">
                            {p.shippingCost === 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">Free</span>
                            ) : p.shippingCost != null ? (
                              `Rs. ${p.shippingCost}`
                            ) : (
                              <span className="text-gray-400">Default</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(p)}
                              title={p.isActive ? "Click to Deactivate" : "Click to Activate"}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                p.isActive
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-600 animate-pulse" : "bg-gray-400"}`}></span>
                              <span>{p.isActive ? "Active" : "Inactive"}</span>
                            </button>
                          </td>
                          <td className="py-3 pl-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleEdit(p)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                isDark
                                  ? "border-[#1E293B] bg-[#161D2E] text-sky-400 hover:bg-[#1E293B]"
                                  : "border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {promos.length === 0 && (
                      <tr>
                        <td
                          className={`py-8 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                          colSpan={8}
                        >
                          No promotions yet. Click &quot;+ Add New Promotion&quot; above to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {promos.map((p) => {
                  const saveAmount = p.discount != null ? p.discount : (p.originalPrice && p.totalPrice ? p.originalPrice - p.totalPrice : null);
                  return (
                    <div
                      key={p.id}
                      className={`border rounded-xl p-4 ${
                        isDark ? "border-[#1E293B] bg-[#161D2E]" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-slate-200 flex-shrink-0">
                          {p.image ? (
                            <img src={p.id === 'pkg-kite-smart-starter' ? '/packages-image/kite-smart-starter-v3.jpeg' : p.image?.src || p.image} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-gray-400 p-2 block">No Img</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{p.title}</p>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(p)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.isActive
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-gray-200 text-gray-600 border border-gray-300"
                              }`}
                            >
                              {p.isActive ? "Active" : "Inactive"}
                            </button>
                          </div>
                          <span className={`text-xs font-mono block ${isDark ? "text-sky-400" : "text-sky-600"}`}>
                            {p.id} • {p.category || "-"}
                          </span>
                        </div>
                      </div>

                      <div className={`mt-3 text-xs space-y-1 pt-3 border-t ${isDark ? "border-[#1E293B] text-slate-400" : "border-slate-200 text-slate-600"}`}>
                        <div className="flex justify-between">
                          <span>Items &amp; Quantity:</span>
                          <span className="font-semibold">{p.totalQuantity ?? "-"} pcs ({p.items?.length || 0} items)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-bold text-[#00AEEF]">
                            {p.originalPrice && <span className="line-through text-gray-400 text-xs font-normal mr-1.5">Rs. {p.originalPrice}</span>}
                            Rs. {p.totalPrice != null ? p.totalPrice : "-"}
                            {saveAmount != null && saveAmount > 0 && <span className="text-emerald-600 text-[11px] ml-1.5">(Save Rs. {saveAmount})</span>}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span className="font-semibold">
                            {p.shippingCost === 0 ? "FREE" : p.shippingCost != null ? `Rs. ${p.shippingCost}` : "Default"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200">
                        <button
                          onClick={() => handleEdit(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                            isDark ? "border-[#1E293B] bg-[#161D2E] text-sky-400" : "border-slate-200 text-slate-700"
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
                {promos.length === 0 && (
                  <p className={`text-center text-sm py-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    No promotions yet. Click &quot;+ Add New Promotion&quot; above to add one.
                  </p>
                )}
              </div>
            </div>
          )}

          {showForm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs animate-fade-in"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowForm(false);
                  setEditingId(null);
                }
              }}
            >
              <div
                className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
                  isDark
                    ? "bg-[#111726] border-slate-800 text-slate-100"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  className={`sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b ${
                    isDark
                      ? "bg-[#111726]/95 backdrop-blur-sm border-slate-800"
                      : "bg-white/95 backdrop-blur-sm border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                    <div>
                      <h2 className={`text-lg sm:text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {editingId ? "Edit Promotion Details" : "Add New Promotion"}
                      </h2>
                      <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {editingId ? `Updating promotion: ${form.title || form.id}` : "Configure bundle package, items, and pricing"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isDark
                        ? "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80"
                        : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    title="Close (Esc)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form wrapper */}
                <form
                  onSubmit={handleSubmit}
                  className="flex-1 flex flex-col min-h-0"
                >
                  {/* Scrollable Form Body */}
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                    {error && (
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold flex items-center justify-between">
                        <span>{error}</span>
                        {String(error).toLowerCase().includes("unauthorized") && (
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                adminLogout().finally(() => { window.location.href = '/admin/login'; });
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer ml-3"
                          >
                            Re-Login
                          </button>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                      <div>
                        <label className={labelCls}>ID (slug)</label>
                        <input
                          name="id"
                          value={form.id}
                          onChange={handleChange}
                          required
                          disabled={!!editingId}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Title</label>
                        <input
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Category</label>
                        <input
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>
                          Description (optional)
                        </label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows={3}
                          className={inputCls}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>
                          Primary Image URL (optional)
                        </label>
                        <input
                          name="image"
                          value={form.image}
                          onChange={handleChange}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Upload Promotion Image(s)
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) =>
                            setPromotionImages(Array.from(e.target.files || []))
                          }
                          className={inputCls}
                        />
                        <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          Upload one or many. First image is used as primary.
                        </p>
                      </div>
                      <div>
                        <label className={labelCls}>Original / MRP Price (Rs)</label>
                        <input
                          name="originalPrice"
                          type="number"
                          min="0"
                          placeholder="e.g. 470"
                          value={form.originalPrice}
                          onChange={handleChange}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Discount / Save Amount (Rs)</label>
                        <input
                          name="discount"
                          type="number"
                          min="0"
                          placeholder="e.g. 70"
                          value={form.discount}
                          onChange={handleChange}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Shipping Cost (Rs)</label>
                        <input
                          name="shippingCost"
                          type="number"
                          min="0"
                          placeholder="Leave empty for default"
                          value={form.shippingCost}
                          onChange={handleChange}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Display Order
                        </label>
                        <input
                          name="displayOrder"
                          value={form.displayOrder}
                          onChange={handleChange}
                          type="number"
                          min="0"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={`inline-flex items-center gap-2 mt-8 font-semibold text-xs cursor-pointer ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                            className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                          />
                          Active
                        </label>
                      </div>

                      <div className="md:col-span-3">
                        <label className={labelCls}>
                          Extra Image URLs
                        </label>
                        <div className="space-y-2">
                          {form.imageUrls.map((url, idx) => (
                            <div key={`u-${idx}`} className="flex gap-2">
                              <input
                                value={url}
                                onChange={(e) => updateImageUrl(idx, e.target.value)}
                                placeholder="https://..."
                                className={`flex-1 ${inputCls}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeImageUrl(idx)}
                                className={removeBtnCls}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addImageUrl}
                            className={addSubBtnCls}
                          >
                            + Add URL
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <label className={labelCls}>
                          Promotion Items
                        </label>
                        <div className="space-y-2">
                          {form.items.map((item, idx) => (
                            <div
                              key={`i-${idx}`}
                              className="grid grid-cols-1 md:grid-cols-4 gap-2"
                            >
                              <input
                                value={item.product}
                                onChange={(e) =>
                                  updateItem(idx, "product", e.target.value)
                                }
                                placeholder="Product name"
                                className={`px-3 py-2 rounded-lg text-sm ${inputCls}`}
                              />
                              <input
                                value={item.quantity}
                                type="number"
                                min="1"
                                onChange={(e) =>
                                  updateItem(idx, "quantity", e.target.value)
                                }
                                placeholder="Quantity"
                                className={`px-3 py-2 rounded-lg text-sm ${inputCls}`}
                              />
                              <input
                                value={item.price}
                                type="number"
                                min="0"
                                step="0.01"
                                onChange={(e) =>
                                  updateItem(idx, "price", e.target.value)
                                }
                                placeholder="Price"
                                className={`px-3 py-2 rounded-lg text-sm ${inputCls}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className={removeBtnCls}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addItem}
                            className={addSubBtnCls}
                          >
                            + Add Item
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div
                    className={`sticky bottom-0 z-20 flex items-center justify-between gap-3 px-6 py-3.5 border-t ${
                      isDark
                        ? "bg-[#111726]/95 backdrop-blur-sm border-slate-800"
                        : "bg-slate-50/95 backdrop-blur-sm border-slate-200"
                    }`}
                  >
                    <div>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(editingId)}
                          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 bg-white dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-400 cursor-pointer transition-all flex items-center gap-1.5"
                          title="Delete this entire promotion package"
                        >
                          <FaTrashAlt className="text-xs" />
                          <span>Delete Promotion</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setForm(emptyForm);
                          setPromotionImages([]);
                          setShowForm(false);
                        }}
                        className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                          isDark
                            ? "border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-2xs"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md shadow-pink-500/25 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                      >
                        {saving && <span className="animate-spin">↻</span>}
                        <span>
                          {saving
                            ? "Saving..."
                            : editingId
                              ? "Update Promotion"
                              : "Create Promotion"}
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </RequireAdminAuth>
  );
};

export default AdminPromotionsPage;
