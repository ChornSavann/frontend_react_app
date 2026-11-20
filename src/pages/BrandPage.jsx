// src/pages/BrandPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Tag, Image as ImageIcon, ImageOff, CalendarPlus, Search, Download, RefreshCw, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, LayoutGrid, List } from 'lucide-react';
import { listBrands, deleteBrand } from '../services/brandService';
import Layout from '../components/Layout';
import CreateBrandModal from './brands/CreateBrandModal';
import EditBrandModal from './brands/EditBrandModal';
import ViewBrandModal from './brands/ViewBrandModal';
import ConfirmDeleteModal from './brands/ConfirmDeleteModal';
import { useTranslation } from '../utils/translations';

const css = `
.br { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.br *, .br *::before, .br *::after { box-sizing: border-box; }
.br h2 { margin: 0; color: var(--ink); font-family: inherit; }

.br-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.br-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.br-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.br-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.br-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.br-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.br-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.br-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.br-btn:disabled { opacity: .6; cursor: not-allowed; }
.br button:focus-visible, .br select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.br-spin { animation: br-rot .8s linear infinite; }

.br-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.br-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

.br-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.br-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: br-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.br-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.br-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-green { background: #e7f8ee; color: #15803d; } .t-amber { background: #fff1d6; color: #d97706; } .t-blue { background: #e3eeff; color: #2563eb; }
.br-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.br-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.br-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.br-tile.hero span { color: #9db8b4; }
.br-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

.br-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: br-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.br-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.br-left, .br-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.br-search { position: relative; display: flex; align-items: center; width: 300px; max-width: 100%; }
.br-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.br-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.br-search input::placeholder { color: #8aa3a0; }
.br-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.br-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.br-x:hover { background: #e3ecea; color: var(--ink); }
.br-seg { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; }
.br-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.br-sb:hover { color: var(--ink); } .br-sb.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.br-select { height: 38px; max-width: 170px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.br-select:hover { background-color: #e9f1ef; }

/* logo tile */
.br-logo { position: relative; width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 17px; overflow: hidden; border: 1px solid var(--line); background: #fff; }
.br-logo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 5px; background: #fff; }
.br-slug { display: inline-block; max-width: 100%; padding: 2px 9px; border-radius: 8px; background: #eef4f2; color: #35504c; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* list */
.br-head, .br-row { display: grid; grid-template-columns: minmax(0,1.6fr) minmax(0,1fr) minmax(0,2fr) minmax(0,.8fr) 112px; gap: 14px; align-items: center; padding: 0 18px; }
.br-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.br-row { min-height: 66px; border-bottom: 1px solid var(--line); transition: background .12s; animation: br-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.br-row:last-child { border-bottom: 0; } .br-row:hover { background: #f6fbf9; }
.br-who { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
.br-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.br-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.br-desc { color: #4d6561; font-size: 12.5px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.br-date { color: var(--muted); font-size: 12.5px; }
.br-row:hover .br-logo { transform: scale(1.06); } .br-logo { transition: transform .2s; }

.br-acts { display: flex; gap: 6px; justify-content: flex-end; }
.br-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.br-ib:hover { transform: translateY(-1px); }
.br-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.br-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }
.br-ib.d:hover { background: #fdecea; color: #c0392b; border-color: #f6cfca; }
.br-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

/* grid */
.br-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; padding: 16px; }
.br-card { display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 16px; background: #fff; overflow: hidden;
  transition: transform .22s, box-shadow .22s, border-color .22s; animation: br-up .45s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 35ms) backwards; }
.br-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(12,37,38,.09); border-color: #d3e2df; }
.br-stage { position: relative; height: 112px; display: grid; place-items: center; cursor: pointer; font-size: 38px; font-weight: 800; color: var(--teal);
  background: radial-gradient(160px 80px at 50% 0%, rgba(15,118,110,.08), transparent 70%), #f6faf9; border-bottom: 1px solid var(--line); }
.br-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 18px; transition: transform .3s; }
.br-card:hover .br-stage img { transform: scale(1.06); }
.br-cbody { padding: 12px 14px 8px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.br-cbody b { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.br-cbody .br-desc { min-height: 36px; }
.br-cfoot { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 12px 14px; }

.br-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.br-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.br-skel { height: 66px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.br-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: br-shine 1.3s linear infinite; }

.br-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.br-pager { display: flex; align-items: center; gap: 6px; }
.br-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.br-pg:hover:not(:disabled) { background: #eef5f3; } .br-pg:disabled { opacity: .4; cursor: not-allowed; }
.br-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes br-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes br-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes br-shine { to { background-position: -200% 0; } }
@keyframes br-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .br-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 900px) {
  .br-head, .br-row { grid-template-columns: minmax(0,1.6fr) minmax(0,1fr) minmax(0,.8fr) 112px; } .br-hide-md { display: none; }
}
@media (max-width: 720px) {
  .br { padding: 14px; } .br-tiles { grid-template-columns: 1fr; }
  .br-head { display: none; }
  .br-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; } .br-hide-m { display: none; }
  .br-search, .br-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .br-tile, .br-panel, .br-row, .br-card, .br-skel i, .br-spin { animation: none !important; } .br-tile, .br-card, .br-logo, .br-stage img { transition: none; } }
`;

const TONES = [['#e0f4f1', '#0f766e'], ['#e3eeff', '#2563eb'], ['#eee8ff', '#7c3aed'], ['#fff1d6', '#d97706'], ['#fdecea', '#c0392b'], ['#ecf6d8', '#4d7c0f']];
const toneFor = (s = '') => TONES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
const logoOf = (b) => b.image_url || b.logo_url || '';
const hasLogo = (b) => Boolean(b.logo || b.image_url || b.logo_url);

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

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
    <div className={`br-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`br-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{shown}</b></div>
    </div>
  );
}

function Logo({ b }) {
  const [bg, fg] = toneFor(b.name);
  return (
    <span className="br-logo" style={{ background: bg, color: fg }}>
      {String(b.name || '?').trim().charAt(0).toUpperCase()}
      {logoOf(b) && <img src={logoOf(b)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
    </span>
  );
}

function Actions({ onView, onEdit, onDelete, tb }) {
  return (
    <div className="br-acts">
      <button className="br-ib v" onClick={onView} aria-label="View brand" title={tb.viewTitle}><Eye size={15} /></button>
      <button className="br-ib e" onClick={onEdit} aria-label="Edit brand" title={tb.editTitle}><Pencil size={15} /></button>
      <button className="br-ib d" onClick={onDelete} aria-label="Delete brand" title={tb.deleteTitle}><Trash2 size={15} /></button>
    </div>
  );
}

export default function BrandPage() {
  const { t } = useTranslation();
  const tb = t.brands;

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingBrand, setViewingBrand] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await listBrands();
      const items = res?.data || res?.brands || (Array.isArray(res) ? res : []);
      setBrands(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setErrorMsg(error.message || tb.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const askDelete = (b) => { setDeleteError(''); setDeletingBrand(b); };

  const handleConfirmDelete = async () => {
    if (!deletingBrand?.id) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await deleteBrand(deletingBrand.id);
      setDeletingBrand(null);
      fetchBrands();
    } catch (err) {
      setDeleteError(err?.message || tb.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    let withLogo = 0, fresh = 0;
    brands.forEach((b) => {
      if (hasLogo(b)) withLogo += 1;
      const d = new Date(b.created_at);
      if (!Number.isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) fresh += 1;
    });
    return { total: brands.length, withLogo, noLogo: brands.length - withLogo, fresh };
  }, [brands]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = brands.filter((b) => !q || b.name?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q));
    const by = {
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    }[sort];
    return [...list].sort(by);
  }, [brands, search, sort]);

  const size = view === 'grid' ? 12 : 10;
  const pages = Math.max(1, Math.ceil(visible.length / size));
  const current = Math.min(page, pages);
  const start = (current - 1) * size;
  const rows = visible.slice(start, start + size);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const exportCsv = () => {
    const lines = [['ID', 'Name', 'Slug', 'Description', 'Created'], ...visible.map((b) => [b.id, b.name, b.slug || '', b.description || '', b.created_at || ''])];
    const csv = '\uFEFF' + lines.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brands.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <style>{css}</style>
      <div className="br">
        <div className="br-top">
          <div>
            <h2>{tb.heading}</h2>
            <p>{tb.subHeading}</p>
          </div>
          <div className="br-actions">
            <button className="br-btn primary" onClick={() => setIsCreateOpen(true)}><Plus size={16} /> {tb.addNew}</button>
            <button className="br-btn" onClick={exportCsv} disabled={visible.length === 0}><Download size={16} /> {tb.exportCsv}</button>
            <button className="br-btn" onClick={fetchBrands} disabled={loading}><RefreshCw size={16} className={loading ? 'br-spin' : ''} /> {tb.refresh}</button>
          </div>
        </div>

        {errorMsg && <div className="br-err" role="alert"><span>{errorMsg}</span><button onClick={fetchBrands}>{tb.tryAgain}</button></div>}

        <div className="br-tiles">
          <Tile label={tb.tileTotal} target={stats.total} icon={Tag} tone="t-dark" hero delay={0} />
          <Tile label={tb.tileWithLogo} target={stats.withLogo} icon={ImageIcon} tone="t-green" delay={70} />
          <Tile label={tb.tileNoLogo} target={stats.noLogo} icon={ImageOff} tone="t-amber" delay={140} />
          <Tile label={tb.tileFresh} target={stats.fresh} icon={CalendarPlus} tone="t-blue" delay={210} />
        </div>

        <section className="br-panel">
          <div className="br-tools">
            <div className="br-left">
              <div className="br-search">
                <Search size={16} />
                <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder={tb.searchPlaceholder} aria-label="Search brands" />
                {search && <button className="br-x" onClick={() => reset(setSearch)('')} aria-label={tb.clearSearch}><X size={15} /></button>}
              </div>
            </div>
            <div className="br-right">
              <select className="br-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort brands">
                <option value="name">{tb.sortName}</option>
                <option value="newest">{tb.sortNewest}</option>
                <option value="oldest">{tb.sortOldest}</option>
              </select>
              <div className="br-seg" role="group" aria-label="View">
                <button className={`br-sb${view === 'grid' ? ' on' : ''}`} onClick={() => reset(setView)('grid')} aria-label={tb.gridView} aria-pressed={view === 'grid'}><LayoutGrid size={16} /></button>
                <button className={`br-sb${view === 'list' ? ' on' : ''}`} onClick={() => reset(setView)('list')} aria-label={tb.listView} aria-pressed={view === 'list'}><List size={16} /></button>
              </div>
            </div>
          </div>

          {view === 'list' && (
            <div className="br-head"><span>{tb.colBrand}</span><span className="br-hide-m">{tb.colSlug}</span><span className="br-hide-m br-hide-md">{tb.colDescription}</span><span className="br-hide-m">{tb.colAdded}</span><span /></div>
          )}

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="br-skel" key={i}><i style={{ width: 46, height: 46, borderRadius: 13 }} /><i style={{ width: '28%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="br-empty">
              <b>{brands.length === 0 ? tb.emptyNoData : tb.emptyNoResult}</b>
              {brands.length > 0 && tb.emptyHint}
            </div>
          ) : view === 'list' ? (
            <div key={`l-${sort}-${current}`}>
              {rows.map((b, i) => (
                <div className="br-row" key={b.id ?? i} style={{ '--i': i }}>
                  <div className="br-who" onClick={() => setViewingBrand(b)}>
                    <Logo b={b} />
                    <div style={{ minWidth: 0 }}><b>{b.name}</b><span className="br-sub">ID #{b.id}</span></div>
                  </div>
                  <div className="br-hide-m"><span className="br-slug">{b.slug || '-'}</span></div>
                  <div className="br-hide-m br-hide-md br-desc">{b.description || '-'}</div>
                  <span className="br-date br-hide-m">{formatDate(b.created_at)}</span>
                  <Actions onView={() => setViewingBrand(b)} onEdit={() => setEditingBrand(b)} onDelete={() => askDelete(b)} tb={tb} />
                </div>
              ))}
            </div>
          ) : (
            <div className="br-cards" key={`g-${sort}-${current}`}>
              {rows.map((b, i) => {
                const [bg, fg] = toneFor(b.name);
                return (
                  <div className="br-card" key={b.id ?? i} style={{ '--i': i }}>
                    <div className="br-stage" style={!logoOf(b) ? { background: bg, color: fg } : undefined} onClick={() => setViewingBrand(b)}>
                      {String(b.name || '?').trim().charAt(0).toUpperCase()}
                      {logoOf(b) && <img src={logoOf(b)} alt={b.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                    </div>
                    <div className="br-cbody">
                      <b onClick={() => setViewingBrand(b)}>{b.name}</b>
                      <span className="br-slug">{b.slug || '-'}</span>
                      <div className="br-desc">{b.description || tb.noDescription}</div>
                    </div>
                    <div className="br-cfoot">
                      <span className="br-date">{formatDate(b.created_at)}</span>
                      <Actions onView={() => setViewingBrand(b)} onEdit={() => setEditingBrand(b)} onDelete={() => askDelete(b)} tb={tb} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="br-foot">
              <span>{tb.showing} {start + 1}–{Math.min(start + size, visible.length)} {tb.of} {visible.length}</span>
              <div className="br-pager">
                <button className="br-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="br-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateBrandModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchBrands} />
      <ViewBrandModal isOpen={Boolean(viewingBrand)} brand={viewingBrand} onClose={() => setViewingBrand(null)} onEdit={(b) => setEditingBrand(b)} onDelete={askDelete} />
      <EditBrandModal isOpen={Boolean(editingBrand)} brand={editingBrand} onClose={() => setEditingBrand(null)} onSuccess={fetchBrands} />
      <ConfirmDeleteModal
        isOpen={Boolean(deletingBrand)}
        title={tb.deleteModalTitle}
        message={<>{tb.deleteModalPrefix} <b>“{deletingBrand?.name}”</b> {tb.deleteModalSuffix}</>}
        confirmLabel={tb.deleteModalConfirm}
        busy={isDeleting}
        error={deleteError}
        onCancel={() => setDeletingBrand(null)}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
}