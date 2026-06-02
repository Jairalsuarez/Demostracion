/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PublicStoreContext = createContext(null);
const CART_STORAGE_KEY = "sabores-public-cart";

function readStoredCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function PublicStoreProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart());
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    const requested = Math.max(1, Number(quantity || 1));
    const stock = Number(product?.stock || 0);
    if (!product?.id || stock <= 0) return false;

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(stock, item.quantity + requested) }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          nombre: product.nombre,
          precio: Number(product.precio || 0),
          imagen_url: product.imagen_url,
          quantity: Math.min(stock, requested),
          stock,
        },
      ];
    });

    setCartOpen(true);
    return true;
  };

  const removeItem = (productId) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  };

  const setQuantity = (productId, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity || 1));
    setItems((current) =>
      current.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(item.stock || nextQuantity, nextQuantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = useMemo(() => {
    const totalItems = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
    const totalPrice = items.reduce((acc, item) => acc + Number(item.quantity || 0) * Number(item.precio || 0), 0);

    return {
      addItem,
      cartOpen,
      clearCart,
      closeCart: () => setCartOpen(false),
      isInCart: (productId) => items.some((item) => item.id === productId),
      items,
      openCart: () => setCartOpen(true),
      removeItem,
      setQuantity,
      toggleCart: () => setCartOpen((current) => !current),
      totalItems,
      totalPrice,
    };
  }, [cartOpen, items]);

  return <PublicStoreContext.Provider value={value}>{children}</PublicStoreContext.Provider>;
}

export function usePublicStore() {
  const context = useContext(PublicStoreContext);

  if (!context) {
    throw new Error("usePublicStore debe usarse dentro de PublicStoreProvider");
  }

  return context;
}
