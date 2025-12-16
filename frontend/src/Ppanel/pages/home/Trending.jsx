import { useEffect, useMemo, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Bookmark, Shuffle } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    key: "trending",
    title: "Trending this week",
    badge: "Hot",
    cta: "/collections/trending",
    items: [
      { id: "t1", name: "Galaxy S24 Ultra", price: 1199, rating: 4.8, badge: "-15%", image: "https://images.unsplash.com/photo-1610945265053-419ffb2f2e2f?auto=format&fit=crop&w=800&q=80" },
      { id: "t2", name: "MacBook Air M3", price: 1299, rating: 4.7, badge: "Bestseller", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" },
      { id: "t3", name: "Sony WH-1000XM6", price: 499, rating: 4.9, badge: "New", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
      { id: "t4", name: "iPad Pro M4", price: 999, rating: 4.6, badge: "-10%", image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80" },
    ],
  },
  {
    key: "toprated",
    title: "Top-rated",
    badge: "4.7 ★ up",
    cta: "/collections/bestsellers",
    items: [
      { id: "r1", name: "ThinkPad X1 Carbon", price: 1399, rating: 4.9, badge: "Pro pick", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" },
      { id: "r2", name: "Apple Watch Ultra 2", price: 799, rating: 4.8, badge: "New", image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80" },
      { id: "r3", name: "Bose QC Ultra", price: 379, rating: 4.8, badge: "Quiet", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
      { id: "r4", name: "Canon EOS R6 Mark II", price: 2499, rating: 4.9, badge: "Studio", image: "https://images.unsplash.com/photo-1508896080822-3423dd86d9c5?auto=format&fit=crop&w=800&q=80" },
    ],
  },
];

function useCarousel(length, desktopVisible = 4) {
  const [start, setStart] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const visible = isMobile ? 1 : desktopVisible;
  const timerRef = useRef(null);

  const next = () => setStart((prev) => (prev + 1) % length);
  const prev = () => setStart((prev) => (prev - 1 + length) % length);

  useEffect(() => {
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, 6000);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [start]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const handle = () => setIsMobile(media.matches);
    handle();
    media.addEventListener("change", handle);
    return () => media.removeEventListener("change", handle);
  }, []);

  const items = useMemo(() => {
    const list = [];
    for (let i = 0; i < visible; i += 1) {
      const idx = (start + i) % length;
      list.push(idx);
    }
    return list;
  }, [start, visible, length]);

  return { items, next, prev, visible };
}

const Card = ({ item }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col gap-3">
      <div className="relative w-full h-40 bg-slate-100 rounded-xl overflow-hidden">
        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
        {item.badge ? (
          <span className="absolute top-3 left-3 bg-white text-primary text-xs font-semibold px-3 py-1 rounded-full shadow-sm border border-primary/20">
            {item.badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 flex-1">
        <p className="font-semibold text-slate-800 line-clamp-2">{item.name}</p>
        <div className="flex items-center gap-1 text-sm text-amber-500">
          <Star size={14} fill="currentColor" />
          <span className="text-slate-600">{item.rating.toFixed(1)}</span>
        </div>
        <p className="text-primary font-bold">${item.price.toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex-1 h-9 rounded-full border border-slate-200 font-semibold text-slate-700 hover:border-primary hover:text-primary transition text-sm inline-flex items-center justify-center gap-2">
          <Bookmark size={16} /> Save
        </button>
        <button className="h-9 px-3 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition inline-flex items-center justify-center gap-2">
          <Shuffle size={16} /> Compare
        </button>
      </div>
    </div>
  );
};

const SpotlightCard = ({ item }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white border border-slate-800 shadow-lg flex flex-col md:flex-row gap-4 p-4">
      <div className="relative w-full md:w-1/3 h-44 bg-slate-700 rounded-2xl overflow-hidden">
        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
        {item.badge ? (
          <span className="absolute top-3 left-3 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
            {item.badge}
          </span>
        ) : null}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-xs uppercase tracking-wide text-white/70">Editor’s spotlight</p>
        <h3 className="text-xl font-bold leading-tight">{item.name}</h3>
        <div className="flex items-center gap-2 text-sm text-amber-300">
          <Star size={16} fill="currentColor" />
          <span>{item.rating.toFixed(1)} rating</span>
        </div>
        <p className="text-2xl font-bold">${item.price.toLocaleString()}</p>
        <div className="flex items-center gap-2 pt-1">
          <button className="flex-1 h-10 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition inline-flex items-center justify-center gap-2">
            <Bookmark size={16} /> Save
          </button>
          <button className="h-10 px-3 rounded-full border border-white/40 text-sm font-semibold text-white hover:bg-white/10 transition inline-flex items-center justify-center gap-2">
            <Shuffle size={16} /> Compare
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Trending({ containerClass }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(id);
  }, []);

  const Skeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm animate-pulse flex flex-col gap-3">
      <div className="w-full h-40 bg-slate-100 rounded-xl" />
      <div className="h-4 w-3/4 bg-slate-100 rounded" />
      <div className="h-3 w-1/3 bg-slate-100 rounded" />
      <div className="h-4 w-1/4 bg-slate-100 rounded" />
      <div className="flex gap-2 mt-auto">
        <div className="h-9 w-full bg-slate-100 rounded-full" />
        <div className="h-9 w-16 bg-slate-100 rounded-full" />
      </div>
    </div>
  );

  return (
    <section className="bg-[#f8fafc] py-12">
      <div className={containerClass}>
        <div className="space-y-10">
          {sections.map((section) => {
            const desktopVisible = section.key === "toprated" ? 2 : 4;
            const carousel = useCarousel(section.items.length, desktopVisible);
            return (
              <div key={section.key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-primary/10 text-xs font-semibold text-primary shadow-sm">
                      {section.badge}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mt-2">{section.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={carousel.prev}
                      className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
                      aria-label="Previous products"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={carousel.next}
                      className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
                      aria-label="Next products"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <Link
                      to={section.cta}
                      className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                </div>
                {section.key === "toprated" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {ready
                      ? carousel.items.map((idx) => (
                          <SpotlightCard key={section.items[idx].id} item={section.items[idx]} />
                        ))
                      : [...Array(desktopVisible)].map((_, i) => <Skeleton key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ready
                      ? carousel.items.map((idx) => (
                          <Card key={section.items[idx].id} item={section.items[idx]} />
                        ))
                      : [...Array(desktopVisible)].map((_, i) => <Skeleton key={i} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
