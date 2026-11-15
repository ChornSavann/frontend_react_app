// src/pages/CategoryPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Layers, Image as ImageIcon, ImageOff, CalendarPlus, Search, Download, RefreshCw, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, LayoutGrid, List } from 'lucide-react';
import { listCategories, deleteCategory } from '../services/categoryService';
import Layout from '../components/Layout';
import CreateCategoryModal from './categories/CreateCategoryModal';
import EditCategoryModal from './categories/EditCategoryModal';
import ViewCategoryModal from './categories/ViewCategoryModal';
import ConfirmDeleteModal from './brands/ConfirmDeleteModal';

const css = `
.ct { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.ct *, .ct *::before, .ct *::after { box-sizing: border-box; }
.ct h2 { margin: 0; color: var(--ink); font-family: inherit; }

.ct-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.ct-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.ct-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.ct-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.ct-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.ct-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.ct-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.ct-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.ct-btn:disabled { opacity: .6; cursor: not-allowed; }
.ct button:focus-visible, .ct select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.ct-spin { animation: ct-rot .8s linear infinite; }

.ct-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.ct-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

.ct-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.ct-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: ct-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.ct-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.ct-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-green { background: #e7f8ee; color: #15803d; } .t-amber { background: #fff1d6; color: #d97706; } .t-blue { background: #e3eeff; color: #2563eb; }
.ct-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.ct-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.ct-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.ct-tile.hero span { color: #9db8b4; }
.ct-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

.ct-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: ct-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.ct-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.ct-left, .ct-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ct-search { position: relative; display: flex; align-items: center; width: 300px; max-width: 100%; }
.ct-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.ct-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.ct-search input::placeholder { color: #8aa3a0; }
.ct-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.ct-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.ct-x:hover { background: #e3ecea; color: var(--ink); }
.ct-seg { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; }
.ct-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.ct-sb:hover { color: var(--ink); } .ct-sb.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.ct-select { height: 38px; max-width: 170px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.ct-select:hover { background-color: #e9f1ef; }

/* logo tile */
.ct-logo { position: relative; width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 17px; overflow: hidden; border: 1px solid var(--line); background: #fff; }
.ct-logo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #fff; }

/* list */
.ct-head, .ct-row { display: grid; grid-template-columns: minmax(0,1.6fr) minmax(0,2.4fr) minmax(0,.8fr) 112px; gap: 14px; align-items: center; padding: 0 18px; }
.ct-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.ct-row { min-height: 66px; border-bottom: 1px solid var(--line); transition: background .12s; animation: ct-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.ct-row:last-child { border-bottom: 0; } .ct-row:hover { background: #f6fbf9; }
.ct-who { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
.ct-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ct-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.ct-desc { color: #4d6561; font-size: 12.5px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ct-date { color: var(--muted); font-size: 12.5px; }
.ct-row:hover .ct-logo { transform: scale(1.06); } .ct-logo { transition: transform .2s; }

.ct-acts { display: flex; gap: 6px; justify-content: flex-end; }
.ct-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.ct-ib:hover { transform: translateY(-1px); }
.ct-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.ct-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }
.ct-ib.d:hover { background: #fdecea; color: #c0392b; border-color: #f6cfca; }
.ct-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

/* grid */
.ct-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; padding: 16px; }
.ct-card { display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 16px; background: #fff; overflow: hidden;
  transition: transform .22s, box-shadow .22s, border-color .22s; animation: ct-up .45s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 35ms) backwards; }
.ct-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(12,37,38,.09); border-color: #d3e2df; }
.ct-stage { position: relative; height: 124px; display: grid; place-items: center; cursor: pointer; font-size: 38px; font-weight: 800; color: var(--teal);
  background: radial-gradient(160px 80px at 50% 0%, rgba(15,118,110,.08), transparent 70%), #f6faf9; border-bottom: 1px solid var(--line); }
.ct-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.ct-card:hover .ct-stage img { transform: scale(1.06); }
.ct-cbody { padding: 12px 14px 8px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.ct-cbody b { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.ct-cbody .ct-desc { min-height: 36px; }
.ct-cfoot { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 12px 14px; }

.ct-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.ct-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.ct-skel { height: 66px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.ct-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: ct-shine 1.3s linear infinite; }

.ct-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.ct-pager { display: flex; align-items: center; gap: 6px; }
.ct-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.ct-pg:hover:not(:disabled) { background: #eef5f3; } .ct-pg:disabled { opacity: .4; cursor: not-allowed; }
.ct-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes ct-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes ct-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes ct-shine { to { background-position: -200% 0; } }
@keyframes ct-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .ct-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 900px) {
  .ct-head, .ct-row { grid-template-columns: minmax(0,1.6fr) minmax(0,.8fr) 112px; } .ct-hide-md { display: none; }
}
@media (max-width: 720px) {
  .ct { padding: 14px; } .ct-tiles { grid-template-columns: 1fr; }
  .ct-head { display: none; }
  .ct-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; } .ct-hide-m { display: none; }
  .ct-search, .ct-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .ct-tile, .ct-panel, .ct-row, .ct-card, .ct-skel i, .ct-spin { animation: none !important; } .ct-tile, .ct-card, .ct-logo, .ct-stage img { transition: none; } }
`;

const TONES = [['#e0f4f1', '#0f766e'], ['#e3eeff', '#2563eb'], ['#eee8ff', '#7c3aed'], ['#fff1d6', '#d97706'], ['#fdecea', '#c0392b'], ['#ecf6d8', '#4d7c0f']];
const toneFor = (s = '') => TONES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
const imageOf = (b) => b.image_url || '';
const hasImage = (b) => Boolean(b.image || b.image_url);

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
    <div className={`ct-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`ct-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{shown}</b></div>
    </div>
  );
}

function Logo({ b }) {
  const [bg, fg] = toneFor(b.name);
  return (
    <span className="ct-logo" style={{ background: bg, color: fg }}>
      {String(b.name || '?').trim().charAt(0).toUpperCase()}
      {imageOf(b) && <img src={imageOf(b)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
    </span>
  );
}

function Actions({ onView, onEdit, onDelete }) {
  return (
    <div className="ct-acts">
      <button className="ct-ib v" onClick={onView} aria-label="View category" title="មើល"><Eye size={15} /></button>
      <button className="ct-ib e" onClick={onEdit} aria-label="Edit category" title="កែប្រែ"><Pencil size={15} /></button>
      <button className="ct-ib d" onClick={onDelete} aria-label="Delete category" title="លុប"><Trash2 size={15} /></button>
    </div>
  );
}

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);

  // Modal states (Create, View, Edit, Delete)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await listCategories();
      const items = res?.data || res?.categories || (Array.isArray(res) ? res : []);
      setCategories(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMsg(error.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យប្រភេទទំនិញ');
    } finally {
      setLoading(false);
    }
  };

  const askDelete = (b) => { setDeleteError(''); setDeletingCategory(b); };

  // មុខងារលុបប្រភេទទំនិញ
  const handleConfirmDelete = async () => {
    if (!deletingCategory?.id) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      setDeleteError(err?.message || 'បរាជ័យក្នុងការលុបប្រភេទទំនិញនេះ');
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    let withImage = 0, fresh = 0;
    categories.forEach((b) => {
      if (hasImage(b)) withImage += 1;
      const d = new Date(b.created_at);
      if (!Number.isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) fresh += 1;
    });
    return { total: categories.length, withImage, noImage: categories.length - withImage, fresh };
  }, [categories]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = categories.filter((b) => !q || b.name?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q));
    const by = {
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    }[sort];
    return [...list].sort(by);
  }, [categories, search, sort]);

  const size = view === 'grid' ? 12 : 10;
  const pages = Math.max(1, Math.ceil(visible.length / size));
  const current = Math.min(page, pages);
  const start = (current - 1) * size;
  const rows = visible.slice(start, start + size);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const exportCsv = () => {
    const lines = [['ID', 'Name', 'Description', 'Created'], ...visible.map((b) => [b.id, b.name, b.description || '', b.created_at || ''])];
    const csv = '\uFEFF' + lines.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <style>{css}</style>
      <div className="ct">
        <div className="ct-top">
          <div>
            <h2>🗂️ បញ្ជីប្រភេទទំនិញ</h2>
            <p>គ្រប់គ្រងប្រភេទទំនិញ រូបភាពតំណាង និងការពិពណ៌នាប្រភេទនីមួយៗ</p>
          </div>
          <div className="ct-actions">
            <button className="ct-btn primary" onClick={() => setIsCreateOpen(true)}><Plus size={16} /> បន្ថែមប្រភេទថ្មី</button>
            <button className="ct-btn" onClick={exportCsv} disabled={visible.length === 0}><Download size={16} /> Export CSV</button>
            <button className="ct-btn" onClick={fetchCategories} disabled={loading}><RefreshCw size={16} className={loading ? 'ct-spin' : ''} /> ផ្ទុកឡើងវិញ</button>
          </div>
        </div>

        {errorMsg && <div className="ct-err" role="alert"><span>{errorMsg}</span><button onClick={fetchCategories}>Try again</button></div>}

        <div className="ct-tiles">
          <Tile label="ប្រភេទទំនិញសរុប" target={stats.total} icon={Layers} tone="t-dark" hero delay={0} />
          <Tile label="មានរូបភាព (Image)" target={stats.withImage} icon={ImageIcon} tone="t-green" delay={70} />
          <Tile label="មិនទាន់មានរូបភាព" target={stats.noImage} icon={ImageOff} tone="t-amber" delay={140} />
          <Tile label="បង្កើតខែនេះ" target={stats.fresh} icon={CalendarPlus} tone="t-blue" delay={210} />
        </div>

        <section className="ct-panel">
          <div className="ct-tools">
            <div className="ct-left">
              <div className="ct-search">
                <Search size={16} />
                <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder="ស្វែងរកឈ្មោះប្រភេទ ឬការពិពណ៌នា…" aria-label="Search categories" />
                {search && <button className="ct-x" onClick={() => reset(setSearch)('')} aria-label="Clear search"><X size={15} /></button>}
              </div>
            </div>
            <div className="ct-right">
              <select className="ct-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort categories">
                <option value="name">Name A–Z</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <div className="ct-seg" role="group" aria-label="View">
                <button className={`ct-sb${view === 'grid' ? ' on' : ''}`} onClick={() => reset(setView)('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><LayoutGrid size={16} /></button>
                <button className={`ct-sb${view === 'list' ? ' on' : ''}`} onClick={() => reset(setView)('list')} aria-label="List view" aria-pressed={view === 'list'}><List size={16} /></button>
              </div>
            </div>
          </div>

          {view === 'list' && (
            <div className="ct-head"><span>Category</span><span className="ct-hide-m ct-hide-md">Description</span><span className="ct-hide-m">Added</span><span /></div>
          )}

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="ct-skel" key={i}><i style={{ width: 46, height: 46, borderRadius: 13 }} /><i style={{ width: '28%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="ct-empty">
              <b>{categories.length === 0 ? 'រកមិនឃើញទិន្នន័យប្រភេទទំនិញទេ' : 'រកមិនឃើញលទ្ធផល'}</b>
              {categories.length > 0 && 'Try a different name or description.'}
            </div>
          ) : view === 'list' ? (
            <div key={`l-${sort}-${current}`}>
              {rows.map((b, i) => (
                <div className="ct-row" key={b.id ?? i} style={{ '--i': i }}>
                  <div className="ct-who" onClick={() => setViewingCategory(b)}>
                    <Logo b={b} />
                    <div style={{ minWidth: 0 }}><b>{b.name}</b><span className="ct-sub">ID #{b.id}{b.products_count !== undefined && b.products_count !== null ? ` · ${b.products_count} products` : ''}</span></div>
                  </div>
                  <div className="ct-hide-m ct-hide-md ct-desc">{b.description || '-'}</div>
                  <span className="ct-date ct-hide-m">{formatDate(b.created_at)}</span>
                  <Actions onView={() => setViewingCategory(b)} onEdit={() => setEditingCategory(b)} onDelete={() => askDelete(b)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="ct-cards" key={`g-${sort}-${current}`}>
              {rows.map((b, i) => {
                const [bg, fg] = toneFor(b.name);
                return (
                  <div className="ct-card" key={b.id ?? i} style={{ '--i': i }}>
                    <div className="ct-stage" style={!imageOf(b) ? { background: bg, color: fg } : undefined} onClick={() => setViewingCategory(b)}>
                      {String(b.name || '?').trim().charAt(0).toUpperCase()}
                      {imageOf(b) && <img src={imageOf(b)} alt={b.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                    </div>
                    <div className="ct-cbody">
                      <b onClick={() => setViewingCategory(b)}>{b.name}</b>
                      {b.products_count !== undefined && b.products_count !== null && <span className="ct-sub" style={{ marginTop: 0 }}>{b.products_count} products</span>}
                      <div className="ct-desc">{b.description || 'គ្មានការពិពណ៌នា'}</div>
                    </div>
                    <div className="ct-cfoot">
                      <span className="ct-date">{formatDate(b.created_at)}</span>
                      <Actions onView={() => setViewingCategory(b)} onEdit={() => setEditingCategory(b)} onDelete={() => askDelete(b)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="ct-foot">
              <span>Showing {start + 1}–{Math.min(start + size, visible.length)} of {visible.length}</span>
              <div className="ct-pager">
                <button className="ct-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="ct-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateCategoryModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchCategories} />
      <ViewCategoryModal isOpen={Boolean(viewingCategory)} category={viewingCategory} onClose={() => setViewingCategory(null)} onEdit={(b) => setEditingCategory(b)} onDelete={askDelete} />
      <EditCategoryModal isOpen={Boolean(editingCategory)} category={editingCategory} onClose={() => setEditingCategory(null)} onSuccess={fetchCategories} />
      <ConfirmDeleteModal
        isOpen={Boolean(deletingCategory)}
        title="បញ្ជាក់ការលុបប្រភេទទំនិញ"
        message={<>តើអ្នកពិតជាចង់លុបប្រភេទទំនិញ <b>“{deletingCategory?.name}”</b> នេះមែនទេ? ការលុបមិនអាចត្រឡប់វិញបានទេ។</>}
        confirmLabel="យល់ព្រមលុប"
        busy={isDeleting}
        error={deleteError}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
}