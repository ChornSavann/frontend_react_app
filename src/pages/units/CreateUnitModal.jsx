// src/pages/units/CreateUnitModal.jsx
import React, { useState } from 'react';
import { X, Save, Scale } from 'lucide-react';
import { createUnit } from '../../services/unitService';

export default function CreateUnitModal({ isOpen, onClose, onSuccess, existingUnits = [] }) {
  const [form, setForm] = useState({
    name: '',
    short_name: '',
    base_unit_id: '',
    operator: '*',
    value: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      short_name: '',
      base_unit_id: '',
      operator: '*',
      value: '',
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
        short_name: form.short_name.trim() || form.name.trim(),
        base_unit_id: form.base_unit_id ? Number(form.base_unit_id) : null,
        operator: form.base_unit_id ? form.operator : '*',
        value: form.base_unit_id && form.value !== '' ? Number(form.value) : null,
      };

      await createUnit(payload);
      resetForm();
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const firstErr = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(firstErr) ? firstErr[0] : String(firstErr));
      } else {
        setErrorMsg(err?.message || 'បរាជ័យក្នុងការបង្កើតឯកតាទំនិញថ្មី');
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

  const optionStyle = {
    backgroundColor: '#ffffff',
    color: '#0f172a',
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
          maxWidth: '560px',
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
            <Scale size={20} />
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                ➕ បន្ថែមឯកតាទំនិញថ្មី (Create Unit)
              </h3>
              <span style={{ fontSize: '12px', opacity: 0.85 }}>
                បង្កើតឯកតាគិតប្រាក់ (ឧ. កញ្ចប់, កំប៉ុង, ដប, កេស...)
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
            {/* ឈ្មោះឯកតា */}
            <div>
              <label style={labelStyle}>ឈ្មោះឯកតា (Unit Name) *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="ឧ. កញ្ចប់, កំប៉ុង"
                style={inputStyle}
              />
            </div>

            {/* ឈ្មោះកាត់ */}
            <div>
              <label style={labelStyle}>ឈ្មោះកាត់ (Short Name) *</label>
              <input
                type="text"
                name="short_name"
                value={form.short_name}
                onChange={handleChange}
                required
                placeholder="ឧ. ហ្វ្កា, គក"
                style={inputStyle}
              />
            </div>

            {/* Base Unit */}
            <div>
              <label style={labelStyle}>ឯកតាមូលដ្ឋាន (Base Unit)</label>
              <select
                name="base_unit_id"
                value={form.base_unit_id}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="" style={optionStyle}>-- គ្មាន (Base Unit ផ្ទាល់ខ្លួន) --</option>
                {existingUnits.map((u) => (
                  <option key={u.id} value={u.id} style={optionStyle}>
                    {u.name} ({u.short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Operator */}
            <div>
              <label style={labelStyle}>សញ្ញាប្រតិបត្តិការ (Operator)</label>
              <select
                name="operator"
                value={form.operator}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="*" style={optionStyle}>គុណ (*)</option>
                <option value="/" style={optionStyle}>ចែក (/)</option>
              </select>
            </div>

            {/* Value */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>តម្លៃគុណ/ចែក (Value)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="value"
                value={form.value}
                onChange={handleChange}
                placeholder="ឧ. 24 (បើ ១ កេស = ២៤ កំប៉ុង)"
                style={inputStyle}
              />
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
              <span>{submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកឯកតា (Save)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}