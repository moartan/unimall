import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Home, KeyRound, LogOut, MapPin, ShoppingBag, UserCircle2 } from "lucide-react";

export default function ProfileShell({ user, displayName, activeKey, onSelectTab, logout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(true);

  useEffect(() => {
    const handle = () => setNavOpen(window.innerWidth >= 1024);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const initials = useMemo(
    () =>
      (displayName || user?.email || "U")
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [displayName, user?.email],
  );

  const navItems = [
    { key: "overview", label: "Overview", icon: <Home size={18} />, type: "tab" },
    { key: "details", label: "Edit Profile", icon: <UserCircle2 size={18} />, type: "tab" },
    { key: "avatar", label: "Profile Image", icon: <UserCircle2 size={18} />, type: "tab" },
    { key: "security", label: "Security", icon: <KeyRound size={18} />, type: "tab" },
    { key: "email", label: "Email & Verification", icon: <UserCircle2 size={18} />, type: "tab" },
    { key: "addresses", label: "Addresses", icon: <MapPin size={18} />, type: "link", to: "/addresses" },
    { key: "orders", label: "My Orders", icon: <ShoppingBag size={18} />, type: "link", to: "/orders" },
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto py-10 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col items-stretch gap-5 lg:sticky lg:top-10 lg:h-[calc(100vh-80px)]">
          <button
            className="lg:hidden flex items-center justify-between w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                {initials}
              </span>
              Profile
            </span>
            <ChevronDown size={18} className={`transition ${navOpen ? "rotate-180" : ""}`} />
          </button>

          {navOpen && (
            <>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                  {initials}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{displayName}</p>
                  <p className="text-sm text-slate-600">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive =
                    activeKey === item.key ||
                    (item.type === "link" && location.pathname.startsWith(item.to));

                  const commonClasses = `w-full text-left px-4 h-13 rounded-xl font-semibold transition border flex items-center gap-3 ${
                    isActive
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-[#f4f6f8] text-[#1f2a44] border-[#e2e8f0] hover:border-primary hover:bg-primary/5"
                  }`;

                  if (item.type === "tab") {
                    return (
                      <button
                        key={item.key}
                        onClick={() => onSelectTab && onSelectTab(item.key)}
                        className={commonClasses}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          size={16}
                          className={isActive ? "text-white" : "text-slate-400"}
                        />
                      </button>
                    );
                  }

                  return (
                    <Link key={item.key} to={item.to} className={commonClasses}>
                      <span className="shrink-0">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight
                        size={16}
                        className={isActive ? "text-white" : "text-slate-400"}
                      />
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={logout || (() => navigate("/login"))}
                  className="w-full text-left px-4 py-3 rounded-xl font-semibold transition border flex items-center gap-3 bg-slate-50 text-slate-700 border-slate-200 hover:border-red-400 hover:text-red-600"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </aside>

        <div className="space-y-5">{children}</div>
      </div>
    </div>
  );
}
