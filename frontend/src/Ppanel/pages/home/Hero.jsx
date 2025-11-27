import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const heroImages = [
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80",
];

export default function Hero({ containerClass }) {
  const [active, setActive] = useState(0);
  const slides = useMemo(() => heroImages.filter(Boolean), []);
  const current = slides[active];

  useEffect(() => {
    if (!slides.length) return undefined;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 3200);
    return () => clearInterval(id);
  }, [slides]);

  return (
    <section className="mt-6">
      <div className={containerClass}>
        <div className="rounded-3xl bg-gradient-to-br from-[#e8f3f7] via-[#e3f0f6] to-[#e9f4f8] p-6 lg:p-10 shadow-sm border border-slate-100">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-3xl lg:text-5xl font-black leading-tight text-slate-900">
                Shop Smart, Shop Faster Everything You Need in One Place.
              </h1>
              <p className="text-lg lg:text-xl text-slate-600">
                Discover the best deals on electronics, gadgets, accessories &
                more.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="px-6 lg:px-8 py-3 lg:py-3.5 rounded-full bg-primary text-white font-semibold text-base shadow-lg shadow-primary/20 hover:bg-primary-hover transition"
                >
                  Explore Products
                </Link>
                <Link
                  to="/products/mobile"
                  className="px-5 py-3 rounded-full border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition"
                >
                  View Deals
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-[32px] bg-white shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden h-[260px] lg:h-[420px]">
                {current ? (
                  <img
                    key={current}
                    src={current}
                    alt="Featured"
                    className="w-full h-full object-cover transition-opacity duration-700"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-lg">
                    Hero Image
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border border-slate-100">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      idx === active ? "bg-primary" : "bg-slate-300"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
