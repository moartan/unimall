import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";

// Lightweight fetch-based search to avoid axios dependency
const searchProducts = async (query, controller) => {
  const res = await fetch(
    `/products/public/search?q=${encodeURIComponent(query)}&limit=6`,
    { signal: controller.signal }
  );
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data?.results || [];
};

const formatPrice = (price) => {
  if (price === undefined || price === null) return null;
  const value = Number(price);
  if (Number.isNaN(value)) return null;
  return `$${value.toLocaleString()}`;
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
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapperRef = useRef(null);
  const mobileRef = useRef(null);

  useEffect(() => {
    if (typeof registerMobileOpen === "function") {
      registerMobileOpen(() => setMobileOpen(true));
    }
  }, [registerMobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        mobileRef.current &&
        !mobileRef.current.contains(e.target)
      ) {
        setSearchOpen(false);
        setMobileOpen(false);
        onCloseMobile();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCloseMobile]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError("");
      setSearchOpen(false);
      return;
    }

    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError("");

    const handler = setTimeout(async () => {
      try {
        const results = await searchProducts(searchTerm.trim(), controller);
        setSearchResults(results);
        setSearchOpen(true);
      } catch (error) {
        if (error.name === "AbortError") return;
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
    if (searchLoading) {
      return (
        <div className="px-4 py-4 text-sm text-slate-500">Searching...</div>
      );
    }
    if (searchError) {
      return <div className="px-4 py-4 text-sm text-red-500">{searchError}</div>;
    }
    if (!searchResults.length) {
      return (
        <div className="px-4 py-4 text-sm text-slate-500">
          No products match "{searchTerm}"
        </div>
      );
    }

    return (
      <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100 custom-scroll">
        {searchResults.map((product) => {
          const linkTarget = product.slug
            ? `/products/details/${product.slug}`
            : product._id
              ? `/products/details/${product._id}`
              : "/products";
          const rawImage = product.images?.[0];
          const productImage =
            typeof rawImage === "string" ? rawImage : rawImage?.url;
          return (
            <li key={product._id}>
              <Link
                to={linkTarget}
                className="flex gap-4 px-4 py-3 hover:bg-slate-50 transition"
                onClick={() => {
                  setSearchOpen(false);
                  setMobileOpen(false);
                  onResultClick();
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
                  <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
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
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
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
              onFocus={() => searchResults.length && setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  e.currentTarget.blur();
                }
              }}
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col" ref={mobileRef}>
          <div className="bg-white p-3 flex items-center gap-3 shadow-md">
            <div className="flex-1 h-12 rounded-full border-2 border-primary/50 bg-white flex items-center px-4 text-primary gap-3 w-full">
              <Search size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="flex-1 outline-none text-slate-700 text-base"
                autoFocus
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

          <div className="flex-1 bg-white mt-1 rounded-t-2xl shadow-2xl overflow-hidden">
            {renderResults()}
          </div>
        </div>
      )}
    </>
  );
}
