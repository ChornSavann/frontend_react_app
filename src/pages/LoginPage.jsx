import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
  Zap,
  Boxes,
  BarChart3,
} from "lucide-react";
import {
  loginUser,
  loginWithGoogle,
  verifyLoginOtp,
  resendLoginOtp,
} from "../services/authService";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap');

.lg { --ink:#123c38; --muted:#43605c; --teal:#1f8a7d; --teal-d:#176f65; --mint:#e6f4ef; --line:#bdd3cd; --ok:#2e9e72; --bad:#d9564a;
  position: fixed; inset: 0; z-index: 1; overflow-y: auto; text-align: left; margin: 0; max-width: none;
  display: grid; grid-template-columns: minmax(0,1.05fr) minmax(0,1fr); grid-template-rows: minmax(100%, auto);
  font-family: 'Plus Jakarta Sans','Noto Sans Khmer',-apple-system,sans-serif; line-height: 1.6; background: #fbfdfc; color: var(--ink); }
.lg *, .lg *::before, .lg *::after { box-sizing: border-box; }

/* ---------- brand panel ---------- */
.lg-brand { position: relative; overflow: hidden; padding: 48px 56px; display: flex; flex-direction: column; justify-content: space-between; gap: 24px;
  background: linear-gradient(165deg, #d9f0e8 0%, #bfe3d7 55%, #a3d6c8 100%); }
.lg-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .55; pointer-events: none; }
.lg-blob.a { width: 360px; height: 360px; top: -90px; left: -80px; background: #f4fbf8; animation: lg-drift 16s ease-in-out infinite alternate; }
.lg-blob.b { width: 420px; height: 420px; bottom: -140px; right: -100px; background: #7fd1c2; animation: lg-drift 20s ease-in-out -6s infinite alternate-reverse; }
@keyframes lg-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,30px) scale(1.12); } }

.lg-logo-row { position: relative; display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 16px; }
.lg-logo { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 18px;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 8px 18px rgba(23,111,101,.28), inset 0 1px 0 rgba(255,255,255,.35); }

.lg-hero { position: relative; }
.lg .lg-hero h1 { font-size: 36px; line-height: 1.5; letter-spacing: 0; font-weight: 700; margin: 0 0 12px; max-width: 520px; color: #0b2f2b; }
.lg-hero p { margin: 0; color: #24433f; font-size: 15px; line-height: 1.9; max-width: 430px; }
.lg-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.lg-chip { display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 14px 0 10px; border-radius: 99px; background: rgba(255,255,255,.62); backdrop-filter: blur(6px);
  font-size: 13px; font-weight: 600; color: #0f4a43; box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); animation: lg-rise .7s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(.5s + var(--i) * .1s); }
.lg-chip svg { color: var(--teal-d); }

/* receipt */
.lg-receipt { margin-top: 30px; width: 300px; padding: 20px 22px 26px; border-radius: 16px; background: #fff; color: var(--ink);
  transform: rotate(-3deg); box-shadow: 0 28px 50px rgba(18,60,56,.18);
  animation: lg-print 1s cubic-bezier(.2,.8,.2,1) .2s both, lg-float 7s ease-in-out 1.4s infinite alternate;
  -webkit-mask: radial-gradient(circle 6px at 6px 100%, transparent 98%, #000) -6px 100%/12px 100% repeat-x;
          mask: radial-gradient(circle 6px at 6px 100%, transparent 98%, #000) -6px 100%/12px 100% repeat-x; }
@keyframes lg-print { from { opacity: 0; transform: translateY(-28px) rotate(-6deg); } to { opacity: 1; transform: translateY(0) rotate(-3deg); } }
@keyframes lg-float { from { transform: translateY(0) rotate(-3deg); } to { transform: translateY(-9px) rotate(-2deg); } }
.lg-receipt h4 { margin: 0 0 10px; font-size: 13px; font-weight: 700; display: flex; justify-content: space-between; }
.lg-receipt h4 span { color: var(--muted); font-weight: 500; }
.lg-row { display: flex; justify-content: space-between; font-size: 13px; padding: 7px 0; border-bottom: 1px dashed var(--line);
  opacity: 0; animation: lg-line .5s ease-out both; animation-delay: calc(.7s + var(--i) * .22s); }
.lg-row span:last-child { font-weight: 600; font-variant-numeric: tabular-nums; }
@keyframes lg-line { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.lg-total { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-weight: 700; font-size: 15px;
  opacity: 0; animation: lg-line .5s ease-out 1.5s both; }
.lg-total b { background: var(--teal); color: #fff; padding: 5px 12px; border-radius: 10px; font-size: 16px; font-variant-numeric: tabular-nums; }
.lg-foot { position: relative; font-size: 12.5px; color: #2f514c; }

/* ---------- form panel ---------- */
.lg-side { display: grid; place-items: center; padding: 40px 24px;
  background: radial-gradient(600px 420px at 85% 10%, rgba(127,209,194,.16), transparent 70%), #fbfdfc; }
.lg-card { width: 100%; max-width: 420px; padding: 38px 36px 34px; background: #fff; border: 1px solid #e3eeea; border-radius: 24px;
  box-shadow: 0 1px 0 rgba(255,255,255,.8) inset, 0 24px 60px -24px rgba(23,111,101,.25);
  animation: lg-card-in .8s cubic-bezier(.2,.8,.2,1) both; }
@keyframes lg-card-in { from { opacity: 0; transform: translateY(18px) scale(.985); } to { opacity: 1; transform: none; } }
.lg-shake.on { animation: lg-shake .45s cubic-bezier(.36,.07,.19,.97); }
@keyframes lg-shake { 10%,90% { transform: translateX(-1px); } 20%,80% { transform: translateX(3px); } 30%,50%,70% { transform: translateX(-5px); } 40%,60% { transform: translateX(5px); } }

.lg-in { animation: lg-rise .7s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(.25s + var(--d, 0) * .08s); }
@keyframes lg-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

.lg-mlogo { display: none; align-items: center; gap: 10px; font-weight: 700; font-size: 15px; margin-bottom: 26px; }
.lg-mlogo .lg-logo { width: 36px; height: 36px; border-radius: 11px; font-size: 16px; }

.lg .lg-card h2 { margin: 0 0 6px; font-size: 26px; line-height: 1.5; letter-spacing: 0; font-weight: 700; color: #0b2f2b; }
.lg-sub { margin: 0 0 24px; color: var(--muted); font-size: 14px; line-height: 1.8; }
.lg-sub b { color: var(--ink); font-weight: 700; word-break: break-all; }

.lg-otpico { width: 56px; height: 56px; margin-bottom: 16px; display: grid; place-items: center; border-radius: 18px; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }

.lg-err, .lg-info { display: flex; gap: 10px; align-items: flex-start; padding: 11px 13px; border-radius: 12px; margin-bottom: 18px; font-size: 13px; line-height: 1.6; animation: lg-drop .35s ease-out both; }
.lg-err { background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; }
.lg-info { background: #e8f7f3; color: #0f5f56; border: 1px solid #bce4da; }
.lg-err svg, .lg-info svg { flex-shrink: 0; margin-top: 3px; }
@keyframes lg-drop { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }

.lg-field { margin-bottom: 16px; }
.lg-field > label { display: block; margin-bottom: 7px; font-size: 13px; font-weight: 600; color: var(--ink); transition: color .2s; }
.lg-field:focus-within > label { color: var(--teal-d); }
.lg-input { position: relative; display: flex; align-items: center; background: #fff; border: 1.5px solid var(--line); border-radius: 14px;
  transition: border-color .25s, box-shadow .25s, background .25s; }
.lg-input:hover { border-color: #93b7ae; }
.lg-input:focus-within { background: #fff; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,138,125,.13); }
.lg-input > svg { position: absolute; left: 15px; color: #5f8a82; pointer-events: none; transition: color .25s, transform .25s; }
.lg-input:focus-within > svg { color: var(--teal); transform: scale(1.1); }
.lg-input input { all: unset; width: 100%; height: 48px; padding: 0 48px 0 46px; font-size: 14.5px; color: var(--ink); font-family: inherit; }
.lg-input input::placeholder { color: #86a39d; }
.lg-caps { display: flex; align-items: center; gap: 6px; margin-top: 7px; font-size: 12.5px; font-weight: 600; color: #9a6a0a; animation: lg-drop .25s ease-out both; }

/* ---------- OTP ---------- */
.lg-otp { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; }
.lg-otp-box { all: unset; box-sizing: border-box; flex: 1 1 0; min-width: 0; max-width: 48px; height: 56px; text-align: center; font-size: 22px; font-weight: 800; color: var(--ink); font-family: inherit; font-variant-numeric: tabular-nums;
  background: #fff; border: 1.5px solid var(--line); border-radius: 13px; caret-color: var(--teal); transition: border-color .2s, box-shadow .2s, background .2s, transform .2s; }
.lg-otp-box:hover { border-color: #93b7ae; }
.lg-otp-box.filled { border-color: var(--teal); background: #f1faf7; animation: lg-fill .25s cubic-bezier(.3,1.6,.5,1); }
@keyframes lg-fill { from { transform: scale(.92); } to { transform: none; } }
.lg-otp-box:focus { border-color: var(--teal); background: #fff; box-shadow: 0 0 0 4px rgba(31,138,125,.15); transform: translateY(-2px); }
.lg-otp.err .lg-otp-box { border-color: #e58b82; background: #fff8f7; }
.lg-otp.err .lg-otp-box:focus { box-shadow: 0 0 0 4px rgba(217,86,74,.14); }
.lg-otp.ok .lg-otp-box { border-color: var(--ok); background: #eefaf4; }
.lg-otp-dash { width: 10px; height: 2px; flex-shrink: 0; border-radius: 2px; background: #b9d3cc; }
.lg-otp-hint { margin: 0 0 6px; text-align: center; font-size: 12.5px; color: var(--muted); }

.lg-eye { all: unset; cursor: pointer; position: absolute; right: 7px; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; color: #5f8a82; transition: background .2s, color .2s; }
.lg-eye:hover { background: var(--mint); color: var(--teal); }
.lg-eye svg { animation: lg-pop .25s ease-out; }
@keyframes lg-pop { from { opacity: 0; transform: scale(.6) rotate(-20deg); } to { opacity: 1; transform: none; } }
.lg-eye:focus-visible, .lg-btn:focus-visible, .lg-gbtn:focus-visible, .lg-otp-box:focus-visible { outline: none; }
.lg-eye:focus-visible, .lg-btn:focus-visible, .lg-gbtn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.lg-opts { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: -2px 0 6px; }
.lg-check { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; font-size: 13.5px; color: var(--muted); user-select: none; transition: color .2s; }
.lg-check:hover { color: var(--ink); }
.lg-check input { position: absolute; opacity: 0; width: 0; height: 0; }
.lg-box { width: 19px; height: 19px; border-radius: 6px; border: 1.5px solid #93b7ae; background: #fff; display: grid; place-items: center; color: #fff;
  transition: background .2s, border-color .2s, box-shadow .2s; }
.lg-box svg { transform: scale(0); transition: transform .25s cubic-bezier(.3,1.6,.5,1); }
.lg-check input:checked + .lg-box { background: var(--teal); border-color: var(--teal); }
.lg-check input:checked + .lg-box svg { transform: scale(1); }
.lg-check input:focus-visible + .lg-box { outline: 2px solid var(--teal); outline-offset: 2px; }
.lg-link { all: unset; box-sizing: border-box; cursor: pointer; position: relative; color: var(--teal-d); font-weight: 600; font-size: 13.5px; text-decoration: none; border-radius: 6px; font-family: inherit; }
.lg-link:disabled { opacity: .55; cursor: not-allowed; }
.lg-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1.5px; background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform .25s ease; }
.lg-link:hover:not(:disabled)::after, .lg-link:focus-visible::after { transform: scaleX(1); }
.lg-link:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; }
.lg-signup { margin: 20px 0 0; text-align: center; font-size: 13.5px; color: var(--muted); }
.lg-signup .lg-link { margin-left: 6px; }

.lg-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; width: 100%; height: 50px; margin-top: 10px;
  display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 14px; font-weight: 700; font-size: 15px; color: #fff; font-family: inherit;
  background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 22px -6px rgba(23,111,101,.45);
  transition: transform .15s, box-shadow .25s, background .4s, opacity .2s; }
.lg-btn::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transition: left .7s ease; }
.lg-btn:hover:not(:disabled)::after { left: 130%; }
.lg-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 28px -8px rgba(23,111,101,.5); }
.lg-btn:active:not(:disabled) { transform: translateY(0) scale(.99); }
.lg-btn:disabled { cursor: default; }
.lg-btn.loading { opacity: .85; }
.lg-btn.ok { background: linear-gradient(135deg, #38b583, var(--ok)); box-shadow: 0 10px 22px -6px rgba(46,158,114,.5); }
.lg-btn.ok svg { animation: lg-check .45s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes lg-check { from { opacity: 0; transform: scale(.3) rotate(-30deg); } to { opacity: 1; transform: none; } }
.lg-spin { animation: lg-spin .8s linear infinite; }
@keyframes lg-spin { to { transform: rotate(360deg); } }

/* ---------- divider & google button ---------- */
.lg-div { display: flex; align-items: center; gap: 12px; margin: 18px 0 14px; color: #7b9691; font-size: 12.5px; font-weight: 500; }
.lg-div::before, .lg-div::after { content: ''; flex: 1; height: 1px; background: #e1ece8; }
.lg-gbtn { all: unset; box-sizing: border-box; cursor: pointer; width: 100%; height: 48px; display: flex; align-items: center; justify-content: center; gap: 10px;
  border-radius: 14px; font-weight: 600; font-size: 14.5px; color: var(--ink); font-family: inherit; background: #fff; border: 1.5px solid #d5e4df; box-shadow: 0 2px 6px rgba(18,60,56,.04);
  transition: transform .15s, border-color .2s, background .2s, box-shadow .2s; }
.lg-gbtn:hover:not(:disabled) { background: #f4faf8; border-color: #9dc2b8; transform: translateY(-1px); box-shadow: 0 6px 16px -6px rgba(18,60,56,.14); }
.lg-gbtn:active:not(:disabled) { transform: scale(.99); }
.lg-gbtn:disabled { opacity: .65; cursor: not-allowed; }

@media (max-height: 820px) { .lg-chips { display: none; } }
@media (max-width: 900px) {
  .lg { grid-template-columns: 1fr; }
  .lg-brand { display: none; }
  .lg-side { min-height: 100%; padding: 24px 16px; }
  .lg-mlogo { display: flex; }
  .lg-card { padding: 32px 22px 28px; }
  .lg-otp { gap: 6px; } .lg-otp-box { height: 52px; font-size: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .lg *, .lg *::before, .lg *::after { animation-duration: .01ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

const REMEMBER_KEY = "lg_remember_email";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const OTP_LEN = 6;
const RESEND_COOLDOWN = 30;
const emptyOtp = () => Array(OTP_LEN).fill("");

const maskEmail = (v = "") => {
  const [name, domain] = String(v).split("@");
  if (!domain) return v;
  const head = name.slice(0, Math.min(2, name.length));
  return `${head}${"*".repeat(Math.max(name.length - head.length, 3))}@${domain}`;
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" />
      <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" />
      <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

function useCountUp(target, duration = 900, delay = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return undefined;
    }
    let raf;
    let start;
    const t = setTimeout(() => {
      const step = (ts) => {
        if (start === undefined) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setValue(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);
  return value;
}

export default function LoginPage() {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_KEY) || "";
    } catch {
      return "";
    }
  });
  const [remember, setRemember] = useState(() => {
    try {
      return !!localStorage.getItem(REMEMBER_KEY);
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [caps, setCaps] = useState(false);

  // OTP
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpValues, setOtpValues] = useState(emptyOtp);
  const otpInputRefs = useRef([]);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [infoMsg, setInfoMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const redirectTimer = useRef(null);
  const total = useCountUp(9);

  // ពិនិត្យមើលបើ Redirect មកពី Session / Token Expire
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "expired" || reason === "session_expired") {
      setErrorMsg("Session របស់អ្នកបានផុតកំណត់ហើយ សូម Login ម្ដងទៀត។");
      setInfoMsg("");
      setShake(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (document.getElementById("google-gsi-script")) return;
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const fail = (msg) => {
    setErrorMsg(msg);
    setInfoMsg("");
    setShake(true);
  };

  const enterOtpStep = (res, fallbackEmail) => {
    setOtpEmail(res?.email || fallbackEmail || email);
    setOtpValues(emptyOtp());
    setOtpStep(true);
    setErrorMsg("");
    setInfoMsg(res?.message || "លេខកូដ OTP ត្រូវបានផ្ញើទៅអ៊ីមែលរបស់អ្នកហើយ");
    setCooldown(RESEND_COOLDOWN);
    setTimeout(() => otpInputRefs.current[0]?.focus(), 120);
  };

  const finishLogin = (delay = 700) => {
    setSuccess(true);
    redirectTimer.current = setTimeout(() => navigate("/dashboard"), delay);
  };

  /* ---------- password login ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await loginUser(email, password);

      if (res.require_otp) {
        enterOtpStep(res, email);
      } else if (res.success || res.token) {
        try {
          if (remember) localStorage.setItem(REMEMBER_KEY, email);
          else localStorage.removeItem(REMEMBER_KEY);
        } catch {
          // ignore storage error
        }
        finishLogin(800);
      } else {
        fail(res.message || "ចូលមិនបានជោគជ័យ សូមព្យាយាមម្តងទៀត");
      }
    } catch (err) {
      fail(err?.response?.data?.message || err.message || "មានបញ្ហាបណ្តាញ ឬម៉ាស៊ីនមេ");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- google login ---------- */
  const handleGoogleLogin = () => {
    setErrorMsg("");
    setInfoMsg("");

    if (!GOOGLE_CLIENT_ID) {
      fail("មិនទាន់បានកំណត់ VITE_GOOGLE_CLIENT_ID នៅក្នុង .env ទេ");
      return;
    }
    if (!window.google?.accounts?.oauth2) {
      fail("កំពុងផ្ទុកសេវាកម្ម Google សូមព្យាយាមម្ដងទៀតក្នុងពេលបន្តិច...");
      return;
    }

    setGoogleLoading(true);

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      callback: async (tokenResponse) => {
        if (tokenResponse.error || !tokenResponse.access_token) {
          setGoogleLoading(false);
          fail("ការចូលជាមួយ Google ត្រូវបានបោះបង់");
          return;
        }

        try {
          const res = await loginWithGoogle(tokenResponse.access_token);

          if (res.require_otp) {
            enterOtpStep(res, "");
            return;
          }
          if (res.success || res.token) {
            finishLogin(700);
          } else {
            fail(res.message || "មិនអាចចូលប្រើជាមួយគណនី Google បានទេ");
          }
        } catch (err) {
          fail(err?.response?.data?.message || err.message || "មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់គណនី Google");
        } finally {
          setGoogleLoading(false);
        }
      },
      error_callback: () => {
        setGoogleLoading(false);
      },
    });

    tokenClient.requestAccessToken();
  };

  /* ---------- OTP ---------- */
  const submitOtp = async (code) => {
    if (loading || success) return;
    if (code.length !== OTP_LEN) {
      fail(`សូមបញ្ចូលលេខកូដ OTP ឱ្យបានគ្រប់ ${OTP_LEN} ខ្ទង់`);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await verifyLoginOtp(otpEmail || email, code);
      if (res.success || res.token) {
        finishLogin(700);
      } else {
        fail(res.message || "លេខកូដ OTP មិនត្រឹមត្រូវ");
        setOtpValues(emptyOtp());
        setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      fail(err?.response?.data?.message || err.message || "លេខកូដ OTP មិនត្រឹមត្រូវ ឬផុតកំណត់");
      setOtpValues(emptyOtp());
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    submitOtp(otpValues.join(""));
  };

  const fillOtp = (digits, from = 0) => {
    const next = [...otpValues];
    for (let i = 0; i < digits.length && from + i < OTP_LEN; i += 1) next[from + i] = digits[i];
    setOtpValues(next);
    setErrorMsg("");
    const focusAt = Math.min(from + digits.length, OTP_LEN - 1);
    otpInputRefs.current[focusAt]?.focus();
    if (next.every(Boolean)) submitOtp(next.join(""));
  };

  const handleOtpChange = (e, index) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) {
      const next = [...otpValues];
      next[index] = "";
      setOtpValues(next);
      return;
    }
    fillOtp(digits.length > 1 ? digits : digits.slice(-1), digits.length > 1 && index === 0 ? 0 : index);
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const next = [...otpValues];
        next[index] = "";
        setOtpValues(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LEN - 1) {
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (digits) fillOtp(digits, 0);
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setErrorMsg("");
    setInfoMsg("");
    try {
      const res = await resendLoginOtp(otpEmail || email);
      setOtpValues(emptyOtp());
      setInfoMsg(res.message || "បានផ្ញើលេខកូដ OTP ថ្មីទៅអ៊ីមែលរបស់អ្នកហើយ");
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
    } catch (err) {
      fail(err?.response?.data?.message || err.message || "មិនអាចផ្ញើ OTP ម្ដងទៀតបានទេ");
    } finally {
      setResending(false);
    }
  };

  const backToLogin = () => {
    setOtpStep(false);
    setOtpValues(emptyOtp());
    setOtpEmail("");
    setErrorMsg("");
    setInfoMsg("");
    setCooldown(0);
  };

  const btnState = success ? "ok" : loading ? "loading" : "";
  const otpState = success ? "ok" : errorMsg ? "err" : "";

  return (
    <>
      <style>{css}</style>
      <div className="lg">
        {/* Brand panel */}
        <aside className="lg-brand" aria-hidden="true">
          <span className="lg-blob a" />
          <span className="lg-blob b" />

          <div className="lg-logo-row">
            <div className="lg-logo">P</div>
            POS &amp; Inventory
          </div>

          <div className="lg-hero">
            <h1>
              លក់ឲ្យលឿន
              <br />
              ស្គាល់ស្តុកឲ្យច្បាស់
            </h1>
            <p>ការបញ្ជាទិញ វិក្កយបត្រ ស្តុក និងរបាយការណ៍ សម្រាប់ហាងរបស់អ្នក ក្នុងកន្លែងតែមួយ។</p>

            <div className="lg-chips">
              <span className="lg-chip" style={{ "--i": 0 }}>
                <Zap size={15} /> លក់លឿន
              </span>
              <span className="lg-chip" style={{ "--i": 1 }}>
                <Boxes size={15} /> ស្តុកច្បាស់
              </span>
              <span className="lg-chip" style={{ "--i": 2 }}>
                <BarChart3 size={15} /> របាយការណ៍
              </span>
            </div>

            <div className="lg-receipt">
              <h4>
                Order #1042 <span>ថ្ងៃនេះ</span>
              </h4>
              <div className="lg-row" style={{ "--i": 0 }}>
                <span>កាហ្វេទឹកកក × 2</span>
                <span>$5.00</span>
              </div>
              <div className="lg-row" style={{ "--i": 1 }}>
                <span>ក្រូស្សង់ × 1</span>
                <span>$2.50</span>
              </div>
              <div className="lg-row" style={{ "--i": 2 }}>
                <span>ទឹកបរិសុទ្ធ × 3</span>
                <span>$1.50</span>
              </div>
              <div className="lg-total">
                សរុប <b>${total.toFixed(2)}</b>
              </div>
            </div>
          </div>

          <div className="lg-foot">© {new Date().getFullYear()} POS &amp; Inventory</div>
        </aside>

        {/* Form */}
        <main className="lg-side">
          <form className="lg-card" onSubmit={otpStep ? handleVerifyOtp : handleLogin} noValidate={otpStep}>
            <div className={`lg-shake${shake ? " on" : ""}`} onAnimationEnd={(e) => e.animationName === "lg-shake" && setShake(false)}>
              <div className="lg-mlogo lg-in" style={{ "--d": 0 }}>
                <div className="lg-logo">P</div>
                POS &amp; Inventory
              </div>

              {otpStep ? (
                <div key="otp">
                  <div className="lg-otpico lg-in" style={{ "--d": 0 }}>
                    <ShieldCheck size={28} strokeWidth={1.9} />
                  </div>
                  <h2 className="lg-in" style={{ "--d": 0 }}>
                    ផ្ទៀងផ្ទាត់ OTP
                  </h2>
                  <p className="lg-sub lg-in" style={{ "--d": 1 }}>
                    យើងបានផ្ញើលេខកូដ {OTP_LEN} ខ្ទង់ទៅកាន់ <b>{maskEmail(otpEmail || email)}</b>
                  </p>

                  {errorMsg && (
                    <div className="lg-err" role="alert">
                      <AlertCircle size={17} />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  {infoMsg && !errorMsg && (
                    <div className="lg-info" role="status">
                      <ShieldCheck size={17} />
                      <span>{infoMsg}</span>
                    </div>
                  )}

                  <div className="lg-field lg-in" style={{ "--d": 2 }}>
                    <label id="lg-otp-label">លេខកូដ OTP</label>
                    <div className={`lg-otp ${otpState}`} role="group" aria-labelledby="lg-otp-label" onPaste={handleOtpPaste}>
                      {otpValues.map((digit, idx) => (
                        <React.Fragment key={idx}>
                          {idx === OTP_LEN / 2 && <span className="lg-otp-dash" aria-hidden="true" />}
                          <input
                            ref={(el) => {
                              otpInputRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={idx === 0 ? "one-time-code" : "off"}
                            value={digit}
                            onChange={(e) => handleOtpChange(e, idx)}
                            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                            onFocus={(e) => e.target.select()}
                            className={`lg-otp-box${digit ? " filled" : ""}`}
                            aria-label={`ខ្ទង់ទី ${idx + 1}`}
                            autoFocus={idx === 0}
                            disabled={loading || success}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="lg-otp-hint">អាចបិទភ្ជាប់ (Paste) លេខកូដទាំង {OTP_LEN} ខ្ទង់ម្តងបាន</p>
                  </div>

                  <button type="submit" className={`lg-btn lg-in ${btnState}`} style={{ "--d": 3 }} disabled={loading || success}>
                    {success ? (
                      <>
                        <Check size={19} strokeWidth={3} />
                        ផ្ទៀងផ្ទាត់ជោគជ័យ
                      </>
                    ) : loading ? (
                      <>
                        <Loader2 size={18} className="lg-spin" />
                        កំពុងផ្ទៀងផ្ទាត់...
                      </>
                    ) : (
                      "ផ្ទៀងផ្ទាត់ និងចូលប្រើប្រាស់"
                    )}
                  </button>

                  <div className="lg-opts lg-in" style={{ "--d": 4, marginTop: 18 }}>
                    <button type="button" className="lg-link" onClick={backToLogin} disabled={loading || success}>
                      ← ត្រឡប់ក្រោយ
                    </button>
                    <button type="button" className="lg-link" onClick={handleResendOtp} disabled={resending || loading || success || cooldown > 0}>
                      {resending ? "កំពុងផ្ញើ..." : cooldown > 0 ? `ផ្ញើ OTP ម្ដងទៀត (${cooldown}s)` : "ផ្ញើ OTP ម្ដងទៀត"}
                    </button>
                  </div>
                </div>
              ) : (
                <div key="login">
                  <h2 className="lg-in" style={{ "--d": 0 }}>
                    សូមស្វាគមន៍ត្រឡប់មកវិញ
                  </h2>
                  <p className="lg-sub lg-in" style={{ "--d": 1 }}>
                    ចូលគណនីរបស់អ្នក ដើម្បីគ្រប់គ្រងការលក់ និងស្តុក
                  </p>

                  {errorMsg && (
                    <div className="lg-err" role="alert">
                      <AlertCircle size={17} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="lg-field lg-in" style={{ "--d": 2 }}>
                    <label htmlFor="lg-email">អ៊ីមែល ឬ ឈ្មោះអ្នកប្រើប្រាស់</label>
                    <div className="lg-input">
                      <Mail size={18} />
                      <input
                        id="lg-email"
                        type="text"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@example.com ឬ ឈ្មោះ"
                      />
                    </div>
                  </div>

                  <div className="lg-field lg-in" style={{ "--d": 3 }}>
                    <label htmlFor="lg-password">ពាក្យសម្ងាត់</label>
                    <div className="lg-input">
                      <Lock size={18} />
                      <input
                        id="lg-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => setCaps(Boolean(e.getModifierState?.("CapsLock")))}
                        onKeyUp={(e) => setCaps(Boolean(e.getModifierState?.("CapsLock")))}
                        onBlur={() => setCaps(false)}
                        required
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="lg-eye"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "លាក់ពាក្យសម្ងាត់" : "បង្ហាញពាក្យសម្ងាត់"}
                      >
                        {showPassword ? <EyeOff key="off" size={18} /> : <Eye key="on" size={18} />}
                      </button>
                    </div>
                    {caps && (
                      <div className="lg-caps" role="status">
                        <AlertCircle size={14} /> Caps Lock កំពុងបើក
                      </div>
                    )}
                  </div>

                  <div className="lg-opts lg-in" style={{ "--d": 4 }}>
                    <label className="lg-check">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                      <span className="lg-box">
                        <Check size={12} strokeWidth={3.5} />
                      </span>
                      ចងចាំខ្ញុំ
                    </label>
                    <Link to="/forgot-password" className="lg-link">
                      ភ្លេចពាក្យសម្ងាត់?
                    </Link>
                  </div>

                  <button type="submit" className={`lg-btn lg-in ${btnState}`} style={{ "--d": 5 }} disabled={loading || googleLoading || success}>
                    {success ? (
                      <>
                        <Check size={19} strokeWidth={3} />
                        ចូលជោគជ័យ
                      </>
                    ) : loading ? (
                      <>
                        <Loader2 size={18} className="lg-spin" />
                        កំពុងចូល...
                      </>
                    ) : (
                      "ចូលប្រើប្រាស់"
                    )}
                  </button>

                  <div className="lg-div lg-in" style={{ "--d": 5.5 }}>
                    ឬ
                  </div>

                  <button type="button" className="lg-gbtn lg-in" style={{ "--d": 6 }} onClick={handleGoogleLogin} disabled={loading || googleLoading || success}>
                    {googleLoading ? (
                      <>
                        <Loader2 size={18} className="lg-spin" />
                        កំពុងភ្ជាប់ជាមួយ Google...
                      </>
                    ) : (
                      <>
                        <GoogleIcon />
                        ចូលប្រើជាមួយ Google
                      </>
                    )}
                  </button>

                  <p className="lg-signup lg-in" style={{ "--d": 6.5 }}>
                    មិនទាន់មានគណនី?
                    <Link to="/register" className="lg-link">
                      ចុះឈ្មោះ
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </>
  );
}