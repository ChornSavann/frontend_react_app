// src/pages/StorePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import Appbar from "../components/Appbar";
import { listStores, deleteStore } from "../services/storeService";
import CreateStoreModal from "./stores/CreateStoreModal";
import EditStoreModal from "./stores/EditStoreModal";
import ViewStoreModal from "./stores/ViewStoreModal";
import ToastrContainer, { toastr, sweetConfirm } from "../components/Toastr";
import { useTranslation } from "../utils/translations";
import {
  Search,
  Store,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Pencil,
  Eye,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.sp { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  position: fixed; inset: 0; z-index: 1; overflow-x: hidden; overflow-y: auto; display: block; margin: 0; padding: 0; max-width: none; text-align: left;
  color: var(--ink); color-scheme: light; line-height: 1.6;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif;
  background: radial-gradient(760px 380px at 92% -6%, rgba(127,209,194,.24), transparent 70%), #f4f9f7; }
.sp *, .sp *::before, .sp *::after { box-sizing: border-box; }
.sp-main { min-height: 100%; display: flex; flex-direction: column; min-width: 0; transition: margin-left .26s cubic-bezier(.4,0,.2,1); }
.sp-body { padding: 28px 32px 44px; }

.sp-in { animation: sp-rise .6s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--d, 0) * 70ms); }
@keyframes sp-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* ---------- header ---------- */
.sp-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.sp-titlewrap { display: flex; align-items: center; gap: 14px; }
.sp-titleico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.sp .sp-title { margin: 0; font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.sp .sp-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.sp .sp-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; }
.sp-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.sp-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px;
  border-radius: 13px; font-family: inherit; font-weight: 700; font-size: 14px; transition: transform .15s, box-shadow .25s, background .2s, border-color .2s; }
.sp-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.sp-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.sp-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.sp-btn.primary:hover::after { left: 130%; }
.sp-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.sp-btn.ghost { color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db; }
.sp-btn.ghost:hover { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.sp-btn:active { transform: scale(.98); }
.sp-btn:disabled { opacity: .7; cursor: not-allowed; }
.sp-spin { animation: sp-spin .8s linear infinite; }
@keyframes sp-spin { to { transform: rotate(360deg); } }

/* ---------- stat cards ---------- */
.sp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 22px; }
.sp-stat { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .2s, box-shadow .2s; }
.sp-stat:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.sp-statico { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; display: grid; place-items: center; }
.sp-statico.t1 { background: #dff1ea; color: #176f65; }
.sp-statico.t2 { background: #e8f5d6; color: #4d7c0f; }
.sp-statico.t3 { background: #eef1f1; color: #5b6f6b; }
.sp-statlabel { font-size: 13px; color: var(--muted); font-weight: 500; }
.sp-statnum { font-size: 22px; line-height: 1.35; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }
.sp-statnum small { font-size: 13px; font-weight: 600; color: var(--muted); margin-left: 4px; }

/* ---------- panel: toolbar + table ---------- */
.sp-panel { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); }
.sp-toolbar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.sp-search { position: relative; flex: 1 1 280px; max-width: 480px; display: flex; align-items: center; }
.sp-search > svg { position: absolute; left: 14px; color: #5f8a82; pointer-events: none; transition: color .2s; }
.sp-search:focus-within > svg { color: var(--teal); }
.sp-search input { width: 100%; height: 44px; padding: 0 40px 0 42px; font-size: 14px; font-family: inherit; color: var(--ink); background: #f6faf8;
  border: 1.5px solid #d3e4df; border-radius: 13px; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; color-scheme: light; }
.sp-search input::placeholder { color: #86a39d; }
.sp-search input:hover { border-color: #b9d3cc; }
.sp-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.sp-clear { all: unset; cursor: pointer; position: absolute; right: 8px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #5f8a82; transition: background .2s, color .2s; }
.sp-clear:hover { background: var(--mint); color: var(--teal-d); }
.sp-clear:focus-visible { outline: 2px solid var(--teal); }

.sp-seg { display: inline-flex; gap: 2px; padding: 4px; background: #eef5f2; border-radius: 14px; }
.sp-seg button { all: unset; cursor: pointer; height: 36px; padding: 0 12px 0 14px; display: inline-flex; align-items: center; gap: 8px; border-radius: 10px;
  font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--muted); white-space: nowrap; transition: background .2s, color .2s, box-shadow .2s; }
.sp-seg button:hover { color: var(--ink); }
.sp-seg button:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }
.sp-seg button.on { background: #fff; color: var(--teal-d); box-shadow: 0 4px 10px -6px rgba(14,90,81,.5), 0 0 0 1px rgba(31,138,125,.1); }
.sp-seg .n { font-size: 12px; padding: 0 8px; border-radius: 99px; background: rgba(31,138,125,.12); color: var(--teal-d); font-variant-numeric: tabular-nums; }
.sp-count { margin-left: auto; font-size: 13px; color: var(--muted); }
.sp-count b { color: var(--ink); font-weight: 700; }

.sp-tablewrap { overflow-x: auto; }
.sp-table { width: 100%; min-width: 980px; border-collapse: collapse; text-align: left; }
.sp-table th { padding: 13px 18px; background: #f3f9f7; color: var(--muted); font-size: 12.5px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; border-bottom: 1px solid var(--line); }
.sp-table td { padding: 14px 18px; font-size: 14px; border-bottom: 1px solid #eef4f2; vertical-align: middle; }
.sp-table tbody tr:last-child td { border-bottom: 0; }
.sp-row { animation: sp-fadein .4s ease both; animation-delay: calc(min(var(--i), 12) * 30ms); transition: background .15s; }
.sp-row:hover { background: #f6fbf9; }
@keyframes sp-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.sp-idx { color: var(--muted); font-weight: 600; font-variant-numeric: tabular-nums; }
.sp-store { display: flex; align-items: center; gap: 12px; }
.sp-avbtn { all: unset; cursor: pointer; display: block; flex-shrink: 0; border-radius: 13px; transition: transform .15s; }
.sp-avbtn:hover { transform: scale(1.06); }
.sp-avbtn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.sp-av { display: block; width: 44px; height: 44px; border-radius: 13px; object-fit: cover; border: 1px solid var(--line); background: #f3f9f7; }
.sp-av.ph { display: grid; place-items: center; border: 0; color: #fff; font-weight: 800; font-size: 17px; background: linear-gradient(145deg, #3bb5a4, #1a7d70); }
.sp-name { all: unset; cursor: pointer; display: block; font-weight: 700; font-size: 14.5px; color: var(--ink); transition: color .15s; }
.sp-name:hover { color: var(--teal-d); text-decoration: underline; text-underline-offset: 3px; }
.sp-name:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; border-radius: 4px; }
.sp-id { font-size: 12px; color: #6f8c86; margin-top: 1px; }
.sp-code { display: inline-block; padding: 3px 11px; border-radius: 8px; background: #eef4f2; color: var(--text); font-weight: 700; font-size: 12.5px; letter-spacing: .3px; }
.sp-line { display: flex; align-items: center; gap: 7px; max-width: 230px; }
.sp-line span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sp-line svg { flex-shrink: 0; }
.sp-phone { color: var(--teal-d); font-weight: 600; font-size: 13.5px; }
.sp-mail { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
.sp-addr { color: var(--text); font-size: 13.5px; max-width: 240px; }
.sp-dash { color: #9bb3ae; }

.sp-badge { display: inline-flex; align-items: center; gap: 7px; padding: 3px 12px; border-radius: 99px; font-size: 12.5px; font-weight: 700; }
.sp-badge::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.sp-badge.on { background: #e8f5d6; color: #4d7c0f; }
.sp-badge.on::before { box-shadow: 0 0 0 3px rgba(107,165,31,.2); }
.sp-badge.off { background: #eef1f1; color: #5b6f6b; }

.sp-acts { display: inline-flex; gap: 4px; }
.sp-act { all: unset; cursor: pointer; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; color: var(--muted); transition: background .18s, color .18s, transform .15s; }
.sp-act:hover { background: var(--mint); color: var(--teal-d); transform: translateY(-1px); }
.sp-act.danger:hover { background: #fde8e6; color: #b42318; }
.sp-act:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }

/* ---------- states ---------- */
.sp-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; animation: sp-fadein .3s ease both; }
.sp-error button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.sp-error button:hover { background: #fde8e6; }
.sp-skel-row { display: flex; align-items: center; gap: 24px; padding: 16px 20px; border-bottom: 1px solid #eef4f2; }
.sp-skel { height: 14px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: sp-shim 1.4s ease infinite; }
@keyframes sp-shim { from { background-position: 100% 0; } to { background-position: 0 0; } }
.sp-empty { padding: 60px 20px 64px; text-align: center; }
.sp-emptyico { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: sp-float 4s ease-in-out infinite alternate; }
@keyframes sp-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.sp .sp-emptytitle { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: var(--ink); }
.sp-emptytext { margin: 0 0 20px; color: var(--muted); font-size: 14px; }

@media (max-width: 720px) {
  .sp-body { padding: 20px 16px 36px; }
  .sp .sp-title small { display: block; margin: 0; }
  .sp-count { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .sp *, .sp *::before, .sp *::after { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

function StoreAvatar({ store, onClick, viewLabel }) {
  const src = store.image_url || store.logo_url;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const letter = (store.name || "?").trim().charAt(0).toUpperCase();

  return (
    <button
      type="button"
      className="sp-avbtn"
      onClick={onClick}
      aria-label={`${viewLabel} ${store.name}`}
    >
      {src && !failed ? (
        <img className="sp-av" src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <span className="sp-av ph">{letter}</span>
      )}
    </button>
  );
}

export default function StorePage() {
  const { lang, t } = useTranslation();
  const tst = t.stores;

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingStore, setViewingStore] = useState(null);
  const [editingStore, setEditingStore] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await listStores();
      const items = res?.data || res?.stores || (Array.isArray(res) ? res : []);
      setStores(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      const msg = error.message || tst.fetchError;
      setErrorMsg(msg);
      toastr.error(tst.toastErrorTitle, msg);
    } finally {
      setLoading(false);
    }
  };

  // មុខងារលុបហាង/សាខាដោយប្រើ Sweet Confirm & Toastr
  const handleDelete = async (store) => {
    const confirmed = await sweetConfirm({
      title: tst.confirmDeleteTitle,
      text: tst.confirmDeleteText(store.name),
      confirmText: tst.confirmDeleteBtn,
      cancelText: tst.cancelBtn,
      type: "danger",
    });

    if (confirmed) {
      try {
        await deleteStore(store.id);
        setStores((prev) => prev.filter((item) => item.id !== store.id));
        toastr.success(tst.toastDeleteSuccessTitle, tst.toastDeleteSuccessMsg(store.name));
      } catch (err) {
        toastr.error(tst.toastErrorTitle, err?.message || tst.toastDeleteErrorMsg);
      }
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q);

      const isActive = Number(s.is_active ?? 1) === 1;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchSearch && matchStatus;
    });
  }, [stores, search, statusFilter]);

  const stats = useMemo(() => {
    const total = stores.length;
    const active = stores.filter((s) => Number(s.is_active ?? 1) === 1).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [stores]);

  const statCards = [
    { label: tst.statTotal, value: stats.total, icon: Store, tone: "t1" },
    { label: tst.statActive, value: stats.active, icon: CheckCircle2, tone: "t2" },
    { label: tst.statInactive, value: stats.inactive, icon: XCircle, tone: "t3" },
  ];

  const filters = [
    { key: "all", label: tst.filterAll, n: stats.total },
    { key: "active", label: tst.filterActive, n: stats.active },
    { key: "inactive", label: tst.filterInactive, n: stats.inactive },
  ];

  const hasSearch = search.trim() !== "";
  const hasFilter = hasSearch || statusFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <>
      <style>{css}</style>
      <ToastrContainer />
      <div className="sp">
        <Sidebar onCollapseChange={(_, width) => setSidebarWidth(width)} />

        <div className="sp-main" style={{ marginLeft: `${sidebarWidth}px` }}>
          <Appbar />

          <div className="sp-body">
            {/* Header & Action Buttons */}
            <div className="sp-head sp-in" style={{ "--d": 0 }}>
              <div className="sp-titlewrap">
                <div className="sp-titleico">
                  <Store size={26} strokeWidth={1.9} />
                </div>
                <div>
                  <h2 className="sp-title">
                    {tst.heading}
                    {lang === "km" && <small>Stores</small>}
                  </h2>
                  <p className="sp-sub">{tst.subHeading}</p>
                </div>
              </div>

              <div className="sp-actions">
                <button className="sp-btn ghost" onClick={fetchStores} disabled={loading}>
                  <RefreshCw size={16} className={loading ? "sp-spin" : ""} />
                  <span>{tst.refresh}</span>
                </button>
                <button className="sp-btn primary" onClick={() => setIsCreateOpen(true)}>
                  <Plus size={17} strokeWidth={2.4} />
                  <span>{tst.addNew}</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="sp-stats">
              {statCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div className="sp-stat sp-in" style={{ "--d": i + 1 }} key={c.label}>
                    <div className={`sp-statico ${c.tone}`}>
                      <Icon size={22} strokeWidth={1.9} />
                    </div>
                    <div>
                      <div className="sp-statlabel">{c.label}</div>
                      <div className="sp-statnum">
                        {c.value}
                        <small>{tst.branchSuffix}</small>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <div className="sp-error" role="alert">
                <span>{errorMsg}</span>
                <button type="button" onClick={fetchStores}>
                  {tst.tryAgain}
                </button>
              </div>
            )}

            {/* Search & Status Filter + Stores Table */}
            <div className="sp-panel sp-in" style={{ "--d": 4 }}>
              <div className="sp-toolbar">
                <div className="sp-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder={tst.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label={tst.searchPlaceholder}
                  />
                  {hasSearch && (
                    <button
                      type="button"
                      className="sp-clear"
                      onClick={() => setSearch("")}
                      aria-label={tst.clearSearch}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="sp-seg" role="group" aria-label="Filter by status">
                  {filters.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      className={statusFilter === f.key ? "on" : ""}
                      aria-pressed={statusFilter === f.key}
                      onClick={() => setStatusFilter(f.key)}
                    >
                      {f.label}
                      <span className="n">{f.n}</span>
                    </button>
                  ))}
                </div>

                {!loading && (
                  <div className="sp-count">
                    {tst.showing} <b>{filteredStores.length}</b> / {stores.length} {tst.branchSuffix}
                  </div>
                )}
              </div>

              {loading ? (
                <div aria-busy="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div className="sp-skel-row" key={i}>
                      <div className="sp-skel" style={{ width: 24 }} />
                      <div className="sp-skel" style={{ width: 44, height: 44, borderRadius: 13 }} />
                      <div className="sp-skel" style={{ width: "18%" }} />
                      <div className="sp-skel" style={{ width: "10%" }} />
                      <div className="sp-skel" style={{ width: "16%" }} />
                      <div className="sp-skel" style={{ width: "14%", marginLeft: "auto" }} />
                    </div>
                  ))}
                </div>
              ) : filteredStores.length === 0 ? (
                <div className="sp-empty">
                  <div className="sp-emptyico">
                    <Store size={32} strokeWidth={1.7} />
                  </div>
                  <h3 className="sp-emptytitle">
                    {hasFilter ? tst.emptyFilter : tst.emptyNoFilter}
                  </h3>
                  <p className="sp-emptytext">
                    {hasFilter ? tst.emptySubFilter : tst.emptySubNoFilter}
                  </p>
                  {hasFilter ? (
                    <button className="sp-btn ghost" onClick={clearFilters}>
                      <X size={16} />
                      <span>{tst.clearFilters}</span>
                    </button>
                  ) : (
                    <button className="sp-btn primary" onClick={() => setIsCreateOpen(true)}>
                      <Plus size={17} strokeWidth={2.4} />
                      <span>{tst.addNew}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="sp-tablewrap">
                  <table className="sp-table">
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>#</th>
                        <th>{tst.colStore}</th>
                        <th>{tst.colCode}</th>
                        <th>{tst.colPhoneEmail}</th>
                        <th>{tst.colAddress}</th>
                        <th style={{ textAlign: "center" }}>{tst.colStatus}</th>
                        <th style={{ textAlign: "center" }}>{tst.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStores.map((store, index) => {
                        const isActive = Number(store.is_active ?? 1) === 1;

                        return (
                          <tr className="sp-row" style={{ "--i": index }} key={store.id || index}>
                            <td className="sp-idx">{index + 1}</td>

                            {/* Logo + Name */}
                            <td>
                              <div className="sp-store">
                                <StoreAvatar
                                  store={store}
                                  onClick={() => setViewingStore(store)}
                                  viewLabel={tst.viewTitle}
                                />
                                <div>
                                  <button
                                    type="button"
                                    className="sp-name"
                                    onClick={() => setViewingStore(store)}
                                  >
                                    {store.name}
                                  </button>
                                  <div className="sp-id">ID: #{store.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Code */}
                            <td>
                              {store.code ? (
                                <span className="sp-code">{store.code}</span>
                              ) : (
                                <span className="sp-dash">-</span>
                              )}
                            </td>

                            {/* Phone & Email */}
                            <td>
                              <div className="sp-line sp-phone">
                                <Phone size={13} />
                                <span>{store.phone || "-"}</span>
                              </div>
                              {store.email && (
                                <div className="sp-line sp-mail" title={store.email}>
                                  <Mail size={12} />
                                  <span>{store.email}</span>
                                </div>
                              )}
                            </td>

                            {/* Address */}
                            <td>
                              {store.address ? (
                                <div className="sp-line sp-addr" title={store.address}>
                                  <MapPin size={14} color="#5f8a82" />
                                  <span>{store.address}</span>
                                </div>
                              ) : (
                                <span className="sp-dash">-</span>
                              )}
                            </td>

                            {/* Status */}
                            <td style={{ textAlign: "center" }}>
                              <span className={`sp-badge ${isActive ? "on" : "off"}`}>
                                {isActive ? tst.statusActive : tst.statusInactive}
                              </span>
                            </td>

                            {/* Actions (View, Edit, Delete) */}
                            <td style={{ textAlign: "center" }}>
                              <div className="sp-acts">
                                <button
                                  type="button"
                                  className="sp-act"
                                  onClick={() => setViewingStore(store)}
                                  title={tst.viewTitle}
                                  aria-label={`${tst.viewTitle} ${store.name}`}
                                >
                                  <Eye size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="sp-act"
                                  onClick={() => setEditingStore(store)}
                                  title={tst.editTitle}
                                  aria-label={`${tst.editTitle} ${store.name}`}
                                >
                                  <Pencil size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="sp-act danger"
                                  onClick={() => handleDelete(store)}
                                  title={tst.deleteTitle}
                                  aria-label={`${tst.deleteTitle} ${store.name}`}
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal បង្កើតហាងថ្មី */}
        <CreateStoreModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            fetchStores();
            toastr.success(tst.toastCreateSuccessTitle, tst.toastCreateSuccessMsg);
          }}
        />

        {/* Modal មើលព័ត៌មានលម្អិតហាង */}
        <ViewStoreModal
          isOpen={Boolean(viewingStore)}
          store={viewingStore}
          onClose={() => setViewingStore(null)}
          onEdit={(s) => setEditingStore(s)}
          onDelete={handleDelete}
        />

        {/* Modal កែប្រែហាង */}
        <EditStoreModal
          isOpen={Boolean(editingStore)}
          store={editingStore}
          onClose={() => setEditingStore(null)}
          onSuccess={() => {
            fetchStores();
            toastr.success(tst.toastUpdateSuccessTitle, tst.toastUpdateSuccessMsg);
          }}
        />
      </div>
    </>
  );
}