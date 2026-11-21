'use client';

import { useEffect } from 'react';
import { X, Phone, MessageCircle, Mail, Copy, MapPin, Package, Trash2, Check, Truck, Clock, StickyNote, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';
import {
  ORDER_FLOW, STATUS_META, NEXT_STEP, orderKeyOf, rs, formatDateTime, relativeTime,
  whatsappNumber, initials, itemLabel, courierText,
} from './orderUi';

const STEP_ICONS = { pending: Clock, confirmed: Check, shipped: Truck };

const OrderDetailPanel = ({ order, onClose, onStatusChange, onDelete, updatingId }) => {
  const { isDark } = useAdminTheme();

  // Close with Escape; stop the page behind from scrolling.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!order) return null;

  const key = orderKeyOf(order);
  const busy = updatingId === key;
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const next = NEXT_STEP[order.status];
  const cancelled = order.status === 'cancelled';
  const stepIndex = ORDER_FLOW.indexOf(order.status);
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : null;
  const shipping = Number(order.shippingCost) || 0;
  const subtotal = order.totalAmount != null ? Number(order.totalAmount) - shipping : null;
  const wa = whatsappNumber(order.phone);

  const card = isDark ? 'bg-[#111726] border-white/5' : 'bg-white border-slate-200';
  const sub = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-white' : 'text-slate-900';

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error('Could not copy. Please select and copy manually.');
    }
  };

  const contactBtn = `flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 text-[11px] font-semibold transition-colors ${
    isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
  }`;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-40" onClick={onClose} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Order ${order.orderNumber || ''}`}
        className={`fixed inset-y-0 right-0 w-full max-w-xl z-50 shadow-2xl flex flex-col ${isDark ? 'bg-[#0B0F19] text-slate-100' : 'bg-slate-50 text-slate-900'}`}
      >
        {/* Header */}
        <div className={`px-5 sm:px-6 py-4 border-b flex items-start justify-between gap-4 ${isDark ? 'border-white/5 bg-[#111726]' : 'border-slate-200 bg-white'}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className={`text-xl font-black tracking-tight ${strong}`}>{order.orderNumber || 'Order'}</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${isDark ? meta.dark : meta.light}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
            <p className={`mt-1 text-xs ${sub}`}>
              {formatDateTime(order.createdAt)} · {relativeTime(order.createdAt)} · Cash on delivery
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Progress */}
          <section className={`rounded-2xl border p-4 ${card}`}>
            {cancelled ? (
              <div className="flex items-center gap-3 text-rose-500 font-semibold text-sm">
                <Ban size={18} /> This order was cancelled.
              </div>
            ) : (
              <ol className="flex items-center">
                {ORDER_FLOW.map((s, i) => {
                  const Icon = STEP_ICONS[s];
                  const done = i <= stepIndex;
                  return (
                    <li key={s} className={`flex items-center ${i < ORDER_FLOW.length - 1 ? 'flex-1' : ''}`}>
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`w-9 h-9 rounded-full flex items-center justify-center ${done ? 'bg-[#00AEEF] text-white shadow-md shadow-sky-500/30' : isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon size={16} />
                        </span>
                        <span className={`text-[11px] font-semibold ${done ? strong : sub}`}>{STATUS_META[s].label}</span>
                      </div>
                      {i < ORDER_FLOW.length - 1 && (
                        <span className={`flex-1 h-0.5 mx-2 mb-5 rounded-full ${i < stepIndex ? 'bg-[#00AEEF]' : isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {next && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onStatusChange(key, next.status)}
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#00AEEF] hover:bg-[#0095CC] text-white font-bold text-sm py-2.5 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {next.status === 'confirmed' ? <Check size={16} /> : <Truck size={16} />}
                  {busy ? 'Saving…' : next.label}
                </button>
              )}
              {!cancelled && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => window.confirm(`Cancel order ${order.orderNumber || ''}? The customer will be notified by email.`) && onStatusChange(key, 'cancelled')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border font-semibold text-sm px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-60 ${isDark ? 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                >
                  <Ban size={15} /> Cancel
                </button>
              )}
              {cancelled && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onStatusChange(key, 'pending')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border font-semibold text-sm px-4 py-2.5 cursor-pointer ${isDark ? 'border-white/10 text-slate-200 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  Re-open as pending
                </button>
              )}
            </div>
            <p className={`mt-2 text-[11px] ${sub}`}>The customer receives an email when the status changes.</p>
          </section>

          {/* Customer */}
          <section className={`rounded-2xl border p-4 ${card}`}>
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00AEEF] to-[#ED028C] text-white font-black flex items-center justify-center">
                {initials(order.customerName)}
              </span>
              <div className="min-w-0">
                <p className={`font-bold ${strong}`}>{order.customerName}</p>
                <p className={`text-sm ${sub}`}>{order.phone}{order.email ? ` · ${order.email}` : ''}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              <a href={`tel:${order.phone}`} className={contactBtn}><Phone size={17} className="text-sky-500" />Call</a>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={contactBtn}><MessageCircle size={17} className="text-emerald-500" />WhatsApp</a>
              {order.email ? (
                <a href={`mailto:${order.email}`} className={contactBtn}><Mail size={17} className="text-purple-500" />Email</a>
              ) : (
                <span className={`${contactBtn} opacity-40`}><Mail size={17} />Email</span>
              )}
              <button type="button" onClick={() => copy(courierText(order), 'Order details')} className={`${contactBtn} cursor-pointer`}>
                <Copy size={17} className="text-amber-500" />For courier
              </button>
            </div>

            <div className={`mt-4 rounded-xl p-3 flex gap-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <MapPin size={18} className="text-[#ED028C] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${strong}`}>{order.city}</p>
                <p className={`text-sm ${sub} break-words`}>{order.address}</p>
              </div>
              <button type="button" onClick={() => copy(`${order.address}, ${order.city}`, 'Address')} className={`self-start p-1.5 rounded-lg cursor-pointer ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`} aria-label="Copy address">
                <Copy size={14} />
              </button>
            </div>

            {order.note && (
              <div className={`mt-3 rounded-xl p-3 flex gap-3 ${isDark ? 'bg-amber-500/10 text-amber-200' : 'bg-amber-50 text-amber-900'}`}>
                <StickyNote size={17} className="shrink-0 mt-0.5" />
                <p className="text-sm"><span className="font-bold">Customer note: </span>{order.note}</p>
              </div>
            )}
          </section>

          {/* Items */}
          <section className={`rounded-2xl border ${card}`}>
            <h3 className={`px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${sub}`}>
              <Package size={14} /> Items
            </h3>
            <ul className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {(items || [{ title: order.productId || order.promotionId, selectedVariant: order.selectedSkuOrSize, quantity: order.quantity || 1, itemType: order.type }]).map((it, idx) => (
                <li key={idx} className="flex items-center gap-3 px-4 py-3">
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image?.src || it.image} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Package size={18} className={sub} />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${strong}`}>{itemLabel(it)}</p>
                    <p className={`text-xs ${sub}`}>
                      {it.quantity} × {it.price > 0 ? rs(it.price) : '—'}
                    </p>
                  </div>
                  {it.price > 0 && <p className={`text-sm font-bold ${strong}`}>{rs(it.price * it.quantity)}</p>}
                </li>
              ))}
            </ul>
            <div className={`border-t px-4 py-3 space-y-1.5 text-sm ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              {subtotal != null && (
                <div className={`flex justify-between ${sub}`}><span>Subtotal</span><span className={strong}>{rs(subtotal)}</span></div>
              )}
              <div className={`flex justify-between ${sub}`}><span>Delivery</span><span className={strong}>{shipping === 0 ? 'Free' : rs(shipping)}</span></div>
              <div className="flex justify-between items-center pt-2">
                <span className={`font-bold ${strong}`}>Total to collect (COD)</span>
                <span className="text-xl font-black text-[#00AEEF]">{rs(order.totalAmount)}</span>
              </div>
            </div>
          </section>

          {/* Reference + delete */}
          <section className={`rounded-2xl border p-4 text-xs space-y-3 ${card}`}>
            <div className="flex justify-between gap-3">
              <span className={sub}>Order reference</span>
              <button type="button" onClick={() => copy(String(key), 'Order reference')} className={`font-mono break-all text-right cursor-pointer hover:underline ${sub}`}>{key}</button>
            </div>
            {onDelete && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onDelete(order)}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed py-2 font-semibold cursor-pointer disabled:opacity-60 ${isDark ? 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
              >
                <Trash2 size={14} /> Delete order (test / duplicate only)
              </button>
            )}
          </section>
        </div>
      </aside>
    </>
  );
};

export default OrderDetailPanel;
