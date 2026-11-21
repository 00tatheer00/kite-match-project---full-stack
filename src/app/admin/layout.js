import { AdminThemeProvider } from "@/context/AdminThemeContext";
import PwaRegister from "@/components/PwaRegister";

// The installable PWA (manifest + service worker) is the admin portal, so it is only
// offered inside /admin — customers on the public site no longer get an install prompt
// for "Kite Admin".
export const metadata = {
  manifest: "/manifest.json",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return (
    <AdminThemeProvider>
      <PwaRegister />
      {children}
    </AdminThemeProvider>
  );
}
