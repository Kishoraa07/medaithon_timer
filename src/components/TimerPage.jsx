import React, { useState, useEffect, useRef, useCallback } from 'react';
import MoltenMetal from './MoltenMetal';
import ParticleField from './ParticleField';
import SakuraField from './SakuraField';
import { useSyncedTimer } from '../hooks/useSyncedTimer';

const TOTAL_50_HOURS_SECONDS = 50 * 3600; // 180,000 seconds

const MILESTONES = [
  { hour: 0, kanji: '合戦開始', label: 'Hacking Begins', icon: '⚔️', desc: 'The dragon awakens. Teams assemble & code crucible commences.' },
  { hour: 10, kanji: '師範審査', label: 'Mentor Round 1', icon: '🧠', desc: 'Clinical & AI masters inspect blueprints and architecture.' },
  { hour: 20, kanji: '夜叉の糧', label: 'Midnight Fuel', icon: '🍜', desc: 'Ramen & energy boost. Coding under the midnight moon.' },
  { hour: 25, kanji: '中間関門', label: 'Halfway Check', icon: '⚡', desc: '25-hour checkpoint. MVP live testing & prototype demos.' },
  { hour: 36, kanji: '技術統合', label: 'Integration Sprint', icon: '🧪', desc: 'Hardware sensors, medical ML models, and UI harmonization.' },
  { hour: 46, kanji: '決戦前夜', label: 'Final 4-Hour Sprint', icon: '🏁', desc: 'Code freeze, final rehearsal & presentation polishing.' },
  { hour: 50, kanji: '天下統一', label: 'Submissions Closed', icon: '🏆', desc: 'Pencils down. Final glory before the Dragon Council.' },
];

const DRAGON_QUOTES = [
  "「龍の道」Where code meets the way of the dragon! Innovate with courage.",
  "「一意専心」Focus your spirit, warrior! Clear minds forge flawless algorithms.",
  "「七転び八起き」Fall seven times, rise eight. Debug resiliently!",
  "「水滴石穿」Perseverance carves stone. 50 hours of relentless grit will prevail.",
  "「温故知新」Learn from the past, invent for tomorrow. Revolutionize medicine!",
  "「乾坤一擲」Stake your all on this sprint! Solder pins and train models.",
  "「百錬成鋼」Forged through 50 hours of fire. Push your git commits regularly!",
  "「天下布武」Craft a pitch of unshakeable conviction: Problem, AI Solution, Clinical Impact."
];

const TimerPage = ({ onNavigateToGallery }) => {
  // Authoritative synced 50h timer across all devices & Vercel serverless
  const {
    remainingSeconds,
    totalSeconds,
    elapsedSeconds,
    tenths,
    progressPercent,
    isTimerRunning: isRunning,
    syncStatus,
    togglePlayPause,
    resetTimer,
    adjustTime,
  } = useSyncedTimer();

  const mode = 'countdown';
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSakura, setShowSakura] = useState(true);
  const [dragonSpeech, setDragonSpeech] = useState(DRAGON_QUOTES[0]);
  const [dragonAuraGlow, setDragonAuraGlow] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const audioCtxRef = useRef(null);

  // Initialize or resume Web Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Japanese Bell / Singing Bowl Chime (Rin) on dragon interaction
  const playJapaneseChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio fallback silent
    }
  }, [getAudioContext, soundEnabled]);

  // Live Clock Ticker
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        setSoundEnabled((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        if (e.shiftKey) resetTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleFullscreen, resetTimer]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Click Medi Dragon interaction - Strictly NO shaking or rotating!
  const handleDragonClick = () => {
    setDragonAuraGlow(true);
    playJapaneseChime();
    const randomIndex = Math.floor(Math.random() * DRAGON_QUOTES.length);
    setDragonSpeech(DRAGON_QUOTES[randomIndex]);
    setTimeout(() => setDragonAuraGlow(false), 1200);
  };

  // Calculations
  const displaySeconds = mode === 'countdown' ? remainingSeconds : elapsedSeconds;

  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const seconds = displaySeconds % 60;

  const elapsedHoursExact = elapsedSeconds / 3600;

  // Find current active milestone
  const currentMilestoneIndex = MILESTONES.reduce((acc, m, idx) => {
    if (elapsedHoursExact >= m.hour) return idx;
    return acc;
  }, 0);

  // SVG Circular progress gauge calculations
  const gaugeRadius = 38;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeStrokeDashoffset = gaugeCircumference - (parseFloat(progressPercent) / 100) * gaugeCircumference;

  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden w-full bg-[#050508] text-white flex flex-col justify-between selection:bg-white selection:text-black font-['Inter']">
      {/* 3D Molten Metal Background WebGL */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <MoltenMetal
          color1="#08080f"
          color2="#2b2d3d"
          color3="#ffffff"
          speed={0.2}
          scale={3.2}
          detail={4}
          glow={1.6}
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

      {/* FALLING JAPANESE FLOWERS (Pure White & Silver Blossoms - Zero Pink) */}
      {showSakura && <SakuraField />}

      {/* Japanese Traditional Watermark Background Kanji */}
      <div className="fixed -top-10 -right-10 pointer-events-none z-0 select-none opacity-[0.03] text-[240px] sm:text-[340px] font-serif leading-none text-white">
        龍
      </div>
      <div className="fixed -bottom-20 -left-10 pointer-events-none z-0 select-none opacity-[0.02] text-[200px] sm:text-[300px] font-serif leading-none text-white">
        桜
      </div>

      {/* Glowing Ambient Radial Backdrop */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[480px] bg-gradient-to-tr from-cyan-500/10 via-white/5 to-amber-500/10 blur-[130px] rounded-full pointer-events-none z-0 animate-pulse-glow" />

      {/* ============================================================= */}
      {/* 1. TOP JAPANESE STYLED NAVBAR (COMPACT & SLEEK)               */}
      {/* ============================================================= */}
      <header className="relative z-20 w-full px-3 sm:px-6 py-2 border-b border-white/10 backdrop-blur-xl bg-black/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Brand & Dynamic Live Status */}
        <div className="flex items-center gap-3">
          {/* Hanko Red Stamp: [龍] */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-700/80 border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] flex items-center justify-center text-white font-serif font-black text-xs sm:text-sm select-none shrink-0">
            龍
          </div>

          <div className="flex items-center gap-2">
            <img
              src="/medaithon-logo-nav-footer.png"
              alt="MedAIthon Logo"
              className="h-6 sm:h-7 w-auto object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]"
            />
            <span className="font-['Bebas_Neue'] text-base sm:text-lg tracking-wider text-white">
              MEDAITHON 2026
            </span>
          </div>

          {/* Dynamic Status Badges */}
          <div className="hidden sm:flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 border transition-all ${
              isRunning
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              {isRunning ? '● 50H COUNTDOWN RUNNING' : '⏸ PAUSED'}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
              <span className={`w-1 h-1 rounded-full ${syncStatus === 'synced' ? 'bg-cyan-400' : 'bg-yellow-400 animate-ping'}`} />
              {syncStatus === 'synced' ? 'VERCEL SYNCED' : 'LOCAL CACHE'}
            </span>
          </div>
        </div>

        {/* Live Clock & Navigation Actions */}
        <div className="flex items-center gap-2">
          {/* Link to Realtime Gallery Page */}
          {onNavigateToGallery && (
            <button
              onClick={onNavigateToGallery}
              title="View Real-Time Live Event Photo Feed"
              className="relative group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 text-xs font-semibold backdrop-blur-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer hover:scale-102"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
              <span>LIVE PHOTOS (実況写真)</span>
            </button>
          )}

          {/* Falling Flowers Toggle */}
          <button
            onClick={() => setShowSakura(!showSakura)}
            title={showSakura ? 'Hide Falling Flowers' : 'Show Falling Flowers'}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs transition-all cursor-pointer"
          >
            🌸
          </button>

          {/* Sound Chimes Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Chimes (M)' : 'Enable Chimes (M)'}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs transition-all cursor-pointer"
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-white/10 hover:bg-white/20 border-white/25 text-white'
            }`}
          >
            {isFullscreen ? 'EXIT (F)' : 'FULLSCREEN (F)'}
          </button>

          {/* Local IST Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </header>

      {/* ============================================================= */}
      {/* 2. MAIN TIMER ARENA (FITS 100% IN VIEWPORT WITHOUT SCROLLING) */}
      {/* ============================================================= */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-[1700px] mx-auto px-3 sm:px-5 lg:px-6 py-2 sm:py-3 flex flex-col justify-between lg:overflow-hidden gap-2 sm:gap-3">
        
        {/* TOP ROW: EVENT BRAND BANNER + LIVE DRAGON WISDOM + STATS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-1.5 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/medaithon-logo.png"
              alt="MedAIthon 2026"
              className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]"
            />
            <div className="flex items-center gap-2">
              <span className="font-['Bebas_Neue'] text-lg sm:text-xl text-white tracking-wider leading-none">
                THE 50-HOUR DRAGON CRUCIBLE
              </span>
              <span className="font-serif text-xs text-amber-300 hidden sm:inline">
                鍛錬の刻
              </span>
            </div>
          </div>

          {/* Live Dragon Quote Ticker */}
          <div
            onClick={handleDragonClick}
            className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 max-w-lg cursor-pointer transition-colors"
            title="Click to receive new dragon quote"
          >
            <span className="text-amber-400">🐉</span>
            <span className="truncate italic font-light">{dragonSpeech}</span>
          </div>

          {/* Event Crucible Chips */}
          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
              <strong className="text-white">50h</strong> Crucible
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
              <strong className="text-cyan-300">200+</strong> Warriors
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
              <strong className="text-amber-300">₹1,00,000+</strong> Glory
            </span>
          </div>
        </div>

        {/* =========================================================== */}
        {/* CENTER ARENA: TIMER DISPLAY + CONTROLS + MEDI DRAGON        */}
        {/* =========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 items-center flex-1 min-h-0 my-auto">
          
          {/* LEFT 7 COLS: TIMER ENGINE, CIRCULAR GAUGE & GLASS CONTROLS */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full rounded-3xl border border-white/20 bg-black/75 backdrop-blur-2xl p-3.5 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.25)] relative overflow-hidden">
            {/* Top Katana Shimmer Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 pointer-events-none" />

            {/* Time Cards & Circular Completion Gauge */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 my-auto">
              {/* Digit Cards Group */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 w-full">
                {/* Hours Box */}
                <div className="relative group flex-1 max-w-[125px] sm:max-w-[155px]">
                  {isRunning && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/25 via-white/20 to-cyan-500/25 rounded-2xl blur-sm opacity-60 animate-sakura-sweep" />
                  )}
                  <div className={`relative flex flex-col items-center justify-center bg-black/85 border rounded-2xl p-2.5 sm:p-3.5 backdrop-blur-xl transition-all duration-300 ${
                    isRunning
                      ? 'border-white/35 shadow-[0_10px_30px_rgba(255,255,255,0.15),inset_0_1px_1px_rgba(255,255,255,0.35)]'
                      : 'border-white/15'
                  }`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-serif text-[11px] sm:text-xs text-white font-bold">時</span>
                      <span className="text-[8px] font-mono text-gray-400">HRS</span>
                    </div>
                    <span className="font-['Bebas_Neue'] text-5xl sm:text-7xl lg:text-7xl xl:text-8xl leading-none tracking-tight text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)]">
                      {hours.toString().padStart(2, '0')}
                    </span>
                    <span className="font-['Inter'] text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
                      HOURS
                    </span>
                  </div>
                </div>

                <span className={`text-white text-2xl sm:text-3xl font-bold ${isRunning ? 'animate-pulse' : 'opacity-40'}`}>:</span>

                {/* Minutes Box */}
                <div className="relative group flex-1 max-w-[125px] sm:max-w-[155px]">
                  {isRunning && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/25 via-white/20 to-cyan-500/25 rounded-2xl blur-sm opacity-60 animate-sakura-sweep" />
                  )}
                  <div className={`relative flex flex-col items-center justify-center bg-black/85 border rounded-2xl p-2.5 sm:p-3.5 backdrop-blur-xl transition-all duration-300 ${
                    isRunning
                      ? 'border-cyan-400/40 shadow-[0_10px_30px_rgba(6,182,212,0.2),inset_0_1px_1px_rgba(255,255,255,0.35)]'
                      : 'border-white/15'
                  }`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-serif text-[11px] sm:text-xs text-cyan-300 font-bold">分</span>
                      <span className="text-[8px] font-mono text-gray-400">MINS</span>
                    </div>
                    <span className="font-['Bebas_Neue'] text-5xl sm:text-7xl lg:text-7xl xl:text-8xl leading-none tracking-tight text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)]">
                      {minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="font-['Inter'] text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
                      MINUTES
                    </span>
                  </div>
                </div>

                <span className={`text-white text-2xl sm:text-3xl font-bold ${isRunning ? 'animate-pulse' : 'opacity-40'}`}>:</span>

                {/* Seconds Box with Tenths */}
                <div className="relative group flex-1 max-w-[125px] sm:max-w-[155px]">
                  {isRunning && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/25 via-white/20 to-amber-500/25 rounded-2xl blur-sm opacity-60 animate-sakura-sweep" />
                  )}
                  <div className={`relative flex flex-col items-center justify-center bg-black/85 border rounded-2xl p-2.5 sm:p-3.5 backdrop-blur-xl transition-all duration-300 ${
                    isRunning
                      ? 'border-amber-400/45 shadow-[0_10px_30px_rgba(245,158,11,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)]'
                      : 'border-white/15'
                  }`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-serif text-[11px] sm:text-xs text-amber-300 font-bold">秒</span>
                      <span className="text-[8px] font-mono text-gray-400">SECS</span>
                    </div>
                    <div className="flex items-baseline justify-center">
                      <span className="font-['Bebas_Neue'] text-5xl sm:text-7xl lg:text-7xl xl:text-8xl leading-none tracking-tight text-white drop-shadow-[0_4px_20px_rgba(255,215,0,0.4)]">
                        {seconds.toString().padStart(2, '0')}
                      </span>
                      <span className="font-mono text-xs sm:text-sm text-amber-300/90 ml-0.5 font-bold">
                        .{tenths}
                      </span>
                    </div>
                    <span className="font-['Inter'] text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
                      SECONDS
                    </span>
                  </div>
                </div>
              </div>

              {/* Circular Japanese Radial Gauge */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r={gaugeRadius}
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-white/10"
                    fill="transparent"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r={gaugeRadius}
                    stroke="url(#progressGaugeGradientClean)"
                    strokeWidth="5"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeStrokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="progressGaugeGradientClean" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-serif text-[9px] text-cyan-300 leading-none">進捗</span>
                  <span className="font-['Bebas_Neue'] text-lg sm:text-xl text-white leading-none">
                    {progressPercent}%
                  </span>
                  <span className="text-[7px] font-mono text-gray-400 uppercase tracking-wider">
                    Done
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Summary Pill */}
            <div className="my-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gray-300 px-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                <span className="text-white font-serif">目標:</span>
                <strong className="text-white">50h 00m 00s</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                <span className="text-cyan-300 font-serif">経過:</span>
                <strong className="text-cyan-300">{Math.floor(elapsedSeconds / 3600)}h {Math.floor((elapsedSeconds % 3600) / 60)}m</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                <span className="text-amber-300 font-serif">残り:</span>
                <strong className="text-amber-300">{hours}h {minutes}m {seconds}s</strong>
              </span>
            </div>

            {/* Linear Milestone Progress Bar */}
            <div className="w-full space-y-1 my-1">
              <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">⛩</span>
                  <span>00h 合戦開始</span>
                </span>
                <span className="text-white font-medium flex items-center gap-1">
                  <span className="text-gray-300 font-serif">現在関門:</span>
                  <strong className="text-cyan-300">
                    {MILESTONES[currentMilestoneIndex].kanji} ({MILESTONES[currentMilestoneIndex].label})
                  </strong>
                </span>
                <span>50h 天下統一 🏆</span>
              </div>
              <div className="relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/15 p-[0.5px]">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-white to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  style={{ width: `${Math.min(100, Math.max(0, parseFloat(progressPercent)))}%` }}
                />
              </div>
            </div>

            {/* PRIMARY INTERACTIVE CONTROLS (FROSTED GLASSMORPHISM) */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {/* Play / Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="relative group flex items-center gap-2 px-4 py-2 rounded-xl font-['Bebas_Neue'] text-base tracking-wider text-white backdrop-blur-xl border border-white/25 hover:border-white/50 bg-white/10 hover:bg-white/20 shadow-[0_8px_25px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all cursor-pointer hover:scale-102"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />
                  {isRunning ? (
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
                      <span>START 50H (開始)</span>
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
                  onClick={() => adjustTime(3600)}
                  title="Add 1 Hour"
                  className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  +1h
                </button>
                <button
                  onClick={() => adjustTime(-3600)}
                  title="Subtract 1 Hour"
                  className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  -1h
                </button>
              </div>

              {/* Presets Pills */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                <button
                  onClick={() => resetTimer(50 * 3600)}
                  className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-[10px] ${
                    totalSeconds === 50 * 3600 ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10'
                  }`}
                >
                  50h (本戦)
                </button>
                <button
                  onClick={() => resetTimer(24 * 3600)}
                  className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-[10px] ${
                    totalSeconds === 24 * 3600 ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10'
                  }`}
                >
                  24h
                </button>
                <button
                  onClick={() => resetTimer(4 * 3600)}
                  className={`px-2 py-1 rounded-lg border transition-all cursor-pointer text-[10px] ${
                    totalSeconds === 4 * 3600 ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10'
                  }`}
                >
                  4h
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: SERENE MEDI DRAGON (STRICTLY NO SHAKE / NO TILT) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between h-full rounded-3xl border border-white/20 bg-black/75 backdrop-blur-2xl p-3.5 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.25)] relative overflow-hidden">
            {/* Top Katana Shimmer Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80 pointer-events-none" />

            {/* Dragon Speech Card */}
            <div className="w-full relative z-20 shrink-0">
              <div className="relative bg-black/80 border border-white/20 rounded-2xl p-2.5 sm:p-3 backdrop-blur-xl shadow-md">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-amber-400 flex items-center justify-center text-xs font-bold text-black shrink-0 shadow-md">
                    🐉
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-serif text-xs text-amber-300 font-bold">
                        守護龍 MEDI DRAGON
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">
                        TAP TO BLESS
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 leading-snug font-light line-clamp-2">
                      "{dragonSpeech}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Medi Dragon Mascot - SMOOTH VERTICAL FLOAT ONLY */}
            <div
              onClick={handleDragonClick}
              className="relative group cursor-pointer flex items-center justify-center my-auto select-none py-1"
              title="Click Medi Dragon to receive a tranquil blessing"
            >
              {/* Serene Dragon Aura Glow */}
              <div className={`absolute w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 rounded-full bg-gradient-to-tr from-cyan-500/20 via-white/10 to-amber-500/20 blur-[50px] pointer-events-none transition-all duration-700 ${
                dragonAuraGlow ? 'opacity-90 scale-110' : 'animate-dragon-aura'
              }`} />

              {/* Japanese Zen Garden Circular Rings */}
              <div className="absolute w-56 sm:w-68 h-56 sm:h-68 rounded-full border border-dashed border-white/15 animate-radar pointer-events-none" />

              {/* Medi Dragon Image - Smooth vertical floating only, 0 rotation, 0 shake */}
              <div className="relative z-10">
                <img
                  src="/images/medi-dragon.png"
                  alt="Medi Dragon Mascot"
                  className="max-h-[26vh] lg:max-h-[30vh] xl:max-h-[34vh] w-auto object-contain filter drop-shadow-[0_15px_35px_rgba(255,255,255,0.35)] animate-dragon-float"
                />
              </div>

              {/* Hover Prompt Pill */}
              <div className="absolute -bottom-2 z-20 px-3 py-0.5 rounded-full bg-black/85 border border-white/25 text-[10px] font-mono text-gray-300 group-hover:text-amber-300 group-hover:border-amber-400/50 backdrop-blur-md shadow-md transition-all flex items-center gap-1">
                <span>⚔️ Tap Dragon for Blessing</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="w-full grid grid-cols-3 gap-2 shrink-0 pt-2 border-t border-white/10">
              <div className="bg-white/5 border border-white/10 rounded-xl p-1.5 text-center">
                <span className="block font-['Bebas_Neue'] text-lg sm:text-xl text-white leading-none">
                  50 HRS
                </span>
                <span className="text-[8px] text-gray-400 font-mono uppercase">
                  Fifty Hours
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-1.5 text-center">
                <span className="block font-['Bebas_Neue'] text-lg sm:text-xl text-cyan-300 leading-none">
                  200+
                </span>
                <span className="text-[8px] text-gray-400 font-mono uppercase">
                  Hackers
                </span>
              </div>
              <div className="bg-white/5 border border-amber-500/20 rounded-xl p-1.5 text-center">
                <span className="block font-['Bebas_Neue'] text-lg sm:text-xl text-amber-300 leading-none">
                  ₹1,00,000+
                </span>
                <span className="text-[8px] text-gray-400 font-mono uppercase">
                  Prize Pool
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================== */}
        {/* 3. 50-HOUR CRUCIBLE MILESTONES (COMPACT 7-PHASE HORIZON BAR)*/}
        {/* =========================================================== */}
        <section className="w-full shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2">
            {MILESTONES.map((m, idx) => {
              const isPassed = elapsedHoursExact >= m.hour;
              const isCurrent = idx === currentMilestoneIndex;
              return (
                <div
                  key={m.hour}
                  className={`p-2 rounded-xl border transition-all backdrop-blur-xl relative overflow-hidden flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white/15 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.25)] scale-102 ring-1 ring-cyan-400/50'
                      : isPassed
                      ? 'bg-white/5 border-white/20 text-gray-300 opacity-90'
                      : 'bg-black/30 border-white/5 text-gray-500 opacity-60'
                  }`}
                  title={`${m.hour}H - ${m.label}: ${m.desc}`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-white to-amber-400 animate-pulse" />
                  )}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm">{m.icon}</span>
                    <span className={`font-mono text-[9px] font-bold px-1 py-0.2 rounded ${
                      isCurrent ? 'bg-amber-400 text-black' : isPassed ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-400'
                    }`}>
                      {m.hour}H
                    </span>
                  </div>
                  <div>
                    <div className="font-serif text-[10px] font-bold text-gray-300 truncate">
                      {m.kanji}
                    </div>
                    <div className="font-['Inter'] text-[10px] font-bold text-white truncate leading-tight">
                      {m.label}
                    </div>
                  </div>
                  <div className="mt-1 pt-0.5 border-t border-white/10 flex items-center justify-between text-[8px] font-mono">
                    <span className={isCurrent ? 'text-amber-300 font-semibold' : isPassed ? 'text-emerald-400' : 'text-gray-500'}>
                      {isCurrent ? '● ACTIVE' : isPassed ? '✓ PASSED' : 'UPCOMING'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ============================================================= */}
      {/* 4. COMPACT FOOTER BAR                                         */}
      {/* ============================================================= */}
      <footer className="relative z-20 w-full px-3 sm:px-6 py-1.5 border-t border-white/10 backdrop-blur-md bg-black/60 flex flex-wrap items-center justify-between text-xs text-gray-400 font-mono gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">MEDAITHON 2026 メダイソン</span>
          <span className="text-gray-600">|</span>
          <span className="font-serif text-[11px] hidden sm:inline">龍の道 • 50時間極限ハッカソン</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden sm:inline">Shortcuts: <kbd className="px-1 py-0.2 bg-white/10 rounded text-white text-[10px]">Space</kbd> Play/Pause &bull; <kbd className="px-1 py-0.2 bg-white/10 rounded text-white text-[10px]">F</kbd> Fullscreen</span>
          <span className="text-gray-500">&copy; 2026 MedAIthon Council</span>
        </div>
      </footer>
    </div>
  );
};

export default TimerPage;
