import { Filter, ChevronDown, CircleDot } from "lucide-react";

export default function ProductFilter({
  filtersOpen,
  onToggle,
  onReset,
  activeCategory,
  setActiveCategory,
  categories,
  activePrice,
  setActivePrice,
  priceRanges,
  activeRating,
  setActiveRating,
  ratings,
}) {
  return (
    <aside className="lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 mt-2 lg:mt-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <Filter size={18} /> Filters
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onReset} className="text-primary text-sm font-semibold">
              Reset
            </button>
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-primary lg:hidden"
            >
              <ChevronDown size={16} className={`transition ${filtersOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {filtersOpen && (
          <>
            <FilterBlock title="Categories">
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`w-full text-left p-3 rounded-2xl border text-sm transition ${
                      (Array.isArray(activeCategory)
                        ? activeCategory.includes(cat.value)
                        : activeCategory === cat.value)
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
          </>
        )}
      </div>
    </aside>
  );
}

function FilterBlock({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-bold text-slate-800 flex items-center gap-2">{title}</div>
      {children}
    </div>
  );
}
