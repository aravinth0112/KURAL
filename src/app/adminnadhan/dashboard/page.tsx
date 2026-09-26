"use client";

import { useState, useEffect } from "react";
import { 
  Plus, X, Image as ImageIcon, Settings, LogOut, Trash2, Home, Users, Pencil, UserPlus,
  BookOpen, Eye, ArrowUp, ArrowDown, Sparkles, Compass, Target, CalendarDays, Palette, 
  Users2, Award, Heart, Megaphone, Music, Camera, Check, ExternalLink, Star,
  Mail, Inbox, Clock, Calendar, CheckCircle2, AlertCircle,
  Search, FileText, Crop
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { compressImage } from "@/utils/compressImage";
import { generateMediaFileName } from "@/utils/cropImage";
import ImageCropModal from "@/components/admin/ImageCropModal";
import SubmissionsHub from "@/components/admin/SubmissionsHub";

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
  const [activeTab, setActiveTab] = useState("moments");
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
            {/* Category: Content Management */}
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground px-3 pt-1 pb-1">
              Content &amp; Pages
            </div>

            <button 
              onClick={() => setActiveTab("moments")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "moments" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <ImageIcon className="w-4 h-4" /> Moments &amp; Events
            </button>

            <button 
              onClick={() => setActiveTab("team")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "team" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <Users className="w-4 h-4" /> Team Members
            </button>

            <button 
              onClick={() => setActiveTab("kural")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "kural" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <BookOpen className="w-4 h-4" /> Kural Management
            </button>

            <button 
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "home" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <Home className="w-4 h-4" /> Pages &amp; Copy
            </button>

            <button 
              onClick={() => setActiveTab("join")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${activeTab === "join" ? "bg-primary text-white shadow-xs" : "bg-white text-foreground hover:bg-secondary border border-border"}`}
            >
              <UserPlus className="w-4 h-4" /> Join Us Page
            </button>

            {/* Category: Community Submissions */}
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground px-3 pt-4 pb-1">
              Community Inquiries
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
                <span>Submissions Hub</span>
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
              <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col min-h-[500px]">
                {/* Top Bar with Status and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border gap-4">
                  <div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
                      Kural Management
                    </h2>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                      Manage all content displayed on the public <Link href="/kural" target="_blank" className="text-primary font-bold hover:underline">/kural</Link> page.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleSaveKural}
                      disabled={savingKural}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-sm transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingKural ? "Saving..." : "Save Kural Page"}
                    </button>
                  </div>
                </div>

                <div className="space-y-10">
                  {/* SECTION 1: KURAL INTRODUCTION */}
                  <div className="bg-secondary/40 p-6 sm:p-8 rounded-3xl border border-border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-bold text-foreground">
                          Kural Identity & Introduction
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
                            onClick={handleRecropKuralLogo}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary text-foreground font-bold text-xs border border-border transition-colors shadow-2xs"
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
                              onChange={handleSelectKuralLogo}
                            />
                          </label>
                          {(kuralLogoFile || (kuralLogoUrl && kuralLogoUrl !== "/kural-logo.png")) && (
                            <button
                              type="button"
                              onClick={() => {
                                setKuralLogoFile(null);
                                setKuralLogoUrl("/kural-logo.png");
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-red-500 bg-secondary hover:bg-red-50 transition-colors border border-border"
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
                        <label className="text-xs font-bold text-foreground">Transliteration & Meaning</label>
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
                              Kural Definition (Organization & Club)
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

                    {/* SECTION 2: FEATURED SHOWCASE IMAGE */}
                    <div className="bg-secondary/40 p-6 sm:p-8 rounded-3xl border border-border">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div>
                          <h3 className="font-heading text-lg font-bold text-foreground">
                            Featured Showcase Image
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Upload or replace the organization banner image displayed on the Kural page.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Current Image Preview */}
                        {kuralImageUrl && !kuralImageFile && (
                          <div className="p-4 bg-white rounded-2xl border border-border flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-40 h-24 rounded-xl overflow-hidden bg-secondary border border-border shrink-0">
                              <img src={kuralImageUrl} alt="Current banner" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <span className="text-xs font-bold text-foreground block truncate">
                                Current Active Banner Image
                              </span>
                              <span className="text-[11px] text-muted-foreground break-all block mt-0.5">
                                {kuralImageUrl}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={handleRecropKuralImage}
                                className="px-3 py-1.5 bg-white border border-border hover:border-primary text-primary rounded-xl font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Re-crop existing banner"
                              >
                                <Crop className="w-3 h-3" />
                                <span>Re-crop</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveKuralImage}
                                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors shrink-0"
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Staged New Banner Preview */}
                        {kuralImageFile && (
                          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-40 h-24 rounded-xl overflow-hidden bg-secondary border border-emerald-300 shrink-0">
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
                                onClick={handleRecropKuralImage}
                                className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Re-crop staged banner"
                              >
                                <Crop className="w-3 h-3" />
                                <span>Re-crop</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setKuralImageFile(null)}
                                className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors shrink-0"
                              >
                                Cancel Staged
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">
                            Upload New Image {kuralImageUrl ? "(Leave empty to keep existing image)" : "(Optional)"}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSelectKuralImage}
                            className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Recommended formats: PNG, JPG, WebP. Recommended resolution: 1920x800 or 1200x600 px banner. Uploaded securely and stored for the site.
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
                            Vision & Mission
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
                              Add, edit, reorder, or remove initiative & activity cards.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenAddCard}
                          className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" /> Add Card
                        </button>
                      </div>

                      {/* Card Add/Edit Form Modal / Drawer */}
                      {isAddingKuralCard && (
                        <form onSubmit={handleSaveCard} className="mb-6 p-5 bg-white rounded-2xl border-2 border-primary/30 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <h4 className="font-bold text-sm text-foreground">
                              {editingKuralCardId ? "✏️ Edit Card" : "➕ Add New What We Do Card"}
                            </h4>
                            <button
                              type="button"
                              onClick={() => { setIsAddingKuralCard(false); setEditingKuralCardId(null); }}
                              className="text-muted-foreground hover:text-foreground"
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
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all text-left ${isSelected ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-white text-muted-foreground hover:border-primary/40"}`}
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
                              onClick={() => { setIsAddingKuralCard(false); setEditingKuralCardId(null); }}
                              className="px-4 py-2 rounded-xl border border-border text-foreground text-xs font-bold hover:bg-secondary transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
                            >
                              {editingKuralCardId ? "Update Card" : "Save Card"}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Current Cards List */}
                      <div className="space-y-3">
                        {kuralWhatWeDo.map((item, idx) => {
                          const iconObj = AVAILABLE_KURAL_ICONS.find(i => i.name === item.icon);
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
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveCard(idx, "down")}
                                  disabled={idx === kuralWhatWeDo.length - 1}
                                  title="Move Down"
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditCard(item)}
                                  title="Edit Card"
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCard(item.id)}
                                  title="Delete Card"
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
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
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">CTA Badge</label>
                          <input
                            type="text"
                            value={kuralCtaBadge}
                            onChange={(e) => setKuralCtaBadge(e.target.value)}
                            placeholder="Get Involved"
                            className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Main Heading / Quote</label>
                          <input
                            type="text"
                            value={kuralCtaTitle}
                            onChange={(e) => setKuralCtaTitle(e.target.value)}
                            placeholder="“Join for the community. Stay for the growth. Leave a legacy.”"
                            className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">CTA Description</label>
                          <textarea
                            value={kuralCtaDesc}
                            onChange={(e) => setKuralCtaDesc(e.target.value)}
                            rows={3}
                            placeholder="Whether you want to perform on stage, help coordinate celebrations..."
                            className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
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
                            {/* Route Suggestions */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {KNOWN_SITE_ROUTES.slice(0, 5).map((r) => (
                                <button
                                  key={r.path}
                                  type="button"
                                  onClick={() => setKuralCtaBtnLink(r.path)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
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
                            {/* Route Suggestions */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {KNOWN_SITE_ROUTES.slice(1, 6).map((r) => (
                                <button
                                  key={r.path}
                                  type="button"
                                  onClick={() => setKuralCtaSecondaryLink(r.path)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                                    kuralCtaSecondaryLink === r.path
                                      ? "bg-primary text-white border-primary"
                                      : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                                  }`}
                                >
                                  {r.path}
                                </button>
                              ))}
                            </div>
                            {kuralCtaSecondaryLink && !kuralCtaSecondaryLink.startsWith("/") && !kuralCtaSecondaryLink.startsWith("http://") && !kuralCtaSecondaryLink.startsWith("https://") && !kuralCtaSecondaryLink.startsWith("#") && (
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
                        disabled={savingKural}
                        className="px-8 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-sm transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingKural ? "Saving..." : "Save Kural Page"}
                      </button>
                    </div>
                  </div>
                </div>
            )}


            {activeTab === "home" && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-border shadow-sm flex flex-col min-h-[400px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border gap-4">
                  <div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">Pages &amp; Copy Management</h2>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
                      Configure hero taglines, homepage showcase headers, and photo gallery titles across public pages.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => handleSaveHome(e as any)}
                    disabled={savingHome}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 flex items-center gap-2"
                  >
                    {savingHome ? "Saving..." : "Save Changes"}
                  </button>
                </div>
                
                <form onSubmit={handleSaveHome} className="space-y-6 flex-1 flex flex-col">
                  {/* Section 01 */}
                  <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">01</span>
                      <div>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Homepage Hero &amp; Mission Narrative</h3>
                        <p className="text-xs text-muted-foreground">Controls the primary community paragraph shown on the main homepage.</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground">Hero Description Text</label>
                      <textarea 
                        value={homeHeroText}
                        onChange={(e) => setHomeHeroText(e.target.value)}
                        className="w-full min-h-[120px] bg-white border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y text-sm font-medium"
                        placeholder="The vibrant heartbeat of Tamil culture..."
                        required
                      />
                    </div>
                  </div>

                  {/* Section 02 */}
                  <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">02</span>
                      <div>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Homepage Moments Showcase (Preview Section on /)</h3>
                        <p className="text-xs text-muted-foreground">Heading and subtitle text for the moments showcase preview block on the homepage.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Showcase Section Title</label>
                        <input 
                          type="text" 
                          value={homeMomentsTitle}
                          onChange={(e) => setHomeMomentsTitle(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
                          placeholder="Recent Moments."
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Showcase Subtitle</label>
                        <input 
                          type="text" 
                          value={homeMomentsSubtitle}
                          onChange={(e) => setHomeMomentsSubtitle(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
                          placeholder="Memories from our campus celebrations."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 03 */}
                  <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">03</span>
                      <div>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">Moments &amp; Archive Gallery (Public /gallery Page)</h3>
                        <p className="text-xs text-muted-foreground">Hero title and subtitle displayed at the top of the full public /gallery page.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Gallery Hero Title</label>
                        <input 
                          type="text" 
                          value={galleryTitle}
                          onChange={(e) => setGalleryTitle(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
                          placeholder="Moments & Archive."
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">Gallery Subtitle</label>
                        <input 
                          type="text" 
                          value={gallerySubtitle}
                          onChange={(e) => setGallerySubtitle(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-sm"
                          placeholder="A complete photo archive of our celebrations..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-border mt-4">
                    <button 
                      type="submit" 
                      disabled={savingHome}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingHome ? "Saving..." : "Save Pages & Copy"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "join" && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-border shadow-sm flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="font-heading text-3xl font-extrabold text-foreground">Manage Join Us Page</h2>
                    <p className="text-muted-foreground text-sm font-medium mt-1">
                      Configure public community channels, social links, and core team CTA displayed on <Link href="/join" target="_blank" className="text-primary font-bold hover:underline">/join</Link>.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => handleSaveJoin(e as any)}
                    disabled={savingJoin}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {savingJoin ? "Saving..." : "Save Changes"}
                  </button>
                </div>
                
                <form onSubmit={handleSaveJoin} className="space-y-8 flex-1 flex flex-col">
                  {/* Hero Header */}
                  <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
                    <h3 className="font-heading text-lg font-bold text-foreground">1. Hero Header</h3>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">Page Title</label>
                      <input 
                        type="text" 
                        value={joinTitle}
                        onChange={(e) => setJoinTitle(e.target.value)}
                        className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Join the Family."
                        required
                      />
                      <p className="text-[11px] text-muted-foreground">The last word will automatically appear in orange highlight on the public website.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">Page Subtitle</label>
                      <textarea 
                        value={joinSubtitle}
                        onChange={(e) => setJoinSubtitle(e.target.value)}
                        className="w-full min-h-[80px] bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                        placeholder="Connect with Tamil students at LPU..."
                        required
                      />
                    </div>
                  </div>

                  {/* Channel Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* WhatsApp Card */}
                    <div className="bg-[#25D366]/5 border border-[#25D366]/20 p-6 rounded-3xl space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#25D366]" />
                        <h3 className="font-heading text-lg font-bold text-foreground">WhatsApp Card</h3>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Card Title</label>
                        <input 
                          type="text"
                          value={joinWhatsappTitle}
                          onChange={(e) => setJoinWhatsappTitle(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#25D366] focus:outline-none"
                          placeholder="WhatsApp"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Description</label>
                        <textarea 
                          value={joinWhatsappDesc}
                          onChange={(e) => setJoinWhatsappDesc(e.target.value)}
                          rows={2}
                          className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-[#25D366] focus:outline-none resize-y"
                          placeholder="Join the main community group..."
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Invite Link URL</label>
                        <input 
                          type="url"
                          value={joinWhatsappLink}
                          onChange={(e) => setJoinWhatsappLink(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-[#25D366] focus:outline-none"
                          placeholder="https://chat.whatsapp.com/..."
                          required
                        />
                      </div>
                    </div>

                    {/* Instagram Card */}
                    <div className="bg-[#E4405F]/5 border border-[#E4405F]/20 p-6 rounded-3xl space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#E4405F]" />
                        <h3 className="font-heading text-lg font-bold text-foreground">Instagram Card</h3>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Card Title</label>
                        <input 
                          type="text"
                          value={joinInstagramTitle}
                          onChange={(e) => setJoinInstagramTitle(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#E4405F] focus:outline-none"
                          placeholder="Instagram"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Description</label>
                        <textarea 
                          value={joinInstagramDesc}
                          onChange={(e) => setJoinInstagramDesc(e.target.value)}
                          rows={2}
                          className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-[#E4405F] focus:outline-none resize-y"
                          placeholder="Follow our grid for event highlights..."
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Profile Link URL</label>
                        <input 
                          type="url"
                          value={joinInstagramLink}
                          onChange={(e) => setJoinInstagramLink(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-[#E4405F] focus:outline-none"
                          placeholder="https://www.instagram.com/..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Core Team CTA Banner */}
                  <div className="bg-secondary/40 p-6 rounded-3xl border border-border space-y-4">
                    <h3 className="font-heading text-lg font-bold text-foreground">3. Core Team Coordinator CTA Block</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Banner Heading</label>
                        <input 
                          type="text"
                          value={joinTeamCtaTitle}
                          onChange={(e) => setJoinTeamCtaTitle(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                          placeholder="Interested in Student Leadership?"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Button Text</label>
                        <input 
                          type="text"
                          value={joinTeamCtaBtnText}
                          onChange={(e) => setJoinTeamCtaBtnText(e.target.value)}
                          className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                          placeholder="Apply for Student Team"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Description</label>
                      <textarea 
                        value={joinTeamCtaDesc}
                        onChange={(e) => setJoinTeamCtaDesc(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                        placeholder="While our community groups are open to every Tamil student, the Kural Student Organization coordinates campus festivals..."
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Button Destination Link</label>
                      <input 
                        type="text"
                        value={joinTeamCtaBtnLink}
                        onChange={(e) => setJoinTeamCtaBtnLink(e.target.value)}
                        className="w-full bg-white border border-border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="/team#join"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-2 border-t border-border mt-4">
                    <button 
                      type="submit" 
                      disabled={savingJoin}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {savingJoin ? "Saving..." : "Save Join Us Page"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "moments" && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-heading text-3xl font-extrabold text-foreground">Manage Moments</h2>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Events, celebrations, and photo albums displayed on the public gallery.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isAdding) {
                          cancelEdit();
                        } else {
                          setIsAdding(true);
                          setEditingId(null);
                          setIsUpcomingForm(false);
                        }
                      }}
                      className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition-colors shrink-0"
                    >
                      {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                      {isAdding ? (isFormDirty ? "Discard & Close" : "Close Form") : "Add Moment"}
                    </button>
                  </div>
                </div>

                {/* Draft Resume Alert Banner */}
                {eventDraft && !isAdding && (
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-950">
                          Unsaved Event Draft Available ({new Date(eventDraft.savedAt).toLocaleDateString()})
                        </p>
                        <p className="text-[11px] text-amber-800 truncate max-w-md">
                          "{eventDraft.title || 'Untitled Draft'}" • {eventDraft.tag || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResumeEventDraft}
                        className="px-3.5 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors shadow-xs"
                      >
                        Resume Draft
                      </button>
                      <button
                        type="button"
                        onClick={handleDiscardEventDraft}
                        className="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-50 transition-colors"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}

                {/* Dismissible Tip Banner */}
                {!dismissedTip && (
                  <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between text-xs text-muted-foreground mb-6 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        💡 Tip: Select <strong className="text-primary font-bold">Upcoming Event</strong> on any celebration to pin its poster at the top of the Moments page.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDismissedTip(true)}
                      className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
                      title="Dismiss tip"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {isAdding ? (
                  <form onSubmit={handleSubmit} className="bg-secondary p-6 md:p-8 rounded-3xl border border-border mb-8 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <h3 className="font-heading text-xl font-extrabold text-foreground">
                          {editingId ? "✏️ Edit Event Details" : "➕ Add New Event"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Create a rich case-study style event page with full story and photo gallery.
                        </p>
                      </div>
                      {editingId && (
                        <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">
                          Editing #{editingId}
                        </span>
                      )}
                    </div>

                    {/* Section 01: Event Identity & Meta */}
                    <div className="bg-white p-5 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">01</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Event Identity &amp; Details</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Event Title *</label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Pongal Vizha 2027"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Date String *</label>
                          <input
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            placeholder="e.g. JAN 2027 or OCT 2026"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Category / Tag *</label>
                          <select
                            value={MOMENT_TAG_OPTIONS.includes(tag) ? tag : (tag ? "Custom" : "")}
                            onChange={(e) => {
                              if (e.target.value === "Custom") {
                                setTag("");
                              } else {
                                setTag(e.target.value);
                              }
                            }}
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                          >
                            <option value="">Select Category</option>
                            {MOMENT_TAG_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                            <option value="Custom">Custom / Other Category...</option>
                          </select>
                          {(!MOMENT_TAG_OPTIONS.includes(tag) || tag === "") && (
                            <input
                              type="text"
                              value={tag}
                              onChange={(e) => setTag(e.target.value)}
                              placeholder="Enter custom category name..."
                              className="w-full bg-secondary border border-border rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none mt-1.5"
                              required
                            />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Location / Venue</label>
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Baldev Raj Mittal Unipolis, LPU"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Organized By</label>
                          <input
                            type="text"
                            value={organizedBy}
                            onChange={(e) => setOrganizedBy(e.target.value)}
                            placeholder="e.g. Kural • LPU Tamizhans Team"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 02: Display & Schedule Status */}
                    <div className="bg-white p-5 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">02</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Display &amp; Schedule Status</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Upcoming Event Card */}
                        <button
                          type="button"
                          onClick={() => setIsUpcomingForm(true)}
                          className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                            isUpcomingForm
                              ? "bg-primary/[0.07] border-primary ring-2 ring-primary/40 shadow-xs"
                              : "bg-secondary/40 border-border hover:border-primary/40 hover:bg-primary/[0.02]"
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isUpcomingForm ? "bg-primary text-white shadow-xs" : "border-2 border-border bg-white"
                          }`}>
                            {isUpcomingForm && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${isUpcomingForm ? "text-primary" : "text-foreground"}`}>Upcoming Event</span>
                              {isUpcomingForm && (
                                <span className="text-[10px] bg-primary text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Active Poster
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              Showcases at top of Moments page as the featured upcoming celebration poster.
                            </p>
                          </div>
                        </button>

                        {/* Past Event Card */}
                        <button
                          type="button"
                          onClick={() => setIsUpcomingForm(false)}
                          className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                            !isUpcomingForm
                              ? "bg-foreground/[0.06] border-foreground/30 ring-2 ring-foreground/20 shadow-xs"
                              : "bg-secondary/40 border-border hover:border-foreground/30 hover:bg-secondary/60"
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            !isUpcomingForm ? "bg-foreground text-background shadow-xs" : "border-2 border-border bg-white"
                          }`}>
                            {!isUpcomingForm && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${!isUpcomingForm ? "text-foreground" : "text-muted-foreground"}`}>Past Event</span>
                              {!isUpcomingForm && (
                                <span className="text-[10px] bg-foreground text-background font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Archived
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              Archives this celebration down below in Past Celebrations, sorted automatically by date and time.
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Feature on Homepage Toggle */}
                      <div className="bg-amber-500/[0.08] border border-amber-500/30 rounded-2xl p-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                            <Star className={`w-4 h-4 ${isFeatured ? "fill-amber-500 text-amber-500" : "text-amber-500"}`} />
                            <span>Feature on Homepage Preview</span>
                            {isFeatured && (
                              <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                                {editingId && featuredSequence.includes(editingId)
                                  ? `Featured #${featuredSequence.indexOf(editingId) + 1}`
                                  : `Featured #${featuredSequence.length + 1}`}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                            Featured moments appear in order on the homepage preview. Priority is set automatically in the sequence they are selected.
                          </p>
                        </div>

                        {/* Custom Switch Control */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isFeatured}
                          onClick={() => setIsFeatured(!isFeatured)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isFeatured ? "bg-amber-500" : "bg-neutral-300 dark:bg-neutral-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isFeatured ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Section 03: Cover Photo or Video */}
                    <div className="bg-white p-5 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">03</span>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Cover Photo or Video {editingId ? "(Optional if keeping current)" : "*"}
                          </h4>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                          Recommended: 16:9 or 4:3 (e.g. 1920×1080px), up to 10MB
                        </span>
                      </div>

                      {/* Current Cover Preview */}
                      {currentImageUrl && !file && (
                        <div className="p-3 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-16 h-12 rounded-xl overflow-hidden bg-secondary border border-border shrink-0">
                              {isVideo(currentImageUrl) ? (
                                <video src={currentImageUrl} className="w-full h-full object-cover" />
                              ) : (
                                <img src={currentImageUrl} alt="Current Cover" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground block">Current Active Cover</span>
                              <span className="text-[11px] text-muted-foreground truncate block">{currentImageUrl}</span>
                            </div>
                          </div>
                          {!isVideo(currentImageUrl) && (
                            <button
                              type="button"
                              onClick={handleRecropCoverMedia}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border hover:border-primary text-primary text-xs font-bold transition-all shadow-2xs hover:scale-105 shrink-0 cursor-pointer"
                              title="Re-crop active cover photo"
                            >
                              <Crop className="w-3.5 h-3.5" />
                              <span>Re-crop</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Staged New Cover Preview */}
                      {file && (
                        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-16 h-12 rounded-xl overflow-hidden bg-secondary border border-emerald-300 shrink-0">
                              {file.type.startsWith("video/") ? (
                                <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                              ) : (
                                <img src={URL.createObjectURL(file)} alt="Staged Preview" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Staged Cover (Unsaved)
                              </span>
                              <span className="text-[11px] text-emerald-700 truncate block">
                                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!file.type.startsWith("video/") && (
                              <button
                                type="button"
                                onClick={handleRecropCoverMedia}
                                className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Re-crop staged cover"
                              >
                                <Crop className="w-3 h-3" />
                                <span>Re-crop</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setFile(null)}
                              className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0"
                            >
                              Cancel Staged
                            </button>
                          </div>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*,video/mp4,video/quicktime,video/webm"
                        onChange={handleSelectCoverMedia}
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>

                    {/* Section 04: Story & Highlights */}
                    <div className="bg-white p-5 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">04</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Story, Narrative &amp; Highlights</h4>
                      </div>

                      {/* Short Description */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Short Summary (Shown on event card previews)</label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="A brief 1-2 sentence preview of the celebration..."
                          className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      {/* Detailed Story (About) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Full Event Narrative (About &amp; Significance)</label>
                        <textarea
                          value={about}
                          onChange={(e) => setAbout(e.target.value)}
                          placeholder="Write the full narrative of the event, significance, student participation, and atmosphere..."
                          className="w-full bg-secondary border border-border rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none min-h-[140px] resize-y"
                        />
                      </div>

                      {/* Highlights & Activities */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Highlights &amp; Key Moments (1 per line)</label>
                          <textarea
                            value={highlights}
                            onChange={(e) => setHighlights(e.target.value)}
                            placeholder="• Pongal pot celebration&#10;• Traditional Parai music&#10;• 400+ attendees in traditional wear"
                            className="w-full bg-secondary border border-border rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none min-h-[120px] resize-y"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Activities &amp; Performances (1 per line)</label>
                          <textarea
                            value={activities}
                            onChange={(e) => setActivities(e.target.value)}
                            placeholder="• Bharatanatyam &amp; folk dance&#10;• Uri Adi (pot breaking) game&#10;• Tamil quiz &amp; student games"
                            className="w-full bg-secondary border border-border rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none min-h-[120px] resize-y"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 05: Photo Gallery Archive */}
                    <div className="bg-white p-5 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">05</span>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Event Photo Gallery (Upload Multiple Photos)
                          </h4>
                        </div>
                        {galleryImages.length > 0 && (
                          <span className="text-xs font-bold text-muted-foreground">
                            {galleryImages.length} existing photo(s)
                          </span>
                        )}
                      </div>
                      
                      {/* Staged gallery files preview */}
                      {galleryFiles && galleryFiles.length > 0 && (
                        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 shadow-xs">
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {galleryFiles.length} New Gallery Photo(s) Staged &amp; Cropped (Unsaved)
                          </span>
                          <button
                            type="button"
                            onClick={() => setGalleryFiles(null)}
                            className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
                          >
                            Clear Staged
                          </button>
                        </div>
                      )}

                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleSelectGalleryFiles}
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Select multiple photos at once. They will appear in the event's interactive lightbox gallery. PNG, JPG, or WebP up to 10MB each.
                      </p>

                      {/* Existing gallery images previews with recrop and remove buttons */}
                      {galleryImages.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 pt-2">
                          {galleryImages.map((imgUrl, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white border border-border group">
                              <img src={imgUrl} alt={`gallery ${i}`} className="w-full h-full object-cover" />
                              <div className="absolute top-1 right-1 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                {!isVideo(imgUrl) && (
                                  <button
                                    type="button"
                                    onClick={() => handleRecropGalleryImage(i)}
                                    title="Re-crop photo"
                                    className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-all shadow cursor-pointer"
                                  >
                                    <Crop className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(i)}
                                  title="Remove photo"
                                  className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={uploading}
                          className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                        >
                          {uploading ? "Publishing Event..." : editingId ? "Update Event Details" : "Publish Event"}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEventDraft}
                          className="bg-secondary border border-border text-foreground hover:bg-primary/10 hover:text-primary font-bold px-5 py-3 rounded-xl transition-colors text-sm flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4 text-primary" />
                          <span>Save as Draft</span>
                        </button>
                      </div>

                      {isFormDirty && (
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="bg-white border border-border text-foreground font-bold px-6 py-3 rounded-xl hover:bg-secondary transition-colors text-sm"
                        >
                          Cancel / Discard
                        </button>
                      )}
                    </div>
                  </form>
                ) : null}

                {/* Filter and Overview Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFeaturedFilter("all")}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        featuredFilter === "all"
                          ? "bg-primary text-white shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All Moments ({moments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturedFilter("featured")}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                        featuredFilter === "featured"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-amber-500/10"
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                      Featured on Homepage ({featuredSequence.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturedFilter("upcoming")}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                        featuredFilter === "upcoming"
                          ? "bg-primary text-white shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Upcoming Poster ({upcomingMomentId ? 1 : 0})
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    💡 To set an event as the <span className="font-bold text-primary">Upcoming Poster</span>, click edit and choose "Upcoming Event". ⭐ Click <span className="font-bold text-foreground">"Feature"</span> to prioritize on Homepage.
                  </p>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <p className="font-medium text-muted-foreground">Loading moments from database...</p>
                  ) : moments.length === 0 ? (
                    <div className="bg-secondary p-8 rounded-2xl text-center text-muted-foreground font-medium border border-border border-dashed">
                      No moments found. Click 'Add Moment' to upload your first event!
                    </div>
                  ) : (
                    (() => {
                      const displayedMoments = featuredFilter === "featured"
                        ? [...moments.filter((m) => featuredSequence.includes(m.id))].sort((a, b) => featuredSequence.indexOf(a.id) - featuredSequence.indexOf(b.id))
                        : featuredFilter === "upcoming"
                        ? moments.filter((m) => m.id === upcomingMomentId)
                        : moments;

                      if (displayedMoments.length === 0 && featuredFilter === "featured") {
                        return (
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8 text-center space-y-3">
                            <Star className="w-8 h-8 text-amber-500 mx-auto" />
                            <p className="font-bold text-foreground">No moments currently set as featured.</p>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                              Switch to "All Moments" and click the ⭐ "Feature" button next to any celebration to display it on the homepage.
                            </p>
                            <button
                              type="button"
                              onClick={() => setFeaturedFilter("all")}
                              className="text-xs font-bold text-primary hover:underline"
                            >
                              Show All Moments →
                            </button>
                          </div>
                        );
                      }

                      if (displayedMoments.length === 0 && featuredFilter === "upcoming") {
                        return (
                          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-3">
                            <Clock className="w-8 h-8 text-primary mx-auto" />
                            <p className="font-bold text-foreground">No moment is currently set as Upcoming Poster.</p>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                              Switch to "All Moments" and click the 📅 "Upcoming" button next to any event to showcase its poster at the top of the Moments page.
                            </p>
                            <button
                              type="button"
                              onClick={() => setFeaturedFilter("all")}
                              className="text-xs font-bold text-primary hover:underline"
                            >
                              Show All Moments →
                            </button>
                          </div>
                        );
                      }

                      return displayedMoments.map((moment) => {
                        const isFeat = featuredSequence.includes(moment.id);
                        const fOrder = isFeat ? featuredSequence.indexOf(moment.id) + 1 : 0;
                        const isUp = upcomingMomentId === moment.id;

                        return (
                          <div
                            key={moment.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-2xl transition-all gap-4 ${
                              isUp
                                ? "bg-primary/[0.04] border-primary shadow-sm"
                                : isFeat
                                ? "bg-amber-500/[0.03] border-amber-500/40 hover:border-amber-500 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-border">
                                {moment.image_url ? (
                                  <img src={moment.image_url} alt={moment.title} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="text-muted-foreground w-6 h-6" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{moment.title}</h3>
                                  {isUp && (
                                    <span className="inline-flex items-center gap-1 bg-primary text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                                      <Clock className="w-3 h-3" />
                                      Upcoming Poster
                                    </span>
                                  )}
                                  {isFeat && (
                                    <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                      Featured #{fOrder}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{moment.tag}</span>
                                  <span className="font-medium text-muted-foreground">{moment.date}</span>
                                  {moment.location && (
                                    <span className="text-muted-foreground hidden md:inline truncate max-w-xs">• {moment.location}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                              {/* Quick toggle featured button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(moment.id)}
                                title={isFeat ? "Click to remove from Homepage Featured" : "Click to feature on Homepage"}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                  isFeat
                                    ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600 shadow-sm"
                                    : "bg-secondary text-muted-foreground border-border hover:border-amber-500/50 hover:text-amber-700 hover:bg-amber-500/10"
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFeat ? "fill-white" : ""}`} />
                                <span>{isFeat ? `Featured #${fOrder}` : "Feature"}</span>
                              </button>

                              {/* External public link */}
                              <Link
                                href={`/gallery/${moment.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View public event page"
                                className="p-2 text-muted-foreground hover:text-primary bg-secondary hover:bg-primary/10 rounded-xl transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => startEdit(moment)}
                                title="Edit details"
                                className="p-2 text-muted-foreground hover:text-primary bg-secondary hover:bg-primary/10 rounded-xl transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleDelete(moment.id)}
                                title="Delete moment"
                                className="p-2 text-muted-foreground hover:text-red-500 bg-secondary hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-border shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="font-heading text-3xl font-extrabold text-foreground">Manage Team Members</h2>
                    <p className="text-muted-foreground text-sm font-medium mt-1">
                      Add, edit, or remove leadership and team members shown on the public Team page.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isAddingMember) {
                        cancelEditMember();
                      } else {
                        setIsAddingMember(true);
                        setEditingMemberId(null);
                      }
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-primary/90 transition-colors shrink-0"
                  >
                    {isAddingMember ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isAddingMember ? "Cancel" : "Add Member"}
                  </button>
                </div>

                {isAddingMember ? (
                  <form onSubmit={handleSubmitMember} className="bg-secondary p-6 md:p-8 rounded-3xl border border-border mb-8 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <h3 className="font-heading text-xl font-extrabold text-foreground">
                          {editingMemberId ? "✏️ Edit Member Profile" : "➕ Add New Team Member"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Configure leadership or coordinator profiles displayed on the public Team page.
                        </p>
                      </div>
                      {editingMemberId && (
                        <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">
                          Editing #{editingMemberId}
                        </span>
                      )}
                    </div>

                    {/* Section 01: Profile Identity & Role Details */}
                    <div className="bg-white p-5 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">01</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Profile Identity &amp; Role Details</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Full Name *</label>
                          <input
                            type="text"
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                            placeholder="e.g. Aravinth Rajendiran"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Role / Position *</label>
                          <input
                            type="text"
                            value={memberRole}
                            onChange={(e) => setMemberRole(e.target.value)}
                            placeholder="e.g. President / Tech Lead / Event Coordinator"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Department *</label>
                          <select
                            value={memberDepartment}
                            onChange={(e) => setMemberDepartment(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                          >
                            <option value="">Select Department</option>
                            <option value="Core Team">Core Team (Leadership &amp; Operations)</option>
                            <option value="Events &amp; Cultural">Events &amp; Cultural</option>
                            <option value="Media &amp; Production">Media &amp; Production</option>
                            <option value="Technical &amp; Web">Technical &amp; Web</option>
                            <option value="Design &amp; Creative">Design &amp; Creative</option>
                            <option value="Public Relations &amp; Outreach">Public Relations &amp; Outreach</option>
                            {memberDepartment && ![
                              "Core Team",
                              "Events & Cultural",
                              "Media & Production",
                              "Technical & Web",
                              "Design & Creative",
                              "Public Relations & Outreach"
                            ].includes(memberDepartment) && (
                              <option value={memberDepartment}>
                                {memberDepartment} (Current Custom)
                              </option>
                            )}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Batch / Year *</label>
                          <input
                            type="text"
                            value={memberBatch}
                            onChange={(e) => setMemberBatch(e.target.value)}
                            placeholder="e.g. 2024 - 2028 or 3rd Year"
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground">Display Priority (Order)</label>
                          <input
                            type="number"
                            value={memberOrderNum}
                            onChange={(e) => setMemberOrderNum(e.target.value)}
                            placeholder="0 = Default, 1, 2, 3..."
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 02: Profile Photo & Avatar */}
                    <div className="bg-white p-5 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">02</span>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Profile Photo {editingMemberId ? "(Leave empty to keep existing)" : "*"}
                          </h4>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                          Recommended: 4:5 Portrait (e.g. 800×1000px), PNG, JPG, or WebP up to 5MB
                        </span>
                      </div>

                      {/* Current Member Photo Preview */}
                      {currentMemberPhoto && !memberFile && (
                        <div className="p-3 bg-secondary/50 rounded-2xl border border-border flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary border border-border shrink-0">
                              <img src={currentMemberPhoto} alt="Current Photo" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground block">Current Active Photo</span>
                              <span className="text-[11px] text-muted-foreground truncate block">{currentMemberPhoto}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRecropMemberPhoto}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border hover:border-primary text-primary text-xs font-bold transition-all shadow-2xs hover:scale-105 shrink-0 cursor-pointer"
                            title="Re-crop current photo"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            <span>Re-crop</span>
                          </button>
                        </div>
                      )}

                      {/* Staged New Member Photo Preview */}
                      {memberFile && (
                        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary border border-emerald-300 shrink-0">
                              <img src={URL.createObjectURL(memberFile)} alt="Staged Member Photo" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Staged Photo (Unsaved)
                              </span>
                              <span className="text-[11px] text-emerald-700 truncate block">
                                {memberFile.name} ({(memberFile.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={handleRecropMemberPhoto}
                              className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Re-crop staged photo"
                            >
                              <Crop className="w-3 h-3" />
                              <span>Re-crop</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMemberFile(null)}
                              className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0"
                            >
                              Cancel Staged
                            </button>
                          </div>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSelectMemberPhoto}
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>

                    {/* Section 03: Contributions & Responsibilities */}
                    <div className="bg-white p-5 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">03</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Contributions &amp; Responsibilities</h4>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">What They Do / Contributions (1 per line)</label>
                        <textarea
                          value={memberResponsibilities}
                          onChange={(e) => setMemberResponsibilities(e.target.value)}
                          placeholder="• Leads community web development&#10;• Coordinates Tamil student onboarding&#10;• Organizes cultural fest logistics"
                          className="w-full bg-secondary border border-border rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none min-h-[110px] resize-y"
                        />
                      </div>
                    </div>

                    {/* Section 04: Social & Communication Links */}
                    <div className="bg-white p-5 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">04</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Social &amp; Contact Links (Optional)</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground block">LinkedIn</label>
                          <input
                            type="text"
                            value={memberLinkedin}
                            onChange={(e) => setMemberLinkedin(e.target.value)}
                            placeholder="username or URL"
                            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground block">Email Address</label>
                          <input
                            type="email"
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            placeholder="member@example.com"
                            className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <button
                        type="submit"
                        disabled={uploadingMember}
                        className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                      >
                        {uploadingMember ? "Saving..." : editingMemberId ? "Update Member Profile" : "Save Member"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditMember}
                        className="bg-white border border-border text-foreground font-bold px-6 py-3 rounded-xl hover:bg-secondary transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}

                {/* Clear Visual Divider and Members List Header */}
                <div className="pt-6 border-t border-border mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-foreground">Current Team Roster</h3>
                      <p className="text-xs text-muted-foreground">
                        {members.length} member{members.length === 1 ? "" : "s"} listed on the public site.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/team"
                        target="_blank"
                        className="px-3.5 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span>View Public /team ↗</span>
                      </Link>
                    </div>
                  </div>

                  {/* Members List */}
                  <div className="space-y-4">
                    {loadingMembers ? (
                      <p className="font-medium text-muted-foreground">Loading team members from database...</p>
                    ) : members.length === 0 ? (
                      <div className="bg-secondary/60 p-8 rounded-2xl text-center text-muted-foreground font-medium border border-border border-dashed">
                        No team members found. Click 'Add Member' to create the first profile!
                      </div>
                    ) : (
                      members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 border border-border rounded-2xl hover:border-primary/50 transition-colors bg-white shadow-2xs"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-border">
                              {member.image_url ? (
                                <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                              ) : (
                                <Users className="text-muted-foreground w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-foreground">{member.name}</h3>
                                <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                                  {member.role}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium">
                                <span>{member.department}</span>
                                <span>•</span>
                                <span>{member.batch}</span>
                                {member.order_num !== undefined && member.order_num > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-primary font-bold">Priority #{member.order_num}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/team/${member.id}`}
                              target="_blank"
                              title="View public profile"
                              className="p-2 text-muted-foreground hover:text-primary bg-secondary hover:bg-primary/10 rounded-lg transition-colors text-xs font-bold hidden sm:inline-flex"
                            >
                              View Profile ↗
                            </Link>
                            <button
                              onClick={() => startEditMember(member)}
                              title="Edit member"
                              className="p-2 text-muted-foreground hover:text-primary bg-secondary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              title="Delete member"
                              className="p-2 text-muted-foreground hover:text-red-500 bg-secondary hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Team Applications Submissions Hub Link Card */}
                <div className="mt-8 p-5 bg-primary/5 rounded-3xl border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-primary" />
                      <span>Incoming Core Team Applications</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Applications submitted by students via /team#join are consolidated and managed in the Submissions Hub.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("submissions");
                      setSubmissionsSubTab("applications");
                    }}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs shrink-0 flex items-center gap-2"
                  >
                    <span>Open Applications Hub →</span>
                  </button>
                </div>
              </div>
            )}


            {/* Submissions Hub Tab (Unifies Contact Messages and Team Applications) */}
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
