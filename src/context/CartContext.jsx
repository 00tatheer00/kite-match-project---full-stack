'use client';
import toast from 'react-hot-toast';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getProducts, getPromotions } from '@/services/api';
import { trackEvent } from '@/lib/gtag';

const CartContext = createContext();

// Must match MAX_ITEM_QUANTITY on the server (lib/constants.js).
const MAX_QTY = 1000;
const clampQty = (n) => Math.max(1, Math.min(MAX_QTY, Math.floor(Number(n) || 1)));

const norm = (v) => String(v ?? '').trim().toLowerCase();

/**
 * Re-price a saved cart line against the live catalog (same rules as the server's pricing).
 * Returns the updated line; `unavailable: true` when the item can no longer be ordered.
 */
function repriceLine(item, products, promotions) {
  if (item.itemType === 'promotion') {
    const promo = promotions.find((p) => p.id === item.promotionId);
    const price = Number(promo?.totalPrice) || 0;
    if (!promo || price <= 0) return { ...item, unavailable: true };
    return { ...item, unavailable: false, price, promotionTitle: promo.title, image: promo.image || item.image };
  }
  const product = products.find((p) => p.id === item.productId);
  if (!product) return { ...item, unavailable: true };
  const brand = item.brandName ? (product.brands || []).find((b) => norm(b.name) === norm(item.brandName)) : null;
  // Same rule as the server (lib/pricing.js): products with brands are sold per brand only.
  if ((product.brands || []).length > 0 && !brand) return { ...item, unavailable: true };
  const wanted = norm(item.selectedVariant);
  const match = brand
    ? (brand.variants || []).find((v) => norm(v.name) === wanted)
    : (product.variants || []).find((v) => norm(v.name) === wanted) ||
      (product.skus || []).find((v) => norm(v.size) === wanted);
  const price = Number(match?.price) || 0;
  if (price <= 0) return { ...item, unavailable: true };
  return { ...item, unavailable: false, price, productTitle: product.title };
}

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const repricedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kite_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .filter((item) => item && (item.productId || item.promotionId))
            .map((item) => ({ ...item, quantity: clampQty(item.quantity) }));
          setCartItems(normalized);
        }
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage', err);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('kite_cart', JSON.stringify(cartItems));
      } catch {
        // storage full / private mode
      }
    }
  }, [cartItems, isLoaded]);

  // Prices saved in localStorage can be days old: refresh them once from the live catalog.
  useEffect(() => {
    if (!isLoaded || repricedRef.current || cartItems.length === 0) return;
    repricedRef.current = true;
    Promise.all([getProducts(), getPromotions()])
      .then(([products, promotions]) => {
        setCartItems((prev) => {
          const next = prev.map((item) => repriceLine(item, products, promotions));
          const changed = next.some(
            (item, i) => item.price !== prev[i].price || Boolean(item.unavailable) !== Boolean(prev[i].unavailable)
          );
          return changed ? next : prev;
        });
      })
      .catch(() => {
        // Offline: keep saved prices; checkout still shows the authoritative server total.
      });
  }, [isLoaded, cartItems.length]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addingRef = useRef(false);

  const addToCart = (product, brandName, variant, quantity = 1) => {
    if (addingRef.current) return;
    addingRef.current = true;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && (item.brandName || "") === (brandName || "") && item.selectedVariant === variant.name
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { 
          ...next[existingIdx], 
          quantity: clampQty(next[existingIdx].quantity + quantity)
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          productTitle: product.title,
          brandName: brandName,
          selectedVariant: variant.name,
          price: variant.price || 0,
          quantity: clampQty(quantity),
          image: product.image,
          shippingCost: product.shippingCost !== undefined && product.shippingCost !== null ? Number(product.shippingCost) : 200
        }
      ];
    });
    openCart();
    trackEvent('add_to_cart', {
      currency: 'PKR',
      value: (Number(variant.price) || 0) * clampQty(quantity),
      items: [{ item_id: String(product.id), item_name: brandName || product.title, item_variant: variant.name, price: Number(variant.price) || 0, quantity: clampQty(quantity) }],
    });
    const label = brandName && brandName !== product.title ? brandName : product.title;
    toast.success(`Added to cart: ${label} (${variant.name}) × ${clampQty(quantity)}`, { id: 'cart-add' });

    setTimeout(() => {
      addingRef.current = false;
    }, 300);
  };

  const addPromotionToCart = (promotion, price, quantity = 1) => {
    if (addingRef.current) return;
    addingRef.current = true;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.itemType === 'promotion' && item.promotionId === promotion.id
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { 
          ...next[existingIdx], 
          quantity: clampQty(next[existingIdx].quantity + quantity)
        };
        return next;
      }
      return [
        ...prev,
        {
          itemType: 'promotion',
          promotionId: promotion.id,
          promotionTitle: promotion.title,
          price: price || 0,
          quantity: clampQty(quantity),
          image: promotion.image,
          shippingCost: promotion.shippingCost !== undefined && promotion.shippingCost !== null ? Number(promotion.shippingCost) : 200
        }
      ];
    });
    openCart();
    trackEvent('add_to_cart', {
      currency: 'PKR',
      value: (Number(price) || 0) * clampQty(quantity),
      items: [{ item_id: String(promotion.id), item_name: promotion.title, item_category: 'Package', price: Number(price) || 0, quantity: clampQty(quantity) }],
    });
    toast.success(`Added to cart: ${promotion.title}`, { id: 'cart-add' });

    setTimeout(() => {
      addingRef.current = false;
    }, 300);
  };

  const itemLabel = (item) => item?.promotionTitle || (item?.selectedVariant ? `${item.brandName || item.productTitle} (${item.selectedVariant})` : item?.productTitle) || 'Item';

  const removeFromCart = (index) => {
    const item = cartItems[index];
    setCartItems(prev => prev.filter((_, i) => i !== index));
    if (item) toast(`Removed from cart: ${itemLabel(item)}`, { id: 'cart-remove', icon: '🗑️' });
  };

  const updateQuantity = (index, delta) => {
    const current = cartItems[index];
    if (current && current.quantity + delta <= 0) {
      toast(`Removed from cart: ${itemLabel(current)}`, { id: 'cart-remove', icon: '🗑️' });
    }
    setCartItems(prev => {
      const next = [...prev];
      if (!next[index]) return prev;
      
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== index);
      }
      
      next[index] = { ...next[index], quantity: Math.min(MAX_QTY, newQty) };
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems
    .filter((item) => !item.unavailable)
    .reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  const hasUnavailableItems = cartItems.some((item) => item.unavailable);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addPromotionToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      hasUnavailableItems,
      isLoaded,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
