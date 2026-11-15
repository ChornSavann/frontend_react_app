// src/pages/stores/EditStoreModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { updateStore } from '../../services/storeService';

export default function EditStoreModal({ isOpen, store, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    is_active: 1,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !store) return;

    setForm({
      name: store.name || '',
      code: store.code || '',
      phone: store.phone || '',
      email: store.email || '',
      address: store.address || '',
      is_active: Number(store.is_active ?? 1) === 1 ? 1 : 0,
    });

    setImageFile(null);
    setImagePreview(store.image_url || store.logo_url || null);
    setErrorMsg('');
  }, [isOpen, store]);

  if (!isOpen || !store) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!store?.id) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('code', form.code ? form.code.trim() : '');
      formData.append('phone', form.phone ? form.phone.trim() : '');
      formData.append('email', form.email ? form.email.trim() : '');
      formData.append('address', form.address ? form.address.trim() : '');
      formData.append('is_active', form.is_active ? 1 : 0);

      if (imageFile) {
        formData.append('image', imageFile);
        formData.append('logo', imageFile);
      }

      await updateStore(store.id, formData);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const firstErr = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(firstErr) ? firstErr[0] : String(firstErr));
      } else {
        setErrorMsg(err?.message || 'បរាជ័យក្នុងការកែប្រែព័ត៌មានហាង');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '13.5px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    colorScheme: 'light',
    textAlign: 'left',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'left',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans Khmer', sans-serif",
        textAlign: 'left',
        color: '#0f172a',
        colorScheme: 'light',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          borderRadius: '18px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 🟢 Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #063b37 0%, #0f766e 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
              ✏️ កែប្រែព័ត៌មានហាង (Edit Store)
            </h3>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>
              កែប្រែ៖ <strong>{store.name}</strong> (ID: #{store.id})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 🟢 Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 14px',
                borderRadius: '10px',
                marginBottom: '18px',
                fontSize: '13.5px',
                fontWeight: '500',
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* ឈ្មោះហាង */}
            <div>
              <label style={labelStyle}>ឈ្មោះហាង / សាខា (Store Name) *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            {/* លេខកូដហាង */}
            <div>
              <label style={labelStyle}>លេខកូដហាង (Store Code)</label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* លេខទូរស័ព្ទ */}
            <div>
              <label style={labelStyle}>លេខទូរស័ព្ទ (Phone Number)</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* អ៊ីមែល */}
            <div>
              <label style={labelStyle}>អ៊ីមែល (Email)</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* អាសយដ្ឋាន */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>អាសយដ្ឋាន (Address)</label>
              <textarea
                name="address"
                rows={2}
                value={form.address}
                onChange={handleChange}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* រូបភាព / Logo ហាង */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>រូបភាព / Logo ហាង (ជ្រើសរើសថ្មីបើចង់ប្តូរ)</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '12px',
                  background: '#f8fafc',
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://via.placeholder.com/64?text=Store';
                    }}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      background: '#e2e8f0',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#64748b',
                    }}
                  >
                    <Upload size={20} />
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ fontSize: '13px', color: '#475569' }}
                  />
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                    ទុកទទេប្រសិនបើមិនចង់ប្តូររូបភាពចាស់
                  </div>
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="edit_store_is_active"
                name="is_active"
                checked={Number(form.is_active) === 1}
                onChange={handleChange}
                style={{ width: '17px', height: '17px', accentColor: '#0f766e', cursor: 'pointer' }}
              />
              <label htmlFor="edit_store_is_active" style={{ fontSize: '13.5px', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
                ដាក់ឱ្យដំណើរការហាងនេះ (Active Store)
              </label>
            </div>
          </div>

          {/* 🟢 Footer Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#475569',
                fontWeight: '600',
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              បោះបង់ (Cancel)
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                background: '#0f766e',
                color: 'white',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
              }}
            >
              <Save size={16} />
              <span>{submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ (Update)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}