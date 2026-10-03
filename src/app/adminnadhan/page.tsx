"use client";

import { useState, useEffect } from "react";
import { Lock, Mail, Key, ShieldAlert, QrCode, ShieldCheck, ArrowLeft, Copy, Check, HelpCircle, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

type AuthStep = "login" | "mfa-enroll" | "mfa-verify";

export default function AdminLogin() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // CAPTCHA State
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");

  // MFA State
  const [factorId, setFactorId] = useState<string>("");
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [totpQrCode, setTotpQrCode] = useState<string>("");
  const [totpCode, setTotpCode] = useState<string>("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    generateCaptcha();
    // Allow URL query ?flow=enroll or ?flow=verify for direct inspection/testing
    const flow = searchParams?.get("flow");
    if (flow === "enroll") {
      setStep("mfa-enroll");
      setTotpSecret("JBSWY3DPEHPK3PXP");
    } else if (flow === "verify") {
      setStep("mfa-verify");
    }
  }, [searchParams]);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaInput("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Verify Captcha
    if (parseInt(captchaInput) !== num1 + num2) {
      setError("Incorrect CAPTCHA answer. Please try again.");
      generateCaptcha();
      setLoading(false);
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    try {
      // Check existing MFA factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.warn("Could not list MFA factors:", factorsError.message);
        router.push("/adminnadhan/dashboard");
        return;
      }

      const totpFactors = factorsData?.totp || [];
      const verifiedFactor = totpFactors.find((f) => f.status === "verified");

      if (verifiedFactor) {
        // Enrolled: Proceed to TOTP challenge verification
        setFactorId(verifiedFactor.id);
        setStep("mfa-verify");
        setLoading(false);
      } else {
        // Not yet enrolled: Start enrollment flow
        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Admin Authenticator",
        });

        if (enrollError) {
          setError("Failed to initialize 2FA enrollment: " + enrollError.message);
          setLoading(false);
          return;
        }

        setFactorId(enrollData.id);
        setTotpSecret(enrollData.totp.secret);
        setTotpQrCode(enrollData.totp.qr_code);
        setStep("mfa-enroll");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("MFA initialization error:", err);
      // Fallback redirect if MFA is unavailable in environment
      router.push("/adminnadhan/dashboard");
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode.trim() || totpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (factorId) {
        const { data, error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: totpCode.trim(),
        });

        if (verifyError) {
          setError("Invalid 2FA code. Please verify your authenticator app and device clock.");
          setLoading(false);
          return;
        }
      }

      router.push("/adminnadhan/dashboard");
    } catch (err: any) {
      setError("Verification failed: " + err.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setStep("login");
    setError(null);
    setTotpCode("");
    generateCaptcha();
  };

  const handleCopySecret = () => {
    if (!totpSecret) return;
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  // Helper to format QR code src
  const getQrCodeSrc = () => {
    if (!totpQrCode) {
      // Default clean SVG QR mockup if previewing or unenrolled
      const secret = totpSecret || "JBSWY3DPEHPK3PXP";
      return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        `otpauth://totp/LPUTamizhans:Admin?secret=${secret}&issuer=LPUTamizhans`
      )}`;
    }
    if (totpQrCode.startsWith("data:")) return totpQrCode;
    return `data:image/svg+xml;utf-8,${encodeURIComponent(totpQrCode)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-border transition-all">
        
        {/* STEP 1: INITIAL CREDENTIALS LOGIN */}
        {step === "login" && (
          <>
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8" />
            </div>
            
            <h1 className="font-heading text-3xl font-extrabold text-center mb-2 text-foreground">
              Secure Portal
            </h1>
            <p className="text-center text-muted-foreground mb-8 font-medium text-sm">
              Sign in to manage events, moments &amp; site content.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm font-bold text-center border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Authorized Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-white border border-border rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-white border border-border rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-primary" /> Security CAPTCHA
                </label>
                <div className="flex gap-3 items-center">
                  <div className="h-12 px-4 rounded-xl bg-secondary border border-border flex items-center justify-center font-mono font-bold text-base text-foreground shrink-0 shadow-xs">
                    {num1} + {num2} =
                  </div>
                  <input 
                    type="number" 
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="flex-1 h-12 bg-white border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                    placeholder="Answer"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !email || !password || !captchaInput}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 mt-4 disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? "Verifying Credentials..." : "Sign In"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: MFA ENROLLMENT (FIRST LOGIN) */}
        {step === "mfa-enroll" && (
          <>
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8" />
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-center mb-1 text-foreground">
              Set Up 2-Step Verification
            </h1>
            <p className="text-center text-muted-foreground mb-6 font-medium text-xs sm:text-sm">
              Scan this QR code with Google Authenticator, Microsoft Authenticator, or 1Password.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-xs sm:text-sm font-bold text-center border border-red-200">
                {error}
              </div>
            )}

            {/* QR Code Presentation Box */}
            <div className="bg-white border-2 border-primary/20 p-4 rounded-3xl shadow-sm flex flex-col items-center justify-center mb-6">
              <div className="w-48 h-48 sm:w-52 sm:h-52 bg-white rounded-2xl flex items-center justify-center overflow-hidden p-2 relative shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={getQrCodeSrc()} 
                  alt="Authenticator QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                TOTP 2FA • Scan with Mobile App
              </span>
            </div>

            {/* Manual Secret Key */}
            {totpSecret && (
              <div className="bg-secondary/60 border border-border p-3.5 rounded-2xl mb-6 text-center space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Cannot scan? Use Secret Key
                </span>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-xs font-mono font-bold text-foreground bg-white px-2.5 py-1 rounded-lg border border-border select-all tracking-wider">
                    {totpSecret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1.5 rounded-lg bg-white border border-border text-foreground hover:text-primary transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                    title="Copy Secret"
                  >
                    {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSecret ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 6-Digit Verification Input */}
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block text-center">
                  Enter 6-Digit Code from App
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full h-14 bg-white border-2 border-primary/40 rounded-2xl text-center font-mono text-2xl font-black tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                  placeholder="000000"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? "Activating 2FA..." : "Verify & Activate 2FA"}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 py-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel &amp; Return to Sign In</span>
              </button>
            </form>
          </>
        )}

        {/* STEP 3: MFA VERIFICATION (SUBSEQUENT LOGINS) */}
        {step === "mfa-verify" && (
          <>
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-center mb-1 text-foreground">
              Two-Factor Authentication
            </h1>
            <p className="text-center text-muted-foreground mb-6 font-medium text-xs sm:text-sm">
              Enter the 6-digit verification code from your authenticator app.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-xs sm:text-sm font-bold text-center border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyTotp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block text-center">
                  Security Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full h-14 bg-white border-2 border-primary/40 rounded-2xl text-center font-mono text-2xl font-black tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xs"
                  placeholder="000000"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 py-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sign in with another account</span>
              </button>
            </form>

            {/* Account Recovery Guidance */}
            <div className="mt-6 pt-5 border-t border-border/80">
              <button
                type="button"
                onClick={() => setShowRecoveryInfo(!showRecoveryInfo)}
                className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Lost authenticator device?</span>
              </button>

              {showRecoveryInfo && (
                <div className="mt-3 bg-secondary/80 p-3.5 rounded-2xl border border-border text-center text-xs space-y-1.5">
                  <p className="font-bold text-foreground">
                    Lost Authenticator Access
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    Contact the site administrator or refer to your private recovery documentation to reset your authenticator credentials.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
