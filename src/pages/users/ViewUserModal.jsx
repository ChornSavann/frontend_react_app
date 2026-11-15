// src/pages/users/ViewUserModal.jsx
import React from "react";
import {
  X,
  Phone,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ViewUserModal({
  isOpen,
  user,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!isOpen || !user) return null;

  const initial = (user.name || "U").trim().charAt(0).toUpperCase();

  
  const getRoleName = (u) => {
    const roleName = u.role?.name || u.role_name;
    const roleId = u.role_id ?? u.role?.id;

    if (roleName) {
      return `${roleName} ${roleId ? `(#${roleId})` : ""}`;
    }

    switch (Number(roleId)) {
      case 1:
        return "Admin (#1)";
      case 2:
        return "Manager / Staff (#2)";
      case 3:
        return "Cashier / Owner (#3)";
      default:
        return `Role #${roleId || "N/A"}`;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("km-KH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const infoBoxStyle = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px 16px",
  };

  const labelStyle = {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const valueStyle = {
    fontSize: "14.5px",
    fontWeight: "700",
    color: "#0f172a",
    wordBreak: "break-word",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans Khmer', sans-serif",
        textAlign: "left",
        color: "#0f172a",
        colorScheme: "light",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          borderRadius: "18px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 🟢 1. Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            background: "linear-gradient(135deg, #063b37 0%, #0f766e 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
              👁️ ព័ត៌មានលម្អិតអ្នកប្រើប្រាស់ (User Details)
            </h3>
            <span style={{ fontSize: "12px", opacity: 0.85 }}>
              លេខសម្គាល់ ID: #{user.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "white",
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 🟢 2. Modal Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {/* Top Profile Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              paddingBottom: "20px",
              marginBottom: "20px",
              borderBottom: "1px solid #e2e8f0",
              flexWrap: "wrap",
            }}
          >
            {user.image_url ? (
              <img
                src={user.image_url}
                alt={user.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://via.placeholder.com/80?text=User";
                }}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #0f766e",
                }}
              />
            ) : (
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0f766e, #14b8a6)",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "28px",
                  fontWeight: "800",
                  flexShrink: 0,
                }}
              >
                {initial}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "21px",
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  {user.name}
                </h2>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "#dcfce7",
                    color: "#15803d",
                    padding: "4px 10px",
                    borderRadius: "99px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  <CheckCircle2 size={13} /> Active
                </span>
              </div>

              <div
                style={{
                  marginTop: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "4px 12px",
                  borderRadius: "99px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                }}
              >
                <Shield size={14} />
                <span>តួនាទី៖ {getRoleName(user)}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              marginBottom: "18px",
            }}
          >
            <div style={infoBoxStyle}>
              <div style={labelStyle}>
                <Mail size={14} color="#0284c7" /> អ៊ីមែល (Email)
              </div>
              <div style={valueStyle}>{user.email || "-"}</div>
            </div>

            <div style={infoBoxStyle}>
              <div style={labelStyle}>
                <Phone size={14} color="#0f766e" /> លេខទូរស័ព្ទ (Phone)
              </div>
              <div style={valueStyle}>{user.phone || "-"}</div>
            </div>
          </div>

          {/* Timestamps */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              padding: "12px 14px",
              background: "#f8fafc",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} />
              <span>
                ថ្ងៃបង្កើត៖ <strong>{formatDate(user.created_at)}</strong>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} />
              <span>
                កែប្រែចុងក្រោយ៖ <strong>{formatDate(user.updated_at)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 🟢 3. Modal Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                const current = user;
                onClose?.();
                onDelete(current);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                borderRadius: "10px",
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#dc2626",
                fontWeight: "700",
                fontSize: "13.5px",
                cursor: "pointer",
              }}
            >
              <Trash2 size={15} />
              <span>លុប (Delete)</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "white",
                color: "#475569",
                fontWeight: "600",
                fontSize: "13.5px",
                cursor: "pointer",
              }}
            >
              បិទ (Close)
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  const current = user;
                  onClose?.();
                  onEdit(current);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#0f766e",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(15, 118, 110, 0.25)",
                }}
              >
                <Pencil size={15} />
                <span>កែប្រែ (Edit User)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
