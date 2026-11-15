// src/pages/ExpensePage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, DollarSign, CalendarDays, FolderKanban, FolderPlus, Search, Download, RefreshCw, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { listExpenses, listExpenseTypes, deleteExpense } from '../services/expenseService';
import Layout from '../components/Layout';
import CreateExpenseModal from './expenses/CreateExpenseModal';
import EditExpenseModal from './expenses/EditExpenseModal';
import ViewExpenseModal from './expenses/ViewExpenseModal';
import CreateExpenseTypeModal from './expenses/CreateExpenseTypeModal';
import ConfirmDeleteModal from './brands/ConfirmDeleteModal';

const PAGE_SIZE = 10;
const css = `
.ex { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.ex *, .ex *::before, .ex *::after { box-sizing: border-box; }
.ex h2 { margin: 0; color: var(--ink); font-family: inherit; }

.ex-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.ex-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.ex-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.ex-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.ex-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.ex-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.ex-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.ex-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.ex-btn:disabled { opacity: .6; cursor: not-allowed; }
.ex button:focus-visible, .ex select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.ex-spin { animation: ex-rot .8s linear infinite; }

.ex-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.ex-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

.ex-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.ex-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: ex-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.ex-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.ex-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-green { background: #e7f8ee; color: #15803d; } .t-amber { background: #fff1d6; color: #d97706; } .t-blue { background: #e3eeff; color: #2563eb; }
.ex-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.ex-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.ex-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.ex-tile.hero span { color: #9db8b4; }
.ex-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

.ex-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: ex-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.ex-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.ex-left, .ex-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ex-search { position: relative; display: flex; align-items: center; width: 300px; max-width: 100%; }
.ex-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.ex-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.ex-search input::placeholder { color: #8aa3a0; }
.ex-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.ex-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.ex-x:hover { background: #e3ecea; color: var(--ink); }
.ex-seg { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; }
.ex-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.ex-sb:hover { color: var(--ink); } .ex-sb.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.ex-select { height: 38px; max-width: 170px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.ex-select:hover { background-color: #e9f1ef; }

/* logo tile */
.ex-logo { position: relative; width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 17px; overflow: hidden; border: 1px solid var(--line); background: #fff; }
.ex-logo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 5px; background: #fff; }

/* list */
.ex-head, .ex-row { display: grid; grid-template-columns: minmax(0,2fr) minmax(0,1.1fr) minmax(0,1.3fr) minmax(0,.9fr) 112px; gap: 14px; align-items: center; padding: 0 18px; }
.ex-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.ex-row { min-height: 66px; border-bottom: 1px solid var(--line); transition: background .12s; animation: ex-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.ex-row:last-child { border-bottom: 0; } .ex-row:hover { background: #f6fbf9; }
.ex-who { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
.ex-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ex-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.ex-desc { color: #4d6561; font-size: 12.5px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ex-date { color: var(--muted); font-size: 12.5px; }
.ex-row:hover .ex-logo { transform: scale(1.06); } .ex-logo { transition: transform .2s; }

.ex-acts { display: flex; gap: 6px; justify-content: flex-end; }
.ex-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.ex-ib:hover { transform: translateY(-1px); }
.ex-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.ex-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }
.ex-ib.d:hover { background: #fdecea; color: #c0392b; border-color: #f6cfca; }
.ex-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

/* grid */
.ex-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; padding: 16px; }
.ex-card { display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 16px; background: #fff; overflow: hidden;
  transition: transform .22s, box-shadow .22s, border-color .22s; animation: ex-up .45s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 35ms) backwards; }
.ex-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(12,37,38,.09); border-color: #d3e2df; }
.ex-stage { position: relative; height: 112px; display: grid; place-items: center; cursor: pointer; font-size: 38px; font-weight: 800; color: var(--teal);
  background: radial-gradient(160px 80px at 50% 0%, rgba(15,118,110,.08), transparent 70%), #f6faf9; border-bottom: 1px solid var(--line); }
.ex-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 18px; transition: transform .3s; }
.ex-card:hover .ex-stage img { transform: scale(1.06); }
.ex-cbody { padding: 12px 14px 8px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.ex-cbody b { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.ex-cbody .ex-desc { min-height: 36px; }
.ex-cfoot { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 12px 14px; }

.ex-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.ex-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.ex-skel { height: 66px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.ex-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: ex-shine 1.3s linear infinite; }

.ex-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.ex-pager { display: flex; align-items: center; gap: 6px; }
.ex-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.ex-pg:hover:not(:disabled) { background: #eef5f3; } .ex-pg:disabled { opacity: .4; cursor: not-allowed; }
.ex-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes ex-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes ex-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes ex-shine { to { background-position: -200% 0; } }
@keyframes ex-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .ex-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 900px) {
  .ex-head, .ex-row { grid-template-columns: minmax(0,2fr) minmax(0,1.1fr) minmax(0,.9fr) 112px; } .ex-hide-md { display: none; }
}
@media (max-width: 720px) {
  .ex { padding: 14px; } .ex-tiles { grid-template-columns: 1fr; }
  .ex-head { display: none; }
  .ex-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; } .ex-hide-m { display: none; }
  .ex-search, .ex-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .ex-tile, .ex-panel, .ex-row, .ex-card, .ex-skel i, .ex-spin { animation: none !important; } .ex-tile, .ex-card, .ex-logo, .ex-stage img { transition: none; } }

.ex-btn.icon { width: 40px; padding: 0; justify-content: center; }
.ex-ico { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: grid; place-items: center; background: #fdecea; color: #c0392b; transition: transform .2s; }
.ex-row:hover .ex-ico { transform: scale(1.07) rotate(-4deg); }
.ex-tag { display: inline-block; max-width: 100%; padding: 3px 10px; border-radius: 9px; background: #e3eeff; color: #1d4ed8; font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ex-pay { display: inline-block; padding: 1px 8px; border-radius: 7px; background: #eef4f2; color: #35504c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; }
.ex-amt { text-align: right; font-weight: 800; font-size: 14.5px; color: #c0392b; font-variant-numeric: tabular-nums; }
.ex-break { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; margin-bottom: 14px; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: ex-up .5s cubic-bezier(.2,.7,.2,1) 120ms backwards; }
.ex-break-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; font-size: 13px; } .ex-break-top span { color: var(--muted); font-variant-numeric: tabular-nums; }
.ex-bar { display: flex; gap: 3px; height: 12px; border-radius: 99px; overflow: hidden; background: #eef4f2; }
.ex-part { display: block; height: 100%; min-width: 4px; border-radius: 99px; transform-origin: left; animation: ex-fill .9s cubic-bezier(.2,.7,.2,1) backwards; }
.ex-legend { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 12px; font-size: 12.5px; }
.ex-legend span { display: inline-flex; align-items: center; gap: 7px; } .ex-legend i { width: 9px; height: 9px; border-radius: 3px; } .ex-legend b { font-variant-numeric: tabular-nums; } .ex-legend em { font-style: normal; color: var(--muted); }
@keyframes ex-fill { from { transform: scaleX(0); } }
@media (max-width: 720px) { .ex-acts { grid-column: 1 / -1; } .ex-amt { text-align: right; } }
@media (prefers-reduced-motion: reduce) { .ex-break, .ex-part { animation: none !important; } .ex-ico { transition: none; } }
`;

const COLORS = ['#0f766e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#a3b5b2'];
const num = (v) => parseFloat(v || 0) || 0;
const money = (n) => `$${num(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const typeOf = (e) => e.expense_type || e.expenseType || {};
const dateOf = (e) => e.expense_date || e.date || e.created_at;
const titleOf = (e) => e.title || e.name || typeOf(e).name || '-';
const refOf = (e) => e.reference_no || e.expense_number || `EXP-#${e.id}`;
const fmtDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const inPeriod = (e, p) => {
  if (p === 'all') return true;
  const d = new Date(dateOf(e));
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (p === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  return now - d <= 30 * 86400000;
};

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
    <div className={`ex-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`ex-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{prefix}{shown}</b></div>
    </div>
  );
}

function Actions({ onView, onEdit, onDelete }) {
  return (
    <div className="ex-acts">
      <button className="ex-ib v" onClick={onView} aria-label="View expense" title="មើល"><Eye size={15} /></button>
      <button className="ex-ib e" onClick={onEdit} aria-label="Edit expense" title="កែប្រែ"><Pencil size={15} /></button>
      <button className="ex-ib d" onClick={onDelete} aria-label="Delete expense" title="លុប"><Trash2 size={15} /></button>
    </div>
  );
}

const PERIODS = [
  { key: 'all', label: 'All time' },
  { key: 'month', label: 'This month' },
  { key: '30d', label: '30 days' },
];

export default function ExpensePage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [period, setPeriod] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [expRes, typeRes] = await Promise.all([listExpenses(), listExpenseTypes().catch(() => [])]);
      const expList = expRes?.data || expRes?.expenses || (Array.isArray(expRes) ? expRes : []);
      const typeList = typeRes?.data || typeRes?.expense_types || typeRes?.expenseTypes || (Array.isArray(typeRes) ? typeRes : []);
      setExpenses(Array.isArray(expList) ? expList : []);
      setExpenseTypes(Array.isArray(typeList) ? typeList : []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setErrorMsg(error.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យការចំណាយ');
    } finally {
      setLoading(false);
    }
  };

  // ប្រភេទចំណាយពី API និងពីក្នុងតារាងចំណាយ
  const allTypes = useMemo(() => {
    const map = new Map();
    expenseTypes.forEach((t) => { if (t?.id) map.set(t.id, t); });
    expenses.forEach((e) => { const t = typeOf(e); if (t?.id) map.set(t.id, t); });
    return Array.from(map.values());
  }, [expenseTypes, expenses]);

  const askDelete = (e) => { setDeleteError(''); setDeletingExpense(e); };

  const handleConfirmDelete = async () => {
    if (!deletingExpense?.id) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await deleteExpense(deletingExpense.id);
      setDeletingExpense(null);
      fetchData();
    } catch (err) {
      setDeleteError(err?.message || 'បរាជ័យក្នុងការលុបការចំណាយនេះ');
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + num(e.amount), 0);
    const month = expenses.filter((e) => inPeriod(e, 'month')).reduce((s, e) => s + num(e.amount), 0);
    return { total, month, count: expenses.length, types: allTypes.length };
  }, [expenses, allTypes]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = expenses.filter((item) => {
      const t = typeOf(item);
      const typeId = item.expense_type_id ?? t.id;
      const matchSearch = !q || [item.title, item.name, item.reference_no, item.expense_number, item.description, t.name].some((x) => x?.toLowerCase?.().includes(q));
      return matchSearch && (selectedType === 'all' || String(typeId) === String(selectedType)) && inPeriod(item, period);
    });
    const by = {
      newest: (a, b) => new Date(dateOf(b)) - new Date(dateOf(a)),
      oldest: (a, b) => new Date(dateOf(a)) - new Date(dateOf(b)),
      amount: (a, b) => num(b.amount) - num(a.amount),
    }[sort];
    return [...list].sort(by);
  }, [expenses, search, selectedType, period, sort]);

  // Spending by type (for the filtered list)
  const breakdown = useMemo(() => {
    const map = new Map();
    visible.forEach((e) => { const n = typeOf(e).name || 'គ្មានប្រភេទ'; map.set(n, (map.get(n) || 0) + num(e.amount)); });
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((s, x) => s + x[1], 0);
    if (rest > 0) top.push(['Others', rest]);
    const total = top.reduce((s, x) => s + x[1], 0);
    return { items: top.map(([name, amount], i) => ({ name, amount, pct: total ? (amount / total) * 100 : 0, color: COLORS[i % COLORS.length] })), total };
  }, [visible]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const exportCsv = () => {
    const lines = [['Reference', 'Title', 'Type', 'Date', 'Payment', 'Recorded by', 'Amount'], ...visible.map((e) => [refOf(e), titleOf(e), typeOf(e).name || '', dateOf(e) || '', e.payment_method || '', e.user?.name || '', num(e.amount)])];
    const csv = '\uFEFF' + lines.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <style>{css}</style>
      <div className="ex">
        <div className="ex-top">
          <div>
            <h2>💸 បញ្ជីការចំណាយ</h2>
            <p>គ្រប់គ្រងរាល់ការចំណាយប្រចាំថ្ងៃ និងប្រភេទនៃការចំណាយក្នុងអាជីវកម្ម</p>
          </div>
          <div className="ex-actions">
            <button className="ex-btn primary" onClick={() => setIsCreateOpen(true)}><Plus size={16} /> កត់ត្រាចំណាយថ្មី</button>
            <button className="ex-btn" onClick={() => setIsCreateTypeOpen(true)}><FolderPlus size={16} /> ប្រភេទថ្មី</button>
            <button className="ex-btn" onClick={() => navigate('/expense-types')}><FolderKanban size={16} /> គ្រប់គ្រងប្រភេទ</button>
            <button className="ex-btn icon" onClick={exportCsv} disabled={visible.length === 0} aria-label="Export CSV" title="Export CSV"><Download size={16} /></button>
            <button className="ex-btn icon" onClick={fetchData} disabled={loading} aria-label="Refresh" title="Refresh"><RefreshCw size={16} className={loading ? 'ex-spin' : ''} /></button>
          </div>
        </div>

        {errorMsg && <div className="ex-err" role="alert"><span>{errorMsg}</span><button onClick={fetchData}>Try again</button></div>}

        <div className="ex-tiles">
          <Tile label="ទឹកប្រាក់ចំណាយសរុប" target={stats.total} prefix="$" decimals={2} icon={DollarSign} tone="t-dark" hero delay={0} />
          <Tile label="ចំណាយខែនេះ" target={stats.month} prefix="$" decimals={2} icon={CalendarDays} tone="t-amber" delay={70} />
          <Tile label="ចំនួនប្រតិបត្តិការ" target={stats.count} icon={Wallet} tone="t-blue" delay={140} />
          <Tile label="ប្រភេទការចំណាយ" target={stats.types} icon={FolderKanban} tone="t-green" delay={210} />
        </div>

        {!loading && breakdown.total > 0 && (
          <section className="ex-break">
            <div className="ex-break-top"><b>ចំណាយតាមប្រភេទ</b><span>{money(breakdown.total)} សរុប</span></div>
            <div className="ex-bar" role="img" aria-label="Spending by type">
              {breakdown.items.map((it, i) => <i key={it.name} className="ex-part" style={{ width: `${it.pct}%`, background: it.color, animationDelay: `${200 + i * 90}ms` }} title={`${it.name}: ${money(it.amount)}`} />)}
            </div>
            <div className="ex-legend">
              {breakdown.items.map((it) => <span key={it.name}><i style={{ background: it.color }} />{it.name}<b>{money(it.amount)}</b><em>{it.pct.toFixed(0)}%</em></span>)}
            </div>
          </section>
        )}

        <section className="ex-panel">
          <div className="ex-tools">
            <div className="ex-left">
              <div className="ex-search">
                <Search size={16} />
                <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder="ស្វែងរកចំណងជើង, លេខយោង, ការពិពណ៌នា…" aria-label="Search expenses" />
                {search && <button className="ex-x" onClick={() => reset(setSearch)('')} aria-label="Clear search"><X size={15} /></button>}
              </div>
              <div className="ex-seg" role="group" aria-label="Period">
                {PERIODS.map((p) => <button key={p.key} className={`ex-sb${period === p.key ? ' on' : ''}`} aria-pressed={period === p.key} onClick={() => reset(setPeriod)(p.key)}>{p.label}</button>)}
              </div>
            </div>
            <div className="ex-right">
              <select className="ex-select" value={selectedType} onChange={(e) => reset(setSelectedType)(e.target.value)} aria-label="Expense type">
                <option value="all">All types</option>
                {allTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select className="ex-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort expenses">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amount">Amount: high to low</option>
              </select>
            </div>
          </div>

          <div className="ex-head">
            <span>Expense</span><span className="ex-hide-m">Type</span><span className="ex-hide-m ex-hide-md">Paid by</span><span style={{ textAlign: 'right' }}>Amount</span><span />
          </div>

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="ex-skel" key={i}><i style={{ width: 40, height: 40, borderRadius: 12 }} /><i style={{ width: '30%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="ex-empty">
              <b>{expenses.length === 0 ? 'រកមិនឃើញទិន្នន័យការចំណាយទេ' : 'រកមិនឃើញលទ្ធផល'}</b>
              {expenses.length > 0 && 'Try a different search, type or period.'}
            </div>
          ) : (
            <div key={`${selectedType}-${period}-${sort}-${current}`}>
              {rows.map((e, i) => (
                <div className="ex-row" key={e.id ?? i} style={{ '--i': i }}>
                  <div className="ex-who" onClick={() => setViewingExpense(e)}>
                    <span className="ex-ico"><Wallet size={18} /></span>
                    <div style={{ minWidth: 0 }}><b>{titleOf(e)}</b><span className="ex-sub">{refOf(e)} · {fmtDate(dateOf(e))}</span></div>
                  </div>
                  <div className="ex-hide-m"><span className="ex-tag">{typeOf(e).name || 'គ្មានប្រភេទ'}</span></div>
                  <div className="ex-hide-m ex-hide-md"><span className="ex-pay">{e.payment_method || 'cash'}</span><span className="ex-sub">{e.user?.name || 'Admin'}</span></div>
                  <span className="ex-amt">-{money(e.amount)}</span>
                  <Actions onView={() => setViewingExpense(e)} onEdit={() => setEditingExpense(e)} onDelete={() => askDelete(e)} />
                </div>
              ))}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="ex-foot">
              <span>Showing {start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} of {visible.length}</span>
              <div className="ex-pager">
                <button className="ex-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="ex-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateExpenseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchData} existingTypes={allTypes} />
      <CreateExpenseTypeModal isOpen={isCreateTypeOpen} onClose={() => setIsCreateTypeOpen(false)} onSuccess={fetchData} />
      <ViewExpenseModal isOpen={Boolean(viewingExpense)} expense={viewingExpense} onClose={() => setViewingExpense(null)} onEdit={(x) => setEditingExpense(x)} onDelete={askDelete} />
      <EditExpenseModal isOpen={Boolean(editingExpense)} expense={editingExpense} onClose={() => setEditingExpense(null)} onSuccess={fetchData} existingTypes={allTypes} />
      <ConfirmDeleteModal
        isOpen={Boolean(deletingExpense)}
        title="បញ្ជាក់ការលុបការចំណាយ"
        message={<>តើអ្នកពិតជាចង់លុបកំណត់ត្រាចំណាយ <b>“{deletingExpense ? titleOf(deletingExpense) : ''}”</b> នេះមែនទេ? ការលុបមិនអាចត្រឡប់វិញបានទេ។</>}
        busy={isDeleting}
        error={deleteError}
        onCancel={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
}