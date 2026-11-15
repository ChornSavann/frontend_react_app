// src/pages/InventoryPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Package, Boxes, AlertTriangle, DollarSign, Search, Download, RefreshCw, ChevronLeft, ChevronRight, X, LayoutGrid, List, CheckCircle2, XCircle, Plus, Pencil, Eye } from 'lucide-react';
import { listproduct } from '../services/productService';
import Layout from '../components/Layout';
import CreateProductModal from './products/CreateProductModal';
import EditProductModal from './products/EditProductModal';
import ViewProductModal from './products/ViewProductModal';

const css = `
.iv { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.iv *, .iv *::before, .iv *::after { box-sizing: border-box; }
.iv h2 { margin: 0; color: var(--ink); font-family: inherit; }

.iv-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.iv-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.iv-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.iv-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.iv-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.iv-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.iv-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.iv-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.iv-btn:disabled { opacity: .6; cursor: not-allowed; }
.iv button:focus-visible, .iv select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.iv-acts { display: flex; gap: 6px; justify-content: flex-end; }
.iv-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.iv-ib:hover { transform: translateY(-1px); }
.iv-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.iv-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }
.iv-click { cursor: pointer; }
.iv-spin { animation: iv-rot .8s linear infinite; }

.iv-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.iv-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

/* tiles */
.iv-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.iv-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: iv-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.iv-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.iv-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-blue { background: #e3eeff; color: #2563eb; } .t-green { background: #e7f8ee; color: #15803d; } .t-amber { background: #fff1d6; color: #d97706; }
.iv-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.iv-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.iv-tile.hero { border-color: transparent; color: #f4faf8;
  background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.iv-tile.hero span { color: #9db8b4; }
.iv-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

/* panel + toolbar */
.iv-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: iv-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.iv-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.iv-left, .iv-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.iv-search { position: relative; display: flex; align-items: center; width: 270px; max-width: 100%; }
.iv-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.iv-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.iv-search input::placeholder { color: #8aa3a0; }
.iv-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.iv-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.iv-x:hover { background: #e3ecea; color: var(--ink); }

.iv-chips, .iv-view { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; flex-wrap: wrap; }
.iv-chip { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 11px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.iv-chip:hover { color: var(--ink); }
.iv-chip.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.iv-chip em { font-style: normal; font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 99px; background: #e3ecea; color: var(--muted); }
.iv-chip.on em { background: var(--teal); color: #fff; }
.iv-view .iv-chip { padding: 6px 9px; }
.iv-select { height: 38px; max-width: 190px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; text-overflow: ellipsis; }
.iv-select:hover { background-color: #e9f1ef; }

/* avatar */
.iv-av { position: relative; width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 16px; overflow: hidden; }
.iv-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #fff; }

/* list */
.iv-head, .iv-row { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,1.1fr) minmax(0,1.2fr) minmax(0,.9fr) minmax(0,1.4fr) minmax(0,.9fr) 84px; gap: 14px; align-items: center; padding: 0 18px; }
.iv-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.iv-row { min-height: 64px; border-bottom: 1px solid var(--line); transition: background .12s; animation: iv-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.iv-row:last-child { border-bottom: 0; }
.iv-row:hover { background: #f6fbf9; }
.iv-name { display: flex; align-items: center; gap: 12px; min-width: 0; }
.iv-name b, .iv-card-name b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.iv-name small, .iv-card-name small, .iv-sub small { display: block; font-size: 11.5px; color: var(--muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.iv-sub b { display: block; font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.iv-tag { display: inline-block; max-width: 100%; padding: 2px 9px; border-radius: 8px; background: #eef4f2; color: #35504c; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.iv-price b { display: block; font-weight: 800; font-size: 14px; color: var(--teal); font-variant-numeric: tabular-nums; }
.iv-price small { display: block; font-size: 11.5px; color: var(--muted); margin-top: 1px; font-variant-numeric: tabular-nums; }

.iv-stock { display: flex; align-items: center; gap: 9px; min-width: 0; }
.iv-stock b { font-size: 13.5px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.iv-stock b small { font-size: 11.5px; font-weight: 500; color: var(--muted); margin-left: 3px; }
.iv-bar { flex: 1; height: 6px; border-radius: 99px; background: #eef4f2; overflow: hidden; max-width: 90px; min-width: 36px; }
.iv-bar i { display: block; height: 100%; width: 100%; border-radius: 99px; transform-origin: left; animation: iv-fill .8s cubic-bezier(.2,.7,.2,1) backwards; background: linear-gradient(90deg,#0f766e,#34c3b0); }
.iv-bar i.low { background: #f59e0b; } .iv-bar i.out { background: #ef4444; }

.iv-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; width: fit-content; }
.iv-badge.on { background: #e7f8ee; color: #15803d; } .iv-badge.off { background: #eef2f1; color: #5f7773; }
.iv-warn { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 11.5px; font-weight: 700; padding: 1px 8px; border-radius: 99px; }
.iv-warn.low { background: #fff4e0; color: #b45309; } .iv-warn.out { background: #fdecea; color: #c0392b; }
.iv-status { display: flex; flex-direction: column; align-items: flex-start; }

/* grid view */
.iv-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(205px, 1fr)); gap: 14px; padding: 16px; }
.iv-card { padding: 12px; border: 1px solid var(--line); border-radius: 14px; background: #fff; display: flex; flex-direction: column; gap: 11px;
  transition: transform .22s, box-shadow .22s, border-color .22s; animation: iv-up .45s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 35ms) backwards; }
.iv-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(12,37,38,.09); border-color: #d3e2df; }
.iv-card .iv-av { width: 100%; height: 108px; border-radius: 10px; font-size: 32px; }
.iv-card-mid { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.iv-card-mid .iv-price b { font-size: 15px; }
.iv-card .iv-stock { font-size: 12px; }
.iv-card .iv-bar { max-width: none; }

.iv-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.iv-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.iv-skel { height: 64px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.iv-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: iv-shine 1.3s linear infinite; }

.iv-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.iv-pager { display: flex; align-items: center; gap: 6px; }
.iv-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.iv-pg:hover:not(:disabled) { background: #eef5f3; }
.iv-pg:disabled { opacity: .4; cursor: not-allowed; }
.iv-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes iv-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes iv-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes iv-fill { from { transform: scaleX(0); } }
@keyframes iv-shine { to { background-position: -200% 0; } }
@keyframes iv-rot { to { transform: rotate(360deg); } }

@media (max-width: 1280px) {
  .iv-head, .iv-row { grid-template-columns: minmax(0,2fr) minmax(0,1.1fr) minmax(0,.9fr) minmax(0,1.4fr) minmax(0,.9fr) 84px; }
  .iv-hide-md { display: none; }
}
@media (max-width: 1100px) { .iv-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 720px) {
  .iv { padding: 14px; } .iv-tiles { grid-template-columns: 1fr; }
  .iv-head, .iv-hide-m { display: none; }
  .iv-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; }
  .iv-price { grid-column: 2; grid-row: 1; text-align: right; } .iv-stock { grid-column: 1; grid-row: 2; } .iv-status { grid-column: 2; grid-row: 2; align-items: flex-end; }
  .iv-search, .iv-left { width: 100%; }
  .iv-acts { grid-column: 1 / -1; }
}
@media (prefers-reduced-motion: reduce) { .iv-tile, .iv-panel, .iv-row, .iv-card, .iv-bar i, .iv-skel i, .iv-spin { animation: none !important; } .iv-tile, .iv-card { transition: none; } }
`;

const TONES = [['#e0f4f1', '#0f766e'], ['#e3eeff', '#2563eb'], ['#eee8ff', '#7c3aed'], ['#fff1d6', '#d97706'], ['#fdecea', '#c0392b'], ['#ecf6d8', '#4d7c0f']];
const toneFor = (name = '') => TONES[[...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];

const num = (v) => parseFloat(v || 0) || 0;
const isActive = (p) => Number(p.is_active) === 1 || p.is_active === true;
const stockOf = (p) => {
  const s = num(p.stock_quantity), a = num(p.alert_quantity);
  return s <= 0 ? 'out' : s <= a ? 'low' : 'in';
};
const unitOf = (p) => p.unit?.short_name || p.unit?.name || '';
const money = (n) => `$${num(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
    <div className={`iv-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`iv-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{prefix}{shown}</b></div>
    </div>
  );
}

function Avatar({ p }) {
  const [bg, fg] = toneFor(p.name);
  return (
    <span className="iv-av" style={{ background: bg, color: fg }}>
      {String(p.name || '?').trim().charAt(0).toUpperCase()}
      {p.image_url && <img src={p.image_url} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
    </span>
  );
}

function StockCell({ p, i }) {
  const s = num(p.stock_quantity), a = num(p.alert_quantity), st = stockOf(p);
  const cap = a > 0 ? a * 3 : 30;
  const pct = Math.max(s > 0 ? 6 : 0, Math.min(s / cap, 1) * 100);
  return (
    <div className="iv-stock">
      <b>{s}<small>{unitOf(p)}</small></b>
      <div className="iv-bar" title={`Alert level: ${a}`}><i className={st} style={{ transform: `scaleX(${pct / 100})`, animationDelay: `${i * 28 + 150}ms` }} /></div>
    </div>
  );
}

function RowActions({ onView, onEdit }) {
  return (
    <div className="iv-acts">
      <button className="iv-ib v" onClick={onView} aria-label="View product" title="មើល"><Eye size={15} /></button>
      <button className="iv-ib e" onClick={onEdit} aria-label="Edit product" title="កែប្រែ"><Pencil size={15} /></button>
    </div>
  );
}

function ActiveBadge({ p }) {
  return isActive(p)
    ? <span className="iv-badge on"><CheckCircle2 size={13} /> Active</span>
    : <span className="iv-badge off"><XCircle size={13} /> Inactive</span>;
}

function StockWarn({ p }) {
  const st = stockOf(p);
  if (st === 'in') return null;
  return <span className={`iv-warn ${st}`}><AlertTriangle size={11} />{st === 'out' ? 'Out of stock' : 'Low stock'}</span>;
}

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [view, setView] = useState('list');
  const [page, setPage] = useState(1);

  // Modals: create / view / edit
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await listproduct();
      // ទាញយក Array ពី res.data តាមទម្រង់ JSON
      const items = res?.data || (Array.isArray(res) ? res : []);
      setProducts(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorMsg(error.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យទំនិញ');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => { if (p.category?.id && p.category?.name) map.set(p.category.id, p.category.name); });
    return Array.from(map.entries());
  }, [products]);

  const stats = useMemo(() => {
    const counts = { all: products.length, active: 0, inactive: 0, low: 0 };
    let value = 0;
    products.forEach((p) => {
      isActive(p) ? (counts.active += 1) : (counts.inactive += 1);
      if (stockOf(p) !== 'in') counts.low += 1;
      value += num(p.stock_quantity) * num(p.cost_price);
    });
    return { counts, value };
  }, [products]);

  // Category, Brand, Unit ពីទំនិញដែលមានស្រាប់ ទុកបោះឱ្យ Modal
  const existingOptions = useMemo(() => {
    const cat = new Map(), brand = new Map(), unit = new Map();
    products.forEach((p) => {
      if (p.category?.id) cat.set(p.category.id, p.category);
      if (p.brand?.id) brand.set(p.brand.id, p.brand);
      if (p.unit?.id) unit.set(p.unit.id, p.unit);
    });
    return { categories: [...cat.values()], brands: [...brand.values()], units: [...unit.values()] };
  }, [products]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q) || p.brand?.name?.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'all' || String(p.category_id) === String(selectedCategory);
      const matchFilter = filter === 'all' || (filter === 'active' && isActive(p)) || (filter === 'inactive' && !isActive(p)) || (filter === 'low' && stockOf(p) !== 'in');
      return matchSearch && matchCat && matchFilter;
    });
    const by = {
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
      price: (a, b) => num(b.selling_price) - num(a.selling_price),
      stock: (a, b) => num(a.stock_quantity) - num(b.stock_quantity),
    }[sort];
    return [...list].sort(by);
  }, [products, search, selectedCategory, filter, sort]);

  const size = view === 'grid' ? 12 : 10;
  const pages = Math.max(1, Math.ceil(visible.length / size));
  const current = Math.min(page, pages);
  const start = (current - 1) * size;
  const rows = visible.slice(start, start + size);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const exportCsv = () => {
    const lines = [
      ['Name', 'SKU', 'Barcode', 'Category', 'Brand', 'Cost', 'Price', 'Stock', 'Unit', 'Status'],
      ...visible.map((p) => [p.name, p.sku || '', p.barcode || '', p.category?.name || '', p.brand?.name || '', num(p.cost_price), num(p.selling_price), num(p.stock_quantity), unitOf(p), isActive(p) ? 'Active' : 'Inactive']),
    ];
    const csv = '\uFEFF' + lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'low', label: 'Low stock' },
  ];

  return (
    <Layout>
      <style>{css}</style>
      <div className="iv">
        <div className="iv-top">
          <div>
            <h2>📦 បញ្ជីទំនិញក្នុងឃ្លាំង</h2>
            <p>គ្រប់គ្រងព័ត៌មានទំនិញ តម្លៃដើម តម្លៃលក់ និងចំនួនស្តុកជាក់ស្តែង</p>
          </div>
          <div className="iv-actions">
            <button className="iv-btn primary" onClick={() => setIsCreateOpen(true)}><Plus size={16} /> បន្ថែមទំនិញថ្មី</button>
            <button className="iv-btn" onClick={exportCsv} disabled={visible.length === 0}><Download size={16} /> Export CSV</button>
            <button className="iv-btn" onClick={fetchProducts} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'iv-spin' : ''} /> ផ្ទុកឡើងវិញ
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="iv-err" role="alert">
            <span>{errorMsg}</span>
            <button onClick={fetchProducts}>Try again</button>
          </div>
        )}

        <div className="iv-tiles">
          <Tile label="Stock value (at cost)" target={stats.value} prefix="$" decimals={2} icon={DollarSign} tone="t-dark" hero delay={0} />
          <Tile label="ទំនិញសរុប (Total)" target={stats.counts.all} icon={Package} tone="t-blue" delay={70} />
          <Tile label="កំពុងដាក់លក់ (Active)" target={stats.counts.active} icon={Boxes} tone="t-green" delay={140} />
          <Tile label="ស្តុកជិតអស់ (Low)" target={stats.counts.low} icon={AlertTriangle} tone="t-amber" delay={210} />
        </div>

        <section className="iv-panel">
          <div className="iv-tools">
            <div className="iv-left">
              <div className="iv-search">
                <Search size={16} />
                <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder="ស្វែងរកឈ្មោះ, SKU, Barcode…" aria-label="Search products" />
                {search && <button className="iv-x" onClick={() => reset(setSearch)('')} aria-label="Clear search"><X size={15} /></button>}
              </div>
              <div className="iv-chips" role="tablist" aria-label="Filter products">
                {FILTERS.map((f) => (
                  <button key={f.key} role="tab" aria-selected={filter === f.key} className={`iv-chip${filter === f.key ? ' on' : ''}`} onClick={() => reset(setFilter)(f.key)}>
                    {f.label}<em>{stats.counts[f.key]}</em>
                  </button>
                ))}
              </div>
            </div>
            <div className="iv-right">
              <select className="iv-select" value={selectedCategory} onChange={(e) => reset(setSelectedCategory)(e.target.value)} aria-label="Category">
                <option value="all">All categories</option>
                {categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
              <select className="iv-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort products">
                <option value="name">Name A–Z</option>
                <option value="price">Price: high to low</option>
                <option value="stock">Stock: low first</option>
              </select>
              <div className="iv-view" role="group" aria-label="View">
                <button className={`iv-chip${view === 'list' ? ' on' : ''}`} onClick={() => reset(setView)('list')} aria-label="List view" aria-pressed={view === 'list'}><List size={16} /></button>
                <button className={`iv-chip${view === 'grid' ? ' on' : ''}`} onClick={() => reset(setView)('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><LayoutGrid size={16} /></button>
              </div>
            </div>
          </div>

          {view === 'list' && (
            <div className="iv-head">
              <span>Product</span><span className="iv-hide-m">SKU / Barcode</span><span className="iv-hide-m iv-hide-md">Category</span><span>Price</span><span>Stock</span><span>Status</span><span />
            </div>
          )}

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="iv-skel" key={i}><i style={{ width: 42, height: 42, borderRadius: 12 }} /><i style={{ width: '28%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="iv-empty">
              <b>{products.length === 0 ? 'រកមិនឃើញទិន្នន័យទំនិញទេ' : 'រកមិនឃើញលទ្ធផល'}</b>
              {products.length > 0 && 'Try a different search, category or filter.'}
            </div>
          ) : view === 'list' ? (
            <div key={`l-${filter}-${current}-${sort}-${selectedCategory}`}>
              {rows.map((p, i) => (
                <div className="iv-row" key={p.id ?? i} style={{ '--i': i }}>
                  <div className="iv-name iv-click" onClick={() => setViewingProduct(p)}>
                    <Avatar p={p} />
                    <div style={{ minWidth: 0 }}><b>{p.name}</b>{p.description && <small>{p.description}</small>}</div>
                  </div>
                  <div className="iv-sub iv-hide-m"><b>{p.sku || '-'}</b><small>{p.barcode || '-'}</small></div>
                  <div className="iv-sub iv-hide-m iv-hide-md"><span className="iv-tag">{p.category?.name || 'គ្មានប្រភេទ'}</span>{p.brand?.name && <small>{p.brand.name}</small>}</div>
                  <div className="iv-price"><b>{money(p.selling_price)}</b><small>Cost {money(p.cost_price)}</small></div>
                  <StockCell p={p} i={i} />
                  <div className="iv-status"><ActiveBadge p={p} /><StockWarn p={p} /></div>
                  <RowActions onView={() => setViewingProduct(p)} onEdit={() => setEditingProduct(p)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="iv-cards" key={`g-${filter}-${current}-${sort}-${selectedCategory}`}>
              {rows.map((p, i) => (
                <div className="iv-card" key={p.id ?? i} style={{ '--i': i }}>
                  <Avatar p={p} />
                  <div className="iv-card-name"><b>{p.name}</b><small>{[p.category?.name, p.brand?.name].filter(Boolean).join(' · ') || p.sku || '-'}</small></div>
                  <div className="iv-card-mid">
                    <div className="iv-price"><b>{money(p.selling_price)}</b></div>
                    <ActiveBadge p={p} />
                  </div>
                  <StockCell p={p} i={i} />
                  <StockWarn p={p} />
                  <RowActions onView={() => setViewingProduct(p)} onEdit={() => setEditingProduct(p)} />
                </div>
              ))}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="iv-foot">
              <span>Showing {start + 1}–{Math.min(start + size, visible.length)} of {visible.length}</span>
              <div className="iv-pager">
                <button className="iv-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="iv-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchProducts}
        existingCategories={existingOptions.categories}
        existingBrands={existingOptions.brands}
        existingUnits={existingOptions.units}
      />
      <ViewProductModal
        isOpen={Boolean(viewingProduct)}
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onEdit={(prod) => setEditingProduct(prod)}
      />
      <EditProductModal
        isOpen={Boolean(editingProduct)}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={fetchProducts}
        existingCategories={existingOptions.categories}
        existingBrands={existingOptions.brands}
        existingUnits={existingOptions.units}
      />
    </Layout>
  );
}