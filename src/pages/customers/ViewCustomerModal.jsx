// src/pages/customers/ViewCustomerModal.jsx
import React, { useEffect } from 'react';
import { X, Phone, Mail, MapPin, Calendar, CheckCircle2, XCircle, Pencil, FileText, ShoppingBag, Award, UserRound } from 'lucide-react';
import { modalCss } from '../products/modalStyles';

const formatDate = (value, withTime = true) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' });
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

export default function ViewCustomerModal({ isOpen, customer, onClose, onEdit }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  const active = Number(customer.is_active ?? 1) === 1;
  const initial = (customer.name || 'C').trim().charAt(0).toUpperCase();
  const points = Number(customer.points || 0);
  const hasOrders = customer.orders_count !== undefined && customer.orders_count !== null;

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{modalCss}</style>
      <div className="pm" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Customer details">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><UserRound size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>ព័ត៌មានលម្អិតអតិថិជន</h3>
              <p>ID #{customer.id}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          <div className="pv-hero" style={{ alignItems: 'center' }}>
            <div className="pv-img" style={{ borderRadius: '50%', width: 96, height: 96, fontSize: 34 }}>
              {initial}
              {customer.image_url && <img src={customer.image_url} alt={customer.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pv-title">
                <h2>{customer.name}</h2>
                {active
                  ? <span className="pv-badge on"><CheckCircle2 size={13} /> Active</span>
                  : <span className="pv-badge off"><XCircle size={13} /> Inactive</span>}
              </div>
              <div className="pv-chips" style={{ marginTop: 10 }}>
                {customer.phone && <span className="pm-chip"><Phone size={13} /> <b>{customer.phone}</b></span>}
                {customer.email && <span className="pm-chip"><Mail size={13} /> <b>{customer.email}</b></span>}
              </div>
            </div>
          </div>

          <div className="pv-stats" style={{ gridTemplateColumns: hasOrders ? 'repeat(3, minmax(0,1fr))' : 'repeat(2, minmax(0,1fr))' }}>
            <div className="pv-stat hero" style={{ '--d': '0ms' }}><span><Award size={14} /> ពិន្ទុសន្សំ</span><b>{points.toLocaleString('en-US')} pts</b></div>
            {hasOrders && <div className="pv-stat" style={{ '--d': '60ms' }}><span><ShoppingBag size={14} /> ការបញ្ជាទិញ</span><b>{customer.orders_count}</b></div>}
            <div className="pv-stat" style={{ '--d': '120ms' }}><span><Calendar size={14} /> ចុះឈ្មោះ</span><b style={{ fontSize: 15 }}>{formatDate(customer.created_at, false)}</b></div>
          </div>

          <div className="pv-info">
            <Box icon={Phone} label="លេខទូរស័ព្ទ (Phone)" title={customer.phone || '-'} muted={!customer.phone} />
            <Box icon={Mail} label="អ៊ីមែល (Email)" title={customer.email || '-'} muted={!customer.email} />
            <div style={{ gridColumn: '1 / -1' }}><Box icon={MapPin} label="អាសយដ្ឋាន (Address)" title={customer.address || 'មិនមានបញ្ជាក់អាសយដ្ឋាន'} muted={!customer.address} /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="pv-box" style={{ alignItems: 'flex-start' }}>
                <div className="pv-box-i"><FileText size={18} strokeWidth={2} /></div>
                <div style={{ minWidth: 0 }}>
                  <span>កំណត់ចំណាំ (Notes)</span>
                  <b style={{ whiteSpace: 'normal', fontWeight: 500, color: customer.notes ? '#0f1f1d' : '#8aa3a0', lineHeight: 1.5 }}>{customer.notes || 'គ្មានកំណត់ចំណាំទេ'}</b>
                </div>
              </div>
            </div>
          </div>

          <div className="pv-time">
            <span><Calendar size={14} /> ថ្ងៃចុះឈ្មោះ៖ <b>{formatDate(customer.created_at)}</b></span>
            <span><Calendar size={14} /> កែប្រែចុងក្រោយ៖ <b>{formatDate(customer.updated_at)}</b></span>
          </div>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បិទ</button>
          {onEdit && (
            <button type="button" className="pm-btn primary" onClick={() => { const cur = customer; onClose?.(); onEdit(cur); }}>
              <Pencil size={15} /> កែប្រែអតិថិជននេះ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}