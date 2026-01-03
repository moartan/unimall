import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useCpanel } from '../../context/CpanelProvider';
import { getProducts, updateProduct } from '../../api/catalog';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

const tabs = [
  { key: 'hero', label: 'Hero' },
  { key: 'categories', label: 'Categories' },
  { key: 'special', label: 'Special Picks' },
  { key: 'trending', label: 'Trending' },
];

const initialHeroSlides = [
  { id: 'h1', title: 'Flagship phones for less', subtitle: 'Pick from the latest Android & iOS releases', cta: 'Shop Mobile' },
  { id: 'h2', title: 'Laptops built for work & play', subtitle: 'Powerful ultrabooks and creator rigs', cta: 'Browse Laptops' },
];

const initialCategories = [
  { id: 'c1', label: 'Mobile', link: '/collections/mobile', enabled: true },
  { id: 'c2', label: 'Laptop', link: '/collections/laptop', enabled: true },
  { id: 'c3', label: 'Accessories', link: '/collections/accessories', enabled: true },
];

const initialSpecials = [
  { id: 's1', title: "This Week's Spotlight", tag: "Editor's Pick", enabled: true },
  { id: 's2', title: 'Limited-Time Bundle', tag: 'Hot Deal', enabled: true },
];

export default function HomePage() {
  const { api } = useCpanel();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'hero';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [heroSlides, setHeroSlides] = useState(initialHeroSlides);
  const [categories, setCategories] = useState(initialCategories);
  const [specials, setSpecials] = useState(initialSpecials);
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [savingTrending, setSavingTrending] = useState(false);
  const [trendingError, setTrendingError] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      setTrendingError('');
      try {
        const res = await getProducts(api, {
          trending: true,
          status: 'Published',
          sort: 'trendingSort displayPriority createdAt',
          limit: 100,
        });
        const list = res.data?.products || [];
        const normalized = list.map((p, idx) => ({
          id: p._id,
          name: p.name,
          sort: p.trendingSort ?? idx + 1,
        }));
        setTrending(normalized);
      } catch (err) {
        setTrendingError(err.response?.data?.message || 'Failed to load trending products');
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, [api]);

  const persistTrendingOrder = async (list) => {
    setSavingTrending(true);
    setTrendingError('');
    try {
      for (let i = 0; i < list.length; i += 1) {
        const item = list[i];
        await updateProduct(api, item.id, { isTrending: true, trendingSort: item.sort });
      }
    } catch (err) {
      setTrendingError(err.response?.data?.message || 'Failed to save trending order');
    } finally {
      setSavingTrending(false);
    }
  };

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'hero':
        return (
          <SectionCard title="Hero Slides" description="Manage the homepage hero carousel content.">
            <div className="space-y-3">
              {heroSlides.map((slide, idx) => (
                <div key={slide.id} className="rounded-xl border border-primary/10 bg-light-bg px-3 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">{slide.title}</p>
                    <p className="text-sm text-text-secondary">{slide.subtitle}</p>
                    <p className="text-xs text-primary font-semibold">CTA: {slide.cta}</p>
                  </div>
                  <ReorderControls
                    index={idx}
                    length={heroSlides.length}
                    onMove={(direction) => {
                      const next = [...heroSlides];
                      const tmp = next[idx];
                      next[idx] = next[idx + direction];
                      next[idx + direction] = tmp;
                      setHeroSlides(next);
                    }}
                  />
                </div>
              ))}
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 text-primary font-semibold hover:bg-primary/10 transition">
                <FiPlus /> Add slide
              </button>
            </div>
          </SectionCard>
        );
      case 'categories':
        return (
          <SectionCard title="Categories" description="Choose which categories appear and their order.">
            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="rounded-xl border border-primary/10 bg-light-bg px-3 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">{cat.label}</p>
                    <p className="text-sm text-text-secondary">{cat.link}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={cat.enabled}
                        onChange={(e) => {
                          const next = [...categories];
                          next[idx] = { ...cat, enabled: e.target.checked };
                          setCategories(next);
                        }}
                      />
                      Visible
                    </label>
                    <ReorderControls
                      index={idx}
                      length={categories.length}
                      onMove={(direction) => {
                        const next = [...categories];
                        const tmp = next[idx];
                        next[idx] = next[idx + direction];
                        next[idx + direction] = tmp;
                        setCategories(next);
                      }}
                    />
                  </div>
                </div>
              ))}
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 text-primary font-semibold hover:bg-primary/10 transition">
                <FiPlus /> Add category
              </button>
            </div>
          </SectionCard>
        );
      case 'special':
        return (
          <SectionCard title="Special Picks" description="Manage spotlight cards and their tags.">
            <div className="grid md:grid-cols-2 gap-4">
              {specials.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-primary/10 bg-white shadow-soft p-4 flex gap-3 items-start"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {item.icon || '★'}
                    </div>
                    <input
                      type="text"
                      maxLength={2}
                      className="w-16 text-center text-sm border border-primary/20 rounded-md px-2 py-1 focus:outline-none focus:border-primary"
                      value={item.icon || ''}
                      placeholder="Icon"
                      onChange={(e) => {
                        const next = [...specials];
                        next[idx] = { ...item, icon: e.target.value };
                        setSpecials(next);
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-primary uppercase bg-primary/10 px-2 py-1 rounded-full">
                        <input
                          type="text"
                          className="bg-transparent focus:outline-none w-24 text-primary font-semibold uppercase text-xs"
                          value={item.tag}
                          onChange={(e) => {
                            const next = [...specials];
                            next[idx] = { ...item, tag: e.target.value };
                            setSpecials(next);
                          }}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => {
                            const next = [...specials];
                            next[idx] = { ...item, enabled: e.target.checked };
                            setSpecials(next);
                          }}
                        />
                        Visible
                      </label>
                    </div>
                    <input
                      type="text"
                      className="w-full text-lg font-semibold text-text-primary bg-transparent border-b border-primary/20 focus:outline-none focus:border-primary"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...specials];
                        next[idx] = { ...item, title: e.target.value };
                        setSpecials(next);
                      }}
                    />
                    <textarea
                      className="w-full text-sm text-text-secondary bg-transparent border border-primary/20 rounded-lg p-2 focus:outline-none focus:border-primary"
                      rows={2}
                      value={item.desc || ''}
                      onChange={(e) => {
                        const next = [...specials];
                        next[idx] = { ...item, desc: e.target.value };
                        setSpecials(next);
                      }}
                      placeholder="Add a short description..."
                    />
                    <div className="flex justify-end">
                      <button className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-soft hover:bg-primary-hover transition">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      case 'trending':
      default:
        return (
          <SectionCard title="Trending" description="Set and order trending products for the homepage rail.">
            <div className="space-y-3">
              {trendingError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
                  {trendingError}
                </div>
              ) : null}
              {loadingTrending ? (
                <div className="text-sm text-text-secondary">Loading trending products...</div>
              ) : trending.length === 0 ? (
                <div className="text-sm text-text-secondary">No trending products yet.</div>
              ) : (
                trending.map((item, idx) => (
                  <div key={item.id} className="rounded-xl border border-primary/10 bg-light-bg px-3 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{item.name}</p>
                      <p className="text-sm text-text-secondary">Trending sort: #{idx + 1}</p>
                    </div>
                    <ReorderControls
                      index={idx}
                      length={trending.length}
                      onMove={(direction) => {
                        const next = [...trending];
                        const target = next[idx];
                        const neighbor = next[idx + direction];
                        if (!target || !neighbor) return;
                        next[idx] = neighbor;
                        next[idx + direction] = target;
                        const normalized = next.map((p, i) => ({ ...p, sort: i + 1 }));
                        setTrending(normalized);
                        persistTrendingOrder(normalized);
                      }}
                    />
                  </div>
                ))
              )}
              <Link
                to="/cpanel/products/list?tab=trending"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 text-primary font-semibold hover:bg-primary/10 transition"
              >
                <FiPlus /> Add trending product
              </Link>
            </div>
          </SectionCard>
        );
    }
  }, [activeTab, heroSlides, categories, specials, trending]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-light">Home Page</h1>
          <p className="text-sm text-text-secondary dark:text-text-light/70">
            Manage what appears on the public homepage: hero, categories, special picks, and trending rails.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto bg-[#f5f8fb] px-2 py-2 w-full rounded-xl border border-primary/10">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setActiveTab(t.key);
                setSearchParams(t.key === 'hero' ? {} : { tab: t.key });
              }}
              className={`whitespace-nowrap px-3 pb-2 pt-1 transition text-sm font-semibold border-b-2 ${
                isActive
                  ? 'text-primary border-primary'
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:border-primary/40'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tabContent}
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-light-card dark:bg-dark-card shadow-soft p-4 space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-light">{title}</h2>
        <p className="text-sm text-text-secondary dark:text-text-light/70">{description}</p>
      </div>
      <div className="divide-y divide-primary/10">{children}</div>
    </div>
  );
}

function ReorderControls({ index, length, onMove }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="p-2 rounded-md border border-primary/20 hover:bg-primary/10 transition disabled:opacity-40"
        disabled={index === 0}
        onClick={(e) => {
          e.stopPropagation();
          onMove(-1);
        }}
        title="Move up"
      >
        <FiArrowUp />
      </button>
      <button
        type="button"
        className="p-2 rounded-md border border-primary/20 hover:bg-primary/10 transition disabled:opacity-40"
        disabled={index === length - 1}
        onClick={(e) => {
          e.stopPropagation();
          onMove(1);
        }}
        title="Move down"
      >
        <FiArrowDown />
      </button>
    </div>
  );
}
