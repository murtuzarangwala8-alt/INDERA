import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  toggleWishlist: (product: Product) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, authFetch, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('indera_cart') || '[]'); } catch { return []; }
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try { return JSON.parse(localStorage.getItem('indera_wishlist') || '[]'); } catch { return []; }
  });

  React.useEffect(() => {
    localStorage.setItem('indera_cart', JSON.stringify(cart));
    if (isAuthenticated) {
      authFetch('/auth/cart', {
        method: 'PUT',
        body: JSON.stringify({
          cart: cart.map((item) => ({
            productId: String(item.id),
            name: item.name,
            brand: item.brand,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            category: item.category,
            origin: item.origin,
          })),
        }),
      }).catch(() => undefined);
    }
  }, [cart, isAuthenticated]);

  React.useEffect(() => {
    localStorage.setItem('indera_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  React.useEffect(() => {
    if (!token) return;
    authFetch('/auth/cart')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.cart) && data.cart.length > 0) {
          setCart(data.cart.map((item: any) => ({ ...item, id: item.productId })));
        }
      })
      .catch(() => undefined);
  }, [token]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.success('Quantity updated!');
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success('Added to cart!');
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success('Removed from cart');
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        toast.success('Removed from wishlist');
        return prev.filter((item) => item.id !== product.id);
      }
      toast.success('Added to wishlist!');
      return [...prev, product];
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('indera_cart');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
