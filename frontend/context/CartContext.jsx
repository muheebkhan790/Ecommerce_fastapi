"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext({
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  wishlist: [],
  toggleWishlist: () => {},
  isWishlisted: () => false,
  isCartOpen: false,
  setIsCartOpen: () => {},
  cartBump: false,
  toast: null,
  hideToast: () => {},
});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("nexstore_cart");
      if (savedCart) setCartItems(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem("nexstore_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error("Failed to load cart/wishlist from localStorage:", e);
    }
    setMounted(true);
  }, []);

  // Save cart
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("nexstore_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cartItems, mounted]);

  // Save wishlist
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("nexstore_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist:", e);
    }
  }, [wishlist, mounted]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Auto hide toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const triggerCartBump = useCallback(() => {
    setCartBump(true);
    setTimeout(() => setCartBump(false), 300);
  }, []);

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!product || !product.id) return;

      const availableStock =
        typeof product.stock_quantity === "number" ? product.stock_quantity : Infinity;

      if (availableStock <= 0) {
        showToast(`"${product.title}" is out of stock!`, "error");
        return;
      }

      setCartItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.id === product.id);

        if (existingIndex > -1) {
          const currentQty = prevItems[existingIndex].quantity || 0;
          const maxAllowed = Math.min(
            availableStock,
            typeof prevItems[existingIndex].stock_quantity === "number"
              ? prevItems[existingIndex].stock_quantity
              : availableStock
          );

          if (currentQty >= maxAllowed) {
            showToast(
              `Cannot add more. You already have the maximum available stock (${maxAllowed}) in your cart.`,
              "error"
            );
            return prevItems;
          }

          const newQty = Math.min(maxAllowed, currentQty + quantity);
          const added = newQty - currentQty;

          if (currentQty + quantity > maxAllowed) {
            showToast(
              `Added ${added} item(s). Reached maximum stock limit of ${maxAllowed}!`,
              "info"
            );
          } else {
            showToast(`Added "${product.title}" to cart!`, "success");
          }

          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            stock_quantity: maxAllowed,
            quantity: newQty,
          };
          triggerCartBump();
          return updated;
        } else {
          const newQty = Math.min(availableStock, quantity);

          if (quantity > availableStock) {
            showToast(
              `Added ${newQty} item(s). Limited to available stock (${availableStock})!`,
              "info"
            );
          } else {
            showToast(`Added "${product.title}" to cart!`, "success");
          }

          triggerCartBump();
          return [
            ...prevItems,
            {
              id: product.id,
              title: product.title,
              price: product.price,
              slug: product.slug,
              image_url: product.image_url,
              stock_quantity: availableStock,
              quantity: newQty,
            },
          ];
        }
      });
    },
    [triggerCartBump, showToast]
  );

  const removeFromCart = useCallback(
    (productId) => {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      showToast("Item removed from cart", "info");
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId, qty) => {
      if (qty <= 0) {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
        return;
      }
      setCartItems((prev) =>
        prev.map((item) => {
          if (item.id === productId) {
            const maxStock =
              typeof item.stock_quantity === "number" ? item.stock_quantity : Infinity;
            if (qty > maxStock) {
              showToast(
                `Only ${maxStock} item(s) available in stock.`,
                "error"
              );
              return { ...item, quantity: maxStock };
            }
            return { ...item, quantity: qty };
          }
          return item;
        })
      );
    },
    [showToast]
  );


  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const toggleWishlist = useCallback(
    (product) => {
      if (!product || !product.id) return;
      setWishlist((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        if (exists) {
          showToast(`Removed from wishlist`, "info");
          return prev.filter((p) => p.id !== product.id);
        } else {
          showToast(`Added "${product.title}" to wishlist! ❤️`, "wishlist");
          return [...prev, { id: product.id, title: product.title, slug: product.slug }];
        }
      });
    },
    [showToast]
  );

  const isWishlisted = useCallback(
    (productId) => {
      return wishlist.some((p) => p.id === productId);
    },
    [wishlist]
  );

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        isWishlisted,
        isCartOpen,
        setIsCartOpen,
        cartBump,
        toast,
        hideToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
