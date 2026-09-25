'use client';

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  FaShoppingCart, 
  FaCheckCircle, 
  FaGift, 
  FaBoxOpen, 
  FaTruck, 
  FaShieldAlt, 
  FaTag, 
  FaSearch, 
  FaCheck 
} from "react-icons/fa";
import { useEffect, useState, useMemo } from "react";
import { getPromotions, getProducts } from "../services/api";
import { useCart } from "../context/CartContext";

const PromotionsPackagesSection = () => {
  const { addToCart, addPromotionToCart, openCart, cartItems } = useCart();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState({});
  const [addedItemKey, setAddedItemKey] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [promoData, prodData] = await Promise.allSettled([
          getPromotions(),
          getProducts()
        ]);
        if (mounted) {
          setPackages(promoData.status === 'fulfilled' && Array.isArray(promoData.value) ? promoData.value : []);
          setProducts(prodData.status === 'fulfilled' && Array.isArray(prodData.value) ? prodData.value : []);
        }
      } catch (err) {
        console.error("Failed to load online order data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getComputedTotals = (pkg) => {
    const items = pkg.items || [];
    const totalQuantity = items.reduce(
      (sum, item) => sum + (Number(item?.quantity) || 0),
      0
    );
    const totalPrice = items.reduce(
      (sum, item) =>
        sum + ((Number(item?.quantity) || 0) * (Number(item?.price) || 0)),
      0
    );
    return {
      totalQuantity: totalQuantity || Number(pkg.totalQuantity) || 0,
      totalPrice: totalPrice || Number(pkg.totalPrice) || 0,
    };
  };

  const getItemQty = (id) => quantities[id] ?? 1;

  const handleQtyChange = (id, delta) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = Math.max(1, Math.min(500, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleBuyPromotion = (pkg) => {
    const totals = getComputedTotals(pkg);
    const qty = getItemQty(`promo-${pkg.id}`);
    addPromotionToCart(pkg, totals.totalPrice, qty);
    setAddedItemKey(`promo-${pkg.id}`);
    setTimeout(() => setAddedItemKey(null), 1500);
  };

  const handleBuySku = (product, variant, brandName = null) => {
    const key = `sku-${product.id}-${variant.name}`;
    const qty = getItemQty(key);
    addToCart(product, brandName || product.title, variant, qty);
    setAddedItemKey(key);
    setTimeout(() => setAddedItemKey(null), 1500);
  };

  // Flatten all SKUs across all products
  const allSkus = useMemo(() => {
    const list = [];
    products.forEach((prod) => {
      // Main product variants
      if (Array.isArray(prod.variants) && prod.variants.length > 0) {
        prod.variants.forEach((v) => {
          const matchedImg = prod.variantImages?.find(
            (vi) => vi?.name?.trim().toLowerCase() === v?.name?.trim().toLowerCase()
          )?.image;
          list.push({
            id: `${prod.id}-${v.name}`,
            product: prod,
            brandName: prod.title,
            variant: v,
            category: prod.category || prod.navGroup || "Detergents",
            image: matchedImg || prod.image,
            tagline: prod.tagline || "",
            color: prod.color || "#00AEEF",
          });
        });
      }

      // Brand specific variants (e.g. for safety matches sub-brands like Kite, Olympia, Party)
      if (Array.isArray(prod.brands) && prod.brands.length > 0) {
        prod.brands.forEach((brand) => {
          if (Array.isArray(brand.variants)) {
            brand.variants.forEach((v) => {
              list.push({
                id: `${prod.id}-${brand.name}-${v.name}`,
                product: prod,
                brandName: brand.name,
                variant: v,
                category: "Safety Matches",
                image: brand.image || prod.image,
                tagline: brand.tagline || "",
                color: "#ED028C",
              });
            });
          }
        });
      }
    });
    return list;
  }, [products]);

  // Categories for filtering
  const filterTabs = [
    { id: "all", label: "All Items", count: allSkus.length + packages.length },
    { id: "packages", label: "Special Packages & Deals", count: packages.length },
    { id: "kite-glow", label: "Kite Glow Detergent", count: allSkus.filter(s => s.product?.id === 'kite-glow').length },
    { id: "burq", label: "BURQ Action Detergent", count: allSkus.filter(s => s.product?.id === 'burq-action').length },
    { id: "vero", label: "Vero Detergent", count: allSkus.filter(s => s.product?.id === 'vero').length },
    { id: "dish-wash", label: "Kite Dish Wash Bar", count: allSkus.filter(s => s.product?.id === 'dish-wash-bar').length },
    { id: "safety-matches", label: "Safety Matches", count: allSkus.filter(s => s.category === 'Safety Matches').length },
  ];

  // Filtered SKUs based on active tab and search query
  const filteredSkus = useMemo(() => {
    if (activeTab === "packages") return [];

    let list = allSkus;
    if (activeTab === "kite-glow") list = list.filter(s => s.product?.id === 'kite-glow');
    else if (activeTab === "burq") list = list.filter(s => s.product?.id === 'burq-action');
    else if (activeTab === "vero") list = list.filter(s => s.product?.id === 'vero');
    else if (activeTab === "dish-wash") list = list.filter(s => s.product?.id === 'dish-wash-bar');
    else if (activeTab === "safety-matches") list = list.filter(s => s.category === 'Safety Matches');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.brandName.toLowerCase().includes(q) ||
        s.variant.name.toLowerCase().includes(q) ||
        (s.variant.detail || "").toLowerCase().includes(q) ||
        (s.category || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allSkus, activeTab, searchQuery]);

  // Filtered Packages
  const filteredPackages = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "packages") return [];
    if (!searchQuery.trim()) return packages;
    const q = searchQuery.toLowerCase();
    return packages.filter(p => 
      p.title.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.items || []).some(item => item.product?.toLowerCase().includes(q))
    );
  }, [packages, activeTab, searchQuery]);

  const totalCartCount = useMemo(() => {
    return (cartItems || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }, [cartItems]);

  return (
    <section ref={ref} className="py-12 md:py-16 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#EAF8FE] border border-[#00AEEF]/20 text-[#0095CC] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 shadow-sm">
            <FaBoxOpen className="text-sm text-[#00AEEF]" />
            <span>Official Factory Direct Store • Nationwide Delivery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#222222] tracking-tight mb-4">
            Online <span className="text-[#00AEEF]">Order</span>
          </h1>

          <p className="text-[#666666] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Order every single SKU and special value pack directly from Kite Match &amp; Detergent Factory. Guaranteed genuine products at factory prices with cash on delivery.
          </p>

          {/* Trust Highlights */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-3.5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-[#EAF8FE] text-[#00AEEF] flex items-center justify-center flex-shrink-0 text-base">
                <FaTruck />
              </div>
              <div>
                <p className="text-xs font-bold text-[#222222]">Nationwide Delivery</p>
                <p className="text-[11px] text-[#777777]">Direct to your doorstep</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-pink-50 text-[#ED028C] flex items-center justify-center flex-shrink-0 text-base">
                <FaTag />
              </div>
              <div>
                <p className="text-xs font-bold text-[#222222]">Factory Rates</p>
                <p className="text-[11px] text-[#777777]">Best value guaranteed</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 text-base">
                <FaShieldAlt />
              </div>
              <div>
                <p className="text-xs font-bold text-[#222222]">100% Genuine</p>
                <p className="text-[11px] text-[#777777]">Factory fresh stocks</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 text-base">
                <FaGift />
              </div>
              <div>
                <p className="text-xs font-bold text-[#222222]">Cash on Delivery</p>
                <p className="text-[11px] text-[#777777]">Pay upon receipt</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs & Search Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {filterTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? "bg-[#00AEEF] text-white shadow-md shadow-[#00AEEF]/20 scale-102"
                        : "bg-white text-[#555555] hover:bg-[#F0F0F0] border border-[#E0E0E0]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-[#EEEEEE] text-[#777777]"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[220px] sm:min-w-[260px]">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU, weight or product..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#E0E0E0] text-xs sm:text-sm text-[#222222] placeholder-[#999999] focus:outline-none focus:border-[#00AEEF] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#999999] hover:text-[#333333]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#00AEEF] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-[#777777] font-medium">Loading products and online order catalog...</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: PACKAGES & DEALS (When active) */}
        {/* ========================================================================= */}
        {!loading && filteredPackages.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#222222] flex items-center gap-2">
                  <FaGift className="text-[#ED028C]" />
                  <span>Special Value Packages &amp; Bundles</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
                  Curated combination boxes offering the maximum savings for families and wholesalers
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-pink-50 text-[#ED028C] border border-pink-200 rounded-full">
                {filteredPackages.length} {filteredPackages.length === 1 ? 'Bundle' : 'Bundles'} Available
              </span>
            </div>

            <div className="space-y-8">
              {filteredPackages.map((pkg, index) => {
                const totals = getComputedTotals(pkg);
                const pkgKey = `promo-${pkg.id}`;
                const isJustAdded = addedItemKey === pkgKey;
                return (
                  <motion.div
                    key={pkg.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm hover:shadow-md transition-all overflow-hidden p-6 sm:p-8"
                  >
                    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                      {/* Package Image */}
                      <div className="w-full sm:w-72 lg:w-80 flex-shrink-0">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#F5F5F5] to-[#EEEEEE] border border-[#E5E5E5]">
                          {pkg.image ? (
                            <img
                              src={pkg.image?.src || pkg.image}
                              alt={pkg.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#BBBBBB]">
                              <FaGift className="text-5xl" />
                            </div>
                          )}
                          <span className="absolute top-3 left-3 bg-[#ED028C] text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                            Value Pack
                          </span>
                        </div>
                      </div>

                      {/* Package Details */}
                      <div className="flex-1 flex flex-col justify-between w-full h-full">
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-2">
                            {pkg.title}
                          </h3>
                          {pkg.description && (
                            <p className="text-sm text-[#666666] mb-4">
                              {pkg.description}
                            </p>
                          )}

                          {/* Included Items List */}
                          <div className="mb-6">
                            <h4 className="text-xs font-bold text-[#777777] uppercase tracking-wider mb-3">
                              Items Included in this Package:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {(pkg.items || []).map((item, itemIdx) => (
                                <div
                                  key={itemIdx}
                                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA]"
                                >
                                  <FaCheckCircle className="text-[#00AEEF] text-sm flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[#222222] truncate">
                                      {item.product}
                                    </p>
                                    <p className="text-[11px] text-[#777777]">
                                      Quantity: <span className="font-bold text-[#333333]">{item.quantity}</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Price & Add to Cart Action */}
                        <div className="pt-6 border-t border-[#EAEAEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-[#777777]">
                              Total Quantity: <strong className="text-[#222222]">{totals.totalQuantity} items</strong>
                            </p>
                            <p className="text-2xl sm:text-3xl font-black text-[#00AEEF]">
                              {formatPrice(totals.totalPrice)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Quantity Stepper */}
                            <div className="inline-flex items-center border border-[#D5D5D5] rounded-lg bg-white overflow-hidden shadow-xs">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(pkgKey, -1)}
                                disabled={getItemQty(pkgKey) <= 1}
                                className="w-9 h-10 flex items-center justify-center text-[#555555] hover:bg-[#F2F2F2] disabled:opacity-30 text-base font-bold transition-colors"
                              >
                                −
                              </button>
                              <span className="w-10 text-center text-xs font-bold text-[#222222]">
                                {getItemQty(pkgKey)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(pkgKey, 1)}
                                className="w-9 h-10 flex items-center justify-center text-[#555555] hover:bg-[#F2F2F2] text-base font-bold transition-colors"
                              >
                                +
                              </button>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              type="button"
                              onClick={() => handleBuyPromotion(pkg)}
                              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all duration-200 active:scale-95 ${
                                isJustAdded
                                  ? "bg-emerald-600 shadow-emerald-600/30"
                                  : "bg-[#ED028C] hover:bg-[#D4027D] shadow-[#ED028C]/25"
                              }`}
                            >
                              {isJustAdded ? (
                                <>
                                  <FaCheck className="text-xs" />
                                  <span>Added to Cart!</span>
                                </>
                              ) : (
                                <>
                                  <FaShoppingCart className="text-xs" />
                                  <span>Add Package to Cart</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: INDIVIDUAL SKUS GRID */}
        {/* ========================================================================= */}
        {!loading && filteredSkus.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#222222] flex items-center gap-2">
                  <FaBoxOpen className="text-[#00AEEF]" />
                  <span>Factory SKUs &amp; Individual Sizes</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
                  Select exact weights, pouch sizes, carton counts, and bar variants
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-[#00AEEF] border border-sky-200 rounded-full">
                {filteredSkus.length} {filteredSkus.length === 1 ? 'SKU' : 'SKUs'} Listed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredSkus.map((sku, index) => {
                const skuKey = `sku-${sku.product.id}-${sku.variant.name}`;
                const isJustAdded = addedItemKey === skuKey;
                const qty = getItemQty(skuKey);

                return (
                  <motion.div
                    key={sku.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: (index % 12) * 0.03 }}
                    className="bg-white rounded-xl border border-[#E5E5E5] hover:border-[#00AEEF]/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Product Image Area */}
                      <div className="relative aspect-square w-full bg-[#F7F7F7] flex items-center justify-center p-4 overflow-hidden border-b border-[#EFEFEF]">
                        {sku.image ? (
                          <img
                            src={sku.image?.src || sku.image}
                            alt={`${sku.brandName} - ${sku.variant.name}`}
                            loading="lazy"
                            decoding="async"
                            className="max-h-full max-w-full object-contain group-hover:scale-106 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-[#CCCCCC] text-4xl">
                            <FaBoxOpen />
                          </div>
                        )}

                        {/* Top Category Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-xs"
                            style={{ backgroundColor: sku.color || "#00AEEF" }}
                          >
                            {sku.category}
                          </span>
                        </div>

                        {/* Packing pill if available */}
                        {sku.variant.packing && (
                          <div className="absolute bottom-2 left-2.5 right-2.5">
                            <span className="text-[10px] bg-white/95 backdrop-blur-xs text-[#555555] font-semibold px-2 py-0.5 rounded border border-[#E0E0E0] shadow-xs inline-block truncate max-w-full">
                              📦 {sku.variant.packing}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="p-4">
                        <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
                          {sku.brandName}
                        </p>
                        
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-bold text-[#222222] leading-snug">
                            {sku.variant.name}
                          </h3>
                          {sku.variant.detail && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-[#F0F0F0] text-[#444444] rounded">
                              {sku.variant.detail}
                            </span>
                          )}
                        </div>

                        {sku.tagline && (
                          <p className="text-[11px] text-[#777777] italic line-clamp-1 mb-2">
                            {sku.tagline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Pricing & Actions */}
                    <div className="p-4 pt-0">
                      <div className="flex items-baseline justify-between mb-3 border-t border-[#F0F0F0] pt-3">
                        <span className="text-xs text-[#777777]">Factory Price:</span>
                        <span className="text-lg font-black text-[#00AEEF]">
                          {formatPrice(sku.variant.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quantity Stepper */}
                        <div className="inline-flex items-center border border-[#D5D5D5] rounded-md bg-white overflow-hidden flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(skuKey, -1)}
                            disabled={qty <= 1}
                            className="w-7 h-8 flex items-center justify-center text-[#555555] hover:bg-[#F2F2F2] disabled:opacity-30 text-sm font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#222222]">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(skuKey, 1)}
                            className="w-7 h-8 flex items-center justify-center text-[#555555] hover:bg-[#F2F2F2] text-sm font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Add to Cart button */}
                        <button
                          type="button"
                          onClick={() => handleBuySku(sku.product, sku.variant, sku.brandName)}
                          className={`flex-1 py-2 px-3 rounded-md font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shadow-sm ${
                            isJustAdded
                              ? "bg-emerald-600 shadow-emerald-600/30"
                              : "bg-[#00AEEF] hover:bg-[#0095CC] shadow-[#00AEEF]/20"
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <FaCheck className="text-[10px]" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <FaShoppingCart className="text-[10px]" />
                              <span>Order</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSkus.length === 0 && filteredPackages.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E5E5] p-8 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] text-[#999999] flex items-center justify-center mx-auto mb-3 text-xl">
              <FaSearch />
            </div>
            <h3 className="text-base font-bold text-[#222222] mb-1">No items found</h3>
            <p className="text-xs text-[#777777] mb-4">
              We couldn't find any products matching "{searchQuery}". Try searching for "1 kg", "bar", or reset filters.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
              className="text-xs font-semibold text-[#00AEEF] hover:underline"
            >
              Clear filters and show all products
            </button>
          </div>
        )}

        {/* Floating Quick Cart Bar (Mobile & Desktop) */}
        {totalCartCount > 0 && (
          <div className="fixed bottom-4 right-4 z-40">
            <button
              onClick={openCart}
              className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] text-white px-5 py-3 rounded-full shadow-2xl shadow-[#00AEEF]/40 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
            >
              <div className="relative">
                <FaShoppingCart className="text-base" />
                <span className="absolute -top-2 -right-2 bg-[#ED028C] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              </div>
              <span className="text-xs font-bold tracking-wide uppercase">View Cart &amp; Checkout</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default PromotionsPackagesSection;
