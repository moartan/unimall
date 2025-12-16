import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto py-12 space-y-10">
        <section className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 lg:p-8 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">About Unimall</p>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                We make tech shopping simpler, fairer, and faster.
              </h1>
              <p className="text-lg text-slate-600 max-w-3xl">
                Unimall is built for people who want reliable products without wading through noise.
                We curate, negotiate fair prices, and back it with responsive support.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/collections"
                  className="px-5 h-11 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center"
                >
                  Explore collections
                </Link>
                <Link
                  to="/support"
                  className="px-5 h-11 rounded-full border border-primary text-primary font-semibold hover:bg-primary/5 transition inline-flex items-center justify-center"
                >
                  Talk to support
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              {[
                { label: "Customers", value: "50k+" },
                { label: "Products curated", value: "8k+" },
                { label: "Avg. delivery", value: "2 days" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-slate-50 border border-slate-100 shadow-sm p-3 text-center"
                >
                  <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">What guides us</h2>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-primary" /> Clear values
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Curated quality",
                desc: "We hand-pick products, so you spend less time filtering and more time getting what works.",
              },
              {
                title: "Fair, transparent pricing",
                desc: "Clear pricing, real discounts, and warranties that mean something.",
              },
              {
                title: "Support that responds",
                desc: "Humans in your timezone, plus clear return and replacement policies.",
              },
            ].map((val) => (
              <div key={val.title} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 shadow-sm">
                <p className="text-base font-semibold text-slate-900">{val.title}</p>
                <p className="text-sm text-slate-600 mt-2">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-primary/15 bg-primary/5 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-900">Want to partner or list your products?</p>
            <p className="text-sm text-slate-600">We’re selective but always open to great brands and suppliers.</p>
          </div>
          <Link
            to="/contact"
            className="px-4 h-11 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center"
          >
            Contact us
          </Link>
        </section>
      </div>
    </div>
  );
}
