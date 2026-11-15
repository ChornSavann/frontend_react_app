// src/pages/reports/CustomerReportPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../../components/Sidebar";
import Appbar from "../../components/Appbar";
import { CustomerReports } from "../../services/reportService";
import {
  Search,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Printer,
  Eye,
  X,
  Phone,
  MapPin,
  Receipt,
  FileText,
} from "lucide-react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.cr { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  position: fixed; inset: 0; z-index: 1; overflow-x: hidden; overflow-y: auto; display: block; margin: 0; padding: 0; max-width: none; text-align: left;
  color: var(--ink); color-scheme: light; line-height: 1.6;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif;
  background: radial-gradient(760px 380px at 92% -6%, rgba(127,209,194,.24), transparent 70%), #f4f9f7; }
.cr *, .cr *::before, .cr *::after { box-sizing: border-box; }
.cr-main { min-height: 100%; display: flex; flex-direction: column; min-width: 0; transition: margin-left .26s cubic-bezier(.4,0,.2,1); }
.cr-body { padding: 28px 32px 44px; }

.cr-in { animation: cr-rise .6s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--d, 0) * 70ms); }
@keyframes cr-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* ---------- header ---------- */
.cr-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.cr-titlewrap { display: flex; align-items: center; gap: 14px; }
.cr-titleico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.cr .cr-title { margin: 0; font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.cr .cr-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.cr .cr-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; }

.cr-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px;
  border-radius: 13px; font-family: inherit; font-weight: 700; font-size: 14px; transition: transform .15s, box-shadow .25s, background .2s, border-color .2s; }
.cr-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.cr-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.cr-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.cr-btn.primary:hover::after { left: 130%; }
.cr-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.cr-btn.ghost { color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db; }
.cr-btn.ghost:hover { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.cr-btn:active { transform: scale(.98); }
.cr-btn:disabled { opacity: .7; cursor: not-allowed; }
.cr-spin { animation: cr-spin .8s linear infinite; }
@keyframes cr-spin { to { transform: rotate(360deg); } }

/* ---------- stat cards ---------- */
.cr-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 22px; }
.cr-stat { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .2s, box-shadow .2s; }
.cr-stat:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.cr-statico { width: 48px; height: 48px; border-radius: 15px; flex-shrink: 0; display: grid; place-items: center; }
.cr-statico.t1 { background: #dff1ea; color: #176f65; }
.cr-statico.t2 { background: #e8f5d6; color: #4d7c0f; }
.cr-statico.t3 { background: #e0f0f7; color: #0f6d8f; }
.cr-statlabel { font-size: 13px; color: var(--muted); font-weight: 500; }
.cr-statnum { font-size: 24px; line-height: 1.35; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }
.cr-statnum.money { color: var(--teal-d); }
.cr-statnum small { font-size: 13px; font-weight: 600; color: var(--muted); margin-left: 4px; }

/* ---------- panel: toolbar + table ---------- */
.cr-panel { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); }
.cr-toolbar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.cr-search { position: relative; flex: 1 1 280px; max-width: 480px; display: flex; align-items: center; }
.cr-search > svg { position: absolute; left: 14px; color: #5f8a82; pointer-events: none; transition: color .2s; }
.cr-search:focus-within > svg { color: var(--teal); }
.cr-search input { width: 100%; height: 44px; padding: 0 40px 0 42px; font-size: 14px; font-family: inherit; color: var(--ink); background: #f6faf8;
  border: 1.5px solid #d3e4df; border-radius: 13px; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; color-scheme: light; }
.cr-search input::placeholder { color: #86a39d; }
.cr-search input:hover { border-color: #b9d3cc; }
.cr-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.cr-clear { all: unset; cursor: pointer; position: absolute; right: 8px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #5f8a82; transition: background .2s, color .2s; }
.cr-clear:hover { background: var(--mint); color: var(--teal-d); }
.cr-clear:focus-visible { outline: 2px solid var(--teal); }
.cr-count { margin-left: auto; font-size: 13px; color: var(--muted); }
.cr-count b { color: var(--ink); font-weight: 700; }

.cr-tablewrap { overflow-x: auto; }
.cr-table { width: 100%; min-width: 820px; table-layout: fixed; border-collapse: collapse; text-align: left; }
.cr-table th { padding: 11px 16px; background: #f3f9f7; color: var(--muted); font-size: 12.5px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; border-bottom: 1px solid var(--line); }
.cr-table td { padding: 9px 16px; font-size: 13.5px; border-bottom: 1px solid #eef4f2; vertical-align: middle; }
.cr-table tbody tr:last-child td { border-bottom: 0; }
.cr-row { animation: cr-fadein .4s ease both; animation-delay: calc(min(var(--i), 12) * 30ms); transition: background .15s; }
.cr-row:hover { background: #f6fbf9; }
@keyframes cr-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.cr-id { display: inline-block; padding: 2px 10px; border-radius: 99px; background: var(--mint); color: var(--teal-d); font-weight: 700; font-size: 12.5px; font-variant-numeric: tabular-nums; }
.cr-cust { display: flex; align-items: center; gap: 10px; min-width: 0; }
.cr-cav { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; font-size: 13px; font-weight: 800; color: #fff; background: linear-gradient(145deg, #3bb5a4, #1a7d70); }
.cr-name { all: unset; cursor: pointer; display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; font-size: 14px; color: var(--ink); transition: color .15s; }
.cr-name:hover { color: var(--teal-d); text-decoration: underline; text-underline-offset: 3px; }
.cr-name:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; border-radius: 4px; }
.cr-phone { display: inline-flex; align-items: center; gap: 7px; color: var(--text); font-size: 13px; white-space: nowrap; }
.cr-phone svg { color: #5f8a82; }
.cr-dash { color: #9bb3ae; }
.cr-orders { display: inline-block; padding: 2px 10px; border-radius: 99px; background: #e0f0f7; color: #0f6d8f; font-weight: 700; font-size: 12px; white-space: nowrap; }
.cr-spent { text-align: right; }
.cr-spent b { display: block; font-weight: 800; color: var(--teal-d); font-variant-numeric: tabular-nums; }
.cr-bar { height: 4px; margin: 4px 0 0 auto; width: 100%; max-width: 100px; border-radius: 99px; background: #e8f1ee; overflow: hidden; }
.cr-bar i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #3bb5a4, #1a7d70); transition: width .6s cubic-bezier(.2,.8,.2,1); }

.cr-acts { display: inline-flex; gap: 4px; }
.cr-act { all: unset; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 11px; color: var(--muted); transition: background .18s, color .18s, transform .15s; }
.cr-act:hover { background: var(--mint); color: var(--teal-d); transform: translateY(-1px); }
.cr-act:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }

/* ---------- states ---------- */
.cr-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; animation: cr-fadein .3s ease both; }
.cr-error button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.cr-error button:hover { background: #fde8e6; }
.cr-skel-row { display: flex; align-items: center; gap: 24px; padding: 16px 20px; border-bottom: 1px solid #eef4f2; }
.cr-skel { height: 14px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: cr-shim 1.4s ease infinite; }
@keyframes cr-shim { from { background-position: 100% 0; } to { background-position: 0 0; } }
.cr-empty { padding: 60px 20px 64px; text-align: center; }
.cr-emptyico { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: cr-float 4s ease-in-out infinite alternate; }
@keyframes cr-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.cr .cr-emptytitle { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: var(--ink); }
.cr-emptytext { margin: 0 0 20px; color: var(--muted); font-size: 14px; }

/* ---------- report sheet (view + print) ---------- */
.cr-ovl { position: fixed; inset: 0; z-index: 2100; display: flex; justify-content: center; align-items: center; padding: 20px;
  background: rgba(15,55,51,.45); backdrop-filter: blur(4px); animation: cr-ovl .2s ease both; }
@keyframes cr-ovl { from { opacity: 0; } to { opacity: 1; } }
.cr-sheet { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 820px; max-height: 92vh; background: #fff; border-radius: 24px; color: var(--ink);
  box-shadow: 0 30px 70px -20px rgba(15,55,51,.5); animation: cr-pop .32s cubic-bezier(.2,1.2,.4,1) both; overflow: hidden; }
@keyframes cr-pop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
.cr-sheetbody { flex: 1; overflow-y: auto; padding: 30px 34px 10px; }
.cr-x { all: unset; cursor: pointer; position: absolute; top: 16px; right: 16px; z-index: 2; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%;
  background: #eef5f2; color: var(--muted); transition: background .2s, color .2s, transform .2s; }
.cr-x:hover { background: #fde8e6; color: #b42318; transform: rotate(90deg); }
.cr-x:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.cr-sheethead { text-align: center; padding-bottom: 18px; margin-bottom: 18px; border-bottom: 2px dashed #cfe0db; }
.cr-badge { display: inline-block; margin-bottom: 8px; padding: 4px 14px; border-radius: 99px; background: linear-gradient(135deg, #25998b, #176f65); color: #fff; font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.cr .cr-sheettitle { margin: 0; font-size: 21px; line-height: 1.55; font-weight: 800; color: var(--ink); }
.cr-sheetsub { margin: 2px 0 0; font-size: 13px; color: var(--muted); }

.cr-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-bottom: 22px; }
.cr-infoitem { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 14px; background: #f3f9f7; }
.cr-infoico { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: grid; place-items: center; background: #fff; color: var(--teal-d); box-shadow: inset 0 0 0 1px var(--line); }
.cr-infolabel { font-size: 12px; color: var(--muted); }
.cr-infoval { font-size: 14px; font-weight: 700; color: var(--ink); word-break: break-word; }
.cr-infoval.money { color: var(--teal-d); }

.cr .cr-sec { margin: 0 0 12px; font-size: 14.5px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
.cr-order { margin-bottom: 14px; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; break-inside: avoid; animation: cr-fadein .4s ease both; animation-delay: calc(min(var(--i), 8) * 40ms); }
.cr-orderhead { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; padding: 11px 16px; background: #f3f9f7; border-bottom: 1px solid var(--line); font-size: 13.5px; }
.cr-orderno { font-weight: 800; color: var(--ink); }
.cr-orderdate { color: var(--muted); font-size: 12.5px; margin-left: 8px; }
.cr-ordertotal { color: var(--muted); }
.cr-ordertotal b { color: var(--teal-d); font-weight: 800; font-size: 15px; font-variant-numeric: tabular-nums; }
.cr-items { width: 100%; border-collapse: collapse; font-size: 13px; }
.cr-items th { padding: 8px 14px; text-align: left; color: var(--muted); font-size: 12px; font-weight: 700; border-bottom: 1px solid #eef4f2; }
.cr-items td { padding: 9px 14px; border-bottom: 1px solid #f2f7f5; }
.cr-items tbody tr:last-child td { border-bottom: 0; }
.cr-items .c { text-align: center; } .cr-items .r { text-align: right; font-variant-numeric: tabular-nums; }
.cr-items .pn { font-weight: 600; color: var(--ink); }
.cr-items .qty { font-weight: 800; color: #0f6d8f; }
.cr-items .sum { font-weight: 800; color: var(--ink); }
.cr-items .none { text-align: center; color: var(--muted); padding: 14px; }
.cr-noorders { text-align: center; color: var(--muted); padding: 24px 0; }

.cr-sheetfoot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 34px 20px; border-top: 1px solid var(--line); background: #fff; }

@media (max-width: 720px) {
  .cr-body { padding: 20px 16px 36px; }
  .cr .cr-title small { display: block; margin: 0; }
  .cr-count { margin-left: 0; }
  .cr-sheetbody { padding: 24px 18px 8px; }
  .cr-sheetfoot { padding: 12px 18px 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .cr *, .cr *::before, .cr *::after, .cr-ovl, .cr-sheet { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}

/* ---------- print: only the report sheet, flowing over as many pages as needed ---------- */
@media print {
  @page { size: auto; margin: 10mm; }
  /* បិទ layout លំនាំដើមរបស់ Vite (body flex, #root max-width/padding/center) ដែលធ្វើឲ្យសន្លឹកធំជាងទំព័រ */
  html, body { display: block !important; width: auto !important; min-width: 0 !important; height: auto !important; overflow: visible !important; }
  #root { display: block !important; width: auto !important; min-width: 0 !important; max-width: none !important; margin: 0 !important; padding: 0 !important; text-align: left !important; }
  .cr, .cr-ovl, .cr-sheet { width: 100% !important; }
  .cr-info { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .cr-order, .cr-items { width: 100% !important; max-width: 100% !important; }
  .cr-noprint { display: none !important; }
  .cr { position: static !important; overflow: visible !important; inset: auto !important; background: #fff !important; }
  .cr-ovl { position: static !important; display: block !important; padding: 0 !important; background: none !important; backdrop-filter: none !important; animation: none !important; }
  .cr-sheet { position: static !important; display: block !important; max-width: 100% !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; border-radius: 0 !important; animation: none !important; }
  .cr-sheetbody { overflow: visible !important; padding: 0 !important; }
  .cr-sheet *, .cr-sheet { -webkit-print-color-adjust: exact; print-color-adjust: exact; animation: none !important; }
}
`;

const money = (val) =>
  Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("km-KH");
};

export default function CustomerReportPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [printPending, setPrintPending] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await CustomerReports();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCustomers(list);
    } catch (err) {
      console.error("Error fetching customer reports:", err);
      setErrorMsg(err?.message || "បរាជ័យក្នុងការទាញយករបាយការណ៍អតិថិជន");
    } finally {
      setLoading(false);
    }
  };

  // បិទ Modal ដោយចុច Esc
  useEffect(() => {
    if (!selectedCustomer) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCustomer]);

  // បើកបោះពុម្ពបន្ទាប់ពី Modal បង្ហាញរួច
  useEffect(() => {
    if (!selectedCustomer || !printPending) return undefined;
    const t = setTimeout(() => {
      setPrintPending(false);
      window.print();
    }, 350);
    return () => clearTimeout(t);
  }, [selectedCustomer, printPending]);

  const closeSheet = () => {
    setPrintPending(false);
    setSelectedCustomer(null);
  };

  const openView = (c) => {
    setPrintPending(false);
    setSelectedCustomer(c);
  };

  const openPrint = (c) => {
    setSelectedCustomer(c);
    setPrintPending(true);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.trim().toLowerCase();
      const name = c.name?.toLowerCase() || "";
      const phone = c.phone?.toLowerCase() || "";
      const email = c.email?.toLowerCase() || "";
      return !q || name.includes(q) || phone.includes(q) || email.includes(q);
    });
  }, [customers, search]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const grandTotalSpent = customers.reduce((sum, c) => sum + Number(c.total_spent || 0), 0);
    const maxSpent = customers.reduce((m, c) => Math.max(m, Number(c.total_spent || 0)), 0);
    const average = totalCustomers ? grandTotalSpent / totalCustomers : 0;
    return { totalCustomers, grandTotalSpent, maxSpent, average };
  }, [customers]);

  const statCards = [
    { label: "អតិថិជនសរុប", value: stats.totalCustomers, unit: "នាក់", icon: Users, tone: "t1" },
    { label: "ចំណូលសរុបពីអតិថិជន", value: `$${money(stats.grandTotalSpent)}`, icon: DollarSign, tone: "t2", money: true },
    { label: "មធ្យមក្នុងមួយអតិថិជន", value: `$${money(stats.average)}`, icon: TrendingUp, tone: "t3" },
  ];

  const hasSearch = search.trim() !== "";
  const orders = Array.isArray(selectedCustomer?.orders) ? selectedCustomer.orders : [];

  return (
    <>
      <style>{css}</style>
      <div className="cr">
        <div className="cr-noprint">
          <Sidebar onCollapseChange={(_, width) => setSidebarWidth(width)} />
        </div>

        <div className="cr-main cr-noprint" style={{ marginLeft: `${sidebarWidth}px` }}>
          <Appbar />

          <div className="cr-body">
            {/* Header */}
            <div className="cr-head cr-in" style={{ "--d": 0 }}>
              <div className="cr-titlewrap">
                <div className="cr-titleico">
                  <Users size={26} strokeWidth={1.9} />
                </div>
                <div>
                  <h2 className="cr-title">
                    របាយការណ៍អតិថិជន<small>Customer Reports</small>
                  </h2>
                  <p className="cr-sub">ស្ថិតិការទិញ និងប្រវត្តិវិក្កយបត្ររបស់អតិថិជនម្នាក់ៗ</p>
                </div>
              </div>

              <button className="cr-btn ghost" onClick={fetchCustomers} disabled={loading}>
                <RefreshCw size={16} className={loading ? "cr-spin" : ""} />
                <span>ផ្ទុកឡើងវិញ</span>
              </button>
            </div>

            {/* Cards */}
            <div className="cr-stats">
              {statCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div className="cr-stat cr-in" style={{ "--d": i + 1 }} key={c.label}>
                    <div className={`cr-statico ${c.tone}`}>
                      <Icon size={24} strokeWidth={1.9} />
                    </div>
                    <div>
                      <div className="cr-statlabel">{c.label}</div>
                      <div className={`cr-statnum${c.money ? " money" : ""}`}>
                        {c.value}
                        {c.unit && <small>{c.unit}</small>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <div className="cr-error" role="alert">
                <span>{errorMsg}</span>
                <button type="button" onClick={fetchCustomers}>
                  ព្យាយាមម្តងទៀត
                </button>
              </div>
            )}

            {/* Search + Table */}
            <div className="cr-panel cr-in" style={{ "--d": 4 }}>
              <div className="cr-toolbar">
                <div className="cr-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder="ស្វែងរកតាមឈ្មោះ, លេខទូរស័ព្ទ ឬអ៊ីមែល..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="ស្វែងរកអតិថិជន"
                  />
                  {hasSearch && (
                    <button type="button" className="cr-clear" onClick={() => setSearch("")} aria-label="លុបការស្វែងរក">
                      <X size={16} />
                    </button>
                  )}
                </div>
                {!loading && (
                  <div className="cr-count">
                    បង្ហាញ <b>{filteredCustomers.length}</b> / {customers.length} នាក់
                  </div>
                )}
              </div>

              {loading ? (
                <div aria-busy="true" aria-label="កំពុងទាញយកទិន្នន័យ">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div className="cr-skel-row" key={i}>
                      <div className="cr-skel" style={{ width: 50 }} />
                      <div className="cr-skel" style={{ width: 40, height: 40, borderRadius: "50%" }} />
                      <div className="cr-skel" style={{ width: "18%" }} />
                      <div className="cr-skel" style={{ width: "12%" }} />
                      <div className="cr-skel" style={{ width: "12%", marginLeft: "auto" }} />
                    </div>
                  ))}
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="cr-empty">
                  <div className="cr-emptyico">
                    <Users size={32} strokeWidth={1.7} />
                  </div>
                  <h3 className="cr-emptytitle">
                    {hasSearch ? "រកមិនឃើញអតិថិជនទេ" : "មិនមានទិន្នន័យអតិថិជនទេ"}
                  </h3>
                  <p className="cr-emptytext">
                    {hasSearch ? "សូមសាកល្បងស្វែងរកដោយពាក្យផ្សេង" : "នៅពេលមានអតិថិជនទិញទំនិញ ទិន្នន័យនឹងបង្ហាញនៅទីនេះ"}
                  </p>
                  {hasSearch && (
                    <button className="cr-btn ghost" onClick={() => setSearch("")}>
                      <X size={16} />
                      <span>លុបការស្វែងរក</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="cr-tablewrap">
                  <table className="cr-table">
                    <colgroup>
                      <col style={{ width: 84 }} />
                      <col />
                      <col style={{ width: 170 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 160 }} />
                      <col style={{ width: 96 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}># ID</th>
                        <th>ឈ្មោះអតិថិជន</th>
                        <th>លេខទូរស័ព្ទ</th>
                        <th style={{ textAlign: "center" }}>ចំនួនវិក្កយបត្រ</th>
                        <th style={{ textAlign: "right" }}>ទឹកប្រាក់ទិញសរុប</th>
                        <th style={{ textAlign: "center" }}>សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((c, idx) => {
                        const spent = Number(c.total_spent || 0);
                        const pct = stats.maxSpent > 0 ? Math.max(4, (spent / stats.maxSpent) * 100) : 0;
                        return (
                          <tr className="cr-row" style={{ "--i": idx }} key={c.id || idx}>
                            <td>
                              <span className="cr-id">#{c.id}</span>
                            </td>
                            <td>
                              <div className="cr-cust">
                                <span className="cr-cav">{(c.name || "?").trim().charAt(0).toUpperCase()}</span>
                                <button type="button" className="cr-name" onClick={() => openView(c)}>
                                  {c.name}
                                </button>
                              </div>
                            </td>
                            <td>
                              {c.phone ? (
                                <span className="cr-phone">
                                  <Phone size={13} />
                                  {c.phone}
                                </span>
                              ) : (
                                <span className="cr-dash">-</span>
                              )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <span className="cr-orders">{c.orders_count ?? c.orders?.length ?? 0} ដង</span>
                            </td>
                            <td className="cr-spent">
                              <b>${money(spent)}</b>
                              <div className="cr-bar" aria-hidden="true">
                                <i style={{ width: `${pct}%` }} />
                              </div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="cr-acts">
                                <button
                                  type="button"
                                  className="cr-act"
                                  onClick={() => openView(c)}
                                  title="មើល"
                                  aria-label={`មើលរបាយការណ៍ ${c.name}`}
                                >
                                  <Eye size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="cr-act"
                                  onClick={() => openPrint(c)}
                                  title="បោះពុម្ព"
                                  aria-label={`បោះពុម្ពរបាយការណ៍ ${c.name}`}
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
              )}
            </div>
          </div>
        </div>

        {/* REPORT SHEET — CUSTOMER INVOICE & PRODUCTS HISTORY (view + print) */}
        {selectedCustomer && (
          <div className="cr-ovl" onClick={closeSheet}>
            <div
              className="cr-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cr-sheet-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="cr-x cr-noprint" onClick={closeSheet} aria-label="បិទ">
                <X size={18} />
              </button>

              <div className="cr-sheetbody">
                {/* Header */}
                <div className="cr-sheethead">
                  <span className="cr-badge">Customer Report &amp; Products Bought</span>
                  <h2 className="cr-sheettitle" id="cr-sheet-title">
                    របាយការណ៍ទិញទំនិញរបស់អតិថិជន៖ {selectedCustomer.name}
                  </h2>
                  <p className="cr-sheetsub">បោះពុម្ពនៅថ្ងៃ {new Date().toLocaleDateString("km-KH")}</p>
                </div>

                {/* Customer Info */}
                <div className="cr-info">
                  <div className="cr-infoitem">
                    <span className="cr-infoico"><Phone size={16} /></span>
                    <div>
                      <div className="cr-infolabel">ទូរស័ព្ទ</div>
                      <div className="cr-infoval">{selectedCustomer.phone || "N/A"}</div>
                    </div>
                  </div>
                  <div className="cr-infoitem">
                    <span className="cr-infoico"><MapPin size={16} /></span>
                    <div>
                      <div className="cr-infolabel">អាសយដ្ឋាន</div>
                      <div className="cr-infoval">{selectedCustomer.address || "N/A"}</div>
                    </div>
                  </div>
                  <div className="cr-infoitem">
                    <span className="cr-infoico"><Receipt size={16} /></span>
                    <div>
                      <div className="cr-infolabel">ចំនួនវិក្កយបត្រសរុប</div>
                      <div className="cr-infoval">{orders.length} ដង</div>
                    </div>
                  </div>
                  <div className="cr-infoitem">
                    <span className="cr-infoico"><DollarSign size={16} /></span>
                    <div>
                      <div className="cr-infolabel">ទឹកប្រាក់សរុប</div>
                      <div className="cr-infoval money">${money(selectedCustomer.total_spent)}</div>
                    </div>
                  </div>
                </div>

                {/* Orders & Products Breakdown */}
                <h4 className="cr-sec">
                  <FileText size={16} />
                  ប្រវត្តិវិក្កយបត្រ និងទំនិញដែលបានទិញ
                </h4>

                {orders.length > 0 ? (
                  orders.map((ord, i) => (
                    <div className="cr-order" style={{ "--i": i }} key={ord.id ?? i}>
                      <div className="cr-orderhead">
                        <div>
                          <span className="cr-orderno">វិក្កយបត្រ៖ {ord.order_number || `#${ord.id}`}</span>
                          {fmtDateTime(ord.created_at) && (
                            <span className="cr-orderdate">{fmtDateTime(ord.created_at)}</span>
                          )}
                        </div>
                        <div className="cr-ordertotal">
                          សរុប៖ <b>${money(ord.total || ord.total_amount)}</b>
                        </div>
                      </div>

                      <table className="cr-items">
                        <thead>
                          <tr>
                            <th style={{ width: 44 }}>ល.រ</th>
                            <th>ឈ្មោះទំនិញ</th>
                            <th className="c">ចំនួន</th>
                            <th className="r">តម្លៃឯកតា</th>
                            <th className="r">សរុប</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(ord.details) && ord.details.length > 0 ? (
                            ord.details.map((detail, dIdx) => (
                              <tr key={detail.id ?? dIdx}>
                                <td>{dIdx + 1}</td>
                                <td className="pn">{detail.product?.name || detail.product_name || "ទំនិញ"}</td>
                                <td className="c qty">{detail.quantity}</td>
                                <td className="r">${money(detail.unit_price || detail.price || detail.unit_cost)}</td>
                                <td className="r sum">
                                  ${money(detail.total_price || detail.quantity * (detail.unit_price || detail.price || 0))}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="none">
                                (គ្មានព័ត៌មានលម្អិតទំនិញ)
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))
                ) : (
                  <p className="cr-noorders">(អតិថិជននេះមិនទាន់មានប្រវត្តិទិញទំនិញទេ)</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="cr-sheetfoot cr-noprint">
                <button className="cr-btn ghost" onClick={closeSheet}>
                  បិទ
                </button>
                <button className="cr-btn primary" onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>បោះពុម្ព</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}