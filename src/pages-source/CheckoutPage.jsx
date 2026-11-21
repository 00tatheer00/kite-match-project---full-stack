'use client';

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from '@/components/RouterCompat';
import { useSearchParams } from 'next/navigation';
import { createOrder, getSettings, quoteOrder } from "../services/api";
import SeoHead from "../components/seo/SeoHead";
import { useCart } from "../context/CartContext";
import { colors } from "../theme";
import { FaTrash } from "react-icons/fa";
import OrderConfirmModal from "../components/checkout/OrderConfirmModal";
import toast from "react-hot-toast";

const PHONE_REGEX = /^(?:\+92|92|0)3\d{9}$/;

const normalizePhone = (value = "") => value.replace(/[\s()-]/g, "");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart, isLoaded: cartLoaded } = useCart();

  // useSearchParams is correct on the first render (location.search from the shim is empty until an effect runs).
  const searchParams = useSearchParams();
  const isCartCheckout = searchParams?.get('type') === 'cart';

  const orderContext = location.state?.orderContext;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Every checkout problem also pops up as a toast, so it is seen even when the
  // message box is scrolled out of view (common on phones).
  useEffect(() => {
    if (error) toast.error(error, { id: "checkout-error" });
  }, [error]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [settings, setSettings] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [form, setForm] = useState({
    quantity: 1,
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    note: "",
  });

  const checkoutData = useMemo(() => {
    if (isCartCheckout) {
      if (cartItems.length === 0) return null;
      return {
        type: "cart",
        items: cartItems,
        total: cartTotal
      };
    }

    if (!orderContext) return null;
    const isProduct = orderContext.type === "product";
    return {
      type: orderContext.type,
      productId: isProduct ? orderContext.id : undefined,
      promotionId: !isProduct ? orderContext.id : undefined,
      selectedSkuOrSize: orderContext.selectedOption || "",
      title: orderContext.title || "",
      quantity: Number(orderContext.quantity) > 0 ? Number(orderContext.quantity) : 1,
      unitPrice: Number(orderContext.totalPrice) || 0,
    };
  }, [isCartCheckout, cartItems, cartTotal, orderContext]);

  useEffect(() => {
    if (!checkoutData || isCartCheckout) return;
    setForm((prev) => ({
      ...prev,
      quantity: checkoutData.quantity,
    }));
  }, [checkoutData, isCartCheckout]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const applicableShippingCost = useMemo(() => {
    const freeBundles = Array.isArray(settings?.freeShippingBundleIds) && settings.freeShippingBundleIds.length > 0
      ? settings.freeShippingBundleIds
      : ['pkg-glow-family-pack', 'pkg-glow-bachat-mega', 'pkg-vero-family-pack'];
    const defaultShip = Number(settings?.defaultShippingCost) || 200;

    if (isCartCheckout && checkoutData && checkoutData.items.length > 0) {
      let anyItemRequiresShipping = false;
      let maxCost = 0;

      for (const item of checkoutData.items) {
        let itemShip = defaultShip;
        if (item.itemType === 'promotion') {
          if (freeBundles.includes(item.promotionId)) {
            itemShip = 0;
          } else {
            itemShip = item.shippingCost !== null && item.shippingCost !== undefined ? Number(item.shippingCost) : 200;
          }
        } else {
          // Products use standard delivery fee
          itemShip = item.shippingCost !== null && item.shippingCost !== undefined ? Number(item.shippingCost) : defaultShip;
        }

        if (itemShip > 0) {
          anyItemRequiresShipping = true;
          if (itemShip > maxCost) maxCost = itemShip;
        }
      }

      return anyItemRequiresShipping ? maxCost : 0;
    } else if (!isCartCheckout && orderContext) {
      if (orderContext.itemType === 'promotion' || orderContext.isPromotion) {
        const promoId = orderContext.promotionId || orderContext.id;
        if (freeBundles.includes(promoId)) return 0;
        return orderContext.shippingCost !== null && orderContext.shippingCost !== undefined ? Number(orderContext.shippingCost) : 200;
      }
      // Single product delivery fee calculation
      return orderContext.shippingCost !== null && orderContext.shippingCost !== undefined ? Number(orderContext.shippingCost) : defaultShip;
    }
    return defaultShip;
  }, [settings, isCartCheckout, checkoutData, orderContext]);

  const grandTotal = useMemo(() => {
    if (isCartCheckout) {
      return (checkoutData?.total || 0) + applicableShippingCost;
    }
    return ((Number(checkoutData?.unitPrice) || 0) * (Number(form.quantity) || 1)) + applicableShippingCost;
  }, [isCartCheckout, checkoutData, form.quantity, applicableShippingCost]);

  // ---- Authoritative server quote (what the customer will actually be charged) ----
  const quotePayload = useMemo(() => {
    if (!checkoutData) return null;
    if (isCartCheckout) {
      return {
        type: "cart",
        items: checkoutData.items.map((item) => ({
          itemType: item.itemType || "product",
          productId: item.productId,
          promotionId: item.promotionId,
          brandName: item.brandName,
          selectedVariant: item.selectedVariant,
          quantity: item.quantity,
        })),
      };
    }
    return {
      type: checkoutData.type,
      productId: checkoutData.productId,
      promotionId: checkoutData.promotionId,
      selectedSkuOrSize: checkoutData.selectedSkuOrSize,
      quantity: Number(form.quantity) || 1,
    };
  }, [checkoutData, isCartCheckout, form.quantity]);

  const [quoteState, setQuoteState] = useState({ data: null, error: "", loading: false });

  useEffect(() => {
    if (!quotePayload) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setQuoteState((prev) => ({ ...prev, loading: true }));
      try {
        const data = await quoteOrder(quotePayload);
        if (!cancelled) setQuoteState({ data, error: "", loading: false });
      } catch (err) {
        if (!cancelled) setQuoteState({ data: null, error: err.message || "Could not calculate the total", loading: false });
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [quotePayload]);

  const quote = quoteState.data;
  const displayShipping = quote ? quote.shippingCost : applicableShippingCost;
  const displayTotal = quote ? quote.totalAmount : grandTotal;
  const displaySubtotal = quote
    ? quote.subtotal
    : isCartCheckout
      ? checkoutData?.total || 0
      : (Number(checkoutData?.unitPrice) || 0) * (Number(form.quantity) || 1);

  if (!checkoutData && isCartCheckout && !cartLoaded) {
    // Cart is still being restored from localStorage — avoid flashing "Checkout Not Ready".
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500" aria-busy="true">
        Loading your cart...
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <>
        <SeoHead title="Checkout" path="/checkout" noindex />
        <div className="min-h-screen bg-gradient-to-b from-white via-[#F9F9F9] to-white py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-[#222222] mb-4">
              Checkout Not Ready
            </h1>
            <p className="text-[#666666] mb-6">
              Please select a product or add items to your cart first.
            </p>
            <Link
              to="/products"
              className="text-[#00AEEF] font-semibold hover:text-[#ED028C]"
            >
              Go to Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const decreaseQuantity = () => {
    if (isCartCheckout) return;
    setForm((prev) => ({
      ...prev,
      quantity: Math.max(1, Number(prev.quantity) - 1),
    }));
  };

  const increaseQuantity = () => {
    if (isCartCheckout) return;
    setForm((prev) => ({
      ...prev,
      quantity: Math.min(1000, Number(prev.quantity) + 1),
    }));
  };

  // Step 1: validate form → show confirmation modal
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("You must accept the Terms and Conditions to place an order.");
      return;
    }

    const parsedQuantity = Number(form.quantity);
    if (!isCartCheckout && (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 1000)) {
      setError("Quantity must be a whole number between 1 and 1000.");
      return;
    }

    const normalizedPhone = normalizePhone(form.phone);
    if (!PHONE_REGEX.test(normalizedPhone)) {
      setError("Enter a valid phone number (03xxxxxxxxx, 923xxxxxxxxx, or +923xxxxxxxxx).");
      return;
    }
    if (!form.customerName.trim() || !form.address.trim() || !form.city.trim()) {
      setError("Name, city, and address are required.");
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("Enter a valid email address so we can send your order receipt.");
      return;
    }
    if (quoteState.error) {
      setError(quoteState.error);
      return;
    }

    setError("");
    setShowConfirmModal(true);
  };

  // Step 2: called when user clicks "Confirm Order" in the modal
  const handleConfirmOrder = async () => {
    const parsedQuantity = Number(form.quantity);
    const normalizedPhone = normalizePhone(form.phone);

    setSubmitting(true);
    setError("");
    try {
      let orderPayload;
      if (isCartCheckout) {
        orderPayload = {
          type: "cart",
          items: checkoutData.items.map(item => ({
            itemType: item.itemType || 'product',
            productId: item.productId,
            promotionId: item.promotionId,
            brandName: item.brandName,
            selectedVariant: item.selectedVariant,
            quantity: item.quantity,
          }))
        };
      } else {
        orderPayload = {
          type: checkoutData.type,
          productId: checkoutData.productId,
          promotionId: checkoutData.promotionId,
          selectedSkuOrSize: checkoutData.selectedSkuOrSize,
          quantity: parsedQuantity
        };
      }

      const orderResult = await createOrder({
        ...orderPayload,
        customerName: form.customerName,
        email: form.email.trim(),
        address: form.address,
        city: form.city,
        note: form.note,
        phone: normalizedPhone,
        paymentMethod: "COD",
      });

      if (isCartCheckout) {
        clearCart();
      }

      setShowConfirmModal(false);
      toast.success(`Order placed successfully${orderResult.orderNumber ? ` (${orderResult.orderNumber})` : ""}! We will call you to confirm.`, { id: "order-placed", duration: 6000 });
      const orderId = orderResult.id || 'confirmed';
      navigate(`/order-success/${orderId}`, {
        state: { orderDetails: orderResult }
      });
    } catch (err) {
      setError(err.message || "Failed to place order");
      setShowConfirmModal(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <SeoHead title="Checkout" path="/checkout" noindex />
      <div className="min-h-screen bg-gradient-to-b from-white via-[#F9F9F9] to-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-[#222222] mb-5">Checkout</h1>
          <div className="mb-6 p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-3">
            <span className="text-xl">🚚</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-sky-950">Cash on Delivery (COD) Available Nationwide</h3>
              <p className="text-xs text-sky-800 mt-0.5 leading-relaxed">
                Apna shipping address dain aur order place karein. Payment delivery ke waqt li jaye gi.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="tel:+923018117666"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Helpline: 0301 8117666
                </a>
              </div>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {!isCartCheckout && (
              <div>
                <label className="block mb-1 text-sm font-medium">Quantity</label>
                <div className="inline-flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={Number(form.quantity) <= 1}
                    className="w-10 h-10 flex items-center justify-center bg-white text-[#222222] hover:bg-[#F5F5F5] disabled:opacity-50"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-14 text-center text-sm font-semibold text-[#222222]">
                    {Number(form.quantity) || 1}
                  </span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={Number(form.quantity) >= 1000}
                    className="w-10 h-10 flex items-center justify-center bg-white text-[#222222] hover:bg-[#F5F5F5] disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            <div className={isCartCheckout ? "md:col-span-2" : ""}>
              <label className="block mb-1 text-sm font-medium">Name</label>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                title="Enter 03xxxxxxxxx, 923xxxxxxxxx, or +923xxxxxxxxx"
                inputMode="tel"
                placeholder="03xxxxxxxxx, 923xxxxxxxxx, or +923xxxxxxxxx"
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Order Note (optional)
              </label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Payment Method
              </label>
              <input
                value="Cash on Delivery (COD)"
                readOnly
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-[#F9F9F9]"
              />
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="md:col-span-2 mt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#00AEEF] border-gray-300 rounded focus:ring-[#00AEEF]"
                />
                <span className="text-sm text-gray-600">
                  I have read and agree to the website's <Link to="/terms" className="text-[#00AEEF] hover:underline" target="_blank" rel="noopener">Terms &amp; Conditions</Link> and <Link to="/privacy" className="text-[#00AEEF] hover:underline" target="_blank" rel="noopener">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <div className="md:col-span-2 mt-4 space-y-2">
              {quoteState.error && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {quoteState.error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting || Boolean(quoteState.error)}
                className="w-full px-5 py-3.5 rounded-lg text-white font-bold bg-[#00AEEF] hover:bg-[#0095CC] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Placing Order..." : "Place Order (Cash on Delivery)"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold text-[#222222] mb-4">
            Order Summary
          </h2>
          
          {isCartCheckout ? (
            <div className="space-y-4">
              {checkoutData.items.length > 0 ? (
                <>
                  <div className="divide-y divide-[#E0E0E0] max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {checkoutData.items.map((item, idx) => (
                      <div key={idx} className="py-4 flex gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border border-[#E0E0E0] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image?.src || item.image} alt={item.itemType === 'promotion' ? item.promotionTitle : item.productTitle} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-xs text-gray-400">No Img</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-bold text-sm text-[#222222] line-clamp-2 leading-snug">
                                {item.itemType === 'promotion' ? item.promotionTitle : (item.brandName ? item.brandName : item.productTitle)}
                              </p>
                              {item.itemType !== 'promotion' && (
                                <p className="text-xs font-semibold text-[#00AEEF] mt-1">{item.selectedVariant}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-end mt-2">
                            <div className="inline-flex items-center border border-[#E0E0E0] rounded bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(idx, -1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-[#444]"
                              >-</button>
                              <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(idx, 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-[#444]"
                              >+</button>
                            </div>
                            <p className="font-bold text-[#222222] text-sm">
                              Rs {((item.price || 0) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-[#E0E0E0]">
                    <div className="flex justify-between items-center mb-2 text-[#666666]">
                      <p className="text-sm">Total Items</p>
                      <p className="font-semibold">{checkoutData.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-[#666666]">
                      <p className="text-sm">Subtotal</p>
                      <p className="font-semibold">Rs {cartTotal.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-[#666666]">
                      <p className="text-sm">Shipping</p>
                      <p className="font-semibold">Rs {Number(displayShipping).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#E0E0E0] pt-4">
                      <p className="text-base font-bold text-[#222222]">Estimated Total</p>
                      <p className="text-2xl font-black text-[#00AEEF]">
                        Rs {Number(displayTotal).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[#666] mb-4">Your cart is empty.</p>
                  <Link to="/products" className="text-[#00AEEF] hover:underline font-semibold">
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-[#666666] mb-1">Type</p>
              <p className="font-semibold mb-3">
                {checkoutData.type === "product" ? "Product" : "Promotion"}
              </p>
              <p className="text-sm text-[#666666] mb-1">Item</p>
              <p className="font-semibold mb-3">{checkoutData.title}</p>
              {checkoutData.selectedSkuOrSize && (
                <>
                  <p className="text-sm text-[#666666] mb-1">Selected Variant</p>
                  <p className="font-semibold mb-3">
                    {checkoutData.selectedSkuOrSize}
                  </p>
                </>
              )}
              <p className="text-sm text-[#666666] mb-1">Quantity</p>
              <p className="font-semibold mb-3">
                {Number(form.quantity) > 0 ? Number(form.quantity) : checkoutData.quantity}
              </p>
              <div className="pt-4 mt-4 border-t border-[#E0E0E0] space-y-2">
                <div className="flex justify-between text-[#666666] text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    Rs {Number(displaySubtotal).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#666666] text-sm">
                  <span>Shipping</span>
                  <span className="font-semibold">Rs {Number(displayShipping).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#E0E0E0]">
                  <p className="text-sm font-semibold text-[#222222]">Estimated Total</p>
                  <p className="text-2xl font-bold text-[#00AEEF]">
                    Rs {Number(displayTotal).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmModal && (
        <OrderConfirmModal
          items={
            quote
              ? quote.items.map((line) => ({
                  image: line.image,
                  itemType: line.itemType,
                  productTitle: line.title,
                  promotionTitle: line.title,
                  brandName: line.brandName && line.brandName !== line.title ? line.brandName : null,
                  selectedVariant: line.selectedVariant,
                  quantity: line.quantity,
                  price: line.price,
                }))
              : isCartCheckout
              ? checkoutData.items
              : [{
                  image: null,
                  itemType: checkoutData.type,
                  productTitle: checkoutData.title,
                  brandName: checkoutData.title,
                  promotionTitle: checkoutData.title,
                  selectedVariant: checkoutData.selectedSkuOrSize,
                  quantity: Number(form.quantity) || 1,
                  price: checkoutData.unitPrice,
                }]
          }
          customerInfo={{
            customerName: form.customerName,
            phone: form.phone,
            city: form.city,
            address: form.address,
          }}
          totals={{
            subtotal: displaySubtotal,
            shipping: displayShipping,
            grand: displayTotal,
          }}
          onConfirm={handleConfirmOrder}
          onCancel={() => setShowConfirmModal(false)}
          submitting={submitting}
        />
      )}
    </>
  );
};

export default CheckoutPage;
