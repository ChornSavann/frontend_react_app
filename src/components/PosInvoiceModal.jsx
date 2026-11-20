// src/components/PosInvoiceModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Printer,
  X,
  FileText,
  Receipt,
  Truck,
  Utensils,
  ShoppingBag,
  Package,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

const EXCHANGE_RATE = 4100;

const DEFAULT_SHOP = {
  name: "RESTAURANT & POS SYSTEM",
  khName: "ហាងលក់ទំនិញ និងភោជនីយដ្ឋាន",
  tagline: "សូមស្វាគមន៍ · Thank You for Your Purchase",
  address: "Phnom Penh, Cambodia",
  phone: "012 345 678 / 098 765 432",
  logo: "",
};

const MODE_KEY = "pos_invoice_mode";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700;800&display=swap');

.pv-portal {
  --ink: #0f2926;
  --text: #334155;
  --muted: #64748b;
  --teal: #1f8a7d;
  --teal-d: #145e55;
  --teal-soft: #e6f4f1;
  --slate-bg: #f8fafc;
  --line: #e2e8f0;
  font-family: 'Plus Jakarta Sans', 'Noto Sans Khmer', -apple-system, sans-serif;
  color: var(--ink);
  text-align: left;
  line-height: 1.5;
  color-scheme: light;
}
.pv-portal, .pv-portal *, .pv-portal *::before, .pv-portal *::after {
  box-sizing: border-box;
}

.pv-ovl {
  position: fixed;
  inset: 0;
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 38, 35, 0.58);
  backdrop-filter: blur(5px);
  animation: pv-fade 0.18s ease both;
}
@keyframes pv-fade { from { opacity: 0; } to { opacity: 1; } }

.pv-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 440px;
  max-height: 94vh;
  background: #eef4f2;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 28px 65px -15px rgba(15, 41, 38, 0.48);
  transition: max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  animation: pv-pop 0.24s cubic-bezier(0.2, 1.1, 0.4, 1) both;
}
.pv-dialog.a4 { max-width: 820px; }
@keyframes pv-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to { opacity: 1; transform: none; }
}

/* --- TOP BAR --- */
.pv-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: #ffffff;
  border-bottom: 1px solid var(--line);
}
.pv-toptitle {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14.5px;
  font-weight: 800;
  color: var(--ink);
}
.pv-toptitle > span:first-child {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #25998b, #145e55);
}
.pv-toptitle > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pv-seg {
  position: relative;
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  padding: 3px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}
.pv-thumb {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc(50% - 3px);
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(15, 41, 38, 0.12);
  transition: transform 0.25s ease;
}
.pv-seg[data-i="1"] .pv-thumb { transform: translateX(100%); }
.pv-seg button {
  all: unset;
  position: relative;
  z-index: 1;
  cursor: pointer;
  height: 28px;
  padding: 0 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  border-radius: 7px;
  transition: color 0.18s;
}
.pv-seg button.on { color: var(--teal-d); font-weight: 800; }

.pv-x {
  all: unset;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f1f5f9;
  color: var(--muted);
  transition: all 0.18s;
}
.pv-x:hover {
  background: #fee2e2;
  color: #dc2626;
}

.pv-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  padding: 22px 16px;
}

/* ---------- THE PAPER ---------- */
.pv-sheet {
  width: 100%;
  max-width: 360px;
  filter: drop-shadow(0 12px 24px rgba(15, 41, 38, 0.12));
}
.pv-dialog.a4 .pv-sheet { max-width: 750px; }

.pv-paper {
  position: relative;
  padding: 0 20px 36px;
  background: #ffffff;
  color: var(--ink);
  font-size: 12.5px;
  border-radius: 14px 14px 0 0;
  -webkit-mask: radial-gradient(circle 6px at 6px 100%, transparent 98%, #000) -6px 100% / 12px 100% repeat-x;
          mask: radial-gradient(circle 6px at 6px 100%, transparent 98%, #000) -6px 100% / 12px 100% repeat-x;
}
.pv-dialog.a4 .pv-paper {
  padding: 0 38px 36px;
  font-size: 13.5px;
  border-radius: 16px;
  -webkit-mask: none;
          mask: none;
  overflow: hidden;
}

/* Clean Unified Teal Top Bar */
.pv-accent {
  height: 6px;
  margin: 0 -20px 20px;
  background: linear-gradient(90deg, #1f8a7d, #145e55);
}
.pv-dialog.a4 .pv-accent { margin: 0 -38px 24px; height: 7px; }

/* Header */
.pv-head {
  text-align: center;
}
.pv-dialog.a4 .pv-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;
  padding-bottom: 14px;
  border-bottom: 1.5px solid #f1f5f9;
}
.pv-head-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pv-dialog.a4 .pv-head-brand {
  flex-direction: row;
  align-items: center;
  gap: 14px;
}

.pv-logo {
  width: 52px;
  height: 52px;
  margin: 0 auto 8px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  overflow: hidden;
  background: linear-gradient(145deg, #25998b, #145e55);
  box-shadow: 0 8px 16px -6px rgba(20, 94, 85, 0.45);
}
.pv-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
  padding: 4px;
}
.pv-dialog.a4 .pv-logo {
  margin: 0;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.pv-shopkh {
  font-size: 16px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.35;
}
.pv-shopen {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--muted);
  text-transform: uppercase;
}
.pv-shopmeta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 3px;
  font-size: 11.5px;
  color: var(--muted);
}
.pv-dialog.a4 .pv-shopmeta { justify-content: flex-start; }
.pv-shopmeta svg { flex-shrink: 0; color: var(--teal); }

/* Title Divider */
.pv-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 0 12px;
}
.pv-title i {
  flex: 1;
  height: 0;
  border-top: 1.5px dashed #cbd5e1;
}
.pv-title span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 12px;
  border-radius: 99px;
  background: var(--teal-soft);
  border: 1px solid #b8dfd8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--teal-d);
  text-transform: uppercase;
  white-space: nowrap;
}
.pv-title.check span {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

/* Clean Unified Meta Grid */
.pv-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  padding: 11px 13px;
  margin-bottom: 14px;
  border-radius: 12px;
  background: var(--slate-bg);
  border: 1px solid var(--line);
}
.pv-dialog.a4 .pv-meta {
  grid-template-columns: repeat(4, 1fr);
}
.pv-m { min-width: 0; }
.pv-m small {
  display: block;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--muted);
}
.pv-m b {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: var(--ink);
  word-break: break-word;
}
.pv-m b svg {
  vertical-align: -2px;
  margin-right: 4px;
  color: var(--teal);
}

/* Items Table — Wider item column so product names don't break mid-word */
.pv-th, .pv-tr {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px 56px 64px;
  gap: 6px;
  align-items: center;
}
.pv-dialog.a4 .pv-th, .pv-dialog.a4 .pv-tr {
  grid-template-columns: minmax(0, 1fr) 70px 110px 120px;
  gap: 10px;
}
.pv-th {
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--teal-soft);
  color: var(--teal-d);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.pv-dialog.a4 .pv-th { padding: 9px 14px; font-size: 12px; }

.pv-tr {
  padding: 8px 8px;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 12px;
  break-inside: avoid;
}
.pv-dialog.a4 .pv-tr { padding: 10px 14px; font-size: 13.5px; }
.pv-tr:last-of-type { border-bottom: 0; }

.pv-name {
  font-weight: 700;
  line-height: 1.35;
  color: var(--ink);
  overflow-wrap: break-word;
  word-break: normal;
}
.pv-name .idx {
  color: var(--muted);
  font-weight: 600;
  margin-right: 5px;
  font-size: 11px;
}
.pv-r { text-align: right; font-variant-numeric: tabular-nums; }
.pv-c {
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--text);
}
.pv-tr .sum {
  font-weight: 800;
  color: var(--teal-d);
}
.pv-none { padding: 16px 0; text-align: center; color: var(--muted); }

/* Totals Section */
.pv-totwrap {
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1.5px dashed #cbd5e1;
}
.pv-dialog.a4 .pv-totwrap {
  display: flex;
  justify-content: flex-end;
}
.pv-totbox {
  display: grid;
  gap: 5px;
  width: 100%;
  font-size: 12.5px;
}
.pv-dialog.a4 .pv-totbox { width: 360px; font-size: 13.5px; }

.pv-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  color: var(--text);
}
.pv-line b {
  color: var(--ink);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.pv-line.neg b { color: #dc2626; }

/* Elegant Teal Grand Total Card */
.pv-grand {
  margin-top: 6px;
  padding: 12px 15px;
  border-radius: 13px;
  color: #fff;
  background: linear-gradient(135deg, #1f8a7d 0%, #135c53 100%);
  box-shadow: 0 8px 18px -8px rgba(20, 94, 85, 0.45);
}
.pv-grand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
}
.pv-grand-row b {
  font-size: 21px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.pv-khr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.92);
}
.pv-khr b {
  font-size: 13.5px;
  font-weight: 800;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

/* Payment Breakdown Card */
.pv-pay {
  display: grid;
  gap: 4px;
  margin-top: 10px;
  padding: 10px 13px;
  background: var(--slate-bg);
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 12px;
}
.pv-dialog.a4 .pv-pay { font-size: 13px; }
.pv-pay div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  color: var(--muted);
}
.pv-pay b {
  color: var(--ink);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.pv-pay .chg b { color: #15803d; }
.pv-pay .due b { color: #b45309; }

.pv-checknote {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  color: #475569;
  text-align: center;
  font-size: 11.5px;
  font-weight: 700;
}

/* Delivery Card */
.pv-deliv {
  display: grid;
  gap: 3px;
  margin-top: 12px;
  padding: 10px 13px;
  background: var(--slate-bg);
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  font-size: 12px;
}
.pv-deliv strong {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--teal-d);
  margin-bottom: 2px;
}
.pv-deliv span { color: var(--muted); }
.pv-deliv b { color: var(--ink); }

/* Footer */
.pv-note {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1.5px dashed #cbd5e1;
  text-align: center;
  font-size: 11.5px;
  color: var(--muted);
}
.pv-note b {
  display: block;
  font-size: 12.5px;
  color: var(--ink);
  margin-bottom: 2px;
}

/* Bottom Action Buttons */
.pv-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 18px 15px;
  background: #ffffff;
  border-top: 1px solid var(--line);
}
.pv-btn {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  height: 40px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 11px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  transition: all 0.16s ease;
}
.pv-btn:hover {
  background: #e2e8f0;
}
.pv-btn.primary {
  color: #fff;
  border: none;
  background: linear-gradient(135deg, #25998b, #145e55);
  box-shadow: 0 6px 16px rgba(20, 94, 85, 0.32);
}
.pv-btn.primary:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}
.pv-btn:active { transform: scale(0.98); }

@media (max-width: 560px) {
  .pv-dialog.a4 .pv-meta { grid-template-columns: 1fr 1fr; }
  .pv-dialog.a4 .pv-head { flex-direction: column; text-align: center; }
  .pv-dialog.a4 .pv-head-brand { flex-direction: column; }
  .pv-dialog.a4 .pv-shopmeta { justify-content: center; }
}

/* ---------- PRINT MEDIA RULES ---------- */
@media print {
  html, body {
    display: block !important;
    width: auto !important;
    min-width: 0 !important;
    height: auto !important;
    overflow: visible !important;
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  body > *:not(.pv-portal) { display: none !important; }
  .pv-noprint { display: none !important; }
  .pv-ovl {
    position: static !important;
    display: block !important;
    padding: 0 !important;
    background: none !important;
    backdrop-filter: none !important;
    animation: none !important;
  }
  .pv-dialog {
    display: block !important;
    max-width: none !important;
    max-height: none !important;
    overflow: visible !important;
    background: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    animation: none !important;
  }
  .pv-body {
    display: block !important;
    overflow: visible !important;
    padding: 0 !important;
  }
  .pv-sheet {
    filter: none !important;
    animation: none !important;
    margin: 0 auto !important;
  }
  .pv-portal * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 80mm thermal */
  .pv-dialog:not(.a4) .pv-sheet {
    width: 74mm !important;
    max-width: 100% !important;
  }
  .pv-dialog:not(.a4) .pv-paper {
    padding: 0 2mm 6mm !important;
    background: #fff !important;
    font-size: 11.5px;
    border-radius: 0 !important;
    -webkit-mask: none !important;
            mask: none !important;
  }

  /* A4 */
  .pv-dialog.a4 .pv-sheet {
    width: 100% !important;
    max-width: none !important;
  }
  .pv-dialog.a4 .pv-paper {
    padding: 0 8mm 8mm !important;
    border-radius: 0 !important;
  }
  .pv-dialog.a4 .pv-accent {
    margin: 0 -8mm 8mm !important;
  }
}
`;

/* ---------- helpers ---------- */
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const qtyText = (q) => String(Number(Number(q || 0).toFixed(3)));
const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && v !== "");

const orderTypeInfo = (raw) => {
  const t = String(raw || "dine_in")
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
  if (t === "delivery")
    return { key: "delivery", label: "ដឹកជញ្ជូន (Delivery)", Icon: Truck };
  if (t === "dine_in")
    return { key: "dine_in", label: "ញ៉ាំនៅហាង (Dine-In)", Icon: Utensils };
  if (["takeaway", "take_away", "pickup", "to_go"].includes(t))
    return { key: "takeaway", label: "យកទៅវិញ (Takeaway)", Icon: ShoppingBag };
  const pretty = String(raw).replace(/[_-]/g, " ");
  return {
    key: t,
    label: pretty.charAt(0).toUpperCase() + pretty.slice(1),
    Icon: Receipt,
  };
};

export default function PosInvoiceModal({
  isOpen,
  onClose,
  invoiceData,
  shopInfo = DEFAULT_SHOP,
  autoPrint = false,
}) {
  const [printMode, setPrintMode] = useState(() => {
    try {
      return localStorage.getItem(MODE_KEY) === "a4" ? "a4" : "80mm";
    } catch {
      return "80mm";
    }
  }); // '80mm' | 'a4'
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const printedFor = useRef(null);

  const changeMode = (m) => {
    setPrintMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeRef.current?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      printedFor.current = null;
      return undefined;
    }
    if (!autoPrint || !invoiceData || printedFor.current === invoiceData)
      return undefined;
    const timer = setTimeout(() => {
      printedFor.current = invoiceData;
      window.print();
    }, 400);
    return () => clearTimeout(timer);
  }, [isOpen, autoPrint, invoiceData]);

  if (!isOpen || !invoiceData) return null;

  const a4 = printMode === "a4";
  const isCheckBill = Boolean(invoiceData.is_check_bill);
  const shop = { ...DEFAULT_SHOP, ...shopInfo };
  const items = Array.isArray(invoiceData.items)
    ? invoiceData.items
    : Array.isArray(invoiceData.details)
      ? invoiceData.details
      : [];

  const itemsSum = items.reduce((s, it) => {
    const qty = Number(it.quantity || 1);
    const price = Number(it.unit_price ?? it.price ?? 0);
    return s + Number(it.total_price ?? qty * price);
  }, 0);
  const subtotal = Number(pick(invoiceData.subtotal) ?? itemsSum);
  const discount = Number(
    invoiceData.discount_amount ?? invoiceData.discount ?? 0
  );
  const tax = Number(invoiceData.tax_amount ?? invoiceData.tax ?? 0);
  const deliveryFee = Number(
    invoiceData.delivery_fee ?? invoiceData.delivery?.delivery_fee ?? 0
  );
  const totalUsd = Number(
    invoiceData.total_amount ?? invoiceData.grand_total ?? invoiceData.total ?? 0
  );
  const rate = Number(invoiceData.exchange_rate) || EXCHANGE_RATE;
  const totalRiel =
    Number(invoiceData.total_riel) ||
    Math.round((totalUsd * rate) / 100) * 100;

  const amountPaid = Number(
    invoiceData.amount_paid ?? invoiceData.payment?.amount ?? totalUsd
  );
  const changeAmount = pick(
    invoiceData.change_amount,
    invoiceData.payment?.change_amount
  );
  const debtAmount = Math.max(totalUsd - amountPaid, 0);
  const paymentMethod = pick(
    invoiceData.payment_method,
    invoiceData.payment?.payment_method
  );

  const orderNo =
    pick(invoiceData.order_number, invoiceData.invoice_number) ?? "-";
  const invoiceNo =
    pick(invoiceData.invoice_number) ??
    `INV-${String(orderNo).replace(/^ORD-/, "")}`;
  const when = invoiceData.created_at
    ? new Date(invoiceData.created_at)
    : new Date();
  const createdAt = Number.isNaN(when.getTime())
    ? "-"
    : when.toLocaleString("en-GB");

  const customerName =
    pick(
      invoiceData.customer_name,
      invoiceData.customer?.name,
      invoiceData.delivery?.receiver_name
    ) || "អតិថិជនទូទៅ";
  const customerPhone =
    pick(
      invoiceData.customer_phone,
      invoiceData.customer?.phone,
      invoiceData.delivery?.receiver_phone
    ) || "";
  const cashier = pick(invoiceData.user?.name, invoiceData.cashier_name);
  const tableNo = pick(
    invoiceData.table_no,
    invoiceData.table?.name,
    invoiceData.table_name
  );

  const type = orderTypeInfo(invoiceData.order_type);
  const TypeIcon = type.Icon;

  const deliveryObj = invoiceData.delivery || {
    delivery_partner: invoiceData.delivery_partner,
    receiver_name: invoiceData.receiver_name,
    receiver_phone: invoiceData.receiver_phone,
    delivery_address: invoiceData.delivery_address,
    note: invoiceData.note,
  };

  const shopInitial = String(shop.name || shop.khName || "P")
    .trim()
    .charAt(0)
    .toUpperCase();

  const modalContent = (
    <div className="pv-portal">
      <style>{css}</style>
      <style>{`@media print { @page { size: ${
        a4 ? "A4" : "80mm auto"
      }; margin: ${a4 ? "10mm" : "0"}; } }`}</style>

      <div className="pv-ovl" onClick={onClose}>
        <div
          className={`pv-dialog${a4 ? " a4" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="វិក្កយបត្រ"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="pv-top pv-noprint">
            <div className="pv-toptitle">
              <span>
                <Receipt size={18} />
              </span>
              <span>
                {isCheckBill ? "ត្រួតពិនិត្យតម្លៃ" : "វិក្កយបត្រ"} · #{orderNo}
              </span>
            </div>

            <div
              className="pv-seg"
              data-i={a4 ? 1 : 0}
              role="group"
              aria-label="ទំហំក្រដាស"
            >
              <span className="pv-thumb" />
              <button
                type="button"
                className={!a4 ? "on" : ""}
                aria-pressed={!a4}
                onClick={() => changeMode("80mm")}
              >
                <Receipt size={13} /> 80mm
              </button>
              <button
                type="button"
                className={a4 ? "on" : ""}
                aria-pressed={a4}
                onClick={() => changeMode("a4")}
              >
                <FileText size={13} /> A4
              </button>
            </div>

            <button
              type="button"
              className="pv-x"
              onClick={onClose}
              title="បិទ"
              aria-label="បិទ"
            >
              <X size={16} />
            </button>
          </div>

          {/* Printable Paper Area */}
          <div className="pv-body">
            <div className="pv-sheet">
              <article className="pv-paper">
                <div className="pv-accent" />

                <header className="pv-head">
                  <div className="pv-head-brand">
                    <div className="pv-logo">
                      {shop.logo ? <img src={shop.logo} alt="" /> : shopInitial}
                    </div>
                    <div>
                      <div className="pv-shopkh">{shop.khName}</div>
                      <div className="pv-shopen">{shop.name}</div>
                      {shop.address && (
                        <div className="pv-shopmeta">
                          <MapPin size={12} /> {shop.address}
                        </div>
                      )}
                      {shop.phone && (
                        <div className="pv-shopmeta">
                          <Phone size={12} /> {shop.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </header>

                <div className={`pv-title${isCheckBill ? " check" : ""}`}>
                  <i />
                  <span>
                    {isCheckBill ? (
                      <>
                        <Clock size={12} /> បង្កាន់ដៃត្រួតពិនិត្យតម្លៃ · Bill Check
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={12} /> វិក្កយបត្រ · Receipt
                      </>
                    )}
                  </span>
                  <i />
                </div>

                {/* Clean Meta Box */}
                <div className="pv-meta">
                  <div className="pv-m">
                    <small>លេខវិក្កយបត្រ</small>
                    <b>{invoiceNo}</b>
                  </div>
                  <div className="pv-m">
                    <small>កាលបរិច្ឆេទ</small>
                    <b>{createdAt}</b>
                  </div>
                  <div className="pv-m">
                    <small>អតិថិជន</small>
                    <b>
                      {customerName}
                      {customerPhone ? ` (${customerPhone})` : ""}
                    </b>
                  </div>
                  <div className="pv-m">
                    <small>ប្រភេទកម្មង់</small>
                    <b>
                      <TypeIcon size={12} />
                      {type.label}
                    </b>
                  </div>
                  {cashier !== undefined && (
                    <div className="pv-m">
                      <small>អ្នកគិតលុយ</small>
                      <b>{cashier}</b>
                    </div>
                  )}
                  {tableNo !== undefined && (
                    <div className="pv-m">
                      <small>លេខតុ</small>
                      <b>{tableNo}</b>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="pv-th">
                  <span>មុខទំនិញ</span>
                  <span className="pv-c">ចំនួន</span>
                  <span className="pv-r">តម្លៃ</span>
                  <span className="pv-r">សរុប</span>
                </div>
                {items.length === 0 && (
                  <div className="pv-none">(គ្មានទំនិញ)</div>
                )}
                {items.map((it, idx) => {
                  const name =
                    it.product_name || it.name || it.product?.name || "Item";
                  const qty = Number(it.quantity || 1);
                  const price = Number(it.unit_price ?? it.price ?? 0);
                  const lineTotal = Number(it.total_price ?? qty * price);
                  return (
                    <div className="pv-tr" key={it.id ?? idx}>
                      <span className="pv-name">
                        <span className="idx">{idx + 1}.</span>
                        {name}
                      </span>
                      <span className="pv-c">{qtyText(qty)}</span>
                      <span className="pv-r">${price.toFixed(2)}</span>
                      <span className="pv-r sum">${lineTotal.toFixed(2)}</span>
                    </div>
                  );
                })}

                {/* Totals */}
                <div className="pv-totwrap">
                  <div className="pv-totbox">
                    <div className="pv-line">
                      <span>សរុបរង (Subtotal)</span>
                      <b>{money(subtotal)}</b>
                    </div>
                    {discount > 0 && (
                      <div className="pv-line neg">
                        <span>បញ្ចុះតម្លៃ (Discount)</span>
                        <b>-{money(discount)}</b>
                      </div>
                    )}
                    {tax > 0 && (
                      <div className="pv-line">
                        <span>ពន្ធអាករ (Tax)</span>
                        <b>+{money(tax)}</b>
                      </div>
                    )}
                    {deliveryFee > 0 && (
                      <div className="pv-line">
                        <span>សេវាដឹកជញ្ជូន (Delivery Fee)</span>
                        <b>+{money(deliveryFee)}</b>
                      </div>
                    )}

                    <div className="pv-grand">
                      <div className="pv-grand-row">
                        <span>សរុបរួម (Total USD)</span>
                        <b>{money(totalUsd)}</b>
                      </div>
                      <div className="pv-khr">
                        <span>គិតជារៀល (KHR)</span>
                        <b>{totalRiel.toLocaleString("en-US")} ៛</b>
                      </div>
                    </div>

                    {isCheckBill ? (
                      <div className="pv-checknote">
                        *** សម្រាប់ត្រួតពិនិត្យតម្លៃប៉ុណ្ណោះ (មិនទាន់ទូទាត់ប្រាក់) ***
                      </div>
                    ) : (
                      <div className="pv-pay">
                        {paymentMethod !== undefined && (
                          <div>
                            <span>វិធីបង់ប្រាក់ (Payment)</span>
                            <b style={{ textTransform: "uppercase" }}>
                              {String(paymentMethod)}
                            </b>
                          </div>
                        )}
                        <div>
                          <span>ប្រាក់ទទួលបាន (Paid)</span>
                          <b>{money(amountPaid)}</b>
                        </div>
                        {changeAmount !== undefined && (
                          <div className="chg">
                            <span>ប្រាក់អាប់ (Change)</span>
                            <b>{money(changeAmount)}</b>
                          </div>
                        )}
                        {debtAmount > 0 && (
                          <div className="due">
                            <span>ប្រាក់ជំពាក់ (Balance Due)</span>
                            <b>{money(debtAmount)}</b>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery */}
                {type.key === "delivery" && (
                  <div className="pv-deliv">
                    <strong>
                      <Package size={14} /> ព័ត៌មានដឹកជញ្ជូន (Delivery Details)
                    </strong>
                    {deliveryObj.delivery_partner && (
                      <div>
                        <span>ដៃគូដឹកជញ្ជូន៖</span>{" "}
                        <b>{deliveryObj.delivery_partner}</b>
                      </div>
                    )}
                    <div>
                      <span>អ្នកទទួល៖</span>{" "}
                      <b>
                        {deliveryObj.receiver_name || customerName} (
                        {deliveryObj.receiver_phone || customerPhone || "N/A"})
                      </b>
                    </div>
                    <div>
                      <span>ទីតាំង៖</span>{" "}
                      <b>{deliveryObj.delivery_address || "N/A"}</b>
                    </div>
                    {deliveryObj.note && (
                      <div>
                        <span>ចំណាំ៖</span> <b>{deliveryObj.note}</b>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <footer className="pv-note">
                  <b>{shop.tagline}</b>
                  <span>ទំនិញដែលទិញរួចមិនអាចប្តូរយកប្រាក់វិញបានទេ</span>
                </footer>
              </article>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pv-foot pv-noprint">
            <button type="button" className="pv-btn" onClick={onClose}>
              បិទផ្ទាំង
            </button>
            <button
              type="button"
              className="pv-btn primary"
              onClick={() => window.print()}
            >
              <Printer size={16} /> បោះពុម្ពវិក្កយបត្រ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}