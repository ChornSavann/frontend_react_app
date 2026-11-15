// src/pages/expenses/ViewExpenseModal.jsx
import React, { useEffect } from 'react';
import { X, Wallet, FolderKanban, User, Calendar, CreditCard, FileText, Pencil, Trash2, Hash, DollarSign } from 'lucide-react';
import { modalCss } from '../products/modalStyles';
import { brandCss } from '../brands/brandStyles';

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

function Box({ icon: Icon, label, title, muted }) {
  return (
    <div className="pv-box">
      <div className="pv-box-i"><Icon size={18} strokeWidth={2} /></div>
      <div style={{ minWidth: 0 }}>
        <span>{label}</span>
        <b style={muted ? { color: '#8aa3a0', fontWeight: 600 } : undefined}>{title}</b>
      </div>
    </div>
  );
}

export default function ViewExpenseModal({ isOpen, expense, onClose, onEdit, onDelete }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !expense) return null;

  const amount = parseFloat(expense.amount || 0) || 0;
  const typeObj = expense.expense_type || expense.expenseType || {};
  const title = expense.title || expense.name || typeObj.name || 'Expense';
  const refNo = expense.reference_no || expense.expense_number || `#${expense.id}`;
  const note = expense.description || expense.notes;

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{modalCss}{brandCss}</style>
      <div className="pm" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Expense details">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Wallet size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>ព័ត៌មានលម្អិតការចំណាយ</h3>
              <p>{refNo} · ID #{expense.id}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          <div>
            <div className="pv-title"><h2>{title}</h2></div>
            <div className="pv-chips" style={{ marginTop: 10 }}>
              <span className="pm-chip"><Hash size={13} /> <b>{refNo}</b></span>
              {typeObj.name && <span className="pm-chip"><FolderKanban size={13} /> <b>{typeObj.name}</b></span>}
            </div>
          </div>

          <div className="pv-stats" style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
            <div className="pv-stat bad" style={{ '--d': '0ms' }}><span><DollarSign size={14} /> ទឹកប្រាក់ចំណាយ</span><b style={{ fontSize: 26 }}>-${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
            <div className="pv-stat" style={{ '--d': '70ms' }}><span><Calendar size={14} /> កាលបរិច្ឆេទ</span><b style={{ fontSize: 20 }}>{formatDate(expense.expense_date || expense.date || expense.created_at)}</b></div>
          </div>

          <div className="pv-info">
            <Box icon={FolderKanban} label="ប្រភេទការចំណាយ (Type)" title={typeObj.name || '-'} muted={!typeObj.name} />
            <Box icon={CreditCard} label="វិធីទូទាត់ (Payment)" title={String(expense.payment_method || 'cash').toUpperCase()} />
            <div style={{ gridColumn: '1 / -1' }}><Box icon={User} label="អ្នកកត់ត្រា (Recorded by)" title={expense.user?.name || 'Admin'} /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="pv-box" style={{ alignItems: 'flex-start' }}>
                <div className="pv-box-i"><FileText size={18} strokeWidth={2} /></div>
                <div style={{ minWidth: 0 }}>
                  <span>ការពិពណ៌នា / កំណត់ចំណាំ</span>
                  <b style={{ whiteSpace: 'normal', fontWeight: 500, lineHeight: 1.55, color: note ? '#0f1f1d' : '#8aa3a0' }}>{note || 'គ្មានការពិពណ៌នាបន្ថែមទេ។'}</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pm-foot split">
          {onDelete ? (
            <button type="button" className="pm-btn danger" onClick={() => { const cur = expense; onClose?.(); onDelete(cur); }}><Trash2 size={15} /> លុប</button>
          ) : <span />}
          <div className="grp">
            <button type="button" className="pm-btn" onClick={onClose}>បិទ</button>
            {onEdit && (
              <button type="button" className="pm-btn primary" onClick={() => { const cur = expense; onClose?.(); onEdit(cur); }}><Pencil size={15} /> កែប្រែការចំណាយនេះ</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}