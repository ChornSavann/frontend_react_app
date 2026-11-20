// src/pages/stock/AdjustStockModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Sliders, PlusCircle, MinusCircle, PackagePlus, AlertTriangle, Target, Save, Loader2, AlertCircle, ArrowRight, Package } from 'lucide-react';
import { createStockAdjustment } from '../../services/stockAdjustmentService';
import { modalCss } from '../products/modalStyles';

const css = `
.ad-prod { display: flex; align-items: center; gap: 14px; padding: 14px; border: 1px solid var(--line); border-radius: 14px; background: #f9fcfb; }
.ad-img { position: relative; width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0; display: grid; place-items: center; overflow: hidden; background: #e0f4f1; color: #0f766e; font-weight: 800; font-size: 20px; }
.ad-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #fff; }
.ad-prod b { display: block; font-size: 15px; } .ad-prod small { display: block; color: var(--muted); font-size: 12px; margin-top: 2px; }
.ad-cur { margin-left: auto; text-align: right; } .ad-cur span { display: block; font-size: 11.5px; color: var(--muted); } .ad-cur strong { font-size: 24px; font-weight: 800; letter-spacing: -.6px; font-variant-numeric: tabular-nums; }
.ad-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(118px, 1fr)); gap: 8px; }
.ad-type { all: unset; box-sizing: border-box; cursor: pointer; display: flex; flex-direction: column; gap: 4px; padding: 11px 12px; border: 1.5px solid #dce8e5; border-radius: 13px; background: #fff; transition: border-color .15s, background .15s, transform .1s; }
.ad-type:hover { border-color: #b8d0cb; } .ad-type:active { transform: scale(.98); }
.ad-type svg { color: #6a8280; } .ad-type b { font-size: 13px; } .ad-type small { font-size: 11.5px; color: var(--muted); line-height: 1.35; }
.ad-type.on.good { border-color: #4ec28a; background: #effaf4; } .ad-type.on.good svg, .ad-type.on.good b { color: #15803d; }
.ad-type.on.bad { border-color: #f0a79f; background: #fff4f2; } .ad-type.on.bad svg, .ad-type.on.bad b { color: #c0392b; }
.ad-type.on.info { border-color: #8db7f5; background: #eef5ff; } .ad-type.on.info svg, .ad-type.on.info b { color: #1d4ed8; }
.ad-type:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.ad-quick { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.ad-chip { all: unset; cursor: pointer; padding: 4px 11px; border-radius: 99px; font-size: 12px; font-weight: 600; color: #35504c; background: #eef4f2; transition: background .15s; } .ad-chip:hover { background: #dcebe7; } .ad-chip:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.ad-preview { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-radius: 14px; color: #f4faf8;
  background: radial-gradient(220px 100px at 100% 0%, rgba(200,241,105,.2), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); transition: background .2s; }
.ad-preview.bad { background: radial-gradient(220px 100px at 100% 0%, rgba(240,100,80,.3), transparent 65%), linear-gradient(145deg,#2d1414,#1f0a0a); }
.ad-flow { display: flex; align-items: center; gap: 12px; } .ad-flow div span { display: block; font-size: 11.5px; color: #9db8b4; } .ad-flow div b { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }
.ad-flow svg { color: #9db8b4; } .ad-flow .next b { color: #c8f169; } .ad-preview.bad .ad-flow .next b { color: #ffb4a6; }
.ad-delta { padding: 4px 12px; border-radius: 99px; font-weight: 800; font-size: 13px; background: rgba(200,241,105,.18); color: #c8f169; font-variant-numeric: tabular-nums; } .ad-preview.bad .ad-delta { background: rgba(255,140,120,.2); color: #ffb4a6; }
`;

const TYPES = [
  { key: 'add', label: 'Add stock', hint: 'បន្ថែមស្តុកចូលពីលើ', icon: PlusCircle, tone: 'good', sign: 1 },
  { key: 'new_stock', label: 'New batch', hint: 'ទំនិញចូលថ្មី', icon: PackagePlus, tone: 'good', sign: 1 },
  { key: 'subtract', label: 'Subtract', hint: 'ដកស្តុកចេញ', icon: MinusCircle, tone: 'bad', sign: -1 },
  { key: 'damage', label: 'Damaged', hint: 'ខូចខាត / បាត់បង់', icon: AlertTriangle, tone: 'bad', sign: -1 },
  { key: 'set', label: 'Set exact', hint: 'កំណត់ចំនួនជាក់ស្តែង', icon: Target, tone: 'info' },
];
const REASONS = ['ទំនិញខូចពីការដឹកជញ្ជូន', 'កែតម្រូវតាមការរាប់ស្តុក', 'ទំនិញផុតកំណត់', 'អតិថិជនប្រគល់ត្រឡប់'];

export default function AdjustStockModal({ isOpen, product, onClose, onSuccess }) {
  const [type, setType] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) { setType('add'); setQuantity(''); setReason(''); setErrorMsg(''); }
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const current = Number(product.stock_quantity !== undefined ? product.stock_quantity : product.stock) || 0;
  const cfg = TYPES.find((t) => t.key === type);
  const q = Number(quantity);
  const hasQty = quantity !== '' && Number.isFinite(q);
  const next = type === 'set' ? q : current + (cfg.sign || 0) * q;
  const invalidQty = !hasQty || (type === 'set' ? q < 0 : q <= 0);
  const negative = hasQty && next < 0;
  const delta = next - current;
  const img = product.image || product.image_url;

  const addQty = (n) => setQuantity(String((Number(quantity) || 0) + n));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (invalidQty) { setErrorMsg('សូមបញ្ចូលចំនួនឱ្យបានត្រឹមត្រូវ'); return; }
    if (negative) { setErrorMsg(`ស្តុកមិនអាចតិចជាង 0 បានទេ (មានតែ ${current})`); return; }
    setSubmitting(true);
    setErrorMsg('');
    try {
      await createStockAdjustment({ product_id: product.id, type, quantity: q, reason: reason.trim() });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(err?.message || 'មានបញ្ហាក្នុងការកែសម្រួលស្តុក');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pm-overlay">
      <style>{modalCss}{css}</style>
      <form className="pm" style={{ maxWidth: 580 }} onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label="Adjust stock">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Sliders size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}><h3>កែសម្រួលស្តុក</h3><p>{product.name}</p></div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          {errorMsg && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{errorMsg}</span></div>}

          <div className="ad-prod">
            <div className="ad-img">{String(product.name || '?').trim().charAt(0).toUpperCase()}{img && <img src={img} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}</div>
            <div style={{ minWidth: 0 }}><b>{product.name}</b><small>{[product.sku, product.category].filter(Boolean).join(' · ') || '-'}</small></div>
            <div className="ad-cur"><span>ស្តុកបច្ចុប្បន្ន</span><strong>{current}</strong></div>
          </div>

          <section className="pm-sec">
            <h4>ប្រភេទនៃការកែសម្រួល</h4>
            <div className="ad-types" role="radiogroup" aria-label="Adjustment type">
              {TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button type="button" key={t.key} role="radio" aria-checked={type === t.key} className={`ad-type ${t.tone}${type === t.key ? ' on' : ''}`} onClick={() => setType(t.key)}>
                    <Icon size={18} /><b>{t.label}</b><small>{t.hint}</small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="pm-sec">
            <h4>ចំនួន និងមូលហេតុ</h4>
            <div className="pm-grid">
              <div>
                <div className="pm-lab"><span>{type === 'set' ? 'ចំនួនស្តុកថ្មី' : 'ចំនួន (Quantity)'}<em>*</em></span></div>
                <input className="pm-in" type="number" min={type === 'set' ? 0 : 1} step="1" required placeholder="ចំនួន..." value={quantity} onChange={(e) => setQuantity(e.target.value)} autoFocus style={{ fontWeight: 800, fontSize: 15 }} />
                <div className="ad-quick">
                  {type === 'set'
                    ? <button type="button" className="ad-chip" onClick={() => setQuantity(String(current))}>ស្តុកបច្ចុប្បន្ន ({current})</button>
                    : [1, 5, 10, 50].map((n) => <button type="button" key={n} className="ad-chip" onClick={() => addQty(n)}>+{n}</button>)}
                  {quantity !== '' && <button type="button" className="ad-chip" onClick={() => setQuantity('')}>សម្អាត</button>}
                </div>
              </div>
              <div>
                <div className="pm-lab"><span>មូលហេតុ (Reason)</span></div>
                <input className="pm-in" type="text" placeholder="ឧ. ទំនិញខូចពីការដឹកជញ្ជូន..." value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="ad-quick">{REASONS.map((r) => <button type="button" key={r} className="ad-chip" onClick={() => setReason(r)}>{r}</button>)}</div>
              </div>
            </div>
          </section>

          <div className={`ad-preview${negative ? ' bad' : ''}`} aria-live="polite">
            <div className="ad-flow">
              <div><span>មុន</span><b>{current}</b></div>
              <ArrowRight size={18} />
              <div className="next"><span>ក្រោយ</span><b>{hasQty ? next : '–'}</b></div>
            </div>
            {hasQty && <span className="ad-delta">{delta > 0 ? '+' : ''}{delta}</span>}
          </div>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បោះបង់</button>
          <button type="submit" className="pm-btn primary" disabled={submitting || invalidQty || negative}>
            {submitting ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} />}
            {submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក (Save)'}
          </button>
        </div>
      </form>
    </div>
  );
}