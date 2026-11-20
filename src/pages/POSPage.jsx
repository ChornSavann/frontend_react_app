// src/pages/POSPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Trash2,
  Printer,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  Loader2,
  UserPlus,
  X,
  Truck,
  Utensils,
  MapPin,
  Crosshair,
  ChevronDown,
  User,
  Check,
  Phone,
  ScanBarcode,
  Barcode,
} from "lucide-react";
import Layout from "../components/Layout";
import PosInvoiceModal from "../components/PosInvoiceModal";
import {
  getPosProducts,
  getPosCategories,
  createPosOrder,
  getCustomer,
  createCustomer,
  getExpense,
} from "../services/posService";
import ToastrContainer, { toastr } from "../components/Toastr";
import { useTranslation } from "../utils/translations";
import { resolveProductImage } from "../services/api";

const EXCHANGE_RATE = 4100; // 1 USD = 4,100 ៛

const SHOP = {
  name: "RESTAURANT SHOP",
  khName: "ហាងលក់ទំនិញ និងភោជនីយដ្ឋាន",
  tagline: "សូមស្វាគមន៍ · Welcome",
  address: "ហាងលក់ទំនិញរបស់អ្នក (Store Location)",
  phone: "012 345 678",
  lat: 11.5564,
  lng: 104.9282,
};

const generateOrderNumber = () =>
  `ORD-${Date.now()}${Math.floor(10 + Math.random() * 90)}`;

const getCurrentUserId = () => {
  try {
    const rawUser =
      localStorage.getItem("user") ||
      localStorage.getItem("auth_user") ||
      localStorage.getItem("userInfo");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) return Number(parsed.id);
      if (parsed?.user?.id) return Number(parsed.user.id);
    }
    const uid = localStorage.getItem("user_id");
    if (uid) return Number(uid);
  } catch (e) {
    console.warn("Could not parse user_id from storage:", e);
  }
  return 1;
};

// Helper សម្រាប់ទាញពាក្យបកប្រែចេញពី pos_text ក្នុង useTranslation()
const resolvePosTranslate = (t, key, fallback = "") => {
  if (!t) return fallback || key;
  if (typeof t === "object" && t.pos_text && t.pos_text[key]) {
    return t.pos_text[key];
  }
  if (typeof t === "function") {
    const fromGroup = t("pos_text")?.[key];
    if (fromGroup) return fromGroup;
    const fromDot = t(`pos_text.${key}`);
    if (fromDot && fromDot !== `pos_text.${key}`) return fromDot;
    const direct = t(key);
    if (direct && direct !== key) return direct;
  }
  return fallback || key;
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700;800&display=swap');

.pos {
  --bg-page: #f2f7f5;
  --surface: #ffffff;
  --surface-2: #f7fbfa;
  --surface-3: #eef6f3;
  --ink: #0f3733;
  --text: #26514b;
  --muted: #5b7873;
  --teal: #1f8a7d;
  --teal-d: #176f65;
  --mint: #e4f3ee;
  --line: #dcebe6;
  --line-strong: #c8ded7;
  --input-bg: #ffffff;
  --input-border: #cfe0db;
  --price-blue: #2563eb;
  --danger: #de4b3f;
  --danger-soft: #fde8e6;
  --amber: #d97706;
  --green: #15803d;
  --card-shadow: 0 12px 32px -14px rgba(14, 90, 81, 0.22);
  --hover-shadow: 0 14px 28px -10px rgba(15, 55, 51, 0.14);

  padding: 14px 18px 22px;
  font-family: 'Plus Jakarta Sans', 'Noto Sans Khmer', -apple-system, sans-serif;
  color: var(--ink);
  background: var(--bg-page);
  text-align: left;
  font-size: 13.5px;
  line-height: 1.5;
  min-height: calc(100vh - 70px);
  transition: background 0.25s ease, color 0.25s ease;
}

.pos-barcode-box {
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
  position: relative;
  display: flex;
  align-items: center;
  background: var(--surface);
}
.pos-barcode-ico-left {
  position: absolute;
  left: 26px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}
.pos-barcode-ico-right {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--mint);
  color: var(--teal-d);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}
.pos-barcode-ico-left svg,
.pos-barcode-ico-right svg {
  position: static !important;
  margin: 0 !important;
}
.pos-barcode-box input {
  width: 100%;
  height: 39px;
  padding: 0 44px 0 38px;
  font: inherit;
  font-size: 12.5px;
  background: var(--surface-2);
  color: var(--ink);
  border: 1.5px solid var(--input-border);
  border-radius: 11px;
  outline: none;
  transition: all 0.15s;
}
.pos-barcode-box input::placeholder {
  color: var(--muted);
}
.pos-barcode-box input:focus {
  background: var(--input-bg);
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(31, 138, 125, 0.14);
}

/* --- GLOBAL DARK MODE SUPPORT (Matches Layout dark mode) --- */
html.dark .pos,
body.dark .pos,
[data-theme="dark"] .pos,
.dark .pos {
  --bg-page: #0b1514;
  --surface: #11211f;
  --surface-2: #162926;
  --surface-3: #1c3330;
  --ink: #ecfdf5;
  --text: #cbd5e1;
  --muted: #8ca8a3;
  --teal: #25a999;
  --teal-d: #34d399;
  --mint: rgba(37, 169, 153, 0.16);
  --line: #1f3834;
  --line-strong: #2a4944;
  --input-bg: #0e1b19;
  --input-border: #26423e;
  --price-blue: #60a5fa;
  --danger: #f87171;
  --danger-soft: rgba(239, 68, 68, 0.16);
  --amber: #fbbf24;
  --green: #4ade80;
  --card-shadow: 0 14px 36px -12px rgba(0, 0, 0, 0.6);
  --hover-shadow: 0 14px 30px -8px rgba(0, 0, 0, 0.7);
  color-scheme: dark;
}

.pos *, .pos *::before, .pos *::after { box-sizing: border-box; }

.pos-layout {
  display: grid;
  grid-template-columns: 445px 1fr;
  gap: 16px;
  height: calc(100vh - 104px);
  min-height: 610px;
}

/* --- LEFT SIDE: Cart & Checkout --- */
.pos-left {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: background 0.25s ease, border-color 0.25s ease;
}

.pos-cart-top {
  padding: 10px 12px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: nowrap;
}

.pos-type-switch {
  display: inline-flex;
  background: var(--surface-3);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--line);
  gap: 2px;
  flex-shrink: 0;
}
.pos-type-btn {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--muted);
  white-space: nowrap;
  transition: all 0.16s ease;
}
.pos-type-btn:hover { color: var(--ink); }
.pos-type-btn.on {
  background: linear-gradient(135deg, #25998b, #176f65);
  color: #fff;
  box-shadow: 0 3px 10px rgba(31, 138, 125, 0.32);
}

/* --- CUSTOM SEARCHABLE CUSTOMER DROPDOWN --- */
.pos-cust-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
  position: relative;
}
.pos-cust-picker {
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 195px;
}
.pos-cust-trigger {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  height: 34px;
  padding: 0 8px;
  border: 1.5px solid var(--input-border);
  border-radius: 9px;
  background: var(--input-bg);
  color: var(--ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  transition: all 0.16s ease;
}
.pos-cust-trigger:hover,
.pos-cust-trigger.open {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(31, 138, 125, 0.14);
}
.pos-cust-trig-left {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  flex: 1;
}
.pos-cust-mini-ava {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--mint);
  color: var(--teal-d);
  font-size: 11px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.pos-cust-trig-text {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ink);
}
.pos-cust-trig-chev {
  color: var(--muted);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.pos-cust-trigger.open .pos-cust-trig-chev {
  transform: rotate(180deg);
  color: var(--teal);
}

.pos-cust-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 285px;
  background: var(--surface);
  border: 1.5px solid var(--line-strong);
  border-radius: 14px;
  box-shadow: 0 18px 42px rgba(9, 30, 28, 0.24);
  z-index: 1200;
  overflow: hidden;
  animation: pos-pop 0.16s ease;
}
.pos-cust-search-wrap {
  padding: 9px 10px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
  position: relative;
  display: flex;
  align-items: center;
}
.pos-cust-search-wrap svg.s-ico {
  position: absolute;
  left: 19px;
  color: var(--muted);
  pointer-events: none;
}
.pos-cust-search-inp {
  width: 100%;
  height: 33px;
  padding: 0 28px 0 31px;
  font: inherit;
  font-size: 12px;
  background: var(--input-bg);
  color: var(--ink);
  border: 1.5px solid var(--input-border);
  border-radius: 9px;
  outline: none;
  transition: border-color 0.15s;
}
.pos-cust-search-inp:focus {
  border-color: var(--teal);
}
.pos-cust-clear-s {
  all: unset;
  cursor: pointer;
  position: absolute;
  right: 17px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--muted);
}
.pos-cust-clear-s:hover {
  background: var(--surface-3);
  color: var(--danger);
}

.pos-cust-list {
  max-height: 250px;
  overflow-y: auto;
  padding: 5px;
  display: grid;
  gap: 2px;
  scrollbar-width: thin;
}
.pos-cust-opt {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  width: 100%;
  padding: 7px 9px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: background 0.12s;
}
.pos-cust-opt:hover {
  background: var(--surface-2);
}
.pos-cust-opt.active {
  background: var(--mint);
}
.pos-cust-opt-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.pos-cust-ava {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--surface-3);
  color: var(--teal-d);
  font-weight: 800;
  font-size: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1px solid var(--line);
}
.pos-cust-opt.active .pos-cust-ava {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
}
.pos-cust-meta {
  min-width: 0;
  flex: 1;
}
.pos-cust-opt-name {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pos-cust-opt-sub {
  font-size: 11px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.pos-cust-pts {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
  background: var(--surface-3);
  color: var(--teal-d);
}
.pos-cust-empty {
  padding: 20px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--muted);
}

.pos-add-cust-btn {
  all: unset;
  cursor: pointer;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: var(--mint);
  color: var(--teal-d);
  border-radius: 10px;
  border: 1.5px solid var(--input-border);
  transition: all 0.15s;
}
.pos-add-cust-btn:hover {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
  transform: translateY(-1px);
}

/* 5-Column Cart Header & Rows */
.pos-cart-headers {
  display: grid;
  grid-template-columns: 1fr 54px 58px 74px 66px 26px;
  gap: 4px;
  align-items: center;
  padding: 9px 12px;
  background: linear-gradient(135deg, #1f8a7d, #166a60);
  color: #fff;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
}

.pos-items-list {
  flex: 1;
  overflow-y: auto;
  padding: 2px 0;
  scrollbar-width: thin;
}

.pos-item-row {
  display: grid;
  grid-template-columns: 1fr 54px 58px 74px 66px 26px;
  gap: 4px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--line);
  font-size: 12.5px;
  transition: background 0.12s;
}
.pos-item-row:hover { background: var(--surface-2); }
.pos-item-name {
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pos-item-sub {
  font-size: 10.5px;
  color: var(--danger);
  font-weight: 700;
}
.pos-item-price {
  font-weight: 600;
  color: var(--text);
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
}
.pos-item-disc-inp {
  width: 100%;
  height: 27px;
  padding: 0 4px;
  text-align: center;
  font: inherit;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--danger);
  background: var(--danger-soft);
  border: 1px solid rgba(222, 75, 63, 0.35);
  border-radius: 7px;
  outline: none;
}
.pos-item-disc-inp:focus {
  border-color: var(--danger);
  background: var(--input-bg);
}

.pos-item-qtybox {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}
.pos-qbtn {
  all: unset;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  background: var(--mint);
  color: var(--teal-d);
  border-radius: 6px;
  font-weight: 800;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.12s;
}
.pos-qbtn:hover {
  background: var(--teal);
  color: #fff;
}
.pos-item-total {
  font-weight: 800;
  color: var(--teal-d);
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: 12.5px;
}
.pos-del-item {
  all: unset;
  cursor: pointer;
  color: var(--danger);
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border-radius: 7px;
  transition: background 0.12s;
}
.pos-del-item:hover { background: var(--danger-soft); }

/* Cart Footer with Discount & Tax Controls */
.pos-cart-footer {
  background: var(--surface-2);
  border-top: 1px solid var(--line);
  padding: 11px 14px;
  display: grid;
  gap: 8px;
}
.pos-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 14px;
  font-size: 12px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--line-strong);
}
.pos-summary-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--muted);
}
.pos-summary-cell b {
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.pos-inline-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}
.pos-mini-fg {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pos-mini-fg label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--muted);
}
.pos-mini-inp {
  width: 100%;
  height: 31px;
  padding: 0 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  background: var(--input-bg);
  border: 1.5px solid var(--input-border);
  border-radius: 8px;
  outline: none;
  text-align: right;
  color: var(--ink);
  transition: border-color 0.15s;
}
.pos-mini-inp:focus { border-color: var(--teal); }

.pos-total-due {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--mint);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  color: var(--teal-d);
}
.pos-total-due b {
  font-size: 20px;
  font-variant-numeric: tabular-nums;
}

.pos-action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.pos-act-btn {
  all: unset;
  cursor: pointer;
  height: 32px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 11.5px;
  color: #fff;
  text-align: center;
  transition: transform 0.1s, opacity 0.15s, filter 0.15s;
}
.pos-act-btn:hover:not(:disabled) { filter: brightness(1.06); }
.pos-act-btn:active:not(:disabled) { transform: scale(0.98); }
.pos-act-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pos-act-btn.cancel { background: #e11d48; }
.pos-act-btn.hold { background: #7c3aed; }
.pos-act-btn.pay {
  grid-column: span 3;
  height: 38px;
  border-radius: 7px;
  background: linear-gradient(135deg, #25998b, #176f65);
  font-size: 13.5px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(23, 111, 101, 0.25);
}

/* --- RIGHT SIDE: Categories & Products --- */
.pos-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.pos-cats-bar {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}
.pos-cat-tab {
  all: unset;
  cursor: pointer;
  height: 38px;
  padding: 0 15px;
  border-radius: 11px;
  background: var(--surface);
  border: 1.5px solid var(--line);
  font-weight: 700;
  font-size: 12.5px;
  color: var(--muted);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.16s ease;
}
.pos-cat-tab:hover {
  background: var(--mint);
  color: var(--teal-d);
  border-color: var(--line-strong);
}
.pos-cat-tab.on {
  background: linear-gradient(135deg, #ef4444, #d93829);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 5px 14px rgba(222, 75, 63, 0.32);
}

.pos-prod-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.pos-prod-search {
  position: relative;
  flex: 1;
  max-width: 340px;
}
.pos-prod-search svg {
  position: absolute;
  left: 13px;
  top: 11px;
  color: var(--muted);
  pointer-events: none;
}
.pos-prod-search input {
  width: 100%;
  height: 39px;
  padding: 0 14px 0 38px;
  font: inherit;
  font-size: 13px;
  background: var(--surface);
  color: var(--ink);
  border: 1.5px solid var(--line);
  border-radius: 11px;
  outline: none;
  transition: all 0.15s;
}
.pos-prod-search input::placeholder { color: var(--muted); }
.pos-prod-search input:focus {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(31, 138, 125, 0.14);
}

.pos-products-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(154px, 1fr));
  gap: 12px;
  align-content: start;
  padding: 2px 2px 12px;
  scrollbar-width: thin;
}

/* --- COMPACT PRODUCT CARDS (ទំហំតូចល្មម ដាក់បានច្រើនកាតក្នុងមួយជួរ) --- */
.pos-products-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(126px, 1fr));
  gap: 10px;
  align-content: start;
  padding: 2px 2px 12px;
  scrollbar-width: thin;
}

.pos-prod-card {
  background: var(--surface);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 152px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  position: relative;
}
.pos-prod-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
  border-color: var(--teal);
}
.pos-prod-card.in-cart {
  border-color: var(--teal);
  box-shadow: 0 0 0 2px rgba(31, 138, 125, 0.25);
}

.pos-prod-imgwrap {
  position: relative;
  height: 98px;
  width: 100%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.pos-prod-imgwrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: 4px;
  display: block;
  transition: transform 0.25s ease;
}
.pos-prod-card:hover .pos-prod-imgwrap img {
  transform: scale(1.06);
}
.pos-prod-ph {
  font-size: 22px;
  font-weight: 800;
  color: var(--teal-d);
  background: var(--mint);
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.pos-prod-stock-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(15, 55, 51, 0.85);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  padding: 1.5px 6px;
  border-radius: 99px;
  z-index: 2;
}
.pos-prod-qty-badge {
  position: absolute;
  top: 5px;
  left: 5px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  background: linear-gradient(135deg, #25998b, #176f65);
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  border-radius: 99px;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  z-index: 2;
}

.pos-prod-info {
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  text-align: center;
  flex: 1;
  background: var(--surface);
}
.pos-prod-name {
  font-weight: 700;
  font-size: 11.5px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.pos-prod-price {
  font-weight: 800;
  font-size: 12.5px;
  color: var(--price-blue);
  font-variant-numeric: tabular-nums;
}

.pos-empty-products {
  grid-column: 1 / -1;
  padding: 64px 20px;
  text-align: center;
  color: var(--muted);
  background: var(--surface);
  border: 1.5px dashed var(--line-strong);
  border-radius: 16px;
}

/* --- MODALS --- */
.pos-ovl {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(9, 30, 28, 0.62);
  backdrop-filter: blur(6px);
}
.pos-modal {
  width: 100%;
  max-width: 480px;
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
  animation: pos-pop 0.22s ease;
}
@keyframes pos-pop {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: none; }
}
.pos-mhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(135deg, #1f8a7d, #166a60);
  color: #fff;
}
.pos-mhead h3 { font-size: 15.5px; font-weight: 700; margin: 0; }
.pos-mbody {
  padding: 16px 18px;
  display: grid;
  gap: 12px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--surface);
}
.pos-fg { display: grid; gap: 4px; }
.pos-fg label { font-size: 12px; font-weight: 700; color: var(--text); }
.pos-finput {
  width: 100%;
  height: 39px;
  padding: 0 12px;
  font: inherit;
  font-size: 13px;
  background: var(--input-bg);
  color: var(--ink);
  border: 1.5px solid var(--input-border);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.15s;
}
.pos-finput:focus {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(31, 138, 125, 0.14);
}
.pos-mfoot {
  padding: 12px 18px;
  border-top: 1px solid var(--line);
  background: var(--surface-2);
}

/* --- COMPACT & CLEAN PAYMENT MODAL STYLES --- */
.pos-modal-pay {
  width: 100%;
  max-width: 545px;
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 28px 65px rgba(0, 0, 0, 0.48);
  animation: pos-pop 0.22s ease;
}
.pay-mhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: linear-gradient(135deg, #1f8a7d, #166a60);
  color: #fff;
}
.pay-mhead h3 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 7px;
}

.pay-mbody-grid {
  display: grid;
  grid-template-columns: 1fr 185px;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface);
  max-height: 80vh;
  overflow-y: auto;
}
.pay-col-left { display: grid; gap: 8px; }
.pay-col-right {
  display: flex;
  flex-direction: column;
  gap: 7px;
  background: var(--surface-2);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--line);
  height: fit-content;
}

.pos-modal-pay .pos-fg { display: grid; gap: 3px; }
.pos-modal-pay .pos-fg label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text);
}
.pos-modal-pay .pos-finput {
  width: 100%;
  height: 35px;
  padding: 0 10px;
  font: inherit;
  font-size: 13px;
  background: var(--input-bg);
  color: var(--ink);
  border: 1.5px solid var(--input-border);
  border-radius: 8px;
  outline: none;
}
.pos-modal-pay .pos-finput:focus {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(31, 138, 125, 0.14);
}

.pay-top-box {
  background: var(--surface-3);
  padding: 9px 12px;
  border-radius: 10px;
  display: grid;
  gap: 2px;
  border: 1px solid var(--line-strong);
}
.pay-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.pay-top-row.usd {
  color: var(--teal-d);
  font-size: 17px;
  font-weight: 800;
}
.pay-top-row.riel {
  color: var(--green);
  font-size: 13.5px;
  font-weight: 700;
}

.pay-pfx-wrap { position: relative; display: flex; align-items: center; }
.pay-pfx {
  position: absolute;
  left: 1px;
  top: 1px;
  bottom: 1px;
  width: 30px;
  display: grid;
  place-items: center;
  background: var(--surface-3);
  color: var(--text);
  font-weight: 800;
  border-right: 1px solid var(--input-border);
  border-radius: 7px 0 0 7px;
  font-size: 12px;
  pointer-events: none;
}
.pay-pfx-wrap .pos-finput {
  padding-left: 38px;
  text-align: right;
  font-weight: 700;
}

.pay-grid-quick {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.pay-q-btn {
  all: unset;
  cursor: pointer;
  text-align: center;
  height: 34px;
  background: var(--surface);
  border: 1.5px solid var(--input-border);
  border-radius: 8px;
  font-weight: 700;
  font-size: 12.5px;
  color: var(--ink);
  transition: all 0.15s;
}
.pay-q-btn:hover {
  background: var(--mint);
  border-color: var(--teal);
  color: var(--teal-d);
  transform: translateY(-1px);
}
.pay-clear-btn {
  all: unset;
  cursor: pointer;
  text-align: center;
  height: 33px;
  background: var(--danger-soft);
  border: 1.5px solid rgba(222, 75, 63, 0.35);
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  color: var(--danger);
  width: 100%;
  display: grid;
  place-items: center;
  transition: all 0.15s;
}
.pay-clear-btn:hover { filter: brightness(0.96); }

.pay-delivery-box {
  background: var(--surface-2);
  border: 1.5px dashed var(--line-strong);
  border-radius: 10px;
  padding: 9px 10px;
  display: grid;
  gap: 7px;
}
.pay-map-btn {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--teal-d);
  background: var(--mint);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--line-strong);
}
.pay-map-btn:hover {
  background: var(--teal);
  color: #fff;
}

.pay-mfoot {
  padding: 10px 16px 12px;
  background: var(--surface-2);
  border-top: 1px solid var(--line);
}
.pay-submit-btn {
  all: unset;
  cursor: pointer;
  width: 100%;
  height: 41px;
  background: linear-gradient(135deg, #25998b, #176f65);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  box-shadow: 0 4px 12px rgba(31, 138, 125, 0.28);
  transition: transform 0.1s, filter 0.15s;
}
.pay-submit-btn:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}
.pay-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.pos-spin { animation: pos-rot 0.8s linear infinite; }
@keyframes pos-rot { to { transform: rotate(360deg); } }

@media (max-width: 992px) {
  .pos-layout { grid-template-columns: 1fr; height: auto; }
  .pos-left { max-height: 580px; }
  .pos-products-grid { max-height: 520px; }
}
@media (max-width: 720px) {
  .pay-mbody-grid { grid-template-columns: 1fr; }
}
`;

// --- INTERACTIVE MAP PICKER COMPONENT (OpenStreetMap + Leaflet) ---
function DeliveryMapPicker({
  isOpen,
  onClose,
  initialLat = 11.565,
  initialLng = 104.915,
  onSelectLocation,
}) {
  const { lang, t } = useTranslation();
  const tr = (key, fb) => resolvePosTranslate(t, key, fb);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({
    lat: Number(initialLat) || 11.565,
    lng: Number(initialLng) || 104.915,
  });
  const [addressText, setAddressText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loadingAddr, setLoadingAddr] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const ensureLeaflet = () =>
      new Promise((resolve) => {
        if (window.L) return resolve(window.L);

        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve(window.L);
        document.body.appendChild(script);
      });

    let isMounted = true;
    ensureLeaflet().then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const startLat = Number(initialLat) || 11.565;
      const startLng = Number(initialLng) || 104.915;

      const map = L.map(mapContainerRef.current).setView(
        [startLat, startLng],
        15,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(
        map,
      );

      const updatePoint = async (lat, lng) => {
        const cleanLat = Number(lat.toFixed(6));
        const cleanLng = Number(lng.toFixed(6));
        setCoords({ lat: cleanLat, lng: cleanLng });
        setLoadingAddr(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${cleanLat}&lon=${cleanLng}&accept-language=${
              lang === "en" ? "en" : "km,en"
            }`,
          );
          const data = await res.json();
          if (data?.display_name) {
            setAddressText(data.display_name);
          }
        } catch (err) {
          console.warn("Reverse geocode error:", err);
        } finally {
          setLoadingAddr(false);
        }
      };

      marker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        updatePoint(pos.lat, pos.lng);
      });

      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        updatePoint(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      setTimeout(() => map.invalidateSize(), 180);
      updatePoint(startLat, startLng);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, initialLat, initialLng, lang]);

  const handleSearchPlace = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    try {
      setLoadingAddr(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          searchText,
        )}&countrycodes=kh&limit=1`,
      );
      const list = await res.json();
      if (list && list.length > 0) {
        const { lat, lon, display_name } = list[0];
        const nLat = Number(Number(lat).toFixed(6));
        const nLng = Number(Number(lon).toFixed(6));
        setCoords({ lat: nLat, lng: nLng });
        setAddressText(display_name);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([nLat, nLng], 16);
          markerRef.current.setLatLng([nLat, nLng]);
        }
      } else {
        toastr.error(tr("pos_msg_not_found_title"), tr("pos_no_prods"));
      }
    } catch (err) {
      console.error("Map search error:", err);
    } finally {
      setLoadingAddr(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toastr.error(tr("pos_msg_error"), "Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nLat = Number(pos.coords.latitude.toFixed(6));
        const nLng = Number(pos.coords.longitude.toFixed(6));
        setCoords({ lat: nLat, lng: nLng });
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([nLat, nLng], 16);
          markerRef.current.setLatLng([nLat, nLng]);
        }
      },
      () => toastr.error(tr("pos_msg_error"), "GPS permission denied"),
    );
  };

  if (!isOpen) return null;

  return (
    <div className="pos-ovl" style={{ zIndex: 2200 }} onClick={onClose}>
      <div
        className="pos-modal"
        style={{ maxWidth: 600, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pay-mhead">
          <h3>
            <MapPin size={17} /> {tr("pos_map_modal_title")}
          </h3>
          <button
            type="button"
            style={{ all: "unset", cursor: "pointer", color: "#fff" }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="pos-mbody" style={{ gap: 10 }}>
          <form
            onSubmit={handleSearchPlace}
            style={{ display: "flex", gap: 6 }}
          >
            <input
              type="text"
              className="pos-finput"
              placeholder={tr("pos_map_search_ph")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              type="submit"
              className="pos-act-btn pay"
              style={{
                width: 88,
                height: 39,
                gridColumn: "auto",
                fontSize: 12.5,
              }}
            >
              {tr("pos_map_search_btn")}
            </button>
            <button
              type="button"
              onClick={handleCurrentLocation}
              title={tr("pos_current_gps_title")}
              style={{
                all: "unset",
                cursor: "pointer",
                width: 39,
                height: 39,
                borderRadius: 10,
                background: "var(--mint)",
                color: "var(--teal-d)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Crosshair size={18} />
            </button>
          </form>

          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: 300,
              borderRadius: 12,
              border: "1.5px solid var(--line-strong)",
              overflow: "hidden",
            }}
          />

          <div
            style={{
              background: "var(--surface-2)",
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              fontSize: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                color: "var(--teal-d)",
              }}
            >
              <span>{tr("pos_map_coords_title")}</span>
              <span>
                {coords.lat}, {coords.lng}
              </span>
            </div>
            <div style={{ marginTop: 4, color: "var(--text)" }}>
              <strong>{tr("pos_map_addr_label")}</strong>
              {loadingAddr
                ? tr("pos_map_fetching_addr")
                : addressText || tr("pos_map_click_hint")}
            </div>
          </div>
        </div>

        <div
          className="pos-mfoot"
          style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
        >
          <button
            type="button"
            className="pos-act-btn cancel"
            style={{ width: 92, height: 36 }}
            onClick={onClose}
          >
            {tr("pos_btn_cancel")}
          </button>
          <button
            type="button"
            className="pos-act-btn pay"
            style={{ width: 155, height: 36, gridColumn: "auto" }}
            onClick={() => {
              onSelectLocation({
                lat: coords.lat,
                lng: coords.lng,
                address: addressText,
              });
              onClose();
            }}
          >
            <CheckCircle2 size={15} /> {tr("pos_use_this_loc_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function POSPage() {
  const { t } = useTranslation();
  const tr = (key, fb) => resolvePosTranslate(t, key, fb);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderType, setOrderType] = useState("dine_in");

  // Searchable Customer Dropdown State
  const [isCustMenuOpen, setIsCustMenuOpen] = useState(false);
  const [custSearchQuery, setCustSearchQuery] = useState("");
  const custDropdownRef = useRef(null);
  const custSearchInputRef = useRef(null);

  // Modals state
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: "",
    email: "",
    phone: "",
    points: 0,
    address: "",
  });

  // Order-level Discount, Tax & Payment Form State
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountPct, setDiscountPct] = useState("");
  const [discountAmt, setDiscountAmt] = useState("");
  const [taxPct, setTaxPct] = useState("");
  const [receivedUsd, setReceivedUsd] = useState("");
  const [receivedRiel, setReceivedRiel] = useState("");
  const [allowDebt, setAllowDebt] = useState(false);

  // Delivery Data State
  const [deliveryInfo, setDeliveryInfo] = useState({
    pickup_address: SHOP.address,
    delivery_address: "",
    delivery_fee: "0",
    delivery_partner: "Grab Express",
    receiver_name: "",
    receiver_phone: "",
    note: "",
    store_lat: SHOP.lat,
    store_lng: SHOP.lng,
    customer_lat: 11.565,
    customer_lng: 104.915,
  });

  useEffect(() => {
    fetchData();
    fetchCustomers();
    fetchExpenses();
  }, []);

  // បិទផ្ទាំងជ្រើសរើសអតិថិជនពេលចុចក្រៅប្រអប់
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        custDropdownRef.current &&
        !custDropdownRef.current.contains(e.target)
      ) {
        setIsCustMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus ប្រអប់ស្វែងរកអតិថិជនពេលបើក Dropdown
  useEffect(() => {
    if (isCustMenuOpen) {
      setTimeout(() => custSearchInputRef.current?.focus(), 60);
    } else {
      setCustSearchQuery("");
    }
  }, [isCustMenuOpen]);

  const selectedCustomerObj = useMemo(
    () =>
      customers.find((c) => String(c.id) === String(selectedCustomer)) || null,
    [customers, selectedCustomer],
  );

  const filteredCustomers = useMemo(() => {
    const q = custSearchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        String(c.phone || "")
          .toLowerCase()
          .includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [customers, custSearchQuery]);

  // Filter in-stock products (stock_quantity > 0) and active categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        getPosProducts(),
        getPosCategories(),
      ]);
      const pList = prodRes?.data?.data || prodRes?.data || prodRes || [];
      const cList = catRes?.data?.data || catRes?.data || catRes || [];

      const allProducts = Array.isArray(pList) ? pList : [];
      const allCategories = Array.isArray(cList) ? cList : [];

      const inStockProducts = allProducts.filter((p) => {
        const stock = Number(p.stock_quantity ?? p.stock ?? p.qty ?? 0);
        return stock > 0;
      });

      const activeCategoryIds = new Set(
        inStockProducts
          .map((p) => String(p.category_id ?? p.category?.id ?? ""))
          .filter(Boolean),
      );

      const availableCategories = allCategories.filter((cat) =>
        activeCategoryIds.has(String(cat.id)),
      );

      setProducts(inStockProducts);
      setCategories(availableCategories);

      setSelectedCategory((prev) =>
        prev !== "all" && !activeCategoryIds.has(String(prev)) ? "all" : prev,
      );
    } catch (err) {
      console.error("Error loading POS data:", err);
      toastr.error(tr("pos_msg_error"), tr("pos_msg_load_fail"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await getCustomer();
      const list = res?.data?.data || res?.data || res || [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await getExpense();
      const list = res?.data?.data || res?.data || res || [];
      setExpenses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  // ✅ មុខងារបោះពុម្ពវិក្កយបត្រត្រួតពិនិត្យតម្លៃ (Pre-Bill / Check Bill) មុនពេលគិតលុយ
  const handlePrintCheckBill = () => {
    if (cart.length === 0) {
      toastr.error(tr("pos_msg_notice"), tr("pos_msg_empty_cart_warn"));
      return;
    }

    const custObj = selectedCustomerObj;
    const checkOrderNo = `CHK-${String(Date.now()).slice(-6)}`;

    setLastReceipt({
      is_check_bill: true, // សម្គាល់ថាជាវិក្កយបត្រត្រួតពិនិត្យតម្លៃ (មិនទាន់បង់ប្រាក់)
      order_number: checkOrderNo,
      invoice_number: checkOrderNo,
      created_at: new Date().toISOString(),
      customer_name:
        custObj?.name || deliveryInfo.receiver_name || tr("pos_walk_in"),
      customer_phone: custObj?.phone || deliveryInfo.receiver_phone || "",
      order_type: orderType,
      subtotal: Number(totals.subtotal.toFixed(2)),
      discount_amount: Number(totals.discount.toFixed(2)),
      tax_amount: Number(totals.tax.toFixed(2)),
      delivery_fee: Number(totals.deliveryFee.toFixed(2)),
      total_amount: Number(totals.total.toFixed(2)),
      total_riel: totals.totalRiel,
      payment_method: "UNPAID (CHECK BILL)",
      amount_paid: 0,
      change_amount: 0,
      delivery: orderType === "delivery" ? deliveryInfo : null,
      items: cart.map((i) => {
        const lineGross = i.price * i.quantity;
        const lineDisc = (lineGross * Number(i.discount_pct || 0)) / 100;
        const lineNet = Math.max(lineGross - lineDisc, 0);
        return {
          product_id: i.id,
          product_name:
            Number(i.discount_pct || 0) > 0
              ? `${i.name} (-${i.discount_pct}%)`
              : i.name,
          unit_price: Number(i.price.toFixed(2)),
          quantity: Number(i.quantity),
          discount_pct: Number(i.discount_pct || 0),
          total_price: Number(lineNet.toFixed(2)),
        };
      }),
    });

    setIsInvoiceOpen(true);
  };
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newCust.name.trim(),
        email: newCust.email.trim(),
        phone: newCust.phone.trim() || null,
        points: newCust.points !== "" ? Number(newCust.points) : 0,
        address: newCust.address.trim() || null,
      };
      const res = await createCustomer(payload);
      const created = res?.data?.data || res?.data || res;

      toastr.success(tr("pos_msg_success"), tr("pos_msg_cust_added"));
      await fetchCustomers();
      if (created?.id) setSelectedCustomer(String(created.id));
      setIsAddCustOpen(false);
      setNewCust({ name: "", email: "", phone: "", points: 0, address: "" });
    } catch (err) {
      const errData = err?.response?.data;
      if (errData?.errors) {
        const msg = Object.values(errData.errors).flat().join(" | ");
        toastr.error(tr("pos_msg_data_err"), msg);
      } else {
        toastr.error(
          tr("pos_msg_error"),
          errData?.message || tr("pos_msg_cust_fail"),
        );
      }
    }
  };

  const addToCart = (product) => {
    const maxStock = Number(product.stock_quantity ?? product.stock ?? 0);
    if (maxStock <= 0) {
      toastr.error(tr("pos_msg_out_stock_title"), `${product.name}`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > maxStock) {
          toastr.error(
            tr("pos_msg_low_stock_title"),
            `${product.name} (${tr("pos_stock_badge")} ${maxStock})`,
          );
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          stock_quantity: maxStock,
          price: Number(product.selling_price || product.price || 0),
          discount_pct: 0,
        },
      ];
    });
  };

  const handleBarcodeKeyDown = (e) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      e.preventDefault();
      const q = barcodeInput.trim().toLowerCase();
      const found = products.find(
        (p) =>
          String(p.barcode || "").toLowerCase() === q ||
          String(p.sku || "").toLowerCase() === q ||
          String(p.name || "").toLowerCase() === q,
      );
      if (found) {
        addToCart(found);
        setBarcodeInput("");
      } else {
        toastr.error(tr("pos_msg_not_found_title"), `"${barcodeInput}"`);
      }
    }
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const maxStock = Number(
              item.stock_quantity ?? item.stock ?? Infinity,
            );
            const newQty = item.quantity + delta;
            if (delta > 0 && newQty > maxStock) {
              toastr.error(
                tr("pos_msg_low_stock_title"),
                `${item.name} (${tr("pos_stock_badge")} ${maxStock})`,
              );
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const updateItemDiscount = (id, pctVal) => {
    const cleanPct = Math.min(Math.max(Number(pctVal || 0), 0), 100);
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, discount_pct: cleanPct } : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPct("");
    setDiscountAmt("");
    setTaxPct("");
  };

  const cartQtyMap = useMemo(() => {
    const map = {};
    cart.forEach((item) => {
      map[item.id] = item.quantity;
    });
    return map;
  }, [cart]);

  // Calculate Subtotal, Item Discount, Order Discount, Tax & Total
  const totals = useMemo(() => {
    const grossSubtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const itemDiscountTotal = cart.reduce((sum, item) => {
      const lineGross = item.price * item.quantity;
      const pct = Number(item.discount_pct || 0);
      return sum + (lineGross * pct) / 100;
    }, 0);

    const netAfterItemDisc = Math.max(grossSubtotal - itemDiscountTotal, 0);

    const orderLevelDisc =
      Number(discountAmt || 0) +
      (netAfterItemDisc * Number(discountPct || 0)) / 100;

    const totalDiscount = Math.min(
      grossSubtotal,
      itemDiscountTotal + orderLevelDisc,
    );

    const taxableAmount = Math.max(grossSubtotal - totalDiscount, 0);
    const taxAmount = (taxableAmount * Number(taxPct || 0)) / 100;

    const delFee =
      orderType === "delivery" ? Number(deliveryInfo.delivery_fee || 0) : 0;

    const total = Math.max(taxableAmount + taxAmount + delFee, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalRiel = Math.round((total * EXCHANGE_RATE) / 100) * 100;

    return {
      subtotal: grossSubtotal,
      itemDiscount: itemDiscountTotal,
      orderDiscount: orderLevelDisc,
      discount: totalDiscount,
      tax: taxAmount,
      deliveryFee: delFee,
      total,
      totalItems,
      totalRiel,
    };
  }, [
    cart,
    discountAmt,
    discountPct,
    taxPct,
    orderType,
    deliveryInfo.delivery_fee,
  ]);

  const paymentCalc = useMemo(() => {
    const usd = Number(receivedUsd || 0);
    const riel = Number(receivedRiel || 0);
    const amountPaidUsd = Number((usd + riel / EXCHANGE_RATE).toFixed(2));
    const changeUsd = Number(
      Math.max(amountPaidUsd - totals.total, 0).toFixed(2),
    );
    const debtUsd = Number(
      Math.max(totals.total - amountPaidUsd, 0).toFixed(2),
    );
    return { amountPaidUsd, changeUsd, debtUsd };
  }, [receivedUsd, receivedRiel, totals.total]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === "all" ||
        String(p.category_id) === String(selectedCategory);
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleOpenPay = () => {
    if (cart.length === 0) {
      toastr.error(tr("pos_msg_notice"), tr("pos_msg_empty_cart_warn"));
      return;
    }
    if (selectedCustomerObj) {
      setDeliveryInfo((prev) => ({
        ...prev,
        receiver_name: prev.receiver_name || selectedCustomerObj.name || "",
        receiver_phone: prev.receiver_phone || selectedCustomerObj.phone || "",
        delivery_address:
          prev.delivery_address || selectedCustomerObj.address || "",
      }));
    }
    setReceivedUsd(totals.total.toFixed(2));
    setReceivedRiel("0");
    setAllowDebt(false);
    setIsPayOpen(true);
  };

  const handleQuickCash = (amt) => {
    setReceivedUsd(String(amt));
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      toastr.error(tr("pos_msg_notice"), tr("pos_msg_select_pay_warn"));
      return;
    }

    if (
      orderType !== "delivery" &&
      !allowDebt &&
      paymentCalc.amountPaidUsd < totals.total
    ) {
      toastr.error(
        tr("pos_msg_insufficient_title"),
        tr("pos_msg_insufficient_body"),
      );
      return;
    }

    try {
      setSubmitting(true);
      const custObj = selectedCustomerObj;
      const orderNumber = generateOrderNumber();
      const userId = getCurrentUserId();

      const payload = {
        order_number: orderNumber,
        user_id: userId,
        customer_id: custObj ? Number(custObj.id) : null,
        customer_name: custObj?.name || deliveryInfo.receiver_name || "Guest",
        customer_phone:
          custObj?.phone || deliveryInfo.receiver_phone || "000000000",
        customer_email: custObj?.email || undefined,
        customer_address:
          custObj?.address || deliveryInfo.delivery_address || null,
        customer_point: custObj?.points ?? 1,

        subtotal: Number(totals.subtotal.toFixed(2)),
        discount_amount: Number(totals.discount.toFixed(2)),
        tax_amount: Number(totals.tax.toFixed(2)),
        total_amount: Number(totals.total.toFixed(2)),

        order_type: orderType,
        payment_method: paymentMethod,
        amount_paid: paymentCalc.amountPaidUsd,
        change_amount: paymentCalc.changeUsd,

        ...(orderType === "delivery"
          ? {
              pickup_address: deliveryInfo.pickup_address || "Store Address",
              delivery_address:
                deliveryInfo.delivery_address ||
                custObj?.address ||
                "Phnom Penh, Cambodia",
              delivery_fee: Number(deliveryInfo.delivery_fee || 0),
              delivery_partner: deliveryInfo.delivery_partner || "Grab Express",
              receiver_name:
                deliveryInfo.receiver_name || custObj?.name || "Guest",
              receiver_phone:
                deliveryInfo.receiver_phone || custObj?.phone || "000000000",
              note: deliveryInfo.note || null,
              store_lat: Number(deliveryInfo.store_lat ?? 11.5564),
              store_lng: Number(deliveryInfo.store_lng ?? 104.9282),
              customer_lat: Number(deliveryInfo.customer_lat ?? 11.565),
              customer_lng: Number(deliveryInfo.customer_lng ?? 104.915),
            }
          : {}),

        items: cart.map((i) => {
          const lineGross = i.price * i.quantity;
          const lineDisc = (lineGross * Number(i.discount_pct || 0)) / 100;
          const lineNet = Math.max(lineGross - lineDisc, 0);
          return {
            product_id: i.id,
            product_name:
              Number(i.discount_pct || 0) > 0
                ? `${i.name} (-${i.discount_pct}%)`
                : i.name,
            unit_price: Number(i.price.toFixed(2)),
            quantity: Number(i.quantity),
            discount_pct: Number(i.discount_pct || 0),
            total_price: Number(lineNet.toFixed(2)),
          };
        }),
      };

      const res = await createPosOrder(payload);
      const savedOrder = res?.data || payload;

      toastr.success(
        tr("pos_msg_success"),
        res?.message || tr("pos_msg_order_success"),
      );

      setLastReceipt({
        ...payload,
        id: savedOrder?.id,
        order_number: savedOrder?.order_number || orderNumber,
        created_at: savedOrder?.created_at || new Date().toISOString(),
        customer_name:
          savedOrder?.customer?.name ||
          custObj?.name ||
          deliveryInfo.receiver_name ||
          tr("pos_walk_in"),
        customer_phone:
          savedOrder?.customer?.phone ||
          custObj?.phone ||
          deliveryInfo.receiver_phone ||
          "",
        delivery_fee: totals.deliveryFee,
        total_riel: totals.totalRiel,
        delivery:
          savedOrder?.delivery ||
          (orderType === "delivery" ? deliveryInfo : null),
      });

      setCart([]);
      setDiscountPct("");
      setDiscountAmt("");
      setTaxPct("");
      setIsPayOpen(false);
      setIsInvoiceOpen(true);
      fetchData();
    } catch (err) {
      console.error("Checkout error:", err);
      const errData = err?.response?.data;
      if (errData?.errors) {
        const msg = Object.values(errData.errors).flat().join(" | ");
        toastr.error(tr("pos_msg_data_err"), msg);
      } else {
        toastr.error(
          tr("pos_msg_error"),
          errData?.message || tr("pos_msg_order_fail"),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="pos">
        <div className="pos-layout">
          {/* LEFT: Cart & Checkout Summary */}
          <div className="pos-left">
            <div className="pos-cart-top">
              <div className="pos-type-switch">
                <button
                  type="button"
                  className={`pos-type-btn${
                    orderType === "dine_in" ? " on" : ""
                  }`}
                  onClick={() => setOrderType("dine_in")}
                >
                  <Utensils size={13} /> {tr("pos_dine_in")}
                </button>
                <button
                  type="button"
                  className={`pos-type-btn${
                    orderType === "delivery" ? " on" : ""
                  }`}
                  onClick={() => setOrderType("delivery")}
                >
                  <Truck size={13} /> {tr("pos_delivery")}
                </button>
              </div>

              {/* ✅ CUSTOM SEARCHABLE CUSTOMER DROPDOWN */}
              <div className="pos-cust-box" ref={custDropdownRef}>
                <div className="pos-cust-picker">
                  <button
                    type="button"
                    className={`pos-cust-trigger${
                      isCustMenuOpen ? " open" : ""
                    }`}
                    onClick={() => setIsCustMenuOpen((prev) => !prev)}
                  >
                    <div className="pos-cust-trig-left">
                      <span className="pos-cust-mini-ava">
                        {selectedCustomerObj ? (
                          (selectedCustomerObj.name || "C")
                            .charAt(0)
                            .toUpperCase()
                        ) : (
                          <User size={12} />
                        )}
                      </span>
                      <span className="pos-cust-trig-text">
                        {selectedCustomerObj
                          ? `${selectedCustomerObj.name}${
                              selectedCustomerObj.phone
                                ? ` (${selectedCustomerObj.phone})`
                                : ""
                            }`
                          : tr("pos_walk_in")}
                      </span>
                    </div>
                    <ChevronDown size={14} className="pos-cust-trig-chev" />
                  </button>

                  {isCustMenuOpen && (
                    <div className="pos-cust-menu">
                      {/* Search Input Box inside Dropdown */}
                      <div className="pos-cust-search-wrap">
                        <Search size={13} className="s-ico" />
                        <input
                          ref={custSearchInputRef}
                          type="text"
                          className="pos-cust-search-inp"
                          placeholder={tr(
                            "pos_search_cust_ph",
                            "ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ...",
                          )}
                          value={custSearchQuery}
                          onChange={(e) => setCustSearchQuery(e.target.value)}
                        />
                        {custSearchQuery && (
                          <button
                            type="button"
                            className="pos-cust-clear-s"
                            onClick={() => setCustSearchQuery("")}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Options List */}
                      <div className="pos-cust-list">
                        {/* Walk-In Customer Option */}
                        <button
                          type="button"
                          className={`pos-cust-opt${
                            !selectedCustomer ? " active" : ""
                          }`}
                          onClick={() => {
                            setSelectedCustomer("");
                            setIsCustMenuOpen(false);
                          }}
                        >
                          <div className="pos-cust-opt-left">
                            <span className="pos-cust-ava">
                              <User size={14} />
                            </span>
                            <div className="pos-cust-meta">
                              <div className="pos-cust-opt-name">
                                {tr("pos_walk_in")}
                              </div>
                              <div className="pos-cust-opt-sub">
                                Default Guest
                              </div>
                            </div>
                          </div>
                          {!selectedCustomer && (
                            <Check
                              size={14}
                              style={{ color: "var(--teal-d)", flexShrink: 0 }}
                            />
                          )}
                        </button>

                        {filteredCustomers.length === 0 ? (
                          <div className="pos-cust-empty">
                            {tr("pos_no_cust_found", "រកមិនឃើញអតិថិជនទេ")}
                          </div>
                        ) : (
                          filteredCustomers.map((c) => {
                            const isSelected =
                              String(selectedCustomer) === String(c.id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                className={`pos-cust-opt${
                                  isSelected ? " active" : ""
                                }`}
                                onClick={() => {
                                  setSelectedCustomer(String(c.id));
                                  setIsCustMenuOpen(false);
                                }}
                              >
                                <div className="pos-cust-opt-left">
                                  <span className="pos-cust-ava">
                                    {(c.name || "C").charAt(0).toUpperCase()}
                                  </span>
                                  <div className="pos-cust-meta">
                                    <div className="pos-cust-opt-name">
                                      {c.name}
                                    </div>
                                    <div className="pos-cust-opt-sub">
                                      <span>
                                        {c.phone || c.email || "No phone"}
                                      </span>
                                      {c.points !== undefined &&
                                        c.points !== null && (
                                          <span className="pos-cust-pts">
                                            ★ {c.points} pts
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check
                                    size={14}
                                    style={{
                                      color: "var(--teal-d)",
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="pos-add-cust-btn"
                  onClick={() => setIsAddCustOpen(true)}
                  title={tr("pos_add_cust_title")}
                >
                  <UserPlus size={16} />
                </button>
              </div>
            </div>

            <div className="pos-barcode-box">
              <span className="pos-barcode-ico-left">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                placeholder={tr("pos_barcode_ph")}
              />
              <span className="pos-barcode-ico-right">
                <ScanBarcode size={16} />
              </span>
            </div>

            {/* 5-Column Cart Headers */}
            <div className="pos-cart-headers">
              <span>{tr("pos_col_item")}</span>
              <span style={{ textAlign: "right" }}>{tr("pos_col_price")}</span>
              <span style={{ textAlign: "center" }}>{tr("pos_col_disc")}</span>
              <span style={{ textAlign: "center" }}>{tr("pos_col_qty")}</span>
              <span style={{ textAlign: "right" }}>{tr("pos_col_total")}</span>
              <span />
            </div>

            <div className="pos-items-list">
              {cart.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "46px 20px",
                    color: "var(--muted)",
                  }}
                >
                  <ShoppingCart
                    size={36}
                    style={{ margin: "0 auto 10px", opacity: 0.35 }}
                  />
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                    {tr("pos_empty_cart")}
                  </div>
                  <div style={{ fontSize: 11.5, marginTop: 3, opacity: 0.8 }}>
                    {tr("pos_empty_cart_sub")}
                  </div>
                </div>
              ) : (
                cart.map((item) => {
                  const gross = item.price * item.quantity;
                  const discAmt =
                    (gross * Number(item.discount_pct || 0)) / 100;
                  const netLine = Math.max(gross - discAmt, 0);

                  return (
                    <div className="pos-item-row" key={item.id}>
                      <div style={{ minWidth: 0 }}>
                        <div className="pos-item-name" title={item.name}>
                          {item.name}
                        </div>
                        {discAmt > 0 && (
                          <div className="pos-item-sub">
                            {tr("pos_disc_badge")} -${discAmt.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="pos-item-price">
                        ${item.price.toFixed(2)}
                      </div>

                      <div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="pos-item-disc-inp"
                          value={item.discount_pct || ""}
                          onChange={(e) =>
                            updateItemDiscount(item.id, e.target.value)
                          }
                          placeholder="0%"
                          title={tr("pos_col_disc")}
                        />
                      </div>

                      <div className="pos-item-qtybox">
                        <button
                          className="pos-qbtn"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          <Minus size={10} />
                        </button>
                        <span
                          style={{
                            width: 22,
                            textAlign: "center",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="pos-qbtn"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      <div className="pos-item-total">
                        ${netLine.toFixed(2)}
                      </div>

                      <button
                        className="pos-del-item"
                        onClick={() => removeFromCart(item.id)}
                        title={tr("pos_btn_clear")}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer with Order Discount (%, $) & Tax VAT (%) */}
            <div className="pos-cart-footer">
              <div className="pos-summary-grid">
                <div className="pos-summary-cell">
                  <span>{tr("pos_total_items")}</span>
                  <b>
                    {totals.totalItems} (${totals.subtotal.toFixed(2)})
                  </b>
                </div>
                <div className="pos-summary-cell">
                  <span>{tr("pos_subtotal")}</span>
                  <b>${totals.subtotal.toFixed(2)}</b>
                </div>
                <div className="pos-summary-cell">
                  <span>{tr("pos_total_disc")}</span>
                  <b style={{ color: "var(--danger)" }}>
                    -${totals.discount.toFixed(2)}
                  </b>
                </div>
                <div className="pos-summary-cell">
                  <span>
                    {tr("pos_vat_label")} {Number(taxPct || 0)}%):
                  </span>
                  <b style={{ color: "var(--price-blue)" }}>
                    +${totals.tax.toFixed(2)}
                  </b>
                </div>
              </div>

              <div className="pos-inline-inputs">
                <div className="pos-mini-fg">
                  <label>{tr("pos_order_disc_pct")}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="pos-mini-inp"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(e.target.value)}
                    placeholder="0%"
                  />
                </div>
                <div className="pos-mini-fg">
                  <label>{tr("pos_order_disc_usd")}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="pos-mini-inp"
                    value={discountAmt}
                    onChange={(e) => setDiscountAmt(e.target.value)}
                    placeholder="$0.00"
                  />
                </div>
                <div className="pos-mini-fg">
                  <label>{tr("pos_tax_input")}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className="pos-mini-inp"
                    value={taxPct}
                    onChange={(e) => setTaxPct(e.target.value)}
                    placeholder="0%"
                  />
                </div>
              </div>

              <div className="pos-total-due">
                <span>{tr("pos_grand_total_due")}</span>
                <b>${totals.total.toFixed(2)}</b>
              </div>

              <div className="pos-action-grid">
                <button className="pos-act-btn cancel" onClick={clearCart}>
                  <Trash2 size={13} /> {tr("pos_btn_clear")}
                </button>
                <button
                  className="pos-act-btn hold"
                  onClick={() =>
                    setOrderType(
                      orderType === "delivery" ? "dine_in" : "delivery",
                    )
                  }
                >
                  <Truck size={13} />{" "}
                  {orderType === "delivery"
                    ? tr("pos_delivery")
                    : tr("pos_btn_hold")}
                </button>
                <button
                  type="button"
                  className="pos-act-btn hold"
                  onClick={handlePrintCheckBill}
                  disabled={cart.length === 0}
                >
                  <Printer size={13} /> {tr("pos_btn_print")}
                </button>
                <button className="pos-act-btn pay" onClick={handleOpenPay}>
                  <CheckCircle2 size={15} /> {tr("pos_btn_pay")}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Categories & Products Grid */}
          <div className="pos-right">
            <div className="pos-cats-bar">
              <button
                className={`pos-cat-tab${
                  selectedCategory === "all" ? " on" : ""
                }`}
                onClick={() => setSelectedCategory("all")}
              >
                {tr("pos_all_cats")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`pos-cat-tab${
                    String(selectedCategory) === String(cat.id) ? " on" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="pos-prod-toolbar">
              <div className="pos-prod-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder={tr("pos_search_prod_ph")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="pos-cat-tab"
                onClick={fetchData}
                title={tr("pos_refresh")}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            <div className="pos-products-grid">
              {loading ? (
                <div className="pos-empty-products">
                  {tr("pos_loading_prods")}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="pos-empty-products">{tr("pos_no_prods")}</div>
              ) : (
                filteredProducts.map((p) => {
                  const img = resolveProductImage(p);
                  const price = Number(p.selling_price || p.price || 0);
                  const stock = Number(p.stock_quantity ?? p.stock ?? 0);
                  const inCartQty = cartQtyMap[p.id] || 0;

                  return (
                    <div
                      className={`pos-prod-card${
                        inCartQty > 0 ? " in-cart" : ""
                      }`}
                      key={p.id}
                      onClick={() => addToCart(p)}
                    >
                      <div className="pos-prod-imgwrap">
                        {inCartQty > 0 && (
                          <span className="pos-prod-qty-badge">
                            {inCartQty}
                          </span>
                        )}
                        <span className="pos-prod-stock-badge">
                          {tr("pos_stock_badge")} {stock}
                        </span>
                        {img ? (
                          <img
                            src={img}
                            alt={p.name}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="pos-prod-ph">
                            {(p.name || "P").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="pos-prod-info">
                        <div className="pos-prod-name" title={p.name}>
                          {p.name}
                        </div>
                        <div className="pos-prod-price">
                          ${price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* --- MODAL: ADD CUSTOMER --- */}
        {isAddCustOpen && (
          <div className="pos-ovl" onClick={() => setIsAddCustOpen(false)}>
            <div className="pos-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pos-mhead">
                <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <UserPlus size={18} /> {tr("pos_add_cust_title")}
                </h3>
                <button
                  type="button"
                  style={{ all: "unset", cursor: "pointer", color: "#fff" }}
                  onClick={() => setIsAddCustOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddCustomer}>
                <div className="pos-mbody">
                  <div className="pos-fg">
                    <label>{tr("pos_cust_name")}</label>
                    <input
                      type="text"
                      className="pos-finput"
                      required
                      maxLength={255}
                      value={newCust.name}
                      onChange={(e) =>
                        setNewCust({ ...newCust, name: e.target.value })
                      }
                      placeholder={tr("pos_cust_name_ph")}
                    />
                  </div>

                  <div className="pos-fg">
                    <label>{tr("pos_cust_email")}</label>
                    <input
                      type="email"
                      className="pos-finput"
                      required
                      value={newCust.email}
                      onChange={(e) =>
                        setNewCust({ ...newCust, email: e.target.value })
                      }
                      placeholder="example@gmail.com"
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div className="pos-fg">
                      <label>{tr("pos_cust_phone")}</label>
                      <input
                        type="text"
                        className="pos-finput"
                        maxLength={20}
                        value={newCust.phone}
                        onChange={(e) =>
                          setNewCust({ ...newCust, phone: e.target.value })
                        }
                        placeholder="012 345 678"
                      />
                    </div>

                    <div className="pos-fg">
                      <label>{tr("pos_cust_points")}</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="pos-finput"
                        value={newCust.points}
                        onChange={(e) =>
                          setNewCust({ ...newCust, points: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="pos-fg">
                    <label>{tr("pos_cust_address")}</label>
                    <input
                      type="text"
                      className="pos-finput"
                      maxLength={500}
                      value={newCust.address}
                      onChange={(e) =>
                        setNewCust({ ...newCust, address: e.target.value })
                      }
                      placeholder={tr("pos_cust_address_ph")}
                    />
                  </div>
                </div>

                <div
                  className="pos-mfoot"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    className="pos-act-btn cancel"
                    style={{ width: 95, height: 38 }}
                    onClick={() => setIsAddCustOpen(false)}
                  >
                    {tr("pos_btn_cancel")}
                  </button>
                  <button
                    type="submit"
                    className="pos-act-btn pay"
                    style={{ width: 135, height: 38, gridColumn: "auto" }}
                  >
                    {tr("pos_btn_save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL: COMPACT PAYMENT CHECKOUT --- */}
        {isPayOpen && (
          <div className="pos-ovl" onClick={() => setIsPayOpen(false)}>
            <div className="pos-modal-pay" onClick={(e) => e.stopPropagation()}>
              <div className="pay-mhead">
                <h3>
                  <CreditCard size={17} /> {tr("pos_pay_modal_title")}
                </h3>
                <button
                  style={{ all: "unset", cursor: "pointer", color: "#fff" }}
                  onClick={() => setIsPayOpen(false)}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="pay-mbody-grid">
                {/* LEFT COLUMN: Inputs & Options */}
                <div className="pay-col-left">
                  <div className="pay-top-box">
                    <div className="pay-top-row usd">
                      <span>{tr("pos_total_usd_label")}</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                    <div className="pay-top-row riel">
                      <span>{tr("pos_total_riel_label")}</span>
                      <span>{totals.totalRiel.toLocaleString("en-US")} ៛</span>
                    </div>
                  </div>

                  <div className="pos-fg">
                    <label>{tr("pos_rec_usd_label")}</label>
                    <div className="pay-pfx-wrap">
                      <span className="pay-pfx">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="pos-finput"
                        value={receivedUsd}
                        onChange={(e) => setReceivedUsd(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="pos-fg">
                    <label>{tr("pos_pay_method_label")}</label>
                    <select
                      className="pos-finput"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="">{tr("pos_select_bank")}</option>
                      <option value="cash">{tr("pos_cash_opt")}</option>
                      <option value="aba">{tr("pos_aba_opt")}</option>
                      <option value="acleda">{tr("pos_acleda_opt")}</option>
                      <option value="wing">{tr("pos_wing_opt")}</option>
                    </select>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 6,
                    }}
                  >
                    <div className="pos-fg">
                      <label>{tr("pos_disc_pct_short")}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="pos-finput"
                        value={discountPct}
                        onChange={(e) => setDiscountPct(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="pos-fg">
                      <label style={{ color: "var(--danger)" }}>
                        {tr("pos_disc_usd_short")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="pos-finput"
                        value={discountAmt}
                        onChange={(e) => setDiscountAmt(e.target.value)}
                        placeholder="$0.00"
                      />
                    </div>
                    <div className="pos-fg">
                      <label style={{ color: "var(--price-blue)" }}>
                        {tr("pos_tax_short")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        className="pos-finput"
                        value={taxPct}
                        onChange={(e) => setTaxPct(e.target.value)}
                        placeholder="0%"
                      />
                    </div>
                  </div>

                  <div className="pos-fg">
                    <label>{tr("pos_rec_riel_label")}</label>
                    <div className="pay-pfx-wrap">
                      <span className="pay-pfx">៛</span>
                      <input
                        type="number"
                        step="100"
                        className="pos-finput"
                        value={receivedRiel}
                        onChange={(e) => setReceivedRiel(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* DELIVERY EXTRA FIELDS + MAP PICKER */}
                  {orderType === "delivery" && (
                    <div className="pay-delivery-box">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <strong
                          style={{ fontSize: 12, color: "var(--teal-d)" }}
                        >
                          {tr("pos_del_section_title")}
                        </strong>
                        <button
                          type="button"
                          className="pay-map-btn"
                          onClick={() => setIsMapOpen(true)}
                        >
                          <MapPin size={12} /> {tr("pos_pick_on_map")}
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        <div className="pos-fg">
                          <label>{tr("pos_del_partner")}</label>
                          <select
                            className="pos-finput"
                            value={deliveryInfo.delivery_partner}
                            onChange={(e) => {
                              const selectedPartner = e.target.value;
                              const matched = expenses.find(
                                (ex) =>
                                  (ex.note ||
                                    ex.delivery_partner ||
                                    ex.name ||
                                    ex.title) === selectedPartner,
                              );
                              setDeliveryInfo({
                                ...deliveryInfo,
                                delivery_partner: selectedPartner,
                                delivery_fee:
                                  matched?.amount !== undefined
                                    ? String(matched.amount)
                                    : deliveryInfo.delivery_fee,
                              });
                            }}
                          >
                            <option value="Grab Express">Grab Express</option>
                            {expenses.map((ex, idx) => {
                              const label =
                                ex.note ||
                                ex.delivery_partner ||
                                ex.name ||
                                ex.title ||
                                ex.category ||
                                `Partner ${idx + 1}`;
                              return (
                                <option key={ex.id ?? idx} value={label}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className="pos-fg">
                          <label>{tr("pos_del_fee")}</label>
                          <input
                            type="number"
                            step="0.1"
                            className="pos-finput"
                            value={deliveryInfo.delivery_fee}
                            onChange={(e) =>
                              setDeliveryInfo({
                                ...deliveryInfo,
                                delivery_fee: e.target.value,
                              })
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        <div className="pos-fg">
                          <label>{tr("pos_rec_name")}</label>
                          <input
                            type="text"
                            className="pos-finput"
                            value={deliveryInfo.receiver_name}
                            onChange={(e) =>
                              setDeliveryInfo({
                                ...deliveryInfo,
                                receiver_name: e.target.value,
                              })
                            }
                            placeholder={tr("pos_rec_name")}
                          />
                        </div>
                        <div className="pos-fg">
                          <label>{tr("pos_rec_phone")}</label>
                          <input
                            type="text"
                            className="pos-finput"
                            value={deliveryInfo.receiver_phone}
                            onChange={(e) =>
                              setDeliveryInfo({
                                ...deliveryInfo,
                                receiver_phone: e.target.value,
                              })
                            }
                            placeholder="012..."
                          />
                        </div>
                      </div>

                      <div className="pos-fg">
                        <label>{tr("pos_pickup_addr")}</label>
                        <input
                          type="text"
                          className="pos-finput"
                          value={deliveryInfo.pickup_address}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              pickup_address: e.target.value,
                            })
                          }
                          placeholder="Store Address"
                        />
                      </div>

                      <div className="pos-fg">
                        <label>{tr("pos_del_addr")}</label>
                        <input
                          type="text"
                          className="pos-finput"
                          value={deliveryInfo.delivery_address}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              delivery_address: e.target.value,
                            })
                          }
                          placeholder={tr("pos_del_addr_ph")}
                        />
                        <span style={{ fontSize: 10.5, color: "var(--muted)" }}>
                          {tr("pos_coords_label")} {deliveryInfo.customer_lat},{" "}
                          {deliveryInfo.customer_lng}
                        </span>
                      </div>

                      <div className="pos-fg">
                        <label>{tr("pos_note_label")}</label>
                        <input
                          type="text"
                          className="pos-finput"
                          value={deliveryInfo.note}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              note: e.target.value,
                            })
                          }
                          placeholder={tr("pos_note_ph")}
                        />
                      </div>
                    </div>
                  )}

                  {/* Change calculation */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "4px 0 2px",
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "var(--danger)",
                      }}
                    >
                      {tr("pos_change_label")}
                    </span>
                    <span
                      style={{
                        color: "var(--danger)",
                        fontSize: "16px",
                        fontWeight: 800,
                      }}
                    >
                      ${paymentCalc.changeUsd.toFixed(2)}
                    </span>
                  </div>

                  {/* Allow Debt Checkbox & Debt Info */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <input
                      type="checkbox"
                      id="debtCheck"
                      checked={allowDebt}
                      onChange={(e) => setAllowDebt(e.target.checked)}
                      style={{
                        width: 15,
                        height: 15,
                        accentColor: "#1f8a7d",
                      }}
                    />
                    <label
                      htmlFor="debtCheck"
                      style={{
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "12.5px",
                        color: "var(--amber)",
                      }}
                    >
                      {tr("pos_allow_debt_label")}
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "var(--amber)",
                    }}
                  >
                    <span>{tr("pos_debt_amount_label")}</span>
                    <span>${paymentCalc.debtUsd.toFixed(2)}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "12.5px",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>
                      {tr("pos_status_label")}
                    </span>
                    <span
                      style={{
                        padding: "1px 8px",
                        borderRadius: "5px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background:
                          paymentCalc.debtUsd > 0 ? "#6b7280" : "#15803d",
                        color: "#fff",
                      }}
                    >
                      {paymentCalc.debtUsd > 0
                        ? tr("pos_status_debt")
                        : tr("pos_status_paid")}
                    </span>
                  </div>
                </div>

                {/* RIGHT COLUMN: Quick Cash Buttons */}
                <div className="pay-col-right">
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--muted)",
                      textAlign: "center",
                    }}
                  >
                    {tr("pos_quick_cash_title")}
                  </div>
                  <div className="pay-grid-quick">
                    {[1, 5, 10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className="pay-q-btn"
                        onClick={() => handleQuickCash(amt)}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <button
                      type="button"
                      className="pay-clear-btn"
                      onClick={() => {
                        setReceivedUsd("0");
                        setReceivedRiel("0");
                      }}
                    >
                      {tr("pos_clear_cash_btn")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pay-mfoot">
                <button
                  type="button"
                  className="pay-submit-btn"
                  onClick={handleCheckout}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 size={16} className="pos-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}{" "}
                  {tr("pos_confirm_pay_btn")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL: DELIVERY MAP PICKER --- */}
        <DeliveryMapPicker
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          initialLat={deliveryInfo.customer_lat}
          initialLng={deliveryInfo.customer_lng}
          onSelectLocation={({ lat, lng, address }) => {
            setDeliveryInfo((prev) => ({
              ...prev,
              customer_lat: lat,
              customer_lng: lng,
              delivery_address: address || prev.delivery_address,
            }));
          }}
        />

        {/* --- REUSABLE STANDALONE INVOICE MODAL --- */}
        <PosInvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          invoiceData={lastReceipt}
          shopInfo={SHOP}
          autoPrint={true}
        />
      </div>
    </Layout>
  );
}
