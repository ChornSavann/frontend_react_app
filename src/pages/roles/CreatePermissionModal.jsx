// src/pages/roles/CreatePermissionModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { createPermission } from '../../services/rolePermissionService';
import { modalCss } from '../products/modalStyles';

export default function CreatePermissionModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { if (isOpen) { setForm({ name: '', description: '' }); setErrorMsg(''); } }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await createPermission({ name: form.name.trim(), description: form.description.trim() });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(err?.message || 'បរាជ័យក្នុងការបង្កើត Permission ថ្មី');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pm-overlay">
      <style>{modalCss}</style>
      <form className="pm" style={{ maxWidth: 520 }} onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label="Create permission">
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Lock size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}><h3>បង្កើតសិទ្ធិថ្មី</h3><p>បន្ថែមសិទ្ធិថ្មីសម្រាប់គ្រប់គ្រងមុខងារប្រព័ន្ធ</p></div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="pm-body">
          {errorMsg && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{errorMsg}</span></div>}
          <div className="pm-grid">
            <div className="pm-full">
              <div className="pm-lab"><span>ឈ្មោះសិទ្ធិ (Permission Name)<em>*</em></span></div>
              <input className="pm-in" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="ឧ. create-product, view-reports..." autoFocus />
            </div>
            <div className="pm-full">
              <div className="pm-lab"><span>បរិយាយ (Description)</span></div>
              <textarea className="pm-in" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="ពណ៌នាពីសិទ្ធិនេះ..." />
            </div>
          </div>
        </div>
        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បោះបង់</button>
          <button type="submit" className="pm-btn primary" disabled={submitting}>{submitting ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} />} {submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}</button>
        </div>
      </form>
    </div>
  );
}