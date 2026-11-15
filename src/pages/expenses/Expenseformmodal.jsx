 
import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Wallet, Pencil, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { createExpense, updateExpense, listExpenseTypes } from '../../services/expenseService';
import api from '../../services/api';
import { modalCss } from '../products/modalStyles';
import { purchaseCss } from '../purchases/purchaseStyles';

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.expense_types)) return res.expense_types;
  if (Array.isArray(res?.expenseTypes)) return res.expenseTypes;
  return [];
};

const mergeById = (arr1 = [], arr2 = []) => {
  const map = new Map();
  [...arr1, ...arr2].forEach((item) => { if (item && item.id) map.set(item.id, item); });
  return Array.from(map.values());
};

// 🟢 ចាប់យកព័ត៌មាន User ដែលកំពុង Login
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
const today = () => new Date().toISOString().slice(0, 10);
const makeRef = () => `EXP-${today().replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
const EMPTY = { expense_type_id: '', reference_no: '', title: '', amount: '', expense_date: '', payment_method: 'cash', status: 'completed', description: '' };
const PAYMENTS = [
  { key: 'cash', label: 'Cash' },
  { key: 'khqr', label: 'KHQR / ABA' },
  { key: 'bank', label: 'Bank' },
];

export default function ExpenseFormModal({ mode = 'create', isOpen, expense, onClose, onSuccess, existingTypes = NONE }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(EMPTY);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => getLoggedInUser());
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ១. ត្រៀមទិន្នន័យ Form ពេលបើក Modal
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    if (isEdit && expense) {
      const rawDate = expense.expense_date || expense.date || expense.created_at || '';
      setForm({
        expense_type_id: expense.expense_type_id ?? expense.expense_type?.id ?? expense.expenseType?.id ?? '',
        reference_no: expense.reference_no || expense.expense_number || '',
        title: expense.title || expense.name || '',
        amount: expense.amount ?? '',
        expense_date: rawDate ? String(rawDate).slice(0, 10) : today(),
        payment_method: expense.payment_method || 'cash',
        status: expense.status || 'completed',
        description: expense.description || expense.notes || '',
      });
    } else {
      setForm({ ...EMPTY, reference_no: makeRef(), expense_date: today() });
    }
  }, [isOpen, isEdit, expense]);

  // ២. ទាញយក Expense Types និង User
  useEffect(() => {
    if (!isOpen) return undefined;
    setExpenseTypes(existingTypes);
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

    listExpenseTypes()
      .then((res) => { if (!cancelled) setExpenseTypes(mergeById(extractArray(res), existingTypes)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isOpen, isEdit, existingTypes]);

  // បិទដោយ Esc
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !expense?.id) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const userId = isEdit ? (expense.user_id ?? expense.user?.id) : (currentUser.id || getLoggedInUser().id);
      const payload = {
        expense_type_id: Number(form.expense_type_id),
        ...(userId ? { user_id: Number(userId) } : {}),
        reference_no: form.reference_no,
        expense_number: form.reference_no,
        title: form.title || form.description || 'Expense',
        name: form.title || form.description || 'Expense',
        amount: Number(parseFloat(form.amount || 0).toFixed(2)),
        expense_date: form.expense_date,
        date: form.expense_date,
        payment_method: form.payment_method,
        status: form.status,
        description: form.description || null,
        notes: form.description || null,
      };
      if (isEdit) await updateExpense(expense.id, payload);
      else await createExpense(payload);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(err?.message || (isEdit ? 'បរាជ័យក្នុងការកែប្រែទិន្នន័យការចំណាយ' : 'បរាជ័យក្នុងការកត់ត្រាការចំណាយថ្មី'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || (isEdit && !expense)) return null;
  const Icon = isEdit ? Pencil : Wallet;

  return (
    <div className="pm-overlay">
      <style>{modalCss}{purchaseCss}</style>
      <form className="pm" style={{ maxWidth: 660 }} onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit expense' : 'Create expense'}>
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Icon size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>{isEdit ? 'កែប្រែទិន្នន័យការចំណាយ' : 'កត់ត្រាការចំណាយថ្មី'}</h3>
              <p>{isEdit ? `${form.reference_no || 'Expense'} · ID #${expense.id}` : `អ្នកកត់ត្រា៖ ${currentUser.name}${currentUser.id ? ` (#${currentUser.id})` : ''}`}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          {errorMsg && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{errorMsg}</span></div>}

          <section className="pm-sec">
            <h4>ព័ត៌មានការចំណាយ</h4>
            <div className="pm-grid">
              <div>
                <div className="pm-lab"><span>ប្រភេទការចំណាយ (Type)<em>*</em></span></div>
                <select className="pm-in" name="expense_type_id" value={form.expense_type_id} onChange={handleChange} required>
                  <option value="">-- ជ្រើសរើសប្រភេទចំណាយ --</option>
                  {expenseTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <div className="pm-lab">
                  <span>លេខយោង (Reference #)</span>
                  {!isEdit && <button type="button" className="pm-link" onClick={() => setField('reference_no', makeRef())}><Sparkles size={13} /> បង្កើតថ្មី</button>}
                </div>
                <input className="pm-in" type="text" name="reference_no" value={form.reference_no} onChange={handleChange} placeholder="EXP-20261113-1234" />
              </div>
              <div className="pm-full">
                <div className="pm-lab"><span>ចំណងជើងចំណាយ (Title)<em>*</em></span></div>
                <input className="pm-in" type="text" name="title" value={form.title} onChange={handleChange} required placeholder="ឧ. បង់ថ្លៃអគ្គិសនីប្រចាំខែ" autoFocus />
              </div>
            </div>
          </section>

          <section className="pm-sec">
            <h4>ទឹកប្រាក់ និងការទូទាត់</h4>
            <div className="pm-grid">
              <div>
                <div className="pm-lab"><span>ចំនួនទឹកប្រាក់ (Amount)<em>*</em></span></div>
                <div className="pm-money"><span>$</span><input className="pm-in" type="number" step="0.01" min="0.01" name="amount" value={form.amount} onChange={handleChange} required placeholder="0.00" style={{ fontWeight: 800, fontSize: 15 }} /></div>
              </div>
              <div>
                <div className="pm-lab"><span>កាលបរិច្ឆេទ (Date)<em>*</em></span></div>
                <input className="pm-in" type="date" name="expense_date" value={form.expense_date} onChange={handleChange} required />
              </div>
              <div className="pm-full">
                <div className="pm-lab"><span>វិធីទូទាត់ (Payment)</span></div>
                <div className="pp-seg" role="radiogroup" aria-label="Payment method">
                  {PAYMENTS.map((p) => (
                    <button type="button" key={p.key} role="radio" aria-checked={form.payment_method === p.key} className={form.payment_method === p.key ? 'on' : ''} onClick={() => setField('payment_method', p.key)}>{p.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="pm-sec">
            <h4>កំណត់ចំណាំ</h4>
            <textarea className="pm-in" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="បញ្ចូលព័ត៌មានលម្អិតអំពីការចំណាយនេះ..." />
          </section>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បោះបង់</button>
          <button type="submit" className="pm-btn primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} />}
            {submitting ? 'កំពុងរក្សាទុក...' : isEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុកការចំណាយ'}
          </button>
        </div>
      </form>
    </div>
  );
}