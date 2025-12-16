import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Bookmark } from "lucide-react";
import { baseClient } from "../../shared/api/client";
import { useWishlist } from "../context/useWishlist";

// Lightweight fetch-based search to avoid axios dependency
const searchProducts = async (query, controller) => {
  const { data } = await baseClient.get("/catalog/products", {
    params: { search: query, limit: 6, status: "Published" },
    signal: controller?.signal,
  });
  return data?.products || [];
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return null;
  const value = Number(price);
  if (Number.isNaN(value)) return null;
  return `$${value.toLocaleString()}`;
};

const trendingNow = ["laptop", "smartwatch", "tablet", "camera", "headphones", "bestsellers", "sale"];
const suggestionSeeds = trendingNow.slice(0, 3);

const searchCategories = async (query, controller) => {
  const { data } = await baseClient.get("/catalog/categories", {
    params: { search: query, limit: 4, status: "Active" },
    signal: controller?.signal,
  });
  return data?.categories || [];
};

export default function SearchBar({
  className = "",
  onResultClick = () => {},
  onCloseMobile = () => {},
  hideDefaultMobileTrigger = false,
  registerMobileOpen,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchCategoriesResults, setSearchCategoriesResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const wrapperRef = useRef(null);
  const mobileRef = useRef(null);
  const navigate = useNavigate();
  const { items: wishItems = [], addItem: addWish, removeItem: removeWish } = useWishlist() || {};

  // hydrate recent searches
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = JSON.parse(localStorage.getItem("recent_searches") || "[]");
      if (Array.isArray(stored)) setRecentSearches(stored.slice(0, 8));
    } catch (_err) {
      setRecentSearches([]);
    }
  }, []);

  const persistRecent = (next) => {
    setRecentSearches(next);
    try {
      localStorage.setItem("recent_searches", JSON.stringify(next));
    } catch (_err) {
      // ignore
    }
  };

  const addRecent = (term) => {
    const cleaned = term.trim();
    if (cleaned.length < 2) return;
    persistRecent([cleaned, ...recentSearches.filter((t) => t !== cleaned)].slice(0, 8));
  };

  const combinedItems = useMemo(() => {
    if (searchTerm.trim().length < 2) return [];
    const items = [];
    searchCategoriesResults.forEach((cat) => {
      items.push({
        type: "category",
        id: cat._id,
        label: cat.name,
        link: `/collections/${cat.slug || cat.name?.toLowerCase() || cat._id}`,
        raw: cat,
      });
    });
    searchResults.forEach((product) => {
      const linkTarget = product.slug
        ? `/collections/view/${product.slug}`
        : product._id
          ? `/collections/view/${product._id}`
          : "/collections";
      items.push({
        type: "product",
        id: product._id,
        label: product.name,
        link: linkTarget,
        raw: product,
      });
    });
    return items;
  }, [searchTerm, searchResults, searchCategoriesResults]);

  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!combinedItems.length) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex(0);
  }, [combinedItems]);

  useEffect(() => {
    if (typeof registerMobileOpen === "function") {
      registerMobileOpen(() => setMobileOpen(true));
    }
  }, [registerMobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedInsideDesktop = wrapperRef.current?.contains(e.target);
      const clickedInsideMobile = mobileRef.current?.contains(e.target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setSearchOpen(false);
        setMobileOpen(false);
        onCloseMobile();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onCloseMobile]);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setSearchCategoriesResults([]);
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError("");

    const handler = setTimeout(async () => {
      try {
        const query = searchTerm.trim();
        const [results, cats] = await Promise.all([
          searchProducts(query, controller),
          searchCategories(query, controller),
        ]);
        setSearchResults(results);
        setSearchCategoriesResults(cats);
        setSearchOpen(true);
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") return;
        setSearchCategoriesResults([]);
        setSearchError("Unable to search right now.");
        setSearchOpen(true);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [searchTerm]);

  const handleSelect = (item) => {
    if (!item) return;
    addRecent(searchTerm);
    setSearchOpen(false);
    setMobileOpen(false);
    onResultClick();
    navigate(item.link);
  };

  const isInWishlist = (id) => wishItems.some((w) => w.id === id || w.productId === id);

  const toggleWishlist = (product) => {
    const pid = product._id || product.id;
    if (!pid) return;
    if (isInWishlist(pid)) {
      removeWish && removeWish(pid);
    } else {
      addWish && addWish(pid);
    }
  };

  const handleKeyDown = (e) => {
    const total = combinedItems.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!total) return;
      setActiveIndex((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!total) return;
      setActiveIndex((prev) => (prev - 1 + total) % total);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < total) {
        e.preventDefault();
        handleSelect(combinedItems[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      e.currentTarget.blur();
    }
  };

  const highlightMatch = (text) => {
    if (!text) return "";
    const query = searchTerm.trim();
    if (!query) return text;
    const lowerQuery = query.toLowerCase();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text
      .split(regex)
      .filter(Boolean)
      .map((part, idx) =>
        part.toLowerCase() === lowerQuery ? (
          <span key={idx} className="text-primary font-semibold">
            {part}
          </span>
        ) : (
          <span key={idx}>{part}</span>
        )
      );
  };

  const renderResults = () => {
    const hasQuery = searchTerm.trim().length >= 2;
    const hasCategoryHits = searchCategoriesResults.length > 0;

    const SuggestionChips = () => (
      <div className="flex flex-wrap gap-2">
        {suggestionSeeds.map((term) => (
          <button
            key={term}
            onClick={() => {
              setSearchTerm(term);
              setSearchOpen(true);
            }}
            className="px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-700 hover:border-primary hover:text-primary transition"
          >
            {term}
          </button>
        ))}
      </div>
    );

    if (!hasQuery) {
      return (
        <div className="px-4 py-4 space-y-4">
          {recentSearches.length ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recently searched</p>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => persistRecent([])}
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchTerm(term);
                      setSearchOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-700 hover:border-primary hover:text-primary transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trending now</p>
            <div className="flex flex-wrap gap-2">
              {trendingNow.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    setSearchOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-700 hover:border-primary hover:text-primary transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (searchLoading) {
      return (
        <div className="px-4 py-4 space-y-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex gap-4 animate-pulse px-1">
              <div className="w-16 h-16 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="h-3 w-2/3 bg-slate-100 rounded" />
                <div className="h-3 w-1/3 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (searchError) {
      return (
        <div className="px-4 py-4 space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {searchError}
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <button
              className="text-primary font-semibold hover:underline"
              onClick={() => {
                setSearchTerm("");
                setSearchResults([]);
                setSearchError("");
                setSearchOpen(true);
              }}
            >
              Clear search
            </button>
            <span className="text-xs uppercase tracking-wide text-slate-500">Try:</span>
          </div>
          <SuggestionChips />
        </div>
      );
    }
    if (!searchResults.length) {
      return (
        <div className="px-4 py-4 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            No matches for “{searchTerm}”
          </div>
          {hasCategoryHits ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Matching categories</p>
              <div className="flex flex-wrap gap-2">
                {searchCategoriesResults.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/collections/${cat.slug || cat.name?.toLowerCase() || cat._id}`}
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-700 hover:border-primary hover:text-primary transition"
                    onClick={() => {
                      addRecent(searchTerm);
                      setSearchOpen(false);
                      setMobileOpen(false);
                      onResultClick();
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <button
              className="text-primary font-semibold hover:underline"
              onClick={() => {
                setSearchTerm("");
                setSearchResults([]);
                setSearchCategoriesResults([]);
                setSearchOpen(true);
              }}
            >
              Clear search
            </button>
            <span className="text-xs uppercase tracking-wide text-slate-500">Try:</span>
          </div>
          <SuggestionChips />
        </div>
      );
    }

    return (
      <div className="max-h-96 overflow-y-auto custom-scroll divide-y divide-slate-100">
        {hasCategoryHits ? (
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Categories</p>
            <div className="flex flex-wrap gap-2">
              {searchCategoriesResults.map((cat, idx) => {
                const globalIndex = idx;
                const isActive = activeIndex === globalIndex;
                return (
                  <Link
                    key={cat._id}
                    to={`/collections/${cat.slug || cat.name?.toLowerCase() || cat._id}`}
                    className={`px-3 py-1.5 rounded-full border text-sm transition ${
                      isActive
                        ? "border-primary text-primary bg-primary/5"
                        : "border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
                    }`}
                    onClick={() => {
                      handleSelect(combinedItems[globalIndex]);
                    }}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        {searchResults.length ? (
          <ul className="divide-y divide-slate-100">
              {searchResults.map((product, idx) => {
                const linkTarget = product.slug
                  ? `/collections/view/${product.slug}`
                  : product._id
                    ? `/collections/view/${product._id}`
                    : "/collections";
              const rawImage = product.images?.[0];
              const productImage =
                typeof rawImage === "string" ? rawImage : rawImage?.url;
              const globalIndex = searchCategoriesResults.length + idx;
              const isActive = activeIndex === globalIndex;
              return (
                <li key={product._id} className={isActive ? "bg-primary/5" : ""}>
                  <Link
                    to={linkTarget}
                    className="group flex gap-4 px-4 py-3 hover:bg-slate-50 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect(combinedItems[globalIndex]);
                    }}
                  >
                    <div className="w-16 h-16 rounded-xl border border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">No image</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold text-slate-900 leading-snug line-clamp-2 ${isActive ? "text-primary" : ""}`}>
                        {highlightMatch(product.name)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {product.shortDescription ||
                          product.category?.name ||
                          "No description"}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm font-semibold">
                        <span className="text-primary">
                          {formatPrice(product.currentPrice) ?? "—"}
                        </span>
                        {Number(product.originalPrice) >
                          Number(product.currentPrice) && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        {Number(product.originalPrice) > Number(product.currentPrice) ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            -{Math.round(100 - (Number(product.currentPrice) / Number(product.originalPrice)) * 100)}%
                          </span>
                        ) : null}
                        {product.isFeatured || product.isPromoted ? (
                          <span className="text-[11px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            Bestseller
                          </span>
                        ) : null}
                        {product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30 ? (
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          ⭐ {Number(product.averageRating || product.rating || 0).toFixed(1)}
                        </span>
                        {product.reviewCount || product.numReviews ? (
                          <span className="text-xs text-slate-500">
                            ({product.reviewCount || product.numReviews} reviews)
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="self-center">
                      <button
                        type="button"
                        aria-label="Save for later"
                        className={`w-10 h-10 rounded-full border-2 transition opacity-0 group-hover:opacity-100 ${
                          isInWishlist(product._id || product.id)
                            ? "border-primary bg-primary text-white opacity-100 shadow-sm"
                            : "border-primary text-primary bg-white hover:bg-primary/5 shadow-sm"
                        }`}
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          toggleWishlist(product);
                        }}
                      >
                        <Bookmark
                          size={18}
                          className="mx-auto"
                          fill={isInWishlist(product._id || product.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
        {combinedItems.length ? (
          <div className="px-4 py-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
            <span>↵ open • ↑↓ navigate • Esc close</span>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {/* Desktop / Tablet */}
      <div
        className={`hidden lg:flex flex-1 max-w-3xl ${className}`}
        ref={wrapperRef}
      >
        <div className="relative w-full">
          <div className="h-12 rounded-full border-2 border-primary/50 bg-white flex items-center px-5 text-primary gap-3 w-full shadow-sm">
            <Search size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="flex-1 outline-none text-slate-700 text-base"
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {searchOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden">
              {renderResults()}
            </div>
          )}
        </div>
      </div>

      {/* Mobile icon */}
      {!hideDefaultMobileTrigger && (
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-primary"
          onClick={() => setMobileOpen(true)}
          aria-label="Open search"
        >
          <Search size={18} />
        </button>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => { setMobileOpen(false); setSearchOpen(false); onCloseMobile(); }}>
          <div
            className="absolute inset-0 bg-white flex flex-col"
            ref={mobileRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white p-3 flex items-center gap-3 shadow-md">
              <div className="flex-1 h-12 rounded-full border-2 border-primary/50 bg-white flex items-center px-4 text-primary gap-3 w-full">
                <Search size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 outline-none text-slate-700 text-base"
                  autoFocus
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center"
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(false);
                  onCloseMobile();
                }}
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 bg-white overflow-y-auto">
              {renderResults()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
