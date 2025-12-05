import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from 'react-icons/md';
import { useCpanel } from '../../context/CpanelProvider';
import { deleteProduct, getCategories, getProducts } from '../../api/catalog';

const statusClass = (status) =>
  status === 'Published'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-700';

export default function ProductGrid() {
  const { api, user } = useCpanel();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Published');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const pageSize = 9;
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
    setStatus('Published');
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
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-light">Product Grid</h1>
            <p className="text-sm text-text-secondary dark:text-text-light/70">Preview customer-style grid.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
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

        <div className="space-y-3">
          <div className="text-sm text-text-secondary dark:text-text-light/70">
            Showing {rangeStart}-{rangeEnd} of {total} products
          </div>
          {loading ? (
            <div className="rounded-lg border border-primary/10 bg-light-bg dark:bg-dark-hover px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
              Loading products...
            </div>
          ) : null}
          {!loading && products.length === 0 ? (
            <div className="rounded-lg border border-primary/10 bg-light-bg dark:bg-dark-hover px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
              No products match your filters.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const image = product.images?.[0]?.url;
              const publicLink = product.slug
                ? `/products/details/${product.slug}`
                : product._id
                  ? `/products/details/${product._id}`
                  : '/products';
              return (
                <div key={product._id} className="rounded-2xl border border-primary/10 bg-white dark:bg-dark-card shadow-soft dark:shadow-strong overflow-hidden flex flex-col">
                  <div className="relative">
                    {image ? (
                      <img src={image} alt={product.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-light-bg dark:bg-dark-hover flex items-center justify-center text-text-secondary">No image</div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {product.isFeatured ? (
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Featured</span>
                      ) : null}
                      {product.isPromoted ? (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Promoted</span>
                      ) : null}
                      {product.isExclusive ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Exclusive</span>
                      ) : null}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 flex-1">
                    <div className="text-xs uppercase tracking-wide text-text-secondary dark:text-text-light/70">
                      {product.category?.name || 'Uncategorized'} · {product.stock ?? 0} in stock
                    </div>
                    <div className="text-lg font-semibold text-text-primary dark:text-text-light">{product.name}</div>
                    <div className="text-sm text-text-secondary dark:text-text-light/70 line-clamp-2">
                      {product.shortDescription || 'No description'}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="text-xl font-bold text-text-primary dark:text-text-light">
                        ${Number(product.currentPrice || 0).toLocaleString()}
                      </div>
                      {product.originalPrice ? (
                        <div className="text-sm line-through text-text-secondary/70">
                          ${Number(product.originalPrice).toLocaleString()}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {product.tags?.slice(0, 4).map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-light-bg dark:bg-dark-hover text-xs text-text-secondary border border-primary/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 pb-4">
                    <Link
                      to={publicLink}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light hover:bg-primary/10 transition text-sm"
                      title="View public page"
                    >
                      <FiExternalLink /> View
                    </Link>
                    <Link
                      to={`/cpanel/products/edit/${product._id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light hover:bg-primary/10 transition text-sm"
                      title="Edit"
                    >
                      <FiEdit2 /> Edit
                    </Link>
                    {isAdmin ? (
                      <button
                        disabled={deletingId === product._id}
                        onClick={() => handleDelete(product._id)}
                        className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
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
