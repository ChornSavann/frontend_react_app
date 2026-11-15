// src/pages/units/ViewUnitModal.jsx
import React from 'react';
import { X, Scale, Calendar, Pencil, Trash2 } from 'lucide-react';

export default function ViewUnitModal({
  isOpen,
  unit,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!isOpen || !unit) return null;

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
  };

  const valueStyle = {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
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
          maxWidth: '520px',
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
              👁️ ព័ត៌មានលម្អិតឯកតាទំនិញ (Unit Details)
            </h3>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>
              លេខសម្គាល់ ID: #{unit.id}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '18px',
              marginBottom: '18px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Scale size={26} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                {unit.name}
              </h2>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                ឈ្មោះកាត់៖ <strong style={{ color: '#0f766e' }}>{unit.short_name || '-'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div style={infoBoxStyle}>
              <div style={labelStyle}>ឯកតាមូលដ្ឋាន (Base Unit ID)</div>
              <div style={valueStyle}>{unit.base_unit_id ? `#${unit.base_unit_id}` : 'គ្មាន (Base)'}</div>
            </div>

            <div style={infoBoxStyle}>
              <div style={labelStyle}>ប្រតិបត្តិការ (Operator & Value)</div>
              <div style={valueStyle}>
                {unit.base_unit_id ? `${unit.operator || '*'} ${unit.value || 1}` : '-'}
              </div>
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
              <span>ថ្ងៃបង្កើត៖ <strong>{formatDate(unit.created_at)}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>កែប្រែចុងក្រោយ៖ <strong>{formatDate(unit.updated_at)}</strong></span>
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
                const current = unit;
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
                  const current = unit;
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
                <span>កែប្រែ (Edit Unit)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}