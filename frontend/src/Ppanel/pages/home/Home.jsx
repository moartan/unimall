import { useEffect, useState } from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import Special from "./Special";
import Trending from "./Trending";

const container = "w-full mx-auto px-4 lg:px-20";

export default function Home() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(id);
  }, []);

  const fade = ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2";

  return (
    <div className="space-y-12 pb-12">
      <div className={`transition-all duration-500 ${fade}`}>
        <Hero containerClass={container} />
      </div>
      <div className={`bg-white border-y border-slate-100 transition-all duration-500 delay-75 ${fade}`}>
        <div className={`${container} py-4`}>
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-sm font-semibold text-slate-700">
            {[
              "Secure checkout",
              "SSL encrypted",
              "Trusted by 50k customers",
              "Fast delivery",
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 border border-slate-100 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className={`transition-all duration-500 delay-100 ${fade}`}>
        <Categories containerClass={container} />
      </div>
      <div className={`transition-all duration-500 delay-150 ${fade}`}>
        <Special containerClass={container} />
      </div>
      <div className={`transition-all duration-500 delay-200 ${fade}`}>
        <Trending containerClass={container} />
      </div>
    </div>
  );
}
