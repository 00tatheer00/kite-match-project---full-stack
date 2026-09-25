'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: false,
});

export const AdminThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_theme');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else {
        setTheme('dark');
      }
    } catch {
      setTheme('dark');
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('admin_theme', next);
      } catch {}
      return next;
    });
  };

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('admin_theme', newTheme);
    } catch {}
  };

  const isDark = theme === 'dark';

  return (
    <AdminThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        setTheme: handleSetTheme,
        mounted,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => useContext(AdminThemeContext);
