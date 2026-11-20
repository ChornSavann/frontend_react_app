// src/pages/ManageDeliveryPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Truck,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Phone,
  Navigation,
  ExternalLink,
  Loader2,
  ChefHat,
  Bike,
  User,
  Receipt,
  Store,
  Star,
  Check,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  getDeliveryOrders,
  updateDeliveryStatus,
  cancelDelivery,
} from "../services/deliveryService";
import ToastrContainer, { toastr } from "../components/Toastr";
import { useTranslation } from "../utils/translations";
import { modalCss } from "./products/modalStyles";

const PAGE_SIZE = 10;

const css = `
.dl, .dl-portal {
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
html.dark .dl, html.dark .dl-portal,
body.dark .dl, body.dark .dl-portal,
[data-theme="dark"] .dl, [data-theme="dark"] .dl-portal,
.dark .dl, .dark .dl-portal {
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

.dl {
  padding: 24px;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif;
  color: var(--ink);
  background: var(--bg-page);
  text-align: left;
  font-size: 13px;
  transition: background .25s ease, color .25s ease;
}
.dl *, .dl *::before, .dl *::after { box-sizing: border-box; }
.dl h2 { margin: 0; color: var(--ink); font-family: inherit; }

.dl-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.dl-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.dl-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.dl-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dl-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: var(--surface); border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s, background .15s; }
.dl-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: var(--line-hover); background: var(--surface-2); }
.dl-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.dl-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; background: linear-gradient(135deg,#11867d,#0d6b64); }
.dl-btn:disabled { opacity: .6; cursor: not-allowed; }
.dl button:focus-visible, .dl select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.dl-spin { animation: dl-rot .8s linear infinite; }

.dl-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
html.dark .dl-err, body.dark .dl-err, [data-theme="dark"] .dl-err, .dark .dl-err { background: rgba(239,68,68,.15); color: #fca5a5; border-color: rgba(239,68,68,.35); }
.dl-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

.dl-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.dl-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: var(--surface); border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s, background .22s; animation: dl-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.dl-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: var(--line-hover); }
.dl-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; }
.t-green { background: #e7f8ee; color: #15803d; }
.t-amber { background: #fff1d6; color: #d97706; }
.t-blue { background: #e3eeff; color: #2563eb; }
html.dark .t-green, body.dark .t-green, [data-theme="dark"] .t-green, .dark .t-green { background: rgba(34,197,94,.18); color: #4ade80; }
html.dark .t-amber, body.dark .t-amber, [data-theme="dark"] .t-amber, .dark .t-amber { background: rgba(245,158,11,.18); color: #fbbf24; }
html.dark .t-blue, body.dark .t-blue, [data-theme="dark"] .t-blue, .dark .t-blue { background: rgba(59,130,246,.18); color: #60a5fa; }

.dl-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.dl-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; color: var(--ink); }
.dl-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.dl-tile.hero span { color: #9db8b4; }
.dl-tile.hero b { color: #f4faf8; }
.dl-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

.dl-panel { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: dl-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.dl-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.dl-left, .dl-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dl-search { position: relative; display: flex; align-items: center; width: 300px; max-width: 100%; }
.dl-search > svg { position: absolute; left: 12px; color: var(--muted); pointer-events: none; }
.dl-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: var(--surface-3); border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.dl-search input::placeholder { color: var(--muted); }
.dl-search input:focus { background: var(--surface); border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.15); }
.dl-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: var(--muted); }
.dl-x:hover { background: var(--line); color: var(--ink); }
.dl-seg { display: flex; gap: 2px; padding: 3px; background: var(--surface-3); border-radius: 11px; flex-wrap: wrap; }
.dl-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.dl-sb:hover { color: var(--ink); }
.dl-sb.on { background: var(--surface); color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.dl-select { height: 38px; max-width: 190px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: var(--surface-3) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.dl-select:hover { border-color: var(--line-hover); }

/* list */
.dl-head, .dl-row { display: grid; grid-template-columns: minmax(0,1.25fr) minmax(0,1.25fr) minmax(0,1.9fr) minmax(0,1fr) minmax(0,.8fr) 148px 44px; gap: 14px; align-items: center; padding: 0 18px; }
.dl-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: var(--surface-2); border-bottom: 1px solid var(--line); }
.dl-row { min-height: 66px; border-bottom: 1px solid var(--line); transition: background .12s; animation: dl-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.dl-row:last-child { border-bottom: 0; }
.dl-row:hover { background: var(--surface-2); }
.dl-who { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
.dl-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ink); }
.dl-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }

.dl-acts { display: flex; gap: 6px; justify-content: flex-end; }
.dl-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: var(--surface); color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.dl-ib:hover { transform: translateY(-1px); }
.dl-ib.v:hover { background: rgba(37,99,235,.14); color: #3b82f6; border-color: rgba(37,99,235,.3); }
.dl-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.dl-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.dl-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.dl-skel { height: 66px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.dl-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,var(--surface-3),var(--surface-2),var(--surface-3)); background-size: 200% 100%; animation: dl-shine 1.3s linear infinite; }

.dl-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: var(--surface-2); color: var(--muted); font-size: 12.5px; }
.dl-pager { display: flex; align-items: center; gap: 6px; }
.dl-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); transition: background .15s; }
.dl-pg:hover:not(:disabled) { background: var(--surface-3); }
.dl-pg:disabled { opacity: .4; cursor: not-allowed; }
.dl-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes dl-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes dl-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes dl-shine { to { background-position: -200% 0; } }
@keyframes dl-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .dl-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 900px) {
  .dl-head, .dl-row { grid-template-columns: minmax(0,1.25fr) minmax(0,1.25fr) minmax(0,1.9fr) minmax(0,.8fr) 148px 44px; } .dl-hide-md { display: none; }
}
@media (max-width: 720px) {
  .dl { padding: 14px; } .dl-tiles { grid-template-columns: 1fr; }
  .dl-head { display: none; }
  .dl-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; } .dl-hide-m { display: none; }
  .dl-search, .dl-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .dl-tile, .dl-panel, .dl-row, .dl-skel i, .dl-spin { animation: none !important; } .dl-tile { transition: none; } }

.dl-num { all: unset; cursor: pointer; display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 800; font-size: 13px; color: var(--teal); }
.dl-num:hover { text-decoration: underline; }
.dl-num:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; border-radius: 4px; }
.dl-av { width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0; display: grid; place-items: center; font-size: 14px; font-weight: 800; color: #fff; background: linear-gradient(145deg,#3bb5a4,#1a7d70); }
.dl-route { display: grid; gap: 3px; min-width: 0; font-size: 12px; }
.dl-route > div { display: flex; align-items: center; gap: 6px; min-width: 0; }
.dl-route span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dl-route .from { color: var(--muted); font-size: 11.5px; }
.dl-route .to { font-weight: 700; color: var(--ink); }
.dl-route svg { flex-shrink: 0; }
.dl-route .to svg { color: var(--teal); }
.dl-route em { font-style: normal; flex-shrink: 0; padding: 0 7px; border-radius: 99px; background: var(--teal-soft); color: var(--teal-d); font-size: 11px; font-weight: 700; }
.dl-cour { display: block; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ink); }
.dl-amt { text-align: right; font-weight: 800; font-size: 14px; color: var(--teal); font-variant-numeric: tabular-nums; }
.dl-stwrap { position: relative; display: flex; align-items: center; }
.dl-status { appearance: none; -webkit-appearance: none; width: 100%; height: 32px; padding: 0 28px 0 12px; font: inherit; font-size: 12px; font-weight: 800; border: 0; border-radius: 99px; cursor: pointer; outline: none; background-repeat: no-repeat; background-position: right 10px center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); transition: filter .15s, box-shadow .15s; }
.dl-status:hover:not(:disabled) { filter: brightness(.96); }
.dl-status:focus-visible { box-shadow: 0 0 0 3px rgba(15,118,110,.25); }
.dl-status:disabled { opacity: .6; cursor: wait; }
.dl-status.pending { background-color: #fff4e0; color: #b45309; }
.dl-status.preparing { background-color: #e0f0fb; color: #0369a1; }
.dl-status.picked_up, .dl-status.on_the_way { background-color: #eee8ff; color: #6d28d9; }
.dl-status.delivered { background-color: #ccfbf1; color: #0f766e; border: 1.5px solid #5eead4; }
.dl-status.completed { background-color: #e7f8ee; color: #15803d; }
.dl-status.cancelled { background-color: #fdecea; color: #c0392b; }

html.dark .dl-status.pending, body.dark .dl-status.pending, [data-theme="dark"] .dl-status.pending, .dark .dl-status.pending { background-color: rgba(245,158,11,.2); color: #fbbf24; }
html.dark .dl-status.preparing, body.dark .dl-status.preparing, [data-theme="dark"] .dl-status.preparing, .dark .dl-status.preparing { background-color: rgba(14,165,233,.2); color: #38bdf8; }
html.dark .dl-status.picked_up, html.dark .dl-status.on_the_way, body.dark .dl-status.picked_up, body.dark .dl-status.on_the_way, [data-theme="dark"] .dl-status.picked_up, [data-theme="dark"] .dl-status.on_the_way, .dark .dl-status.picked_up, .dark .dl-status.on_the_way { background-color: rgba(139,92,246,.22); color: #c4b5fd; }
html.dark .dl-status.delivered, body.dark .dl-status.delivered, [data-theme="dark"] .dl-status.delivered, .dark .dl-status.delivered { background-color: rgba(20,184,166,.22); color: #2dd4bf; border-color: rgba(45,212,191,.4); }
html.dark .dl-status.completed, body.dark .dl-status.completed, [data-theme="dark"] .dl-status.completed, .dark .dl-status.completed { background-color: rgba(34,197,94,.2); color: #4ade80; }
html.dark .dl-status.cancelled, body.dark .dl-status.cancelled, [data-theme="dark"] .dl-status.cancelled, .dark .dl-status.cancelled { background-color: rgba(239,68,68,.2); color: #fca5a5; }
.dl-status option { background: var(--surface); color: var(--ink); }

/* ✅ ស្លាកស្ថានភាពថេរ (សម្រាប់តែ Completed ដែលមានសញ្ញាគ្រីស និង Cancelled ដែលមិនអាចកែវិញបាន) */
.dl-status-static {
  width: 100%;
  height: 32px;
  padding: 0 12px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  border-radius: 99px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  user-select: none;
  cursor: not-allowed;
}
.dl-status-static.completed {
  background-color: #e7f8ee;
  color: #15803d;
  border: 1.5px solid #bbf7d0;
}
.dl-status-static.cancelled {
  background-color: #fdecea;
  color: #c0392b;
  border: 1.5px solid #f6cfca;
}

html.dark .dl-status-static.completed,
body.dark .dl-status-static.completed,
[data-theme="dark"] .dl-status-static.completed,
.dark .dl-status-static.completed {
  background-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.35);
}

html.dark .dl-status-static.cancelled,
body.dark .dl-status-static.cancelled,
[data-theme="dark"] .dl-status-static.cancelled,
.dark .dl-status-static.cancelled {
  background-color: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.35);
}

.dl-stspin { position: absolute; right: 30px; color: var(--teal); }
@media (max-width: 720px) {
  .dl-row { grid-template-columns: minmax(0,1fr) auto; } .dl-amt { grid-column: 2; grid-row: 1; } .dl-stwrap { grid-column: 1; grid-row: 3; } .dl-acts { grid-column: 2; grid-row: 3; }
}
@media (prefers-reduced-motion: reduce) { .dl-status { transition: none; } }
`;

const dlModalCss = `
.dl-portal .pm { background: var(--surface); color: var(--ink); border: 1px solid var(--line); }
.dl-portal .pm-head, .dl-portal .pm-foot { background: var(--surface); border-color: var(--line); }
.dl-portal .pm-head h3 { color: var(--ink); }
.dl-portal .pm-head p { color: var(--muted); }
.dl-portal .pm-sec { background: var(--surface-2); border-color: var(--line); }
.dl-portal .pm-sec h4 { color: var(--ink); }
.dl-portal .pm-chip { background: var(--surface-3); color: var(--ink); border-color: var(--line); }
.dl-portal .pm-close { background: var(--surface-3); color: var(--muted); }
.dl-portal .pm-close:hover { background: rgba(239,68,68,.18); color: #ef4444; }

.dl-steps { display: flex; align-items: flex-start; padding: 4px 2px 0; }
.dl-step { all: unset; cursor: pointer; flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; position: relative; text-align: center; }
.dl-step::before { content: ''; position: absolute; top: 17px; left: -50%; width: 100%; height: 3px; background: var(--line); z-index: 0; transition: background .3s; }
.dl-step:first-child::before { display: none; }
.dl-step.done::before, .dl-step.now::before { background: var(--teal); }
.dl-dot { position: relative; z-index: 1; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--surface); border: 2px solid var(--line-hover); color: var(--muted); transition: all .25s; }
.dl-step:hover:not(:disabled) .dl-dot { border-color: var(--teal); color: var(--teal); transform: translateY(-1px); }
.dl-step.done .dl-dot { background: #0f766e; border-color: #0f766e; color: #fff; }
.dl-step.now .dl-dot { background: #c8f169; border-color: #8fc828; color: #0c2526; box-shadow: 0 0 0 5px rgba(200,241,105,.35); }
.dl-step span { font-size: 11.5px; font-weight: 700; color: var(--muted); line-height: 1.3; }
.dl-step.now span, .dl-step.done span { color: var(--ink); }
.dl-step:disabled { cursor: not-allowed; }
.dl-step:focus-visible .dl-dot { outline: 2px solid var(--teal); outline-offset: 3px; }

.dl-cancelled { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 14px; background: #fff3f1; color: #b42318; border: 1px solid #f6cfca; font-weight: 700; }
html.dark .dl-cancelled, body.dark .dl-cancelled, [data-theme="dark"] .dl-cancelled, .dark .dl-cancelled { background: rgba(239,68,68,.15); color: #fca5a5; border-color: rgba(239,68,68,.35); }

.dl-ids { display: flex; gap: 6px; flex-wrap: wrap; }
.dl-cards { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
.dl-card { padding: 14px 16px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface-2); }
.dl-card.wide { grid-column: 1 / -1; }
.dl-card h5 { margin: 0 0 10px; display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 800; color: var(--teal-d); font-family: inherit; }
.dl-kv { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px dashed var(--line); font-size: 13px; }
.dl-kv:last-child { border-bottom: 0; }
.dl-kv span { color: var(--muted); white-space: nowrap; }
.dl-kv b { text-align: right; font-weight: 700; word-break: break-word; color: var(--ink); }
.dl-kv a { color: var(--teal-d); text-decoration: none; font-weight: 700; }
.dl-kv a:hover { text-decoration: underline; }
.dl-sum .tot { margin-top: 4px; padding-top: 9px; border-top: 1.5px solid var(--line); border-bottom: 0; }
.dl-sum .tot b { font-size: 18px; color: var(--teal-d); }
.dl-pts { display: inline-flex; align-items: center; gap: 4px; padding: 1px 9px; border-radius: 99px; background: #fff1d6; color: #b45309; font-size: 12px; font-weight: 700; }
html.dark .dl-pts, body.dark .dl-pts, [data-theme="dark"] .dl-pts, .dark .dl-pts { background: rgba(245,158,11,.2); color: #fbbf24; }

.dl-mapbox { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.dl-maphead { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding: 10px 14px; background: var(--surface-2); border-bottom: 1px solid var(--line); font-size: 12.5px; font-weight: 700; color: var(--ink); }
.dl-gmap { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 9px; background: var(--teal-soft); color: var(--teal-d); text-decoration: none; font-weight: 700; font-size: 12px; }
.dl-gmap:hover { filter: brightness(.95); }
.pm-btn.warn { color: #c0392b; background: #fff5f4; border-color: #f6cfca; }
.pm-btn.warn:hover:not(:disabled) { background: #fdecea; }
html.dark .pm-btn.warn, body.dark .pm-btn.warn, [data-theme="dark"] .pm-btn.warn, .dark .pm-btn.warn { background: rgba(239,68,68,.15); color: #fca5a5; border-color: rgba(239,68,68,.35); }
@media (max-width: 680px) { .dl-cards { grid-template-columns: 1fr; } .dl-step span { font-size: 10.5px; } }
@media (prefers-reduced-motion: reduce) { .dl-dot { transition: none; } }
`;

const STEPS = ["pending", "preparing", "on_the_way", "delivered", "completed"];

const money = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? s
    : d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const calcDistanceKm = (lat1, lon1, lat2, lon2) => {
  const nLat1 = Number(lat1),
    nLon1 = Number(lon1),
    nLat2 = Number(lat2),
    nLon2 = Number(lon2);
  if (!nLat1 || !nLon1 || !nLat2 || !nLon2) return null;
  const R = 6371;
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Number(
    (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2),
  );
};

const normalizeRecord = (raw) => {
  if (!raw) return null;
  const isDeliveryRoot =
    raw.order_id !== undefined ||
    (raw.receiver_name !== undefined && !raw.delivery);
  const del = isDeliveryRoot ? raw : raw.delivery || {};
  const ord = isDeliveryRoot ? raw.order || {} : raw;
  const cust = ord.customer || raw.customer || {};
  const deliveryId = isDeliveryRoot ? raw.id : (del.id ?? raw.id);
  const orderId = del.order_id ?? ord.id ?? raw.order_id ?? raw.id;
  const toNum = (v) => (v !== undefined && v !== null ? Number(v) : null);
  const storeLat = toNum(del.store_lat),
    storeLng = toNum(del.store_lng),
    custLat = toNum(del.customer_lat),
    custLng = toNum(del.customer_lng);

  return {
    raw,
    id: deliveryId,
    delivery_id: deliveryId,
    order_id: orderId,
    pickup_address: del.pickup_address || "-",
    delivery_address: del.delivery_address || cust.address || "-",
    delivery_fee: Number(del.delivery_fee ?? 0),
    delivery_partner: del.delivery_partner || "-",
    receiver_name: del.receiver_name || cust.name || "Walk-In",
    receiver_phone: del.receiver_phone || cust.phone || "-",
    note: del.note ?? "-",
    status: String(del.status || ord.status || "pending").toLowerCase(),
    created_at: del.created_at || ord.created_at || null,
    updated_at: del.updated_at || ord.updated_at || null,
    store_lat: storeLat,
    store_lng: storeLng,
    customer_lat: custLat,
    customer_lng: custLng,
    distance_km: calcDistanceKm(storeLat, storeLng, custLat, custLng),
    order_number: ord.order_number || `ORD-${orderId}`,
    order_data: {
      id: ord.id ?? orderId,
      store_id: ord.store_id ?? null,
      order_number: ord.order_number || `ORD-${orderId}`,
      customer_id: ord.customer_id ?? cust.id ?? null,
      user_id: ord.user_id ?? null,
      subtotal: Number(ord.subtotal ?? 0),
      discount_amount: Number(ord.discount_amount ?? 0),
      tax_amount: Number(ord.tax_amount ?? 0),
      total_amount: Number(ord.total_amount ?? 0),
      status: String(ord.status || del.status || "pending").toLowerCase(),
      order_type: ord.order_type || "delivery",
      created_at: ord.created_at || null,
      updated_at: ord.updated_at || null,
    },
    customer_data: {
      id: cust.id ?? ord.customer_id ?? null,
      name: cust.name || del.receiver_name || "Guest",
      email: cust.email || "-",
      phone: cust.phone || del.receiver_phone || "-",
      points: cust.points ?? 0,
      address: cust.address || "-",
      created_at: cust.created_at || null,
      updated_at: cust.updated_at || null,
    },
  };
};

function DeliveryRoutePreviewMap({
  storeLat,
  storeLng,
  custLat,
  custLng,
  distanceKm,
  td = {},
  lang = "km",
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!custLat || !custLng) return undefined;
    const ensureLeaflet = () =>
      new Promise((resolve) => {
        if (window.L) return resolve(window.L);
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve(window.L);
        document.body.appendChild(script);
      });

    let active = true;
    ensureLeaflet().then((L) => {
      if (!active || !mapRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      const sLat = Number(storeLat) || 11.5564;
      const sLng = Number(storeLng) || 104.9282;
      const cLat = Number(custLat);
      const cLng = Number(custLng);
      const map = L.map(mapRef.current);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
      const storeLabel =
        td.mapStorePopup ||
        (lang === "km" ? "🏪 ទីតាំងហាង" : "🏪 Store Location");
      const custLabel =
        td.mapCustPopup ||
        (lang === "km" ? "📍 ទីតាំងអតិថិជន" : "📍 Customer Location");
      const storeMarker = L.marker([sLat, sLng])
        .addTo(map)
        .bindPopup(`${storeLabel} (${sLat}, ${sLng})`);
      const custMarker = L.marker([cLat, cLng])
        .addTo(map)
        .bindPopup(`${custLabel} (${cLat}, ${cLng})`);
      const line = L.polyline(
        [
          [sLat, sLng],
          [cLat, cLng],
        ],
        { color: "#0f766e", weight: 3.5, dashArray: "6, 6" },
      ).addTo(map);
      map.fitBounds(
        L.featureGroup([storeMarker, custMarker, line]).getBounds().pad(0.28),
      );
      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 180);
    });

    return () => {
      active = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    storeLat,
    storeLng,
    custLat,
    custLng,
    td.mapStorePopup,
    td.mapCustPopup,
    lang,
  ]);

  if (!custLat || !custLng) return null;
  const gmapUrl = `https://www.google.com/maps/dir/?api=1&origin=${storeLat},${storeLng}&destination=${custLat},${custLng}`;

  return (
    <div className="dl-mapbox">
      <div className="dl-maphead">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Navigation size={15} style={{ color: "var(--teal)" }} />{" "}
          {td.mapRouteLabel ||
            (lang === "km" ? "ផ្លូវពីហាង ➔ អតិថិជន" : "Store ➔ Customer Route")}
          {distanceKm !== null && (
            <span
              className="dl-pts"
              style={{ background: "var(--teal-soft)", color: "var(--teal-d)" }}
            >
              ~ {distanceKm} km
            </span>
          )}
        </span>
        <a href={gmapUrl} target="_blank" rel="noreferrer" className="dl-gmap">
          Google Maps <ExternalLink size={13} />
        </a>
      </div>
      <div ref={mapRef} style={{ width: "100%", height: 240 }} />
    </div>
  );
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
  return v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Tile({
  label,
  target,
  prefix = "",
  decimals = 2,
  icon: Icon,
  tone,
  hero,
  delay,
}) {
  const shown = useCountUp(target, decimals);
  return (
    <div
      className={`dl-tile${hero ? " hero" : ""}`}
      style={{ "--d": `${delay}ms` }}
    >
      <div className={`dl-chip-i ${tone}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <span>{label}</span>
        <b>
          {prefix}
          {shown}
        </b>
      </div>
    </div>
  );
}

export default function ManageDeliveryPage() {
  const { lang, t } = useTranslation();
  const isKm = lang === "km" || lang === "kh";
  const td = t?.manageDelivery || {};

  const tr = (key, kmText, enText) => td[key] || (isKm ? kmText : enText);

  const [rawList, setRawList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [viewItem, setViewItem] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const STATUS_OPTIONS = [
    {
      value: "pending",
      label: tr("filterPending", "រង់ចាំ (Pending)", "Pending"),
    },
    {
      value: "preparing",
      label: tr("filterPreparing", "កំពុងរៀបចំ (Preparing)", "Preparing"),
    },
    {
      value: "on_the_way",
      label: tr("filterOnTheWay", "កំពុងដឹក (On the Way)", "On the Way"),
    },
    {
      value: "delivered",
      label: tr("filterDelivered", "ដឹកដល់ទីតាំង (Delivered)", "Delivered"),
    },
    {
      value: "completed",
      label: tr("filterCompleted", "បានបញ្ចប់ (Completed)", "Completed"),
    },
    {
      value: "cancelled",
      label: tr("filterCancelled", "បានបោះបង់ (Cancelled)", "Cancelled"),
    },
  ];

  const STATUS_LABELS = useMemo(() => {
    const map = {};
    STATUS_OPTIONS.forEach((o) => {
      map[o.value] = o.label;
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, td]);

  const FILTERS = [
    { key: "all", label: tr("filterAll", "ទាំងអស់", "All") },
    { key: "pending", label: tr("filterPending", "រង់ចាំ", "Pending") },
    {
      key: "on_the_way",
      label: tr("filterOnTheWay", "កំពុងដឹក", "On the Way"),
    },
    {
      key: "completed",
      label: tr("filterCompleted", "បានបញ្ចប់", "Completed"),
    },
    {
      key: "cancelled",
      label: tr("filterCancelled", "បានបោះបង់", "Cancelled"),
    },
  ];

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  useEffect(() => {
    if (!viewItem) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setViewItem(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewItem]);

  useEffect(() => {
    setConfirmCancel(false);
  }, [viewItem?.id]);

  const fetchDeliveryOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getDeliveryOrders();
      const list = res?.data?.data || res?.data || res || [];
      setRawList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching delivery orders:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        tr(
          "fetchError",
          "មិនអាចទាញយកទិន្នន័យដឹកជញ្ជូនបានទេ",
          "Failed to load delivery orders",
        );
      setErrorMsg(msg);
      toastr.error(tr("toastErrorTitle", "បរាជ័យ", "Error"), msg);
    } finally {
      setLoading(false);
    }
  };

  const deliveries = useMemo(
    () => rawList.map(normalizeRecord).filter(Boolean),
    [rawList],
  );

  // ✅ មុខងារបោះបង់ការដឹកជញ្ជូនតាមរយៈ POST /orders/cancel-order/{orderId}
  const handleCancelDelivery = async (item) => {
    if (item.status === "cancelled" || item.status === "completed") {
      return;
    }

    const orderId = item.order_id || item.order_data?.id || item.id;
    const targetDeliveryId = item.delivery_id || item.id;
    if (!orderId) return;

    try {
      setUpdatingId(targetDeliveryId);
      await cancelDelivery(orderId, {
        status: "cancelled",
        delivery_id: targetDeliveryId,
        reason: item.note || "Cancelled from Delivery Management",
      });

      try {
        await updateDeliveryStatus(targetDeliveryId, "cancelled");
      } catch {
        /* ignore if already updated by backend */
      }

      toastr.success(
        tr("toastSuccessTitle", "ជោគជ័យ", "Success"),
        tr(
          "cancelledBanner",
          "ការដឹកជញ្ជូននេះត្រូវបានបោះបង់រួចរាល់!",
          "Delivery order cancelled successfully!",
        ),
      );

      const nowIso = new Date().toISOString();
      setRawList((prev) =>
        prev.map((r) => {
          const norm = normalizeRecord(r);
          if (String(norm.id) !== String(targetDeliveryId)) return r;
          if (r.order)
            return {
              ...r,
              status: "cancelled",
              updated_at: nowIso,
              order: { ...r.order, status: "cancelled", updated_at: nowIso },
            };
          if (r.delivery)
            return {
              ...r,
              status: "cancelled",
              updated_at: nowIso,
              delivery: {
                ...r.delivery,
                status: "cancelled",
                updated_at: nowIso,
              },
            };
          return { ...r, status: "cancelled", updated_at: nowIso };
        }),
      );

      if (viewItem && String(viewItem.id) === String(targetDeliveryId)) {
        setViewItem((prev) => ({
          ...prev,
          status: "cancelled",
          updated_at: nowIso,
          order_data: {
            ...prev.order_data,
            status: "cancelled",
            updated_at: nowIso,
          },
        }));
      }
    } catch (err) {
      console.error("Error cancelling delivery:", err);
      const errData = err?.response?.data;
      const errMsg = errData?.errors
        ? Object.values(errData.errors).flat().join(" | ")
        : errData?.message ||
          tr(
            "updateError",
            "មិនអាចបោះបង់ការដឹកជញ្ជូនបានទេ",
            "Failed to cancel delivery",
          );
      toastr.error(tr("toastErrorTitle", "បរាជ័យ", "Error"), errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  // ✅ កែប្រែស្ថានភាពដឹកជញ្ជូន (អនុញ្ញាតឱ្យ 'delivered' ប្ដូរទៅ 'completed' បានធម្មតា)
  const handleUpdateStatus = async (item, newStatus) => {
    if (item.status === "cancelled") {
      toastr.error(
        tr("toastErrorTitle", "មិនអាចកែប្រែបានទេ", "Action Blocked"),
        tr(
          "cancelledBanner",
          "ការកម្មង់នេះត្រូវបានបោះបង់ និងលុបទិន្នន័យរួចហើយ!",
          "This order was cancelled and deleted!",
        ),
      );
      return;
    }

    const isFullyCompleted =
      item.status === "completed" && item.order_data?.status === "completed";
    if (isFullyCompleted) {
      return;
    }

    if (newStatus === "cancelled") {
      return handleCancelDelivery(item);
    }

    const targetId = item.delivery_id || item.id;
    if (!targetId) return;
    try {
      setUpdatingId(targetId);
      await updateDeliveryStatus(targetId, newStatus);
      toastr.success(
        tr("toastSuccessTitle", "ជោគជ័យ", "Success"),
        tr(
          "toastUpdateSuccessMsg",
          "បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពដឹកជញ្ជូនរួចរាល់!",
          "Delivery status updated successfully!",
        ),
      );

      const nowIso = new Date().toISOString();
      const nextOrderStatus =
        newStatus === "completed" ? "completed" : item.order_data?.status;

      setRawList((prev) =>
        prev.map((r) => {
          const norm = normalizeRecord(r);
          if (String(norm.id) !== String(targetId)) return r;
          if (r.order)
            return {
              ...r,
              status: newStatus,
              updated_at: nowIso,
              order: {
                ...r.order,
                status: nextOrderStatus,
                updated_at: nowIso,
              },
            };
          if (r.delivery)
            return {
              ...r,
              status: nextOrderStatus,
              updated_at: nowIso,
              delivery: {
                ...r.delivery,
                status: newStatus,
                updated_at: nowIso,
              },
            };
          return { ...r, status: newStatus, updated_at: nowIso };
        }),
      );

      if (viewItem && String(viewItem.id) === String(targetId)) {
        setViewItem((prev) => ({
          ...prev,
          status: newStatus,
          updated_at: nowIso,
          order_data: {
            ...prev.order_data,
            status: nextOrderStatus,
            updated_at: nowIso,
          },
        }));
      }
    } catch (err) {
      console.error("Error updating delivery status:", err);
      const errData = err?.response?.data;
      const errMsg = errData?.errors
        ? Object.values(errData.errors).flat().join(" | ")
        : errData?.message ||
          tr(
            "updateError",
            "មិនអាចកែប្រែស្ថានភាពបានទេ",
            "Failed to update delivery status",
          );
      toastr.error(tr("toastErrorTitle", "បរាជ័យ", "Error"), errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    let totalFee = 0;
    const counts = {
      all: deliveries.length,
      pending: 0,
      on_the_way: 0,
      completed: 0,
      cancelled: 0,
    };
    deliveries.forEach((d) => {
      const st = d.status;
      if (st === "pending" || st === "preparing") counts.pending += 1;
      else if (st === "on_the_way" || st === "picked_up" || st === "delivered")
        counts.on_the_way += 1;
      else if (st === "completed") counts.completed += 1;
      else if (st === "cancelled") counts.cancelled += 1;
      if (st !== "cancelled") totalFee += Number(d.delivery_fee || 0);
    });
    return { counts, totalFee };
  }, [deliveries]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = deliveries.filter((d) => {
      const st = d.status;
      let matchStatus = statusFilter === "all" || st === statusFilter;
      if (statusFilter === "pending")
        matchStatus = st === "pending" || st === "preparing";
      else if (statusFilter === "on_the_way")
        matchStatus =
          st === "on_the_way" || st === "picked_up" || st === "delivered";
      else if (statusFilter === "completed") matchStatus = st === "completed";
      const matchSearch =
        !q ||
        [
          d.id,
          d.order_id,
          d.order_number,
          d.receiver_name,
          d.receiver_phone,
          d.customer_data?.email,
          d.delivery_address,
          d.pickup_address,
          d.delivery_partner,
          d.note,
        ].some((x) =>
          String(x || "")
            .toLowerCase()
            .includes(q),
        );
      return matchStatus && matchSearch;
    });
    const by = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      total: (a, b) => b.order_data.total_amount - a.order_data.total_amount,
    }[sort];
    return [...list].sort(by);
  }, [deliveries, search, statusFilter, sort]);

  const pages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = filteredOrders.slice(start, start + PAGE_SIZE);
  const reset = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  const exportCsv = () => {
    const lines = [
      [
        "Delivery ID",
        "Order ID",
        "Order Number",
        "Store ID",
        "User ID",
        "Customer ID",
        "Customer Name",
        "Customer Email",
        "Customer Phone",
        "Customer Points",
        "Customer Default Address",
        "Receiver Name",
        "Receiver Phone",
        "Pickup Address",
        "Delivery Address",
        "Delivery Partner",
        "Subtotal ($)",
        "Discount ($)",
        "Tax ($)",
        "Delivery Fee ($)",
        "Total Amount ($)",
        "Order Type",
        "Delivery Status",
        "Order Status",
        "Note",
        "Store Lat",
        "Store Lng",
        "Customer Lat",
        "Customer Lng",
        "Created At",
        "Updated At",
      ],
      ...filteredOrders.map((d) => [
        d.id,
        d.order_id,
        d.order_number,
        d.order_data.store_id ?? "",
        d.order_data.user_id ?? "",
        d.customer_data.id ?? "",
        d.customer_data.name,
        d.customer_data.email,
        d.customer_data.phone,
        d.customer_data.points,
        d.customer_data.address,
        d.receiver_name,
        d.receiver_phone,
        d.pickup_address,
        d.delivery_address,
        d.delivery_partner,
        d.order_data.subtotal,
        d.order_data.discount_amount,
        d.order_data.tax_amount,
        d.delivery_fee,
        d.order_data.total_amount,
        d.order_data.order_type,
        d.status,
        d.order_data.status,
        d.note,
        d.store_lat ?? "",
        d.store_lng ?? "",
        d.customer_lat ?? "",
        d.customer_lng ?? "",
        d.created_at || "",
        d.updated_at || "",
      ]),
    ];
    const csv =
      "\uFEFF" +
      lines
        .map((r) =>
          r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "deliveries-all-fields.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const v = viewItem;
  const stepIndex = v
    ? v.status === "picked_up"
      ? STEPS.indexOf("on_the_way")
      : STEPS.indexOf(v.status)
    : -1;
  const busy = v && updatingId === v.id;
  const StepLabels = {
    pending: STATUS_LABELS.pending,
    preparing: STATUS_LABELS.preparing,
    on_the_way: STATUS_LABELS.on_the_way,
    delivered: STATUS_LABELS.delivered,
    completed: STATUS_LABELS.completed,
  };
  const stepShort = (s) => (StepLabels[s] || s).split(" (")[0];
  const StepIcon = {
    pending: Clock,
    preparing: ChefHat,
    on_the_way: Bike,
    delivered: Package,
    completed: CheckCircle2,
  };

  const isModalCompleted =
    v && v.status === "completed" && v.order_data?.status === "completed";

  const deliveryModal = v && (
    <div className="dl-portal">
      <style>
        {modalCss}
        {dlModalCss}
      </style>
      <div className="pm-overlay" onClick={() => setViewItem(null)}>
        <div
          className="pm"
          style={{ maxWidth: 820 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Delivery details"
        >
          <div className="pm-head">
            <div className="pm-head-l">
              <div className="pm-ico">
                <Truck size={20} strokeWidth={2.2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3>{v.order_number}</h3>
                <p>
                  {tr(
                    "modalSubTitle",
                    "ព័ត៌មានលម្អិតការដឹកជញ្ជូន",
                    "Delivery Details",
                  )}{" "}
                  · Delivery #{v.id}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="pm-close"
              onClick={() => setViewItem(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="pm-body">
            {v.status === "cancelled" ? (
              <div className="dl-cancelled">
                <XCircle size={20} />{" "}
                <span>
                  {tr(
                    "cancelledBanner",
                    "ការដឹកជញ្ជូននេះត្រូវបានបោះបង់ (ទិន្នន័យកម្មង់ត្រូវបានលុប មិនអាចកែប្រែវិញបានទេ)",
                    "This delivery was cancelled and cannot be restored",
                  )}
                </span>
              </div>
            ) : (
              <section className="pm-sec">
                <h4>
                  {tr(
                    "statusSectionTitle",
                    "ស្ថានភាពដឹកជញ្ជូន",
                    "Delivery Status",
                  )}{" "}
                  {isModalCompleted ? (
                    <span
                      style={{
                        fontWeight: 700,
                        color: "var(--teal-d)",
                        fontSize: 12,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      · <CheckCircle2 size={14} />{" "}
                      {tr("statCompleted", "បានបញ្ចប់ជោគជ័យ", "Completed")}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontWeight: 500,
                        color: "var(--muted)",
                        fontSize: 12,
                      }}
                    >
                      ·{" "}
                      {tr(
                        "statusClickHint",
                        "ចុចដើម្បីប្ដូរ (ដឹកដល់ទីតាំង ➔ បានបញ្ចប់)",
                        "Click to update",
                      )}
                    </span>
                  )}
                </h4>
                <div
                  className="dl-steps"
                  role="group"
                  aria-label="Delivery status"
                >
                  {STEPS.map((s, i) => {
                    const I = StepIcon[s];
                    const cls =
                      isModalCompleted || i < stepIndex
                        ? "done"
                        : i === stepIndex
                          ? "now"
                          : "";
                    return (
                      <button
                        type="button"
                        key={s}
                        className={`dl-step ${cls}`}
                        disabled={busy || isModalCompleted}
                        onClick={() =>
                          !isModalCompleted &&
                          (i !== stepIndex ||
                            (s === "completed" &&
                              v.order_data?.status !== "completed")) &&
                          handleUpdateStatus(v, s)
                        }
                        aria-current={i === stepIndex ? "step" : undefined}
                      >
                        <span className="dl-dot">
                          {busy && i === stepIndex ? (
                            <Loader2 size={16} className="pm-spin" />
                          ) : isModalCompleted || i < stepIndex ? (
                            <Check size={17} strokeWidth={3} />
                          ) : (
                            <I size={17} />
                          )}
                        </span>
                        <span>{stepShort(s)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="dl-ids">
              <span className="pm-chip">
                DLV <b>#{v.id}</b>
              </span>
              <span className="pm-chip">
                ORD <b>#{v.order_id}</b>
              </span>
              <span className="pm-chip">
                Order Status: <b style={{ textTransform: "uppercase" }}>{v.order_data.status}</b>
              </span>
              {v.order_data.user_id && (
                <span className="pm-chip">
                  USR <b>#{v.order_data.user_id}</b>
                </span>
              )}
              {v.order_data.store_id && (
                <span className="pm-chip">
                  STORE <b>#{v.order_data.store_id}</b>
                </span>
              )}
              <span className="pm-chip" style={{ textTransform: "uppercase" }}>
                {v.order_data.order_type}
              </span>
            </div>

            <DeliveryRoutePreviewMap
              storeLat={v.store_lat}
              storeLng={v.store_lng}
              custLat={v.customer_lat}
              custLng={v.customer_lng}
              distanceKm={v.distance_km}
              td={td}
              lang={isKm ? "km" : "en"}
            />

            <div className="dl-cards">
              <div className="dl-card">
                <h5>
                  <User size={15} />{" "}
                  {tr(
                    "cardCustomerTitle",
                    "អ្នកទទួល & អតិថិជន",
                    "Receiver & Customer",
                  )}
                </h5>
                <div className="dl-kv">
                  <span>{tr("receiverLabel", "អ្នកទទួល", "Receiver")}</span>
                  <b>{v.receiver_name}</b>
                </div>
                <div className="dl-kv">
                  <span>{tr("phoneLabel", "ទូរស័ព្ទ", "Phone")}</span>
                  <b>
                    {v.receiver_phone !== "-" ? (
                      <a href={`tel:${v.receiver_phone}`}>{v.receiver_phone}</a>
                    ) : (
                      "-"
                    )}
                  </b>
                </div>
                <div className="dl-kv">
                  <span>{tr("customerLabel", "អតិថិជន", "Customer")}</span>
                  <b>
                    {v.customer_data.name}{" "}
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                      #{v.customer_data.id ?? "-"}
                    </span>
                  </b>
                </div>
                <div className="dl-kv">
                  <span>{tr("emailLabel", "អ៊ីមែល", "Email")}</span>
                  <b>{v.customer_data.email}</b>
                </div>
                <div className="dl-kv">
                  <span>{tr("pointsLabel", "ពិន្ទុ", "Points")}</span>
                  <b>
                    <span className="dl-pts">
                      <Star size={12} /> {v.customer_data.points} pts
                    </span>
                  </b>
                </div>
              </div>

              <div className="dl-card">
                <h5>
                  <Bike size={15} />{" "}
                  {tr("cardDeliveryTitle", "ការដឹកជញ្ជូន", "Delivery Info")}
                </h5>
                <div className="dl-kv">
                  <span>
                    {tr("partnerLabel", "ដៃគូដឹក", "Courier Partner")}
                  </span>
                  <b>{v.delivery_partner}</b>
                </div>
                <div className="dl-kv">
                  <span>{tr("feeLabel", "សេវាដឹក", "Delivery Fee")}</span>
                  <b style={{ color: "var(--teal-d)" }}>
                    {money(v.delivery_fee)}
                  </b>
                </div>
                <div className="dl-kv">
                  <span>{tr("noteLabel", "ចំណាំ", "Note")}</span>
                  <b>{v.note || "-"}</b>
                </div>
                <div className="dl-kv">
                  <span>{tr("createdAtLabel", "បង្កើតនៅ", "Created At")}</span>
                  <b>{fmtDate(v.created_at)}</b>
                </div>
                <div className="dl-kv">
                  <span>
                    {tr("updatedAtLabel", "កែប្រែចុងក្រោយ", "Last Updated")}
                  </span>
                  <b>{fmtDate(v.updated_at)}</b>
                </div>
              </div>

              <div className="dl-card wide">
                <h5>
                  <MapPin size={15} />{" "}
                  {tr("cardLocationTitle", "ទីតាំង", "Locations & GPS")}
                </h5>
                <div className="dl-kv">
                  <span>
                    <Store size={13} style={{ verticalAlign: -2 }} />{" "}
                    {tr("pickupLabel", "ហាង (Pickup)", "Store (Pickup)")}
                  </span>
                  <b>{v.pickup_address}</b>
                </div>
                <div className="dl-kv">
                  <span>
                    <MapPin size={13} style={{ verticalAlign: -2 }} />{" "}
                    {tr("dropoffLabel", "ដឹកទៅ (Drop-off)", "Drop-off Address")}
                  </span>
                  <b>{v.delivery_address}</b>
                </div>
                <div className="dl-kv">
                  <span>{tr("storeGpsLabel", "GPS ហាង", "Store GPS")}</span>
                  <b>
                    {v.store_lat ?? "-"}, {v.store_lng ?? "-"}
                  </b>
                </div>
                <div className="dl-kv">
                  <span>
                    {tr("custGpsLabel", "GPS អតិថិជន", "Customer GPS")}
                  </span>
                  <b>
                    {v.customer_lat ?? "-"}, {v.customer_lng ?? "-"}
                  </b>
                </div>
              </div>

              <div className="dl-card wide dl-sum">
                <h5>
                  <Receipt size={15} />{" "}
                  {tr(
                    "cardSummaryTitle",
                    "សង្ខេបវិក្កយបត្រ",
                    "Invoice Summary",
                  )}
                </h5>
                <div className="dl-kv">
                  <span>{tr("subtotalLabel", "សរុបរង", "Subtotal")}</span>
                  <b>{money(v.order_data.subtotal)}</b>
                </div>
                {v.order_data.discount_amount > 0 && (
                  <div className="dl-kv">
                    <span>
                      {tr("discountLabel", "បញ្ចុះតម្លៃ", "Discount")}
                    </span>
                    <b style={{ color: "#c0392b" }}>
                      -{money(v.order_data.discount_amount)}
                    </b>
                  </div>
                )}
                {v.order_data.tax_amount > 0 && (
                  <div className="dl-kv">
                    <span>{tr("taxLabel", "ពន្ធអាករ", "Tax (VAT)")}</span>
                    <b>+{money(v.order_data.tax_amount)}</b>
                  </div>
                )}
                <div className="dl-kv">
                  <span>{tr("feeLabel", "សេវាដឹក", "Delivery Fee")}</span>
                  <b>+{money(v.delivery_fee)}</b>
                </div>
                <div className="dl-kv tot">
                  <span>{tr("grandTotalLabel", "សរុបរួម", "Grand Total")}</span>
                  <b>{money(v.order_data.total_amount)}</b>
                </div>
              </div>
            </div>
          </div>

          <div className="pm-foot split">
            {v.status !== "cancelled" && !isModalCompleted ? (
              confirmCancel ? (
                <button
                  type="button"
                  className="pm-btn warn"
                  disabled={busy}
                  onClick={() => {
                    setConfirmCancel(false);
                    handleCancelDelivery(v);
                  }}
                >
                  <XCircle size={15} />{" "}
                  {tr("confirmCancelBtn", "បញ្ជាក់បោះបង់?", "Confirm Cancel?")}
                </button>
              ) : (
                <button
                  type="button"
                  className="pm-btn warn"
                  disabled={busy}
                  onClick={() => setConfirmCancel(true)}
                >
                  <XCircle size={15} />{" "}
                  {tr("cancelDeliveryBtn", "បោះបង់ការដឹក", "Cancel Delivery")}
                </button>
              )
            ) : (
              <span />
            )}
            <div className="grp">
              {v.status === "delivered" && !isModalCompleted && (
                <button
                  type="button"
                  className="pm-btn primary"
                  disabled={busy}
                  onClick={() => handleUpdateStatus(v, "completed")}
                >
                  <CheckCircle2 size={15} />{" "}
                  {tr("filterCompleted", "បញ្ចប់ការដឹក (Complete)", "Mark Completed")}
                </button>
              )}
              <button
                type="button"
                className="pm-btn"
                onClick={() => setViewItem(null)}
              >
                {tr("closeBtn", "បិទផ្ទាំង", "Close")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="dl">
        <div className="dl-top">
          <div>
            <h2>
              🚚 {tr("heading", "គ្រប់គ្រងការដឹកជញ្ជូន", "Delivery Management")}
            </h2>
            <p>
              {tr(
                "subHeading",
                "តាមដាន និងធ្វើបច្ចុប្បន្នភាពស្ថានភាពដឹកជញ្ជូនទំនិញជូនអតិថិជន",
                "Track and update delivery statuses for customer orders",
              )}
            </p>
          </div>
          <div className="dl-actions">
            <button
              className="dl-btn"
              onClick={exportCsv}
              disabled={filteredOrders.length === 0}
            >
              <Download size={16} />{" "}
              {tr("exportCsv", "ទាញយក CSV", "Export CSV")}
            </button>
            <button
              className="dl-btn primary"
              onClick={fetchDeliveryOrders}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "dl-spin" : ""} />{" "}
              {tr("refresh", "ផ្ទុកឡើងវិញ", "Refresh")}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="dl-err" role="alert">
            <span>{errorMsg}</span>
            <button onClick={fetchDeliveryOrders}>
              {tr("tryAgain", "ព្យាយាមម្ដងទៀត", "Try Again")}
            </button>
          </div>
        )}

        <div className="dl-tiles">
          <Tile
            label={tr("statTotal", "ការដឹកជញ្ជូនសរុប", "Total Deliveries")}
            target={stats.counts.all}
            decimals={0}
            icon={Package}
            tone="t-dark"
            hero
            delay={0}
          />
          <Tile
            label={tr(
              "statPending",
              "កំពុងរង់ចាំ / កំពុងដឹក",
              "Pending / In Transit",
            )}
            target={stats.counts.pending + stats.counts.on_the_way}
            decimals={0}
            icon={Clock}
            tone="t-amber"
            delay={70}
          />
          <Tile
            label={tr(
              "statCompleted",
              "ដឹកជញ្ជូនជោគជ័យ",
              "Completed Deliveries",
            )}
            target={stats.counts.completed}
            decimals={0}
            icon={CheckCircle2}
            tone="t-green"
            delay={140}
          />
          <Tile
            label={tr("statFee", "ចំណូលសេវាដឹកសរុប", "Total Delivery Fees")}
            target={stats.totalFee}
            prefix="$"
            decimals={2}
            icon={Truck}
            tone="t-blue"
            delay={210}
          />
        </div>

        <section className="dl-panel">
          <div className="dl-tools">
            <div className="dl-left">
              <div className="dl-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder={tr(
                    "searchPlaceholder",
                    "ស្វែងរកលេខកូដ ឈ្មោះ ទូរស័ព្ទ ទីតាំង ឬចំណាំ…",
                    "Search order #, name, phone, address, or note…",
                  )}
                  value={search}
                  onChange={(e) => reset(setSearch)(e.target.value)}
                  aria-label="Search deliveries"
                />
                {search && (
                  <button
                    className="dl-x"
                    onClick={() => reset(setSearch)("")}
                    aria-label="Clear"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <div className="dl-seg" role="group" aria-label="Status filter">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    aria-pressed={statusFilter === f.key}
                    className={`dl-sb${statusFilter === f.key ? " on" : ""}`}
                    onClick={() => reset(setStatusFilter)(f.key)}
                  >
                    {f.label}{" "}
                    <span style={{ opacity: 0.6 }}>
                      {stats.counts[f.key] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="dl-right">
              <select
                className="dl-select"
                value={sort}
                onChange={(e) => reset(setSort)(e.target.value)}
                aria-label="Sort deliveries"
              >
                <option value="newest">
                  {tr("sortNewest", "ថ្មីបំផុតមុន", "Newest first")}
                </option>
                <option value="oldest">
                  {tr("sortOldest", "ចាស់បំផុតមុន", "Oldest first")}
                </option>
                <option value="total">
                  {tr(
                    "sortTotal",
                    "តម្លៃសរុប៖ ខ្ពស់ទៅទាប",
                    "Total: high to low",
                  )}
                </option>
              </select>
            </div>
          </div>

          <div className="dl-head">
            <span>{tr("colOrder", "លេខកម្មង់", "Order")}</span>
            <span>{tr("colCustomer", "អ្នកទទួល", "Customer")}</span>
            <span className="dl-hide-m">
              {tr("colRoute", "ផ្លូវដឹកជញ្ជូន", "Route")}
            </span>
            <span className="dl-hide-m dl-hide-md">
              {tr("colCourier", "ដៃគូដឹក", "Courier")}
            </span>
            <span style={{ textAlign: "right" }}>
              {tr("colTotal", "សរុប", "Total")}
            </span>
            <span>{tr("colStatus", "ស្ថានភាព", "Status")}</span>
            <span />
          </div>

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => (
              <div className="dl-skel" key={i}>
                <i style={{ width: 40, height: 40, borderRadius: 12 }} />
                <i style={{ width: "30%" }} />
              </div>
            ))
          ) : rows.length === 0 ? (
            <div className="dl-empty">
              <b>
                {deliveries.length === 0
                  ? tr(
                      "emptyNoData",
                      "មិនទាន់មានទិន្នន័យដឹកជញ្ជូន",
                      "No delivery orders yet",
                    )
                  : tr(
                      "emptyNoResult",
                      "រកមិនឃើញទិន្នន័យដែលអ្នកស្វែងរកទេ",
                      "No matching deliveries found",
                    )}
              </b>
              {tr(
                "emptyHint",
                "ទិន្នន័យដឹកជញ្ជូនពី POS នឹងបង្ហាញនៅទីនេះ",
                "Delivery orders from POS will appear here",
              )}
            </div>
          ) : (
            <div key={`${statusFilter}-${sort}-${current}`}>
              {rows.map((d, i) => {
                const st = d.status;
                const isUpdating = updatingId === d.id;
                // ✅ ចាក់សោមានសញ្ញាគ្រីស លុះត្រាតែទាំង delivery status និង order status ស្មើនឹង 'completed'
                const isOrderCompleted =
                  st === "completed" && d.order_data?.status === "completed";

                return (
                  <div className="dl-row" key={d.id ?? i} style={{ "--i": i }}>
                    <div style={{ minWidth: 0 }}>
                      <button
                        className="dl-num"
                        onClick={() => setViewItem(d)}
                        title={d.order_number}
                      >
                        {d.order_number}
                      </button>
                      <span className="dl-sub">{fmtDate(d.created_at)}</span>
                    </div>
                    <div className="dl-who" onClick={() => setViewItem(d)}>
                      <span className="dl-av">
                        {(d.receiver_name || "G")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <b title={d.receiver_name}>{d.receiver_name}</b>
                        <span className="dl-sub">
                          <Phone size={11} style={{ verticalAlign: -1 }} />{" "}
                          {d.receiver_phone}
                        </span>
                      </div>
                    </div>
                    <div className="dl-route dl-hide-m">
                      <div className="from" title={d.pickup_address}>
                        <Store size={12} />
                        <span>{d.pickup_address}</span>
                      </div>
                      <div className="to" title={d.delivery_address}>
                        <MapPin size={12} />
                        <span>{d.delivery_address}</span>
                        {d.distance_km !== null && <em>{d.distance_km} km</em>}
                      </div>
                    </div>
                    <div
                      className="dl-hide-m dl-hide-md"
                      style={{ minWidth: 0 }}
                    >
                      <b className="dl-cour">{d.delivery_partner}</b>
                      <span className="dl-sub">+{money(d.delivery_fee)}</span>
                    </div>
                    <div className="dl-amt">
                      {money(d.order_data.total_amount)}
                    </div>

                    {/* ✅ Status Column: បើ 'delivered' (ដឹកដល់ទីតាំង) នៅអាចចុចប្ដូរទៅជា 'completed' (បានបញ្ចប់) បាន */}
                    <div className="dl-stwrap">
                      {st === "cancelled" ? (
                        <span
                          className="dl-status-static cancelled"
                          title={tr(
                            "cancelledBanner",
                            "ការដឹកជញ្ជូននេះត្រូវបានបោះបង់ (មិនអាចកែប្រែបានទេ)",
                            "Cancelled (Locked)",
                          )}
                        >
                          <XCircle size={14} strokeWidth={2.5} />
                          <span>{(STATUS_LABELS[st] || st).split(" (")[0]}</span>
                        </span>
                      ) : isOrderCompleted ? (
                        <span
                          className="dl-status-static completed"
                          title={tr(
                            "statCompleted",
                            "បានបញ្ចប់ការដឹកជញ្ជូនរួចរាល់",
                            "Delivery Completed",
                          )}
                        >
                          <CheckCircle2 size={14} strokeWidth={2.5} />
                          <span>{(STATUS_LABELS[st] || st).split(" (")[0]}</span>
                        </span>
                      ) : (
                        <>
                          <select
                            className={`dl-status ${st}`}
                            value={st}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleUpdateStatus(d, e.target.value)
                            }
                            aria-label={`Status of ${d.order_number}`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label.split(" (")[0]}
                              </option>
                            ))}
                            {!STATUS_OPTIONS.some((o) => o.value === st) && (
                              <option value={st}>{st}</option>
                            )}
                          </select>
                          {isUpdating && (
                            <Loader2 size={14} className="dl-spin dl-stspin" />
                          )}
                        </>
                      )}
                    </div>

                    <div className="dl-acts">
                      <button
                        className="dl-ib v"
                        onClick={() => setViewItem(d)}
                        aria-label="View delivery"
                        title={tr("viewTitle", "មើលលម្អិត", "View details")}
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredOrders.length > 0 && (
            <div className="dl-foot">
              <span>
                {tr("showing", "បង្ហាញ", "Showing")}{" "}
                <b>
                  {start + 1}–
                  {Math.min(start + PAGE_SIZE, filteredOrders.length)}
                </b>{" "}
                {tr("of", "នៃ", "of")} <b>{filteredOrders.length}</b>
              </span>
              <div className="dl-pager">
                <button
                  className="dl-pg"
                  onClick={() => setPage(current - 1)}
                  disabled={current === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span aria-live="polite">
                  {current} / {pages}
                </span>
                <button
                  className="dl-pg"
                  onClick={() => setPage(current + 1)}
                  disabled={current === pages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>

        {deliveryModal && createPortal(deliveryModal, document.body)}
      </div>
    </Layout>
  );
}