import { FiSearch } from 'react-icons/fi';

export default function FiltersBar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  categoryOptions = [],
  adsFilter = 'all',
  onAdsChange,
  onReset,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex items-center gap-2 flex-1 rounded-xl border border-primary/15 bg-[#f5f8fb] dark:bg-dark-bg px-4 py-3 shadow-soft">
        <FiSearch className="text-text-secondary" />
        <input
          type="text"
          placeholder="Search by name, ID, or customer..."
          className="w-full bg-transparent focus:outline-none text-sm text-text-primary dark:text-text-light placeholder:text-text-secondary"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-xl border border-primary/15 bg-[#f5f8fb] dark:bg-dark-bg px-4 py-3 text-sm text-text-primary dark:text-text-light shadow-soft"
      >
        <option value="all">All status</option>
        <option value="Published">Published</option>
        <option value="Draft">Draft</option>
        <option value="Archived">Archived</option>
      </select>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-xl border border-primary/15 bg-[#f5f8fb] dark:bg-dark-bg px-4 py-3 text-sm text-text-primary dark:text-text-light shadow-soft"
      >
        {categoryOptions.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={adsFilter}
        onChange={(e) => onAdsChange?.(e.target.value)}
        className="rounded-xl border border-primary/15 bg-[#f5f8fb] dark:bg-dark-bg px-4 py-3 text-sm text-text-primary dark:text-text-light shadow-soft"
      >
        <option value="all">All ads</option>
        <option value="featured">Featured</option>
        <option value="exclusive">Exclusive</option>
        <option value="noads">No ads</option>
      </select>

      <button
        onClick={onReset}
        className="whitespace-nowrap px-4 py-3 rounded-xl border border-primary/15 bg-[#f5f8fb] text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition shadow-soft"
      >
        Clear Filters
      </button>
    </div>
  );
}
