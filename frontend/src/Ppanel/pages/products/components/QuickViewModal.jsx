import { Bookmark, ShoppingCart, Star, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { trackProductView } from "../../../api/catalog";

export default function QuickViewModal({ product, related, onClose }) {
  if (!product) return null;

  const detailLink = product.slug
    ? `/collections/view/${product.slug}`
    : product.id
      ? `/collections/view/${product.id}`
      : "/collections";

  useEffect(() => {
    if (!product) return;
    const idOrSlug = product.slug || product.id;
    if (!idOrSlug) return;
    trackProductView(idOrSlug).catch(() => {});
  }, [product]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Quick view preview</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-primary"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div className="rounded-2xl overflow-hidden bg-slate-100 h-64 lg:h-72">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                {product.category}
              </p>
              <h4 className="text-2xl font-bold text-slate-900">{product.title}</h4>
              <div className="flex items-center gap-2 text-sm text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="text-slate-600">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">(0 reviews)</span>
              </div>
              <p className="text-sm text-slate-600">{product.shortDesc}</p>
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
                <p className="text-3xl font-bold text-slate-900">
                  ${product.price.toLocaleString()}
                </p>
                {product.originalPrice && (
                  <p className="text-sm text-slate-400 line-through">
                    ${product.originalPrice.toLocaleString()}
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-500">{product.warranty}</p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={detailLink}
                  className="px-5 h-11 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center"
                  onClick={onClose}
                >
                  View full item
                </Link>
                <button className="px-5 h-11 rounded-full border border-slate-200 font-semibold text-slate-700 hover:border-primary hover:text-primary transition inline-flex items-center gap-2">
                  <ShoppingCart size={18} /> Add to cart
                </button>
                <button className="w-11 h-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-primary">
                  <Bookmark size={18} />
                </button>
              </div>
            </div>
          </div>

          {related?.length ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                You might also like
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {related.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2"
                  >
                    <p className="text-xs text-slate-500 uppercase">{item.category}</p>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2">{item.title}</p>
                    <p className="text-primary font-bold text-sm">
                      ${item.price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
