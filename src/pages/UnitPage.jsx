// src/pages/UnitPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import Appbar from "../components/Appbar";
import { listUnits, deleteUnit } from "../services/unitService";
import CreateUnitModal from "./units/CreateUnitModal";
import EditUnitModal from "./units/EditUnitModal";
import ViewUnitModal from "./units/ViewUnitModal";
import {
  Search,
  Scale,
  Layers,
  RefreshCw,
  Plus,
  Pencil,
  Eye,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.up { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  position: fixed; inset: 0; z-index: 1; overflow-x: hidden; overflow-y: auto; display: block; margin: 0; padding: 0; max-width: none; text-align: left;
  color: var(--ink); color-scheme: light; line-height: 1.6;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif;
  background: radial-gradient(760px 380px at 92% -6%, rgba(127,209,194,.24), transparent 70%), #f4f9f7; }
.up *, .up *::before, .up *::after { box-sizing: border-box; }
.up-main { min-height: 100%; display: flex; flex-direction: column; min-width: 0; transition: margin-left .26s cubic-bezier(.4,0,.2,1); }
.up-body { padding: 28px 32px 44px; }

.up-in { animation: up-rise .6s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--d, 0) * 70ms); }
@keyframes up-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* ---------- header ---------- */
.up-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.up-titlewrap { display: flex; align-items: center; gap: 14px; }
.up-titleico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.up .up-title { margin: 0; font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.up .up-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.up .up-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; }
.up-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.up-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px;
  border-radius: 13px; font-family: inherit; font-weight: 700; font-size: 14px; transition: transform .15s, box-shadow .25s, background .2s, border-color .2s; }
.up-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.up-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.up-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.up-btn.primary:hover::after { left: 130%; }
.up-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.up-btn.ghost { color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db; }
.up-btn.ghost:hover { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.up-btn:active { transform: scale(.98); }
.up-btn:disabled { opacity: .7; cursor: not-allowed; }
.up-spin { animation: up-spin .8s linear infinite; }
@keyframes up-spin { to { transform: rotate(360deg); } }

/* ---------- stat cards ---------- */
.up-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 22px; }
.up-stat { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .2s, box-shadow .2s; }
.up-stat:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.up-statico { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; display: grid; place-items: center; }
.up-statico.t1 { background: #dff1ea; color: #176f65; }
.up-statico.t2 { background: #e8f5d6; color: #4d7c0f; }
.up-statico.t3 { background: #e0f0f7; color: #0f6d8f; }
.up-statlabel { font-size: 13px; color: var(--muted); font-weight: 500; }
.up-statnum { font-size: 22px; line-height: 1.35; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }
.up-statnum small { font-size: 13px; font-weight: 600; color: var(--muted); margin-left: 4px; }

/* ---------- panel: toolbar + table ---------- */
.up-panel { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); }
.up-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.up-search { position: relative; flex: 1; min-width: 240px; max-width: 480px; display: flex; align-items: center; }
.up-search > svg { position: absolute; left: 14px; color: #5f8a82; pointer-events: none; transition: color .2s; }
.up-search:focus-within > svg { color: var(--teal); }
.up-search input { width: 100%; height: 44px; padding: 0 40px 0 42px; font-size: 14px; font-family: inherit; color: var(--ink); background: #f6faf8;
  border: 1.5px solid #d3e4df; border-radius: 13px; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; color-scheme: light; }
.up-search input::placeholder { color: #86a39d; }
.up-search input:hover { border-color: #b9d3cc; }
.up-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.up-clear { all: unset; cursor: pointer; position: absolute; right: 8px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #5f8a82; transition: background .2s, color .2s; }
.up-clear:hover { background: var(--mint); color: var(--teal-d); }
.up-clear:focus-visible { outline: 2px solid var(--teal); }
.up-count { font-size: 13px; color: var(--muted); }
.up-count b { color: var(--ink); font-weight: 700; }

.up-tablewrap { overflow-x: auto; }
.up-table { width: 100%; min-width: 880px; border-collapse: collapse; text-align: left; }
.up-table th { padding: 13px 18px; background: #f3f9f7; color: var(--muted); font-size: 12.5px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; border-bottom: 1px solid var(--line); }
.up-table td { padding: 14px 18px; font-size: 14px; border-bottom: 1px solid #eef4f2; vertical-align: middle; }
.up-table tbody tr:last-child td { border-bottom: 0; }
.up-row { animation: up-fadein .4s ease both; animation-delay: calc(min(var(--i), 12) * 30ms); transition: background .15s; }
.up-row:hover { background: #f6fbf9; }
@keyframes up-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.up-idx { color: var(--muted); font-weight: 600; font-variant-numeric: tabular-nums; }
.up-name { all: unset; cursor: pointer; display: block; font-weight: 700; font-size: 14.5px; color: var(--ink); transition: color .15s; }
.up-name:hover { color: var(--teal-d); text-decoration: underline; text-underline-offset: 3px; }
.up-name:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; border-radius: 4px; }
.up-id { font-size: 12px; color: #6f8c86; margin-top: 1px; }
.up-pill { display: inline-block; padding: 3px 12px; border-radius: 99px; background: var(--mint); color: var(--teal-d); font-weight: 700; font-size: 12.5px; }
.up-tag { display: inline-flex; align-items: center; gap: 6px; padding: 3px 11px; border-radius: 99px; font-size: 12.5px; font-weight: 700; }
.up-tag.base { background: #e8f5d6; color: #4d7c0f; }
.up-tag.base::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #6ba51f; }
.up-tag.ref { background: #eef4f2; color: var(--text); }
.up-op { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; }
.up-op i { font-style: normal; width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); font-weight: 800; }
.up-dash { color: #9bb3ae; }
.up-date { color: var(--muted); font-size: 13px; white-space: nowrap; }

.up-acts { display: inline-flex; gap: 4px; }
.up-act { all: unset; cursor: pointer; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; color: var(--muted); transition: background .18s, color .18s, transform .15s; }
.up-act:hover { background: var(--mint); color: var(--teal-d); transform: translateY(-1px); }
.up-act.danger:hover { background: #fde8e6; color: #b42318; }
.up-act:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }

/* ---------- states ---------- */
.up-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; animation: up-fadein .3s ease both; }
.up-error button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.up-error button:hover { background: #fde8e6; }
.up-skel-row { display: flex; align-items: center; gap: 24px; padding: 18px 20px; border-bottom: 1px solid #eef4f2; }
.up-skel { height: 14px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: up-shim 1.4s ease infinite; }
@keyframes up-shim { from { background-position: 100% 0; } to { background-position: 0 0; } }
.up-empty { padding: 60px 20px 64px; text-align: center; }
.up-emptyico { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: up-float 4s ease-in-out infinite alternate; }
@keyframes up-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.up .up-emptytitle { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: var(--ink); }
.up-emptytext { margin: 0 0 20px; color: var(--muted); font-size: 14px; }

/* ---------- delete dialog ---------- */
.up-ovl { position: fixed; inset: 0; z-index: 2100; display: flex; justify-content: center; align-items: center; padding: 20px;
  background: rgba(15,55,51,.45); backdrop-filter: blur(4px); animation: up-ovl .2s ease both;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; }
@keyframes up-ovl { from { opacity: 0; } to { opacity: 1; } }
.up-dlg { width: 100%; max-width: 430px; padding: 28px 26px 24px; text-align: center; background: #fff; border-radius: 22px; color: var(--ink); line-height: 1.6;
  box-shadow: 0 30px 70px -20px rgba(15,55,51,.5); animation: up-pop .32s cubic-bezier(.2,1.2,.4,1) both; }
@keyframes up-pop { from { opacity: 0; transform: translateY(14px) scale(.95); } to { opacity: 1; transform: none; } }
.up-dlgico { position: relative; width: 58px; height: 58px; margin: 0 auto 16px; border-radius: 50%; display: grid; place-items: center; background: #fdeceb; color: #c8372d; }
.up-dlgico::after { content: ''; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid rgba(200,55,45,.25); animation: up-ring 1.8s ease-out infinite; }
@keyframes up-ring { from { opacity: 1; transform: scale(.9); } to { opacity: 0; transform: scale(1.25); } }
.up .up-dlg h3 { margin: 0 0 6px; font-size: 18px; font-weight: 700; color: var(--ink); }
.up-dlg p { margin: 0 0 22px; font-size: 14px; color: var(--muted); line-height: 1.7; }
.up-dlg p strong { color: var(--ink); }
.up-derr { margin: -8px 0 18px; padding: 10px 12px; border-radius: 12px; text-align: left; font-size: 13px; background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; }
.up-dlgbtns { display: flex; gap: 10px; }
.up-dlgbtns .up-btn { flex: 1; justify-content: center; }
.up-btn.danger { color: #fff; background: linear-gradient(135deg, #de4b3f, #b9291f); box-shadow: 0 10px 20px -8px rgba(185,41,31,.55); }
.up-btn.danger:hover:not(:disabled) { transform: translateY(-1px); }

@media (max-width: 720px) {
  .up-body { padding: 20px 16px 36px; }
  .up .up-title small { display: block; margin: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .up *, .up *::before, .up *::after, .up-ovl, .up-dlg { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

const opSymbol = (op) => ({ "*": "×", "/": "÷", "+": "+", "-": "−" })[op] ?? op ?? "×";

export default function UnitPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  // 🟢 State សម្រាប់បើក/បិទ Modal ទាំង ៤ (Create, View, Edit, Delete)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingUnit, setViewingUnit] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [deletingUnit, setDeletingUnit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchUnits();
  }, []);

  // បិទ Dialog លុប ដោយចុច Esc
  useEffect(() => {
    if (!deletingUnit) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !isDeleting) setDeletingUnit(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deletingUnit, isDeleting]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await listUnits();
      const items = res?.data || res?.units || (Array.isArray(res) ? res : []);
      setUnits(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching units:", error);
      setErrorMsg(error.message || "បរាជ័យក្នុងការទាញយកទិន្នន័យឯកតាទំនិញ");
    } finally {
      setLoading(false);
    }
  };

  const openDelete = (u) => {
    setDeleteError("");
    setDeletingUnit(u);
  };

  // មុខងារលុបឯកតាទំនិញ (Delete Unit)
  const handleConfirmDelete = async () => {
    if (!deletingUnit?.id) return;
    try {
      setIsDeleting(true);
      setDeleteError("");
      await deleteUnit(deletingUnit.id);
      setDeletingUnit(null);
      fetchUnits();
    } catch (err) {
      setDeleteError(err?.message || "បរាជ័យក្នុងការលុបឯកតាទំនិញនេះ");
    } finally {
      setIsDeleting(false);
    }
  };

  // ច្រោះឯកតាទំនិញតាមការ Search (ឈ្មោះ ឬ ឈ្មោះកាត់)
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const q = search.trim().toLowerCase();
      return (
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.short_name?.toLowerCase().includes(q)
      );
    });
  }, [units, search]);

  // ស្ថិតិសង្ខេបខាងលើ
  const stats = useMemo(() => {
    const total = units.length;
    const baseUnits = units.filter((u) => !u.base_unit_id).length;
    return { total, baseUnits, derived: total - baseUnits };
  }, [units]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("km-KH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const statCards = [
    { label: "ឯកតាសរុប", value: stats.total, icon: Scale, tone: "t1" },
    { label: "ឯកតាមូលដ្ឋាន (Base)", value: stats.baseUnits, icon: Scale, tone: "t2" },
    { label: "ឯកតាបំប្លែង (Derived)", value: stats.derived, icon: Layers, tone: "t3" },
  ];

  const hasSearch = search.trim() !== "";

  return (
    <>
      <style>{css}</style>
      <div className="up">
        {/* 🟢 1. Sidebar */}
        <Sidebar onCollapseChange={(_, width) => setSidebarWidth(width)} />

        {/* 🟢 2. Main Content */}
        <div className="up-main" style={{ marginLeft: `${sidebarWidth}px` }}>
          <Appbar />

          <div className="up-body">
            {/* 🟢 Header & Action Buttons */}
            <div className="up-head up-in" style={{ "--d": 0 }}>
              <div className="up-titlewrap">
                <div className="up-titleico">
                  <Scale size={26} strokeWidth={1.9} />
                </div>
                <div>
                  <h2 className="up-title">
                    បញ្ជីឯកតាទំនិញ<small>Product Units</small>
                  </h2>
                  <p className="up-sub">
                    គ្រប់គ្រងឯកតាគិតប្រាក់ (កញ្ចប់, កំប៉ុង, ដប, កេស...) និងទំនាក់ទំនងឯកតា
                  </p>
                </div>
              </div>

              <div className="up-actions">
                <button className="up-btn ghost" onClick={fetchUnits} disabled={loading}>
                  <RefreshCw size={16} className={loading ? "up-spin" : ""} />
                  <span>ផ្ទុកឡើងវិញ</span>
                </button>
                <button className="up-btn primary" onClick={() => setIsCreateOpen(true)}>
                  <Plus size={17} strokeWidth={2.4} />
                  <span>បន្ថែមឯកតាថ្មី</span>
                </button>
              </div>
            </div>

            {/* 🟢 Summary Cards */}
            <div className="up-stats">
              {statCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div className="up-stat up-in" style={{ "--d": i + 1 }} key={c.label}>
                    <div className={`up-statico ${c.tone}`}>
                      <Icon size={22} strokeWidth={1.9} />
                    </div>
                    <div>
                      <div className="up-statlabel">{c.label}</div>
                      <div className="up-statnum">
                        {c.value}
                        <small>ឯកតា</small>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <div className="up-error" role="alert">
                <span>{errorMsg}</span>
                <button type="button" onClick={fetchUnits}>
                  ព្យាយាមម្តងទៀត
                </button>
              </div>
            )}

            {/* 🟢 Search + Units Table */}
            <div className="up-panel up-in" style={{ "--d": 4 }}>
              <div className="up-toolbar">
                <div className="up-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder="ស្វែងរកតាមឈ្មោះឯកតា ឬ ឈ្មោះកាត់..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="ស្វែងរកឯកតា"
                  />
                  {hasSearch && (
                    <button
                      type="button"
                      className="up-clear"
                      onClick={() => setSearch("")}
                      aria-label="លុបការស្វែងរក"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {!loading && (
                  <div className="up-count">
                    បង្ហាញ <b>{filteredUnits.length}</b> / {units.length} ឯកតា
                  </div>
                )}
              </div>

              {loading ? (
                <div aria-busy="true" aria-label="កំពុងទាញយកទិន្នន័យ">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div className="up-skel-row" key={i}>
                      <div className="up-skel" style={{ width: 24 }} />
                      <div className="up-skel" style={{ width: "22%" }} />
                      <div className="up-skel" style={{ width: "10%" }} />
                      <div className="up-skel" style={{ width: "12%" }} />
                      <div className="up-skel" style={{ width: "10%" }} />
                      <div className="up-skel" style={{ width: "12%", marginLeft: "auto" }} />
                    </div>
                  ))}
                </div>
              ) : filteredUnits.length === 0 ? (
                <div className="up-empty">
                  <div className="up-emptyico">
                    <Scale size={32} strokeWidth={1.7} />
                  </div>
                  <h3 className="up-emptytitle">
                    {hasSearch ? "រកមិនឃើញទិន្នន័យឯកតាទេ" : "មិនទាន់មានឯកតាទំនិញទេ"}
                  </h3>
                  <p className="up-emptytext">
                    {hasSearch
                      ? "សូមសាកល្បងស្វែងរកដោយពាក្យផ្សេង"
                      : "ចាប់ផ្តើមបង្កើតឯកតាដំបូងរបស់អ្នក"}
                  </p>
                  {hasSearch ? (
                    <button className="up-btn ghost" onClick={() => setSearch("")}>
                      <X size={16} />
                      <span>លុបការស្វែងរក</span>
                    </button>
                  ) : (
                    <button className="up-btn primary" onClick={() => setIsCreateOpen(true)}>
                      <Plus size={17} strokeWidth={2.4} />
                      <span>បន្ថែមឯកតាថ្មី</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="up-tablewrap">
                  <table className="up-table">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>#</th>
                        <th>ឈ្មោះឯកតា</th>
                        <th>ឈ្មោះកាត់</th>
                        <th>ឯកតាមូលដ្ឋាន</th>
                        <th>ប្រមាណវិធី &amp; តម្លៃ</th>
                        <th>ថ្ងៃបង្កើត</th>
                        <th style={{ textAlign: "center" }}>សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUnits.map((u, index) => (
                        <tr className="up-row" style={{ "--i": index }} key={u.id || index}>
                          <td className="up-idx">{index + 1}</td>

                          <td>
                            <button type="button" className="up-name" onClick={() => setViewingUnit(u)}>
                              {u.name}
                            </button>
                            <div className="up-id">ID: #{u.id}</div>
                          </td>

                          <td>
                            {u.short_name ? (
                              <span className="up-pill">{u.short_name}</span>
                            ) : (
                              <span className="up-dash">-</span>
                            )}
                          </td>

                          <td>
                            {u.base_unit_id ? (
                              <span className="up-tag ref">#{u.base_unit_id}</span>
                            ) : (
                              <span className="up-tag base">Base</span>
                            )}
                          </td>

                          <td>
                            {u.base_unit_id ? (
                              <span className="up-op">
                                <i>{opSymbol(u.operator || "*")}</i>
                                {u.value || 1}
                              </span>
                            ) : (
                              <span className="up-dash">-</span>
                            )}
                          </td>

                          <td className="up-date">{formatDate(u.created_at)}</td>

                          {/* 🟢 Actions (View, Edit, Delete) */}
                          <td style={{ textAlign: "center" }}>
                            <div className="up-acts">
                              <button
                                type="button"
                                className="up-act"
                                onClick={() => setViewingUnit(u)}
                                title="មើល"
                                aria-label={`មើល ${u.name}`}
                              >
                                <Eye size={17} />
                              </button>
                              <button
                                type="button"
                                className="up-act"
                                onClick={() => setEditingUnit(u)}
                                title="កែប្រែ"
                                aria-label={`កែប្រែ ${u.name}`}
                              >
                                <Pencil size={17} />
                              </button>
                              <button
                                type="button"
                                className="up-act danger"
                                onClick={() => openDelete(u)}
                                title="លុប"
                                aria-label={`លុប ${u.name}`}
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🟢 3. Modal បង្កើតឯកតាថ្មី (Create Unit) */}
        <CreateUnitModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={fetchUnits}
          existingUnits={units}
        />

        {/* 🟢 4. Modal មើលព័ត៌មានលម្អិតឯកតា (View Unit) */}
        <ViewUnitModal
          isOpen={Boolean(viewingUnit)}
          unit={viewingUnit}
          onClose={() => setViewingUnit(null)}
          onEdit={(u) => setEditingUnit(u)}
          onDelete={openDelete}
        />

        {/* 🟢 5. Modal កែប្រែឯកតា (Update Unit) */}
        <EditUnitModal
          isOpen={Boolean(editingUnit)}
          unit={editingUnit}
          onClose={() => setEditingUnit(null)}
          onSuccess={fetchUnits}
          existingUnits={units}
        />

        {/* 🟢 6. Modal បញ្ជាក់ការលុបឯកតា (Delete Confirmation Modal) */}
        {deletingUnit && (
          <div className="up-ovl" onClick={() => !isDeleting && setDeletingUnit(null)}>
            <div
              className="up-dlg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="up-dlg-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="up-dlgico">
                <AlertTriangle size={28} />
              </div>

              <h3 id="up-dlg-title">បញ្ជាក់ការលុបឯកតាទំនិញ</h3>
              <p>
                តើបងពិតជាចង់លុបឯកតា <strong>"{deletingUnit.name}"</strong> នេះមែនទេ?
              </p>

              {deleteError && (
                <div className="up-derr" role="alert">
                  {deleteError}
                </div>
              )}

              <div className="up-dlgbtns">
                <button
                  type="button"
                  className="up-btn ghost"
                  disabled={isDeleting}
                  onClick={() => setDeletingUnit(null)}
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  className="up-btn danger"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={17} className="up-spin" />
                      កំពុងលុប...
                    </>
                  ) : (
                    "យល់ព្រមលុប"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}