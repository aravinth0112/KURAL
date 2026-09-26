"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageSquare, Save, ExternalLink, Globe } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AdminContactSectionProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function AdminContactSection({ onShowToast }: AdminContactSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("Get in Touch.");
  const [subtitle, setSubtitle] = useState(
    "Have a question, want to collaborate, or looking to join the Kural core team? We'd love to hear from you."
  );
  const [email, setEmail] = useState("contact.kurallpu@gmail.com");
  const [phone, setPhone] = useState("+91 93603 64837");
  const [whatsappLink, setWhatsappLink] = useState("https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe");
  const [address, setAddress] = useState("Lovely Professional University\nPhagwara, Punjab, India");
  const [instagramLink, setInstagramLink] = useState("https://www.instagram.com/lpu.tamizhans?stkn=MXV5NWlyMG5kb2o4ag==");

  useEffect(() => {
    fetchContactContent();
  }, []);

  const fetchContactContent = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("site_content").select("id, content");

    if (error) {
      console.error("Failed to load contact configuration:", error.message);
    } else if (data) {
      const getVal = (id: string) => data.find((r) => r.id === id)?.content;

      if (getVal("contact_title")) setTitle(getVal("contact_title")!);
      if (getVal("contact_subtitle")) setSubtitle(getVal("contact_subtitle")!);
      if (getVal("contact_email")) setEmail(getVal("contact_email")!);
      if (getVal("contact_phone")) setPhone(getVal("contact_phone")!);
      if (getVal("contact_whatsapp_link")) setWhatsappLink(getVal("contact_whatsapp_link")!);
      if (getVal("contact_address")) setAddress(getVal("contact_address")!);
      if (getVal("contact_instagram_link")) setInstagramLink(getVal("contact_instagram_link")!);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = [
      { id: "contact_title", content: title.trim(), updated_at: new Date().toISOString() },
      { id: "contact_subtitle", content: subtitle.trim(), updated_at: new Date().toISOString() },
      { id: "contact_email", content: email.trim(), updated_at: new Date().toISOString() },
      { id: "contact_phone", content: phone.trim(), updated_at: new Date().toISOString() },
      { id: "contact_whatsapp_link", content: whatsappLink.trim(), updated_at: new Date().toISOString() },
      { id: "contact_address", content: address.trim(), updated_at: new Date().toISOString() },
      { id: "contact_instagram_link", content: instagramLink.trim(), updated_at: new Date().toISOString() },
    ];

    const { error } = await supabase.from("site_content").upsert(payload, { onConflict: "id" });

    if (error) {
      onShowToast("Failed to save contact settings: " + error.message, "error");
    } else {
      onShowToast("Contact settings saved successfully!", "success");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-12 border border-border text-center text-muted-foreground font-medium">
        Loading Contact configuration...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col min-h-[500px]">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Get in Touch (Contact Page)
            </h2>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
            Configure direct contact channels, official phone, email, WhatsApp link, and campus address on{" "}
            <Link href="/contact" target="_blank" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
              /contact ↗
            </Link>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Contact Settings"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 flex-1 flex flex-col">
        {/* Section 01: Page Header */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">01</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Contact Page Headline</h3>
              <p className="text-xs text-muted-foreground">Title and introductory narrative shown at the top of /contact.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Get in Touch."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Introductory Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Have a question, want to collaborate..."
                required
              />
            </div>
          </div>
        </div>

        {/* Section 02: Direct Contact Channels */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">02</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Direct Communication Channels</h3>
              <p className="text-xs text-muted-foreground">Phone, email, and community messaging links.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> Official Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+91 93603 64837"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Official Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="contact.kurallpu@gmail.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Community Link
              </label>
              <input
                type="url"
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://chat.whatsapp.com/..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-pink-600" /> Instagram Profile Link
              </label>
              <input
                type="url"
                value={instagramLink}
                onChange={(e) => setInstagramLink(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://www.instagram.com/..."
                required
              />
            </div>
          </div>
        </div>

        {/* Section 03: Campus Location & Physical Address */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">03</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Campus Address &amp; Location</h3>
              <p className="text-xs text-muted-foreground">Physical mailing/meeting location shown next to the interactive map.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Physical Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              placeholder="Lovely Professional University&#10;Phagwara, Punjab, India"
              required
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-4 border-t border-border mt-auto">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Contact Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
