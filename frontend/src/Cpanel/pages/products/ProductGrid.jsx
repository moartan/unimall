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

export default function ProductGrid({
  hideHeading = false,
  controlledPage,
  onPageChange,
  hidePagination = false,
  sort = '-createdAt',
  onMeta,
  inlinePager = false,
  extraFilters = {},
}) {
  const { api, user } = useCpanel();
  const isControlled = typeof controlledPage === 'number';
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Published');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(controlledPage ?? 1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const pageSize = 9;
  const isAdmin = user?.employeeRole === 'admin';

  const pageToUse = controlledPage ?? page;
  const updatePage = (next) => {
    onPageChange?.(next);
    if (!isControlled) setPage(next);
  };

  useEffect(() => {
    if (isControlled) setPage(controlledPage);
  }, [controlledPage, isControlled]);

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
        const params = { page: pageToUse, limit: pageSize, sort, ...extraFilters };
        if (query) params.q = query;
        if (status !== 'all') params.status = status;
        if (category !== 'all') params.category = category;
        const res = await getProducts(api, params);
        const nextTotal = res.data?.total || 0;
        setProducts(res.data?.products || []);
        setTotal(nextTotal);
        const totalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
        onMeta?.({ page: pageToUse, total: nextTotal, totalPages, pageSize });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    },
    [api, category, pageToUse, pageSize, query, status, sort, onMeta],
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
    updatePage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(pageToUse, totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(total, currentPage * pageSize);
  const useInlinePager = Boolean(inlinePager);

  const categoryOptions = useMemo(
    () => [{ _id: 'all', name: 'All categories' }, ...categories],
    [categories],
  );

  useEffect(() => {
    if (!isControlled && pageToUse > totalPages) {
      setPage(totalPages);
    }
  }, [isControlled, pageToUse, totalPages]);

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
        {!hideHeading ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-text-light">Product Grid</h1>
              <p className="text-sm text-text-secondary dark:text-text-light/70">Preview customer-style grid.</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 rounded-lg border border-primary/20 bg-light-bg dark:bg-dark-bg px-3 py-2">
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full bg-transparent focus:outline-none text-sm text-text-primary dark:text-text-light"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                updatePage(1);
              }}
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              updatePage(1);
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
              updatePage(1);
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

        {useInlinePager ? (
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm text-text-secondary dark:text-text-light/70">
            <div>
              Showing {rangeStart}-{rangeEnd} of {total} products
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => updatePage(Math.max(1, currentPage - 1))}
                className="rounded-full border border-primary/25 px-4 py-2 text-sm font-semibold text-text-secondary disabled:opacity-50"
              >
                Prev
              </button>
              <span className="rounded-full border border-primary/25 px-3 py-2 text-sm font-semibold text-text-primary dark:text-text-light">
                {currentPage}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
                className="rounded-full border border-primary/25 px-4 py-2 text-sm font-semibold text-text-primary dark:text-text-light disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</div>
        ) : null}

        <div className="space-y-3">
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
                      <div className="w-full h-48 bg-light-bg dark:bg-dark-hover flex items-center justify-center text-text-secondary">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Link
                        to={`/cpanel/products/edit/${product._id}`}
                        className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-text-primary shadow-sm hover:bg-white"
                      >
                        <FiEdit2 /> Edit
                      </Link>
                      {isAdmin ? (
                        <button
                          type="button"
                          disabled={deletingId === product._id}
                          onClick={() => handleDelete(product._id)}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary dark:text-text-light leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs text-text-secondary dark:text-text-light/70">
                          {product.category?.name || 'Uncategorized'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-semibold ${statusClass(product.status)}`}
                      >
                        {product.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xl font-extrabold text-primary">
                        ${product.currentPrice?.toFixed ? product.currentPrice.toFixed(2) : product.currentPrice}
                        {product.originalPrice ? (
                          <span className="text-xs text-text-secondary line-through">
                            ${product.originalPrice}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-text-secondary dark:text-text-light/70">Stock: {product.stock ?? 0}</div>
                    </div>
                    <p className="text-sm text-text-secondary dark:text-text-light/80 line-clamp-2">
                      {product.shortDescription || 'No description.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-primary/10 bg-light-bg/60 dark:bg-dark-hover px-4 py-3">
                    <Link
                      to={publicLink}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiExternalLink /> View public page
                    </Link>
                    <Link
                      to={`/cpanel/products/edit/${product._id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/20 px-3 py-1.5 text-sm font-semibold text-text-primary hover:bg-primary/10"
                    >
                      <FiEdit2 /> Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {!hidePagination && !useInlinePager ? (
            <div className="flex items-center justify-between text-sm text-text-secondary dark:text-text-light/70">
              <div>
                Showing {rangeStart}-{rangeEnd} of {total} products
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => updatePage(Math.max(1, currentPage - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 text-text-primary dark:text-text-light hover:bg-primary/10 disabled:opacity-50"
                >
                  <MdOutlineArrowBackIos /> Prev
                </button>
                <span className="min-w-[50px] text-center font-semibold text-text-primary dark:text-text-light">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/20 px-3 py-1.5 text-text-primary dark:text-text-light hover:bg-primary/10 disabled:opacity-50"
                >
                  Next <MdOutlineArrowForwardIos />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
