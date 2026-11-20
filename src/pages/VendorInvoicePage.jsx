// src/pages/VendorInvoicePage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Plus,
  Search,
  Printer,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  DollarSign,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  getVendorInvoices,
  createVendorInvoice,
  updateVendorInvoice,
  deleteVendorInvoice,
} from "../services/vendorInvoiceService";
import api from "../services/api";
import ToastrContainer, { toastr, sweetConfirm } from "../components/Toastr";
import { useTranslation } from "../utils/translations";

const PAGE_SIZE = 10;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.vi, .vi-portal { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; line-height: 1.6; color-scheme: light; }
.vi { padding: 28px 32px 44px; font-size: 14px; }
.vi *, .vi *::before, .vi *::after, .vi-portal, .vi-portal *, .vi-portal *::before, .vi-portal *::after { box-sizing: border-box; }
.vi h2, .vi h3, .vi-portal h3 { margin: 0; font-family: inherit; }

/* ---------- header ---------- */
.vi-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; animation: vi-up .6s cubic-bezier(.2,.8,.2,1) both; }
.vi-brand { display: flex; align-items: center; gap: 14px; }
.vi-brand-ico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.vi .vi-title { font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.vi .vi-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.vi .vi-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; max-width: 640px; }
.vi-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.vi-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; height: 44px; padding: 0 18px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: 13px; font-family: inherit; font-size: 14px; font-weight: 700; color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db;
  transition: transform .15s, box-shadow .25s, background .2s, color .2s; }
.vi-btn:hover:not(:disabled) { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.vi-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.vi-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.vi-btn.primary:hover:not(:disabled)::after { left: 130%; }
.vi-btn.primary:hover:not(:disabled) { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.vi-btn.danger { color: #fff; background: linear-gradient(135deg, #de4b3f, #b9291f); box-shadow: 0 10px 20px -8px rgba(185,41,31,.55); }
.vi-btn.danger:hover:not(:disabled) { color: #fff; background: linear-gradient(135deg, #de4b3f, #b9291f); transform: translateY(-1px); }
.vi-btn:active:not(:disabled) { transform: scale(.98); }
.vi-btn:disabled { opacity: .6; cursor: not-allowed; }
.vi button:focus-visible, .vi-portal button:focus-visible, .vi input:focus-visible, .vi select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.vi-spin { animation: vi-rot .8s linear infinite; }

.vi-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; }
.vi-err button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.vi-err button:hover { background: #fde8e6; }

/* ---------- tiles ---------- */
.vi-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
.vi-tile { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .22s, box-shadow .22s; animation: vi-up .6s cubic-bezier(.2,.8,.2,1) var(--d, 0ms) backwards; }
.vi-tile:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.vi-chip-i { width: 48px; height: 48px; border-radius: 15px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: rgba(255,255,255,.18); color: #fff; } .t-amber { background: #fdf1d6; color: #9a6a0a; }
.t-green { background: #e8f5d6; color: #4d7c0f; } .t-red { background: #fdeceb; color: #b9382d; }
.vi-tile span { display: block; font-size: 13px; font-weight: 500; color: var(--muted); line-height: 1.5; }
.vi-tile b { display: block; font-size: 24px; font-weight: 800; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.3; }
.vi-tile em { display: block; font-style: normal; font-size: 12px; color: var(--muted); }
.vi-tile.hero { border-color: transparent; color: #fff; box-shadow: 0 18px 32px -18px rgba(11,70,63,.7);
  background: radial-gradient(240px 120px at 100% 0%, rgba(255,255,255,.2), transparent 65%), linear-gradient(150deg, #19917f 0%, #0e5a51 60%, #0b463f 100%); }
.vi-tile.hero span, .vi-tile.hero em { color: rgba(255,255,255,.8); }

/* ---------- panel ---------- */
.vi-panel { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); animation: vi-up .6s cubic-bezier(.2,.8,.2,1) 200ms backwards; }
.vi-tools { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.vi-search { position: relative; display: flex; align-items: center; width: 340px; max-width: 100%; }
.vi-search > svg { position: absolute; left: 14px; color: #5f8a82; pointer-events: none; transition: color .2s; }
.vi-search:focus-within > svg { color: var(--teal); }
.vi-search input { width: 100%; height: 44px; padding: 0 40px 0 42px; font: inherit; font-size: 14px; color: var(--ink); background: #f6faf8; border: 1.5px solid #d3e4df; border-radius: 13px; outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s; color-scheme: light; }
.vi-search input::placeholder { color: #86a39d; }
.vi-search input:hover { border-color: #b9d3cc; }
.vi-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.vi-x { all: unset; cursor: pointer; position: absolute; right: 8px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #5f8a82; transition: background .2s, color .2s; }
.vi-x:hover { background: var(--mint); color: var(--teal-d); }

.vi-chips { display: flex; gap: 2px; padding: 4px; background: #eef5f2; border-radius: 14px; flex-wrap: wrap; }
.vi-chip { all: unset; box-sizing: border-box; cursor: pointer; height: 36px; display: inline-flex; align-items: center; gap: 8px; padding: 0 12px 0 14px; border-radius: 10px; font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--muted); white-space: nowrap; transition: background .2s, color .2s, box-shadow .2s; }
.vi-chip:hover { color: var(--ink); }
.vi-chip.on { background: #fff; color: var(--teal-d); box-shadow: 0 4px 10px -6px rgba(14,90,81,.5), 0 0 0 1px rgba(31,138,125,.1); }
.vi-chip em { font-style: normal; font-size: 12px; font-weight: 700; padding: 0 8px; border-radius: 99px; background: rgba(31,138,125,.12); color: var(--teal-d); font-variant-numeric: tabular-nums; }

.vi-tablewrap { overflow-x: auto; }
.vi-gridwrap { min-width: 960px; }
.vi-head, .vi-row { display: grid; grid-template-columns: 150px minmax(0, 1.4fr) 130px 190px 150px 118px; gap: 14px; align-items: center; padding: 0 20px; }
.vi-head { height: 42px; font-size: 12.5px; font-weight: 700; letter-spacing: .3px; color: var(--muted); background: #f3f9f7; border-bottom: 1px solid var(--line); }
.vi-row { min-height: 60px; border-bottom: 1px solid #eef4f2; transition: background .15s; animation: vi-slide .4s cubic-bezier(.2,.8,.2,1) calc(var(--i) * 28ms) backwards; }
.vi-row:last-child { border-bottom: 0; }
.vi-row:hover { background: #f6fbf9; }
.vi-no { all: unset; cursor: pointer; display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle; padding: 2px 11px; border-radius: 99px;
  background: var(--mint); color: var(--teal-d); font-weight: 700; font-size: 12.5px; transition: background .2s; }
.vi-no:hover { background: #cfeadf; }
.vi-sup { display: flex; align-items: center; gap: 11px; min-width: 0; font-weight: 700; }
.vi-sup span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vi-av { width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0; display: grid; place-items: center; font-size: 14px; font-weight: 800; color: #fff; background: linear-gradient(145deg, #3bb5a4, #1a7d70); }
.vi-amt { font-weight: 800; color: var(--teal-d); font-variant-numeric: tabular-nums; text-align: right; }
.vi-due { line-height: 1.4; font-size: 13.5px; }
.vi-due small { display: block; font-size: 12px; color: var(--muted); }
.vi-due.late small { color: #b9382d; font-weight: 700; }
.vi-badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 11px; border-radius: 99px; font-size: 12.5px; font-weight: 700; width: fit-content; background: #eef1f1; color: #5b6f6b; white-space: nowrap; }
.vi-badge.paid { background: #e8f5d6; color: #4d7c0f; } .vi-badge.pending { background: #fdf1d6; color: #9a6a0a; } .vi-badge.cancelled { background: #fdeceb; color: #b9382d; }
.vi-acts { display: flex; justify-content: flex-end; gap: 2px; }
.vi-ib { all: unset; cursor: pointer; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 11px; color: var(--muted); transition: background .18s, color .18s, transform .15s; }
.vi-ib:hover { background: var(--mint); color: var(--teal-d); transform: translateY(-1px); }
.vi-ib.d:hover { background: #fde8e6; color: #b42318; }

.vi-empty { padding: 60px 20px 64px; text-align: center; color: var(--muted); }
.vi-emptyico { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: vi-float 4s ease-in-out infinite alternate; }
@keyframes vi-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.vi-empty b { display: block; color: var(--ink); font-size: 17px; margin-bottom: 4px; }
.vi-empty .vi-btn { margin-top: 18px; }
.vi-skel { height: 60px; margin: 0 20px; border-bottom: 1px solid #eef4f2; display: flex; align-items: center; gap: 24px; }
.vi-skel i { display: block; height: 14px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: vi-shine 1.4s ease infinite; }

.vi-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 20px; border-top: 1px solid var(--line); background: #fcfefd; color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.vi-foot b { color: var(--ink); font-weight: 700; }
.vi-pager { display: flex; align-items: center; gap: 12px; }
.vi-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; background: #fff; color: var(--text);
  box-shadow: inset 0 0 0 1.5px #d3e4df; transition: background .2s, color .2s, box-shadow .2s, transform .15s; }
.vi-pg:hover:not(:disabled) { background: var(--mint); color: var(--teal-d); box-shadow: inset 0 0 0 1.5px #a9cfc5; transform: translateY(-1px); }
.vi-pg:disabled { opacity: .4; cursor: not-allowed; }
.vi-pager span { min-width: 52px; text-align: center; font-size: 14px; font-weight: 700; color: var(--ink); }

/* ---------- modals (form / delete / document) ---------- */
.vi-ovl { position: fixed; inset: 0; z-index: 2100; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto;
  background: rgba(15,55,51,.45); backdrop-filter: blur(4px); animation: vi-fade .2s ease both; }
@keyframes vi-fade { from { opacity: 0; } to { opacity: 1; } }
.vi-modal { position: relative; width: 100%; max-width: 520px; background: #fff; border-radius: 24px; overflow: hidden; color: var(--ink);
  box-shadow: 0 30px 70px -20px rgba(15,55,51,.5); animation: vi-pop .32s cubic-bezier(.2,1.2,.4,1) both; }
@keyframes vi-pop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
.vi-mhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 24px 6px; }
.vi-mhead h3 { font-size: 18px; font-weight: 700; color: var(--ink); }
.vi-close { all: unset; cursor: pointer; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; background: #eef5f2; color: var(--muted); transition: background .2s, color .2s, transform .2s; }
.vi-close:hover { background: #fde8e6; color: #b42318; transform: rotate(90deg); }
.vi-mbody { display: grid; gap: 16px; padding: 14px 24px 8px; max-height: 70vh; overflow-y: auto; }
.vi-fg label { display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: var(--muted); }
.vi-fg label i { color: #c0392b; font-style: normal; }
.vi-input { width: 100%; height: 46px; padding: 0 14px; font: inherit; font-size: 14px; color: var(--ink); background-color: #f6faf8; border: 1.5px solid #d3e4df; border-radius: 13px; outline: none;
  transition: border-color .2s, box-shadow .2s, background-color .2s; color-scheme: light; }
.vi-input:hover { border-color: #b9d3cc; }
.vi-input:focus { background-color: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.vi-input::placeholder { color: #86a39d; }
select.vi-input { appearance: none; -webkit-appearance: none; padding-right: 38px; cursor: pointer; background-repeat: no-repeat; background-position: right 13px center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235f8a82' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
.vi-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.vi-ferr { padding: 10px 12px; border-radius: 12px; background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 13px; }
.vi-mfoot { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px 22px; }

/* ---------- vendor invoice document ---------- */
.vi-docmodal { max-width: 560px; background: #e9f4f0; }
.vi-docbody { max-height: 80vh; overflow-y: auto; padding: 28px 24px 18px; }
.vi-doc { position: relative; overflow: hidden; background: #fff; border-radius: 20px; padding: 0 26px 26px; box-shadow: 0 16px 30px -18px rgba(14,90,81,.5); }
.vi-accent { height: 7px; margin: 0 -26px 22px; background: linear-gradient(90deg, #1f8a7d, #3bb5a4 55%, #8cc63f); }
.vi-dhead { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.vi-dtitle { display: flex; align-items: center; gap: 12px; }
.vi-dlogo { width: 46px; height: 46px; border-radius: 15px; display: grid; place-items: center; color: #fff; background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 10px 18px -8px rgba(23,111,101,.6); }
.vi-dtitle b { display: block; font-size: 17px; font-weight: 800; line-height: 1.3; }
.vi-dtitle small { display: block; font-size: 11.5px; font-weight: 700; letter-spacing: .12em; color: var(--teal-d); text-transform: uppercase; }
.vi-dno { text-align: right; }
.vi-dno small { display: block; font-size: 11.5px; color: var(--muted); }
.vi-dno b { display: block; font-size: 16px; font-weight: 800; margin-bottom: 4px; word-break: break-all; }
.vi-dinfo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.vi-dbox { padding: 14px 16px; border-radius: 16px; background: #f3f9f7; }
.vi-dbox h4 { margin: 0 0 8px; font-size: 11.5px; font-weight: 800; letter-spacing: .08em; color: var(--muted); text-transform: uppercase; }
.vi-dline { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; padding: 2px 0; }
.vi-dline span { color: var(--muted); } .vi-dline b { text-align: right; font-weight: 700; word-break: break-word; }
.vi-damount { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 18px 20px; border-radius: 18px; color: #fff;
  background: radial-gradient(220px 100px at 100% 0%, rgba(255,255,255,.2), transparent 65%), linear-gradient(150deg, #19917f 0%, #0e5a51 65%, #0b463f 100%); }
.vi-damount span { font-size: 13.5px; font-weight: 600; opacity: .9; }
.vi-damount b { font-size: 28px; font-weight: 800; font-variant-numeric: tabular-nums; }
.vi-late { margin-top: 12px; padding: 9px 12px; border-radius: 12px; background: #fdeceb; color: #b9382d; font-size: 13px; font-weight: 700; }
.vi-dnote { margin: 18px 0 0; text-align: center; font-size: 12px; color: var(--muted); }
.vi-dfoot { display: flex; gap: 10px; padding: 14px 24px 20px; background: #fff; border-top: 1px solid var(--line); }
.vi-dfoot .vi-btn { flex: 1; }

@keyframes vi-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes vi-slide { from { opacity: 0; transform: translateY(6px); } }
@keyframes vi-shine { from { background-position: 100% 0; } to { background-position: 0 0; } }
@keyframes vi-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .vi-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 720px) {
  .vi { padding: 20px 16px 36px; } .vi-tiles { grid-template-columns: 1fr; } .vi .vi-title small { display: block; margin: 0; } .vi-search { width: 100%; }
  .vi-row2, .vi-dinfo { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .vi *, .vi *::before, .vi *::after, .vi-portal *, .vi-portal *::before, .vi-portal *::after { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}

/* ---------- print: only the vendor invoice document (A4) ---------- */
@media print {
  @page { size: A4; margin: 12mm; }
  html, body { display: block !important; width: auto !important; min-width: 0 !important; height: auto !important; overflow: visible !important; background: #fff !important; }
  body > *:not(.vi-portal) { display: none !important; }
  .vi-noprint { display: none !important; }
  .vi-ovl { position: static !important; display: block !important; padding: 0 !important; overflow: visible !important; background: none !important; backdrop-filter: none !important; animation: none !important; }
  .vi-modal { position: static !important; max-width: none !important; width: 100% !important; background: none !important; box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; animation: none !important; }
  .vi-docbody { max-height: none !important; overflow: visible !important; padding: 0 !important; }
  .vi-doc { box-shadow: none !important; border: 1px solid #cfe0db; }
  .vi-portal * { -webkit-print-color-adjust: exact; print-color-adjust: exact; animation: none !important; }
}
`;

const STATUS_ICON = { pending: Clock, paid: CheckCircle2, cancelled: XCircle };

const pad = (n) => String(n).padStart(2, "0");
const toLocalISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const money = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dueOf = (inv) => String(inv?.due_date || "").slice(0, 10);
const fmtDay = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso || "N/A"
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const daysLate = (iso, todayISO) =>
  Math.max(0, Math.round((new Date(`${todayISO}T00:00:00`) - new Date(`${iso}T00:00:00`)) / 86400000));
const normStatus = (s) => {
  const v = String(s || "pending").toLowerCase();
  return v === "canceled" ? "cancelled" : v;
};
const csvCell = (x) => {
  let v = String(x ?? "");
  if (/^[=+\-@\t\r]/.test(v) && Number.isNaN(Number(v))) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
};

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

function Tile({ label, target, sub, icon: Icon, tone, hero, delay, color }) {
  const shown = useCountUp(target, 2);
  return (
    <div className={`vi-tile${hero ? " hero" : ""}`} style={{ "--d": `${delay}ms` }}>
      <div className={`vi-chip-i ${tone}`}>
        <Icon size={23} strokeWidth={1.9} />
      </div>
      <div>
        <span>{label}</span>
        <b style={!hero && color ? { color } : undefined}>${shown}</b>
        {sub && <em>{sub}</em>}
      </div>
    </div>
  );
}

const EMPTY_FORM = { invoice_number: "", supplier_id: "", amount: "", due_date: "", status: "pending" };

export default function VendorInvoicePage() {
  const { lang, t } = useTranslation();
  const tvi = t.vendorInvoices;

  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState(EMPTY_FORM);
  const reqId = useRef(0);

  const STATUS_LABELS = {
    pending: tvi.statusPending,
    paid: tvi.statusPaid,
    cancelled: tvi.statusCancelled,
  };

  const FILTERS = [
    { key: "all", label: tvi.filterAll },
    { key: "pending", label: tvi.filterPending },
    { key: "paid", label: tvi.filterPaid },
    { key: "cancelled", label: tvi.filterCancelled },
  ];

  useEffect(() => {
    fetchInvoices();
    fetchSuppliers();
  }, []);

  const fetchInvoices = async () => {
    const id = ++reqId.current;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getVendorInvoices();
      if (id !== reqId.current) return;
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setInvoices(list);
    } catch (err) {
      if (id !== reqId.current) return;
      console.error("Error fetching vendor invoices:", err);
      const msg = err?.message || tvi.fetchError;
      setErrorMsg(msg);
      toastr.error(tvi.toastErrorTitle, msg);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      const list = res?.data?.data || res?.data || res || [];
      setSuppliers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormError("");
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (inv) => {
    setViewItem(null);
    setIsEditing(true);
    setSelectedId(inv.id);
    setFormError("");
    setFormData({
      invoice_number: inv.invoice_number || "",
      supplier_id: inv.supplier_id || "",
      amount: inv.amount ?? "",
      due_date: dueOf(inv),
      status: normStatus(inv.status),
    });
    setShowModal(true);
  };

  const closeForm = () => {
    if (!submitting) setShowModal(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError("");
      const payload = { ...formData, amount: Number(formData.amount) };
      if (isEditing) {
        await updateVendorInvoice(selectedId, payload);
        toastr.success(tvi.toastUpdateSuccessTitle, tvi.toastUpdateSuccessMsg);
      } else {
        await createVendorInvoice(payload);
        toastr.success(tvi.toastCreateSuccessTitle, tvi.toastCreateSuccessMsg);
      }
      setShowModal(false);
      fetchInvoices();
    } catch (err) {
      console.error("Error saving vendor invoice:", err);
      const msg = err?.response?.data?.message || err?.message || tvi.saveError;
      setFormError(msg);
      toastr.error(tvi.toastErrorTitle, msg);
    } finally {
      setSubmitting(false);
    }
  };

  // លុបវិក្កយបត្រដោយប្រើ Sweet Confirm & Toastr
  const handleDelete = async (inv) => {
    const label = inv.invoice_number || inv.id;
    const confirmed = await sweetConfirm({
      title: tvi.confirmDeleteTitle,
      text: tvi.confirmDeleteText(label),
      confirmText: tvi.confirmDeleteBtn,
      cancelText: tvi.cancelBtn,
      type: "danger",
    });

    if (confirmed) {
      try {
        await deleteVendorInvoice(inv.id);
        setInvoices((prev) => prev.filter((item) => item.id !== inv.id));
        toastr.success(tvi.toastDeleteSuccessTitle, tvi.toastDeleteSuccessMsg(label));
      } catch (err) {
        toastr.error(tvi.toastErrorTitle, err?.response?.data?.message || err?.message || tvi.deleteError);
      }
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showModal) {
        if (!submitting) setShowModal(false);
      } else if (viewItem) {
        setViewItem(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal, submitting, viewItem]);

  const todayISO = toLocalISO(new Date());
  const isOverdue = (inv) => normStatus(inv.status) === "pending" && dueOf(inv) && dueOf(inv) < todayISO;

  const stats = useMemo(() => {
    const sumOf = (list) => list.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const pending = invoices.filter((i) => normStatus(i.status) === "pending");
    const paid = invoices.filter((i) => normStatus(i.status) === "paid");
    const cancelled = invoices.filter((i) => normStatus(i.status) === "cancelled");
    const overdue = pending.filter((i) => dueOf(i) && dueOf(i) < todayISO);
    return {
      total: sumOf(invoices.filter((i) => normStatus(i.status) !== "cancelled")),
      count: invoices.length,
      pending: { amount: sumOf(pending), n: pending.length },
      paid: { amount: sumOf(paid), n: paid.length },
      overdue: { amount: sumOf(overdue), n: overdue.length },
      counts: { all: invoices.length, pending: pending.length, paid: paid.length, cancelled: cancelled.length },
    };
  }, [invoices, todayISO]);

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter(
      (inv) =>
        (statusFilter === "all" || normStatus(inv.status) === statusFilter) &&
        (!q ||
          String(inv.supplier?.name || "").toLowerCase().includes(q) ||
          String(inv.invoice_number || "").toLowerCase().includes(q)),
    );
  }, [invoices, search, statusFilter]);

  const pages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = filteredInvoices.slice(start, start + PAGE_SIZE);

  const changeFilter = (k) => {
    setStatusFilter(k);
    setPage(1);
  };
  const changeSearch = (v) => {
    setSearch(v);
    setPage(1);
  };

  const exportCsv = () => {
    const lines = [
      ["Invoice", "Supplier", "Amount", "Due date", "Status"],
      ...filteredInvoices.map((i) => [
        i.invoice_number || i.id,
        i.supplier?.name || "",
        Number(i.amount) || 0,
        dueOf(i),
        normStatus(i.status),
      ]),
    ];
    const csv = "\uFEFF" + lines.map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendor-invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFilter = search.trim() !== "" || statusFilter !== "all";
  const setField = (k) => (e) => setFormData((f) => ({ ...f, [k]: e.target.value }));

  const statCards = [
    { label: tvi.tileTotal, target: stats.total, sub: `${stats.count} ${tvi.invoiceSuffix}`, icon: DollarSign, tone: "t-dark", hero: true },
    { label: tvi.tilePending, target: stats.pending.amount, sub: `${stats.pending.n} ${tvi.invoiceSuffix}`, icon: Clock, tone: "t-amber", color: "#9a6a0a" },
    { label: tvi.tilePaid, target: stats.paid.amount, sub: `${stats.paid.n} ${tvi.invoiceSuffix}`, icon: CheckCircle2, tone: "t-green", color: "#4d7c0f" },
    { label: tvi.tileOverdue, target: stats.overdue.amount, sub: `${stats.overdue.n} ${tvi.invoiceSuffix}`, icon: AlertTriangle, tone: "t-red", color: "#b9382d" },
  ];

  const v = viewItem;
  const vStatus = v ? normStatus(v.status) : "pending";
  const vLate = v && isOverdue(v) ? daysLate(dueOf(v), todayISO) : 0;
  const docModal = v && (
    <div className="vi-portal">
      <div className="vi-ovl" onClick={() => setViewItem(null)}>
        <div className="vi-modal vi-docmodal" role="dialog" aria-modal="true" aria-label={tvi.docTitle} onClick={(e) => e.stopPropagation()}>
          <div className="vi-docbody">
            <article className="vi-doc">
              <div className="vi-accent" />
              <div className="vi-dhead">
                <div className="vi-dtitle">
                  <span className="vi-dlogo">
                    <FileText size={22} strokeWidth={1.9} />
                  </span>
                  <div>
                    <b>{tvi.docTitle}</b>
                    {lang === "km" && <small>Vendor Invoice</small>}
                  </div>
                </div>
                <div className="vi-dno">
                  <small>{tvi.docInvoiceNo}</small>
                  <b>#{v.invoice_number || v.id}</b>
                  <span className={`vi-badge ${vStatus}`}>{STATUS_LABELS[vStatus] || vStatus}</span>
                </div>
              </div>

              <div className="vi-dinfo">
                <div className="vi-dbox">
                  <h4>{tvi.docSupplierSection}</h4>
                  <div className="vi-dline">
                    <span>{tvi.docSupplierName}</span>
                    <b>{v.supplier?.name || "N/A"}</b>
                  </div>
                  <div className="vi-dline">
                    <span>{tvi.docSupplierPhone}</span>
                    <b>{v.supplier?.phone || "N/A"}</b>
                  </div>
                </div>
                <div className="vi-dbox">
                  <h4>{tvi.docInfoSection}</h4>
                  <div className="vi-dline">
                    <span>{tvi.docDueDate}</span>
                    <b>{dueOf(v) ? fmtDay(dueOf(v)) : "N/A"}</b>
                  </div>
                  <div className="vi-dline">
                    <span>{tvi.docCreatedAt}</span>
                    <b>{v.created_at ? new Date(v.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</b>
                  </div>
                </div>
              </div>

              <div className="vi-damount">
                <span>{tvi.docTotalAmount}</span>
                <b>{money(v.amount)}</b>
              </div>
              {vLate > 0 && <div className="vi-late">{tvi.overdueDays(vLate)}</div>}
              <p className="vi-dnote">{tvi.docPrintedOn} {fmtDay(todayISO)}</p>
            </article>
          </div>
          <div className="vi-dfoot vi-noprint">
            <button className="vi-btn" onClick={() => setViewItem(null)}>
              {tvi.closeBtn}
            </button>
            <button className="vi-btn" onClick={() => handleOpenEdit(v)}>
              <Pencil size={16} /> {tvi.editTitle}
            </button>
            <button className="vi-btn primary" onClick={() => window.print()}>
              <Printer size={16} /> {tvi.printBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="vi">
        {/* Top Header */}
        <div className="vi-top">
          <div className="vi-brand">
            <div className="vi-brand-ico">
              <FileText size={26} strokeWidth={1.9} />
            </div>
            <div>
              <h2 className="vi-title">
                {tvi.heading}
                {lang === "km" && <small>Vendor Invoices</small>}
              </h2>
              <p className="vi-sub">{tvi.subHeading}</p>
            </div>
          </div>

          <div className="vi-actions">
            <button className="vi-btn" onClick={fetchInvoices} disabled={loading}>
              <RefreshCw size={16} className={loading ? "vi-spin" : ""} /> {tvi.refresh}
            </button>
            <button className="vi-btn" onClick={exportCsv} disabled={filteredInvoices.length === 0}>
              <Download size={16} /> {tvi.exportCsv}
            </button>
            <button className="vi-btn primary" onClick={handleOpenCreate}>
              <Plus size={17} strokeWidth={2.4} /> {tvi.addNew}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="vi-err" role="alert">
            <span>{errorMsg}</span>
            <button onClick={fetchInvoices}>{tvi.tryAgain}</button>
          </div>
        )}

        {/* Stat tiles */}
        <div className="vi-tiles">
          {statCards.map((c, i) => (
            <Tile key={c.label} {...c} delay={i * 70} />
          ))}
        </div>

        {/* Table card */}
        <section className="vi-panel">
          <div className="vi-tools">
            <div className="vi-search">
              <Search size={17} />
              <input
                type="text"
                placeholder={tvi.searchPlaceholder}
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                aria-label={tvi.searchPlaceholder}
              />
              {search && (
                <button className="vi-x" onClick={() => changeSearch("")} aria-label={tvi.clearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="vi-chips" role="group" aria-label="Filter by status">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  aria-pressed={statusFilter === f.key}
                  className={`vi-chip${statusFilter === f.key ? " on" : ""}`}
                  onClick={() => changeFilter(f.key)}
                >
                  {f.label}
                  <em>{stats.counts[f.key]}</em>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div aria-busy="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <div className="vi-skel" key={i}>
                  <i style={{ width: 120 }} />
                  <i style={{ width: "22%" }} />
                  <i style={{ width: "10%", marginLeft: "auto" }} />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="vi-empty">
              <div className="vi-emptyico">
                <FileText size={32} strokeWidth={1.7} />
              </div>
              <b>{invoices.length === 0 ? tvi.emptyNoData : tvi.emptyNoResult}</b>
              {invoices.length === 0 ? tvi.emptySubNoData : tvi.emptySubNoResult}
              <div>
                {invoices.length === 0 ? (
                  <button className="vi-btn primary" onClick={handleOpenCreate}>
                    <Plus size={17} strokeWidth={2.4} /> {tvi.addNew}
                  </button>
                ) : (
                  hasFilter && (
                    <button
                      className="vi-btn"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setPage(1);
                      }}
                    >
                      <X size={16} /> {tvi.clearFilters}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="vi-tablewrap">
              <div className="vi-gridwrap">
                <div className="vi-head">
                  <span>{tvi.colInvoiceNo}</span>
                  <span>{tvi.colSupplier}</span>
                  <span style={{ textAlign: "right" }}>{tvi.colAmount}</span>
                  <span>{tvi.colDueDate}</span>
                  <span>{tvi.colStatus}</span>
                  <span style={{ textAlign: "right" }}>{tvi.colActions}</span>
                </div>
                <div key={`${statusFilter}-${current}`}>
                  {rows.map((inv, idx) => {
                    const st = normStatus(inv.status);
                    const StIcon = STATUS_ICON[st];
                    const late = isOverdue(inv);
                    const label = inv.invoice_number || inv.id;
                    const supName = inv.supplier?.name || "N/A";
                    return (
                      <div className="vi-row" style={{ "--i": idx }} key={inv.id ?? idx}>
                        <span>
                          <button className="vi-no" onClick={() => setViewItem(inv)} title={`#${label}`}>
                            #{label}
                          </button>
                        </span>
                        <div className="vi-sup">
                          <span className="vi-av">{supName.trim().charAt(0).toUpperCase()}</span>
                          <span title={supName}>{supName}</span>
                        </div>
                        <span className="vi-amt">{money(inv.amount)}</span>
                        <div className={`vi-due${late ? " late" : ""}`}>
                          {dueOf(inv) ? fmtDay(dueOf(inv)) : "N/A"}
                          {late && <small>{tvi.overdueDays(daysLate(dueOf(inv), todayISO))}</small>}
                        </div>
                        <span className={`vi-badge ${st}`}>
                          {StIcon && <StIcon size={13} />}
                          {STATUS_LABELS[st] || st}
                        </span>
                        <div className="vi-acts">
                          <button className="vi-ib" title={tvi.viewTitle} aria-label={`${tvi.viewTitle} ${label}`} onClick={() => setViewItem(inv)}>
                            <Eye size={17} />
                          </button>
                          <button className="vi-ib" title={tvi.editTitle} aria-label={`${tvi.editTitle} ${label}`} onClick={() => handleOpenEdit(inv)}>
                            <Pencil size={17} />
                          </button>
                          <button
                            className="vi-ib d"
                            title={tvi.deleteTitle}
                            aria-label={`${tvi.deleteTitle} ${label}`}
                            onClick={() => handleDelete(inv)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!loading && filteredInvoices.length > 0 && (
            <div className="vi-foot">
              <span>
                {tvi.showing}{" "}
                <b>
                  {start + 1}–{Math.min(start + PAGE_SIZE, filteredInvoices.length)}
                </b>{" "}
                {tvi.of} <b>{filteredInvoices.length}</b>
              </span>
              <div className="vi-pager">
                <button className="vi-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page">
                  <ChevronLeft size={18} />
                </button>
                <span aria-live="polite">
                  {current} / {pages}
                </span>
                <button className="vi-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Modal Create / Edit */}
        {showModal && (
          <div className="vi-portal">
            <div className="vi-ovl" onClick={closeForm}>
              <div className="vi-modal" role="dialog" aria-modal="true" aria-labelledby="vi-form-title" onClick={(e) => e.stopPropagation()}>
                <div className="vi-mhead">
                  <h3 id="vi-form-title">{isEditing ? tvi.modalEditTitle : tvi.modalCreateTitle}</h3>
                  <button className="vi-close" onClick={closeForm} aria-label={tvi.closeBtn}>
                    <X size={17} />
                  </button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="vi-mbody">
                    <div className="vi-fg">
                      <label htmlFor="vi-f-no">
                        {tvi.labelInvoiceNo} <i>*</i>
                      </label>
                      <input
                        id="vi-f-no"
                        className="vi-input"
                        type="text"
                        required
                        placeholder={tvi.placeholderInvoiceNo}
                        value={formData.invoice_number}
                        onChange={setField("invoice_number")}
                      />
                    </div>
                    <div className="vi-fg">
                      <label htmlFor="vi-f-sup">
                        {tvi.labelSupplier} <i>*</i>
                      </label>
                      <select id="vi-f-sup" className="vi-input" required value={formData.supplier_id} onChange={setField("supplier_id")}>
                        <option value="">{tvi.selectSupplier}</option>
                        {suppliers.map((sup) => (
                          <option key={sup.id} value={sup.id}>
                            {sup.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="vi-row2">
                      <div className="vi-fg">
                        <label htmlFor="vi-f-amt">
                          {tvi.labelAmount} <i>*</i>
                        </label>
                        <input
                          id="vi-f-amt"
                          className="vi-input"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={setField("amount")}
                        />
                      </div>
                      <div className="vi-fg">
                        <label htmlFor="vi-f-due">
                          {tvi.labelDueDate} <i>*</i>
                        </label>
                        <input id="vi-f-due" className="vi-input" type="date" required value={formData.due_date} onChange={setField("due_date")} />
                      </div>
                    </div>
                    <div className="vi-fg">
                      <label htmlFor="vi-f-st">{tvi.labelStatus}</label>
                      <select id="vi-f-st" className="vi-input" value={formData.status} onChange={setField("status")}>
                        <option value="pending">{tvi.optionPending}</option>
                        <option value="paid">{tvi.optionPaid}</option>
                        <option value="cancelled">{tvi.optionCancelled}</option>
                      </select>
                    </div>
                    {formError && (
                      <div className="vi-ferr" role="alert">
                        {formError}
                      </div>
                    )}
                  </div>
                  <div className="vi-mfoot">
                    <button type="button" className="vi-btn" onClick={closeForm} disabled={submitting}>
                      {tvi.cancelBtn}
                    </button>
                    <button type="submit" className="vi-btn primary" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="vi-spin" /> {tvi.savingBtn}
                        </>
                      ) : (
                        tvi.saveBtn
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ឯកសារវិក្កយបត្រ (មើល / បោះពុម្ព) — render ទៅលើ <body> */}
        {docModal && createPortal(docModal, document.body)}
      </div>
    </Layout>
  );
}