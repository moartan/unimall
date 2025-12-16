import { Link } from "react-router-dom";

const faqs = [
  { q: "How do I track my order?", a: "You can track orders from your profile > Orders. We update statuses in real time." },
  { q: "What’s your return policy?", a: "30-day returns on eligible items. Start a return from your order details page." },
  { q: "Do you offer warranty?", a: "Yes—manufacturer warranty where applicable, plus local warranty on select items." },
];

export default function Support() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto py-12 space-y-8">
        <section className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 lg:p-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Support</p>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            Get help fast—self-service or talk to a human.
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Browse FAQs, start a return, or reach our support team. We respond within one business day.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/orders"
              className="px-5 h-11 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center"
            >
              View my orders
            </Link>
            <Link
              to="/contact"
              className="px-5 h-11 rounded-full border border-primary text-primary font-semibold hover:bg-primary/5 transition inline-flex items-center justify-center"
            >
              Contact support
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Email", value: "support@unimall.com" },
            { label: "Phone", value: "+1 (555) 987-6543" },
            { label: "Hours", value: "Mon–Fri, 9am–6pm" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{item.label}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Frequently asked</h2>
          <div className="space-y-3">
            {faqs.map((item) => (
              <div key={item.q} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                <p className="text-sm font-semibold text-slate-900">{item.q}</p>
                <p className="text-sm text-slate-600 mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-primary/15 bg-primary/5 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-900">Still need help?</p>
            <p className="text-sm text-slate-600">Open a ticket and we’ll follow up within one business day.</p>
          </div>
          <Link
            to="/contact"
            className="px-4 h-11 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center"
          >
            Start a ticket
          </Link>
        </section>
      </div>
    </div>
  );
}
