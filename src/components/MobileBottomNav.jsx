'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/components/RouterCompat';
import { FaHome, FaStore, FaShoppingCart, FaThLarge, FaPhoneAlt } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';

/**
 * App-style bottom tab bar for phones (hidden from md and up).
 * Home · Shop · Cart (with item count) · Products · Contact
 */
const TABS = [
  { href: '/', label: 'Home', icon: FaHome, match: (p) => p === '/' },
  { href: '/online-order', label: 'Shop', icon: FaStore, match: (p) => p.startsWith('/online-order') || p.startsWith('/promotions-packages') },
  { cart: true, label: 'Cart', icon: FaShoppingCart },
  { href: '/products', label: 'Products', icon: FaThLarge, match: (p) => p.startsWith('/products') },
  { href: '/contact', label: 'Contact', icon: FaPhoneAlt, match: (p) => p.startsWith('/contact') },
];

export default function MobileBottomNav() {
  const pathname = usePathname() || '/';
  const { cartItems, openCart, isCartOpen } = useCart();
  const count = (cartItems || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Main"
    >
      <ul className="grid grid-cols-5 h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          if (tab.cart) {
            return (
              <li key="cart" className="flex">
                <button
                  type="button"
                  onClick={openCart}
                  className={`relative flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                    isCartOpen ? 'text-[#00AEEF]' : 'text-slate-500'
                  }`}
                  aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
                >
                  <span className="relative -mt-6 w-14 h-14 rounded-full bg-[#00AEEF] text-white flex items-center justify-center shadow-lg shadow-sky-500/30 border-4 border-white">
                    <Icon className="text-xl" />
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#ED028C] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </span>
                  <span className="-mt-0.5">Cart</span>
                </button>
              </li>
            );
          }
          const active = tab.match(pathname);
          return (
            <li key={tab.href} className="flex">
              <Link
                to={tab.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  active ? 'text-[#00AEEF]' : 'text-slate-500'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="text-lg" />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
