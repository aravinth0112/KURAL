"use client";

import { useState, useEffect } from "react";
import { Lock, Mail, Key, ShieldAlert } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // CAPTCHA State
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    generateCaptcha();
  }, []);

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Direct to dashboard (MFA removed)
      router.push("/adminnadhan/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-border">
        
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        
        <h1 className="font-heading text-3xl font-extrabold text-center mb-2">
          Secure Portal
        </h1>
        <p className="text-center text-muted-foreground mb-8 font-medium">
          Sign in to manage events and moments.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm font-bold text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Authorized Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white border border-border rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-muted-foreground" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white border border-border rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" /> Security CAPTCHA
            </label>
            <div className="flex gap-3 items-center">
              <div className="h-12 px-4 rounded-xl bg-secondary border border-border flex items-center justify-center font-mono font-bold text-base text-foreground shrink-0 shadow-sm">
                {num1} + {num2} =
              </div>
              <input 
                type="number" 
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="flex-1 h-12 bg-white border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                placeholder="Answer"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !email || !password || !captchaInput}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 mt-4 disabled:opacity-50 text-sm"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
