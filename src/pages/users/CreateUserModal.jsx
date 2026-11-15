// src/pages/users/CreateUserModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, Save, UserPlus } from 'lucide-react';
import { createUser } from '../../services/userService';
import { listRoles } from '../../services/rolePermissionService'; 

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.roles)) return res.roles;
  return [];
};

export default function CreateUserModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role_id: '',
  });

  const [rolesList, setRolesList] = useState([]); 
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 🟢 ទាញយកបញ្ជី Roles មកពេលបើក Modal
  useEffect(() => {
    if (!isOpen) return;
    listRoles()
      .then((res) => {
        const items = extractArray(res);
        setRolesList(items);
      
        if (items.length > 0 && !form.role_id) {
          setForm((prev) => ({ ...prev, role_id: String(items[0].id) }));
        }
      })
      .catch(() => setRolesList([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      role_id: rolesList.length > 0 ? String(rolesList[0].id) : '',
    });
    setImageFile(null);
    setImagePreview(null);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('email', form.email.trim());
      if (form.phone) formData.append('phone', form.phone.trim());
      formData.append('password', form.password);
      formData.append('role_id', Number(form.role_id));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await createUser(formData);
      resetForm();
      onSuccess?.();
      onClose?.();
    } catch (err) {
      if (err?.errors) {
        const firstErr = Object.values(err.errors)[0];
        setErrorMsg(Array.isArray(firstErr) ? firstErr[0] : String(firstErr));
      } else {
        setErrorMsg(err?.message || 'បរាជ័យក្នុងការបង្កើតអ្នកប្រើប្រាស់ថ្មី');
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
          maxWidth: '620px',
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
            <UserPlus size={22} />
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                ➕ បន្ថែមអ្នកប្រើប្រាស់ថ្មី (Create User)
              </h3>
              <span style={{ fontSize: '12px', opacity: 0.85 }}>
                បង្កើតគណនីបុគ្គលិក ឬអ្នកគ្រប់គ្រងប្រព័ន្ធ
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
            {/* ឈ្មោះ */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>ឈ្មោះអ្នកប្រើប្រាស់ (Full Name) *</label>
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

            {/* អ៊ីមែល */}
            <div>
              <label style={labelStyle}>អ៊ីមែល (Email Address) *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="demo@gmail.com"
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
                placeholder="09898765"
                style={inputStyle}
              />
            </div>

            {/* ពាក្យសម្ងាត់ */}
            <div>
              <label style={labelStyle}>ពាក្យសម្ងាត់ (Password) *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {/* 🟢 តួនាទី Role ID (ទាញយកពី Database ស្វ័យប្រវត្តិ) */}
            <div>
              <label style={labelStyle}>តួនាទី (Role) *</label>
              <select
                name="role_id"
                value={form.role_id}
                onChange={handleChange}
                required
                style={inputStyle}
              >
                <option value="">-- ជ្រើសរើសតួនាទី --</option>
                {rolesList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (ID: {r.id})
                  </option>
                ))}
              </select>
            </div>

            {/* រូបភាព Profile */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>រូបភាព Profile (Avatar)</label>
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
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
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
                    គាំទ្រប្រភេទឯកសារ JPG, PNG, WEBP
                  </div>
                </div>
              </div>
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
              <span>{submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកអ្នកប្រើប្រាស់ (Save)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}