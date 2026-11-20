'use client';

import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import { useAdminTheme } from "@/context/AdminThemeContext";
import {
  FaBoxOpen,
  FaLayerGroup,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaTag
} from "react-icons/fa";
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
  const [activeTab, setActiveTab] = useState("skus");
  const [skuSearch, setSkuSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const allSkus = useMemo(() => {
    const list = [];
    products.forEach((prod) => {
      if (Array.isArray(prod.variants) && prod.variants.length > 0) {
        prod.variants.forEach((v, vIdx) => {
          const matchedImg = prod.variantImages?.find(
            (vi) => vi?.name?.trim().toLowerCase() === v?.name?.trim().toLowerCase()
          )?.image;
          list.push({
            id: `${prod.id}-${v.name}`,
            productId: prod.id,
            productTitle: prod.title,
            brandName: prod.title,
            variantIndex: vIdx,
            variant: v,
            category: prod.category || prod.navGroup || "Detergents",
            image: matchedImg || prod.image,
            tagline: prod.tagline || "",
            color: prod.color || "#00AEEF",
            product: prod,
          });
        });
      }

      if (Array.isArray(prod.brands) && prod.brands.length > 0) {
        prod.brands.forEach((brand, bIdx) => {
          if (Array.isArray(brand.variants)) {
            brand.variants.forEach((v, vIdx) => {
              list.push({
                id: `${prod.id}-${brand.name}-${v.name}`,
                productId: prod.id,
                productTitle: prod.title,
                brandName: brand.name,
                brandIndex: bIdx,
                variantIndex: vIdx,
                variant: v,
                category: "Safety Matches",
                image: brand.image || prod.image,
                tagline: brand.tagline || "",
                color: "#ED028C",
                product: prod,
              });
            });
          }
        });
      }
    });
    return list;
  }, [products]);

  const filteredSkus = useMemo(() => {
    return allSkus.filter((sku) => {
      const q = skuSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sku.variant?.name?.toLowerCase().includes(q) ||
        sku.variant?.detail?.toLowerCase().includes(q) ||
        sku.variant?.packing?.toLowerCase().includes(q) ||
        sku.brandName?.toLowerCase().includes(q) ||
        sku.category?.toLowerCase().includes(q) ||
        String(sku.variant?.price || "").includes(q);

      const matchesCategory =
        selectedCategory === "all" ||
        sku.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [allSkus, skuSearch, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set();
    allSkus.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["all", ...Array.from(set)];
  }, [allSkus]);

  const handleEditSku = (sku) => {
    const parentProd = products.find((p) => p.id === sku.productId) || sku.product;
    if (parentProd) {
      handleEdit(parentProd);
      setTimeout(() => {
        const el = document.getElementById("variants-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      let data = await adminGetProducts();
      if (!Array.isArray(data) || data.length === 0) {
        const { getProducts } = await import("../services/api");
        const fallback = await getProducts();
        if (Array.isArray(fallback) && fallback.length > 0) {
          data = fallback;
        }
      }
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      try {
        const { getProducts } = await import("../services/api");
        const fallback = await getProducts();
        if (Array.isArray(fallback) && fallback.length > 0) {
          setProducts(fallback);
          setError("");
          return;
        }
      } catch {}
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
              {/* VIEW SWITCHER TABS & SKU SEARCH */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-5 border-slate-200 dark:border-[#1E293B]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("skus")}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === "skus"
                        ? "bg-[#00AEEF] text-white shadow-md shadow-sky-500/20"
                        : isDark
                        ? "bg-[#161D2E] text-slate-300 hover:bg-[#1E293B]"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <FaBoxOpen className="text-sm" />
                    <span>Factory SKUs &amp; Sizes ({allSkus.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("products")}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === "products"
                        ? "bg-[#00AEEF] text-white shadow-md shadow-sky-500/20"
                        : isDark
                        ? "bg-[#161D2E] text-slate-300 hover:bg-[#1E293B]"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <FaLayerGroup className="text-sm" />
                    <span>Main Product Lines ({products.length})</span>
                  </button>
                </div>

                {activeTab === "skus" && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? "bg-sky-500/20 text-[#00AEEF] border border-[#00AEEF]/40"
                              : isDark
                              ? "text-slate-400 hover:text-slate-200"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-60">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        type="text"
                        value={skuSearch}
                        onChange={(e) => setSkuSearch(e.target.value)}
                        placeholder="Search SKU name, price, bar..."
                        className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-colors ${
                          isDark
                            ? "bg-[#161D2E] border-[#1E293B] text-white focus:border-[#00AEEF]"
                            : "bg-slate-50 border-slate-200 text-slate-800 focus:border-[#00AEEF]"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* TAB 1: ALL FACTORY SKUS & INDIVIDUAL SIZES TABLE */}
              {/* ========================================================================= */}
              {activeTab === "skus" && (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                          isDark ? "border-[#1E293B] text-slate-300" : "border-slate-200 text-slate-700"
                        }`}>
                          <th className="text-left py-3 pr-3 w-14">Image</th>
                          <th className="text-left py-3 pr-4">SKU / Variant Name</th>
                          <th className="text-left py-3 pr-4">Parent Product / Brand</th>
                          <th className="text-left py-3 pr-4">Category</th>
                          <th className="text-left py-3 pr-4">Packing / Details</th>
                          <th className="text-left py-3 pr-4 font-mono">Price (Rs.)</th>
                          <th className="text-right py-3 pl-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={isDark ? "divide-y divide-[#1E293B]/60 text-slate-200" : "divide-y divide-slate-100 text-slate-800"}>
                        {filteredSkus.map((sku) => (
                          <tr key={sku.id} className={`transition-colors ${isDark ? "hover:bg-[#161D2E]" : "hover:bg-slate-50"}`}>
                            <td className="py-2.5 pr-3">
                              <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                {sku.image ? (
                                  <img
                                    src={sku.image?.src || sku.image}
                                    alt={sku.variant.name}
                                    className="w-full h-full object-contain p-1"
                                    loading="lazy"
                                  />
                                ) : (
                                  <FaBoxOpen className="text-slate-400 text-xs" />
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 pr-4 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-1.5">
                                <span>{sku.variant.name}</span>
                                {sku.variant.detail && (
                                  <span className="text-[11px] font-normal px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {sku.variant.detail}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 pr-4 text-xs font-semibold text-sky-600 dark:text-sky-400">
                              {sku.brandName}
                            </td>
                            <td className="py-2.5 pr-4">
                              <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {sku.category}
                              </span>
                            </td>
                            <td className="py-2.5 pr-4 text-xs text-slate-600 dark:text-slate-400">
                              {sku.variant.packing || "—"}
                            </td>
                            <td className="py-2.5 pr-4 font-mono font-black text-sky-500 whitespace-nowrap">
                              Rs. {sku.variant.price ?? "—"}
                            </td>
                            <td className="py-2.5 pl-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleEditSku(sku)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-all cursor-pointer ml-auto"
                                title="Edit this SKU / price in parent product"
                              >
                                <FaEdit className="text-[11px]" />
                                <span>Edit Price / Details</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredSkus.length === 0 && (
                          <tr>
                            <td colSpan={7} className={`py-8 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              No matching factory SKUs found. Try another search or filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile SKU Cards */}
                  <div className="md:hidden space-y-3">
                    {filteredSkus.map((sku) => (
                      <div
                        key={sku.id}
                        className={`border rounded-xl p-3.5 flex items-center justify-between gap-3 ${
                          isDark ? "border-[#1E293B] bg-[#161D2E]" : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                            {sku.image ? (
                              <img src={sku.image?.src || sku.image} alt={sku.variant.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <FaBoxOpen className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                              <span>{sku.variant.name}</span>
                              {sku.variant.detail && <span className="text-[10px] text-slate-500">({sku.variant.detail})</span>}
                            </div>
                            <p className="text-xs text-sky-600 dark:text-sky-400">{sku.brandName}</p>
                            <p className="text-[11px] text-slate-500">{sku.variant.packing || sku.category}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block font-mono font-bold text-sky-500 text-sm">
                            Rs. {sku.variant.price ?? "—"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEditSku(sku)}
                            className="mt-1 px-2.5 py-1 rounded text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: MAIN PRODUCT LINES (5 PARENT PRODUCTS) TABLE */}
              {/* ========================================================================= */}
              {activeTab === "products" && (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                          isDark ? "border-[#1E293B] text-slate-300" : "border-slate-200 text-slate-700"
                        }`}>
                          <th className="text-left py-3 pr-4">ID</th>
                          <th className="text-left py-3 pr-4">Title</th>
                          <th className="text-left py-3 pr-4">Category</th>
                          <th className="text-left py-3 pr-4">Variants / Factory SKUs</th>
                          <th className="text-left py-3 pr-4">Type</th>
                          <th className="text-right py-3 pl-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={isDark ? "divide-y divide-[#1E293B]/60 text-slate-200" : "divide-y divide-slate-100 text-slate-800"}>
                        {products.map((p) => (
                          <tr key={p.id} className={`transition-colors ${isDark ? "hover:bg-[#161D2E]" : "hover:bg-slate-50"}`}>
                            <td className={`py-3 pr-4 font-mono text-xs font-semibold ${isDark ? "text-sky-400" : "text-sky-600"}`}>{p.id}</td>
                            <td className="py-3 pr-4 font-bold">{p.title}</td>
                            <td className="py-3 pr-4">{p.category}</td>
                            <td className="py-3 pr-4">
                              <div className="flex flex-wrap gap-1 max-w-sm">
                                {(p.variants || []).map((v, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60"
                                  >
                                    <span>{v.name}</span>
                                    <span className="font-bold text-sky-500 font-mono">Rs.{v.price}</span>
                                  </span>
                                ))}
                                {p.brands?.map((b) => (
                                  <span
                                    key={b.name}
                                    className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/60"
                                  >
                                    {b.name} ({b.variants?.length || 0} sizes)
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 pr-4">{p.productType || "-"}</td>
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
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Product Cards */}
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
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(p.variants || []).map((v, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                              {v.name} (Rs.{v.price})
                            </span>
                          ))}
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
                  </div>
                </>
              )}
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

                  <div id="variants-section" className="md:col-span-2 p-5 rounded-2xl bg-sky-500/5 border border-sky-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <label className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                          <FaBoxOpen className="text-sky-500" />
                          <span>Factory SKUs &amp; Sizes (Displayed in Online Store)</span>
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Each variant defined below (e.g. SUPER BAR, LONG BAR, CLASSIC BAR, 1 KG) displays as an individual card in &quot;Factory SKUs &amp; Individual Sizes&quot;.
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 rounded-full self-start sm:self-auto border border-sky-200 dark:border-sky-800">
                        {form.variants?.length || 0} SKUs
                      </span>
                    </div>

                    <div className="space-y-3">
                      {form.variants.map((variant, idx) => (
                        <div
                          key={`v-${idx}`}
                          className={`p-3.5 rounded-xl border transition-colors grid grid-cols-1 md:grid-cols-5 gap-3 items-center ${
                            isDark ? "bg-[#161D2E] border-[#1E293B]" : "bg-white border-slate-200 shadow-xs"
                          }`}
                        >
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">SKU Name</label>
                            <input
                              placeholder="e.g. SUPER BAR, 1 KG"
                              value={variant.name}
                              onChange={(e) =>
                                updateVariant(idx, "name", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Weight / Detail</label>
                            <input
                              placeholder="e.g. 200 g, 1000 g"
                              value={variant.detail}
                              onChange={(e) =>
                                updateVariant(idx, "detail", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Carton Packing</label>
                            <input
                              placeholder="e.g. 36 pcs/ctn"
                              value={variant.packing}
                              onChange={(e) =>
                                updateVariant(idx, "packing", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Factory Price (Rs.)</label>
                            <input
                              placeholder="Price"
                              type="number"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(idx, "price", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm font-black text-sky-600 dark:text-sky-400 font-mono"
                            />
                          </div>
                          <div className="flex md:items-end md:justify-end pt-2 md:pt-4">
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addVariant}
                        className="px-4 py-2 rounded-xl border border-sky-300 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all mt-2"
                      >
                        <FaPlus className="text-xs" />
                        <span>+ Add Another SKU / Size Variant</span>
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
