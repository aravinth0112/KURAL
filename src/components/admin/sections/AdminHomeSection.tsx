"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, ExternalLink, Save, CheckCircle2, Camera, Crop, RotateCcw, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { compressImage } from "@/utils/compressImage";
import { generateMediaFileName } from "@/utils/cropImage";
import ImageCropModal from "@/components/admin/ImageCropModal";

interface AdminHomeSectionProps {
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AdminHomeSection({ onShowToast }: AdminHomeSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [heroTitle, setHeroTitle] = useState("We're LPU Tamizhans.");
  const [tamilQuote, setTamilQuote] = useState("யாதும் ஊரே! யாவரும் கேளிர்!");
  const [heroText, setHeroText] = useState(
    "The vibrant home of Tamil culture at Lovely Professional University. Connecting Tamil students across campus through cultural celebrations, creative arts, and lifelong friendships."
  );
  const [btnWhatsappText, setBtnWhatsappText] = useState("Join WhatsApp Community");
  const [btnWhatsappLink, setBtnWhatsappLink] = useState("https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe");
  const [btnKuralText, setBtnKuralText] = useState("Learn About Kural");
  const [btnKuralLink, setBtnKuralLink] = useState("/kural");
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [heroLogoFile, setHeroLogoFile] = useState<File | null>(null);
  const [uploadingHeroLogo, setUploadingHeroLogo] = useState(false);

  // Crop Modal State
  const [activeCrop, setActiveCrop] = useState<{
    isOpen: boolean;
    imageSrc: string;
    fileName: string;
    title: string;
    aspectRatio: number;
    aspectLabel?: string;
    showCircleGuide?: boolean;
    maxWidth?: number;
    maxHeight?: number;
  } | null>(null);

  // Moments Showcase block on homepage
  const [homeMomentsTitle, setHomeMomentsTitle] = useState("Recent Moments.");
  const [homeMomentsSubtitle, setHomeMomentsSubtitle] = useState("Memories from our campus celebrations.");

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("id, content");

    if (error) {
      console.error("Failed to load home content:", error.message);
    } else if (data) {
      const getVal = (id: string) => data.find((r) => r.id === id)?.content;

      if (getVal("home_hero_title")) setHeroTitle(getVal("home_hero_title")!);
      if (getVal("about_tamil_quote")) setTamilQuote(getVal("about_tamil_quote")!);
      if (getVal("home_hero_text")) setHeroText(getVal("home_hero_text")!);
      if (getVal("home_btn_whatsapp_text")) setBtnWhatsappText(getVal("home_btn_whatsapp_text")!);
      if (getVal("home_btn_whatsapp_link")) setBtnWhatsappLink(getVal("home_btn_whatsapp_link")!);
      if (getVal("home_btn_kural_text")) setBtnKuralText(getVal("home_btn_kural_text")!);
      if (getVal("home_btn_kural_link")) setBtnKuralLink(getVal("home_btn_kural_link")!);
      
      const loadedLogo = getVal("hero_logo_url") || getVal("home_logo_url");
      if (loadedLogo) setLogoUrl(loadedLogo);

      if (getVal("home_moments_title")) setHomeMomentsTitle(getVal("home_moments_title")!);
      if (getVal("home_moments_subtitle")) setHomeMomentsSubtitle(getVal("home_moments_subtitle")!);
    }
    setLoading(false);
  };

  const handleSelectLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (!chosenFile) return;
    const objectUrl = URL.createObjectURL(chosenFile);
    setActiveCrop({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: chosenFile.name,
      title: "Crop Homepage Hero Emblem",
      aspectRatio: 1,
      aspectLabel: "1:1 Square (Circular Badge)",
      showCircleGuide: true,
      maxWidth: 600,
      maxHeight: 600,
    });
    e.target.value = "";
  };

  const handleRecropLogo = () => {
    const targetUrl = heroLogoFile ? URL.createObjectURL(heroLogoFile) : (logoUrl || "/logo.png");
    setActiveCrop({
      isOpen: true,
      imageSrc: targetUrl,
      fileName: "hero_logo.png",
      title: "Re-crop Homepage Hero Emblem",
      aspectRatio: 1,
      aspectLabel: "1:1 Square (Circular Badge)",
      showCircleGuide: true,
      maxWidth: 600,
      maxHeight: 600,
    });
  };

  const handleResetLogo = () => {
    setHeroLogoFile(null);
    setLogoUrl("/logo.png");
    onShowToast("Hero logo reset to default emblem.", "info");
  };

  const handleCropApply = (croppedFile: File) => {
    setHeroLogoFile(croppedFile);
    setActiveCrop(null);
    onShowToast("Hero emblem cropped & staged. Click Save to publish.", "success");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    let finalLogoUrl = logoUrl;
    if (heroLogoFile) {
      setUploadingHeroLogo(true);
      try {
        const processedFile = await compressImage(heroLogoFile, 600, 600, 0.85);
        const fileName = generateMediaFileName("hero_logo", processedFile);
        const { error: uploadError } = await supabase.storage.from("moments").upload(fileName, processedFile);

        if (uploadError) {
          onShowToast("Hero logo upload failed: " + uploadError.message, "error");
          setSaving(false);
          setUploadingHeroLogo(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage.from("moments").getPublicUrl(fileName);
        finalLogoUrl = publicUrl;
        setLogoUrl(finalLogoUrl);
        setHeroLogoFile(null);
      } catch (err: any) {
        onShowToast("Error processing logo image: " + err.message, "error");
        setSaving(false);
        setUploadingHeroLogo(false);
        return;
      }
      setUploadingHeroLogo(false);
    }

    const payload = [
      { id: "home_hero_title", content: heroTitle.trim(), updated_at: new Date().toISOString() },
      { id: "about_tamil_quote", content: tamilQuote.trim().replace(/^["“']|["”']$/g, ""), updated_at: new Date().toISOString() },
      { id: "home_hero_text", content: heroText.trim(), updated_at: new Date().toISOString() },
      { id: "home_btn_whatsapp_text", content: btnWhatsappText.trim(), updated_at: new Date().toISOString() },
      { id: "home_btn_whatsapp_link", content: btnWhatsappLink.trim(), updated_at: new Date().toISOString() },
      { id: "home_btn_kural_text", content: btnKuralText.trim(), updated_at: new Date().toISOString() },
      { id: "home_btn_kural_link", content: btnKuralLink.trim(), updated_at: new Date().toISOString() },
      { id: "hero_logo_url", content: finalLogoUrl.trim(), updated_at: new Date().toISOString() },
      { id: "home_logo_url", content: finalLogoUrl.trim(), updated_at: new Date().toISOString() },
      { id: "home_moments_title", content: homeMomentsTitle.trim(), updated_at: new Date().toISOString() },
      { id: "home_moments_subtitle", content: homeMomentsSubtitle.trim(), updated_at: new Date().toISOString() },
    ];

    const { error } = await supabase.from("site_content").upsert(payload, { onConflict: "id" });

    if (error) {
      onShowToast("Failed to save homepage: " + error.message, "error");
    } else {
      onShowToast("Homepage settings and hero emblem saved successfully!", "success");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-12 border border-border text-center text-muted-foreground font-medium">
        Loading Homepage configuration...
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
              <Home className="w-4 h-4" />
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Homepage Configuration
            </h2>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
            Edit main headline, Tamil motto, hero narrative, action buttons, and moments showcase header on{" "}
            <Link href="/" target="_blank" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
              / ↗
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
          <span>{saving ? "Saving..." : "Save Homepage"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 flex-1 flex flex-col">
        {/* Section 01: Hero Headline & Branding */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">01</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Hero Headline &amp; Motto</h3>
              <p className="text-xs text-muted-foreground">Main visual text displayed at the top of the homepage.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Hero Headline Title</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="We're LPU Tamizhans."
                required
              />
              <p className="text-[11px] text-muted-foreground">The words "LPU Tamizhans." will automatically highlight in brand orange.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Tamil Motto Quote</label>
              <input
                type="text"
                value={tamilQuote}
                onChange={(e) => setTamilQuote(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-brand-orange focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="யாதும் ஊரே! யாவரும் கேளிர்!"
                required
              />
              <p className="text-[11px] text-muted-foreground">Shown with quotation marks under the main title.</p>
            </div>
          </div>

          {/* Hero Logo Emblem Upload & Crop */}
          <div className="pt-4 border-t border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 shadow-md ring-4 ring-primary/20 bg-white flex items-center justify-center relative">
                  <Image
                    src={heroLogoFile ? URL.createObjectURL(heroLogoFile) : (logoUrl || "/logo.png")}
                    alt="Homepage Emblem Preview"
                    width={80}
                    height={80}
                    unoptimized
                    className="w-full h-full object-contain p-2"
                  />
                  {uploadingHeroLogo && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                      Uploading...
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-foreground">Hero Badge Emblem / Logo</h4>
                    {heroLogoFile && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                        Unsaved Selection
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Displayed in the circular hero badge on the homepage. Cropped to 1:1 square with circular guide.
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-1 truncate max-w-xs">
                    {heroLogoFile ? `Staged: ${heroLogoFile.name}` : `Active: ${logoUrl}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRecropLogo}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary text-foreground font-bold text-xs border border-border transition-colors shadow-2xs cursor-pointer"
                  title="Re-crop current emblem"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Re-crop</span>
                </button>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary text-foreground font-bold text-xs border border-border transition-colors shadow-2xs">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelectLogo}
                  />
                </label>

                {(heroLogoFile || (logoUrl && logoUrl !== "/logo.png")) && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-red-500 bg-secondary hover:bg-red-50 transition-colors border border-border cursor-pointer shadow-2xs"
                    title="Reset to default official emblem"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 02: Hero Mission Narrative */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">02</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Hero Description Narrative</h3>
              <p className="text-xs text-muted-foreground">The lead introductory paragraph beneath the headline.</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">Description Text</label>
            <textarea
              value={heroText}
              onChange={(e) => setHeroText(e.target.value)}
              className="w-full min-h-[100px] bg-white border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y text-sm font-medium leading-relaxed"
              placeholder="The vibrant home of Tamil culture at Lovely Professional University..."
              required
            />
          </div>
        </div>

        {/* Section 03: Action Buttons */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">03</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Hero Action Buttons</h3>
              <p className="text-xs text-muted-foreground">Configure labels and destination URLs for both call-to-action buttons.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Button */}
            <div className="bg-white p-4 rounded-2xl border border-border space-y-3">
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Button 1 (Primary Orange)</span>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Button Text</label>
                <input
                  type="text"
                  value={btnWhatsappText}
                  onChange={(e) => setBtnWhatsappText(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Join WhatsApp Community"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Destination URL / Link</label>
                <input
                  type="text"
                  value={btnWhatsappLink}
                  onChange={(e) => setBtnWhatsappLink(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="https://chat.whatsapp.com/..."
                  required
                />
              </div>
            </div>

            {/* Secondary Button */}
            <div className="bg-white p-4 rounded-2xl border border-border space-y-3">
              <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">Button 2 (Outlined Dark)</span>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Button Text</label>
                <input
                  type="text"
                  value={btnKuralText}
                  onChange={(e) => setBtnKuralText(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Learn About Kural"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Destination URL / Link</label>
                <input
                  type="text"
                  value={btnKuralLink}
                  onChange={(e) => setBtnKuralLink(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="/kural"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 04: Homepage Moments Preview Block */}
        <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">04</span>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Moments Showcase Section</h3>
              <p className="text-xs text-muted-foreground">Heading and subtitle for the featured celebrations block on the homepage.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Section Title</label>
              <input
                type="text"
                value={homeMomentsTitle}
                onChange={(e) => setHomeMomentsTitle(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Recent Moments."
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Section Subtitle</label>
              <input
                type="text"
                value={homeMomentsSubtitle}
                onChange={(e) => setHomeMomentsSubtitle(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Memories from our campus celebrations."
                required
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4 border-t border-border mt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Homepage"}</span>
          </button>
        </div>
      </form>

      {/* Hero Logo Crop Modal */}
      {activeCrop && activeCrop.isOpen && (
        <ImageCropModal
          isOpen={activeCrop.isOpen}
          imageSrc={activeCrop.imageSrc}
          fileName={activeCrop.fileName}
          title={activeCrop.title}
          aspectRatio={activeCrop.aspectRatio}
          aspectLabel={activeCrop.aspectLabel}
          showCircleGuide={activeCrop.showCircleGuide}
          maxWidth={activeCrop.maxWidth}
          maxHeight={activeCrop.maxHeight}
          onCancel={() => setActiveCrop(null)}
          onApply={handleCropApply}
        />
      )}
    </div>
  );
}
