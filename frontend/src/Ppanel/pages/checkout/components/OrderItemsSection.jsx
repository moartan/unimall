import { useCart } from "../../../context/useCart.jsx";

export default function OrderItemsSection({ onContinueShopping }) {
  const { items = [], setQuantity, removeItem } = useCart();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">STEP 1</p>
          <h1 className="text-3xl font-bold text-slate-900">Order items</h1>
          <p className="text-slate-600">Review quantities and product details.</p>
        </div>
        <p className="text-slate-500 text-sm">{items.length} products</p>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-lg font-semibold text-slate-900 line-clamp-2">{item.title}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <span>${item.price.toLocaleString()}</span>
                    {item.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ${item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">QTY</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-10 h-10 rounded-full border border-slate-200 text-slate-700 hover:border-primary hover:text-primary disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="text-base font-semibold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item, item.quantity + 1)}
                      className="w-10 h-10 rounded-full border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-slate-900">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-lg text-rose-500 hover:text-rose-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Your cart is empty.</p>
        )}
      </div>

      <div className="pt-2">
        <button
          className="inline-flex items-center gap-2 text-primary font-semibold text-sm"
          onClick={onContinueShopping}
        >
          ← Continue shopping
        </button>
      </div>
    </div>
  );
}
