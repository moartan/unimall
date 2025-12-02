import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "../../context/useWishlist";
import { useCart } from "../../context/useCart.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePpanel } from "../../context/PpanelProvider.jsx";

const mockWishlist = [
  {
    id: "w1",
    title: "Google Pixel 9 Pro XL",
    category: "mobile",
    price: 1299,
    originalPrice: 1399,
    badge: "New",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "w2",
    title: "iPad Air M2 11\"",
    category: "tablet",
    price: 949,
    originalPrice: 999,
    badge: "Featured",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "w3",
    title: "Sony A6700 Creator Bundle",
    category: "camera",
    price: 1699,
    originalPrice: 1799,
    badge: "Featured",
    image: "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Wishlist() {
  const { user } = usePpanel();
  const navigate = useNavigate();
  const { items = [] } = useWishlist() || {};
  const { addItem } = useCart() || {};
  const displayItems = items.length ? items : mockWishlist;

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
          <Heart size={18} /> {displayItems.length} item{displayItems.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayItems.length ? (
          displayItems.map((item) => (
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
                <button
                  onClick={() => addItem && addItem(item, 1)}
                  className="w-full h-10 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingCart size={16} /> Add to cart
                </button>
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
