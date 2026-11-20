// src/pages/ExpenseTypePage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, CheckCircle2, XCircle, CalendarPlus, Search, RefreshCw, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { listExpenseTypes, deleteExpenseType } from '../services/expenseService';
import Layout from '../components/Layout';
import CreateExpenseTypeModal from './expenses/CreateExpenseTypeModal';
import EditExpenseTypeModal from './expenses/EditExpenseTypeModal';
import ViewExpenseTypeModal from './expenses/ViewExpenseTypeModal';
import ConfirmDeleteModal from './brands/ConfirmDeleteModal';
import ToastrContainer, { toastr } from '../components/Toastr';
import { useTranslation } from '../utils/translations';

const PAGE_SIZE = 10;
const css = `
.et { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.et *, .et *::before, .et *::after { box-sizing: border-box; }
.et h2 { margin: 0; color: var(--ink); font-family: inherit; }

.et-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.et-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.et-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.et-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.et-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.et-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.et-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.et-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.et-btn:disabled { opacity: .6; cursor: not-allowed; }
.et button:focus-visible, .et select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.et-spin { animation: et-rot .8s linear infinite; }

.et-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.et-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

.et-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.et-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: et-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.et-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.et-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-green { background: #e7f8ee; color: #15803d; } .t-amber { background: #fff1d6; color: #d97706; } .t-blue { background: #e3eeff; color: #2563eb; }
.et-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.et-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.et-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.et-tile.hero span { color: #9db8b4; }
.et-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

.et-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: et-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.et-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.et-left, .et-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.et-search { position: relative; display: flex; align-items: center; width: 300px; max-width: 100%; }
.et-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.et-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.et-search input::placeholder { color: #8aa3a0; }
.et-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.et-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.et-x:hover { background: #e3ecea; color: var(--ink); }
.et-seg { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; }
.et-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.et-sb:hover { color: var(--ink); } .et-sb.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.et-select { height: 38px; max-width: 170px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.et-select:hover { background-color: #e9f1ef; }

.et-logo { position: relative; width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 17px; overflow: hidden; border: 1px solid var(--line); background: #fff; }
.et-logo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 5px; background: #fff; }

.et-head, .et-row { display: grid; grid-template-columns: minmax(0,1.6fr) minmax(0,2.2fr) minmax(0,.8fr) minmax(0,.8fr) 112px; gap: 14px; align-items: center; padding: 0 18px; }
.et-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.et-row { min-height: 66px; border-bottom: 1px solid var(--line); transition: background .12s; animation: et-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.et-row:last-child { border-bottom: 0; } .et-row:hover { background: #f6fbf9; }
.et-who { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
.et-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.et-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.et-desc { color: #4d6561; font-size: 12.5px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.et-date { color: var(--muted); font-size: 12.5px; }
.et-row:hover .et-logo { transform: scale(1.06); } .et-logo { transition: transform .2s; }

.et-acts { display: flex; gap: 6px; justify-content: flex-end; }
.et-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.et-ib:hover { transform: translateY(-1px); }
.et-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.et-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }
.et-ib.d:hover { background: #fdecea; color: #c0392b; border-color: #f6cfca; }
.et-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.et-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; padding: 16px; }
.et-card { display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 16px; background: #fff; overflow: hidden;
  transition: transform .22s, box-shadow .22s, border-color .22s; animation: et-up .45s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 35ms) backwards; }
.et-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(12,37,38,.09); border-color: #d3e2df; }
.et-stage { position: relative; height: 112px; display: grid; place-items: center; cursor: pointer; font-size: 38px; font-weight: 800; color: var(--teal);
  background: radial-gradient(160px 80px at 50% 0%, rgba(15,118,110,.08), transparent 70%), #f6faf9; border-bottom: 1px solid var(--line); }
.et-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 18px; transition: transform .3s; }
.et-card:hover .et-stage img { transform: scale(1.06); }
.et-cbody { padding: 12px 14px 8px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.et-cbody b { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.et-cbody .et-desc { min-height: 36px; }
.et-cfoot { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 12px 14px; }

.et-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.et-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.et-skel { height: 66px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.et-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: et-shine 1.3s linear infinite; }

.et-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.et-pager { display: flex; align-items: center; gap: 6px; }
.et-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.et-pg:hover:not(:disabled) { background: #eef5f3; } .et-pg:disabled { opacity: .4; cursor: not-allowed; }
.et-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes et-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes et-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes et-shine { to { background-position: -200% 0; } }
@keyframes et-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .et-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 900px) {
  .et-head, .et-row { grid-template-columns: minmax(0,1.6fr) minmax(0,.8fr) minmax(0,.8fr) 112px; } .et-hide-md { display: none; }
}
@media (max-width: 720px) {
  .et { padding: 14px; } .et-tiles { grid-template-columns: 1fr; }
  .et-head { display: none; }
  .et-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; } .et-hide-m { display: none; }
  .et-search, .et-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .et-tile, .et-panel, .et-row, .et-card, .et-skel i, .et-spin { animation: none !important; } .et-tile, .et-card, .et-logo, .et-stage img { transition: none; } }

.et-btn.icon { width: 40px; padding: 0; justify-content: center; }
.et-ico { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: grid; place-items: center; background: #e3eeff; color: #2563eb; transition: transform .2s; }
.et-row:hover .et-ico { transform: scale(1.07) rotate(-4deg); }
.et-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; width: fit-content; }
.et-badge.on { background: #e7f8ee; color: #15803d; } .et-badge.off { background: #eef2f1; color: #5f7773; }
@media (max-width: 720px) { .et-acts { grid-column: 1 / -1; } .et-badge { justify-self: end; } }
@media (prefers-reduced-motion: reduce) { .et-ico { transition: none; } }
`;

const isActive = (t) => Number(t.is_active ?? 1) === 1;
const fmtDate = (value) => {
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
    <div className={`et-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`et-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{shown}</b></div>
    </div>
  );
}

export default function ExpenseTypePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tet = t.expenseTypes;

  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingType, setViewingType] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [deletingType, setDeletingType] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  const fetchExpenseTypes = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await listExpenseTypes();
      const items = res?.data || res?.expense_types || res?.expenseTypes || (Array.isArray(res) ? res : []);
      setExpenseTypes(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching expense types:', error);
      const msg = error.message || tet.fetchError;
      setErrorMsg(msg);
      toastr.error(tet.toastErrorTitle, msg);
    } finally {
      setLoading(false);
    }
  };

  const askDelete = (item) => { setDeleteError(''); setDeletingType(item); };

  const handleConfirmDelete = async () => {
    if (!deletingType?.id) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await deleteExpenseType(deletingType.id);
      setDeletingType(null);
      toastr.success(tet.toastDeleteSuccessTitle, tet.toastDeleteSuccessMsg);
      fetchExpenseTypes();
    } catch (err) {
      const msg = err?.message || tet.deleteError;
      setDeleteError(msg);
      toastr.error(tet.toastErrorTitle, msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    let active = 0, fresh = 0;
    expenseTypes.forEach((item) => {
      if (isActive(item)) active += 1;
      const d = new Date(item.created_at);
      if (!Number.isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) fresh += 1;
    });
    return { counts: { all: expenseTypes.length, active, inactive: expenseTypes.length - active }, fresh };
  }, [expenseTypes]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenseTypes
      .filter((item) => (!q || item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)) && (filter === 'all' || (filter === 'active') === isActive(item)))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [expenseTypes, search, filter]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const FILTERS = [
    { key: 'all', label: tet.filterAll },
    { key: 'active', label: tet.filterActive },
    { key: 'inactive', label: tet.filterInactive },
  ];

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="et">
        <div className="et-top">
          <div>
            <h2>{tet.heading}</h2>
            <p>{tet.subHeading}</p>
          </div>
          <div className="et-actions">
            <button className="et-btn primary" onClick={() => setIsCreateOpen(true)}><Plus size={16} /> {tet.addNew}</button>
            <button className="et-btn" onClick={() => navigate('/expenses')}><ArrowLeft size={16} /> {tet.backToExpenses}</button>
            <button className="et-btn icon" onClick={fetchExpenseTypes} disabled={loading} aria-label={tet.refresh} title={tet.refresh}><RefreshCw size={16} className={loading ? 'et-spin' : ''} /></button>
          </div>
        </div>

        {errorMsg && <div className="et-err" role="alert"><span>{errorMsg}</span><button onClick={fetchExpenseTypes}>{tet.tryAgain}</button></div>}

        <div className="et-tiles">
          <Tile label={tet.tileTotal} target={stats.counts.all} icon={FolderKanban} tone="t-dark" hero delay={0} />
          <Tile label={tet.tileActive} target={stats.counts.active} icon={CheckCircle2} tone="t-green" delay={70} />
          <Tile label={tet.tileInactive} target={stats.counts.inactive} icon={XCircle} tone="t-amber" delay={140} />
          <Tile label={tet.tileFresh} target={stats.fresh} icon={CalendarPlus} tone="t-blue" delay={210} />
        </div>

        <section className="et-panel">
          <div className="et-tools">
            <div className="et-left">
              <div className="et-search">
                <Search size={16} />
                <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder={tet.searchPlaceholder} aria-label="Search expense types" />
                {search && <button className="et-x" onClick={() => reset(setSearch)('')} aria-label={tet.clearSearch}><X size={15} /></button>}
              </div>
              <div className="et-seg" role="group" aria-label="Status">
                {FILTERS.map((f) => <button key={f.key} className={`et-sb${filter === f.key ? ' on' : ''}`} aria-pressed={filter === f.key} onClick={() => reset(setFilter)(f.key)}>{f.label} <span style={{ opacity: .6 }}>{stats.counts[f.key]}</span></button>)}
              </div>
            </div>
          </div>

          <div className="et-head"><span>{tet.colType}</span><span className="et-hide-m et-hide-md">{tet.colDescription}</span><span className="et-hide-m">{tet.colCreated}</span><span>{tet.colStatus}</span><span /></div>

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="et-skel" key={i}><i style={{ width: 40, height: 40, borderRadius: 12 }} /><i style={{ width: '28%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="et-empty">
              <b>{expenseTypes.length === 0 ? tet.emptyNoData : tet.emptyNoResult}</b>
              {expenseTypes.length > 0 && tet.emptyHint}
            </div>
          ) : (
            <div key={`${filter}-${current}`}>
              {rows.map((item, i) => (
                <div className="et-row" key={item.id ?? i} style={{ '--i': i }}>
                  <div className="et-who" onClick={() => setViewingType(item)}>
                    <span className="et-ico"><FolderKanban size={18} /></span>
                    <div style={{ minWidth: 0 }}><b>{item.name}</b><span className="et-sub">ID #{item.id}{item.expenses_count !== undefined && item.expenses_count !== null ? ` · ${item.expenses_count} ${tet.expensesLabel}` : ''}</span></div>
                  </div>
                  <div className="et-hide-m et-hide-md et-desc">{item.description || '-'}</div>
                  <span className="et-date et-hide-m">{fmtDate(item.created_at)}</span>
                  {isActive(item) ? <span className="et-badge on"><CheckCircle2 size={13} /> {tet.statusActive}</span> : <span className="et-badge off"><XCircle size={13} /> {tet.statusInactive}</span>}
                  <div className="et-acts">
                    <button className="et-ib v" onClick={() => setViewingType(item)} aria-label="View type" title={tet.viewTitle}><Eye size={15} /></button>
                    <button className="et-ib e" onClick={() => setEditingType(item)} aria-label="Edit type" title={tet.editTitle}><Pencil size={15} /></button>
                    <button className="et-ib d" onClick={() => askDelete(item)} aria-label="Delete type" title={tet.deleteTitle}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="et-foot">
              <span>{tet.showing} {start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} {tet.of} {visible.length}</span>
              <div className="et-pager">
                <button className="et-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="et-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateExpenseTypeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchExpenseTypes();
          toastr.success(tet.toastCreateSuccessTitle, tet.toastCreateSuccessMsg);
        }}
      />
      <ViewExpenseTypeModal
        isOpen={Boolean(viewingType)}
        expenseType={viewingType}
        onClose={() => setViewingType(null)}
        onEdit={(item) => setEditingType(item)}
        onDelete={askDelete}
      />
      <EditExpenseTypeModal
        isOpen={Boolean(editingType)}
        expenseType={editingType}
        onClose={() => setEditingType(null)}
        onSuccess={() => {
          fetchExpenseTypes();
          toastr.success(tet.toastUpdateSuccessTitle, tet.toastUpdateSuccessMsg);
        }}
      />
      <ConfirmDeleteModal
        isOpen={Boolean(deletingType)}
        title={tet.deleteModalTitle}
        message={<>{tet.deleteModalPrefix} <b>“{deletingType?.name}”</b> {tet.deleteModalSuffix}</>}
        confirmLabel={tet.deleteModalConfirm}
        busy={isDeleting}
        error={deleteError}
        onCancel={() => setDeletingType(null)}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
}