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
import NavigationProgress from '@/components/NavigationProgress';

// Same look for every toast on the site and in the admin panel.
const TOAST_OPTIONS = {
  duration: 3500,
  style: { fontWeight: 600, fontSize: '14px', borderRadius: '12px', padding: '12px 16px', maxWidth: '420px' },
  success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
  error: { duration: 6000 },
};

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
          <NavigationProgress />
        </Suspense>
        <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
        <div className="min-h-screen w-full flex flex-col">
          {children}
        </div>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <Suspense fallback={null}>
        <VisitorTracker />
        <NavigationProgress />
      </Suspense>
      <ScrollToTop />
      <Toaster position="top-center" toastOptions={TOAST_OPTIONS} />
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 app-page-compact">
          <main id="main-content">
            {children}
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

