// src/pages/products/ViewProductModal.jsx
import React, { useEffect } from 'react';
import { X, Package, Tag, Layers, Barcode, DollarSign, AlertTriangle, CheckCircle2, XCircle, Calendar, Pencil, Scale, TrendingUp, Eye } from 'lucide-react';
import { modalCss } from './modalStyles';

const num = (v) => parseFloat(v || 0) || 0;
const money = (n) => `$${Math.abs(n).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function InfoBox({ icon: Icon, label, title, sub, image }) {
  return (
    <div className="pv-box">
      <div className="pv-box-i">
        {image ? <img src={image} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <Icon size={18} strokeWidth={2} />}
      </div>
      <div style={{ minWidth: 0 }}>
        <span>{label}</span>
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
}

export default function ViewProductModal({ isOpen, product, onClose, onEdit }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const cost = num(product.cost_price);
  const sell = num(product.selling_price);
  const profit = sell - cost;
  const margin = sell > 0 ? (profit / sell) * 100 : 0;
  const stock = num(product.stock_quantity);
  const alertQty = num(product.alert_quantity);
  const st = stock <= 0 ? 'out' : stock <= alertQty ? 'low' : 'in';
  const active = Number(product.is_active) === 1;
  const unit = product.unit?.short_name || product.unit?.name || '';
  const cap = alertQty > 0 ? alertQty * 3 : 30;
  const pct = Math.max(stock > 0 ? 6 : 0, Math.min(stock / cap, 1) * 100);

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{modalCss}</style>
      <div className="pm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Product details">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Eye size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>ព័ត៌មានលម្អិតទំនិញ</h3>
              <p>ID #{product.id}{product.slug ? ` · ${product.slug}` : ''}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          <div className="pv-hero">
            <div className="pv-img">
              {String(product.name || '?').trim().charAt(0).toUpperCase()}
              {product.image_url && <img src={product.image_url} alt={product.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="pv-title">
                <h2>{product.name}</h2>
                {active
                  ? <span className="pv-badge on"><CheckCircle2 size={13} /> Active</span>
                  : <span className="pv-badge off"><XCircle size={13} /> Inactive</span>}
              </div>
              <p className="pv-desc">{product.description || 'គ្មានការពិពណ៌នាបន្ថែមសម្រាប់ទំនិញនេះទេ។'}</p>
              <div className="pv-chips">
                <span className="pm-chip">SKU <b>{product.sku || '-'}</b></span>
                <span className="pm-chip"><Barcode size={13} /> <b>{product.barcode || '-'}</b></span>
              </div>
            </div>
          </div>

          <div className="pv-stats">
            <div className="pv-stat hero" style={{ '--d': '0ms' }}><span><DollarSign size={14} /> តម្លៃលក់</span><b>{money(sell)}</b></div>
            <div className="pv-stat" style={{ '--d': '60ms' }}><span><DollarSign size={14} /> តម្លៃដើម</span><b>{money(cost)}</b></div>
            <div className="pv-stat" style={{ '--d': '120ms' }}>
              <span><TrendingUp size={14} /> ចំណេញ/ឯកតា</span>
              <b style={{ color: profit >= 0 ? '#15803d' : '#c0392b' }}>{profit >= 0 ? '+' : '-'}{money(profit)}</b>
              <div style={{ fontSize: 11.5, color: '#6a8280', marginTop: 4 }}>{margin.toFixed(0)}% margin</div>
            </div>
            <div className={`pv-stat${st === 'low' ? ' warn' : st === 'out' ? ' bad' : ''}`} style={{ '--d': '180ms' }}>
              <span><Package size={14} /> ស្តុក</span>
              <b>{stock} <small style={{ fontSize: 12, fontWeight: 600 }}>{unit}</small></b>
              <div className="pv-bar"><i className={st} style={{ transform: `scaleX(${pct / 100})` }} /></div>
            </div>
          </div>

          <div className="pv-info">
            <InfoBox icon={Layers} label="ប្រភេទ (Category)" title={product.category?.name || 'គ្មានប្រភេទ'} sub={product.category?.description} image={product.category?.image_url} />
            <InfoBox icon={Tag} label="ម៉ាក (Brand)" title={product.brand?.name || '-'} sub={product.brand?.description} image={product.brand?.image_url} />
            <InfoBox icon={Scale} label="ឯកតា (Unit)" title={`${product.unit?.name || '-'}${product.unit?.short_name ? ` (${product.unit.short_name})` : ''}`} />
            <InfoBox icon={AlertTriangle} label="កម្រិតព្រមានស្តុក (Alert)" title={`${alertQty} ${unit}`} sub={st === 'in' ? 'ស្តុកគ្រប់គ្រាន់' : st === 'low' ? 'ស្តុកជិតអស់' : 'អស់ស្តុក'} />
          </div>

          <div className="pv-time">
            <span><Calendar size={14} /> បង្កើត៖ <b>{formatDate(product.created_at)}</b></span>
            <span><Calendar size={14} /> កែប្រែចុងក្រោយ៖ <b>{formatDate(product.updated_at)}</b></span>
          </div>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បិទ</button>
          {onEdit && (
            <button type="button" className="pm-btn primary" onClick={() => { const current = product; onClose?.(); onEdit(current); }}>
              <Pencil size={15} /> កែប្រែទំនិញនេះ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}