// src/pages/StockAdjustmentPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Package, RefreshCw, Search, Sliders, Boxes, AlertTriangle, TrendingUp, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Layout from '../components/Layout';
import { getInventoryStatus } from '../services/stockAdjustmentService';
import AdjustStockModal from './stock/AdjustStockModal';
import ToastrContainer, { toastr } from '../components/Toastr';
import { useTranslation } from '../utils/translations';

const PAGE_SIZE = 10;
const LOW_STOCK = 5;
const css = `
.sa { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.sa *, .sa *::before, .sa *::after { box-sizing: border-box; }
.sa h2 { margin: 0; color: var(--ink); font-family: inherit; }

.sa-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.sa-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.sa-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.sa-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.sa-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.sa-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.sa-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.sa-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.sa-btn:disabled { opacity: .6; cursor: not-allowed; }
.sa button:focus-visible, .sa select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.sa-spin { animation: sa-rot .8s linear infinite; }

.sa-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.sa-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

.sa-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.sa-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: sa-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.sa-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.sa-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-green { background: #e7f8ee; color: #15803d; } .t-amber { background: #fff1d6; color: #d97706; } .t-blue { background: #e3eeff; color: #2563eb; }
.sa-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.sa-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.sa-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.sa-tile.hero span { color: #9db8b4; }
.sa-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

.sa-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: sa-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.sa-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.sa-left, .sa-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.sa-search { position: relative; display: flex; align-items: center; width: 300px; max-width: 100%; }
.sa-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.sa-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.sa-search input::placeholder { color: #8aa3a0; }
.sa-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.sa-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.sa-x:hover { background: #e3ecea; color: var(--ink); }
.sa-seg { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; }
.sa-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.sa-sb:hover { color: var(--ink); } .sa-sb.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.sa-select { height: 38px; max-width: 170px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.sa-select:hover { background-color: #e9f1ef; }

.sa-logo { position: relative; width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 17px; overflow: hidden; border: 1px solid var(--line); background: #fff; }
.sa-logo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 5px; background: #fff; }

.sa-head, .sa-row { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,1fr) minmax(0,1.5fr) minmax(0,.7fr) minmax(0,.8fr) minmax(0,.9fr) 124px; gap: 14px; align-items: center; padding: 0 18px; }
.sa-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.sa-row { min-height: 66px; border-bottom: 1px solid var(--line); transition: background .12s; animation: sa-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.sa-row:last-child { border-bottom: 0; } .sa-row:hover { background: #f6fbf9; }
.sa-who { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
.sa-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sa-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.sa-desc { color: #4d6561; font-size: 12.5px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sa-date { color: var(--muted); font-size: 12.5px; }
.sa-row:hover .sa-logo { transform: scale(1.06); } .sa-logo { transition: transform .2s; }

.sa-acts { display: flex; gap: 6px; justify-content: flex-end; }
.sa-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.sa-ib:hover { transform: translateY(-1px); }
.sa-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.sa-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }
.sa-ib.d:hover { background: #fdecea; color: #c0392b; border-color: #f6cfca; }
.sa-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.sa-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; padding: 16px; }
.sa-card { display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 16px; background: #fff; overflow: hidden;
  transition: transform .22s, box-shadow .22s, border-color .22s; animation: sa-up .45s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 35ms) backwards; }
.sa-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(12,37,38,.09); border-color: #d3e2df; }
.sa-stage { position: relative; height: 112px; display: grid; place-items: center; cursor: pointer; font-size: 38px; font-weight: 800; color: var(--teal);
  background: radial-gradient(160px 80px at 50% 0%, rgba(15,118,110,.08), transparent 70%), #f6faf9; border-bottom: 1px solid var(--line); }
.sa-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 18px; transition: transform .3s; }
.sa-card:hover .sa-stage img { transform: scale(1.06); }
.sa-cbody { padding: 12px 14px 8px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sa-cbody b { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.sa-cbody .sa-desc { min-height: 36px; }
.sa-cfoot { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 12px 14px; }

.sa-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.sa-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.sa-skel { height: 66px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.sa-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: sa-shine 1.3s linear infinite; }

.sa-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.sa-pager { display: flex; align-items: center; gap: 6px; }
.sa-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.sa-pg:hover:not(:disabled) { background: #eef5f3; } .sa-pg:disabled { opacity: .4; cursor: not-allowed; }
.sa-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes sa-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes sa-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes sa-shine { to { background-position: -200% 0; } }
@keyframes sa-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .sa-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 900px) {
  .sa-head, .sa-row { grid-template-columns: minmax(0,2fr) minmax(0,1.5fr) minmax(0,.7fr) minmax(0,.9fr) 124px; } .sa-hide-md { display: none; }
}
@media (max-width: 720px) {
  .sa { padding: 14px; } .sa-tiles { grid-template-columns: 1fr; }
  .sa-head { display: none; }
  .sa-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; } .sa-hide-m { display: none; }
  .sa-search, .sa-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .sa-tile, .sa-panel, .sa-row, .sa-card, .sa-skel i, .sa-spin { animation: none !important; } .sa-tile, .sa-card, .sa-logo, .sa-stage img { transition: none; } }

.sa-btn.primary .sa-spin, .sa-spin { animation: sa-rot .8s linear infinite; }
.t-red { background: #fdecea; color: #c0392b; }
.sa-prod { display: flex; align-items: center; gap: 12px; min-width: 0; }
.sa-prod b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sa-av { position: relative; width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 16px; overflow: hidden; transition: transform .2s; }
.sa-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #fff; }
.sa-row:hover .sa-av { transform: scale(1.07); }
.sa-tag { display: inline-block; max-width: 100%; padding: 3px 10px; border-radius: 9px; background: #eef4f2; color: #35504c; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sa-stock { display: flex; align-items: center; gap: 9px; min-width: 0; }
.sa-stock b { min-width: 34px; font-size: 14.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.sa-stock b.in { color: var(--teal); } .sa-stock b.low { color: #b45309; } .sa-stock b.out { color: #c0392b; }
.sa-bar { flex: 1; height: 6px; border-radius: 99px; background: #eef4f2; overflow: hidden; max-width: 90px; min-width: 30px; }
.sa-bar i { display: block; height: 100%; width: 100%; border-radius: 99px; transform-origin: left; animation: sa-fill .8s cubic-bezier(.2,.7,.2,1) backwards; background: linear-gradient(90deg,#0f766e,#34c3b0); }
.sa-bar i.low { background: #f59e0b; } .sa-bar i.out { background: #ef4444; }
.sa-flag { padding: 1px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; } .sa-flag.low { background: #fff4e0; color: #b45309; } .sa-flag.out { background: #fdecea; color: #c0392b; }
.sa-sold { font-weight: 800; color: #1d4ed8; font-variant-numeric: tabular-nums; } .sa-total { font-weight: 700; font-variant-numeric: tabular-nums; }
.sa-age { display: inline-flex; padding: 3px 10px; border-radius: 99px; font-size: 11.5px; font-weight: 700; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.sa-age.new { background: #e7f8ee; color: #15803d; } .sa-age.old { background: #eef2f1; color: #55706c; }
.sa-adj { all: unset; box-sizing: border-box; cursor: pointer; height: 34px; padding: 0 13px; display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: #0b5e58; background: #e0f4f1; border: 1px solid #b9e4de; white-space: nowrap; transition: background .15s, color .15s, transform .15s, box-shadow .15s; }
.sa-adj:hover { background: #0f766e; color: #fff; transform: translateY(-1px); box-shadow: 0 6px 14px rgba(15,118,110,.28); }
.sa-adj:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
@keyframes sa-rot { to { transform: rotate(360deg); } }
@media (max-width: 720px) { .sa-row { grid-template-columns: minmax(0,1fr) auto; } .sa-stock { grid-column: 1; grid-row: 2; } .sa-acts { grid-column: 2; grid-row: 1 / span 2; align-self: center; } }
@media (prefers-reduced-motion: reduce) { .sa-av, .sa-adj { transition: none; } .sa-bar i { animation: none; } }
`;

const TONES = [['#e0f4f1', '#0f766e'], ['#e3eeff', '#2563eb'], ['#eee8ff', '#7c3aed'], ['#fff1d6', '#d97706'], ['#fdecea', '#c0392b'], ['#ecf6d8', '#4d7c0f']];
const toneFor = (s = '') => TONES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
const num = (v) => Number(v) || 0;
const stockOf = (p) => num(p.stock_quantity !== undefined ? p.stock_quantity : p.stock);
const soldOf = (p) => num(p.total_sold);
const totalOf = (p) => (p.total_quantity !== undefined ? num(p.total_quantity) : stockOf(p) + soldOf(p));
const levelOf = (p) => { const s = stockOf(p); return s <= 0 ? 'out' : s <= LOW_STOCK ? 'low' : 'in'; };
const isNew = (p) => String(p.status_age || '').startsWith('New');
const fmt = (n) => num(n).toLocaleString('en-US');

function useCountUp(target, duration = 1000) {
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
  return Math.round(v).toLocaleString('en-US');
}

function Tile({ label, target, icon: Icon, tone, hero, delay }) {
  const shown = useCountUp(target);
  return (
    <div className={`sa-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`sa-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{shown}</b></div>
    </div>
  );
}

function Thumb({ p }) {
  const [bg, fg] = toneFor(p.name);
  const img = p.image || p.image_url;
  return (
    <span className="sa-av" style={{ background: bg, color: fg }}>
      {String(p.name || '?').trim().charAt(0).toUpperCase()}
      {img && <img src={img} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
    </span>
  );
}

export default function StockAdjustmentPage() {
  const { t } = useTranslation();
  const ts = t.stockAdjustment;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await getInventoryStatus();
      const list = res?.data || res || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      const msg = err?.message || ts.fetchError;
      setErrorMsg(msg);
      toastr.error(ts.toastErrorTitle, msg);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const counts = { all: products.length, low: 0, out: 0, new: 0 };
    let units = 0, sold = 0;
    products.forEach((p) => {
      const lv = levelOf(p);
      if (lv === 'low') counts.low += 1;
      if (lv === 'out') counts.out += 1;
      if (isNew(p)) counts.new += 1;
      units += stockOf(p);
      sold += soldOf(p);
    });
    return { counts, units, sold };
  }, [products]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => (!q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)) && (filter === 'all' || (filter === 'new' ? isNew(p) : levelOf(p) === filter)));
    const by = {
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
      stock: (a, b) => stockOf(a) - stockOf(b),
      sold: (a, b) => soldOf(b) - soldOf(a),
    }[sort];
    return [...list].sort(by);
  }, [products, search, filter, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const exportCsv = () => {
    const lines = [['Product', 'SKU', 'Category', 'Stock', 'Total sold', 'Total qty', 'Age'], ...visible.map((p) => [p.name, p.sku || '', p.category || '', stockOf(p), soldOf(p), totalOf(p), p.status_age || ''])];
    const csv = '\uFEFF' + lines.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock-status.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const FILTERS = [
    { key: 'all', label: ts.filterAll },
    { key: 'low', label: ts.filterLow },
    { key: 'out', label: ts.filterOut },
    { key: 'new', label: ts.filterNew },
  ];

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="sa">
        <div className="sa-top">
          <div>
            <h2>{ts.heading}</h2>
            <p>{ts.subHeading}</p>
          </div>
          <div className="sa-actions">
            <button className="sa-btn" onClick={exportCsv} disabled={visible.length === 0}><Download size={16} /> {ts.exportCsv}</button>
            <button className="sa-btn primary" onClick={fetchInventory} disabled={loading}><RefreshCw size={16} className={loading ? 'sa-spin' : ''} /> {ts.refresh}</button>
          </div>
        </div>

        {errorMsg && <div className="sa-err" role="alert"><span>{errorMsg}</span><button onClick={fetchInventory}>{ts.tryAgain}</button></div>}

        <div className="sa-tiles">
          <Tile label={ts.tileProducts} target={stats.counts.all} icon={Package} tone="t-dark" hero delay={0} />
          <Tile label={ts.tileUnits} target={stats.units} icon={Boxes} tone="t-blue" delay={70} />
          <Tile label={ts.tileLowOut} target={stats.counts.low + stats.counts.out} icon={AlertTriangle} tone="t-amber" delay={140} />
          <Tile label={ts.tileSold} target={stats.sold} icon={TrendingUp} tone="t-green" delay={210} />
        </div>

        <section className="sa-panel">
          <div className="sa-tools">
            <div className="sa-left">
              <div className="sa-search">
                <Search size={16} />
                <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder={ts.searchPlaceholder} aria-label="Search products" />
                {search && <button className="sa-x" onClick={() => reset(setSearch)('')} aria-label={ts.clearSearch}><X size={15} /></button>}
              </div>
              <div className="sa-seg" role="group" aria-label="Filter">
                {FILTERS.map((f) => <button key={f.key} className={`sa-sb${filter === f.key ? ' on' : ''}`} aria-pressed={filter === f.key} onClick={() => reset(setFilter)(f.key)}>{f.label} <span style={{ opacity: .6 }}>{stats.counts[f.key]}</span></button>)}
              </div>
            </div>
            <div className="sa-right">
              <select className="sa-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort products">
                <option value="name">{ts.sortName}</option>
                <option value="stock">{ts.sortStock}</option>
                <option value="sold">{ts.sortSold}</option>
              </select>
            </div>
          </div>

          <div className="sa-head">
            <span>{ts.colProduct}</span><span className="sa-hide-m sa-hide-md">{ts.colCategory}</span><span>{ts.colStock}</span><span className="sa-hide-m">{ts.colSold}</span><span className="sa-hide-m sa-hide-md">{ts.colTotalQty}</span><span className="sa-hide-m">{ts.colAge}</span><span />
          </div>

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="sa-skel" key={i}><i style={{ width: 42, height: 42, borderRadius: 12 }} /><i style={{ width: '30%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="sa-empty">
              <b>{products.length === 0 ? ts.emptyNoData : ts.emptyNoResult}</b>
              {products.length > 0 && ts.emptyHint}
            </div>
          ) : (
            <div key={`${filter}-${sort}-${current}`}>
              {rows.map((p, i) => {
                const lv = levelOf(p);
                const s = stockOf(p);
                const tot = totalOf(p);
                const pct = tot > 0 ? Math.max(s > 0 ? 6 : 0, Math.min((s / tot) * 100, 100)) : 0;
                return (
                  <div className="sa-row" key={p.id ?? i} style={{ '--i': i }}>
                    <div className="sa-prod">
                      <Thumb p={p} />
                      <div style={{ minWidth: 0 }}><b>{p.name}</b><span className="sa-sub">{p.sku || '-'}</span></div>
                    </div>
                    <div className="sa-hide-m sa-hide-md">{p.category ? <span className="sa-tag">{p.category}</span> : <span className="sa-sub">-</span>}</div>
                    <div className="sa-stock">
                      <b className={lv}>{fmt(s)}</b>
                      <div className="sa-bar"><i className={lv} style={{ transform: `scaleX(${pct / 100})`, animationDelay: `${i * 28 + 150}ms` }} /></div>
                      {lv !== 'in' && <span className={`sa-flag ${lv}`}>{lv === 'out' ? ts.flagOut : ts.flagLow}</span>}
                    </div>
                    <span className="sa-sold sa-hide-m">{fmt(soldOf(p))}</span>
                    <span className="sa-total sa-hide-m sa-hide-md">{fmt(tot)}</span>
                    <span className="sa-hide-m"><span className={`sa-age ${isNew(p) ? 'new' : 'old'}`}>{p.status_age || '-'}</span></span>
                    <div className="sa-acts"><button className="sa-adj" onClick={() => setSelectedProduct(p)}><Sliders size={14} /> {ts.adjustBtn}</button></div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="sa-foot">
              <span>{ts.showing} {start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} {ts.of} {visible.length}</span>
              <div className="sa-pager">
                <button className="sa-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="sa-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      <AdjustStockModal
        isOpen={Boolean(selectedProduct)}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={() => {
          fetchInventory();
          toastr.success(ts.toastAdjustSuccessTitle, ts.toastAdjustSuccessMsg);
        }}
      />
    </Layout>
  );
}