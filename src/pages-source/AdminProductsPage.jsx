'use client';

import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import { useAdminTheme } from "@/context/AdminThemeContext";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "../services/api";
import { colors } from "../theme";

const emptyForm = {
  id: "",
  title: "",
  category: "",
  productType: "matches",
  navGroup: "Safety Matches",
  iconType: "fire",
  description: "",
  image: "",
  color: colors.primary.main,
  tagline: "",
  services: "",
  shippingCost: "",
  displayOrder: 0,
  carouselOrder: 0,
  isActive: true,
  showOnLanding: true,
  showInProductsPage: true,
  showInNavbar: true,
  features: [""],
  brands: [],
  variants: [{ name: "", detail: "", packing: "", price: "" }],
  variantImages: [{ name: "", image: "" }],
  facilities: [{ name: "", location: "", note: "" }],
  imageUrls: [""],
};

function sanitizeStringList(list = []) {
  return (list || []).map((s) => String(s).trim()).filter(Boolean);
}

function sanitizeVariants(list = []) {
  return (list || [])
    .map((v) => ({
      name: String(v.name || "").trim(),
      detail: String(v.detail || "").trim(),
      packing: String(v.packing || "").trim(),
      price: v.price === "" || v.price == null ? null : Number(v.price),
    }))
    .filter((v) => v.name || v.detail || v.packing || v.price != null);
}

function sanitizeBrands(list = []) {
  return (list || []).map(b => ({
    name: String(b.name || "").trim(),
    category: String(b.category || "").trim(),
    description: String(b.description || "").trim(),
    image: String(b.image || "").trim(),
    tagline: String(b.tagline || "").trim(),
    features: sanitizeStringList(b.features),
    variants: sanitizeVariants(b.variants),
  })).filter(b => b.name || b.category);
}

function sanitizeFacilities(list = []) {
  return (list || [])
    .map((f) => ({
      name: String(f.name || "").trim(),
      location: String(f.location || "").trim(),
      note: String(f.note || "").trim(),
    }))
    .filter((f) => f.name || f.location || f.note);
}

function normalizeVariantImages(list = []) {
  return (list || []).map((item) => ({
    name: String(item?.name || "").trim(),
    image: String(item?.image || "").trim(),
  }));
}

const AdminProductsPage = () => {
  const { isDark } = useAdminTheme();
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [variantImageFiles, setVariantImageFiles] = useState({});
  const [brandImageFiles, setBrandImageFiles] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminGetProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setForm((prev) => {
      const variantNames = (prev.variants || [])
        .map((variant) => String(variant?.name || "").trim())
        .filter(Boolean);
      if (!variantNames.length) return prev;

      const nextVariantImages = [...(prev.variantImages || [])];
      let changed = false;

      variantNames.forEach((name, index) => {
        const current = nextVariantImages[index];
        if (!current) {
          nextVariantImages[index] = { name, image: "" };
          changed = true;
          return;
        }
        if (!String(current.name || "").trim()) {
          nextVariantImages[index] = { ...current, name };
          changed = true;
        }
      });

      if (!changed) return prev;
      return { ...prev, variantImages: nextVariantImages };
    });
  }, [form.variants]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const updateFeature = (index, value) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const addFeature = () =>
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  const removeFeature = (index) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));

  const updateVariant = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.variants];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, variants: next };
    });
  };
  const addVariant = () =>
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: "", detail: "", packing: "", price: "" },
      ],
    }));
  const removeVariant = (index) =>
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));

  const updateVariantImage = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.variantImages];
      next[index] = {
        ...(next[index] || { name: "", image: "" }),
        [key]: value,
      };
      return { ...prev, variantImages: next };
    });
  };
  const addVariantImage = () =>
    setForm((prev) => ({
      ...prev,
      variantImages: [...prev.variantImages, { name: "", image: "" }],
    }));
  const removeVariantImage = (index) => {
    setForm((prev) => ({
      ...prev,
      variantImages: prev.variantImages.filter((_, i) => i !== index),
    }));
    setVariantImageFiles((prev) => {
      const next = {};
      Object.entries(prev).forEach(([key, file]) => {
        const numericKey = Number(key);
        if (numericKey < index) next[numericKey] = file;
        if (numericKey > index) next[numericKey - 1] = file;
      });
      return next;
    });
  };
  const updateVariantImageFile = (index, file) => {
    setVariantImageFiles((prev) => {
      const next = { ...prev };
      if (file) next[index] = file;
      else delete next[index];
      return next;
    });
  };

  const updateBrand = (index, key, value) => {
    setForm(prev => {
      const next = [...prev.brands];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, brands: next };
    });
  };
  const addBrand = () => setForm(prev => ({ ...prev, brands: [...prev.brands, { name: "", category: "", description: "", image: "", tagline: "", features: [""], variants: [{name: "", detail: "", packing: "", price: ""}] }] }));
  const removeBrand = (index) => setForm(prev => ({ ...prev, brands: prev.brands.filter((_, i) => i !== index) }));
  
  const updateBrandFeature = (brandIndex, featureIndex, value) => {
    setForm(prev => {
      const nextBrands = [...prev.brands];
      const nextFeatures = [...(nextBrands[brandIndex].features || [])];
      nextFeatures[featureIndex] = value;
      nextBrands[brandIndex] = { ...nextBrands[brandIndex], features: nextFeatures };
      return { ...prev, brands: nextBrands };
    });
  };
  const addBrandFeature = (brandIndex) => {
    setForm(prev => {
      const nextBrands = [...prev.brands];
      nextBrands[brandIndex] = { ...nextBrands[brandIndex], features: [...(nextBrands[brandIndex].features || []), ""] };
      return { ...prev, brands: nextBrands };
    });
  };
  const removeBrandFeature = (brandIndex, featureIndex) => {
    setForm(prev => {
      const nextBrands = [...prev.brands];
      nextBrands[brandIndex] = { ...nextBrands[brandIndex], features: (nextBrands[brandIndex].features || []).filter((_, i) => i !== featureIndex) };
      return { ...prev, brands: nextBrands };
    });
  };
  const updateBrandImageFile = (index, file) => {
    setBrandImageFiles(prev => {
      const next = { ...prev };
      if (file) next[index] = file; else delete next[index];
      return next;
    });
  };
  const updateBrandVariant = (brandIndex, variantIndex, key, value) => {
    setForm(prev => {
      const nextBrands = [...prev.brands];
      const nextVariants = [...nextBrands[brandIndex].variants];
      nextVariants[variantIndex] = { ...nextVariants[variantIndex], [key]: value };
      nextBrands[brandIndex] = { ...nextBrands[brandIndex], variants: nextVariants };
      return { ...prev, brands: nextBrands };
    });
  };
  const addBrandVariant = (brandIndex) => {
    setForm(prev => {
      const nextBrands = [...prev.brands];
      nextBrands[brandIndex] = { ...nextBrands[brandIndex], variants: [...nextBrands[brandIndex].variants, {name: "", detail: "", packing: "", price: ""}] };
      return { ...prev, brands: nextBrands };
    });
  };
  const removeBrandVariant = (brandIndex, variantIndex) => {
    setForm(prev => {
      const nextBrands = [...prev.brands];
      nextBrands[brandIndex] = { ...nextBrands[brandIndex], variants: nextBrands[brandIndex].variants.filter((_, i) => i !== variantIndex) };
      return { ...prev, brands: nextBrands };
    });
  };

  const updateFacility = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.facilities];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, facilities: next };
    });
  };
  const addFacility = () =>
    setForm((prev) => ({
      ...prev,
      facilities: [...prev.facilities, { name: "", location: "", note: "" }],
    }));
  const removeFacility = (index) =>
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
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
    try {
      const normalizedVariantImages = normalizeVariantImages(
        form.variantImages,
      );
      const syncedVariantImages = normalizedVariantImages.map((entry) => ({
        ...entry,
      }));
      const hasVariantFileAtIndex = (index) =>
        Boolean(variantImageFiles[index]);
      const activeVariantIndexes = syncedVariantImages
        .map((entry, index) => ({
          index,
          keep: entry.name || entry.image || hasVariantFileAtIndex(index),
        }))
        .filter((entry) => entry.keep)
        .map((entry) => entry.index);

      const compactVariantImages = activeVariantIndexes.map(
        (index) => syncedVariantImages[index],
      );
      const compactVariantImageFiles = compactVariantImages.map(
        (_, compactIndex) => {
          const originalIndex = activeVariantIndexes[compactIndex];
          return variantImageFiles[originalIndex] || null;
        },
      );

      const payload = {
        id: form.id,
        title: form.title,
        category: form.category,
        productType: form.productType,
        navGroup: form.navGroup,
        iconType: form.iconType || null,
        description: form.description,
        image: form.image,
        images: sanitizeStringList(form.imageUrls),
        color: form.color,
        tagline: form.tagline,
        services: form.services,
        shippingCost: form.shippingCost === "" || form.shippingCost == null ? null : Number(form.shippingCost),
        displayOrder: Number(form.displayOrder) || 0,
        carouselOrder: Number(form.carouselOrder) || 0,
        isActive: form.isActive,
        showOnLanding: form.showOnLanding,
        showInProductsPage: form.showInProductsPage,
        showInNavbar: form.showInNavbar,
        features: sanitizeStringList(form.features),
        brands: sanitizeBrands(form.brands),
        variants: sanitizeVariants(form.variants),
        variantImages: compactVariantImages,
        facilities: sanitizeFacilities(form.facilities),
        productImages,
        variantImageFiles: compactVariantImageFiles,
      };

      const compactBrandImageFiles = form.brands.map((_, i) => brandImageFiles[i] || null);
      payload.brandImageFiles = compactBrandImageFiles;

      if (editingId) {
        await adminUpdateProduct(editingId, payload);
      } else {
        await adminCreateProduct(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      setProductImages([]);
      setVariantImageFiles({});
      setBrandImageFiles({});
      await load();
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setShowForm(true);
    setForm({
      ...emptyForm,
      id: p.id ?? "",
      title: p.title ?? "",
      category: p.category ?? "",
      productType: p.productType ?? "general",
      navGroup: p.navGroup ?? "",
      iconType: p.iconType ?? "",
      description: p.description ?? "",
      image: p.image ?? "",
      color: p.color ?? colors.primary.main,
      tagline: p.tagline ?? "",
      services: p.services ?? "",
      shippingCost: p.shippingCost ?? "",
      displayOrder: p.displayOrder ?? 0,
      carouselOrder: p.carouselOrder ?? p.displayOrder ?? 0,
      isActive: p.isActive ?? true,
      showOnLanding: p.showOnLanding ?? true,
      showInProductsPage: p.showInProductsPage ?? true,
      showInNavbar: p.showInNavbar ?? true,
      features: p.features?.length ? p.features : [""],
      brands: p.brands?.length ? p.brands : [],
      variants: p.variants?.length
        ? p.variants.map((v) => ({ ...v, price: v.price ?? "" }))
        : [{ name: "", detail: "", packing: "", price: "" }],
      variantImages: p.variantImages?.length
        ? p.variantImages.map((v) => ({
            name: v.name ?? "",
            image: v.image ?? "",
          }))
        : [{ name: "", image: "" }],
      facilities: p.facilities?.length
        ? p.facilities
        : [{ name: "", location: "", note: "" }],
      imageUrls: p.images?.length ? p.images : [""],
    });
    setProductImages([]);
    setVariantImageFiles({});
    setBrandImageFiles({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await adminDeleteProduct(id);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete product");
    }
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
                Products Management
              </h1>
              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Create, update, and delete products with variants, facilities, and images.
              </p>
            </div>
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
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-all"
            >
              <span>{showForm && !editingId ? "✕ Close Form" : "+ Add New Product"}</span>
            </button>
          </div>

          {loading ? (
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Loading products...
            </div>
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
                      <th className="text-left py-3 pr-4">ID</th>
                      <th className="text-left py-3 pr-4">Title</th>
                      <th className="text-left py-3 pr-4">Category</th>
                      <th className="text-left py-3 pr-4">Type</th>
                      <th className="text-left py-3 pr-4">Updated</th>
                      <th className="text-right py-3 pl-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? "divide-y divide-[#1E293B]/60 text-slate-200" : "divide-y divide-slate-100 text-slate-800"}>
                    {products.map((p) => (
                      <tr key={p.id} className={`transition-colors ${isDark ? "hover:bg-[#161D2E]" : "hover:bg-slate-50"}`}>
                        <td className={`py-3 pr-4 font-mono text-xs font-semibold ${isDark ? "text-sky-400" : "text-sky-600"}`}>{p.id}</td>
                        <td className="py-3 pr-4 font-medium">{p.title}</td>
                        <td className="py-3 pr-4">{p.category}</td>
                        <td className="py-3 pr-4">{p.productType || "-"}</td>
                        <td className={`py-3 pr-4 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {p.updatedAt
                            ? new Date(p.updatedAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="py-3 pl-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              isDark
                                ? "border-[#1E293B] bg-[#161D2E] text-sky-400 hover:bg-[#1E293B]"
                                : "border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              isDark
                                ? "border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-900/40"
                                : "border-red-200 text-red-600 hover:bg-red-50"
                            }`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td
                          className={`py-8 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                          colSpan={6}
                        >
                          No products yet. Click &quot;+ Add New Product&quot; above to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className={`border rounded-xl p-4 ${
                      isDark ? "border-[#1E293B] bg-[#161D2E]" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{p.title}</p>
                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {p.category || "-"}
                        </p>
                      </div>
                      <span className={`text-xs font-mono ${isDark ? "text-sky-400" : "text-sky-600"}`}>
                        {p.id}
                      </span>
                    </div>
                    <div className={`mt-3 text-xs space-y-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      <span className="block">
                        Type: {p.productType || "-"}
                      </span>
                      <span className="block">
                        Updated:{" "}
                        {p.updatedAt
                          ? new Date(p.updatedAt).toLocaleString()
                          : "-"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
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
                ))}
                {products.length === 0 && (
                  <p className={`text-center text-sm py-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    No products yet. Click &quot;+ Add New Product&quot; above to add one.
                  </p>
                )}
              </div>
            </div>
          )}

          {showForm && (
            <div className={`border rounded-2xl p-5 md:p-7 shadow-xl transition-all ${
              isDark ? "bg-[#111726] border-[#1E293B] text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"
            }`}>
              <div className={`flex items-center justify-between mb-5 border-b pb-4 ${
                isDark ? "border-[#1E293B]" : "border-slate-200"
              }`}>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {editingId ? "Edit Product Details" : "Add New Product"}
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {editingId ? `Updating product: ${form.title || form.id}` : "Fill out details to publish a new product"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? "border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#161D2E]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  ✕ Close Form
                </button>
              </div>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm"
            >
              <div>
                <label className="block mb-1.5 font-medium">ID (slug)</label>
                <input
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  required
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-medium">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-medium">Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-medium">Product Type</label>
                <select
                  name="productType"
                  value={form.productType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                >
                  <option value="matches">Safety Matches</option>
                  <option value="detergents">Detergents</option>
                  <option value="dish-wash">Dish Wash</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5 font-medium">Navbar Group</label>
                <input
                  name="navGroup"
                  value={form.navGroup}
                  onChange={handleChange}
                  placeholder="Safety Matches / Detergents / Dish Wash"
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-medium">Icon Type</label>
                <select
                  name="iconType"
                  value={form.iconType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                >
                  <option value="">None</option>
                  <option value="fire">fire</option>
                  <option value="layer">layer</option>
                  <option value="dish-wash">dish-wash</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5 font-medium">
                  Primary Image URL (optional)
                </label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-medium">
                  Upload Product Image(s)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setProductImages(Array.from(e.target.files || []))
                  }
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg"
                />
                <p className="text-xs text-[#666666] mt-1">
                  Upload one or many. First image is used as primary.
                </p>
              </div>
              <div>
                <label className="block mb-1.5 font-medium">Color (hex)</label>
                <input
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-medium">Shipping Cost (Rs)</label>
                <input
                  name="shippingCost"
                  type="number"
                  min="0"
                  placeholder="Leave empty for default"
                  value={form.shippingCost}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-medium">
                  Display Order
                </label>
                <input
                  name="displayOrder"
                  type="number"
                  value={form.displayOrder}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-medium">
                  Carousel Order
                </label>
                <input
                  name="carouselOrder"
                  type="number"
                  value={form.carouselOrder}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1.5 font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1.5 font-medium">Tagline</label>
                <input
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1.5 font-medium">Services</label>
                <textarea
                  name="services"
                  value={form.services}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["isActive", "Active"],
                  ["showOnLanding", "Show On Landing"],
                  ["showInProductsPage", "Show In Products Page"],
                  ["showInNavbar", "Show In Navbar"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name={key}
                      checked={Boolean(form[key])}
                      onChange={handleChange}
                    />
                    {label}
                  </label>
                ))}
              </div>

              {form.productType !== "matches" && (
                <>
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 font-medium">Key Features</label>
                    <div className="space-y-2">
                      {form.features.map((feature, idx) => (
                        <div key={`f-${idx}`} className="flex gap-2">
                          <input
                            value={feature}
                            onChange={(e) => updateFeature(idx, e.target.value)}
                            placeholder={`Feature ${idx + 1}`}
                            className="flex-1 px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="px-3 py-2 rounded-lg border border-red-200 text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-3 py-2 rounded-lg border border-[#E0E0E0] hover:bg-[#F9F9F9]"
                      >
                        Add Feature
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1.5 font-medium">Variants</label>
                    <div className="space-y-2">
                      {form.variants.map((variant, idx) => (
                        <div
                          key={`v-${idx}`}
                          className="grid grid-cols-1 md:grid-cols-5 gap-2"
                        >
                          <input
                            placeholder="Name (e.g. 1 KG)"
                            value={variant.name}
                            onChange={(e) =>
                              updateVariant(idx, "name", e.target.value)
                            }
                            className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                          />
                          <input
                            placeholder="Detail (e.g. 1000 g)"
                            value={variant.detail}
                            onChange={(e) =>
                              updateVariant(idx, "detail", e.target.value)
                            }
                            className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                          />
                          <input
                            placeholder="Packing (e.g. 12 pcs/ctn)"
                            value={variant.packing}
                            onChange={(e) =>
                              updateVariant(idx, "packing", e.target.value)
                            }
                            className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                          />
                          <input
                            placeholder="Price"
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(idx, "price", e.target.value)
                            }
                            className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="px-3 py-2 rounded-lg border border-red-200 text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addVariant}
                        className="px-3 py-2 rounded-lg border border-[#E0E0E0] hover:bg-[#F9F9F9]"
                      >
                        Add Variant
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1.5 font-medium">
                      Variant Images (Name + Image)
                    </label>
                    <p className="text-xs text-[#666666] mb-2">
                      Add labels like 1 KG / 500 G and upload or paste image URL for
                      each.
                    </p>
                    <div className="space-y-2">
                      {form.variantImages.map((variantImage, idx) => (
                        <div
                          key={`vi-${idx}`}
                          className="grid grid-cols-1 md:grid-cols-4 gap-2"
                        >
                          <input
                            placeholder="Name (e.g. 1 KG)"
                            value={variantImage.name}
                            onChange={(e) =>
                              updateVariantImage(idx, "name", e.target.value)
                            }
                            className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                          />
                          <input
                            placeholder="Image URL (optional)"
                            value={variantImage.image}
                            onChange={(e) =>
                              updateVariantImage(idx, "image", e.target.value)
                            }
                            className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              updateVariantImageFile(
                                idx,
                                e.target.files?.[0] || null,
                              )
                            }
                            className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(idx)}
                            className="px-3 py-2 rounded-lg border border-red-200 text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addVariantImage}
                        className="px-3 py-2 rounded-lg border border-[#E0E0E0] hover:bg-[#F9F9F9]"
                      >
                        Add Variant Image
                      </button>
                    </div>
                  </div>
                </>
              )}

              {form.productType === "matches" && (
                <div className="md:col-span-2">
                  <label className="block mb-1.5 font-medium">Matches List</label>
                  <div className="space-y-4">
                    {form.brands.map((brand, bIdx) => (
                      <div key={`b-${bIdx}`} className="border border-[#E0E0E0] p-4 rounded-xl space-y-4 bg-white shadow-sm">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h4 className="font-semibold text-[#00AEEF]">Match #{bIdx + 1}</h4>
                          <button type="button" onClick={() => removeBrand(bIdx)} className="px-3 py-1 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50">Remove Match</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#666] mb-1">Brand Name</label>
                            <input placeholder="e.g. Kite Safety Matches" value={brand.name} onChange={(e) => updateBrand(bIdx, 'name', e.target.value)} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#666] mb-1">Tagline (Urdu/English)</label>
                            <input placeholder="e.g. پل میں روشن دیر پا شعلہ" value={brand.tagline || ''} onChange={(e) => updateBrand(bIdx, 'tagline', e.target.value)} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm" dir="auto" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#666] mb-1">Description</label>
                          <textarea placeholder="Description" value={brand.description} onChange={(e) => updateBrand(bIdx, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#666] mb-1">Match Image URL (optional)</label>
                            <input placeholder="URL" value={brand.image} onChange={(e) => updateBrand(bIdx, 'image', e.target.value)} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#666] mb-1">Upload Match Image</label>
                            <input type="file" accept="image/*" onChange={(e) => updateBrandImageFile(bIdx, e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm" />
                          </div>
                        </div>

                        <div className="bg-[#F9F9F9] p-3 rounded-lg space-y-2 border border-[#E0E0E0]">
                          <label className="block text-sm font-medium text-[#222]">Key Features</label>
                          {(brand.features || []).map((feature, fIdx) => (
                            <div key={`bf-${bIdx}-${fIdx}`} className="flex gap-2">
                              <input
                                value={feature}
                                onChange={(e) => updateBrandFeature(bIdx, fIdx, e.target.value)}
                                placeholder="e.g. Premium Quality"
                                className="flex-1 px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => removeBrandFeature(bIdx, fIdx)}
                                className="px-3 py-1 rounded text-red-600 text-xs border border-red-200 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addBrandFeature(bIdx)}
                            className="text-xs text-[#00AEEF] hover:underline font-medium"
                          >
                            + Add Feature
                          </button>
                        </div>

                        <div className="bg-[#F9F9F9] p-3 rounded-lg space-y-2 border border-[#E0E0E0]">
                          <label className="block text-sm font-medium text-[#222]">Match Variants</label>
                          {brand.variants.map((v, vIdx) => (
                            <div key={`bv-${bIdx}-${vIdx}`} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                              <input placeholder="Name (e.g. LARGE)" value={v.name} onChange={(e) => updateBrandVariant(bIdx, vIdx, 'name', e.target.value)} className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white" />
                              <input placeholder="Detail" value={v.detail} onChange={(e) => updateBrandVariant(bIdx, vIdx, 'detail', e.target.value)} className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white" />
                              <input placeholder="Packing" value={v.packing} onChange={(e) => updateBrandVariant(bIdx, vIdx, 'packing', e.target.value)} className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white" />
                              <input placeholder="Price" type="number" value={v.price} onChange={(e) => updateBrandVariant(bIdx, vIdx, 'price', e.target.value)} className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white" />
                              <button type="button" onClick={() => removeBrandVariant(bIdx, vIdx)} className="px-2 py-1 rounded text-red-600 text-xs border border-red-200 hover:bg-red-50">Remove</button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addBrandVariant(bIdx)} className="text-xs text-[#00AEEF] hover:underline font-medium">
                            + Add Variant
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addBrand} className="px-4 py-2 rounded-lg font-semibold text-white bg-[#00AEEF] hover:bg-[#0095CC] transition-colors">
                      + Add Another Match
                    </button>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block mb-1.5 font-medium">Facilities</label>
                <div className="space-y-2">
                  {form.facilities.map((facility, idx) => (
                    <div
                      key={`fc-${idx}`}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2"
                    >
                      <input
                        placeholder="Facility Name"
                        value={facility.name}
                        onChange={(e) =>
                          updateFacility(idx, "name", e.target.value)
                        }
                        className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                      />
                      <input
                        placeholder="Location"
                        value={facility.location}
                        onChange={(e) =>
                          updateFacility(idx, "location", e.target.value)
                        }
                        className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                      />
                      <input
                        placeholder="Note"
                        value={facility.note}
                        onChange={(e) =>
                          updateFacility(idx, "note", e.target.value)
                        }
                        className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeFacility(idx)}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFacility}
                    className="px-3 py-2 rounded-lg border border-[#E0E0E0] hover:bg-[#F9F9F9]"
                  >
                    Add Facility
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1.5 font-medium">
                  Extra Image URLs
                </label>
                <div className="space-y-2">
                  {form.imageUrls.map((url, idx) => (
                    <div key={`u-${idx}`} className="flex gap-2">
                      <input
                        value={url}
                        onChange={(e) => updateImageUrl(idx, e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(idx)}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-3 py-2 rounded-lg border border-[#E0E0E0] hover:bg-[#F9F9F9]"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              <div className="flex items-end gap-2 pt-1 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#00AEEF] to-[#0095CC] hover:shadow-lg hover:shadow-[#00AEEF]/30 transition-all disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Product"
                      : "Create Product"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                      setProductImages([]);
                      setVariantImageFiles({});
                      setShowForm(false);
                    }}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                      isDark
                        ? "border-[#1E293B] bg-[#161D2E] text-slate-300 hover:bg-[#1E293B]"
                        : "border-[#E0E0E0] bg-white text-slate-700 hover:bg-[#F9F9F9]"
                    }`}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
          )}
        </div>
      </AdminLayout>
    </RequireAdminAuth>
  );
};

export default AdminProductsPage;
