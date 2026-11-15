// src/pages/expenses/ExpenseTypeFormModal.jsx
// Shared form used by CreateExpenseTypeModal and EditExpenseTypeModal
import React, { useState, useEffect } from 'react';
import { X, Save, FolderPlus, Pencil, AlertCircle, Loader2 } from 'lucide-react';
import { createExpenseType, updateExpenseType } from '../../services/expenseService';
import { modalCss } from '../products/modalStyles';

export default function ExpenseTypeFormModal({ mode = 'create', isOpen, expenseType, onClose, onSuccess }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({ name: '', description: '', is_active: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    if (isEdit && expenseType) {
      setForm({ name: expenseType.name || '', description: expenseType.description || '', is_active: Number(expenseType.is_active ?? 1) === 1 ? 1 : 0 });
    } else {
      setForm({ name: '', description: '', is_active: 1 });
    }
  }, [isOpen, isEdit, expenseType]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !expenseType?.id) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = { name: form.name.trim(), description: form.description || null, is_active: form.is_active ? 1 : 0 };
      if (isEdit) await updateExpenseType(expenseType.id, payload);
      else await createExpenseType(payload);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(err?.message || (isEdit ? 'បរាជ័យក្នុងការកែប្រែប្រភេទការចំណាយ' : 'បរាជ័យក្នុងការបង្កើតប្រភេទការចំណាយ'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || (isEdit && !expenseType)) return null;
  const Icon = isEdit ? Pencil : FolderPlus;

  return (
    <div className="pm-overlay">
      <style>{modalCss}</style>
      <form className="pm" style={{ maxWidth: 540 }} onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit expense type' : 'Create expense type'}>
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Icon size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>{isEdit ? 'កែប្រែប្រភេទការចំណាយ' : 'បន្ថែមប្រភេទការចំណាយ'}</h3>
              <p>{isEdit ? `${expenseType.name} · ID #${expenseType.id}` : 'ឧ. ថ្លៃទឹកភ្លើង, ថ្លៃជួលហាង, ប្រាក់ខែបុគ្គលិក...'}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          {errorMsg && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{errorMsg}</span></div>}
          <section className="pm-sec">
            <h4>ព័ត៌មានប្រភេទ</h4>
            <div className="pm-grid">
              <div className="pm-full">
                <div className="pm-lab"><span>ឈ្មោះប្រភេទការចំណាយ (Type Name)<em>*</em></span></div>
                <input className="pm-in" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="ឧ. ថ្លៃទឹកភ្លើង និងអ៊ីនធឺណិត" autoFocus />
              </div>
              <div className="pm-full">
                <div className="pm-lab"><span>ការពិពណ៌នា (Description)</span></div>
                <textarea className="pm-in" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="បញ្ចូលព័ត៌មានលម្អិតអំពីប្រភេទការចំណាយនេះ..." />
              </div>
            </div>
          </section>
          <label className="pm-switch">
            <input type="checkbox" name="is_active" checked={Number(form.is_active) === 1} onChange={handleChange} />
            <span className="pm-track" />
            <span><b>ដាក់ឱ្យដំណើរការ (Active)</b><small>អាចជ្រើសរើសប្រភេទនេះពេលកត់ត្រាការចំណាយ</small></span>
          </label>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បោះបង់</button>
          <button type="submit" className="pm-btn primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} />}
            {submitting ? 'កំពុងរក្សាទុក...' : isEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុក'}
          </button>
        </div>
      </form>
    </div>
  );
}