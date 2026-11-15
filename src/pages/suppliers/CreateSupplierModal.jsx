// src/pages/suppliers/CreateSupplierModal.jsx
import React, { useState } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import { createSupplier } from '../../services/supplierService';

export default function CreateSupplierModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    contact_name: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    is_active: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      company: '',
      contact_name: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      is_active: 1,
    });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: form.name.trim(),
        company: form.company.trim() || null,
        contact_name: form.contact_name.trim() || form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        address: form.address.trim() || null,
        is_active: form.is_active ? 1 : 0,
      };

      await createSupplier(payload);
      resetForm();
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const firstErr = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(firstErr) ? firstErr[0] : String(firstErr));
      } else {
        setErrorMsg(err?.message || 'បរាជ័យក្នុងការបង្កើតអ្នកផ្គត់ផ្គង់ថ្មី');
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
          maxWidth: '660px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={22} />
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                ➕ បន្ថែមអ្នកផ្គត់ផ្គង់ថ្មី (Create Supplier)
              </h3>
              <span style={{ fontSize: '12px', opacity: 0.85 }}>
                បំពេញព័ត៌មានក្រុមហ៊ុន ឬអ្នកផ្គត់ផ្គង់ទំនិញចូលស្តុក
              </span>
            </div>
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
            {/* ឈ្មោះអ្នកផ្គត់ផ្គង់ */}
            <div>
              <label style={labelStyle}>ឈ្មោះអ្នកផ្គត់ផ្គង់ (Supplier Name) *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="ឧ. Chorn Savann"
                style={inputStyle}
              />
            </div>

            {/* ឈ្មោះក្រុមហ៊ុន */}
            <div>
              <label style={labelStyle}>ឈ្មោះក្រុមហ៊ុន (Company Name) *</label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                required
                placeholder="ឧ. CEO Company ERD"
                style={inputStyle}
              />
            </div>

            {/* ឈ្មោះអ្នកទំនាក់ទំនង */}
            <div>
              <label style={labelStyle}>ឈ្មោះអ្នកទំនាក់ទំនង (Contact Person)</label>
              <input
                type="text"
                name="contact_name"
                value={form.contact_name}
                onChange={handleChange}
                placeholder="ឧ. Savann"
                style={inputStyle}
              />
            </div>

            {/* លេខទូរស័ព្ទ */}
            <div>
              <label style={labelStyle}>លេខទូរស័ព្ទ (Phone Number) *</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="ឧ. 098755677"
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
                placeholder="Savann@gmail.com"
                style={inputStyle}
              />
            </div>

            {/* គេហទំព័រ (Website) */}
            <div>
              <label style={labelStyle}>គេហទំព័រ (Website)</label>
              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
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
                placeholder="ឧ. Phnom Penh, Cambodia..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Active Status */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="sup_is_active"
                name="is_active"
                checked={Number(form.is_active) === 1}
                onChange={handleChange}
                style={{ width: '17px', height: '17px', accentColor: '#0f766e', cursor: 'pointer' }}
              />
              <label htmlFor="sup_is_active" style={{ fontSize: '13.5px', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
                ដាក់ឱ្យដំណើរការ (Active Supplier)
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
              <span>{submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកអ្នកផ្គត់ផ្គង់ (Save)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}