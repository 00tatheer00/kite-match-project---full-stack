'use client';

import { AdminThemeProvider } from "@/context/AdminThemeContext";

export default function AdminRootLayout({ children }) {
  return (
    <AdminThemeProvider>
      {children}
    </AdminThemeProvider>
  );
}
