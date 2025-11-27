import { Link } from "react-router-dom";
import { Phone, Watch, Camera, Laptop, Tablet, Package } from "lucide-react";

const categories = [
  { icon: <Phone size={28} />, label: "Mobile" },
  { icon: <Watch size={28} />, label: "Watch" },
  { icon: <Camera size={28} />, label: "Camera" },
  { icon: <Laptop size={28} />, label: "Laptop" },
  { icon: <Tablet size={28} />, label: "iPad" },
  { icon: <Package size={28} />, label: "Accessories" },
];

export default function Categories({ containerClass }) {
  return (
    <section>
      <div className={containerClass}>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {categories.map((c) => (
            <Link
              key={c.label}
              to={`/products/${c.label.toLowerCase()}`}
              className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="text-primary">{c.icon}</div>
              <p className="font-semibold text-slate-700 group-hover:text-primary transition">
                {c.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
