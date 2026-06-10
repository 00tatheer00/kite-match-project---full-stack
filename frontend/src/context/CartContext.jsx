import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kite_cart');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage', err);
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('kite_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addingRef = React.useRef(false);

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
          quantity: next[existingIdx].quantity + quantity 
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
          quantity,
          image: product.image,
          shippingCost: product.shippingCost
        }
      ];
    });
    openCart();

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
          quantity: next[existingIdx].quantity + quantity 
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
          quantity,
          image: promotion.image,
          shippingCost: promotion.shippingCost
        }
      ];
    });
    openCart();

    setTimeout(() => {
      addingRef.current = false;
    }, 300);
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, delta) => {
    setCartItems(prev => {
      const next = [...prev];
      if (!next[index]) return prev;
      
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== index);
      }
      
      next[index] = { ...next[index], quantity: newQty };
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addPromotionToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
