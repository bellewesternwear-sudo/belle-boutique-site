import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CartProduct {
  id: string;
  name: string;
  code: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
}

interface CartItem {
  id: string;
  product_id: string;
  size: string | null;
  quantity: number;
  product: CartProduct;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, size: string | null, quantity?: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CART_STORAGE_KEY = "belle-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Helper to generate unique cart item ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
      }
    }
    setLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loading]);

  const addToCart = useCallback(async (productId: string, size: string | null, quantity: number = 1): Promise<boolean> => {
    try {
      // Check if item already exists in cart
      const existingItem = items.find(
        (item) => item.product_id === productId && item.size === size
      );

      if (existingItem) {
        // Update quantity
        setItems((prev) =>
          prev.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
        toast({
          title: "Cart Updated",
          description: "Item quantity has been updated",
        });
        return true;
      }

      // Fetch product details from database
      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, code, price, original_price, image_url")
        .eq("id", productId)
        .single();

      if (error || !product) {
        throw new Error("Product not found");
      }

      // Add new item
      const newItem: CartItem = {
        id: generateId(),
        product_id: productId,
        size,
        quantity,
        product: {
          id: product.id,
          name: product.name,
          code: product.code,
          price: product.price,
          original_price: product.original_price,
          image_url: product.image_url,
        },
      };

      setItems((prev) => [newItem, ...prev]);
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      });
      return true;
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
      return false;
    }
  }, [items, toast]);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    toast({
      title: "Removed",
      description: "Item removed from cart",
    });
  }, [toast]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [items]);

  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
