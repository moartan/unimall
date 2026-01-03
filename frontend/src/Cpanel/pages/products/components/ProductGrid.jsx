import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from 'react-icons/md';
import { useCpanel } from '../../../context/CpanelProvider';
import { deleteProduct, getCategories, getProducts } from '../../../api/catalog';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const statusClass = (status) =>
  status === 'Published'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-700';

function CardImage({ images = [], name }) {
  const [idx, setIdx] = useState(0);
  const hasImages = Boolean(images.length);
  const current = hasImages ? images[idx]?.url : null;

  useEffect(() => {
    setIdx(0);
  }, [images.length]);

  const next = () => {
    if (!hasImages) return;
    setIdx((i) => (i + 1) % images.length);
  };
  const prev = () => {
    if (!hasImages) return;
    setIdx((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <div className="group relative w-full h-56 border-b border-primary/10 bg-light-bg dark:bg-dark-hover flex items-center justify-center p-2 overflow-hidden">
      {hasImages ? (
        <>
          <img src={current} alt={name} className="max-h-full max-w-full object-contain" />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition"
                aria-label="Previous image"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition"
                aria-label="Next image"
              >
                <FiChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((img, i) => (
                  <span
                    key={img.publicId || img.url || i}
                    className={`h-1.5 w-1.5 rounded-full ${i === idx ? 'bg-primary' : 'bg-primary/30'}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-xs font-semibold text-text-secondary">No image</div>
      )}
    </div>
  );
}

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
    [api, category, pageToUse, pageSize, query, status, sort, onMeta, extraFilters],
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
                disabled={currentPage === 1}
                onClick={() => updatePage(Math.max(1, currentPage - 1))}
                className="p-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light disabled:opacity-40 hover:bg-primary/10 transition"
              >
                <MdOutlineArrowBackIos size={16} />
              </button>
              <div className="px-3 py-1 rounded-lg bg-light-bg dark:bg-dark-hover border border-primary/10 text-text-primary dark:text-text-light">
                {currentPage} / {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
                className="p-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light disabled:opacity-40 hover:bg-primary/10 transition"
              >
                <MdOutlineArrowForwardIos size={16} />
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center text-text-secondary dark:text-text-light/70 py-6">Loading products...</div>
          ) : null}
          {!loading && products.map((product) => {
            const publicLink = product.slug
              ? `/products/details/${product.slug}`
              : product._id
                ? `/products/details/${product._id}`
                : '/products';
            return (
              <div
                key={product._id}
                className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft dark:shadow-strong overflow-hidden flex flex-col"
              >
                <CardImage images={product.images} name={product.name} />
                <div className="p-4 space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-text-secondary dark:text-text-light/70 uppercase">
                      {product.category?.name || 'Uncategorized'}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${statusClass(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text-primary dark:text-text-light">{product.name}</h3>
                    <div className="text-xs text-text-secondary dark:text-text-light/70">{product.productCode || product._id}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-extrabold text-primary">
                      ${product.salePrice?.toFixed ? product.salePrice.toFixed(2) : product.salePrice}
                    </div>
                    {product.stock > 0 ? (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">In stock</span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Out of stock</span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary dark:text-text-light/80 line-clamp-3">
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
                  <div className="flex gap-2 text-text-secondary">
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
                </div>
              </div>
            );
          })}
        </div>

        {!hidePagination && !useInlinePager ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 text-sm text-text-secondary dark:text-text-light/70 border-t border-primary/10">
            <span>
              Showing {rangeStart}-{rangeEnd} of {total} products
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => updatePage(Math.max(1, currentPage - 1))}
                className="p-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light disabled:opacity-40 hover:bg-primary/10 transition"
              >
                <MdOutlineArrowBackIos size={16} />
              </button>
              <div className="px-3 py-1 rounded-lg bg-light-bg dark:bg-dark-hover border border-primary/10 text-text-primary dark:text-text-light">
                {currentPage} / {totalPages}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
                className="p-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light disabled:opacity-40 hover:bg-primary/10 transition"
              >
                <MdOutlineArrowForwardIos size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
