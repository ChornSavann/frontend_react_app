// src/pages/stores/ViewStoreModal.jsx
import React from 'react';
import {
  X,
  Store,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
} from 'lucide-react';

export default function ViewStoreModal({ isOpen, store, onClose, onEdit, onDelete }) {
  if (!isOpen || !store) return null;

  const isActive = Number(store.is_active ?? 1) === 1;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('km-KH', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const infoBoxStyle = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '14px 16px',
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const valueStyle = {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#0f172a',
    wordBreak: 'break-word',
  };

  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          borderRadius: '18px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 🟢 1. Modal Header */}
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
              👁️ ព័ត៌មានលម្អិតហាង / សាខា (Store Details)
            </h3>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>
              លេខសម្គាល់ ID: #{store.id}
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

        {/* 🟢 2. Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Top Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              paddingBottom: '20px',
              marginBottom: '20px',
              borderBottom: '1px solid #e2e8f0',
              flexWrap: 'wrap',
            }}
          >
            <img
              src={store.image_url || store.logo_url || 'https://via.placeholder.com/80?text=Store'}
              alt={store.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://via.placeholder.com/80?text=Store';
              }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                objectFit: 'cover',
                border: '2px solid #0f766e',
                background: '#f8fafc',
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '21px', fontWeight: '800', color: '#0f172a' }}>
                  {store.name}
                </h2>

                {isActive ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    <CheckCircle2 size={13} /> Active
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    <XCircle size={13} /> Inactive
                  </span>
                )}
              </div>

              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                លេខកូដហាង៖ <strong style={{ color: '#0f766e' }}>{store.code || 'គ្មាន'}</strong>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div style={infoBoxStyle}>
              <div style={labelStyle}>
                <Phone size={14} color="#0f766e" /> លេខទូរស័ព្ទ (Phone)
              </div>
              <div style={valueStyle}>{store.phone || '-'}</div>
            </div>

            <div style={infoBoxStyle}>
              <div style={labelStyle}>
                <Mail size={14} color="#0284c7" /> អ៊ីមែល (Email)
              </div>
              <div style={valueStyle}>{store.email || '-'}</div>
            </div>

            <div style={{ ...infoBoxStyle, gridColumn: '1 / -1' }}>
              <div style={labelStyle}>
                <MapPin size={14} color="#d97706" /> អាសយដ្ឋាន (Address)
              </div>
              <div style={valueStyle}>{store.address || 'មិនមានបញ្ជាក់អាសយដ្ឋាន'}</div>
            </div>
          </div>

          {/* Timestamps */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '12px 14px',
              background: '#f8fafc',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#64748b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>ថ្ងៃបង្កើត៖ <strong>{formatDate(store.created_at)}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>កែប្រែចុងក្រោយ៖ <strong>{formatDate(store.updated_at)}</strong></span>
            </div>
          </div>
        </div>

        {/* 🟢 3. Modal Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                const current = store;
                onClose?.();
                onDelete(current);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={15} />
              <span>លុប (Delete)</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
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
              បិទ (Close)
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  const current = store;
                  onClose?.();
                  onEdit(current);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#0f766e',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                }}
              >
                <Pencil size={15} />
                <span>កែប្រែហាងនេះ (Edit Store)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}