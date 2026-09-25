'use client';

import React, { useEffect } from 'react';
import { useParams, useLocation, Link } from '@/components/RouterCompat';
import { CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { colors } from '../theme';

const OrderSummaryPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = React.useState(() => location.state?.orderDetails || null);

  useEffect(() => {
    if (location.state?.orderDetails) {
      setOrderDetails(location.state.orderDetails);
      return;
    }
    try {
      const saved = localStorage.getItem('lastOrder');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed._id === id || parsed.id === id || parsed.orderNumber === id || id === 'confirmed')) {
          setOrderDetails(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    if (id && id !== 'confirmed') {
      fetch(`/api/orders/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setOrderDetails(data);
        })
        .catch(() => {});
    }
  }, [id, location.state]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00AEEF] to-[#0095CC] p-8 md:p-12 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-white/90 text-lg">Your order has been confirmed. Thank you for choosing us.</p>
          </div>

          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E0E0E0] pb-6 mb-8 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order No.</p>
                <p className="font-mono font-semibold text-lg" style={{ color: colors.text.primary }}>
                  {orderDetails?.orderNumber || (id && id !== 'confirmed' ? id.slice(-8).toUpperCase() : '—')}
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="font-semibold text-lg" style={{ color: colors.text.primary }}>
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {orderDetails ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>Order Details</h3>
                  <div className="bg-gray-50 rounded-xl p-6 border border-[#E0E0E0]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Name</p>
                        <p className="font-semibold" style={{ color: colors.text.primary }}>{orderDetails.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <p className="font-semibold" style={{ color: colors.text.primary }}>{orderDetails.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 mb-1">Address</p>
                        <p className="font-semibold" style={{ color: colors.text.primary }}>{orderDetails.address}, {orderDetails.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                        <p className="font-semibold" style={{ color: colors.text.primary }}>{orderDetails.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {orderDetails.items && orderDetails.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>Items Ordered</h3>
                    <div className="border border-[#E0E0E0] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-[#E0E0E0]">
                          <tr>
                            <th className="py-3 px-4 font-semibold text-gray-600">Product</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">Variant</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 text-right">Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E0E0E0]">
                          {orderDetails.items.map((item, idx) => (
                            <tr key={idx} className="bg-white">
                              <td className="py-3 px-4" style={{ color: colors.text.primary }}>
                                {item.itemType === 'promotion'
                                  ? `Promotion: ${item.promotionId}`
                                  : (item.brandName || `Product: ${item.productId}`)}
                              </td>
                              <td className="py-3 px-4" style={{ color: colors.text.secondary }}>
                                {item.selectedVariant || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-right font-semibold" style={{ color: colors.text.primary }}>
                                {item.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bill Summary */}
                {orderDetails.totalAmount != null && (
                  <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>Bill Summary</h3>
                    <div className="bg-gray-50 rounded-xl p-6 border border-[#E0E0E0]">
                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-800">
                            Rs {(orderDetails.totalAmount - (orderDetails.shippingCost || 0)).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping Cost</span>
                          <span className="font-semibold text-gray-800">
                            Rs {orderDetails.shippingCost || 0}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-[#E0E0E0] flex justify-between items-center">
                          <span className="font-bold text-gray-800 text-lg">Total</span>
                          <span className="font-bold text-[#00AEEF] text-xl">
                            Rs {orderDetails.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">We have received your order details.</p>
                <p className="font-semibold text-[#00AEEF]">Our team will contact you soon on the provided phone number to confirm the order.</p>
              </div>
            )}

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products"
                className="px-8 py-3 rounded-full font-semibold border border-[#E0E0E0] text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                Continue Shopping
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
