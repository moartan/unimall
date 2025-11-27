import { useMemo, useState } from "react";
import {
  SlidersHorizontal,
  CircleDot,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  Filter,
} from "lucide-react";

const categories = [
  { label: "All categories", value: "all", desc: "Show everything that is published" },
  { label: "Mobile", value: "mobile", desc: "for all mobiles" },
  { label: "Laptop", value: "laptop", desc: "Laptops and ultrabooks" },
  { label: "Watch", value: "watch", desc: "Smart watches & wearables" },
  { label: "Camera", value: "camera", desc: "Cameras and gear" },
  { label: "Audio", value: "audio", desc: "Headphones and speakers" },
];

const priceRanges = [
  { label: "All prices", value: "any" },
  { label: "Under $500", value: "under500" },
  { label: "$500 - $1,000", value: "500-1000" },
  { label: "$1,000 - $2,000", value: "1000-2000" },
  { label: "$2,000 & above", value: "2000+" },
];

const ratings = [
  { label: "4.5 ★ & up", value: 4.5 },
  { label: "4.0 ★ & up", value: 4.0 },
  { label: "3.5 ★ & up", value: 3.5 },
];

const products = [
  {
    id: 1,
    title: "Sony A6700 Creator Bundle",
    category: "camera",
    stock: "18 units ready",
    price: 1699,
    originalPrice: 1799,
    badge: "Featured",
    rating: 0,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Apple Vision Pro Lite",
    category: "tablet",
    stock: "Only 10 left",
    price: 2299,
    badge: "Featured",
    rating: 0,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Canon EOS R8 Mark II",
    category: "camera",
    stock: "20 units ready",
    price: 1899,
    originalPrice: 1999,
    badge: "Featured",
    rating: 0,
    image:
      "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Dell XPS 16 (2025)",
    category: "laptop",
    stock: "In stock",
    price: 2199,
    originalPrice: 2299,
    badge: "New",
    rating: 0,
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Google Pixel 9 Pro XL",
    category: "mobile",
    stock: "28 units ready",
    price: 1299,
    badge: "New",
    rating: 0,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "iPad Air M2 11\"",
    category: "tablet",
    stock: "22 units ready",
    price: 1099,
    badge: "Featured",
    rating: 0,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePrice, setActivePrice] = useState("any");
  const [activeRating, setActiveRating] = useState(null);
  const [activeTag, setActiveTag] = useState("All");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("Featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catOk = activeCategory === "all" || p.category === activeCategory;
      const priceOk = true; // placeholder for now
      const ratingOk = activeRating ? p.rating >= activeRating : true;
      return catOk && priceOk && ratingOk;
    });
  }, [activeCategory, activePrice, activeRating]);

  return (
    <div className="w-full mx-auto px-4 lg:px-20 py-8 bg-[#f8fafc]">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:hidden">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between text-slate-700 font-semibold"
          >
            <span className="inline-flex items-center gap-2">
              <Filter size={18} /> Filters
            </span>
            <ChevronDown
              size={16}
              className={`transition ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Filters */}
        <aside
          className={`lg:w-72 flex-shrink-0 ${filtersOpen ? "block" : "hidden lg:block"}`}
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-6 mt-2 lg:mt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                <SlidersHorizontal size={18} /> Filters
              </div>
              <button className="text-primary text-sm font-semibold">Reset</button>
            </div>

            <FilterBlock title="Categories">
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`w-full text-left p-3 rounded-2xl border text-sm transition ${
                      activeCategory === cat.value
                        ? "border-primary text-primary bg-primary/5"
                        : "border-slate-200 text-slate-700 hover:border-primary/40"
                    }`}
                  >
                    <p className="font-semibold">{cat.label}</p>
                    <p className="text-xs text-slate-500">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Price range">
              <div className="space-y-2">
                {priceRanges.map((p) => (
                  <label
                    key={p.value}
                    className={`flex items-center justify-between gap-2 p-3 rounded-2xl border text-sm cursor-pointer transition ${
                      activePrice === p.value
                        ? "border-primary text-primary bg-primary/5"
                        : "border-slate-200 text-slate-700 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="price"
                        checked={activePrice === p.value}
                        onChange={() => setActivePrice(p.value)}
                        className="accent-primary"
                      />
                      <span>{p.label}</span>
                    </div>
                    <CircleDot
                      size={16}
                      className={activePrice === p.value ? "text-primary" : "text-slate-300"}
                    />
                  </label>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Customer Rating">
              <div className="space-y-2">
                {ratings.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-sm cursor-pointer transition ${
                      activeRating === r.value
                        ? "border-primary text-primary bg-primary/5"
                        : "border-slate-200 text-slate-700 hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={activeRating === r.value}
                      onChange={() => setActiveRating(r.value)}
                      className="accent-primary"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </FilterBlock>
            <hr className="my-4" />
            <button className="w-full h-12 rounded-full bg-primary text-white font-semibold text-base shadow-sm hover:bg-primary-hover transition">
              Apply filters
            </button>
          </div>
        </aside>

        {/* Products */}
        <main className="flex-1">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex flex-col gap-4 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {["All", "Bestsellers", "Latest", "Bundles"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={`px-4 py-2 rounded-full border text-sm transition ${
                        activeTag === tag
                          ? "border-primary text-primary bg-primary/5"
                          : "border-slate-200 text-slate-600 hover:border-primary/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center overflow-hidden rounded-full border border-slate-200">
                    <button
                      onClick={() => setView("grid")}
                      className={`px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 ${
                        view === "grid"
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:text-primary"
                      }`}
                    >
                      <LayoutGrid size={16} /> Grid
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 ${
                        view === "list"
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:text-primary"
                      }`}
                    >
                      <ListIcon size={16} /> List
                    </button>
                  </div>

                  <button className="h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-2">
                    Sort by <span className="text-slate-900">{sort}</span>
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold">{filtered.length}</span> products
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <div className="relative">
                    <div className="w-full h-56 bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-white text-primary text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                        {product.badge}
                      </span>
                    )}
                    <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-500 hover:text-primary shadow">
                      <Heart size={18} />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="uppercase tracking-wide">{product.category}</span>
                      <span className="text-slate-400">•</span>
                      <span>{product.stock}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{product.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-amber-500">
                      <Star size={14} fill="currentColor" />{" "}
                      <span className="text-slate-600">{product.rating.toFixed(1)}</span>
                      <span className="text-slate-400">(0 reviews)</span>
                    </div>
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
                    <div className="flex items-center gap-2 pt-2">
                      <button className="flex-1 h-11 rounded-full border border-slate-200 font-semibold text-slate-700 hover:border-primary hover:text-primary transition inline-flex items-center justify-center gap-2">
                        <Eye size={18} /> Quick view
                      </button>
                      <button className="flex-1 h-11 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center gap-2">
                        <ShoppingCart size={18} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-600">Page 1 of 3</div>
              <div className="flex items-center gap-2">
                <button className="px-4 h-10 rounded-full border border-slate-200 text-slate-500 bg-white">
                  Prev
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-full border ${
                      page === 1
                        ? "bg-primary text-white border-primary"
                        : "border-slate-200 text-slate-600 hover:border-primary"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-4 h-10 rounded-full border border-slate-200 text-slate-600 bg-white">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
        {title}
      </div>
      {children}
    </div>
  );
}
