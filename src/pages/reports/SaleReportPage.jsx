// src/pages/reports/SaleReportPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../../components/Sidebar";
import Appbar from "../../components/Appbar";
import {
  Search,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Printer,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getSalesReports } from "../../services/reportService";
import ToastrContainer, { toastr } from "../../components/Toastr";
import { useTranslation } from "../../utils/translations";

const PAGE_SIZE = 10;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.sr { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  position: fixed; inset: 0; z-index: 1; overflow-x: hidden; overflow-y: auto; display: block; margin: 0; padding: 0; max-width: none; text-align: left;
  color: var(--ink); color-scheme: light; line-height: 1.6;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif;
  background: radial-gradient(760px 380px at 92% -6%, rgba(127,209,194,.24), transparent 70%), #f4f9f7; }
.sr *, .sr *::before, .sr *::after { box-sizing: border-box; }
.sr-main { min-height: 100%; display: flex; flex-direction: column; min-width: 0; transition: margin-left .26s cubic-bezier(.4,0,.2,1); }
.sr-body { padding: 28px 32px 44px; }

.sr-in { animation: sr-rise .6s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--d, 0) * 70ms); }
@keyframes sr-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* ---------- header ---------- */
.sr-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.sr-titlewrap { display: flex; align-items: center; gap: 14px; }
.sr-titleico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.sr .sr-title { margin: 0; font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.sr .sr-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.sr .sr-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; }

.sr-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px;
  border-radius: 13px; font-family: inherit; font-weight: 700; font-size: 14px; transition: transform .15s, box-shadow .25s, background .2s, border-color .2s; }
.sr-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.sr-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.sr-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.sr-btn.primary:hover::after { left: 130%; }
.sr-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.sr-btn.ghost { color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db; }
.sr-btn.ghost:hover { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.sr-btn:active { transform: scale(.98); }
.sr-btn:disabled { opacity: .7; cursor: not-allowed; }
.sr-spin { animation: sr-spin .8s linear infinite; }
@keyframes sr-spin { to { transform: rotate(360deg); } }

/* ---------- stat cards ---------- */
.sr-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 22px; }
.sr-stat { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .2s, box-shadow .2s; }
.sr-stat:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.sr-statico { width: 48px; height: 48px; border-radius: 15px; flex-shrink: 0; display: grid; place-items: center; }
.sr-statico.t1 { background: #dff1ea; color: #176f65; }
.sr-statico.t2 { background: #e0f0f7; color: #0f6d8f; }
.sr-statico.t3 { background: #e8f5d6; color: #4d7c0f; }
.sr-statlabel { font-size: 13px; color: var(--muted); font-weight: 500; }
.sr-statnum { font-size: 24px; line-height: 1.35; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }
.sr-statnum.money { color: var(--teal-d); }
.sr-statnum small { font-size: 13px; font-weight: 600; color: var(--muted); margin-left: 4px; }

/* ---------- panel: toolbar + table + pager ---------- */
.sr-panel { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); }
.sr-toolbar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.sr-search { position: relative; flex: 1 1 280px; max-width: 480px; display: flex; align-items: center; }
.sr-search > svg { position: absolute; left: 14px; color: #5f8a82; pointer-events: none; transition: color .2s; }
.sr-search:focus-within > svg { color: var(--teal); }
.sr-search input { width: 100%; height: 44px; padding: 0 40px 0 42px; font-size: 14px; font-family: inherit; color: var(--ink); background: #f6faf8;
  border: 1.5px solid #d3e4df; border-radius: 13px; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; color-scheme: light; }
.sr-search input::placeholder { color: #86a39d; }
.sr-search input:hover { border-color: #b9d3cc; }
.sr-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.sr-clear { all: unset; cursor: pointer; position: absolute; right: 8px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #5f8a82; transition: background .2s, color .2s; }
.sr-clear:hover { background: var(--mint); color: var(--teal-d); }
.sr-clear:focus-visible { outline: 2px solid var(--teal); }

.sr-tablewrap { overflow-x: auto; }
.sr-table { width: 100%; min-width: 1020px; table-layout: fixed; border-collapse: collapse; text-align: left; }
.sr-table th { padding: 11px 16px; background: #f3f9f7; color: var(--muted); font-size: 12.5px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; border-bottom: 1px solid var(--line); }
.sr-table td { padding: 9px 16px; font-size: 13.5px; border-bottom: 1px solid #eef4f2; vertical-align: middle; }
.sr-table tbody tr:last-child td { border-bottom: 0; }
.sr-row { animation: sr-fadein .4s ease both; animation-delay: calc(min(var(--i), 12) * 30ms); transition: background .15s; }
.sr-row:hover { background: #f6fbf9; }
@keyframes sr-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.sr-no { all: unset; cursor: pointer; display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;
  padding: 2px 10px; border-radius: 99px; background: var(--mint); color: var(--teal-d); font-weight: 700; font-size: 12.5px; transition: background .2s; }
.sr-no:hover { background: #cfeadf; }
.sr-no:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.sr-cust { min-width: 0; }
.sr-custname { font-weight: 700; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sr-custname.walk { color: var(--muted); font-weight: 500; }
.sr-custphone { font-size: 12px; color: var(--muted); }
.sr-type { display: inline-block; padding: 2px 10px; border-radius: 99px; background: #e0f0f7; color: #0f6d8f; font-size: 11.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; }
.sr-num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.sr-num.sub { color: var(--text); }
.sr-num.tot { font-weight: 800; color: var(--teal-d); }
.sr-status { display: inline-flex; align-items: center; gap: 6px; padding: 2px 11px; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: capitalize; white-space: nowrap; }
.sr-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.sr-status.ok { background: #e8f5d6; color: #4d7c0f; }
.sr-status.wait { background: #fdf1d6; color: #9a6a0a; }
.sr-status.bad { background: #fdeceb; color: #b9382d; }
.sr-status.neutral { background: #eef1f1; color: #5b6f6b; }
.sr-date { color: var(--muted); font-size: 12.5px; white-space: nowrap; }

.sr-acts { display: inline-flex; gap: 4px; }
.sr-act { all: unset; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 10px; color: var(--muted); transition: background .18s, color .18s, transform .15s; }
.sr-act:hover { background: var(--mint); color: var(--teal-d); transform: translateY(-1px); }
.sr-act:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }

/* ---------- pager ---------- */
.sr-pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 20px; border-top: 1px solid var(--line); background: #fcfefd; }
.sr-pinfo { font-size: 13px; color: var(--muted); font-variant-numeric: tabular-nums; }
.sr-pinfo b { color: var(--ink); font-weight: 700; }
.sr-pnav { display: flex; align-items: center; gap: 12px; }
.sr-pbtn { all: unset; cursor: pointer; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; color: var(--text); background: #fff;
  box-shadow: inset 0 0 0 1.5px #d3e4df; transition: background .2s, color .2s, box-shadow .2s, transform .15s; }
.sr-pbtn:hover:not(:disabled) { background: var(--mint); color: var(--teal-d); box-shadow: inset 0 0 0 1.5px #a9cfc5; transform: translateY(-1px); }
.sr-pbtn:active:not(:disabled) { transform: scale(.95); }
.sr-pbtn:disabled { opacity: .4; cursor: not-allowed; }
.sr-pbtn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.sr-ppage { min-width: 52px; text-align: center; font-size: 14px; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }

/* ---------- states ---------- */
.sr-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; animation: sr-fadein .3s ease both; }
.sr-error button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.sr-error button:hover { background: #fde8e6; }
.sr-skel-row { display: flex; align-items: center; gap: 24px; padding: 15px 20px; border-bottom: 1px solid #eef4f2; }
.sr-skel { height: 14px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: sr-shim 1.4s ease infinite; }
@keyframes sr-shim { from { background-position: 100% 0; } to { background-position: 0 0; } }
.sr-empty { padding: 60px 20px 64px; text-align: center; }
.sr-emptyico { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: sr-float 4s ease-in-out infinite alternate; }
@keyframes sr-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.sr .sr-emptytitle { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: var(--ink); }
.sr-emptytext { margin: 0 0 20px; color: var(--muted); font-size: 14px; }

/* ---------- invoice sheet (view + print) ---------- */
.sr-ovl { position: fixed; inset: 0; z-index: 2100; display: flex; justify-content: center; align-items: center; padding: 20px;
  background: rgba(15,55,51,.45); backdrop-filter: blur(4px); animation: sr-ovl .2s ease both; }
@keyframes sr-ovl { from { opacity: 0; } to { opacity: 1; } }
.sr-sheet { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 780px; max-height: 92vh; background: #fff; border-radius: 24px; color: var(--ink);
  box-shadow: 0 30px 70px -20px rgba(15,55,51,.5); animation: sr-pop .32s cubic-bezier(.2,1.2,.4,1) both; overflow: hidden; }
@keyframes sr-pop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
.sr-sheetbody { flex: 1; overflow-y: auto; padding: 30px 34px 10px; }
.sr-x { all: unset; cursor: pointer; position: absolute; top: 16px; right: 16px; z-index: 2; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%;
  background: #eef5f2; color: var(--muted); transition: background .2s, color .2s, transform .2s; }
.sr-x:hover { background: #fde8e6; color: #b42318; transform: rotate(90deg); }
.sr-x:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.sr-sheethead { text-align: center; padding-bottom: 18px; margin-bottom: 20px; border-bottom: 2px dashed #cfe0db; }
.sr-badge { display: inline-block; margin-bottom: 8px; padding: 4px 14px; border-radius: 99px; background: linear-gradient(135deg, #25998b, #176f65); color: #fff; font-size: 11.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.sr .sr-sheettitle { margin: 0; font-size: 22px; line-height: 1.55; font-weight: 800; color: var(--ink); }
.sr-sheetno { margin: 2px 0 0; font-size: 14px; color: var(--muted); }
.sr-sheetno b { color: var(--teal-d); }

.sr-info { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
.sr-infobox { padding: 14px 16px; border-radius: 16px; background: #f3f9f7; font-size: 13px; line-height: 1.7; }
.sr-infohead { margin: 0 0 6px; font-size: 12px; font-weight: 700; letter-spacing: .06em; color: var(--muted); text-transform: uppercase; }
.sr-infoname { font-size: 15.5px; font-weight: 800; color: var(--ink); }
.sr-infobox p { margin: 0; color: var(--text); }
.sr-infobox b { color: var(--ink); }
.sr-infotype { font-weight: 700; color: #0f6d8f; text-transform: uppercase; }

.sr .sr-sec { margin: 0 0 10px; font-size: 14.5px; font-weight: 700; color: var(--text); }
.sr-items { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-bottom: 20px; }
.sr-items th { padding: 9px 12px; text-align: left; background: #f3f9f7; color: var(--muted); font-size: 12px; font-weight: 700; }
.sr-items th:first-child { border-radius: 10px 0 0 10px; } .sr-items th:last-child { border-radius: 0 10px 10px 0; }
.sr-items td { padding: 10px 12px; border-bottom: 1px solid #eef4f2; }
.sr-items tbody tr { break-inside: avoid; }
.sr-items tbody tr:last-child td { border-bottom: 0; }
.sr-items .c { text-align: center; } .sr-items .r { text-align: right; font-variant-numeric: tabular-nums; }
.sr-items .pn { font-weight: 600; color: var(--ink); }
.sr-items .qty { font-weight: 800; color: #0f6d8f; }
.sr-items .sum { font-weight: 800; color: var(--ink); }
.sr-items .none { text-align: center; color: var(--muted); padding: 22px; }

.sr-totals { display: flex; justify-content: flex-end; margin-bottom: 22px; padding-top: 14px; border-top: 1px solid var(--line); break-inside: avoid; }
.sr-totalbox { width: 290px; font-size: 14px; }
.sr-trow { display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--muted); }
.sr-trow span:last-child { color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }
.sr-trow.disc span:last-child { color: #c0392b; }
.sr-trow.disc.zero span:last-child { color: var(--muted); }
.sr-trow.line { padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--line); }
.sr-grand { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 14px; background: var(--mint); font-size: 17px; font-weight: 800; color: var(--ink); }
.sr-grand b { color: var(--teal-d); font-size: 20px; font-variant-numeric: tabular-nums; }

.sr-sheetfoot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 34px 20px; border-top: 1px solid var(--line); background: #fff; }

@media (max-width: 720px) {
  .sr-body { padding: 20px 16px 36px; }
  .sr .sr-title small { display: block; margin: 0; }
  .sr-sheetbody { padding: 24px 18px 8px; }
  .sr-sheetfoot { padding: 12px 18px 16px; }
  .sr-info { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .sr *, .sr *::before, .sr *::after, .sr-ovl, .sr-sheet { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}

/* ---------- print: only the invoice, flowing over as many pages as needed ---------- */
@media print {
  @page { size: auto; margin: 10mm; }
  html, body { display: block !important; width: auto !important; min-width: 0 !important; height: auto !important; overflow: visible !important; }
  #root { display: block !important; width: auto !important; min-width: 0 !important; max-width: none !important; margin: 0 !important; padding: 0 !important; text-align: left !important; }
  .sr, .sr-ovl, .sr-sheet { width: 100% !important; }
  .sr-noprint { display: none !important; }
  .sr { position: static !important; overflow: visible !important; inset: auto !important; background: #fff !important; }
  .sr-ovl { position: static !important; display: block !important; padding: 0 !important; background: none !important; backdrop-filter: none !important; animation: none !important; }
  .sr-sheet { position: static !important; display: block !important; max-width: 100% !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; border-radius: 0 !important; animation: none !important; }
  .sr-sheetbody { overflow: visible !important; padding: 0 !important; }
  .sr-sheet, .sr-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; animation: none !important; }
  .sr-info { grid-template-columns: 1fr 1fr !important; }
  .sr-items { width: 100% !important; }
}
`;

const money = (val) =>
  Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (["completed", "paid", "done", "success"].includes(s)) return "ok";
  if (["pending", "processing", "preparing", "unpaid", "draft"].includes(s)) return "wait";
  if (["cancelled", "canceled", "void", "voided", "refunded", "failed"].includes(s)) return "bad";
  return "neutral";
}

export default function SaleReportPage() {
  const { lang, t } = useTranslation();
  const tsr = t.saleReports;

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  const [selectedSale, setSelectedSale] = useState(null);
  const [printPending, setPrintPending] = useState(false);

  const fmtDateTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleString(lang === "km" ? "km-KH" : "en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getSalesReports();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSales(list);
    } catch (err) {
      console.error("Error fetching sale reports:", err);
      const msg = err?.message || tsr.fetchError;
      setErrorMsg(msg);
      toastr.error(tsr.toastErrorTitle, msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!selectedSale) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedSale]);

  useEffect(() => {
    if (!selectedSale || !printPending) return undefined;
    const timer = setTimeout(() => {
      setPrintPending(false);
      window.print();
    }, 350);
    return () => clearTimeout(timer);
  }, [selectedSale, printPending]);

  const closeSheet = () => {
    setPrintPending(false);
    setSelectedSale(null);
  };
  const openView = (s) => {
    setPrintPending(false);
    setSelectedSale(s);
  };
  const openPrint = (s) => {
    setSelectedSale(s);
    setPrintPending(true);
  };

  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      const q = search.trim().toLowerCase();
      const customerName = item.customer?.name?.toLowerCase() || "";
      const customerPhone = item.customer?.phone?.toLowerCase() || "";
      const orderNumber = String(item.order_number || "").toLowerCase();
      return !q || customerName.includes(q) || customerPhone.includes(q) || orderNumber.includes(q);
    });
  }, [sales, search]);

  const stats = useMemo(() => {
    const totalOrders = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
    const average = totalOrders ? totalRevenue / totalOrders : 0;
    return { totalOrders, totalRevenue, average };
  }, [sales]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filteredSales.slice(start, start + PAGE_SIZE);

  const statCards = [
    { label: tsr.statTotalRevenue, value: `$${money(stats.totalRevenue)}`, icon: DollarSign, tone: "t1", money: true },
    { label: tsr.statTotalOrders, value: stats.totalOrders, unit: tsr.timesSuffix, icon: ShoppingBag, tone: "t2" },
    { label: tsr.statAverage, value: `$${money(stats.average)}`, icon: TrendingUp, tone: "t3" },
  ];

  const hasSearch = search.trim() !== "";
  const details = Array.isArray(selectedSale?.details) ? selectedSale.details : [];
  const discount = Number(selectedSale?.discount_amount || 0);

  return (
    <>
      <style>{css}</style>
      <ToastrContainer />
      <div className="sr">
        <div className="sr-noprint">
          <Sidebar onCollapseChange={(_, width) => setSidebarWidth(width)} />
        </div>

        <div className="sr-main sr-noprint" style={{ marginLeft: `${sidebarWidth}px` }}>
          <Appbar />

          <div className="sr-body">
            {/* Header */}
            <div className="sr-head sr-in" style={{ "--d": 0 }}>
              <div className="sr-titlewrap">
                <div className="sr-titleico">
                  <ShoppingBag size={26} strokeWidth={1.9} />
                </div>
                <div>
                  <h2 className="sr-title">
                    {tsr.heading}
                    {lang === "km" && <small>Sale Reports</small>}
                  </h2>
                  <p className="sr-sub">{tsr.subHeading}</p>
                </div>
              </div>

              <button className="sr-btn ghost" onClick={fetchSales} disabled={loading}>
                <RefreshCw size={16} className={loading ? "sr-spin" : ""} />
                <span>{tsr.refresh}</span>
              </button>
            </div>

            {/* Cards */}
            <div className="sr-stats">
              {statCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div className="sr-stat sr-in" style={{ "--d": i + 1 }} key={c.label}>
                    <div className={`sr-statico ${c.tone}`}>
                      <Icon size={24} strokeWidth={1.9} />
                    </div>
                    <div>
                      <div className="sr-statlabel">{c.label}</div>
                      <div className={`sr-statnum${c.money ? " money" : ""}`}>
                        {c.value}
                        {c.unit && <small>{c.unit}</small>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <div className="sr-error" role="alert">
                <span>{errorMsg}</span>
                <button type="button" onClick={fetchSales}>
                  {tsr.tryAgain}
                </button>
              </div>
            )}

            {/* Search + Table + Pager */}
            <div className="sr-panel sr-in" style={{ "--d": 4 }}>
              <div className="sr-toolbar">
                <div className="sr-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder={tsr.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label={tsr.searchPlaceholder}
                  />
                  {hasSearch && (
                    <button type="button" className="sr-clear" onClick={() => setSearch("")} aria-label={tsr.clearSearch}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div aria-busy="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div className="sr-skel-row" key={i}>
                      <div className="sr-skel" style={{ width: 120 }} />
                      <div className="sr-skel" style={{ width: "18%" }} />
                      <div className="sr-skel" style={{ width: "8%" }} />
                      <div className="sr-skel" style={{ width: "10%" }} />
                      <div className="sr-skel" style={{ width: "14%", marginLeft: "auto" }} />
                    </div>
                  ))}
                </div>
              ) : filteredSales.length === 0 ? (
                <div className="sr-empty">
                  <div className="sr-emptyico">
                    <ShoppingBag size={32} strokeWidth={1.7} />
                  </div>
                  <h3 className="sr-emptytitle">{hasSearch ? tsr.emptySearch : tsr.emptyNoData}</h3>
                  <p className="sr-emptytext">
                    {hasSearch ? tsr.emptySubSearch : tsr.emptySubNoData}
                  </p>
                  {hasSearch && (
                    <button className="sr-btn ghost" onClick={() => setSearch("")}>
                      <X size={16} />
                      <span>{tsr.clearSearch}</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="sr-tablewrap">
                    <table className="sr-table">
                      <colgroup>
                        <col style={{ width: 170 }} />
                        <col />
                        <col style={{ width: 110 }} />
                        <col style={{ width: 100 }} />
                        <col style={{ width: 110 }} />
                        <col style={{ width: 130 }} />
                        <col style={{ width: 190 }} />
                        <col style={{ width: 90 }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>{tsr.colInvoiceNo}</th>
                          <th>{tsr.colCustomer}</th>
                          <th>{tsr.colType}</th>
                          <th style={{ textAlign: "right" }}>{tsr.colSubtotal}</th>
                          <th style={{ textAlign: "right" }}>{tsr.colTotal}</th>
                          <th style={{ textAlign: "center" }}>{tsr.colStatus}</th>
                          <th>{tsr.colDate}</th>
                          <th style={{ textAlign: "center" }}>{tsr.colActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.map((s, idx) => {
                          const name = s.customer?.name;
                          const label = s.order_number || `#${s.id}`;
                          return (
                            <tr className="sr-row" style={{ "--i": idx }} key={s.id || start + idx}>
                              <td>
                                <button type="button" className="sr-no" onClick={() => openView(s)} title={label}>
                                  {label}
                                </button>
                              </td>
                              <td>
                                <div className="sr-cust">
                                  <div className={`sr-custname${name ? "" : " walk"}`}>{name || tsr.walkInCustomer}</div>
                                  {s.customer?.phone && <div className="sr-custphone">{s.customer.phone}</div>}
                                </div>
                              </td>
                              <td>
                                <span className="sr-type">{s.order_type || "Dine-in"}</span>
                              </td>
                              <td className="sr-num sub">${money(s.subtotal)}</td>
                              <td className="sr-num tot">${money(s.total_amount)}</td>
                              <td style={{ textAlign: "center" }}>
                                <span className={`sr-status ${statusTone(s.status)}`}>{s.status || "-"}</span>
                              </td>
                              <td className="sr-date">{fmtDateTime(s.created_at)}</td>
                              <td style={{ textAlign: "center" }}>
                                <div className="sr-acts">
                                  <button
                                    type="button"
                                    className="sr-act"
                                    onClick={() => openView(s)}
                                    title={tsr.viewTitle}
                                    aria-label={`${tsr.viewTitle} ${label}`}
                                  >
                                    <Eye size={17} />
                                  </button>
                                  <button
                                    type="button"
                                    className="sr-act"
                                    onClick={() => openPrint(s)}
                                    title={tsr.printTitle}
                                    aria-label={`${tsr.printTitle} ${label}`}
                                  >
                                    <Printer size={17} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pager */}
                  <div className="sr-pager">
                    <div className="sr-pinfo">
                      {tsr.showing} <b>{start + 1}–{start + pageItems.length}</b> {tsr.of} <b>{filteredSales.length}</b>
                    </div>
                    <div className="sr-pnav">
                      <button
                        type="button"
                        className="sr-pbtn"
                        onClick={() => setPage(safePage - 1)}
                        disabled={safePage <= 1}
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="sr-ppage" aria-live="polite">
                        {safePage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        className="sr-pbtn"
                        onClick={() => setPage(safePage + 1)}
                        disabled={safePage >= totalPages}
                        aria-label="Next page"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PRINT MODAL / INVOICE VIEW */}
        {selectedSale && (
          <div className="sr-ovl" onClick={closeSheet}>
            <div
              className="sr-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sr-sheet-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sr-x sr-noprint" onClick={closeSheet} aria-label={tsr.closeBtn}>
                <X size={18} />
              </button>

              <div className="sr-sheetbody">
                {/* Header */}
                <div className="sr-sheethead">
                  <span className="sr-badge">Sales Invoice</span>
                  <h2 className="sr-sheettitle" id="sr-sheet-title">
                    {tsr.modalTitle}
                  </h2>
                  <p className="sr-sheetno">
                    {tsr.modalInvoiceNo} <b>{selectedSale.order_number || `#${selectedSale.id}`}</b>
                  </p>
                </div>

                {/* Info Grid */}
                <div className="sr-info">
                  <div className="sr-infobox">
                    <h4 className="sr-infohead">{tsr.customerInfoTitle}</h4>
                    <p className="sr-infoname">{selectedSale.customer?.name || tsr.walkInCustomer}</p>
                    <p>
                      {tsr.phoneLabel} <b>{selectedSale.customer?.phone || "N/A"}</b>
                    </p>
                    <p>{tsr.addressLabel} {selectedSale.customer?.address || "N/A"}</p>
                  </div>

                  <div className="sr-infobox">
                    <h4 className="sr-infohead">{tsr.invoiceInfoTitle}</h4>
                    <p>
                      {tsr.dateLabel} <b>{fmtDateTime(selectedSale.created_at) || "-"}</b>
                    </p>
                    <p>
                      {tsr.typeLabel} <span className="sr-infotype">{selectedSale.order_type || "Dine-in"}</span>
                    </p>
                    <p>
                      {tsr.statusLabel}{" "}
                      <span className={`sr-status ${statusTone(selectedSale.status)}`}>{selectedSale.status || "-"}</span>
                    </p>
                  </div>
                </div>

                {/* Items */}
                <h4 className="sr-sec">{tsr.itemsListTitle}</h4>
                <table className="sr-items">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>{tsr.colNo}</th>
                      <th>{tsr.colProductName}</th>
                      <th className="c">{tsr.colQty}</th>
                      <th className="r">{tsr.colUnitPrice}</th>
                      <th className="r">{tsr.colItemTotal}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.length > 0 ? (
                      details.map((item, i) => (
                        <tr key={item.id ?? i}>
                          <td>{i + 1}</td>
                          <td className="pn">{item.product?.name || item.product_name || tsr.defaultProduct}</td>
                          <td className="c qty">{Number(item.quantity)}</td>
                          <td className="r">${money(item.unit_price)}</td>
                          <td className="r sum">
                            ${money(item.total_price ?? Number(item.quantity || 0) * Number(item.unit_price || 0))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="none">
                          {tsr.noDetails}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals Summary */}
                <div className="sr-totals">
                  <div className="sr-totalbox">
                    <div className="sr-trow">
                      <span>{tsr.subtotalLabel}</span>
                      <span>${money(selectedSale.subtotal)}</span>
                    </div>
                    <div className={`sr-trow disc${discount > 0 ? "" : " zero"}`}>
                      <span>{tsr.discountLabel}</span>
                      <span>-${money(discount)}</span>
                    </div>
                    <div className="sr-trow line">
                      <span>{tsr.taxLabel}</span>
                      <span>${money(selectedSale.tax_amount)}</span>
                    </div>
                    <div className="sr-grand">
                      <span>{tsr.grandTotalLabel}</span>
                      <b>${money(selectedSale.total_amount)}</b>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="sr-sheetfoot sr-noprint">
                <button className="sr-btn ghost" onClick={closeSheet}>
                  {tsr.closeBtn}
                </button>
                <button className="sr-btn primary" onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>{tsr.printInvoiceBtn}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}