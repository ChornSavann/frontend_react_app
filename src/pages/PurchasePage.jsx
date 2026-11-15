// src/pages/PurchasePage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Receipt, DollarSign, Boxes, Clock, Search, Download, RefreshCw, Plus, Eye, Pencil, ChevronLeft, ChevronRight, X, CheckCircle2, XCircle, Package } from 'lucide-react';
import { listPurchases } from '../services/purchaseService';
import Layout from '../components/Layout';
import ViewPurchaseModal from './purchases/ViewPurchaseModal';
import CreatePurchaseModal from './purchases/CreatePurchaseModal';
import EditPurchaseModal from './purchases/EditPurchaseModal';

const PAGE_SIZE = 10;

const css = `
.pc { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.pc *, .pc *::before, .pc *::after { box-sizing: border-box; }
.pc h2 { margin: 0; color: var(--ink); font-family: inherit; }

.pc-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.pc-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.pc-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.pc-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.pc-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.pc-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.pc-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.pc-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.pc-btn:disabled { opacity: .6; cursor: not-allowed; }
.pc button:focus-visible, .pc select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.pc-spin { animation: pc-rot .8s linear infinite; }

.pc-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.pc-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

/* tiles */
.pc-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.pc-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: pc-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.pc-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.pc-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-blue { background: #e3eeff; color: #2563eb; } .t-violet { background: #eee8ff; color: #7c3aed; } .t-amber { background: #fff1d6; color: #d97706; }
.pc-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.pc-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.pc-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.pc-tile.hero span { color: #9db8b4; }
.pc-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

/* panel */
.pc-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: pc-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.pc-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.pc-left, .pc-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pc-search { position: relative; display: flex; align-items: center; width: 280px; max-width: 100%; }
.pc-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.pc-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.pc-search input::placeholder { color: #8aa3a0; }
.pc-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.pc-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.pc-x:hover { background: #e3ecea; color: var(--ink); }
.pc-chips { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; flex-wrap: wrap; }
.pc-chip { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 11px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.pc-chip:hover { color: var(--ink); }
.pc-chip.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.pc-chip em { font-style: normal; font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 99px; background: #e3ecea; color: var(--muted); }
.pc-chip.on em { background: var(--teal); color: #fff; }
.pc-select { height: 38px; max-width: 180px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.pc-select:hover { background-color: #e9f1ef; }

/* list */
.pc-head, .pc-row { display: grid; grid-template-columns: minmax(0,1.35fr) minmax(0,1.5fr) minmax(0,1.6fr) minmax(0,1fr) minmax(0,.9fr) 84px; gap: 14px; align-items: center; padding: 0 18px; }
.pc-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.pc-row { min-height: 68px; border-bottom: 1px solid var(--line); transition: background .12s; animation: pc-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.pc-row:last-child { border-bottom: 0; }
.pc-row:hover { background: #f6fbf9; }
.pc-num { all: unset; cursor: pointer; display: block; font-weight: 800; font-size: 13.5px; color: var(--teal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.pc-num:hover { text-decoration: underline; }
.pc-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-who { display: flex; align-items: center; gap: 11px; min-width: 0; }
.pc-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-av { position: relative; width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 15px; overflow: hidden; }
.pc-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #fff; }
.pc-total b { display: block; font-weight: 800; font-size: 14.5px; color: var(--teal); font-variant-numeric: tabular-nums; }
.pc-pay { display: inline-block; margin-top: 3px; padding: 1px 8px; border-radius: 7px; background: #eef4f2; color: #35504c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; }

.pc-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; width: fit-content; background: #eef2f1; color: #5f7773; }
.pc-badge.completed { background: #e7f8ee; color: #15803d; } .pc-badge.pending { background: #fff4e0; color: #b45309; } .pc-badge.cancelled { background: #fdecea; color: #c0392b; }

.pc-acts { display: flex; gap: 6px; justify-content: flex-end; }
.pc-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.pc-ib:hover { transform: translateY(-1px); }
.pc-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.pc-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }

.pc-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.pc-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.pc-skel { height: 68px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.pc-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: pc-shine 1.3s linear infinite; }

.pc-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.pc-pager { display: flex; align-items: center; gap: 6px; }
.pc-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.pc-pg:hover:not(:disabled) { background: #eef5f3; }
.pc-pg:disabled { opacity: .4; cursor: not-allowed; }
.pc-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes pc-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes pc-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes pc-shine { to { background-position: -200% 0; } }
@keyframes pc-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .pc-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 1000px) {
  .pc-head, .pc-row { grid-template-columns: minmax(0,1.3fr) minmax(0,1.5fr) minmax(0,1fr) minmax(0,.9fr) 84px; }
  .pc-hide-md { display: none; }
}
@media (max-width: 720px) {
  .pc { padding: 14px; } .pc-tiles { grid-template-columns: 1fr; }
  .pc-head, .pc-hide-m { display: none; }
  .pc-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; }
  .pc-total { grid-column: 2; grid-row: 1; text-align: right; } .pc-badge { grid-column: 2; grid-row: 2; justify-self: end; } .pc-acts { grid-column: 1 / -1; }
  .pc-search, .pc-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .pc-tile, .pc-panel, .pc-row, .pc-skel i, .pc-spin { animation: none !important; } .pc-tile { transition: none; } }
`;

const TONES = [['#e0f4f1', '#0f766e'], ['#e3eeff', '#2563eb'], ['#eee8ff', '#7c3aed'], ['#fff1d6', '#d97706'], ['#fdecea', '#c0392b'], ['#ecf6d8', '#4d7c0f']];
const toneFor = (s = '') => TONES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
const num = (v) => parseFloat(v || 0) || 0;
const money = (n) => `$${num(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const statusOf = (p) => String(p.status || '').toLowerCase();
const qtyOf = (p) => (Array.isArray(p.items) ? p.items : []).reduce((a, it) => a + Number(it.quantity || 0), 0);

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    <div className={`pc-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`pc-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{prefix}{shown}</b></div>
    </div>
  );
}

function Avatar({ name, image }) {
  const [bg, fg] = toneFor(name);
  return (
    <span className="pc-av" style={{ background: bg, color: fg }}>
      {String(name || '?').trim().charAt(0).toUpperCase()}
      {image && <img src={image} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
    </span>
  );
}

function StatusBadge({ status }) {
  const Icon = status === 'completed' ? CheckCircle2 : status === 'pending' ? Clock : XCircle;
  return <span className={`pc-badge ${status}`}><Icon size={13} /> {status ? status.charAt(0).toUpperCase() + status.slice(1) : '-'}</span>;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function PurchasePage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Modal states (Create, View, Edit)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await listPurchases();
      // ទាញយក Array ពី res.data តាមទម្រង់ JSON របស់ Laravel API
      const data = res?.data || (Array.isArray(res) ? res : []);
      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setErrorMsg(error.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យការទិញចូល');
    } finally {
      setLoading(false);
    }
  };

  // Suppliers ដែលមានស្រាប់ ទុកជា Fallback សម្រាប់ Create/Edit Modal
  const existingSuppliers = useMemo(() => {
    const map = new Map();
    purchases.forEach((p) => { if (p.supplier?.id) map.set(p.supplier.id, p.supplier); });
    return Array.from(map.values());
  }, [purchases]);

  const stats = useMemo(() => {
    const counts = { all: purchases.length, completed: 0, pending: 0, cancelled: 0 };
    let spent = 0, units = 0;
    purchases.forEach((p) => {
      const st = statusOf(p);
      if (counts[st] !== undefined) counts[st] += 1;
      if (st !== 'cancelled') { spent += num(p.total); units += qtyOf(p); }
    });
    return { counts, spent, units };
  }, [purchases]);

  const payments = useMemo(() => [...new Set(purchases.map((p) => String(p.payment_method || '').toLowerCase()).filter(Boolean))], [purchases]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = purchases.filter((p) => {
      const matchSearch = !q
        || p.purchase_number?.toLowerCase().includes(q)
        || p.supplier?.name?.toLowerCase().includes(q)
        || p.supplier?.company?.toLowerCase().includes(q)
        || p.user?.name?.toLowerCase().includes(q)
        || p.items?.some((it) => it.product_name?.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'all' || statusOf(p) === statusFilter;
      const matchPay = payFilter === 'all' || String(p.payment_method || '').toLowerCase() === payFilter;
      return matchSearch && matchStatus && matchPay;
    });
    const by = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      total: (a, b) => num(b.total) - num(a.total),
    }[sort];
    return [...list].sort(by);
  }, [purchases, search, statusFilter, payFilter, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const exportCsv = () => {
    const lines = [
      ['Purchase #', 'Date', 'Supplier', 'Items', 'Units', 'Payment', 'Status', 'Total'],
      ...visible.map((p) => [p.purchase_number, p.created_at, p.supplier?.company || p.supplier?.name || '', (p.items || []).map((it) => it.product_name).join('; '), qtyOf(p), p.payment_method || '', p.status || '', num(p.total)]),
    ];
    const csv = '\uFEFF' + lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchases.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <style>{css}</style>
      <div className="pc">
        <div className="pc-top">
          <div>
            <h2>🛒 បញ្ជីការទិញទំនិញចូលស្តុក</h2>
            <p>គ្រប់គ្រងវិក្កយបត្របញ្ជាទិញពីអ្នកផ្គត់ផ្គង់ និងការបន្ថែមចូលស្តុក</p>
          </div>
          <div className="pc-actions">
            <button className="pc-btn primary" onClick={() => setIsCreateOpen(true)}><Plus size={16} /> បង្កើតការទិញចូលថ្មី</button>
            <button className="pc-btn" onClick={exportCsv} disabled={visible.length === 0}><Download size={16} /> Export CSV</button>
            <button className="pc-btn" onClick={fetchPurchases} disabled={loading}><RefreshCw size={16} className={loading ? 'pc-spin' : ''} /> ផ្ទុកឡើងវិញ</button>
          </div>
        </div>

        {errorMsg && (
          <div className="pc-err" role="alert"><span>{errorMsg}</span><button onClick={fetchPurchases}>Try again</button></div>
        )}

        <div className="pc-tiles">
          <Tile label="ទឹកប្រាក់ទិញចូលសរុប" target={stats.spent} prefix="$" decimals={2} icon={DollarSign} tone="t-dark" hero delay={0} />
          <Tile label="វិក្កយបត្រសរុប" target={stats.counts.all} icon={Receipt} tone="t-blue" delay={70} />
          <Tile label="បរិមាណទិញចូល (ឯកតា)" target={stats.units} icon={Boxes} tone="t-violet" delay={140} />
          <Tile label="កំពុងរង់ចាំ (Pending)" target={stats.counts.pending} icon={Clock} tone="t-amber" delay={210} />
        </div>

        <section className="pc-panel">
          <div className="pc-tools">
            <div className="pc-left">
              <div className="pc-search">
                <Search size={16} />
                <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder="ស្វែងរកលេខវិក្កយបត្រ, អ្នកផ្គត់ផ្គង់, ទំនិញ…" aria-label="Search purchases" />
                {search && <button className="pc-x" onClick={() => reset(setSearch)('')} aria-label="Clear search"><X size={15} /></button>}
              </div>
              <div className="pc-chips" role="tablist" aria-label="Filter by status">
                {FILTERS.map((f) => (
                  <button key={f.key} role="tab" aria-selected={statusFilter === f.key} className={`pc-chip${statusFilter === f.key ? ' on' : ''}`} onClick={() => reset(setStatusFilter)(f.key)}>
                    {f.label}<em>{stats.counts[f.key]}</em>
                  </button>
                ))}
              </div>
            </div>
            <div className="pc-right">
              {payments.length > 0 && (
                <select className="pc-select" value={payFilter} onChange={(e) => reset(setPayFilter)(e.target.value)} aria-label="Payment method">
                  <option value="all">All payments</option>
                  {payments.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                </select>
              )}
              <select className="pc-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort purchases">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="total">Total: high to low</option>
              </select>
            </div>
          </div>

          <div className="pc-head">
            <span>Invoice</span><span>Supplier</span><span className="pc-hide-m pc-hide-md">Items</span><span>Total</span><span>Status</span><span />
          </div>

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="pc-skel" key={i}><i style={{ width: 38, height: 38, borderRadius: 11 }} /><i style={{ width: '30%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="pc-empty">
              <b>{purchases.length === 0 ? 'រកមិនឃើញទិន្នន័យការទិញទំនិញចូលទេ' : 'រកមិនឃើញលទ្ធផល'}</b>
              {purchases.length > 0 && 'Try a different search, status or payment filter.'}
            </div>
          ) : (
            <div key={`${statusFilter}-${payFilter}-${sort}-${current}`}>
              {rows.map((p, i) => {
                const items = Array.isArray(p.items) ? p.items : [];
                const names = items.map((it) => it.product_name).filter(Boolean).join(', ');
                const supplierName = p.supplier?.company || p.supplier?.name || '-';
                const contact = [p.supplier?.contact_name || p.supplier?.name, p.supplier?.phone].filter(Boolean).join(' • ');
                const firstImg = items[0]?.product?.image_url;
                return (
                  <div className="pc-row" key={p.id ?? i} style={{ '--i': i }}>
                    <div style={{ minWidth: 0 }}>
                      <button className="pc-num" onClick={() => setViewingPurchase(p)}>{p.purchase_number}</button>
                      <span className="pc-sub">{formatDate(p.created_at)}{p.user?.name ? ` · ${p.user.name}` : ''}</span>
                    </div>
                    <div className="pc-who">
                      <Avatar name={supplierName} />
                      <div style={{ minWidth: 0 }}><b>{supplierName}</b><span className="pc-sub">{contact}</span></div>
                    </div>
                    <div className="pc-who pc-hide-m pc-hide-md">
                      {firstImg ? <Avatar name={items[0]?.product_name} image={firstImg} /> : <span className="pc-av" style={{ background: '#eef4f2', color: '#6a8280' }}><Package size={17} /></span>}
                      <div style={{ minWidth: 0 }}><b>{names || '-'}</b><span className="pc-sub">{items.length} items · {qtyOf(p)} units</span></div>
                    </div>
                    <div className="pc-total"><b>{money(p.total)}</b>{p.payment_method && <span className="pc-pay">{p.payment_method}</span>}</div>
                    <StatusBadge status={statusOf(p)} />
                    <div className="pc-acts">
                      <button className="pc-ib v" onClick={() => setViewingPurchase(p)} aria-label="View purchase" title="មើល"><Eye size={15} /></button>
                      <button className="pc-ib e" onClick={() => setEditingPurchase(p)} aria-label="Edit purchase" title="កែប្រែ"><Pencil size={15} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="pc-foot">
              <span>Showing {start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} of {visible.length}</span>
              <div className="pc-pager">
                <button className="pc-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="pc-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreatePurchaseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchPurchases} existingSuppliers={existingSuppliers} />
      <ViewPurchaseModal isOpen={Boolean(viewingPurchase)} purchase={viewingPurchase} onClose={() => setViewingPurchase(null)} onEdit={(pur) => setEditingPurchase(pur)} />
      <EditPurchaseModal isOpen={Boolean(editingPurchase)} purchase={editingPurchase} onClose={() => setEditingPurchase(null)} onSuccess={fetchPurchases} existingSuppliers={existingSuppliers} />
    </Layout>
  );
}