'use client';

import { useEffect, useState, useRef } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import RequireAdminAuth from "../components/admin/RequireAdminAuth";
import { getSettings, adminUpdateSettings } from "../services/api";
import { useAdminTheme } from "../context/AdminThemeContext";
import { FaImage, FaTruck, FaVideo, FaUpload, FaCheck, FaInfoCircle, FaExternalLinkAlt } from "react-icons/fa";

const ALL_PREMIUM_BUNDLES = [
  { id: "pkg-glow-family-pack", name: "Glow Family Pack", price: 2250, desc: "7 Items • Bottom Bundle #7" },
  { id: "pkg-glow-bachat-mega", name: "Glow Bachat Mega", price: 2400, desc: "9 Items • Bottom Bundle #8" },
  { id: "pkg-vero-family-pack", name: "Vero Family Pack", price: 2950, desc: "6 Items • Bottom Bundle #9" },
];

const AdminSettingsPage = () => {
  const { isDark } = useAdminTheme();
  const [activeTab, setActiveTab] = useState("banner"); // 'banner' or 'shipping'
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Shipping form state
  const [defaultShippingCost, setDefaultShippingCost] = useState(200);
  const [smallPackageShippingCost, setSmallPackageShippingCost] = useState(200);
  const [freeShippingBundleIds, setFreeShippingBundleIds] = useState([
    "pkg-glow-family-pack",
    "pkg-glow-bachat-mega",
    "pkg-vero-family-pack",
  ]);

  // Banner form state
  const [bannerType, setBannerType] = useState("video"); // 'video' or 'image'
  const [bannerImage, setBannerImage] = useState("");
  const [bannerMobileImage, setBannerMobileImage] = useState("");
  const [bannerTitle, setBannerTitle] = useState("Kite Brand Pakistan");
  const [bannerLink, setBannerLink] = useState("/online-order");
  
  // File uploads
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerMobileImageFile, setBannerMobileImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState("");
  const [bannerMobilePreview, setBannerMobilePreview] = useState("");

  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSettings();
      setSettings(data);

      setDefaultShippingCost(data.defaultShippingCost ?? 200);
      setSmallPackageShippingCost(data.smallPackageShippingCost ?? 200);
      setFreeShippingBundleIds(
        Array.isArray(data.freeShippingBundleIds) && data.freeShippingBundleIds.length > 0
          ? data.freeShippingBundleIds
          : ["pkg-glow-family-pack", "pkg-glow-bachat-mega", "pkg-vero-family-pack"]
      );

      setBannerType(data.bannerType || "video");
      setBannerImage(data.bannerImage || "");
      setBannerMobileImage(data.bannerMobileImage || "");
      setBannerTitle(data.bannerTitle || "Kite Brand Pakistan");
      setBannerLink(data.bannerLink || "/online-order");
      setBannerImagePreview(data.bannerImage || "");
      setBannerMobilePreview(data.bannerMobileImage || "");
    } catch (err) {
      setError(err.message || "Failed to load store settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDesktopFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setBannerImagePreview(objectUrl);
      setBannerType("image");
    }
  };

  const handleMobileFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerMobileImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setBannerMobilePreview(objectUrl);
    }
  };

  const toggleBundleFreeShipping = (bundleId) => {
    setFreeShippingBundleIds((prev) => {
      if (prev.includes(bundleId)) {
        return prev.filter((id) => id !== bundleId);
      } else {
        return [...prev, bundleId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // An empty field would be saved as Rs 0 (free delivery for every order) — require explicit values.
    const invalidShipping = [defaultShippingCost, smallPackageShippingCost].some(
      (v) => String(v ?? "").trim() === "" || !Number.isFinite(Number(v)) || Number(v) < 0
    );
    if (invalidShipping) {
      setError("Please enter valid delivery charges (0 or more). Use 0 only if delivery should be free.");
      return;
    }
    if (bannerLink && !/^(\/(?!\/)|https?:\/\/)/i.test(String(bannerLink).trim())) {
      setError('Banner link must start with "/" (a page on this site) or "https://".');
      return;
    }

    setSaving(true);

    try {
      let payload;
      if (bannerImageFile || bannerMobileImageFile) {
        payload = new FormData();
        payload.append("defaultShippingCost", String(defaultShippingCost));
        payload.append("smallPackageShippingCost", String(smallPackageShippingCost));
        payload.append("freeShippingBundleIds", JSON.stringify(freeShippingBundleIds));
        payload.append("bannerType", bannerType);
        payload.append("bannerTitle", bannerTitle);
        payload.append("bannerLink", bannerLink);
        payload.append("bannerImage", bannerImage);
        payload.append("bannerMobileImage", bannerMobileImage);

        if (bannerImageFile) payload.append("bannerImageFile", bannerImageFile);
        if (bannerMobileImageFile) payload.append("bannerMobileImageFile", bannerMobileImageFile);
      } else {
        payload = {
          defaultShippingCost: Number(defaultShippingCost),
          smallPackageShippingCost: Number(smallPackageShippingCost),
          freeShippingBundleIds,
          bannerType,
          bannerImage,
          bannerMobileImage,
          bannerTitle,
          bannerLink,
        };
      }

      await adminUpdateSettings(payload);
      setSuccess("Settings and banner updated successfully! Live website refreshed.");
      await load();
      setBannerImageFile(null);
      setBannerMobileImageFile(null);
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAdminAuth>
      <AdminLayout>
        <div className="flex flex-col gap-6 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                Store Configuration &amp; Banner
              </h1>
              <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Manage the homepage hero banner, nationwide delivery charges, and free-shipping eligibility.
              </p>
            </div>

            {/* View Live Site Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-sky-400/40 text-[#00AEEF] hover:bg-[#00AEEF]/10 transition-colors w-fit"
            >
              <span>View Live Website</span>
              <FaExternalLinkAlt className="text-[10px]" />
            </a>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("banner")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === "banner"
                  ? "bg-[#00AEEF] text-white shadow-md shadow-[#00AEEF]/20"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FaImage className="text-xs" />
              <span>Homepage Banner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("shipping")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === "shipping"
                  ? "bg-[#00AEEF] text-white shadow-md shadow-[#00AEEF]/20"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FaTruck className="text-xs" />
              <span>Shipping &amp; Free Delivery</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
              <FaInfoCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <FaCheck />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className={`py-12 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <div className="inline-block w-6 h-6 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading store settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ============================================================ */}
              {/* TAB 1: HOMEPAGE BANNER MANAGEMENT */}
              {/* ============================================================ */}
              {activeTab === "banner" && (
                <div className={`border rounded-2xl p-6 md:p-8 shadow-sm transition-colors ${
                  isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
                }`}>
                  <div className="mb-6">
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Homepage Banner Management
                    </h2>
                    <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Switch between the high-definition brand motion video banner and a custom banner image.
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div
                      onClick={() => setBannerType("video")}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        bannerType === "video"
                          ? "border-[#00AEEF] bg-[#00AEEF]/10 shadow-sm"
                          : isDark
                          ? "border-[#1E293B] hover:border-slate-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaVideo className="text-xl text-[#00AEEF]" />
                        <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                          Brand Motion Video
                        </h3>
                      </div>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Plays the official autoplay <code>Kite Motion Banner.mp4</code> video with cinematic branding.
                      </p>
                    </div>

                    <div
                      onClick={() => setBannerType("image")}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        bannerType === "image"
                          ? "border-[#00AEEF] bg-[#00AEEF]/10 shadow-sm"
                          : isDark
                          ? "border-[#1E293B] hover:border-slate-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaImage className="text-xl text-[#00AEEF]" />
                        <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                          Custom Image Banner
                        </h3>
                      </div>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Display the official client-provided banner image (responsive on desktop &amp; mobile).
                      </p>
                    </div>
                  </div>

                  {/* Image Upload & Settings (Visible when Image mode is selected) */}
                  {bannerType === "image" && (
                    <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                      {/* Desktop Banner Upload */}
                      <div>
                        <label className={`block font-semibold text-xs uppercase tracking-wider mb-2 ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                          Desktop Banner Image (1920 × 640 or high-res recommended)
                        </label>

                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          <input
                            type="file"
                            ref={desktopFileInputRef}
                            accept="image/*"
                            onChange={handleDesktopFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => desktopFileInputRef.current?.click()}
                            className="px-4 py-2.5 rounded-xl border border-dashed border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF]/10 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FaUpload />
                            <span>Upload New Desktop Banner</span>
                          </button>

                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              value={bannerImage}
                              onChange={(e) => {
                                setBannerImage(e.target.value);
                                setBannerImagePreview(e.target.value);
                              }}
                              placeholder="Or enter direct image URL (e.g. /images/banner.jpg)"
                              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00AEEF] ${
                                isDark ? "bg-[#0B0F19] border-[#1E293B] text-white" : "bg-white border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Desktop Preview */}
                        {bannerImagePreview && (
                          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black max-h-56 relative group">
                            <img
                              src={bannerImagePreview}
                              alt="Banner Preview"
                              className="w-full h-auto object-cover max-h-56"
                            />
                            <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                              Desktop Preview
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Optional Mobile Banner Upload */}
                      <div>
                        <label className={`block font-semibold text-xs uppercase tracking-wider mb-2 ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                          Mobile Banner Image (Optional • 640 × 640 or square recommended)
                        </label>

                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          <input
                            type="file"
                            ref={mobileFileInputRef}
                            accept="image/*"
                            onChange={handleMobileFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => mobileFileInputRef.current?.click()}
                            className="px-4 py-2.5 rounded-xl border border-dashed border-slate-400 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FaUpload />
                            <span>Upload Mobile Banner</span>
                          </button>

                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              value={bannerMobileImage}
                              onChange={(e) => {
                                setBannerMobileImage(e.target.value);
                                setBannerMobilePreview(e.target.value);
                              }}
                              placeholder="Optional mobile image URL (fallback uses desktop)"
                              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00AEEF] ${
                                isDark ? "bg-[#0B0F19] border-[#1E293B] text-white" : "bg-white border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                        </div>

                        {bannerMobilePreview && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black max-w-xs relative">
                            <img
                              src={bannerMobilePreview}
                              alt="Mobile Preview"
                              className="w-full h-auto object-cover max-h-48"
                            />
                            <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                              Mobile Preview
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Banner Link & Title */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={`block font-semibold text-xs uppercase tracking-wider mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}>
                            Banner Alt Text / Title
                          </label>
                          <input
                            type="text"
                            value={bannerTitle}
                            onChange={(e) => setBannerTitle(e.target.value)}
                            placeholder="e.g. Kite Brand Pakistan"
                            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00AEEF] ${
                              isDark ? "bg-[#0B0F19] border-[#1E293B] text-white" : "bg-white border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold text-xs uppercase tracking-wider mb-2 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}>
                            Banner Click Link
                          </label>
                          <input
                            type="text"
                            value={bannerLink}
                            onChange={(e) => setBannerLink(e.target.value)}
                            placeholder="/online-order"
                            className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00AEEF] ${
                              isDark ? "bg-[#0B0F19] border-[#1E293B] text-white" : "bg-white border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* TAB 2: SHIPPING CHARGES & FREE DELIVERY POLICY */}
              {/* ============================================================ */}
              {activeTab === "shipping" && (
                <div className={`border rounded-2xl p-6 md:p-8 shadow-sm transition-colors ${
                  isDark ? "bg-[#111726] border-[#1E293B]" : "bg-white border-slate-200"
                }`}>
                  <div className="mb-6">
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Nationwide Shipping &amp; Free Delivery Policy
                    </h2>
                    <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Configure standard delivery fees and manage which specific packages qualify for free shipping.
                    </p>
                  </div>

                  {/* Strict Policy Banner */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs leading-relaxed mb-6 flex items-start gap-3">
                    <FaInfoCircle className="text-base text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Strict Business Shipping Policy:</strong>
                      <p className="mt-1">
                        1. <strong>Packages 1, 2, 3, 4, 5, 6:</strong> Standard shipping fee of Rs. 200 is always charged.<br />
                        2. <strong>Free Shipping Eligibility:</strong> Applies ONLY to the 3 specific premium bundles selected below.<br />
                        3. <strong>Regular Products:</strong> Individual catalog items (even if priced above Rs. 2,000) are NEVER given free shipping automatically.
                      </p>
                    </div>
                  </div>

                  {/* Standard Rates Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div>
                      <label className={`block mb-2 font-semibold text-xs uppercase tracking-wider ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}>
                        Standard General Shipping (Rs)
                      </label>
                      <input
                        type="number"
                        value={defaultShippingCost}
                        onChange={(e) => setDefaultShippingCost(Number(e.target.value))}
                        required
                        min="0"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition-colors ${
                          isDark
                            ? "bg-[#0B0F19] border-[#1E293B] text-white"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      />
                      <p className={`text-[11px] mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Applied to regular product purchases and general checkout items.
                      </p>
                    </div>

                    <div>
                      <label className={`block mb-2 font-semibold text-xs uppercase tracking-wider ${
                        isDark ? "text-slate-200" : "text-slate-700"
                      }`}>
                        Small Package Shipping (Rs)
                      </label>
                      <input
                        type="number"
                        value={smallPackageShippingCost}
                        onChange={(e) => setSmallPackageShippingCost(Number(e.target.value))}
                        required
                        min="0"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition-colors ${
                          isDark
                            ? "bg-[#0B0F19] border-[#1E293B] text-white"
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      />
                      <p className={`text-[11px] mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Applied to small packages (e.g. Kite Affordable for All = Rs. 400 + Rs. 200 = Rs. 600).
                      </p>
                    </div>
                  </div>

                  {/* Free Shipping Bundles Selector */}
                  <div>
                    <label className={`block mb-3 font-semibold text-xs uppercase tracking-wider ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}>
                      Authorized Free Shipping Bundles (Client Specified)
                    </label>

                    <div className="space-y-3">
                      {ALL_PREMIUM_BUNDLES.map((bundle) => {
                        const isChecked = freeShippingBundleIds.includes(bundle.id);
                        return (
                          <div
                            key={bundle.id}
                            onClick={() => toggleBundleFreeShipping(bundle.id)}
                            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isChecked
                                ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                                : isDark
                                ? "border-[#1E293B] hover:border-slate-700 bg-[#0B0F19]"
                                : "border-slate-200 hover:border-slate-300 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // handled by parent div
                                className="w-4 h-4 rounded text-[#00AEEF] focus:ring-[#00AEEF] cursor-pointer"
                              />
                              <div>
                                <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                  {bundle.name}
                                </h4>
                                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                  {bundle.desc} • Price: Rs. {bundle.price.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              isChecked
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {isChecked ? "Free Delivery Active" : "Rs. 200 Shipping"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-[#00AEEF] to-[#0095CC] text-white rounded-xl font-bold shadow-md shadow-[#00AEEF]/20 hover:opacity-95 transition-all disabled:opacity-70 cursor-pointer text-sm flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>

                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Changes take effect immediately on kitepk.com.
                </p>
              </div>
            </form>
          )}
        </div>
      </AdminLayout>
    </RequireAdminAuth>
  );
};

export default AdminSettingsPage;
