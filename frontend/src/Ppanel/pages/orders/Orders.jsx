import { useMemo, useState } from "react";
import { Check, Circle, Clock, Package, Truck, XCircle, CheckCircle2, Loader2, Timer, FileDown, Search } from "lucide-react";

const mockOrders = [
  {
    id: "#1125",
    status: "in_progress",
    placedAt: "May 11, 2024",
    eta: "ETA May 19, 2024",
    price: "$213.00",
    items: 2,
    payment: "Cash on Delivery",
    orderedAgo: "2 mins ago",
    shippingTo: "Hodan Ali · Riverside Dr, Nairobi",
    tax: 0,
    delivery: 0,
    invoiceUrl: "#",
    itemsList: [
      {
        title: "Samsung Galaxy S24 Ultra",
        subtitle: "256GB · Titanium Gray",
        price: "$1299.99",
        qty: 1,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80",
      },
      {
        title: "Anker GaNPrime 65W Charger",
        subtitle: "Dual USB-C",
        price: "$59.99",
        qty: 1,
        image: "https://images.unsplash.com/photo-1502877828070-33b167ad6860?auto=format&fit=crop&w=400&q=80",
      },
      {
        title: "Spigen Ultra Hybrid Case",
        subtitle: "Matte Clear",
        price: "$69.99",
        qty: 1,
        image: "https://images.unsplash.com/photo-1580915411980-d1425ea2f0f2?auto=format&fit=crop&w=400&q=80",
      },
    ],
    steps: [
      { label: "Confirmed", done: true },
      { label: "Preparing", done: true },
      { label: "Picked up", done: false },
      { label: "Delivered", done: false },
    ],
  },
  {
    id: "#1126",
    status: "in_progress",
    placedAt: "May 12, 2024",
    eta: "ETA May 20, 2024",
    price: "$149.00",
    items: 1,
    payment: "Card",
    orderedAgo: "10 mins ago",
    shippingTo: "Hodan Ali · Mbagathi Rd, Nairobi",
    tax: 0,
    delivery: 0,
    invoiceUrl: "#",
    itemsList: [
      {
        title: "Logitech MX Anywhere 3S",
        subtitle: "Graphite",
        price: "$89.50",
        qty: 1,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
      },
    ],
    steps: [
      { label: "Confirmed", done: true },
      { label: "Preparing", done: false },
      { label: "Picked up", done: false },
      { label: "Delivered", done: false },
    ],
  },
  {
    id: "#1127",
    status: "complete",
    placedAt: "Apr 22, 2024",
    deliveredAt: "Apr 27, 2024",
    price: "$89.00",
    items: 3,
    payment: "Cash on Delivery",
    orderedAgo: "1 day ago",
    shippingTo: "Hodan Ali · Riverside Dr, Nairobi",
    tax: 0,
    delivery: 0,
    invoiceUrl: "#",
    itemsList: [
      {
        title: "Sony WH-1000XM5",
        subtitle: "Midnight Black",
        price: "$329.99",
        qty: 1,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80",
      },
    ],
    steps: [
      { label: "Confirmed", done: true },
      { label: "Preparing", done: true },
      { label: "Picked up", done: true },
      { label: "Delivered", done: true },
    ],
  },
  {
    id: "#1128",
    status: "complete",
    placedAt: "Apr 18, 2024",
    deliveredAt: "Apr 23, 2024",
    price: "$59.00",
    items: 1,
    payment: "Card",
    orderedAgo: "2 days ago",
    shippingTo: "Hodan Ali · Riverside Dr, Nairobi",
    tax: 0,
    delivery: 0,
    invoiceUrl: "#",
    itemsList: [
      {
        title: "Kindle Paperwhite",
        subtitle: "11th gen",
        price: "$129.00",
        qty: 1,
        image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&q=80",
      },
    ],
    steps: [
      { label: "Confirmed", done: true },
      { label: "Preparing", done: true },
      { label: "Picked up", done: true },
      { label: "Delivered", done: true },
    ],
  },
  {
    id: "#1129",
    status: "cancelled",
    placedAt: "Mar 3, 2024",
    cancelledAt: "Mar 3, 2024",
    price: "$120.00",
    items: 1,
    payment: "Cash on Delivery",
    orderedAgo: "3 hours ago",
    shippingTo: "Hodan Ali · Kilimani, Nairobi",
    tax: 0,
    delivery: 0,
    invoiceUrl: "#",
    itemsList: [
      {
        title: "Apple AirPods Pro (2nd gen)",
        subtitle: "USB-C",
        price: "$249.00",
        qty: 1,
        image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=400&q=80",
      },
    ],
    steps: [
      { label: "Confirmed", done: true },
      { label: "Preparing", done: false },
      { label: "Picked up", done: false },
      { label: "Delivered", done: false },
    ],
  },
  {
    id: "#1130",
    status: "pending",
    placedAt: "May 15, 2024",
    price: "$75.00",
    items: 1,
    payment: "Card",
    orderedAgo: "5 mins ago",
    eta: "Awaiting confirmation",
    shippingTo: "Hodan Ali · Nairobi",
    tax: 0,
    delivery: 0,
    invoiceUrl: "#",
    itemsList: [
      {
        title: "Anker 313 Power Bank",
        subtitle: "10,000 mAh",
        price: "$59.99",
        qty: 1,
        image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&q=80",
      },
    ],
    steps: [
      { label: "Confirmed", done: false },
      { label: "Preparing", done: false },
      { label: "Picked up", done: false },
      { label: "Delivered", done: false },
    ],
  },
];

const tabs = [
  { key: "all", label: "All orders", icon: <Package size={14} /> },
  { key: "in_progress", label: "In progress", icon: <Loader2 size={14} /> },
  { key: "complete", label: "Complete", icon: <CheckCircle2 size={14} /> },
  { key: "pending", label: "Pending", icon: <Timer size={14} /> },
  { key: "cancelled", label: "Cancelled", icon: <XCircle size={14} /> },
];

const statusCopy = {
  in_progress: { label: "In progress", icon: <Loader2 size={16} /> },
  complete: { label: "Complete", icon: <Check size={16} /> },
  cancelled: { label: "Cancelled", icon: <Package size={16} /> },
  pending: { label: "Pending", icon: <Timer size={16} /> },
};

export default function Orders() {
  const [tab, setTab] = useState("all");
  const [modalOrder, setModalOrder] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const base = tab === "all" ? mockOrders : mockOrders.filter((o) => o.status === tab);
    if (!normalized) return base;
    return base.filter((o) => {
      const idMatch = o.id?.toLowerCase().includes(normalized);
      const items = Array.isArray(o.itemsList) ? o.itemsList : [];
      const itemMatch = items.some(
        (item) =>
          item.title?.toLowerCase().includes(normalized) ||
          item.subtitle?.toLowerCase().includes(normalized)
      );
      return idMatch || itemMatch;
    });
  }, [tab, query]);

  const counts = useMemo(() => {
    return mockOrders.reduce(
      (acc, order) => {
        acc.total += 1;
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      { total: 0 },
    );
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#e3e8ef] shadow-sm p-4 space-y-4">
          <h1 className="text-2xl font-black text-[#1f2a44]">My Orders</h1>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative w-full max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa5b5]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by order ID or product"
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-[#e3e8ef] text-sm text-[#1f2a44] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>
              {(query.trim() || tab !== "all") && (
                <button
                  onClick={() => {
                    setQuery("");
                    setTab("all");
                  }}
                  className="h-10 px-3 rounded-md border border-[#e3e8ef] text-xs font-semibold text-[#1f2a44] bg-white hover:border-primary hover:text-primary transition"
                >
                  Clear filters
                </button>
              )}
            </div>
            <select
              className="h-9 px-3 rounded-full border border-[#e3e8ef] text-sm font-semibold text-[#1f2a44] bg-white cursor-pointer"
              defaultValue="range"
            >
              <option value="range" disabled>
                Select date range
              </option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => {
              const active = tab === t.key;
              const count = t.key === "all" ? counts.total : counts[t.key] || 0;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`text-sm font-semibold flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md transition ${
                    active ? "text-primary" : "text-[#5a6475] hover:text-primary"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {t.icon}
                    <span>{t.label}</span>
                  </span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold ${
                      active ? "bg-primary text-white" : "bg-[#eef2f7] text-[#1f2a44]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((order, idx) => (
            <div
              key={`${order.id}-${idx}`}
              className="bg-white rounded-2xl border border-[#e3e8ef] shadow-sm p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        order.status === "complete"
                          ? "bg-[#e6f7f4] text-primary"
                          : order.status === "in_progress"
                          ? "bg-[#e5f5f9] text-primary"
                          : order.status === "pending"
                          ? "bg-[#fff4e6] text-[#c97a24]"
                          : order.status === "cancelled"
                          ? "bg-[#fde8e8] text-[#c03232]"
                          : "bg-[#eef2f7] text-[#5a6475]"
                      }`}
                    >
                      {order.status === "complete" && <Package size={20} />}
                      {order.status === "in_progress" && <Loader2 size={20} className="animate-spin" />}
                      {order.status === "pending" && <Clock size={20} />}
                      {order.status === "cancelled" && <XCircle size={20} />}
                      {!["complete", "in_progress", "pending", "cancelled"].includes(order.status) && <Check size={20} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#6a7589]">{statusCopy[order.status]?.label || "Status"}</p>
                      <p className="text-lg font-black text-[#1f2a44]">Order no {order.id}</p>
                      <p className="text-base font-bold text-[#1f2a44]">{order.price}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#1f2a44]">
                      {order.steps.map((step, idx) => {
                        const done = step.done;
                        const isCurrent = !done && order.steps.findIndex((s) => !s.done) === idx;
                        const showConnector = idx < order.steps.length - 1;
                        return (
                          <div key={step.label} className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${
                                done
                                  ? "bg-primary text-white border-primary"
                                  : isCurrent
                                    ? "border-primary text-primary bg-white"
                                    : "border-[#dbe3ee] text-[#dbe3ee]"
                              }`}
                            >
                              {done ? <Check size={14} /> : isCurrent ? <Circle size={12} /> : <Circle size={12} />}
                            </span>
                            <span className={`text-xs font-semibold ${done ? "text-[#1f2a44]" : "text-[#9aa5b5]"}`}>
                              {step.label}
                            </span>
                            {showConnector && (
                              <span
                                className={`inline-block w-10 h-[2px] rounded-full ${
                                  done ? "bg-primary" : "bg-[#dbe3ee]"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-sm text-[#5a6475]">
                      <span className="font-semibold text-[#1f2a44]">{order.items} Items</span> • {order.payment} •{" "}
                      Ordered {order.orderedAgo} • {order.eta}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[170px]">
                  <button
                    className="w-full px-4 h-10 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition text-sm"
                    onClick={() => setModalOrder(order)}
                  >
                    Order Details
                  </button>
                  <button
                    className={`w-full px-4 h-10 rounded-full font-semibold transition text-sm flex items-center justify-center gap-2 ${
                      order.status === "complete"
                        ? "border border-primary text-primary hover:bg-primary/5"
                        : "border border-[#dbe3ee] text-[#9aa5b5] cursor-not-allowed"
                    }`}
                    onClick={(e) => order.status !== "complete" && e.preventDefault()}
                  >
                    <FileDown size={16} />
                    Invoice
                  </button>
                  {order.status === "complete" ? (
                    <button className="w-full px-4 h-10 rounded-full border border-primary text-primary font-semibold bg-white hover:bg-primary hover:text-white transition text-sm">
                      Return Order
                    </button>
                  ) : order.status !== "cancelled" ? (
                    <button
                      className={`w-full px-4 h-10 rounded-full font-semibold bg-white transition text-sm ${
                        (() => {
                          const steps = order.steps || [];
                          const canCancel =
                            (steps[0]?.done && steps.slice(1).every((s) => !s.done)) || order.status === "pending";
                          return canCancel
                            ? "border border-[#f3c8c8] text-[#c03232] hover:bg-[#fdecec]"
                            : "border border-[#e6e8ee] text-[#a6b3c7] cursor-not-allowed";
                        })()
                      }`}
                      disabled={
                        !(
                          (order.steps?.[0]?.done && order.steps.slice(1).every((s) => !s.done)) ||
                          order.status === "pending"
                        )
                      }
                    >
                      Cancel Order
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="bg-white rounded-2xl border border-[#e3e8ef] shadow-sm p-10 text-center text-sm text-[#6a7589]">
              No orders in this tab yet.
            </div>
          )}
        </div>
      </div>

      {modalOrder && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 backdrop-blur-[1px] overflow-y-auto pt-32 pb-16"
          onClick={() => setModalOrder(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-4 mb-8 p-6 lg:p-8 space-y-6 border border-[#e3e8ef]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6a7589]">Order</p>
                <div className="flex items-center flex-wrap gap-2">
                  <p className="text-2xl font-black text-[#1f2a44]">{modalOrder.id || "ORD-XXXX"}</p>
                  {modalOrder.placedAt && (
                    <span className="text-sm font-semibold text-[#6a7589]">• Placed {modalOrder.placedAt}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 h-11 px-4 rounded-full border border-[#dbe3ee] bg-[#f3f7fb] text-[#2166d1] font-semibold capitalize">
                  <Truck size={16} />
                  {modalOrder.status?.replace(/_/g, " ") || "status"}
                </span>
                <a
                  href={modalOrder.status === "complete" ? modalOrder.invoiceUrl || "#" : undefined}
                  className={`inline-flex items-center gap-2 h-11 px-4 rounded-full border font-semibold ${
                    modalOrder.status === "complete"
                      ? "border-[#dbe3ee] bg-white text-[#1f2a44] hover:border-primary hover:text-primary"
                      : "border-[#e5e7eb] bg-[#f9fafb] text-[#a6b3c7] cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (modalOrder.status !== "complete") e.preventDefault();
                  }}
                >
                  <FileDown size={16} />
                  Invoice
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
              <div className="bg-[#f8fafc] rounded-[18px] border border-[#e8eef5] overflow-hidden flex flex-col">
                <div className="divide-y divide-[#e8eef5]">
                  {modalOrder.itemsList && Array.isArray(modalOrder.itemsList) && modalOrder.itemsList.length ? (
                    modalOrder.itemsList.map((item, idx) => (
                      <div
                        key={`${item.title ?? "item"}-${idx}`}
                        className="flex items-center justify-between px-5 py-4 gap-4 bg-white hover:bg-[#f4f8fd]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[14px] bg-white border border-[#e3ebf5] flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={18} className="text-[#6a7a92]" />
                            )}
                          </div>
                          <div>
                            <p className="text-[15px] font-semibold text-[#1f2a44]">{item.title || "Item"}</p>
                            {item.subtitle && <p className="text-sm text-[#6a7a92]">{item.subtitle}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[15px] font-semibold text-[#1f2a44]">{item.price || "-"}</p>
                          {item.qty != null && <p className="text-sm text-[#6a7a92]">Qty {item.qty}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-6 text-sm text-[#9aa5b5]">No item details in mock data yet.</div>
                  )}
                </div>

                <div className="px-5 py-4 space-y-2 bg-white/70 border-t border-[#e8eef5] mt-auto">
                  {(() => {
                    const parseMoney = (value) => {
                      const num = typeof value === "string" ? Number(value.replace(/[^0-9.-]+/g, "")) : Number(value);
                      return Number.isFinite(num) ? num : 0;
                    };
                    const items = Array.isArray(modalOrder.itemsList) ? modalOrder.itemsList : [];
                    const subtotal =
                      items.length > 0
                        ? items.reduce((sum, item) => sum + parseMoney(item.price) * (item.qty || 1), 0)
                        : parseMoney(modalOrder.price);
                    const tax = parseMoney(modalOrder.tax || 0);
                    const delivery = parseMoney(modalOrder.delivery || 0);
                    const total = subtotal + tax + delivery;
                    const fmt = (val) =>
                      `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    return (
                      <>
                        <div className="flex items-center justify-between text-sm text-[#6a7a92]">
                          <span>Subtotal</span>
                          <span className="font-semibold text-[#1f2a44]">{fmt(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[#6a7a92]">
                          <span>Tax</span>
                          <span className="font-semibold text-[#1f2a44]">{fmt(tax)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[#6a7a92]">
                          <span>Delivery</span>
                          <span className="font-semibold text-[#1f2a44]">{fmt(delivery)}</span>
                        </div>
                        <div className="border-t border-[#e8eef5] pt-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-[#1f2a44]">Total</span>
                          <span className="font-black text-[#1f2a44]">{fmt(total)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#f8fafc] rounded-[18px] border border-[#e8eef5] p-5 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-[#1f2a44] font-semibold">
                    <div className="inline-flex items-center gap-2">
                      <Clock size={18} />
                      Shipping to
                    </div>
                    {modalOrder.eta ? (
                      <span className="text-xs font-bold text-[#0fa3b1] uppercase tracking-wide">{modalOrder.eta}</span>
                    ) : null}
                  </div>
                  <p className="text-[15px] text-[#1f2a44]">
                    {modalOrder.shippingTo || "No shipping address in mock data"}
                  </p>
                </div>

                <div className="bg-[#f8fafc] rounded-[18px] border border-[#e8eef5] p-5 space-y-3">
                  <p className="text-[15px] font-semibold text-[#1f2a44]">Progress</p>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {(modalOrder.steps || []).map((step, idx) => {
                      const done = step.done;
                      const isCurrent = !done && (modalOrder.steps || []).findIndex((s) => !s.done) === idx;
                      const showConnector = idx < (modalOrder.steps || []).length - 1;
                      return (
                        <div key={step.label} className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${
                              done
                                ? "bg-[#0fa3b1] text-white"
                                : isCurrent
                                  ? "bg-white text-[#0fa3b1] border border-[#0fa3b1]"
                                  : "bg-white text-[#a6b3c7] border border-[#dbe3ee]"
                            }`}
                          >
                            {done ? <Check size={14} strokeWidth={2.5} /> : isCurrent ? <Clock size={14} /> : <Circle size={12} />}
                          </span>
                          <span className={`text-xs font-semibold ${done ? "text-[#1f2a44]" : "text-[#a6b3c7]"}`}>
                            {step.label}
                          </span>
                          {showConnector && (
                            <span
                              className={`inline-block w-10 h-[3px] rounded-full ${
                                done ? "bg-[#0fa3b1]/80" : "bg-[#dbe3ee]"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#f8fafc] rounded-[18px] border border-[#e8eef5] p-5 space-y-2">
                  <p className="text-[15px] font-semibold text-[#1f2a44]">Latest updates</p>
                  <div className="space-y-1 text-sm text-[#6a7a92]">
                    {(modalOrder.updates || []).length ? (
                      modalOrder.updates.map((u, idx) => (
                        <p key={`${u.label}-${idx}`} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#cfd8e6]" />
                          <span className="font-semibold text-[#1f2a44]">{u.label}</span>
                          {u.time && (
                            <>
                              <span>•</span>
                              <span>{u.time}</span>
                            </>
                          )}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-[#a6b3c7]">No updates yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
