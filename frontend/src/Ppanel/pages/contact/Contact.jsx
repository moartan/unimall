import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto py-12 space-y-8">
        <section className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 lg:p-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Contact us</p>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            We’re here to help—reach out anytime.
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Questions about an order, returns, or partnerships? Drop us a line and we’ll get back within one business day.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Support", value: "support@unimall.com" },
            { label: "Sales", value: "sales@unimall.com" },
            { label: "Phone", value: "+1 (555) 123-4567" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{item.label}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Send us a message</h2>
            <p className="text-sm text-slate-600">Share a few details and our team will reply promptly.</p>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="email"
              placeholder="Email"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="Subject"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 md:col-span-2"
            />
            <textarea
              rows="4"
              placeholder="How can we help?"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 md:col-span-2"
            />
            <div className="md:col-span-2">
              <button
                type="submit"
                className="px-5 h-11 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center"
              >
                Send message
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-primary/15 bg-primary/5 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-900">Need urgent help?</p>
            <p className="text-sm text-slate-600">Visit our support center or start a chat.</p>
          </div>
          <Link
            to="/support"
            className="px-4 h-11 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition inline-flex items-center justify-center"
          >
            Go to support
          </Link>
        </section>
      </div>
    </div>
  );
}
