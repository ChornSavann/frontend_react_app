// src/pages/reports/PurchaseReportPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingBag, DollarSign, Gauge, BadgePercent, Search, Download, RefreshCw, Printer, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../../components/Layout';
import { getPurchaseReports } from '../../services/reportService';

const PAGE_SIZE = 10;
const css = `
.pr { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.pr *, .pr *::before, .pr *::after { box-sizing: border-box; }
.pr h2 { margin: 0; color: var(--ink); font-family: inherit; }

.pr-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.pr-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.pr-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.pr-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.pr-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.pr-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.pr-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.pr-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.pr-btn:disabled { opacity: .6; cursor: not-allowed; }
.pr button:focus-visible, .pr select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.pr-spin { animation: pr-rot .8s linear infinite; }

.pr-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.pr-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

.pr-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.pr-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: pr-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.pr-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.pr-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-green { background: #e7f8ee; color: #15803d; } .t-amber { background: #fff1d6; color: #d97706; } .t-blue { background: #e3eeff; color: #2563eb; }
.pr-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.pr-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.pr-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.pr-tile.hero span { color: #9db8b4; }
.pr-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

.pr-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: pr-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.pr-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.pr-left, .pr-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pr-search { position: relative; display: flex; align-items: center; width: 300px; max-width: 100%; }
.pr-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.pr-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.pr-search input::placeholder { color: #8aa3a0; }
.pr-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.pr-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.pr-x:hover { background: #e3ecea; color: var(--ink); }
.pr-seg { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; }
.pr-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.pr-sb:hover { color: var(--ink); } .pr-sb.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.pr-select { height: 38px; max-width: 170px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.pr-select:hover { background-color: #e9f1ef; }

/* logo tile */
.pr-logo { position: relative; width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 17px; overflow: hidden; border: 1px solid var(--line); background: #fff; }
.pr-logo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 5px; background: #fff; }

/* list */
.pr-head, .pr-row { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1.6fr) minmax(0,1.5fr) minmax(0,1fr) minmax(0,.9fr) 84px; gap: 14px; align-items: center; padding: 0 18px; }
.pr-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.pr-row { min-height: 66px; border-bottom: 1px solid var(--line); transition: background .12s; animation: pr-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.pr-row:last-child { border-bottom: 0; } .pr-row:hover { background: #f6fbf9; }
.pr-who { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
.pr-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pr-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.pr-desc { color: #4d6561; font-size: 12.5px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pr-date { color: var(--muted); font-size: 12.5px; }
.pr-row:hover .pr-logo { transform: scale(1.06); } .pr-logo { transition: transform .2s; }

.pr-acts { display: flex; gap: 6px; justify-content: flex-end; }
.pr-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.pr-ib:hover { transform: translateY(-1px); }
.pr-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.pr-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }
.pr-ib.d:hover { background: #fdecea; color: #c0392b; border-color: #f6cfca; }
.pr-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

/* grid */
.pr-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; padding: 16px; }
.pr-card { display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 16px; background: #fff; overflow: hidden;
  transition: transform .22s, box-shadow .22s, border-color .22s; animation: pr-up .45s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 35ms) backwards; }
.pr-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(12,37,38,.09); border-color: #d3e2df; }
.pr-stage { position: relative; height: 112px; display: grid; place-items: center; cursor: pointer; font-size: 38px; font-weight: 800; color: var(--teal);
  background: radial-gradient(160px 80px at 50% 0%, rgba(15,118,110,.08), transparent 70%), #f6faf9; border-bottom: 1px solid var(--line); }
.pr-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 18px; transition: transform .3s; }
.pr-card:hover .pr-stage img { transform: scale(1.06); }
.pr-cbody { padding: 12px 14px 8px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.pr-cbody b { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.pr-cbody .pr-desc { min-height: 36px; }
.pr-cfoot { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 12px 14px; }

.pr-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.pr-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.pr-skel { height: 66px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.pr-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: pr-shine 1.3s linear infinite; }

.pr-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.pr-pager { display: flex; align-items: center; gap: 6px; }
.pr-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.pr-pg:hover:not(:disabled) { background: #eef5f3; } .pr-pg:disabled { opacity: .4; cursor: not-allowed; }
.pr-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes pr-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes pr-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes pr-shine { to { background-position: -200% 0; } }
@keyframes pr-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .pr-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 900px) {
  .pr-head, .pr-row { grid-template-columns: minmax(0,1.3fr) minmax(0,1.6fr) minmax(0,1fr) minmax(0,.9fr) 84px; } .pr-hide-md { display: none; }
}
@media (max-width: 720px) {
  .pr { padding: 14px; } .pr-tiles { grid-template-columns: 1fr; }
  .pr-head { display: none; }
  .pr-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; } .pr-hide-m { display: none; }
  .pr-search, .pr-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .pr-tile, .pr-panel, .pr-row, .pr-card, .pr-skel i, .pr-spin { animation: none !important; } .pr-tile, .pr-card, .pr-logo, .pr-stage img { transition: none; } }

.pr-num { all: unset; cursor: pointer; display: block; font-weight: 800; font-size: 13.5px; color: var(--teal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.pr-num:hover { text-decoration: underline; }
.pr-num:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; border-radius: 4px; }
.pr-av { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 15px; transition: transform .2s; }
.pr-row:hover .pr-av { transform: scale(1.07); }
.pr-brk { display: flex; flex-direction: column; gap: 1px; font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; } .pr-brk b { color: #35504c; font-weight: 700; margin-left: 4px; } .pr-brk .neg b { color: #c0392b; }
.pr-total { text-align: right; } .pr-total b { display: block; font-weight: 800; font-size: 14.5px; color: var(--teal); font-variant-numeric: tabular-nums; }
.pr-pay { display: inline-block; margin-top: 3px; padding: 1px 8px; border-radius: 7px; background: #eef4f2; color: #35504c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; }
.pr-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; width: fit-content; background: #eef2f1; color: #5f7773; }
.pr-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.pr-badge.completed { background: #e7f8ee; color: #15803d; } .pr-badge.pending { background: #fff4e0; color: #b45309; } .pr-badge.cancelled { background: #fdecea; color: #c0392b; }
.pr-ib.p:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }
@media (max-width: 720px) {
  .pr-row { grid-template-columns: minmax(0,1fr) auto; }
  .pr-c-total { grid-column: 2; grid-row: 1; } .pr-c-sup { grid-column: 1; grid-row: 2; } .pr-badge { grid-column: 2; grid-row: 2; justify-self: end; } .pr-acts { grid-column: 1 / -1; }
}
@media (prefers-reduced-motion: reduce) { .pr-av { transition: none; } }
`;

/* ---------- Invoice (preview + print) ---------- */
const invCss = `
.inv-overlay { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(8,28,29,.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); animation: inv-fade .2s ease;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color-scheme: light; }
.inv-sheet { --ink:#0f1f1d; --muted:#6a8280; --line:#e3ecea; --teal:#0f766e; width: 100%; max-width: 800px; max-height: 94vh; overflow-y: auto; background: #fff; border-radius: 18px; color: var(--ink); text-align: left;
  box-shadow: 0 30px 80px rgba(6,23,24,.35); animation: inv-rise .3s cubic-bezier(.2,.8,.2,1); font-size: 13.5px; line-height: 1.5; }
.inv-sheet *, .inv-sheet *::before, .inv-sheet *::after { box-sizing: border-box; }
.inv-bar { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 20px; background: rgba(255,255,255,.92); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.inv-bar b { font-size: 14px; } .inv-bar span { color: var(--muted); font-size: 12.5px; margin-left: 8px; }
.inv-btns { display: flex; gap: 8px; }
.inv-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 38px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px; font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid #d5e3e0; transition: transform .15s, box-shadow .15s; }
.inv-btn:hover { background: #f3f9f7; } .inv-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); } .inv-btn.primary:hover { transform: translateY(-1px); }
.inv-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.inv-paper { padding: 34px 40px 36px; }
.inv-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding-bottom: 22px; border-bottom: 2px solid #0c2526; }
.inv-brand { display: flex; align-items: center; gap: 12px; }
.inv-logo { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; font-weight: 800; font-size: 19px; color: #0c2526; background: linear-gradient(145deg,#d9ff85,#9fd93f); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.inv-brand b { display: block; font-size: 16px; } .inv-brand small { color: var(--muted); font-size: 12px; }
.inv-doc { text-align: right; } .inv-doc h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1.5px; font-family: inherit; color: var(--ink); } .inv-doc .no { color: var(--teal); font-weight: 800; font-size: 14px; }
.inv-stamp { display: inline-block; margin-top: 8px; padding: 2px 12px; border: 2px solid currentColor; border-radius: 8px; font-size: 12px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; transform: rotate(-3deg); }
.inv-stamp.completed { color: #15803d; } .inv-stamp.pending { color: #b45309; } .inv-stamp.cancelled { color: #c0392b; } .inv-stamp.other { color: #5f7773; }
.inv-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin: 24px 0; }
.inv-box h5 { margin: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); font-family: inherit; }
.inv-box p { margin: 0 0 3px; color: #3b514d; } .inv-box p.name { font-size: 16px; font-weight: 800; color: var(--ink); }
.inv-box dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 14px; margin: 0; } .inv-box dt { color: var(--muted); } .inv-box dd { margin: 0; font-weight: 700; text-align: right; }
.inv-table { width: 100%; border-collapse: collapse; }
.inv-table th { padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 700; color: #f4faf8; background: #0c2526; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.inv-table th:first-child { border-radius: 9px 0 0 9px; } .inv-table th:last-child { border-radius: 0 9px 9px 0; }
.inv-table td { padding: 11px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
.inv-table tbody tr:nth-child(even) td { background: #f7fbfa; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.inv-table .r { text-align: right; font-variant-numeric: tabular-nums; } .inv-table .c { text-align: center; }
.inv-table td b { font-weight: 700; } .inv-table small { display: block; color: var(--muted); font-size: 11.5px; }
.inv-empty { padding: 22px; text-align: center; color: var(--muted); }
.inv-bottom { display: flex; justify-content: space-between; align-items: flex-start; gap: 28px; margin-top: 20px; }
.inv-notes { flex: 1; font-size: 12.5px; color: #3b514d; } .inv-notes h5 { margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); font-family: inherit; }
.inv-totals { width: 300px; flex-shrink: 0; }
.inv-trow { display: flex; justify-content: space-between; padding: 6px 2px; color: #3b514d; font-variant-numeric: tabular-nums; } .inv-trow b { color: var(--ink); } .inv-trow.disc b { color: #c0392b; }
.inv-grand { margin-top: 8px; display: flex; justify-content: space-between; align-items: center; padding: 13px 16px; border-radius: 12px; color: #f4faf8; background: #0c2526; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.inv-grand span { font-size: 13px; color: #9db8b4; } .inv-grand b { font-size: 22px; font-weight: 800; letter-spacing: -.5px; color: #c8f169; font-variant-numeric: tabular-nums; }
.inv-sign { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 60px; }
.inv-sign div { padding-top: 8px; border-top: 1.5px solid #a9bfbb; text-align: center; font-size: 12px; color: var(--muted); }
.inv-thanks { margin-top: 26px; text-align: center; font-size: 12px; color: var(--muted); }
@keyframes inv-fade { from { opacity: 0; } } @keyframes inv-rise { from { opacity: 0; transform: translateY(22px) scale(.98); } }
@media (max-width: 640px) { .inv-paper { padding: 22px 18px; } .inv-cols { grid-template-columns: 1fr; gap: 18px; } .inv-bottom { flex-direction: column; } .inv-totals { width: 100%; } .inv-head { flex-direction: column; } .inv-doc { text-align: left; } .inv-sign { gap: 20px; } }
@media (prefers-reduced-motion: reduce) { .inv-overlay, .inv-sheet { animation: none; } }
@media print {
  body > *:not(.inv-portal) { display: none !important; }
  .inv-overlay { position: static; display: block; padding: 0; background: none; backdrop-filter: none; -webkit-backdrop-filter: none; animation: none; }
  .inv-sheet { max-width: none; max-height: none; overflow: visible; border-radius: 0; box-shadow: none; animation: none; }
  .inv-bar { display: none !important; }
  .inv-paper { padding: 0; }
  .inv-table tr, .inv-totals, .inv-sign { break-inside: avoid; }
  @page { size: A4; margin: 14mm; }
}
`;

const num = (v) => parseFloat(v || 0) || 0;
const money = (n) => num(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const totalOf = (p) => num(p.total ?? p.total_amount);
const fmtDateTime = (s) => {
  if (!s) return '';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const statusOf = (p) => String(p.status || '').toLowerCase();

function InvoiceModal({ purchase, autoPrint, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // បោះពុម្ពស្វ័យប្រវត្តិ ពេលចុចប៊ូតុង Print ក្នុងតារាង
  useEffect(() => {
    if (!autoPrint) return undefined;
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [autoPrint, purchase]);

  const items = Array.isArray(purchase.items) ? purchase.items : [];
  const st = statusOf(purchase);
  const stClass = ['completed', 'pending', 'cancelled'].includes(st) ? st : 'other';
  const sup = purchase.supplier || {};

  return createPortal(
    <div className="inv-portal">
      <style>{invCss}</style>
      <div className="inv-overlay" onClick={onClose}>
        <div className="inv-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Purchase invoice">
          <div className="inv-bar">
            <div><b>Invoice preview</b><span>{purchase.purchase_number || `#${purchase.id}`}</span></div>
            <div className="inv-btns">
              <button className="inv-btn" onClick={onClose}><X size={16} /> បិទ</button>
              <button className="inv-btn primary" onClick={() => window.print()}><Printer size={16} /> បោះពុម្ពវិក្កយបត្រ</button>
            </div>
          </div>

          <div className="inv-paper">
            <div className="inv-head">
              <div className="inv-brand"><div className="inv-logo">P</div><div><b>POS &amp; Inventory</b><small>Store management</small></div></div>
              <div className="inv-doc">
                <h1>PURCHASE INVOICE</h1>
                <div className="no">វិក្កយបត្រទិញចូលស្តុក · {purchase.purchase_number || `#${purchase.id}`}</div>
                <span className={`inv-stamp ${stClass}`}>{st || 'n/a'}</span>
              </div>
            </div>

            <div className="inv-cols">
              <div className="inv-box">
                <h5>អ្នកផ្គត់ផ្គង់ (Supplier)</h5>
                <p className="name">{sup.name || 'N/A'}</p>
                {sup.company && <p>ក្រុមហ៊ុន: <b>{sup.company}</b></p>}
                <p>ទូរស័ព្ទ: {sup.phone || 'N/A'}</p>
                {sup.email && <p>{sup.email}</p>}
                {sup.address && <p>{sup.address}</p>}
              </div>
              <div className="inv-box">
                <h5>ព័ត៌មានវិក្កយបត្រ</h5>
                <dl>
                  <dt>កាលបរិច្ឆេទ</dt><dd>{fmtDateTime(purchase.created_at) || '-'}</dd>
                  <dt>វិធីទូទាត់</dt><dd style={{ textTransform: 'uppercase', color: '#0f766e' }}>{purchase.payment_method || 'cash'}</dd>
                  <dt>ស្ថានភាព</dt><dd style={{ textTransform: 'capitalize' }}>{st || '-'}</dd>
                  {purchase.user?.name && (<><dt>អ្នកកត់ត្រា</dt><dd>{purchase.user.name}</dd></>)}
                </dl>
              </div>
            </div>

            <table className="inv-table">
              <thead><tr><th style={{ width: 44 }}>ល.រ</th><th>ឈ្មោះទំនិញ (Product)</th><th className="c" style={{ width: 90 }}>ចំនួន</th><th className="r" style={{ width: 110 }}>តម្លៃឯកតា</th><th className="r" style={{ width: 120 }}>សរុប</th></tr></thead>
              <tbody>
                {items.length > 0 ? items.map((item, i) => (
                  <tr key={item.id ?? i}>
                    <td>{i + 1}</td>
                    <td><b>{item.product?.name || item.product_name || 'ទំនិញ'}</b>{item.product?.sku && <small>SKU: {item.product.sku}</small>}</td>
                    <td className="c"><b>{item.quantity}</b></td>
                    <td className="r">${money(item.unit_cost)}</td>
                    <td className="r"><b>${money(item.total_price)}</b></td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="inv-empty">(គ្មានទិន្នន័យ items ភ្ជាប់មកជាមួយវិក្កយបត្រនេះ)</td></tr>
                )}
              </tbody>
            </table>

            <div className="inv-bottom">
              <div className="inv-notes">{purchase.notes && (<><h5>កំណត់ចំណាំ</h5>{purchase.notes}</>)}</div>
              <div className="inv-totals">
                <div className="inv-trow"><span>ទឹកប្រាក់រង (Subtotal)</span><b>${money(purchase.subtotal)}</b></div>
                <div className="inv-trow disc"><span>បញ្ចុះតម្លៃ (Discount)</span><b>-${money(purchase.discount)}</b></div>
                <div className="inv-trow"><span>ពន្ធ (Tax)</span><b>${money(purchase.tax)}</b></div>
                <div className="inv-grand"><span>សរុប (Total)</span><b>${money(totalOf(purchase))}</b></div>
              </div>
            </div>

            <div className="inv-sign"><div>អ្នករៀបចំ (Prepared by)</div><div>អ្នកទទួល (Received by)</div></div>
            <div className="inv-thanks">សូមអរគុណ · Thank you for your business</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- Page ---------- */
const TONES = [['#e0f4f1', '#0f766e'], ['#e3eeff', '#2563eb'], ['#eee8ff', '#7c3aed'], ['#fff1d6', '#d97706'], ['#fdecea', '#c0392b'], ['#ecf6d8', '#4d7c0f']];
const toneFor = (s = '') => TONES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];

function useCountUp(target, decimals = 0, duration = 1000) {
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

function Tile({ label, target, prefix = '', decimals = 0, icon: Icon, tone, hero, delay }) {
  const shown = useCountUp(target, decimals);
  return (
    <div className={`pr-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`pr-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{prefix}{shown}</b></div>
    </div>
  );
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function PurchaseReportPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [invoice, setInvoice] = useState(null); // { purchase, auto }

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await getPurchaseReports();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setPurchases(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching purchase reports:', err);
      setErrorMsg(err?.message || 'បរាជ័យក្នុងការទាញយករបាយការណ៍ការទិញចូល');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const counts = { all: purchases.length, completed: 0, pending: 0, cancelled: 0 };
    let spent = 0, discount = 0, valid = 0;
    purchases.forEach((p) => {
      const st = statusOf(p);
      if (counts[st] !== undefined) counts[st] += 1;
      if (st !== 'cancelled') { spent += totalOf(p); discount += num(p.discount); valid += 1; }
    });
    return { counts, spent, discount, avg: valid ? spent / valid : 0 };
  }, [purchases]);

  const payments = useMemo(() => [...new Set(purchases.map((p) => String(p.payment_method || '').toLowerCase()).filter(Boolean))], [purchases]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = purchases.filter((p) => {
      const matchSearch = !q || [p.supplier?.name, p.supplier?.company, p.purchase_number, p.id].some((x) => String(x ?? '').toLowerCase().includes(q));
      return matchSearch && (statusFilter === 'all' || statusOf(p) === statusFilter) && (payFilter === 'all' || String(p.payment_method || '').toLowerCase() === payFilter);
    });
    const by = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      total: (a, b) => totalOf(b) - totalOf(a),
    }[sort];
    return [...list].sort(by);
  }, [purchases, search, statusFilter, payFilter, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const exportCsv = () => {
    const lines = [['Purchase #', 'Date', 'Supplier', 'Company', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment', 'Status'],
      ...visible.map((p) => [p.purchase_number || `#${p.id}`, p.created_at || '', p.supplier?.name || '', p.supplier?.company || '', num(p.subtotal), num(p.discount), num(p.tax), totalOf(p), p.payment_method || '', p.status || ''])];
    const csv = '\uFEFF' + lines.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchase-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <style>{css}</style>
      <div className="pr">
        <div className="pr-top">
          <div>
            <h2>📦 របាយការណ៍ការទិញចូលស្តុក</h2>
            <p>ប្រវត្តិការបញ្ជាទិញទំនិញពី Supplier លម្អិត និងបោះពុម្ពវិក្កយបត្រ</p>
          </div>
          <div className="pr-actions">
            <button className="pr-btn" onClick={exportCsv} disabled={visible.length === 0}><Download size={16} /> Export CSV</button>
            <button className="pr-btn primary" onClick={fetchPurchases} disabled={loading}><RefreshCw size={16} className={loading ? 'pr-spin' : ''} /> Refresh</button>
          </div>
        </div>

        {errorMsg && <div className="pr-err" role="alert"><span>{errorMsg}</span><button onClick={fetchPurchases}>Try again</button></div>}

        <div className="pr-tiles">
          <Tile label="ចំណាយសរុប (Total Spent)" target={stats.spent} prefix="$" decimals={2} icon={DollarSign} tone="t-dark" hero delay={0} />
          <Tile label="ចំនួនដងទិញចូល" target={stats.counts.all} icon={ShoppingBag} tone="t-blue" delay={70} />
          <Tile label="មធ្យមក្នុងមួយដង" target={stats.avg} prefix="$" decimals={2} icon={Gauge} tone="t-green" delay={140} />
          <Tile label="បញ្ចុះតម្លៃទទួលបាន" target={stats.discount} prefix="$" decimals={2} icon={BadgePercent} tone="t-amber" delay={210} />
        </div>

        <section className="pr-panel">
          <div className="pr-tools">
            <div className="pr-left">
              <div className="pr-search">
                <Search size={16} />
                <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder="ស្វែងរក Supplier, ក្រុមហ៊ុន, លេខវិក្កយបត្រ…" aria-label="Search purchases" />
                {search && <button className="pr-x" onClick={() => reset(setSearch)('')} aria-label="Clear search"><X size={15} /></button>}
              </div>
              <div className="pr-seg" role="group" aria-label="Status">
                {FILTERS.map((f) => <button key={f.key} className={`pr-sb${statusFilter === f.key ? ' on' : ''}`} aria-pressed={statusFilter === f.key} onClick={() => reset(setStatusFilter)(f.key)}>{f.label} <span style={{ opacity: .6 }}>{stats.counts[f.key]}</span></button>)}
              </div>
            </div>
            <div className="pr-right">
              {payments.length > 0 && (
                <select className="pr-select" value={payFilter} onChange={(e) => reset(setPayFilter)(e.target.value)} aria-label="Payment method">
                  <option value="all">All payments</option>
                  {payments.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                </select>
              )}
              <select className="pr-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort purchases">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="total">Total: high to low</option>
              </select>
            </div>
          </div>

          <div className="pr-head">
            <span>Invoice</span><span>Supplier</span><span className="pr-hide-m pr-hide-md">Breakdown</span><span style={{ textAlign: 'right' }}>Total</span><span>Status</span><span />
          </div>

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="pr-skel" key={i}><i style={{ width: 40, height: 40, borderRadius: 12 }} /><i style={{ width: '30%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="pr-empty">
              <b>{purchases.length === 0 ? 'មិនមានប្រវត្តិទិញទំនិញទេ' : 'រកមិនឃើញលទ្ធផល'}</b>
              {purchases.length > 0 && 'Try a different search, status or payment filter.'}
            </div>
          ) : (
            <div key={`${statusFilter}-${payFilter}-${sort}-${current}`}>
              {rows.map((p, i) => {
                const supName = p.supplier?.name || 'គ្មាន Supplier';
                const [bg, fg] = toneFor(p.supplier?.company || supName);
                const st = statusOf(p);
                return (
                  <div className="pr-row" key={p.id ?? i} style={{ '--i': i }}>
                    <div style={{ minWidth: 0 }}>
                      <button className="pr-num" onClick={() => setInvoice({ purchase: p, auto: false })}>{p.purchase_number || `#${p.id}`}</button>
                      <span className="pr-sub">{fmtDateTime(p.created_at) || '-'}</span>
                    </div>
                    <div className="pr-who pr-c-sup" style={{ cursor: 'default' }}>
                      <span className="pr-av" style={{ background: bg, color: fg }}>{String(p.supplier?.company || supName).trim().charAt(0).toUpperCase()}</span>
                      <div style={{ minWidth: 0 }}><b>{supName}</b>{p.supplier?.company && <span className="pr-sub">{p.supplier.company}</span>}</div>
                    </div>
                    <div className="pr-hide-m pr-hide-md pr-brk">
                      <span>Sub <b>${money(p.subtotal)}</b></span>
                      <span className="neg">Disc <b>-${money(p.discount)}</b></span>
                      <span>Tax <b>${money(p.tax)}</b></span>
                    </div>
                    <div className="pr-total pr-c-total"><b>${money(totalOf(p))}</b><span className="pr-pay">{p.payment_method || 'cash'}</span></div>
                    <span className={`pr-badge ${st}`}>{st ? st.charAt(0).toUpperCase() + st.slice(1) : '-'}</span>
                    <div className="pr-acts">
                      <button className="pr-ib v" onClick={() => setInvoice({ purchase: p, auto: false })} aria-label="Preview invoice" title="មើលវិក្កយបត្រ"><Eye size={15} /></button>
                      <button className="pr-ib p" onClick={() => setInvoice({ purchase: p, auto: true })} aria-label="Print invoice" title="បោះពុម្ព"><Printer size={15} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="pr-foot">
              <span>Showing {start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} of {visible.length}</span>
              <div className="pr-pager">
                <button className="pr-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="pr-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      {invoice && <InvoiceModal purchase={invoice.purchase} autoPrint={invoice.auto} onClose={() => setInvoice(null)} />}
    </Layout>
  );
}