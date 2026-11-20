// src/pages/UserPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import Appbar from "../components/Appbar";
import { listUsers, deleteUser } from "../services/userService";
import CreateUserModal from "./users/CreateUserModal";
import EditUserModal from "./users/EditUserModal";
import ViewUserModal from "./users/ViewUserModal";
import ToastrContainer, { toastr, sweetConfirm } from "../components/Toastr";
import { useTranslation } from "../utils/translations";
import {
  Search,
  Users,
  Shield,
  RefreshCw,
  Plus,
  Pencil,
  Eye,
  Trash2,
  X,
  Phone,
  Mail,
} from "lucide-react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.us { --ink:#0f3733; --text:#26514b; --muted:#5b7873; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e4f3ee; --line:#e1ece8;
  position: fixed; inset: 0; z-index: 1; overflow-x: hidden; overflow-y: auto; display: block; margin: 0; padding: 0; max-width: none; text-align: left;
  color: var(--ink); color-scheme: light; line-height: 1.6;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif;
  background: radial-gradient(760px 380px at 92% -6%, rgba(127,209,194,.24), transparent 70%), #f4f9f7; }
.us *, .us *::before, .us *::after { box-sizing: border-box; }
.us-main { min-height: 100%; display: flex; flex-direction: column; min-width: 0; transition: margin-left .26s cubic-bezier(.4,0,.2,1); }
.us-body { padding: 28px 32px 44px; }

.us-in { animation: us-rise .6s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--d, 0) * 70ms); }
@keyframes us-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* ---------- header ---------- */
.us-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.us-titlewrap { display: flex; align-items: center; gap: 14px; }
.us-titleico { width: 52px; height: 52px; border-radius: 17px; flex-shrink: 0; display: grid; place-items: center; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.us .us-title { margin: 0; font-size: 23px; line-height: 1.5; font-weight: 700; letter-spacing: 0; color: var(--ink); }
.us .us-title small { font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
.us .us-sub { margin: 2px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; }
.us-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.us-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px;
  border-radius: 13px; font-family: inherit; font-weight: 700; font-size: 14px; transition: transform .15s, box-shadow .25s, background .2s, border-color .2s; }
.us-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.us-btn.primary { color: #fff; background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 20px -8px rgba(23,111,101,.55); }
.us-btn.primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.us-btn.primary:hover::after { left: 130%; }
.us-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(23,111,101,.6); }
.us-btn.ghost { color: var(--text); background: #fff; box-shadow: inset 0 0 0 1.5px #cfe0db; }
.us-btn.ghost:hover { background: var(--mint); box-shadow: inset 0 0 0 1.5px #a9cfc5; color: var(--teal-d); }
.us-btn:active { transform: scale(.98); }
.us-btn:disabled { opacity: .7; cursor: not-allowed; }
.us-spin { animation: us-spin .8s linear infinite; }
@keyframes us-spin { to { transform: rotate(360deg); } }

/* ---------- stat cards ---------- */
.us-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 22px; }
.us-stat { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: #fff; border: 1px solid var(--line); border-radius: 18px;
  box-shadow: 0 12px 26px -20px rgba(14,90,81,.55); transition: transform .2s, box-shadow .2s; }
.us-stat:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -18px rgba(14,90,81,.6); }
.us-statico { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; display: grid; place-items: center; }
.us-statico.t1 { background: #dff1ea; color: #176f65; }
.us-statico.t2 { background: #fdeceb; color: #b9382d; }
.us-statico.t3 { background: #e8f5d6; color: #4d7c0f; }
.us-statlabel { font-size: 13px; color: var(--muted); font-weight: 500; }
.us-statnum { font-size: 22px; line-height: 1.35; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }
.us-statnum small { font-size: 13px; font-weight: 600; color: var(--muted); margin-left: 4px; }

/* ---------- panel: toolbar + table ---------- */
.us-panel { background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: 0 16px 34px -26px rgba(14,90,81,.6); }
.us-toolbar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.us-search { position: relative; flex: 1 1 280px; max-width: 460px; display: flex; align-items: center; }
.us-search > svg { position: absolute; left: 14px; color: #5f8a82; pointer-events: none; transition: color .2s; }
.us-search:focus-within > svg { color: var(--teal); }
.us-search input { width: 100%; height: 44px; padding: 0 40px 0 42px; font-size: 14px; font-family: inherit; color: var(--ink); background: #f6faf8;
  border: 1.5px solid #d3e4df; border-radius: 13px; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; color-scheme: light; }
.us-search input::placeholder { color: #86a39d; }
.us-search input:hover { border-color: #b9d3cc; }
.us-search input:focus { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.us-clear { all: unset; cursor: pointer; position: absolute; right: 8px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #5f8a82; transition: background .2s, color .2s; }
.us-clear:hover { background: var(--mint); color: var(--teal-d); }
.us-clear:focus-visible { outline: 2px solid var(--teal); }

.us-seg { display: inline-flex; flex-wrap: wrap; gap: 2px; padding: 4px; background: #eef5f2; border-radius: 14px; }
.us-seg button { all: unset; cursor: pointer; height: 36px; padding: 0 12px 0 14px; display: inline-flex; align-items: center; gap: 8px; border-radius: 10px;
  font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--muted); white-space: nowrap; transition: background .2s, color .2s, box-shadow .2s; }
.us-seg button:hover { color: var(--ink); }
.us-seg button:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }
.us-seg button.on { background: #fff; color: var(--teal-d); box-shadow: 0 4px 10px -6px rgba(14,90,81,.5), 0 0 0 1px rgba(31,138,125,.1); }
.us-seg .n { font-size: 12px; padding: 0 8px; border-radius: 99px; background: rgba(31,138,125,.12); color: var(--teal-d); font-variant-numeric: tabular-nums; }
.us-count { margin-left: auto; font-size: 13px; color: var(--muted); }
.us-count b { color: var(--ink); font-weight: 700; }

.us-tablewrap { overflow-x: auto; }
.us-table { width: 100%; min-width: 920px; border-collapse: collapse; text-align: left; }
.us-table th { padding: 13px 18px; background: #f3f9f7; color: var(--muted); font-size: 12.5px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; border-bottom: 1px solid var(--line); }
.us-table td { padding: 14px 18px; font-size: 14px; border-bottom: 1px solid #eef4f2; vertical-align: middle; }
.us-table tbody tr:last-child td { border-bottom: 0; }
.us-row { animation: us-fadein .4s ease both; animation-delay: calc(min(var(--i), 12) * 30ms); transition: background .15s; }
.us-row:hover { background: #f6fbf9; }
@keyframes us-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.us-idx { color: var(--muted); font-weight: 600; font-variant-numeric: tabular-nums; }
.us-user { display: flex; align-items: center; gap: 12px; }
.us-avbtn { all: unset; cursor: pointer; display: block; flex-shrink: 0; border-radius: 50%; transition: transform .15s; }
.us-avbtn:hover { transform: scale(1.07); }
.us-avbtn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.us-av { display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 1px solid var(--line); background: #f3f9f7; }
.us-av.ph { display: grid; place-items: center; border: 0; color: #fff; font-weight: 800; font-size: 16px; background: linear-gradient(145deg, #3bb5a4, #1a7d70); }
.us-name { all: unset; cursor: pointer; display: block; font-weight: 700; font-size: 14.5px; color: var(--ink); transition: color .15s; }
.us-name:hover { color: var(--teal-d); text-decoration: underline; text-underline-offset: 3px; }
.us-name:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; border-radius: 4px; }
.us-id { font-size: 12px; color: #6f8c86; margin-top: 1px; }
.us-line { display: flex; align-items: center; gap: 8px; max-width: 280px; color: var(--text); font-size: 13.5px; }
.us-line span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.us-line svg { flex-shrink: 0; color: #5f8a82; }
.us-dash { color: #9bb3ae; }

.us-role { display: inline-flex; align-items: center; gap: 7px; padding: 3px 12px; border-radius: 99px; font-size: 12.5px; font-weight: 700; white-space: nowrap; }
.us-role::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.us-role.admin { background: #fdeceb; color: #b9382d; }
.us-role.staff { background: #e0f0f7; color: #0f6d8f; }
.us-role.cash { background: #e8f5d6; color: #4d7c0f; }
.us-role.other { background: #fdf1d6; color: #9a6a0a; }

.us-acts { display: inline-flex; gap: 4px; }
.us-act { all: unset; cursor: pointer; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; color: var(--muted); transition: background .18s, color .18s, transform .15s; }
.us-act:hover { background: var(--mint); color: var(--teal-d); transform: translateY(-1px); }
.us-act.danger:hover { background: #fde8e6; color: #b42318; }
.us-act:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }

/* ---------- states ---------- */
.us-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 13px 16px; border-radius: 14px;
  background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; font-size: 14px; animation: us-fadein .3s ease both; }
.us-error button { all: unset; cursor: pointer; font-weight: 700; padding: 5px 12px; border-radius: 9px; background: #fff; box-shadow: inset 0 0 0 1px #fcd5cf; }
.us-error button:hover { background: #fde8e6; }
.us-skel-row { display: flex; align-items: center; gap: 24px; padding: 16px 20px; border-bottom: 1px solid #eef4f2; }
.us-skel { height: 14px; border-radius: 8px; background: linear-gradient(90deg, #eaf3f0 25%, #f7fbfa 37%, #eaf3f0 63%); background-size: 400% 100%; animation: us-shim 1.4s ease infinite; }
@keyframes us-shim { from { background-position: 100% 0; } to { background-position: 0 0; } }
.us-empty { padding: 60px 20px 64px; text-align: center; }
.us-emptyico { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 24px; display: grid; place-items: center; background: var(--mint); color: var(--teal-d); animation: us-float 4s ease-in-out infinite alternate; }
@keyframes us-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.us .us-emptytitle { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: var(--ink); }
.us-emptytext { margin: 0 0 20px; color: var(--muted); font-size: 14px; }

@media (max-width: 720px) {
  .us-body { padding: 20px 16px 36px; }
  .us .us-title small { display: block; margin: 0; }
  .us-count { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .us *, .us *::before, .us *::after { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

function UserAvatar({ user, onClick, viewLabel }) {
  const src = user.image_url;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const initial = (user.name || "U").trim().charAt(0).toUpperCase();

  return (
    <button
      type="button"
      className="us-avbtn"
      onClick={onClick}
      aria-label={`${viewLabel} ${user.name}`}
    >
      {src && !failed ? (
        <img className="us-av" src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <span className="us-av ph">{initial}</span>
      )}
    </button>
  );
}

function getRoleInfo(user) {
  const roleName = user.role?.name || user.role_name;
  const roleId = user.role_id ?? user.role?.id;

  if (roleName) {
    const lower = roleName.toLowerCase();
    let tone = "other";
    if (lower.includes("admin")) tone = "admin";
    else if (lower.includes("staff") || lower.includes("manager")) tone = "staff";
    else if (lower.includes("cashier") || lower.includes("owner")) tone = "cash";
    return { tone, label: `${roleName}${roleId ? ` (${roleId})` : ""}` };
  }

  switch (Number(roleId)) {
    case 1:
      return { tone: "admin", label: "Admin (1)" };
    case 2:
      return { tone: "staff", label: "Staff (2)" };
    default:
      return { tone: "other", label: `Role #${roleId || "N/A"}` };
  }
}

const roleIdOf = (u) => u.role_id ?? u.role?.id;

export default function UserPage() {
  const { lang, t } = useTranslation();
  const tus = t.users;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await listUsers();
      const items = res?.data || res?.users || (Array.isArray(res) ? res : []);
      setUsers(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      const msg = error.message || tus.fetchError;
      setErrorMsg(msg);
      toastr.error(tus.toastErrorTitle, msg);
    } finally {
      setLoading(false);
    }
  };

  // មុខងារលុបអ្នកប្រើប្រាស់ដោយប្រើ Sweet Confirm & Toastr
  const handleDelete = async (u) => {
    const confirmed = await sweetConfirm({
      title: tus.confirmDeleteTitle,
      text: tus.confirmDeleteText(u.name),
      confirmText: tus.confirmDeleteBtn,
      cancelText: tus.cancelBtn,
      type: "danger",
    });

    if (confirmed) {
      try {
        await deleteUser(u.id);
        setUsers((prev) => prev.filter((item) => item.id !== u.id));
        toastr.success(tus.toastDeleteSuccessTitle, tus.toastDeleteSuccessMsg(u.name));
      } catch (err) {
        toastr.error(tus.toastErrorTitle, err?.message || tus.toastDeleteErrorMsg);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q);

      const matchRole =
        roleFilter === "all" || String(roleIdOf(u)) === String(roleFilter);

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => {
      const rName = (u.role?.name || "").toLowerCase();
      const rId = Number(roleIdOf(u));
      return rId === 1 || rName.includes("admin");
    }).length;
    const staffs = total - admins;
    return { total, admins, staffs };
  }, [users]);

  const roleCounts = useMemo(() => {
    const countBy = (id) => users.filter((u) => String(roleIdOf(u)) === id).length;
    return { all: users.length, 1: countBy("1"), 2: countBy("2"), 3: countBy("3") };
  }, [users]);

  const statCards = [
    { label: tus.statTotal, value: stats.total, icon: Users, tone: "t1" },
    { label: tus.statAdmins, value: stats.admins, icon: Shield, tone: "t2" },
    { label: tus.statStaffs, value: stats.staffs, icon: Users, tone: "t3" },
  ];

  const filters = [
    { key: "all", label: tus.filterAll },
    { key: "1", label: tus.filterAdmin },
    { key: "2", label: tus.filterStaff },
    { key: "3", label: tus.filterCashier },
  ];

  const hasSearch = search.trim() !== "";
  const hasFilter = hasSearch || roleFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
  };

  return (
    <>
      <style>{css}</style>
      <ToastrContainer />
      <div className="us">
        <Sidebar onCollapseChange={(_, width) => setSidebarWidth(width)} />

        <div className="us-main" style={{ marginLeft: `${sidebarWidth}px` }}>
          <Appbar />

          <div className="us-body">
            {/* Header & Action Buttons */}
            <div className="us-head us-in" style={{ "--d": 0 }}>
              <div className="us-titlewrap">
                <div className="us-titleico">
                  <Users size={26} strokeWidth={1.9} />
                </div>
                <div>
                  <h2 className="us-title">
                    {tus.heading}
                    {lang === "km" && <small>System Users</small>}
                  </h2>
                  <p className="us-sub">{tus.subHeading}</p>
                </div>
              </div>

              <div className="us-actions">
                <button className="us-btn ghost" onClick={fetchUsers} disabled={loading}>
                  <RefreshCw size={16} className={loading ? "us-spin" : ""} />
                  <span>{tus.refresh}</span>
                </button>
                <button className="us-btn primary" onClick={() => setIsCreateOpen(true)}>
                  <Plus size={17} strokeWidth={2.4} />
                  <span>{tus.addNew}</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="us-stats">
              {statCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div className="us-stat us-in" style={{ "--d": i + 1 }} key={c.label}>
                    <div className={`us-statico ${c.tone}`}>
                      <Icon size={22} strokeWidth={1.9} />
                    </div>
                    <div>
                      <div className="us-statlabel">{c.label}</div>
                      <div className="us-statnum">
                        {c.value}
                        <small>{tus.personSuffix}</small>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <div className="us-error" role="alert">
                <span>{errorMsg}</span>
                <button type="button" onClick={fetchUsers}>
                  {tus.tryAgain}
                </button>
              </div>
            )}

            {/* Search & Role Filter + Users Table */}
            <div className="us-panel us-in" style={{ "--d": 4 }}>
              <div className="us-toolbar">
                <div className="us-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder={tus.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label={tus.searchPlaceholder}
                  />
                  {hasSearch && (
                    <button
                      type="button"
                      className="us-clear"
                      onClick={() => setSearch("")}
                      aria-label={tus.clearSearch}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="us-seg" role="group" aria-label="Filter by role">
                  {filters.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      className={roleFilter === f.key ? "on" : ""}
                      aria-pressed={roleFilter === f.key}
                      onClick={() => setRoleFilter(f.key)}
                    >
                      {f.label}
                      <span className="n">{roleCounts[f.key]}</span>
                    </button>
                  ))}
                </div>

                {!loading && (
                  <div className="us-count">
                    {tus.showing} <b>{filteredUsers.length}</b> / {users.length} {tus.personSuffix}
                  </div>
                )}
              </div>

              {loading ? (
                <div aria-busy="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div className="us-skel-row" key={i}>
                      <div className="us-skel" style={{ width: 24 }} />
                      <div className="us-skel" style={{ width: 44, height: 44, borderRadius: "50%" }} />
                      <div className="us-skel" style={{ width: "16%" }} />
                      <div className="us-skel" style={{ width: "20%" }} />
                      <div className="us-skel" style={{ width: "12%" }} />
                      <div className="us-skel" style={{ width: "10%", marginLeft: "auto" }} />
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="us-empty">
                  <div className="us-emptyico">
                    <Users size={32} strokeWidth={1.7} />
                  </div>
                  <h3 className="us-emptytitle">
                    {hasFilter ? tus.emptyFilter : tus.emptyNoFilter}
                  </h3>
                  <p className="us-emptytext">
                    {hasFilter ? tus.emptySubFilter : tus.emptySubNoFilter}
                  </p>
                  {hasFilter ? (
                    <button className="us-btn ghost" onClick={clearFilters}>
                      <X size={16} />
                      <span>{tus.clearFilters}</span>
                    </button>
                  ) : (
                    <button className="us-btn primary" onClick={() => setIsCreateOpen(true)}>
                      <Plus size={17} strokeWidth={2.4} />
                      <span>{tus.addNew}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="us-tablewrap">
                  <table className="us-table">
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>#</th>
                        <th>{tus.colUser}</th>
                        <th>{tus.colEmail}</th>
                        <th>{tus.colPhone}</th>
                        <th style={{ textAlign: "center" }}>{tus.colRole}</th>
                        <th style={{ textAlign: "center" }}>{tus.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, index) => {
                        const role = getRoleInfo(u);

                        return (
                          <tr className="us-row" style={{ "--i": index }} key={u.id || index}>
                            <td className="us-idx">{index + 1}</td>

                            {/* Avatar + Name */}
                            <td>
                              <div className="us-user">
                                <UserAvatar
                                  user={u}
                                  onClick={() => setViewingUser(u)}
                                  viewLabel={tus.viewTitle}
                                />
                                <div>
                                  <button
                                    type="button"
                                    className="us-name"
                                    onClick={() => setViewingUser(u)}
                                  >
                                    {u.name}
                                  </button>
                                  <div className="us-id">ID: #{u.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td>
                              {u.email ? (
                                <div className="us-line" title={u.email}>
                                  <Mail size={14} />
                                  <span>{u.email}</span>
                                </div>
                              ) : (
                                <span className="us-dash">-</span>
                              )}
                            </td>

                            {/* Phone */}
                            <td>
                              {u.phone ? (
                                <div className="us-line">
                                  <Phone size={14} />
                                  <span>{u.phone}</span>
                                </div>
                              ) : (
                                <span className="us-dash">-</span>
                              )}
                            </td>

                            {/* Role Badge */}
                            <td style={{ textAlign: "center" }}>
                              <span className={`us-role ${role.tone}`}>{role.label}</span>
                            </td>

                            {/* Actions (View, Edit, Delete) */}
                            <td style={{ textAlign: "center" }}>
                              <div className="us-acts">
                                <button
                                  type="button"
                                  className="us-act"
                                  onClick={() => setViewingUser(u)}
                                  title={tus.viewTitle}
                                  aria-label={`${tus.viewTitle} ${u.name}`}
                                >
                                  <Eye size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="us-act"
                                  onClick={() => setEditingUser(u)}
                                  title={tus.editTitle}
                                  aria-label={`${tus.editTitle} ${u.name}`}
                                >
                                  <Pencil size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="us-act danger"
                                  onClick={() => handleDelete(u)}
                                  title={tus.deleteTitle}
                                  aria-label={`${tus.deleteTitle} ${u.name}`}
                                >
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
            </div>
          </div>
        </div>

        {/* Modal បង្កើតអ្នកប្រើប្រាស់ថ្មី */}
        <CreateUserModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            fetchUsers();
            toastr.success(tus.toastCreateSuccessTitle, tus.toastCreateSuccessMsg);
          }}
        />

        {/* Modal មើលព័ត៌មានលម្អិតអ្នកប្រើប្រាស់ */}
        <ViewUserModal
          isOpen={Boolean(viewingUser)}
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={(usr) => setEditingUser(usr)}
          onDelete={handleDelete}
        />

        {/* Modal កែប្រែព័ត៌មានអ្នកប្រើប្រាស់ */}
        <EditUserModal
          isOpen={Boolean(editingUser)}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            fetchUsers();
            toastr.success(tus.toastUpdateSuccessTitle, tus.toastUpdateSuccessMsg);
          }}
        />
      </div>
    </>
  );
}