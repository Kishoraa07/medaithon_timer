import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MoltenMetal from './MoltenMetal';
import ParticleField from './ParticleField';
import SakuraField from './SakuraField';
import { useSyncedTimer } from '../hooks/useSyncedTimer';
import { fetchLivePhotos, uploadLivePhoto, deleteLivePhoto } from '../services/imageService';

const TOTAL_50_HOURS_SECONDS = 50 * 3600; // 180,000 seconds

const INITIAL_PHOTOS = [
  {
    id: 1,
    title: 'Hackathon Keynote & Kickoff',
    kanji: '開会式',
    category: 'Keynote & Kickoff',
    time: 'Day 1 • 10:00 AM',
    location: 'Main Auditorium Hall',
    img: '/images/event/photo_1.jpeg',
    description: 'The dragon awakens! Hackers assemble for track reveals, rules of engagement, and opening ceremonies.',
    likes: 42,
  },
  {
    id: 2,
    title: 'Team Ideation & Brainstorming',
    kanji: '作戦会議',
    category: 'Ideation & Code',
    time: 'Day 1 • 11:45 AM',
    location: 'Design Arena B',
    img: '/images/event/photo_2.jpeg',
    description: 'Cross-functional teams debate architectural diagrams, clinical workflows, and initial wireframes.',
    likes: 38,
  },
  {
    id: 3,
    title: 'Medical Mentorship Deep Dive',
    kanji: '師範問答',
    category: 'Mentorship',
    time: 'Day 1 • 03:30 PM',
    location: 'Mentors Pavilion',
    img: '/images/event/photo_3.jpeg',
    description: 'Senior medical practitioners and clinicians provide real clinical feedback on disease diagnostic prototypes.',
    likes: 56,
  },
  {
    id: 4,
    title: 'Hardware & IoT Prototyping',
    kanji: '回路工作',
    category: 'Hardware & IoT',
    time: 'Day 1 • 06:15 PM',
    location: 'Maker Lab 3',
    img: '/images/event/photo_4.jpeg',
    description: 'Soldering sensors, calibrating microcontroller analog inputs, and assembling wearable vitals monitors.',
    likes: 49,
  },
  {
    id: 5,
    title: 'Late Night Coding & Midnight Fuel',
    kanji: '夜叉連動',
    category: 'Ideation & Code',
    time: 'Day 2 • 01:45 AM',
    location: 'Central Arena Hub',
    img: '/images/event/photo_5.jpeg',
    description: 'The warriors code under the moonlight with hot ramen, matcha, and relentless energy.',
    likes: 64,
  },
  {
    id: 6,
    title: 'AI Model Optimization & Testing',
    kanji: '機械学習',
    category: 'Ideation & Code',
    time: 'Day 2 • 08:30 AM',
    location: 'AI Sandbox Cluster',
    img: '/images/event/photo_6.jpeg',
    description: 'Fine-tuning transformer embeddings and verifying diagnostic inference accuracy against validation sets.',
    likes: 51,
  },
  {
    id: 7,
    title: 'Jury Evaluation & Live Demos',
    kanji: '審査合戦',
    category: 'Mentorship',
    time: 'Day 2 • 02:00 PM',
    location: 'Pitch Theater Alpha',
    img: '/images/event/photo_7.jpeg',
    description: 'Teams showcase real-time working prototypes to the council of judges and medical directors.',
    likes: 58,
  },
  {
    id: 8,
    title: 'SRM Faculty Guidance & Review',
    kanji: '大学指導',
    category: 'Mentorship',
    time: 'Day 2 • 05:20 PM',
    location: 'Academic Review Pod',
    img: '/images/event/photo_8.jpeg',
    description: 'Faculty professors validate research methodology, clinical safety, and patent novelty.',
    likes: 33,
  },
  {
    id: 9,
    title: 'Cross-Domain Collaboration',
    kanji: '結束共創',
    category: 'Ideation & Code',
    time: 'Day 2 • 09:10 PM',
    location: 'Collab Corner 4',
    img: '/images/event/photo_9.jpeg',
    description: 'Bioengineers and software architects merge biomedical telemetry with cloud-hosted neural pipelines.',
    likes: 47,
  },
  {
    id: 10,
    title: 'Clinical Tech Interactive Discussion',
    kanji: '臨床技術',
    category: 'Mentorship',
    time: 'Day 3 • 12:40 AM',
    location: 'Conference Lounge 1',
    img: '/images/event/photo_10.jpeg',
    description: 'Exploring EHR interoperability standards and FHIR protocol integration for clinical deployment.',
    likes: 29,
  },
  {
    id: 11,
    title: 'Innovation Showcase & Expo',
    kanji: '成果展示',
    category: 'Awards & Glory',
    time: 'Day 3 • 10:15 AM',
    location: 'Grand Exhibition Hall',
    img: '/images/event/photo_11.jpeg',
    description: 'Teams reveal their finished hardware enclosures and interactive physician dashboard screens.',
    likes: 72,
  },
  {
    id: 12,
    title: 'Grand Finale & Celebrations',
    kanji: '大団円',
    category: 'Awards & Glory',
    time: 'Day 3 • 02:30 PM',
    location: 'Main Auditorium Hall',
    img: '/images/event/photo_12.jpeg',
    description: 'The auditorium erupts with applause as 50 hours of relentless engineering concludes.',
    likes: 85,
  },
  {
    id: 13,
    title: 'Closing Ceremony & Swag Kit Distribution',
    kanji: '閉会式',
    category: 'Awards & Glory',
    time: 'Day 3 • 04:00 PM',
    location: 'Main Stage Arena',
    img: '/images/event/photo_13.jpeg',
    description: 'Participants receive official MedAIthon certificates, badges, and warrior swag hampers.',
    likes: 67,
  },
  {
    id: 14,
    title: 'Winners & Award Trophies',
    kanji: '勝者表彰',
    category: 'Awards & Glory',
    time: 'Day 3 • 05:30 PM',
    location: 'Main Stage Arena',
    img: '/images/event/photo_14.jpg',
    description: 'The dragon crowns its supreme champions! Cash prizes, trophies, and glory bestowed.',
    likes: 120,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Moments', kanji: '全記録' },
  { id: 'Keynote & Kickoff', label: 'Keynote & Kickoff', kanji: '開会式' },
  { id: 'Ideation & Code', label: 'Ideation & Code', kanji: '開発' },
  { id: 'Hardware & IoT', label: 'Hardware & IoT', kanji: '工作' },
  { id: 'Mentorship', label: 'Mentorship & Demos', kanji: '師範' },
  { id: 'Awards & Glory', label: 'Awards & Glory', kanji: '栄光' },
];

const RealtimeGalleryPage = ({ onNavigateToTimer }) => {
  // Photos state with LocalStorage persistence for user-uploaded moments
  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('medaithon_live_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed, ...INITIAL_PHOTOS];
      }
    } catch {
      // fallback
    }
    return INITIAL_PHOTOS;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showSakura, setShowSakura] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Deletion state
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteToast, setDeleteToast] = useState(null);

  // New photo upload form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Ideation & Code');
  const [newLocation, setNewLocation] = useState('');
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(null);

  // -------------------------------------------------------------
  // 50-HOUR LIVE TIMER ENGINE (Synchronized across all devices)
  // -------------------------------------------------------------
  const {
    elapsedSeconds: timerElapsedSeconds,
    hours: timerHours,
    minutes: timerMinutes,
    seconds: timerSecs,
    tenths,
    progressPercent: timerProgressPercent,
    isTimerRunning,
    syncStatus,
    togglePlayPause: toggleTimerPlayPause,
    resetTimer,
    adjustTime: adjustTimerTime,
  } = useSyncedTimer();

  const timerGaugeRadius = 34;
  const timerGaugeCircumference = 2 * Math.PI * timerGaugeRadius;
  const timerGaugeStrokeDashoffset =
    timerGaugeCircumference - (parseFloat(timerProgressPercent) / 100) * timerGaugeCircumference;

  // Fetch live uploaded photos from Cloudinary / Serverless API on mount
  useEffect(() => {
    let isMounted = true;
    fetchLivePhotos().then((res) => {
      if (isMounted && res && Array.isArray(res.photos) && res.photos.length > 0) {
        setPhotos((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id)));
          const newPhotos = res.photos.filter((p) => !existingIds.has(String(p.id)));
          return [...newPhotos, ...prev];
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Photos based on category
  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return photos;
    return photos.filter((p) => p.category === activeCategory);
  }, [photos, activeCategory]);

  // Current active spotlight photo
  const currentPhoto = useMemo(() => {
    if (filteredPhotos.length === 0) return null;
    const safeIndex = Math.min(currentSlideIndex, filteredPhotos.length - 1);
    return filteredPhotos[safeIndex];
  }, [filteredPhotos, currentSlideIndex]);

  // Slideshow auto-advance
  useEffect(() => {
    if (!slideshowActive || filteredPhotos.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % filteredPhotos.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slideshowActive, filteredPhotos.length]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.code === 'Space') {
        e.preventDefault();
        toggleTimerPlayPause();
      } else if (selectedPhoto) {
        if (e.key === 'Escape') {
          setSelectedPhoto(null);
        } else if (e.key === 'ArrowRight') {
          const idx = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id);
          if (idx !== -1 && idx < filteredPhotos.length - 1) {
            setSelectedPhoto(filteredPhotos[idx + 1]);
          }
        } else if (e.key === 'ArrowLeft') {
          const idx = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id);
          if (idx > 0) {
            setSelectedPhoto(filteredPhotos[idx - 1]);
          }
        }
      } else if (!selectedPhoto && filteredPhotos.length > 0) {
        if (e.key === 'ArrowRight') {
          setCurrentSlideIndex((prev) => (prev + 1) % filteredPhotos.length);
        } else if (e.key === 'ArrowLeft') {
          setCurrentSlideIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, filteredPhotos, toggleFullscreen, toggleTimerPlayPause]);

  // Handle local image file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLivePhoto = async (e) => {
    e.preventDefault();
    if (!newImagePreview || !newTitle.trim()) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessMsg(null);

    try {
      const result = await uploadLivePhoto({
        image: newImagePreview,
        title: newTitle.trim(),
        category: newCategory,
        location: newLocation.trim() || 'Arena Floor',
        description: 'Captured live directly from the MedAIthon arena warfare.',
      });

      if (result && result.photo) {
        setPhotos((prev) => [result.photo, ...prev]);
        setCurrentSlideIndex(0);
        setUploadSuccessMsg(
          result.hostedOnCloudinary
            ? '✓ Photo uploaded to Cloudinary & broadcasted live!'
            : '✓ Photo posted to MedAIthon Live Moments!'
        );

        setTimeout(() => {
          setNewTitle('');
          setNewLocation('');
          setNewImagePreview(null);
          setIsUploadOpen(false);
          setIsUploading(false);
          setUploadSuccessMsg(null);
        }, 1200);
      } else {
        throw new Error(result?.error || 'Failed to upload image');
      }
    } catch (err) {
      setUploadError(err.message || 'Image upload failed');
      setIsUploading(false);
    }
  };

  // Delete photo handler
  const confirmDeletePhoto = async (photo) => {
    if (!photo) return;
    setIsDeleting(true);
    try {
      await deleteLivePhoto(photo.id);
      setPhotos((prev) => prev.filter((p) => String(p.id) !== String(photo.id)));

      if (selectedPhoto && String(selectedPhoto.id) === String(photo.id)) {
        setSelectedPhoto(null);
      }

      setDeleteToast(`✓ "${photo.title}" deleted.`);
      setTimeout(() => setDeleteToast(null), 3000);
      setPhotoToDelete(null);
    } catch (err) {
      console.error('Failed to delete photo:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden w-full bg-[#050508] text-white flex flex-col justify-between selection:bg-white selection:text-black font-['Inter']">
      {/* 3D Molten Metal Background WebGL */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-45">
        <MoltenMetal
          color1="#07070d"
          color2="#2b2d3d"
          color3="#ffffff"
          speed={0.18}
          scale={3.2}
          detail={4}
          glow={1.5}
          coreSize={0.08}
          swirl={1.1}
          fold={-0.2}
          brightness={1.15}
          colorMode="molten"
          grain={true}
          grainIntensity={0.04}
          opacity={0.65}
        />
      </div>

      {/* Sparks and Fire Embers Canvas */}
      <div className="fixed inset-0 z-1 pointer-events-none opacity-30">
        <ParticleField />
      </div>

      {/* Falling Japanese Sakura Flowers */}
      {showSakura && <SakuraField />}

      {/* Ambient Radial Glowing Orbs */}
      <div className="fixed top-1/4 -left-20 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-white/5 to-transparent blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-10 right-0 w-[550px] h-[550px] bg-gradient-to-tl from-amber-500/10 via-white/5 to-transparent blur-[140px] rounded-full pointer-events-none z-0" />

      {/* TOAST NOTIFICATION */}
      {deleteToast && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-mono backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-bounce">
          {deleteToast}
        </div>
      )}

      {/* ============================================================= */}
      {/* COMPACT TOP NAVIGATION BAR                                     */}
      {/* ============================================================= */}
      <header className="relative z-20 w-full px-4 sm:px-6 py-2 sm:py-2.5 border-b border-white/10 backdrop-blur-xl bg-black/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {/* Hanko Red Stamp: [写] */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-700/80 border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] flex items-center justify-center text-white font-serif font-black text-xs sm:text-sm select-none shrink-0">
            写
          </div>

          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={onNavigateToTimer}
            title="Switch to Full Stage Timer"
          >
            <img
              src="/medaithon-logo-nav-footer.png"
              alt="MedAIthon Logo"
              className="h-6 sm:h-8 w-auto object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]"
            />
            <span className="font-['Bebas_Neue'] text-base sm:text-xl tracking-wider text-white hidden sm:inline">
              MEDAITHON 2026 LIVE ARENA
            </span>
          </div>

          {/* Dynamic Sync Badges */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 border ${
                isTimerRunning
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              {isTimerRunning ? '50H LIVE COUNTDOWN' : 'PAUSED'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
              <span className={`w-1 h-1 rounded-full ${syncStatus === 'synced' ? 'bg-cyan-400' : 'bg-yellow-400 animate-ping'}`} />
              {syncStatus === 'synced' ? 'VERCEL SYNCED' : 'LOCAL CACHE'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* UPLOAD LIVE SHOT BUTTON */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-102"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Live Photo</span>
          </button>

          {/* SLIDESHOW TOGGLE */}
          <button
            onClick={() => setSlideshowActive(!slideshowActive)}
            title={slideshowActive ? 'Pause Projector Slideshow' : 'Start Projector Slideshow'}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
              slideshowActive
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {slideshowActive ? (
              <>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                <span className="hidden sm:inline">Slideshow ON</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="hidden sm:inline">Slideshow</span>
              </>
            )}
          </button>

          {/* SAKURA BLOSSOMS TOGGLE */}
          <button
            onClick={() => setShowSakura(!showSakura)}
            title={showSakura ? 'Hide Falling Flowers' : 'Show Falling Flowers'}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-xs"
          >
            🌸
          </button>

          {/* FULL STAGE DRAGON TIMER LINK */}
          {onNavigateToTimer && (
            <button
              onClick={onNavigateToTimer}
              title="Switch to Dragon Stage Timer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-['Bebas_Neue'] tracking-wider text-white backdrop-blur-xl transition-all cursor-pointer hover:scale-102"
            >
              <span>FULL STAGE (演台)</span>
            </button>
          )}

          {/* FULLSCREEN BUTTON */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-white/10 hover:bg-white/20 border-white/25 text-white'
            }`}
          >
            {isFullscreen ? 'EXIT (F)' : 'FULLSCREEN (F)'}
          </button>
        </div>
      </header>

      {/* ============================================================= */}
      {/* MAIN UNIFIED STUDIO BODY: 100% VISIBLE WITHOUT SCROLLING      */}
      {/* ============================================================= */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-[1750px] mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 lg:overflow-hidden">
        
        {/* ----------------------------------------------------------- */}
        {/* LEFT COLUMN: 50-HOUR LIVE TIMER COMMAND CENTER              */}
        {/* ----------------------------------------------------------- */}
        <section className="lg:col-span-4 xl:col-span-4 rounded-3xl border border-white/20 bg-black/80 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.3)] flex flex-col justify-between relative overflow-hidden group">
          {/* Top Katana Shimmer Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 pointer-events-none" />

          {/* Timer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className="cursor-pointer group flex items-center gap-2"
                onClick={onNavigateToTimer}
                title="Open Medi Dragon Stage"
              >
                <img
                  src="/medaithon-logo.png"
                  alt="MedAIthon"
                  className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_4px_15px_rgba(255,255,255,0.4)]"
                />
              </div>
              <div>
                <span className="font-['Bebas_Neue'] text-lg sm:text-xl text-white tracking-wider block leading-none">
                  50-HOUR CRUCIBLE
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  {Math.floor(timerElapsedSeconds / 3600)}h Elapsed &bull; {timerHours}h Remaining
                </span>
              </div>
            </div>

            <span className="font-serif text-sm text-amber-300 font-bold">
              五十時間
            </span>
          </div>

          {/* Digits Display + SVG Circular Gauge in Center */}
          <div className="flex flex-col items-center justify-center my-auto py-2 sm:py-3 gap-3">
            {/* Countdown Cards */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {/* Hours Box */}
              <div className="flex flex-col items-center justify-center bg-black/85 border border-white/25 rounded-2xl p-2 sm:p-3 min-w-[65px] sm:min-w-[82px] shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-serif text-[10px] text-white font-bold">時</span>
                  <span className="text-[8px] font-mono text-gray-400">HRS</span>
                </div>
                <span className="font-['Bebas_Neue'] text-4xl sm:text-5xl text-white leading-none tracking-tight drop-shadow-[0_4px_15px_rgba(255,255,255,0.35)]">
                  {timerHours.toString().padStart(2, '0')}
                </span>
              </div>

              <span className={`text-white text-xl sm:text-2xl font-bold ${isTimerRunning ? 'animate-pulse' : 'opacity-40'}`}>:</span>

              {/* Minutes Box */}
              <div className="flex flex-col items-center justify-center bg-black/85 border border-white/25 rounded-2xl p-2 sm:p-3 min-w-[65px] sm:min-w-[82px] shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-serif text-[10px] text-cyan-300 font-bold">分</span>
                  <span className="text-[8px] font-mono text-gray-400">MINS</span>
                </div>
                <span className="font-['Bebas_Neue'] text-4xl sm:text-5xl text-white leading-none tracking-tight drop-shadow-[0_4px_15px_rgba(255,255,255,0.35)]">
                  {timerMinutes.toString().padStart(2, '0')}
                </span>
              </div>

              <span className={`text-white text-xl sm:text-2xl font-bold ${isTimerRunning ? 'animate-pulse' : 'opacity-40'}`}>:</span>

              {/* Seconds Box with Tenths */}
              <div className="flex flex-col items-center justify-center bg-black/85 border border-white/25 rounded-2xl p-2 sm:p-3 min-w-[65px] sm:min-w-[82px] shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-serif text-[10px] text-amber-300 font-bold">秒</span>
                  <span className="text-[8px] font-mono text-gray-400">SECS</span>
                </div>
                <div className="flex items-baseline justify-center">
                  <span className="font-['Bebas_Neue'] text-4xl sm:text-5xl text-white leading-none tracking-tight drop-shadow-[0_4px_15px_rgba(255,215,0,0.35)]">
                    {timerSecs.toString().padStart(2, '0')}
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-amber-300/80 ml-0.5 font-bold">
                    .{tenths}
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Progress Gauge & Overall Completion */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r={timerGaugeRadius}
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-white/10"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={timerGaugeRadius}
                    stroke="url(#timerLeftGaugeGradient)"
                    strokeWidth="5"
                    strokeDasharray={timerGaugeCircumference}
                    strokeDashoffset={timerGaugeStrokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="timerLeftGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute font-['Bebas_Neue'] text-sm text-white">
                  {timerProgressPercent}%
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-mono font-semibold text-gray-200">
                  Total Progress: {timerProgressPercent}% Complete
                </span>
                <span className="text-[9px] font-mono text-gray-400">
                  50 Hours Target Deadline &bull; SRM IST
                </span>
              </div>
            </div>

            {/* Milestone Linear Bar */}
            <div className="w-full space-y-1">
              <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/15 p-[0.5px]">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-white to-amber-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(0, parseFloat(timerProgressPercent)))}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-gray-400 px-0.5">
                <span>0H KICKOFF</span>
                <span>12H</span>
                <span>24H HALFWAY</span>
                <span>36H</span>
                <span>48H FREEZE</span>
                <span>50H STOP</span>
              </div>
            </div>
          </div>

          {/* Frosted Glassmorphism Timer Controls */}
          <div className="pt-3 border-t border-white/10 shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* Play / Pause Glassmorphism Button */}
              <button
                onClick={toggleTimerPlayPause}
                className="relative group flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-['Bebas_Neue'] text-base tracking-wider text-white backdrop-blur-xl border border-white/25 hover:border-white/50 bg-white/10 hover:bg-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all cursor-pointer hover:scale-102"
              >
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />
                {isTimerRunning ? (
                  <>
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    <span>PAUSE TIMER (停止)</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>RESUME TIMER (開始)</span>
                  </>
                )}
              </button>

              {/* Reset Button */}
              <button
                onClick={() => resetTimer(TOTAL_50_HOURS_SECONDS)}
                title="Reset to 50:00:00"
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                Reset 50h
              </button>

              {/* Adjust +/- */}
              <button
                onClick={() => adjustTimerTime(3600)}
                title="Add 1 Hour"
                className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                +1h
              </button>
              <button
                onClick={() => adjustTimerTime(-3600)}
                title="Subtract 1 Hour"
                className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                -1h
              </button>
            </div>

            {/* Dragon Motto Footer */}
            <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 pt-0.5">
              <span>「龍の道」Forged in 50 hours</span>
              <span className="text-cyan-300 font-semibold">Live Serverless Synced</span>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT COLUMN: REAL-TIME LIVE PHOTO FEED & SPOTLIGHT STUDIO   */}
        {/* ----------------------------------------------------------- */}
        <section className="lg:col-span-8 xl:col-span-8 rounded-3xl border border-white/20 bg-black/80 backdrop-blur-2xl p-3 sm:p-4 lg:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.3)] flex flex-col justify-between relative overflow-hidden group">
          {/* Top Katana Shimmer Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80 pointer-events-none" />

          {/* Top Categories & Quick Stats Strip */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10 shrink-0 overflow-x-auto scrollbar-none">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {CATEGORIES.map((cat) => {
                const count = cat.id === 'all' ? photos.length : photos.filter((p) => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setCurrentSlideIndex(0);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Photo Index Counter */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {currentSlideIndex + 1} / {filteredPhotos.length} Shots
              </span>
            </div>
          </div>

          {/* Main Photo Spotlight Display (Centerpiece) */}
          {currentPhoto ? (
            <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden my-2 sm:my-2.5 border border-white/15 bg-black/70 flex items-center justify-center group/spotlight">
              {/* Blurred Ambient Backdrop Glow */}
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-25 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${currentPhoto.img})` }}
              />

              {/* Main Photo Image */}
              <img
                src={currentPhoto.img}
                alt={currentPhoto.title}
                onClick={() => setSelectedPhoto(currentPhoto)}
                className="relative z-10 max-h-full max-w-full object-contain cursor-pointer transition-transform duration-500 hover:scale-[1.015]"
              />

              {/* Prev / Next Spotlight Navigation Arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-70 group-hover/spotlight:opacity-100 transition-all cursor-pointer backdrop-blur-md"
                title="Previous Photo (Left Arrow)"
              >
                &larr;
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev + 1) % filteredPhotos.length);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center opacity-70 group-hover/spotlight:opacity-100 transition-all cursor-pointer backdrop-blur-md"
                title="Next Photo (Right Arrow)"
              >
                &rarr;
              </button>

              {/* Top-Right Action Controls (Delete & Fullscreen Lightbox) */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 opacity-90 group-hover/spotlight:opacity-100 transition-opacity">
                {/* DELETE BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoToDelete(currentPhoto);
                  }}
                  title="Delete this Photo (削除)"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/25 hover:bg-red-500/40 border border-red-500/50 text-red-200 text-xs font-mono font-semibold backdrop-blur-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>

                {/* EXPAND LIGHTBOX BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(currentPhoto);
                  }}
                  title="Open Fullscreen Lightbox"
                  className="p-1.5 rounded-xl bg-black/70 hover:bg-black/90 border border-white/20 text-white text-xs backdrop-blur-xl transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-6 16H4m0 0v-4m0 4l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-wrap items-end justify-between gap-2 pointer-events-none">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-red-700/80 border border-red-500/70 text-[10px] font-serif font-bold text-white">
                      {currentPhoto.kanji}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-mono text-cyan-200">
                      {currentPhoto.category}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      📍 {currentPhoto.location} &bull; {currentPhoto.time}
                    </span>
                  </div>
                  <h3 className="font-['Bebas_Neue'] text-xl sm:text-2xl text-white tracking-wide drop-shadow-md">
                    {currentPhoto.title}
                  </h3>
                </div>

                <div className="pointer-events-auto">
                  <button
                    onClick={() => setSelectedPhoto(currentPhoto)}
                    className="text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Click to Expand</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-center p-6 space-y-2">
              <span className="text-3xl">📷</span>
              <p className="text-sm font-mono text-gray-300">No photos found in this category.</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-xs text-cyan-300 cursor-pointer"
              >
                Reset to All Moments
              </button>
            </div>
          )}

          {/* Bottom Thumbnails Strip (Scrollable Carousel) */}
          <div className="h-20 sm:h-22 shrink-0 pt-1 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {filteredPhotos.map((photo, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <div
                  key={photo.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`group/thumb relative h-full aspect-[4/3] rounded-xl overflow-hidden border cursor-pointer shrink-0 transition-all duration-300 ${
                    isActive
                      ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-102'
                      : 'border-white/15 opacity-70 hover:opacity-100 hover:border-white/40'
                  }`}
                >
                  <img
                    src={photo.img}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-transparent transition-colors" />

                  {/* Thumbnail Quick Delete Button on Hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoToDelete(photo);
                    }}
                    title="Delete Photo"
                    className="absolute top-1 right-1 z-30 w-5 h-5 rounded-md bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-sm cursor-pointer"
                  >
                    ✕
                  </button>

                  <span className="absolute bottom-1 left-1 z-20 text-[9px] font-mono text-white/90 bg-black/70 px-1 rounded truncate max-w-[90%]">
                    #{idx + 1}
                  </span>
                </div>
              );
            })}

            {/* Quick "+ Add Live Photo" Card at End of Strip */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="h-full aspect-[4/3] rounded-xl border border-dashed border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 flex flex-col items-center justify-center gap-1 shrink-0 transition-all cursor-pointer text-xs font-mono"
            >
              <span className="text-base font-bold">+</span>
              <span className="text-[9px]">Add Photo</span>
            </button>
          </div>
        </section>
      </main>

      {/* ============================================================= */}
      {/* DELETE CONFIRMATION MODAL                                     */}
      {/* ============================================================= */}
      {photoToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => !isDeleting && setPhotoToDelete(null)}
        >
          <div
            className="relative max-w-sm w-full bg-black/95 border border-red-500/40 rounded-3xl p-6 shadow-[0_25px_60px_rgba(239,68,68,0.25)] text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto text-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              🗑️
            </div>

            <div>
              <h4 className="font-['Bebas_Neue'] text-2xl text-white tracking-wider">
                DELETE EVENT PHOTO?
              </h4>
              <p className="text-xs text-gray-300 mt-1 font-mono leading-relaxed">
                "{photoToDelete.title}" will be permanently deleted from Cloudinary CDN and the live event stream.
              </p>
            </div>

            {/* Preview image */}
            <div className="w-full h-24 rounded-xl overflow-hidden border border-white/20">
              <img
                src={photoToDelete.img}
                alt={photoToDelete.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-gray-300 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDeletePhoto(photoToDelete)}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete (削除)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* LIGHTBOX MODAL WITH FULL RES & DELETE BUTTON                  */}
      {/* ============================================================= */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-black/85 border border-white/20 rounded-3xl overflow-hidden flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md bg-red-700/80 border border-red-500/70 text-xs font-serif font-bold text-white">
                  {selectedPhoto.kanji}
                </span>
                <div>
                  <h3 className="font-['Bebas_Neue'] text-xl sm:text-2xl text-white tracking-wide">
                    {selectedPhoto.title}
                  </h3>
                  <span className="text-xs font-mono text-gray-400">
                    📍 {selectedPhoto.location} &bull; {selectedPhoto.time}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
                title="Close (Esc)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="relative flex-1 bg-black/90 flex items-center justify-center overflow-hidden p-2">
              <img
                src={selectedPhoto.img}
                alt={selectedPhoto.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Modal Footer: Description + Actions */}
            <div className="px-6 py-4 border-t border-white/10 bg-black/60 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-300 font-light max-w-2xl">
                {selectedPhoto.description}
              </p>
              <div className="flex items-center gap-3">
                {/* DELETE BUTTON IN LIGHTBOX */}
                <button
                  onClick={() => setPhotoToDelete(selectedPhoto)}
                  className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/35 border border-red-500/50 text-xs font-semibold text-red-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Photo (削除)</span>
                </button>

                {/* DOWNLOAD HIGH RES BUTTON */}
                <a
                  href={selectedPhoto.img}
                  download={`medaithon-${selectedPhoto.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download High-Res</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* UPLOAD LIVE PHOTO MODAL                                       */}
      {/* ============================================================= */}
      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsUploadOpen(false)}
        >
          <div
            className="relative max-w-md w-full bg-black/90 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <h3 className="font-['Bebas_Neue'] text-2xl text-white tracking-wider">
                  POST LIVE MOMENT (実況投稿)
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {uploadSuccessMsg && (
              <div className="p-3 mb-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 mb-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
                <span>⚠️</span>
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleAddLivePhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">
                  Photo Title / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neural Model Live Training in Lab 3"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/20 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">
                    Event Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    disabled={isUploading}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                  >
                    <option value="Ideation & Code">Ideation & Code</option>
                    <option value="Hardware & IoT">Hardware & IoT</option>
                    <option value="Mentorship">Mentorship & Demos</option>
                    <option value="Keynote & Kickoff">Keynote & Kickoff</option>
                    <option value="Awards & Glory">Awards & Glory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">
                    Venue Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arena Stage B"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    disabled={isUploading}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">
                  Upload Photo Image (Dispatched to Cloudinary)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  disabled={isUploading}
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer disabled:opacity-50"
                />
              </div>

              {newImagePreview && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/20">
                  <img
                    src={newImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-mono text-cyan-300">Uploading to Cloudinary CDN...</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1">
                <span>☁️ Cloudinary Global CDN Sync</span>
                <span>⚡ Vercel Serverless /api</span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer disabled:opacity-50 hover:scale-102"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Publish Moment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeGalleryPage;
