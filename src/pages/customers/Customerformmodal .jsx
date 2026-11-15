// src/pages/customers/CustomerFormModal.jsx
// Shared form used by CreateCustomerModal and EditCustomerModal
import React, { useState, useEffect } from 'react';
import { X, Upload, Save, UserPlus, Pencil, Award, AlertCircle, Loader2 } from 'lucide-react';
import { createCustomer, updateCustomer } from '../../services/customerService';
import { modalCss } from '../products/modalStyles';

const EMPTY = { name: '', phone: '', email: '', address: '', points: '0', notes: '', is_active: 1 };

export default function CustomerFormModal({ mode = 'create', isOpen, customer, onClose, onSuccess }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ត្រៀមទិន្នន័យ Form ពេលបើក Modal
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setImageFile(null);
    if (isEdit && customer) {
      setForm({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        points: customer.points ?? '0',
        notes: customer.notes || '',
        is_active: Number(customer.is_active ?? 1) === 1 ? 1 : 0,
      });
      setImagePreview(customer.image_url || null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
    }
  }, [isOpen, isEdit, customer]);

  // បិទដោយ Esc
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  const addPoints = (n) => setForm((p) => ({ ...p, points: String((Number(p.points) || 0) + n) }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const undoImage = () => {
    setImageFile(null);
    setImagePreview(isEdit ? customer?.image_url || null : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !customer?.id) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone || '');
      if (isEdit) {
        fd.append('email', form.email || '');
        fd.append('address', form.address || '');
        fd.append('notes', form.notes || '');
      } else {
        if (form.email) fd.append('email', form.email);
        if (form.address) fd.append('address', form.address);
        if (form.notes) fd.append('notes', form.notes);
      }
      fd.append('points', form.points !== '' ? Number(form.points) : 0);
      fd.append('is_active', form.is_active ? 1 : 0);
      if (imageFile) fd.append('image', imageFile);

      if (isEdit) await updateCustomer(customer.id, fd);
      else await createCustomer(fd);

      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(err?.message || (isEdit ? 'បរាជ័យក្នុងការកែប្រែព័ត៌មានអតិថិជន' : 'បរាជ័យក្នុងការបង្កើតអតិថិជនថ្មី'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || (isEdit && !customer)) return null;
  const Icon = isEdit ? Pencil : UserPlus;
  const initial = (form.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="pm-overlay">
      <style>{modalCss}</style>
      <form className="pm" style={{ maxWidth: 680 }} onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit customer' : 'Create customer'}>
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Icon size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>{isEdit ? 'កែប្រែព័ត៌មានអតិថិជន' : 'បន្ថែមអតិថិជនថ្មី'}</h3>
              <p>{isEdit ? `${customer.name} · ID #${customer.id}` : 'បំពេញព័ត៌មានអតិថិជន និងពិន្ទុសន្សំសម្រាប់ប្រព័ន្ធលក់ POS'}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          {errorMsg && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{errorMsg}</span></div>}

          <section className="pm-sec">
            <h4>ព័ត៌មានទំនាក់ទំនង</h4>
            <div className="pm-grid">
              <div>
                <div className="pm-lab"><span>ឈ្មោះអតិថិជន (Name)<em>*</em></span></div>
                <input className="pm-in" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="ឧ. សុខ សាន្ត (Sok San)" autoFocus />
              </div>
              <div>
                <div className="pm-lab"><span>លេខទូរស័ព្ទ (Phone)<em>*</em></span></div>
                <input className="pm-in" type="text" name="phone" value={form.phone} onChange={handleChange} required placeholder="ឧ. 012 345 678" />
              </div>
              <div>
                <div className="pm-lab"><span>អ៊ីមែល (Email)</span></div>
                <input className="pm-in" type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@gmail.com" />
              </div>
              <div>
                <div className="pm-lab"><span>អាសយដ្ឋាន (Address)</span></div>
                <input className="pm-in" type="text" name="address" value={form.address} onChange={handleChange} placeholder="ឧ. ភ្នំពេញ, កម្ពុជា" />
              </div>
            </div>
          </section>

          <section className="pm-sec">
            <h4>ពិន្ទុសន្សំ (Loyalty)</h4>
            <div className="pm-grid">
              <div>
                <div className="pm-lab"><span>{isEdit ? 'ពិន្ទុបច្ចុប្បន្ន (Points)' : 'ពិន្ទុដំបូង (Points)'}</span></div>
                <input className="pm-in" type="number" step="1" min="0" name="points" value={form.points} onChange={handleChange} placeholder="0" />
              </div>
              <div>
                <div className="pm-lab"><span>បន្ថែមរហ័ស</span></div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[10, 50, 100].map((n) => <button key={n} type="button" className="pm-btn sm" onClick={() => addPoints(n)}><Award size={13} /> +{n}</button>)}
                  <button type="button" className="pm-btn sm" onClick={() => setForm((p) => ({ ...p, points: '0' }))}>Reset</button>
                </div>
              </div>
            </div>
          </section>

          <section className="pm-sec">
            <h4>កំណត់ចំណាំ</h4>
            <textarea className="pm-in" name="notes" rows={2} value={form.notes} onChange={handleChange} placeholder="ព័ត៌មានបន្ថែមអំពីអតិថិជន..." />
          </section>

          <section className="pm-sec">
            <h4>រូបភាពអតិថិជន</h4>
            <div className="pm-drop">
              <div className="pm-thumb" style={{ borderRadius: '50%', fontSize: 24, fontWeight: 800, color: '#0f766e', background: '#e0f4f1' }}>
                {imagePreview
                  ? <img src={imagePreview} alt="Preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : (form.name ? initial : <Upload size={22} />)}
              </div>
              <div className="pm-drop-t">
                <b>{imageFile ? imageFile.name : isEdit ? 'ជ្រើសរើសរូបថ្មីបើចង់ប្តូរ' : 'ផ្ទុករូបភាពឡើង (បើមាន)'}</b>
                <small>{isEdit ? 'ទុកដដែលប្រសិនបើមិនចង់ប្តូររូបភាពចាស់' : 'JPG, PNG, WEBP'}</small>
                <div className="pm-drop-b">
                  <label className="pm-btn sm" style={{ cursor: 'pointer', position: 'relative' }}>
                    <Upload size={14} /> ជ្រើសរើសរូបភាព
                    <input className="pm-file" type="file" accept="image/*" onChange={handleImageChange} />
                  </label>
                  {imageFile && <button type="button" className="pm-btn sm" onClick={undoImage}>មិនយក</button>}
                </div>
              </div>
            </div>
          </section>

          <label className="pm-switch">
            <input type="checkbox" name="is_active" checked={Number(form.is_active) === 1} onChange={handleChange} />
            <span className="pm-track" />
            <span><b>ដាក់ឱ្យដំណើរការ (Active)</b><small>អតិថិជនអាចត្រូវបានជ្រើសរើសក្នុង POS</small></span>
          </label>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បោះបង់</button>
          <button type="submit" className="pm-btn primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} />}
            {submitting ? 'កំពុងរក្សាទុក...' : isEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុកអតិថិជន'}
          </button>
        </div>
      </form>
    </div>
  );
}