// src/pages/purchases/PurchaseFormModal.jsx
// Shared form used by CreatePurchaseModal and EditPurchaseModal
import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Save, Sparkles, PackagePlus, UserCheck, Receipt, Pencil, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { createPurchase, updatePurchase, getSuppliers } from '../../services/purchaseService';
import { listproduct } from '../../services/productService';
import api from '../../services/api';
import { modalCss } from '../products/modalStyles';
import { purchaseCss } from './purchaseStyles';

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.suppliers)) return res.suppliers;
  if (Array.isArray(res?.products)) return res.products;
  return [];
};

const mergeById = (arr1 = [], arr2 = []) => {
  const map = new Map();
  [...arr1, ...arr2].forEach((item) => { if (item && item.id) map.set(item.id, item); });
  return Array.from(map.values());
};

// 🟢 ចាប់យកព័ត៌មាន User (id និង name) ដែលកំពុង Login ពី localStorage ឬ JWT Token
const getLoggedInUser = () => {
  let id = null;
  let name = localStorage.getItem('user_name') || '';
  try {
    const directId = localStorage.getItem('user_id') || localStorage.getItem('userId') || localStorage.getItem('id');
    if (directId && !isNaN(Number(directId))) id = Number(directId);

    for (const k of ['user', 'auth_user', 'userData', 'profile']) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        const foundId = parsed?.id || parsed?.user?.id || parsed?.data?.id;
        const foundName = parsed?.name || parsed?.user?.name || parsed?.data?.name;
        if (!id && foundId && !isNaN(Number(foundId))) id = Number(foundId);
        if (!name && foundName) name = foundName;
      }
    }

    if (!id) {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (token && token.split('.').length === 3) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const subId = payload?.sub || payload?.user_id || payload?.id;
        if (subId && !isNaN(Number(subId))) id = Number(subId);
      }
    }
  } catch (e) {
    console.error('Error reading logged in user:', e);
  }
  return { id, name: name || 'Admin' };
};

const NONE = [];
const EMPTY_ITEM = { product_id: '', product_name: '', unit_cost: '', quantity: 1 };
const EMPTY_FORM = { purchase_number: '', supplier_id: '', payment_method: 'cash', status: 'completed', discount: '0', tax: '0', notes: '' };
const makeNumber = () => {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `PUR-${d}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const PAYMENTS = [
  { key: 'cash', label: 'Cash' },
  { key: 'khqr', label: 'KHQR / ABA' },
  { key: 'bank', label: 'Bank' },
  { key: 'credit', label: 'Credit' },
];

export default function PurchaseFormModal({ mode = 'create', isOpen, purchase, onClose, onSuccess, existingSuppliers = NONE }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [currentUser, setCurrentUser] = useState(() => getLoggedInUser());
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ១. ត្រៀមទិន្នន័យ Form ពេលបើក Modal
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    if (isEdit && purchase) {
      setForm({
        purchase_number: purchase.purchase_number || '',
        supplier_id: purchase.supplier_id ?? purchase.supplier?.id ?? '',
        payment_method: purchase.payment_method || 'cash',
        status: purchase.status || 'completed',
        discount: purchase.discount ?? '0',
        tax: purchase.tax ?? '0',
        notes: purchase.notes || '',
      });
      setItems(
        Array.isArray(purchase.items) && purchase.items.length
          ? purchase.items.map((it) => ({
              id: it.id,
              product_id: it.product_id ?? it.product?.id ?? '',
              product_name: it.product_name || it.product?.name || '',
              unit_cost: it.unit_cost ?? '0.00',
              quantity: it.quantity ?? 1,
            }))
          : [{ ...EMPTY_ITEM }]
      );
    } else {
      setForm({ ...EMPTY_FORM, purchase_number: makeNumber() });
      setItems([{ ...EMPTY_ITEM }]);
    }
  }, [isOpen, isEdit, purchase]);

  // ២. ទាញយក User, Suppliers និង Products
  useEffect(() => {
    if (!isOpen) return undefined;
    setSuppliers(existingSuppliers);
    let cancelled = false;

    if (!isEdit) {
      const localUser = getLoggedInUser();
      setCurrentUser(localUser);
      if (!localUser.id) {
        api.get('/user').then((res) => {
          const u = res.data?.user || res.data?.data || res.data;
          if (u && u.id && !cancelled) {
            localStorage.setItem('user_id', String(u.id));
            if (u.name) localStorage.setItem('user_name', u.name);
            localStorage.setItem('user', JSON.stringify(u));
            setCurrentUser({ id: Number(u.id), name: u.name || localUser.name });
          }
        }).catch(() => {});
      }
    }

    (async () => {
      try {
        const [supRes, prodRes] = await Promise.all([getSuppliers(), listproduct().catch(() => [])]);
        if (cancelled) return;
        setSuppliers(mergeById(extractArray(supRes), existingSuppliers));
        const inInvoice = (purchase?.items || []).map((it) => it.product).filter(Boolean);
        setProducts(mergeById(extractArray(prodRes), inInvoice));
      } catch (err) {
        console.error('Error loading purchase form data:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, isEdit, purchase, existingSuppliers]);

  // បិទដោយ Esc
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const handleFormChange = (e) => setField(e.target.name, e.target.value);

  // ជ្រើសរើសទំនិញ → បំពេញឈ្មោះ និងតម្លៃដើមស្វ័យប្រវត្តិ
  const handleProductSelect = (index, productId) => {
    const sel = products.find((p) => String(p.id) === String(productId));
    setItems((prev) => prev.map((row, i) => (i === index
      ? { ...row, product_id: productId, product_name: sel?.name || '', unit_cost: sel?.cost_price ?? row.unit_cost ?? '0.00' }
      : row)));
  };
  const handleItemChange = (index, field, value) => setItems((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  const addItemRow = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItemRow = (index) => { if (items.length > 1) setItems((prev) => prev.filter((_, i) => i !== index)); };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + parseFloat(it.unit_cost || 0) * parseFloat(it.quantity || 0), 0);
    const discount = parseFloat(form.discount || 0);
    const tax = parseFloat(form.tax || 0);
    return { subtotal, discount, tax, total: Math.max(0, subtotal - discount + tax) };
  }, [items, form.discount, form.tax]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !purchase?.id) return;
    setErrorMsg('');

    const validItems = items.filter((it) => it.product_id && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      setErrorMsg('សូមជ្រើសរើសទំនិញយ៉ាងតិច ១ មុខ និងបញ្ចូលបរិមាណឱ្យបានត្រឹមត្រូវ។');
      return;
    }

    setSubmitting(true);
    try {
      const userId = isEdit ? (purchase.user_id ?? purchase.user?.id) : (currentUser.id || getLoggedInUser().id);
      const payload = {
        purchase_number: form.purchase_number,
        supplier_id: Number(form.supplier_id),
        ...(userId ? { user_id: Number(userId) } : {}),
        subtotal: Number(totals.subtotal.toFixed(2)),
        discount: Number(totals.discount.toFixed(2)),
        tax: Number(totals.tax.toFixed(2)),
        total: Number(totals.total.toFixed(2)),
        payment_method: form.payment_method,
        status: form.status,
        notes: form.notes || null,
        items: validItems.map((it) => {
          const cost = parseFloat(it.unit_cost || 0);
          const qty = Number(it.quantity || 1);
          return {
            ...(isEdit && it.id ? { id: it.id } : {}),
            product_id: Number(it.product_id),
            product_name: it.product_name,
            unit_cost: Number(cost.toFixed(2)),
            quantity: qty,
            total_price: Number((cost * qty).toFixed(2)),
          };
        }),
      };

      if (isEdit) await updatePurchase(purchase.id, payload);
      else await createPurchase(payload);

      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(err?.message || (isEdit ? 'បរាជ័យក្នុងការកែប្រែវិក្កយបត្រទិញចូល' : 'បរាជ័យក្នុងការបង្កើតវិក្កយបត្រទិញចូល'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || (isEdit && !purchase)) return null;

  const statuses = [
    { key: 'completed', label: 'Completed', tone: 'good' },
    { key: 'pending', label: 'Pending', tone: 'warn' },
    ...(isEdit ? [{ key: 'cancelled', label: 'Cancelled', tone: 'bad' }] : []),
  ];
  const HeadIcon = isEdit ? Pencil : Receipt;

  return (
    <div className="pm-overlay">
      <style>{modalCss}{purchaseCss}</style>
      <form className="pm wide" onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit purchase' : 'Create purchase'}>
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><HeadIcon size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>{isEdit ? 'កែប្រែវិក្កយបត្រទិញចូល' : 'បង្កើតការទិញទំនិញចូលស្តុកថ្មី'}</h3>
              <p>{isEdit ? `${purchase.purchase_number} · ID #${purchase.id}` : 'កត់ត្រាទំនិញដែលទិញពីអ្នកផ្គត់ផ្គង់ ហើយបន្ថែមចូលស្តុក'}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          {errorMsg && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{errorMsg}</span></div>}

          <section className="pm-sec">
            <h4>ព័ត៌មានវិក្កយបត្រ</h4>
            <div className="pm-grid">
              <div>
                <div className="pm-lab">
                  <span>លេខវិក្កយបត្រ (Purchase #)<em>*</em></span>
                  {!isEdit && <button type="button" className="pm-link" onClick={() => setField('purchase_number', makeNumber())}><Sparkles size={13} /> បង្កើតថ្មី</button>}
                </div>
                <input className="pm-in" type="text" name="purchase_number" value={form.purchase_number} onChange={handleFormChange} required placeholder="PUR-20261113-1689" />
              </div>
              <div>
                <div className="pm-lab"><span>អ្នកផ្គត់ផ្គង់ (Supplier)<em>*</em></span></div>
                <select className="pm-in" name="supplier_id" value={form.supplier_id} onChange={handleFormChange} required>
                  <option value="">-- ជ្រើសរើសអ្នកផ្គត់ផ្គង់ --</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.company ? `${s.company} (${s.name})` : s.name}</option>)}
                </select>
              </div>
              <div>
                <div className="pm-lab"><span>វិធីទូទាត់ (Payment)</span></div>
                <div className="pp-seg" role="radiogroup" aria-label="Payment method">
                  {PAYMENTS.map((p) => (
                    <button type="button" key={p.key} role="radio" aria-checked={form.payment_method === p.key} className={form.payment_method === p.key ? 'on' : ''} onClick={() => setField('payment_method', p.key)}>{p.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="pm-lab"><span>ស្ថានភាព (Status)</span></div>
                <div className="pp-seg" role="radiogroup" aria-label="Status">
                  {statuses.map((s) => (
                    <button type="button" key={s.key} role="radio" aria-checked={form.status === s.key} className={form.status === s.key ? `on ${s.tone}` : ''} onClick={() => setField('status', s.key)}>{s.label}</button>
                  ))}
                </div>
              </div>
            </div>
            {!isEdit && form.status === 'completed' && <div className="pm-note"><span className="pm-chip good">ស្តុកនឹងកើនឡើងភ្លាមៗពេលរក្សាទុក</span></div>}
          </section>

          <section className="pm-sec">
            <div className="pp-sec-head">
              <h4>មុខទំនិញទិញចូល</h4>
              <button type="button" className="pm-btn sm primary" onClick={addItemRow}><Plus size={14} /> បន្ថែមទំនិញ</button>
            </div>
            <div className="pp-cols"><span>ទំនិញ (Product)</span><span>តម្លៃដើម ($)</span><span>បរិមាណ</span><span>សរុប</span><span /></div>
            <div className="pp-items">
              {items.map((row, idx) => {
                const prod = products.find((p) => String(p.id) === String(row.product_id));
                const cur = Number(prod?.stock_quantity || 0);
                const qty = Number(row.quantity || 0);
                const line = parseFloat(row.unit_cost || 0) * parseFloat(row.quantity || 0);
                return (
                  <div className="pp-item" key={idx}>
                    <div>
                      <select className="pm-in" value={row.product_id} onChange={(e) => handleProductSelect(idx, e.target.value)} required aria-label="Product">
                        <option value="">-- ជ្រើសរើសទំនិញ --</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku || 'No SKU'}) · ស្តុក {p.stock_quantity ?? 0}</option>)}
                      </select>
                      {prod && (
                        <div className="pp-hint">
                          ស្តុកបច្ចុប្បន្ន <b>{cur}</b>
                          {!isEdit && form.status === 'completed' && qty > 0 && <><ArrowRight size={12} /><span className="up">{cur + qty}</span></>}
                        </div>
                      )}
                    </div>
                    <div className="pm-money"><span>$</span><input className="pm-in" type="number" step="0.01" min="0" value={row.unit_cost} onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)} required placeholder="0.00" aria-label="Unit cost" /></div>
                    <input className="pm-in" type="number" step="1" min="1" value={row.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} required aria-label="Quantity" />
                    <div className="pp-line">${line.toFixed(2)}</div>
                    <button type="button" className="pp-del" onClick={() => removeItemRow(idx)} disabled={items.length <= 1} aria-label="Remove item"><Trash2 size={16} /></button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="pp-bottom">
            <div>
              <div className="pm-lab"><span>កំណត់ចំណាំ (Notes)</span></div>
              <textarea className="pm-in" name="notes" rows={5} value={form.notes} onChange={handleFormChange} placeholder="បញ្ចូលកំណត់ចំណាំបន្ថែមសម្រាប់វិក្កយបត្រនេះ..." />
              {!isEdit && (
                <div className="pm-note"><span className="pm-chip"><UserCheck size={13} /> អ្នកកត់ត្រា៖ {currentUser.name}{currentUser.id ? ` (#${currentUser.id})` : ''}</span></div>
              )}
            </div>
            <div className="pp-total">
              <div className="row"><span>សរុបបឋម (Subtotal)</span><b>${totals.subtotal.toFixed(2)}</b></div>
              <div className="row"><span>បញ្ចុះតម្លៃ ($)</span><input className="pm-in" type="number" step="0.01" min="0" name="discount" value={form.discount} onChange={handleFormChange} aria-label="Discount" /></div>
              <div className="row"><span>ពន្ធ ($)</span><input className="pm-in" type="number" step="0.01" min="0" name="tax" value={form.tax} onChange={handleFormChange} aria-label="Tax" /></div>
              <div className="pp-grand"><span>ទឹកប្រាក់សរុប</span><b>${totals.total.toFixed(2)}</b></div>
            </div>
          </section>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បោះបង់</button>
          <button type="submit" className="pm-btn primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} />}
            {submitting ? 'កំពុងរក្សាទុក...' : isEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុកការទិញចូល'}
          </button>
        </div>
      </form>
    </div>
  );
}