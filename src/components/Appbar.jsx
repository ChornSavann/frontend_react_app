import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import api from "../services/api";
import { logoutUser } from "../services/authService";
import { useTranslation } from "../utils/translations";

const API_ORIGIN = (api?.defaults?.baseURL || "").replace(/\/api\/?$/, "");

// Component ទង់ជាតិកម្ពុជា (Khmer Flag SVG)
const KhmerFlag = () => (
  <svg
    width="20"
    height="14"
    viewBox="0 0 28 20"
    fill="none"
    style={{
      borderRadius: "3px",
      flexShrink: 0,
      boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
    }}
  >
    <rect width="28" height="20" fill="#032EA1" />
    <rect y="5" width="28" height="10" fill="#E00025" />
    {/* រូបប្រាសាទអង្គរវត្តសង្ខេប */}
    <path
      d="M9.5 13.5H18.5V12.5H17.5V10.5H16.5V8.5H15.8V10.5H14.6V7.5H13.4V10.5H12.2V8.5H11.5V10.5H10.5V12.5H9.5V13.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

// Component ទង់ជាតិអង់គ្លេស/អាមេរិក (English Flag SVG)
const EnglishFlag = () => (
  <svg
    width="20"
    height="14"
    viewBox="0 0 28 20"
    fill="none"
    style={{
      borderRadius: "3px",
      flexShrink: 0,
      boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
    }}
  >
    <rect width="28" height="20" fill="#012169" />
    <path d="M0 0L28 20M28 0L0 20" stroke="#FFFFFF" strokeWidth="3.2" />
    <path d="M0 0L28 20M28 0L0 20" stroke="#C8102E" strokeWidth="1.6" />
    <path d="M14 0V20M0 10H28" stroke="#FFFFFF" strokeWidth="5.2" />
    <path d="M14 0V20M0 10H28" stroke="#C8102E" strokeWidth="3" />
  </svg>
);

const getLoggedUserInfo = () => {
  let parsedUser = null;
  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("auth_user") ||
      localStorage.getItem("profile");
    if (raw) parsedUser = JSON.parse(raw);
  } catch (e) {}

  const name =
    localStorage.getItem("user_name") ||
    parsedUser?.name ||
    parsedUser?.username ||
    "Admin";

  const role =
    localStorage.getItem("user_role") ||
    parsedUser?.role?.name ||
    parsedUser?.role_name ||
    (typeof parsedUser?.role === "string" ? parsedUser.role : null) ||
    "User";

  const rawAvatar =
    localStorage.getItem("user_avatar") ||
    localStorage.getItem("user_image") ||
    parsedUser?.image_url ||
    parsedUser?.image ||
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

  return { name, role, avatarUrl };
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
.ab-lang-btn { width: auto; padding: 0 11px; display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; border: 1px solid var(--line); background: #f8fbfa; }
.ab-lang-btn:hover { background: #eef5f3; }
.ab-dot { position: absolute; top: 10px; right: 11px; width: 9px; height: 9px; border-radius: 50%; background: #f04438; border: 2px solid #fff; }

.ab-sep { width: 1px; height: 28px; background: var(--line); }

.ab-user { position: relative; }
.ab-ubtn { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; gap: 11px; padding: 5px 8px 5px 5px; border-radius: 14px; transition: background .15s; }
.ab-ubtn:hover, .ab-ubtn[aria-expanded="true"] { background: #eef5f3; }
.ab-avatar { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; font-weight: 700; font-size: 14px; color: var(--deep); background: linear-gradient(145deg, #d9ff85, #9fd93f); overflow: hidden; flex-shrink: 0; }
.ab-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
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

/* Logout Confirm Modal */
.ab-modal-backdrop { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 16px;
  background: rgba(12, 37, 38, 0.45); backdrop-filter: blur(4px);
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; }
.ab-modal { width: 100%; max-width: 360px; padding: 24px; border-radius: 20px;
  background: #fff; color: #0f1f1d; border: 1px solid #e3ecea;
  box-shadow: 0 24px 60px rgba(12, 37, 38, 0.25); text-align: center;
  animation: ab-pop .15s ease-out; }
.ab-modal h3 { margin: 0 0 8px; font-size: 18px; font-weight: 700; }
.ab-modal p { margin: 0 0 22px; font-size: 13.5px; color: #5e7476; line-height: 1.6; }
.ab-modal-actions { display: flex; gap: 10px; }
.ab-modal-btn { all: unset; box-sizing: border-box; cursor: pointer; flex: 1; height: 42px; border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 600;
  transition: transform .12s, background .15s, opacity .15s; }
.ab-modal-btn:active:not(:disabled) { transform: scale(.98); }
.ab-modal-btn:disabled { opacity: .6; cursor: not-allowed; }
.ab-modal-no { background: #f1f6f5; color: #0f1f1d; border: 1px solid #dce7e4; }
.ab-modal-no:hover:not(:disabled) { background: #e5efed; }
.ab-modal-yes { background: #d92d20; color: #fff; }
.ab-modal-yes:hover:not(:disabled) { background: #b42318; }

html.dark .ab, body.dark .ab, .ab.dark {
  --ink: #ecf5f3;
  --muted: #94aca8;
  --line: #1e3533;
  background: rgba(12, 28, 27, 0.88);
}
html.dark .ab-lang-btn, body.dark .ab-lang-btn, .ab.dark .ab-lang-btn {
  background: #142927;
  border-color: var(--line);
  color: var(--ink);
}
html.dark .ab-search input, body.dark .ab-search input, .ab.dark .ab-search input { background: #142927; color: var(--ink); }
html.dark .ab-search input:focus, body.dark .ab-search input:focus, .ab.dark .ab-search input:focus { background: #183230; }
html.dark .ab-kbd, body.dark .ab-kbd, .ab.dark .ab-kbd { background: #0f201e; border-color: var(--line); }
html.dark .ab-icon:hover, body.dark .ab-icon:hover, .ab.dark .ab-icon:hover,
html.dark .ab-ubtn:hover, body.dark .ab-ubtn:hover, .ab.dark .ab-ubtn:hover,
html.dark .ab-ubtn[aria-expanded="true"], body.dark .ab-ubtn[aria-expanded="true"], .ab.dark .ab-ubtn[aria-expanded="true"] { background: #162e2c; }
html.dark .ab-dot, body.dark .ab-dot, .ab.dark .ab-dot { border-color: #0c1c1b; }
html.dark .ab-menu, body.dark .ab-menu, .ab.dark .ab-menu { background: #112422; border-color: var(--line); box-shadow: 0 18px 44px rgba(0,0,0,.45); }
html.dark .ab-mitem:hover, body.dark .ab-mitem:hover, .ab.dark .ab-mitem:hover { background: #183230; }
html.dark .ab-mitem.danger:hover, body.dark .ab-mitem.danger:hover, .ab.dark .ab-mitem.danger:hover { background: rgba(217, 45, 32, 0.15); }
html.dark .ab-modal, body.dark .ab-modal { background: #112422; color: #ecf5f3; border-color: #1e3533; }
html.dark .ab-modal p, body.dark .ab-modal p { color: #94aca8; }
html.dark .ab-modal-no, body.dark .ab-modal-no { background: #183230; color: #ecf5f3; border-color: #24403d; }

.ab button:focus-visible, .ab-search input:focus-visible, .ab-modal-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

@media (max-width: 820px) { .ab { padding: 0 16px; } .ab-search, .ab-uinfo, .ab-sep { display: none; } .ab-title p { display: none; } }
@media (prefers-reduced-motion: reduce) { .ab-menu, .ab-modal { animation: none; } }
`;

export default function Appbar({ title, onSearch, notifications = 0 }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const { lang, t, toggleLang } = useTranslation();

  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [userInfo, setUserInfo] = useState(() => getLoggedUserInfo());
  const [imgError, setImgError] = useState(false);

  const pageTitle = title || t.titles[pathname] || t.appbar.defaultTitle;

  const today = new Date().toLocaleDateString(
    lang === "km" ? "km-KH" : "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(
      new CustomEvent("app-theme-change", { detail: { dark } }),
    );
  }, [dark]);

  useEffect(() => {
    const syncUser = () => {
      setUserInfo(getLoggedUserInfo());
      setImgError(false);
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (confirmLogoutOpen && !loggingOut) {
          setConfirmLogoutOpen(false);
        } else {
          setOpen(false);
        }
      }
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
  }, [confirmLogoutOpen, loggingOut]);

  const handleLogout = () => {
    if (loggingOut) return;
    setOpen(false);
    setConfirmLogoutOpen(true);
  };

  const handleCancelLogout = () => {
    if (loggingOut) return;
    setConfirmLogoutOpen(false);
  };

  const handleConfirmLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      setLoggingOut(false);
      setConfirmLogoutOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <style>{css}</style>
      <header className={`ab ${dark ? "dark" : ""}`}>
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
              placeholder={t.appbar.searchPlaceholder}
              aria-label="Search"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch?.(e.currentTarget.value);
              }}
            />
            <span className="ab-kbd">/</span>
          </div>

          {/* ប៊ូតុងប្តូរភាសាជាមួយទង់ជាតិខ្មែរ និង អង់គ្លេស */}
          <button
            className="ab-icon ab-lang-btn"
            onClick={toggleLang}
            title={t.appbar.switchLangTooltip}
            aria-label="Toggle language"
          >
            {lang === "km" ? <KhmerFlag /> : <EnglishFlag />}
            <span>{lang === "km" ? "ខ្មែរ" : "EN"}</span>
          </button>

          <button
            className="ab-icon"
            onClick={() => setDark((prev) => !prev)}
            title={dark ? "Light Mode" : "Dark Mode"}
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <Sun size={20} strokeWidth={1.9} />
            ) : (
              <Moon size={20} strokeWidth={1.9} />
            )}
          </button>

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
                {userInfo.avatarUrl && !imgError ? (
                  <img
                    src={userInfo.avatarUrl}
                    alt={userInfo.name}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  userInfo.name.trim().charAt(0).toUpperCase()
                )}
              </div>
              <div className="ab-uinfo">
                <div className="ab-uname">{userInfo.name}</div>
                <div className="ab-urole">{userInfo.role}</div>
              </div>
              <ChevronDown className="ab-chev" size={16} />
            </button>

            {open && (
              <div className="ab-menu" role="menu">
                <div className="ab-mhead">
                  <b>{userInfo.name}</b>
                  <span>{userInfo.role}</span>
                </div>
                <button
                  className="ab-mitem"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    navigate("/settings");
                  }}
                >
                  <Settings size={17} strokeWidth={1.9} /> {t.appbar.settings}
                </button>
                <button
                  className="ab-mitem danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={17} strokeWidth={1.9} /> {t.appbar.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {confirmLogoutOpen && (
        <div
          className="ab-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ab-logout-title"
          onClick={handleCancelLogout}
        >
          <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="ab-logout-title">{t.appbar.logout}</h3>
            <p>តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ?</p>
            <div className="ab-modal-actions">
              <button
                type="button"
                className="ab-modal-btn ab-modal-no"
                onClick={handleCancelLogout}
                disabled={loggingOut}
              >
                No
              </button>
              <button
                type="button"
                className="ab-modal-btn ab-modal-yes"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}