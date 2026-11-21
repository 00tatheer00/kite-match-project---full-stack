'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

/**
 * Tiny toast system for the admin panel.
 *   import { notify } from '@/components/admin/AdminToast';
 *   notify.success('Saved'); notify.error('Could not save');
 * <AdminToaster /> is mounted once in AdminLayout.
 */
const EVENT = 'kite-admin-toast';
let nextId = 1;

function emit(type, message) {
  if (typeof window === 'undefined' || !message) return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id: nextId++, type, message: String(message) } }));
}

export const notify = {
  success: (message) => emit('success', message),
  error: (message) => emit('error', message),
};

export function AdminToaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (e) => {
      const toast = e.detail;
      setToasts((prev) => [...prev.slice(-3), toast]);
      // Errors stay longer so a non-technical user has time to read them.
      const ttl = toast.type === 'error' ? 8000 : 3500;
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), ttl);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border text-sm font-semibold ${
            t.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {t.type === 'error' ? (
            <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-500" />
          ) : (
            <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-500" />
          )}
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            aria-label="Close message"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="shrink-0 opacity-60 hover:opacity-100 cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
}
