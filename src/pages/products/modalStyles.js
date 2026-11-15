// src/pages/products/modalStyles.js
// Shared styles for the Create / Edit / View product modals
export const modalCss = `
.pm-overlay { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;
  background: rgba(8,28,29,.52); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); animation: pm-fade .2s ease;
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; }
.pm { --ink:#0f1f1d; --muted:#6a8280; --line:#e6eeec; --teal:#0f766e; color-scheme: light; color: var(--ink); text-align: left; font-size: 13px; margin: 0;
  width: 100%; max-width: 760px; max-height: 92vh; display: flex; flex-direction: column; background: #fff; border-radius: 20px; overflow: hidden;
  box-shadow: 0 30px 80px rgba(6,23,24,.35); animation: pm-rise .32s cubic-bezier(.2,.8,.2,1); }
.pm *, .pm *::before, .pm *::after { box-sizing: border-box; }
.pm h2, .pm h3, .pm h4, .pm p { font-family: inherit; }

.pm-head { padding: 18px 22px; color: #f4faf8; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0;
  background: radial-gradient(300px 140px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.pm-head-l { display: flex; align-items: center; gap: 14px; min-width: 0; }
.pm-ico { width: 42px; height: 42px; border-radius: 13px; background: #c8f169; color: #0c2526; display: grid; place-items: center; flex-shrink: 0; }
.pm-head h3 { margin: 0; color: #f4faf8; font-size: 17px; font-weight: 800; letter-spacing: -.3px; }
.pm-head p { margin: 3px 0 0; font-size: 12.5px; color: #9db8b4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pm-close { all: unset; box-sizing: border-box; cursor: pointer; width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center; color: #cfe3df; background: rgba(255,255,255,.08); transition: background .15s, transform .15s; flex-shrink: 0; }
.pm-close:hover { background: rgba(255,255,255,.18); transform: rotate(90deg); }
.pm button:focus-visible, .pm-in:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.pm-body { padding: 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 22px; }
.pm-sec h4 { margin: 0 0 12px; font-size: 13px; font-weight: 800; color: var(--ink); display: flex; align-items: center; gap: 8px; }
.pm-sec h4::before { content: ''; width: 4px; height: 14px; border-radius: 4px; background: var(--teal); }
.pm-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
.pm-grid.c3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
.pm-full { grid-column: 1 / -1; }
.pm-lab { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; font-size: 12.5px; font-weight: 700; color: #26403c; }
.pm-lab em { font-style: normal; color: #e0463a; margin-left: 3px; }
.pm-link { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: var(--teal); }
.pm-link:hover { text-decoration: underline; }
.pm-in { display: block; width: 100%; height: 42px; padding: 0 12px; font: inherit; font-size: 13.5px; color: var(--ink); background-color: #f6faf9;
  border: 1.5px solid #dde9e6; border-radius: 11px; outline: none; transition: background-color .15s, border-color .15s, box-shadow .15s; }
.pm-in::placeholder { color: #97aeaa; }
.pm-in:focus { background-color: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
textarea.pm-in { height: auto; padding: 10px 12px; resize: vertical; line-height: 1.5; }
select.pm-in { appearance: none; -webkit-appearance: none; padding-right: 32px; cursor: pointer; background-repeat: no-repeat; background-position: right 11px center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a8280' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
.pm-money { position: relative; }
.pm-money > span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); font-weight: 700; pointer-events: none; }
.pm-money .pm-in { padding-left: 26px; }
.pm-note { margin-top: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12.5px; color: var(--muted); }
.pm-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 99px; font-weight: 700; font-size: 12px; background: #eef4f2; color: #35504c; }
.pm-chip.good { background: #e7f8ee; color: #15803d; } .pm-chip.bad { background: #fdecea; color: #c0392b; }

.pm-drop { display: flex; align-items: center; gap: 16px; padding: 14px; border: 1.5px dashed #c5d8d4; border-radius: 14px; background: #f9fcfb; transition: border-color .15s, background .15s; }
.pm-drop:hover { border-color: var(--teal); background: #f2faf8; }
.pm-thumb { width: 76px; height: 76px; border-radius: 14px; flex-shrink: 0; display: grid; place-items: center; background: #e3eeeb; color: #6a8280; overflow: hidden; }
.pm-thumb img { width: 100%; height: 100%; object-fit: cover; }
.pm-drop-t b { display: block; font-size: 13px; } .pm-drop-t small { display: block; color: var(--muted); font-size: 12px; margin: 2px 0 8px; }
.pm-drop-b { display: flex; gap: 8px; flex-wrap: wrap; }
.pm-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

.pm-switch { position: relative; display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 12px 14px; border: 1px solid var(--line); border-radius: 13px; background: #f9fcfb; }
.pm-switch input { position: absolute; opacity: 0; pointer-events: none; }
.pm-track { width: 40px; height: 23px; border-radius: 99px; background: #cbd9d6; position: relative; transition: background .2s; flex-shrink: 0; }
.pm-track::after { content: ''; position: absolute; top: 3px; left: 3px; width: 17px; height: 17px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .2s; }
.pm-switch input:checked + .pm-track { background: var(--teal); }
.pm-switch input:checked + .pm-track::after { transform: translateX(17px); }
.pm-switch input:focus-visible + .pm-track { outline: 2px solid var(--teal); outline-offset: 2px; }
.pm-switch b { display: block; font-size: 13px; } .pm-switch small { color: var(--muted); font-size: 12px; }

.pm-err { display: flex; gap: 10px; align-items: flex-start; background: #fff1f0; color: #b42318; border: 1px solid #fecdca; padding: 11px 13px; border-radius: 12px; font-size: 13px; line-height: 1.45; animation: pm-shake .35s; }
.pm-err svg { flex-shrink: 0; margin-top: 1px; }

.pm-foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid var(--line); background: #fbfdfc; flex-shrink: 0; }
.pm-btn { all: unset; box-sizing: border-box; cursor: pointer; height: 40px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px; border-radius: 11px; font-size: 13px; font-weight: 700;
  color: var(--ink); background: #fff; border: 1px solid #d5e3e0; transition: transform .15s, box-shadow .15s, background .15s; }
.pm-btn:hover:not(:disabled) { background: #f3f9f7; }
.pm-btn.primary { color: #fff; border-color: transparent; background: linear-gradient(135deg,#0f766e,#0b5e58); box-shadow: 0 6px 16px rgba(15,118,110,.26); }
.pm-btn.primary:hover:not(:disabled) { background: linear-gradient(135deg,#0f766e,#0b5e58); transform: translateY(-1px); box-shadow: 0 9px 22px rgba(15,118,110,.36); }
.pm-btn:disabled { opacity: .65; cursor: not-allowed; }
.pm-btn.sm { height: 32px; padding: 0 12px; font-size: 12.5px; border-radius: 9px; }
.pm-spin { animation: pm-rot .8s linear infinite; }

/* view modal */
.pv-hero { display: flex; gap: 18px; align-items: flex-start; }
.pv-img { position: relative; width: 120px; height: 120px; border-radius: 18px; flex-shrink: 0; overflow: hidden; display: grid; place-items: center; font-size: 40px; font-weight: 800; color: #0f766e; background: #e0f4f1; border: 1px solid var(--line); }
.pv-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #fff; }
.pv-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pv-title h2 { margin: 0; color: var(--ink); font-size: 21px; font-weight: 800; letter-spacing: -.5px; }
.pv-desc { margin: 8px 0 12px; color: #4d6561; font-size: 13.5px; line-height: 1.55; }
.pv-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.pv-chips .pm-chip b { color: var(--ink); }
.pv-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; }
.pv-badge.on { background: #e7f8ee; color: #15803d; } .pv-badge.off { background: #eef2f1; color: #5f7773; }
.pv-stats { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
.pv-stat { padding: 13px 14px; border: 1px solid var(--line); border-radius: 14px; background: #fff; animation: pm-up .4s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.pv-stat span { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); margin-bottom: 5px; }
.pv-stat b { display: block; font-size: 18px; font-weight: 800; letter-spacing: -.4px; font-variant-numeric: tabular-nums; }
.pv-stat.hero { border-color: transparent; background: linear-gradient(145deg,#0f2d2e,#0a1f20); color: #f4faf8; }
.pv-stat.hero span { color: #9db8b4; } .pv-stat.hero b { color: #c8f169; }
.pv-stat.warn { background: #fff8ec; border-color: #f7dfae; } .pv-stat.warn b { color: #b45309; }
.pv-stat.bad { background: #fff3f1; border-color: #f7cdc7; } .pv-stat.bad b { color: #c0392b; }
.pv-bar { height: 5px; border-radius: 99px; background: #e6eeec; margin-top: 8px; overflow: hidden; }
.pv-bar i { display: block; height: 100%; width: 100%; border-radius: 99px; transform-origin: left; background: linear-gradient(90deg,#0f766e,#34c3b0); animation: pm-fill .8s cubic-bezier(.2,.7,.2,1) .2s backwards; }
.pv-bar i.low { background: #f59e0b; } .pv-bar i.out { background: #ef4444; }
.pv-info { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
.pv-box { display: flex; align-items: center; gap: 12px; padding: 13px 14px; border: 1px solid var(--line); border-radius: 14px; background: #f9fcfb; min-width: 0; }
.pv-box-i { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; flex-shrink: 0; background: #e0f4f1; color: var(--teal); overflow: hidden; }
.pv-box-i img { width: 100%; height: 100%; object-fit: cover; }
.pv-box span { display: block; font-size: 12px; color: var(--muted); } .pv-box b { display: block; font-size: 13.5px; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pv-box small { display: block; font-size: 11.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pv-time { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 11px 14px; border-radius: 12px; background: #f3f8f7; color: var(--muted); font-size: 12px; }
.pv-time span { display: inline-flex; align-items: center; gap: 6px; } .pv-time b { color: var(--ink); }

@keyframes pm-fade { from { opacity: 0; } }
@keyframes pm-rise { from { opacity: 0; transform: translateY(24px) scale(.97); } }
@keyframes pm-up { from { opacity: 0; transform: translateY(10px); } }
@keyframes pm-fill { from { transform: scaleX(0); } }
@keyframes pm-rot { to { transform: rotate(360deg); } }
@keyframes pm-shake { 20% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 80% { transform: translateX(-3px); } }

@media (max-width: 680px) {
  .pm-overlay { padding: 0; align-items: flex-end; } .pm { max-height: 94vh; border-radius: 20px 20px 0 0; }
  .pm-grid, .pm-grid.c3, .pv-info { grid-template-columns: 1fr; } .pv-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .pv-hero { flex-direction: column; } .pm-body { padding: 18px; } .pm-foot { padding: 12px 18px; }
}
@media (prefers-reduced-motion: reduce) { .pm-overlay, .pm, .pv-stat, .pv-bar i, .pm-err, .pm-spin { animation: none !important; } .pm-close { transition: none; } }
`;