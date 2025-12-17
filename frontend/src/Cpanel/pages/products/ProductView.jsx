import { useMemo, useState } from 'react';
import { FaThLarge } from 'react-icons/fa';
import { FiList } from 'react-icons/fi';
import ProductGrid from './ProductGrid';
import ProductList from './ProductList';

export default function ProductView() {
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('-createdAt');
  const [meta, setMeta] = useState({ totalPages: 1, page: 1 });
  const activeFilters = useMemo(() => ({}), []);

  const toggleClass = (active) =>
    [
      'flex items-center gap-2 px-4 py-2 text-sm font-semibold transition',
      active
        ? 'bg-primary text-white shadow-soft'
        : 'bg-transparent text-text-primary dark:text-text-light',
    ].join(' ');

  return (
    <div className="space-y-4 -mt-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-light">View Products</h1>
          <p className="text-sm text-text-secondary dark:text-text-light/70">
            Switch between grid and list just like customers see it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-primary/25 bg-white dark:bg-dark-card shadow-soft overflow-hidden">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={toggleClass(view === 'grid')}
            >
              <FaThLarge className="text-[14px]" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={toggleClass(view === 'list')}
            >
              <FiList className="text-[14px]" />
              <span>List</span>
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-white dark:bg-dark-card px-4 py-2 shadow-soft text-sm font-semibold text-text-primary dark:text-text-light">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-text-primary dark:text-text-light outline-none"
            >
              <option value="-createdAt">Featured</option>
              <option value="-currentPrice">Price: High to Low</option>
              <option value="currentPrice">Price: Low to High</option>
              <option value="name">Name: A-Z</option>
              <option value="-name">Name: Z-A</option>
            </select>
          </div>

        </div>
      </div>

      {view === 'grid' ? (
        <ProductGrid
          hideHeading
          controlledPage={page}
          onPageChange={setPage}
          hidePagination
          inlinePager
          sort={sort}
          onMeta={setMeta}
          extraFilters={activeFilters}
        />
      ) : (
        <ProductList
          hideHeading
          controlledPage={page}
          onPageChange={setPage}
          hidePagination
          inlinePager
          sort={sort}
          onMeta={setMeta}
          extraFilters={activeFilters}
        />
      )}
    </div>
  );
}
