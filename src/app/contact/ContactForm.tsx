"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [hpWebsite, setHpWebsite] = useState(""); // Honeypot spam trap

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@domain.com).";
    }

    if (!message.trim()) {
      newErrors.message = "Message cannot be empty.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    // Bot detection via honeypot
    if (hpWebsite) {
      setSubmitted(true);
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase.from("contact_messages").insert([
        {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || null,
          message: message.trim(),
        },
      ]);

      if (dbError) {
        console.warn("Notice: contact_messages table logging:", dbError.message);
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setErrors({});
    } catch (err: any) {
      console.error("Submission error:", err);
      setServerError("Unable to send message right now. Please try again or reach out on Instagram / WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-border shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="font-heading text-3xl font-bold mb-3 text-foreground">Send a Message</h2>
        <p className="text-muted-foreground text-sm font-medium mb-8">
          Reach out directly to the Kural coordinator team. We usually respond within 24 hours.
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center my-6">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-green-800 mb-1">Message Sent!</h3>
            <p className="text-sm text-green-700 font-medium mb-4">
              Thank you for reaching out. We have received your message and will get back to you soon.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-green-800 underline hover:no-underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Honeypot field for spam bots - hidden from real visitors */}
            <div className="opacity-0 absolute -z-50 w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true" tabIndex={-1}>
              <label htmlFor="hp_company_url">Do not fill this</label>
              <input
                type="text"
                id="hp_company_url"
                name="hp_company_url"
                value={hpWebsite}
                onChange={(e) => setHpWebsite(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
              />
            </div>

            {serverError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-bold text-foreground block">
                  Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`w-full bg-secondary border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.name ? "border-red-400 bg-red-50/30" : "border-border"
                  }`}
                  placeholder="Your Name"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-bold text-foreground block">
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`w-full bg-secondary border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.email ? "border-red-400 bg-red-50/30" : "border-border"
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-sm font-bold text-foreground block">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="What is this regarding?"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-bold text-foreground block">
                Message <span className="text-primary">*</span>
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                }}
                className={`w-full bg-secondary border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none ${
                  errors.message ? "border-red-400 bg-red-50/30" : "border-border"
                }`}
                placeholder="Write your message here..."
              />
              {errors.message && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <span>Sending Message...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
