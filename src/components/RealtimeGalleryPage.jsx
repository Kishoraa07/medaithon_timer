import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MoltenMetal from './MoltenMetal';
import ParticleField from './ParticleField';
import SakuraField from './SakuraField';
import { useSyncedTimer } from '../hooks/useSyncedTimer';
import { fetchLivePhotos, uploadLivePhoto } from '../services/imageService';

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

  const timerGaugeRadius = 38;
  const timerGaugeCircumference = 2 * Math.PI * timerGaugeRadius;
  const timerGaugeStrokeDashoffset = timerGaugeCircumference - (parseFloat(timerProgressPercent) / 100) * timerGaugeCircumference;

  // Fetch live uploaded photos from Cloudinary / Serverless API on mount
  useEffect(() => {
    let isMounted = true;
    fetchLivePhotos().then((res) => {
      if (isMounted && res && Array.isArray(res.photos) && res.photos.length > 0) {
        setPhotos((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPhotos = res.photos.filter((p) => !existingIds.has(p.id));
          return [...newPhotos, ...prev];
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Photos
  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return photos;
    return photos.filter((p) => p.category === activeCategory);
  }, [photos, activeCategory]);

  // Slideshow auto-advance
  useEffect(() => {
    if (!slideshowActive || filteredPhotos.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % filteredPhotos.length);
    }, 4000);
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

  // Keyboard navigation for Lightbox & Fullscreen
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
        setUploadSuccessMsg(
          result.hostedOnCloudinary
            ? '✓ Photo uploaded to Cloudinary & synced across all devices!'
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

  return (
    <div className="relative min-h-screen w-full bg-[#050508] text-white overflow-x-hidden flex flex-col justify-between selection:bg-white selection:text-black font-['Inter']">
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

      {/* Falling White/Silver Japanese Flowers */}
      {showSakura && <SakuraField />}

      {/* Ambient Radial Glowing Halos */}
      <div className="fixed top-20 left-1/4 w-[600px] h-[450px] bg-gradient-to-tr from-cyan-500/10 via-white/5 to-amber-500/10 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-20 right-1/4 w-[600px] h-[450px] bg-gradient-to-tr from-amber-500/10 via-white/5 to-cyan-500/10 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* TOP HEADER & CONTROLS */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 border-b border-white/10 backdrop-blur-xl bg-black/45 flex flex-wrap items-center justify-between gap-4">
        {/* Brand + Live Indicator */}
        <div className="flex items-center gap-3.5">
          {/* Japanese Hanko Seal */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-700/80 border-2 border-red-500/90 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center text-white font-serif font-black text-sm sm:text-base select-none shrink-0">
            龍
          </div>

          <div className="relative group cursor-pointer" onClick={onNavigateToTimer}>
            <img
              src="/medaithon-logo-nav-footer.png"
              alt="MedAIthon Logo"
              className="relative h-8 sm:h-10 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-['Bebas_Neue'] text-lg sm:text-2xl tracking-wider text-white">
                MEDAITHON LIVE STREAM
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>● REALTIME FEED</span>
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-400 font-light tracking-wide hidden sm:block">
              実時間合戦記録 (Live Photographic Archives & 50H Countdown Arena)
            </span>
          </div>
        </div>

        {/* Action Buttons: Return to 50h Timer, Upload Photo, Fullscreen, Sakura */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* RETURN TO 50H TIMER BUTTON */}
          <button
            onClick={onNavigateToTimer}
            className="relative group flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl font-['Bebas_Neue'] text-sm sm:text-base tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all cursor-pointer hover:scale-102"
          >
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
            <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>50H TIMER STAGE (タイマー)</span>
          </button>

          {/* UPLOAD LIVE SHOT BUTTON */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-102"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Live Photo</span>
          </button>

          {/* SLIDESHOW TOGGLE */}
          <button
            onClick={() => setSlideshowActive(!slideshowActive)}
            title={slideshowActive ? 'Pause Projector Slideshow' : 'Start Projector Slideshow'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              slideshowActive
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {slideshowActive ? (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* SAKURA BLOSSOMS TOGGLE */}
          <button
            onClick={() => setShowSakura(!showSakura)}
            title={showSakura ? 'Hide Falling Flowers' : 'Show Falling Flowers'}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-xs"
          >
            🌸
          </button>

          {/* FULLSCREEN BUTTON */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-['Bebas_Neue'] tracking-wider transition-all cursor-pointer backdrop-blur-xl ${
              isFullscreen
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/10 hover:bg-white/20 border-white/25 hover:border-white/50 text-white shadow-sm'
            }`}
          >
            {isFullscreen ? (
              <>
                <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0m-5 0l0 5m11-5l5 0m0 0l-5 5m5-5l0 5m-5 11l5 0m0 0l-5-5m5 5l0-5M4 15l5 0m-5 0l0 5m0-5l5 5" />
                </svg>
                <span>EXIT FULLSCREEN</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-6 16H4m0 0v-4m0 4l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>FULLSCREEN (全画面)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* MAIN GALLERY BODY */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-7">
        
        {/* HERO TITLE & STATS */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-white/5 to-amber-500/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-md mb-2">
            <span className="font-serif text-cyan-300 text-sm">📸 実況中継</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-['Inter'] text-xs sm:text-sm font-semibold tracking-wider text-gray-200 uppercase">
              Live Battleground Photography & 50H Crucible
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-serif text-amber-300 text-sm">50時間記録</span>
          </div>

          <h1 className="font-['Bebas_Neue'] text-3xl sm:text-5xl md:text-6xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-500 leading-tight drop-shadow-[0_4px_30px_rgba(255,255,255,0.3)]">
            MEDAITHON 2026 LIVE PHOTO FEED
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400 max-w-2xl font-light">
            Real-time candid captures, team ideation, hardware soldering, midnight sprints, and jury evaluations from the arena floor.
          </p>

          {/* Quick Stats Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-gray-300">
            <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Total Captures: <strong className="text-white">{photos.length} Photos</strong></span>
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Status: <strong className="text-emerald-300">Live Updating</strong></span>
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Arena: <strong className="text-amber-300">SRM IST, Chennai</strong></span>
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 50-HOUR LIVE TIMER SECTION - DIRECTLY ABOVE THE IMAGE SECTION */}
        {/* ------------------------------------------------------------- */}
        <section className="relative w-full rounded-3xl overflow-hidden border border-white/20 bg-black/75 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.3)] p-5 sm:p-6 md:p-7 group">
          {/* Top Katana Shimmer Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: MedAIthon Logo + Live Status & Target Info */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-2.5 max-w-sm">
              <div className="relative group cursor-pointer" onClick={onNavigateToTimer}>
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-white/10 to-amber-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition duration-500 pointer-events-none" />
                <img
                  src="/medaithon-logo.png"
                  alt="MedAIthon 2026"
                  className="relative h-10 sm:h-12 w-auto object-contain filter drop-shadow-[0_8px_20px_rgba(255,255,255,0.3)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 border transition-all ${
                  isTimerRunning
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  {isTimerRunning ? '50H LIVE COUNTDOWN RUNNING' : '50H TIMER PAUSED'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                  <span className={`w-1 h-1 rounded-full ${syncStatus === 'synced' ? 'bg-cyan-400' : 'bg-yellow-400 animate-ping'}`} />
                  {syncStatus === 'synced' ? 'VERCEL SYNCED' : 'LOCAL CACHE'}
                </span>
                <span className="font-serif text-[11px] text-gray-400">五十時間</span>
              </div>

              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Relentless medical innovation in progress across the arena floor.
              </p>

              {/* Progress Summary */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-gray-300 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  Elapsed: <strong className="text-cyan-300">{Math.floor(timerElapsedSeconds / 3600)}h {Math.floor((timerElapsedSeconds % 3600) / 60)}m</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  Remaining: <strong className="text-amber-300">{timerHours}h {timerMinutes}m</strong>
                </span>
              </div>
            </div>

            {/* Center: Digital Time Cards + SVG Circular Gauge */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              {/* Digit Cards */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {/* Hours Box */}
                <div className="flex flex-col items-center justify-center bg-black/80 border border-white/20 rounded-2xl p-2.5 sm:p-3.5 min-w-[70px] sm:min-w-[95px] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="font-serif text-[11px] text-white font-bold">時</span>
                    <span className="text-[8px] font-mono text-gray-400">HRS</span>
                  </div>
                  <span className="font-['Bebas_Neue'] text-4xl sm:text-6xl text-white leading-none tracking-tight drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)]">
                    {timerHours.toString().padStart(2, '0')}
                  </span>
                </div>

                <span className={`text-white text-2xl font-bold ${isTimerRunning ? 'animate-pulse' : 'opacity-40'}`}>:</span>

                {/* Minutes Box */}
                <div className="flex flex-col items-center justify-center bg-black/80 border border-white/20 rounded-2xl p-2.5 sm:p-3.5 min-w-[70px] sm:min-w-[95px] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="font-serif text-[11px] text-cyan-300 font-bold">分</span>
                    <span className="text-[8px] font-mono text-gray-400">MINS</span>
                  </div>
                  <span className="font-['Bebas_Neue'] text-4xl sm:text-6xl text-white leading-none tracking-tight drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)]">
                    {timerMinutes.toString().padStart(2, '0')}
                  </span>
                </div>

                <span className={`text-white text-2xl font-bold ${isTimerRunning ? 'animate-pulse' : 'opacity-40'}`}>:</span>

                {/* Seconds Box */}
                <div className="flex flex-col items-center justify-center bg-black/80 border border-white/20 rounded-2xl p-2.5 sm:p-3.5 min-w-[70px] sm:min-w-[95px] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="font-serif text-[11px] text-amber-300 font-bold">秒</span>
                    <span className="text-[8px] font-mono text-gray-400">SECS</span>
                  </div>
                  <div className="flex items-baseline justify-center">
                    <span className="font-['Bebas_Neue'] text-4xl sm:text-6xl text-white leading-none tracking-tight drop-shadow-[0_4px_20px_rgba(255,215,0,0.4)]">
                      {timerSecs.toString().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-amber-300/80 ml-0.5 sm:ml-1 font-bold">
                      .{tenths}
                    </span>
                  </div>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r={timerGaugeRadius}
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-white/10"
                    fill="transparent"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r={timerGaugeRadius}
                    stroke="url(#galleryTimerGaugeGradient)"
                    strokeWidth="5"
                    strokeDasharray={timerGaugeCircumference}
                    strokeDashoffset={timerGaugeStrokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="galleryTimerGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-['Bebas_Neue'] text-lg sm:text-xl text-white leading-none">
                    {timerProgressPercent}%
                  </span>
                  <span className="text-[8px] font-mono text-gray-400 uppercase">
                    Done
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Glass Controls & Link to Full Stage Timer */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-2.5">
              {/* Play / Pause Glassmorphism Button */}
              <button
                onClick={toggleTimerPlayPause}
                className="relative group flex items-center gap-2 px-4 py-2 rounded-xl font-['Bebas_Neue'] text-base tracking-wider text-white backdrop-blur-xl border border-white/25 hover:border-white/50 bg-white/10 hover:bg-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all cursor-pointer hover:scale-102"
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

              <div className="flex items-center gap-2">
                {/* Reset Button */}
                <button
                  onClick={() => resetTimer(TOTAL_50_HOURS_SECONDS)}
                  title="Reset to 50:00:00"
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  Reset 50h
                </button>

                {/* Adjust +/- */}
                <button
                  onClick={() => adjustTimerTime(3600)}
                  title="Add 1 Hour"
                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  +1h
                </button>
                <button
                  onClick={() => adjustTimerTime(-3600)}
                  title="Subtract 1 Hour"
                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  -1h
                </button>
              </div>

              {/* View Fullscreen Stage Link */}
              <button
                onClick={onNavigateToTimer}
                className="text-[11px] font-mono text-cyan-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer mt-1"
              >
                <span>Open Full Stage View &rarr;</span>
              </button>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full mt-4 pt-3 border-t border-white/10 space-y-1">
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>00h HACKING COMMENCES</span>
              <span className="text-white font-medium">50-HOUR LIVE PROGRESSION ({timerProgressPercent}%)</span>
              <span>50h SUBMISSIONS CLOSED 🏆</span>
            </div>
            <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/15 p-[0.5px]">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-white to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                style={{ width: `${Math.min(100, Math.max(0, parseFloat(timerProgressPercent)))}%` }}
              />
            </div>
          </div>
        </section>

        {/* FEATURED LIVE SPOTLIGHT HERO (AUTO-SLIDESHOW OR MANUAL HIGHLIGHT) */}
        {filteredPhotos.length > 0 && (
          <section className="relative w-full rounded-3xl overflow-hidden border border-white/20 bg-black/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.3)] group">
            {/* Top glass reflection */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-20 opacity-80" />

            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[440px]">
              {/* Photo Display Column */}
              <div
                className="lg:col-span-8 relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedPhoto(filteredPhotos[currentSlideIndex % filteredPhotos.length])}
              >
                <img
                  src={filteredPhotos[currentSlideIndex % filteredPhotos.length].img}
                  alt={filteredPhotos[currentSlideIndex % filteredPhotos.length].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Live Badge Overlay */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/70 border border-white/20 backdrop-blur-md text-xs font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>SPOTLIGHT MOMENT</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-serif backdrop-blur-md">
                    {filteredPhotos[currentSlideIndex % filteredPhotos.length].kanji}
                  </span>
                </div>

                {/* Click to Expand Prompt */}
                <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs font-mono text-gray-300 backdrop-blur-md">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                  <span>Click photo to expand lightbox</span>
                </div>
              </div>

              {/* Information Column */}
              <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-black/50 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <span>📍</span>
                      <span>{filteredPhotos[currentSlideIndex % filteredPhotos.length].location}</span>
                    </span>
                    <span>{filteredPhotos[currentSlideIndex % filteredPhotos.length].time}</span>
                  </div>

                  <h3 className="font-['Bebas_Neue'] text-2xl sm:text-3xl text-white tracking-wide mb-2 leading-tight">
                    {filteredPhotos[currentSlideIndex % filteredPhotos.length].title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed mb-4">
                    {filteredPhotos[currentSlideIndex % filteredPhotos.length].description}
                  </p>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
                    <span>Category:</span>
                    <strong className="text-white">{filteredPhotos[currentSlideIndex % filteredPhotos.length].category}</strong>
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentSlideIndex((prev) =>
                          prev === 0 ? filteredPhotos.length - 1 : prev - 1
                        )
                      }
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                      title="Previous Moment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSlideIndex((prev) => (prev + 1) % filteredPhotos.length)
                      }
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                      title="Next Moment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <span className="text-xs font-mono text-gray-400 ml-2">
                      {(currentSlideIndex % filteredPhotos.length) + 1} / {filteredPhotos.length}
                    </span>
                  </div>

                  <button
                    onClick={() => setSlideshowActive(!slideshowActive)}
                    className="text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{slideshowActive ? '⏸ Pause Loop' : '▶ Auto Loop'}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY FILTER TABS */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="font-['Bebas_Neue'] text-xl sm:text-2xl text-white tracking-wider">
                LIVE MOMENT ARCHIVES (全記録)
              </h3>
            </div>
            <span className="text-xs font-mono text-gray-400">
              Showing {filteredPhotos.length} moments
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setCurrentSlideIndex(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border backdrop-blur-md ${
                  activeCategory === cat.id
                    ? 'bg-white/15 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="font-serif text-[11px] text-cyan-300">{cat.kanji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* PHOTO GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-pointer hover:border-white/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Top subtle highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent z-10" />

              {/* Photo Image Frame */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                <img
                  src={photo.img}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Timestamp Pill */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 border border-white/20 text-[10px] font-mono text-gray-300 backdrop-blur-md">
                    {photo.time.split('•')[0]}
                  </span>
                </div>

                {/* Japanese Kanji Tag */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-red-800/80 border border-red-500/60 text-[10px] font-serif font-bold text-white shadow-md">
                    {photo.kanji}
                  </span>
                </div>
              </div>

              {/* Metadata Body */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="text-[10px] font-mono text-cyan-300 mb-1 flex items-center justify-between">
                    <span className="truncate">{photo.category}</span>
                    <span className="text-gray-400 truncate ml-2">📍 {photo.location}</span>
                  </div>
                  <h4 className="font-['Inter'] text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-gray-400 font-light mt-1 line-clamp-2 leading-relaxed">
                    {photo.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span className="flex items-center gap-1 text-gray-300">
                    <span>❤️</span>
                    <span>{photo.likes}</span>
                  </span>
                  <span className="text-cyan-300 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>View Shot</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-black/80 border border-white/20 rounded-3xl overflow-hidden flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
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

            {/* Modal Footer Description */}
            <div className="px-6 py-4 border-t border-white/10 bg-black/60 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-300 font-light max-w-2xl">
                {selectedPhoto.description}
              </p>
              <div className="flex items-center gap-3">
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

      {/* UPLOAD LIVE PHOTO MODAL */}
      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
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
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {uploadSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
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
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/20">
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

      {/* FOOTER BAR */}
      <footer className="relative z-20 w-full px-4 sm:px-8 py-3.5 border-t border-white/10 backdrop-blur-md bg-black/55 flex flex-wrap items-center justify-between text-xs text-gray-400 font-mono gap-3">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">MEDAITHON 2026 メダイソン</span>
          <span className="text-gray-600">|</span>
          <span className="font-serif text-[11px]">実況中継合戦記録 (Live Photographic Archives)</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Shortcuts: <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white">&larr; / &rarr;</kbd> Next Photo &bull; <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white">Esc</kbd> Close</span>
          <span className="text-gray-500">&copy; 2026 MedAIthon Council</span>
        </div>
      </footer>

      {/* FLOATING PROMINENT FULLSCREEN TOGGLE BUTTON */}
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed bottom-5 right-5 z-40 hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-black/85 hover:bg-black/95 border border-white/30 text-white text-xs font-mono backdrop-blur-2xl shadow-[0_4px_25px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:scale-105 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>⛶ Immersive Fullscreen (全画面)</span>
        </button>
      )}
    </div>
  );
};

export default RealtimeGalleryPage;
