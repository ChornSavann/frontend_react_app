// src/pages/brands/brandStyles.js
// Small extras for the brand modals (used together with ../products/modalStyles)
export const brandCss = `
.pm-btn.danger { color: #c0392b; background: #fff5f4; border-color: #f6cfca; }
.pm-btn.danger:hover:not(:disabled) { background: #fdecea; }
.pm-btn.danger.solid { color: #fff; border-color: transparent; background: linear-gradient(135deg,#dc3b2f,#b42318); box-shadow: 0 6px 16px rgba(180,35,24,.28); }
.pm-btn.danger.solid:hover:not(:disabled) { background: linear-gradient(135deg,#dc3b2f,#b42318); transform: translateY(-1px); box-shadow: 0 9px 22px rgba(180,35,24,.38); }
.pm-foot.split { justify-content: space-between; align-items: center; }
.pm-foot .grp { display: flex; gap: 10px; }
.pv-img.logo, .pm-thumb.logo { background: #fff; border: 1px solid var(--line); }
.pv-img.logo img { object-fit: contain; padding: 12px; }
.pm-thumb.logo img { object-fit: contain; padding: 6px; }
.br-slug { display: inline-flex; align-items: center; gap: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.bd { max-width: 420px; text-align: center; }
.bd-body { padding: 26px 24px 8px; }
.bd-ico { width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 14px; display: grid; place-items: center; background: #fdecea; color: #c0392b; animation: bd-pop .4s cubic-bezier(.2,.9,.3,1.4); }
.bd h3 { margin: 0 0 8px; font-size: 18px; font-weight: 800; letter-spacing: -.3px; color: var(--ink); }
.bd p { margin: 0; color: #4d6561; line-height: 1.6; font-size: 13.5px; }
.bd p b { color: var(--ink); }
.bd .pm-err { margin: 14px 0 0; text-align: left; }
.bd .pm-foot { justify-content: stretch; border-top: 0; background: #fff; padding: 18px 24px 24px; }
.bd .pm-foot .pm-btn { flex: 1; justify-content: center; }
@keyframes bd-pop { from { transform: scale(.6); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .bd-ico { animation: none; } }
`;