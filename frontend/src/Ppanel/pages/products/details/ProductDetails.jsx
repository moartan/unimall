import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, Heart, ArrowLeft, Check } from "lucide-react";
import ProductList from "../components/ProductList.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import { useCart } from "../../../context/useCart.jsx";

const mockCatalog = [
  {
    id: "d1",
    slug: "google-pixel-9-pro-xl",
    title: "Google Pixel 9 Pro XL",
    category: "mobile",
    price: 1299,
    originalPrice: 1399,
    rating: 4.4,
    shortDesc: "AI-powered flagship with upgraded Tensor G4 chip.",
    warranty: "Includes 2-year warranty",
    tags: ["pixel 9", "android"],
    stock: "28 units ready",
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "d2",
    slug: "dell-xps-16-2025",
    title: "Dell XPS 16 (2025)",
    category: "laptop",
    price: 2199,
    originalPrice: 2299,
    rating: 4.3,
    shortDesc: "Ultra-premium laptop with next-gen Intel Core processors.",
    warranty: "Includes 2-year warranty",
    tags: ["xps 16", "creator laptop"],
    stock: "In stock",
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "d3",
    slug: "canon-eos-r8-mark-ii",
    title: "Canon EOS R8 Mark II",
    category: "camera",
    price: 1899,
    originalPrice: 1999,
    rating: 4.2,
    shortDesc: "High-performance mirrorless camera with 8K video capture.",
    warranty: "Includes 2-year warranty",
    tags: ["canon r8", "mirrorless camera", "8k"],
    stock: "20 units ready",
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=1400&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export default function ProductDetails() {
  const { slugOrId } = useParams();
  const { addItem, items = [], setQuantity } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Blue");
  const [selectedVariant, setSelectedVariant] = useState("256GB");
  const product = useMemo(
    () => mockCatalog.find((p) => p.slug === slugOrId || p.id === slugOrId) || mockCatalog[0],
    [slugOrId]
  );
  const related = mockCatalog.filter((p) => p.id !== product.id).slice(0, 3);
  const gallery = product.gallery || [];
  const cartItem = items.find((i) => i.id === product.id);
  const displayQty = cartItem?.quantity ?? qty;

  return (
    <div className="w-full mx-auto px-4 lg:px-20 py-8 bg-[#f8fafc] space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="aspect-4/3 w-full overflow-hidden rounded-3xl bg-slate-100">
            <img
              src={gallery[selectedImg] || product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[product.image, ...gallery].slice(0, 5).map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                onClick={() => setSelectedImg(idx === 0 ? 0 : idx - 1)}
                className={`aspect-square overflow-hidden rounded-2xl border ${
                  (idx === 0 ? selectedImg === 0 : selectedImg === idx - 1)
                    ? "border-primary"
                    : "border-slate-200"
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
              to="/products"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm"
            >
              Back to collections <ArrowLeft size={16} />
            </Link>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900">{product.title}</h1>
          <div className="flex items-center gap-2 text-sm text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-slate-600">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400">(128 reviews)</span>
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
              options={["Green", "Pink", "Silver", "Blue"]}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
            <OptionGroup
              label="SSD capacity"
              options={["256GB", "512GB", "1TB"]}
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

            <button className="px-5 h-11 rounded-full border border-slate-200 font-semibold text-slate-700 hover:border-primary hover:text-primary transition inline-flex items-center gap-2">
              <Heart size={18} /> Save
            </button>
          </div>
      </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Related products</p>
            <h2 className="text-2xl font-bold text-slate-900">You might also like</h2>
          </div>
        </div>
        <ProductList products={related} onQuickView={() => {}} view="grid" />
      </div>

      <QuickViewModal product={null} related={[]} onClose={() => {}} />
    </div>
  );
}

function OptionGroup({ label, options, selected, onSelect }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-3 h-10 rounded-full border text-sm font-semibold ${
              selected === opt
                ? "border-primary text-primary bg-primary/5"
                : "border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
            }`}
          >
            {selected === opt && <Check size={14} className="mr-1 inline text-primary" />}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
