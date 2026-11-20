// src/pages/reports/ProfitLossReportPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  RefreshCw,
  Printer,
  Download,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  RotateCcw,
  Package,
  Receipt,
  Award,
  ChevronDown,
  Percent,
} from "lucide-react";
import Layout from "../../components/Layout";
import { getFinancialReport } from "../../services/reportService";
import ToastrContainer, { toastr } from "../../components/Toastr";
import { useTranslation } from "../../utils/translations";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.pl, .pl-print { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; line-height: 1.6; color-scheme: light; }
.pl { padding: 28px 32px 44px; font-size: 14px; }
.pl *, .pl *::before, .pl *::after, .pl-print, .pl-print *, .pl-print *::before, .pl-print *::after { box-sizing: border-box; }
.pl h2, .pl h3 { margin: 0; font-family: inherit; }

/* ---------- header ---------- */
.pl-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; animation: pl-up .6s cubic-bezier(.2,.8,.2,1) both; }
.pl-brand { display: flex; align-items: center; gap: 14px; }
.pl-brand-ico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.pl .pl-title { font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.pl .pl-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.pl .pl-sub-t { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; max-width: 640px; }
.pl-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

.pl-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; height: 44px; padding: 0 18px; display: inline-flex; align-items: center; gap: 8px;
  border-radius: 13px; font-family: inherit; font-size: 14px; font-weight: 700; color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db;
  transition: transform .15s, box-shadow .25s, background .2s, color .2s; }
.pl-btn:hover:not(:disabled) { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.pl-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.pl-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.pl-btn.primary:hover:not(:disabled)::after { left: 130%; }
.pl-btn.primary:hover:not(:disabled) { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.pl-btn.blue { color: #fff; background: linear-gradient(135deg, #1f8aa8, #0f6d8f); box-shadow: 0 10px 20px -8px rgba(15,109,143,.5); }
.pl-btn.blue:hover:not(:disabled) { color: #fff; background: linear-gradient(135deg, #1f8aa8, #0f6d8f); transform: translateY(-1px); }
.pl-btn:active:not(:disabled) { transform: scale(.98); }
.pl-btn:disabled { opacity: .55; cursor: not-allowed; }
.pl button:focus-visible, .pl select:focus-visible, .pl input:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.pl-spin { animation: pl-rot .8s linear infinite; }

.pl-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; }
.pl-err button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.pl-err button:hover { background: #fde8e6; }
.pl-hint { margin-bottom: 16px; padding: 11px 16px; border-radius: 14px; background: #fdf1d6; color: #7a540a; font-size: 13.5px; }

/* ---------- tiles ---------- */
.pl-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
.pl-tile { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .22s, box-shadow .22s; animation: pl-up .6s cubic-bezier(.2,.8,.2,1) var(--d, 0ms) backwards; }
.pl-tile:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.pl-chip-i { width: 48px; height: 48px; border-radius: 15px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: rgba(255,255,255,.18); color: #fff; }
.t-green { background: #e8f5d6; color: #4d7c0f; }
.t-amber { background: #fdf1d6; color: #9a6a0a; }
.t-red { background: #fdeceb; color: #b9382d; }
.pl-tile span { display: block; font-size: 13px; font-weight: 500; color: var(--muted); line-height: 1.5; }
.pl-tile b { display: block; font-size: 24px; font-weight: 800; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.3; }
.pl-tile.hero { border-color: transparent; color: #fff; box-shadow: 0 18px 32px -18px rgba(11,70,63,.7);
  background: radial-gradient(240px 120px at 100% 0%, rgba(255,255,255,.2), transparent 65%), linear-gradient(150deg, #19917f 0%, #0e5a51 60%, #0b463f 100%); }
.pl-tile.hero span { color: rgba(255,255,255,.8); }

/* ---------- filters ---------- */
.pl-filters { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 16px 20px; margin-bottom: 20px; background: #fff;
  border: 1px solid var(--line); border-radius: 20px; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); animation: pl-up .6s cubic-bezier(.2,.8,.2,1) 150ms backwards; }
.pl-fgroup { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.pl-field { display: flex; flex-direction: column; gap: 4px; }
.pl-field label { display: flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 600; color: var(--muted); }
.pl-field label svg { color: var(--teal); }
.pl-input { height: 44px; min-width: 160px; padding: 0 14px; font: inherit; font-size: 14px; font-weight: 600; color: var(--ink); color-scheme: light; background-color: #f6faf8;
  border: 1.5px solid #d3e4df; border-radius: 13px; outline: none; transition: border-color .2s, box-shadow .2s, background-color .2s; }
.pl-input:hover { border-color: #b9d3cc; }
.pl-input:focus { background-color: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
select.pl-input { appearance: none; -webkit-appearance: none; padding-right: 38px; cursor: pointer; background-repeat: no-repeat; background-position: right 13px center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235f8a82' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }

/* ---------- card + table ---------- */
.pl-card { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); animation: pl-up .6s cubic-bezier(.2,.8,.2,1) 220ms backwards; }
.pl-card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.pl-card-head h3 { display: flex; align-items: center; gap: 8px; font-size: 15.5px; font-weight: 700; color: var(--ink); }
.pl-card-head h3 svg { color: var(--teal); }
.pl-period { font-size: 13px; font-weight: 700; color: var(--teal-d); background: var(--mint); padding: 3px 13px; border-radius: 99px; }
.pl-scroll { overflow: auto; max-height: 72vh; }
.pl-table { width: 100%; min-width: 1280px; border-collapse: separate; border-spacing: 0; font-size: 13px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.pl-table th { position: sticky; top: 0; z-index: 4; padding: 12px 14px; text-align: right; font-size: 12px; font-weight: 700; letter-spacing: .3px; color: #fff; background: #0e5a51; border-bottom: 2px solid #0b463f; }
.pl-table th.now { background: #1f8a7d; }
.pl-table th:first-child { left: 0; z-index: 6; text-align: left; min-width: 270px; border-right: 1px solid #0b463f; }
.pl-table th:last-child { right: 0; z-index: 6; min-width: 120px; background: #0b463f; border-left: 1px solid #14665c; }
.pl-table td { padding: 10px 14px; text-align: right; background: #fff; border-bottom: 1px solid #eef4f2; transition: background .12s; }
.pl-table td:first-child { position: sticky; left: 0; z-index: 2; text-align: left; font-weight: 600; color: var(--text); background: #fff; border-right: 1px solid #eef4f2; }
.pl-table td:last-child { position: sticky; right: 0; z-index: 2; background: #fff; border-left: 1px solid #eef4f2; }
.pl-table tbody tr:hover td { background: #f6fbf9; }
.pl-zero { color: #8fa9a4; } .pl-neg { color: #b9382d; font-weight: 700; } .pl-val { color: var(--ink); font-weight: 600; } .pl-exp { color: #b9382d; font-weight: 600; }
.pl-total { font-weight: 800; }
.blue { color: #176f65; } .red { color: #b9382d; } .green { color: #4d7c0f; } .deepblue { color: #176f65; }

.pl-section td { padding: 0 !important; background: #eef5f2 !important; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.pl-sec-btn { all: unset; box-sizing: border-box; cursor: pointer; width: 100%; display: flex; align-items: center; gap: 8px; padding: 11px 16px; font-size: 12.5px; font-weight: 800; letter-spacing: .3px; color: var(--text); position: sticky; left: 0; }
.pl-sec-btn svg { color: var(--teal); }
.pl-sec-btn > svg:first-child { transition: transform .2s; transform: rotate(-90deg); } .pl-sec-btn > svg.open { transform: none; }
.pl-sec-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: -2px; }
.pl-sec-static { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-weight: 800; color: var(--text); }
.pl-count { margin-left: 4px; padding: 1px 9px; border-radius: 99px; background: #fff; color: var(--muted); font-size: 11.5px; }
.pl-sub { display: flex; align-items: center; gap: 9px; padding-left: 14px; }
.pl-nodata { color: var(--muted); font-weight: 500; }
.pl-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; } .pl-dot.inc { background: #1f8a7d; } .pl-dot.cogs { background: #d9961b; } .pl-dot.exp { background: #d9564a; }
.pl-subtotal td { background: #f7fbfa !important; font-weight: 800; border-top: 1.5px solid var(--line); }
.pl-gross td { background: #f1f8e6 !important; font-weight: 800; border-top: 2px solid #d6eaa8; color: #3f6212; }
.pl-net td { background: #e4f3ee !important; font-weight: 800; font-size: 14px; border-top: 2px solid #b9ddd2; border-bottom: 2px solid #b9ddd2; }
.pl-margin td { background: #fbfdfc !important; font-size: 12.5px; color: var(--muted); }
.pl-netlabel { display: inline-flex; align-items: center; gap: 7px; }

.pl-loading { padding: 24px 20px; display: grid; gap: 14px; }
.pl-loading i { display: block; height: 16px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: pl-shine 1.4s ease infinite; }

@keyframes pl-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes pl-shine { from { background-position: 100% 0; } to { background-position: 0 0; } }
@keyframes pl-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .pl-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 720px) {
  .pl { padding: 20px 16px 36px; } .pl-tiles { grid-template-columns: 1fr; } .pl .pl-title small { display: block; margin: 0; }
  .pl-input { min-width: 140px; } .pl-scroll { max-height: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pl *, .pl *::before, .pl *::after { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}

/* ---------- print: a separate copy rendered on <body> (hidden on screen) ---------- */
.pl-print { display: none; }
@media print {
  @page { size: landscape; margin: 10mm; }
  html, body { display: block !important; width: auto !important; min-width: 0 !important; height: auto !important; overflow: visible !important; background: #fff !important; }
  body > *:not(.pl-print) { display: none !important; }
  .pl-print { display: block !important; width: 100%; padding: 0; font-size: 10px; }
  .pl-print *, .pl-print { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .pl-phead { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
  .pl-phead b { font-size: 16px; font-weight: 800; } .pl-phead span { font-size: 11px; color: #5b7873; }
  .pl-psum { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
  .pl-psum div { border: 1px solid #cfe0db; border-radius: 8px; padding: 6px 10px; } .pl-psum small { display: block; color: #5b7873; font-size: 9px; } .pl-psum b { font-size: 13px; }
  .pl-print .pl-table { min-width: 0; width: 100%; font-size: 9.5px; }
  .pl-print .pl-table th, .pl-print .pl-table td { position: static !important; padding: 5px 6px; min-width: 0 !important; }
  .pl-print .pl-table th:first-child, .pl-print .pl-table td:first-child { width: 190px; white-space: normal; }
  .pl-print .pl-table tr { break-inside: avoid; }
}
`;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
const num = (v) => Number(v) || 0;
const fmt = (n) =>
  Math.abs(num(n)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const money = (n) => `${num(n) < 0 ? "-" : ""}$${fmt(n)}`;

function Cell({ v, tone }) {
  if (!num(v)) return <td className="pl-zero">0.00</td>;
  if (num(v) < 0) return <td className="pl-neg">({fmt(v)})</td>;
  return <td className={tone}>{fmt(v)}</td>;
}

function useCountUp(target, decimals = 2, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setV(target);
      return undefined;
    }
    let raf;
    let start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Tile({ label, target, icon: Icon, tone, hero, delay, color }) {
  const shown = useCountUp(Math.abs(target));
  return (
    <div
      className={`pl-tile${hero ? " hero" : ""}`}
      style={{ "--d": `${delay}ms` }}
    >
      <div className={`pl-chip-i ${tone}`}>
        <Icon size={23} strokeWidth={1.9} />
      </div>
      <div>
        <span>{label}</span>
        <b style={!hero && color ? { color } : undefined}>
          {target < 0 ? "-" : ""}${shown}
        </b>
      </div>
    </div>
  );
}

const buildMatrix = (list, nameFn) => {
  const names = [];
  const map = {};
  list.forEach((d) => {
    const n = nameFn(d) || "Other";
    const m = Number(d.month);
    if (!map[n]) {
      map[n] = Array(12).fill(0);
      names.push(n);
    }
    if (m >= 1 && m <= 12) map[n][m - 1] += Number(d.total_amount || 0);
  });
  const totals = Array(12).fill(0);
  names.forEach((n) =>
    map[n].forEach((v, i) => {
      totals[i] += v;
    }),
  );
  return { names, map, totals };
};
const sum = (arr) => arr.reduce((s, v) => s + v, 0);

export default function ProfitLossReportPage() {
  const { lang, t } = useTranslation();
  const tpl = t.profitLossReports;

  const nowYear = new Date().getFullYear();
  const nowMonth = new Date().getMonth();
  const [year, setYear] = useState(nowYear);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState({ income: true, cogs: true, opex: true });
  const reqId = useRef(0);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const fetchData = async (override) => {
    const id = ++reqId.current;
    try {
      setLoading(true);
      setErrorMsg("");
      const s = override ? override.start : startDate;
      const e = override ? override.end : endDate;
      const params = { year };
      if (s && e) {
        params.start_date = s;
        params.end_date = e;
      }
      const res = await getFinancialReport(params);
      if (id !== reqId.current) return;
      setReportData(res?.data || res);
    } catch (err) {
      if (id !== reqId.current) return;
      console.error("Error loading P&L:", err);
      const msg = err?.message || tpl.fetchError;
      setErrorMsg(msg);
      toastr.error(tpl.toastErrorTitle, msg);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    if (year !== nowYear) setYear(nowYear);
    else fetchData({ start: "", end: "" });
  };

  const years = Array.from({ length: 6 }, (_, i) => nowYear - i);
  if (!years.includes(Number(year))) years.push(Number(year));

  const m = useMemo(() => {
    const inc = buildMatrix(
      reportData?.income_breakdown || [],
      (d) => d.category_name,
    );
    const cogs = buildMatrix(
      reportData?.expense_by_category || [],
      (d) => d.category_name,
    );
    const opex = buildMatrix(
      reportData?.expense_breakdown || [],
      (d) => d.expense_type?.name || d.expense_type_name,
    );
    const gross = inc.totals.map((v, i) => v - cogs.totals[i]);
    const net = gross.map((v, i) => v - opex.totals[i]);
    const margin = net.map((v, i) =>
      inc.totals[i] > 0 ? (v / inc.totals[i]) * 100 : 0,
    );
    const A = {
      sales: sum(inc.totals),
      cogs: sum(cogs.totals),
      opex: sum(opex.totals),
    };
    A.gross = A.sales - A.cogs;
    A.net = A.gross - A.opex;
    A.margin = A.sales > 0 ? (A.net / A.sales) * 100 : 0;
    return { inc, cogs, opex, gross, net, margin, A };
  }, [reportData]);

  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const A = m.A;
  const hasRange = Boolean(startDate && endDate);
  const empty =
    m.inc.names.length === 0 &&
    m.cogs.names.length === 0 &&
    m.opex.names.length === 0;

  const exportCsv = () => {
    const row = (label, arr, total) => [
      label,
      ...arr.map((v) => Number(v.toFixed(2))),
      Number(total.toFixed(2)),
    ];
    const lines = [["Category", ...MONTH_NAMES, "Total"]];
    lines.push(["REVENUE"]);
    m.inc.names.forEach((n) =>
      lines.push(row(n, m.inc.map[n], sum(m.inc.map[n]))),
    );
    lines.push(row("Total Sales", m.inc.totals, A.sales));
    lines.push(["COST OF GOODS SOLD"]);
    m.cogs.names.forEach((n) =>
      lines.push(row(n, m.cogs.map[n], sum(m.cogs.map[n]))),
    );
    lines.push(row("Total COGS", m.cogs.totals, A.cogs));
    lines.push(["OPERATING EXPENSES"]);
    m.opex.names.forEach((n) =>
      lines.push(row(n, m.opex.map[n], sum(m.opex.map[n]))),
    );
    lines.push(row("Total Operating Expenses", m.opex.totals, A.opex));
    lines.push(row("Gross Profit", m.gross, A.gross));
    lines.push(row("Net Profit", m.net, A.net));
    const cell = (x) => {
      let v = String(x ?? "");
      if (/^[=+\-@\t\r]/.test(v) && Number.isNaN(Number(v))) v = `'${v}`;
      return `"${v.replace(/"/g, '""')}"`;
    };
    const csv = "\uFEFF" + lines.map((r) => r.map(cell).join(",")).join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-loss-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periodText = `ឆ្នាំ ${year} ${hasRange ? ` (${startDate} ដល់ ${endDate})` : ""}`;

  const renderSection = (
    { id, title, icon: Icon, tone, matrix, cellTone, totalLabel, totalTone },
    printMode,
  ) => {
    const isOpen = printMode || open[id];
    return (
      <React.Fragment key={id}>
        <tr className="pl-section">
          <td colSpan={14}>
            {printMode ? (
              <div className="pl-sec-static">
                <Icon size={14} /> {title}
              </div>
            ) : (
              <button
                type="button"
                className="pl-sec-btn"
                onClick={() => toggle(id)}
                aria-expanded={open[id]}
              >
                <ChevronDown size={16} className={open[id] ? "open" : ""} />
                <Icon size={15} /> {title}
                <span className="pl-count">{matrix.names.length}</span>
              </button>
            )}
          </td>
        </tr>
        {isOpen && matrix.names.length === 0 && (
          <tr>
            <td>
              <div className="pl-sub">
                <span className={`pl-dot ${tone}`} />
                <span className="pl-nodata">{tpl.noDataText}</span>
              </div>
            </td>
            {Array.from({ length: 12 }, (_, i) => (
              <td key={i} className="pl-zero">
                0.00
              </td>
            ))}
            <td className="pl-total pl-zero">$0.00</td>
          </tr>
        )}
        {isOpen &&
          matrix.names.map((n) => (
            <tr key={`${id}-${n}`}>
              <td>
                <div className="pl-sub">
                  <span className={`pl-dot ${tone}`} />
                  {n}
                </div>
              </td>
              {matrix.map[n].map((v, i) => (
                <Cell key={i} v={v} tone={cellTone} />
              ))}
              <td className={`pl-total ${totalTone}`}>
                ${fmt(sum(matrix.map[n]))}
              </td>
            </tr>
          ))}
        <tr className="pl-subtotal">
          <td className={totalTone}>{totalLabel}</td>
          {matrix.totals.map((v, i) => (
            <Cell key={i} v={v} tone={totalTone} />
          ))}
          <td className={`pl-total ${totalTone}`}>
            ${fmt(sum(matrix.totals))}
          </td>
        </tr>
      </React.Fragment>
    );
  };

  const renderTable = (printMode) => (
    <table className="pl-table">
      <thead>
        <tr>
          <th>{tpl.colCategoryMonth}</th>
          {MONTH_NAMES.map((mn, i) => (
            <th
              key={mn}
              className={
                !printMode && Number(year) === nowYear && i === nowMonth
                  ? "now"
                  : ""
              }
            >
              {mn}
            </th>
          ))}
          <th>{tpl.colTotal}</th>
        </tr>
      </thead>
      <tbody>
        {renderSection(
          {
            id: "income",
            title: tpl.sectionIncome,
            icon: DollarSign,
            tone: "inc",
            matrix: m.inc,
            cellTone: "pl-val",
            totalLabel: tpl.totalIncomeLabel,
            totalTone: "blue",
          },
          printMode,
        )}
        {renderSection(
          {
            id: "cogs",
            title: tpl.sectionCogs,
            icon: Package,
            tone: "cogs",
            matrix: m.cogs,
            cellTone: "pl-exp",
            totalLabel: tpl.totalCogsLabel,
            totalTone: "red",
          },
          printMode,
        )}
        {renderSection(
          {
            id: "opex",
            title: tpl.sectionOpex,
            icon: Wallet,
            tone: "exp",
            matrix: m.opex,
            cellTone: "pl-exp",
            totalLabel: tpl.totalOpexLabel,
            totalTone: "red",
          },
          printMode,
        )}

        <tr className="pl-gross">
          <td>
            <span className="pl-netlabel">
              <TrendingUp size={15} /> {tpl.grossProfitLabel}
            </span>
          </td>
          {m.gross.map((v, i) => (
            <Cell key={i} v={v} tone="green" />
          ))}
          <td className={`pl-total ${A.gross >= 0 ? "green" : "pl-neg"}`}>
            {money(A.gross)}
          </td>
        </tr>
        <tr className="pl-net">
          <td>
            <span className="pl-netlabel">
              <Award size={16} /> {tpl.netProfitLabel}
            </span>
          </td>
          {m.net.map((v, i) => (
            <Cell key={i} v={v} tone="deepblue" />
          ))}
          <td className={`pl-total ${A.net >= 0 ? "deepblue" : "pl-neg"}`}>
            {money(A.net)}
          </td>
        </tr>
        <tr className="pl-margin">
          <td>
            <span className="pl-netlabel">
              <Percent size={14} /> {tpl.netMarginLabel}
            </span>
          </td>
          {m.margin.map((v, i) => (
            <td key={i} className={v === 0 ? "pl-zero" : v < 0 ? "pl-neg" : ""}>
              {v.toFixed(1)}%
            </td>
          ))}
          <td
            className={`pl-total ${A.margin === 0 ? "pl-zero" : A.margin < 0 ? "pl-neg" : ""}`}
          >
            {A.margin.toFixed(1)}%
          </td>
        </tr>
      </tbody>
    </table>
  );

  const printCopy = (
    <div className="pl-print">
      <div className="pl-phead">
        <b>Profit &amp; Loss</b>
        <span>{periodText}</span>
      </div>
      <div className="pl-psum">
        <div>
          <small>Revenue</small>
          <b>{money(A.sales)}</b>
        </div>
        <div>
          <small>COGS</small>
          <b>{money(A.cogs)}</b>
        </div>
        <div>
          <small>Operating Expenses</small>
          <b>{money(A.opex)}</b>
        </div>
        <div>
          <small>Net Profit</small>
          <b>{money(A.net)}</b>
        </div>
      </div>
      {renderTable(true)}
    </div>
  );

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="pl">
        <div className="pl-top">
          <div className="pl-brand">
            <div className="pl-brand-ico">
              <BarChart3 size={26} strokeWidth={1.9} />
            </div>
            <div>
              <h2 className="pl-title">
                {tpl.heading}
                {lang === "km" && <small>Profit &amp; Loss</small>}
              </h2>
              <p className="pl-sub-t">
                {tpl.subHeading}
              </p>
            </div>
          </div>
          <div className="pl-actions">
            <button className="pl-btn" onClick={exportCsv} disabled={loading}>
              <Download size={16} /> {tpl.exportCsv}
            </button>
            <button
              className="pl-btn"
              onClick={() => window.print()}
              disabled={loading}
            >
              <Printer size={16} /> {tpl.print}
            </button>
            <button
              className="pl-btn primary"
              onClick={() => fetchData()}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "pl-spin" : ""} />{" "}
              {tpl.refresh}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="pl-err" role="alert">
            <span>{errorMsg}</span>
            <button onClick={() => fetchData()}>{tpl.tryAgain}</button>
          </div>
        )}

        <div className="pl-tiles">
          <Tile
            label={tpl.tileRevenue}
            target={A.sales}
            icon={DollarSign}
            tone="t-dark"
            hero
            delay={0}
          />
          <Tile
            label={tpl.tileCogs}
            target={A.cogs}
            icon={Package}
            tone="t-amber"
            color="#9a6a0a"
            delay={60}
          />
          <Tile
            label={tpl.tileOpex}
            target={A.opex}
            icon={Wallet}
            tone="t-red"
            color="#b9382d"
            delay={120}
          />
          <Tile
            label={tpl.tileNetProfit}
            target={A.net}
            icon={A.net >= 0 ? TrendingUp : TrendingDown}
            tone={A.net >= 0 ? "t-green" : "t-red"}
            color={A.net >= 0 ? "#4d7c0f" : "#b9382d"}
            delay={180}
          />
        </div>

        <section className="pl-filters">
          <div className="pl-fgroup">
            <div className="pl-field">
              <label htmlFor="pl-start">
                <Calendar size={14} /> {tpl.startDateLabel}
              </label>
              <input
                id="pl-start"
                className="pl-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="pl-field">
              <label htmlFor="pl-end">
                <Calendar size={14} /> {tpl.endDateLabel}
              </label>
              <input
                id="pl-end"
                className="pl-input"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              className="pl-btn blue"
              onClick={() => fetchData()}
              disabled={!hasRange || loading}
              title={hasRange ? "" : "ជ្រើសរើសទាំងថ្ងៃចាប់ផ្តើម និងថ្ងៃបញ្ចប់"}
            >
              <Search size={16} /> {tpl.searchBtn}
            </button>
            {(startDate || endDate) && (
              <button className="pl-btn" onClick={handleResetFilter}>
                <RotateCcw size={15} /> {tpl.resetBtn}
              </button>
            )}
          </div>
          <div className="pl-field">
            <label htmlFor="pl-year">
              <Calendar size={14} /> {tpl.yearLabel}
            </label>
            <select
              id="pl-year"
              className="pl-input"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </section>

        {!loading && empty && !errorMsg && (
          <div className="pl-hint">
            {tpl.noDataHint(periodText)}
          </div>
        )}

        <section className="pl-card">
          <div className="pl-card-head">
            <h3>
              <Receipt size={19} /> {tpl.cardTitle}
            </h3>
            <span className="pl-period">{periodText}</span>
          </div>

          {loading ? (
            <div
              className="pl-loading"
              aria-busy="true"
              aria-label="កំពុងទាញយកទិន្នន័យ"
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <i key={i} style={{ width: `${95 - i * 6}%` }} />
              ))}
            </div>
          ) : (
            <div className="pl-scroll">{renderTable(false)}</div>
          )}
        </section>

        {/* ច្បាប់ចម្លងសម្រាប់បោះពុម្ព — render ទៅលើ <body> (លាក់ពេលមើលលើអេក្រង់) */}
        {createPortal(printCopy, document.body)}
      </div>
    </Layout>
  );
}