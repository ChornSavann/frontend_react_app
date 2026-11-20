import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Zap,
  Boxes,
  BarChart3,
} from "lucide-react";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
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
.lg-foot { position: relative; font-size: 12.5px; color: #2f514c; }

/* ---------- form panel ---------- */
.lg-side { display: grid; place-items: center; padding: 40px 24px;
  background: radial-gradient(600px 420px at 85% 10%, rgba(127,209,194,.16), transparent 70%), #fbfdfc; }
.lg-card { width: 100%; max-width: 430px; padding: 38px 36px 34px; background: #fff; border: 1px solid #e3eeea; border-radius: 24px;
  box-shadow: 0 1px 0 rgba(255,255,255,.8) inset, 0 24px 60px -24px rgba(23,111,101,.25);
  animation: lg-card-in .8s cubic-bezier(.2,.8,.2,1) both; }
@keyframes lg-card-in { from { opacity: 0; transform: translateY(18px) scale(.985); } to { opacity: 1; transform: none; } }
.lg-shake.on { animation: lg-shake .45s cubic-bezier(.36,.07,.19,.97); }
@keyframes lg-shake { 10%,90% { transform: translateX(-1px); } 20%,80% { transform: translateX(3px); } 30%,50%,70% { transform: translateX(-5px); } 40%,60% { transform: translateX(5px); } }

.lg-in { animation: lg-rise .7s cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(.15s + var(--d, 0) * .07s); }
@keyframes lg-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

.lg-mlogo { display: none; align-items: center; gap: 10px; font-weight: 700; font-size: 15px; margin-bottom: 26px; }
.lg-mlogo .lg-logo { width: 36px; height: 36px; border-radius: 11px; font-size: 16px; }

.lg .lg-card h2 { margin: 0 0 6px; font-size: 25px; line-height: 1.5; letter-spacing: 0; font-weight: 700; color: #0b2f2b; }
.lg-sub { margin: 0 0 22px; color: var(--muted); font-size: 14px; line-height: 1.8; }
.lg-sub b { color: var(--ink); font-weight: 700; word-break: break-all; }

.lg-otpico { width: 54px; height: 54px; margin-bottom: 14px; display: grid; place-items: center; border-radius: 17px; color: #fff;
  background: linear-gradient(145deg, #2aa595, #176f65); box-shadow: 0 14px 24px -12px rgba(23,111,101,.65), inset 0 1px 0 rgba(255,255,255,.35); }

.lg-err, .lg-info { display: flex; gap: 10px; align-items: flex-start; padding: 11px 13px; border-radius: 12px; margin-bottom: 18px; font-size: 13px; line-height: 1.6; animation: lg-drop .35s ease-out both; }
.lg-err { background: #fff4f2; color: #b42318; border: 1px solid #fcd5cf; }
.lg-info { background: #e8f7f3; color: #0f5f56; border: 1px solid #bce4da; }
.lg-err svg, .lg-info svg { flex-shrink: 0; margin-top: 3px; }
@keyframes lg-drop { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }

.lg-field { margin-bottom: 15px; }
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

/* ---------- OTP ---------- */
.lg-otp { display: flex; align-items: center; justify-content: center; gap: 7px; margin-bottom: 8px; }
.lg-otp-box { all: unset; box-sizing: border-box; flex: 1 1 0; min-width: 0; max-width: 46px; height: 52px; text-align: center; font-size: 21px; font-weight: 800; color: var(--ink); font-family: inherit; font-variant-numeric: tabular-nums;
  background: #fff; border: 1.5px solid var(--line); border-radius: 12px; caret-color: var(--teal); transition: border-color .2s, box-shadow .2s, background .2s, transform .2s; }
.lg-otp-box:hover { border-color: #93b7ae; }
.lg-otp-box.filled { border-color: var(--teal); background: #f1faf7; animation: lg-fill .25s cubic-bezier(.3,1.6,.5,1); }
@keyframes lg-fill { from { transform: scale(.92); } to { transform: none; } }
.lg-otp-box:focus { border-color: var(--teal); background: #fff; box-shadow: 0 0 0 4px rgba(31,138,125,.15); transform: translateY(-2px); }
.lg-otp.err .lg-otp-box { border-color: #e58b82; background: #fff8f7; }
.lg-otp.ok .lg-otp-box { border-color: var(--ok); background: #eefaf4; }
.lg-otp-dash { width: 8px; height: 2px; flex-shrink: 0; border-radius: 2px; background: #b9d3cc; }
.lg-otp-hint { margin: 0 0 4px; text-align: center; font-size: 12px; color: var(--muted); }

.lg-eye { all: unset; cursor: pointer; position: absolute; right: 7px; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; color: #5f8a82; transition: background .2s, color .2s; }
.lg-eye:hover { background: var(--mint); color: var(--teal); }
.lg-eye:focus-visible, .lg-btn:focus-visible, .lg-otp-box:focus-visible { outline: none; }
.lg-eye:focus-visible, .lg-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

.lg-opts { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
.lg-link { all: unset; box-sizing: border-box; cursor: pointer; position: relative; display: inline-flex; align-items: center; gap: 6px;
  color: var(--teal-d); font-weight: 600; font-size: 13.5px; text-decoration: none; border-radius: 6px; font-family: inherit; }
.lg-link:disabled { opacity: .55; cursor: not-allowed; }
.lg-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1.5px; background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform .25s ease; }
.lg-link:hover:not(:disabled)::after, .lg-link:focus-visible::after { transform: scaleX(1); }

.lg-btn { all: unset; box-sizing: border-box; cursor: pointer; position: relative; overflow: hidden; width: 100%; height: 50px; margin-top: 10px;
  display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 14px; font-weight: 700; font-size: 15px; color: #fff; font-family: inherit;
  background: linear-gradient(135deg, #25998b, #176f65); box-shadow: 0 10px 22px -6px rgba(23,111,101,.45);
  transition: transform .15s, box-shadow .25s, background .4s, opacity .2s; }
.lg-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 28px -8px rgba(23,111,101,.5); }
.lg-btn:disabled { cursor: default; opacity: .8; }
.lg-btn.ok { background: linear-gradient(135deg, #38b583, var(--ok)); box-shadow: 0 10px 22px -6px rgba(46,158,114,.5); }
.lg-spin { animation: lg-spin .8s linear infinite; }
@keyframes lg-spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .lg { grid-template-columns: 1fr; }
  .lg-brand { display: none; }
  .lg-side { min-height: 100%; padding: 24px 16px; }
  .lg-mlogo { display: flex; }
  .lg-card { padding: 32px 22px 28px; }
}
`;

const OTP_LEN = 6;
const RESEND_COOLDOWN = 30;
const emptyOtp = () => Array(OTP_LEN).fill("");

const maskEmail = (v = "") => {
  const [name, domain] = String(v).split("@");
  if (!domain) return v;
  const head = name.slice(0, Math.min(2, name.length));
  return `${head}${"*".repeat(Math.max(name.length - head.length, 3))}@${domain}`;
};

export default function ForgotPasswordPage() {
  // ៣ ជំហាន៖ "email" -> "otp" -> "password"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState(emptyOtp);
  const otpInputRefs = useRef([]);

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const fail = (msg) => {
    setErrorMsg(msg);
    setInfoMsg("");
    setShake(true);
  };

  // ជំហានទី ១៖ ផ្ញើ OTP ទៅ Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      fail("សូមបញ្ចូលអ៊ីមែលរបស់អ្នក");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await sendForgotPasswordOtp(email.trim());
      setOtpValues(emptyOtp());
      setStep("otp");
      setInfoMsg(res.message || "លេខកូដ OTP 6 ខ្ទង់ត្រូវបានផ្ញើទៅអ៊ីមែលរបស់អ្នកហើយ");
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 120);
    } catch (err) {
      fail(err?.response?.data?.message || err.message || "មិនអាចផ្ញើលេខកូដ OTP បានទេ");
    } finally {
      setLoading(false);
    }
  };

  // ជំហានទី ២៖ ផ្ទៀងផ្ទាត់ OTP ជាមុនសិន
  const submitVerifyOtp = async (code) => {
    if (loading || code.length !== OTP_LEN) {
      if (code.length !== OTP_LEN) fail(`សូមបញ្ចូលលេខកូដ OTP ឱ្យបានគ្រប់ ${OTP_LEN} ខ្ទង់`);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await verifyForgotPasswordOtp(email.trim(), code);
      if (res.success) {
        setPassword("");
        setPasswordConfirmation("");
        setStep("password");
        setInfoMsg(res.message || "ផ្ទៀងផ្ទាត់ OTP ជោគជ័យ សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី");
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
    submitVerifyOtp(otpValues.join(""));
  };

  const fillOtp = (digits, from = 0) => {
    const next = [...otpValues];
    for (let i = 0; i < digits.length && from + i < OTP_LEN; i += 1) {
      next[from + i] = digits[i];
    }
    setOtpValues(next);
    setErrorMsg("");
    const focusAt = Math.min(from + digits.length, OTP_LEN - 1);
    otpInputRefs.current[focusAt]?.focus();
    if (next.every(Boolean)) submitVerifyOtp(next.join(""));
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
      const res = await sendForgotPasswordOtp(email.trim());
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

  // ជំហានទី ៣៖ ប្ដូរពាក្យសម្ងាត់ថ្មី
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      fail("ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ");
      return;
    }
    if (password !== passwordConfirmation) {
      fail("ការបញ្ជាក់ពាក្យសម្ងាត់ថ្មីមិនដូចគ្នាទេ");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await resetPasswordWithOtp({
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.success) {
        setSuccess(true);
        setInfoMsg(res.message || "ពាក្យសម្ងាត់ថ្មីត្រូវបានរក្សាទុកជោគជ័យ");
        redirectTimer.current = setTimeout(() => navigate("/login"), 1200);
      } else {
        fail(res.message || "មិនអាចប្ដូរពាក្យសម្ងាត់បានទេ");
      }
    } catch (err) {
      fail(err?.response?.data?.message || err.message || "មិនអាចប្ដូរពាក្យសម្ងាត់បានទេ");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (step === "email") return handleSendOtp(e);
    if (step === "otp") return handleVerifyOtp(e);
    return handleResetPassword(e);
  };

  const btnState = success ? "ok" : loading ? "loading" : "";
  const otpState = success ? "ok" : errorMsg ? "err" : "";

  return (
    <>
      <style>{css}</style>
      <div className="lg">
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
          </div>

          <div className="lg-foot">© {new Date().getFullYear()} POS &amp; Inventory</div>
        </aside>

        <main className="lg-side">
          <form className="lg-card" onSubmit={handleFormSubmit} noValidate>
            <div
              className={`lg-shake${shake ? " on" : ""}`}
              onAnimationEnd={(e) => e.animationName === "lg-shake" && setShake(false)}
            >
              <div className="lg-mlogo lg-in" style={{ "--d": 0 }}>
                <div className="lg-logo">P</div>
                POS &amp; Inventory
              </div>

              {step === "email" && (
                <div key="step-email">
                  <div className="lg-otpico lg-in" style={{ "--d": 0 }}>
                    <KeyRound size={26} strokeWidth={2} />
                  </div>
                  <h2 className="lg-in" style={{ "--d": 0 }}>
                    ភ្លេចពាក្យសម្ងាត់?
                  </h2>
                  <p className="lg-sub lg-in" style={{ "--d": 1 }}>
                    បញ្ចូលអ៊ីមែលរបស់អ្នក ដើម្បីទទួលលេខកូដ OTP 6 ខ្ទង់សម្រាប់ផ្ទៀងផ្ទាត់
                  </p>

                  {errorMsg && (
                    <div className="lg-err" role="alert">
                      <AlertCircle size={17} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="lg-field lg-in" style={{ "--d": 2 }}>
                    <label htmlFor="fp-email">អ៊ីមែលគណនី</label>
                    <div className="lg-input">
                      <Mail size={18} />
                      <input
                        id="fp-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`lg-btn lg-in ${btnState}`}
                    style={{ "--d": 3 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="lg-spin" />
                        កំពុងផ្ញើ OTP...
                      </>
                    ) : (
                      "ផ្ញើលេខកូដ OTP"
                    )}
                  </button>

                  <div className="lg-opts lg-in" style={{ "--d": 4 }}>
                    <Link to="/login" className="lg-link">
                      <ArrowLeft size={15} /> ត្រឡប់ទៅទំព័រចូលប្រើប្រាស់
                    </Link>
                  </div>
                </div>
              )}

              {step === "otp" && (
                <div key="step-otp">
                  <div className="lg-otpico lg-in" style={{ "--d": 0 }}>
                    <ShieldCheck size={28} strokeWidth={1.9} />
                  </div>
                  <h2 className="lg-in" style={{ "--d": 0 }}>
                    ផ្ទៀងផ្ទាត់ OTP
                  </h2>
                  <p className="lg-sub lg-in" style={{ "--d": 1 }}>
                    យើងបានផ្ញើលេខកូដ {OTP_LEN} ខ្ទង់ទៅកាន់ <b>{maskEmail(email)}</b>
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
                    <label id="fp-otp-label">លេខកូដ OTP (6 ខ្ទង់)</label>
                    <div
                      className={`lg-otp ${otpState}`}
                      role="group"
                      aria-labelledby="fp-otp-label"
                      onPaste={handleOtpPaste}
                    >
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
                            disabled={loading}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="lg-otp-hint">អាចបិទភ្ជាប់ (Paste) លេខកូដទាំង {OTP_LEN} ខ្ទង់ម្តងបាន</p>
                  </div>

                  <button
                    type="submit"
                    className={`lg-btn lg-in ${btnState}`}
                    style={{ "--d": 3 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="lg-spin" />
                        កំពុងផ្ទៀងផ្ទាត់...
                      </>
                    ) : (
                      "ផ្ទៀងផ្ទាត់ OTP"
                    )}
                  </button>

                  <div className="lg-opts lg-in" style={{ "--d": 4 }}>
                    <button
                      type="button"
                      className="lg-link"
                      onClick={() => {
                        setStep("email");
                        setOtpValues(emptyOtp());
                        setErrorMsg("");
                        setInfoMsg("");
                      }}
                      disabled={loading}
                    >
                      ← ប្ដូរអ៊ីមែល
                    </button>
                    <button
                      type="button"
                      className="lg-link"
                      onClick={handleResendOtp}
                      disabled={resending || loading || cooldown > 0}
                    >
                      {resending
                        ? "កំពុងផ្ញើ..."
                        : cooldown > 0
                        ? `ផ្ញើ OTP ម្ដងទៀត (${cooldown}s)`
                        : "ផ្ញើ OTP ម្ដងទៀត"}
                    </button>
                  </div>
                </div>
              )}

              {step === "password" && (
                <div key="step-password">
                  <div className="lg-otpico lg-in" style={{ "--d": 0 }}>
                    <Lock size={26} strokeWidth={2} />
                  </div>
                  <h2 className="lg-in" style={{ "--d": 0 }}>
                    កំណត់ពាក្យសម្ងាត់ថ្មី
                  </h2>
                  <p className="lg-sub lg-in" style={{ "--d": 1 }}>
                    ផ្ទៀងផ្ទាត់រួចរាល់សម្រាប់ <b>{maskEmail(email)}</b>
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
                    <label htmlFor="fp-new-password">ពាក្យសម្ងាត់ថ្មី</label>
                    <div className="lg-input">
                      <Lock size={18} />
                      <input
                        id="fp-new-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        placeholder="យ៉ាងហោចណាស់ 6 តួអក្សរ"
                        disabled={loading || success}
                      />
                      <button
                        type="button"
                        className="lg-eye"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "លាក់ពាក្យសម្ងាត់" : "បង្ហាញពាក្យសម្ងាត់"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="lg-field lg-in" style={{ "--d": 3 }}>
                    <label htmlFor="fp-confirm-password">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
                    <div className="lg-input">
                      <Lock size={18} />
                      <input
                        id="fp-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                        placeholder="វាយពាក្យសម្ងាត់ថ្មីម្ដងទៀត"
                        disabled={loading || success}
                      />
                      <button
                        type="button"
                        className="lg-eye"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        aria-label={showConfirmPassword ? "លាក់ពាក្យសម្ងាត់" : "បង្ហាញពាក្យសម្ងាត់"}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`lg-btn lg-in ${btnState}`}
                    style={{ "--d": 3.5 }}
                    disabled={loading || success}
                  >
                    {success ? (
                      <>
                        <Check size={19} strokeWidth={3} />
                        ប្ដូរពាក្យសម្ងាត់ជោគជ័យ
                      </>
                    ) : loading ? (
                      <>
                        <Loader2 size={18} className="lg-spin" />
                        កំពុងរក្សាទុក...
                      </>
                    ) : (
                      "រក្សាទុកពាក្យសម្ងាត់ថ្មី"
                    )}
                  </button>

                  <div className="lg-opts lg-in" style={{ "--d": 4 }}>
                    <Link to="/login" className="lg-link">
                      <ArrowLeft size={15} /> ត្រឡប់ទៅទំព័រចូលប្រើប្រាស់
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </>
  );
}