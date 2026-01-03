import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCpanel } from '../../context/CpanelProvider';
import { deleteProduct, getCategories, getProducts, updateProductPriority, restoreProduct, updateProduct } from '../../api/catalog';
import { tabs, getTabConfig } from './components/tabs';
import FiltersBar from './components/FiltersBar';
import TabsBar from './components/TabsBar';
import TableHeader from './components/TableHeader';
import ProductRow from './components/ProductRow';
import ProfitRow from './components/ProfitRow';
import Pagination from './components/Pagination';
import LoadingSkeletonRows from './components/LoadingSkeletonRows';
import { buildListKey, getListCache, setListCache, clearListCache } from './components/cache';
import QuickViewModal from './components/QuickViewModal';

const statusClass = (status) =>
  status === 'Published'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-700';

const tierScore = (product) => {
  if (product.isExclusive) return 0;
  if (product.isFeatured) return 1;
  return 2;
};

const TIER_BASE = [0, 10000, 20000];
const PRIORITY_STEP = 10;

const normalizeTier = (list, tier) => {
  const items = list.filter((p) => tierScore(p) === tier);
  const sortedTier = sortByTierAndPriority(items);
  const updated = new Map();
  sortedTier.forEach((item, idx) => {
    updated.set(item._id, {
      ...item,
      displayPriority: TIER_BASE[tier] + (idx + 1) * PRIORITY_STEP,
    });
  });
  return list.map((p) => {
    if (tierScore(p) !== tier) return p;
    const replacement = updated.get(p._id);
    return replacement || p;
  });
};

const normalizeAllTiers = (list) => {
  let current = [...list];
  [0, 1, 2].forEach((tier) => {
    current = normalizeTier(current, tier);
  });
  return current;
};

const sortByTierAndPriority = (list) => {
  return [...list].sort((a, b) => {
    const tierDiff = tierScore(a) - tierScore(b);
    if (tierDiff !== 0) return tierDiff;
    const aPriority = Number.isFinite(a.displayPriority) ? a.displayPriority : 100000;
    const bPriority = Number.isFinite(b.displayPriority) ? b.displayPriority : 100000;
    if (aPriority !== bPriority) return aPriority - bPriority;
    const aCreated = new Date(a.createdAt || 0).getTime();
    const bCreated = new Date(b.createdAt || 0).getTime();
    return aCreated - bCreated;
  });
};

const adsBadges = (product) => {
  const badges = [];
  if (product.isFeatured) {
    badges.push({ label: 'Featured', className: 'bg-emerald-100 text-emerald-700' });
  }
  if (product.isExclusive) {
    badges.push({ label: 'Exclusive', className: 'bg-blue-100 text-blue-700' });
  }
  if (!badges.length) {
    badges.push({ label: 'No ads', className: 'bg-rose-100 text-rose-700' });
  }
  return badges;
};

export default function ProductList() {
  const { api, user } = useCpanel();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [adsFilter, setAdsFilter] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [tab, setTab] = useState(initialTab);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [savingPriority, setSavingPriority] = useState(null);
  const [togglingTrendingId, setTogglingTrendingId] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const pageSize = 10;
  const isAdmin = user?.employeeRole === 'admin';
  const lastKeyRef = useRef('');

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const tabConfig = getTabConfig(tab);
  const showPriorityColumn = Boolean(tabConfig.showPriority);
  const isSortByPriority = showPriorityColumn;
  const isBenefitView = Boolean(tabConfig.isBenefit);

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
        const params = { page, limit: pageSize, tab, adsFilter };
        if (query) {
          params.q = query;
          params.search = query;
        }
        if (category !== 'all') params.category = category;
        if (adsFilter === 'featured') params.featured = true;
        if (adsFilter === 'exclusive') params.exclusive = true;
        if (adsFilter === 'noads') params.noads = true;
        if (tab === 'all' && status !== 'all') params.status = status;
        if (isSortByPriority) params.sort = 'displayPriority createdAt';
        if (tabConfig.applyParams) tabConfig.applyParams(params, { status });

        const cacheKey = buildListKey(params);
        lastKeyRef.current = cacheKey;
        const cached = getListCache(cacheKey);
        if (cached) {
          setProducts(cached.list || []);
          setTotal(cached.total || 0);
        }

        const res = await getProducts(api, params);
        let nextProducts = res.data?.products || [];
        if (adsFilter === 'exclusive') {
          nextProducts = nextProducts.filter((p) => p.isExclusive);
        } else if (adsFilter === 'noads') {
          nextProducts = nextProducts.filter((p) => !p.isExclusive && !p.isFeatured);
        }
        nextProducts = sortByTierAndPriority(nextProducts);
        const processed = tabConfig.processProducts ? tabConfig.processProducts(nextProducts) : { list: nextProducts, total: null };
        nextProducts = processed.list;
        const nextTotal = processed.total ?? (res.data?.total || nextProducts.length || 0);

        setProducts(nextProducts);
        setTotal(nextTotal);
        setListCache(cacheKey, { list: nextProducts, total: nextTotal });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    },
    [api, category, page, pageSize, query, status, tab, isSortByPriority],
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
    setAdsFilter('all');
    setTab('all');
    setSearchParams({ tab: 'all' });
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
      await deleteProduct(api, id, true);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setTotal((t) => Math.max(0, t - 1));
      clearListCache();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id) => {
    if (!isAdmin) return;
    setRestoringId(id);
    try {
      await restoreProduct(api, id);
      clearListCache();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore product');
    } finally {
      setRestoringId(null);
    }
  };

  const normalizeTrending = (list) => {
    const active = list.filter((p) => p.isTrending);
    const normalizedActive = active.map((p, idx) => ({ ...p, trendingSort: idx + 1 }));
    return list.map((p) => {
      const match = normalizedActive.find((a) => a._id === p._id);
      return match || { ...p, trendingSort: undefined };
    });
  };

  const applyPrioritySwap = (list, index, direction) => {
    const current = [...list];
    const target = current[index];
    if (!target) return current;
    const tier = tierScore(target);
    const sameTierIndexes = current
      .map((p, idx) => (tierScore(p) === tier ? idx : -1))
      .filter((idx) => idx >= 0);
    const posInTier = sameTierIndexes.indexOf(index);
    if (posInTier === -1) return current;
    const swapPos = posInTier + direction;
    if (swapPos < 0 || swapPos >= sameTierIndexes.length) return current;
    const swapIndex = sameTierIndexes[swapPos];
    const next = [...current];
    const tmp = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = tmp;
    const normalized = normalizeTier(next, tier);
    return sortByTierAndPriority(normalized);
  };

  const saveTrendingOrder = async (list) => {
    const active = list.filter((p) => p.isTrending);
    for (let i = 0; i < active.length; i += 1) {
      const p = active[i];
      await updateProduct(api, p._id, {
        isTrending: true,
        trendingSort: p.trendingSort ?? i + 1,
      });
    }
    clearListCache();
    await fetchProducts();
  };

  const handlePriorityChange = async (index, direction) => {
    const target = products[index];
    const neighbor = products[index + direction];
    if (!target || !neighbor) return;
    // Trending tab: local reorder using trendingSort (stub until backend persists it)
    if (tab === 'trending') {
      if (!target.isTrending || !neighbor.isTrending) return;
      setSavingPriority(target._id);
      const reordered = [...products];
      const tmp = reordered[index];
      reordered[index] = reordered[index + direction];
      reordered[index + direction] = tmp;
      setProducts(normalizeTrending(reordered));
      try {
        await saveTrendingOrder(normalizeTrending(reordered));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to save trending order');
      } finally {
        setSavingPriority(null);
      }
      return;
    }

    setSavingPriority(target._id);
    try {
      const nextList = applyPrioritySwap(products, index, direction);
      setProducts(nextList);
      const updatedTarget = nextList.find((p) => p._id === target._id);
      const updatedNeighbor = nextList.find((p) => p._id === neighbor._id);
      if (updatedTarget && updatedNeighbor) {
        await Promise.all([
          updateProductPriority(api, updatedTarget._id, updatedTarget.displayPriority),
          updateProductPriority(api, updatedNeighbor._id, updatedNeighbor.displayPriority),
        ]);
      }
      clearListCache();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update priority');
    } finally {
      setSavingPriority(null);
    }
  };

  const handleToggleTrending = async (id, nextValue) => {
    setTogglingTrendingId(id);
    setError('');
    const updatedList = normalizeTrending(
      products.map((p) => (p._id === id ? { ...p, isTrending: nextValue } : p)),
    );
    setProducts(updatedList);
    const target = updatedList.find((p) => p._id === id);
    try {
      await updateProduct(api, id, {
        isTrending: nextValue,
        trendingSort: nextValue ? target?.trendingSort || 1 : 9999,
      });
      clearListCache();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update trending status');
    } finally {
      setTogglingTrendingId(null);
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

        <div className="flex flex-col gap-3">
        <FiltersBar
          query={query}
          onQueryChange={(val) => {
            setQuery(val);
            setPage(1);
          }}
          status={status}
          onStatusChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
          category={category}
          onCategoryChange={(val) => {
            setCategory(val);
            setPage(1);
          }}
          categoryOptions={categoryOptions}
          adsFilter={adsFilter}
          onAdsChange={(val) => {
            setAdsFilter(val);
            setPage(1);
          }}
          onReset={resetFilters}
        />

        <TabsBar
          tabs={tabs}
          active={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
            setSearchParams({ tab: next });
          }}
        />
      </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</div>
        ) : null}

        <div className="-mx-1">
          <table className="min-w-full text-sm">
            <TableHeader isBenefitView={isBenefitView} showPriorityColumn={showPriorityColumn} tab={tab} />
            <tbody>
              {loading ? <LoadingSkeletonRows isBenefitView={isBenefitView} /> : null}
              {!loading &&
                (() => {
                  const tierCounters = { 0: 0, 1: 0, 2: 0 };
                  return products.map((product, idx) => {
                    const tier = tierScore(product);
                    const rank = ++tierCounters[tier];
                    return isBenefitView ? (
                      <ProfitRow
                        key={product._id}
                        product={product}
                        idx={idx}
                        onView={setQuickViewProduct}
                      />
                    ) : (
                      <ProductRow
                        key={product._id}
                        product={product}
                        idx={idx}
                        productsLength={products.length}
                        tierRank={rank}
                        showPriorityColumn={showPriorityColumn}
                        savingPriority={savingPriority}
                        onPriorityChange={handlePriorityChange}
                        onToggleTrending={handleToggleTrending}
                        onDelete={(id) => {
                          setDeletingId(id);
                          handleDelete(id);
                        }}
                        isAdmin={isAdmin}
                        deletingId={deletingId}
                        onView={setQuickViewProduct}
                        onRestore={handleRestore}
                        tab={tab}
                        restoringId={restoringId}
                        togglingTrendingId={togglingTrendingId}
                      />
                    );
                  });
                })()}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={isBenefitView ? 8 : 7} className="px-4 py-6 text-center text-text-secondary dark:text-text-light/70">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          total={total}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
    </div>
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
