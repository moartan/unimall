export default function CartCard({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="w-14 h-14 rounded-xl border border-slate-200 flex-shrink-0 overflow-hidden bg-slate-50">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-slate-400 flex items-center justify-center h-full">Preview</span>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-semibold text-slate-900 line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span>${item.price.toLocaleString()}</span>
          {item.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              ${item.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary/40 disabled:opacity-40"
            onClick={onDecrease}
            disabled={item.quantity <= 1}
          >
            −
          </button>
          <span className="text-sm font-semibold text-slate-900">{item.quantity}</span>
          <button
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary/40"
            onClick={onIncrease}
          >
            +
          </button>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-xs text-rose-500 hover:text-rose-600 flex-shrink-0 self-start"
      >
        ✕
      </button>
    </div>
  );
}
