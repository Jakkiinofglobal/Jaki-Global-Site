import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from backend on mount
  useEffect(() => {
    const loadCart = async () => {
      const savedCartId = localStorage.getItem('cartId');
      
      if (savedCartId) {
        try {
          const response: any = await fetch(`/api/cart/${savedCartId}`);
          if (response.ok) {
            const cartData = await response.json();
            setCartId(cartData.id);
            setItems(cartData.items || []);
            localStorage.setItem('cart', JSON.stringify(cartData.items || []));
          } else {
            // Cart not found in backend, fall back to localStorage
            const saved = localStorage.getItem('cart');
            setItems(saved ? JSON.parse(saved) : []);
          }
        } catch (error) {
          console.error('Failed to load cart from backend:', error);
          // Fall back to localStorage
          const saved = localStorage.getItem('cart');
          setItems(saved ? JSON.parse(saved) : []);
        }
      } else {
        // No saved cart ID, try localStorage
        const saved = localStorage.getItem('cart');
        setItems(saved ? JSON.parse(saved) : []);
      }
      
      setIsLoaded(true);
    };

    loadCart();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Sync to backend whenever cart changes
  useEffect(() => {
    if (!isLoaded) return;

    const syncToBackend = async () => {
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const cartData = { 
        items, 
        total: Math.round(total) // Ensure it's an integer (cents)
      };

      try {
        if (cartId) {
          // Update existing cart
          await apiRequest('PUT', `/api/cart/${cartId}`, cartData);
        } else if (items.length > 0) {
          // Create new cart
          const response: any = await apiRequest('POST', '/api/cart', cartData);
          setCartId(response.id);
          localStorage.setItem('cartId', response.id);
        }
      } catch (error) {
        console.error('Failed to sync cart to backend:', error);
        // Don't show error to user for background sync
      }
    };

    syncToBackend();
  }, [items, cartId, isLoaded]);

  const addItem = (newItem: CartItem) => {
    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(
        item => item.productId === newItem.productId && item.variantId === newItem.variantId
      );

      if (existingIndex >= 0) {
        const updated = [...currentItems];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }

      return [...currentItems, newItem];
    });
  };

  const removeItem = (productId: string, variantId: number) => {
    setItems(currentItems =>
      currentItems.filter(item => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
