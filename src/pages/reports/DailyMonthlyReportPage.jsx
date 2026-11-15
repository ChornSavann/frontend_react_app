// src/pages/reports/DailyMonthlyReportPage.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Flame,
  BarChart3,
  Calendar,
  RefreshCw,
  FileText,
  Download,
  Search,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Truck,
  Store,
  Printer,
} from "lucide-react";
import Layout from "../../components/Layout";
import {
  getDailyReport,
  getMonthlyReport,
  getWeeklyReport,
} from "../../services/reportService";

const PAGE_SIZE = 10;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.rt, .rt-portal { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; line-height: 1.6; color-scheme: light; }
.rt { padding: 28px 32px 44px; font-size: 14px; }
.rt *, .rt *::before, .rt *::after, .rt-portal, .rt-portal *, .rt-portal *::before, .rt-portal *::after { box-sizing: border-box; }

.rt-in { animation: rt-rise .6s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--d, 0) * 70ms); }
@keyframes rt-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* ---------- header ---------- */
.rt-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.rt-titlewrap { display: flex; align-items: center; gap: 14px; }
.rt-titleico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.rt .rt-title { margin: 0; font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.rt .rt-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.rt .rt-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; }

/* sliding Daily / Weekly / Monthly switch */
.rt-switch { position: relative; display: inline-grid; grid-template-columns: repeat(3, 1fr); padding: 4px; background: #e4efeb; border-radius: 15px; }
.rt-thumb { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc((100% - 8px) / 3); border-radius: 11px;
  background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 8px 16px -8px rgba(23,111,101,.7); transition: transform .32s cubic-bezier(.3,1.2,.5,1); }
.rt-switch[data-i="1"] .rt-thumb { transform: translateX(100%); }
.rt-switch[data-i="2"] .rt-thumb { transform: translateX(200%); }
.rt-switch button { all: unset; position: relative; z-index: 1; cursor: pointer; height: 38px; padding: 0 18px; display: flex; align-items: center; justify-content: center;
  font-family: inherit; font-size: 14px; font-weight: 700; color: var(--muted); white-space: nowrap; border-radius: 11px; transition: color .25s; }
.rt-switch button:hover { color: var(--ink); }
.rt-switch button.on, .rt-switch button.on:hover { color: #fff; }
.rt-switch button:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

/* ---------- buttons ---------- */
.rt-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px;
  border-radius: 13px; font-family: inherit; font-weight: 700; font-size: 14px; transition: transform .15s, box-shadow .25s, background .2s, border-color .2s; }
.rt-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.rt-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.rt-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.rt-btn.primary:hover::after { left: 130%; }
.rt-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.rt-btn.ghost { color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db; }
.rt-btn.ghost:hover:not(:disabled) { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.rt-btn:active:not(:disabled) { transform: scale(.98); }
.rt-btn:disabled { opacity: .6; cursor: not-allowed; }
.rt-spin { animation: rt-rot .8s linear infinite; }
@keyframes rt-rot { to { transform: rotate(360deg); } }

/* ---------- filter bar ---------- */
.rt-filters { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; padding: 16px 20px; margin-bottom: 20px; background: #fff;
  border: 1px solid var(--line); border-radius: 20px; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); }
.rt-fico { width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); }
.rt-fields { display: flex; gap: 12px; flex-wrap: wrap; }
.rt-field label { display: block; margin-bottom: 4px; font-size: 12.5px; font-weight: 600; color: var(--muted); }
.rt-input { height: 44px; min-width: 170px; padding: 0 14px; font: inherit; font-size: 14px; color: var(--ink); background-color: #f6faf8;
  border: 1.5px solid #d3e4df; border-radius: 13px; outline: none; transition: border-color .2s, box-shadow .2s, background-color .2s; color-scheme: light; }
.rt-input:hover:not(:disabled) { border-color: #b9d3cc; }
.rt-input:focus { background-color: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.rt-input:disabled { opacity: .75; cursor: not-allowed; }
select.rt-input { appearance: none; -webkit-appearance: none; padding-right: 38px; cursor: pointer; background-repeat: no-repeat; background-position: right 13px center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235f8a82' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
.rt-quick { display: flex; gap: 6px; align-items: center; }
.rt-q { all: unset; box-sizing: border-box; cursor: pointer; height: 34px; padding: 0 13px; display: inline-flex; align-items: center; border-radius: 99px; font-family: inherit; font-size: 13px; font-weight: 600;
  color: var(--muted); background: #eef5f2; transition: background .2s, color .2s; }
.rt-q:hover { background: #dcece6; color: var(--ink); }
.rt-q.on { background: var(--mint); color: var(--teal-d); box-shadow: inset 0 0 0 1.5px rgba(31,138,125,.3); }
.rt-q:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.rt-fright { margin-left: auto; display: flex; gap: 10px; flex-wrap: wrap; }

.rt-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; }
.rt-err button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.rt-err button:hover { background: #fde8e6; }

/* ---------- stat tiles ---------- */
.rt-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
.rt-tile { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .22s, box-shadow .22s; animation: rt-rise .6s cubic-bezier(.2,.8,.2,1) var(--d, 0ms) backwards; }
.rt-tile:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.rt-chip-i { width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: rgba(255,255,255,.18); color: #fff; }
.t-green { background: #dff1ea; color: #176f65; }
.t-blue { background: #e0f0f7; color: #0f6d8f; }
.t-leaf { background: #e8f5d6; color: #4d7c0f; }
.t-amber { background: #fdf1d6; color: #9a6a0a; }
.rt-tile span { display: block; font-size: 13px; color: var(--muted); font-weight: 500; line-height: 1.5; }
.rt-tile b { display: block; font-size: 24px; font-weight: 800; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.3; }
.rt-tile.hero { border-color: transparent; color: #fff; background: radial-gradient(240px 120px at 100% 0%, rgba(255,255,255,.2), transparent 65%), linear-gradient(150deg, #19917f 0%, #0e5a51 60%, #0b463f 100%);
  box-shadow: 0 18px 32px -18px rgba(11,70,63,.7); }
.rt-tile.hero span { color: rgba(255,255,255,.8); }
.rt-tile.hero:hover { box-shadow: 0 22px 38px -18px rgba(11,70,63,.75); }

/* ---------- chart ---------- */
.rt-chart { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 18px 20px 14px; margin-bottom: 20px; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); }
.rt-chart-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; font-size: 15px; }
.rt-chart-top b { font-weight: 700; }
.rt-period { display: inline-flex; align-items: center; gap: 6px; padding: 2px 12px; border-radius: 99px; background: var(--mint); color: var(--teal-d); font-size: 13px; font-weight: 700; }
.rt-bars { position: relative; display: flex; align-items: flex-end; gap: 5px; height: 180px; padding-top: 20px; border-bottom: 1px solid var(--line);
  background: repeating-linear-gradient(to top, transparent 0, transparent 43px, #eef4f2 43px, #eef4f2 44px); }
.rt-max { position: absolute; top: 0; left: 0; font-size: 11.5px; font-weight: 700; color: var(--muted); font-variant-numeric: tabular-nums; }
.rt-col { position: relative; flex: 1; height: 100%; display: flex; align-items: flex-end; justify-content: center; border-radius: 8px; transition: background .15s; }
.rt-col:hover { background: rgba(31,138,125,.07); }
.rt-bar { display: block; width: 100%; max-width: 30px; height: var(--h); border-radius: 8px 8px 3px 3px; background: linear-gradient(180deg, #3bb5a4, #176f65);
  transform-origin: bottom; animation: rt-grow .7s cubic-bezier(.2,.8,.2,1) calc(var(--bi) * 18ms) backwards; }
@keyframes rt-grow { from { transform: scaleY(0); } }
.rt-bar.peak { background: linear-gradient(180deg, #b8e35e, #7fb82a); box-shadow: 0 8px 16px -6px rgba(127,184,42,.55); }
.rt-bar.zero { height: 3px; background: #dce8e5; border-radius: 3px; animation: none; }
.rt-labels { display: flex; gap: 5px; padding-top: 6px; }
.rt-labels span { flex: 1; text-align: center; font-size: 11.5px; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.rt-chart-empty { padding: 44px 0; text-align: center; color: var(--muted); font-size: 14px; }

/* ---------- invoices panel ---------- */
.rt-panel { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); }
.rt-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.rt-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.rt .rt-ptitle { margin: 0; font-size: 16px; font-weight: 700; color: var(--ink); }
.rt-count { font-size: 13px; color: var(--muted); } .rt-count b { color: var(--ink); font-weight: 700; }
.rt-search { position: relative; display: flex; align-items: center; width: 320px; max-width: 100%; }
.rt-search > svg { position: absolute; left: 14px; color: #5f8a82; pointer-events: none; transition: color .2s; }
.rt-search:focus-within > svg { color: var(--teal); }
.rt-search input { width: 100%; height: 44px; padding: 0 40px 0 42px; font: inherit; font-size: 14px; color: var(--ink); background: #f6faf8; border: 1.5px solid #d3e4df; border-radius: 13px; outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s; color-scheme: light; }
.rt-search input::placeholder { color: #86a39d; }
.rt-search input:hover { border-color: #b9d3cc; }
.rt-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.rt-x { all: unset; cursor: pointer; position: absolute; right: 8px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #5f8a82; transition: background .2s, color .2s; }
.rt-x:hover { background: var(--mint); color: var(--teal-d); } .rt-x:focus-visible { outline: 2px solid var(--teal); }

.rt-tablewrap { overflow-x: auto; }
.rt-gridwrap { min-width: 1000px; }
.rt-head, .rt-row { display: grid; grid-template-columns: 150px minmax(0, 1.4fr) 120px 120px 100px 110px 170px 84px; gap: 12px; align-items: center; padding: 0 20px; }
.rt-head { height: 42px; font-size: 12.5px; font-weight: 700; letter-spacing: .3px; color: var(--muted); background: #f3f9f7; border-bottom: 1px solid var(--line); }
.rt-row { min-height: 56px; border-bottom: 1px solid #eef4f2; cursor: pointer; transition: background .15s; animation: rt-slide .4s cubic-bezier(.2,.8,.2,1) calc(var(--i) * 28ms) backwards; }
.rt-row:last-child { border-bottom: 0; }
.rt-row:hover { background: #f6fbf9; }
.rt-row:focus-visible { outline: 2px solid var(--teal); outline-offset: -2px; }
@keyframes rt-slide { from { opacity: 0; transform: translateY(6px); } }
.rt-inv { display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle; padding: 2px 10px; border-radius: 99px; background: var(--mint); color: var(--teal-d); font-weight: 700; font-size: 12.5px; }
.rt-cust { display: flex; align-items: center; gap: 10px; min-width: 0; font-weight: 600; }
.rt-cname { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rt-cname.walk { color: var(--muted); font-weight: 500; }
.rt-cav { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; font-size: 13px; font-weight: 800; color: #fff; background: linear-gradient(145deg, #3bb5a4, #1a7d70); }
.rt-cav.walk { background: #dcebe6; color: #4f726b; }
.rt-type { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.rt-type.dine { background: #eef4f2; color: #35504c; } .rt-type.delivery { background: #e0f0f7; color: #0f6d8f; }
.rt-badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 11px; border-radius: 99px; font-size: 12px; font-weight: 700; background: #eef1f1; color: #5b6f6b; white-space: nowrap; text-transform: capitalize; }
.rt-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.rt-badge.completed { background: #e8f5d6; color: #4d7c0f; } .rt-badge.pending { background: #fdf1d6; color: #9a6a0a; } .rt-badge.cancelled { background: #fdeceb; color: #b9382d; }
.rt-sub { text-align: right; color: var(--text); font-variant-numeric: tabular-nums; font-size: 13.5px; }
.rt-amt { text-align: right; font-weight: 800; color: var(--teal-d); font-variant-numeric: tabular-nums; white-space: nowrap; }
.rt-date { color: var(--muted); font-size: 12.5px; white-space: nowrap; }
.rt-acts { display: flex; justify-content: center; gap: 2px; }
.rt-act { all: unset; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 10px; color: var(--muted); transition: background .18s, color .18s, transform .15s; }
.rt-act:hover { background: var(--mint); color: var(--teal-d); transform: translateY(-1px); }
.rt-act:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }

.rt-empty { padding: 60px 20px 64px; text-align: center; color: var(--muted); }
.rt-emptyico { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: rt-float 4s ease-in-out infinite alternate; }
@keyframes rt-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.rt-empty b { display: block; color: var(--ink); font-size: 17px; margin-bottom: 4px; }
.rt-skelrow { display: flex; align-items: center; gap: 24px; height: 56px; padding: 0 20px; border-bottom: 1px solid #eef4f2; }
.rt-skel { display: block; height: 14px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: rt-shine 1.4s ease infinite; }
@keyframes rt-shine { from { background-position: 100% 0; } to { background-position: 0 0; } }

.rt-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 20px; border-top: 1px solid var(--line); background: #fcfefd; color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.rt-foot b { color: var(--ink); font-weight: 700; }
.rt-pager { display: flex; align-items: center; gap: 12px; }
.rt-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; background: #fff; color: var(--text);
  box-shadow: inset 0 0 0 1.5px #d3e4df; transition: background .2s, color .2s, box-shadow .2s, transform .15s; }
.rt-pg:hover:not(:disabled) { background: var(--mint); color: var(--teal-d); box-shadow: inset 0 0 0 1.5px #a9cfc5; transform: translateY(-1px); }
.rt-pg:active:not(:disabled) { transform: scale(.95); }
.rt-pg:disabled { opacity: .4; cursor: not-allowed; }
.rt-pg:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.rt-pager span { min-width: 52px; text-align: center; font-size: 14px; font-weight: 700; color: var(--ink); }

/* ---------- invoice sheet (rendered in a portal on <body>) ---------- */
.rt-ovl { position: fixed; inset: 0; z-index: 2100; display: flex; justify-content: center; align-items: center; padding: 20px;
  background: rgba(15,55,51,.45); backdrop-filter: blur(4px); animation: rt-ovl .2s ease both; }
@keyframes rt-ovl { from { opacity: 0; } to { opacity: 1; } }
.rt-sheet { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 780px; max-height: 92vh; background: #fff; border-radius: 24px; color: var(--ink);
  box-shadow: 0 30px 70px -20px rgba(15,55,51,.5); animation: rt-pop .32s cubic-bezier(.2,1.2,.4,1) both; overflow: hidden; }
@keyframes rt-pop { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
.rt-sheetbody { flex: 1; overflow-y: auto; padding: 30px 34px 10px; }
.rt-close { all: unset; cursor: pointer; position: absolute; top: 16px; right: 16px; z-index: 2; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%;
  background: #eef5f2; color: var(--muted); transition: background .2s, color .2s, transform .2s; }
.rt-close:hover { background: #fde8e6; color: #b42318; transform: rotate(90deg); }
.rt-close:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.rt-sheethead { text-align: center; padding-bottom: 18px; margin-bottom: 20px; border-bottom: 2px dashed #cfe0db; }
.rt-sbadge { display: inline-block; margin-bottom: 8px; padding: 4px 14px; border-radius: 99px; background: linear-gradient(135deg, #25998b, #176f65); color: #fff; font-size: 11.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.rt-portal .rt-sheettitle { margin: 0; font-size: 22px; line-height: 1.55; font-weight: 800; color: var(--ink); }
.rt-sheetno { margin: 2px 0 0; font-size: 14px; color: var(--muted); } .rt-sheetno b { color: var(--teal-d); }
.rt-info { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
.rt-infobox { padding: 14px 16px; border-radius: 16px; background: #f3f9f7; font-size: 13px; line-height: 1.7; }
.rt-infohead { margin: 0 0 6px; font-size: 12px; font-weight: 700; letter-spacing: .06em; color: var(--muted); text-transform: uppercase; }
.rt-infoname { font-size: 15.5px; font-weight: 800; color: var(--ink); }
.rt-infobox p { margin: 0; color: var(--text); } .rt-infobox b { color: var(--ink); }
.rt-infotype { font-weight: 700; color: #0f6d8f; text-transform: uppercase; }
.rt-portal .rt-sec { margin: 0 0 10px; font-size: 14.5px; font-weight: 700; color: var(--text); }
.rt-items { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-bottom: 20px; }
.rt-items th { padding: 9px 12px; text-align: left; background: #f3f9f7; color: var(--muted); font-size: 12px; font-weight: 700; }
.rt-items th:first-child { border-radius: 10px 0 0 10px; } .rt-items th:last-child { border-radius: 0 10px 10px 0; }
.rt-items td { padding: 10px 12px; border-bottom: 1px solid #eef4f2; }
.rt-items tbody tr { break-inside: avoid; } .rt-items tbody tr:last-child td { border-bottom: 0; }
.rt-items .c { text-align: center; } .rt-items .r { text-align: right; font-variant-numeric: tabular-nums; }
.rt-items .pn { font-weight: 600; color: var(--ink); } .rt-items .qty { font-weight: 800; color: #0f6d8f; } .rt-items .sum { font-weight: 800; color: var(--ink); }
.rt-items .none { text-align: center; color: var(--muted); padding: 22px; }
.rt-totals { display: flex; justify-content: flex-end; margin-bottom: 22px; padding-top: 14px; border-top: 1px solid var(--line); break-inside: avoid; }
.rt-totalbox { width: 290px; font-size: 14px; }
.rt-trow { display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--muted); }
.rt-trow span:last-child { color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }
.rt-trow.disc span:last-child { color: #c0392b; } .rt-trow.disc.zero span:last-child { color: var(--muted); }
.rt-trow.line { padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--line); }
.rt-grand { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 14px; background: var(--mint); font-size: 17px; font-weight: 800; color: var(--ink); }
.rt-grand b { color: var(--teal-d); font-size: 20px; font-variant-numeric: tabular-nums; }
.rt-sheetfoot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 34px 20px; border-top: 1px solid var(--line); background: #fff; }

@media (max-width: 1100px) { .rt-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 720px) {
  .rt { padding: 20px 16px 36px; } .rt-tiles { grid-template-columns: 1fr; } .rt .rt-title small { display: block; margin: 0; }
  .rt-fright { margin-left: 0; } .rt-search { width: 100%; } .rt-input { min-width: 140px; }
  .rt-sheetbody { padding: 24px 18px 8px; } .rt-sheetfoot { padding: 12px 18px 16px; } .rt-info { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .rt *, .rt *::before, .rt *::after, .rt-portal *, .rt-ovl, .rt-sheet { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}

/* ---------- print: only the invoice (portal), flowing over as many pages as needed ---------- */
@media print {
  @page { size: auto; margin: 10mm; }
  html, body { display: block !important; width: auto !important; min-width: 0 !important; height: auto !important; overflow: visible !important; background: #fff !important; }
  body > *:not(.rt-portal) { display: none !important; }
  .rt-portal { display: block !important; width: 100% !important; }
  .rt-noprint { display: none !important; }
  .rt-ovl { position: static !important; display: block !important; width: 100% !important; padding: 0 !important; background: none !important; backdrop-filter: none !important; animation: none !important; }
  .rt-sheet { position: static !important; display: block !important; width: 100% !important; max-width: 100% !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; border-radius: 0 !important; animation: none !important; }
  .rt-sheetbody { overflow: visible !important; padding: 0 !important; }
  .rt-sheet, .rt-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; animation: none !important; }
  .rt-info { grid-template-columns: 1fr 1fr !important; }
}
`;

const KM_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];
const KM_WEEKDAYS = ["ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍", "អាទិត្យ"];

const pad = (n) => String(n).padStart(2, "0");
const toLocalISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const money = (n) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDateTime = (s) => {
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? "-"
    : d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// CSV៖ ការពារ "formula injection" ក្នុង Excel (ក្រឡាដែលចាប់ផ្តើមដោយ = + - @)
const csvCell = (x) => {
  let v = String(x ?? "");
  if (/^[=+\-@\t\r]/.test(v) && Number.isNaN(Number(v))) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
};

const EMPTY_SUMMARY = { total_sales: 0, total_orders: 0 };

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

function Tile({ label, target, prefix = "", decimals = 0, text, icon: Icon, tone, hero, delay }) {
  const shown = useCountUp(text !== undefined ? 0 : target, decimals);
  return (
    <div className={`rt-tile${hero ? " hero" : ""}`} style={{ "--d": `${delay}ms` }}>
      <div className={`rt-chip-i ${tone}`}>
        <Icon size={22} strokeWidth={1.9} />
      </div>
      <div>
        <span>{label}</span>
        <b>{text !== undefined ? text : `${prefix}${shown}`}</b>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  const tone = s === "canceled" ? "cancelled" : s;
  return <span className={`rt-badge ${["completed", "pending", "cancelled"].includes(tone) ? tone : ""}`}>{s || "-"}</span>;
}

// ប្រភេទវិក្កយបត្រ៖ បង្ហាញតាមតម្លៃពិត (មិនបង្ខំជា Dine-in ទាំងអស់ទៀត)
function typeInfo(o) {
  const t = String(o.order_type || "").toLowerCase().replace(/[_\s]+/g, "-");
  if (t === "delivery") return { cls: "delivery", label: "Delivery", Icon: Truck };
  if (!t || t === "dine-in") return { cls: "dine", label: "Dine-in", Icon: Store };
  return { cls: "dine", label: t.charAt(0).toUpperCase() + t.slice(1), Icon: Store };
}

export default function DailyMonthlyReportPage() {
  const [reportType, setReportType] = useState("daily"); // 'daily' | 'weekly' | 'monthly'
  const [selectedDate, setSelectedDate] = useState(toLocalISO(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // State សម្រាប់ Modal វិក្កយបត្រលម្អិត (មើល / បោះពុម្ព)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printPending, setPrintPending] = useState(false);

  const reqId = useRef(0);

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, selectedDate, selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    const id = ++reqId.current;
    setPage(1);

    if (reportType === "daily" && !selectedDate) {
      setReportData([]);
      setSummary(EMPTY_SUMMARY);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      let res;
      if (reportType === "daily") {
        res = await getDailyReport({ date: selectedDate });
      } else if (reportType === "weekly") {
        res = await getWeeklyReport();
      } else {
        res = await getMonthlyReport({ month: selectedMonth, year: selectedYear });
      }

      if (id !== reqId.current) return;

      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const sum = list.reduce((s, o) => s + Number(o.total_amount || 0), 0);
      setReportData(list);
      setSummary({
        total_sales: Number(res?.total_sales ?? res?.total_revenue ?? sum) || 0,
        total_orders: Number(res?.total_orders ?? list.length) || 0,
      });
    } catch (err) {
      if (id !== reqId.current) return;
      console.error("Error loading report:", err);
      setReportData([]);
      setSummary(EMPTY_SUMMARY);
      setErrorMsg(err?.message || "បរាជ័យក្នុងការទាញយករបាយការណ៍");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const closeSheet = () => {
    setPrintPending(false);
    setSelectedOrder(null);
  };
  const openView = (o) => {
    setPrintPending(false);
    setSelectedOrder(o);
  };
  const openPrint = (o) => {
    setSelectedOrder(o);
    setPrintPending(true);
  };

  // បិទ Modal ដោយចុច Esc
  useEffect(() => {
    if (!selectedOrder) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedOrder]);

  // បោះពុម្ពបន្ទាប់ពី Modal បង្ហាញរួច
  useEffect(() => {
    if (!selectedOrder || !printPending) return undefined;
    const t = setTimeout(() => {
      setPrintPending(false);
      window.print();
    }, 350);
    return () => clearTimeout(t);
  }, [selectedOrder, printPending]);

  const today = new Date();
  const todayISO = toLocalISO(today);
  const yesterdayISO = toLocalISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));
  const thisMonth = { m: today.getMonth() + 1, y: today.getFullYear() };
  const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonth = { m: prevDate.getMonth() + 1, y: prevDate.getFullYear() };
  const isMonth = (p) => Number(selectedMonth) === p.m && Number(selectedYear) === p.y;
  const setMonthYear = (p) => {
    setSelectedMonth(p.m);
    setSelectedYear(p.y);
  };

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
  if (!years.includes(Number(selectedYear))) years.push(Number(selectedYear));

  let periodLabel;
  if (reportType === "daily") {
    const [y, m, d] = (selectedDate || "").split("-").map(Number);
    periodLabel = y && m && d ? `${d} ${KM_MONTHS[m - 1]} ${y}` : "-";
  } else if (reportType === "weekly") {
    periodLabel = "សប្តាហ៍នេះ";
  } else {
    periodLabel = `${KM_MONTHS[Number(selectedMonth) - 1] || selectedMonth} ${selectedYear}`;
  }

  const avg = summary.total_orders > 0 ? summary.total_sales / summary.total_orders : 0;

  const chart = useMemo(() => {
    let n = 24;
    if (reportType === "weekly") n = 7;
    else if (reportType === "monthly") n = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();

    const buckets = Array.from({ length: n }, (_, i) => ({
      label: reportType === "daily" ? i : reportType === "weekly" ? KM_WEEKDAYS[i] : i + 1,
      sales: 0,
      orders: 0,
    }));

    reportData.forEach((o) => {
      const d = new Date(o.created_at);
      if (Number.isNaN(d.getTime())) return;
      let idx;
      if (reportType === "daily") idx = d.getHours();
      else if (reportType === "weekly") idx = (d.getDay() + 6) % 7; // ចាប់ផ្តើមពីថ្ងៃច័ន្ទ
      else idx = d.getDate() - 1;
      if (buckets[idx]) {
        buckets[idx].sales += Number(o.total_amount || 0);
        buckets[idx].orders += 1;
      }
    });

    const max = Math.max(...buckets.map((b) => b.sales), 0);
    let peak = -1;
    buckets.forEach((b, i) => {
      if (b.sales > 0 && (peak < 0 || b.sales > buckets[peak].sales)) peak = i;
    });
    return { buckets, max, peak };
  }, [reportData, reportType, selectedMonth, selectedYear]);

  const peakText =
    chart.peak < 0
      ? "-"
      : reportType === "daily"
        ? `${pad(chart.buckets[chart.peak].label)}:00`
        : reportType === "weekly"
          ? chart.buckets[chart.peak].label
          : `${chart.buckets[chart.peak].label} ${KM_MONTHS[Number(selectedMonth) - 1]}`;
  const step = reportType === "daily" ? 3 : reportType === "weekly" ? 1 : 5;

  const nameOf = (o) => o.customer?.name || o.customer_name || "អតិថិជនទូទៅ";
  const isWalkIn = (o) => !o.customer?.name && !o.customer_name;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? reportData.filter(
          (o) =>
            String(o.order_number || o.id).toLowerCase().includes(q) ||
            nameOf(o).toLowerCase().includes(q),
        )
      : reportData;
  }, [reportData, search]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);

  const exportCsv = () => {
    const lines = [
      ["Order", "Customer", "Type", "Status", "Subtotal", "Total", "Date"],
      ...visible.map((o) => [
        o.order_number || `#${o.id}`,
        nameOf(o),
        o.order_type || "",
        o.status || "",
        Number(o.subtotal || 0),
        Number(o.total_amount || 0),
        o.created_at || "",
      ]),
    ];
    const csv = "\uFEFF" + lines.map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${reportType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const orderDetails = Array.isArray(selectedOrder?.details) ? selectedOrder.details : [];
  const orderDiscount = Number(selectedOrder?.discount_amount || 0);

  const sheet = selectedOrder && (
    <div className="rt-portal">
      <div className="rt-ovl" onClick={closeSheet}>
        <div
          className="rt-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rt-sheet-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="rt-close rt-noprint" onClick={closeSheet} aria-label="បិទ">
            <X size={18} />
          </button>

          <div className="rt-sheetbody">
            {/* Header */}
            <div className="rt-sheethead">
              <span className="rt-sbadge">Sales Invoice</span>
              <h2 className="rt-sheettitle" id="rt-sheet-title">
                វិក្កយបត្រលក់ទំនិញ
              </h2>
              <p className="rt-sheetno">
                លេខវិក្កយបត្រ៖ <b>{selectedOrder.order_number || `#${selectedOrder.id}`}</b>
              </p>
            </div>

            {/* Info Grid */}
            <div className="rt-info">
              <div className="rt-infobox">
                <h4 className="rt-infohead">ព័ត៌មានអតិថិជន</h4>
                <p className="rt-infoname">{nameOf(selectedOrder)}</p>
                <p>
                  ទូរស័ព្ទ៖ <b>{selectedOrder.customer?.phone || "N/A"}</b>
                </p>
                <p>អាសយដ្ឋាន៖ {selectedOrder.customer?.address || "N/A"}</p>
              </div>
              <div className="rt-infobox">
                <h4 className="rt-infohead">ព័ត៌មានវិក្កយបត្រ</h4>
                <p>
                  កាលបរិច្ឆេទ៖ <b>{fmtDateTime(selectedOrder.created_at)}</b>
                </p>
                <p>
                  ប្រភេទ៖ <span className="rt-infotype">{selectedOrder.order_type || "Dine-in"}</span>
                </p>
                <p>
                  ស្ថានភាព៖ <StatusBadge status={selectedOrder.status} />
                </p>
              </div>
            </div>

            {/* Items */}
            <h4 className="rt-sec">បញ្ជីទំនិញ (Products Bought)</h4>
            <table className="rt-items">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>ល.រ</th>
                  <th>ឈ្មោះទំនិញ</th>
                  <th className="c">ចំនួន</th>
                  <th className="r">តម្លៃឯកតា</th>
                  <th className="r">សរុប</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.length > 0 ? (
                  orderDetails.map((item, i) => (
                    <tr key={item.id ?? i}>
                      <td>{i + 1}</td>
                      <td className="pn">{item.product?.name || item.product_name || "ទំនិញ"}</td>
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
                      (គ្មានទិន្នន័យ details ភ្ជាប់មកជាមួយទេ)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div className="rt-totals">
              <div className="rt-totalbox">
                <div className="rt-trow">
                  <span>ទឹកប្រាក់រង (Subtotal)</span>
                  <span>${money(selectedOrder.subtotal)}</span>
                </div>
                <div className={`rt-trow disc${orderDiscount > 0 ? "" : " zero"}`}>
                  <span>បញ្ចុះតម្លៃ (Discount)</span>
                  <span>-${money(orderDiscount)}</span>
                </div>
                <div className="rt-trow line">
                  <span>ពន្ធ (Tax)</span>
                  <span>${money(selectedOrder.tax_amount)}</span>
                </div>
                <div className="rt-grand">
                  <span>សរុប (Total)</span>
                  <b>${money(selectedOrder.total_amount)}</b>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="rt-sheetfoot rt-noprint">
            <button className="rt-btn ghost" onClick={closeSheet}>
              បិទ
            </button>
            <button className="rt-btn primary" onClick={() => window.print()}>
              <Printer size={16} />
              <span>បោះពុម្ពវិក្កយបត្រ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <style>{css}</style>
      <div className="rt">
        <div className="rt-top rt-in" style={{ "--d": 0 }}>
          <div className="rt-titlewrap">
            <div className="rt-titleico">
              <BarChart3 size={26} strokeWidth={1.9} />
            </div>
            <div>
              <h2 className="rt-title">
                របាយការណ៍ការលក់<small>Reports</small>
              </h2>
              <p className="rt-sub">តាមដានចំណូល និងបញ្ជាទិញប្រចាំថ្ងៃ ប្រចាំសប្តាហ៍ ឬប្រចាំខែ</p>
            </div>
          </div>
          <div
            className="rt-switch"
            data-i={reportType === "daily" ? 0 : reportType === "weekly" ? 1 : 2}
            role="tablist"
            aria-label="ប្រភេទរបាយការណ៍"
          >
            <span className="rt-thumb" />
            <button type="button" role="tab" aria-selected={reportType === "daily"} className={reportType === "daily" ? "on" : ""} onClick={() => setReportType("daily")}>
              ប្រចាំថ្ងៃ
            </button>
            <button type="button" role="tab" aria-selected={reportType === "weekly"} className={reportType === "weekly" ? "on" : ""} onClick={() => setReportType("weekly")}>
              ប្រចាំសប្តាហ៍
            </button>
            <button type="button" role="tab" aria-selected={reportType === "monthly"} className={reportType === "monthly" ? "on" : ""} onClick={() => setReportType("monthly")}>
              ប្រចាំខែ
            </button>
          </div>
        </div>

        <section className="rt-filters rt-in" style={{ "--d": 1 }}>
          <div className="rt-fico">
            <Calendar size={21} strokeWidth={1.9} />
          </div>
          <div className="rt-fields">
            {reportType === "daily" && (
              <div className="rt-field">
                <label htmlFor="rt-date">ជ្រើសរើសថ្ងៃ</label>
                <input id="rt-date" className="rt-input" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
            )}
            {reportType === "weekly" && (
              <div className="rt-field">
                <label htmlFor="rt-week">អំឡុងពេល</label>
                <input id="rt-week" className="rt-input" type="text" value="សប្តាហ៍នេះ (Current Week)" disabled />
              </div>
            )}
            {reportType === "monthly" && (
              <>
                <div className="rt-field">
                  <label htmlFor="rt-month">ខែ</label>
                  <select id="rt-month" className="rt-input" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                    {KM_MONTHS.map((name, i) => (
                      <option key={i + 1} value={i + 1}>
                        {name} ({i + 1})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rt-field">
                  <label htmlFor="rt-year">ឆ្នាំ</label>
                  <select id="rt-year" className="rt-input" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="rt-quick" aria-label="ជម្រើសរហ័ស">
            {reportType === "daily" && (
              <>
                <button type="button" className={`rt-q${selectedDate === todayISO ? " on" : ""}`} onClick={() => setSelectedDate(todayISO)}>
                  ថ្ងៃនេះ
                </button>
                <button type="button" className={`rt-q${selectedDate === yesterdayISO ? " on" : ""}`} onClick={() => setSelectedDate(yesterdayISO)}>
                  ម្សិលមិញ
                </button>
              </>
            )}
            {reportType === "monthly" && (
              <>
                <button type="button" className={`rt-q${isMonth(thisMonth) ? " on" : ""}`} onClick={() => setMonthYear(thisMonth)}>
                  ខែនេះ
                </button>
                <button type="button" className={`rt-q${isMonth(prevMonth) ? " on" : ""}`} onClick={() => setMonthYear(prevMonth)}>
                  ខែមុន
                </button>
              </>
            )}
          </div>

          <div className="rt-fright">
            <button type="button" className="rt-btn ghost" onClick={exportCsv} disabled={visible.length === 0}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button type="button" className="rt-btn primary" onClick={fetchReportData} disabled={loading}>
              <RefreshCw size={16} className={loading ? "rt-spin" : ""} />
              <span>ផ្ទុកទិន្នន័យ</span>
            </button>
          </div>
        </section>

        {errorMsg && (
          <div className="rt-err" role="alert">
            <span>{errorMsg}</span>
            <button type="button" onClick={fetchReportData}>
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        <div className="rt-tiles">
          <Tile label="ចំណូលសរុប (Total Sales)" target={summary.total_sales} prefix="$" decimals={2} icon={DollarSign} tone="t-dark" hero delay={0} />
          <Tile label="ចំនួនវិក្កយបត្រ (Orders)" target={summary.total_orders} icon={ShoppingCart} tone="t-blue" delay={70} />
          <Tile label="មធ្យមក្នុងមួយវិក្កយបត្រ" target={avg} prefix="$" decimals={2} icon={TrendingUp} tone="t-leaf" delay={140} />
          <Tile
            label={reportType === "daily" ? "ម៉ោងលក់ដាច់បំផុត" : reportType === "weekly" ? "ថ្ងៃលក់ដាច់បំផុតប្រចាំសប្តាហ៍" : "ថ្ងៃលក់ដាច់បំផុត"}
            text={peakText}
            icon={Flame}
            tone="t-amber"
            delay={210}
          />
        </div>

        <section className="rt-chart rt-in" style={{ "--d": 3 }}>
          <div className="rt-chart-top">
            <b>{reportType === "daily" ? "ការលក់តាមម៉ោង" : reportType === "weekly" ? "ការលក់តាមថ្ងៃក្នុងសប្តាហ៍" : "ការលក់តាមថ្ងៃ"}</b>
            <span className="rt-period">
              <Calendar size={13} />
              {periodLabel}
            </span>
          </div>
          {loading ? (
            <div className="rt-bars">
              <div className="rt-skel" style={{ width: "100%", height: "100%", borderRadius: 12 }} />
            </div>
          ) : chart.max === 0 ? (
            <div className="rt-chart-empty">មិនមានទិន្នន័យសម្រាប់បង្ហាញក្រាហ្វ</div>
          ) : (
            <div key={`${reportType}-${selectedDate}-${selectedMonth}-${selectedYear}`}>
              <div className="rt-bars" aria-label="Sales chart">
                <span className="rt-max">${money(chart.max)}</span>
                {chart.buckets.map((b, i) => {
                  const pct = b.sales > 0 ? Math.max((b.sales / chart.max) * 100, 4) : 0;
                  const tip = `${reportType === "daily" ? `${pad(b.label)}:00` : b.label} · $${money(b.sales)} · ${b.orders} វិក្កយបត្រ`;
                  return (
                    <div className="rt-col" key={b.label} style={{ "--h": `${pct}%`, "--bi": i }} title={tip}>
                      <i className={`rt-bar${i === chart.peak ? " peak" : ""}${b.sales === 0 ? " zero" : ""}`} />
                    </div>
                  );
                })}
              </div>
              <div className="rt-labels">
                {chart.buckets.map((b, i) => (
                  <span key={b.label}>
                    {reportType === "weekly" ? b.label : i % step === 0 ? (reportType === "daily" ? pad(b.label) : b.label) : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rt-panel rt-in" style={{ "--d": 4 }}>
          <div className="rt-tools">
            <div className="rt-left">
              <h3 className="rt-ptitle">បញ្ជីវិក្កយបត្រ</h3>
              {!loading && (
                <span className="rt-count">
                  សរុប <b>{visible.length}</b> វិក្កយបត្រ
                </span>
              )}
            </div>
            <div className="rt-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ស្វែងរកលេខវិក្កយបត្រ ឬអតិថិជន…"
                aria-label="ស្វែងរកវិក្កយបត្រ"
              />
              {search && (
                <button
                  type="button"
                  className="rt-x"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="លុបការស្វែងរក"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div aria-busy="true" aria-label="កំពុងទាញយកទិន្នន័យ">
              {[0, 1, 2, 3, 4].map((i) => (
                <div className="rt-skelrow" key={i}>
                  <i className="rt-skel" style={{ width: 110 }} />
                  <i className="rt-skel" style={{ width: "22%" }} />
                  <i className="rt-skel" style={{ width: "10%", marginLeft: "auto" }} />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="rt-empty">
              <div className="rt-emptyico">
                <FileText size={32} strokeWidth={1.7} />
              </div>
              <b>{reportData.length === 0 ? "មិនមានទិន្នន័យការលក់ទេ" : "រកមិនឃើញលទ្ធផល"}</b>
              {reportData.length === 0 ? `មិនមានវិក្កយបត្រសម្រាប់ ${periodLabel}` : "សូមសាកល្បងស្វែងរកដោយពាក្យផ្សេង"}
            </div>
          ) : (
            <div className="rt-tablewrap">
              <div className="rt-gridwrap">
                <div className="rt-head">
                  <span>Order</span>
                  <span>Customer</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span style={{ textAlign: "right" }}>Subtotal</span>
                  <span style={{ textAlign: "right" }}>Total</span>
                  <span>Date</span>
                  <span style={{ textAlign: "center" }}>Actions</span>
                </div>
                <div key={`${current}-${reportType}`}>
                  {rows.map((o, i) => {
                    const walk = isWalkIn(o);
                    const name = nameOf(o);
                    const label = o.order_number || `#${o.id}`;
                    const ty = typeInfo(o);
                    const TypeIcon = ty.Icon;
                    return (
                      <div
                        className="rt-row"
                        key={o.id ?? i}
                        style={{ "--i": i }}
                        role="button"
                        tabIndex={0}
                        onClick={() => openView(o)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openView(o);
                          }
                        }}
                        title="ចុចដើម្បីមើលវិក្កយបត្រ"
                      >
                        <span>
                          <span className="rt-inv" title={label}>
                            {label}
                          </span>
                        </span>
                        <div className="rt-cust">
                          <span className={`rt-cav${walk ? " walk" : ""}`}>{walk ? <Store size={15} /> : name.trim().charAt(0).toUpperCase()}</span>
                          <span className={`rt-cname${walk ? " walk" : ""}`}>{name}</span>
                        </div>
                        <span>
                          <span className={`rt-type ${ty.cls}`}>
                            <TypeIcon size={13} />
                            {ty.label}
                          </span>
                        </span>
                        <span>
                          <StatusBadge status={o.status} />
                        </span>
                        <span className="rt-sub">${money(o.subtotal)}</span>
                        <span className="rt-amt">${money(o.total_amount)}</span>
                        <span className="rt-date">{fmtDateTime(o.created_at)}</span>
                        <span className="rt-acts">
                          <button
                            type="button"
                            className="rt-act"
                            onClick={(e) => {
                              e.stopPropagation();
                              openView(o);
                            }}
                            title="មើល"
                            aria-label={`មើលវិក្កយបត្រ ${label}`}
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            type="button"
                            className="rt-act"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPrint(o);
                            }}
                            title="បោះពុម្ព"
                            aria-label={`បោះពុម្ពវិក្កយបត្រ ${label}`}
                          >
                            <Printer size={17} />
                          </button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="rt-foot">
              <span>
                បង្ហាញ <b>{start + 1}–{Math.min(start + PAGE_SIZE, visible.length)}</b> ក្នុងចំណោម <b>{visible.length}</b>
              </span>
              <div className="rt-pager">
                <button className="rt-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="ទំព័រមុន">
                  <ChevronLeft size={18} />
                </button>
                <span aria-live="polite">
                  {current} / {pages}
                </span>
                <button className="rt-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="ទំព័របន្ទាប់">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* វិក្កយបត្រ (View / Print) — render ទៅលើ <body> ដើម្បីបោះពុម្ពមិនត្រូវកាត់ដោយ layout */}
        {sheet && createPortal(sheet, document.body)}
      </div>
    </Layout>
  );
}