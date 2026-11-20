import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Store,
  Package,
  FileText,
  CreditCard,
  Wallet,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { listproduct } from "../services/productService";
import { useTranslation } from "../utils/translations";

export const SIDEBAR_WIDTH = 270;
export const SIDEBAR_WIDTH_COLLAPSED = 80;

const REMEMBER_KEY = "lg_remember_email";

const menus = [
  { key: "dashboard", group: 0, name: "Home", path: "/dashboard", icon: Home },
  {
    key: "sales",
    group: 1,
    name: "Order & Invoice",
    icon: ShoppingCart,
    subItems: [
      { name: "Catalog", path: "/catalog" },
      { name: "Order Form", path: "/order-form" },
      { name: "Sales History (Orders)", path: "/sales-history" },
      { name: "Vendor Invoice", path: "/vendor-invoices" },
    ],
  },
  {
    key: "pos",
    group: 1,
    name: "Point of Sale",
    path: "/orders",
    icon: CreditCard,
  },
  {
    key: "inventory",
    group: 1,
    name: "Inventory",
    icon: Package,
    subItems: [
      { name: "All Products", path: "/inventory" },
      { name: "Brands", path: "/brands" },
      { name: "Categories", path: "/categories" },
      { name: "Units", path: "/units" },
      { name: "Stock Adjustment", path: "/stock-adjustment" },
    ],
  },
  {
    key: "delivery",
    group: 1,
    name: "delivery",
    icon: Truck,
    subItems: [{ name: "Delivery", path: "/orders/delivery-orders" }],
  },
  {
    key: "expenses",
    group: 1,
    name: "Expenses",
    icon: Wallet,
    subItems: [
      { name: "All Expenses", path: "/expenses" },
      { name: "Expense Types", path: "/expense-types" },
    ],
  },
  {
    key: "purchase",
    group: 1,
    name: "Purchase",
    path: "/purchase",
    icon: Store,
  },
  {
    key: "suppliers",
    group: 1,
    name: "Manage People",
    icon: Users,
    subItems: [
      { name: "Supplier", path: "/suppliers" },
      { name: "Customers", path: "/customers" },
    ],
  },
  {
    key: "users",
    group: 1,
    name: "Users & Roles",
    icon: ShieldCheck,
    subItems: [
      { name: "Users List", path: "/users" },
      { name: "Roles & Permissions", path: "/roles" },
    ],
  },
  {
    key: "stores",
    group: 1,
    name: "Stores",
    icon: Store,
    path: "/stores",
  },
  {
    key: "reports",
    group: 1,
    name: "Reports",
    icon: FileText,
    subItems: [
      { name: "Dialy Report", path: "/reports" },
      { name: "Sale Report", path: "/reports/sales" },
      { name: "Purchase Report", path: "/reports/purchases" },
      { name: "Customer Report", path: "/reports/customers" },
      { name: "Product Report", path: "/reports/products" },
      { name: "Analysis Chat", path: "/reports/financial" },
      { name: "Profit & Loss", path: "/reports/profit-loss" },
    ],
  },
  {
    key: "settings",
    group: 1,
    name: "Settings",
    path: "/settings",
    icon: Settings,
    subItems:[
      {name:"Auth Log",path:"/auth-logs"},
    ]
  },
];

// which expandable group (if any) contains this page
const findGroupKey = (p) =>
  menus.find((m) => m.subItems?.some((s) => s.path === p))?.key ?? null;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.sb {
  --ink: #0f3733; --text: #26514b; --muted: #46665f; --icon: #2c7d72;
  --teal: #1f8a7d; --teal-d: #176f65; --mint: #dff1ea; --hover: #f1f8f6;
  position: fixed; inset: 0 auto 0 0; z-index: 1001; display: flex; flex-direction: column;
  background: linear-gradient(180deg, #eaf5f1 0%, #deeee8 100%);
  color: var(--text); user-select: none; line-height: 1.5;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif;
  box-shadow: 8px 0 30px -14px rgba(14,90,81,.35);
  transition: width .26s cubic-bezier(.4,0,.2,1);
}
.sb, .sb *, .sb *::before, .sb *::after { box-sizing: border-box; }

/* ---------- curved deep-green header ---------- */
.sb-head { position: relative; overflow: hidden; flex-shrink: 0; height: 96px; padding: 0 16px 20px 18px; display: flex; align-items: center;
  background: linear-gradient(150deg, #19917f 0%, #0e5a51 55%, #0b463f 100%);
  border-radius: 0 0 50% 50% / 0 0 26px 26px;
  box-shadow: 0 16px 26px -16px rgba(11,70,63,.55); }
.sb-head::before, .sb-head::after { content: ''; position: absolute; border-radius: 50%; pointer-events: none; }
.sb-head::before { width: 170px; height: 170px; right: -56px; top: -80px; background: radial-gradient(circle at 35% 35%, rgba(255,255,255,.22), rgba(255,255,255,0) 70%); animation: sb-drift 12s ease-in-out infinite alternate; }
.sb-head::after { width: 130px; height: 130px; left: -46px; bottom: -64px; background: radial-gradient(circle, rgba(127,209,194,.38), rgba(127,209,194,0) 70%); animation: sb-drift 15s ease-in-out -5s infinite alternate-reverse; }
@keyframes sb-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(14px,10px) scale(1.15); } }

.sb-brand { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; min-width: 0; }
.sb-logo { width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0; display: grid; place-items: center; background: #fff; color: var(--teal-d); font-weight: 800; font-size: 18px;
  box-shadow: 0 8px 18px -6px rgba(0,0,0,.35); }
.sb-title { color: #fff; font-weight: 700; font-size: 16px; white-space: nowrap; line-height: 1.25; }
.sb-title small { display: block; font-weight: 500; font-size: 12px; color: rgba(255,255,255,.78); margin-top: 1px; }

.sb-btn { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; width: 100%; position: relative; border-radius: 14px; transition: background .2s, color .2s, box-shadow .2s; }
.sb-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

/* floating collapse button on the sidebar edge */
.sb-toggle { position: absolute; top: 70px; right: -13px; z-index: 3; width: 26px; height: 26px; justify-content: center; border-radius: 50%;
  background: #fff; color: var(--teal-d); box-shadow: 0 0 0 1px #cfe3dd, 0 6px 14px -4px rgba(14,90,81,.4); transition: background .2s, color .2s, transform .2s; }
.sb-toggle:hover { background: var(--teal); color: #fff; transform: scale(1.08); }

/* ---------- nav ---------- */
.sb-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 18px 12px 12px; scrollbar-width: none; }
.sb-nav::-webkit-scrollbar { display: none; }
.sb-divider { height: 1px; margin: 10px 14px; background: rgba(23,111,101,.16); }

.sb-entry { margin-bottom: 4px; animation: sb-in .45s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--i) * 40ms + 80ms); }
@keyframes sb-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }

.sb-item { height: 46px; padding: 0 12px 0 12px; gap: 12px; font-size: 14.5px; font-weight: 500; color: var(--text); }
.sb-item:hover { background: rgba(255,255,255,.7); color: var(--ink); }

.sb-item::before { content: ''; position: absolute; left: 6px; top: 50%; width: 9px; height: 32px;
  background: linear-gradient(180deg, #2aa595, #176f65);
  clip-path: path('M9 0 C0 7 0 25 9 32 C5.8 23 5.8 9 9 0Z');
  transform: translateY(-50%) scaleY(0); transition: transform .3s cubic-bezier(.3,1.4,.5,1); }
.sb-item.active { background: #fff; color: var(--teal-d); font-weight: 600; box-shadow: 0 6px 16px -10px rgba(14,90,81,.45), 0 0 0 1px rgba(31,138,125,.1); }
.sb-item.active:hover { background: #fff; }
.sb-item.active::before { transform: translateY(-50%) scaleY(1); }

.sb-ico { width: 30px; height: 30px; flex-shrink: 0; display: grid; place-items: center; color: var(--icon); transition: color .2s, transform .2s; }
.sb-item:hover .sb-ico { color: var(--teal-d); transform: scale(1.1); }
.sb-item.active .sb-ico { color: var(--teal); }

.sb-label { flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-badge { font-size: 11.5px; font-weight: 700; padding: 1px 8px; border-radius: 99px; background: #fff; color: var(--teal-d); box-shadow: inset 0 0 0 1px #cfe3dd; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.sb-chev { flex-shrink: 0; color: var(--icon); transition: transform .28s cubic-bezier(.3,1.3,.5,1), color .2s; }
.sb-chev.open { transform: rotate(180deg); color: var(--teal-d); }

.sb-group { border-radius: 16px; transition: background .25s, box-shadow .25s; }
.sb:not(.collapsed) .sb-group.open { background: #fff; box-shadow: 0 8px 20px -14px rgba(14,90,81,.4), 0 0 0 1px rgba(31,138,125,.1); }
.sb:not(.collapsed) .sb-group.open .sb-item { color: var(--ink); font-weight: 600; }
.sb:not(.collapsed) .sb-group.open .sb-item.active { background: transparent; box-shadow: none; color: var(--teal-d); }
.sb:not(.collapsed) .sb-group.open .sb-item:hover { background: var(--hover); }

.sb-sub { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .28s cubic-bezier(.4,0,.2,1); }
.sb-sub.open { grid-template-rows: 1fr; }
.sb-sub > div { overflow: hidden; }
.sb-sub ul { list-style: none; margin: 0 8px 10px; padding: 0; }
.sb-subitem { height: 40px; padding: 0 12px 0 15px; gap: 23px; font-size: 14px; font-weight: 500; color: #3a5d57; border-radius: 11px; }
.sb-subitem::before { content: ''; flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; border: 1.6px solid #8fb8af; background: transparent;
  transition: background .2s, border-color .2s, box-shadow .2s, transform .2s; }
.sb-subitem:hover { background: var(--hover); color: var(--ink); }
.sb-subitem:hover::before { border-color: var(--teal); }
.sb-subitem .sb-badge { margin-left: auto; }
.sb-subitem.active { color: var(--teal-d); font-weight: 700; background: var(--mint); }
.sb-subitem.active::before { background: var(--teal); border-color: var(--teal); box-shadow: 0 0 0 3px rgba(31,138,125,.18); }

/* ---------- footer / profile ---------- */
.sb-foot { padding: 10px 12px 14px; flex-shrink: 0; }
.sb-user { display: flex; align-items: center; gap: 11px; padding: 10px; border-radius: 16px; background: #fff; border: 1px solid #d3e8e1; box-shadow: 0 10px 20px -14px rgba(14,90,81,.5); }
.sb-avatar { width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0; display: grid; place-items: center; font-weight: 700; font-size: 14.5px; color: #fff; background: linear-gradient(145deg, #3bb5a4, #1a7d70); overflow: hidden; }
.sb-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sb-uinfo { flex: 1; min-width: 0; line-height: 1.3; }
.sb-uname { color: var(--ink); font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-urole { font-size: 12.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-logout { width: 36px; height: 36px; justify-content: center; flex-shrink: 0; border-radius: 10px; color: #b42318; }
.sb-logout:hover { background: #fde8e6; color: #912018; }

/* ---------- collapsed rail ---------- */
.sb.collapsed .sb-title, .sb.collapsed .sb-label, .sb.collapsed .sb-badge, .sb.collapsed .sb-chev, .sb.collapsed .sb-sub, .sb.collapsed .sb-uinfo { display: none; }
.sb.collapsed .sb-head { justify-content: center; padding: 0 0 20px; }
.sb.collapsed .sb-item { justify-content: center; padding: 0; width: 48px; margin-left: auto; margin-right: auto; }
.sb.collapsed .sb-user { flex-direction: column; padding: 8px 0; background: none; border: 0; box-shadow: none; gap: 8px; }

/* tooltip for the collapsed rail */
.sb-tip { position: fixed; z-index: 1100; transform: translateY(-50%); background: var(--ink); color: #fff; font-size: 13px; font-weight: 500;
  padding: 7px 12px; border-radius: 9px; white-space: nowrap; pointer-events: none; box-shadow: 0 10px 24px rgba(15,55,51,.3); animation: sb-tip .16s ease-out both; }
.sb-tip::before { content: ''; position: absolute; left: -4px; top: 50%; width: 8px; height: 8px; background: var(--ink); transform: translateY(-50%) rotate(45deg); border-radius: 2px; }
@keyframes sb-tip { from { opacity: 0; margin-left: -4px; } to { opacity: 1; margin-left: 0; } }

@media (prefers-reduced-motion: reduce) {
  .sb, .sb *, .sb *::before, .sb *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; animation-delay: 0s !important; }
}
`;

function getUser() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const rawAvatar =
      localStorage.getItem("user_avatar") ||
      localStorage.getItem("user_image") ||
      u.image_url ||
      u.image ||
      null;

    let avatarUrl = null;
    if (rawAvatar && rawAvatar !== "null" && rawAvatar !== "undefined") {
      if (
        rawAvatar.startsWith("http") ||
        rawAvatar.startsWith("data:") ||
        rawAvatar.startsWith("blob:")
      ) {
        avatarUrl = rawAvatar;
      } else {
        avatarUrl = `${API_ORIGIN}/${rawAvatar.replace(/^\/+/, "")}`;
      }
    }

    return {
      name:
        localStorage.getItem("user_name") || u.name || u.username || "Admin",
      role: localStorage.getItem("user_role") || u.role || "Store owner",
      avatarUrl,
    };
  } catch {
    return { name: "Admin", role: "Store owner", avatarUrl: null };
  }
}

export default function Sidebar({ onCollapseChange }) {
  const navigate = useNavigate();
  const { pathname: path } = useLocation();
  const { t } = useTranslation();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [openKey, setOpenKey] = useState(() => findGroupKey(path));
  const [productCount, setProductCount] = useState(null);
  const [tip, setTip] = useState(null);
  const [imgError, setImgError] = useState(false);
  const user = getUser();

  // Helper សម្រាប់ទាញយកឈ្មោះម៉ឺនុយដែលបានបកប្រែ
  const getMenuLabel = (m) => t?.sidebar?.menus?.[m.key] || m.name;
  const getSubLabel = (s) => t?.sidebar?.subItems?.[s.path] || s.name;
  const subtitleText = t?.sidebar?.subtitle || "Store manager";
  const logoutText = t?.sidebar?.logout || "Logout";

  useEffect(() => {
    let mounted = true;
    const fetchProductCount = async () => {
      try {
        const res = await listproduct();
        const items =
          res?.data || res?.products || (Array.isArray(res) ? res : []);
        if (mounted && Array.isArray(items)) {
          setProductCount(items.length);
        }
      } catch (err) {
        console.error("Sidebar product count error:", err);
      }
    };
    fetchProductCount();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setOpenKey(findGroupKey(path));
  }, [path]);

  useEffect(() => {
    onCollapseChange?.(
      collapsed,
      collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
    );
  }, [collapsed, onCollapseChange]);

  const toggleCollapsed = () => {
    setTip(null);
    setCollapsed((c) => {
      try {
        localStorage.setItem("sidebar_collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });
  };

  const isActive = (m) =>
    m.path
      ? path === m.path
      : Boolean(m.subItems?.some((s) => s.path === path));

  const handleClick = (m) => {
    if (!m.subItems) return navigate(m.path);
    if (collapsed) return navigate(m.subItems[0].path);
    setOpenKey((k) => (k === m.key ? null : m.key));
  };

  const handleLogout = () => {
    let remembered = null;
    const currentTheme = localStorage.getItem("theme");
    const currentLang = localStorage.getItem("app_lang");
    try {
      remembered = localStorage.getItem(REMEMBER_KEY);
    } catch {}
    localStorage.clear();
    try {
      if (remembered) localStorage.setItem(REMEMBER_KEY, remembered);
      if (currentTheme) localStorage.setItem("theme", currentTheme);
      if (currentLang) localStorage.setItem("app_lang", currentLang);
    } catch {}
    navigate("/login");
  };

  const showTip = (e, text) => {
    if (!collapsed) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ text, top: r.top + r.height / 2 });
  };
  const hideTip = () => setTip(null);
  const tipProps = (text) => ({
    onMouseEnter: (e) => showTip(e, text),
    onFocus: (e) => showTip(e, text),
    onMouseLeave: hideTip,
    onBlur: hideTip,
  });

  return (
    <>
      <style>{css}</style>
      <nav
        className={`sb${collapsed ? " collapsed" : ""}`}
        style={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH }}
        aria-label="Main navigation"
      >
        <div className="sb-head">
          <div className="sb-brand">
            <div className="sb-logo">P</div>
            <div className="sb-title">
              POS &amp; Inventory<small>{subtitleText}</small>
            </div>
          </div>
        </div>

        <button
          className="sb-btn sb-toggle"
          onClick={toggleCollapsed}
          aria-label={
            collapsed
              ? t?.sidebar?.expand || "Expand sidebar"
              : t?.sidebar?.collapse || "Collapse sidebar"
          }
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        <div className="sb-nav" onScroll={hideTip}>
          {menus.map((m, i) => {
            const Icon = m.icon;
            const hasSub = Boolean(m.subItems);
            const isOpen = hasSub && !collapsed && openKey === m.key;
            const active = isActive(m);
            const newGroup = i > 0 && m.group !== menus[i - 1].group;
            const menuLabel = getMenuLabel(m);

            const row = (
              <button
                className={`sb-btn sb-item${active ? " active" : ""}`}
                onClick={() => handleClick(m)}
                aria-label={menuLabel}
                aria-expanded={hasSub ? isOpen : undefined}
                aria-current={!hasSub && active ? "page" : undefined}
                {...tipProps(menuLabel)}
              >
                <span className="sb-ico">
                  <Icon size={19} strokeWidth={1.9} />
                </span>
                <span className="sb-label">{menuLabel}</span>

                {m.key === "inventory" && productCount !== null && (
                  <span className="sb-badge">{productCount}</span>
                )}
                {hasSub && (
                  <ChevronDown
                    className={`sb-chev${isOpen ? " open" : ""}`}
                    size={16}
                  />
                )}
              </button>
            );

            return (
              <React.Fragment key={m.key}>
                {newGroup && <div className="sb-divider" />}
                <div className="sb-entry" style={{ "--i": i }}>
                  {hasSub ? (
                    <div className={`sb-group${isOpen ? " open" : ""}`}>
                      {row}
                      <div className={`sb-sub${isOpen ? " open" : ""}`}>
                        <div>
                          <ul>
                            {m.subItems.map((s) => {
                              const on = path === s.path;
                              return (
                                <li key={s.path}>
                                  <button
                                    className={`sb-btn sb-subitem${on ? " active" : ""}`}
                                    onClick={() => navigate(s.path)}
                                    tabIndex={isOpen ? 0 : -1}
                                    aria-current={on ? "page" : undefined}
                                  >
                                    <span>{getSubLabel(s)}</span>

                                    {s.path === "/inventory" &&
                                      productCount !== null && (
                                        <span className="sb-badge">
                                          {productCount}
                                        </span>
                                      )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    row
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="sb-foot">
          <div className="sb-user">
            <div className="sb-avatar">
              {user.avatarUrl && !imgError ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  onError={() => setImgError(true)}
                />
              ) : (
                user.name.trim().charAt(0).toUpperCase()
              )}
            </div>
            <div className="sb-uinfo">
              <div className="sb-uname">{user.name}</div>
              <div className="sb-urole">{user.role}</div>
            </div>
            <button
              className="sb-btn sb-logout"
              onClick={handleLogout}
              aria-label={logoutText}
              {...tipProps(logoutText)}
            >
              <LogOut size={18} strokeWidth={1.9} />
            </button>
          </div>
        </div>

        {collapsed && tip && (
          <div
            className="sb-tip"
            style={{ top: tip.top, left: SIDEBAR_WIDTH_COLLAPSED + 12 }}
            role="tooltip"
          >
            {tip.text}
          </div>
        )}
      </nav>
    </>
  );
}
