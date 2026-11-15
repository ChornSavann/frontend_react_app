// src/pages/purchases/ViewPurchaseModal.jsx
import React, { useEffect } from 'react';
import { X, Building2, User, Calendar, CreditCard, FileText, Phone, Mail, MapPin, Receipt, Pencil, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { modalCss } from '../products/modalStyles';
import { purchaseCss } from './purchaseStyles';

const TONES = [['#e0f4f1', '#0f766e'], ['#e3eeff', '#2563eb'], ['#eee8ff', '#7c3aed'], ['#fff1d6', '#d97706'], ['#fdecea', '#c0392b'], ['#ecf6d8', '#4d7c0f']];
const toneFor = (s = '') => TONES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
const num = (v) => parseFloat(v || 0) || 0;

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function Avatar({ name, image }) {
  const [bg, fg] = toneFor(name);
  return (
    <span className="pp-av" style={{ background: bg, color: fg }}>
      {String(name || '?').trim().charAt(0).toUpperCase()}
      {image && <img src={image} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
    </span>
  );
}

export default function ViewPurchaseModal({ isOpen, purchase, onClose, onEdit }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !purchase) return null;

  const items = Array.isArray(purchase.items) ? purchase.items : [];
  const subtotal = num(purchase.subtotal), discount = num(purchase.discount), tax = num(purchase.tax), total = num(purchase.total);
  const status = String(purchase.status || '').toLowerCase();
  const StatusIcon = status === 'completed' ? CheckCircle2 : status === 'pending' ? Clock : XCircle;
  const supplierName = purchase.supplier?.company || purchase.supplier?.name || 'មិនមានឈ្មោះក្រុមហ៊ុន';

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{modalCss}{purchaseCss}</style>
      <div className="pm wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Purchase details">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Receipt size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>{purchase.purchase_number}</h3>
              <p>ព័ត៌មានលម្អិតការទិញចូល · ID #{purchase.id}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          <div className="pp-meta">
            <div className="pp-meta-l">
              <span><Calendar size={14} /> <b>{formatDate(purchase.created_at)}</b></span>
              <span><CreditCard size={14} /> <b style={{ textTransform: 'uppercase' }}>{purchase.payment_method || '-'}</b></span>
            </div>
            <span className={`pp-st ${status}`}><StatusIcon size={14} /> {status ? status.charAt(0).toUpperCase() + status.slice(1) : '-'}</span>
          </div>

          <div className="pp-parties">
            <div className="pp-party" style={{ '--d': '0ms' }}>
              <span><Building2 size={14} /> អ្នកផ្គត់ផ្គង់ (Supplier)</span>
              <div className="pp-pr">
                <Avatar name={supplierName} />
                <div style={{ minWidth: 0 }}>
                  <b>{supplierName}</b>
                  <small>{purchase.supplier?.contact_name || purchase.supplier?.name || '-'}</small>
                </div>
              </div>
              <div className="pp-lines">
                {purchase.supplier?.phone && <div><Phone size={13} /> {purchase.supplier.phone}</div>}
                {purchase.supplier?.email && <div><Mail size={13} /> {purchase.supplier.email}</div>}
                {purchase.supplier?.address && <div><MapPin size={13} /> {purchase.supplier.address}</div>}
              </div>
            </div>

            <div className="pp-party" style={{ '--d': '70ms' }}>
              <span><User size={14} /> អ្នកកត់ត្រា (Purchased by)</span>
              <div className="pp-pr">
                <Avatar name={purchase.user?.name || 'Admin'} image={purchase.user?.image_url} />
                <div style={{ minWidth: 0 }}>
                  <b>{purchase.user?.name || 'Admin'}</b>
                  <small>{purchase.user?.email || '-'}</small>
                </div>
              </div>
              <div className="pp-lines">
                {purchase.user?.phone && <div><Phone size={13} /> {purchase.user.phone}</div>}
              </div>
            </div>
          </div>

          <section className="pm-sec">
            <h4>មុខទំនិញដែលបានទិញចូល ({items.length})</h4>
            <div className="pp-vtable">
              <div className="pp-vhead"><span>Product</span><span>Unit cost</span><span>Qty</span><span>Total</span></div>
              {items.map((it, i) => {
                const prod = it.product || {};
                const name = it.product_name || prod.name || '-';
                return (
                  <div className="pp-vrow" key={it.id || i} style={{ '--i': i }}>
                    <div className="pp-pr">
                      <Avatar name={name} image={prod.image_url} />
                      <div style={{ minWidth: 0 }}>
                        <b style={{ fontSize: 13.5 }}>{name}</b>
                        <small>{[prod.sku, prod.stock_quantity !== undefined ? `ស្តុក ${prod.stock_quantity}` : ''].filter(Boolean).join(' · ') || '-'}</small>
                      </div>
                    </div>
                    <div className="r">${num(it.unit_cost).toFixed(2)}</div>
                    <div className="c"><span className="pm-chip">+{it.quantity}</span></div>
                    <div className="r g">${num(it.total_price).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="pp-bottom">
            <div>
              <div className="pm-lab"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FileText size={14} /> កំណត់ចំណាំ (Notes)</span></div>
              <div className="pp-note">{purchase.notes || 'គ្មានកំណត់ចំណាំទេ'}</div>
            </div>
            <div className="pp-total">
              <div className="row"><span>សរុបបឋម</span><b>${subtotal.toFixed(2)}</b></div>
              <div className="row"><span>បញ្ចុះតម្លៃ</span><b>-${discount.toFixed(2)}</b></div>
              <div className="row"><span>ពន្ធ</span><b>${tax.toFixed(2)}</b></div>
              <div className="pp-grand"><span>សរុបរួម</span><b>${total.toFixed(2)}</b></div>
            </div>
          </section>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បិទ</button>
          {onEdit && (
            <button type="button" className="pm-btn primary" onClick={() => { const cur = purchase; onClose?.(); onEdit(cur); }}>
              <Pencil size={15} /> កែប្រែវិក្កយបត្រនេះ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}