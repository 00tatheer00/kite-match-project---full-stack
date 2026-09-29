'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import FloatingCartButton from '@/components/FloatingCartButton';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollToTop from '@/components/ScrollToTop';
import VisitorTracker from '@/components/VisitorTracker';

const RouteLoadingFallback = () => (
  <div className="py-16 px-4 text-center text-sm text-slate-500">
    Loading page...
  </div>
);

export default function ClientShell({ children }) {
  const pathname = usePathname() || '/';
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('admin-route', isAdminRoute);
      return () => document.body.classList.remove('admin-route');
    }
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return (
      <CartProvider>
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
        <Toaster position="top-right" />
        <div className="min-h-screen w-full flex flex-col">
          <Suspense fallback={<RouteLoadingFallback />}>
            {children}
          </Suspense>
        </div>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <Suspense fallback={null}>
        <VisitorTracker />
      </Suspense>
      <ScrollToTop />
      <Toaster position="top-right" />
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 app-page-compact">
          <main id="main-content">
            <Suspense fallback={<RouteLoadingFallback />}>
              {children}
            </Suspense>
          </main>
          <Footer />
        </div>
        <CartDrawer />
        <FloatingCartButton />
        <WhatsAppButton />
      </div>
    </CartProvider>
  );
}

