import ProductCard from "./ProductCard";
import { useCart } from "../../../context/useCart.jsx";
import { Eye, ShoppingCart, Bookmark } from "lucide-react";
import { useWishlist } from "../../../context/useWishlist";

export default function ProductList({ products, onQuickView, view, loading }) {
  const { items = [], addItem, setQuantity } = useCart();
  const { items: wishItems = [], addItem: addWish, removeItem: removeWish } = useWishlist() || {};

  const adsPriorityScore = (product) => {
    const badge = product.badge?.toLowerCase?.() || "";
    if (product.isExclusive || badge === "exclusive") return 0;
    if (product.isFeatured || badge === "featured") return 1;
    return 2;
  };

  const orderedProducts =
    view === "list" && Array.isArray(products)
      ? [...products]
          .map((p, idx) => ({ p, idx }))
          .sort((a, b) => {
            const diff = adsPriorityScore(a.p) - adsPriorityScore(b.p);
            if (diff !== 0) return diff;
            return a.idx - b.idx;
          })
          .map(({ p }) => p)
      : products;

  const renderQtyControls = (product) => {
    const cartItem = items.find((i) => i.id === product.id);
    const inc = () => (cartItem ? setQuantity(cartItem, cartItem.quantity + 1) : addItem(product, 1));
    const dec = () => {
      if (!cartItem) return;
      if (cartItem.quantity > 1) setQuantity(cartItem, cartItem.quantity - 1);
      else setQuantity(cartItem, 0);
    };

    if (!cartItem) {
      return (
        <button
          className="px-4 h-9 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center gap-2 text-sm"
          onClick={inc}
        >
          <ShoppingCart size={16} /> Add
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={dec}
          className="w-9 h-9 rounded-full border border-slate-200 text-slate-700 hover:border-primary hover:text-primary transition"
        >
          −
        </button>
        <span className="text-sm font-semibold text-slate-900">{cartItem.quantity}</span>
        <button
          onClick={inc}
          className="w-9 h-9 rounded-full border border-slate-200 text-slate-700 hover:border-primary hover:text-primary transition"
        >
          +
        </button>
      </div>
    );
  };

  if (loading) {
    const skeletonItems = Array.from({ length: view === "list" ? 3 : 6 });
    if (view === "list") {
      return (
        <div className="space-y-4">
          {skeletonItems.map((_, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col lg:flex-row animate-pulse"
            >
              <div className="w-full lg:w-64 h-52 bg-slate-100" />
              <div className="flex-1 p-4 lg:p-5 space-y-3">
                <div className="h-3 w-32 bg-slate-100 rounded-full" />
                <div className="h-5 w-52 bg-slate-100 rounded-full" />
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                  <div className="h-5 w-12 bg-slate-100 rounded-full" />
                  <div className="h-5 w-10 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {skeletonItems.map((_, idx) => (
          <div key={idx} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
            <div className="w-full h-56 bg-slate-100" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-24 bg-slate-100 rounded-full" />
              <div className="h-5 w-3/4 bg-slate-100 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="flex items-center gap-2 pt-1">
                <div className="h-6 w-16 bg-slate-100 rounded-full" />
                <div className="h-6 w-10 bg-slate-100 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && (!products || !products.length)) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-slate-600">
        <p className="text-lg font-semibold text-slate-800">No products match your filters.</p>
        <p className="text-sm text-slate-500 mt-1">Try adjusting categories, featured tabs, or sorting.</p>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-4">
        {orderedProducts.map((product) => (
          <div
            key={product.id}
            className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition flex flex-col lg:flex-row"
          >
            <div className="w-full lg:w-64 h-52 bg-slate-100 flex-shrink-0 flex items-center justify-center">
              <img
                src={product.image || "https://dummyimage.com/600x600/eff2f6/94a3b8&text=No+Image"}
                alt={product.title}
                className="w-full h-full object-contain p-3"
                loading="lazy"
              />
            </div>
            <div className="flex-1 p-4 lg:p-5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="uppercase tracking-wide">{product.category}</span>
                <span className="text-slate-400">•</span>
                <span>{product.stock}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{product.title}</h3>
              <p className="text-sm text-slate-600 mt-1">
                {product.shortDesc || "Discover more in details."}
              </p>
              {product.tags?.length ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-extrabold text-slate-900">
                    ${product.price.toLocaleString()}
                  </p>
                  {product.originalPrice && (
                    <p className="text-base text-slate-400 line-through">
                      ${product.originalPrice.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className={`w-11 h-11 rounded-full border-2 shadow-sm transition ${
                      wishItems.some((w) => w.id === product.id || w.productId === product.id)
                        ? "border-primary bg-primary text-white"
                        : "border-primary text-primary bg-white hover:bg-primary/5"
                    } inline-flex items-center justify-center`}
                    onClick={() => {
                      const inWish = wishItems.some((w) => w.id === product.id || w.productId === product.id);
                      if (inWish) {
                        removeWish && removeWish(product.id);
                      } else {
                        addWish && addWish(product.id);
                      }
                    }}
                    title="Wishlist"
                  >
                    <Bookmark size={16} />
                  </button>
                  <button
                    className="px-5 h-11 rounded-full border border-slate-200 font-semibold text-slate-700 hover:border-primary hover:text-primary transition inline-flex items-center justify-center gap-2 text-sm"
                    onClick={() => onQuickView(product)}
                  >
                    <Eye size={16} /> Quick view
                  </button>
                  {renderQtyControls(product)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}
