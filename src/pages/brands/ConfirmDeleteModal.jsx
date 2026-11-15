// src/pages/brands/ConfirmDeleteModal.jsx
// Reusable delete confirmation dialog
import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { modalCss } from '../products/modalStyles';
import { brandCss } from './brandStyles';

export default function ConfirmDeleteModal({ isOpen, title = 'បញ្ជាក់ការលុប', message, confirmLabel = 'យល់ព្រមលុប', busy = false, error = '', onCancel, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, busy, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="pm-overlay" style={{ zIndex: 2100 }} onClick={() => !busy && onCancel?.()}>
      <style>{modalCss}{brandCss}</style>
      <div className="pm bd" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="bd-body">
          <div className="bd-ico"><AlertTriangle size={28} /></div>
          <h3>{title}</h3>
          <p>{message}</p>
          {error && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{error}</span></div>}
        </div>
        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onCancel} disabled={busy} autoFocus>បោះបង់</button>
          <button type="button" className="pm-btn danger solid" onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 size={16} className="pm-spin" /> : <Trash2 size={16} />}
            {busy ? 'កំពុងលុប...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}