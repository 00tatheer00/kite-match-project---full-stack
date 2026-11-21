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
  FaCheck,
  FaPhoneAlt,
  FaClock
} from "react-icons/fa";
import { useEffect, useState, useMemo } from "react";
import { getPromotions, getProducts } from "../services/api";
import { useCart } from "../context/CartContext";

const PromotionsPackagesSection = ({ initialPackages = [], initialProducts = [] }) => {
  const { addToCart, addPromotionToCart, openCart, cartItems } = useCart();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  const [packages, setPackages] = useState(initialPackages || []);
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState((!initialPackages || initialPackages.length === 0) && (!initialProducts || initialProducts.length === 0));
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState({});
  const [addedItemKey, setAddedItemKey] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      // Only show the loading state when the server didn't already render data.
      if (!(initialPackages?.length || initialProducts?.length)) setLoading(true);
      try {
        const [promoData, prodData] = await Promise.allSettled([
          getPromotions(),
          getProducts()
        ]);
        if (mounted) {
          // On a failed refresh keep what we already have instead of emptying the page.
          if (promoData.status === 'fulfilled' && Array.isArray(promoData.value)) setPackages(promoData.value);
          if (prodData.status === 'fulfilled' && Array.isArray(prodData.value)) setProducts(prodData.value);
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
      const hasBrands = Array.isArray(prod.brands) && prod.brands.length > 0;
      // Main product variants (skipped for products sold per brand, e.g. safety matches,
      // so there are no generic "collection" cards next to the real brand cards)
      if (!hasBrands && Array.isArray(prod.variants) && prod.variants.length > 0) {
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
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online Orders Active • Nationwide Delivery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#222222] tracking-tight mb-4 flex items-center justify-center gap-3 flex-wrap">
            <span>Online <span className="text-[#00AEEF]">Order</span></span>
            <span className="text-xs sm:text-sm font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 tracking-wide">
              Order Now
            </span>
          </h1>

          <p className="text-[#666666] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            Factory rates par hamara catalog browse karein, items ko direct Cart mein add karein aur online order place karein. Nationwide Cash on Delivery available hai!
          </p>

          {/* Customer Helpline & Support Banner */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg mx-auto mb-8">
            <div className="bg-white text-[#222222] border border-gray-200 px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs">
              <FaPhoneAlt className="text-xs text-[#00AEEF]" />
              <span>Customer Helpline: 0301 8117666</span>
            </div>
            <div className="bg-[#EAF8FE] text-[#00AEEF] px-4 py-2.5 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5 border border-[#00AEEF]/20">
              <FaTruck className="text-xs" />
              <span>Nationwide Cash on Delivery</span>
            </div>
          </div>

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
                              src={
                                index === 0 || pkg.id === 'pkg-kite-smart-starter'
                                  ? '/packages-image/kite-smart-starter-v3.jpeg?v=20261119'
                                  : pkg.image?.src || pkg.image
                              }
                              alt={pkg.title}
                              loading="eager"
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
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2.5 leading-tight">
                            {pkg.title}
                          </h3>
                          {pkg.description && (
                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-5 font-normal">
                              {pkg.description}
                            </p>
                          )}

                          {/* Included Items List */}
                          <div className="mb-6">
                            <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-3">
                              Items Included in this Package:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(pkg.items || []).map((item, itemIdx) => (
                                <div
                                  key={itemIdx}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs"
                                >
                                  <FaCheckCircle className="text-[#00AEEF] text-base flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                      {item.product}
                                    </p>
                                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                                      Quantity: <span className="font-black text-[#00AEEF] text-sm px-1.5 py-0.5 rounded bg-sky-50 border border-sky-100">{item.quantity}</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Price & Add to Cart Action */}
                        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                          <div>
                            <p className="text-sm font-bold text-slate-700 mb-1.5">
                              Total Quantity: <strong className="text-slate-950 font-black">{totals.totalQuantity} items</strong>
                            </p>
                            <div className="flex flex-wrap items-baseline gap-2.5 mb-2">
                              {pkg.originalPrice && (
                                <span className="text-base sm:text-lg font-bold text-slate-400 line-through">
                                  Original Price: {formatPrice(pkg.originalPrice)}
                                </span>
                              )}
                              {(pkg.discount || (pkg.originalPrice && totals.totalPrice && pkg.originalPrice > totals.totalPrice)) && (
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs sm:text-sm font-black bg-emerald-100 text-emerald-800 border-2 border-emerald-400 shadow-xs">
                                  You Save: {formatPrice(pkg.discount || (pkg.originalPrice - totals.totalPrice))}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-wider">Final Price:</span>
                              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-[#00AEEF] tracking-tight">
                                {formatPrice(totals.totalPrice)}
                              </p>
                              {pkg.shippingCost === 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                                  <FaTruck className="text-xs" />
                                  <span>Free Delivery</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-slate-100 text-slate-800 border border-slate-300">
                                  <FaTruck className="text-xs text-slate-500" />
                                  <span>Delivery: Rs. {pkg.shippingCost || 200}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            {/* Quantity Selector */}
                            <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs h-11">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(pkgKey, -1)}
                                className="w-10 h-full flex items-center justify-center text-slate-700 hover:bg-slate-100 font-black text-lg transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="w-10 text-center text-sm sm:text-base font-black text-slate-900 font-mono">
                                {getItemQty(pkgKey)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(pkgKey, 1)}
                                className="w-10 h-full flex items-center justify-center text-slate-700 hover:bg-slate-100 font-black text-lg transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              type="button"
                              onClick={() => handleBuyPromotion(pkg)}
                              className={`px-8 py-3 rounded-xl font-black text-sm sm:text-base text-white flex items-center gap-2.5 transition-all shadow-md cursor-pointer ${
                                isJustAdded
                                  ? "bg-emerald-600 hover:bg-emerald-700"
                                  : "bg-[#00AEEF] hover:bg-[#0095CC] active:scale-95 shadow-sky-500/20"
                              }`}
                              title="Add package to cart"
                            >
                              <FaShoppingCart className="text-sm" />
                              <span>{isJustAdded ? "Added to Cart!" : "Add to Cart"}</span>
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
                            className="text-xs font-black px-2.5 py-1 rounded-lg text-white shadow-xs uppercase tracking-wider"
                            style={{ backgroundColor: sku.color || "#00AEEF" }}
                          >
                            {sku.category}
                          </span>
                        </div>

                        {/* Packing pill if available */}
                        {sku.variant.packing && (
                          <div className="absolute bottom-2.5 left-2.5 right-2.5">
                            <span className="text-xs bg-white/95 backdrop-blur-xs text-slate-700 font-black px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs inline-block truncate max-w-full">
                              📦 {sku.variant.packing}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="p-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {sku.brandName}
                        </p>
                        
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                            {sku.variant.name}
                          </h3>
                          {sku.variant.detail && (
                            <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                              {sku.variant.detail}
                            </span>
                          )}
                        </div>

                        {sku.tagline && (
                          <p className="text-xs sm:text-sm text-slate-600 italic line-clamp-1 mb-2 font-medium">
                            {sku.tagline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Pricing & Actions */}
                    <div className="p-4 pt-0">
                      <div className="flex items-baseline justify-between mb-3 border-t border-slate-100 pt-3">
                        <span className="text-sm font-black text-slate-700">Factory Price:</span>
                        <span className="text-2xl sm:text-3xl font-black text-[#00AEEF] tracking-tight">
                          {formatPrice(sku.variant.price)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        {/* Add to Cart Button */}
                        <button
                          type="button"
                          onClick={() => handleBuySku(sku.product, sku.variant, sku.brandName)}
                          className={`w-full py-3 px-4 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer ${
                            isJustAdded
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-[#00AEEF] hover:bg-[#0095CC] active:scale-95 shadow-sky-500/20"
                          }`}
                          title="Add SKU to cart"
                        >
                          <FaShoppingCart className="text-sm" />
                          <span>{isJustAdded ? "Added to Cart!" : "Add to Cart"}</span>
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
