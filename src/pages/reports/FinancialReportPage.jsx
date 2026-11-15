// src/pages/reports/FinancialReportPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  PieChart,
  Percent,
  Wallet,
  BarChart3,
  Package,
  Calendar,
  Layers,
  Activity,
} from "lucide-react";
import Layout from "../../components/Layout";
import * as reportService from "../../services/reportService";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.fr { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  padding: 28px 32px 44px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 14px; line-height: 1.6; color-scheme: light; }
.fr *, .fr *::before, .fr *::after { box-sizing: border-box; }
.fr h2, .fr h3, .fr p { margin: 0; font-family: inherit; }

/* ---------- header ---------- */
.fr-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; animation: fr-up .6s cubic-bezier(.2,.8,.2,1) both; }
.fr-brand { display: flex; align-items: center; gap: 14px; }
.fr-brand-ico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.fr .fr-title { font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.fr .fr-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.fr .fr-sub { margin-top: 2px; color: var(--muted); font-size: 13.5px; line-height: 1.7; max-width: 640px; }

.fr-actions { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.fr-field label { display: block; margin-bottom: 4px; font-size: 12.5px; font-weight: 600; color: var(--muted); }
.fr-input { height: 44px; min-width: 130px; padding: 0 38px 0 14px; font: inherit; font-size: 14px; font-weight: 700; color: var(--ink); background-color: #fff;
  border: 1.5px solid #d3e4df; border-radius: 13px; outline: none; cursor: pointer; transition: border-color .2s, box-shadow .2s; color-scheme: light;
  appearance: none; -webkit-appearance: none; background-repeat: no-repeat; background-position: right 13px center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235f8a82' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
.fr-input:hover { border-color: #b9d3cc; }
.fr-input:focus { border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }

.fr-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; height: 44px; padding: 0 18px; display: inline-flex; align-items: center; gap: 8px;
  border-radius: 13px; font-family: inherit; font-size: 14px; font-weight: 700; transition: transform .15s, box-shadow .25s; }
.fr-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.fr-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.fr-btn.primary:hover:not(:disabled)::after { left: 130%; }
.fr-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.fr-btn:active:not(:disabled) { transform: scale(.98); }
.fr-btn:disabled { opacity: .7; cursor: not-allowed; }
.fr-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.fr-spin { animation: fr-rot .8s linear infinite; }
.fr-stamp { align-self: center; font-size: 12.5px; color: var(--muted); font-weight: 600; }

.fr-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; }
.fr-err button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.fr-err button:hover { background: #fde8e6; }

/* ---------- KPI tiles ---------- */
.fr-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
.fr-tile { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .22s, box-shadow .22s; animation: fr-up .6s cubic-bezier(.2,.8,.2,1) var(--d, 0ms) backwards; }
.fr-tile:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.fr-chip-i { width: 48px; height: 48px; border-radius: 15px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: rgba(255,255,255,.18); color: #fff; }
.t-green { background: #e8f5d6; color: #4d7c0f; }
.t-amber { background: #fdf1d6; color: #9a6a0a; }
.t-red { background: #fdeceb; color: #b9382d; }
.fr-tile span { display: block; font-size: 13px; font-weight: 500; color: var(--muted); line-height: 1.5; }
.fr-tile b { display: block; font-size: 24px; font-weight: 800; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.3; }
.fr-tile em { display: inline-block; margin-top: 4px; font-style: normal; font-size: 11.5px; font-weight: 700; padding: 2px 10px; border-radius: 99px; background: rgba(255,255,255,.2); color: #fff; }
.fr-tile.hero { border-color: transparent; color: #fff; box-shadow: 0 18px 32px -18px rgba(11,70,63,.7);
  background: radial-gradient(240px 120px at 100% 0%, rgba(255,255,255,.2), transparent 65%), linear-gradient(150deg, #19917f 0%, #0e5a51 60%, #0b463f 100%); }
.fr-tile.hero span { color: rgba(255,255,255,.8); }
.fr-tile.hero.loss { box-shadow: 0 18px 32px -18px rgba(120,30,22,.7);
  background: radial-gradient(240px 120px at 100% 0%, rgba(255,255,255,.18), transparent 65%), linear-gradient(150deg, #d9564a 0%, #b9382d 60%, #8f2a21 100%); }

/* ---------- layout ---------- */
.fr-grid-main { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr); gap: 16px; margin-bottom: 16px; }
.fr-grid-three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.fr-card { display: flex; flex-direction: column; background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 20px 22px;
  box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); animation: fr-up .6s cubic-bezier(.2,.8,.2,1) var(--d, 150ms) backwards; }
.fr-ctitle { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; font-size: 15px; font-weight: 700; color: var(--ink); }
.fr-ctitle-left { display: flex; align-items: center; gap: 8px; }
.fr-ctitle svg { color: var(--teal); }
.fr-badge { font-size: 12px; font-weight: 700; padding: 3px 11px; border-radius: 99px; background: var(--mint); color: var(--teal-d); }

/* 12-month grouped bars */
.fr-barchart-wrap { display: flex; flex-direction: column; justify-content: space-between; flex: 1; min-height: 250px; }
.fr-bars-stage { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 8px; align-items: end; height: 200px; padding: 16px 6px 0; border-bottom: 1.5px solid var(--line);
  background: repeating-linear-gradient(to bottom, transparent 0, transparent 39px, #eef4f2 39px, #eef4f2 40px); }
.fr-m-col { display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative; cursor: pointer; border-radius: 8px; transition: background .15s; }
.fr-m-col:hover { background: rgba(31,138,125,.07); }
.fr-m-col:hover .fr-m-tooltip, .fr-m-col:focus-visible .fr-m-tooltip { opacity: 1; transform: translateX(-50%) translateY(-4px); }
.fr-m-col:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.fr-m-tooltip { position: absolute; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%); background: #0f3733; color: #fff; padding: 9px 12px; border-radius: 11px;
  font-size: 11.5px; line-height: 1.6; white-space: nowrap; z-index: 10; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; box-shadow: 0 12px 24px rgba(15,55,51,.3); }
.fr-m-bars { display: flex; align-items: flex-end; justify-content: center; gap: 3px; width: 100%; height: 100%; }
.fr-bar { width: 30%; max-width: 12px; min-height: 3px; border-radius: 4px 4px 0 0; transform-origin: bottom; animation: fr-grow-y .9s cubic-bezier(.2,.7,.2,1) backwards; }
.fr-bar.inc { background: linear-gradient(180deg, #3bb5a4, #1f8a7d); }
.fr-bar.cogs { background: linear-gradient(180deg, #efbf5a, #d9961b); }
.fr-bar.exp { background: linear-gradient(180deg, #ee8a80, #d9564a); }
.fr-m-lbl { margin-top: 8px; font-size: 11.5px; font-weight: 700; color: var(--muted); }
.fr-note { margin-top: 10px; padding: 8px 12px; border-radius: 11px; background: #fdf1d6; color: #7a540a; font-size: 12.5px; }

.fr-legend { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 14px; font-size: 12.5px; }
.fr-legend span { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-weight: 600; }
.fr-legend i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.fr-legend b { color: var(--ink); font-variant-numeric: tabular-nums; }

/* gauge */
.fr-gwrap { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; justify-content: center; margin-bottom: 18px; }
.fr-gauge { position: relative; width: 145px; height: 145px; flex-shrink: 0; }
.fr-ring { animation: fr-ring 1.2s cubic-bezier(.2,.7,.2,1) 300ms backwards; }
.fr-gauge-t { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.fr-gauge-t b { font-size: 24px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.3; }
.fr-gauge-t span { font-size: 11.5px; color: var(--muted); font-weight: 600; }
.fr-notes { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; flex: 1; min-width: 150px; }
.fr-notes li { display: flex; flex-direction: column; padding-left: 12px; border-left: 3px solid #cfe0db; }
.fr-notes b { font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.fr-notes b.pos { color: #4d7c0f; } .fr-notes b.neg { color: #b9382d; }
.fr-notes span { font-size: 12px; color: var(--muted); }

.fr-split-box { margin-top: auto; padding-top: 14px; border-top: 1px solid var(--line); }
.fr-split-title { margin-bottom: 8px; font-size: 12.5px; font-weight: 700; color: var(--muted); }
.fr-stack { display: flex; gap: 3px; height: 14px; border-radius: 99px; overflow: hidden; background: #edf4f1; }
.fr-seg-bar { display: block; height: 100%; min-width: 6px; border-radius: 99px; transform-origin: left; animation: fr-fill 1s cubic-bezier(.2,.7,.2,1) 400ms backwards; }

/* donut + category bars */
.fr-donut-box { display: flex; align-items: center; justify-content: center; gap: 18px; margin-bottom: 16px; }
.fr-donut-svg { position: relative; width: 130px; height: 130px; flex-shrink: 0; }
.fr-donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.fr-donut-center b { font-size: 15px; font-weight: 800; color: var(--ink); }
.fr-donut-center span { font-size: 11px; color: var(--muted); font-weight: 600; }
.fr-cat-list { display: flex; flex-direction: column; gap: 13px; max-height: 260px; overflow-y: auto; padding-right: 4px; }
.fr-cat-item { display: flex; flex-direction: column; gap: 5px; }
.fr-cat-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 13px; }
.fr-cat-name { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text); min-width: 0; }
.fr-cat-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fr-cat-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.fr-cat-val { font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; white-space: nowrap; }
.fr-cat-val small { font-weight: 600; color: var(--muted); margin-left: 5px; font-size: 11.5px; }
.fr-track { height: 9px; border-radius: 99px; background: #edf4f1; overflow: hidden; }
.fr-fill { display: block; height: 100%; border-radius: 99px; transform-origin: left; animation: fr-fill .9s cubic-bezier(.2,.7,.2,1) 250ms backwards; }

.fr-empty { text-align: center; padding: 56px 20px; color: var(--muted); align-items: center; }
.fr-empty b { display: block; color: var(--ink); font-size: 17px; margin-bottom: 4px; }
.fr-emptyico { width: 72px; height: 72px; margin: 0 auto 14px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: fr-float 4s ease-in-out infinite alternate; }
@keyframes fr-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }

.fr-ghost { gap: 12px; flex-direction: column; align-items: stretch; justify-content: center; min-height: 110px; }
.fr-ghost i { display: block; height: 14px; border-radius: 8px; width: 65%; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: fr-shine 1.4s ease infinite; }

@keyframes fr-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes fr-fill { from { transform: scaleX(0); } }
@keyframes fr-grow-y { from { transform: scaleY(0); } }
@keyframes fr-ring { from { stroke-dasharray: 0 100; } }
@keyframes fr-shine { from { background-position: 100% 0; } to { background-position: 0 0; } }
@keyframes fr-rot { to { transform: rotate(360deg); } }

@media (max-width: 1150px) {
  .fr-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fr-grid-main, .fr-grid-three { grid-template-columns: 1fr; }
}
@media (max-width: 680px) {
  .fr { padding: 20px 16px 36px; }
  .fr-tiles { grid-template-columns: 1fr; }
  .fr .fr-title small { display: block; margin: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .fr *, .fr *::before, .fr *::after { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const PALETTE_INC = ["#1f8a7d", "#3bb5a4", "#0f6d8f", "#7fd1c2", "#4d9fc2", "#7fb82a", "#a6d94a"];
const PALETTE_COGS = ["#d9961b", "#e8b04a", "#c27a0e", "#f0c674", "#a86a0d", "#f6d99b"];
const PALETTE_EXP = ["#d9564a", "#e8837a", "#b9382d", "#f0a8a0", "#9a2b22", "#f5c6c1"];

const num = (v) => Number(v) || 0;
const money = (n) =>
  `$${Math.abs(num(n)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function useCountUp(target, decimals = 0, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
  return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function Tile({ label, target, icon: Icon, tone, hero, delay, hint, valueColor }) {
  const shown = useCountUp(Math.abs(target), 2);
  return (
    <div
      className={`fr-tile${hero ? " hero" : ""}${hero && target < 0 ? " loss" : ""}`}
      style={{ "--d": `${delay}ms` }}
    >
      <div className={`fr-chip-i ${tone}`}>
        <Icon size={23} strokeWidth={1.9} />
      </div>
      <div>
        <span>{label}</span>
        <b style={!hero && valueColor ? { color: valueColor } : undefined}>
          {target < 0 ? "-" : ""}${shown}
        </b>
        {hint && <em>{hint}</em>}
      </div>
    </div>
  );
}

function Gauge({ value, positive }) {
  const r = 52;
  const ring = Math.max(0, Math.min(Math.abs(value), 100));
  const shown = useCountUp(Math.abs(value), 1);
  const color = positive ? "#1f8a7d" : "#d9564a";
  return (
    <div className="fr-gauge">
      <svg viewBox="0 0 140 140" width="145" height="145" role="img" aria-label="Profit margin">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#edf4f1" strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${ring} 100`}
          transform="rotate(-90 70 70)"
          className="fr-ring"
        />
      </svg>
      <div className="fr-gauge-t">
        <b style={{ color }}>
          {value < 0 ? "-" : ""}
          {shown}%
        </b>
        <span>Net Margin</span>
      </div>
    </div>
  );
}

function DonutChart({ items, total, colors, centerLabel }) {
  const r = 46;
  let cumulative = 0;

  return (
    <div className="fr-donut-svg">
      <svg viewBox="0 0 120 120" width="130" height="130">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#edf4f1" strokeWidth="16" />
        {total > 0 &&
          items.map((item, idx) => {
            const pct = (item.amount / total) * 100;
            const dashArray = `${pct} ${100 - pct}`;
            const dashOffset = 100 - cumulative;
            cumulative += pct;
            return (
              <circle
                key={idx}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke={colors[idx % colors.length]}
                strokeWidth="16"
                pathLength="100"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 60 60)"
              />
            );
          })}
      </svg>
      <div className="fr-donut-center">
        <b>{money(total)}</b>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

function CategoryBreakdownSection({ items, total, colors, emptyText, centerLabel }) {
  if (!items || items.length === 0 || total <= 0) {
    return (
      <div className="fr-empty" style={{ padding: "30px 10px" }}>
        <span>{emptyText}</span>
      </div>
    );
  }

  return (
    <>
      <div className="fr-donut-box">
        <DonutChart items={items} total={total} colors={colors} centerLabel={centerLabel} />
      </div>
      <div className="fr-cat-list">
        {items.map((item, idx) => {
          const pct = total > 0 ? (item.amount / total) * 100 : 0;
          const color = colors[idx % colors.length];
          return (
            <div className="fr-cat-item" key={idx}>
              <div className="fr-cat-head">
                <span className="fr-cat-name">
                  <i className="fr-cat-dot" style={{ background: color }} />
                  <span title={item.name}>{item.name}</span>
                </span>
                <span className="fr-cat-val">
                  {money(item.amount)}
                  <small>({pct.toFixed(1)}%)</small>
                </span>
              </div>
              <div className="fr-track">
                <i className="fr-fill" style={{ width: `${Math.max(pct, 2)}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function FinancialReportPage() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const reqId = useRef(0);

  useEffect(() => {
    fetchFinancial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const fetchFinancial = async () => {
    const id = ++reqId.current; // ការពារ response ចាស់ជាន់លើ response ថ្មី
    try {
      setLoading(true);
      setErrorMsg("");
      const apiFn = reportService.getFinancialReport || reportService.getFinancialReports;
      const res = await apiFn({ year });
      if (id !== reqId.current) return;
      setReportData(res?.data || res);
      setUpdatedAt(new Date());
    } catch (err) {
      if (id !== reqId.current) return;
      console.error("Error fetching financial report:", err);
      setErrorMsg(err?.message || "បរាជ័យក្នុងការទាញយករបាយការណ៍ហិរញ្ញវត្ថុ");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  // ឆ្នាំ៖ ឆ្នាំបច្ចុប្បន្ន រហូតដល់ ៥ ឆ្នាំមុន (ហើយរួមបញ្ចូលឆ្នាំដែលបានជ្រើស)
  const years = Array.from({ length: 6 }, (_, i) => thisYear - i);
  if (!years.includes(Number(year))) years.push(Number(year));

  // 1. បូកសរុបទិន្នន័យពី Profit & Loss Breakdowns
  const incomeList = reportData?.income_breakdown || [];
  const cogsList = reportData?.expense_by_category || [];
  const expList = reportData?.expense_breakdown || [];

  // Aggregate by Category Name (សម្រាប់ Donut & Progress Charts)
  const groupByName = (arr, nameGetter) => {
    const map = {};
    arr.forEach((item) => {
      const name = nameGetter(item) || "Other";
      map[name] = (map[name] || 0) + num(item.total_amount);
    });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const incomeCategories = groupByName(incomeList, (d) => d.category_name);
  const cogsCategories = groupByName(cogsList, (d) => d.category_name);
  const operatingCategories = groupByName(expList, (d) => d.expense_type?.name || d.expense_type_name);

  // 2. គណនាទិន្នន័យប្រចាំខែ (Jan = 1 ... Dec = 12) សម្រាប់ក្រាហ្វិក 12 ខែ
  const monthlySeries = MONTH_NAMES.map((mName, idx) => {
    const mNum = idx + 1;
    const mInc = incomeList.filter((d) => num(d.month) === mNum).reduce((s, d) => s + num(d.total_amount), 0);
    const mCogs = cogsList.filter((d) => num(d.month) === mNum).reduce((s, d) => s + num(d.total_amount), 0);
    const mExp = expList.filter((d) => num(d.month) === mNum).reduce((s, d) => s + num(d.total_amount), 0);
    return { month: mName, income: mInc, cogs: mCogs, expense: mExp, net: mInc - mCogs - mExp };
  });

  // ប្រសិនបើទិន្នន័យមិនមាន month ដាក់សរុបចូលខែទី 1 ដើម្បីឱ្យក្រាហ្វិកបង្ហាញ
  const hasMonthlyTag =
    incomeList.some((d) => d.month) || cogsList.some((d) => d.month) || expList.some((d) => d.month);

  const revenue =
    num(reportData?.total_income ?? reportData?.revenue) || incomeCategories.reduce((s, d) => s + d.amount, 0);
  const cogs = num(reportData?.purchase_expenses) || cogsCategories.reduce((s, d) => s + d.amount, 0);
  const generalExp = num(reportData?.general_expenses) || operatingCategories.reduce((s, d) => s + d.amount, 0);
  const totalExpense = num(reportData?.total_expense ?? reportData?.expense) || cogs + generalExp;
  const netProfit = reportData?.net_profit !== undefined ? num(reportData.net_profit) : revenue - totalExpense;
  const grossProfit = revenue - cogs;

  const monthFallback = !hasMonthlyTag && (revenue > 0 || totalExpense > 0);
  if (monthFallback) {
    monthlySeries[0] = { month: "Jan", income: revenue, cogs, expense: generalExp, net: netProfit };
  }

  const maxMonthlyVal = Math.max(...monthlySeries.map((m) => Math.max(m.income, m.cogs, m.expense)), 1);

  const hasData = revenue > 0 || totalExpense > 0 || netProfit !== 0;
  const profitable = netProfit >= 0;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  // ភាគរយសម្រាប់ Revenue Split Bar
  const totalOutflowAndProfit = Math.max(revenue, totalExpense, 1);
  const cogsPct = Math.min((cogs / totalOutflowAndProfit) * 100, 100);
  const genExpPct = Math.min((generalExp / totalOutflowAndProfit) * 100, 100);
  const profitPct = netProfit > 0 ? Math.min((netProfit / totalOutflowAndProfit) * 100, 100) : 0;

  return (
    <Layout>
      <style>{css}</style>
      <div className="fr">
        {/* Top Header & Year Filter */}
        <div className="fr-top">
          <div className="fr-brand">
            <div className="fr-brand-ico">
              <BarChart3 size={26} strokeWidth={1.9} />
            </div>
            <div>
              <h2 className="fr-title">
                របាយការណ៍ហិរញ្ញវត្ថុ<small>Financial Analytics</small>
              </h2>
              <p className="fr-sub">ក្រាហ្វិកវិភាគចំណូល ថ្លៃដើមទំនិញ ចំណាយប្រតិបត្តិការ និងប្រាក់ចំណេញពី Profit &amp; Loss</p>
            </div>
          </div>

          <div className="fr-actions">
            {updatedAt && !loading && (
              <span className="fr-stamp">
                Updated {updatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <div className="fr-field">
              <label htmlFor="fr-year">ឆ្នាំ</label>
              <select id="fr-year" className="fr-input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button className="fr-btn primary" onClick={fetchFinancial} disabled={loading}>
              <RefreshCw size={16} className={loading ? "fr-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="fr-err" role="alert">
            <span>{errorMsg}</span>
            <button onClick={fetchFinancial}>ព្យាយាមម្តងទៀត</button>
          </div>
        )}

        {loading ? (
          <>
            <div className="fr-tiles">
              {[0, 1, 2, 3].map((i) => (
                <div className="fr-tile fr-ghost" key={i}>
                  <i />
                  <i />
                </div>
              ))}
            </div>
            <div className="fr-grid-main">
              <div className="fr-card fr-ghost" style={{ height: 300 }}>
                <i />
                <i />
                <i />
              </div>
              <div className="fr-card fr-ghost" style={{ height: 300 }}>
                <i />
                <i />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 1. 4 Executive KPI Cards */}
            <div className="fr-tiles">
              <Tile label="ចំណូលសរុប (Total Revenue)" target={revenue} icon={TrendingUp} tone="t-green" valueColor="#4d7c0f" delay={0} />
              <Tile label="ថ្លៃដើមទិញស្តុក (Total COGS)" target={cogs} icon={Package} tone="t-amber" valueColor="#9a6a0a" delay={60} />
              <Tile label="ចំណាយប្រតិបត្តិការ (Operating Exp)" target={generalExp} icon={TrendingDown} tone="t-red" valueColor="#b9382d" delay={120} />
              <Tile
                label="ប្រាក់ចំណេញសុទ្ធ (Net Profit)"
                target={netProfit}
                icon={DollarSign}
                tone="t-dark"
                hero
                delay={180}
                hint={hasData ? (profitable ? "ចំណេញ (Profitable)" : "ខាតបង់ (Net Loss)") : undefined}
              />
            </div>

            {!hasData ? (
              <div className="fr-card fr-empty">
                <div className="fr-emptyico">
                  <Wallet size={32} strokeWidth={1.7} />
                </div>
                <b>មិនទាន់មានទិន្នន័យហិរញ្ញវត្ថុសម្រាប់ឆ្នាំ {year} ទេ</b>
                ក្រាហ្វិកចំណូល និងចំណាយនឹងបង្ហាញនៅទីនេះ នៅពេលមានប្រតិបត្តិការលក់ និងទិញចូលស្តុក
              </div>
            ) : (
              <>
                {/* 2. Main Charts Row: 12-Month Bar Chart + Profit Margin Gauge */}
                <div className="fr-grid-main">
                  <section className="fr-card" style={{ "--d": "200ms" }}>
                    <div className="fr-ctitle">
                      <span className="fr-ctitle-left">
                        <Activity size={18} /> ចំណូល ទល់នឹង ចំណាយប្រចាំខែ (Jan - Dec {year})
                      </span>
                      <span className="fr-badge">Monthly P&amp;L Trend</span>
                    </div>

                    <div className="fr-barchart-wrap">
                      <div className="fr-bars-stage">
                        {monthlySeries.map((m, i) => {
                          const incH = Math.max((m.income / maxMonthlyVal) * 100, m.income > 0 ? 4 : 1);
                          const cogsH = Math.max((m.cogs / maxMonthlyVal) * 100, m.cogs > 0 ? 4 : 1);
                          const expH = Math.max((m.expense / maxMonthlyVal) * 100, m.expense > 0 ? 4 : 1);

                          return (
                            <div className="fr-m-col" key={m.month} tabIndex={0}>
                              <div className="fr-m-tooltip" role="tooltip">
                                <strong>
                                  {m.month} {year}
                                </strong>
                                <div style={{ color: "#7fd1c2" }}>• ចំណូល: {money(m.income)}</div>
                                <div style={{ color: "#f0c674" }}>• ទិញស្តុក (COGS): {money(m.cogs)}</div>
                                <div style={{ color: "#f0a8a0" }}>• ចំណាយទូទៅ: {money(m.expense)}</div>
                                <div
                                  style={{
                                    borderTop: "1px solid #2f5a55",
                                    marginTop: 4,
                                    paddingTop: 3,
                                    color: m.net >= 0 ? "#bfe86a" : "#ffb4a6",
                                    fontWeight: 700,
                                  }}
                                >
                                  Net: {m.net >= 0 ? "+" : "-"}
                                  {money(m.net)}
                                </div>
                              </div>
                              <div className="fr-m-bars">
                                <span className="fr-bar inc" style={{ height: `${incH}%`, animationDelay: `${i * 35}ms` }} />
                                <span className="fr-bar cogs" style={{ height: `${cogsH}%`, animationDelay: `${i * 35 + 60}ms` }} />
                                <span className="fr-bar exp" style={{ height: `${expH}%`, animationDelay: `${i * 35 + 120}ms` }} />
                              </div>
                              <span className="fr-m-lbl">{m.month}</span>
                            </div>
                          );
                        })}
                      </div>

                      {monthFallback && (
                        <div className="fr-note">
                          ទិន្នន័យពី API មិនមានព័ត៌មានខែ ដូច្នេះចំនួនសរុបទាំងឆ្នាំត្រូវបង្ហាញក្នុងខែ Jan តែមួយ។
                        </div>
                      )}

                      <div className="fr-legend">
                        <span>
                          <i style={{ background: "#1f8a7d" }} /> ចំណូលលក់: <b>{money(revenue)}</b>
                        </span>
                        <span>
                          <i style={{ background: "#d9961b" }} /> ថ្លៃដើមទិញស្តុក (COGS): <b>{money(cogs)}</b>
                        </span>
                        <span>
                          <i style={{ background: "#d9564a" }} /> ចំណាយទូទៅ: <b>{money(generalExp)}</b>
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Profit Margin Gauge & Revenue Split */}
                  <section className="fr-card" style={{ "--d": "260ms" }}>
                    <div className="fr-ctitle">
                      <span className="fr-ctitle-left">
                        <Percent size={18} /> អត្រាប្រាក់ចំណេញ និងសមាមាត្រ
                      </span>
                    </div>

                    <div className="fr-gwrap">
                      <Gauge value={netMargin} positive={profitable} />
                      <ul className="fr-notes">
                        <li>
                          <b className={grossProfit >= 0 ? "pos" : "neg"}>
                            {grossProfit >= 0 ? "+" : "-"}
                            {money(grossProfit)} ({grossMargin.toFixed(1)}%)
                          </b>
                          <span>ប្រាក់ចំណេញដុល (Gross Profit)</span>
                        </li>
                        <li>
                          <b className={profitable ? "pos" : "neg"}>
                            {profitable ? "+" : "-"}
                            {money(netProfit)}
                          </b>
                          <span>{profitable ? "ប្រាក់ចំណេញសុទ្ធ (Net Profit)" : "ការខាតបង់សុទ្ធ (Net Loss)"}</span>
                        </li>
                        <li>
                          <b>{money(totalExpense)}</b>
                          <span>ចំណាយសរុបរួម (COGS + Operating)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="fr-split-box">
                      <div className="fr-split-title">សមាមាត្រធៀបរវាងថ្លៃដើម ចំណាយ និងប្រាក់ចំណេញ</div>
                      <div className="fr-stack" role="img" aria-label="P&L Split">
                        {cogsPct > 0 && (
                          <i className="fr-seg-bar" style={{ width: `${cogsPct}%`, background: "#d9961b" }} title={`COGS: ${cogsPct.toFixed(1)}%`} />
                        )}
                        {genExpPct > 0 && (
                          <i className="fr-seg-bar" style={{ width: `${genExpPct}%`, background: "#d9564a" }} title={`Operating Expense: ${genExpPct.toFixed(1)}%`} />
                        )}
                        {profitPct > 0 && (
                          <i className="fr-seg-bar" style={{ width: `${profitPct}%`, background: "#6ba51f" }} title={`Net Profit: ${profitPct.toFixed(1)}%`} />
                        )}
                      </div>
                      <div className="fr-legend" style={{ marginTop: 10 }}>
                        <span>
                          <i style={{ background: "#d9961b" }} /> COGS <b>{cogsPct.toFixed(0)}%</b>
                        </span>
                        <span>
                          <i style={{ background: "#d9564a" }} /> ចំណាយទូទៅ <b>{genExpPct.toFixed(0)}%</b>
                        </span>
                        <span>
                          <i style={{ background: "#6ba51f" }} /> ចំណេញ <b>{profitPct.toFixed(0)}%</b>
                        </span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* 3. Three Category Breakdown Charts pulled from P&L */}
                <div className="fr-grid-three">
                  <section className="fr-card" style={{ "--d": "320ms" }}>
                    <div className="fr-ctitle">
                      <span className="fr-ctitle-left">
                        <PieChart size={18} /> ចំណូលតាមប្រភេទទំនិញ
                      </span>
                      <span className="fr-badge">{incomeCategories.length} ប្រភេទ</span>
                    </div>
                    <CategoryBreakdownSection
                      items={incomeCategories}
                      total={revenue}
                      colors={PALETTE_INC}
                      centerLabel="Total Sales"
                      emptyText="មិនមានទិន្នន័យចំណូលតាមប្រភេទទេ"
                    />
                  </section>

                  <section className="fr-card" style={{ "--d": "380ms" }}>
                    <div className="fr-ctitle">
                      <span className="fr-ctitle-left">
                        <Layers size={18} /> ថ្លៃដើមទិញស្តុកតាមប្រភេទ (COGS)
                      </span>
                      <span className="fr-badge">{cogsCategories.length} ប្រភេទ</span>
                    </div>
                    <CategoryBreakdownSection
                      items={cogsCategories}
                      total={cogs}
                      colors={PALETTE_COGS}
                      centerLabel="Total COGS"
                      emptyText="មិនមានទិន្នន័យទិញស្តុកទេ"
                    />
                  </section>

                  <section className="fr-card" style={{ "--d": "440ms" }}>
                    <div className="fr-ctitle">
                      <span className="fr-ctitle-left">
                        <Wallet size={18} /> ចំណាយប្រតិបត្តិការទូទៅ
                      </span>
                      <span className="fr-badge">{operatingCategories.length} ប្រភេទ</span>
                    </div>
                    <CategoryBreakdownSection
                      items={operatingCategories}
                      total={generalExp}
                      colors={PALETTE_EXP}
                      centerLabel="Operating Exp"
                      emptyText="មិនមានទិន្នន័យចំណាយទូទៅទេ"
                    />
                  </section>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}