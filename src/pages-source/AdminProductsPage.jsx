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

  const inputCls = isDark
    ? "w-full px-3 py-2 border border-slate-700 rounded-lg text-sm bg-[#0B0F19] text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
    : "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition-colors";

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

  const getCategoryBadge = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("dish")) {
      return isDark
        ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 font-medium"
        : "bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-semibold";
    }
    if (cat.includes("match")) {
      return isDark
        ? "bg-amber-950/70 text-amber-300 border border-amber-800/80 font-medium"
        : "bg-amber-50 text-amber-800 border border-amber-200/90 font-semibold";
    }
    return isDark
      ? "bg-sky-950/70 text-sky-300 border border-sky-800/80 font-medium"
      : "bg-sky-50 text-sky-800 border border-sky-200/90 font-semibold";
  };

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
              isDark ? "bg-[#111726] border-slate-800" : "bg-white border-slate-200"
            }`}>
              {/* VIEW SWITCHER TABS & SKU SEARCH */}
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-5 ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("skus")}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === "skus"
                        ? "bg-[#00AEEF] text-white shadow-sm"
                        : isDark
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
                        ? "bg-[#00AEEF] text-white shadow-sm"
                        : isDark
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <FaLayerGroup className="text-sm" />
                    <span>Main Product Lines ({products.length})</span>
                  </button>
                </div>

                {activeTab === "skus" && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? isDark
                                ? "bg-sky-950 text-sky-300 border border-sky-800"
                                : "bg-sky-50 text-sky-700 border border-sky-300 font-bold"
                              : isDark
                              ? "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
                              : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        type="text"
                        value={skuSearch}
                        onChange={(e) => setSkuSearch(e.target.value)}
                        placeholder="Search SKU, weight, carton, price..."
                        className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border outline-none transition-colors ${
                          isDark
                            ? "bg-[#161D2E] border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500"
                            : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500"
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
                          isDark ? "border-slate-800 text-slate-400 bg-slate-900/40" : "border-slate-200 text-slate-600 bg-slate-50/70"
                        }`}>
                          <th className="text-left py-3.5 pl-4 pr-3 w-14 rounded-l-xl">Image</th>
                          <th className="text-left py-3.5 pr-4">SKU / Variant Name</th>
                          <th className="text-left py-3.5 pr-4">Parent Product / Brand</th>
                          <th className="text-left py-3.5 pr-4">Category</th>
                          <th className="text-left py-3.5 pr-4">Packing / Details</th>
                          <th className="text-left py-3.5 pr-4 font-mono">Price</th>
                          <th className="text-right py-3.5 pr-4 pl-4 rounded-r-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-800"}`}>
                        {filteredSkus.map((sku) => (
                          <tr key={sku.id} className={`transition-colors ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50/80"}`}>
                            <td className="py-3 pl-4 pr-3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden border ${
                                isDark ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200 shadow-2xs"
                              }`}>
                                {sku.image ? (
                                  <img
                                    src={sku.image?.src || sku.image}
                                    alt={sku.variant.name}
                                    className="w-full h-full object-contain p-1"
                                    loading="lazy"
                                  />
                                ) : (
                                  <FaBoxOpen className="text-slate-400 text-sm" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                                  {sku.variant.name}
                                </span>
                                {sku.variant.detail && (
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                                    isDark
                                      ? "bg-slate-800 text-slate-300 border-slate-700"
                                      : "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}>
                                    {sku.variant.detail}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`py-3 pr-4 text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                              {sku.brandName}
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${getCategoryBadge(sku.category)}`}>
                                {sku.category}
                              </span>
                            </td>
                            <td className={`py-3 pr-4 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              {sku.variant.packing || "—"}
                            </td>
                            <td className="py-3 pr-4 whitespace-nowrap">
                              <span className="text-xs text-slate-400 font-medium mr-1">Rs.</span>
                              <span className={`text-sm font-bold font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                                {sku.variant.price ?? "—"}
                              </span>
                            </td>
                            <td className="py-3 pr-4 pl-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleEditSku(sku)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ml-auto ${
                                  isDark
                                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                                }`}
                                title="Edit this SKU / price in parent product"
                              >
                                <FaEdit className="text-slate-400 text-xs" />
                                <span>Edit Price</span>
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
                          isDark ? "border-slate-800 bg-[#161D2E]" : "border-slate-200 bg-white shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border shrink-0 ${
                            isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                          }`}>
                            {sku.image ? (
                              <img src={sku.image?.src || sku.image} alt={sku.variant.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <FaBoxOpen className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                                {sku.variant.name}
                              </span>
                              {sku.variant.detail && (
                                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                                  isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                                }`}>
                                  {sku.variant.detail}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{sku.brandName}</p>
                            <p className="text-[11px] text-slate-500">{sku.variant.packing || sku.category}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`block font-mono font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                            <span className="text-xs text-slate-400 mr-0.5">Rs.</span>
                            {sku.variant.price ?? "—"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEditSku(sku)}
                            className={`mt-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              isDark
                                ? "bg-slate-800 border-slate-700 text-slate-200"
                                : "bg-white border-slate-300 text-slate-700 shadow-2xs"
                            }`}
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
                          isDark ? "border-slate-800 text-slate-400 bg-slate-900/40" : "border-slate-200 text-slate-600 bg-slate-50/70"
                        }`}>
                          <th className="text-left py-3.5 pl-4 pr-4 rounded-l-xl">ID</th>
                          <th className="text-left py-3.5 pr-4">Title</th>
                          <th className="text-left py-3.5 pr-4">Category</th>
                          <th className="text-left py-3.5 pr-4">Variants / Factory SKUs</th>
                          <th className="text-left py-3.5 pr-4">Type</th>
                          <th className="text-right py-3.5 pr-4 pl-4 rounded-r-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-800"}`}>
                        {products.map((p) => (
                          <tr key={p.id} className={`transition-colors ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50/80"}`}>
                            <td className={`py-3.5 pl-4 pr-4 font-mono text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              {p.id}
                            </td>
                            <td className={`py-3.5 pr-4 font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                              {p.title}
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${getCategoryBadge(p.category)}`}>
                                {p.category}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4">
                              <div className="flex flex-wrap gap-1.5 max-w-md">
                                {(p.variants || []).map((v, i) => (
                                  <span
                                    key={i}
                                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${
                                      isDark
                                        ? "bg-slate-800 text-slate-200 border-slate-700"
                                        : "bg-slate-100 text-slate-800 border-slate-200"
                                    }`}
                                  >
                                    <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{v.name}</span>
                                    <span className={`font-bold font-mono ${isDark ? "text-sky-400" : "text-sky-600"}`}>Rs.{v.price}</span>
                                  </span>
                                ))}
                                {p.brands?.map((b) => (
                                  <span
                                    key={b.name}
                                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${
                                      isDark
                                        ? "bg-amber-950/40 text-amber-300 border-amber-800/60"
                                        : "bg-amber-50 text-amber-900 border-amber-200/80"
                                    }`}
                                  >
                                    <span className="font-semibold">{b.name}</span>
                                    <span className="text-[11px] opacity-75">({b.variants?.length || 0} sizes)</span>
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className={`py-3.5 pr-4 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              {p.productType || "-"}
                            </td>
                            <td className="py-3.5 pr-4 pl-4 text-right space-x-2">
                              <button
                                onClick={() => handleEdit(p)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                                  isDark
                                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                                }`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                                  isDark
                                    ? "border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-900/50"
                                    : "border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300"
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
                  <div className="md:hidden space-y-3">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className={`border rounded-xl p-4 ${
                          isDark ? "border-slate-800 bg-[#161D2E]" : "border-slate-200 bg-white shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{p.title}</p>
                            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              {p.category || "-"}
                            </p>
                          </div>
                          <span className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {p.id}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(p.variants || []).map((v, i) => (
                            <span
                              key={i}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                                isDark ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-slate-100 text-slate-800 border-slate-200"
                              }`}
                            >
                              <span className="font-semibold">{v.name}</span> (Rs.{v.price})
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                              isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-300 bg-white text-slate-700"
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 bg-white text-red-600 hover:bg-red-50"
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
              <div>
                <label className={labelCls}>Product Type</label>
                <select
                  name="productType"
                  value={form.productType}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="matches">Safety Matches</option>
                  <option value="detergents">Detergents</option>
                  <option value="dish-wash">Dish Wash</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Navbar Group</label>
                <input
                  name="navGroup"
                  value={form.navGroup}
                  onChange={handleChange}
                  placeholder="Safety Matches / Detergents / Dish Wash"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Icon Type</label>
                <select
                  name="iconType"
                  value={form.iconType}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">None</option>
                  <option value="fire">fire</option>
                  <option value="layer">layer</option>
                  <option value="dish-wash">dish-wash</option>
                </select>
              </div>
              <div>
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
                  Upload Product Image(s)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setProductImages(Array.from(e.target.files || []))
                  }
                  className={inputCls}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Upload one or many. First image is used as primary.
                </p>
              </div>
              <div>
                <label className={labelCls}>Color (hex)</label>
                <input
                  name="color"
                  value={form.color}
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
                  type="number"
                  value={form.displayOrder}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Carousel Order
                </label>
                <input
                  name="carouselOrder"
                  type="number"
                  value={form.carouselOrder}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className={inputCls}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Tagline</label>
                <input
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Services</label>
                <textarea
                  name="services"
                  value={form.services}
                  onChange={handleChange}
                  rows={2}
                  className={inputCls}
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
                    <label className={labelCls}>Key Features</label>
                    <div className="space-y-2">
                      {form.features.map((feature, idx) => (
                        <div key={`f-${idx}`} className="flex gap-2">
                          <input
                            value={feature}
                            onChange={(e) => updateFeature(idx, e.target.value)}
                            placeholder={`Feature ${idx + 1}`}
                            className={`flex-1 ${inputCls}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className={removeBtnCls}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFeature}
                        className={addSubBtnCls}
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>

                  <div id="variants-section" className={`md:col-span-2 p-5 rounded-2xl border ${
                    isDark ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <label className={`font-bold text-base flex items-center gap-2 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}>
                          <FaBoxOpen className="text-sky-500" />
                          <span>Factory SKUs &amp; Sizes (Displayed in Online Store)</span>
                        </label>
                        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          Each variant defined below (e.g. SUPER BAR, LONG BAR, CLASSIC BAR, 1 KG) displays as an individual card in &quot;Factory SKUs &amp; Individual Sizes&quot;.
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                        isDark ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-white text-slate-700 border-slate-200 shadow-2xs"
                      }`}>
                        {form.variants?.length || 0} SKUs
                      </span>
                    </div>

                    <div className="space-y-3">
                      {form.variants.map((variant, idx) => (
                        <div
                          key={`v-${idx}`}
                          className={`p-3.5 rounded-xl border transition-colors grid grid-cols-1 md:grid-cols-5 gap-3 items-center ${
                            isDark ? "bg-[#161D2E] border-slate-800" : "bg-white border-slate-200 shadow-2xs"
                          }`}
                        >
                          <div>
                            <label className={`block text-[11px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              SKU Name
                            </label>
                            <input
                              placeholder="e.g. SUPER BAR, 1 KG"
                              value={variant.name}
                              onChange={(e) =>
                                updateVariant(idx, "name", e.target.value)
                              }
                              className={`w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-colors ${
                                isDark
                                  ? "bg-[#0B0F19] text-white border-slate-700 focus:border-sky-500"
                                  : "bg-white text-slate-900 border-slate-300 focus:border-sky-500"
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[11px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              Weight / Detail
                            </label>
                            <input
                              placeholder="e.g. 200 g, 1000 g"
                              value={variant.detail}
                              onChange={(e) =>
                                updateVariant(idx, "detail", e.target.value)
                              }
                              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
                                isDark
                                  ? "bg-[#0B0F19] text-white border-slate-700 focus:border-sky-500"
                                  : "bg-white text-slate-900 border-slate-300 focus:border-sky-500"
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[11px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              Carton Packing
                            </label>
                            <input
                              placeholder="e.g. 36 pcs/ctn"
                              value={variant.packing}
                              onChange={(e) =>
                                updateVariant(idx, "packing", e.target.value)
                              }
                              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
                                isDark
                                  ? "bg-[#0B0F19] text-white border-slate-700 focus:border-sky-500"
                                  : "bg-white text-slate-900 border-slate-300 focus:border-sky-500"
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[11px] font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              Factory Price (Rs.)
                            </label>
                            <input
                              placeholder="Price"
                              type="number"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(idx, "price", e.target.value)
                              }
                              className={`w-full px-3 py-2 border rounded-lg text-sm font-bold font-mono outline-none transition-colors ${
                                isDark
                                  ? "bg-[#0B0F19] text-sky-400 border-slate-700 focus:border-sky-500"
                                  : "bg-white text-sky-600 border-slate-300 focus:border-sky-500"
                              }`}
                            />
                          </div>
                          <div className="flex md:items-end md:justify-end pt-2 md:pt-4">
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                                isDark
                                  ? "border-red-900/50 text-red-400 hover:bg-red-950/40"
                                  : "border-red-200 text-red-600 hover:bg-red-50"
                              }`}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addVariant}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all mt-2 ${
                          isDark
                            ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                        }`}
                      >
                        <FaPlus className="text-xs text-sky-500" />
                        <span>Add Another SKU / Size Variant</span>
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>
                      Variant Images (Name + Image)
                    </label>
                    <p className="text-xs text-slate-500 mb-2">
                      Add labels like 1 KG / 500 G and upload or paste image URL for each.
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
                            className={inputCls}
                          />
                          <input
                            placeholder="Image URL (optional)"
                            value={variantImage.image}
                            onChange={(e) =>
                              updateVariantImage(idx, "image", e.target.value)
                            }
                            className={inputCls}
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
                            className={inputCls}
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(idx)}
                            className={removeBtnCls}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addVariantImage}
                        className={addSubBtnCls}
                      >
                        + Add Variant Image
                      </button>
                    </div>
                  </div>
                </>
              )}

              {form.productType === "matches" && (
                <div className="md:col-span-2">
                  <label className={labelCls}>Matches List</label>
                  <div className="space-y-4">
                    {form.brands.map((brand, bIdx) => (
                      <div
                        key={`b-${bIdx}`}
                        className={`p-4 rounded-xl space-y-4 border ${
                          isDark ? "border-slate-800 bg-[#161D2E]" : "border-slate-200 bg-white shadow-2xs"
                        }`}
                      >
                        <div className={`flex justify-between items-center border-b pb-2 ${
                          isDark ? "border-slate-800" : "border-slate-200"
                        }`}>
                          <h4 className={`font-bold text-sm ${isDark ? "text-amber-400" : "text-amber-800"}`}>
                            Match #{bIdx + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeBrand(bIdx)}
                            className={removeBtnCls}
                          >
                            Remove Match
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Brand Name</label>
                            <input
                              placeholder="e.g. Kite Safety Matches"
                              value={brand.name}
                              onChange={(e) => updateBrand(bIdx, 'name', e.target.value)}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Tagline (Urdu/English)</label>
                            <input
                              placeholder="e.g. پل میں روشن دیر پا شعلہ"
                              value={brand.tagline || ''}
                              onChange={(e) => updateBrand(bIdx, 'tagline', e.target.value)}
                              className={inputCls}
                              dir="auto"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}>Description</label>
                          <textarea
                            placeholder="Description"
                            value={brand.description}
                            onChange={(e) => updateBrand(bIdx, 'description', e.target.value)}
                            rows={2}
                            className={inputCls}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Match Image URL (optional)</label>
                            <input
                              placeholder="URL"
                              value={brand.image}
                              onChange={(e) => updateBrand(bIdx, 'image', e.target.value)}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Upload Match Image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => updateBrandImageFile(bIdx, e.target.files?.[0] || null)}
                              className={inputCls}
                            />
                          </div>
                        </div>

                        <div className={`p-3.5 rounded-xl space-y-2 border ${
                          isDark ? "bg-[#0B0F19]/60 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}>
                          <label className={`block font-semibold text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            Key Features
                          </label>
                          {(brand.features || []).map((feature, fIdx) => (
                            <div key={`bf-${bIdx}-${fIdx}`} className="flex gap-2">
                              <input
                                value={feature}
                                onChange={(e) => updateBrandFeature(bIdx, fIdx, e.target.value)}
                                placeholder="e.g. Premium Quality"
                                className={`flex-1 ${inputCls}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeBrandFeature(bIdx, fIdx)}
                                className={removeBtnCls}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addBrandFeature(bIdx)}
                            className={addSubBtnCls}
                          >
                            + Add Feature
                          </button>
                        </div>

                        <div className={`p-3.5 rounded-xl space-y-2 border ${
                          isDark ? "bg-[#0B0F19]/60 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}>
                          <label className={`block font-semibold text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            Match Variants
                          </label>
                          {brand.variants.map((v, vIdx) => (
                            <div key={`bv-${bIdx}-${vIdx}`} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                              <input
                                placeholder="Name (e.g. LARGE)"
                                value={v.name}
                                onChange={(e) => updateBrandVariant(bIdx, vIdx, 'name', e.target.value)}
                                className={inputCls}
                              />
                              <input
                                placeholder="Detail"
                                value={v.detail}
                                onChange={(e) => updateBrandVariant(bIdx, vIdx, 'detail', e.target.value)}
                                className={inputCls}
                              />
                              <input
                                placeholder="Packing"
                                value={v.packing}
                                onChange={(e) => updateBrandVariant(bIdx, vIdx, 'packing', e.target.value)}
                                className={inputCls}
                              />
                              <input
                                placeholder="Price"
                                type="number"
                                value={v.price}
                                onChange={(e) => updateBrandVariant(bIdx, vIdx, 'price', e.target.value)}
                                className={inputCls}
                              />
                              <button
                                type="button"
                                onClick={() => removeBrandVariant(bIdx, vIdx)}
                                className={removeBtnCls}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addBrandVariant(bIdx)}
                            className={addSubBtnCls}
                          >
                            + Add Variant
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addBrand}
                      className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-[#00AEEF] hover:bg-[#0095CC] transition-colors cursor-pointer"
                    >
                      + Add Another Match
                    </button>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className={labelCls}>Facilities</label>
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
                        className={inputCls}
                      />
                      <input
                        placeholder="Location"
                        value={facility.location}
                        onChange={(e) =>
                          updateFacility(idx, "location", e.target.value)
                        }
                        className={inputCls}
                      />
                      <input
                        placeholder="Note"
                        value={facility.note}
                        onChange={(e) =>
                          updateFacility(idx, "note", e.target.value)
                        }
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => removeFacility(idx)}
                        className={removeBtnCls}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFacility}
                    className={addSubBtnCls}
                  >
                    + Add Facility
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
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

              <div className="flex items-end gap-3 pt-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#00AEEF] hover:bg-[#0095CC] shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-60"
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
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
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
