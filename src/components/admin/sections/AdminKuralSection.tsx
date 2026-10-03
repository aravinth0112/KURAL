"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, Camera, Crop, Plus, Trash2, Pencil, ArrowUp, ArrowDown, X, 
  AlertCircle, Save, CalendarDays, Palette, Users2, Award, Heart, 
  Megaphone, Music, Target, Compass, Sparkles, Eye, EyeOff, ExternalLink, ArrowRight
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { compressImage } from "@/utils/compressImage";
import { generateMediaFileName } from "@/utils/cropImage";
import ImageCropModal from "@/components/admin/ImageCropModal";

interface AdminKuralSectionProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export interface KuralCardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const AVAILABLE_KURAL_ICONS = [
  { name: "CalendarDays", label: "Festivals / Events", icon: CalendarDays },
  { name: "Palette", label: "Arts / Creativity", icon: Palette },
  { name: "Users2", label: "Community / Network", icon: Users2 },
  { name: "Award", label: "Leadership / Growth", icon: Award },
  { name: "Heart", label: "Support / Welfare", icon: Heart },
  { name: "Megaphone", label: "Advocacy / Voices", icon: Megaphone },
  { name: "Music", label: "Music & Performing Arts", icon: Music },
  { name: "Camera", label: "Media & Photography", icon: Camera },
  { name: "Target", label: "Mission & Purpose", icon: Target },
  { name: "Compass", label: "Guidance & Orientation", icon: Compass },
  { name: "Sparkles", label: "Cultural Heritage", icon: Sparkles },
];

function getCardIcon(iconName: string) {
  const item = AVAILABLE_KURAL_ICONS.find((i) => i.name === iconName);
  const IconComponent = item ? item.icon : Sparkles;
  return <IconComponent className="w-5 h-5 text-primary" />;
}

const KNOWN_SITE_ROUTES = [
  { path: "/join", label: "Join Us Community Page" },
  { path: "/gallery", label: "Moments & Archive Gallery" },
  { path: "/team", label: "Team Members Directory" },
  { path: "/team#join", label: "Apply for Core Team Form" },
  { path: "/kural", label: "Kural Club Identity Page" },
  { path: "/contact", label: "Contact Us & Inquiries" },
];

export default function AdminKuralSection({ onShowToast }: AdminKuralSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kuralPreviewMode, setKuralPreviewMode] = useState(false);

  // Kural Page State
  const [kuralTitle, setKuralTitle] = useState("Kural LPU");
  const [kuralTamilMotto, setKuralTamilMotto] = useState("யாதும் ஊரே யாவரும் கேளிர்");
  const [kuralMottoTranslit, setKuralMottoTranslit] = useState("“To us all towns are one, all men our kin”");
  const [kuralRelHeading, setKuralRelHeading] = useState("Community vs. Organization: What Kural Is");
  const [kuralRelCommunity, setKuralRelCommunity] = useState("LPU Tamizhans is our student community — connecting every Tamil student across Lovely Professional University in Punjab.");
  const [kuralRelOrg, setKuralRelOrg] = useState("Kural is the student organization and club that runs it — planning events, leading cultural initiatives, managing operations, and bringing students together.");
  const [kuralRelTagline, setKuralRelTagline] = useState("Thousands of miles from home, Kural ensures that Tamil culture, language, and friendship thrive on the LPU campus.");

  // Emblem / Logo
  const [kuralLogoUrl, setKuralLogoUrl] = useState("/kural-logo.png");
  const [kuralLogoFile, setKuralLogoFile] = useState<File | null>(null);
  const [uploadingKuralLogo, setUploadingKuralLogo] = useState(false);

  // 21:9 Featured Showcase Banner
  const [kuralImageUrl, setKuralImageUrl] = useState("");
  const [kuralImageFile, setKuralImageFile] = useState<File | null>(null);
  const [uploadingKuralImage, setUploadingKuralImage] = useState(false);

  // Vision & Mission
  const [kuralVisionTitle, setKuralVisionTitle] = useState("A Thriving Tamil Cultural Home at LPU");
  const [kuralVisionText, setKuralVisionText] = useState("To build a vibrant, inclusive, and closely-knit student community at Lovely Professional University where Tamil traditions, language, and heritage are proudly celebrated, shared, and passed forward.");
  const [kuralMissionTitle, setKuralMissionTitle] = useState("Connecting, Empowering & Celebrating");
  const [kuralMissionText, setKuralMissionText] = useState("To bring students together through vibrant cultural festivals, creative activities, and shared experiences — giving every Tamil student at LPU an empowering platform to express talent, build lifelong friendships, and lead.");

  // What We Do Cards
  const [kuralWhatWeDo, setKuralWhatWeDo] = useState<KuralCardItem[]>([
    {
      id: "1",
      title: "Cultural Celebrations & Festivals",
      description: "Organizing grand traditional festivals like Pongal Vizha, Tamil New Year, traditional arts, and music nights at LPU Punjab.",
      icon: "CalendarDays",
    },
    {
      id: "2",
      title: "Student Activities & Talent Platforms",
      description: "Providing opportunities for Tamil students to showcase skills in music, dance, public speaking, drama, photography, and creative arts.",
      icon: "Palette",
    },
    {
      id: "3",
      title: "Community Building & Campus Support",
      description: "Creating a welcoming home away from home in Phagwara, helping freshers settle in, and connecting Tamil students across departments.",
      icon: "Users2",
    },
    {
      id: "4",
      title: "Leadership & Growth Initiatives",
      description: "Empowering members with real-world experience in event planning, public relations, technical production, and student leadership.",
      icon: "Award",
    },
  ]);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [cardIcon, setCardIcon] = useState("CalendarDays");

  // CTA Section
  const [kuralCtaBadge, setKuralCtaBadge] = useState("Get Involved");
  const [kuralCtaTitle, setKuralCtaTitle] = useState("“Join for the community. Stay for the growth. Leave a legacy.”");
  const [kuralCtaDesc, setKuralCtaDesc] = useState("Whether you want to perform on stage, help coordinate celebrations, develop your leadership skills, or simply meet fellow Tamil students at LPU — Kural welcomes you with open arms.");
  const [kuralCtaBtnText, setKuralCtaBtnText] = useState("Join Kural & LPU Tamizhans");
  const [kuralCtaBtnLink, setKuralCtaBtnLink] = useState("/join");
  const [kuralCtaSecondaryText, setKuralCtaSecondaryText] = useState("Explore Moments & Events");
  const [kuralCtaSecondaryLink, setKuralCtaSecondaryLink] = useState("/gallery");

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
    field: "kural_logo" | "kural_image";
  } | null>(null);

  useEffect(() => {
    fetchKuralContent();
  }, []);

  const fetchKuralContent = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("site_content").select("id, content");

    if (error) {
      console.error("Failed to load Kural content:", error.message);
    } else if (data) {
      const getVal = (key: string) => data.find((r) => r.id === `kural_${key}`)?.content || "";

      const kLogo = getVal("logo_url");
      if (kLogo) setKuralLogoUrl(kLogo);

      const kTitle = getVal("title");
      if (kTitle) setKuralTitle(kTitle);

      const kMotto = getVal("tamil_motto");
      if (kMotto) setKuralTamilMotto(kMotto);

      const kTranslit = getVal("motto_translit");
      if (kTranslit) {
        const cleaned = kTranslit.replace(/^yaadhum\s+oore\s+yav[a|a]rum\s+kelir\s*[•\-–—]?\s*/i, "").trim();
        setKuralMottoTranslit(cleaned || "“To us all towns are one, all men our kin”");
      }

      const kRelH = getVal("rel_heading");
      if (kRelH) setKuralRelHeading(kRelH);

      const kRelC = getVal("rel_community");
      if (kRelC) setKuralRelCommunity(kRelC);

      const kRelO = getVal("rel_org");
      if (kRelO) setKuralRelOrg(kRelO);

      const kRelT = getVal("rel_tagline");
      if (kRelT) setKuralRelTagline(kRelT);

      const kImg = getVal("image_url");
      if (kImg) setKuralImageUrl(kImg);

      const kVisT = getVal("vision_title");
      if (kVisT) setKuralVisionTitle(kVisT);

      const kVisM = getVal("vision_text");
      if (kVisM) setKuralVisionText(kVisM);

      const kMisT = getVal("mission_title");
      if (kMisT) setKuralMissionTitle(kMisT);

      const kMisM = getVal("mission_text");
      if (kMisM) setKuralMissionText(kMisM);

      const kWwd = getVal("what_we_do");
      if (kWwd) {
        try {
          const parsed = JSON.parse(kWwd);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setKuralWhatWeDo(parsed);
          }
        } catch (e) {
          console.error("Failed to parse kural_what_we_do", e);
        }
      }

      const kCtaB = getVal("cta_badge");
      if (kCtaB) setKuralCtaBadge(kCtaB);

      const kCtaT = getVal("cta_title");
      if (kCtaT) setKuralCtaTitle(kCtaT);

      const kCtaD = getVal("cta_desc");
      if (kCtaD) setKuralCtaDesc(kCtaD);

      const kCtaBt = getVal("cta_btn_text");
      if (kCtaBt) setKuralCtaBtnText(kCtaBt);

      const kCtaBl = getVal("cta_btn_link");
      if (kCtaBl) setKuralCtaBtnLink(kCtaBl);

      const kCtaSt = getVal("cta_secondary_text");
      if (kCtaSt) setKuralCtaSecondaryText(kCtaSt);

      const kCtaSl = getVal("cta_secondary_link");
      if (kCtaSl) setKuralCtaSecondaryLink(kCtaSl);
    }
    setLoading(false);
  };

  // Logo handlers
  const handleSelectLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (!chosenFile) return;
    const objectUrl = URL.createObjectURL(chosenFile);
    setActiveCrop({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: chosenFile.name,
      title: "Crop Kural Emblem / Logo",
      aspectRatio: 1,
      aspectLabel: "1:1 Square",
      showCircleGuide: true,
      maxWidth: 600,
      maxHeight: 600,
      field: "kural_logo",
    });
    e.target.value = "";
  };

  const handleRecropLogo = () => {
    const targetUrl = kuralLogoFile ? URL.createObjectURL(kuralLogoFile) : (kuralLogoUrl || "/kural-logo.png");
    setActiveCrop({
      isOpen: true,
      imageSrc: targetUrl,
      fileName: "kural_logo.jpg",
      title: "Re-crop Kural Logo",
      aspectRatio: 1,
      aspectLabel: "1:1 Square",
      showCircleGuide: true,
      maxWidth: 600,
      maxHeight: 600,
      field: "kural_logo",
    });
  };

  // 21:9 Banner image handlers
  const handleSelectBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (!chosenFile) return;
    const objectUrl = URL.createObjectURL(chosenFile);
    setActiveCrop({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: chosenFile.name,
      title: "Crop Kural Showcase Banner",
      aspectRatio: 21 / 9,
      aspectLabel: "21:9 Ultra-Wide Banner",
      maxWidth: 1920,
      maxHeight: 1080,
      field: "kural_image",
    });
    e.target.value = "";
  };

  const handleRecropBanner = () => {
    const targetUrl = kuralImageFile ? URL.createObjectURL(kuralImageFile) : kuralImageUrl;
    if (!targetUrl) return;
    setActiveCrop({
      isOpen: true,
      imageSrc: targetUrl,
      fileName: "kural_showcase.jpg",
      title: "Re-crop Kural Showcase Banner",
      aspectRatio: 21 / 9,
      aspectLabel: "21:9 Ultra-Wide Banner",
      maxWidth: 1920,
      maxHeight: 1080,
      field: "kural_image",
    });
  };

  const handleRemoveBanner = () => {
    if (!confirm("Remove the featured banner image?")) return;
    setKuralImageUrl("");
    setKuralImageFile(null);
  };

  const handleCropApply = (croppedFile: File) => {
    if (!activeCrop) return;
    if (activeCrop.field === "kural_logo") {
      setKuralLogoFile(croppedFile);
      onShowToast("Logo cropped & staged.", "success");
    } else if (activeCrop.field === "kural_image") {
      setKuralImageFile(croppedFile);
      onShowToast("Showcase banner cropped & staged.", "success");
    }
    setActiveCrop(null);
  };

  // Card Operations
  const handleOpenAddCard = () => {
    setEditingCardId(null);
    setCardTitle("");
    setCardDescription("");
    setCardIcon("CalendarDays");
    setIsAddingCard(true);
  };

  const handleOpenEditCard = (card: KuralCardItem) => {
    setEditingCardId(card.id);
    setCardTitle(card.title);
    setCardDescription(card.description);
    setCardIcon(card.icon || "CalendarDays");
    setIsAddingCard(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim()) {
      onShowToast("Please enter a card title.", "error");
      return;
    }

    if (editingCardId) {
      setKuralWhatWeDo((prev) =>
        prev.map((c) =>
          c.id === editingCardId
            ? { ...c, title: cardTitle.trim(), description: cardDescription.trim(), icon: cardIcon }
            : c
        )
      );
      onShowToast("Card updated in list.", "info");
    } else {
      const newCard: KuralCardItem = {
        id: Date.now().toString(),
        title: cardTitle.trim(),
        description: cardDescription.trim(),
        icon: cardIcon,
      };
      setKuralWhatWeDo((prev) => [...prev, newCard]);
      onShowToast("Card added to list.", "info");
    }

    setIsAddingCard(false);
    setEditingCardId(null);
    setCardTitle("");
    setCardDescription("");
  };

  const handleDeleteCard = (id: string) => {
    if (!confirm("Are you sure you want to remove this card?")) return;
    setKuralWhatWeDo((prev) => prev.filter((c) => c.id !== id));
    onShowToast("Card removed.", "info");
  };

  const handleMoveCard = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= kuralWhatWeDo.length) return;
    const newArr = [...kuralWhatWeDo];
    const [moved] = newArr.splice(index, 1);
    newArr.splice(targetIdx, 0, moved);
    setKuralWhatWeDo(newArr);
  };

  // Main Save
  const handleSaveKural = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    try {
      let finalLogoUrl = kuralLogoUrl;
      if (kuralLogoFile) {
        setUploadingKuralLogo(true);
        const processedFile = await compressImage(kuralLogoFile, 600, 600, 0.85);
        const fileName = generateMediaFileName("kural_logo", processedFile);
        const { error: uploadError } = await supabase.storage.from("moments").upload(fileName, processedFile);

        if (uploadError) {
          onShowToast("Logo upload failed: " + uploadError.message, "error");
          setSaving(false);
          setUploadingKuralLogo(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from("moments").getPublicUrl(fileName);
        finalLogoUrl = publicUrl;
        setKuralLogoUrl(finalLogoUrl);
        setKuralLogoFile(null);
        setUploadingKuralLogo(false);
      }

      let finalImageUrl = kuralImageUrl;
      if (kuralImageFile) {
        setUploadingKuralImage(true);
        const processedFile = await compressImage(kuralImageFile, 1920, 1080, 0.82);
        const fileName = generateMediaFileName("kural", processedFile);
        const { error: uploadError } = await supabase.storage.from("moments").upload(fileName, processedFile);

        if (uploadError) {
          onShowToast("Image upload failed: " + uploadError.message, "error");
          setSaving(false);
          setUploadingKuralImage(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from("moments").getPublicUrl(fileName);
        finalImageUrl = publicUrl;
        setKuralImageUrl(finalImageUrl);
        setKuralImageFile(null);
        setUploadingKuralImage(false);
      }

      const livePayload = [
        { id: "kural_logo_url", content: finalLogoUrl },
        { id: "kural_title", content: kuralTitle.trim() },
        { id: "kural_tamil_motto", content: kuralTamilMotto.trim() },
        { id: "kural_motto_translit", content: kuralMottoTranslit.trim() },
        { id: "kural_rel_heading", content: kuralRelHeading.trim() },
        { id: "kural_rel_community", content: kuralRelCommunity.trim() },
        { id: "kural_rel_org", content: kuralRelOrg.trim() },
        { id: "kural_rel_tagline", content: kuralRelTagline.trim() },
        { id: "kural_image_url", content: finalImageUrl.trim() },
        { id: "kural_vision_title", content: kuralVisionTitle.trim() },
        { id: "kural_vision_text", content: kuralVisionText.trim() },
        { id: "kural_mission_title", content: kuralMissionTitle.trim() },
        { id: "kural_mission_text", content: kuralMissionText.trim() },
        { id: "kural_what_we_do", content: JSON.stringify(kuralWhatWeDo) },
        { id: "kural_cta_badge", content: kuralCtaBadge.trim() },
        { id: "kural_cta_title", content: kuralCtaTitle.trim() },
        { id: "kural_cta_desc", content: kuralCtaDesc.trim() },
        { id: "kural_cta_btn_text", content: kuralCtaBtnText.trim() },
        { id: "kural_cta_btn_link", content: kuralCtaBtnLink.trim() },
        { id: "kural_cta_secondary_text", content: kuralCtaSecondaryText.trim() },
        { id: "kural_cta_secondary_link", content: kuralCtaSecondaryLink.trim() },
      ];

      const { error } = await supabase.from("site_content").upsert(livePayload, { onConflict: "id" });
      if (error) {
        onShowToast("Error saving Kural page: " + error.message, "error");
      } else {
        onShowToast("🎉 Kural Page Published Successfully!", "success");
      }
    } catch (err: any) {
      onShowToast("Error saving Kural content: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-12 border border-border text-center text-muted-foreground font-medium">
        Loading Kural configuration...
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col min-h-[500px]">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                Kural Management
              </h2>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
              Manage logo, identity, 21:9 showcase banner, vision/mission, cards, and CTA on{" "}
              <Link href="/kural" target="_blank" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
                /kural ↗
              </Link>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Live Preview Toggle Button */}
            <button
              type="button"
              onClick={() => setKuralPreviewMode(!kuralPreviewMode)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 border cursor-pointer ${
                kuralPreviewMode
                  ? "bg-amber-500/10 text-amber-800 border-amber-300 shadow-xs"
                  : "bg-secondary text-foreground hover:bg-secondary/80 border-border"
              }`}
              title="Toggle Live In-Page Preview of the Kural page"
            >
              {kuralPreviewMode ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-primary" />}
              <span>{kuralPreviewMode ? "Hide Preview" : "Live Preview"}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  kuralPreviewMode ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {kuralPreviewMode ? "ON" : "OFF"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSaveKural}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-xs sm:text-sm transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Kural Page"}</span>
            </button>
          </div>
        </div>

        {/* LIVE PREVIEW PANEL (WHEN PREVIEW MODE IS ACTIVE) */}
        {kuralPreviewMode && (
          <div className="mb-10 rounded-3xl border-2 border-amber-400/80 bg-white shadow-xl overflow-hidden">
            {/* Browser Window Mock Chrome */}
            <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 px-4 py-3 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="px-3 py-1 rounded-lg bg-white border border-amber-200 text-xs font-mono text-muted-foreground flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">🔒</span>
                  <span>https://lputamizhans.com/kural</span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE PREVIEW • UNSAVED DRAFT
                </span>
                <Link
                  href="/kural"
                  target="_blank"
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Published Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Live-Rendered Viewport Frame */}
            <div className="p-6 sm:p-10 bg-[#FAFAFA] space-y-12 max-h-[800px] overflow-y-auto">
              {/* 1. KURAL — WHAT IT IS */}
              <section className="text-center max-w-3xl mx-auto">
                {/* Official Kural Logo */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-2xl ring-4 ring-primary/25 bg-white transition-all duration-300">
                    <img
                      src={kuralLogoFile ? URL.createObjectURL(kuralLogoFile) : (kuralLogoUrl || "/kural-logo.png")}
                      alt="Kural Official Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Title with Accent Color on Last Word */}
                {(() => {
                  const words = (kuralTitle || "Kural LPU").trim().split(" ");
                  const prefix = words.length > 1 ? words.slice(0, -1).join(" ") : "";
                  const accent = words[words.length - 1] || "";
                  return (
                    <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black mb-3 text-foreground tracking-tight">
                      {prefix ? `${prefix} ` : ""}<span className="text-primary">{accent}</span>
                    </h1>
                  );
                })()}

                <p className="font-heading text-xl sm:text-2xl font-bold text-primary mb-1">
                  {kuralTamilMotto || "யாதும் ஊரே யாவரும் கேளிர்"}
                </p>
                <p className="text-muted-foreground font-semibold text-xs sm:text-sm tracking-wider mb-6 italic">
                  {kuralMottoTranslit || "“To us all towns are one, all men our kin”"}
                </p>

                {/* Community Information Strip */}
                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8 py-3.5 px-4 bg-white rounded-2xl border border-border text-center shadow-xs">
                  <div>
                    <p className="font-heading text-xs sm:text-sm font-extrabold text-primary">Tamil Community</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Student Organization</p>
                  </div>
                  <div className="border-x border-border/80">
                    <p className="font-heading text-xs sm:text-sm font-extrabold text-foreground">LPU Campus</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">University Club</p>
                  </div>
                  <div>
                    <p className="font-heading text-xs sm:text-sm font-extrabold text-primary">Punjab, India</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phagwara</p>
                  </div>
                </div>

                {/* Optional Featured Showcase Image */}
                {(kuralImageFile || kuralImageUrl) && (
                  <div className="mb-8 rounded-3xl overflow-hidden border border-border shadow-md bg-secondary aspect-[16/9] sm:aspect-[21/9] relative">
                    <img
                      src={kuralImageFile ? URL.createObjectURL(kuralImageFile) : kuralImageUrl}
                      alt={kuralTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Relationship Distinction Card */}
                <div className="bg-white border-2 border-primary/20 rounded-3xl p-6 sm:p-8 text-left shadow-xs mb-6">
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                    {kuralRelHeading}
                  </h2>
                  <div className="space-y-3 text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
                    <p>{kuralRelCommunity}</p>
                    <p>{kuralRelOrg}</p>
                    {kuralRelTagline && (
                      <p className="text-xs sm:text-sm text-muted-foreground pt-1 border-t border-border">
                        {kuralRelTagline}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. VISION & MISSION */}
              <section>
                <div className="text-center mb-6">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-primary uppercase">
                    Purpose &amp; Direction
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                    Vision &amp; Mission
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <div className="bg-white border border-border p-6 rounded-3xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold tracking-widest text-primary uppercase block mb-1">
                        Our Vision
                      </span>
                      <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                        {kuralVisionTitle}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-medium">
                        {kuralVisionText}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-border p-6 rounded-3xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold tracking-widest text-primary uppercase block mb-1">
                        Our Mission
                      </span>
                      <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                        {kuralMissionTitle}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-medium">
                        {kuralMissionText}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. WHAT WE DO */}
              <section>
                <div className="text-center mb-6 max-w-xl mx-auto">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-primary uppercase">
                    Action on Campus
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground mt-1 mb-2">
                    What We Do
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                    Here is how Kural serves Tamil students across campus.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                  {kuralWhatWeDo.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        {getCardIcon(item.icon)}
                      </div>
                      <h3 className="font-heading text-base font-bold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 4. JOIN / GET INVOLVED CTA */}
              <section className="bg-primary text-white rounded-3xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-xl mx-auto">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-3">
                    {kuralCtaBadge || "Get Involved"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-black leading-tight mb-3">
                    {kuralCtaTitle}
                  </h2>
                  <p className="text-white/90 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                    {kuralCtaDesc}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <span className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-sm">
                      {kuralCtaBtnText} <ArrowRight className="w-4 h-4" />
                    </span>
                    {kuralCtaSecondaryText && (
                      <span className="inline-flex items-center justify-center gap-2 bg-primary/40 border border-white/40 text-white px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm">
                        {kuralCtaSecondaryText}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        <div className="space-y-10">
          {/* SECTION 1: KURAL IDENTITY & LOGO */}
          <div className="bg-secondary/40 p-6 sm:p-8 rounded-3xl border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Kural Identity &amp; Introduction
                </h3>
                <p className="text-xs text-muted-foreground">
                  Title, Tamil motto, translation, and community vs organization distinction.
                </p>
              </div>
            </div>

            {/* Editable Kural Logo */}
            <div className="p-5 bg-white rounded-2xl border border-border mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 shadow-md ring-4 ring-primary/20 bg-white flex items-center justify-center relative">
                    <img
                      src={kuralLogoFile ? URL.createObjectURL(kuralLogoFile) : (kuralLogoUrl || "/kural-logo.png")}
                      alt="Kural Logo"
                      className="w-full h-full object-cover"
                    />
                    {uploadingKuralLogo && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                        Uploading...
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-foreground">Kural Emblem / Logo</h4>
                      {kuralLogoFile && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                          Unsaved Selection
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Official emblem displayed on the Kural page. Recommended formats: PNG with transparency, WebP, or JPG (500x500 px square).
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRecropLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary text-foreground font-bold text-xs border border-border transition-colors shadow-2xs cursor-pointer"
                    title="Re-crop active emblem/logo"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Re-crop</span>
                  </button>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary text-foreground font-bold text-xs border border-border transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSelectLogo}
                    />
                  </label>
                  {(kuralLogoFile || (kuralLogoUrl && kuralLogoUrl !== "/kural-logo.png")) && (
                    <button
                      type="button"
                      onClick={() => {
                        setKuralLogoFile(null);
                        setKuralLogoUrl("/kural-logo.png");
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-red-500 bg-secondary hover:bg-red-50 transition-colors border border-border cursor-pointer"
                      title="Reset back to default official logo"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Page Heading</label>
                  <input
                    type="text"
                    value={kuralTitle}
                    onChange={(e) => setKuralTitle(e.target.value)}
                    placeholder="Kural LPU"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground text-primary">Tamil Motto</label>
                  <input
                    type="text"
                    value={kuralTamilMotto}
                    onChange={(e) => setKuralTamilMotto(e.target.value)}
                    placeholder="யாதும் ஊரே யாவரும் கேளிர்"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Transliteration &amp; Meaning</label>
                <input
                  type="text"
                  value={kuralMottoTranslit}
                  onChange={(e) => setKuralMottoTranslit(e.target.value)}
                  placeholder="Yaadhum Oore Yavarum Kelir • “To us all towns are one, all men our kin”"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              {/* Relationship Distinction Box */}
              <div className="p-4 bg-white rounded-2xl border border-border space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Distinction Card Title</label>
                  <input
                    type="text"
                    value={kuralRelHeading}
                    onChange={(e) => setKuralRelHeading(e.target.value)}
                    placeholder="Community vs. Organization: What Kural Is"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    LPU Tamizhans Definition (Community)
                  </label>
                  <textarea
                    value={kuralRelCommunity}
                    onChange={(e) => setKuralRelCommunity(e.target.value)}
                    rows={2}
                    className="w-full bg-secondary border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                    placeholder="LPU Tamizhans is our student community — connecting every Tamil student..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Kural Definition (Organization &amp; Club)
                  </label>
                  <textarea
                    value={kuralRelOrg}
                    onChange={(e) => setKuralRelOrg(e.target.value)}
                    rows={2}
                    className="w-full bg-secondary border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                    placeholder="Kural is the student organization and club that runs it — planning events..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Supporting Tagline (Optional)
                  </label>
                  <textarea
                    value={kuralRelTagline}
                    onChange={(e) => setKuralRelTagline(e.target.value)}
                    rows={2}
                    className="w-full bg-secondary border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                    placeholder="Thousands of miles from home, Kural ensures that Tamil culture, language, and friendship thrive..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: FEATURED SHOWCASE IMAGE (21:9 BANNER) */}
          <div className="bg-secondary/40 p-6 sm:p-8 rounded-3xl border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Featured 21:9 Showcase Banner Image
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload or replace the ultra-wide 21:9 organization banner image displayed on the Kural page.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Image Preview */}
              {kuralImageUrl && !kuralImageFile && (
                <div className="p-4 bg-white rounded-2xl border border-border flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-48 aspect-[21/9] rounded-xl overflow-hidden bg-secondary border border-border shrink-0">
                    <img src={kuralImageUrl} alt="Current banner" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-xs font-bold text-foreground block truncate">
                      Current Active 21:9 Banner Image
                    </span>
                    <span className="text-[11px] text-muted-foreground break-all block mt-0.5">
                      {kuralImageUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleRecropBanner}
                      className="px-3 py-1.5 bg-white border border-border hover:border-primary text-primary rounded-xl font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Re-crop existing banner"
                    >
                      <Crop className="w-3 h-3" />
                      <span>Re-crop</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              )}

              {/* Staged New Banner Preview */}
              {kuralImageFile && (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-48 aspect-[21/9] rounded-xl overflow-hidden bg-secondary border border-emerald-300 shrink-0">
                    <img src={URL.createObjectURL(kuralImageFile)} alt="Staged banner" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Staged New Banner (Unsaved)
                    </span>
                    <span className="text-[11px] text-emerald-700 truncate block mt-0.5">
                      {kuralImageFile.name} ({(kuralImageFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleRecropBanner}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Re-crop staged banner"
                    >
                      <Crop className="w-3 h-3" />
                      <span>Re-crop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setKuralImageFile(null)}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
                    >
                      Cancel Staged
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Upload New Banner Image {kuralImageUrl ? "(Leave empty to keep existing banner)" : "(Optional)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelectBanner}
                  className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ultra-wide 21:9 aspect ratio banner. Recommended resolution: 2100x900 or 1920x822 px. Uploaded and stored securely in Supabase storage.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: VISION & MISSION */}
          <div className="bg-secondary/40 p-6 sm:p-8 rounded-3xl border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Vision &amp; Mission
                </h3>
                <p className="text-xs text-muted-foreground">
                  Define the organization's overarching vision and guiding mission.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vision Card Editor */}
              <div className="p-4 bg-white rounded-2xl border border-border space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                  Our Vision
                </span>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Vision Title</label>
                  <input
                    type="text"
                    value={kuralVisionTitle}
                    onChange={(e) => setKuralVisionTitle(e.target.value)}
                    placeholder="A Thriving Tamil Cultural Home at LPU"
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Vision Description</label>
                  <textarea
                    value={kuralVisionText}
                    onChange={(e) => setKuralVisionText(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl p-3.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none min-h-[140px] resize-y"
                    placeholder="To build a vibrant, inclusive, and closely-knit student community..."
                    required
                  />
                </div>
              </div>

              {/* Mission Card Editor */}
              <div className="p-4 bg-white rounded-2xl border border-border space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                  Our Mission
                </span>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Mission Title</label>
                  <input
                    type="text"
                    value={kuralMissionTitle}
                    onChange={(e) => setKuralMissionTitle(e.target.value)}
                    placeholder="Connecting, Empowering & Celebrating"
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Mission Description</label>
                  <textarea
                    value={kuralMissionText}
                    onChange={(e) => setKuralMissionText(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl p-3.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none min-h-[140px] resize-y"
                    placeholder="To bring students together through vibrant cultural festivals..."
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: WHAT WE DO CARDS */}
          <div className="bg-secondary/40 p-6 sm:p-8 rounded-3xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    What We Do (Cards)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Add, edit, reorder, or remove initiative &amp; activity cards.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenAddCard}
                className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Card
              </button>
            </div>

            {/* Card Add/Edit Form Modal / Drawer */}
            {isAddingCard && (
              <form onSubmit={handleSaveCard} className="mb-6 p-5 bg-white rounded-2xl border-2 border-primary/30 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="font-bold text-sm text-foreground">
                    {editingCardId ? "✏️ Edit Card" : "➕ Add New What We Do Card"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => { setIsAddingCard(false); setEditingCardId(null); }}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Card Title *</label>
                  <input
                    type="text"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    placeholder="e.g. Cultural Celebrations & Festivals"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Card Description *</label>
                  <textarea
                    value={cardDescription}
                    onChange={(e) => setCardDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description of this initiative or activity..."
                    className="w-full bg-secondary border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                    required
                  />
                </div>

                {/* Visual Icon Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Choose an Icon</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                    {AVAILABLE_KURAL_ICONS.map((item) => {
                      const IconComponent = item.icon;
                      const isSelected = cardIcon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setCardIcon(item.name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${isSelected ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-white text-muted-foreground hover:border-primary/40"}`}
                        >
                          <IconComponent className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => { setIsAddingCard(false); setEditingCardId(null); }}
                    className="px-4 py-2 rounded-xl border border-border text-foreground text-xs font-bold hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                  >
                    {editingCardId ? "Update Card" : "Save Card"}
                  </button>
                </div>
              </form>
            )}

            {/* Current Cards List */}
            <div className="space-y-3">
              {kuralWhatWeDo.map((item, idx) => {
                const iconObj = AVAILABLE_KURAL_ICONS.find((i) => i.name === item.icon);
                const IconComp = iconObj ? iconObj.icon : CalendarDays;
                return (
                  <div
                    key={item.id || idx}
                    className="p-4 bg-white rounded-2xl border border-border flex items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-heading font-bold text-sm text-foreground truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveCard(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCard(idx, "down")}
                        disabled={idx === kuralWhatWeDo.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditCard(item)}
                        title="Edit Card"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(item.id)}
                        title="Delete Card"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: JOIN CTA SECTION */}
          <div className="bg-secondary/40 p-6 sm:p-8 rounded-3xl border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Join / Get Involved CTA
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure the call-to-action banner at the bottom of the Kural page.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Badge Label</label>
                  <input
                    type="text"
                    value={kuralCtaBadge}
                    onChange={(e) => setKuralCtaBadge(e.target.value)}
                    placeholder="Get Involved"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Quote / Headline</label>
                  <input
                    type="text"
                    value={kuralCtaTitle}
                    onChange={(e) => setKuralCtaTitle(e.target.value)}
                    placeholder="“Join for the community. Stay for the growth...”"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Banner Description</label>
                <textarea
                  value={kuralCtaDesc}
                  onChange={(e) => setKuralCtaDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                  placeholder="Whether you want to perform on stage, help coordinate celebrations..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Primary Button Label</label>
                  <input
                    type="text"
                    value={kuralCtaBtnText}
                    onChange={(e) => setKuralCtaBtnText(e.target.value)}
                    placeholder="Join Kural & LPU Tamizhans"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Primary Button Link</label>
                    <span className="text-[11px] text-muted-foreground">Pick a route or type URL</span>
                  </div>
                  <input
                    type="text"
                    value={kuralCtaBtnLink}
                    onChange={(e) => setKuralCtaBtnLink(e.target.value)}
                    placeholder="/join"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {KNOWN_SITE_ROUTES.slice(0, 5).map((r) => (
                      <button
                        key={r.path}
                        type="button"
                        onClick={() => setKuralCtaBtnLink(r.path)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          kuralCtaBtnLink === r.path
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {r.path}
                      </button>
                    ))}
                  </div>
                  {kuralCtaBtnLink && !kuralCtaBtnLink.startsWith("/") && !kuralCtaBtnLink.startsWith("http://") && !kuralCtaBtnLink.startsWith("https://") && !kuralCtaBtnLink.startsWith("#") && (
                    <p className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Route should start with "/" for site pages or "https://" for external URLs.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Secondary Button Label (Optional)</label>
                  <input
                    type="text"
                    value={kuralCtaSecondaryText}
                    onChange={(e) => setKuralCtaSecondaryText(e.target.value)}
                    placeholder="Explore Moments & Events"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Secondary Button Link (Optional)</label>
                    <span className="text-[11px] text-muted-foreground">Pick a route or type URL</span>
                  </div>
                  <input
                    type="text"
                    value={kuralCtaSecondaryLink}
                    onChange={(e) => setKuralCtaSecondaryLink(e.target.value)}
                    placeholder="/gallery"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {KNOWN_SITE_ROUTES.slice(1, 6).map((r) => (
                      <button
                        key={r.path}
                        type="button"
                        onClick={() => setKuralCtaSecondaryLink(r.path)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          kuralCtaSecondaryLink === r.path
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {r.path}
                      </button>
                    ))}
                  </div>
                  {kuralCtaSecondaryLink && !kuralCtaSecondaryLink.startsWith("/") && !kuralCtaSecondaryLink.startsWith("http://") && !kuralCtaSecondaryLink.startsWith("#") && (
                    <p className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Route should start with "/" for site pages or "https://" for external URLs.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="pt-6 border-t border-border flex items-center justify-end">
            <button
              type="button"
              onClick={handleSaveKural}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-sm transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Kural Page"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Crop Modal for Kural Section */}
      {activeCrop && (
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
    </>
  );
}
