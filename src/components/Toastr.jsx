// src/components/Toastr.jsx
import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";

let addToastHandler = null;
let confirmHandler = null;

// ១. សម្រាប់ហៅ Toastr Notification នៅជ្រុងខាងស្តាំ
export const toastr = {
  success: (title, message = "", duration = 3000) =>
    addToastHandler?.({ type: "success", title, message, duration }),
  error: (title, message = "", duration = 3800) =>
    addToastHandler?.({ type: "error", title, message, duration }),
  warning: (title, message = "", duration = 3400) =>
    addToastHandler?.({ type: "warning", title, message, duration }),
  info: (title, message = "", duration = 3000) =>
    addToastHandler?.({ type: "info", title, message, duration }),
};

// ២. សម្រាប់ហៅ Sweet Confirm Dialog
export const sweetConfirm = ({
  title = "តើអ្នកប្រាកដទេ?",
  text = "សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ!",
  confirmText = "យល់ព្រមលុប",
  cancelText = "បោះបង់",
  type = "danger", // 'danger' | 'warning'
} = {}) => {
  if (!confirmHandler) {
    return Promise.resolve(window.confirm(`${title}\n${text}`));
  }
  return confirmHandler({ title, text, confirmText, cancelText, type });
};

const css = `
/* ================= COMPACT TOASTR STYLES ================= */
.toastr-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 310px;
  width: calc(100% - 32px);
  pointer-events: none;
  font-family: 'Plus Jakarta Sans', 'Noto Sans Khmer', sans-serif;
}

.toastr-item {
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 12px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px -8px rgba(15, 55, 51, 0.18), 0 2px 6px -1px rgba(15, 55, 51, 0.05);
  border: 1px solid #e2ede9;
  animation: toastEnter 0.28s cubic-bezier(0.22, 1.2, 0.36, 1) forwards;
}

.toastr-item.closing {
  animation: toastExit 0.2s ease-in forwards;
}

@keyframes toastEnter {
  0% { opacity: 0; transform: translateX(35px) scale(0.95); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes toastExit {
  0% { opacity: 1; transform: translateX(0) scale(1); }
  100% { opacity: 0; transform: translateX(40px) scale(0.95); }
}

/* Compact Icon Box */
.toastr-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.toastr-item.success .toastr-icon-wrap { background: #e4f5ef; color: #167c70; }
.toastr-item.error .toastr-icon-wrap { background: #fde8e6; color: #d92d20; }
.toastr-item.warning .toastr-icon-wrap { background: #fef0c7; color: #d97706; }
.toastr-item.info .toastr-icon-wrap { background: #e0f2fe; color: #2563eb; }

.toastr-content {
  flex: 1;
  min-width: 0;
}

.toastr-title {
  font-size: 12.8px;
  font-weight: 700;
  color: #0f3733;
  margin: 0;
  line-height: 1.3;
}

.toastr-msg {
  font-size: 11.8px;
  color: #5b7873;
  margin: 2px 0 0;
  white-space: pre-line;
  line-height: 1.4;
}

.toastr-close {
  all: unset;
  cursor: pointer;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: #94aca7;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: 0.15s;
}
.toastr-close:hover {
  background: #f1f7f5;
  color: #0f3733;
}

/* Slim Bottom Progress Bar */
.toastr-progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2.5px;
  background: rgba(15, 55, 51, 0.04);
}

.toastr-progress {
  height: 100%;
  width: 100%;
  transform-origin: left;
  animation-name: toastBar;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.toastr-item:hover .toastr-progress {
  animation-play-state: paused;
}

.toastr-item.success .toastr-progress { background: #1f8a7d; }
.toastr-item.error .toastr-progress { background: #d92d20; }
.toastr-item.warning .toastr-progress { background: #f59e0b; }
.toastr-item.info .toastr-progress { background: #3b82f6; }

@keyframes toastBar {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* ================= COMPACT SWEET CONFIRM MODAL ================= */
.swal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 55, 51, 0.45);
  backdrop-filter: blur(3px);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: swalFadeIn 0.18s ease;
  font-family: 'Plus Jakarta Sans', 'Noto Sans Khmer', sans-serif;
}

@keyframes swalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.swal-box {
  background: #ffffff;
  width: 100%;
  max-width: 340px;
  border-radius: 18px;
  padding: 22px 20px 18px;
  text-align: center;
  box-shadow: 0 20px 45px -12px rgba(15, 55, 51, 0.28);
  border: 1px solid #e1ece8;
  animation: swalPop 0.24s cubic-bezier(0.22, 1.3, 0.36, 1);
}

@keyframes swalPop {
  from { opacity: 0; transform: scale(0.92) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.swal-icon-ring {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  margin: 0 auto 12px;
  display: grid;
  place-items: center;
}

.swal-icon-ring.danger {
  background: #fde8e6;
  color: #d92d20;
}

.swal-icon-ring.warning {
  background: #fef0c7;
  color: #d97706;
}

.swal-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f3733;
  margin: 0 0 6px;
}

.swal-text {
  font-size: 13px;
  color: #5b7873;
  margin: 0 0 18px;
  line-height: 1.5;
}

.swal-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.swal-btn {
  all: unset;
  cursor: pointer;
  flex: 1;
  height: 36px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: 0.18s ease;
}

.swal-btn.cancel {
  background: #f1f6f5;
  color: #26514b;
}
.swal-btn.cancel:hover {
  background: #e2ece9;
}

.swal-btn.confirm-danger {
  background: #d92d20;
  color: #fff;
}
.swal-btn.confirm-danger:hover {
  background: #b42318;
}

.swal-btn.confirm-warning {
  background: #f59e0b;
  color: #fff;
}
.swal-btn.confirm-warning:hover {
  background: #d97706;
}
`;

const getIcon = (type) => {
  switch (type) {
    case "success":
      return <CheckCircle2 size={16} strokeWidth={2.4} />;
    case "error":
      return <AlertCircle size={16} strokeWidth={2.4} />;
    case "warning":
      return <AlertTriangle size={16} strokeWidth={2.4} />;
    default:
      return <Info size={16} strokeWidth={2.4} />;
  }
};

export default function ToastrContainer() {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const triggerRemoveToast = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  };

  useEffect(() => {
    addToastHandler = ({
      type = "success",
      title,
      message,
      duration = 3000,
    }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [
        ...prev,
        { id, type, title, message, duration, closing: false },
      ]);
      setTimeout(() => {
        triggerRemoveToast(id);
      }, duration);
    };

    confirmHandler = (options) =>
      new Promise((resolve) => {
        setConfirmState({ ...options, resolve });
      });

    return () => {
      addToastHandler = null;
      confirmHandler = null;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && confirmState) {
        handleConfirmClose(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmState]);

  const handleConfirmClose = (result) => {
    if (confirmState?.resolve) {
      confirmState.resolve(result);
    }
    setConfirmState(null);
  };

  return (
    <>
      <style>{css}</style>

      {/* COMPACT TOASTR NOTIFICATIONS */}
      <div className="toastr-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toastr-item ${t.type} ${t.closing ? "closing" : ""}`}
          >
            <div className="toastr-icon-wrap">{getIcon(t.type)}</div>
            <div className="toastr-content">
              <h4 className="toastr-title">{t.title}</h4>
              {t.message && <p className="toastr-msg">{t.message}</p>}
            </div>
            <button
              className="toastr-close"
              onClick={() => triggerRemoveToast(t.id)}
              title="បិទ"
            >
              <X size={14} />
            </button>
            <div className="toastr-progress-track">
              <div
                className="toastr-progress"
                style={{ animationDuration: `${t.duration || 3000}ms` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* COMPACT SWEET CONFIRM MODAL */}
      {confirmState && (
        <div className="swal-overlay" onClick={() => handleConfirmClose(false)}>
          <div className="swal-box" onClick={(e) => e.stopPropagation()}>
            <div className={`swal-icon-ring ${confirmState.type || "danger"}`}>
              {confirmState.type === "warning" ? (
                <AlertTriangle size={24} strokeWidth={2.2} />
              ) : (
                <Trash2 size={22} strokeWidth={2.2} />
              )}
            </div>
            <h3 className="swal-title">{confirmState.title}</h3>
            <p className="swal-text">{confirmState.text}</p>
            <div className="swal-actions">
              <button
                type="button"
                className="swal-btn cancel"
                onClick={() => handleConfirmClose(false)}
              >
                {confirmState.cancelText || "បោះបង់"}
              </button>
              <button
                type="button"
                className={`swal-btn confirm-${confirmState.type || "danger"}`}
                onClick={() => handleConfirmClose(true)}
              >
                <Trash2 size={14} />
                {confirmState.confirmText || "យល់ព្រមលុប"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}