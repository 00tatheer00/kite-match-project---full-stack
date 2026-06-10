import { motion as Motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  FaFire,
  FaLayerGroup,
  FaArrowLeft,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
} from "react-icons/fa";
import { getProduct } from "../services/api";
import SeoHead from "../components/seo/SeoHead";
import StructuredData from "../components/seo/StructuredData";
import { SITE_URL, toAbsoluteUrl } from "../utils/seo";
import { useCart } from "../context/CartContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [brandVariantQuantities, setBrandVariantQuantities] = useState({});
  const [brandSelectedVariants, setBrandSelectedVariants] = useState({});
  const [addingToCart, setAddingToCart] = useState(false);
  const touchStartXRef = useRef(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
        const firstVariant =
          data?.variants?.[0]?.name ||
          data?.variantImages?.[0]?.name ||
          data?.sizes?.[0]?.size ||
          data?.skus?.[0]?.size ||
          "";
        setSelectedVariant(firstVariant);
        const firstImageIndex = (data?.variantImages || []).findIndex(
          (item) =>
            String(item?.name || "")
              .trim()
              .toLowerCase() ===
            String(firstVariant || "")
              .trim()
              .toLowerCase(),
        );
        setActiveImageIndex(firstImageIndex >= 0 ? firstImageIndex : 0);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const icon =
    product?.iconType === "fire" ? (
      <FaFire className="text-6xl" />
    ) : (
      <FaLayerGroup className="text-6xl" />
    );

  const productPath = `/products/${id}`;
  const canonicalUrl = toAbsoluteUrl(productPath);
  const productDescription =
    product?.description ||
    "Explore product details, features, and specifications from Kite Brand Pakistan.";
  const productImage =
    product?.image ||
    product?.images?.[0] ||
    "https://via.placeholder.com/1200x630";

  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: productDescription,
        image: [productImage],
        sku: product.id,
        category: product.category,
        brand: {
          "@type": "Brand",
          name: "Kite Brand",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "PKR",
          availability: "https://schema.org/InStock",
          url: canonicalUrl,
        },
      }
    : null;

  const breadcrumbSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Products",
            item: `${SITE_URL}/products`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.title,
            item: canonicalUrl,
          },
        ],
      }
    : null;

  if (loading) {
    return (
      <>
        <SeoHead title="Product Details" path={productPath} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#F9F9F9]">
          <div className="w-full max-w-5xl px-4">
            <div className="grid lg:grid-cols-2 gap-10 animate-pulse">
              <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] h-[360px] sm:h-[420px]" />
              <div className="space-y-4">
                <div className="h-6 bg-[#E5E5E5] rounded w-1/2" />
                <div className="h-10 bg-[#E5E5E5] rounded w-3/4" />
                <div className="h-4 bg-[#EFEFEF] rounded w-full" />
                <div className="h-4 bg-[#EFEFEF] rounded w-5/6" />
                <div className="h-4 bg-[#EFEFEF] rounded w-2/3" />
                <div className="h-12 bg-[#E5E5E5] rounded w-2/5" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <SeoHead title="Product Not Found" path={productPath} noindex />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#F9F9F9]">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#222222] mb-4">
              Product Not Found
            </h2>
            <Link
              to="/products"
              className="text-[#00AEEF] hover:text-[#ED028C] font-semibold"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  const sizeOrSkuOptions = [
    ...(product.variants || []).map((v) => v.name),
    ...(product.variantImages || []).map((v) => v.name),
    ...(product.sizes || []).map((s) => s.size),
    ...(product.skus || []).map((s) => s.size),
  ].filter(Boolean);
  const uniqueOptions = Array.from(new Set(sizeOrSkuOptions));
  const galleryItems =
    (product.variantImages || [])
      .filter((item) => item?.image)
      .map((item, idx) => ({
        name: item?.name || `Variant ${idx + 1}`,
        image: item.image,
      })) || [];

  const fallbackGalleryItems = Array.from(
    new Set([product.image, ...(product.images || [])].filter(Boolean)),
  ).map((image, idx) => ({
    name: `${product.title} ${idx + 1}`,
    image,
  }));

  const finalGalleryItems =
    galleryItems.length > 0 ? galleryItems : fallbackGalleryItems;

  const boundedActiveIndex = Math.min(
    activeImageIndex,
    Math.max(0, finalGalleryItems.length - 1),
  );

  const activeGalleryItem = finalGalleryItems[boundedActiveIndex] || {
    name: selectedVariant || product.title,
    image:
      product.image ||
      product.images?.[0] ||
      "https://via.placeholder.com/600x700/E0E0E0/666666?text=Product",
  };

  const displayImage = activeGalleryItem.image;

  const syncVariantByImageIndex = (index) => {
    const nextItem = finalGalleryItems[index];
    if (!nextItem?.name) return;
    const nextKey = String(nextItem.name).trim().toLowerCase();
    const matchedOption = uniqueOptions.find(
      (opt) =>
        String(opt || "")
          .trim()
          .toLowerCase() === nextKey,
    );
    if (matchedOption) {
      setSelectedVariant(matchedOption);
    }
  };

  const goToNextImage = () => {
    if (finalGalleryItems.length <= 1) return;
    setActiveImageIndex((prev) => {
      const nextIndex = (prev + 1) % finalGalleryItems.length;
      syncVariantByImageIndex(nextIndex);
      return nextIndex;
    });
  };

  const goToPreviousImage = () => {
    if (finalGalleryItems.length <= 1) return;
    setActiveImageIndex((prev) => {
      const nextIndex =
        (prev - 1 + finalGalleryItems.length) % finalGalleryItems.length;
      syncVariantByImageIndex(nextIndex);
      return nextIndex;
    });
  };

  const handleVariantSelect = (option) => {
    setSelectedVariant(option);
    const nextIndex = finalGalleryItems.findIndex(
      (item) =>
        String(item?.name || "")
          .trim()
          .toLowerCase() ===
        String(option || "")
          .trim()
          .toLowerCase(),
    );
    if (nextIndex >= 0) {
      setActiveImageIndex(nextIndex);
    }
  };

  const handleThumbnailSelect = (index) => {
    setActiveImageIndex(index);
    syncVariantByImageIndex(index);
  };

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches?.[0]?.clientX;
    touchStartXRef.current = null;
    if (startX == null || endX == null) return;
    const delta = endX - startX;
    if (Math.abs(delta) < 45) return;
    if (delta < 0) {
      goToNextImage();
      return;
    }
    goToPreviousImage();
  };

  const getSelectedPrice = () => {
    const variant = (product.variants || []).find(
      (v) => v.name === selectedVariant,
    );
    if (variant?.price != null) return Number(variant.price);
    const sku = (product.skus || []).find((s) => s.size === selectedVariant);
    if (sku?.price != null) return Number(sku.price);
    return 0;
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(1000, prev + 1));
  };

  const handleMainAddToCart = () => {
    if (addingToCart) return;
    setAddingToCart(true);
    addToCart(product, null, { name: selectedVariant, price: getSelectedPrice() }, quantity);
    setTimeout(() => setAddingToCart(false), 500);
  };

  const handleBrandVariantQtyChange = (brandIndex, delta) => {
    setBrandVariantQuantities(prev => {
      const current = prev[brandIndex] || 1;
      const next = Math.max(1, Math.min(1000, current + delta));
      return { ...prev, [brandIndex]: next };
    });
  };

  const handleBrandVariantAddToCart = (brand, brandIndex) => {
    if (addingToCart) return;
    const variantName = brandSelectedVariants[brandIndex] || brand.variants?.[0]?.name;
    const variant = brand.variants?.find(v => v.name === variantName) || { name: variantName, price: 0 };
    const qty = brandVariantQuantities[brandIndex] || 1;
    setAddingToCart(true);
    addToCart(product, brand.name, variant, qty);
    setTimeout(() => setAddingToCart(false), 500);
  };

  let allBrandsShareSameVariants = false;
  let unifiedVariants = [];

  if (product?.brands?.length > 0) {
    const firstBrandVariants = product.brands[0]?.variants || [];
    const getVariantsSignature = (variants) => 
      JSON.stringify((variants || []).map(v => ({ name: v.name, detail: v.detail, packing: v.packing, price: v.price })));
    
    const firstVariantsString = getVariantsSignature(firstBrandVariants);
    
    allBrandsShareSameVariants = product.brands.length > 0 && product.brands.every(b => {
      return getVariantsSignature(b.variants) === firstVariantsString;
    });

    if (allBrandsShareSameVariants) {
      unifiedVariants = firstBrandVariants;
    }
  }

  const renderVariantsTable = (variants, title = "Available Sizes & Pricing", themeColor) => {
    if (!variants || variants.length === 0) return null;
    const color = themeColor || product.color || "#ED028C";
    return (
      <div className="mt-8 mb-8 bg-[#F8F8F8] rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 pb-4">
          <h4 className="text-lg font-bold text-[#333]">{title}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr style={{ backgroundColor: color }}>
                <th className="py-3 px-6 font-bold text-white uppercase tracking-wider text-xs">Variant</th>
                <th className="py-3 px-6 font-bold text-white uppercase tracking-wider text-xs">Detail</th>
                <th className="py-3 px-6 font-bold text-white text-xs tracking-wider">Packing</th>
                <th className="py-3 px-6 font-bold text-white text-xs tracking-wider">Retail Price (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {variants.map((v, i) => (
                <tr key={i} className="hover:bg-black/5 transition-colors">
                  <td className="py-4 px-6 text-[#222222] font-extrabold text-xs tracking-wide uppercase">{v.name || "-"}</td>
                  <td className="py-4 px-6 text-[#666666] text-sm">{v.detail || "-"}</td>
                  <td className="py-4 px-6 text-[#666666] text-sm">{v.packing || "-"}</td>
                  <td className="py-4 px-6 text-sm font-semibold" style={{ color: color }}>
                    {v.price != null ? `Rs ${v.price}` : "Contact for pricing"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <SeoHead
        title={product.title}
        description={productDescription}
        path={productPath}
        image={productImage}
        type="product"
      />
      <StructuredData data={productSchema} />
      <StructuredData data={breadcrumbSchema} />
      <div className="min-h-screen bg-gradient-to-b from-white via-[#F9F9F9] to-white">
        {/* Hero Section */}
        <div
          className="relative py-10 sm:py-16"
          style={{
            background: `linear-gradient(135deg, ${product.color}15 0%, ${product.color}05 100%)`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/products"
              className="inline-flex items-center text-[#666666] hover:text-[#00AEEF] mb-6 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Products
            </Link>
          </div>
        </div>

        <div
          ref={ref}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
        >
          {product.productType === 'matches' ? (
            <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
              <Motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-bold tracking-wider uppercase mb-4"
                  style={{ backgroundColor: product.color }}
                >
                  {product.category}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#222222] mb-6">
                  {product.title}
                </h1>
                {product.tagline && (
                  <p
                    className="font-amiri text-2xl sm:text-3xl font-bold mb-6"
                    style={{ color: product.color }}
                  >
                    {product.tagline}
                  </p>
                )}
                <p className="text-lg sm:text-xl text-[#666666] leading-relaxed mx-auto max-w-3xl">
                  {product.description}
                </p>
              </Motion.div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
              {/* Product Image */}
              <Motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="lg:sticky lg:top-24 h-fit"
              >
                <div className="relative mx-auto w-full bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#E0E0E0]">
                  <div
                    className="w-full flex items-center justify-center"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{ minHeight: 280 }}
                  >
                    <img
                      key={displayImage}
                      src={displayImage}
                      alt={product.title}
                      loading="eager"
                      decoding="async"
                      className="product-gallery-image w-full max-w-[720px] h-auto object-contain"
                      style={{ maxHeight: "80vh" }}
                    />
                  </div>
                  {finalGalleryItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goToPreviousImage}
                        className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65 transition-colors"
                        aria-label="Previous image"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        type="button"
                        onClick={goToNextImage}
                        className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65 transition-colors"
                        aria-label="Next image"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                  {selectedVariant && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-semibold bg-[#00AEEF]/95 shadow-lg">
                      {selectedVariant}
                    </span>
                  )}
                </div>
                {finalGalleryItems.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {finalGalleryItems.map((item, idx) => (
                      <button
                        key={`${item.image}-${idx}`}
                        type="button"
                        onClick={() => handleThumbnailSelect(idx)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                          boundedActiveIndex === idx
                            ? "border-[#00AEEF] ring-2 ring-[#00AEEF]/20"
                            : "border-[#E0E0E0] hover:border-[#00AEEF]/60"
                        }`}
                        aria-label={`Show ${item.name}`}
                        aria-current={boundedActiveIndex === idx}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="h-16 w-full object-contain bg-white"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </Motion.div>

              {/* Product Details */}
              <Motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="mr-4" style={{ color: product.color }}>
                    {icon}
                  </div>
                  <div>
                    <div
                      className="inline-block px-3 py-1 rounded-full text-white text-sm font-semibold mb-2"
                      style={{ backgroundColor: product.color }}
                    >
                      {product.category}
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#222222] mb-2">
                      {product.title}
                    </h1>
                  </div>
                </div>

                {product.tagline && (
                  <p
                    className="font-amiri text-xl sm:text-2xl font-bold mb-5 sm:mb-6"
                    style={{ color: product.color }}
                  >
                    {product.tagline}
                  </p>
                )}

                <p className="text-[#666666] text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                  {product.description}
                </p>

                {/* Features */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#222222] mb-4">
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    {(product.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <FaCheckCircle
                          className="mr-3 mt-1 flex-shrink-0"
                          style={{ color: product.color }}
                        />
                        <span className="text-[#666666]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Only show main product variants if there are NO brands. If brands exist, they will be handled row-by-row below. */}
                {!(product.brands?.length > 0) && (sizeOrSkuOptions.length > 0 || product.variants?.length > 0) && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-[#222222] mb-3">
                      Select Variant
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {uniqueOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleVariantSelect(opt)}
                          className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold ${
                            selectedVariant === opt
                              ? "bg-[#00AEEF] text-white border-[#00AEEF]"
                              : "bg-white text-[#222222] border-[#E0E0E0] hover:border-[#00AEEF]"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Add to Cart (Only if NO brands) */}
                {!(product.brands?.length > 0) && (
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-8 pt-8 border-t border-[#E0E0E0]">
                    {getSelectedPrice() > 0 && (
                      <p className="text-xl sm:text-2xl font-bold text-[#00AEEF]">
                        Rs {(getSelectedPrice() * quantity).toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="quantity"
                        className="text-sm font-semibold text-[#222222]"
                      >
                        Qty
                      </label>
                      <div
                        id="quantity"
                        className="inline-flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={decreaseQuantity}
                          disabled={quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center bg-white text-[#222222] hover:bg-[#F5F5F5] disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-sm font-semibold text-[#222222]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={increaseQuantity}
                          disabled={quantity >= 1000}
                          className="w-9 h-9 flex items-center justify-center bg-white text-[#222222] hover:bg-[#F5F5F5] disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleMainAddToCart}
                      className="flex-1 sm:flex-none sm:w-auto px-7 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#00AEEF] to-[#0095CC] hover:shadow-lg hover:shadow-[#00AEEF]/30 transition-all flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>
                  </div>
                )}
              </Motion.div>
            </div>
          )}

          {/* Render Product Variants Table if no brands, below the flex container */}
          {product && !(product.brands?.length > 0) && renderVariantsTable(product.variants)}

          {/* Additional Information Sections */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-12"
          >
            {/* Brands (for matches) */}
            {product.brands?.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-6 text-center sr-only">
                  Available Brands & Variants
                </h3>
                <div className="flex flex-col">
                  {product.brands.map((brand, bIdx) => (
                    <div key={bIdx}>
                      <div className="flex flex-col md:flex-row mb-12 items-start gap-8 md:gap-12 transition-transform hover:-translate-y-1 duration-300">
                        {/* Left: Image Box */}
                        <div className="w-full md:w-5/12 relative">
                          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#F0F0F0] p-8 sm:p-12 flex items-center justify-center">
                            <div className="absolute top-4 left-4 bg-[#ED028C] px-3 py-1 rounded-full shadow-md text-xs font-bold text-white z-10">
                              {brandSelectedVariants[bIdx] || brand.variants?.[0]?.name || "Select Variant"}
                            </div>
                            {brand.image ? (
                              <img src={brand.image} alt={brand.name} className="w-full max-w-[320px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full max-w-[320px] aspect-[3/4] flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 font-medium">Image coming soon</div>
                            )}
                          </div>
                        </div>

                        {/* Right: Details Box */}
                        <div className="w-full md:w-7/12 flex flex-col justify-center">
                          <div>
                            <span className="inline-block mb-3 px-3 py-1 bg-[#ED028C] text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-sm">
                              {brand.category || "Safety Matches"}
                            </span>
                            <h4 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#222222] mb-3 tracking-tight">{brand.name}</h4>
                            {brand.tagline && (
                              <p className="text-[#ED028C] text-xl sm:text-2xl font-medium mb-4 font-amiri leading-normal" dir="auto">
                                {brand.tagline}
                              </p>
                            )}
                            {brand.description && (
                              <p className="text-[#555] text-lg leading-relaxed mb-8">
                                {brand.description}
                              </p>
                            )}
                            
                            {brand.features?.length > 0 && (
                              <div className="mb-8">
                                <h5 className="font-bold text-[#222] mb-3 text-lg">Key Features</h5>
                                <ul className="space-y-2">
                                  {brand.features.filter(Boolean).map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start text-base text-[#444]">
                                      <FaCheckCircle className="text-[#ED028C] mt-1.5 mr-3 flex-shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          {/* Variant Selection & Add to Cart */}
                          {brand.variants?.length > 0 && (
                            <div className="pt-8 border-t border-[#E0E0E0]">
                              <p className="text-sm font-bold text-[#222] mb-3 uppercase tracking-wide">Select Variant</p>
                              <div className="flex flex-wrap gap-2.5 mb-8">
                                {brand.variants.map((variant, vIdx) => {
                                  const isSelected = (brandSelectedVariants[bIdx] || brand.variants[0]?.name) === variant.name;
                                  return (
                                    <button
                                      key={vIdx}
                                      onClick={() => setBrandSelectedVariants(prev => ({ ...prev, [bIdx]: variant.name }))}
                                      className={`px-5 py-2.5 rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                                        isSelected 
                                          ? "bg-[#00AEEF] text-white border-[#00AEEF] shadow-lg shadow-[#00AEEF]/30" 
                                          : "bg-white text-[#555] border-[#E0E0E0] hover:border-[#00AEEF] hover:text-[#00AEEF]"
                                      }`}
                                    >
                                      {variant.name}
                                    </button>
                                  );
                                })}
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  {brand.variants.find(v => v.name === (brandSelectedVariants[bIdx] || brand.variants[0]?.name))?.price != null ? (
                                    <p className="text-2xl font-bold text-[#00AEEF]">
                                      Rs {brand.variants.find(v => v.name === (brandSelectedVariants[bIdx] || brand.variants[0]?.name)).price}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-[#666] italic">Contact for price</p>
                                  )}
                                  <p className="text-xs text-[#888] mt-1">
                                    {brand.variants.find(v => v.name === (brandSelectedVariants[bIdx] || brand.variants[0]?.name))?.detail}
                                    {brand.variants.find(v => v.name === (brandSelectedVariants[bIdx] || brand.variants[0]?.name))?.packing && ` • ${brand.variants.find(v => v.name === (brandSelectedVariants[bIdx] || brand.variants[0]?.name)).packing}`}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="inline-flex items-center border border-[#E0E0E0] rounded-lg bg-white overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => handleBrandVariantQtyChange(bIdx, -1)}
                                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                                    >-</button>
                                    <span className="w-12 text-center text-sm font-semibold">
                                      {brandVariantQuantities[bIdx] || 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleBrandVariantQtyChange(bIdx, 1)}
                                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                                    >+</button>
                                  </div>
                                  <button
                                    onClick={() => handleBrandVariantAddToCart(brand, bIdx)}
                                    disabled={addingToCart}
                                    className="px-6 py-3 bg-[#00AEEF] text-white rounded-lg font-bold hover:bg-[#0095CC] transition-colors flex items-center gap-2 shadow-md disabled:opacity-70"
                                  >
                                    <FaShoppingCart />
                                    <span>{addingToCart ? "Adding..." : "Add"}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Brand Variants Table placed below the flex container */}
                      {!allBrandsShareSameVariants && renderVariantsTable(brand.variants, "Available Sizes & Pricing")}
                      
                      {/* Divider for all but the last item */}
                      {bIdx < product.brands.length - 1 && (
                        <hr className="border-[#E0E0E0] my-8 mb-16 mx-auto w-3/4" />
                      )}
                    </div>
                  ))}
                </div>
                {allBrandsShareSameVariants && renderVariantsTable(unifiedVariants, "Available Sizes & Pricing")}
              </div>
            )}

            {/* Facilities (for matches) */}
            {product.facilities?.length > 0 && (
              <div className="bg-gradient-to-br from-[#FFEFF9] to-white rounded-2xl shadow-lg p-8 border-2 border-[#FF8ACE]">
                <h3 className="text-2xl font-bold text-[#222222] mb-6">
                  Manufacturing Facilities
                </h3>
                <div className="space-y-4">
                  {product.facilities.map((facility, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-xl border border-[#E0E0E0]"
                    >
                      <p className="text-[#222222] font-bold text-lg mb-2">
                        {facility.name}
                      </p>
                      <p className="text-[#666666] mb-1">{facility.location}</p>
                      <p className="text-[#00AEEF] text-sm italic">
                        {facility.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {product.services && (
              <div
                className="rounded-2xl p-8 text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${product.color} 0%, ${product.color}dd 100%)`,
                }}
              >
                <h3 className="text-2xl font-bold mb-4">Additional Services</h3>
                <p className="text-lg">{product.services}</p>
              </div>
            )}
          </Motion.div>

          {/* CTA Section */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="mt-12 sm:mt-16 bg-gradient-to-r from-[#00AEEF] to-[#0095CC] rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-2xl">
              <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
                Interested in {product.title}?
              </h3>
              <p className="text-white/90 text-base sm:text-lg mb-8 max-w-3xl mx-auto drop-shadow-md">
                Contact us for product inquiries, bulk orders, private labeling
                services, or export opportunities.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/contact"
                  className="bg-white text-[#00AEEF] px-8 py-4 rounded-full font-semibold hover:bg-[#F9F9F9] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                >
                  Request Quote
                </Link>
                <a
                  href="https://wa.me/+923008592829"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#00AEEF] transition-all duration-300 active:scale-95"
                >
                  Call Us Now
                </a>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
