"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

const LPU_SCHOOLS = [
  "School of Computer Science & Engineering (CSE)",
  "School of Electronics & Electrical Engineering (EEE)",
  "School of Mechanical Engineering",
  "School of Civil Engineering",
  "Mittal School of Business (Management / Commerce)",
  "School of Computer Applications & IT (BCA / MCA)",
  "School of Pharmaceutical Sciences",
  "School of Bioengineering & Biosciences",
  "School of Agriculture",
  "School of Law",
  "School of Design & Fashion",
  "School of Hotel Management & Tourism",
  "School of Journalism, Film & Creative Arts",
  "School of Polytechnic",
  "Other School / Faculty",
];

const BATCH_YEARS = [
  "Batch 2021 - 2025",
  "Batch 2022 - 2026",
  "Batch 2023 - 2027",
  "Batch 2024 - 2028",
  "Batch 2025 - 2029",
  "Postgraduate / Master's Program",
  "Other / Diploma",
];

export default function JoinTeamForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [customDept, setCustomDept] = useState("");
  const [batch, setBatch] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [hpHidden, setHpHidden] = useState(""); // Honeypot spam trap

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!privacyConsent) {
      setError("Please agree to the Privacy Policy to submit your application.");
      setLoading(false);
      return;
    }

    if (hpHidden) {
      setSubmitted(true);
      setLoading(false);
      return;
    }

    const resolvedDept = department === "Other School / Faculty" 
      ? (customDept.trim() || "Other School / Faculty")
      : department.trim();

    try {
      const res = await fetch("/api/team/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          department: resolvedDept,
          batch: batch.trim(),
          interest: interest,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Something went wrong. Please check your details and try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Team application submit error:", err);
      setError("Network error. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-primary/5 rounded-3xl border border-primary/20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-heading text-2xl font-extrabold text-foreground mb-2">
          Application Received!
        </h3>
        <p className="text-muted-foreground font-medium max-w-md leading-relaxed mb-3">
          Thank you, <span className="font-bold text-foreground">{name}</span>! We have sent a confirmation email with your application details to <span className="font-bold text-foreground">{email}</span>.
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">
          Our core committee will review your submission and connect with you on WhatsApp or Email soon.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setPhone("");
            setDepartment("");
            setCustomDept("");
            setBatch("");
            setInterest("");
            setMessage("");
            setPrivacyConsent(false);
          }}
          className="text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          Submit another application →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot field for spam bots */}
      <div className="opacity-0 absolute -z-50 w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true" tabIndex={-1}>
        <label htmlFor="team_lead_hp">Leave empty</label>
        <input
          type="text"
          id="team_lead_hp"
          name="team_lead_hp"
          value={hpHidden}
          onChange={(e) => setHpHidden(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full h-11 sm:h-12 bg-secondary border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full h-11 sm:h-12 bg-secondary border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9XXXXXXXXX"
            className="w-full h-11 sm:h-12 bg-secondary border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          />
        </div>

        {/* Department / School Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground">
            LPU School / Faculty *
          </label>
          <select
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full h-11 sm:h-12 bg-secondary border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer"
          >
            <option value="">Select your School / Department</option>
            {LPU_SCHOOLS.map((school) => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
          {department === "Other School / Faculty" && (
            <input
              type="text"
              required
              value={customDept}
              onChange={(e) => setCustomDept(e.target.value)}
              placeholder="Specify your faculty or school..."
              className="w-full h-11 sm:h-12 bg-secondary border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all mt-1.5"
            />
          )}
        </div>

        {/* Batch / Year Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground">
            Batch / Graduation Year *
          </label>
          <select
            required
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="w-full h-11 sm:h-12 bg-secondary border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer"
          >
            <option value="">Select your Batch / Year</option>
            {BATCH_YEARS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Area of Interest Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground">
            Area of Interest *
          </label>
          <select
            required
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="w-full h-11 sm:h-12 bg-secondary border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer"
          >
            <option value="">Select an area</option>
            <option value="Event Planning">Event Planning &amp; Coordination</option>
            <option value="Creative and Design">Creative &amp; Design</option>
            <option value="Photography and Videography">Photography &amp; Videography</option>
            <option value="Social Media and Content">Social Media &amp; Content</option>
            <option value="Music and Performances">Music &amp; Live Performances</option>
            <option value="Public Relations">Public Relations &amp; Outreach</option>
            <option value="Web and Tech">Web &amp; Technical Operations</option>
            <option value="Leadership and Management">Leadership &amp; Operations</option>
            <option value="General Volunteering">General Volunteering</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
          Why do you want to join? (Optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Tell us about yourself and why you would love to be part of the Kural team..."
          className="w-full min-h-[100px] bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-y"
        />
      </div>

      {/* Privacy Policy Consent Checkbox */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="privacy_consent"
          required
          checked={privacyConsent}
          onChange={(e) => setPrivacyConsent(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary accent-[#f07f19] cursor-pointer shrink-0"
        />
        <label htmlFor="privacy_consent" className="text-xs text-muted-foreground select-none cursor-pointer leading-relaxed">
          I agree to the{" "}
          <Link href="/privacy" target="_blank" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
            Privacy Policy
          </Link>{" "}
          and consent to Kural &amp; LPU Tamizhans contacting me regarding this application.
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-8 h-12 min-h-[46px] rounded-full shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Application
          </>
        )}
      </button>
    </form>
  );
}