import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from 'react-icons/md';
import { useCpanel } from '../../context/CpanelProvider';
import { deleteProduct, getCategories, getProducts } from '../../api/catalog';

const statusClass = (status) =>
  status === 'Published'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-700';

export default function ProductTable() {
  const { api, user } = useCpanel();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const pageSize = 10;
  const isAdmin = user?.employeeRole === 'admin';

  const fetchCategories = useMemo(
    () => async () => {
      try {
        const res = await getCategories(api, { limit: 100, status: 'Active' });
        setCategories(res.data?.categories || []);
      } catch (err) {
        setError('Failed to load categories');
      }
    },
    [api],
  );

  const fetchProducts = useMemo(
    () => async () => {
      setLoading(true);
      setError('');
      try {
        const params = { page, limit: pageSize };
        if (query) params.q = query;
        if (status !== 'all') params.status = status;
        if (category !== 'all') params.category = category;
        const res = await getProducts(api, params);
        setProducts(res.data?.products || []);
        setTotal(res.data?.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    },
    [api, category, page, pageSize, query, status],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setCategory('all');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(total, currentPage * pageSize);

  const categoryOptions = useMemo(
    () => [{ _id: 'all', name: 'All categories' }, ...categories],
    [categories],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    const confirmed = window.confirm('Delete this product? This cannot be undone.');
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await deleteProduct(api, id);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
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
            <Link
              to="/cpanel/products/add"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-soft transition"
            >
              + Add Product
            </Link>
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
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-text-primary dark:text-text-light"
          >
            {categoryOptions.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
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

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</div>
        ) : null}

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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    Loading products...
                  </td>
                </tr>
              ) : null}
              {!loading && products.map((product) => (
                <tr key={product._id} className="border-t border-primary/10">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-primary/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-light-bg dark:bg-dark-hover border border-primary/10 flex items-center justify-center text-[10px] font-semibold text-text-secondary">
                          IMG
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-text-primary dark:text-text-light">{product.name}</div>
                        <div className="text-xs text-text-secondary dark:text-text-light/70">{product.productCode || product._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-text-primary dark:text-text-light font-semibold">
                      ${Number(product.currentPrice || 0).toLocaleString()}
                    </div>
                    {product.originalPrice ? (
                      <div className="text-xs line-through text-text-secondary/70">${Number(product.originalPrice).toLocaleString()}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {product.stock > 0 ? 'Available' : 'Out of stock'}
                    </div>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">{product.stock} Stock</div>
                  </td>
                  <td className="px-4 py-4 text-text-primary dark:text-text-light">
                    {product.category?.name || product.category?.slug || '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2 text-text-secondary dark:text-text-light">
                      <Link
                        to={`/products/details/${product.slug || product._id}`}
                        className="p-2 rounded-lg border border-primary/15 hover:bg-primary/10 transition"
                        title="View (public)"
                      >
                        <FiEye />
                      </Link>
                      <Link
                        to={`/cpanel/products/edit/${product._id}`}
                        className="p-2 rounded-lg border border-primary/15 hover:bg-primary/10 transition"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </Link>
                      {isAdmin ? (
                        <button
                          disabled={deletingId === product._id}
                          onClick={() => handleDelete(product._id)}
                          className="p-2 rounded-lg border border-primary/15 hover:bg-primary/10 transition disabled:opacity-50"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
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
            Showing {rangeStart}-{rangeEnd} of {total} products
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
