import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List as ListIcon, ChevronDown } from "lucide-react";
import ProductFilter from "./components/ProductFilter";
import ProductList from "./components/ProductList";
import QuickViewModal from "./components/QuickViewModal";

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
    shortDesc: "Compact APS-C camera with 4K120 recording and AI autofocus.",
    warranty: "Includes 2-year warranty",
    tags: ["sony a6700", "creator kit", "4k120"],
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Apple Vision Pro Lite",
    category: "tablet",
    stock: "Only 10 left",
    price: 2299,
    badge: "Featured",
    rating: 0,
    shortDesc: "Lightweight mixed-reality headset for immersive computing.",
    warranty: "Includes 2-year warranty",
    tags: ["vision pro", "ar headset", "apple xr"],
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
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
    shortDesc: "High-performance mirrorless camera with 8K video capture.",
    warranty: "Includes 2-year warranty",
    tags: ["canon r8", "mirrorless camera", "8k"],
    image: "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=800&q=80",
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
    shortDesc: "Ultra-premium laptop with next-gen Intel Core processors.",
    warranty: "Includes 2-year warranty",
    tags: ["xps 16", "creator laptop"],
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Google Pixel 9 Pro XL",
    category: "mobile",
    stock: "28 units ready",
    price: 1299,
    badge: "New",
    rating: 0,
    shortDesc: "AI-powered flagship with upgraded Tensor G4 chip.",
    warranty: "Includes 2-year warranty",
    tags: ["pixel 9", "android"],
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "iPad Air M2 11\"",
    category: "tablet",
    stock: "22 units ready",
    price: 1099,
    badge: "Featured",
    rating: 0,
    shortDesc: "Lightweight tablet with Apple Pencil Pro support.",
    warranty: "Includes 2-year warranty",
    tags: ["ipad air", "tablet", "apple pencil"],
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePrice, setActivePrice] = useState("any");
  const [activeRating, setActiveRating] = useState(null);
  const [activeTag, setActiveTag] = useState("All");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("Featured");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [quickProduct, setQuickProduct] = useState(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catOk = activeCategory === "all" || p.category === activeCategory;
      const priceOk = true; // placeholder
      const ratingOk = activeRating ? p.rating >= activeRating : true;
      return catOk && priceOk && ratingOk;
    });
  }, [activeCategory, activePrice, activeRating]);

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

  const related = useMemo(() => {
    if (!quickProduct) return [];
    return products.filter((p) => p.id !== quickProduct.id).slice(0, 3);
  }, [quickProduct]);

  const clearChip = (chip) => {
    if (chip.type === "category") setActiveCategory("all");
    if (chip.type === "price") setActivePrice("any");
  };

  const resetFilters = () => {
    setActiveCategory("all");
    setActivePrice("any");
    setActiveRating(null);
    setActiveTag("All");
  };

  // Collapse filters on mobile by default, expand on desktop
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    setFiltersOpen(!isMobile);

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setFiltersOpen((prev) => {
        if (mobile) return false;
        return true;
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="w-full mx-auto px-4 lg:px-20 py-8 bg-[#f8fafc]">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProductFilter
            filtersOpen={filtersOpen}
            onToggle={() => setFiltersOpen((v) => !v)}
            onReset={resetFilters}
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
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm border-primary text-primary bg-primary/5">
                      All
                    </div>
                    {selectedChips.map((chip) => (
                      <div
                        key={chip.label}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm border-slate-200 text-slate-700 bg-white"
                      >
                        <span>{chip.label}</span>
                        <button
                          onClick={() => clearChip(chip)}
                          className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="hidden lg:flex items-center overflow-hidden rounded-full border border-slate-200">
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

              <ProductList products={filtered} onQuickView={(p) => setQuickProduct(p)} view={view} />

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

      <QuickViewModal
        product={quickProduct}
        related={related}
        onClose={() => setQuickProduct(null)}
      />
    </>
  );
}
