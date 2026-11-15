import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, ChevronDown, Settings, LogOut } from "lucide-react";

const TITLES = {
  "/dashboard": "Home",
  "/catalog": "Catalog",
  "/order-form": "Order Form",
  "/sales-history": "Sales History",
  "/vendor-invoice": "Vendor Invoice",
  "/pos": "Point of Sale",
  "/inventory": "All Products",
  "/stock-adjustment": "Stock Adjustment",
  "/purchase": "Purchase",
  "/customers": "Customers",
  "/roles": "Role & Permission",
  "/users": "Management User",
  "/suppliers": "Item Vendors",
  "/reports": "Daily Reports",
  "/settings": "Settings",
  "/expenses": "Management Expenses",
  "/expense-types": "Management ExpensesType",
  
  "/reports/purchases": "Purchase Report Management",
  "/reports/financial": "Analysis Chat",
  "/reports/profit-loss": "Management Profit & Loss",
  "/reports/customers": "Customers Report",
  "/reports/sales": "Sales Report",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600&display=swap');

.ab { --ink:#0f1f1d; --muted:#5e7476; --line:#e3ecea; --teal:#0f766e; --deep:#0c2526; --accent:#c8f169;
  position: sticky; top: 0; z-index: 1000; height: 72px; padding: 0 28px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  background: rgba(255,255,255,.86); backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px);
  border-bottom: 1px solid var(--line); color: var(--ink);
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; text-align: left; }
.ab *, .ab *::before, .ab *::after { box-sizing: border-box; }

.ab .ab-title h1 { margin: 0; color: var(--ink); font-family: inherit; font-size: 20px; font-weight: 700; letter-spacing: -.4px; line-height: 1.2; }
.ab-title p { margin: 2px 0 0; font-size: 12.5px; color: var(--muted); }

.ab-right { display: flex; align-items: center; gap: 12px; }

.ab-search { position: relative; display: flex; align-items: center; width: 300px; }
.ab-search svg { position: absolute; left: 13px; color: #8aa3a0; pointer-events: none; }
.ab-search input { all: unset; box-sizing: border-box; width: 100%; height: 42px; padding: 0 42px 0 40px; font-size: 13.5px; color: var(--ink);
  background: #f1f6f5; border: 1.5px solid transparent; border-radius: 12px; transition: background .15s, border-color .15s, box-shadow .15s; }
.ab-search input::placeholder { color: #8aa3a0; }
.ab-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.ab-kbd { position: absolute; right: 10px; width: 22px; height: 22px; display: grid; place-items: center; font-size: 12px; font-weight: 600; color: #8aa3a0;
  background: #fff; border: 1px solid var(--line); border-radius: 6px; pointer-events: none; }
.ab-search input:focus ~ .ab-kbd { display: none; }

.ab-icon { all: unset; box-sizing: border-box; cursor: pointer; position: relative; width: 42px; height: 42px; display: grid; place-items: center; border-radius: 12px; color: var(--muted); transition: background .15s, color .15s; }
.ab-icon:hover { background: #eef5f3; color: var(--ink); }
.ab-dot { position: absolute; top: 10px; right: 11px; width: 9px; height: 9px; border-radius: 50%; background: #f04438; border: 2px solid #fff; }

.ab-sep { width: 1px; height: 28px; background: var(--line); }

.ab-user { position: relative; }
.ab-ubtn { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; gap: 11px; padding: 5px 8px 5px 5px; border-radius: 14px; transition: background .15s; }
.ab-ubtn:hover, .ab-ubtn[aria-expanded="true"] { background: #eef5f3; }
.ab-avatar { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; font-weight: 700; font-size: 14px; color: var(--deep); background: linear-gradient(145deg, #d9ff85, #9fd93f); }
.ab-uinfo { line-height: 1.25; text-align: left; }
.ab-uname { font-size: 13.5px; font-weight: 600; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ab-urole { font-size: 12px; color: var(--muted); }
.ab-chev { color: #8aa3a0; transition: transform .2s; }
.ab-ubtn[aria-expanded="true"] .ab-chev { transform: rotate(180deg); }

.ab-menu { position: absolute; right: 0; top: calc(100% + 10px); width: 230px; padding: 8px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 18px 44px rgba(12,37,38,.16); animation: ab-pop .14s ease-out; transform-origin: top right; }
@keyframes ab-pop { from { opacity: 0; transform: scale(.97) translateY(-4px); } to { opacity: 1; transform: none; } }
.ab-mhead { padding: 10px 10px 12px; border-bottom: 1px solid var(--line); margin-bottom: 6px; }
.ab-mhead b { display: block; font-size: 13.5px; }
.ab-mhead span { font-size: 12px; color: var(--muted); }
.ab-mitem { all: unset; box-sizing: border-box; cursor: pointer; width: 100%; height: 40px; padding: 0 10px; display: flex; align-items: center; gap: 10px; border-radius: 10px; font-size: 13.5px; font-weight: 500; color: var(--ink); }
.ab-mitem:hover { background: #f1f6f5; }
.ab-mitem.danger { color: #d92d20; }
.ab-mitem.danger:hover { background: #fff1f0; }

.ab button:focus-visible, .ab-search input:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

@media (max-width: 820px) { .ab { padding: 0 16px; } .ab-search, .ab-uinfo, .ab-sep { display: none; } .ab-title p { display: none; } }
@media (prefers-reduced-motion: reduce) { .ab-menu { animation: none; } }
`;

export default function Appbar({ title, onSearch, notifications = 0 }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const userName = localStorage.getItem("user_name") || "Admin";
  const userRole = localStorage.getItem("user_role") || "User";
  const pageTitle = title || TITLES[pathname] || "POS & Inventory";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Close the menu on outside click / Escape; "/" focuses search
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      const tag = (e.target.tagName || "").toLowerCase();
      if (
        e.key === "/" &&
        !["input", "textarea", "select"].includes(tag) &&
        !e.target.isContentEditable
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <style>{css}</style>
      <header className="ab">
        <div className="ab-title">
          <h1>{pageTitle}</h1>
          <p>{today}</p>
        </div>

        <div className="ab-right">
          <div className="ab-search">
            <Search size={17} />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search products, orders…"
              aria-label="Search"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch?.(e.currentTarget.value);
              }}
            />
            <span className="ab-kbd">/</span>
          </div>

          <button className="ab-icon" aria-label="Notifications">
            <Bell size={20} strokeWidth={1.9} />
            {notifications > 0 && <span className="ab-dot" />}
          </button>

          <div className="ab-sep" />

          <div className="ab-user" ref={menuRef}>
            <button
              className="ab-ubtn"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <div className="ab-avatar">
                {userName.trim().charAt(0).toUpperCase()}
              </div>
              <div className="ab-uinfo">
                <div className="ab-uname">{userName}</div>
                <div className="ab-urole">{userRole}</div>
              </div>
              <ChevronDown className="ab-chev" size={16} />
            </button>

            {open && (
              <div className="ab-menu" role="menu">
                <div className="ab-mhead">
                  <b>{userName}</b>
                  <span>{userRole}</span>
                </div>
                <button
                  className="ab-mitem"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    navigate("/settings");
                  }}
                >
                  <Settings size={17} strokeWidth={1.9} /> Settings
                </button>
                <button
                  className="ab-mitem danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={17} strokeWidth={1.9} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
