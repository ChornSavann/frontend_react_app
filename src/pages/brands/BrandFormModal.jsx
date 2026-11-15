// src/pages/brands/BrandFormModal.jsx
// Shared form used by CreateBrandModal and EditBrandModal
import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Tag, Pencil, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { createBrand, updateBrand } from '../../services/brandService';
import { modalCss } from '../products/modalStyles';
import { brandCss } from './brandStyles';

const makeSlug = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u1780-\u17FF]+/g, '')
    .replace(/\-\-+/g, '-');

export default function BrandFormModal({ mode = 'create', isOpen, brand, onClose, onSuccess }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ត្រៀមទិន្នន័យ Form ពេលបើក Modal
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setLogoFile(null);
    if (isEdit && brand) {
      setForm({ name: brand.name || '', slug: brand.slug || makeSlug(brand.name || ''), description: brand.description || '' });
      setLogoPreview(brand.image_url || brand.logo_url || null);
      setSlugTouched(true); // កុំប្តូរ slug ចាស់ដោយស្វ័យប្រវត្តិពេលកែឈ្មោះ
    } else {
      setForm({ name: '', slug: '', description: '' });
      setLogoPreview(null);
      setSlugTouched(false);
    }
  }, [isOpen, isEdit, brand]);

  // បិទដោយ Esc
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((p) => ({ ...p, name, slug: slugTouched ? p.slug : makeSlug(name) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'slug') setSlugTouched(true);
    setForm((p) => ({ ...p, [name]: value }));
  };

  const regenerate = () => { setForm((p) => ({ ...p, slug: makeSlug(p.name) })); setSlugTouched(false); };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const undoLogo = () => {
    setLogoFile(null);
    setLogoPreview(isEdit ? brand?.image_url || brand?.logo_url || null : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit && !brand?.id) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug || makeSlug(form.name));
      fd.append('description', form.description || '');
      if (logoFile) {
        fd.append('logo', logoFile);
        fd.append('image', logoFile); // ការពារករណី Backend ចាប់យកឈ្មោះ image ឬ logo
      }
      if (isEdit) await updateBrand(brand.id, fd);
      else await createBrand(fd);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(first) ? first[0] : String(first));
      } else {
        setErrorMsg(err?.message || (isEdit ? 'បរាជ័យក្នុងការកែប្រែម៉ាកទំនិញ' : 'បរាជ័យក្នុងការបង្កើតម៉ាកទំនិញថ្មី'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || (isEdit && !brand)) return null;
  const Icon = isEdit ? Pencil : Tag;
  const initial = (form.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="pm-overlay">
      <style>{modalCss}{brandCss}</style>
      <form className="pm" style={{ maxWidth: 600 }} onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit brand' : 'Create brand'}>
        <div className="pm-head">
          <div className="pm-head-l">
            <div className="pm-ico"><Icon size={20} strokeWidth={2.2} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>{isEdit ? 'កែប្រែម៉ាកទំនិញ' : 'បន្ថែមម៉ាកទំនិញថ្មី'}</h3>
              <p>{isEdit ? `${brand.name} · ID #${brand.id}` : 'បង្កើតម៉ាកសញ្ញាទំនិញសម្រាប់ប្រព័ន្ធ POS & Inventory'}</p>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="pm-body">
          {errorMsg && <div className="pm-err" role="alert"><AlertCircle size={17} /><span>{errorMsg}</span></div>}

          <section className="pm-sec">
            <h4>ព័ត៌មានម៉ាក</h4>
            <div className="pm-grid">
              <div className="pm-full">
                <div className="pm-lab"><span>ឈ្មោះម៉ាកទំនិញ (Brand Name)<em>*</em></span></div>
                <input className="pm-in" type="text" name="name" value={form.name} onChange={handleNameChange} required placeholder="ឧ. Exprez, Coca-Cola, Vital..." autoFocus />
              </div>
              <div className="pm-full">
                <div className="pm-lab">
                  <span>Slug</span>
                  <button type="button" className="pm-link" onClick={regenerate}><Sparkles size={13} /> បង្កើតពីឈ្មោះ</button>
                </div>
                <input className="pm-in br-slug" type="text" name="slug" value={form.slug} onChange={handleChange} placeholder="exprez" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 }} />
                {!isEdit && !slugTouched && <div className="pm-note"><span>Slug ត្រូវបានបង្កើតស្វ័យប្រវត្តិពីឈ្មោះ</span></div>}
              </div>
              <div className="pm-full">
                <div className="pm-lab"><span>ការពិពណ៌នា (Description)</span></div>
                <textarea className="pm-in" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="ឧ. Brand of product Exprez make in cambodia..." />
              </div>
            </div>
          </section>

          <section className="pm-sec">
            <h4>រូបសញ្ញាម៉ាក (Logo)</h4>
            <div className="pm-drop">
              <div className="pm-thumb logo" style={{ fontSize: 26, fontWeight: 800, color: '#0f766e' }}>
                {logoPreview
                  ? <img src={logoPreview} alt="Logo preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : (form.name ? initial : <Upload size={22} />)}
              </div>
              <div className="pm-drop-t">
                <b>{logoFile ? logoFile.name : isEdit ? 'ជ្រើសរើសរូបថ្មីបើចង់ប្តូរ' : 'ផ្ទុករូបសញ្ញាឡើង'}</b>
                <small>{isEdit ? 'ទុកដដែលប្រសិនបើមិនចង់ប្តូររូបសញ្ញាចាស់' : 'JPG, PNG, WEBP (មិនលើស 2MB)'}</small>
                <div className="pm-drop-b">
                  <label className="pm-btn sm" style={{ cursor: 'pointer', position: 'relative' }}>
                    <Upload size={14} /> ជ្រើសរើសរូបភាព
                    <input className="pm-file" type="file" accept="image/*" onChange={handleLogoChange} />
                  </label>
                  {logoFile && <button type="button" className="pm-btn sm" onClick={undoLogo}>មិនយក</button>}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="pm-foot">
          <button type="button" className="pm-btn" onClick={onClose}>បោះបង់</button>
          <button type="submit" className="pm-btn primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="pm-spin" /> : <Save size={16} />}
            {submitting ? 'កំពុងរក្សាទុក...' : isEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុកម៉ាក'}
          </button>
        </div>
      </form>
    </div>
  );
}