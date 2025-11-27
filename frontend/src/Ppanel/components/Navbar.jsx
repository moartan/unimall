import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Heart, ShoppingCart, User, Search } from "lucide-react";
import { usePpanel } from "../context/PpanelProvider";
import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";
import logoSmall from "../../assets/logoSmall.png";
import SearchBar from "./SearchBar";

const primaryLinks = [
  { label: "Home", to: "/" },
  { label: "All Products", to: "/products" },
  { label: "Mobile", to: "/products/mobile" },
  { label: "Watch", to: "/products/watch" },
  { label: "Camera", to: "/products/camera" },
  { label: "Laptop", to: "/products/laptop" },
  { label: "Ipad", to: "/products/ipad" },
  { label: "About", to: "/about" },
  { label: "Contact us", to: "/contact" },
];

export default function Navbar() {
  const { user, logout } = usePpanel();
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
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

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* CORE BAR */}
      <div className="bg-[#eff2f6] dark:bg-dark-card">
        <div className="w-full flex items-center justify-between gap-4 lg:gap-8 px-4 lg:px-20 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 text-2xl lg:text-3xl font-extrabold tracking-tight text-primary"
          >
            <img
              src={logoSmall}
              alt="Unimall logo"
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover shadow-sm"
            />
            <span className="flex items-baseline gap-1">
              <span className="text-[#0056A3]">Uni</span>
              <span className="text-primary">Mall</span>
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
                    <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-100">
                      {cartItems.map((item) => {
                        const detailLink = item.slug
                          ? `/products/details/${item.slug}`
                          : "/products";
                        const disableIncrement =
                          item.stock > 0 && item.quantity >= item.stock;
                        return (
                          <div
                            key={item.productId}
                            className="flex gap-3 px-4 py-3"
                          >
                            <Link
                              to={detailLink}
                              className="w-14 h-14 rounded-xl border border-slate-200 flex-shrink-0 overflow-hidden bg-slate-50"
                              onClick={() => setCartOpen(false)}
                            >
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs text-slate-400 flex items-center justify-center h-full">
                                  Preview
                                </span>
                              )}
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={detailLink}
                                className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-primary"
                                onClick={() => setCartOpen(false)}
                              >
                                {item.name}
                              </Link>
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mt-1">
                                <span>{formatPrice(item.price)}</span>
                                {item.originalPrice > item.price && (
                                  <span className="text-xs text-slate-400 line-through">
                                    {formatPrice(item.originalPrice)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary/40 disabled:opacity-40"
                                  onClick={() =>
                                    setQuantity(item, item.quantity - 1)
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  −
                                </button>
                                <span className="text-sm font-semibold text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary/40 disabled:opacity-40"
                                  onClick={() =>
                                    setQuantity(item, item.quantity + 1)
                                  }
                                  disabled={disableIncrement}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-xs text-rose-500 hover:text-rose-600"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
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
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-full bg-primary/10 text-primary font-semibold px-3 lg:px-4 py-1.5 hover:bg-primary/20 transition"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-primary/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {user.fullName?.slice(0, 2).toUpperCase() || (
                        <User size={18} />
                      )}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm">
                    {user.fullName?.split(" ")[0]}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden text-sm z-40">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-primary/20"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center">
                          {user.fullName?.slice(0, 2).toUpperCase() || (
                            <User size={16} />
                          )}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>

                    {user && !user.isEmailVerified && (
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
                          to="/profile"
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
                          to="/addresses"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          📍 Addresses
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/payments"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          💳 Payments
                        </Link>
                      </li>
                    </ul>

                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full font-semibold mt-1 border-t border-slate-100"
                    >
                      ⎋ Logout
                    </button>
                  </div>
                )}
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
