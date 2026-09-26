"use client";

import { useState, useEffect } from "react";
import { 
  Plus, X, Image as ImageIcon, Settings, LogOut, Trash2, Home, Users, Pencil, UserPlus,
  BookOpen, Eye, ArrowUp, ArrowDown, Sparkles, Compass, Target, CalendarDays, Palette, 
  Users2, Award, Heart, Megaphone, Music, Camera, Check, ExternalLink, Star,
  Mail, Inbox, Clock, Calendar, CheckCircle2, AlertCircle,
  Search, FileText, Crop, Phone, ClipboardList
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { compressImage } from "@/utils/compressImage";
import { generateMediaFileName } from "@/utils/cropImage";
import ImageCropModal from "@/components/admin/ImageCropModal";
import SubmissionsHub from "@/components/admin/SubmissionsHub";
import AdminHomeSection from "@/components/admin/sections/AdminHomeSection";
import AdminKuralSection from "@/components/admin/sections/AdminKuralSection";
import AdminMomentsSection from "@/components/admin/sections/AdminMomentsSection";
import AdminTeamSection from "@/components/admin/sections/AdminTeamSection";
import AdminContactSection from "@/components/admin/sections/AdminContactSection";
import AdminJoinSection from "@/components/admin/sections/AdminJoinSection";
import AdminRecruitmentSection from "@/components/admin/sections/AdminRecruitmentSection";

interface Moment {
  id: number;
  title: string;
  date: string;
  tag: string;
  description: string;
  image_url: string;
  location?: string;
  organized_by?: string;
  about?: string;
  highlights?: string;
  activities?: string;
  gallery_images?: string[];
  is_featured?: boolean;
  featured_order?: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  batch: string;
  image_url: string;
  bio?: string;
  responsibilities?: string;
  skills?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  order_num?: number;
}

interface KuralCardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const AVAILABLE_KURAL_ICONS = [
  { name: "CalendarDays", label: "Calendar / Festivals", icon: CalendarDays },
  { name: "Palette", label: "Arts / Creative", icon: Palette },
  { name: "Users2", label: "Community / Network", icon: Users2 },
  { name: "Award", label: "Leadership / Growth", icon: Award },
  { name: "Sparkles", label: "Culture / Special", icon: Sparkles },
  { name: "Compass", label: "Vision / Direction", icon: Compass },
  { name: "Target", label: "Mission / Goals", icon: Target },
  { name: "Heart", label: "Care / Welcoming", icon: Heart },
  { name: "BookOpen", label: "Knowledge / Education", icon: BookOpen },
  { name: "Megaphone", label: "Initiatives / Voice", icon: Megaphone },
  { name: "Music", label: "Music / Performances", icon: Music },
  { name: "Camera", label: "Media / Moments", icon: Camera },
];

interface TeamApplication {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
  batch: string;
  interest_area: string;
  message?: string;
  created_at: string;
}

const MOMENT_TAG_OPTIONS = [
  "Cultural",
  "Events",
  "Celebrations",
  "Gatherings",
  "Workshop & Competitions",
  "Community Meetup",
];

const KNOWN_SITE_ROUTES = [
  { path: "/join", label: "Join Us Community Page" },
  { path: "/gallery", label: "Moments & Archive Gallery" },
  { path: "/team", label: "Team Members Directory" },
  { path: "/team#join", label: "Apply for Core Team Form" },
  { path: "/kural", label: "Kural Club Identity Page" },
  { path: "/contact", label: "Contact Us & Inquiries" },
];

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
}



export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Team Management State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);

  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberDepartment, setMemberDepartment] = useState("");
  const [memberBatch, setMemberBatch] = useState("");
  const [memberBio, setMemberBio] = useState("");
  const [memberResponsibilities, setMemberResponsibilities] = useState("");
  const [memberSkills, setMemberSkills] = useState("");
  const [memberLinkedin, setMemberLinkedin] = useState("");
  const [memberGithub, setMemberGithub] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberOrderNum, setMemberOrderNum] = useState("0");
  const [memberFile, setMemberFile] = useState<File | null>(null);
  const [uploadingMember, setUploadingMember] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [organizedBy, setOrganizedBy] = useState("");
  const [about, setAbout] = useState("");
  const [highlights, setHighlights] = useState("");
  const [activities, setActivities] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[] | FileList | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [currentMemberPhoto, setCurrentMemberPhoto] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  interface CropModalState {
    isOpen: boolean;
    imageSrc: string | null;
    fileName: string;
    title: string;
    aspectRatio: number;
    aspectLabel: string;
    showCircleGuide?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    field: "team_member" | "moment_cover" | "kural_logo" | "kural_image" | "gallery_multi" | "gallery_single";
    galleryQueue?: {
      files: File[];
      currentIndex: number;
      accumulatedFiles: File[];
    };
    singleGalleryIndex?: number;
  }

  const [activeCrop, setActiveCrop] = useState<CropModalState | null>(null);

  const isVideo = (url: string) => /\.(mp4|webm|mov|m4v)$/i.test(url);

  // 1. Team Member Photo Handlers
  const handleSelectMemberPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (!chosenFile) return;
    const objectUrl = URL.createObjectURL(chosenFile);
    setActiveCrop({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: chosenFile.name,
      title: "Crop Team Member Profile Photo",
      aspectRatio: 4 / 5,
      aspectLabel: "4:5 Portrait",
      showCircleGuide: true,
      maxWidth: 800,
      maxHeight: 1000,
      field: "team_member",
    });
    e.target.value = "";
  };

  const handleRecropMemberPhoto = () => {
    const targetUrl = memberFile ? URL.createObjectURL(memberFile) : currentMemberPhoto;
    if (!targetUrl) return;
    setActiveCrop({
      isOpen: true,
      imageSrc: targetUrl,
      fileName: "member_photo.jpg",
      title: "Re-crop Team Member Photo",
      aspectRatio: 4 / 5,
      aspectLabel: "4:5 Portrait",
      showCircleGuide: true,
      maxWidth: 800,
      maxHeight: 1000,
      field: "team_member",
    });
  };

  // 2. Moments Cover Photo Handlers
  const handleSelectCoverMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (!chosenFile) return;
    if (chosenFile.type.startsWith("video/")) {
      setFile(chosenFile);
      return;
    }
    const objectUrl = URL.createObjectURL(chosenFile);
    setActiveCrop({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: chosenFile.name,
      title: "Crop Moments Cover Photo",
      aspectRatio: 16 / 9,
      aspectLabel: "16:9 Landscape",
      maxWidth: 1920,
      maxHeight: 1080,
      field: "moment_cover",
    });
    e.target.value = "";
  };

  const handleRecropCoverMedia = () => {
    const targetUrl = file ? URL.createObjectURL(file) : currentImageUrl;
    if (!targetUrl || isVideo(targetUrl)) return;
    setActiveCrop({
      isOpen: true,
      imageSrc: targetUrl,
      fileName: "cover_photo.jpg",
      title: "Re-crop Moments Cover Photo",
      aspectRatio: 16 / 9,
      aspectLabel: "16:9 Landscape",
      maxWidth: 1920,
      maxHeight: 1080,
      field: "moment_cover",
    });
  };

  // 3. Moments Gallery Multi-Upload Handlers
  const handleSelectGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;
    const imageFiles = rawFiles.filter((f) => !f.type.startsWith("video/"));
    const videoFiles = rawFiles.filter((f) => f.type.startsWith("video/"));

    if (imageFiles.length === 0) {
      if (videoFiles.length > 0) {
        setGalleryFiles((prev) => [...(prev ? Array.from(prev) : []), ...videoFiles]);
      }
      return;
    }

    const firstFile = imageFiles[0];
    const objectUrl = URL.createObjectURL(firstFile);
    setActiveCrop({
      isOpen: true,
      imageSrc: objectUrl,
      fileName: firstFile.name,
      title: "Crop Gallery Photo",
      aspectRatio: 4 / 3,
      aspectLabel: "4:3 Gallery",
      maxWidth: 1920,
      maxHeight: 1440,
      field: "gallery_multi",
      galleryQueue: {
        files: imageFiles,
        currentIndex: 0,
        accumulatedFiles: videoFiles,
      },
    });
    e.target.value = "";
  };

  const handleRecropGalleryImage = (index: number) => {
    const imgUrl = galleryImages[index];
    if (!imgUrl || isVideo(imgUrl)) return;
    setActiveCrop({
      isOpen: true,
      imageSrc: imgUrl,
      fileName: `gallery_${index + 1}.jpg`,
      title: "Re-crop Gallery Photo",
      aspectRatio: 4 / 3,
      aspectLabel: "4:3 Gallery",
      maxWidth: 1920,
      maxHeight: 1440,
      field: "gallery_single",
      singleGalleryIndex: index,
    });
  };

  // 4. Kural Emblem / Logo Handlers
  const handleSelectKuralLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRecropKuralLogo = () => {
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

  // 5. Kural Featured Showcase Image Handlers
  const handleSelectKuralImage = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRecropKuralImage = () => {
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

  // Modal Apply / Skip callbacks
  const handleCropModalApply = (croppedFile: File) => {
    if (!activeCrop) return;

    if (activeCrop.field === "team_member") {
      setMemberFile(croppedFile);
      setActiveCrop(null);
      showToast("Profile photo cropped & staged.", "success");
    } else if (activeCrop.field === "moment_cover") {
      setFile(croppedFile);
      setActiveCrop(null);
      showToast("Cover photo cropped & staged.", "success");
    } else if (activeCrop.field === "kural_logo") {
      setKuralLogoFile(croppedFile);
      setActiveCrop(null);
      showToast("Logo cropped & staged.", "success");
    } else if (activeCrop.field === "kural_image") {
      setKuralImageFile(croppedFile);
      setActiveCrop(null);
      showToast("Showcase banner cropped & staged.", "success");
    } else if (activeCrop.field === "gallery_single") {
      const idx = activeCrop.singleGalleryIndex;
      if (typeof idx === "number") {
        removeGalleryImage(idx);
        setGalleryFiles((prev) => [...(prev ? Array.from(prev) : []), croppedFile]);
        showToast("Re-cropped photo staged. Click Update Event to save changes.", "info");
      }
      setActiveCrop(null);
    } else if (activeCrop.field === "gallery_multi" && activeCrop.galleryQueue) {
      const q = activeCrop.galleryQueue;
      const nextAccum = [...q.accumulatedFiles, croppedFile];
      const nextIndex = q.currentIndex + 1;

      if (nextIndex < q.files.length) {
        const nextFile = q.files[nextIndex];
        const nextUrl = URL.createObjectURL(nextFile);
        setActiveCrop({
          ...activeCrop,
          imageSrc: nextUrl,
          fileName: nextFile.name,
          galleryQueue: {
            files: q.files,
            currentIndex: nextIndex,
            accumulatedFiles: nextAccum,
          },
        });
      } else {
        setGalleryFiles((prev) => [...(prev ? Array.from(prev) : []), ...nextAccum]);
        setActiveCrop(null);
        showToast(`${nextAccum.length} photos cropped and staged.`, "success");
      }
    }
  };

  const handleCropModalSkip = () => {
    if (!activeCrop || !activeCrop.galleryQueue) return;
    const q = activeCrop.galleryQueue;
    const skippedFile = q.files[q.currentIndex];
    const nextAccum = [...q.accumulatedFiles, skippedFile];
    const nextIndex = q.currentIndex + 1;

    if (nextIndex < q.files.length) {
      const nextFile = q.files[nextIndex];
      const nextUrl = URL.createObjectURL(nextFile);
      setActiveCrop({
        ...activeCrop,
        imageSrc: nextUrl,
        fileName: nextFile.name,
        galleryQueue: {
          files: q.files,
          currentIndex: nextIndex,
          accumulatedFiles: nextAccum,
        },
      });
    } else {
      setGalleryFiles((prev) => [...(prev ? Array.from(prev) : []), ...nextAccum]);
      setActiveCrop(null);
      showToast(`${nextAccum.length} photos staged.`, "success");
    }
  };

  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredSequence, setFeaturedSequence] = useState<number[]>([]);
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "upcoming">("all");
  const [upcomingMomentId, setUpcomingMomentId] = useState<number | null>(null);
  const [isUpcomingForm, setIsUpcomingForm] = useState(false);

  const [homeHeroText, setHomeHeroText] = useState("The vibrant heartbeat of Tamil culture on campus. LPU Tamizhans is our community — Kural is the organization at LPU that runs it, planning events, leading initiatives, and uniting students.");
  const [homeMomentsTitle, setHomeMomentsTitle] = useState("Recent Moments.");
  const [homeMomentsSubtitle, setHomeMomentsSubtitle] = useState("Memories from our campus celebrations.");

  const [galleryTitle, setGalleryTitle] = useState("Moments & Archive.");
  const [gallerySubtitle, setGallerySubtitle] = useState("A complete photo archive of our celebrations, cultural festivals, and community memories.");
  
  const [joinTitle, setJoinTitle] = useState("Join the Family.");
  const [joinSubtitle, setJoinSubtitle] = useState("Connect with Tamil students at LPU. Stay updated on events, share memories, and be part of the LPU Tamizhans community.");
  const [joinWhatsappTitle, setJoinWhatsappTitle] = useState("WhatsApp");
  const [joinWhatsappDesc, setJoinWhatsappDesc] = useState("Join the main community group to stay in the loop for all announcements, updates, and meetups.");
  const [joinWhatsappLink, setJoinWhatsappLink] = useState("https://chat.whatsapp.com/GTha3bg0pZI43xIFPl9SMe");
  const [joinInstagramTitle, setJoinInstagramTitle] = useState("Instagram");
  const [joinInstagramDesc, setJoinInstagramDesc] = useState("Follow our grid for event highlights, cultural features, and the latest stories from the community.");
  const [joinInstagramLink, setJoinInstagramLink] = useState("https://www.instagram.com/lpu.tamizhans?stkn=MXV5NWlyMG5kb2o4ag==");
  const [joinTeamCtaTitle, setJoinTeamCtaTitle] = useState("Interested in Student Leadership?");
  const [joinTeamCtaDesc, setJoinTeamCtaDesc] = useState("While our community groups are open to every Tamil student, the Kural Student Organization coordinates campus festivals, digital operations, media, and outreach. Apply to join the coordinator team.");
  const [joinTeamCtaBtnText, setJoinTeamCtaBtnText] = useState("Apply for Student Team");
  const [joinTeamCtaBtnLink, setJoinTeamCtaBtnLink] = useState("/team#join");

  // Submissions Hub State & Draft Support
  const [submissionsSubTab, setSubmissionsSubTab] = useState<"messages" | "applications">("messages");
  const [dismissedTip, setDismissedTip] = useState(false);
  const [eventDraft, setEventDraft] = useState<any | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kural_event_draft");
      if (saved) {
        setEventDraft(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const isFormDirty = Boolean(
    editingId !== null ||
    title.trim() !== "" ||
    date.trim() !== "" ||
    description.trim() !== "" ||
    about.trim() !== "" ||
    highlights.trim() !== "" ||
    activities.trim() !== "" ||
    location.trim() !== "" ||
    organizedBy.trim() !== "" ||
    file !== null ||
    (galleryFiles && galleryFiles.length > 0)
  );

  const handleSaveEventDraft = () => {
    const draftPayload = {
      title,
      date,
      tag,
      description,
      location,
      organizedBy,
      about,
      highlights,
      activities,
      isUpcomingForm,
      isFeatured,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("kural_event_draft", JSON.stringify(draftPayload));
      setEventDraft(draftPayload);
      showToast("Event draft saved! You can resume editing anytime.", "success");
    } catch (e) {
      showToast("Failed to save draft to storage.", "error");
    }
  };

  const handleResumeEventDraft = () => {
    if (!eventDraft) return;
    setTitle(eventDraft.title || "");
    setDate(eventDraft.date || "");
    setTag(eventDraft.tag || "Cultural");
    setDescription(eventDraft.description || "");
    setLocation(eventDraft.location || "");
    setOrganizedBy(eventDraft.organizedBy || "");
    setAbout(eventDraft.about || "");
    setHighlights(eventDraft.highlights || "");
    setActivities(eventDraft.activities || "");
    setIsUpcomingForm(Boolean(eventDraft.isUpcomingForm));
    setIsFeatured(Boolean(eventDraft.isFeatured));
    setIsAdding(true);
    showToast("Event draft restored into form.", "info");
  };

  const handleDiscardEventDraft = () => {
    try {
      localStorage.removeItem("kural_event_draft");
      setEventDraft(null);
      showToast("Event draft discarded.", "info");
    } catch (e) {
      console.error(e);
    }
  };

  // Kural Page State
  const [kuralTitle, setKuralTitle] = useState("Kural LPU");
  const [kuralTamilMotto, setKuralTamilMotto] = useState("யாதும் ஊரே யாவரும் கேளிர்");
  const [kuralMottoTranslit, setKuralMottoTranslit] = useState("“To us all towns are one, all men our kin”");
  const [kuralRelHeading, setKuralRelHeading] = useState("Community vs. Organization: What Kural Is");
  const [kuralRelCommunity, setKuralRelCommunity] = useState("LPU Tamizhans is our student community — connecting every Tamil student across Lovely Professional University in Punjab.");
  const [kuralRelOrg, setKuralRelOrg] = useState("Kural is the student organization and club that runs it — planning events, leading cultural initiatives, managing operations, and bringing students together.");
  const [kuralRelTagline, setKuralRelTagline] = useState("Thousands of miles from home, Kural ensures that Tamil culture, language, and friendship thrive on the LPU campus.");

  const [kuralLogoUrl, setKuralLogoUrl] = useState("/kural-logo.png");
  const [kuralLogoFile, setKuralLogoFile] = useState<File | null>(null);
  const [uploadingKuralLogo, setUploadingKuralLogo] = useState(false);

  const [kuralImageUrl, setKuralImageUrl] = useState("");
  const [kuralImageFile, setKuralImageFile] = useState<File | null>(null);
  const [uploadingKuralImage, setUploadingKuralImage] = useState(false);

  const [kuralVisionTitle, setKuralVisionTitle] = useState("A Thriving Tamil Cultural Home at LPU");
  const [kuralVisionText, setKuralVisionText] = useState("To build a vibrant, inclusive, and closely-knit student community at Lovely Professional University where Tamil traditions, language, and heritage are proudly celebrated, shared, and passed forward.");
  const [kuralMissionTitle, setKuralMissionTitle] = useState("Connecting, Empowering & Celebrating");
  const [kuralMissionText, setKuralMissionText] = useState("To bring students together through vibrant cultural festivals, creative activities, and shared experiences — giving every Tamil student at LPU an empowering platform to express talent, build lifelong friendships, and lead.");

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

  const [isAddingKuralCard, setIsAddingKuralCard] = useState(false);
  const [editingKuralCardId, setEditingKuralCardId] = useState<string | null>(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [cardIcon, setCardIcon] = useState("CalendarDays");

  const [kuralCtaBadge, setKuralCtaBadge] = useState("Get Involved");
  const [kuralCtaTitle, setKuralCtaTitle] = useState("“Join for the community. Stay for the growth. Leave a legacy.”");
  const [kuralCtaDesc, setKuralCtaDesc] = useState("Whether you want to perform on stage, help coordinate celebrations, develop your leadership skills, or simply meet fellow Tamil students at LPU — Kural welcomes you with open arms.");
  const [kuralCtaBtnText, setKuralCtaBtnText] = useState("Join Kural & LPU Tamizhans");
  const [kuralCtaBtnLink, setKuralCtaBtnLink] = useState("/join");
  const [kuralCtaSecondaryText, setKuralCtaSecondaryText] = useState("Explore Moments & Events");
  const [kuralCtaSecondaryLink, setKuralCtaSecondaryLink] = useState("/gallery");

  const [savingKural, setSavingKural] = useState(false);
  const [kuralPreviewMode, setKuralPreviewMode] = useState(false);

  const [savingHome, setSavingHome] = useState(false);
  const [savingJoin, setSavingJoin] = useState(false);

  useEffect(() => {
    fetchMoments();
    fetchAbout();
    fetchMembers();
  }, []);

  const fetchAbout = async () => {
    const { data } = await supabase.from('site_content').select('id, content');
    if (data) {
      const hHT = data.find(r => r.id === 'home_hero_text');
      if (hHT) setHomeHeroText(hHT.content);

      const hMT = data.find(r => r.id === 'home_moments_title');
      if (hMT) setHomeMomentsTitle(hMT.content);

      const hMS = data.find(r => r.id === 'home_moments_subtitle');
      if (hMS) setHomeMomentsSubtitle(hMS.content);

      const gT = data.find(r => r.id === 'gallery_title');
      if (gT) setGalleryTitle(gT.content);

      const gS = data.find(r => r.id === 'gallery_subtitle');
      if (gS) setGallerySubtitle(gS.content);

      const jT = data.find(r => r.id === 'join_title');
      if (jT) setJoinTitle(jT.content);

      const jS = data.find(r => r.id === 'join_subtitle');
      if (jS) setJoinSubtitle(jS.content);

      const jWT = data.find(r => r.id === 'join_whatsapp_title');
      if (jWT?.content) setJoinWhatsappTitle(jWT.content);

      const jWD = data.find(r => r.id === 'join_whatsapp_desc');
      if (jWD?.content) setJoinWhatsappDesc(jWD.content);

      const jWL = data.find(r => r.id === 'join_whatsapp_link');
      if (jWL?.content) setJoinWhatsappLink(jWL.content);

      const jIT = data.find(r => r.id === 'join_instagram_title');
      if (jIT?.content) setJoinInstagramTitle(jIT.content);

      const jID = data.find(r => r.id === 'join_instagram_desc');
      if (jID?.content) setJoinInstagramDesc(jID.content);

      const jIL = data.find(r => r.id === 'join_instagram_link');
      if (jIL?.content) setJoinInstagramLink(jIL.content);

      const jTT = data.find(r => r.id === 'join_team_cta_title');
      if (jTT?.content) setJoinTeamCtaTitle(jTT.content);

      const jTD = data.find(r => r.id === 'join_team_cta_desc');
      if (jTD?.content) setJoinTeamCtaDesc(jTD.content);

      const jTB = data.find(r => r.id === 'join_team_cta_btn_text');
      if (jTB?.content) setJoinTeamCtaBtnText(jTB.content);

      const jTL = data.find(r => r.id === 'join_team_cta_btn_link');
      if (jTL?.content) setJoinTeamCtaBtnLink(jTL.content);

      // Kural Page Content
      const getKVal = (key: string) => {
        const liveRow = data.find(r => r.id === `kural_${key}`);
        return liveRow?.content || "";
      };

      const kLogo = getKVal('logo_url');
      if (kLogo) setKuralLogoUrl(kLogo);

      const kTitle = getKVal('title');
      if (kTitle) setKuralTitle(kTitle);

      const kMotto = getKVal('tamil_motto');
      if (kMotto) setKuralTamilMotto(kMotto);

      const kTranslit = getKVal('motto_translit');
      if (kTranslit) {
        const cleaned = kTranslit.replace(/^yaadhum\s+oore\s+yav[a|a]rum\s+kelir\s*[•\-–—]?\s*/i, "").trim();
        setKuralMottoTranslit(cleaned || "“To us all towns are one, all men our kin”");
      }

      const kRelH = getKVal('rel_heading');
      if (kRelH) setKuralRelHeading(kRelH);

      const kRelC = getKVal('rel_community');
      if (kRelC) setKuralRelCommunity(kRelC);

      const kRelO = getKVal('rel_org');
      if (kRelO) setKuralRelOrg(kRelO);

      const kRelT = getKVal('rel_tagline');
      if (kRelT) setKuralRelTagline(kRelT);

      const kImg = getKVal('image_url');
      if (kImg) setKuralImageUrl(kImg);

      const kVisT = getKVal('vision_title');
      if (kVisT) setKuralVisionTitle(kVisT);

      const kVisM = getKVal('vision_text');
      if (kVisM) setKuralVisionText(kVisM);

      const kMisT = getKVal('mission_title');
      if (kMisT) setKuralMissionTitle(kMisT);

      const kMisM = getKVal('mission_text');
      if (kMisM) setKuralMissionText(kMisM);

      const kWwd = getKVal('what_we_do');
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

      const kCtaB = getKVal('cta_badge');
      if (kCtaB) setKuralCtaBadge(kCtaB);

      const kCtaT = getKVal('cta_title');
      if (kCtaT) setKuralCtaTitle(kCtaT);

      const kCtaD = getKVal('cta_desc');
      if (kCtaD) setKuralCtaDesc(kCtaD);

      const kCtaBtnT = getKVal('cta_btn_text');
      if (kCtaBtnT) setKuralCtaBtnText(kCtaBtnT);

      const kCtaBtnL = getKVal('cta_btn_link');
      if (kCtaBtnL) setKuralCtaBtnLink(kCtaBtnL);

      const kCtaSecT = getKVal('cta_secondary_text');
      if (kCtaSecT) setKuralCtaSecondaryText(kCtaSecT);

      const kCtaSecL = getKVal('cta_secondary_link');
      if (kCtaSecL) setKuralCtaSecondaryLink(kCtaSecL);
    }
  };

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHome(true);
    await Promise.all([
      supabase.from('site_content').upsert({ id: 'home_hero_text', content: homeHeroText }),
      supabase.from('site_content').upsert({ id: 'home_moments_title', content: homeMomentsTitle }),
      supabase.from('site_content').upsert({ id: 'home_moments_subtitle', content: homeMomentsSubtitle }),
      supabase.from('site_content').upsert({ id: 'gallery_title', content: galleryTitle }),
      supabase.from('site_content').upsert({ id: 'gallery_subtitle', content: gallerySubtitle }),
    ]);
    setSavingHome(false);
    showToast("Home Page & Gallery settings saved successfully!");
  };

  const handleSaveJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJoin(true);
    await Promise.all([
      supabase.from('site_content').upsert({ id: 'join_title', content: joinTitle }),
      supabase.from('site_content').upsert({ id: 'join_subtitle', content: joinSubtitle }),
      supabase.from('site_content').upsert({ id: 'join_whatsapp_title', content: joinWhatsappTitle }),
      supabase.from('site_content').upsert({ id: 'join_whatsapp_desc', content: joinWhatsappDesc }),
      supabase.from('site_content').upsert({ id: 'join_whatsapp_link', content: joinWhatsappLink }),
      supabase.from('site_content').upsert({ id: 'join_instagram_title', content: joinInstagramTitle }),
      supabase.from('site_content').upsert({ id: 'join_instagram_desc', content: joinInstagramDesc }),
      supabase.from('site_content').upsert({ id: 'join_instagram_link', content: joinInstagramLink }),
      supabase.from('site_content').upsert({ id: 'join_team_cta_title', content: joinTeamCtaTitle }),
      supabase.from('site_content').upsert({ id: 'join_team_cta_desc', content: joinTeamCtaDesc }),
      supabase.from('site_content').upsert({ id: 'join_team_cta_btn_text', content: joinTeamCtaBtnText }),
      supabase.from('site_content').upsert({ id: 'join_team_cta_btn_link', content: joinTeamCtaBtnLink }),
    ]);
    setSavingJoin(false);
    showToast("Join Us page updated successfully!");
  };

  const handleSaveKural = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingKural(true);
    try {
      let finalLogoUrl = kuralLogoUrl;
      if (kuralLogoFile) {
        setUploadingKuralLogo(true);
        const processedFile = await compressImage(kuralLogoFile, 600, 600, 0.85);
        const fileName = generateMediaFileName("kural_logo", processedFile);
        const { error: uploadError } = await supabase.storage
          .from('moments')
          .upload(fileName, processedFile);

        if (uploadError) {
          alert("Logo upload failed: " + uploadError.message);
          setSavingKural(false);
          setUploadingKuralLogo(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('moments').getPublicUrl(fileName);
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
        const { error: uploadError } = await supabase.storage
          .from('moments')
          .upload(fileName, processedFile);

        if (uploadError) {
          alert("Image upload failed: " + uploadError.message);
          setSavingKural(false);
          setUploadingKuralImage(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('moments').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
        setKuralImageUrl(finalImageUrl);
        setKuralImageFile(null);
        setUploadingKuralImage(false);
      }

      const livePayload = [
        { id: 'kural_logo_url', content: finalLogoUrl },
        { id: 'kural_title', content: kuralTitle },
        { id: 'kural_tamil_motto', content: kuralTamilMotto },
        { id: 'kural_motto_translit', content: kuralMottoTranslit },
        { id: 'kural_rel_heading', content: kuralRelHeading },
        { id: 'kural_rel_community', content: kuralRelCommunity },
        { id: 'kural_rel_org', content: kuralRelOrg },
        { id: 'kural_rel_tagline', content: kuralRelTagline },
        { id: 'kural_image_url', content: finalImageUrl },
        { id: 'kural_vision_title', content: kuralVisionTitle },
        { id: 'kural_vision_text', content: kuralVisionText },
        { id: 'kural_mission_title', content: kuralMissionTitle },
        { id: 'kural_mission_text', content: kuralMissionText },
        { id: 'kural_what_we_do', content: JSON.stringify(kuralWhatWeDo) },
        { id: 'kural_cta_badge', content: kuralCtaBadge },
        { id: 'kural_cta_title', content: kuralCtaTitle },
        { id: 'kural_cta_desc', content: kuralCtaDesc },
        { id: 'kural_cta_btn_text', content: kuralCtaBtnText },
        { id: 'kural_cta_btn_link', content: kuralCtaBtnLink },
        { id: 'kural_cta_secondary_text', content: kuralCtaSecondaryText },
        { id: 'kural_cta_secondary_link', content: kuralCtaSecondaryLink },
      ];
      await Promise.all(livePayload.map((item) => supabase.from('site_content').upsert(item)));
      showToast("🎉 Kural Page Published Successfully!");
    } catch (err: any) {
      showToast("Error saving Kural content: " + err.message, "error");
    } finally {
      setSavingKural(false);
    }
  };

  const handleRemoveKuralImage = () => {
    if (!confirm("Remove the featured banner image?")) return;
    setKuralImageUrl("");
    setKuralImageFile(null);
  };

  const handleOpenAddCard = () => {
    setEditingKuralCardId(null);
    setCardTitle("");
    setCardDescription("");
    setCardIcon("CalendarDays");
    setIsAddingKuralCard(true);
  };

  const handleOpenEditCard = (card: KuralCardItem) => {
    setEditingKuralCardId(card.id);
    setCardTitle(card.title);
    setCardDescription(card.description);
    setCardIcon(card.icon || "CalendarDays");
    setIsAddingKuralCard(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim() || !cardDescription.trim()) {
      alert("Please provide both a Title and Description for the card.");
      return;
    }

    if (editingKuralCardId) {
      setKuralWhatWeDo(prev =>
        prev.map(c =>
          c.id === editingKuralCardId
            ? { ...c, title: cardTitle.trim(), description: cardDescription.trim(), icon: cardIcon }
            : c
        )
      );
    } else {
      const newCard: KuralCardItem = {
        id: Date.now().toString(),
        title: cardTitle.trim(),
        description: cardDescription.trim(),
        icon: cardIcon,
      };
      setKuralWhatWeDo(prev => [...prev, newCard]);
    }

    setIsAddingKuralCard(false);
    setEditingKuralCardId(null);
    setCardTitle("");
    setCardDescription("");
    setCardIcon("CalendarDays");
  };

  const handleDeleteCard = (id: string) => {
    if (!confirm("Are you sure you want to remove this What We Do card?")) return;
    setKuralWhatWeDo(prev => prev.filter(c => c.id !== id));
  };

  const handleMoveCard = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= kuralWhatWeDo.length) return;
    const updated = [...kuralWhatWeDo];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setKuralWhatWeDo(updated);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('order_num', { ascending: true })
      .order('id', { ascending: true });
    if (data) setMembers(data);
    setLoadingMembers(false);
  };

  const startEditMember = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberDepartment(member.department);
    setMemberBatch(member.batch);
    setMemberBio(member.bio || "");
    setMemberResponsibilities(member.responsibilities || "");
    setMemberSkills(member.skills || "");
    setMemberLinkedin(member.linkedin || "");
    setMemberGithub(member.github || "");
    setMemberEmail(member.email || "");
    setMemberOrderNum(String(member.order_num || 0));
    setMemberFile(null);
    setCurrentMemberPhoto(member.image_url || "");
    setIsAddingMember(true);
  };

  const cancelEditMember = () => {
    setEditingMemberId(null);
    setIsAddingMember(false);
    setMemberName("");
    setMemberRole("");
    setMemberDepartment("");
    setMemberBatch("");
    setMemberBio("");
    setMemberResponsibilities("");
    setMemberSkills("");
    setMemberLinkedin("");
    setMemberGithub("");
    setMemberEmail("");
    setMemberOrderNum("0");
    setMemberFile(null);
    setCurrentMemberPhoto("");
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) {
      showToast("Failed to delete member: " + error.message, "error");
    } else {
      fetchMembers();
      showToast("Team member removed successfully.");
    }
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberRole || !memberDepartment || !memberBatch) {
      return showToast("Name, Role, Department, and Batch are required.", "error");
    }
    setUploadingMember(true);

    let image_url = "";
    if (memberFile) {
      const processedFile = await compressImage(memberFile, 800, 800, 0.82);
      const fileName = generateMediaFileName("member", processedFile);
      const { error: uploadError } = await supabase.storage
        .from('moments')
        .upload(fileName, processedFile);

      if (uploadError) {
        showToast("Photo upload failed: " + uploadError.message, "error");
        setUploadingMember(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('moments').getPublicUrl(fileName);
      image_url = publicUrl;
    }

    const payload: any = {
      name: memberName,
      role: memberRole,
      department: memberDepartment,
      batch: memberBatch,
      bio: null,
      responsibilities: memberResponsibilities,
      skills: null,
      instagram: null,
      linkedin: memberLinkedin,
      github: null,
      email: memberEmail,
      order_num: parseInt(memberOrderNum, 10) || 0,
    };

    if (image_url) {
      payload.image_url = image_url;
    }

    if (editingMemberId) {
      const { error } = await supabase.from('team_members').update(payload).eq('id', editingMemberId);
      if (error) {
        showToast("Failed to update member: " + error.message, "error");
      } else {
        cancelEditMember();
        fetchMembers();
        showToast("Team member updated successfully!");
      }
    } else {
      if (image_url) payload.image_url = image_url;
      const { error } = await supabase.from('team_members').insert([payload]);
      if (error) {
        showToast("Failed to add member: " + error.message, "error");
      } else {
        cancelEditMember();
        fetchMembers();
        showToast("New team member added successfully!");
      }
    }
    setUploadingMember(false);
  };

  const fetchMoments = async () => {
    const { data } = await supabase
      .from('moments')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Fetch featured moments mapping from site_content
    const { data: featData } = await supabase
      .from('site_content')
      .select('content')
      .eq('id', 'homepage_featured_moments')
      .maybeSingle();

    const sequence: number[] = [];
    if (featData?.content) {
      try {
        const parsed = JSON.parse(featData.content);
        if (Array.isArray(parsed)) {
          const sortedParsed = [...parsed].sort((a: any, b: any) => {
            const ordA = typeof a === 'object' && a ? (Number(a.order) || 0) : 0;
            const ordB = typeof b === 'object' && b ? (Number(b.order) || 0) : 0;
            return ordA - ordB;
          });
          sortedParsed.forEach((item: any) => {
            const mId = typeof item === 'object' && item ? Number(item.id) : Number(item);
            if (mId && !sequence.includes(mId)) {
              sequence.push(mId);
            }
          });
        }
      } catch (e) {}
    }

    if (data) {
      data.forEach((m: any) => {
        if (m.is_featured && !sequence.includes(m.id)) {
          sequence.push(m.id);
        }
      });
    }

    setFeaturedSequence(sequence);

    // Fetch upcoming moment id from site_content
    const { data: upcomingData } = await supabase
      .from('site_content')
      .select('content')
      .eq('id', 'upcoming_moment_id')
      .maybeSingle();

    if (upcomingData?.content) {
      const parsedId = Number(upcomingData.content);
      setUpcomingMomentId(!isNaN(parsedId) && parsedId > 0 ? parsedId : null);
    } else {
      setUpcomingMomentId(null);
    }

    if (data) {
      const mapped = data.map((m: any) => ({
        ...m,
        is_featured: sequence.includes(m.id),
        featured_order: sequence.includes(m.id) ? (sequence.indexOf(m.id) + 1) : 0
      }));
      setMoments(mapped);
    }
    setLoading(false);
  };

  const handleToggleUpcoming = async (momentId: number) => {
    const isCurrentlyUpcoming = upcomingMomentId === momentId;
    const newUpcomingId = isCurrentlyUpcoming ? null : momentId;
    setUpcomingMomentId(newUpcomingId);

    await supabase.from('site_content').upsert({
      id: 'upcoming_moment_id',
      content: newUpcomingId ? String(newUpcomingId) : '',
    });

    try {
      if (isCurrentlyUpcoming) {
        await supabase.from('moments').update({ is_upcoming: false } as any).eq('id', momentId);
      } else {
        await supabase.from('moments').update({ is_upcoming: false } as any).neq('id', momentId);
        await supabase.from('moments').update({ is_upcoming: true } as any).eq('id', momentId);
      }
    } catch (e) {
      // Safe fallback if column is not yet in moments table
    }

    fetchMoments();
  };

  const handleToggleFeatured = async (momentId: number) => {
    const isCurrentlyFeatured = featuredSequence.includes(momentId);
    let newSequence: number[];

    if (isCurrentlyFeatured) {
      // 8. If a featured Moment is removed, the remaining featured Moments automatically re-number/re-prioritize
      newSequence = featuredSequence.filter(id => id !== momentId);
    } else {
      // 3. When admin clicks Featured for the first time -> automatically becomes #1
      // 4. Next -> #2, #3, etc.
      newSequence = [...featuredSequence, momentId];
    }

    setFeaturedSequence(newSequence);

    const serialized = newSequence.map((id, index) => ({
      id,
      order: index + 1
    }));

    await supabase.from('site_content').upsert({
      id: 'homepage_featured_moments',
      content: JSON.stringify(serialized)
    });

    fetchMoments();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/adminnadhan");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this moment?")) return;
    await supabase.from('moments').delete().eq('id', id);

    if (featuredSequence.includes(id)) {
      const newSequence = featuredSequence.filter(mId => mId !== id);
      setFeaturedSequence(newSequence);
      const serialized = newSequence.map((mId, index) => ({ id: mId, order: index + 1 }));
      await supabase.from('site_content').upsert({
        id: 'homepage_featured_moments',
        content: JSON.stringify(serialized)
      });
    }

    if (upcomingMomentId === id) {
      setUpcomingMomentId(null);
      await supabase.from('site_content').upsert({
        id: 'upcoming_moment_id',
        content: '',
      });
    }

    fetchMoments();
    showToast("Moment celebration removed.");
  };

  const startEdit = (moment: Moment) => {
    setEditingId(moment.id);
    setTitle(moment.title);
    setDate(moment.date);
    setTag(moment.tag);
    setDescription(moment.description || "");
    setLocation(moment.location || "");
    setOrganizedBy(moment.organized_by || "");
    setAbout(moment.about || "");
    setHighlights(moment.highlights || "");
    setActivities(moment.activities || "");
    setIsFeatured(Boolean(moment.is_featured || featuredSequence.includes(moment.id)));
    setIsUpcomingForm(upcomingMomentId === moment.id);
    
    let gImgs: string[] = [];
    if (Array.isArray(moment.gallery_images)) {
      gImgs = moment.gallery_images;
    } else if (typeof moment.gallery_images === "string") {
      try {
        const parsed = JSON.parse(moment.gallery_images);
        if (Array.isArray(parsed)) gImgs = parsed;
      } catch {
        gImgs = [];
      }
    }
    setGalleryImages(gImgs);
    setGalleryFiles(null);
    setFile(null);
    setCurrentImageUrl(moment.image_url || "");
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setTitle(""); 
    setDate(""); 
    setTag(""); 
    setDescription(""); 
    setLocation("");
    setOrganizedBy("");
    setAbout("");
    setHighlights("");
    setActivities("");
    setGalleryImages([]);
    setGalleryFiles(null);
    setFile(null);
    setCurrentImageUrl("");
    setIsFeatured(false);
    setIsUpcomingForm(false);
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !tag) return alert("Title, Date, and Tag are required.");
    setUploading(true);
    
    // 1. Upload cover media if a new file is chosen
    let image_url = "";
    if (file) {
      const processedFile = await compressImage(file, 1920, 1080, 0.82);
      const fileName = generateMediaFileName("cover", processedFile);
      const { error: uploadError } = await supabase.storage
        .from('moments')
        .upload(fileName, processedFile);
      
      if (uploadError) {
        alert("Cover media upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('moments').getPublicUrl(fileName);
      image_url = publicUrl;
    }

    // 2. Upload multiple gallery photos if selected
    const uploadedGalleryUrls: string[] = [];
    if (galleryFiles && galleryFiles.length > 0) {
      for (let i = 0; i < galleryFiles.length; i++) {
        const gFile = galleryFiles[i];
        const processedGFile = await compressImage(gFile, 1920, 1080, 0.82);
        const fileName = generateMediaFileName(`gallery_${i}`, processedGFile);
        const { error: gErr } = await supabase.storage
          .from('moments')
          .upload(fileName, processedGFile);
        
        if (!gErr) {
          const { data: { publicUrl } } = supabase.storage.from('moments').getPublicUrl(fileName);
          uploadedGalleryUrls.push(publicUrl);
        }
      }
    }

    const finalGallery = [...galleryImages, ...uploadedGalleryUrls];

    let newSequence = [...featuredSequence];
    let finalOrder = 0;

    if (editingId) {
      const wasFeatured = newSequence.includes(editingId);
      if (isFeatured && !wasFeatured) {
        newSequence.push(editingId);
        finalOrder = newSequence.length;
      } else if (!isFeatured && wasFeatured) {
        newSequence = newSequence.filter(id => id !== editingId);
        finalOrder = 0;
      } else if (isFeatured && wasFeatured) {
        finalOrder = newSequence.indexOf(editingId) + 1;
      }
    }

    const payload: any = {
      title,
      date,
      tag,
      description,
      location,
      organized_by: organizedBy,
      about,
      highlights,
      activities,
      gallery_images: finalGallery,
    };

    if (image_url) {
      payload.image_url = image_url;
    }

    if (editingId) {
      setFeaturedSequence(newSequence);
      const serialized = newSequence.map((id, index) => ({ id, order: index + 1 }));
      await supabase.from('site_content').upsert({
        id: 'homepage_featured_moments',
        content: JSON.stringify(serialized)
      });

      let { error } = await supabase.from('moments').update(payload).eq('id', editingId);

      if (error) {
        showToast("Failed to update moment: " + error.message, "error");
      } else {
        if (isUpcomingForm) {
          setUpcomingMomentId(editingId);
          await supabase.from('site_content').upsert({
            id: 'upcoming_moment_id',
            content: String(editingId),
          });
        } else if (upcomingMomentId === editingId) {
          setUpcomingMomentId(null);
          await supabase.from('site_content').upsert({
            id: 'upcoming_moment_id',
            content: '',
          });
        }

        cancelEdit();
        fetchMoments();
        showToast("Event celebration updated successfully!");
      }
    } else {
      // Insert new moment
      if (!image_url) {
        showToast("Please select a cover photo or video for the event.", "error");
        setUploading(false);
        return;
      }
      payload.image_url = image_url;
      let { data: insertedData, error } = await supabase.from('moments').insert([payload]).select().single();

      if (error) {
        showToast("Failed to save moment: " + error.message, "error");
      } else {
        if (insertedData) {
          if (isFeatured) {
            const updatedSequence = [...featuredSequence, insertedData.id];
            setFeaturedSequence(updatedSequence);
            const serialized = updatedSequence.map((id, index) => ({ id, order: index + 1 }));
            await supabase.from('site_content').upsert({
              id: 'homepage_featured_moments',
              content: JSON.stringify(serialized)
            });
          }

          if (isUpcomingForm) {
            setUpcomingMomentId(insertedData.id);
            await supabase.from('site_content').upsert({
              id: 'upcoming_moment_id',
              content: String(insertedData.id),
            });
          }
        }
        cancelEdit();
        fetchMoments();
        showToast("New event celebration published successfully!");
      }
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-secondary pt-6 pb-10">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-border mb-6">
          <div className="flex items-center gap-3.5 mb-4 md:mb-0">
            <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Settings className="text-primary w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-foreground">Admin Workspace</h1>
              <p className="text-muted-foreground text-xs font-medium">Manage community content, team members, and inquiries</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              target="_blank"
              className="text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 px-3.5 py-2 rounded-xl border border-border transition-colors inline-flex items-center gap-1.5"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button onClick={handleSignOut} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-1.5">
            {/* Category: PAGES */}
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground px-3 pt-1 pb-1">
              Pages
            </div>

            <button 
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "home" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <Home className="w-4 h-4" /> Home
            </button>

            <button 
              onClick={() => setActiveTab("kural")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "kural" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <BookOpen className="w-4 h-4" /> Kural
            </button>

            <button 
              onClick={() => setActiveTab("moments")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "moments" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <ImageIcon className="w-4 h-4" /> Moments
            </button>

            <button 
              onClick={() => setActiveTab("team")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "team" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <Users className="w-4 h-4" /> Team
            </button>

            {/* Category: ENGAGE */}
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground px-3 pt-4 pb-1">
              Engage
            </div>

            <button 
              onClick={() => setActiveTab("contact")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "contact" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <Phone className="w-4 h-4" /> Get in Touch
            </button>

            <button 
              onClick={() => setActiveTab("join")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "join" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <UserPlus className="w-4 h-4" /> Join Us
            </button>

            <button 
              onClick={() => setActiveTab("recruitment")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "recruitment" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <ClipboardList className="w-4 h-4" /> Be Part of Our Team
            </button>

            {/* Category: INBOX */}
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground px-3 pt-4 pb-1">
              Inbox
            </div>

            <button 
              onClick={() => {
                setActiveTab("submissions");
                setSubmissionsSubTab("messages");
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "submissions" || activeTab === "messages" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4" />
                <span>Submissions &amp; Inquiries</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === "submissions" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                Inbox
              </span>
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Kural Management Tab */}
            {activeTab === "kural" && (
              <AdminKuralSection onShowToast={showToast} />
            )}

            {activeTab === "home" && (
              <AdminHomeSection onShowToast={showToast} />
            )}

            {activeTab === "join" && (
              <AdminJoinSection onShowToast={showToast} />
            )}

            {activeTab === "moments" && (
              <AdminMomentsSection onShowToast={showToast} />
            )}

            {activeTab === "team" && (
              <AdminTeamSection onShowToast={showToast} />
            )}

            {activeTab === "contact" && (
              <AdminContactSection onShowToast={showToast} />
            )}

            {activeTab === "recruitment" && (
              <AdminRecruitmentSection onShowToast={showToast} />
            )}

            {(activeTab === "submissions" || activeTab === "messages") && (
              <SubmissionsHub
                initialSubTab={activeTab === "messages" ? "messages" : submissionsSubTab}
                onShowToast={showToast}
                moments={moments}
              />
            )}

          </div>

        </div>
      </div>

      {/* Global In-Browser Image Crop Modal */}
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
          queueInfo={
            activeCrop.galleryQueue
              ? {
                  current: activeCrop.galleryQueue.currentIndex + 1,
                  total: activeCrop.galleryQueue.files.length,
                }
              : undefined
          }
          onApply={handleCropModalApply}
          onCancel={() => setActiveCrop(null)}
          onSkip={handleCropModalSkip}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold border transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success" 
              ? "bg-emerald-950 text-emerald-100 border-emerald-800 shadow-emerald-950/20" 
              : toast.type === "error"
              ? "bg-red-950 text-red-100 border-red-800 shadow-red-950/20"
              : "bg-neutral-900 text-white border-neutral-700 shadow-black/20"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          <span>{toast.message}</span>
          <button 
            type="button" 
            onClick={() => setToast(null)}
            className="ml-2 text-white/60 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
