import { useMemo, useState } from "react";
import ProductFilter from "./components/ProductFilter.jsx";
import ProductList from "./components/ProductList.jsx";
import QuickViewModal from "./components/QuickViewModal.jsx";

const categories = [
  { label: "All categories", value: "all", desc: "Show everything that is published" },
  { label: "Mobile", value: "mobile", desc: "for all mobiles" },
  { label: "Laptop", value: "laptop", desc: "Laptops and ultrabooks" },
  { label: "Tablet", value: "tablet", desc: "Tablets and XR" },
  { label: "Camera", value: "camera", desc: "Cameras and gear" },
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

const trendingProducts = [
  {
    id: "t1",
    title: "Google Pixel 9 Pro XL",
    category: "mobile",
    stock: "28 units ready",
    price: 1299,
    badge: "Featured",
    rating: 4.4,
    shortDesc: "AI-powered flagship with upgraded Tensor G4 chip.",
    warranty: "Includes 2-year warranty",
    tags: ["pixel 9", "android"],
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t2",
    title: "Dell XPS 16 (2025)",
    category: "laptop",
    stock: "In stock",
    price: 2199,
    originalPrice: 2299,
    badge: "New",
    rating: 4.3,
    shortDesc: "Ultra-premium laptop with next-gen Intel Core processors.",
    warranty: "Includes 2-year warranty",
    tags: ["xps 16", "creator laptop"],
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t3",
    title: "Apple Vision Pro Lite",
    category: "tablet",
    stock: "Only 10 left",
    price: 2299,
    badge: "Featured",
    rating: 4.5,
    shortDesc: "Mixed-reality headset for immersive computing.",
    warranty: "Includes 2-year warranty",
    tags: ["vision pro", "ar headset", "apple xr"],
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t4",
    title: "Canon EOS R8 Mark II",
    category: "camera",
    stock: "20 units ready",
    price: 1899,
    originalPrice: 1999,
    badge: "Featured",
    rating: 4.2,
    shortDesc: "High-performance mirrorless camera with 8K video capture.",
    warranty: "Includes 2-year warranty",
    tags: ["canon r8", "mirrorless camera", "8k"],
    image: "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=800&q=80",
  },
];

export default function TrendingPage() {
  const [quickProduct, setQuickProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePrice, setActivePrice] = useState("any");
  const [activeRating, setActiveRating] = useState(null);
  const [activeTag, setActiveTag] = useState("Trending");
  const [view, setView] = useState("grid");
  const [sort] = useState("Featured");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const filtered = useMemo(() => {
    return trendingProducts.filter((p) => {
      const catOk = activeCategory === "all" || p.category === activeCategory;
      const ratingOk = activeRating ? p.rating >= activeRating : true;
      return catOk && ratingOk;
    });
  }, [activeCategory, activeRating]);

  const selectedChips = useMemo(() => {
    const chips = [];
    if (activeCategory !== "all") {
      const label = categories.find((c) => c.value === activeCategory)?.label || activeCategory;
      chips.push({ label, type: "category", value: "all" });
    }
    if (activePrice !== "any") {
      const label = priceRanges.find((p) => p.value === activePrice)?.label || activePrice;
      chips.push({ label, type: "price", value: "any" });
    }
    return chips;
  }, [activeCategory, activePrice]);

  const clearChip = (chip) => {
    if (chip.type === "category") setActiveCategory("all");
    if (chip.type === "price") setActivePrice("any");
  };

  return (
    <div className="w-full mx-auto px-4 lg:px-20 py-8 bg-[#f8fafc] space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <ProductFilter
          filtersOpen={filtersOpen}
          onToggle={() => setFiltersOpen((v) => !v)}
          onReset={() => {
            setActiveCategory("all");
            setActivePrice("any");
            setActiveRating(null);
            setActiveTag("Trending");
          }}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categories={categories}
          activePrice={activePrice}
          setActivePrice={setActivePrice}
          priceRanges={priceRanges}
          activeRating={activeRating}
          setActiveRating={setActiveRating}
          ratings={ratings}
        />

        <main className="flex-1">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex flex-col gap-4 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {["All", "Trending", "Bestsellers", "Latest", "Bundles"].map((tag) => (
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
                      <span className="inline-block w-4 h-4 bg-current rounded-sm" /> Grid
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 ${
                        view === "list"
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:text-primary"
                      }`}
                    >
                      <span className="inline-block w-4 h-0.5 bg-current" /> List
                    </button>
                  </div>

                  <button className="h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-2">
                    Sort by <span className="text-slate-900">{sort}</span>
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold">{filtered.length}</span> trending products
              </div>
            </div>

            <ProductList products={filtered} onQuickView={(p) => setQuickProduct(p)} view={view} />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-600">Page 1 of 1</div>
              <div className="flex items-center gap-2">
                <button className="px-4 h-10 rounded-full border border-slate-200 text-slate-500 bg-white">
                  Prev
                </button>
                <button className="w-10 h-10 rounded-full border bg-primary text-white border-primary">
                  1
                </button>
                <button className="px-4 h-10 rounded-full border border-slate-200 text-slate-600 bg-white">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <QuickViewModal
        product={quickProduct}
        related={filtered.filter((p) => p.id !== quickProduct?.id).slice(0, 3)}
        onClose={() => setQuickProduct(null)}
      />
    </div>
  );
}
