// src/pages/expenses/ViewExpenseTypeModal.jsx
import React, { useEffect } from 'react';
import { X, FolderKanban, FileText, Calendar, CheckCircle2, XCircle, Pencil, Trash2, Hash, Wallet } from 'lucide-react';
import { modalCss } from '../products/modalStyles';
import { brandCss } from '../brands/brandStyles';

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ViewExpenseTypeModal({ isOpen, expenseType, onClose, onEdit, onDelete }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !expenseType) return null;
  const active = Number(expenseType.is_active ?? 1) === 1;
  const hasCount = expenseType.expenses_count !== undefined && expenseType.expenses_count !== null;

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{modalCss}{brandCss}</style>
      <div className="pm" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Expense type details">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><FolderKanban size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>ព័ត៌មានលម្អិតប្រភេទការចំណាយ</h3>
              <p>ID #{expenseType.id}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          <div className="pv-hero" style={{ alignItems: 'center' }}>
            <div className="pv-img" style={{ width: 72, height: 72, borderRadius: 20, background: '#e3eeff', color: '#2563eb' }}><FolderKanban size={30} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pv-title">
                <h2>{expenseType.name}</h2>
                {active ? <span className="pv-badge on"><CheckCircle2 size={13} /> Active</span> : <span className="pv-badge off"><XCircle size={13} /> Inactive</span>}
              </div>
              <div className="pv-chips" style={{ marginTop: 10 }}>
                <span className="pm-chip"><Hash size={13} /> <b>{expenseType.id}</b></span>
                {hasCount && <span className="pm-chip"><Wallet size={13} /> <b>{expenseType.expenses_count}</b> expenses</span>}
              </div>
            </div>
          </div>

          <div className="pv-box" style={{ alignItems: 'flex-start' }}>
            <div className="pv-box-i"><FileText size={18} strokeWidth={2} /></div>
            <div style={{ minWidth: 0 }}>
              <span>ការពិពណ៌នា (Description)</span>
              <b style={{ whiteSpace: 'normal', fontWeight: 500, lineHeight: 1.55, color: expenseType.description ? '#0f1f1d' : '#8aa3a0' }}>{expenseType.description || 'មិនមានការពិពណ៌នាទេ។'}</b>
            </div>
          </div>

          <div className="pv-time">
            <span><Calendar size={14} /> ថ្ងៃបង្កើត៖ <b>{formatDate(expenseType.created_at)}</b></span>
            <span><Calendar size={14} /> កែប្រែ៖ <b>{formatDate(expenseType.updated_at)}</b></span>
          </div>
        </div>

        <div className="pm-foot split">
          {onDelete ? (
            <button type="button" className="pm-btn danger" onClick={() => { const cur = expenseType; onClose?.(); onDelete(cur); }}><Trash2 size={15} /> លុប</button>
          ) : <span />}
          <div className="grp">
            <button type="button" className="pm-btn" onClick={onClose}>បិទ</button>
            {onEdit && <button type="button" className="pm-btn primary" onClick={() => { const cur = expenseType; onClose?.(); onEdit(cur); }}><Pencil size={15} /> កែប្រែ</button>}
          </div>
        </div>
      </div>
    </div>
  );
}