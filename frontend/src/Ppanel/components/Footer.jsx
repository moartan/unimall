import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "All Collections", to: "/collections" },
      { label: "Mobile", to: "/collections/mobile" },
      { label: "Laptop", to: "/collections/laptop" },
      { label: "Watch", to: "/collections/watch" },
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
      <div className="max-w-7xl mx-auto py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="space-y-3 max-w-sm">
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
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
              Secure checkout
            </span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
              Fast delivery
            </span>
          </div>
          </div>

          <div className="flex-1 flex flex-wrap md:justify-end gap-8 md:gap-12">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-2 min-w-[100px]">
                <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">
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
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
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
