import { Suspense } from "react";
import CheckoutPage from "@/pages-source/CheckoutPage";

export const metadata = {
  title: "Checkout | Kite Brand Pakistan",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  // CheckoutPage reads the query string (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">Loading checkout...</div>}>
      <CheckoutPage />
    </Suspense>
  );
}
