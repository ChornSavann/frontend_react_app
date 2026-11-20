// src/pages/AuthLogsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  LogIn,
  LogOut,
  Users,
  Search,
  RefreshCw,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone,
  Clock,
  Calendar,
  UserCheck,
  KeyRound,
  Activity,
} from "lucide-react";
import Layout from "../components/Layout";
import { getAuthLogs } from "../services/authLogService";
import { resolveProductImage } from "../services/api";
import ToastrContainer, { toastr } from "../components/Toastr";
import { useTranslation } from "../utils/translations";

const PAGE_SIZE = 10;

const css = `
.al, .al-portal {
  --bg-page: transparent;
  --surface: #ffffff;
  --surface-2: #f7fbfa;
  --surface-3: #f1f6f5;
  --ink: #0f1f1d;
  --muted: #6a8280;
  --line: #e6eeec;
  --line-hover: #d3e2df;
  --teal: #0f766e;
  --teal-d: #0b5e58;
  --teal-soft: #e0f4f1;
}

/* --- GLOBAL DARK MODE SUPPORT --- */
html.dark .al, html.dark .al-portal,
body.dark .al, body.dark .al-portal,
[data-theme="dark"] .al, [data-theme="dark"] .al-portal,
.dark .al, .dark .al-portal {
  --bg-page: #0b1514;
  --surface: #11211f;
  --surface-2: #162926;
  --surface-3: #1c3330;
  --ink: #ecfdf5;
  --muted: #8ca8a3;
  --line: #1f3834;
  --line-hover: #2a4944;
  --teal: #2dd4bf;
  --teal-d: #34d399;
  --teal-soft: rgba(45, 212, 191, 0.16);
  color-scheme: dark;
}

.al {
  padding: 20px 24px;
  font-family: 'Plus Jakarta Sans', 'Noto Sans Khmer', -apple-system, sans-serif;
  color: var(--ink);
  background: var(--bg-page);
  text-align: left;
  font-size: 13px;
  transition: background .25s ease, color .25s ease;
}
.al *, .al *::before, .al *::after,
.al-portal *, .al-portal *::before, .al-portal *::after {
  box-sizing: border-box;
}
.al h2, .al h3, .al h4, .al p { margin: 0; font-family: inherit; }

/* --- HEADER --- */
.al-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 16px; }
.al-top h2 { font-size: 20px; font-weight: 800; letter-spacing: -.4px; color: var(--ink); display: flex; align-items: center; gap: 8px; }
.al-top h2 small { font-size: 12.5px; font-weight: 600; color: var(--muted); margin-left: 4px; }
.al-top p { margin: 2px 0 0; color: var(--muted); font-size: 12.5px; }
.al-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.al-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 38px; padding: 0 14px; display: inline-flex; align-items: center; gap: 7px; border-radius: 10px;
  font-size: 12.5px; font-weight: 700; color: var(--ink); background: var(--surface); border: 1px solid var(--line); transition: transform .15s, box-shadow .15s, border-color .15s, background .15s; }
.al-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(12,37,38,.07); border-color: var(--line-hover); background: var(--surface-2); }
.al-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 5px 14px rgba(15,118,110,.24); }
.al-btn.primary:hover:not(:disabled) { box-shadow: 0 8px 18px rgba(15,118,110,.32); background: linear-gradient(135deg,#11867d,#0d6b64); }
.al-btn:disabled { opacity: .6; cursor: not-allowed; }
.al-spin { animation: al-rot .8s linear infinite; }

.al-err { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 10px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 12.5px; }
html.dark .al-err, body.dark .al-err, [data-theme="dark"] .al-err, .dark .al-err { background: rgba(239,68,68,.15); color: #fca5a5; border-color: rgba(239,68,68,.35); }
.al-err button { all: unset; cursor: pointer; font-weight: 700; text-decoration: underline; }

/* --- COMPACT STATS TILES --- */
.al-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.al-tile { display: flex; align-items: center; gap: 12px; padding: 12px 15px; background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
  box-shadow: 0 2px 8px -2px rgba(12,37,38,.04); transition: transform .2s ease, box-shadow .2s ease; animation: al-up .45s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; min-width: 0; }
.al-tile:hover { transform: translateY(-2px); box-shadow: 0 10px 22px -6px rgba(12,37,38,.09); border-color: var(--line-hover); }
.al-chip-i { width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; flex-shrink: 0; }
.t-dark { background: #c8f169; color: #0c2526; }
.t-green { background: #e7f8ee; color: #15803d; }
.t-amber { background: #fff1d6; color: #d97706; }
.t-blue { background: #e3eeff; color: #2563eb; }
html.dark .t-green, body.dark .t-green, [data-theme="dark"] .t-green, .dark .t-green { background: rgba(34,197,94,.18); color: #4ade80; }
html.dark .t-amber, body.dark .t-amber, [data-theme="dark"] .t-amber, .dark .t-amber { background: rgba(245,158,11,.18); color: #fbbf24; }
html.dark .t-blue, body.dark .t-blue, [data-theme="dark"] .t-blue, .dark .t-blue { background: rgba(59,130,246,.18); color: #60a5fa; }

.al-tile-body { min-width: 0; flex: 1; }
.al-tile span { display: block; font-size: 11.5px; font-weight: 600; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.al-tile-valrow { display: flex; align-items: baseline; gap: 6px; margin-top: 2px; }
.al-tile b { font-size: 20px; font-weight: 800; letter-spacing: -.4px; font-variant-numeric: tabular-nums; line-height: 1.15; color: var(--ink); }
.al-tile small { font-size: 10.5px; color: var(--muted); font-weight: 600; }
.al-tile.hero { border-color: transparent; color: #f4faf8; background: radial-gradient(180px 90px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.al-tile.hero span, .al-tile.hero small { color: #9db8b4; }
.al-tile.hero b { color: #f4faf8; }

/* --- PANEL & TOOLBAR --- */
.al-panel { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(12,37,38,.03); animation: al-up .5s cubic-bezier(.2,.7,.2,1) 200ms backwards; }
.al-tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 13px 18px; border-bottom: 1px solid var(--line); }
.al-left, .al-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.al-search { position: relative; display: flex; align-items: center; width: 310px; max-width: 100%; }
.al-search > svg { position: absolute; left: 12px; color: var(--muted); pointer-events: none; }
.al-search input { all: unset; box-sizing: border-box; width: 100%; height: 36px; padding: 0 34px 0 36px; font-size: 12.5px; color: var(--ink); background: var(--surface-3); border: 1.5px solid transparent; border-radius: 10px; transition: background .15s, border-color .15s, box-shadow .15s; }
.al-search input::placeholder { color: var(--muted); }
.al-search input:focus { background: var(--surface); border-color: var(--teal); box-shadow: 0 0 0 3px rgba(15,118,110,.14); }
.al-x { all: unset; cursor: pointer; position: absolute; right: 6px; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 7px; color: var(--muted); }
.al-x:hover { background: var(--line); color: var(--ink); }

.al-seg { display: flex; gap: 2px; padding: 3px; background: var(--surface-3); border-radius: 10px; flex-wrap: wrap; }
.al-sb { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--muted); transition: background .15s, color .15s; }
.al-sb:hover { color: var(--ink); }
.al-sb.on { background: var(--surface); color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }

.al-select { height: 36px; max-width: 185px; padding: 0 28px 0 11px; font: inherit; font-size: 12px; font-weight: 600; color: var(--ink); background: var(--surface-3) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 9px center; border: 1.5px solid transparent; border-radius: 10px; appearance: none; cursor: pointer; }
.al-select:hover { border-color: var(--line-hover); }

/* --- TABLE --- */
.al-tablewrap { overflow-x: auto; }
.al-gridwrap { min-width: 980px; }
.al-head, .al-row {
  display: grid;
  grid-template-columns: 90px minmax(210px, 1.45fr) minmax(185px, 1.25fr) 150px 130px 170px 76px;
  gap: 12px;
  align-items: center;
  padding: 0 20px;
}
.al-head { height: 40px; font-size: 11px; font-weight: 700; color: var(--muted); background: var(--surface-2); border-bottom: 1px solid var(--line); text-transform: uppercase; letter-spacing: .2px; }
.al-row { min-height: 66px; padding-top: 7px; padding-bottom: 7px; border-bottom: 1px solid var(--line); transition: background .12s; animation: al-slide .35s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 24ms) backwards; }
.al-row:last-child { border-bottom: 0; }
.al-row:hover { background: var(--surface-2); }

.al-log-id {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 8px;
  background: var(--surface-3);
  border: 1px solid var(--line);
  font-weight: 800;
  font-size: 12px;
  color: var(--teal);
  transition: all .15s;
}
.al-log-id:hover { background: var(--teal); color: #fff; border-color: var(--teal); }

/* User Profile Cell */
.al-user { display: flex; align-items: center; gap: 11px; min-width: 0; cursor: pointer; }
.al-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(145deg, #25998b, #0f766e);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 15px;
  border: 1.5px solid var(--line-hover);
}
.al-avatar img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #fff;
}
.al-user-info { min-width: 0; flex: 1; }
.al-user-info b { display: block; font-size: 13px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.al-user-info small { display: block; font-size: 11px; color: var(--muted); margin-top: 1px; font-weight: 600; }

.al-contact { display: grid; gap: 2px; min-width: 0; font-size: 12px; }
.al-contact div { display: flex; align-items: center; gap: 6px; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.al-contact div.sub { color: var(--muted); font-size: 11.5px; }
.al-contact svg { flex-shrink: 0; color: var(--muted); }

.al-role-cell { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.al-role-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  background: var(--surface-3);
  color: var(--ink);
  border: 1px solid var(--line);
  width: fit-content;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.al-role-pill.r1 { background: rgba(139, 92, 246, 0.14); color: #7c3aed; border-color: rgba(139, 92, 246, 0.3); }
.al-role-pill.r2 { background: rgba(59, 130, 246, 0.14); color: #2563eb; border-color: rgba(59, 130, 246, 0.3); }
.al-role-pill.r3 { background: var(--teal-soft); color: var(--teal-d); border-color: rgba(15, 118, 110, 0.28); }
html.dark .al-role-pill.r1, body.dark .al-role-pill.r1, .dark .al-role-pill.r1 { color: #c4b5fd; }
html.dark .al-role-pill.r2, body.dark .al-role-pill.r2, .dark .al-role-pill.r2 { color: #60a5fa; }
.al-role-desc { font-size: 10.5px; color: var(--muted); padding-left: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Action Badges (LOGIN / LOGOUT) */
.al-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 800;
  width: fit-content;
  letter-spacing: .3px;
  text-transform: uppercase;
}
.al-badge.login { background: #e7f8ee; color: #15803d; border: 1px solid #bbf7d0; }
.al-badge.logout { background: #fff4e0; color: #b45309; border: 1px solid #fde68a; }
.al-badge.other { background: #e3eeff; color: #2563eb; border: 1px solid #bfdbfe; }
html.dark .al-badge.login, body.dark .al-badge.login, .dark .al-badge.login { background: rgba(34,197,94,.2); color: #4ade80; border-color: rgba(34,197,94,.35); }
html.dark .al-badge.logout, body.dark .al-badge.logout, .dark .al-badge.logout { background: rgba(245,158,11,.2); color: #fbbf24; border-color: rgba(245,158,11,.35); }
html.dark .al-badge.other, body.dark .al-badge.other, .dark .al-badge.other { background: rgba(59,130,246,.2); color: #60a5fa; border-color: rgba(59,130,246,.35); }

.al-time { font-size: 12px; color: var(--ink); font-variant-numeric: tabular-nums; line-height: 1.4; }
.al-time small { display: block; font-size: 11px; color: var(--muted); }

.al-acts { display: flex; justify-content: flex-end; align-items: center; }
.al-ib {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  border: 1.5px solid var(--line-hover);
  background: var(--surface);
  color: var(--ink);
  transition: all .15s;
}
.al-ib:hover { transform: translateY(-1px); background: var(--teal-soft); color: var(--teal); border-color: var(--teal); }

.al-empty { padding: 52px 20px; text-align: center; color: var(--muted); }
.al-empty b { display: block; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
.al-skel { height: 64px; margin: 0 20px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 14px; }
.al-skel i { display: block; height: 12px; border-radius: 6px; background: linear-gradient(90deg,var(--surface-3),var(--surface-2),var(--surface-3)); background-size: 200% 100%; animation: al-shine 1.3s linear infinite; }

.al-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 11px 20px; border-top: 1px solid var(--line); background: var(--surface-2); color: var(--muted); font-size: 12px; }
.al-pager { display: flex; align-items: center; gap: 6px; }
.al-pg { all: unset; box-sizing: border-box; cursor: pointer; width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); transition: background .15s; }
.al-pg:hover:not(:disabled) { background: var(--surface-3); }
.al-pg:disabled { opacity: .4; cursor: not-allowed; }
.al-pager span { min-width: 58px; text-align: center; font-weight: 600; color: var(--ink); }

/* --- DETAIL MODAL --- */
.al-ovl { position: fixed; inset: 0; z-index: 2200; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(8, 26, 24, 0.6); backdrop-filter: blur(5px); animation: al-fade .18s ease; }
.al-modal { width: 100%; max-width: 560px; background: var(--surface); color: var(--ink); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 28px 65px rgba(0,0,0,.45); animation: al-pop .22s ease; font-family: 'Plus Jakarta Sans', 'Noto Sans Khmer', sans-serif; }
.al-mhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 20px; background: linear-gradient(135deg, #0f766e, #0b5e58); color: #fff; }
.al-mhead h3 { font-size: 15.5px; font-weight: 800; display: flex; align-items: center; gap: 8px; color: #fff; margin: 0; }
.al-mclose { all: unset; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.18); color: #fff; display: grid; place-items: center; transition: all .2s; }
.al-mclose:hover { background: #ef4444; transform: rotate(90deg); }

.al-mbody { padding: 18px 20px; display: grid; gap: 13px; max-height: 78vh; overflow-y: auto; }
.al-profile-banner { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 14px; background: var(--surface-2); border: 1px solid var(--line); }
.al-avatar.lg { width: 64px; height: 64px; border-radius: 16px; font-size: 24px; }
.al-profile-meta { min-width: 0; flex: 1; }
.al-profile-meta h4 { font-size: 16px; font-weight: 800; color: var(--ink); margin: 0 0 4px; }
.al-profile-meta p { font-size: 12.5px; color: var(--muted); margin: 0; }

.al-card { padding: 13px 15px; border-radius: 14px; background: var(--surface-2); border: 1px solid var(--line); display: grid; gap: 6px; }
.al-card-title { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--teal); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
.al-kv { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 4px 0; border-bottom: 1px dashed var(--line); font-size: 12.5px; }
.al-kv:last-child { border-bottom: 0; }
.al-kv span { color: var(--muted); }
.al-kv b { color: var(--ink); font-weight: 700; text-align: right; word-break: break-all; }

.al-mfoot { padding: 12px 20px; background: var(--surface-2); border-top: 1px solid var(--line); display: flex; justify-content: flex-end; }

@keyframes al-up { from { opacity: 0; transform: translateY(12px); } }
@keyframes al-slide { from { opacity: 0; transform: translateX(-8px); } }
@keyframes al-shine { to { background-position: -200% 0; } }
@keyframes al-rot { to { transform: rotate(360deg); } }
@keyframes al-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes al-pop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }

@media (max-width: 1100px) { .al-tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 720px) { .al { padding: 14px; } .al-tiles { grid-template-columns: 1fr; } .al-search, .al-left { width: 100%; } }
`;

const fmtDateParts = (val) => {
  if (!val) return { date: "-", time: "" };
  const normalized = String(val).replace(" ", "T");
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) {
    const [dt, tm] = String(val).split(" ");
    return { date: dt || val, time: tm || "" };
  }
  return {
    date: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
};

const resolveUserAvatar = (user) => {
  if (!user) return "";
  if (user.image_url) return user.image_url;
  if (user.image) return resolveProductImage(user);
  return "";
};

// ✅ ទាញយកឈ្មោះ និងការពិពណ៌នា Role ពី user.role ឬ l.role ដោយស្វ័យប្រវត្តិ
const getRoleInfo = (user, fallbackRole, isKm) => {
  const roleObj = user?.role || fallbackRole || null;
  const rId = Number(user?.role_id ?? roleObj?.id ?? 0);
  const roleName = roleObj?.name || roleObj?.role_name || roleObj?.title || "";
  const roleDesc = roleObj?.description || "";

  let cls = "r3";
  if (rId === 1 || /super|admin/i.test(roleName)) cls = "r1";
  else if (rId === 2) cls = "r2";

  if (roleName) {
    return {
      id: rId || null,
      text: roleName,
      description: roleDesc,
      cls,
      roleObj,
    };
  }

  if (rId === 1) {
    return { id: 1, text: isKm ? "អ្នកគ្រប់គ្រង (Admin)" : "Admin", description: "", cls: "r1", roleObj };
  }
  if (rId === 2) {
    return { id: 2, text: isKm ? "អ្នកប្រើប្រាស់ (User)" : "User", description: "", cls: "r2", roleObj };
  }
  if (rId === 3) {
    return { id: 3, text: isKm ? "បុគ្គលិក (Role #3)" : "Role #3", description: "", cls: "r3", roleObj };
  }
  return { id: rId || null, text: rId ? `Role #${rId}` : "N/A", description: "", cls: "", roleObj };
};

function UserAvatar({ user, sizeClass = "" }) {
  const [imgErr, setImgErr] = useState(false);
  const src = resolveUserAvatar(user);
  const initial = (user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <div className={`al-avatar ${sizeClass}`}>
      <span>{initial}</span>
      {src && !imgErr && (
        <img
          src={src}
          alt={user?.name || "User"}
          onError={() => setImgErr(true)}
        />
      )}
    </div>
  );
}

export default function AuthLogsPage() {
  const { lang, t } = useTranslation();
  const isKm = lang === "km" || lang === "kh";
  const tal = t?.authLogs || {};
  const tr = (key, kmText, enText) => tal[key] || (isKm ? kmText : enText);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [viewLog, setViewLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getAuthLogs();
      const list = Array.isArray(res)
        ? res
        : res?.data?.data || res?.data || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching auth logs:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        tr("fetchError", "មិនអាចទាញយកប្រវត្តិចូលប្រព័ន្ធបានទេ", "Failed to load auth logs");
      setErrorMsg(msg);
      toastr.error(tr("errorTitle", "បរាជ័យ", "Error"), msg);
    } finally {
      setLoading(false);
    }
  };

  // បញ្ជីតួនាទី (Roles) សម្រាប់ប្រអប់ Filter Dropdown
  const roleOptions = useMemo(() => {
    const map = new Map();
    logs.forEach((l) => {
      const info = getRoleInfo(l.user, l.role, isKm);
      if (info.text && info.text !== "N/A") {
        map.set(info.text, info.text);
      }
    });
    return Array.from(map.values());
  }, [logs, isKm]);

  const stats = useMemo(() => {
    let loginCount = 0;
    let logoutCount = 0;
    const uniqueUsers = new Set();

    logs.forEach((l) => {
      const act = String(l.action || "").toUpperCase();
      if (act === "LOGIN") loginCount += 1;
      else if (act === "LOGOUT") logoutCount += 1;
      if (l.user_id || l.user?.id) uniqueUsers.add(String(l.user_id ?? l.user?.id));
    });

    return {
      total: logs.length,
      loginCount,
      logoutCount,
      uniqueUsers: uniqueUsers.size,
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = logs.filter((l) => {
      const act = String(l.action || "").toUpperCase();
      const matchAction = actionFilter === "ALL" || act === actionFilter;

      const u = l.user || {};
      const roleInfo = getRoleInfo(u, l.role, isKm);
      const matchRole = roleFilter === "ALL" || roleInfo.text === roleFilter;

      const matchSearch =
        !q ||
        [
          l.id,
          l.user_id,
          l.action,
          l.timestamp,
          u.name,
          u.email,
          u.phone,
          u.role_id,
          roleInfo.text,
          roleInfo.description,
        ].some((val) => String(val ?? "").toLowerCase().includes(q));

      return matchAction && matchRole && matchSearch;
    });

    return [...list].sort((a, b) => {
      const tA = new Date(String(a.timestamp || a.created_at || "").replace(" ", "T")).getTime() || Number(a.id) || 0;
      const tB = new Date(String(b.timestamp || b.created_at || "").replace(" ", "T")).getTime() || Number(b.id) || 0;
      return sort === "oldest" ? tA - tB : tB - tA;
    });
  }, [logs, query, actionFilter, roleFilter, sort, isKm]);

  const pages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = filteredLogs.slice(start, start + PAGE_SIZE);
  const reset = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  const exportCsv = () => {
    const lines = [
      [
        "Log ID",
        "User ID",
        "User Name",
        "Email",
        "Phone",
        "Role ID",
        "Role Name",
        "Role Description",
        "Action",
        "Timestamp",
      ],
      ...filteredLogs.map((l) => {
        const rInfo = getRoleInfo(l.user, l.role, isKm);
        return [
          l.id,
          l.user_id ?? l.user?.id ?? "",
          l.user?.name || "-",
          l.user?.email || "-",
          l.user?.phone || "-",
          l.user?.role_id ?? rInfo.id ?? "",
          rInfo.text,
          rInfo.description || "-",
          l.action || "-",
          l.timestamp || "",
        ];
      }),
    ];
    const csv =
      "\uFEFF" +
      lines
        .map((r) =>
          r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "auth-logs-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const modalRoleInfo = viewLog
    ? getRoleInfo(viewLog.user, viewLog.role, isKm)
    : null;

  const detailModal = viewLog && (
    <div className="al-portal">
      <div className="al-ovl" onClick={() => setViewLog(null)}>
        <div
          className="al-modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="al-mhead">
            <h3>
              <ShieldCheck size={19} />
              <span>
                {tr("modalTitle", "ព័ត៌មានលម្អិតនៃសកម្មភាព", "Auth Log Details")} · #{viewLog.id}
              </span>
            </h3>
            <button
              type="button"
              className="al-mclose"
              onClick={() => setViewLog(null)}
            >
              <X size={17} />
            </button>
          </div>

          <div className="al-mbody">
            {/* User Profile Banner */}
            <div className="al-profile-banner">
              <UserAvatar user={viewLog.user} sizeClass="lg" />
              <div className="al-profile-meta">
                <h4>{viewLog.user?.name || `User #${viewLog.user_id}`}</h4>
                <p>{viewLog.user?.email || "-"}</p>
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span
                    className={`al-badge ${
                      String(viewLog.action || "").toLowerCase() === "login"
                        ? "login"
                        : String(viewLog.action || "").toLowerCase() === "logout"
                        ? "logout"
                        : "other"
                    }`}
                  >
                    {String(viewLog.action || "").toUpperCase() === "LOGIN" ? (
                      <LogIn size={12} />
                    ) : (
                      <LogOut size={12} />
                    )}
                    {viewLog.action}
                  </span>
                  <span className={`al-role-pill ${modalRoleInfo.cls}`}>
                    <KeyRound size={11} />
                    {modalRoleInfo.text}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Auth Log Info */}
            <div className="al-card">
              <div className="al-card-title">
                <Activity size={14} />{" "}
                {tr("logInfoSection", "ព័ត៌មានសកម្មភាព (Auth Log)", "Activity Record")}
              </div>
              <div className="al-kv">
                <span>Log ID (`id`)</span>
                <b>#{viewLog.id}</b>
              </div>
              <div className="al-kv">
                <span>User ID (`user_id`)</span>
                <b>#{viewLog.user_id ?? viewLog.user?.id ?? "-"}</b>
              </div>
              <div className="al-kv">
                <span>{tr("colAction", "សកម្មភាព (`action`)", "Action")}</span>
                <b>{viewLog.action}</b>
              </div>
              <div className="al-kv">
                <span>{tr("colTimestamp", "ពេលវេលា (`timestamp`)", "Timestamp")}</span>
                <b>{viewLog.timestamp}</b>
              </div>
            </div>

            {/* 2. Role Info (`user.role`) */}
            {modalRoleInfo.roleObj && (
              <div className="al-card">
                <div className="al-card-title">
                  <KeyRound size={14} />{" "}
                  {tr("roleInfoSection", "ព័ត៌មានតួនាទី (`user.role`)", "Role Details")}
                </div>
                <div className="al-kv">
                  <span>Role ID (`role.id`)</span>
                  <b>#{modalRoleInfo.roleObj.id ?? viewLog.user?.role_id ?? "-"}</b>
                </div>
                <div className="al-kv">
                  <span>{isKm ? "ឈ្មោះតួនាទី (`role.name`)" : "Role Name (`role.name`)"}</span>
                  <b>{modalRoleInfo.roleObj.name || "-"}</b>
                </div>
                <div className="al-kv">
                  <span>{isKm ? "ការពិពណ៌នា (`role.description`)" : "Description (`role.description`)"}</span>
                  <b>{modalRoleInfo.roleObj.description || "-"}</b>
                </div>
                {modalRoleInfo.roleObj.created_at && (
                  <div className="al-kv">
                    <span>Role Created (`role.created_at`)</span>
                    <b>
                      {fmtDateParts(modalRoleInfo.roleObj.created_at).date}{" "}
                      {fmtDateParts(modalRoleInfo.roleObj.created_at).time}
                    </b>
                  </div>
                )}
                {modalRoleInfo.roleObj.updated_at && (
                  <div className="al-kv">
                    <span>Role Updated (`role.updated_at`)</span>
                    <b>
                      {fmtDateParts(modalRoleInfo.roleObj.updated_at).date}{" "}
                      {fmtDateParts(modalRoleInfo.roleObj.updated_at).time}
                    </b>
                  </div>
                )}
              </div>
            )}

            {/* 3. User Account Details */}
            {viewLog.user && (
              <div className="al-card">
                <div className="al-card-title">
                  <UserCheck size={14} />{" "}
                  {tr("userInfoSection", "ព័ត៌មានគណនីអ្នកប្រើប្រាស់ (`user`)", "User Account Info")}
                </div>
                <div className="al-kv">
                  <span>{tr("colName", "ឈ្មោះ (`name`)", "Name")}</span>
                  <b>{viewLog.user.name || "-"}</b>
                </div>
                <div className="al-kv">
                  <span>{tr("colEmail", "អ៊ីមែល (`email`)", "Email")}</span>
                  <b>{viewLog.user.email || "-"}</b>
                </div>
                <div className="al-kv">
                  <span>{tr("colPhone", "លេខទូរស័ព្ទ (`phone`)", "Phone")}</span>
                  <b>{viewLog.user.phone || "-"}</b>
                </div>
                <div className="al-kv">
                  <span>Role ID (`role_id`)</span>
                  <b>
                    #{viewLog.user.role_id ?? "-"} ({modalRoleInfo.text})
                  </b>
                </div>
                <div className="al-kv">
                  <span>Created At (`created_at`)</span>
                  <b>
                    {fmtDateParts(viewLog.user.created_at).date}{" "}
                    {fmtDateParts(viewLog.user.created_at).time}
                  </b>
                </div>
                <div className="al-kv">
                  <span>Updated At (`updated_at`)</span>
                  <b>
                    {fmtDateParts(viewLog.user.updated_at).date}{" "}
                    {fmtDateParts(viewLog.user.updated_at).time}
                  </b>
                </div>
              </div>
            )}
          </div>

          <div className="al-mfoot">
            <button
              type="button"
              className="al-btn primary"
              onClick={() => setViewLog(null)}
            >
              {tr("closeBtn", "បិទផ្ទាំង", "Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <style>{css}</style>
      <ToastrContainer />
      <div className="al">
        <div className="al-top">
          <div>
            <h2>
              <ShieldCheck size={22} style={{ color: "var(--teal)" }} />
              {tr("heading", "ប្រវត្តិចូល/ចេញប្រព័ន្ធ", "Authentication Logs")}
              {isKm && <small>Auth Logs</small>}
            </h2>
            <p>
              {tr(
                "subHeading",
                "តាមដានរាល់សកម្មភាពចូល (LOGIN) និងចាកចេញ (LOGOUT) របស់អ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ",
                "Monitor user login and logout activities across the system"
              )}
            </p>
          </div>

          <div className="al-actions">
            <button
              className="al-btn"
              onClick={exportCsv}
              disabled={filteredLogs.length === 0}
            >
              <Download size={15} /> {tr("exportCsv", "ទាញយក CSV", "Export CSV")}
            </button>
            <button
              className="al-btn primary"
              onClick={fetchLogs}
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? "al-spin" : ""} />{" "}
              {tr("refresh", "ផ្ទុកឡើងវិញ", "Refresh")}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="al-err" role="alert">
            <span>{errorMsg}</span>
            <button onClick={fetchLogs}>
              {tr("tryAgain", "ព្យាយាមម្ដងទៀត", "Try Again")}
            </button>
          </div>
        )}

        {/* --- STATS TILES --- */}
        <div className="al-tiles">
          <div className="al-tile hero" style={{ "--d": "0ms" }}>
            <div className="al-chip-i t-dark">
              <Activity size={19} strokeWidth={2.2} />
            </div>
            <div className="al-tile-body">
              <span>{tr("statTotal", "សកម្មភាពសរុប", "Total Logs")}</span>
              <div className="al-tile-valrow">
                <b>{stats.total}</b>
                <small>{isKm ? "កំណត់ត្រា" : "Records"}</small>
              </div>
            </div>
          </div>

          <div className="al-tile" style={{ "--d": "60ms" }}>
            <div className="al-chip-i t-green">
              <LogIn size={19} strokeWidth={2.2} />
            </div>
            <div className="al-tile-body">
              <span>{tr("statLogin", "ចំនួនចូលប្រព័ន្ធ (LOGIN)", "Total Logins")}</span>
              <div className="al-tile-valrow">
                <b>{stats.loginCount}</b>
                <small>LOGIN</small>
              </div>
            </div>
          </div>

          <div className="al-tile" style={{ "--d": "110ms" }}>
            <div className="al-chip-i t-amber">
              <LogOut size={19} strokeWidth={2.2} />
            </div>
            <div className="al-tile-body">
              <span>{tr("statLogout", "ចំនួនចាកចេញ (LOGOUT)", "Total Logouts")}</span>
              <div className="al-tile-valrow">
                <b>{stats.logoutCount}</b>
                <small>LOGOUT</small>
              </div>
            </div>
          </div>

          <div className="al-tile" style={{ "--d": "160ms" }}>
            <div className="al-chip-i t-blue">
              <Users size={19} strokeWidth={2.2} />
            </div>
            <div className="al-tile-body">
              <span>{tr("statUsers", "អ្នកប្រើប្រាស់សកម្ម", "Active Users")}</span>
              <div className="al-tile-valrow">
                <b>{stats.uniqueUsers}</b>
                <small>{isKm ? "គណនី" : "Users"}</small>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABLE PANEL --- */}
        <section className="al-panel">
          <div className="al-tools">
            <div className="al-left">
              <div className="al-search">
                <Search size={15} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => reset(setQuery)(e.target.value)}
                  placeholder={tr(
                    "searchPlaceholder",
                    "ស្វែងរកឈ្មោះ អ៊ីមែល ទូរស័ព្ទ តួនាទី ឬសកម្មភាព...",
                    "Search name, email, phone, role, or action..."
                  )}
                />
                {query && (
                  <button
                    className="al-x"
                    onClick={() => reset(setQuery)("")}
                    aria-label="Clear"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="al-seg" role="group" aria-label="Filter by action">
                {[
                  { key: "ALL", label: isKm ? "ទាំងអស់" : "All", count: stats.total },
                  { key: "LOGIN", label: "LOGIN", count: stats.loginCount },
                  { key: "LOGOUT", label: "LOGOUT", count: stats.logoutCount },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`al-sb${actionFilter === f.key ? " on" : ""}`}
                    onClick={() => reset(setActionFilter)(f.key)}
                  >
                    {f.label} <span style={{ opacity: 0.6 }}>{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="al-right">
              {roleOptions.length > 0 && (
                <select
                  className="al-select"
                  value={roleFilter}
                  onChange={(e) => reset(setRoleFilter)(e.target.value)}
                  aria-label="Filter by role"
                >
                  <option value="ALL">
                    {isKm ? "គ្រប់តួនាទី (All Roles)" : "All Roles"}
                  </option>
                  {roleOptions.map((rName) => (
                    <option key={rName} value={rName}>
                      {rName}
                    </option>
                  ))}
                </select>
              )}

              <select
                className="al-select"
                value={sort}
                onChange={(e) => reset(setSort)(e.target.value)}
              >
                <option value="newest">
                  {isKm ? "ថ្មីបំផុតមុន (Newest)" : "Newest first"}
                </option>
                <option value="oldest">
                  {isKm ? "ចាស់បំផុតមុន (Oldest)" : "Oldest first"}
                </option>
              </select>
            </div>
          </div>

          <div className="al-tablewrap">
            <div className="al-gridwrap">
              <div className="al-head">
                <span>Log ID</span>
                <span>{isKm ? "អ្នកប្រើប្រាស់ (User)" : "User"}</span>
                <span>{isKm ? "អ៊ីមែល & ទូរស័ព្ទ" : "Email & Phone"}</span>
                <span>{isKm ? "តួនាទី (Role)" : "Role"}</span>
                <span>{isKm ? "សកម្មភាព (Action)" : "Action"}</span>
                <span>{isKm ? "ពេលវេលា (Timestamp)" : "Timestamp"}</span>
                <span style={{ textAlign: "right" }}>
                  {isKm ? "មើល" : "View"}
                </span>
              </div>

              {loading ? (
                [0, 1, 2, 3, 4].map((i) => (
                  <div className="al-skel" key={i}>
                    <i style={{ width: 40, height: 40, borderRadius: 12 }} />
                    <i style={{ width: "28%" }} />
                    <i style={{ width: "22%" }} />
                    <i style={{ width: "15%", marginLeft: "auto" }} />
                  </div>
                ))
              ) : rows.length === 0 ? (
                <div className="al-empty">
                  <b>
                    {logs.length === 0
                      ? tr("emptyNoData", "មិនទាន់មានទិន្នន័យប្រវត្តិចូលប្រព័ន្ធទេ", "No authentication logs yet")
                      : tr("emptyNoResult", "រកមិនឃើញទិន្នន័យដែលអ្នកស្វែងរកទេ", "No matching logs found")}
                  </b>
                  <span>
                    {tr(
                      "emptyHint",
                      "រាល់សកម្មភាព LOGIN និង LOGOUT នឹងបង្ហាញនៅទីនេះ",
                      "User login and logout records will appear here"
                    )}
                  </span>
                </div>
              ) : (
                <div key={`${actionFilter}-${roleFilter}-${sort}-${current}`}>
                  {rows.map((l, idx) => {
                    const u = l.user || {};
                    const act = String(l.action || "").toUpperCase();
                    const isLogin = act === "LOGIN";
                    const isLogout = act === "LOGOUT";
                    const dt = fmtDateParts(l.timestamp || l.created_at);
                    const roleInfo = getRoleInfo(u, l.role, isKm);

                    return (
                      <div
                        className="al-row"
                        key={l.id ?? idx}
                        style={{ "--i": idx }}
                      >
                        {/* 1. Log ID */}
                        <div>
                          <button
                            type="button"
                            className="al-log-id"
                            onClick={() => setViewLog(l)}
                          >
                            #{l.id}
                          </button>
                        </div>

                        {/* 2. User Avatar + Name + User ID */}
                        <div className="al-user" onClick={() => setViewLog(l)}>
                          <UserAvatar user={u} />
                          <div className="al-user-info">
                            <b title={u.name}>{u.name || `User #${l.user_id}`}</b>
                            <small>User ID: #{l.user_id ?? u.id ?? "-"}</small>
                          </div>
                        </div>

                        {/* 3. Email & Phone */}
                        <div className="al-contact">
                          <div title={u.email}>
                            <Mail size={12} />
                            <span>{u.email || "-"}</span>
                          </div>
                          <div className="sub">
                            <Phone size={12} />
                            <span>{u.phone || "-"}</span>
                          </div>
                        </div>

                        {/* 4. Role Name & Description */}
                        <div className="al-role-cell">
                          <span
                            className={`al-role-pill ${roleInfo.cls}`}
                            title={roleInfo.description || roleInfo.text}
                          >
                            <KeyRound size={11} />
                            {roleInfo.text}
                          </span>
                          {roleInfo.description &&
                            roleInfo.description !== roleInfo.text && (
                              <span
                                className="al-role-desc"
                                title={roleInfo.description}
                              >
                                {roleInfo.description}
                              </span>
                            )}
                        </div>

                        {/* 5. Action Badge */}
                        <div>
                          <span
                            className={`al-badge ${
                              isLogin ? "login" : isLogout ? "logout" : "other"
                            }`}
                          >
                            {isLogin ? (
                              <LogIn size={13} strokeWidth={2.4} />
                            ) : (
                              <LogOut size={13} strokeWidth={2.4} />
                            )}
                            {act || "-"}
                          </span>
                        </div>

                        {/* 6. Timestamp */}
                        <div className="al-time">
                          <div>
                            <Calendar
                              size={12}
                              style={{ verticalAlign: -1, marginRight: 4, color: "var(--teal)" }}
                            />
                            {dt.date}
                          </div>
                          {dt.time && (
                            <small>
                              <Clock
                                size={11}
                                style={{ verticalAlign: -1, marginRight: 4 }}
                              />
                              {dt.time}
                            </small>
                          )}
                        </div>

                        {/* 7. View Action */}
                        <div className="al-acts">
                          <button
                            type="button"
                            className="al-ib"
                            title={isKm ? "មើលព័ត៌មានលម្អិត" : "View details"}
                            onClick={() => setViewLog(l)}
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {!loading && filteredLogs.length > 0 && (
            <div className="al-foot">
              <span>
                {isKm ? "បង្ហាញ" : "Showing"}{" "}
                <b>
                  {start + 1}–{Math.min(start + PAGE_SIZE, filteredLogs.length)}
                </b>{" "}
                {isKm ? "នៃ" : "of"} <b>{filteredLogs.length}</b>
              </span>
              <div className="al-pager">
                <button
                  className="al-pg"
                  onClick={() => setPage(current - 1)}
                  disabled={current === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>
                <span>
                  {current} / {pages}
                </span>
                <button
                  className="al-pg"
                  onClick={() => setPage(current + 1)}
                  disabled={current === pages}
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>

        {detailModal && createPortal(detailModal, document.body)}
      </div>
    </Layout>
  );
}