
import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, ShieldCheck, Pencil, Search, Check, AlertCircle, Loader2 } from 'lucide-react';
import { createRole, updateRole, listPermissions } from '../../services/rolePermissionService';
import { modalCss } from '../products/modalStyles';
import { roleCss } from './roleStyles';

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.permissions)) return res.permissions;
  return [];
};

// "create-product" → group "product", "view-reports" → "reports"
export const groupOf = (name) => {
  const parts = String(name || '').split(/[-_.:\s]+/).filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join(' ') : 'general';
};

export const groupPermissions = (perms) => {
  const map = new Map();
  perms.forEach((p) => {
    const g = groupOf(p.name);
    if (!map.has(g)) map.set(g, []);
    map.get(g).push(p);
  });
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
};

export default function RoleFormModal({ mode = 'create', isOpen, role, onClose, onSuccess }) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;
    setErrorMsg('');
    setQuery('');
    if (isEdit && role) {
      setName(role.name || '');
      setSelected(Array.isArray(role.permissions) ? role.permissions.map((p) => p.id) : []);
    } else {
      setName('');
      setSelected([]);
    }
    let cancelled = false;
    setLoadingPerms(true);
    listPermissions()
      .then((res) => { if (!cancelled) setPermissions(extractArray(res)); })
      .catch(() => { if (!cancelled) setPermissions([]); })
      .finally(() => { if (!cancelled) setLoadingPerms(false); });
    return () => { cancelled = true; };
  }, [isOpen, isEdit, role]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const sel = useMemo(() => new Set(selected), [selected]);
  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? permissions.filter((p) => `${p.name} ${p.description || ''}`.toLowerCase().includes(q)) : permissions;
    return groupPermissions(list);
  }, [permissions, query]);

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleGroup = (items) => {
    const ids = items.map((p) => p.id);
    const all = ids.every((id) => sel.has(id));
    setSelected((prev) => (all ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]));
  };
  const allSelected = permissions.length > 0 && selected.length === permissions.length;
  const toggleAll = () => setSelected(allSelected ? [] : permissions.map((p) => p.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !role?.id) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = { name: name.trim(), permissions: selected }; // ផ្ញើបញ្ជី ID របស់ Permissions
      if (isEdit) await updateRole(role.id, payload);
      else await createRole(payload);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(err?.message || (isEdit ? 'បរាជ័យក្នុងការកែប្រែ Role' : 'បរាជ័យក្នុងការបង្កើត Role ថ្មី'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || (isEdit && !role)) return null;
  const Icon = isEdit ? Pencil : ShieldCheck;

  return (
    <div className="pm-overlay">
      <style>{modalCss}{roleCss}</style>
      <form className="pm" style={{ maxWidth: 700 }} onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit role' : 'Create role'}>
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Icon size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>{isEdit ? 'កែប្រែតួនាទី' : 'បន្ថែមតួនាទីថ្មី'}</h3>
              <p>{isEdit ? `${role.name} · ID #${role.id}` : 'កំណត់សិទ្ធិ (Permissions) សម្រាប់តួនាទីនីមួយៗក្នុងប្រព័ន្ធ'}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          {errorMsg && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{errorMsg}</span></div>}

          <section className="pm-sec">
            <h4>ឈ្មោះតួនាទី</h4>
            <input className="pm-in" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="ឧ. Store Manager, Cashier, Inventory Staff..." autoFocus />
          </section>

          <section className="pm-sec">
            <div className="pp-sec-head">
              <h4 style={{ margin: 0 }}>សិទ្ធិអនុញ្ញាត <span className="pm-chip" style={{ marginLeft: 4 }}>{selected.length} / {permissions.length}</span></h4>
              <button type="button" className="pm-link" onClick={toggleAll} disabled={permissions.length === 0}>{allSelected ? 'ដកសិទ្ធិទាំងអស់' : 'ជ្រើសរើសទាំងអស់'}</button>
            </div>
            <div className="rp-tools" style={{ marginBottom: 10 }}>
              <div className="rp-search"><Search size={15} /><input className="pm-in" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ស្វែងរកសិទ្ធិ…" aria-label="Search permissions" /></div>
            </div>
            <div className="rp-groups">
              {loadingPerms ? <div className="rp-empty">កំពុងទាញយកសិទ្ធិ...</div>
                : visibleGroups.length === 0 ? <div className="rp-empty">{permissions.length === 0 ? 'មិនទាន់មានសិទ្ធិក្នុងប្រព័ន្ធទេ' : 'រកមិនឃើញសិទ្ធិ'}</div>
                : visibleGroups.map(([group, items]) => {
                    const count = items.filter((p) => sel.has(p.id)).length;
                    return (
                      <div key={group}>
                        <div className="rp-ghead">
                          <b>{group}<em>{count}/{items.length}</em></b>
                          <button type="button" className="pm-link" onClick={() => toggleGroup(items)}>{count === items.length ? 'ដកទាំងក្រុម' : 'ជ្រើសក្រុម'}</button>
                        </div>
                        <div className="rp-pills">
                          {items.map((p) => (
                            <button type="button" key={p.id} className={`rp-pill${sel.has(p.id) ? ' on' : ''}`} onClick={() => toggle(p.id)} aria-pressed={sel.has(p.id)} title={p.description || p.name}>
                              <Check size={13} strokeWidth={3} />{p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
            </div>
          </section>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បោះបង់</button>
          <button type="submit" className="pm-btn primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} />}
            {submitting ? 'កំពុងរក្សាទុក...' : isEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុកតួនាទី'}
          </button>
        </div>
      </form>
    </div>
  );
}