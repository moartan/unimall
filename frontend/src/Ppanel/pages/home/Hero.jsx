import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const heroSlides = [
  {
    title: "Flagship phones for less",
    subtitle: "Pick from the latest Android & iOS releases with fast delivery.",
    cta: "Shop Mobile",
    link: "/collections/mobile",
    image: "https://images.unsplash.com/photo-1616344779837-955fdb80c50c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Laptops built for work & play",
    subtitle: "Powerful ultrabooks and creator rigs, all vetted for performance.",
    cta: "Browse Laptops",
    link: "/collections/laptop",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Smartwatches that keep you moving",
    subtitle: "Track health, stay connected, and look sharp doing it.",
    cta: "See Smartwatches",
    link: "/collections/watch",
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function Hero({ containerClass }) {
  const [active, setActive] = useState(0);
  const slides = useMemo(() => heroSlides.filter(Boolean), []);
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
              <div className="space-y-3">
                <p className="text-lg lg:text-xl text-slate-600">
                  Discover verified gear, fair prices, and worry-free checkout—so you can upgrade with confidence.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Free 2-day shipping",
                    "30-day returns",
                    "Local warranty",
                  ].map((pill) => (
                    <span
                      key={pill}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-primary/20 text-sm font-semibold text-primary shadow-sm"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/collections"
                  className="px-6 lg:px-8 py-3 lg:py-3.5 rounded-full bg-primary text-white font-semibold text-base shadow-lg shadow-primary/20 hover:bg-primary-hover transition"
                >
                  Explore Collections
                </Link>
                <Link
                  to="/collections/latest"
                  className="px-5 py-3 rounded-full border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition"
                >
                  View Deals
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-[32px] bg-white shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden h-[260px] lg:h-[420px]">
                {current ? (
                  <div className="h-full w-full">
                    <img
                      key={current.image}
                      src={current.image}
                      alt={current.title}
                      className="w-full h-full object-cover transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/5" />
                    <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6 lg:right-6 text-white space-y-2">
                      <p className="text-sm uppercase tracking-wide text-white/80">Featured collection</p>
                      <h3 className="text-xl lg:text-2xl font-bold">{current.title}</h3>
                      <p className="text-sm lg:text-base text-white/85">{current.subtitle}</p>
                      <Link
                        to={current.link}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-primary font-semibold text-sm shadow-sm hover:bg-slate-100 transition"
                      >
                        {current.cta}
                      </Link>
                    </div>
                  </div>
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
