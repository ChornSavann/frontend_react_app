// src/pages/SalesHistoryPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Receipt, CheckCircle2, DollarSign, Search, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

const PAGE_SIZE = 10;

const css = `
.sh { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.sh *, .sh *::before, .sh *::after { box-sizing: border-box; }
.sh h2 { margin: 0; color: var(--ink); font-family: inherit; }

.sh-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.sh-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.sh-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.sh-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.sh-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.sh-btn:disabled { opacity: .5; cursor: not-allowed; }
.sh-btn:focus-visible, .sh-chip:focus-visible, .sh-pg:focus-visible, .sh-x:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

/* tiles */
.sh-tiles { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.sh-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: sh-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.sh-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.sh-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-blue { background: #e3eeff; color: #2563eb; } .t-green { background: #e7f8ee; color: #15803d; } .t-dark { background: #c8f169; color: #0c2526; }
.sh-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.sh-tile b { display: block; font-size: 24px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.sh-tile.hero { border-color: transparent; color: #f4faf8;
  background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.sh-tile.hero span { color: #9db8b4; }
.sh-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

/* panel */
.sh-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: sh-up .5s cubic-bezier(.2,.7,.2,1) 200ms backwards; }
.sh-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.sh-search { position: relative; display: flex; align-items: center; width: 280px; max-width: 100%; }
.sh-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.sh-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.sh-search input::placeholder { color: #8aa3a0; }
.sh-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.sh-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.sh-x:hover { background: #e3ecea; color: var(--ink); }

.sh-chips { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; flex-wrap: wrap; }
.sh-chip { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 11px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.sh-chip:hover { color: var(--ink); }
.sh-chip.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.sh-chip em { font-style: normal; font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 99px; background: #e3ecea; color: var(--muted); }
.sh-chip.on em { background: var(--teal); color: #fff; }

/* table */
.sh-head, .sh-row { display: grid; grid-template-columns: minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,.8fr); gap: 14px; align-items: center; padding: 0 18px; }
.sh-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.sh-head .r { text-align: right; }
.sh-row { min-height: 54px; border-bottom: 1px solid var(--line); transition: background .12s; animation: sh-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.sh-row:last-child { border-bottom: 0; }
.sh-row:hover { background: #f6fbf9; }
.sh-ord { display: flex; align-items: center; gap: 11px; min-width: 0; }
.sh-ico { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; background: #e0f4f1; color: var(--teal); transition: transform .2s; }
.sh-row:hover .sh-ico { transform: scale(1.08) rotate(-4deg); }
.sh-ord b { display: block; font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sh-ord small { display: block; font-size: 11.5px; color: var(--muted); margin-top: 1px; }
.sh-date { line-height: 1.35; }
.sh-date small { display: block; font-size: 11.5px; color: var(--muted); }
.sh-total { text-align: right; font-weight: 800; font-size: 14px; color: var(--teal); font-variant-numeric: tabular-nums; }

.sh-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; width: fit-content; background: #eef2f1; color: #55706c; }
.sh-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.sh-badge.completed { background: #e7f8ee; color: #15803d; }
.sh-badge.pending { background: #fff4e0; color: #b45309; }
.sh-badge.cancelled { background: #fdecea; color: #c0392b; }

.sh-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.sh-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.sh-skel { height: 54px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.sh-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: sh-shine 1.3s linear infinite; }

/* footer */
.sh-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.sh-pager { display: flex; align-items: center; gap: 6px; }
.sh-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.sh-pg:hover:not(:disabled) { background: #eef5f3; }
.sh-pg:disabled { opacity: .4; cursor: not-allowed; }
.sh-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes sh-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes sh-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes sh-shine { to { background-position: -200% 0; } }

@media (max-width: 900px) { .sh-tiles { grid-template-columns: 1fr; } }
@media (max-width: 720px) {
  .sh { padding: 14px; }
  .sh-head { display: none; }
  .sh-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 4px 12px; }
  .sh-date { grid-column: 1; grid-row: 2; display: flex; gap: 6px; } .sh-date small { display: inline; }
  .sh-total { grid-column: 2; grid-row: 1; }
  .sh-badge { grid-column: 2; grid-row: 2; justify-self: end; }
  .sh-search { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .sh-tile, .sh-panel, .sh-row, .sh-skel i { animation: none !important; } .sh-tile, .sh-ico { transition: none; } }
`;

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'cancelled', label: 'Cancelled' },
];

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const statusLabel = (s = '') => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const parts = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: value || '-', time: '' };
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
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
    <div className={`sh-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`sh-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{prefix}{shown}</b></div>
    </div>
  );
}

export default function SalesHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      if (response.data && response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status === 'completed');
    return {
      count: orders.length,
      completed: completed.length,
      revenue: completed.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
      counts: {
        all: orders.length,
        completed: completed.length,
        pending: orders.filter((o) => o.status === 'pending').length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
      },
    };
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) => (filter === 'all' || o.status === filter) && (!q || String(o.order_number).toLowerCase().includes(q))
    );
  }, [orders, filter, query]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = visible.slice(start, start + PAGE_SIZE);

  const changeFilter = (k) => { setFilter(k); setPage(1); };
  const changeQuery = (v) => { setQuery(v); setPage(1); };

  const exportCsv = () => {
    const lines = [['Order', 'Date', 'Status', 'Total'], ...visible.map((o) => [o.order_number, o.created_at, o.status, Number(o.total_amount) || 0])];
    const csv = '\uFEFF' + lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <style>{css}</style>
      <div className="sh">
        <div className="sh-top">
          <div>
            <h2>ប្រវត្តិការលក់</h2>
            <p>Every order from your shop, newest first.</p>
          </div>
          <button className="sh-btn" onClick={exportCsv} disabled={visible.length === 0}>
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="sh-tiles">
          <Tile label="Total orders" target={stats.count} icon={Receipt} tone="t-dark" hero delay={0} />
          <Tile label="Completed" target={stats.completed} icon={CheckCircle2} tone="t-green" delay={70} />
          <Tile label="Revenue (completed)" target={stats.revenue} prefix="$" decimals={2} icon={DollarSign} tone="t-blue" delay={140} />
        </div>

        <section className="sh-panel">
          <div className="sh-tools">
            <div className="sh-search">
              <Search size={16} />
              <input value={query} onChange={(e) => changeQuery(e.target.value)} placeholder="Search order number…" aria-label="Search orders" />
              {query && <button className="sh-x" onClick={() => changeQuery('')} aria-label="Clear search"><X size={15} /></button>}
            </div>
            <div className="sh-chips" role="tablist" aria-label="Filter by status">
              {FILTERS.map((f) => (
                <button key={f.key} role="tab" aria-selected={filter === f.key} className={`sh-chip${filter === f.key ? ' on' : ''}`} onClick={() => changeFilter(f.key)}>
                  {f.label}<em>{stats.counts[f.key]}</em>
                </button>
              ))}
            </div>
          </div>

          <div className="sh-head">
            <span>Order</span><span>Date</span><span>Status</span><span className="r">Total</span>
          </div>

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => <div className="sh-skel" key={i}><i style={{ width: '32%' }} /><i style={{ width: '18%' }} /></div>)
          ) : rows.length === 0 ? (
            <div className="sh-empty">
              <b>{orders.length === 0 ? 'គ្មានទិន្នន័យប្រវត្តិការលក់ទេ' : 'រកមិនឃើញលទ្ធផល'}</b>
              {orders.length > 0 && 'Try a different order number or status.'}
            </div>
          ) : (
            <div key={`${filter}-${current}`}>
              {rows.map((o, i) => {
                const d = parts(o.created_at);
                return (
                  <div className="sh-row" key={o.id} style={{ '--i': i }}>
                    <div className="sh-ord">
                      <span className="sh-ico"><Receipt size={16} strokeWidth={2} /></span>
                      <div><b>{o.order_number}</b></div>
                    </div>
                    <div className="sh-date">{d.date}<small>{d.time}</small></div>
                    <span className={`sh-badge ${o.status}`}>{statusLabel(o.status)}</span>
                    <span className="sh-total">{money(o.total_amount)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="sh-foot">
              <span>Showing {start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} of {visible.length}</span>
              <div className="sh-pager">
                <button className="sh-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>{current} / {pages}</span>
                <button className="sh-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}