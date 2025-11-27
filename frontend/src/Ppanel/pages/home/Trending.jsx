import { useEffect, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const mockItems = [
  { id: 1, name: "Product 1", price: "$99.00", rating: 4.1 },
  { id: 2, name: "Product 2", price: "$89.00", rating: 4.2 },
  { id: 3, name: "Product 3", price: "$79.00", rating: 4.3 },
  { id: 4, name: "Product 4", price: "$109.00", rating: 4.4 },
  { id: 5, name: "Product 5", price: "$119.00", rating: 4.5 },
  { id: 6, name: "Product 6", price: "$129.00", rating: 4.6 },
];

export default function Trending({ containerClass }) {
  const [start, setStart] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const visible = isMobile ? 1 : 4;
  const timerRef = useRef(null);

  const next = () => {
    setStart((prev) => (prev + 1) % mockItems.length);
  };

  const prev = () => {
    setStart((prev) => (prev - 1 + mockItems.length) % mockItems.length);
  };

  useEffect(() => {
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, 5000);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [start]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const handle = () => setIsMobile(media.matches);
    handle();
    media.addEventListener("change", handle);
    return () => media.removeEventListener("change", handle);
  }, []);

  const items = [];
  for (let i = 0; i < visible; i += 1) {
    const idx = (start + i) % mockItems.length;
    items.push(mockItems[idx]);
  }

  return (
    <section className="bg-[#f8fafc] py-12">
      <div className={containerClass}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Trending Now</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
              aria-label="Previous products"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
              aria-label="Next products"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm transition cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="w-full h-40 bg-slate-100 rounded-xl mb-4"></div>
              <p className="font-semibold text-slate-800">{item.name}</p>
              <div className="flex items-center gap-1 text-sm text-amber-500 mt-1">
                <Star size={14} fill="currentColor" />
                <span className="text-slate-600">{item.rating.toFixed(1)}</span>
              </div>
              <p className="text-primary font-bold mt-1">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
