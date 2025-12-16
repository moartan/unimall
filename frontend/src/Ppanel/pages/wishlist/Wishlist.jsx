import { Bookmark, ShoppingCart, Trash } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/useWishlist";
import { useCart } from "../../context/useCart.jsx";
import { usePpanel } from "../../context/PpanelProvider.jsx";

export default function Wishlist() {
  const { user } = usePpanel();
  const navigate = useNavigate();
  const { items = [], removeItem, loading, error, refetch } = useWishlist() || {};
  const { addItem } = useCart() || {};

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true, state: { from: "/wishlist" } });
    }
  }, [user, navigate]);

  return (
    <div className="w-full mx-auto px-4 lg:px-20 py-8 bg-[#f8fafc] space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Wishlist</h1>
          <p className="text-slate-600">Save items you love and add them to cart when ready.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 text-primary">
          <Bookmark size={18} /> {items.length} item{items.length === 1 ? "" : "s"}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
            Loading wishlist...
          </div>
        ) : null}
        {!loading && items.length ? (
          items.map((item) => (
            <div
              key={item.id || item.productId}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="relative">
                <div className="w-full h-52 bg-slate-100">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No image
                    </div>
                  )}
                </div>
                {item.badge && (
                  <span className="absolute top-3 left-3 bg-white text-primary text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.category}</p>
                <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                  {item.title || item.name}
                </h3>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span>${(item.price || 0).toLocaleString()}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ${item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addItem && addItem(item, 1)}
                    className="flex-1 h-10 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart size={16} /> Add to cart
                  </button>
                  <button
                    onClick={() => removeItem && removeItem(item.id || item.productId)}
                    className="w-10 h-10 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition flex items-center justify-center"
                    title="Remove from wishlist"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
            Your wishlist is empty.
          </div>
        )}
      </div>
    </div>
  );
}
