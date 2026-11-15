// src/pages/roles/ViewRoleModal.jsx
import React, { useEffect, useMemo } from 'react';
import { X, ShieldCheck, Calendar, Pencil, Trash2, Hash, Lock, Check } from 'lucide-react';
import { modalCss } from '../products/modalStyles';
import { brandCss } from '../brands/brandStyles';
import { roleCss } from './roleStyles';
// import { groupPermissions } from '.RoleForm';
import { groupPermissions } from './Roleformmodal';

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ViewRoleModal({ isOpen, role, onClose, onEdit, onDelete }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const permissions = Array.isArray(role?.permissions) ? role.permissions : [];
  const groups = useMemo(() => groupPermissions(permissions), [permissions]);

  if (!isOpen || !role) return null;

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{modalCss}{brandCss}{roleCss}</style>
      <div className="pm" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Role details">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><ShieldCheck size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}><h3>ព័ត៌មានលម្អិតតួនាទី</h3><p>ID #{role.id}</p></div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          <div className="pv-hero" style={{ alignItems: 'center' }}>
            <div className="pv-img" style={{ width: 72, height: 72, borderRadius: 20, background: '#e7f8ee', color: '#15803d' }}><ShieldCheck size={32} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pv-title"><h2>{role.name}</h2></div>
              <div className="pv-chips" style={{ marginTop: 10 }}>
                <span className="pm-chip"><Lock size={13} /> <b>{permissions.length}</b> permissions</span>
                <span className="pm-chip"><Hash size={13} /> <b>{role.id}</b></span>
              </div>
            </div>
          </div>

          <section className="pm-sec">
            <h4>បញ្ជីសិទ្ធិអនុញ្ញាត</h4>
            <div className="rp-groups" style={{ maxHeight: 280 }}>
              {groups.length === 0 ? <div className="rp-empty">គ្មានសិទ្ធិត្រូវបានកំណត់</div> : groups.map(([group, items]) => (
                <div key={group}>
                  <div className="rp-ghead"><b>{group}<em>{items.length}</em></b></div>
                  <div className="rp-pills">{items.map((p) => <span className="rp-tag" key={p.id} title={p.description || p.name}><Check size={12} strokeWidth={3} />{p.name}</span>)}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="pv-time">
            <span><Calendar size={14} /> ថ្ងៃបង្កើត៖ <b>{formatDate(role.created_at)}</b></span>
            <span><Calendar size={14} /> កែប្រែចុងក្រោយ៖ <b>{formatDate(role.updated_at)}</b></span>
          </div>
        </div>

        <div className="pm-foot split">
          {onDelete ? <button type="button" className="pm-btn danger" onClick={() => { const cur = role; onClose?.(); onDelete(cur); }}><Trash2 size={15} /> លុប</button> : <span />}
          <div className="grp">
            <button type="button" className="pm-btn" onClick={onClose}>បិទ</button>
            {onEdit && <button type="button" className="pm-btn primary" onClick={() => { const cur = role; onClose?.(); onEdit(cur); }}><Pencil size={15} /> កែប្រែតួនាទីនេះ</button>}
          </div>
        </div>
      </div>
    </div>
  );
}