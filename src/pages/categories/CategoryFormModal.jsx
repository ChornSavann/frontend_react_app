// src/pages/categories/CategoryFormModal.jsx
// Shared form used by CreateCategoryModal and EditCategoryModal
import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Layers, Pencil, AlertCircle, Loader2 } from 'lucide-react';
import { createCategory, updateCategory } from '../../services/categoryService';
import { modalCss } from '../products/modalStyles';
import { brandCss } from '../brands/brandStyles';

export default function CategoryFormModal({ mode = 'create', isOpen, category, onClose, onSuccess }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ត្រៀមទិន្នន័យ Form ពេលបើក Modal
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setImageFile(null);
    if (isEdit && category) {
      setForm({ name: category.name || '', description: category.description || '' });
      setImagePreview(category.image_url || null);
    } else {
      setForm({ name: '', description: '' });
      setImagePreview(null);
    }
  }, [isOpen, isEdit, category]);

  // បិទដោយ Esc
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const undoImage = () => {
    setImageFile(null);
    setImagePreview(isEdit ? category?.image_url || null : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !category?.id) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description || '');
      if (imageFile) fd.append('image', imageFile);

      if (isEdit) await updateCategory(category.id, fd);
      else await createCategory(fd);

      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(err?.message || (isEdit ? 'បរាជ័យក្នុងការកែប្រែប្រភេទទំនិញ' : 'បរាជ័យក្នុងការបង្កើតប្រភេទទំនិញថ្មី'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || (isEdit && !category)) return null;
  const Icon = isEdit ? Pencil : Layers;
  const initial = (form.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="pm-overlay">
      <style>{modalCss}{brandCss}</style>
      <form className="pm" style={{ maxWidth: 600 }} onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit category' : 'Create category'}>
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Icon size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>{isEdit ? 'កែប្រែប្រភេទទំនិញ' : 'បន្ថែមប្រភេទទំនិញថ្មី'}</h3>
              <p>{isEdit ? `${category.name} · ID #${category.id}` : 'បង្កើតប្រភេទទំនិញសម្រាប់រៀបចំទំនិញក្នុងប្រព័ន្ធ POS & Inventory'}</p>
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
                <div className="pm-lab"><span>ឈ្មោះប្រភេទទំនិញ (Category Name)<em>*</em></span></div>
                <input className="pm-in" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="ឧ. អាហារកែច្នៃ, ភេសជ្ជៈ, គ្រឿងទេស..." autoFocus />
              </div>
              <div className="pm-full">
                <div className="pm-lab"><span>ការពិពណ៌នា (Description)</span></div>
                <textarea className="pm-in" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="បញ្ចូលព័ត៌មានលម្អិតអំពីប្រភេទទំនិញនេះ..." />
              </div>
            </div>
          </section>

          <section className="pm-sec">
            <h4>រូបភាពប្រភេទទំនិញ</h4>
            <div className="pm-drop">
              <div className="pm-thumb" style={{ fontSize: 26, fontWeight: 800, color: '#0f766e', background: '#e0f4f1' }}>
                {imagePreview
                  ? <img src={imagePreview} alt="Preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : (form.name ? initial : <Upload size={22} />)}
              </div>
              <div className="pm-drop-t">
                <b>{imageFile ? imageFile.name : isEdit ? 'ជ្រើសរើសរូបថ្មីបើចង់ប្តូរ' : 'ផ្ទុករូបភាពឡើង'}</b>
                <small>{isEdit ? 'ទុកដដែលប្រសិនបើមិនចង់ប្តូររូបភាពចាស់' : 'JPG, PNG, WEBP (មិនលើស 2MB)'}</small>
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
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បោះបង់</button>
          <button type="submit" className="pm-btn primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} />}
            {submitting ? 'កំពុងរក្សាទុក...' : isEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុកប្រភេទ'}
          </button>
        </div>
      </form>
    </div>
  );
}