import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import FloatingCartButton from "./components/FloatingCartButton";
import ScrollToTop from "./components/ScrollToTop";
const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const ExportPage = lazy(() => import("./pages/ExportPage"));
const SafetyMatchesPage = lazy(() => import("./pages/SafetyMatchesPage"));
const WoodenSplintsPage = lazy(() => import("./pages/WoodenSplintsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const PromotionsPackagesPage = lazy(() => import("./pages/PromotionsPackagesPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderSummaryPage = lazy(() => import("./pages/OrderSummaryPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
// import KiteMatchesPage from "./pages/KiteMatchesPage";
// import OlympiaMatchesPage from "./pages/OlympiaMatchesPage";
// import PartyMatchesPage from "./pages/PartyMatchesPage";
// import TangaMatchesPage from "./pages/TangaMatchesPage";
// import BirdMatchesPage from "./pages/BirdMatchesPage";
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminProductsPage = lazy(() => import("./pages/AdminProductsPage"));
const AdminPromotionsPage = lazy(() => import("./pages/AdminPromotionsPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage"));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettingsPage"));
import "./App.css";

const RouteLoadingFallback = () => (
  <div className="py-16 px-4 text-center text-sm text-slate-500">
    Loading page...
  </div>
);

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    document.body.classList.toggle("admin-route", isAdminRoute);
    return () => document.body.classList.remove("admin-route");
  }, [isAdminRoute]);

  return (
    <div className="min-h-screen bg-white app-page-compact">
      {!isAdminRoute && <Navbar />}
      {isAdminRoute ? (
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      ) : (
        <main id="main-content">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route
                path="/products/tanga-matches"
                element={<Navigate to="/products/tanga" replace />}
              />
              {/* <Route path="/products/tanga" element={<TangaMatchesPage />} /> */}
              <Route path="/products/:id" element={<ProductDetailPage />} />
              {/* <Route path="/products/kite-matches" element={<KiteMatchesPage />} />
            <Route path="/products/olympia" element={<OlympiaMatchesPage />} />
            <Route path="/products/party" element={<PartyMatchesPage />} />
            <Route path="/products/bird" element={<BirdMatchesPage />} /> */}
              <Route
                path="/promotions-packages"
                element={<PromotionsPackagesPage />}
              />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:id" element={<OrderSummaryPage />} />
              <Route path="/export" element={<ExportPage />} />
              <Route
                path="/export/safety-matches"
                element={<SafetyMatchesPage />}
              />
              <Route
                path="/export/wooden-splints"
                element={<WoodenSplintsPage />}
              />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      )}
      {!isAdminRoute && <CartDrawer />}
      {!isAdminRoute && <FloatingCartButton />}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppButton />}
    </div>
  );
}

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </CartProvider>
  );
}

export default App;
