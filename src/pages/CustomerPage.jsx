// src/pages/CustomerPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Users, CheckCircle2, XCircle, Award, UserPlus, Search, Download, RefreshCw, Plus, Eye, Pencil, ChevronLeft, ChevronRight, X, Phone, Mail, MapPin } from 'lucide-react';
import { listCustomers } from '../services/customerService';
import Layout from '../components/Layout';
import CreateCustomerModal from './customers/CreateCustomerModal';
import EditCustomerModal from './customers/EditCustomerModal';
import ViewCustomerModal from './customers/ViewCustomerModal';

const PAGE_SIZE = 10;

const css = `
.cu { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.cu *, .cu *::before, .cu *::after { box-sizing: border-box; }
.cu h2 { margin: 0; color: var(--ink); font-family: inherit; }

.cu-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.cu-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.cu-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.cu-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.cu-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.cu-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.cu-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.cu-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.cu-btn:disabled { opacity: .6; cursor: not-allowed; }
.cu button:focus-visible, .cu select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.cu-spin { animation: cu-rot .8s linear infinite; }

.cu-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.cu-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

.cu-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.cu-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: cu-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.cu-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.cu-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-green { background: #e7f8ee; color: #15803d; } .t-amber { background: #fff1d6; color: #d97706; } .t-blue { background: #e3eeff; color: #2563eb; }
.cu-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.cu-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.cu-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.cu-tile.hero span { color: #9db8b4; }
.cu-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

.cu-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: cu-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.cu-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.cu-left, .cu-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cu-search { position: relative; display: flex; align-items: center; width: 290px; max-width: 100%; }
.cu-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.cu-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.cu-search input::placeholder { color: #8aa3a0; }
.cu-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.cu-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.cu-x:hover { background: #e3ecea; color: var(--ink); }
.cu-chips { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; flex-wrap: wrap; }
.cu-chip { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 11px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.cu-chip:hover { color: var(--ink); }
.cu-chip.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.cu-chip em { font-style: normal; font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 99px; background: #e3ecea; color: var(--muted); }
.cu-chip.on em { background: var(--teal); color: #fff; }
.cu-select { height: 38px; max-width: 190px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.cu-select:hover { background-color: #e9f1ef; }

.cu-head, .cu-row { display: grid; grid-template-columns: minmax(0,1.7fr) minmax(0,1.6fr) minmax(0,1.3fr) minmax(0,.8fr) minmax(0,.8fr) 84px; gap: 14px; align-items: center; padding: 0 18px; }
.cu-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.cu-row { min-height: 66px; border-bottom: 1px solid var(--line); transition: background .12s; animation: cu-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.cu-row:last-child { border-bottom: 0; }
.cu-row:hover { background: #f6fbf9; }
.cu-who { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
.cu-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cu-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cu-av { position: relative; width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 15px; overflow: hidden; transition: transform .2s; }
.cu-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #fff; }
.cu-row:hover .cu-av { transform: scale(1.07); }
.cu-line { display: flex; align-items: center; gap: 7px; min-width: 0; font-size: 12.5px; color: #4d6561; }
.cu-line svg { flex-shrink: 0; color: #8aa3a0; }
.cu-line span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cu-line.main { color: var(--teal); font-weight: 700; font-size: 13px; } .cu-line.main svg { color: var(--teal); }
.cu-line + .cu-line { margin-top: 3px; }
.cu-pts { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; background: #fff1d6; color: #b45309; font-variant-numeric: tabular-nums; width: fit-content; }
.cu-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; width: fit-content; }
.cu-badge.on { background: #e7f8ee; color: #15803d; } .cu-badge.off { background: #eef2f1; color: #5f7773; }

.cu-acts { display: flex; gap: 6px; justify-content: flex-end; }
.cu-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.cu-ib:hover { transform: translateY(-1px); }
.cu-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.cu-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }

.cu-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.cu-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.cu-skel { height: 66px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.cu-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: cu-shine 1.3s linear infinite; }

.cu-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.cu-pager { display: flex; align-items: center; gap: 6px; }
.cu-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.cu-pg:hover:not(:disabled) { background: #eef5f3; }
.cu-pg:disabled { opacity: .4; cursor: not-allowed; }
.cu-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes cu-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes cu-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes cu-shine { to { background-position: -200% 0; } }
@keyframes cu-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .cu-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 1000px) {
  .cu-head, .cu-row { grid-template-columns: minmax(0,1.7fr) minmax(0,1.6fr) minmax(0,.8fr) minmax(0,.8fr) 84px; }
  .cu-hide-md { display: none; }
}
@media (max-width: 720px) {
  .cu { padding: 14px; } .cu-tiles { grid-template-columns: 1fr; }
  .cu-head, .cu-hide-m { display: none; }
  .cu-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; }
  .cu-pts { grid-column: 2; grid-row: 1; } .cu-badge { grid-column: 2; grid-row: 2; justify-self: end; } .cu-contact { grid-column: 1; grid-row: 2; } .cu-acts { grid-column: 1 / -1; }
  .cu-search, .cu-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .cu-tile, .cu-panel, .cu-row, .cu-skel i, .cu-spin { animation: none !important; } .cu-tile, .cu-av { transition: none; } }
`;

const TONES = [['#e0f4f1', '#0f766e'], ['#e3eeff', '#2563eb'], ['#eee8ff', '#7c3aed'], ['#fff1d6', '#d97706'], ['#fdecea', '#c0392b'], ['#ecf6d8', '#4d7c0f']];
const toneFor = (s = '') => TONES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
const isActive = (c) => Number(c.is_active ?? 1) === 1;
const pointsOf = (c) => Number(c.points || 0);

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
    <div className={`cu-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`cu-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{shown}</b></div>
    </div>
  );
}

function Avatar({ c }) {
  const [bg, fg] = toneFor(c.name);
  return (
    <span className="cu-av" style={{ background: bg, color: fg }}>
      {String(c.name || 'C').trim().charAt(0).toUpperCase()}
      {c.image_url && <img src={c.image_url} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
    </span>
  );
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Modal states (Create, View, Edit)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await listCustomers();
      const items = res?.data || res?.customers || (Array.isArray(res) ? res : []);
      setCustomers(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setErrorMsg(error.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យអតិថិជន');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    let active = 0, points = 0, fresh = 0;
    customers.forEach((c) => {
      if (isActive(c)) active += 1;
      points += pointsOf(c);
      const d = new Date(c.created_at);
      if (!Number.isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) fresh += 1;
    });
    return { counts: { all: customers.length, active, inactive: customers.length - active }, points, fresh };
  }, [customers]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = customers.filter((c) => {
      const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' && isActive(c)) || (statusFilter === 'inactive' && !isActive(c));
      return matchSearch && matchStatus;
    });
    const by = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
      points: (a, b) => pointsOf(b) - pointsOf(a),
    }[sort];
    return [...list].sort(by);
  }, [customers, search, statusFilter, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  const exportCsv = () => {
    const lines = [['ID', 'Name', 'Phone', 'Email', 'Address', 'Points', 'Joined', 'Status'], ...visible.map((c) => [c.id, c.name, c.phone || '', c.email || '', c.address || '', pointsOf(c), c.created_at || '', isActive(c) ? 'Active' : 'Inactive'])];
    const csv = '\uFEFF' + lines.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <style>{css}</style>
      <div className="cu">
        <div className="cu-top">
          <div>
            <h2>👥 បញ្ជីអតិថិជន</h2>
            <p>គ្រប់គ្រងព័ត៌មានអតិថិជន លេខទូរស័ព្ទ អាសយដ្ឋាន និងពិន្ទុសន្សំ</p>
          </div>
          <div className="cu-actions">
            <button className="cu-btn primary" onClick={() => setIsCreateOpen(true)}><Plus size={16} /> បន្ថែមអតិថិជនថ្មី</button>
            <button className="cu-btn" onClick={exportCsv} disabled={visible.length === 0}><Download size={16} /> Export CSV</button>
            <button className="cu-btn" onClick={fetchCustomers} disabled={loading}><RefreshCw size={16} className={loading ? 'cu-spin' : ''} /> ផ្ទុកឡើងវិញ</button>
          </div>
        </div>

        {errorMsg && <div className="cu-err" role="alert"><span>{errorMsg}</span><button onClick={fetchCustomers}>Try again</button></div>}

        <div className="cu-tiles">
          <Tile label="អតិថិជនសរុប" target={stats.counts.all} icon={Users} tone="t-dark" hero delay={0} />
          <Tile label="កំពុងដំណើរការ (Active)" target={stats.counts.active} icon={CheckCircle2} tone="t-green" delay={70} />
          <Tile label="ពិន្ទុសន្សំសរុប" target={stats.points} icon={Award} tone="t-amber" delay={140} />
          <Tile label="ចុះឈ្មោះខែនេះ" target={stats.fresh} icon={UserPlus} tone="t-blue" delay={210} />
        </div>

        <section className="cu-panel">
          <div className="cu-tools">
            <div className="cu-left">
              <div className="cu-search">
                <Search size={16} />
                <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder="ស្វែងរកឈ្មោះ, ទូរស័ព្ទ, អ៊ីមែល, អាសយដ្ឋាន…" aria-label="Search customers" />
                {search && <button className="cu-x" onClick={() => reset(setSearch)('')} aria-label="Clear search"><X size={15} /></button>}
              </div>
              <div className="cu-chips" role="tablist" aria-label="Filter by status">
                {FILTERS.map((f) => (
                  <button key={f.key} role="tab" aria-selected={statusFilter === f.key} className={`cu-chip${statusFilter === f.key ? ' on' : ''}`} onClick={() => reset(setStatusFilter)(f.key)}>
                    {f.label}<em>{stats.counts[f.key]}</em>
                  </button>
                ))}
              </div>
            </div>
            <div className="cu-right">
              <select className="cu-select" value={sort} onChange={(e) => reset(setSort)(e.target.value)} aria-label="Sort customers">
                <option value="newest">Newest first</option>
                <option value="name">Name A–Z</option>
                <option value="points">Points: high to low</option>
              </select>
            </div>
          </div>

          <div className="cu-head">
            <span>Customer</span><span className="cu-hide-m">Contact</span><span className="cu-hide-m cu-hide-md">Address</span><span>Points</span><span>Status</span><span />
          </div>

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="cu-skel" key={i}><i style={{ width: 40, height: 40, borderRadius: '50%' }} /><i style={{ width: '28%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="cu-empty">
              <b>{customers.length === 0 ? 'រកមិនឃើញទិន្នន័យអតិថិជនទេ' : 'រកមិនឃើញលទ្ធផល'}</b>
              {customers.length > 0 && 'Try a different name, phone number or status.'}
            </div>
          ) : (
            <div key={`${statusFilter}-${sort}-${current}`}>
              {rows.map((c, i) => (
                <div className="cu-row" key={c.id ?? i} style={{ '--i': i }}>
                  <div className="cu-who" onClick={() => setViewingCustomer(c)}>
                    <Avatar c={c} />
                    <div style={{ minWidth: 0 }}><b>{c.name}</b><span className="cu-sub">ID #{c.id} · Joined {formatDate(c.created_at)}</span></div>
                  </div>
                  <div className="cu-contact cu-hide-m">
                    <div className="cu-line main"><Phone size={13} /><span>{c.phone || '-'}</span></div>
                    {c.email && <div className="cu-line"><Mail size={13} /><span>{c.email}</span></div>}
                  </div>
                  <div className="cu-hide-m cu-hide-md">
                    {c.address ? <div className="cu-line"><MapPin size={13} /><span>{c.address}</span></div> : <span className="cu-sub">-</span>}
                  </div>
                  <span className="cu-pts"><Award size={13} />{pointsOf(c).toLocaleString('en-US')} pts</span>
                  {isActive(c)
                    ? <span className="cu-badge on"><CheckCircle2 size={13} /> Active</span>
                    : <span className="cu-badge off"><XCircle size={13} /> Inactive</span>}
                  <div className="cu-acts">
                    <button className="cu-ib v" onClick={() => setViewingCustomer(c)} aria-label="View customer" title="មើល"><Eye size={15} /></button>
                    <button className="cu-ib e" onClick={() => setEditingCustomer(c)} aria-label="Edit customer" title="កែប្រែ"><Pencil size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="cu-foot">
              <span>Showing {start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} of {visible.length}</span>
              <div className="cu-pager">
                <button className="cu-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="cu-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      <CreateCustomerModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchCustomers} />
      <ViewCustomerModal isOpen={Boolean(viewingCustomer)} customer={viewingCustomer} onClose={() => setViewingCustomer(null)} onEdit={(cust) => setEditingCustomer(cust)} />
      <EditCustomerModal isOpen={Boolean(editingCustomer)} customer={editingCustomer} onClose={() => setEditingCustomer(null)} onSuccess={fetchCustomers} />
    </Layout>
  );
}