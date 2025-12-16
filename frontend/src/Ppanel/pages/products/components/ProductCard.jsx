import { Bookmark, ShoppingCart, Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/useCart.jsx";
import { useWishlist } from "../../../context/useWishlist";

export default function ProductCard({ product, onQuickView }) {
  const { items = [], addItem, setQuantity } = useCart();
  const cartItem = items.find((i) => i.id === product.id);
  const { items: wishItems = [], addItem: addWish, removeItem: removeWish } = useWishlist() || {};
  const inWishlist = wishItems.some((w) => w.id === product.id || w.productId === product.id);

  const inc = () => {
    if (cartItem) {
      setQuantity(cartItem, cartItem.quantity + 1);
    } else {
      addItem(product, 1);
    }
  };

  const dec = () => {
    if (cartItem && cartItem.quantity > 1) {
      setQuantity(cartItem, cartItem.quantity - 1);
    } else if (cartItem && cartItem.quantity === 1) {
      setQuantity(cartItem, 0);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="relative">
        <div className="w-full h-56 bg-slate-100">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        </div>
        {product.badge && (
          <span className="absolute top-3 left-3 bg-white text-primary text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {product.badge}
          </span>
        )}
        <button
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur flex items-center justify-center shadow ${
            inWishlist ? "bg-primary text-white" : "bg-white/80 text-slate-500 hover:text-primary"
          }`}
          onClick={() => {
            if (inWishlist) {
              removeWish && removeWish(product.id);
            } else {
              addWish && addWish(product.id);
            }
            onQuickView?.(null);
          }}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Bookmark size={18} fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="uppercase tracking-wide">{product.category}</span>
          <span className="text-slate-400">•</span>
          <span>{product.stock}</span>
        </div>
        <Link
          to={
            product.slug
              ? `/collections/view/${product.slug}`
              : product.id
                ? `/collections/view/${product.id}`
                : "/collections"
          }
          className="text-lg font-semibold text-slate-900 hover:text-primary"
        >
          {product.title}
        </Link>
        <div className="flex items-center gap-1 text-sm text-amber-500">
          <Star size={14} fill="currentColor" />
          <span className="text-slate-600">{product.rating.toFixed(1)}</span>
          <span className="text-slate-400">(0 reviews)</span>
        </div>
        <p className="text-sm text-slate-600">
          {product.shortDesc || "Discover more inside."}
        </p>
        {product.tags?.length ? (
          <div className="flex flex-wrap gap-2">
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
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-slate-900">
            ${product.price.toLocaleString()}
          </p>
          {product.originalPrice && (
            <p className="text-sm text-slate-400 line-through">
              ${product.originalPrice.toLocaleString()}
            </p>
          )}
        </div>
        <p className="text-xs text-slate-500">{product.warranty}</p>
        <div className="flex items-center gap-3 pt-2">
          <button
            className="flex-1 h-9 rounded-full border border-slate-200 font-semibold text-slate-700 hover:border-primary hover:text-primary transition inline-flex items-center justify-center gap-2 text-sm"
            onClick={() => onQuickView(product)}
          >
            <Eye size={16} /> Quick view
          </button>
          {cartItem ? (
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
          ) : (
            <button
              className="flex-1 h-9 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center gap-2 text-sm"
              onClick={inc}
            >
              <ShoppingCart size={16} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
