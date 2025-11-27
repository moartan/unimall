import { ArrowRight, Zap, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const specials = [
  {
    title: "This Week's Spotlight",
    desc: "Top-rated laptops and accessories picked by our editors.",
    tag: "Editor's Pick",
    icon: <Zap size={20} className="text-primary" />,
  },
  {
    title: "Limited-Time Bundle",
    desc: "Save on headphones + smartwatch combos while stock lasts.",
    tag: "Hot Deal",
    icon: <Gift size={20} className="text-primary" />,
  },
];

export default function Special({ containerClass }) {
  return (
    <section>
      <div className={containerClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Special Picks</h2>
          <Link
            to="/products"
            className="text-primary font-semibold text-sm inline-flex items-center gap-1 hover:gap-1.5 transition"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {specials.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-primary">
                  <span className="px-2 py-1 rounded-full bg-primary/10">{item.tag}</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
