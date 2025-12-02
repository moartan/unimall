import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Heart, ShoppingCart, User, Search, Bell, Clock } from "lucide-react";
import dayjs from "dayjs";
import { usePpanel } from "../context/PpanelProvider";
import { useCart } from "../context/useCart.jsx";
import { useWishlist } from "../context/useWishlist";
import logoSmall from "../../assets/logoSmall.png";
import SearchBar from "./SearchBar";
import CartCard from "../pages/cart/CartCard";

const primaryLinks = [
  { label: "Home", to: "/" },
  { label: "Collections", to: "/products" },
  { label: "Trending", to: "/products/trending" },
  { label: "Mobile", to: "/products/mobile" },
  { label: "Camera", to: "/products/camera" },
  { label: "Laptop", to: "/products/laptop" },
  { label: "About", to: "/about" },
  { label: "Contact us", to: "/contact" },
];

export default function Navbar() {
  const { user, logout, api } = usePpanel();
  const cart = useCart() || {};
  const wishlist = useWishlist() || {};

  const cartItems = cart.items ?? [];
  const cartTotals = cart.totals ?? { quantity: 0, subtotal: 0 };
  const setQuantity = cart.setQuantity ?? (() => {});
  const removeItem = cart.removeItem ?? (() => {});
  const clearCart = cart.clearCart ?? (() => {});
  const wishlistItems = wishlist.items ?? [];

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const profileRef = useRef(null);
  const cartRef = useRef(null);
  const openMobileSearchRef = useRef(null);
  const notifRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return null;
    const value = Number(price);
    if (Number.isNaN(value)) return null;
    return `$${value.toLocaleString()}`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = user?.name || user?.fullName || user?.email || "";
  const email = user?.email || "";
  const initials = (displayName || email || "U")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fetchNotifications = async () => {
    setNotifLoading(true);
    setNotifError("");
    try {
      const { data } = await api.get("/customer/notifications");
      setNotifications(data?.notifications || []);
    } catch (err) {
      setNotifError(err?.response?.data?.message || "Failed to load notifications.");
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (notifOpen) {
      fetchNotifications();
    }
  }, [notifOpen]);

  const markAllRead = async () => {
    try {
      await api.post("/customer/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (_err) {
      // ignore mark all failure
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* CORE BAR */}
      <div className="bg-[#eff2f6] dark:bg-dark-card">
        <div className="w-full flex items-center justify-between gap-4 lg:gap-8 px-4 lg:px-20 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-primary"
            aria-label="Unimall home"
          >
            <img
              src={logoSmall}
              alt="Unimall logo"
              className="w-11 h-11 lg:w-12 lg:h-12 object-contain"
            />
            <span className="flex items-baseline gap-1">
              <span className="text-[#0056A3] uppercase tracking-tight">UNI</span>
              <span className="text-primary uppercase tracking-tight">MALL</span>
            </span>
          </Link>

          <SearchBar
            hideDefaultMobileTrigger
            registerMobileOpen={(fn) => {
              openMobileSearchRef.current = fn;
            }}
          />

          {/* Actions */}
          <div className="flex items-center gap-2.5 lg:gap-4 text-primary">
            <button
              className="lg:hidden flex items-center justify-center p-2 text-primary hover:text-primary/80 transition"
              onClick={() => openMobileSearchRef.current && openMobileSearchRef.current()}
              aria-label="Open search"
            >
              <Search size={20} />
            </button>

            <IconPill
              to="/wishlist"
              icon={<Heart size={20} />}
              count={wishlistItems.length}
            />

            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setCartOpen((prev) => !prev)}
                className="relative flex flex-col items-center gap-1 text-primary hover:text-primary/80 transition"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {cartTotals.quantity > 0 && (
                  <span className="absolute -top-1 right-1 text-xs w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                    {cartTotals.quantity}
                  </span>
                )}
              </button>

              {cartOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-40">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Cart
                      </p>
                      <p className="text-xs text-slate-500">
                        {cartTotals.quantity} item
                        {cartTotals.quantity === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      onClick={clearCart}
                      disabled={!cartItems.length}
                      className="text-xs font-semibold text-rose-500 disabled:text-slate-400"
                    >
                      Clear
                    </button>
                  </div>

                  {cartItems.length ? (
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {cartItems.map((item) => (
                        <div key={item.id} className="px-4">
                          <CartCard
                            item={item}
                            onIncrease={() => setQuantity(item, item.quantity + 1)}
                            onDecrease={() => setQuantity(item, item.quantity - 1)}
                            onRemove={() => removeItem(item.id)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-10 text-center text-sm text-slate-500">
                      Your cart is empty.
                    </div>
                  )}

                  <div className="px-4 py-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">Subtotal</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatPrice(cartTotals.subtotal)}
                      </p>
                    </div>
                    <Link
                      to="/checkout"
                      onClick={() => setCartOpen(false)}
                      className={`block text-center w-full py-3 rounded-full font-semibold ${
                        cartItems.length
                          ? "bg-primary text-white hover:bg-primary-hover"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative" ref={notifRef}>
                  <button
                    className="p-2 rounded-full text-primary hover:bg-primary/10 transition relative"
                    aria-label="Notifications"
                    onClick={() => {
                      setNotifOpen((p) => !p);
                      setMenuOpen(false);
                    }}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden text-sm z-40">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">
                        <span>Notifications</span>
                        <button
                          onClick={markAllRead}
                          className="text-[11px] text-primary font-semibold hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifLoading ? (
                          <div className="px-4 py-3 text-slate-500">Loading...</div>
                        ) : notifError ? (
                          <div className="px-4 py-3 text-red-600">{notifError}</div>
                        ) : notifications.length === 0 ? (
                          <div className="px-4 py-3 text-slate-500">No notifications.</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className="px-4 py-3 flex gap-3">
                              <div className={`${n.read ? "text-slate-400" : "text-primary"} mt-0.5`}>
                                <Bell size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-800">{n.title || "Notification"}</p>
                                <p className="text-xs text-slate-500">{n.body || ""}</p>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock size={12} />{" "}
                                  {n.createdAt ? dayjs(n.createdAt).format("MMM D, YYYY h:mm A") : ""}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setMenuOpen(!menuOpen);
                      setNotifOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-full bg-primary/10 text-slate-900 px-3 lg:px-4 py-1.5 hover:bg-primary/20 transition"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover border border-primary/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                        {initials || <User size={18} />}
                      </div>
                    )}
                    <span className="hidden sm:inline text-sm font-bold text-slate-900">
                      {displayName}
                    </span>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-sm z-40">
                      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-100">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={displayName}
                            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full object-cover border border-primary/20 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-primary text-white flex items-center justify-center text-sm flex-shrink-0">
                            {initials || <User size={16} />}
                          </div>
                        )}

                        <div className="flex flex-col leading-tight">
                          <p className="text-lg font-semibold text-slate-900">
                            {displayName}
                          </p>
                          <p className="text-sm text-slate-600">{email}</p>
                        </div>
                      </div>

                      {user && user.emailVerified === false && (
                        <Link
                          to="/profile/email-verification"
                          className="px-4 py-2 border-b border-slate-100 text-red-500 font-semibold flex items-center justify-between gap-2 hover:bg-red-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="flex items-center gap-2">
                            <span>⚠️</span> Please Verify
                          </span>
                        </Link>
                      )}

                      <ul className="py-2 text-slate-700">
                        <li>
                          <Link
                            to="/profile?tab=overview"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                            onClick={() => setMenuOpen(false)}
                          >
                            <User size={16} /> Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/orders"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                            onClick={() => setMenuOpen(false)}
                          >
                            📦 My Orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/profile?tab=addresses"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                            onClick={() => setMenuOpen(false)}
                          >
                            📍 Addresses
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/profile?tab=security"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                            onClick={() => setMenuOpen(false)}
                          >
                            🔒 Security
                          </Link>
                        </li>
                      </ul>

                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 w-full font-semibold"
                      >
                        ⎋ Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition text-sm font-semibold"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* MENU BAR */}
      <div className="bg-white border-t border-b border-slate-100">
        <div className="w-full px-4 lg:px-20 py-2 flex items-center gap-6 lg:gap-8 text-sm overflow-x-auto">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `relative pb-2 font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "text-primary after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[3px] after:bg-primary"
                    : "text-slate-700 hover:text-primary"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <Link
            to="/support"
            className="ml-auto flex items-center gap-2 text-primary font-semibold whitespace-nowrap"
          >
            <span className="text-base">💬</span> Support
          </Link>
        </div>
      </div>
    </nav>
  );
}

function IconPill({ to, icon, count }) {
  return (
    <Link
      to={to}
      className="relative flex flex-col items-center gap-1 text-primary hover:text-primary/80 transition"
    >
      {icon}
      {count > 0 && (
        <span className="absolute -top-1 right-1 text-xs w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
