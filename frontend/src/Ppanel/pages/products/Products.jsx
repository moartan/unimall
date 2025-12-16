import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { LayoutGrid, List as ListIcon, ChevronDown } from "lucide-react";
import ProductFilter from "./components/ProductFilter";
import ProductList from "./components/ProductList";
import QuickViewModal from "./components/QuickViewModal";
import { fetchPublishedProducts, fetchCategories } from "../../api/catalog";
import useCanonical from "../../../shared/seo/useCanonical";

const staticAllCategory = { label: "All Collections", value: "all", desc: "Show everything that is published" };
const staticDefaults = [
  { label: "Tablet", value: "tablet", desc: "Tablets and productivity devices" },
  { label: "Audio", value: "audio", desc: "Headphones and speakers" },
  { label: "Camera", value: "camera", desc: "Cameras and gear" },
  { label: "Mobile", value: "mobile", desc: "for all mobiles" },
  { label: "Laptop", value: "laptop", desc: "Laptops and ultrabooks" },
  { label: "Watch", value: "watch", desc: "Smart watches & wearables" },
];

const featuredCollections = [
  { label: "Trending", value: "trending" },
  { label: "Bestsellers", value: "bestsellers" },
  { label: "Latest", value: "latest" },
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
  const { maybeFeatured, categorySlug: paramCategory } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategories, setActiveCategories] = useState(["all"]);
  const [activePrice, setActivePrice] = useState("any");
  const [activeRating, setActiveRating] = useState(null);
  const [activeTag, setActiveTag] = useState("All");
  const [view, setView] = useState(() => {
    if (typeof window === "undefined") return "grid";
    return localStorage.getItem("products_view") || "grid";
  });
  const [sort, setSort] = useState("Featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [quickProduct, setQuickProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 9;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([staticAllCategory, ...staticDefaults]);
  const [activeFeatured, setActiveFeatured] = useState("all");
  const hasMore = useMemo(() => page * pageSize < total, [page, pageSize, total]);
  const observerRef = useRef(null);
  const sortRef = useRef(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

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
      if (!activeCategories.includes("all")) params.category = activeCategories.join(",");
      const res = await fetchPublishedProducts(params);
      let list = res.data?.products || [];

      if (activeFeatured === "trending") {
        list = list.filter((p) => p.isFeatured || p.isPromoted || p.badge);
      } else if (activeFeatured === "bestsellers") {
        list = [...list].sort((a, b) => (Number(b.averageRating || b.rating || 0) || 0) - (Number(a.averageRating || a.rating || 0) || 0));
      } else if (activeFeatured === "latest") {
        list = [...list]; // placeholder; keep order as returned
      }

      const mapped = list.map(mapProduct);
      const sorted = (() => {
        if (sort === "price-asc") return [...mapped].sort((a, b) => a.price - b.price);
        if (sort === "price-desc") return [...mapped].sort((a, b) => b.price - a.price);
        if (sort === "name-asc") return [...mapped].sort((a, b) => a.title.localeCompare(b.title));
        if (sort === "name-desc") return [...mapped].sort((a, b) => b.title.localeCompare(a.title));
        return mapped;
      })();

      setProducts(sorted);
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
    return displayProducts.filter((p) => {
      const catOk = activeCategories.includes("all") || activeCategories.includes(p.category);
      const priceOk = true; // placeholder for future price filtering
      const ratingOk = activeRating ? p.rating >= activeRating : true;
      return catOk && priceOk && ratingOk;
    });
  }, [activeCategories, activePrice, activeRating, displayProducts]);

  const selectedChips = useMemo(() => {
    const chips = [];
    if (!activeCategories.includes("all")) {
      activeCategories.forEach((cat) => {
        const label = categories.find((c) => c.value === cat)?.label || cat;
        chips.push({ label, type: "category", value: cat });
      });
    }
    if (activePrice !== "any") {
      const label = priceRanges.find((p) => p.value === activePrice)?.label || activePrice;
      chips.push({ label, type: "price", value: "any" });
    }
    return chips;
  }, [activeCategories, activePrice, categories]);

  const related = useMemo(() => {
    if (!quickProduct) return [];
    return products.filter((p) => p.id !== quickProduct.id).slice(0, 3);
  }, [quickProduct, products]);

  const clearChip = (chip) => {
    if (chip.type === "category") {
      setActiveCategories((prev) => {
        const next = prev.filter((c) => c !== chip.value && c !== "all");
        return next.length ? next : ["all"];
      });
    }
    if (chip.type === "price") setActivePrice("any");
  };

  const resetFilters = () => {
    setActiveCategories(["all"]);
    setActivePrice("any");
    setActiveRating(null);
    setActiveTag("All");
    setActiveFeatured("all");
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
    if (typeof window === "undefined") return;
    try {
      const stored = JSON.parse(localStorage.getItem("recent_products") || "[]");
      setRecentlyViewed(stored);
    } catch (_err) {
      setRecentlyViewed([]);
    }
  }, []);

  const featuredSet = useMemo(() => new Set(["trending", "bestsellers", "latest"]), []);

  const parsePathState = () => {
    const segments = location.pathname.split("/").filter(Boolean);
    // expect ["collections", maybeFeatured, maybeCategory]
    if (segments[0] !== "collections") return { feat: "all", cat: null };
    const seg1 = segments[1] || "";
    const seg2 = segments[2] || "";
    if (featuredSet.has(seg1)) {
      return { feat: seg1, cat: seg2 || null };
    }
    return { feat: "all", cat: seg1 || null };
  };

  // Migrate old query-based featured to path-based
  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const qFeat = (params.get("featured") || "").toLowerCase();
    if (qFeat && featuredSet.has(qFeat)) {
      const { cat } = parsePathState();
      const target = cat ? `/collections/${qFeat}/${cat}` : `/collections/${qFeat}`;
      if (`${location.pathname}${location.search}` !== target) {
        navigate(target, { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate]);

  useEffect(() => {
    const { feat, cat } = parsePathState();
    setActiveFeatured(feat);
    if (cat) {
      setActiveCategories([cat]);
    } else {
      setActiveCategories(["all"]);
    }
    // hydrate sort/page from query
    const qs = new URLSearchParams(location.search || "");
    const qsSort = qs.get("sort");
    const qsPage = parseInt(qs.get("page") || "1", 10);
    if (qsSort && ["Featured", "price-asc", "price-desc", "name-asc", "name-desc"].includes(qsSort)) {
      setSort(qsSort);
    }
    setPage(Number.isFinite(qsPage) && qsPage > 0 ? qsPage : 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  useEffect(() => {
    fetchProducts();
  }, [page, activeCategories, activeFeatured, sort]);

  // persist view preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("products_view", view);
    } catch (_err) {
      // ignore
    }
  }, [view]);

  // Close sort dropdown when clicking/tapping outside
  useEffect(() => {
    if (!sortOpen) return undefined;
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [sortOpen]);

  // When products change, append or reset display list
  useEffect(() => {
    if (page === 1) {
      setDisplayProducts(products);
    } else {
      setDisplayProducts((prev) => {
        const merged = [...prev, ...products];
        const deduped = merged.filter(
          (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx,
        );
        return deduped;
      });
    }
  }, [products, page]);

  // Push obfuscated route when available to avoid exposing /products; keep clean fallback if token unavailable.
  const handleCategoryChange = (value) => {
    setActiveCategories((prev) => {
      if (value === "all") return ["all"];
      const withoutAll = prev.filter((c) => c !== "all");
      const exists = withoutAll.includes(value);
      const next = exists ? withoutAll.filter((c) => c !== value) : [...withoutAll, value];
      return next.length ? next : ["all"];
    });
    // Build path based on updated selection
    const futureCategories = (() => {
      if (value === "all") return ["all"];
      const withoutAll = activeCategories.filter((c) => c !== "all");
      const exists = withoutAll.includes(value);
      const next = exists ? withoutAll.filter((c) => c !== value) : [...withoutAll, value];
      return next.length ? next : ["all"];
    })();
    const slug = futureCategories.includes("all") ? "" : futureCategories[0] || "";
    const prefix = activeFeatured !== "all" ? `/collections/${activeFeatured}` : `/collections`;
    const target = slug ? `${prefix}/${slug}` : prefix;
    const qs = new URLSearchParams(location.search || "");
    qs.set("page", "1"); // reset to first page when filters change
    qs.set("sort", sort);
    const nextUrl = `${target}?${qs.toString()}`;
    const current = `${location.pathname}${location.search}`;
    if (current !== nextUrl) {
      navigate(nextUrl, { replace: false });
    }
  };

  const canonicalSlug = activeCategories.includes("all") ? "" : activeCategories[0] || "";
  const canonicalPath = canonicalSlug ? `/collections/${canonicalSlug}` : "/collections";
  useCanonical(canonicalPath);

  // Auto-load via IntersectionObserver sentinel
  useEffect(() => {
    if (!hasMore || loading || error) return;
    const sentinel = observerRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, error]);

  const handleFeaturedChange = (value) => {
    setActiveFeatured(value);
    const slug = activeCategories.includes("all") ? "" : activeCategories[0] || "";
    const target = value !== "all"
      ? (slug ? `/collections/${value}/${slug}` : `/collections/${value}`)
      : (slug ? `/collections/${slug}` : `/collections`);
    const qs = new URLSearchParams(location.search || "");
    qs.set("page", "1"); // reset page on featured change
    qs.set("sort", sort);
    const nextUrl = `${target}?${qs.toString()}`;
    const current = `${location.pathname}${location.search}`;
    if (current !== nextUrl) {
      navigate(nextUrl, { replace: false });
    }
  };

  return (
    <>
      <div className="w-full mx-auto px-4 lg:px-20 py-8 bg-[#f8fafc]">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProductFilter
            filtersOpen={filtersOpen}
            onToggle={() => setFiltersOpen((v) => !v)}
            onReset={resetFilters}
            activeCategory={activeCategories}
            setActiveCategory={handleCategoryChange}
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
              <div className="rounded-2xl border border-slate-100 p-4 mb-5 bg-white">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {[{ label: "All", value: "all" }, ...featuredCollections].map((feat) => {
                        const isActive = activeFeatured === feat.value;
                        return (
                          <button
                            key={feat.value}
                            onClick={() => handleFeaturedChange(feat.value)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition ${
                              isActive
                                ? "border-primary text-primary bg-primary/10"
                                : "border-slate-200 text-slate-700 hover:border-primary/50"
                            }`}
                          >
                            {feat.label}
                          </button>
                        );
                      })}
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

                      <div className="relative" ref={sortRef}>
                        <button
                          onClick={() => setSortOpen((v) => !v)}
                          className="h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 inline-flex items-center gap-2"
                        >
                          Sort by{" "}
                          <span className="text-slate-900">
                            {sort === "Featured"
                              ? "Featured"
                              : sort === "price-asc"
                                ? "Price: Low to High"
                                : sort === "price-desc"
                                  ? "Price: High to Low"
                                  : sort === "name-asc"
                                    ? "Name: A → Z"
                                    : "Name: Z → A"}
                          </span>
                          <ChevronDown size={16} className={sortOpen ? "rotate-180 transition" : "transition"} />
                        </button>
                        {sortOpen ? (
                          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg z-10">
                            {[
                              { label: "Featured", value: "Featured" },
                              { label: "Price: Low to High", value: "price-asc" },
                              { label: "Price: High to Low", value: "price-desc" },
                              { label: "Name: A → Z", value: "name-asc" },
                              { label: "Name: Z → A", value: "name-desc" },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  setSort(opt.value);
                                  setSortOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  sort === opt.value ? "bg-primary/5 text-primary font-semibold" : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 flex flex-wrap items-center justify-between gap-3">
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
                        disabled={!hasMore}
                        onClick={() => setPage((p) => p + 1)}
                        className="h-9 px-3 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40 hover:border-primary hover:text-primary transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
                  {error}
                </div>
              ) : (
                <ProductList
                  products={filtered}
                  onQuickView={(p) => setQuickProduct(p)}
                  view={view}
                  loading={loading}
                />
              )}

              {!loading && !error && filtered.length < total ? (
                <div className="flex items-center justify-center mt-6">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-5 h-11 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition"
                  >
                    Load more
                  </button>
                </div>
              ) : null}

              <div ref={observerRef} className="h-1" />
            </div>
          </main>
        </div>

        {recentlyViewed.length ? (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Recently viewed</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentlyViewed.map((item) => (
                <Link
                  key={item.id}
                  to={`/collections/view/${item.slug || item.id}`}
                  className="min-w-[180px] max-w-[180px] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition flex-shrink-0"
                >
                  <div className="h-24 bg-slate-100">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500 line-clamp-1">
                      {item.category || "collection"}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2">{item.title}</p>
                    <p className="text-sm font-bold text-slate-800">${Number(item.price || 0).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <QuickViewModal product={quickProduct} related={related} onClose={() => setQuickProduct(null)} />
    </>
  );
}
