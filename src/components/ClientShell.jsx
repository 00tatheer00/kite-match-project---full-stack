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

  return (
    <CartProvider>
      <Suspense fallback={null}>
        <VisitorTracker />
      </Suspense>
      <ScrollToTop />
      <Toaster position="top-right" />
      <div className="min-h-screen bg-white app-page-compact">
        {!isAdminRoute && <Navbar />}
        <main id="main-content">
          <Suspense fallback={<RouteLoadingFallback />}>
            {children}
          </Suspense>
        </main>
        {!isAdminRoute && <CartDrawer />}
        {!isAdminRoute && <FloatingCartButton />}
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <WhatsAppButton />}
      </div>
    </CartProvider>
  );
}
