// src/pages/SalesHistoryPage.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Receipt,
  CheckCircle2,
  DollarSign,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
  Eye,
  Loader2,
  Truck,
  Utensils,
  ShoppingBag,
  User,
} from 'lucide-react';
import { getSalesHistory, getInvoiceDetails } from '../services/saleService';
import Layout from '../components/Layout';
import ToastrContainer, { toastr } from '../components/Toastr';
import { useTranslation } from '../utils/translations';

const PAGE_SIZE = 10;
const MAX_API_PAGES = 50;

const SHOP = {
  name: 'RESTAURANT SHOP',
  tagline: 'សូមស្វាគមន៍ · Welcome',
  address: 'Phnom Penh, Cambodia',
  phone: '',
};
const EXCHANGE_RATE = 4100;

const css = `
.sh, .sh-portal {
  --bg-page: transparent;
  --surface: #ffffff;
  --surface-2: #f7fbfa;
  --surface-3: #f1f6f5;
  --ink: #0f1f1d;
  --muted: #6a8280;
  --line: #e6eeec;
  --line-hover: #d3e2df;
  --teal: #0f766e;
  --teal-d: #0b5e58;
  --teal-soft: #e0f4f1;
}

/* --- GLOBAL DARK MODE SUPPORT --- */
html.dark .sh, html.dark .sh-portal,
body.dark .sh, body.dark .sh-portal,
[data-theme="dark"] .sh, [data-theme="dark"] .sh-portal,
.dark .sh, .dark .sh-portal {
  --bg-page: #0b1514;
  --surface: #11211f;
  --surface-2: #162926;
  --surface-3: #1c3330;
  --ink: #ecfdf5;
  --muted: #8ca8a3;
  --line: #1f3834;
  --line-hover: #2a4944;
  --teal: #2dd4bf;
  --teal-d: #34d399;
  --teal-soft: rgba(45, 212, 191, 0.16);
  color-scheme: dark;
}

.sh {
  padding: 20px 24px;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif;
  color: var(--ink);
  background: var(--bg-page);
  text-align: left;
  font-size: 13px;
  transition: background .25s ease, color .25s ease;
}
.sh *, .sh *::before, .sh *::after { box-sizing: border-box; }
.sh h2 { margin: 0; color: var(--ink); font-family: inherit; }

.sh-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 14px; }
.sh-top h2 { font-size: 20px; font-weight: 800; letter-spacing: -.4px; }
.sh-top h2 small { font-size: 12.5px; font-weight: 600; color: var(--muted); margin-left: 8px; }
.sh-top p { margin: 2px 0 0; color: var(--muted); font-size: 12.5px; }
.sh-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.sh-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 37px; padding: 0 14px; display: inline-flex; align-items: center; gap: 7px; border-radius: 10px;
  font-size: 12.5px; font-weight: 700; color: var(--ink); background: var(--surface); border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s, background .15s; }
.sh-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(12,37,38,.07); border-color: var(--line-hover); background: var(--surface-2); }
.sh-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 5px 14px rgba(15,118,110,.24); }
.sh-btn.primary:hover:not(:disabled) { box-shadow: 0 8px 18px rgba(15,118,110,.32); border-color: transparent; background: linear-gradient(135deg,#11867d,#0d6b64); }
.sh-btn:disabled { opacity: .6; cursor: not-allowed; }
.sh button:focus-visible, .sh select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.sh-spin { animation: sh-rot .8s linear infinite; }

.sh-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 10px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 12.5px; }
html.dark .sh-err, body.dark .sh-err, [data-theme="dark"] .sh-err, .dark .sh-err { background: rgba(239,68,68,.15); color: #fca5a5; border-color: rgba(239,68,68,.35); }
.sh-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

/* --- COMPACT & SLEEK TOP STATS CARDS --- */
.sh-tiles {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.sh-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 2px 8px -2px rgba(12, 37, 38, 0.04);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  animation: sh-up .45s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards;
  min-width: 0;
}
.sh-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px -6px rgba(12, 37, 38, 0.09);
  border-color: var(--line-hover);
}
.sh-chip-i {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.t-dark { background: #c8f169; color: #0c2526; }
.t-green { background: #e7f8ee; color: #15803d; }
.t-amber { background: #fff1d6; color: #d97706; }
.t-blue { background: #e3eeff; color: #2563eb; }
html.dark .t-green, body.dark .t-green, [data-theme="dark"] .t-green, .dark .t-green { background: rgba(34,197,94,.18); color: #4ade80; }
html.dark .t-amber, body.dark .t-amber, [data-theme="dark"] .t-amber, .dark .t-amber { background: rgba(245,158,11,.18); color: #fbbf24; }
html.dark .t-blue, body.dark .t-blue, [data-theme="dark"] .t-blue, .dark .t-blue { background: rgba(59,130,246,.18); color: #60a5fa; }

.sh-tile-body { min-width: 0; flex: 1; }
.sh-tile span {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sh-tile-valrow {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 2px;
  flex-wrap: wrap;
}
.sh-tile b {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -.4px;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  color: var(--ink);
}
.sh-tile small {
  font-size: 10.5px;
  color: var(--muted);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sh-tile.hero {
  border-color: transparent;
  color: #f4faf8;
  background: radial-gradient(180px 90px at 100% 0%, rgba(200,241,105,.22), transparent 65%),
              linear-gradient(145deg,#0f2d2e,#0a1f20);
}
.sh-tile.hero span, .sh-tile.hero small { color: #9db8b4; }
.sh-tile.hero b { color: #f4faf8; }
.sh-tile.hero:hover { border-color: transparent; box-shadow: 0 12px 26px rgba(12,37,38,.24); }

/* Compact Dual-Ring Circular Gauge */
.sh-gauge-wrap {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
}
.sh-gauge-svg {
  width: 50px;
  height: 50px;
  transform: rotate(-90deg);
  overflow: visible;
}
.sh-gauge-track {
  stroke: var(--surface-3);
}
html.dark .sh-gauge-track, body.dark .sh-gauge-track, [data-theme="dark"] .sh-gauge-track, .dark .sh-gauge-track {
  stroke: rgba(255, 255, 255, 0.1);
}
.sh-gauge-pct {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 800;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}

/* Mini Status Ring inside Table Row */
.sh-status-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.sh-mini-ring {
  position: relative;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
}
.sh-mini-ring svg {
  width: 28px;
  height: 28px;
  transform: rotate(-90deg);
}
.sh-mini-ring i {
  position: absolute;
  font-style: normal;
  font-size: 8.5px;
  font-weight: 800;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.sh-panel { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: sh-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.sh-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 13px 18px; border-bottom: 1px solid var(--line); }
.sh-left, .sh-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.sh-search { position: relative; display: flex; align-items: center; width: 300px; max-width: 100%; }
.sh-search > svg { position: absolute; left: 12px; color: var(--muted); pointer-events: none; }
.sh-search input { all: unset; box-sizing: border-box; width: 100%; height: 36px; padding: 0 34px 0 36px; font-size: 12.5px; color: var(--ink); background: var(--surface-3); border: 1.5px solid transparent; border-radius: 10px; transition: background .15s, border-color .15s, box-shadow .15s; }
.sh-search input::placeholder { color: var(--muted); }
.sh-search input:focus { background: var(--surface); border-color: var(--teal); box-shadow: 0 0 0 3px rgba(15,118,110,.14); }
.sh-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 7px; color: var(--muted); }
.sh-x:hover { background: var(--line); color: var(--ink); }
.sh-seg { display: flex; gap: 2px; padding: 3px; background: var(--surface-3); border-radius: 10px; flex-wrap: wrap; }
.sh-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.sh-sb:hover { color: var(--ink); }
.sh-sb.on { background: var(--surface); color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.sh-select { height: 36px; max-width: 175px; padding: 0 28px 0 11px; font: inherit; font-size: 12px; font-weight: 600; color: var(--ink); background: var(--surface-3) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 9px center; border: 1.5px solid transparent; border-radius: 10px; appearance: none; cursor: pointer; }
.sh-select:hover { border-color: var(--line-hover); }

/* --- TABLE SHOWING ALL FIELDS (Spacious View & Print Actions) --- */
.sh-tablewrap { overflow-x: auto; }
.sh-gridwrap { min-width: 1060px; }
.sh-head, .sh-row {
  display: grid;
  grid-template-columns: minmax(175px, 1.35fr) minmax(135px, 1.05fr) 112px 84px 80px 76px 105px 150px 138px 108px;
  gap: 10px;
  align-items: center;
  padding: 0 22px 0 18px;
}
.sh-head { height: 40px; font-size: 11px; font-weight: 700; color: var(--muted); background: var(--surface-2); border-bottom: 1px solid var(--line); text-transform: uppercase; letter-spacing: .2px; }
.sh-row { min-height: 64px; padding-top: 6px; padding-bottom: 6px; border-bottom: 1px solid var(--line); transition: background .12s; animation: sh-slide .35s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 24ms) backwards; }
.sh-row:last-child { border-bottom: 0; }
.sh-row:hover { background: var(--surface-2); }

.sh-who { display: flex; align-items: center; gap: 10px; min-width: 0; cursor: pointer; }
.sh-who b { display: block; font-size: 12.5px; font-weight: 800; color: var(--teal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sh-who b:hover { text-decoration: underline; }
.sh-sub { display: block; font-size: 10.5px; color: var(--muted); margin-top: 1px; font-weight: 600; }

.sh-ico { width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: grid; place-items: center; background: var(--teal-soft); color: var(--teal); transition: transform .2s; }
.sh-row:hover .sh-ico { transform: scale(1.06) rotate(-4deg); }

.sh-cust-box { display: flex; align-items: center; gap: 8px; min-width: 0; }
.sh-cust-ava { width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; display: grid; place-items: center; background: var(--surface-3); border: 1px solid var(--line); color: var(--teal-d); font-weight: 800; font-size: 11.5px; }
.sh-cust-meta { min-width: 0; flex: 1; }
.sh-cust-meta b { display: block; font-size: 12.5px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sh-cust-meta small { display: block; font-size: 10.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.sh-type-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 700; width: fit-content; text-transform: capitalize; background: var(--surface-3); color: var(--ink); border: 1px solid var(--line); }
.sh-type-badge.delivery { background: rgba(59,130,246,.12); color: #2563eb; border-color: rgba(59,130,246,.28); }
.sh-type-badge.dine_in { background: var(--teal-soft); color: var(--teal-d); border-color: rgba(15,118,110,.25); }
html.dark .sh-type-badge.delivery, body.dark .sh-type-badge.delivery, [data-theme="dark"] .sh-type-badge.delivery, .dark .sh-type-badge.delivery { color: #60a5fa; }

.sh-num-col { text-align: right; font-variant-numeric: tabular-nums; font-size: 12.5px; font-weight: 600; color: var(--ink); }
.sh-num-col.disc { color: #dc2626; }
.sh-num-col.tax { color: #2563eb; }
html.dark .sh-num-col.disc, body.dark .sh-num-col.disc, [data-theme="dark"] .sh-num-col.disc, .dark .sh-num-col.disc { color: #f87171; }
html.dark .sh-num-col.tax, body.dark .sh-num-col.tax, [data-theme="dark"] .sh-num-col.tax, .dark .sh-num-col.tax { color: #60a5fa; }

.sh-amt { text-align: right; font-weight: 800; font-size: 13.5px; color: var(--teal); font-variant-numeric: tabular-nums; }
.sh-amt small { display: block; font-size: 10px; font-weight: 600; color: var(--muted); }

.sh-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 700; width: fit-content; background: #eef2f1; color: #5f7773; text-transform: capitalize; white-space: nowrap; }
.sh-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.sh-badge.completed { background: #e7f8ee; color: #15803d; }
.sh-badge.pending { background: #fff4e0; color: #b45309; }
.sh-badge.cancelled { background: #fdecea; color: #c0392b; }
html.dark .sh-badge.completed, body.dark .sh-badge.completed, [data-theme="dark"] .sh-badge.completed, .dark .sh-badge.completed { background: rgba(34,197,94,.2); color: #4ade80; }
html.dark .sh-badge.pending, body.dark .sh-badge.pending, [data-theme="dark"] .sh-badge.pending, .dark .sh-badge.pending { background: rgba(245,158,11,.2); color: #fbbf24; }
html.dark .sh-badge.cancelled, body.dark .sh-badge.cancelled, [data-theme="dark"] .sh-badge.cancelled, .dark .sh-badge.cancelled { background: rgba(239,68,68,.2); color: #fca5a5; }

.sh-date { line-height: 1.35; font-size: 11px; color: var(--ink); font-variant-numeric: tabular-nums; white-space: nowrap; }
.sh-date small { display: block; font-size: 10px; color: var(--muted); margin-top: 1px; }

.sh-acts {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-right: 4px;
}
.sh-ib {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 9px;
  border: 1.5px solid var(--line-hover);
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 2px 4px rgba(12, 37, 38, 0.04);
  transition: background .15s, color .15s, border-color .15s, transform .15s, box-shadow .15s;
}
.sh-ib:hover { transform: translateY(-1px); box-shadow: 0 5px 12px rgba(12, 37, 38, 0.1); }
.sh-ib.v:hover { background: rgba(37,99,235,.14); color: #2563eb; border-color: rgba(37,99,235,.4); }
.sh-ib.p:hover { background: var(--teal-soft); color: var(--teal); border-color: var(--teal); }
.sh-ib:disabled { opacity: .55; cursor: wait; transform: none; }
.sh-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.sh-empty { padding: 48px 20px; text-align: center; color: var(--muted); }
.sh-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.sh-skel { height: 62px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.sh-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,var(--surface-3),var(--surface-2),var(--surface-3)); background-size: 200% 100%; animation: sh-shine 1.3s linear infinite; }

.sh-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 11px 18px; border-top: 1px solid var(--line); background: var(--surface-2); color: var(--muted); font-size: 12px; }
.sh-pager { display: flex; align-items: center; gap: 6px; }
.sh-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); transition: background .15s; }
.sh-pg:hover:not(:disabled) { background: var(--surface-3); }
.sh-pg:disabled { opacity: .4; cursor: not-allowed; }
.sh-pager span { min-width: 58px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes sh-up { from { opacity: 0; transform: translateY(12px); } }
@keyframes sh-slide { from { opacity: 0; transform: translateX(-8px); } }
@keyframes sh-shine { to { background-position: -200% 0; } }
@keyframes sh-rot { to { transform: rotate(360deg); } }

@media (max-width: 1150px) { .sh-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 720px) {
  .sh { padding: 14px; } .sh-tiles { grid-template-columns: 1fr; }
  .sh-search, .sh-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .sh-tile, .sh-panel, .sh-row, .sh-skel i, .sh-spin, .sh-ico { animation: none !important; transition: none !important; } }
`;

const invCss = `
.sh-portal { font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: #0f1f1d; text-align: left; }
.sh-portal, .sh-portal *, .sh-portal *::before, .sh-portal *::after { box-sizing: border-box; }
.sh-ovl { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(8,28,29,.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); animation: shp-fade .2s ease; }
.sh-modal { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 440px; max-height: 94vh; background: #eef3f2; border-radius: 22px; overflow: hidden; box-shadow: 0 30px 80px rgba(6,23,24,.4); animation: shp-rise .3s cubic-bezier(.2,.8,.2,1); transition: max-width .25s ease; }
.sh-modal.a5 { max-width: 700px; }
.sh-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #e3ecea; color: #0f1f1d; }
.sh-bar b { font-size: 14px; font-weight: 800; }
.sh-paper { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 10px; }
.sh-paper button { all: unset; cursor: pointer; padding: 5px 11px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #6a8280; transition: background .15s, color .15s; }
.sh-paper button.on { background: #fff; color: #0f1f1d; box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.sh-paper button:focus-visible, .shp-btn:focus-visible, .sh-xbtn:focus-visible { outline: 2px solid #0f766e; outline-offset: 2px; }
.sh-xbtn { all: unset; cursor: pointer; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; color: #6a8280; } .sh-xbtn:hover { background: #fdecea; color: #c0392b; }
.sh-stage { flex: 1; overflow-y: auto; display: flex; justify-content: center; padding: 24px 16px 34px; background: repeating-linear-gradient(135deg, #eef3f2 0 10px, #e9efee 10px 20px); }
.sh-foot2 { display: flex; gap: 10px; padding: 12px 16px 16px; background: #fff; border-top: 1px solid #e3ecea; }
.shp-btn { all: unset; box-sizing: border-box; cursor: pointer; flex: 1; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; font-size: 13.5px; font-weight: 700; color: #0f1f1d; background: #fff; border: 1px solid #d5e3e0; transition: transform .15s, box-shadow .15s; }
.shp-btn:hover { background: #f3f9f7; } .shp-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 8px 18px rgba(15,118,110,.28); } .shp-btn.primary:hover { transform: translateY(-1px); }

.rc-wrap { filter: drop-shadow(0 14px 22px rgba(12,37,38,.2)); }
.rc { --w: 72mm; --fs: 11px; position: relative; width: var(--w); padding: 14px 12px 18px; background: #fff; color: #111; font-family: 'Noto Sans Khmer','Plus Jakarta Sans',-apple-system,sans-serif; font-size: var(--fs); line-height: 1.5; font-variant-numeric: tabular-nums; }
.rc.a5 { --w: 138mm; --fs: 13px; padding: 26px 26px 30px; }
.rc::after { content: ''; position: absolute; left: 0; right: 0; bottom: -7px; height: 7px; background: linear-gradient(-135deg, #fff 5px, transparent 0) 0 0/12px 7px, linear-gradient(135deg, #fff 5px, transparent 0) 0 0/12px 7px; }
.rc-head { text-align: center; }
.rc-logo { width: 38px; height: 38px; margin: 0 auto 6px; display: grid; place-items: center; border-radius: 50%; background: #111; color: #fff; font-weight: 800; font-size: 17px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.rc-shop { margin: 0; font-size: calc(var(--fs) + 3px); font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; font-family: inherit; color: #111; }
.rc-tag, .rc-addr { margin: 1px 0 0; font-size: calc(var(--fs) - 1px); color: #444; }
.rc-div { border-top: 1px dashed #111; margin: 9px 0; }
.rc-title { text-align: center; font-weight: 800; font-size: calc(var(--fs) + 1px); letter-spacing: .6px; }
.rc-no { text-align: center; font-weight: 800; font-size: calc(var(--fs) + 2px); margin-top: 1px; letter-spacing: .3px; word-break: break-all; }
.rc-void { margin: 6px auto 0; width: fit-content; padding: 1px 12px; border: 1.5px solid #111; border-radius: 4px; font-weight: 800; font-size: calc(var(--fs) - 1px); letter-spacing: 1.5px; text-transform: uppercase; }
.rc-meta { display: grid; gap: 2px; margin-top: 8px; }
.rc-meta div { display: flex; justify-content: space-between; gap: 10px; } .rc-meta span { color: #444; white-space: nowrap; } .rc-meta b { font-weight: 700; text-align: right; }
.rc-cols { display: flex; justify-content: space-between; font-weight: 800; font-size: calc(var(--fs) - 1px); padding: 3px 0; border-top: 1.5px solid #111; border-bottom: 1.5px solid #111; margin-bottom: 4px; }
.rc-item { padding: 5px 0; border-bottom: 1px dotted #999; } .rc-item:last-child { border-bottom: 0; }
.rc-i-top { display: flex; gap: 6px; font-weight: 700; } .rc-i-top i { font-style: normal; color: #555; min-width: 14px; } .rc-name { word-break: break-word; }
.rc-i-bot { display: flex; justify-content: space-between; gap: 8px; padding-left: 20px; color: #333; } .rc-i-bot b { color: #111; font-weight: 800; } .rc-i-bot em { font-style: normal; color: #444; margin-left: 6px; }
.rc-sum { display: grid; gap: 2px; } .rc-sum div { display: flex; justify-content: space-between; } .rc-sum span { color: #333; }
.rc-total { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding: 8px 10px; background: #111; color: #fff; border-radius: 6px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.rc-total span { font-weight: 700; font-size: calc(var(--fs) + 1px); } .rc-total b { font-size: calc(var(--fs) + 7px); font-weight: 800; letter-spacing: -.3px; }
.rc-riel { display: flex; justify-content: space-between; margin-top: 5px; font-weight: 700; }
.rc-pay { display: grid; gap: 2px; } .rc-pay div { display: flex; justify-content: space-between; } .rc-pay span { color: #333; } .rc-pay b { font-weight: 700; }
.rc-thanks { margin-top: 4px; text-align: center; } .rc-thanks b { display: block; font-weight: 800; } .rc-thanks span { color: #444; font-size: calc(var(--fs) - 1px); }
.rc-note { text-align: center; margin-top: 8px; font-size: calc(var(--fs) - 2px); color: #666; letter-spacing: .3px; }
@keyframes shp-fade { from { opacity: 0; } } @keyframes shp-rise { from { opacity: 0; transform: translateY(22px) scale(.98); } }
@media (prefers-reduced-motion: reduce) { .sh-ovl, .sh-modal { animation: none; } }
@media print {
  body > *:not(.sh-portal) { display: none !important; }
  html, body { background: #fff !important; height: auto !important; overflow: visible !important; }
  .sh-noprint { display: none !important; }
  .sh-ovl { position: static !important; display: block !important; padding: 0 !important; background: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; animation: none !important; }
  .sh-modal, .sh-modal.a5 { position: static !important; display: block !important; width: 100% !important; max-width: none !important; max-height: none !important; background: none !important; box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; animation: none !important; }
  .sh-stage { display: block !important; padding: 0 !important; background: none !important; overflow: visible !important; }
  .rc-wrap { filter: none !important; }
  .rc { margin: 0 auto !important; padding: 3mm 2mm 4mm !important; color: #000 !important; }
  .rc.a5 { padding: 0 !important; }
  .rc::after { display: none !important; }
  .rc-item, .rc-total, .rc-pay, .rc-sum { break-inside: avoid; }
}
`;

const normStatus = (s) => {
  const v = String(s || '').toLowerCase();
  return v === 'canceled' ? 'cancelled' : v;
};
const num = (v) => Number(v) || 0;
const fmt = (n) => num(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (n) => `$${fmt(n)}`;
const qtyText = (q) => String(Number(Number(q || 0).toFixed(3)));

const parts = (value) => {
  if (!value) return { date: '-', time: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: value || '-', time: '' };
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
};

const orderTypeMeta = (raw, lang = 'km') => {
  const t = String(raw || 'dine_in').toLowerCase().replace(/[-\s]+/g, '_');
  const isKm = lang === 'km' || lang === 'kh';
  if (t === 'delivery') {
    return { key: 'delivery', label: isKm ? 'ដឹកជញ្ជូន (Delivery)' : 'Delivery', short: isKm ? 'ដឹកជញ្ជូន' : 'Delivery', Icon: Truck };
  }
  if (t === 'dine_in') {
    return { key: 'dine_in', label: isKm ? 'ញ៉ាំនៅហាង (Dine-In)' : 'Dine-In', short: isKm ? 'នៅហាង' : 'Dine-In', Icon: Utensils };
  }
  return { key: t, label: raw || 'Takeaway', short: raw || 'Takeaway', Icon: ShoppingBag };
};

const csvCell = (x) => {
  let v = String(x ?? '');
  if (/^[=+\-@\t\r]/.test(v) && Number.isNaN(Number(v))) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
};

function useCountUp(target, decimals = 0, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return undefined; }
    let raf, start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function Tile({ label, target, prefix = '', decimals = 0, icon: Icon, tone, hero, delay, subText }) {
  const shown = useCountUp(target, decimals);
  return (
    <div className={`sh-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`sh-chip-i ${tone}`}><Icon size={18} strokeWidth={2.1} /></div>
      <div className="sh-tile-body">
        <span>{label}</span>
        <div className="sh-tile-valrow">
          <b>{prefix}{shown}</b>
          {subText && <small>{subText}</small>}
        </div>
      </div>
    </div>
  );
}

// ✅ Compact Dual-Ring Circular Progress Card (ទំហំតូចល្មម ស៊ីគ្នាជាមួយកាតដទៃ)
function CircularGaugeTile({ label, percent = 0, countText = '', subText = '', color = 'teal', delay = 0 }) {
  const safePct = Math.max(0, Math.min(100, Number(percent) || 0));
  const shownPct = useCountUp(safePct, 0, 900);

  const rOuter = 21;
  const rInner = 15.5;
  const cOuter = 2 * Math.PI * rOuter;
  const cInner = 2 * Math.PI * rInner;
  const offsetOuter = cOuter - (safePct / 100) * cOuter;
  const offsetInner = cInner - (safePct / 100) * cInner;

  const isAmber = color === 'amber';
  const strokeMain = isAmber ? '#f59e0b' : '#14b8a6';
  const strokeSub = isAmber ? '#fbbf24' : '#0d9488';

  return (
    <div className="sh-tile" style={{ '--d': `${delay}ms` }}>
      <div className="sh-gauge-wrap">
        <svg className="sh-gauge-svg" viewBox="0 0 50 50">
          <circle className="sh-gauge-track" cx="25" cy="25" r={rOuter} fill="none" strokeWidth="3.5" />
          <circle className="sh-gauge-track" cx="25" cy="25" r={rInner} fill="none" strokeWidth="2.5" opacity="0.7" />

          <circle
            cx="25"
            cy="25"
            r={rOuter}
            fill="none"
            stroke={strokeMain}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={cOuter}
            strokeDashoffset={offsetOuter}
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.2,.8,.2,1)' }}
          />
          <circle
            cx="25"
            cy="25"
            r={rInner}
            fill="none"
            stroke={strokeSub}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={cInner}
            strokeDashoffset={offsetInner}
            style={{ transition: 'stroke-dashoffset 1.05s cubic-bezier(.2,.8,.2,1)', opacity: 0.85 }}
          />
        </svg>
        <div className="sh-gauge-pct">{shownPct}%</div>
      </div>

      <div className="sh-tile-body">
        <span>{label}</span>
        <div className="sh-tile-valrow">
          <b>{countText}</b>
          {subText && <small>{subText}</small>}
        </div>
      </div>
    </div>
  );
}

// Mini Circular Ring សម្រាប់បង្ហាញក្នុងជួរតារាងត្រង់ Status
function MiniStatusRing({ status }) {
  const st = normStatus(status);
  const pct = st === 'completed' ? 100 : st === 'pending' ? 50 : 0;
  const color = st === 'completed' ? '#16a34a' : st === 'pending' ? '#f59e0b' : '#ef4444';
  const r = 11;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <span className="sh-mini-ring" title={`${pct}%`}>
      <svg viewBox="0 0 28 28">
        <circle cx="14" cy="14" r={r} fill="none" stroke="var(--line)" strokeWidth="3" />
        <circle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <i>{pct}%</i>
    </span>
  );
}

function ReceiptView({ inv, paper, tsh, lang }) {
  const d = parts(inv.created_at);
  const u = parts(inv.updated_at);
  const items = Array.isArray(inv.details) ? inv.details : Array.isArray(inv.items) ? inv.items : [];
  const subtotal = num(inv.subtotal) || items.reduce((s, i) => s + num(i.total_price), 0);
  const discount = num(inv.discount_amount ?? inv.discount);
  const tax = num(inv.tax_amount ?? inv.tax);
  const total = num(inv.total_amount);
  const inferredDelivFee = Math.max(Number((total - (subtotal - discount + tax)).toFixed(2)), 0);
  const deliveryFee = num(inv.delivery_fee ?? inv.delivery?.delivery_fee ?? inferredDelivFee);
  const rate = num(inv.exchange_rate) || EXCHANGE_RATE;
  const riel = Math.round((total * rate) / 100) * 100;
  const received = inv.received_amount ?? inv.amount_received ?? inv.paid_amount ?? inv.amount_paid;
  const receivedNum = received !== undefined && received !== null && received !== '' ? num(received) : total;
  const change = Math.max(receivedNum - total, 0);
  const st = normStatus(inv.status);
  const table = inv.table_no || inv.table?.name;
  const typeInfo = orderTypeMeta(inv.order_type, lang);
  const custName = inv.customer?.name || (inv.customer_id ? `Customer #${inv.customer_id}` : 'Walk-In');

  return (
    <article className={`rc ${paper}`}>
      <header className="rc-head">
        <div className="rc-logo">{SHOP.name.trim().charAt(0)}</div>
        <h3 className="rc-shop">{SHOP.name}</h3>
        {SHOP.tagline && <p className="rc-tag">{SHOP.tagline}</p>}
        {SHOP.address && <p className="rc-addr">{SHOP.address}</p>}
        {SHOP.phone && <p className="rc-addr">{tsh.phonePrefix} {SHOP.phone}</p>}
      </header>

      <div className="rc-div" />
      <div className="rc-title">{tsh.invoiceHeader}</div>
      <div className="rc-no">#{inv.order_number}</div>
      {st && st !== 'completed' && <div className="rc-void">{st}</div>}

      <div className="rc-meta">
        <div><span>Order ID</span><b>#{inv.id ?? '-'}</b></div>
        <div><span>{tsh.dateLabel}</span><b>{d.date} {d.time}</b></div>
        {inv.updated_at && <div><span>Updated</span><b>{u.date} {u.time}</b></div>}
        <div><span>{tsh.customerLabel}</span><b>{custName}</b></div>
        <div><span>Order Type</span><b>{typeInfo.label}</b></div>
        {table && <div><span>{tsh.tableLabel}</span><b>{table}</b></div>}
      </div>

      <div className="rc-div" />
      <div className="rc-cols"><span>{tsh.itemsHeader}</span><span>{tsh.totalHeader}</span></div>
      {items.length === 0 && <div style={{ textAlign: 'center', padding: 8, color: '#555' }}>(គ្មានទំនិញលម្អិត)</div>}
      {items.map((it, idx) => {
        const unit = num(it.unit_price ?? it.price);
        const qty = num(it.quantity);
        const line = num(it.total_price) || unit * qty;
        const disc = num(it.discount ?? it.discount_amount);
        return (
          <div className="rc-item" key={it.id ?? idx}>
            <div className="rc-i-top"><i>{idx + 1}.</i><span className="rc-name">{it.product_name || it.product?.name || 'Item'}</span></div>
            <div className="rc-i-bot">
              <span>{qtyText(qty)} × {money(unit)}{disc > 0 && <em>(−{money(disc)})</em>}</span>
              <b>{money(line)}</b>
            </div>
          </div>
        );
      })}

      <div className="rc-div" />
      <div className="rc-sum">
        <div><span>{tsh.subtotalLabel}</span><span>{money(subtotal)}</span></div>
        <div><span>{tsh.discountLabel}</span><span>−{money(discount)}</span></div>
        <div><span>{tsh.taxLabel}</span><span>+{money(tax)}</span></div>
        {deliveryFee > 0 && <div><span>Delivery Fee</span><span>+{money(deliveryFee)}</span></div>}
      </div>
      <div className="rc-total"><span>{tsh.grandTotalLabel}</span><b>{money(total)}</b></div>
      <div className="rc-riel"><span>{tsh.rielLabel}</span><span>៛{riel.toLocaleString('en-US')}</span></div>

      <div className="rc-div" />
      <div className="rc-pay">
        <div><span>{tsh.paymentMethodLabel}</span><b>{String(inv.payment_method || 'cash').toUpperCase()}</b></div>
        <div><span>{tsh.amountReceivedLabel}</span><b>{money(receivedNum)}</b></div>
        <div><span>{tsh.changeLabel}</span><b>{money(change)}</b></div>
      </div>

      <div className="rc-div" />
      <div className="rc-thanks"><b>{tsh.thankYou}</b><span>{tsh.thankYouSub}</span></div>
      <div className="rc-note">— {inv.order_number} —</div>
    </article>
  );
}

export default function SalesHistoryPage() {
  const { lang, t } = useTranslation();
  const isKm = lang === 'km' || lang === 'kh';
  const tsh = t.salesHistory || {};

  const STATUS_KM = {
    completed: tsh.statusCompleted || (isKm ? 'បានបញ្ចប់' : 'Completed'),
    pending: tsh.statusPending || (isKm ? 'រង់ចាំ' : 'Pending'),
    cancelled: tsh.statusCancelled || (isKm ? 'បានបោះបង់' : 'Cancelled'),
  };
  const statusLabel = (s = '') => {
    const k = normStatus(s);
    return STATUS_KM[k] || (k ? k.charAt(0).toUpperCase() + k.slice(1) : '-');
  };

  const FILTER_KEYS = [
    { key: 'all', label: tsh.filterAll || (isKm ? 'ទាំងអស់' : 'All') },
    { key: 'completed', label: tsh.filterCompleted || (isKm ? 'បានបញ្ចប់' : 'Completed') },
    { key: 'pending', label: tsh.filterPending || (isKm ? 'រង់ចាំ' : 'Pending') },
    { key: 'cancelled', label: tsh.filterCancelled || (isKm ? 'បានបោះបង់' : 'Cancelled') },
  ];

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [invoice, setInvoice] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const [paper, setPaper] = useState(() => {
    try { return localStorage.getItem('invoice_paper') === 'a5' ? 'a5' : 'thermal'; } catch { return 'thermal'; }
  });
  const reqId = useRef(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const id = ++reqId.current;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await getSalesHistory(1);
      if (id !== reqId.current) return;
      if (res && res.success) {
        const first = res.data;
        let list = first?.data || first || [];
        if (!Array.isArray(list)) list = [];
        const last = Number(first?.last_page) || 1;
        for (let p = 2; p <= Math.min(last, MAX_API_PAGES); p += 1) {
          const r = await getSalesHistory(p);
          if (id !== reqId.current) return;
          if (!r || !r.success) break;
          const more = r.data?.data || r.data || [];
          if (Array.isArray(more)) list = list.concat(more);
        }
        setOrders(list);
      } else {
        setOrders([]);
      }
    } catch (error) {
      if (id !== reqId.current) return;
      console.error('Error fetching sales history:', error);
      const msg = error?.message || tsh.fetchError;
      setErrorMsg(msg);
      toastr.error(tsh.toastErrorTitle, msg);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalCount = orders.length;
    const completed = orders.filter((o) => normStatus(o.status) === 'completed');
    const deliveryCount = orders.filter((o) => String(o.order_type || '').toLowerCase() === 'delivery').length;
    const completionPct = totalCount > 0 ? (completed.length / totalCount) * 100 : 0;
    const deliveryPct = totalCount > 0 ? (deliveryCount / totalCount) * 100 : 0;

    return {
      count: totalCount,
      completed: completed.length,
      deliveryCount,
      completionPct,
      deliveryPct,
      revenue: completed.reduce((sum, o) => sum + num(o.total_amount), 0),
      counts: {
        all: totalCount,
        completed: completed.length,
        pending: orders.filter((o) => normStatus(o.status) === 'pending').length,
        cancelled: orders.filter((o) => normStatus(o.status) === 'cancelled').length,
      },
    };
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = orders.filter((o) => {
      const matchStatus = filter === 'all' || normStatus(o.status) === filter;
      const oType = String(o.order_type || 'dine_in').toLowerCase();
      const matchType = typeFilter === 'all' || oType === typeFilter;
      const matchQuery =
        !q ||
        [
          o.id,
          o.order_number,
          o.customer_id,
          o.customer?.name,
          o.customer?.phone,
          o.order_type,
          o.status,
          o.subtotal,
          o.total_amount,
        ].some((val) => String(val ?? '').toLowerCase().includes(q));
      return matchStatus && matchType && matchQuery;
    });
    const by = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      total: (a, b) => num(b.total_amount) - num(a.total_amount),
    }[sort];
    return [...list].sort(by);
  }, [orders, filter, typeFilter, query, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const exportCsv = () => {
    const lines = [
      [
        'ID',
        'Order Number',
        'Customer ID',
        'Customer Name',
        'Order Type',
        'Subtotal ($)',
        'Discount Amount ($)',
        'Tax Amount ($)',
        'Total Amount ($)',
        'Status',
        'Created At',
        'Updated At',
      ],
      ...visible.map((o) => [
        o.id,
        o.order_number,
        o.customer_id ?? '',
        o.customer?.name || (o.customer_id ? `Customer #${o.customer_id}` : 'Walk-In'),
        o.order_type || '',
        num(o.subtotal),
        num(o.discount_amount ?? o.discount),
        num(o.tax_amount ?? o.tax),
        num(o.total_amount),
        o.status,
        o.created_at || '',
        o.updated_at || '',
      ]),
    ];
    const csv = '\uFEFF' + lines.map((r) => r.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openInvoice = async (orderRow, print) => {
    const orderId = orderRow.id;
    try {
      setBusyKey(`${orderId}:${print ? 'print' : 'view'}`);
      setErrorMsg('');
      const res = await getInvoiceDetails(orderId);
      if (res && res.success) {
        setInvoice({ ...orderRow, ...res.data });
        setAutoPrint(Boolean(print));
      } else {
        setInvoice(orderRow);
        setAutoPrint(Boolean(print));
      }
    } catch (error) {
      console.error('Error fetching invoice details, showing row data:', error);
      setInvoice(orderRow);
      setAutoPrint(Boolean(print));
    } finally {
      setBusyKey(null);
    }
  };

  const closeInvoice = () => {
    setAutoPrint(false);
    setInvoice(null);
  };

  const choosePaper = (p) => {
    setPaper(p);
    try { localStorage.setItem('invoice_paper', p); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!invoice) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeInvoice(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [invoice]);

  useEffect(() => {
    if (!invoice || !autoPrint) return undefined;
    const t = setTimeout(async () => {
      try { if (document.fonts?.ready) await document.fonts.ready; } catch { /* ignore */ }
      setAutoPrint(false);
      window.print();
    }, 450);
    return () => clearTimeout(t);
  }, [invoice, autoPrint]);

  const invoiceModal = invoice && (
    <div className="sh-portal">
      <style>{invCss}</style>
      <style>{`@media print { @page { size: ${paper === 'a5' ? 'A5' : '80mm auto'}; margin: ${paper === 'a5' ? '8mm' : '0'}; } }`}</style>
      <div className="sh-ovl" onClick={closeInvoice}>
        <div className={`sh-modal ${paper}`} role="dialog" aria-modal="true" aria-label={tsh.receiptTitle} onClick={(e) => e.stopPropagation()}>
          <div className="sh-bar sh-noprint">
            <b>{tsh.receiptTitle} · #{invoice.order_number}</b>
            <div className="sh-paper" role="group" aria-label="Paper size">
              <button type="button" className={paper === 'thermal' ? 'on' : ''} aria-pressed={paper === 'thermal'} onClick={() => choosePaper('thermal')}>80mm</button>
              <button type="button" className={paper === 'a5' ? 'on' : ''} aria-pressed={paper === 'a5'} onClick={() => choosePaper('a5')}>A5</button>
            </div>
            <button className="sh-xbtn" onClick={closeInvoice} aria-label={tsh.closeBtn}><X size={18} /></button>
          </div>

          <div className="sh-stage"><div className="rc-wrap"><ReceiptView inv={invoice} paper={paper} tsh={tsh} lang={lang} /></div></div>

          <div className="sh-foot2 sh-noprint">
            <button className="shp-btn" onClick={closeInvoice}>{tsh.closeBtn}</button>
            <button className="shp-btn primary" onClick={() => window.print()}><Printer size={16} /> {tsh.printBtn}</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="sh">
        <div className="sh-top">
          <div>
            <h2>
              {tsh.heading}
              {lang === 'km' && <small>Sales History</small>}
            </h2>
            <p>{tsh.subHeading}</p>
          </div>
          <div className="sh-actions">
            <button className="sh-btn" onClick={exportCsv} disabled={visible.length === 0}><Download size={15} /> {tsh.exportCsv}</button>
            <button className="sh-btn primary" onClick={fetchOrders} disabled={loading}><RefreshCw size={15} className={loading ? 'sh-spin' : ''} /> {tsh.refresh}</button>
          </div>
        </div>

        {errorMsg && <div className="sh-err" role="alert"><span>{errorMsg}</span><button onClick={fetchOrders}>{tsh.tryAgain}</button></div>}

        {/* ✅ COMPACT & CLEAN TOP CARDS WITH DUAL-RING PROGRESS */}
        <div className="sh-tiles">
          <Tile
            label={tsh.statTotalInvoices}
            target={stats.count}
            icon={Receipt}
            tone="t-dark"
            hero
            delay={0}
            subText={isKm ? 'វិក្កយបត្រសរុប' : 'Invoices'}
          />

          <CircularGaugeTile
            label={tsh.statCompleted || (isKm ? 'បានបញ្ចប់ (Completed)' : 'Completed')}
            percent={stats.completionPct}
            countText={`${stats.completed} / ${stats.count}`}
            subText={isKm ? 'ជោគជ័យ' : 'Orders'}
            color="teal"
            delay={60}
          />

          <CircularGaugeTile
            label={isKm ? 'ការកម្មង់ដឹកជញ្ជូន' : 'Delivery Share'}
            percent={stats.deliveryPct}
            countText={`${stats.deliveryCount} / ${stats.count}`}
            subText={isKm ? 'ដឹកជញ្ជូន' : 'Deliveries'}
            color="amber"
            delay={110}
          />

          <Tile
            label={tsh.statRevenue}
            target={stats.revenue}
            prefix="$"
            decimals={2}
            icon={DollarSign}
            tone="t-blue"
            delay={160}
            subText={`≈ ${(Math.round((stats.revenue * EXCHANGE_RATE) / 100) * 100).toLocaleString('en-US')} ៛`}
          />
        </div>

        <section className="sh-panel">
          <div className="sh-tools">
            <div className="sh-left">
              <div className="sh-search">
                <Search size={15} />
                <input value={query} onChange={(e) => reset(setQuery)(e.target.value)} placeholder={tsh.searchPlaceholder} aria-label={tsh.searchPlaceholder} />
                {query && <button className="sh-x" onClick={() => reset(setQuery)('')} aria-label={tsh.clearSearch}><X size={14} /></button>}
              </div>
              <div className="sh-seg" role="group" aria-label="Filter by status">
                {FILTER_KEYS.map((f) => <button key={f.key} className={`sh-sb${filter === f.key ? ' on' : ''}`} aria-pressed={filter === f.key} onClick={() => reset(setFilter)(f.key)}>{f.label} <span style={{ opacity: .6 }}>{stats.counts[f.key]}</span></button>)}
              </div>
            </div>
            <div className="sh-right">
              <select className="sh-select" value={typeFilter} onChange={(e) => reset(setTypeFilter)(e.target.value)} aria-label="Filter by order type">
                <option value="all">{isKm ? 'គ្រប់ប្រភេទកម្មង់' : 'All Order Types'}</option>
                <option value="dine_in">{isKm ? '🍽️ នៅហាង (Dine-In)' : '🍽️ Dine-In'}</option>
                <option value="delivery">{isKm ? '🚚 ដឹកជញ្ជូន (Delivery)' : '🚚 Delivery'}</option>
              </select>

              <select className="sh-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort">
                <option value="newest">{tsh.sortNewest}</option>
                <option value="oldest">{tsh.sortOldest}</option>
                <option value="total">{tsh.sortTotal}</option>
              </select>
            </div>
          </div>

          <div className="sh-tablewrap">
            <div className="sh-gridwrap">
              <div className="sh-head">
                <span>{tsh.colInvoice || (isKm ? 'លេខវិក្កយបត្រ & ID' : 'Order # & ID')}</span>
                <span>{isKm ? 'អតិថិជន' : 'Customer'}</span>
                <span>{isKm ? 'ប្រភេទកម្មង់' : 'Order Type'}</span>
                <span style={{ textAlign: 'right' }}>{isKm ? 'សរុបរង' : 'Subtotal'}</span>
                <span style={{ textAlign: 'right' }}>{isKm ? 'បញ្ចុះតម្លៃ' : 'Discount'}</span>
                <span style={{ textAlign: 'right' }}>{isKm ? 'ពន្ធអាករ' : 'Tax'}</span>
                <span style={{ textAlign: 'right' }}>{tsh.colTotal || (isKm ? 'សរុបរួម' : 'Total')}</span>
                <span>{tsh.colStatus || (isKm ? 'ស្ថានភាព' : 'Status')}</span>
                <span>{tsh.colDate || (isKm ? 'កាលបរិច្ឆេទ' : 'Created / Updated')}</span>
                <span style={{ textAlign: 'right', paddingRight: 6 }}>{isKm ? 'សកម្មភាព' : 'Actions'}</span>
              </div>

              {loading ? (
                [0, 1, 2, 3, 4].map((i) => <div className="sh-skel" key={i}><i style={{ width: 36, height: 36, borderRadius: 10 }} /><i style={{ width: '30%' }} /></div>)
              ) : rows.length === 0 ? (
                <div className="sh-empty">
                  <b>{orders.length === 0 ? tsh.emptyNoData : tsh.emptyNoResult}</b>
                  {orders.length > 0 && tsh.emptyHint}
                </div>
              ) : (
                <div key={`${filter}-${typeFilter}-${sort}-${current}`}>
                  {rows.map((o, i) => {
                    const created = parts(o.created_at);
                    const updated = parts(o.updated_at);
                    const st = normStatus(o.status);
                    const subtotal = num(o.subtotal);
                    const discount = num(o.discount_amount ?? o.discount);
                    const tax = num(o.tax_amount ?? o.tax);
                    const total = num(o.total_amount);
                    const extraFee = Math.max(Number((total - (subtotal - discount + tax)).toFixed(2)), 0);
                    const typeInfo = orderTypeMeta(o.order_type, lang);
                    const TypeIcon = typeInfo.Icon;
                    const custName = o.customer?.name || (o.customer_id ? (isKm ? `អតិថិជន #${o.customer_id}` : `Customer #${o.customer_id}`) : (isKm ? 'អតិថិជនទូទៅ' : 'Walk-In'));

                    return (
                      <div className="sh-row" key={o.id ?? i} style={{ '--i': i }}>
                        {/* 1. Order Number + id */}
                        <div className="sh-who" onClick={() => openInvoice(o, false)}>
                          <span className="sh-ico"><Receipt size={16} /></span>
                          <div style={{ minWidth: 0 }}>
                            <b title={o.order_number}>{o.order_number}</b>
                            <span className="sh-sub">ID: #{o.id}</span>
                          </div>
                        </div>

                        {/* 2. Customer Only */}
                        <div className="sh-cust-box">
                          <span className="sh-cust-ava">
                            {o.customer?.name ? o.customer.name.trim().charAt(0).toUpperCase() : <User size={13} />}
                          </span>
                          <div className="sh-cust-meta">
                            <b title={custName}>{custName}</b>
                            <small>
                              {o.customer?.phone ? `📞 ${o.customer.phone}` : `ID: #${o.customer_id ?? '-'}`}
                            </small>
                          </div>
                        </div>

                        {/* 3. order_type */}
                        <div>
                          <span className={`sh-type-badge ${typeInfo.key}`}>
                            <TypeIcon size={12} />
                            {typeInfo.short}
                          </span>
                        </div>

                        {/* 4. subtotal */}
                        <div className="sh-num-col">{money(subtotal)}</div>

                        {/* 5. discount_amount */}
                        <div className="sh-num-col disc">
                          {discount > 0 ? `-${money(discount)}` : money(0)}
                        </div>

                        {/* 6. tax_amount */}
                        <div className="sh-num-col tax">
                          {tax > 0 ? `+${money(tax)}` : money(0)}
                        </div>

                        {/* 7. total_amount (+ extra delivery fee if any) */}
                        <div className="sh-amt">
                          {money(total)}
                          {extraFee > 0 && (
                            <small title="Delivery Fee Included">
                              (+{money(extraFee)} fee)
                            </small>
                          )}
                        </div>

                        {/* 8. status + Mini Progress Ring */}
                        <div className="sh-status-cell">
                          <MiniStatusRing status={o.status} />
                          <span className={`sh-badge ${st}`}>{statusLabel(o.status)}</span>
                        </div>

                        {/* 9. created_at & updated_at */}
                        <div className="sh-date">
                          <div title={`Created: ${o.created_at}`}>
                            🕒 {created.date} {created.time}
                          </div>
                          {o.updated_at && (
                            <small title={`Updated: ${o.updated_at}`}>
                              ↻ {updated.date} {updated.time}
                            </small>
                          )}
                        </div>

                        {/* 10. Well-spaced View & Print Actions */}
                        <div className="sh-acts">
                          <button className="sh-ib v" title={tsh.viewTitle} aria-label={tsh.viewTitle} disabled={busyKey !== null} onClick={() => openInvoice(o, false)}>
                            {busyKey === `${o.id}:view` ? <Loader2 size={15} className="sh-spin" /> : <Eye size={15} />}
                          </button>
                          <button className="sh-ib p" title={tsh.printTitle} aria-label={tsh.printTitle} disabled={busyKey !== null} onClick={() => openInvoice(o, true)}>
                            {busyKey === `${o.id}:print` ? <Loader2 size={15} className="sh-spin" /> : <Printer size={15} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {!loading && visible.length > 0 && (
            <div className="sh-foot">
              <span>{tsh.showing} <b>{start + 1}–{Math.min(start + PAGE_SIZE, visible.length)}</b> {tsh.of} <b>{visible.length}</b></span>
              <div className="sh-pager">
                <button className="sh-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={15} /></button>
                <span>{current} / {pages}</span>
                <button className="sh-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={15} /></button>
              </div>
            </div>
          )}
        </section>

        {invoiceModal && createPortal(invoiceModal, document.body)}
      </div>
    </Layout>
  );
}