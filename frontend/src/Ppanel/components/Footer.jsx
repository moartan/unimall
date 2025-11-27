import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/products" },
      { label: "Mobile", to: "/products/mobile" },
      { label: "Laptop", to: "/products/laptop" },
      { label: "Watch", to: "/products/watch" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact us", to: "/contact" },
      { label: "FAQs", to: "/support" },
      { label: "Orders", to: "/orders" },
      { label: "Payments", to: "/payments" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/about#careers" },
      { label: "Blog", to: "/blog" },
      { label: "Press", to: "/press" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-20 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-2xl font-extrabold tracking-tight text-white"
          >
            <span className="text-[#60a5fa]">Uni</span>
            <span className="text-white">Mall</span>
          </Link>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
            Discover curated tech, fast checkout, and responsive support on the
            Unimall public panel.
          </p>
        </div>

        {footerLinks.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-sm font-semibold tracking-wide uppercase text-slate-300">
              {section.title}
            </p>
            <ul className="space-y-2">
              {section.links.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-slate-200 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-wide uppercase text-slate-300">
            Stay in the loop
          </p>
          <p className="text-sm text-slate-300">
            Get product drops, offers, and tips. No spam—unsubscribe anytime.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-20 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Unimall. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <Link to="/support" className="hover:text-white transition">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
