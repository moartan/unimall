import ProductCard from "./ProductCard";
import { useCart } from "../../../context/useCart.jsx";
import { Eye, ShoppingCart } from "lucide-react";

export default function ProductList({ products, onQuickView, view }) {
  const { items = [], addItem, setQuantity } = useCart();

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

  if (view === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition flex flex-col lg:flex-row"
          >
            <div className="w-full lg:w-64 h-52 bg-slate-100 flex-shrink-0">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
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
        <ProductCard key={product.id} product={product} onQuickView={onQuickView} view={view} />
      ))}
    </div>
  );
}
