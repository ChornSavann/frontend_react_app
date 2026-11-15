// src/pages/roles/roleStyles.js
// Extra styles for the role / permission modals (used with ../products/modalStyles)
export const roleCss = `
.rp-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rp-search { position: relative; display: flex; align-items: center; flex: 1; min-width: 170px; }
.rp-search > svg { position: absolute; left: 11px; color: #8aa3a0; pointer-events: none; }
.rp-search .pm-in { height: 36px; padding-left: 34px; font-size: 13px; }
.rp-groups { display: flex; flex-direction: column; gap: 14px; max-height: 330px; overflow-y: auto; padding: 14px; border: 1px solid var(--line); border-radius: 14px; background: #f9fcfb; }
.rp-ghead { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.rp-ghead b { font-size: 12.5px; text-transform: capitalize; } .rp-ghead b em { font-style: normal; font-weight: 600; color: var(--muted); margin-left: 6px; }
.rp-pills { display: flex; flex-wrap: wrap; gap: 7px; }
.rp-pill { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 10px; font-size: 12.5px; font-weight: 600;
  color: #4d6561; background: #fff; border: 1.5px solid #dce8e5; transition: background .15s, border-color .15s, color .15s, transform .1s; }
.rp-pill:hover { border-color: #b8d0cb; } .rp-pill:active { transform: scale(.97); }
.rp-pill.on { color: #0b5e58; background: #e0f4f1; border-color: #7fcfc4; }
.rp-pill:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
.rp-pill svg { opacity: 0; width: 0; transition: opacity .15s, width .15s; } .rp-pill.on svg { opacity: 1; width: 13px; }
.rp-tag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 9px; font-size: 12px; font-weight: 600; background: #e0f4f1; color: #0b5e58; }
.rp-empty { padding: 18px; text-align: center; color: var(--muted); font-size: 13px; }
.rp-form { padding: 16px; border: 1px solid #c9e3de; border-radius: 14px; background: #f2faf8; animation: pm-up .25s cubic-bezier(.2,.7,.2,1); }
.rp-form h5 { margin: 0 0 12px; font-size: 13.5px; font-weight: 800; color: var(--ink); font-family: inherit; }
.rp-list { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.rp-prow { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,2fr) auto; gap: 12px; align-items: center; padding: 11px 14px; border-top: 1px solid var(--line); transition: background .12s; animation: pm-up .3s cubic-bezier(.2,.7,.2,1) calc(var(--i) * 20ms) backwards; }
.rp-prow:first-child { border-top: 0; } .rp-prow:hover { background: #f6fbf9; }
.rp-prow code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; font-weight: 700; color: #0b5e58; background: #e0f4f1; padding: 3px 9px; border-radius: 8px; display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rp-prow span { color: var(--muted); font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rp-ib { all: unset; box-sizing: border-box; cursor: pointer; width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--muted); transition: background .15s, color .15s, transform .15s; }
.rp-ib:hover { transform: translateY(-1px); } .rp-ib.e:hover { background: #e0f4f1; color: var(--teal); } .rp-ib.d:hover { background: #fdecea; color: #c0392b; }
.rp-ib:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
@media (max-width: 640px) { .rp-prow { grid-template-columns: minmax(0,1fr) auto; } .rp-prow span { grid-column: 1; grid-row: 2; } }
@media (prefers-reduced-motion: reduce) { .rp-form, .rp-prow { animation: none !important; } }
`;