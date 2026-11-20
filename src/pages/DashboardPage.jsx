// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Crown,
  UserPlus,
  Package,
  History,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";
import Layout from "../components/Layout";
import { getDashboardAnalytics } from "../services/dashboardService";
import ToastrContainer, { toastr } from "../components/Toastr";
import { useTranslation } from "../utils/translations";

const money = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: Number(n) % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;

const shortMoney = (n) => {
  const num = Number(n || 0);
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}k`;
  return `$${num.toFixed(0)}`;
};

const smooth = (pts) =>
  pts
    .map((p, i) => {
      if (i === 0) return `M${p[0]},${p[1]}`;
      const q = pts[i - 1];
      const cx = (q[0] + p[0]) / 2;
      return `C${cx},${q[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
    })
    .join(" ");

function useCountUp(target, decimals = 0, duration = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const cleanTarget = Number(target || 0);
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setV(cleanTarget);
      return undefined;
    }
    let raf;
    let start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      setV(cleanTarget * (1 - Math.pow(1 - p, 3)));
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

function Sparkline({ data = [], color }) {
  const safeData = data.length >= 2 ? data : [0, 0, 0, 0, 0, 0, 0, 0];
  const W = 72;
  const H = 26;
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const pts = safeData.map((v, i) => [
    (i * (W - 4)) / (safeData.length - 1) + 2,
    H - 3 - ((v - min) / (max - min || 1)) * (H - 6),
  ]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="db-spark" aria-hidden="true">
      <path
        d={smooth(pts)}
        fill="none"
        stroke={color}
        strokeWidth="2.1"
        strokeLinecap="round"
        pathLength="1"
        className="db-draw"
      />
    </svg>
  );
}

function Kpi({ k, index, td }) {
  const Icon = k.icon;
  const up = k.change >= 0;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  const shown = useCountUp(k.target, k.decimals);
  const hero = k.tone === "dark";

  return (
    <div
      className={`db-card c3 db-kpi${hero ? " hero" : ""}`}
      style={{ "--d": `${index * 60}ms` }}
    >
      {/* ជួរលើ៖ Icon + Label នៅឆ្វេង, Delta Pill នៅស្តាំ */}
      <div className="db-kpi-top">
        <div className="db-kpi-head">
          <div className={`db-chip tone-${k.tone}`}>
            <Icon size={16} strokeWidth={2.1} />
          </div>
          <span className="db-kpi-label">{k.label}</span>
        </div>
        <div
          className={`db-delta-pill ${up ? "up" : "down"}`}
          title={td.vsLastMonth}
        >
          <Arrow size={12} strokeWidth={2.5} />
          <span>{Math.abs(k.change)}%</span>
        </div>
      </div>

      {/* ជួរក្រោម៖ តួលេខនៅឆ្វេង, Sparkline នៅស្តាំ */}
      <div className="db-kpi-bot">
        <div className="db-kpi-valwrap">
          <b className="db-kpi-val">
            {k.prefix}
            {shown}
          </b>
          <em className="db-kpi-sub">{td.vsLastMonth}</em>
        </div>
        <Sparkline
          data={k.spark}
          color={hero ? "#c8f169" : up ? "#1f8a7d" : "#e15b4f"}
        />
      </div>
    </div>
  );
}

function TrendChart({ range, trendLabels = [], trendValues = [] }) {
  const labels = range === 6 ? trendLabels.slice(-6) : trendLabels;
  const values = range === 6 ? trendValues.slice(-6) : trendValues;
  const safeValues = values.length > 1 ? values : [0, 0, 0, 0, 0, 0];
  const safeLabels =
    labels.length > 1 ? labels : ["-", "-", "-", "-", "-", "-"];

  const W = 560;
  const H = 200;
  const L = 48;
  const R = 14;
  const T = 16;
  const B = 26;
  const rawMax = Math.max(...safeValues, 10);
  const max = Math.ceil(rawMax * 1.15);
  const ticks = [0, Math.round(max / 3), Math.round((max * 2) / 3), max];

  const [hover, setHover] = useState(null);
  const x = (i) => L + (i * (W - L - R)) / (safeValues.length - 1);
  const y = (v) => T + (H - T - B) * (1 - v / (max || 1));
  const pts = safeValues.map((v, i) => [x(i), y(v)]);
  const line = smooth(pts);
  const area = `${line} L${x(safeValues.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(
      Math.max(
        0,
        Math.min(
          safeValues.length - 1,
          Math.round(((px - L) / (W - L - R)) * (safeValues.length - 1)),
        ),
      ),
    );
  };
  const idx = hover ?? safeValues.length - 1;
  const tx = Math.max(L, Math.min(W - R - 86, x(idx) - 43));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="db-svg"
      role="img"
      aria-label="Sales trend"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id="db-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f8a7d" stopOpacity=".28" />
          <stop offset="1" stopColor="#1f8a7d" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, idxT) => (
        <g key={idxT}>
          <line
            x1={L}
            x2={W - R}
            y1={y(t)}
            y2={y(t)}
            stroke="#e4eeeb"
            strokeDasharray="3 5"
          />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className="db-axis">
            {t === 0 ? "0" : shortMoney(t)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#db-area)" className="db-fade" />
      <path
        d={line}
        fill="none"
        stroke="#1f8a7d"
        strokeWidth="2.8"
        strokeLinecap="round"
        pathLength="1"
        className="db-draw slow"
      />
      {safeLabels.map((l, i) => (
        <text
          key={`${l}-${i}`}
          x={x(i)}
          y={H - 7}
          textAnchor="middle"
          className="db-axis"
        >
          {l}
        </text>
      ))}
      <g className="db-tip">
        <line
          x1={x(idx)}
          x2={x(idx)}
          y1={T}
          y2={y(0)}
          stroke="#1f8a7d"
          strokeOpacity=".3"
          strokeDasharray="3 4"
        />
        <circle
          cx={x(idx)}
          cy={y(safeValues[idx])}
          r="9"
          fill="#1f8a7d"
          opacity=".15"
        />
        <circle
          cx={x(idx)}
          cy={y(safeValues[idx])}
          r="4.5"
          fill="#fff"
          stroke="#1f8a7d"
          strokeWidth="2.5"
        />
        <g
          transform={`translate(${tx} ${Math.max(2, y(safeValues[idx]) - 46)})`}
        >
          <rect width="86" height="34" rx="9" fill="#0f3733" />
          <text x="43" y="14" textAnchor="middle" className="db-tip-l">
            {safeLabels[idx]}
          </text>
          <text x="43" y="28" textAnchor="middle" className="db-tip-v">
            {money(safeValues[idx])}
          </text>
        </g>
      </g>
    </svg>
  );
}

function Donut({ categories = [], totalAmount = 0, totalSalesLabel }) {
  const r = 50;
  let start = 0;
  return (
    <svg
      viewBox="0 0 140 140"
      className="db-donut"
      role="img"
      aria-label="Sales by category"
    >
      <g transform="rotate(-90 70 70)">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#edf4f1"
          strokeWidth="17"
        />
        {categories.map((s, i) => {
          const len = Math.max(Number(s.pct || 0) - 1.2, 0.1);
          const el = (
            <circle
              key={s.name}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="17"
              pathLength="100"
              strokeDasharray={`${len} ${100 - len}`}
              strokeDashoffset={-start}
              className="db-seg"
              style={{ animationDelay: `${250 + i * 110}ms` }}
            />
          );
          start += Number(s.pct || 0);
          return el;
        })}
      </g>
      <text x="70" y="68" textAnchor="middle" className="db-donut-v">
        {shortMoney(totalAmount)}
      </text>
      <text x="70" y="83" textAnchor="middle" className="db-axis">
        {totalSalesLabel}
      </text>
    </svg>
  );
}

function ComboChart({ months = [], sales = [], orders = [] }) {
  const safeMonths =
    months.length > 0
      ? months
      : ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const safeSales = sales.length > 0 ? sales : [0, 0, 0, 0, 0, 0, 0];
  const safeOrders = orders.length > 0 ? orders : [0, 0, 0, 0, 0, 0, 0];

  const W = 400;
  const H = 190;
  const L = 42;
  const R = 38;
  const T = 14;
  const B = 26;
  const n = safeMonths.length;
  const slot = (W - L - R) / n;
  const cx = (i) => L + slot * i + slot / 2;

  const maxSale = Math.ceil(Math.max(...safeSales, 10) * 1.15);
  const maxOrd = Math.ceil(Math.max(...safeOrders, 5) * 1.15);

  const yS = (v) => T + (H - T - B) * (1 - v / (maxSale || 1));
  const yO = (v) => T + (H - T - B) * (1 - v / (maxOrd || 1));
  const line = smooth(safeOrders.map((v, i) => [cx(i), yO(v)]));

  const steps = [0, 1, 2, 3];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="db-svg"
      role="img"
      aria-label="Monthly sales versus orders"
    >
      {steps.map((s) => {
        const sVal = Math.round((maxSale * s) / 3);
        const oVal = Math.round((maxOrd * s) / 3);
        return (
          <g key={s}>
            <line
              x1={L}
              x2={W - R}
              y1={yS(sVal)}
              y2={yS(sVal)}
              stroke="#e4eeeb"
              strokeDasharray="3 5"
            />
            <text
              x={L - 7}
              y={yS(sVal) + 4}
              textAnchor="end"
              className="db-axis"
            >
              {sVal === 0 ? "0" : shortMoney(sVal)}
            </text>
            <text x={W - R + 7} y={yS(sVal) + 4} className="db-axis">
              {oVal}
            </text>
          </g>
        );
      })}
      {safeSales.map((v, i) => (
        <rect
          key={`${safeMonths[i]}-bar`}
          x={cx(i) - 10}
          y={yS(v)}
          width="20"
          height={Math.max(yS(0) - yS(v), 2)}
          rx="6"
          fill="#1f8a7d"
          className="db-bar"
          style={{ animationDelay: `${200 + i * 70}ms` }}
        />
      ))}
      <path
        d={line}
        fill="none"
        stroke="#0f3733"
        strokeWidth="2.2"
        strokeLinecap="round"
        pathLength="1"
        className="db-draw slow"
      />
      {safeOrders.map((v, i) => (
        <circle
          key={`${safeMonths[i]}-dot`}
          cx={cx(i)}
          cy={yO(v)}
          r="3.4"
          fill="#fff"
          stroke="#0f3733"
          strokeWidth="2"
          className="db-fade"
          style={{ animationDelay: `${700 + i * 60}ms` }}
        />
      ))}
      {safeMonths.map((m, i) => (
        <text
          key={`${m}-${i}`}
          x={cx(i)}
          y={H - 7}
          textAnchor="middle"
          className="db-axis"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.db { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  padding: 28px 32px 44px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 14px; line-height: 1.6; color-scheme: light; }
.db *, .db *::before, .db *::after { box-sizing: border-box; }

/* ---------- header ---------- */
.db-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; animation: db-in .6s cubic-bezier(.2,.8,.2,1) both; }
.db-titlewrap { display: flex; align-items: center; gap: 14px; }
.db-titleico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.db .db-title { margin: 0; font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.db .db-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; }
.db-top-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.db-btn-sec, .db-cta { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; height: 44px; padding: 0 18px; display: inline-flex; align-items: center; gap: 8px;
  border-radius: 13px; font-family: inherit; font-size: 14px; font-weight: 700; transition: transform .15s, box-shadow .25s, background .2s, border-color .2s; }
.db-btn-sec { color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db; }
.db-btn-sec:hover:not(:disabled) { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.db-btn-sec:disabled { opacity: .7; cursor: not-allowed; }
.db-cta { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.db-cta::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.db-cta:hover::after { left: 130%; }
.db-cta:hover { transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.db-btn-sec:active, .db-cta:active { transform: scale(.98); }
.db-cta:focus-visible, .db-btn-sec:focus-visible, .db-link:focus-visible, .db-seg-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.db-spin { animation: db-rot .8s linear infinite; }

.db-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; }
.db-err button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.db-err button:hover { background: #fde8e6; }

/* ---------- grid + cards ---------- */
.db-grid { display: grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: 16px; }
.c3 { grid-column: span 3; } .c4 { grid-column: span 4; } .c5 { grid-column: span 5; } .c6 { grid-column: span 6; } .c12 { grid-column: span 12; }

.db-card { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 18px 20px; min-width: 0;
  box-shadow: 0 16px 34px -26px rgba(14,90,81,.6);
  transition: transform .22s ease, box-shadow .22s ease;
  animation: db-in .6s cubic-bezier(.2,.8,.2,1) var(--d, 0ms) backwards; }
.db-card:hover { transform: translateY(-3px); box-shadow: 0 20px 38px -24px rgba(14,90,81,.65); }

.db-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
.db .db-head h3 { margin: 0; font-size: 15.5px; font-weight: 700; color: var(--ink); }
.db-link { all: unset; cursor: pointer; font-size: 13px; font-weight: 700; color: var(--teal-d); padding: 2px 8px; border-radius: 8px; transition: background .2s; }
.db-link:hover { background: var(--mint); }

.db-segs { display: flex; gap: 2px; padding: 3px; background: #eef5f2; border-radius: 11px; }
.db-seg-btn { all: unset; box-sizing: border-box; cursor: pointer; padding: 4px 13px; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: var(--muted); transition: background .2s, color .2s, box-shadow .2s; }
.db-seg-btn:hover { color: var(--ink); }
.db-seg-btn.on { background: #fff; color: var(--teal-d); box-shadow: 0 3px 8px -4px rgba(14,90,81,.5), 0 0 0 1px rgba(31,138,125,.1); }

/* KPI - Compact & Sleek */
.db-kpi {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 16px !important;
  border-radius: 15px !important;
  position: relative;
  overflow: hidden;
}
.db-kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.db-kpi-head {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.db-chip {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.tone-teal { background: #dff1ea; color: #176f65; }
.tone-blue { background: #e0f0f7; color: #0f6d8f; }
.tone-violet { background: #ece9fb; color: #5b4bc4; }
.tone-amber { background: #fdf1d6; color: #9a6a0a; }
.tone-dark { background: rgba(255, 255, 255, 0.16); color: #fff; }

.db-kpi-label {
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.db-delta-pill {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.db-delta-pill.up { background: #e8f5d6; color: #3f6212; }
.db-delta-pill.down { background: #fdeceb; color: #b9382d; }

.db-kpi-bot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}
.db-kpi-valwrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.db-kpi-val {
  font-size: 22px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  letter-spacing: -0.4px;
}
.db-kpi-sub {
  font-style: normal;
  font-size: 11px;
  color: var(--muted);
  font-weight: 500;
  margin-top: 2px;
}
.db-spark {
  width: 72px;
  height: 26px;
  flex-shrink: 0;
}

/* Hero KPI Card (Total Sales) */
.db-kpi.hero {
  color: #fff;
  border-color: transparent;
  background: radial-gradient(220px 110px at 100% 0%, rgba(200, 241, 105, 0.2), transparent 65%),
              linear-gradient(145deg, #167a6c 0%, #0d4f47 65%, #093a34 100%);
  box-shadow: 0 12px 24px -14px rgba(11, 70, 63, 0.7);
}
.db-kpi.hero:hover {
  box-shadow: 0 16px 30px -14px rgba(11, 70, 63, 0.78);
}
.db-kpi.hero .db-kpi-label,
.db-kpi.hero .db-kpi-sub {
  color: rgba(255, 255, 255, 0.78);
}
.db-kpi.hero .db-delta-pill.up {
  background: rgba(200, 241, 105, 0.22);
  color: #d9f99d;
}
.db-kpi.hero .db-delta-pill.down {
  background: rgba(255, 201, 193, 0.2);
  color: #fecaca;
}

/* charts */
.db-svg { display: block; width: 100%; height: auto; }
.db-donut { display: block; height: auto; }
.db-axis { font-size: 10.5px; fill: #7a9692; font-family: inherit; }
.db-donut-v { font-size: 15px; font-weight: 800; fill: var(--ink); font-family: inherit; }
.db-tip { transition: opacity .15s; }
.db-tip-l { font-size: 10px; fill: #a9cdc6; font-family: inherit; }
.db-tip-v { font-size: 12px; font-weight: 700; fill: #fff; font-family: inherit; }

.db-split { display: flex; align-items: center; gap: 16px; }
.db-split .db-donut { width: 128px; flex-shrink: 0; }
.db-legend { list-style: none; margin: 0; padding: 0; flex: 1; display: grid; gap: 8px; font-size: 13px; }
.db-legend li { display: flex; align-items: center; gap: 8px; }
.db-legend i { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
.db-legend b { margin-left: auto; font-variant-numeric: tabular-nums; }

.db-bars { display: grid; gap: 13px; }
.db-bar-top { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; margin-bottom: 5px; }
.db-bar-top span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-bar-top b { font-variant-numeric: tabular-nums; }
.db-track { height: 8px; border-radius: 99px; background: #edf4f1; overflow: hidden; }
.db-track i { display: block; height: 100%; width: 100%; border-radius: 99px; background: linear-gradient(90deg, #1f8a7d, #3bb5a4); transform-origin: left; animation: db-fill .9s cubic-bezier(.2,.7,.2,1) backwards; }

/* table */
.db-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.db-table th { text-align: left; font-size: 12px; font-weight: 700; color: var(--muted); padding: 0 8px 9px; border-bottom: 1px solid var(--line); }
.db-table td { padding: 10px 8px; border-bottom: 1px solid #eef4f2; }
.db-table tr:last-child td { border-bottom: 0; padding-bottom: 2px; }
.db-table tbody tr { transition: background .15s; }
.db-table tbody tr:hover { background: #f6fbf9; }
.db-table .r { text-align: right; font-weight: 800; color: var(--teal-d); font-variant-numeric: tabular-nums; }
.db-who { display: flex; align-items: center; gap: 10px; font-weight: 600; min-width: 0; }
.db-av { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.db-oid { color: var(--muted); font-variant-numeric: tabular-nums; }
.db-badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; background: #eef1f1; color: #5b6f6b; }
.db-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.db-badge.completed { background: #e8f5d6; color: #4d7c0f; } .db-badge.pending { background: #fdf1d6; color: #9a6a0a; } .db-badge.cancelled { background: #fdeceb; color: #b9382d; }

.db-legend-inline { display: flex; gap: 12px; font-size: 12px; color: var(--muted); }
.db-legend-inline span { display: inline-flex; align-items: center; gap: 5px; }
.db-legend-inline i { width: 9px; height: 9px; border-radius: 3px; background: #1f8a7d; }
.db-legend-inline i.o { background: #0f3733; border-radius: 50%; }

.db-ins { list-style: none; margin: 0; padding: 0; display: grid; gap: 13px; }
.db-ins li { display: flex; gap: 11px; align-items: center; font-size: 13px; line-height: 1.5; }
.db-ins .db-chip { width: 34px; height: 34px; border-radius: 11px; }
.db-empty { color: var(--muted); padding: 14px 0; text-align: center; }

/* motion */
@keyframes db-in { from { opacity: 0; transform: translateY(14px); } }
@keyframes db-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes db-fade { from { opacity: 0; } }
@keyframes db-grow { from { transform: scaleY(0); } }
@keyframes db-fill { from { transform: scaleX(0); } }
@keyframes db-seg { from { stroke-dasharray: 0 100; } }
@keyframes db-rot { to { transform: rotate(360deg); } }
.db-draw { stroke-dasharray: 1; animation: db-draw 1s cubic-bezier(.4,0,.2,1) .15s backwards; }
.db-draw.slow { animation-duration: 1.5s; animation-delay: .3s; }
.db-fade { animation: db-fade .9s ease .9s backwards; }
.db-bar { transform-box: fill-box; transform-origin: bottom; animation: db-grow .7s cubic-bezier(.2,.7,.2,1) backwards; }
.db-seg { animation: db-seg .8s cubic-bezier(.4,0,.2,1) backwards; }

@media (max-width: 1280px) {
  .c3 { grid-column: span 6; } .c4, .c5 { grid-column: span 6; } .c6 { grid-column: span 12; }
}
@media (max-width: 720px) {
  .db { padding: 20px 16px 36px; } .c3, .c4, .c5, .c6 { grid-column: span 12; } .db-split { flex-direction: column; align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .db-top, .db-card, .db-draw, .db-fade, .db-bar, .db-seg, .db-track i { animation: none !important; }
  .db-card { transition: none; }
}
`;

const AV_TONES = [
  ["#dff1ea", "#176f65"],
  ["#e0f0f7", "#0f6d8f"],
  ["#ece9fb", "#5b4bc4"],
  ["#fdf1d6", "#9a6a0a"],
  ["#fdeceb", "#b9382d"],
];

const INSIGHT_ICONS = {
  sales: TrendingUp,
  category: Crown,
  customer: UserPlus,
  product: Package,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { lang, t } = useTranslation();
  const td = t.dashboard;

  const userName = localStorage.getItem("user_name") || "Admin";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? td.morning : hour < 18 ? td.afternoon : td.evening;

  const [range, setRange] = useState(12);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getDashboardAnalytics();
      setDashboard(res?.data || res);
    } catch (err) {
      console.error("Error loading dashboard analytics:", err);
      const msg = err?.message || td.fetchError;
      setErrorMsg(msg);
      toastr.error(td.toastErrorTitle, msg);
    } finally {
      setLoading(false);
    }
  };

  const kpiData = dashboard?.kpis || {};
  const kpiList = [
    {
      label: td.kpiSales,
      target: kpiData.total_sales?.target ?? 0,
      prefix: "$",
      decimals: 2,
      change: kpiData.total_sales?.change ?? 0,
      icon: DollarSign,
      tone: "dark",
      spark: kpiData.total_sales?.spark || [0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: td.kpiOrders,
      target: kpiData.total_orders?.target ?? 0,
      prefix: "",
      decimals: 0,
      change: kpiData.total_orders?.change ?? 0,
      icon: ShoppingCart,
      tone: "blue",
      spark: kpiData.total_orders?.spark || [0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: td.kpiCustomers,
      target: kpiData.total_customers?.target ?? 0,
      prefix: "",
      decimals: 0,
      change: kpiData.total_customers?.change ?? 0,
      icon: Users,
      tone: "violet",
      spark: kpiData.total_customers?.spark || [0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      label: td.kpiAvgOrder,
      target: kpiData.avg_order_value?.target ?? 0,
      prefix: "$",
      decimals: 2,
      change: kpiData.avg_order_value?.change ?? 0,
      icon: Receipt,
      tone: "amber",
      spark: kpiData.avg_order_value?.spark || [0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  const categories = dashboard?.categories || [];
  const topProducts = dashboard?.top_products || [];
  const recentOrders = dashboard?.recent_orders || [];
  const insights = dashboard?.insights || [];
  const topMax = Math.max(...topProducts.map((p) => Number(p.amount || 0)), 1);

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="db">
        <div className="db-top">
          <div className="db-titlewrap">
            <div className="db-titleico">
              <LayoutDashboard size={26} strokeWidth={1.9} />
            </div>
            <div>
              <h2 className="db-title">
                {greeting}, {userName}
              </h2>
              <p className="db-sub">{td.subHeading}</p>
            </div>
          </div>
          <div className="db-top-actions">
            <button
              className="db-btn-sec"
              onClick={fetchDashboard}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "db-spin" : ""} />{" "}
              {td.refresh}
            </button>
            <button
              className="db-cta"
              onClick={() => navigate("/sales-history")}
            >
              <History size={17} /> {td.salesHistoryBtn}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="db-err" role="alert">
            <span>{errorMsg}</span>
            <button onClick={fetchDashboard}>{td.tryAgain}</button>
          </div>
        )}

        <div className="db-grid">
          {kpiList.map((k, i) => (
            <Kpi key={k.label} k={k} index={i} td={td} />
          ))}

          {/* Sales Trend */}
          <div className="db-card c5" style={{ "--d": "280ms" }}>
            <div className="db-head">
              <h3>{td.salesTrendTitle}</h3>
              <div className="db-segs" role="tablist" aria-label="Range">
                {[6, 12].map((r) => (
                  <button
                    key={r}
                    role="tab"
                    aria-selected={range === r}
                    className={`db-seg-btn${range === r ? " on" : ""}`}
                    onClick={() => setRange(r)}
                  >
                    {r}M
                  </button>
                ))}
              </div>
            </div>
            <TrendChart
              key={`${range}-${dashboard?.trend?.values?.join(",")}`}
              range={range}
              trendLabels={dashboard?.trend?.labels}
              trendValues={dashboard?.trend?.values}
            />
          </div>

          {/* Sales by Category */}
          <div className="db-card c4" style={{ "--d": "350ms" }}>
            <div className="db-head">
              <h3>{td.salesByCategoryTitle}</h3>
            </div>
            <div className="db-split">
              <Donut
                categories={categories}
                totalAmount={
                  dashboard?.category_total || kpiData.total_sales?.target || 0
                }
                totalSalesLabel={td.totalSalesLabel}
              />
              <ul className="db-legend">
                {categories.length === 0 ? (
                  <li style={{ color: "#5b7873" }}>{td.emptyInsights}</li>
                ) : (
                  categories.map((c) => (
                    <li key={c.name}>
                      <i style={{ background: c.color }} />
                      {c.name}
                      <b>{c.pct}%</b>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Top 5 Products */}
          <div className="db-card c3" style={{ "--d": "420ms" }}>
            <div className="db-head">
              <h3>{td.topProductsTitle}</h3>
            </div>
            <div className="db-bars">
              {topProducts.length === 0 ? (
                <div className="db-empty">{td.emptyInsights}</div>
              ) : (
                topProducts.map((p, i) => (
                  <div key={p.name}>
                    <div className="db-bar-top">
                      <span title={p.name}>{p.name}</span>
                      <b>{money(p.amount)}</b>
                    </div>
                    <div className="db-track">
                      <i
                        style={{
                          transform: `scaleX(${Number(p.amount) / topMax})`,
                          animationDelay: `${450 + i * 90}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="db-card c5" style={{ "--d": "490ms" }}>
            <div className="db-head">
              <h3>{td.recentSalesTitle}</h3>
              <button
                className="db-link"
                onClick={() => navigate("/sales-history")}
              >
                {td.viewAll}
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="db-table">
                <thead>
                  <tr>
                    <th>{td.colCustomer}</th>
                    <th>{td.colOrder}</th>
                    <th>{td.colStatus}</th>
                    <th style={{ textAlign: "right" }}>{td.colTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="db-empty">
                        {td.emptyRecent}
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((o, i) => {
                      const [bg, fg] = AV_TONES[i % AV_TONES.length];
                      const customer = String(o.customer || td.walkIn);
                      const status = String(o.status || "");
                      return (
                        <tr key={o.id ?? i}>
                          <td>
                            <div className="db-who">
                              <span
                                className="db-av"
                                style={{ background: bg, color: fg }}
                              >
                                {customer.charAt(0).toUpperCase()}
                              </span>
                              {customer}
                            </div>
                          </td>
                          <td className="db-oid">#{String(o.id).slice(-6)}</td>
                          <td>
                            <span className={`db-badge ${status}`}>
                              {status
                                ? status.charAt(0).toUpperCase() +
                                  status.slice(1)
                                : "-"}
                            </span>
                          </td>
                          <td className="r">
                            ${Number(o.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales vs Orders */}
          <div className="db-card c4" style={{ "--d": "560ms" }}>
            <div className="db-head">
              <h3>{td.salesVsOrdersTitle}</h3>
              <div className="db-legend-inline">
                <span>
                  <i />
                  {td.legendSales}
                </span>
                <span>
                  <i className="o" />
                  {td.legendOrders}
                </span>
              </div>
            </div>
            <ComboChart
              months={dashboard?.combo?.months}
              sales={dashboard?.combo?.sales}
              orders={dashboard?.combo?.orders}
            />
          </div>

          {/* Quick Insights */}
          <div className="db-card c3" style={{ "--d": "630ms" }}>
            <div className="db-head">
              <h3>{td.quickInsightsTitle}</h3>
            </div>
            <ul className="db-ins">
              {insights.length === 0 && (
                <li className="db-empty">{td.emptyInsights}</li>
              )}
              {insights.map((s, idx) => {
                const Icon = INSIGHT_ICONS[s.type] || TrendingUp;
                return (
                  <li key={idx}>
                    <div className={`db-chip tone-${s.tone || "teal"}`}>
                      <Icon size={16} strokeWidth={1.9} />
                    </div>
                    <span>{s.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
