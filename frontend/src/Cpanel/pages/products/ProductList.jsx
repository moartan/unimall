import { useMemo, useState } from 'react';
import { FiSearch, FiEye, FiEdit2 } from 'react-icons/fi';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from 'react-icons/md';

const mockProducts = [
  {
    id: 'PRC-J8Y2ZKC3',
    name: 'Samsung Galaxy Tab S10 Ultra',
    price: 1199,
    compareAt: 1299,
    stock: 22,
    availability: 'Available',
    category: 'Tablet',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'PR-7TZ5N299',
    name: 'Beats Studio Pro',
    price: 349,
    compareAt: 399,
    stock: 32,
    availability: 'Available',
    category: 'Audio',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'PR-00U31E5L',
    name: 'Huawei MatePad Pro 13.2',
    price: 849,
    compareAt: 899,
    stock: 26,
    availability: 'Available',
    category: 'Tablet',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'PRC-2K1JKJUDH',
    name: 'Sony A6700 Creator Bundle',
    price: 1699,
    compareAt: 1799,
    stock: 18,
    availability: 'Available',
    category: 'Camera',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'PRC-85WYTFLP',
    name: 'Apple Vision Pro Lite',
    price: 2299,
    compareAt: 2499,
    stock: 10,
    availability: 'Available',
    category: 'Tablet',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'PRC-2E8VJD83',
    name: 'Bose QuietComfort Ultra Headphones',
    price: 449,
    compareAt: 499,
    stock: 40,
    availability: 'Available',
    category: 'Audio',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'PRC-2AL4SKTR',
    name: 'Canon EOS R8 Mark II',
    price: 1899,
    compareAt: 1999,
    stock: 20,
    availability: 'Available',
    category: 'Camera',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'PRC-2JH5UAZ7',
    name: 'Garmin Fenix 8 Sapphire Solar',
    price: 949,
    compareAt: 999,
    stock: 34,
    availability: 'Available',
    category: 'Watch',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1518182170549-025f8b85aa47?auto=format&fit=crop&w=300&q=80',
  },
];

const statusClass = (status) =>
  status === 'Published'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-700';

export default function ProductList() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return mockProducts.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' ? true : p.status.toLowerCase() === status;
      const matchesCategory = category === 'all' ? true : p.category.toLowerCase() === category;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [query, status, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const categories = ['all', ...new Set(mockProducts.map((p) => p.category.toLowerCase()))];

  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setCategory('all');
    setPage(1);
  };

  return (
    <div className="space-y-4 -mt-2">
      <div className="p-1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-light">Product List</h1>
            <p className="text-sm text-text-secondary dark:text-text-light/70">Manage your inventory, pricing, and visibility.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light hover:bg-primary/10 transition">
              Export
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition">
              + Add Product
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
            <FiSearch className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full bg-transparent focus:outline-none text-sm text-text-primary dark:text-text-light"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="whitespace-nowrap px-4 py-2 rounded-lg border border-primary/20 text-text-secondary dark:text-text-light/80 hover:bg-primary/10 transition"
          >
            Clear Filters
          </button>
        </div>

        <div className="-mx-1">
          <table className="min-w-full text-sm">
            <thead className="bg-light-bg dark:bg-dark-hover text-text-secondary dark:text-text-light/70 uppercase text-[12px] tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((product) => (
                <tr key={product.id} className="border-t border-primary/10">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover border border-primary/10"
                      />
                      <div>
                        <div className="font-semibold text-text-primary dark:text-text-light">{product.name}</div>
                        <div className="text-xs text-text-secondary dark:text-text-light/70">{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-text-primary dark:text-text-light font-semibold">${product.price.toLocaleString()}</div>
                    <div className="text-xs line-through text-text-secondary/70">${product.compareAt.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{product.availability}</div>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">{product.stock} Stock</div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light">{product.category}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2 text-text-secondary dark:text-text-light">
                      <button className="p-2 rounded-lg border border-primary/15 hover:bg-primary/10 transition" title="View">
                        <FiEye />
                      </button>
                      <button className="p-2 rounded-lg border border-primary/15 hover:bg-primary/10 transition" title="Edit">
                        <FiEdit2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 text-sm text-text-secondary dark:text-text-light/70 border-t border-primary/10">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(filtered.length, currentPage * pageSize)} of {filtered.length} products
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light disabled:opacity-40 hover:bg-primary/10 transition"
            >
              <MdOutlineArrowBackIos size={16} />
            </button>
            <div className="px-3 py-1 rounded-lg bg-light-bg dark:bg-dark-hover border border-primary/10 text-text-primary dark:text-text-light">
              {currentPage} / {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light disabled:opacity-40 hover:bg-primary/10 transition"
            >
              <MdOutlineArrowForwardIos size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
