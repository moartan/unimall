import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List as ListIcon, ChevronDown } from "lucide-react";
import ProductFilter from "./components/ProductFilter";
import ProductList from "./components/ProductList";
import QuickViewModal from "./components/QuickViewModal";
import { fetchPublishedProducts, fetchCategories } from "../../api/catalog";

const staticAllCategory = { label: "All categories", value: "all", desc: "Show everything that is published" };
const staticDefaults = [
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

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePrice, setActivePrice] = useState("any");
  const [activeRating, setActiveRating] = useState(null);
  const [activeTag, setActiveTag] = useState("All");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("Featured");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [quickProduct, setQuickProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 9;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([staticAllCategory, ...staticDefaults]);

  const mapProduct = (p) => ({
    id: p._id,
    slug: p.slug,
    title: p.name,
    category: p.category?.slug || p.category?.name?.toLowerCase() || String(p.category || "uncategorized"),
    categoryId: p.category?._id || (typeof p.category === "string" ? p.category : undefined),
    stock: `${p.stock ?? 0} in stock`,
    price: Number(p.currentPrice || 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    badge: p.isFeatured ? "Featured" : p.isPromoted ? "Promoted" : "",
    rating: Number(p.averageRating || 0),
    shortDesc: p.shortDescription || "",
    tags: p.tags || [],
    image: p.images?.[0]?.url,
    warranty: p.promotionEndDate
      ? `Promo ends ${new Date(p.promotionEndDate).toLocaleDateString()}`
      : "Includes warranty",
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { status: "Published", limit: pageSize, page };
      if (activeCategory !== "all") params.category = activeCategory;
      const res = await fetchPublishedProducts(params);
      const list = res.data?.products || [];
      setProducts(list.map(mapProduct));
      setTotal(res.data?.total || list.length);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCats = async () => {
    try {
      const res = await fetchCategories({ status: "Active", limit: 50 });
      const cats = (res.data?.categories || []).map((c) => ({
        label: c.name,
        value: c.slug || c.name.toLowerCase(),
        desc: c.description || "",
        id: c._id,
      }));
      const merged = [staticAllCategory, ...(cats.length ? cats : staticDefaults)];
      setCategories(merged);
    } catch (_err) {
      // fallback to static categories on error
      setCategories([staticAllCategory, ...staticDefaults]);
    }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catOk = activeCategory === "all" || p.category === activeCategory;
      const priceOk = true; // placeholder for future price filtering
      const ratingOk = activeRating ? p.rating >= activeRating : true;
      return catOk && priceOk && ratingOk;
    });
  }, [activeCategory, activePrice, activeRating, products]);

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
  }, [quickProduct, products]);

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

  useEffect(() => {
    fetchCats();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, activeCategory]);

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

                <div className="text-sm text-slate-600 flex items-center justify-between">
                  <span>
                    Showing <span className="font-semibold">{filtered.length}</span> of {total || filtered.length} products
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-9 px-3 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40 hover:border-primary hover:text-primary transition"
                    >
                      Prev
                    </button>
                    <div className="px-3 py-1 rounded-full border border-slate-200 text-slate-700 text-sm">
                      {page}
                    </div>
                    <button
                      disabled={page * pageSize >= total}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-9 px-3 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40 hover:border-primary hover:text-primary transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
                  {error}
                </div>
              ) : null}
              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-500">
                  Loading products...
                </div>
              ) : (
                <ProductList products={filtered} onQuickView={(p) => setQuickProduct(p)} view={view} />
              )}
            </div>
          </main>
        </div>
      </div>

      <QuickViewModal product={quickProduct} related={related} onClose={() => setQuickProduct(null)} />
    </>
  );
}
