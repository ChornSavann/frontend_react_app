// src/pages/RolePermissionPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, Lock, Gauge, ShieldOff, Search, RefreshCw, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';
import { listRoles, deleteRole, listPermissions } from '../services/rolePermissionService';
import Layout from '../components/Layout';
import CreateRoleModal from './roles/CreateRoleModal';
import EditRoleModal from './roles/EditRoleModal';
import ViewRoleModal from './roles/ViewRoleModal';
import PermissionListModal from './roles/PermissionListModal';
import ConfirmDeleteModal from './brands/ConfirmDeleteModal';
import ToastrContainer, { toastr } from '../components/Toastr';
import { useTranslation } from '../utils/translations';

const css = `
.ro { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e;
  padding: 24px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 13px; }
.ro *, .ro *::before, .ro *::after { box-sizing: border-box; }
.ro h2 { margin: 0; color: var(--ink); font-family: inherit; }

.ro-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
.ro-top h2 { font-size: 22px; font-weight: 800; letter-spacing: -.5px; }
.ro-top p { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
.ro-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.ro-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px;
  font-size: 13px; font-weight: 700; color: var(--ink); background: #fff; border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s; }
.ro-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(12,37,38,.08); border-color: #cfe0dd; }
.ro-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.ro-btn.primary:hover:not(:disabled) { box-shadow: 0 9px 22px rgba(15,118,110,.36); border-color: transparent; }
.ro-btn:disabled { opacity: .6; cursor: not-allowed; }
.ro button:focus-visible, .ro select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.ro-spin { animation: ro-rot .8s linear infinite; }

.ro-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; }
.ro-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

.ro-tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 14px; }
.ro-tile { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(12,37,38,.03); transition: transform .22s, box-shadow .22s, border-color .22s; animation: ro-up .5s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.ro-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(12,37,38,.09); border-color: #d3e2df; }
.ro-chip-i { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; } .t-green { background: #e7f8ee; color: #15803d; } .t-amber { background: #fff1d6; color: #d97706; } .t-blue { background: #e3eeff; color: #2563eb; }
.ro-tile span { display: block; font-size: 12.5px; color: var(--muted); }
.ro-tile b { display: block; font-size: 23px; font-weight: 800; letter-spacing: -.6px; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.15; }
.ro-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.ro-tile.hero span { color: #9db8b4; }
.ro-tile.hero:hover { border-color: transparent; box-shadow: 0 16px 34px rgba(12,37,38,.28); }

.ro-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: ro-up .5s cubic-bezier(.2,.7,.2,1) 250ms backwards; }
.ro-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.ro-left, .ro-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ro-search { position: relative; display: flex; align-items: center; width: 300px; max-width: 100%; }
.ro-search > svg { position: absolute; left: 12px; color: #8aa3a0; pointer-events: none; }
.ro-search input { all: unset; box-sizing: border-box; width: 100%; height: 38px; padding: 0 34px 0 36px; font-size: 13px; color: var(--ink); background: #f1f6f5; border: 1.5px solid transparent; border-radius: 11px; transition: background .15s, border-color .15s, box-shadow .15s; }
.ro-search input::placeholder { color: #8aa3a0; }
.ro-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
.ro-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: #8aa3a0; }
.ro-x:hover { background: #e3ecea; color: var(--ink); }
.ro-seg { display: flex; gap: 2px; padding: 3px; background: #eef4f2; border-radius: 11px; }
.ro-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--muted); transition: background .15s, color .15s; }
.ro-sb:hover { color: var(--ink); } .ro-sb.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.ro-select { height: 38px; max-width: 170px; padding: 0 30px 0 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); background: #f1f6f5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center; border: 1.5px solid transparent; border-radius: 11px; appearance: none; cursor: pointer; }
.ro-select:hover { background-color: #e9f1ef; }

.ro-logo { position: relative; width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 17px; overflow: hidden; border: 1px solid var(--line); background: #fff; }
.ro-logo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 5px; background: #fff; }

.ro-head, .ro-row { display: grid; grid-template-columns: minmax(0,1.6fr) minmax(0,1fr) minmax(0,2fr) minmax(0,.8fr) 112px; gap: 14px; align-items: center; padding: 0 18px; }
.ro-head { height: 38px; font-size: 11.5px; font-weight: 600; color: var(--muted); background: #f7fbfa; border-bottom: 1px solid var(--line); }
.ro-row { min-height: 66px; border-bottom: 1px solid var(--line); transition: background .12s; animation: ro-slide .4s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 28ms) backwards; }
.ro-row:last-child { border-bottom: 0; } .ro-row:hover { background: #f6fbf9; }
.ro-who { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
.ro-who b { display: block; font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ro-sub { display: block; font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.ro-desc { color: #4d6561; font-size: 12.5px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ro-date { color: var(--muted); font-size: 12.5px; }
.ro-row:hover .ro-logo { transform: scale(1.06); } .ro-logo { transition: transform .2s; }

.ro-acts { display: flex; gap: 6px; justify-content: flex-end; }
.ro-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, border-color .15s, transform .15s; }
.ro-ib:hover { transform: translateY(-1px); }
.ro-ib.v:hover { background: #e3eeff; color: #2563eb; border-color: #c7dcff; }
.ro-ib.e:hover { background: #e0f4f1; color: var(--teal); border-color: #b9e4de; }
.ro-ib.d:hover { background: #fdecea; color: #c0392b; border-color: #f6cfca; }
.ro-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.ro-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; padding: 16px; }
.ro-card { display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 16px; background: #fff; overflow: hidden;
  transition: transform .22s, box-shadow .22s, border-color .22s; animation: ro-up .45s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 35ms) backwards; }
.ro-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(12,37,38,.09); border-color: #d3e2df; }
.ro-stage { position: relative; height: 112px; display: grid; place-items: center; cursor: pointer; font-size: 38px; font-weight: 800; color: var(--teal);
  background: radial-gradient(160px 80px at 50% 0%, rgba(15,118,110,.08), transparent 70%), #f6faf9; border-bottom: 1px solid var(--line); }
.ro-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 18px; transition: transform .3s; }
.ro-card:hover .ro-stage img { transform: scale(1.06); }
.ro-cbody { padding: 12px 14px 8px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.ro-cbody b { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.ro-cbody .ro-desc { min-height: 36px; }
.ro-cfoot { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 12px 14px; }

.ro-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.ro-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.ro-skel { height: 66px; margin: 0 18px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.ro-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: ro-shine 1.3s linear infinite; }

.ro-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--line); background: #fbfdfc; color: var(--muted); font-size: 12.5px; }
.ro-pager { display: flex; align-items: center; gap: 6px; }
.ro-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); transition: background .15s; }
.ro-pg:hover:not(:disabled) { background: #eef5f3; } .ro-pg:disabled { opacity: .4; cursor: not-allowed; }
.ro-pager span { min-width: 64px; text-align: center; font-weight: 600; color: var(--ink); }

@keyframes ro-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes ro-slide { from { opacity: 0; transform: translateX(-10px); } }
@keyframes ro-shine { to { background-position: -200% 0; } }
@keyframes ro-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .ro-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 900px) {
  .ro-head, .ro-row { grid-template-columns: minmax(0,1.6fr) minmax(0,1fr) minmax(0,.8fr) 112px; } .ro-hide-md { display: none; }
}
@media (max-width: 720px) {
  .ro { padding: 14px; } .ro-tiles { grid-template-columns: 1fr; }
  .ro-head { display: none; }
  .ro-row { grid-template-columns: minmax(0,1fr) auto; padding: 12px 14px; gap: 6px 12px; } .ro-hide-m { display: none; }
  .ro-search, .ro-left { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .ro-tile, .ro-panel, .ro-row, .ro-card, .ro-skel i, .ro-spin { animation: none !important; } .ro-tile, .ro-card, .ro-logo, .ro-stage img { transition: none; } }

.ro-btn.icon { width: 40px; padding: 0; justify-content: center; }
.ro-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 14px; padding: 16px; }
.ro-card { justify-content: space-between; }
.ro-chead { display: flex; align-items: center; gap: 12px; cursor: pointer; min-width: 0; }
.ro-chead b { display: block; font-size: 15px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.ro-shield { width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; transition: transform .2s; }
.ro-card:hover .ro-shield { transform: scale(1.08) rotate(-5deg); }
.ro-cov { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--muted); margin-bottom: 6px; } .ro-cov em { font-style: normal; font-weight: 700; color: var(--ink); }
.ro-meter { height: 6px; border-radius: 99px; background: #eef4f2; overflow: hidden; }
.ro-meter i { display: block; height: 100%; width: 100%; border-radius: 99px; transform-origin: left; animation: ro-fill .9s cubic-bezier(.2,.7,.2,1) backwards; }
.ro-chips { display: flex; flex-wrap: wrap; gap: 6px; min-height: 28px; }
.ro-chip { padding: 3px 9px; border-radius: 8px; background: #eef4f2; color: #35504c; font-size: 11.5px; font-weight: 600; }
.ro-more { padding: 3px 9px; border-radius: 8px; background: #e3eeff; color: #1d4ed8; font-size: 11.5px; font-weight: 700; }
.ro-none { color: #8aa3a0; font-size: 12.5px; }
.ro-link { all: unset; cursor: pointer; font-size: 12.5px; font-weight: 700; color: var(--teal); } .ro-link:hover { text-decoration: underline; }
.ro-ghost { height: 190px; gap: 12px; padding: 16px; } .ro-ghost i { display: block; height: 14px; border-radius: 7px; width: 60%; background: linear-gradient(90deg,#eef4f2,#f7faf9,#eef4f2); background-size: 200% 100%; animation: ro-shine 1.3s linear infinite; }
@keyframes ro-fill { from { transform: scaleX(0); } }
@media (prefers-reduced-motion: reduce) { .ro-meter i, .ro-ghost i { animation: none !important; } .ro-shield { transition: none; } }
`;

const TONES = [['#e0f4f1', '#0f766e'], ['#e3eeff', '#2563eb'], ['#eee8ff', '#7c3aed'], ['#fff1d6', '#d97706'], ['#fdecea', '#c0392b'], ['#ecf6d8', '#4d7c0f']];
const toneFor = (s = '') => TONES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
const permsOf = (r) => (Array.isArray(r.permissions) ? r.permissions : []);
const fmtDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

function Tile({ label, target, decimals = 0, icon: Icon, tone, hero, delay }) {
  const shown = useCountUp(target, decimals);
  return (
    <div className={`ro-tile${hero ? ' hero' : ''}`} style={{ '--d': `${delay}ms` }}>
      <div className={`ro-chip-i ${tone}`}><Icon size={20} strokeWidth={2} /></div>
      <div><span>{label}</span><b>{shown}</b></div>
    </div>
  );
}

export default function RolePermissionPage() {
  const { t } = useTranslation();
  const tro = t.roles;

  const [roles, setRoles] = useState([]);
  const [allPerms, setAllPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPermissionListOpen, setIsPermissionListOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [res, permRes] = await Promise.all([listRoles(), listPermissions().catch(() => [])]);
      const items = res?.data || res?.roles || (Array.isArray(res) ? res : []);
      const perms = permRes?.data || permRes?.permissions || (Array.isArray(permRes) ? permRes : []);
      setRoles(Array.isArray(items) ? items : []);
      setAllPerms(Array.isArray(perms) ? perms : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      const msg = error.message || tro.fetchError;
      setErrorMsg(msg);
      toastr.error(tro.toastErrorTitle, msg);
    } finally {
      setLoading(false);
    }
  };

  const askDelete = (r) => { setDeleteError(''); setDeletingRole(r); };

  const handleConfirmDelete = async () => {
    if (!deletingRole?.id) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await deleteRole(deletingRole.id);
      setDeletingRole(null);
      toastr.success(tro.toastDeleteSuccessTitle, tro.toastDeleteSuccessMsg);
      fetchRoles();
    } catch (err) {
      const msg = err?.message || tro.deleteError;
      setDeleteError(msg);
      toastr.error(tro.toastErrorTitle, msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const assigned = roles.reduce((s, r) => s + permsOf(r).length, 0);
    const totalPerms = allPerms.length || new Set(roles.flatMap((r) => permsOf(r).map((p) => p.id))).size;
    return { roles: roles.length, totalPerms, avg: roles.length ? assigned / roles.length : 0, empty: roles.filter((r) => permsOf(r).length === 0).length };
  }, [roles, allPerms]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = roles.filter((r) => !q || r.name?.toLowerCase().includes(q) || permsOf(r).some((p) => p.name?.toLowerCase().includes(q)));
    const by = {
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
      perms: (a, b) => permsOf(b).length - permsOf(a).length,
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
    }[sort];
    return [...list].sort(by);
  }, [roles, search, sort]);

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="ro">
        <div className="ro-top">
          <div>
            <h2>{tro.heading}</h2>
            <p>{tro.subHeading}</p>
          </div>
          <div className="ro-actions">
            <button className="ro-btn primary" onClick={() => setIsCreateOpen(true)}><Plus size={16} /> {tro.addNew}</button>
            <button className="ro-btn" onClick={() => setIsPermissionListOpen(true)}><Lock size={16} /> {tro.managePerms}</button>
            <button className="ro-btn icon" onClick={fetchRoles} disabled={loading} aria-label={tro.refresh} title={tro.refresh}><RefreshCw size={16} className={loading ? 'ro-spin' : ''} /></button>
          </div>
        </div>

        {errorMsg && <div className="ro-err" role="alert"><span>{errorMsg}</span><button onClick={fetchRoles}>{tro.tryAgain}</button></div>}

        <div className="ro-tiles">
          <Tile label={tro.tileTotalRoles} target={stats.roles} icon={ShieldCheck} tone="t-dark" hero delay={0} />
          <Tile label={tro.tileSystemPerms} target={stats.totalPerms} icon={Lock} tone="t-blue" delay={70} />
          <Tile label={tro.tileAvgPerms} target={stats.avg} decimals={1} icon={Gauge} tone="t-green" delay={140} />
          <Tile label={tro.tileEmptyRoles} target={stats.empty} icon={ShieldOff} tone="t-amber" delay={210} />
        </div>

        <section className="ro-panel">
          <div className="ro-tools">
            <div className="ro-left">
              <div className="ro-search">
                <Search size={16} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tro.searchPlaceholder} aria-label="Search roles" />
                {search && <button className="ro-x" onClick={() => setSearch('')} aria-label={tro.clearSearch}><X size={15} /></button>}
              </div>
            </div>
            <div className="ro-right">
              <select className="ro-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort roles">
                <option value="name">{tro.sortName}</option>
                <option value="perms">{tro.sortPerms}</option>
                <option value="newest">{tro.sortNewest}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="ro-cards">{[0, 1, 2].map((i) => <div className="ro-card ro-ghost" key={i}><i /><i /><i /></div>)}</div>
          ) : visible.length === 0 ? (
            <div className="ro-empty">
              <b>{roles.length === 0 ? tro.emptyNoData : tro.emptyNoResult}</b>
              {roles.length > 0 && tro.emptyHint}
            </div>
          ) : (
            <div className="ro-cards" key={sort}>
              {visible.map((r, i) => {
                const perms = permsOf(r);
                const [bg, fg] = toneFor(r.name);
                const pct = allPerms.length ? Math.min(100, (perms.length / allPerms.length) * 100) : 0;
                return (
                  <div className="ro-card" key={r.id ?? i} style={{ '--i': i }}>
                    <div className="ro-cbody">
                      <div className="ro-chead" onClick={() => setViewingRole(r)}>
                        <span className="ro-shield" style={{ background: bg, color: fg }}><ShieldCheck size={20} /></span>
                        <div style={{ minWidth: 0 }}><b>{r.name}</b><span className="ro-sub">ID #{r.id} · {fmtDate(r.created_at)}</span></div>
                      </div>
                      <div>
                        <div className="ro-cov"><span>{perms.length}{allPerms.length ? ` / ${allPerms.length}` : ''} {tro.permissionsLabel}</span>{allPerms.length > 0 && <em>{pct.toFixed(0)}%</em>}</div>
                        {allPerms.length > 0 && <div className="ro-meter"><i style={{ transform: `scaleX(${pct / 100})`, background: fg, animationDelay: `${i * 60 + 200}ms` }} /></div>}
                      </div>
                      <div className="ro-chips">
                        {perms.length === 0 ? <span className="ro-none">{tro.noPermissions}</span> : perms.slice(0, 5).map((p) => <span className="ro-chip" key={p.id}>{p.name}</span>)}
                        {perms.length > 5 && <span className="ro-more">+{perms.length - 5}</span>}
                      </div>
                    </div>
                    <div className="ro-cfoot">
                      <button className="ro-link" onClick={() => setViewingRole(r)}>{tro.viewPermissions}</button>
                      <div className="ro-acts">
                        <button className="ro-ib v" onClick={() => setViewingRole(r)} aria-label="View role" title={tro.viewTitle}><Eye size={15} /></button>
                        <button className="ro-ib e" onClick={() => setEditingRole(r)} aria-label="Edit role" title={tro.editTitle}><Pencil size={15} /></button>
                        <button className="ro-ib d" onClick={() => askDelete(r)} aria-label="Delete role" title={tro.deleteTitle}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchRoles();
          toastr.success(tro.toastCreateSuccessTitle, tro.toastCreateSuccessMsg);
        }}
      />
      <PermissionListModal
        isOpen={isPermissionListOpen}
        onClose={() => setIsPermissionListOpen(false)}
        onSuccessRole={fetchRoles}
      />
      <ViewRoleModal
        isOpen={Boolean(viewingRole)}
        role={viewingRole}
        onClose={() => setViewingRole(null)}
        onEdit={(r) => setEditingRole(r)}
        onDelete={askDelete}
      />
      <EditRoleModal
        isOpen={Boolean(editingRole)}
        role={editingRole}
        onClose={() => setEditingRole(null)}
        onSuccess={() => {
          fetchRoles();
          toastr.success(tro.toastUpdateSuccessTitle, tro.toastUpdateSuccessMsg);
        }}
      />
      <ConfirmDeleteModal
        isOpen={Boolean(deletingRole)}
        title={tro.deleteModalTitle}
        message={<>{tro.deleteModalPrefix} <b>“{deletingRole?.name}”</b> {tro.deleteModalSuffix}</>}
        confirmLabel={tro.deleteModalConfirm}
        busy={isDeleting}
        error={deleteError}
        onCancel={() => setDeletingRole(null)}
        onConfirm={handleConfirmDelete}
      />
    </Layout>
  );
}