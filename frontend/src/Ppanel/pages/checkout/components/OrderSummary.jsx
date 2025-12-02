import { ShoppingBag, Shield } from "lucide-react";

export default function OrderSummary({ items, totals, delivery, tax, onNext, nextLabel }) {
  return (
    <div className="w-full lg:w-96 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 h-fit">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
      </div>

      <div className="space-y-3 text-slate-700">
        <SummaryRow label={`Items (${items.length})`} value={totals.subtotal} />
        <SummaryRow
          label="Delivery"
          value={delivery}
          note={delivery === 0 ? "Free (orders over $200)" : undefined}
        />
        <SummaryRow label={`Tax (2%)`} value={tax} />
        <hr className="my-2" />
        <SummaryRow label="Total" value={totals.subtotal + delivery + tax} bold />
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 space-y-2 text-slate-800 text-sm">
        <div className="flex items-center gap-2 font-semibold">
          <ShoppingBag size={16} /> Fast delivery
        </div>
        <p className="text-slate-600">Free priority shipping on orders over $500.</p>
        <div className="flex items-center gap-2 font-semibold pt-2">
          <Shield size={16} /> Secure checkout
        </div>
        <p className="text-slate-600">Payments are processed over secure encrypted channels.</p>
      </div>

      <button
        onClick={onNext}
        disabled={!items.length}
        className="w-full h-12 rounded-full bg-primary text-white font-semibold text-base shadow-lg shadow-primary/20 hover:bg-primary-hover transition disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
      >
        {nextLabel}
      </button>

      <p className="text-xs text-center text-slate-500">
        By placing your order, you agree to UniMall's Terms & Conditions.
      </p>
    </div>
  );
}

function SummaryRow({ label, value, bold, note }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <div className="text-right">
        <span className={`text-slate-900 ${bold ? "font-bold text-lg" : "font-semibold"}`}>
          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {note && <p className="text-xs text-slate-500">{note}</p>}
      </div>
    </div>
  );
}
