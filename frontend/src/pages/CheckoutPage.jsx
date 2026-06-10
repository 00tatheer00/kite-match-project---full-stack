import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createOrder, getSettings } from "../services/api";
import SeoHead from "../components/seo/SeoHead";
import { useCart } from "../context/CartContext";
import { colors } from "../theme";
import { FaTrash } from "react-icons/fa";

const PHONE_REGEX = /^(?:\+92|92|0)3\d{9}$/;

const normalizePhone = (value = "") => value.replace(/[\s()-]/g, "");

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  
  const searchParams = new URLSearchParams(location.search);
  const isCartCheckout = searchParams.get('type') === 'cart';

  const orderContext = location.state?.orderContext;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [settings, setSettings] = useState(null);
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
    if (!settings) return 0;
    let maxCost = -1;
    if (isCartCheckout && checkoutData && checkoutData.items.length > 0) {
      for (const item of checkoutData.items) {
        if (item.shippingCost !== null && item.shippingCost !== undefined) {
          if (item.shippingCost > maxCost) maxCost = item.shippingCost;
        }
      }
    } else if (!isCartCheckout && orderContext) {
      if (orderContext.shippingCost !== null && orderContext.shippingCost !== undefined) {
        maxCost = orderContext.shippingCost;
      }
    }
    return maxCost >= 0 ? maxCost : (settings.defaultShippingCost ?? 150);
  }, [settings, isCartCheckout, checkoutData, orderContext]);

  const grandTotal = useMemo(() => {
    if (isCartCheckout) {
      return (checkoutData?.total || 0) + applicableShippingCost;
    }
    return ((Number(checkoutData?.unitPrice) || 0) * (Number(form.quantity) || 1)) + applicableShippingCost;
  }, [isCartCheckout, checkoutData, form.quantity, applicableShippingCost]);

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

  const handleSubmit = async (e) => {
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
            price: item.price
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
      
      orderPayload.shippingCost = applicableShippingCost;
      orderPayload.totalAmount = grandTotal;

      const orderResult = await createOrder({
        ...orderPayload,
        customerName: form.customerName,
        email: form.email,
        address: form.address,
        city: form.city,
        note: form.note,
        phone: normalizedPhone,
        paymentMethod: "COD",
      });

      if (isCartCheckout) {
        clearCart();
      }

      navigate(`/order-success/${orderResult._id || orderResult.id}`, {
        state: { orderDetails: orderResult }
      });
    } catch (err) {
      setError(err.message || "Failed to place order");
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
                  I have read and agree to the website's <Link to="/about" className="text-[#00AEEF] hover:underline" target="_blank">Terms & Conditions</Link> and <Link to="/about" className="text-[#00AEEF] hover:underline" target="_blank">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={submitting || (isCartCheckout && (!checkoutData || checkoutData.items.length === 0))}
                className="w-full px-5 py-3.5 rounded-lg text-white font-bold bg-gradient-to-r from-[#00AEEF] to-[#0095CC] disabled:opacity-60 hover:shadow-lg transition-all"
              >
                {submitting ? "Placing Order..." : "Place Order"}
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
                            <img src={item.image} alt={item.itemType === 'promotion' ? item.promotionTitle : item.productTitle} className="w-full h-full object-contain p-1" />
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
                      <p className="font-semibold">Rs {applicableShippingCost}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#E0E0E0] pt-4">
                      <p className="text-base font-bold text-[#222222]">Estimated Total</p>
                      <p className="text-2xl font-black text-[#00AEEF]">
                        Rs {grandTotal.toLocaleString()}
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
                    Rs {((Number(checkoutData.unitPrice) || 0) * (Number(form.quantity) > 0 ? Number(form.quantity) : checkoutData.quantity)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#666666] text-sm">
                  <span>Shipping</span>
                  <span className="font-semibold">Rs {applicableShippingCost}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#E0E0E0]">
                  <p className="text-sm font-semibold text-[#222222]">Estimated Total</p>
                  <p className="text-2xl font-bold text-[#00AEEF]">
                    Rs {grandTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default CheckoutPage;
