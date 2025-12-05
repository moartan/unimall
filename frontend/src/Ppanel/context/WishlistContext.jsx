import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { usePpanel } from "./PpanelProvider";

export const WishlistContext = createContext({});

export default function WishlistProvider({ children }) {
  const { user, api } = usePpanel();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/customer/wishlist");
      const list = res.data?.wishlist?.items || [];
      setItems(
        list
          .map((i) => ({
            id: i.product?._id || i.product,
            productId: i.product?._id || i.product,
            title: i.product?.name,
            name: i.product?.name,
            price: i.product?.currentPrice,
            originalPrice: i.product?.originalPrice,
            category: i.product?.category?.name || i.product?.category || "",
            image: i.product?.images?.[0]?.url,
            badge: i.product?.isFeatured ? "Featured" : i.product?.isPromoted ? "Promoted" : "",
          }))
          .filter((x) => x.id),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addItem = useCallback(
    async (productId) => {
      if (!user) return;
      await api.post("/customer/wishlist", { productId });
      fetchWishlist();
    },
    [fetchWishlist, user],
  );

  const removeItem = useCallback(
    async (productId) => {
      if (!user) return;
      await api.delete(`/customer/wishlist/${productId}`);
      fetchWishlist();
    },
    [fetchWishlist, user],
  );

  const clear = useCallback(async () => {
    if (!user) return;
    await api.delete("/customer/wishlist");
    fetchWishlist();
  }, [fetchWishlist, user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      addItem,
      removeItem,
      clear,
      refetch: fetchWishlist,
    }),
    [items, loading, error, addItem, removeItem, clear, fetchWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
