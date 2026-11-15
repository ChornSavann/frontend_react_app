
import React, { useEffect, useState, useMemo } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import Appbar from "../components/Appbar";
import { listSuppliers, deleteSupplier } from "../services/supplierService";
import CreateSupplierModal from "./suppliers/CreateSupplierModal";
import EditSupplierModal from "./suppliers/EditSupplierModal";
import ViewSupplierModal from "./suppliers/ViewSupplierModal";
import {
  Search,
  Building2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Pencil,
  Eye,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Phone,
  Mail,
  Globe,
  MapPin,
} from "lucide-react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.sup { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  position: fixed; inset: 0; z-index: 1; overflow-x: hidden; overflow-y: auto; display: block; margin: 0; padding: 0; max-width: none; text-align: left;
  color: var(--ink); color-scheme: light; line-height: 1.6;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif;
  background: radial-gradient(760px 380px at 92% -6%, rgba(127,209,194,.24), transparent 70%), #f4f9f7; }
.sup *, .sup *::before, .sup *::after { box-sizing: border-box; }
.sup-main { min-height: 100%; display: flex; flex-direction: column; min-width: 0; transition: margin-left .26s cubic-bezier(.4,0,.2,1); }
.sup-body { padding: 28px 32px 44px; }

.sup-in { animation: sup-rise .6s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--d, 0) * 70ms); }
@keyframes sup-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* ---------- header ---------- */
.sup-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.sup-titlewrap { display: flex; align-items: center; gap: 14px; }
.sup-titleico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.sup .sup-title { margin: 0; font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.sup .sup-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.sup .sup-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; max-width: 640px; }
.sup-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.sup-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px;
  border-radius: 13px; font-family: inherit; font-weight: 700; font-size: 14px; transition: transform .15s, box-shadow .25s, background .2s, border-color .2s; }
.sup-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.sup-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.sup-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.sup-btn.primary:hover::after { left: 130%; }
.sup-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.sup-btn.ghost { color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db; }
.sup-btn.ghost:hover { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.sup-btn:active { transform: scale(.98); }
.sup-btn:disabled { opacity: .7; cursor: not-allowed; }
.sup-spin { animation: sup-spin .8s linear infinite; }
@keyframes sup-spin { to { transform: rotate(360deg); } }

/* ---------- stat cards ---------- */
.sup-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 22px; }
.sup-stat { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .2s, box-shadow .2s; }
.sup-stat:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.sup-statico { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; display: grid; place-items: center; }
.sup-statico.t1 { background: #dff1ea; color: #176f65; }
.sup-statico.t2 { background: #e8f5d6; color: #4d7c0f; }
.sup-statico.t3 { background: #eef1f1; color: #5b6f6b; }
.sup-statlabel { font-size: 13px; color: var(--muted); font-weight: 500; }
.sup-statnum { font-size: 22px; line-height: 1.35; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }
.sup-statnum small { font-size: 13px; font-weight: 600; color: var(--muted); margin-left: 4px; }

/* ---------- panel: toolbar + table ---------- */
.sup-panel { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); }
.sup-toolbar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.sup-search { position: relative; flex: 1 1 280px; max-width: 480px; display: flex; align-items: center; }
.sup-search > svg { position: absolute; left: 14px; color: #5f8a82; pointer-events: none; transition: color .2s; }
.sup-search:focus-within > svg { color: var(--teal); }
.sup-search input { width: 100%; height: 44px; padding: 0 40px 0 42px; font-size: 14px; font-family: inherit; color: var(--ink); background: #f6faf8;
  border: 1.5px solid #d3e4df; border-radius: 13px; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; color-scheme: light; }
.sup-search input::placeholder { color: #86a39d; }
.sup-search input:hover { border-color: #b9d3cc; }
.sup-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.sup-clear { all: unset; cursor: pointer; position: absolute; right: 8px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #5f8a82; transition: background .2s, color .2s; }
.sup-clear:hover { background: var(--mint); color: var(--teal-d); }
.sup-clear:focus-visible { outline: 2px solid var(--teal); }

.sup-seg { display: inline-flex; flex-wrap: wrap; gap: 2px; padding: 4px; background: #eef5f2; border-radius: 14px; }
.sup-seg button { all: unset; cursor: pointer; height: 36px; padding: 0 12px 0 14px; display: inline-flex; align-items: center; gap: 8px; border-radius: 10px;
  font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--muted); white-space: nowrap; transition: background .2s, color .2s, box-shadow .2s; }
.sup-seg button:hover { color: var(--ink); }
.sup-seg button:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }
.sup-seg button.on { background: #fff; color: var(--teal-d); box-shadow: 0 4px 10px -6px rgba(14,90,81,.5), 0 0 0 1px rgba(31,138,125,.1); }
.sup-seg .n { font-size: 12px; padding: 0 8px; border-radius: 99px; background: rgba(31,138,125,.12); color: var(--teal-d); font-variant-numeric: tabular-nums; }
.sup-count { margin-left: auto; font-size: 13px; color: var(--muted); }
.sup-count b { color: var(--ink); font-weight: 700; }

.sup-tablewrap { overflow-x: auto; }
.sup-table { width: 100%; min-width: 1080px; border-collapse: collapse; text-align: left; }
.sup-table th { padding: 13px 18px; background: #f3f9f7; color: var(--muted); font-size: 12.5px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; border-bottom: 1px solid var(--line); }
.sup-table td { padding: 14px 18px; font-size: 14px; border-bottom: 1px solid #eef4f2; vertical-align: middle; }
.sup-table tbody tr:last-child td { border-bottom: 0; }
.sup-row { animation: sup-fadein .4s ease both; animation-delay: calc(min(var(--i), 12) * 30ms); transition: background .15s; }
.sup-row:hover { background: #f6fbf9; }
@keyframes sup-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.sup-idx { color: var(--muted); font-weight: 600; font-variant-numeric: tabular-nums; }
.sup-co { display: flex; align-items: center; gap: 12px; }
.sup-avbtn { all: unset; cursor: pointer; display: block; flex-shrink: 0; border-radius: 13px; transition: transform .15s; }
.sup-avbtn:hover { transform: scale(1.06); }
.sup-avbtn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.sup-av { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 13px; color: #fff; font-weight: 800; font-size: 17px; background: linear-gradient(145deg, #3bb5a4, #1a7d70); }
.sup-name { all: unset; cursor: pointer; display: block; font-weight: 700; font-size: 14.5px; color: var(--ink); transition: color .15s; }
.sup-name:hover { color: var(--teal-d); text-decoration: underline; text-underline-offset: 3px; }
.sup-name:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; border-radius: 4px; }
.sup-id { font-size: 12px; color: #6f8c86; margin-top: 1px; }
.sup-contact { font-weight: 600; color: var(--text); }
.sup-line { display: flex; align-items: center; gap: 7px; max-width: 230px; }
.sup-line span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sup-line svg { flex-shrink: 0; }
.sup-phone { color: var(--teal-d); font-weight: 600; font-size: 13.5px; }
.sup-mail { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
.sup-addr { color: var(--text); font-size: 13.5px; max-width: 220px; }
.sup-dash { color: #9bb3ae; }
.sup-link { display: inline-flex; align-items: center; gap: 7px; max-width: 190px; padding: 3px 11px 3px 9px; border-radius: 99px; background: var(--mint); color: var(--teal-d);
  font-size: 12.5px; font-weight: 700; text-decoration: none; transition: background .2s, transform .15s; }
.sup-link span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sup-link svg { flex-shrink: 0; }
.sup-link:hover { background: #cfeadf; transform: translateY(-1px); }
.sup-link:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.sup-badge { display: inline-flex; align-items: center; gap: 7px; padding: 3px 12px; border-radius: 99px; font-size: 12.5px; font-weight: 700; }
.sup-badge::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.sup-badge.on { background: #e8f5d6; color: #4d7c0f; }
.sup-badge.on::before { box-shadow: 0 0 0 3px rgba(107,165,31,.2); }
.sup-badge.off { background: #eef1f1; color: #5b6f6b; }

.sup-acts { display: inline-flex; gap: 4px; }
.sup-act { all: unset; cursor: pointer; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; color: var(--muted); transition: background .18s, color .18s, transform .15s; }
.sup-act:hover { background: var(--mint); color: var(--teal-d); transform: translateY(-1px); }
.sup-act.danger:hover { background: #fde8e6; color: #b42318; }
.sup-act:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }

/* ---------- states ---------- */
.sup-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; animation: sup-fadein .3s ease both; }
.sup-error button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.sup-error button:hover { background: #fde8e6; }
.sup-skel-row { display: flex; align-items: center; gap: 24px; padding: 16px 20px; border-bottom: 1px solid #eef4f2; }
.sup-skel { height: 14px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: sup-shim 1.4s ease infinite; }
@keyframes sup-shim { from { background-position: 100% 0; } to { background-position: 0 0; } }
.sup-empty { padding: 60px 20px 64px; text-align: center; }
.sup-emptyico { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: sup-float 4s ease-in-out infinite alternate; }
@keyframes sup-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.sup .sup-emptytitle { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: var(--ink); }
.sup-emptytext { margin: 0 0 20px; color: var(--muted); font-size: 14px; }

/* ---------- delete dialog ---------- */
.sup-ovl { position: fixed; inset: 0; z-index: 2100; display: flex; justify-content: center; align-items: center; padding: 20px;
  background: rgba(15,55,51,.45); backdrop-filter: blur(4px); animation: sup-ovl .2s ease both;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; }
@keyframes sup-ovl { from { opacity: 0; } to { opacity: 1; } }
.sup-dlg { width: 100%; max-width: 430px; padding: 28px 26px 24px; text-align: center; background: #fff; border-radius: 22px; color: var(--ink); line-height: 1.6;
  box-shadow: 0 30px 70px -20px rgba(15,55,51,.5); animation: sup-pop .32s cubic-bezier(.2,1.2,.4,1) both; }
@keyframes sup-pop { from { opacity: 0; transform: translateY(14px) scale(.95); } to { opacity: 1; transform: none; } }
.sup-dlgico { position: relative; width: 58px; height: 58px; margin: 0 auto 16px; border-radius: 50%; display: grid; place-items: center; background: #fdeceb; color: #c8372d; }
.sup-dlgico::after { content: ''; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid rgba(200,55,45,.25); animation: sup-ring 1.8s ease-out infinite; }
@keyframes sup-ring { from { opacity: 1; transform: scale(.9); } to { opacity: 0; transform: scale(1.25); } }
.sup .sup-dlg h3 { margin: 0 0 6px; font-size: 18px; font-weight: 700; color: var(--ink); }
.sup-dlg p { margin: 0 0 22px; font-size: 14px; color: var(--muted); line-height: 1.7; }
.sup-dlg p strong { color: var(--ink); }
.sup-derr { margin: -8px 0 18px; padding: 10px 12px; border-radius: 12px; text-align: left; font-size: 13px; background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; }
.sup-dlgbtns { display: flex; gap: 10px; }
.sup-dlgbtns .sup-btn { flex: 1; justify-content: center; }
.sup-btn.danger { color: #fff; background: linear-gradient(135deg, #de4b3f, #b9291f); box-shadow: 0 10px 20px -8px rgba(185,41,31,.55); }
.sup-btn.danger:hover:not(:disabled) { transform: translateY(-1px); }

@media (max-width: 720px) {
  .sup-body { padding: 20px 16px 36px; }
  .sup .sup-title small { display: block; margin: 0; }
  .sup-count { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .sup *, .sup *::before, .sup *::after, .sup-ovl, .sup-dlg { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;


function safeUrl(raw) {
  if (!raw) return null;
  const t = String(raw).trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return null;
  return `https://${t}`;
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "គេហទំព័រ";
  }
}

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // បិទ Dialog លុប ដោយចុច Esc
  useEffect(() => {
    if (!deletingSupplier) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !isDeleting) setDeletingSupplier(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deletingSupplier, isDeleting]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await listSuppliers();
      const items =
        res?.data || res?.suppliers || (Array.isArray(res) ? res : []);
      setSuppliers(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setErrorMsg(error.message || "បរាជ័យក្នុងការទាញយកទិន្នន័យអ្នកផ្គត់ផ្គង់");
    } finally {
      setLoading(false);
    }
  };

  const openDelete = (s) => {
    setDeleteError("");
    setDeletingSupplier(s);
  };

  // មុខងារលុបអ្នកផ្គត់ផ្គង់ (Delete Supplier)
  const handleConfirmDelete = async () => {
    if (!deletingSupplier?.id) return;
    try {
      setIsDeleting(true);
      setDeleteError("");
      await deleteSupplier(deletingSupplier.id);
      setDeletingSupplier(null);
      fetchSuppliers();
    } catch (err) {
      setDeleteError(err?.message || "បរាជ័យក្នុងការលុបអ្នកផ្គត់ផ្គង់នេះ");
    } finally {
      setIsDeleting(false);
    }
  };

  // ច្រោះអ្នកផ្គត់ផ្គង់តាមការ Search និង Status
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.company?.toLowerCase().includes(q) ||
        s.contact_name?.toLowerCase().includes(q) ||
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
  }, [suppliers, search, statusFilter]);

  // គណនាស្ថិតិសង្ខេបខាងលើ
  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(
      (s) => Number(s.is_active ?? 1) === 1,
    ).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [suppliers]);

  const statCards = [
    {
      label: "អ្នកផ្គត់ផ្គង់សរុប",
      value: stats.total,
      icon: Building2,
      tone: "t1",
    },
    {
      label: "កំពុងដំណើរការ (Active)",
      value: stats.active,
      icon: CheckCircle2,
      tone: "t2",
    },
    {
      label: "ផ្អាកដំណើរការ (Inactive)",
      value: stats.inactive,
      icon: XCircle,
      tone: "t3",
    },
  ];

  const filters = [
    { key: "all", label: "ទាំងអស់", n: stats.total },
    { key: "active", label: "កំពុងដំណើរការ", n: stats.active },
    { key: "inactive", label: "ផ្អាក", n: stats.inactive },
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
      <div className="sup">
        {/* 🟢 1. Sidebar */}
        <Sidebar onCollapseChange={(_, width) => setSidebarWidth(width)} />

        {/* 🟢 2. Main Content */}
        <div className="sup-main" style={{ marginLeft: `${sidebarWidth}px` }}>
          <Appbar />

          <div className="sup-body">
            {/* 🟢 Header & Action Buttons */}
            <div className="sup-head sup-in" style={{ "--d": 0 }}>
              <div className="sup-titlewrap">
                <div className="sup-titleico">
                  <Building2 size={26} strokeWidth={1.9} />
                </div>
                <div>
                  <h2 className="sup-title">
                    បញ្ជីអ្នកផ្គត់ផ្គង់ទំនិញ<small>Suppliers</small>
                  </h2>
                  <p className="sup-sub">
                    គ្រប់គ្រងក្រុមហ៊ុនផ្គត់ផ្គង់ អ្នកទំនាក់ទំនង លេខទូរស័ព្ទ
                    និងអាសយដ្ឋានសម្រាប់ទិញទំនិញចូលស្តុក
                  </p>
                </div>
              </div>

              <div className="sup-actions">
                <button
                  className="sup-btn ghost"
                  onClick={fetchSuppliers}
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? "sup-spin" : ""} />
                  <span>ផ្ទុកឡើងវិញ</span>
                </button>
                <button
                  className="sup-btn primary"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus size={17} strokeWidth={2.4} />
                  <span>បន្ថែមអ្នកផ្គត់ផ្គង់ថ្មី</span>
                </button>
              </div>
            </div>

            {/* 🟢 Summary Cards */}
            <div className="sup-stats">
              {statCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div
                    className="sup-stat sup-in"
                    style={{ "--d": i + 1 }}
                    key={c.label}
                  >
                    <div className={`sup-statico ${c.tone}`}>
                      <Icon size={22} strokeWidth={1.9} />
                    </div>
                    <div>
                      <div className="sup-statlabel">{c.label}</div>
                      <div className="sup-statnum">
                        {c.value}
                        <small>ក្រុមហ៊ុន</small>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <div className="sup-error" role="alert">
                <span>{errorMsg}</span>
                <button type="button" onClick={fetchSuppliers}>
                  ព្យាយាមម្តងទៀត
                </button>
              </div>
            )}

            {/* 🟢 Search & Status Filter + Suppliers Table */}
            <div className="sup-panel sup-in" style={{ "--d": 4 }}>
              <div className="sup-toolbar">
                <div className="sup-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder="ស្វែងរកតាមក្រុមហ៊ុន, អ្នកទំនាក់ទំនង, ទូរស័ព្ទ ឬអាសយដ្ឋាន..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="ស្វែងរកអ្នកផ្គត់ផ្គង់"
                  />
                  {hasSearch && (
                    <button
                      type="button"
                      className="sup-clear"
                      onClick={() => setSearch("")}
                      aria-label="លុបការស្វែងរក"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div
                  className="sup-seg"
                  role="group"
                  aria-label="ច្រោះតាមស្ថានភាព"
                >
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
                  <div className="sup-count">
                    បង្ហាញ <b>{filteredSuppliers.length}</b> /{" "}
                    {suppliers.length} ក្រុមហ៊ុន
                  </div>
                )}
              </div>

              {loading ? (
                <div aria-busy="true" aria-label="កំពុងទាញយកទិន្នន័យ">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div className="sup-skel-row" key={i}>
                      <div className="sup-skel" style={{ width: 24 }} />
                      <div
                        className="sup-skel"
                        style={{ width: 44, height: 44, borderRadius: 13 }}
                      />
                      <div className="sup-skel" style={{ width: "16%" }} />
                      <div className="sup-skel" style={{ width: "12%" }} />
                      <div className="sup-skel" style={{ width: "14%" }} />
                      <div
                        className="sup-skel"
                        style={{ width: "12%", marginLeft: "auto" }}
                      />
                    </div>
                  ))}
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="sup-empty">
                  <div className="sup-emptyico">
                    <Building2 size={32} strokeWidth={1.7} />
                  </div>
                  <h3 className="sup-emptytitle">
                    {hasFilter
                      ? "រកមិនឃើញទិន្នន័យអ្នកផ្គត់ផ្គង់ទេ"
                      : "មិនទាន់មានអ្នកផ្គត់ផ្គង់ទេ"}
                  </h3>
                  <p className="sup-emptytext">
                    {hasFilter
                      ? "សូមសាកល្បងស្វែងរកដោយពាក្យផ្សេង ឬប្តូរស្ថានភាព"
                      : "ចាប់ផ្តើមបន្ថែមអ្នកផ្គត់ផ្គង់ដំបូងរបស់អ្នក"}
                  </p>
                  {hasFilter ? (
                    <button className="sup-btn ghost" onClick={clearFilters}>
                      <X size={16} />
                      <span>សម្អាតការច្រោះ</span>
                    </button>
                  ) : (
                    <button
                      className="sup-btn primary"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus size={17} strokeWidth={2.4} />
                      <span>បន្ថែមអ្នកផ្គត់ផ្គង់ថ្មី</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="sup-tablewrap">
                  <table className="sup-table">
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>#</th>
                        <th>ក្រុមហ៊ុន / អ្នកផ្គត់ផ្គង់</th>
                        <th>អ្នកទំនាក់ទំនង</th>
                        <th>ទូរស័ព្ទ &amp; អ៊ីមែល</th>
                        <th>គេហទំព័រ</th>
                        <th>អាសយដ្ឋាន</th>
                        <th style={{ textAlign: "center" }}>ស្ថានភាព</th>
                        <th style={{ textAlign: "center" }}>សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((sup, index) => {
                        const isActive = Number(sup.is_active ?? 1) === 1;
                        const title = sup.company || sup.name;
                        const initial = (title || "S")
                          .trim()
                          .charAt(0)
                          .toUpperCase();
                        const href = safeUrl(sup.website);

                        return (
                          <tr
                            className="sup-row"
                            style={{ "--i": index }}
                            key={sup.id || index}
                          >
                            <td className="sup-idx">{index + 1}</td>

                            {/* Company & Name */}
                            <td>
                              <div className="sup-co">
                                <button
                                  type="button"
                                  className="sup-avbtn"
                                  onClick={() => setViewingSupplier(sup)}
                                  aria-label={`មើល ${title}`}
                                >
                                  <span className="sup-av">{initial}</span>
                                </button>
                                <div>
                                  <button
                                    type="button"
                                    className="sup-name"
                                    onClick={() => setViewingSupplier(sup)}
                                  >
                                    {title}
                                  </button>
                                  <div className="sup-id">
                                    {sup.company && sup.name
                                      ? `${sup.name} • `
                                      : ""}
                                    ID: #{sup.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Contact Name */}
                            <td className="sup-contact">
                              {sup.contact_name || sup.name || "-"}
                            </td>

                            {/* Phone & Email */}
                            <td>
                              <div className="sup-line sup-phone">
                                <Phone size={13} />
                                <span>{sup.phone || "-"}</span>
                              </div>
                              {sup.email && (
                                <div
                                  className="sup-line sup-mail"
                                  title={sup.email}
                                >
                                  <Mail size={12} />
                                  <span>{sup.email}</span>
                                </div>
                              )}
                            </td>

                            {/* Website */}
                            <td>
                              {href ? (
                                <a
                                  className="sup-link"
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={href}
                                >
                                  <Globe size={13} />
                                  <span>{hostOf(href)}</span>
                                </a>
                              ) : (
                                <span className="sup-dash">-</span>
                              )}
                            </td>

                            {/* Address */}
                            <td>
                              {sup.address ? (
                                <div
                                  className="sup-line sup-addr"
                                  title={sup.address}
                                >
                                  <MapPin size={14} color="#5f8a82" />
                                  <span>{sup.address}</span>
                                </div>
                              ) : (
                                <span className="sup-dash">-</span>
                              )}
                            </td>

                            {/* Status */}
                            <td style={{ textAlign: "center" }}>
                              <span
                                className={`sup-badge ${isActive ? "on" : "off"}`}
                              >
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </td>

                            {/* 🟢 Actions (View, Edit, Delete) */}
                            <td style={{ textAlign: "center" }}>
                              <div className="sup-acts">
                                <button
                                  type="button"
                                  className="sup-act"
                                  onClick={() => setViewingSupplier(sup)}
                                  title="មើល"
                                  aria-label={`មើល ${title}`}
                                >
                                  <Eye size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="sup-act"
                                  onClick={() => setEditingSupplier(sup)}
                                  title="កែប្រែ"
                                  aria-label={`កែប្រែ ${title}`}
                                >
                                  <Pencil size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="sup-act danger"
                                  onClick={() => openDelete(sup)}
                                  title="លុប"
                                  aria-label={`លុប ${title}`}
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

        {/* 🟢 3. Modal បង្កើតអ្នកផ្គត់ផ្គង់ថ្មី (Create Supplier) */}
        <CreateSupplierModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={fetchSuppliers}
        />

        {/* 🟢 4. Modal មើលព័ត៌មានលម្អិតអ្នកផ្គត់ផ្គង់ (View Supplier) */}
        <ViewSupplierModal
          isOpen={Boolean(viewingSupplier)}
          supplier={viewingSupplier}
          onClose={() => setViewingSupplier(null)}
          onEdit={(s) => setEditingSupplier(s)}
          onDelete={openDelete}
        />

        {/* 🟢 5. Modal កែប្រែព័ត៌មានអ្នកផ្គត់ផ្គង់ (Update Supplier) */}
        <EditSupplierModal
          isOpen={Boolean(editingSupplier)}
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onSuccess={fetchSuppliers}
        />

        {/* 🟢 6. Modal បញ្ជាក់ការលុបអ្នកផ្គត់ផ្គង់ (Delete Confirmation Modal) */}
        {deletingSupplier && (
          <div
            className="sup-ovl"
            onClick={() => !isDeleting && setDeletingSupplier(null)}
          >
            <div
              className="sup-dlg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sup-dlg-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sup-dlgico">
                <AlertTriangle size={28} />
              </div>

              <h3 id="sup-dlg-title">បញ្ជាក់ការលុបអ្នកផ្គត់ផ្គង់</h3>
              <p>
                តើបងពិតជាចង់លុបអ្នកផ្គត់ផ្គង់{" "}
                <strong>
                  "{deletingSupplier.company || deletingSupplier.name}"
                </strong>{" "}
                នេះមែនទេ?
              </p>

              {deleteError && (
                <div className="sup-derr" role="alert">
                  {deleteError}
                </div>
              )}

              <div className="sup-dlgbtns">
                <button
                  type="button"
                  className="sup-btn ghost"
                  disabled={isDeleting}
                  onClick={() => setDeletingSupplier(null)}
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  className="sup-btn danger"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={17} className="sup-spin" />
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
