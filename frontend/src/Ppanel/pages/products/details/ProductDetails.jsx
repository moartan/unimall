import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, Bookmark, ArrowLeft, Check } from "lucide-react";
import ProductList from "../components/ProductList.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import { useCart } from "../../../context/useCart.jsx";
import { useWishlist } from "../../../context/useWishlist";
import { fetchProductDetail, fetchPublishedProducts, trackProductView } from "../../../api/catalog";
import useCanonical from "../../../../shared/seo/useCanonical.js";

const mapProduct = (p) => ({
  id: p._id,
  slug: p.slug,
  title: p.name,
  category: p.category?.slug || p.category?.name || "uncategorized",
  categoryId: p.category?._id,
  stock: `${p.stock ?? 0} in stock`,
  price: Number(p.salePrice ?? p.price ?? p.currentPrice ?? 0),
  originalPrice: p.regularPrice ? Number(p.regularPrice) : null,
  badge: p.isFeatured ? "Featured" : p.isPromoted ? "Promoted" : "",
  rating: Number(p.averageRating || 0),
  reviewCount: Number(p.reviewCount || p.ratingCount || 0),
  shortDesc: p.shortDescription || "",
  warranty: p.promotionEndDate
    ? `Promo ends ${new Date(p.promotionEndDate).toLocaleDateString()}`
    : "Includes 2-year warranty",
  tags: p.tags || [],
  image: p.images?.[0]?.url,
  gallery: p.images?.map((img) => img.url).filter(Boolean) || [],
});

export default function ProductDetails() {
  const { slugOrId } = useParams();
  const { addItem, items = [], setQuantity } = useCart();
  const { items: wishItems = [], addItem: addWish, removeItem: removeWish } = useWishlist() || {};
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Default");
  const [selectedVariant, setSelectedVariant] = useState("Standard");
  const [quickProduct, setQuickProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const cartItem = items.find((i) => i.id === product?.id);
  const displayQty = cartItem?.quantity ?? qty;
  const inWishlist = product
    ? wishItems.some((w) => w.id === product.id || w.productId === product.id)
    : false;

  useCanonical(`/collections/view/${slugOrId}`);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchProductDetail(slugOrId);
        const mapped = mapProduct(res.data?.product || {});
        setProduct(mapped);
        trackProductView(slugOrId).catch(() => {});
        // Record recently viewed
        try {
          const key = "recent_products";
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          const filtered = existing.filter((item) => item.id !== mapped.id);
          const entry = {
            id: mapped.id,
            slug: mapped.slug || mapped.id,
            title: mapped.title,
            image: mapped.image || mapped.gallery?.[0] || "",
            price: mapped.price,
            category: mapped.category,
          };
          const updated = [entry, ...filtered].slice(0, 10);
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (_err) {
          // ignore storage errors
        }
        setSelectedImg(0);
        if (mapped.categoryId) {
          const relatedRes = await fetchPublishedProducts({ category: mapped.categoryId, limit: 4 });
          const relatedMapped = (relatedRes.data?.products || [])
            .filter((p) => p._id !== mapped.id)
            .map(mapProduct)
            .slice(0, 3);
          setRelated(relatedMapped);
        } else {
          setRelated([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slugOrId]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(product.gallery || [])].filter(Boolean).slice(0, 5);
  }, [product]);

  if (loading) {
    return <div className="w-full mx-auto px-4 lg:px-20 py-8">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="w-full mx-auto px-4 lg:px-20 py-8 text-rose-600">{error || "Product not found"}</div>;
  }

  return (
    <div className="w-full mx-auto px-4 lg:px-20 py-8 bg-[#f8fafc] space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="aspect-4/3 w-full overflow-hidden rounded-3xl bg-slate-100">
            <img
              src={gallery[selectedImg]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {gallery.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                onClick={() => setSelectedImg(idx)}
                className={`aspect-square overflow-hidden rounded-2xl border ${
                  selectedImg === idx ? "border-primary" : "border-slate-200"
                } bg-slate-50`}
              >
                <img src={img} alt={product.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="uppercase tracking-wide">{product.category}</span>
              <span className="text-slate-400">•</span>
              <span>{product.stock}</span>
            </div>
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm"
            >
              Back to collections <ArrowLeft size={16} />
            </Link>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900">{product.title}</h1>
          <div className="flex items-center gap-2 text-sm text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-slate-600">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400">({product.reviewCount || 0} reviews)</span>
          </div>
          <p className="text-slate-700 text-lg leading-relaxed">{product.shortDesc}</p>
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
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-slate-900">${product.price.toLocaleString()}</p>
            {product.originalPrice && (
              <p className="text-lg text-slate-400 line-through">
                ${product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
          <p className="text-sm text-slate-500">{product.warranty}</p>

          <div className="space-y-3 pt-2">
            <OptionGroup
              label="Colour"
              options={["Default", "Black", "Silver", "Blue"]}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
            <OptionGroup
              label="Variant"
              options={["Standard", "Plus", "Pro"]}
              selected={selectedVariant}
              onSelect={setSelectedVariant}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {cartItem ? (
              <div className="h-12 min-w-[160px] rounded-full border border-slate-200 bg-white flex items-center justify-between px-3 gap-2">
                <button
                  onClick={() => setQuantity && setQuantity(product, Math.max(0, displayQty - 1))}
                  className="w-10 h-10 rounded-full border border-slate-200 text-slate-700 hover:border-primary hover:text-primary transition"
                >
                  −
                </button>
                <span className="text-base font-semibold text-slate-900 min-w-6 text-center">
                  {displayQty}
                </span>
                <button
                  onClick={() => setQuantity && setQuantity(product, displayQty + 1)}
                  className="w-10 h-10 rounded-full border border-slate-200 text-slate-700 hover:border-primary hover:text-primary transition"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="px-6 h-12 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center gap-2"
                onClick={() => {
                  addItem && addItem(product, displayQty);
                }}
              >
                <ShoppingCart size={18} /> Add to cart
              </button>
            )}

            <button
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition ${
                inWishlist
                  ? "border-primary text-primary bg-primary/10"
                  : "border-slate-200 bg-white text-slate-500 hover:text-primary"
              }`}
              onClick={() => {
                if (inWishlist) {
                  removeWish && removeWish(product.id);
                } else {
                  addWish && addWish(product.id);
                }
              }}
              title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Bookmark size={18} fill={inWishlist ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      <QuickViewModal product={quickProduct} related={related} onClose={() => setQuickProduct(null)} />

      {related?.length ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">You might also like</h3>
            <button
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm"
              onClick={() => setQuickProduct(related[0])}
            >
              Quick view one
            </button>
          </div>
          <ProductList products={related} onQuickView={setQuickProduct} view="grid" />
        </div>
      ) : null}
    </div>
  );
}

function OptionGroup({ label, options, selected, onSelect }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-4 h-10 rounded-full border text-sm font-semibold transition ${
              selected === opt
                ? "border-primary bg-primary/10 text-primary"
                : "border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
