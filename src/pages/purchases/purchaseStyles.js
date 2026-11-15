// src/pages/purchases/purchaseStyles.js
// Extra styles for the purchase modals (used together with ../products/modalStyles)
export const purchaseCss = `
.pm.wide { max-width: 920px; }
.pp-seg { display: flex; gap: 4px; padding: 4px; background: #eef4f2; border-radius: 12px; }
.pp-seg button { all: unset; box-sizing: border-box; cursor: pointer; flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 8px;
  border-radius: 9px; font-size: 12.5px; font-weight: 700; color: var(--muted); text-align: center; white-space: nowrap; transition: background .15s, color .15s; }
.pp-seg button:hover { color: var(--ink); }
.pp-seg button.on { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(12,37,38,.12); }
.pp-seg button.on.good { color: #15803d; } .pp-seg button.on.warn { color: #b45309; } .pp-seg button.on.bad { color: #c0392b; }
.pp-seg button:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.pp-sec-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.pp-sec-head h4 { margin: 0; }

.pp-cols, .pp-item { display: grid; grid-template-columns: minmax(0,3fr) minmax(0,1.2fr) minmax(0,.9fr) minmax(0,1fr) 40px; gap: 10px; }
.pp-cols { padding: 0 12px 6px; font-size: 11.5px; font-weight: 700; color: var(--muted); }
.pp-cols span:nth-child(4) { text-align: right; }
.pp-items { display: flex; flex-direction: column; gap: 10px; }
.pp-item { align-items: start; padding: 12px; border: 1px solid var(--line); border-radius: 14px; background: #f9fcfb; animation: pm-up .3s cubic-bezier(.2,.7,.2,1) backwards; }
.pp-hint { margin-top: 5px; font-size: 11.5px; color: var(--muted); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.pp-hint b { color: var(--ink); }
.pp-hint .up { color: #15803d; font-weight: 700; }
.pp-line { height: 42px; display: flex; align-items: center; justify-content: flex-end; font-weight: 800; font-size: 14px; color: var(--teal); font-variant-numeric: tabular-nums; }
.pp-del { all: unset; box-sizing: border-box; cursor: pointer; width: 40px; height: 42px; display: grid; place-items: center; border-radius: 11px; color: #c0392b; background: #fdecea; transition: background .15s, transform .15s; }
.pp-del:hover:not(:disabled) { background: #fbd5d0; transform: scale(1.05); }
.pp-del:disabled { opacity: .35; cursor: not-allowed; }
.pp-del:focus-visible { outline: 2px solid #c0392b; outline-offset: 2px; }

.pp-bottom { display: grid; grid-template-columns: minmax(0,1fr) 310px; gap: 18px; align-items: start; }
.pp-total { padding: 16px 18px; border-radius: 16px; color: #f4faf8;
  background: radial-gradient(240px 120px at 100% 0%, rgba(200,241,105,.22), transparent 65%), linear-gradient(145deg,#0f2d2e,#0a1f20); }
.pp-total .row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 5px 0; font-size: 13px; color: #9db8b4; }
.pp-total .row b { color: #f4faf8; font-variant-numeric: tabular-nums; }
.pp-total .pm-in { width: 110px; height: 34px; text-align: right; color: #f4faf8; background-color: rgba(255,255,255,.08); border-color: rgba(255,255,255,.14); }
.pp-total .pm-in:focus { background-color: rgba(255,255,255,.14); border-color: #c8f169; box-shadow: 0 0 0 3px rgba(200,241,105,.2); }
.pp-grand { margin-top: 10px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.14); display: flex; justify-content: space-between; align-items: center; }
.pp-grand span { color: #9db8b4; font-size: 13px; }
.pp-grand b { font-size: 26px; font-weight: 800; letter-spacing: -.7px; color: #c8f169; font-variant-numeric: tabular-nums; }
.pp-who { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 11px; background: rgba(200,241,105,.14); color: #d9f5a0; font-size: 12.5px; }

/* view */
.pp-meta { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: 12px 16px; border: 1px solid var(--line); border-radius: 14px; background: #f9fcfb; }
.pp-meta-l { display: flex; gap: 18px; flex-wrap: wrap; color: var(--muted); font-size: 12.5px; }
.pp-meta-l span { display: inline-flex; align-items: center; gap: 6px; } .pp-meta-l b { color: var(--ink); }
.pp-st { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; background: #eef2f1; color: #5f7773; }
.pp-st.completed { background: #e7f8ee; color: #15803d; } .pp-st.pending { background: #fff4e0; color: #b45309; } .pp-st.cancelled { background: #fdecea; color: #c0392b; }
.pp-parties { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
.pp-party { padding: 14px; border: 1px solid var(--line); border-radius: 14px; background: #fff; animation: pm-up .4s cubic-bezier(.2,.7,.2,1) var(--d,0ms) backwards; }
.pp-party > span { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--muted); margin-bottom: 10px; }
.pp-pr { display: flex; align-items: center; gap: 12px; min-width: 0; }
.pp-av { position: relative; width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 16px; overflow: hidden; }
.pp-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #fff; }
.pp-pr b { display: block; font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pp-pr small { display: block; font-size: 12px; color: var(--muted); margin-top: 1px; }
.pp-lines { margin-top: 10px; display: grid; gap: 5px; font-size: 12.5px; color: var(--muted); }
.pp-lines div { display: flex; align-items: center; gap: 7px; min-width: 0; } .pp-lines svg { flex-shrink: 0; }
.pp-vhead, .pp-vrow { display: grid; grid-template-columns: minmax(0,3fr) minmax(0,1fr) minmax(0,.8fr) minmax(0,1fr); gap: 12px; align-items: center; padding: 0 14px; }
.pp-vhead { height: 36px; font-size: 11.5px; font-weight: 700; color: var(--muted); background: #f7fbfa; }
.pp-vhead span:nth-child(2), .pp-vhead span:nth-child(4), .pp-vrow .r { text-align: right; } .pp-vhead span:nth-child(3), .pp-vrow .c { text-align: center; }
.pp-vtable { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.pp-vrow { min-height: 58px; border-top: 1px solid var(--line); animation: pm-up .35s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 40ms) backwards; }
.pp-vrow .pm-chip { background: #e3eeff; color: #1d4ed8; }
.pp-vrow .r { font-weight: 700; font-variant-numeric: tabular-nums; } .pp-vrow .r.g { color: var(--teal); font-weight: 800; }
.pp-note { padding: 12px 14px; border-radius: 12px; background: #f6faf9; border: 1px solid var(--line); color: #4d6561; line-height: 1.55; min-height: 52px; }

@media (max-width: 760px) {
  .pp-cols { display: none; }
  .pp-item { grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
  .pp-item > :first-child { grid-column: 1 / -1; } .pp-item .pp-line { justify-content: flex-start; } .pp-item .pp-del { width: 100%; }
  .pp-bottom, .pp-parties { grid-template-columns: 1fr; }
  .pp-vhead { display: none; } .pp-vrow { grid-template-columns: minmax(0,1fr) auto; padding: 10px 14px; gap: 4px 12px; }
  .pp-vrow > :first-child { grid-column: 1 / -1; } .pp-vrow .r, .pp-vrow .c { text-align: left; }
}
@media (prefers-reduced-motion: reduce) { .pp-item, .pp-party, .pp-vrow { animation: none !important; } }
`;