'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const RequireAdminAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : null;
    if (!token) {
      router.replace("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, [router]);

  if (checking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-500 text-sm">
        Verifying admin session...
      </div>
    );
  }

  return children;
};

export default RequireAdminAuth;
