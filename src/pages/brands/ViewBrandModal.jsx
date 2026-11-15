// src/pages/brands/ViewBrandModal.jsx
import React, { useEffect } from 'react';
import { X, Tag, Calendar, FileText, Pencil, Trash2, Link2, Hash } from 'lucide-react';
import { modalCss } from '../products/modalStyles';
import { brandCss } from './brandStyles';

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ViewBrandModal({ isOpen, brand, onClose, onEdit, onDelete }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !brand) return null;
  const logo = brand.image_url || brand.logo_url || '';

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{modalCss}{brandCss}</style>
      <div className="pm" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Brand details">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Tag size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>ព័ត៌មានលម្អិតម៉ាកទំនិញ</h3>
              <p>ID #{brand.id}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          <div className="pv-hero" style={{ alignItems: 'center' }}>
            <div className="pv-img logo" style={{ width: 112, height: 112 }}>
              {String(brand.name || '?').trim().charAt(0).toUpperCase()}
              {logo && <img src={logo} alt={brand.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pv-title"><h2>{brand.name}</h2></div>
              <div className="pv-chips" style={{ marginTop: 10 }}>
                <span className="pm-chip"><Link2 size={13} /> <b className="br-slug">{brand.slug || '-'}</b></span>
                <span className="pm-chip"><Hash size={13} /> <b>{brand.id}</b></span>
              </div>
            </div>
          </div>

          <div className="pv-box" style={{ alignItems: 'flex-start' }}>
            <div className="pv-box-i"><FileText size={18} strokeWidth={2} /></div>
            <div style={{ minWidth: 0 }}>
              <span>ការពិពណ៌នា (Description)</span>
              <b style={{ whiteSpace: 'normal', fontWeight: 500, lineHeight: 1.55, color: brand.description ? '#0f1f1d' : '#8aa3a0' }}>
                {brand.description || 'មិនមានការពិពណ៌នាសម្រាប់ម៉ាកទំនិញនេះទេ។'}
              </b>
            </div>
          </div>

          <div className="pv-time">
            <span><Calendar size={14} /> ថ្ងៃបង្កើត៖ <b>{formatDate(brand.created_at)}</b></span>
            <span><Calendar size={14} /> កែប្រែចុងក្រោយ៖ <b>{formatDate(brand.updated_at)}</b></span>
          </div>
        </div>

        <div className="pm-foot split">
          {onDelete ? (
            <button type="button" className="pm-btn danger" onClick={() => { const cur = brand; onClose?.(); onDelete(cur); }}>
              <Trash2 size={15} /> លុប
            </button>
          ) : <span />}
          <div className="grp">
            <button type="button" className="pm-btn" onClick={onClose}>បិទ</button>
            {onEdit && (
              <button type="button" className="pm-btn primary" onClick={() => { const cur = brand; onClose?.(); onEdit(cur); }}>
                <Pencil size={15} /> កែប្រែម៉ាកនេះ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}