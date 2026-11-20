// src/pages/CatalogPage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Wand2,
  Package,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { resolveProductImage } from "../services/api";
import {
  getCatalogProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getCategory,
  getbrand,
  getunit,
} from "../services/catalogService";
import Layout from "../components/Layout";
import ToastrContainer, { toastr, sweetConfirm } from "../components/Toastr";
import { useTranslation } from "../utils/translations";

const PAGE_SIZE = 10;

const makeSlug = (text = "") =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\u1780-\u17FF]+/g, "")
    .replace(/\-\-+/g, "-");

const genSku = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `SKU-${ymd}-${rnd}`;
};

const genBarcode = () => `P-${Math.floor(10000000 + Math.random() * 90000000)}`;

const qtyText = (q) => String(Number(Number(q || 0).toFixed(3)));
const stockOf = (p) => Number(p.stock_quantity || 0);
const alertOf = (p) => Number(p.alert_quantity ?? 0);
const isActive = (p) => Number(p.is_active ?? 1) === 1;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.ct { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  padding: 28px 32px 44px; font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; color: var(--ink); text-align: left; font-size: 14px; line-height: 1.6; color-scheme: light; }
.ct *, .ct *::before, .ct *::after { box-sizing: border-box; }
.ct h2, .ct h3 { margin: 0; font-family: inherit; }

/* ---------- header ---------- */
.ct-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; animation: ct-up .6s cubic-bezier(.2,.8,.2,1) both; }
.ct-brand { display: flex; align-items: center; gap: 14px; }
.ct-brand-ico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.ct .ct-title { font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.ct .ct-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; }

.ct-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; height: 44px; padding: 0 18px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: 13px; font-family: inherit; font-size: 14px; font-weight: 700; color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db;
  transition: transform .15s, box-shadow .25s, background .2s, color .2s; }
.ct-btn:hover:not(:disabled) { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.ct-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.ct-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.ct-btn.primary:hover:not(:disabled)::after { left: 130%; }
.ct-btn.primary:hover:not(:disabled) { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.ct-btn:active:not(:disabled) { transform: scale(.98); }
.ct-btn:disabled { opacity: .6; cursor: not-allowed; }
.ct button:focus-visible, .ct input:focus-visible, .ct select:focus-visible, .ct textarea:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.ct-spin { animation: ct-rot .8s linear infinite; }

/* ---------- tiles ---------- */
.ct-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
.ct-tile { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .22s, box-shadow .22s; animation: ct-up .6s cubic-bezier(.2,.8,.2,1) var(--d, 0ms) backwards; }
.ct-tile:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.ct-chip-i { width: 48px; height: 48px; border-radius: 15px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: rgba(255,255,255,.18); color: #fff; } .t-green { background: #e8f5d6; color: #4d7c0f; }
.t-amber { background: #fdf1d6; color: #9a6a0a; } .t-red { background: #fdeceb; color: #b9382d; }
.ct-tile span { display: block; font-size: 13px; font-weight: 500; color: var(--muted); }
.ct-tile b { display: block; font-size: 25px; font-weight: 800; margin-top: 1px; font-variant-numeric: tabular-nums; line-height: 1.3; }
.ct-tile.hero { border-color: transparent; color: #fff; box-shadow: 0 18px 32px -18px rgba(11,70,63,.7);
  background: radial-gradient(240px 120px at 100% 0%, rgba(255,255,255,.2), transparent 65%), linear-gradient(150deg, #19917f 0%, #0e5a51 60%, #0b463f 100%); }
.ct-tile.hero span { color: rgba(255,255,255,.8); }

/* ---------- panel ---------- */
.ct-panel { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); animation: ct-up .6s cubic-bezier(.2,.8,.2,1) 200ms backwards; }
.ct-tools { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.ct-toolsl { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ct-search { position: relative; display: flex; align-items: center; width: 320px; max-width: 100%; }
.ct-search > svg { position: absolute; left: 14px; color: #5f8a82; pointer-events: none; transition: color .2s; }
.ct-search:focus-within > svg { color: var(--teal); }
.ct-search input { width: 100%; height: 44px; padding: 0 40px 0 42px; font: inherit; font-size: 14px; color: var(--ink); background: #f6faf8; border: 1.5px solid #d3e4df; border-radius: 13px; outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s; color-scheme: light; }
.ct-search input::placeholder { color: #86a39d; }
.ct-search input:hover { border-color: #b9d3cc; }
.ct-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.ct-x { all: unset; cursor: pointer; position: absolute; right: 8px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #5f8a82; transition: background .2s, color .2s; }
.ct-x:hover { background: var(--mint); color: var(--teal-d); }

.ct-chips { display: flex; gap: 2px; padding: 4px; background: #eef5f2; border-radius: 14px; flex-wrap: wrap; }
.ct-chip { all: unset; box-sizing: border-box; cursor: pointer; height: 36px; display: inline-flex; align-items: center; gap: 8px; padding: 0 12px 0 14px; border-radius: 10px; font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--muted); white-space: nowrap; transition: background .2s, color .2s, box-shadow .2s; }
.ct-chip:hover { color: var(--ink); }
.ct-chip.on { background: #fff; color: var(--teal-d); box-shadow: 0 4px 10px -6px rgba(14,90,81,.5), 0 0 0 1px rgba(31,138,125,.1); }
.ct-chip em { font-style: normal; font-size: 12px; font-weight: 700; padding: 0 8px; border-radius: 99px; background: rgba(31,138,125,.12); color: var(--teal-d); font-variant-numeric: tabular-nums; }

/* bulk bar */
.ct-bulk { display: flex; align-items: center; gap: 10px; padding: 5px 6px 5px 14px; border-radius: 13px; background: var(--mint); font-size: 13.5px; font-weight: 700; color: var(--ink); animation: ct-pop .25s cubic-bezier(.2,1.2,.4,1) both; }
@keyframes ct-pop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
.ct-bulkdel { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border-radius: 10px; background: #fff; color: #b42318; font-size: 13px; font-weight: 700;
  box-shadow: inset 0 0 0 1.5px #fcd5cf; transition: background .2s; }
.ct-bulkdel:hover { background: #fde8e6; }
.ct-bulkclear { all: unset; cursor: pointer; height: 34px; padding: 0 12px; display: inline-flex; align-items: center; border-radius: 10px; font-size: 13px; color: var(--muted); }
.ct-bulkclear:hover { color: var(--ink); background: rgba(15,55,51,.06); }

/* ---------- table ---------- */
.ct-tablewrap { overflow-x: auto; }
.ct-table { width: 100%; min-width: 1120px; border-collapse: collapse; text-align: left; font-size: 13.5px; }
.ct-table th { padding: 11px 16px; background: #f3f9f7; color: var(--muted); font-size: 12.5px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; border-bottom: 1px solid var(--line); }
.ct-table td { padding: 9px 16px; border-bottom: 1px solid #eef4f2; vertical-align: middle; white-space: nowrap; transition: background .15s; }
.ct-table tbody tr:last-child td { border-bottom: 0; }
.ct-row { animation: ct-slide .4s cubic-bezier(.2,.8,.2,1) calc(var(--i) * 25ms) backwards; }
.ct-table tbody tr:hover td { background: #f6fbf9; }
.ct-table tr.sel td { background: #eef8f4; }
.ct-table tr.sel:hover td { background: #e6f4ef; }
.ct-check { width: 44px; text-align: center !important; padding-right: 4px !important; }
.ct-cb { width: 18px; height: 18px; cursor: pointer; accent-color: #1f8a7d; vertical-align: middle; }

.ct-prod { display: flex; align-items: center; gap: 12px; min-width: 220px; }
.ct-img { display: block; width: 44px; height: 44px; border-radius: 13px; object-fit: cover; flex-shrink: 0; background: var(--mint); border: 1px solid #d3e4df; }
.ct-img.ph { display: grid; place-items: center; border: 0; color: #fff; font-size: 17px; font-weight: 800; background: linear-gradient(145deg, #3bb5a4, #1a7d70); }
.ct-pname { max-width: 260px; overflow: hidden; text-overflow: ellipsis; font-weight: 700; font-size: 14px; }
.ct-sku { display: inline-block; padding: 1px 9px; border-radius: 8px; background: #eef4f2; color: var(--text); font-size: 12.5px; font-weight: 600; letter-spacing: .2px; }
.ct-muted { color: var(--muted); font-size: 13px; }
.ct-cat { display: inline-block; padding: 2px 11px; border-radius: 99px; background: var(--mint); color: var(--teal-d); font-size: 12.5px; font-weight: 700; }
.ct-price { font-weight: 800; color: var(--teal-d); font-variant-numeric: tabular-nums; }
.ct-cost { color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.ct-stock { display: inline-flex; align-items: center; gap: 6px; padding: 2px 11px; border-radius: 99px; font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums; background: #e8f5d6; color: #4d7c0f; }
.ct-stock::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.ct-stock.low { background: #fdf1d6; color: #9a6a0a; } .ct-stock.out { background: #fdeceb; color: #b9382d; }
.ct-status { display: inline-flex; align-items: center; gap: 6px; padding: 2px 11px; border-radius: 99px; font-size: 12.5px; font-weight: 700; }
.ct-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.ct-status.on { background: #e8f5d6; color: #4d7c0f; } .ct-status.off { background: #fdeceb; color: #b9382d; }
.ct-acts { display: flex; justify-content: flex-end; gap: 2px; }
.ct-ib { all: unset; cursor: pointer; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 11px; color: var(--muted); transition: background .18s, color .18s, transform .15s; }
.ct-ib:hover { background: var(--mint); color: var(--teal-d); transform: translateY(-1px); }
.ct-ib.del:hover { background: #fde8e6; color: #b42318; }

.ct-empty { padding: 60px 20px 64px; text-align: center; color: var(--muted); }
.ct-emptyico { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: ct-float 4s ease-in-out infinite alternate; }
@keyframes ct-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.ct-skel { display: flex; align-items: center; gap: 24px; height: 62px; margin: 0 20px; border-bottom: 1px solid #eef4f2; }
.ct-skel i { display: block; height: 14px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: ct-shine 1.4s ease infinite; }

.ct-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 20px; border-top: 1px solid var(--line); background: #fcfefd; color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.ct-foot b { color: var(--ink); font-weight: 700; }
.ct-pager { display: flex; align-items: center; gap: 12px; }
.ct-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; background: #fff; color: var(--text);
  box-shadow: inset 0 0 0 1.5px #d3e4df; transition: background .2s, color .2s, box-shadow .2s, transform .15s; }
.ct-pg:hover:not(:disabled) { background: var(--mint); color: var(--teal-d); box-shadow: inset 0 0 0 1.5px #a9cfc5; transform: translateY(-1px); }
.ct-pg:disabled { opacity: .4; cursor: not-allowed; }
.ct-pager span { min-width: 52px; text-align: center; font-size: 14px; font-weight: 700; color: var(--ink); }

/* ---------- product form modal ---------- */
.ct-ovl { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto;
  background: rgba(15,55,51,.45); backdrop-filter: blur(4px); animation: ct-fade .2s ease both; }
@keyframes ct-fade { from { opacity: 0; } to { opacity: 1; } }
.ct-modal { width: 100%; max-width: 700px; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 70px -20px rgba(15,55,51,.5); animation: ct-popm .32s cubic-bezier(.2,1.2,.4,1) both; }
@keyframes ct-popm { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
.ct-mhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 26px 6px; }
.ct .ct-mhead h3 { font-size: 19px; font-weight: 700; color: var(--ink); }
.ct-close { all: unset; cursor: pointer; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; background: #eef5f2; color: var(--muted); transition: background .2s, color .2s, transform .2s; }
.ct-close:hover { background: #fde8e6; color: #b42318; transform: rotate(90deg); }
.ct-mbody { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 14px 26px 8px; max-height: 70vh; overflow-y: auto; }
.ct-fg { min-width: 0; }
.ct-fg.full { grid-column: span 2; }
.ct-fg label { display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: var(--muted); }
.ct-input { width: 100%; height: 46px; padding: 0 14px; font: inherit; font-size: 14px; color: var(--ink); background-color: #f6faf8; border: 1.5px solid #d3e4df; border-radius: 13px; outline: none;
  transition: border-color .2s, box-shadow .2s, background-color .2s; color-scheme: light; }
textarea.ct-input { height: auto; min-height: 84px; padding: 11px 14px; resize: vertical; line-height: 1.6; }
.ct-input:hover { border-color: #b9d3cc; }
.ct-input:focus { background-color: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.ct-input::placeholder { color: #86a39d; }
select.ct-input { appearance: none; -webkit-appearance: none; padding-right: 38px; cursor: pointer; background-repeat: no-repeat; background-position: right 13px center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235f8a82' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
.ct-withbtn { display: flex; gap: 8px; }
.ct-gen { all: unset; cursor: pointer; flex-shrink: 0; height: 46px; padding: 0 13px; display: inline-flex; align-items: center; gap: 6px; border-radius: 13px; background: var(--mint); color: var(--teal-d);
  font-size: 13px; font-weight: 700; transition: background .2s, transform .15s; }
.ct-gen:hover { background: #cfeadf; transform: translateY(-1px); }
.ct-upload { display: flex; align-items: center; gap: 16px; padding: 14px 16px; border: 1.5px dashed #b9d3cc; border-radius: 16px; background: #f9fcfb; }
.ct-preview { width: 72px; height: 72px; border-radius: 16px; overflow: hidden; flex-shrink: 0; display: grid; place-items: center; background: var(--mint); color: var(--muted); border: 1px solid #d3e4df; }
.ct-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ct-upinfo { flex: 1; min-width: 0; display: grid; gap: 6px; }
.ct-upinfo small { font-size: 12.5px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; }
.ct-upinfo input[type="file"] { font: inherit; font-size: 13px; color: var(--muted); max-width: 100%; }
.ct-upinfo input[type="file"]::file-selector-button { margin-right: 12px; height: 36px; padding: 0 14px; border: 0; border-radius: 10px; background: var(--mint); color: var(--teal-d); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .2s; }
.ct-upinfo input[type="file"]::file-selector-button:hover { background: #cfeadf; }
.ct-mfoot { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 26px 22px; }

@keyframes ct-up { from { opacity: 0; transform: translateY(14px); } }
@keyframes ct-slide { from { opacity: 0; transform: translateY(6px); } }
@keyframes ct-shine { from { background-position: 100% 0; } to { background-position: -200% 0; } }
@keyframes ct-rot { to { transform: rotate(360deg); } }

@media (max-width: 1100px) { .ct-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 720px) {
  .ct { padding: 20px 16px 36px; } .ct-tiles { grid-template-columns: 1fr; } .ct-search { width: 100%; }
  .ct-mbody { grid-template-columns: 1fr; } .ct-fg.full { grid-column: span 1; }
}
@media (prefers-reduced-motion: reduce) {
  .ct *, .ct *::before, .ct *::after { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

function useCountUp(target, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return undefined;
    }
    let raf;
    let start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return Math.round(v).toLocaleString("en-US");
}

function Tile({ label, target, icon: Icon, tone, hero, delay }) {
  const shown = useCountUp(target);
  return (
    <div className={`ct-tile${hero ? " hero" : ""}`} style={{ "--d": `${delay}ms` }}>
      <div className={`ct-chip-i ${tone}`}>
        <Icon size={23} strokeWidth={1.9} />
      </div>
      <div>
        <span>{label}</span>
        <b>{shown}</b>
      </div>
    </div>
  );
}

function Thumb({ src, name }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (src && !bad) return <img className="ct-img" src={src} alt="" onError={() => setBad(true)} />;
  return <span className="ct-img ph">{(name || "?").trim().charAt(0).toUpperCase()}</span>;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  category_id: "",
  brand_id: "",
  unit_id: "",
  sku: "",
  barcode: "",
  cost_price: "",
  selling_price: "",
  alert_quantity: "10",
  description: "",
  is_active: "1",
  image: null,
};

export default function CatalogPage() {
  const { lang, t } = useTranslation();
  const tc = t.catalog;
  const L = (key, fallback) => tc?.[key] ?? fallback;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const objUrl = useRef(null);
  const selectAllRef = useRef(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchProducts();
    fetchDropdownData();
  }, []);

  useEffect(
    () => () => {
      if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    },
    [],
  );

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await getCatalogProducts();
      if (res && res.success) {
        const list = res.data.data || res.data || [];
        setProducts(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error("Error fetching catalog:", error);
      toastr.error(tc.toastErrorTitle, tc.toastFetchError);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [catRes, brandRes, unitRes] = await Promise.all([getCategory(), getbrand(), getunit()]);
      setCategories(catRes?.data?.data || catRes?.data || catRes || []);
      setBrands(brandRes?.data?.data || brandRes?.data || brandRes || []);
      setUnits(unitRes?.data?.data || unitRes?.data || unitRes || []);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
      toastr.error(tc.toastErrorTitle, tc.toastDropdownError);
    }
  };

  const getCategoryName = (p) =>
    p.category?.name || categories.find((c) => String(c.id) === String(p.category_id))?.name || "-";
  const getBrandName = (p) =>
    p.brand?.name || brands.find((b) => String(b.id) === String(p.brand_id))?.name || "-";
  const getUnitName = (p) =>
    p.unit?.name || p.unit_name || units.find((u) => String(u.id) === String(p.unit_id))?.name || "-";

  const stockState = (p) => {
    const s = stockOf(p);
    if (s <= 0) return "out";
    if (s <= alertOf(p)) return "low";
    return "ok";
  };

  const stats = useMemo(() => {
    const out = products.filter((p) => stockState(p) === "out").length;
    const low = products.filter((p) => stockState(p) === "low").length;
    const inactive = products.filter((p) => !isActive(p)).length;
    return {
      total: products.length,
      active: products.length - inactive,
      low,
      out,
      counts: { all: products.length, low, out, inactive },
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.sku || "").toLowerCase().includes(q) ||
        String(p.barcode || "").toLowerCase().includes(q);
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "low" && stockState(p) === "low") ||
        (stockFilter === "out" && stockState(p) === "out") ||
        (stockFilter === "inactive" && !isActive(p));
      return matchSearch && matchStock;
    });
  }, [products, search, stockFilter]);

  const pages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = filteredProducts.slice(start, start + PAGE_SIZE);

  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.id));
  const someSelected = filteredProducts.some((p) => selectedIds.includes(p.id));
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected && !isAllSelected;
  }, [someSelected, isAllSelected]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const visibleIds = filteredProducts.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      const visibleIds = new Set(filteredProducts.map((p) => p.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = await sweetConfirm({
      title: tc.confirmBulkTitle,
      text: tc.confirmBulkText(selectedIds.length),
      confirmText: tc.confirmBulkBtn(selectedIds.length),
      cancelText: tc.cancel,
      type: "danger",
    });

    if (confirmed) {
      const ids = [...selectedIds];
      const results = await Promise.allSettled(ids.map((id) => deleteProduct(id)));
      const okIds = ids.filter((_, i) => results[i].status === "fulfilled");
      const failed = ids.length - okIds.length;

      if (okIds.length > 0) {
        setProducts((prev) => prev.filter((p) => !okIds.includes(p.id)));
        toastr.success(tc.toastDeleteSuccessTitle, tc.toastBulkDeleteSuccess(okIds.length));
      }
      if (failed > 0) toastr.error(tc.toastErrorTitle, tc.toastBulkDeleteError);
      setSelectedIds((prev) => prev.filter((id) => !okIds.includes(id)));
    }
  };

  const handleDelete = async (p) => {
    const confirmed = await sweetConfirm({
      title: tc.confirmDeleteTitle,
      text: tc.confirmDeleteText(p.name),
      confirmText: tc.confirmDeleteBtn,
      cancelText: tc.cancel,
      type: "danger",
    });

    if (confirmed) {
      try {
        await deleteProduct(p.id);
        setProducts((prev) => prev.filter((item) => item.id !== p.id));
        setSelectedIds((prev) => prev.filter((item) => item !== p.id));
        toastr.success(tc.toastDeleteSuccessTitle, tc.toastSingleDeleteSuccess(p.name));
      } catch (error) {
        toastr.error(tc.toastErrorTitle, tc.toastSingleDeleteError);
      }
    }
  };

  const resetObjUrl = () => {
    if (objUrl.current) {
      URL.revokeObjectURL(objUrl.current);
      objUrl.current = null;
    }
  };

  const closeModal = () => {
    if (saving) return;
    resetObjUrl();
    setIsOpenModal(false);
  };

  const handleOpenAdd = () => {
    resetObjUrl();
    setIsEditing(false);
    setCurrentId(null);
    setImagePreview(null);
    setFormData({ ...EMPTY_FORM, sku: genSku(), barcode: genBarcode() });
    setIsOpenModal(true);
  };

  const handleOpenEdit = (p) => {
    resetObjUrl();
    setIsEditing(true);
    setCurrentId(p.id);
    setImagePreview(resolveProductImage(p));
    setFormData({
      name: p.name || "",
      slug: p.slug || makeSlug(p.name || ""),
      category_id: p.category_id ? String(p.category_id) : p.category?.id ? String(p.category.id) : "",
      brand_id: p.brand_id ? String(p.brand_id) : p.brand?.id ? String(p.brand.id) : "",
      unit_id: p.unit_id ? String(p.unit_id) : p.unit?.id ? String(p.unit.id) : "",
      sku: p.sku || "",
      barcode: p.barcode || "",
      cost_price: p.cost_price ?? "",
      selling_price: p.selling_price ?? "",
      alert_quantity: p.alert_quantity ?? "10",
      description: p.description || "",
      is_active: p.is_active !== undefined && p.is_active !== null ? String(Number(p.is_active)) : "1",
      image: null,
    });
    setIsOpenModal(true);
  };

  useEffect(() => {
    if (!isOpenModal) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) {
        resetObjUrl();
        setIsOpenModal(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpenModal, saving]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, name, slug: makeSlug(name) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      resetObjUrl();
      objUrl.current = URL.createObjectURL(file);
      setFormData((f) => ({ ...f, image: file }));
      setImagePreview(objUrl.current);
    }
  };

  const setField = (key) => (e) => setFormData((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    const data = new FormData();

    const payload = {
      ...formData,
      slug: formData.slug || makeSlug(formData.name) || `product-${Date.now()}`,
      sku: formData.sku || genSku(),
      barcode: formData.barcode || genBarcode(),
      cost_price: formData.cost_price !== "" ? formData.cost_price : "0",
      alert_quantity: formData.alert_quantity !== "" ? formData.alert_quantity : "10",
      is_active: formData.is_active !== "" ? formData.is_active : "1",
    };

    Object.keys(payload).forEach((key) => {
      if (key === "image") {
        if (payload.image instanceof File) {
          data.append("image", payload.image);
        }
      } else if (payload[key] !== null && payload[key] !== "") {
        data.append(key, payload[key]);
      }
    });

    if (!isEditing) {
      data.append("stock_quantity", "0");
    }

    try {
      setSaving(true);
      if (isEditing) {
        const res = await updateProduct(currentId, data);
        if (res && res.success !== false) {
          resetObjUrl();
          setIsOpenModal(false);
          await fetchProducts(false);
          toastr.success(tc.toastUpdateSuccessTitle, tc.toastUpdateSuccessMsg(formData.name));
        }
      } else {
        const res = await createProduct(data);
        if (res && res.success !== false) {
          resetObjUrl();
          setIsOpenModal(false);
          await fetchProducts(false);
          toastr.success(tc.toastCreateSuccessTitle, tc.toastCreateSuccessMsg(formData.name));
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      const errData = error.response?.data;
      if (errData?.errors) {
        const messages = Object.entries(errData.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");
        toastr.error(tc.toastValidationTitle, messages);
      } else {
        toastr.error(tc.toastSaveErrorTitle, errData?.message || tc.toastSaveErrorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const changeFilter = (k) => {
    setStockFilter(k);
    setPage(1);
  };
  const changeSearch = (v) => {
    setSearch(v);
    setPage(1);
  };

  const filters = [
    { key: "all", label: L("filterAll", "ទាំងអស់") },
    { key: "low", label: L("filterLow", "ស្តុកទាប") },
    { key: "out", label: L("filterOut", "អស់ស្តុក") },
    { key: "inactive", label: L("filterInactive", "មិនសកម្ម") },
  ];

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />

      <div className="ct">
        <div className="ct-top">
          <div className="ct-brand">
            <div className="ct-brand-ico">
              <Package size={26} strokeWidth={1.9} />
            </div>
            <div>
              <h2 className="ct-title">
                {tc.heading}
                {lang === "km" && <small>Catalog</small>}
              </h2>
              <p className="ct-sub">{tc.subHeading}</p>
            </div>
          </div>
          <button className="ct-btn primary" onClick={handleOpenAdd}>
            <Plus size={18} strokeWidth={2.4} /> {tc.addNew}
          </button>
        </div>

        <div className="ct-tiles">
          <Tile label={L("tileTotal", "ទំនិញសរុប")} target={stats.total} icon={Package} tone="t-dark" hero delay={0} />
          <Tile label={L("tileActive", "កំពុងលក់")} target={stats.active} icon={CheckCircle2} tone="t-green" delay={70} />
          <Tile label={L("tileLow", "ស្តុកទាប")} target={stats.low} icon={AlertTriangle} tone="t-amber" delay={140} />
          <Tile label={L("tileOut", "អស់ស្តុក")} target={stats.out} icon={PackageX} tone="t-red" delay={210} />
        </div>

        <section className="ct-panel">
          <div className="ct-tools">
            <div className="ct-toolsl">
              <div className="ct-search">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(e) => changeSearch(e.target.value)}
                  placeholder={tc.searchPlaceholder}
                  aria-label={tc.searchPlaceholder}
                />
                {search && (
                  <button className="ct-x" onClick={() => changeSearch("")} aria-label="Clear">
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="ct-chips" role="group" aria-label="Filter">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    aria-pressed={stockFilter === f.key}
                    className={`ct-chip${stockFilter === f.key ? " on" : ""}`}
                    onClick={() => changeFilter(f.key)}
                  >
                    {f.label}
                    <em>{stats.counts[f.key]}</em>
                  </button>
                ))}
              </div>
            </div>

            {selectedIds.length > 0 && (
              <div className="ct-bulk">
                <span>
                  {tc.selectedPrefix} {selectedIds.length} {tc.selectedSuffix}
                </span>
                <button type="button" className="ct-bulkdel" onClick={handleBulkDelete}>
                  <Trash2 size={15} /> {tc.deleteSelected}
                </button>
                <button type="button" className="ct-bulkclear" onClick={() => setSelectedIds([])}>
                  {tc.cancel}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div aria-busy="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <div className="ct-skel" key={i}>
                  <i style={{ width: 18 }} />
                  <i style={{ width: 44, height: 44, borderRadius: 13 }} />
                  <i style={{ width: "20%" }} />
                  <i style={{ width: "10%" }} />
                  <i style={{ width: "12%", marginLeft: "auto" }} />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="ct-empty">
              <div className="ct-emptyico">
                <Package size={32} strokeWidth={1.7} />
              </div>
              {tc.empty}
            </div>
          ) : (
            <div className="ct-tablewrap">
              <table className="ct-table">
                <thead>
                  <tr>
                    <th className="ct-check">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        className="ct-cb"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        title={tc.selectAll}
                        aria-label={tc.selectAll}
                      />
                    </th>
                    <th>{tc.colName}</th>
                    <th>{tc.colUnit}</th>
                    <th>{tc.colSku}</th>
                    <th>{tc.colBarcode}</th>
                    <th>{tc.colCategory}</th>
                    <th>{tc.colBrand}</th>
                    <th>{tc.colSellingPrice}</th>
                    <th>{tc.colCostPrice}</th>
                    <th>{tc.colStock}</th>
                    <th>{tc.colStatus}</th>
                    <th style={{ textAlign: "right" }}>{tc.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p, i) => {
                    const active = isActive(p);
                    const checked = selectedIds.includes(p.id);
                    const st = stockState(p);

                    return (
                      <tr key={p.id} className={`ct-row${checked ? " sel" : ""}`} style={{ "--i": i }}>
                        <td className="ct-check">
                          <input
                            type="checkbox"
                            className="ct-cb"
                            checked={checked}
                            onChange={() => handleSelectOne(p.id)}
                            aria-label={p.name}
                          />
                        </td>
                        <td>
                          <div className="ct-prod">
                            <Thumb src={resolveProductImage(p)} name={p.name} />
                            <div className="ct-pname" title={p.name}>
                              {p.name}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="ct-muted">{getUnitName(p)}</span>
                        </td>
                        <td>{p.sku ? <span className="ct-sku">{p.sku}</span> : <span className="ct-muted">-</span>}</td>
                        <td>
                          <span className="ct-muted">{p.barcode || "-"}</span>
                        </td>
                        <td>
                          <span className="ct-cat">{getCategoryName(p)}</span>
                        </td>
                        <td>
                          <span className="ct-muted">{getBrandName(p)}</span>
                        </td>
                        <td>
                          <span className="ct-price">${Number(p.selling_price || 0).toFixed(2)}</span>
                        </td>
                        <td>
                          <span className="ct-cost">${Number(p.cost_price || 0).toFixed(2)}</span>
                        </td>
                        <td>
                          <span className={`ct-stock ${st}`}>{qtyText(stockOf(p))}</span>
                        </td>
                        <td>
                          <span className={`ct-status ${active ? "on" : "off"}`}>
                            {active ? tc.statusActive : tc.statusInactive}
                          </span>
                        </td>
                        <td>
                          <div className="ct-acts">
                            <button className="ct-ib" title={tc.editTooltip} aria-label={tc.editTooltip} onClick={() => handleOpenEdit(p)}>
                              <Pencil size={17} />
                            </button>
                            <button className="ct-ib del" title={tc.deleteTooltip} aria-label={tc.deleteTooltip} onClick={() => handleDelete(p)}>
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="ct-foot">
              <span>
                {L("showing", "បង្ហាញ")}{" "}
                <b>
                  {start + 1}–{Math.min(start + PAGE_SIZE, filteredProducts.length)}
                </b>{" "}
                {L("ofTotal", "ក្នុងចំណោម")} <b>{filteredProducts.length}</b>
              </span>
              <div className="ct-pager">
                <button className="ct-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page">
                  <ChevronLeft size={18} />
                </button>
                <span aria-live="polite">
                  {current} / {pages}
                </span>
                <button className="ct-pg" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* MODAL CREATE / UPDATE */}
        {isOpenModal && (
          <div className="ct-ovl" onClick={closeModal}>
            <div className="ct-modal" role="dialog" aria-modal="true" aria-labelledby="ct-modal-title" onClick={(e) => e.stopPropagation()}>
              <div className="ct-mhead">
                <h3 id="ct-modal-title">{isEditing ? tc.modalEditTitle : tc.modalAddTitle}</h3>
                <button type="button" className="ct-close" onClick={closeModal} aria-label="Close">
                  <X size={17} />
                </button>
              </div>
              <form onSubmit={handleSave}>
                <div className="ct-mbody">
                  <div className="ct-fg">
                    <label htmlFor="ct-name">{tc.labelName}</label>
                    <input
                      id="ct-name"
                      className="ct-input"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder={tc.placeholderName}
                    />
                  </div>

                  <div className="ct-fg">
                    <label htmlFor="ct-slug">{tc.labelSlug}</label>
                    <input
                      id="ct-slug"
                      className="ct-input"
                      type="text"
                      value={formData.slug}
                      onChange={setField("slug")}
                      placeholder={tc.placeholderSlug}
                    />
                  </div>

                  <div className="ct-fg">
                    <label htmlFor="ct-sku">{tc.labelSku}</label>
                    <div className="ct-withbtn">
                      <input id="ct-sku" className="ct-input" type="text" required value={formData.sku} onChange={setField("sku")} placeholder="SKU-..." />
                      <button
                        type="button"
                        className="ct-gen"
                        onClick={() => setFormData((f) => ({ ...f, sku: genSku() }))}
                        title={tc.genSkuTitle}
                      >
                        <Wand2 size={15} /> Auto
                      </button>
                    </div>
                  </div>

                  <div className="ct-fg">
                    <label htmlFor="ct-barcode">{tc.labelBarcode}</label>
                    <div className="ct-withbtn">
                      <input id="ct-barcode" className="ct-input" type="text" required value={formData.barcode} onChange={setField("barcode")} placeholder="P-..." />
                      <button
                        type="button"
                        className="ct-gen"
                        onClick={() => setFormData((f) => ({ ...f, barcode: genBarcode() }))}
                        title={tc.genBarcodeTitle}
                      >
                        <Wand2 size={15} /> Auto
                      </button>
                    </div>
                  </div>

                  <div className="ct-fg">
                    <label htmlFor="ct-cat">{tc.labelCategory}</label>
                    <select id="ct-cat" className="ct-input" required value={formData.category_id} onChange={setField("category_id")}>
                      <option value="">{tc.selectCategory}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ct-fg">
                    <label htmlFor="ct-brand">{tc.labelBrand}</label>
                    <select id="ct-brand" className="ct-input" required value={formData.brand_id} onChange={setField("brand_id")}>
                      <option value="">{tc.selectBrand}</option>
                      {brands.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ct-fg">
                    <label htmlFor="ct-unit">{tc.labelUnit}</label>
                    <select id="ct-unit" className="ct-input" required value={formData.unit_id} onChange={setField("unit_id")}>
                      <option value="">{tc.selectUnit}</option>
                      {units.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ct-fg">
                    <label htmlFor="ct-status">{tc.labelStatus}</label>
                    <select id="ct-status" className="ct-input" value={formData.is_active} onChange={setField("is_active")}>
                      <option value="1">{tc.optionActive}</option>
                      <option value="0">{tc.optionInactive}</option>
                    </select>
                  </div>

                  <div className="ct-fg">
                    <label htmlFor="ct-sell">{tc.labelSellingPrice}</label>
                    <input
                      id="ct-sell"
                      className="ct-input"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.selling_price}
                      onChange={setField("selling_price")}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="ct-fg">
                    <label htmlFor="ct-cost">{tc.labelCostPrice}</label>
                    <input
                      id="ct-cost"
                      className="ct-input"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.cost_price}
                      onChange={setField("cost_price")}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="ct-fg full">
                    <label htmlFor="ct-alert">{tc.labelAlertQty}</label>
                    <input
                      id="ct-alert"
                      className="ct-input"
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={formData.alert_quantity}
                      onChange={setField("alert_quantity")}
                      placeholder="10"
                    />
                  </div>

                  <div className="ct-fg full">
                    <label htmlFor="ct-desc">{tc.labelDescription}</label>
                    <textarea
                      id="ct-desc"
                      className="ct-input"
                      value={formData.description}
                      onChange={setField("description")}
                      placeholder={tc.placeholderDescription}
                    />
                  </div>

                  <div className="ct-fg full">
                    <label>{tc.labelImage}</label>
                    <div className="ct-upload">
                      <div className="ct-preview">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon size={26} />
                        )}
                      </div>
                      <div className="ct-upinfo">
                        <input type="file" accept="image/*" onChange={handleImageChange} aria-label={tc.labelImage} />
                        <small>
                          {formData.image
                            ? `${tc.newImageSelected} ${formData.image.name}`
                            : imagePreview
                              ? tc.currentImageHint
                              : tc.noImageHint}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ct-mfoot">
                  <button type="button" className="ct-btn" onClick={closeModal} disabled={saving}>
                    {tc.cancel}
                  </button>
                  <button type="submit" className="ct-btn primary" disabled={saving}>
                    {saving ? <Loader2 size={17} className="ct-spin" /> : null}
                    {tc.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}