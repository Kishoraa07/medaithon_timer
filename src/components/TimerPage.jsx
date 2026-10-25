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

  const [mode, setMode] = useState('countdown'); // 'countdown' | 'elapsed'
  const [soundEnabled, setSoundEnabled] = useState(false);
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
  }, [getAudioContext]);

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
  const gaugeRadius = 48;
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
      <div className="fixed -top-10 -right-10 pointer-events-none z-0 select-none opacity-[0.03] text-[280px] sm:text-[420px] font-serif leading-none text-white">
        龍
      </div>
      <div className="fixed -bottom-20 -left-10 pointer-events-none z-0 select-none opacity-[0.02] text-[240px] sm:text-[380px] font-serif leading-none text-white">
        桜
      </div>

      {/* Glowing Ambient Radial Backdrop with Sleek Cyan, Silver & Amber Glow (No Pink) */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[520px] bg-gradient-to-tr from-cyan-500/10 via-white/5 to-amber-500/10 blur-[140px] rounded-full pointer-events-none z-0 animate-pulse-glow" />

      {/* TOP JAPANESE STYLED NAVBAR */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 border-b border-white/10 backdrop-blur-xl bg-black/45 flex flex-wrap items-center justify-between gap-4">
        {/* MedAIthon Brand Info & Japanese Hanko Seal */}
        <div className="flex items-center gap-3.5">
          {/* Traditional Hanko Red Seal Stamp: [龍] */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-700/80 border-2 border-red-500/90 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center text-white font-serif font-black text-sm sm:text-base select-none shrink-0">
            龍
          </div>

          <div className="relative group cursor-pointer">
            <img
              src="/medaithon-logo-nav-footer.png"
              alt="MedAIthon Logo"
              className="relative h-8 sm:h-10 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-['Bebas_Neue'] text-lg sm:text-2xl tracking-wider text-white">
                MEDAITHON 2026
              </span>
              <span className="text-[10px] font-serif tracking-widest text-gray-300 hidden sm:inline">
                メダイソン
              </span>
              {/* Dynamic Status Badge */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 border transition-all ${
                isRunning
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {isRunning ? '● 進行中 RUNNING' : '⏸ 停止中 PAUSED'}
              </span>

              {/* Multi-Device Serverless Sync Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                <span className={`w-1 h-1 rounded-full ${syncStatus === 'synced' ? 'bg-cyan-400' : 'bg-yellow-400 animate-ping'}`} />
                {syncStatus === 'synced' ? 'VERCEL SYNCED' : 'LOCAL CACHE'}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-400 font-light tracking-wide hidden sm:block">
              龍の道 • 50時間極限ハッカソン (The Way of the Dragon • 50-Hour Hackathon)
            </span>
          </div>
        </div>

        {/* Live Local Clock & Quick Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Link to Realtime Gallery Page */}
          {onNavigateToGallery && (
            <button
              onClick={onNavigateToGallery}
              title="View Real-Time Live Event Photo Feed"
              className="relative group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50 text-xs font-['Bebas_Neue'] tracking-wider text-white backdrop-blur-xl shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all cursor-pointer hover:scale-102"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE PHOTOS (実況写真)</span>
            </button>
          )}

          {/* Falling Flowers Toggle */}
          <button
            onClick={() => setShowSakura(!showSakura)}
            title={showSakura ? 'Hide Falling Flowers' : 'Show Falling Flowers'}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-serif flex items-center gap-1.5 transition-all cursor-pointer ${
              showSakura
                ? 'bg-white/10 border-white/30 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <span>🌸</span>
            <span className="text-[11px] hidden sm:inline">花吹雪 {showSakura ? 'ON' : 'OFF'}</span>
          </button>

          {/* Local IST Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>IST: {currentTime.toLocaleTimeString()}</span>
          </div>

          {/* Mode Switch (Countdown / Elapsed) */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMode('countdown')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'countdown'
                  ? 'bg-white text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              残り時間
            </button>
            <button
              onClick={() => setMode('elapsed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'elapsed'
                  ? 'bg-white text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              経過時間
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              getAudioContext();
              setSoundEnabled(!soundEnabled);
            }}
            title={soundEnabled ? 'Mute Audio (M)' : 'Enable Audio Chimes (M)'}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {soundEnabled ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          {/* Fullscreen Button */}
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

      {/* MAIN TIMER ARENA */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 md:py-4 flex flex-col justify-between overflow-y-auto lg:overflow-visible">
        {/* Japanese Calligraphy Subtitle & Top Banner */}
        <div className="flex flex-col items-center text-center mb-2 sm:mb-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-white/5 to-amber-500/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-md mb-1.5">
            <span className="font-serif text-cyan-300 text-xs sm:text-sm">⚔️ 鍛錬の刻</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-['Inter'] text-[11px] sm:text-xs font-semibold tracking-wider text-gray-200 uppercase">
              The 50-Hour Dragon Crucible
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-serif text-amber-300 text-xs sm:text-sm">五十時間</span>
          </div>

          <h1 className="font-['Bebas_Neue'] text-2xl sm:text-4xl md:text-5xl lg:text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-500 leading-tight drop-shadow-[0_4px_30px_rgba(255,255,255,0.3)]">
            WHERE CODE MEETS THE WAY OF THE DRAGON
          </h1>
          <p className="text-xs text-gray-400 max-w-xl font-light">
            50 hours of relentless engineering, hardware innovation, and clinical intelligence forging the future of medicine.
          </p>
        </div>

        {/* CENTER GRID: ENHANCED TIMER & SERENE MEDI DRAGON */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center flex-1 my-auto">
          {/* LEFT 7 COLS: MEDAITHON LOGO ABOVE TIMER & GIANT DIGITAL CLOCK */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start space-y-3">
            
            {/* MEDAITHON LOGO DIRECTLY ABOVE THE TIMER */}
            <div className="w-full flex justify-center lg:justify-start">
              <div className="relative group">
                {/* Backlight ambient halo */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-white/10 to-amber-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500 pointer-events-none" />
                <img
                  src="/medaithon-logo.png"
                  alt="MedAIthon 2026"
                  className="relative h-10 sm:h-12 md:h-14 w-auto object-contain filter drop-shadow-[0_8px_25px_rgba(255,255,255,0.3)]"
                />
              </div>
            </div>

            {/* The Enhanced Time Card Group with Active Running Glow (Clean Silver / Cyan / Amber - Zero Pink) */}
            <div className="w-full flex flex-col items-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 w-full">
                {/* Digit Cards Group */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 flex-1 w-full sm:w-auto">
                  {/* Hours Box */}
                  <div className="relative group flex-1 max-w-[115px] sm:max-w-[145px] md:max-w-[175px]">
                    {/* Active Running Shimmer Sweep */}
                    {isRunning && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/25 via-white/20 to-cyan-500/25 rounded-3xl blur-md opacity-60 animate-sakura-sweep" />
                    )}
                    <div className={`relative flex flex-col items-center justify-center bg-black/75 border rounded-2xl sm:rounded-3xl p-3 sm:p-5 backdrop-blur-2xl transition-all duration-500 overflow-hidden ${
                      isRunning
                        ? 'border-white/35 shadow-[0_15px_45px_rgba(255,255,255,0.15),0_0_20px_rgba(6,182,212,0.2),inset_0_1px_2px_rgba(255,255,255,0.4)] animate-timer-running'
                        : 'border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    }`}>
                      {/* Top Katana Shimmer Line */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-90" />
                      
                      {/* Japanese Kanji Accent: 時 (Hours) */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-serif text-xs sm:text-sm text-white font-bold">
                          時
                        </span>
                        <span className="text-[9px] font-mono text-gray-400">JIKAN</span>
                      </div>

                      {/* Main Digits */}
                      <span className={`font-['Bebas_Neue'] text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight transition-colors duration-300 ${
                        isRunning ? 'text-white drop-shadow-[0_4px_30px_rgba(255,255,255,0.5)]' : 'text-gray-200'
                      }`}>
                        {hours.toString().padStart(2, '0')}
                      </span>

                      <span className="font-['Inter'] text-[9px] sm:text-[11px] text-gray-400 font-bold tracking-[0.25em] uppercase mt-2">
                        HOURS
                      </span>
                    </div>
                  </div>

                  {/* Pulsing Colon with Heartbeat Pulse */}
                  <div className="flex flex-col gap-2.5 pb-6">
                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                      isRunning
                        ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,1)] animate-ping'
                        : 'bg-white/40'
                    }`} />
                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                      isRunning
                        ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,1)]'
                        : 'bg-white/40'
                    }`} />
                  </div>

                  {/* Minutes Box */}
                  <div className="relative group flex-1 max-w-[115px] sm:max-w-[145px] md:max-w-[175px]">
                    {isRunning && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/25 via-white/20 to-cyan-500/25 rounded-3xl blur-md opacity-60 animate-sakura-sweep" />
                    )}
                    <div className={`relative flex flex-col items-center justify-center bg-black/75 border rounded-2xl sm:rounded-3xl p-3 sm:p-5 backdrop-blur-2xl transition-all duration-500 overflow-hidden ${
                      isRunning
                        ? 'border-white/35 shadow-[0_15px_45px_rgba(255,255,255,0.15),0_0_20px_rgba(6,182,212,0.2),inset_0_1px_2px_rgba(255,255,255,0.4)] animate-timer-running'
                        : 'border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    }`}>
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-90" />
                      
                      {/* Japanese Kanji Accent: 分 (Minutes) */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-serif text-xs sm:text-sm text-cyan-300 font-bold">
                          分
                        </span>
                        <span className="text-[9px] font-mono text-gray-400">FUN</span>
                      </div>

                      <span className={`font-['Bebas_Neue'] text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight transition-colors duration-300 ${
                        isRunning ? 'text-white drop-shadow-[0_4px_30px_rgba(255,255,255,0.5)]' : 'text-gray-200'
                      }`}>
                        {minutes.toString().padStart(2, '0')}
                      </span>

                      <span className="font-['Inter'] text-[9px] sm:text-[11px] text-gray-400 font-bold tracking-[0.25em] uppercase mt-2">
                        MINUTES
                      </span>
                    </div>
                  </div>

                  {/* Pulsing Colon */}
                  <div className="flex flex-col gap-2.5 pb-6">
                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                      isRunning
                        ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,1)] animate-ping'
                        : 'bg-white/40'
                    }`} />
                    <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                      isRunning
                        ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,1)]'
                        : 'bg-white/40'
                    }`} />
                  </div>

                  {/* Seconds Box with Active Heartbeat Punch */}
                  <div className="relative group flex-1 max-w-[115px] sm:max-w-[145px] md:max-w-[175px]">
                    {isRunning && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/25 via-white/20 to-amber-500/25 rounded-3xl blur-md opacity-60 animate-sakura-sweep" />
                    )}
                    <div className={`relative flex flex-col items-center justify-center bg-black/75 border rounded-2xl sm:rounded-3xl p-3 sm:p-5 backdrop-blur-2xl transition-all duration-500 overflow-hidden ${
                      isRunning
                        ? 'border-amber-400/45 shadow-[0_15px_45px_rgba(245,158,11,0.25),inset_0_1px_2px_rgba(255,255,255,0.4)] animate-timer-running'
                        : 'border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    }`}>
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-90" />
                      
                      {/* Japanese Kanji Accent: 秒 (Seconds) */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-serif text-xs sm:text-sm text-amber-300 font-bold">
                          秒
                        </span>
                        <span className="text-[9px] font-mono text-gray-400">BYO</span>
                      </div>

                      <span className={`font-['Bebas_Neue'] text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight transition-colors duration-300 ${
                        isRunning ? 'text-white drop-shadow-[0_4px_30px_rgba(255,215,0,0.5)]' : 'text-gray-200'
                      }`}>
                        {seconds.toString().padStart(2, '0')}
                      </span>

                      <span className="font-['Inter'] text-[9px] sm:text-[11px] text-gray-400 font-bold tracking-[0.25em] uppercase mt-2 flex items-center gap-1">
                        SECONDS
                        <span className="font-mono text-[9px] text-amber-400/90">.{tenths}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Circular Japanese Radial Gauge for Hackathon Progress */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 110 110">
                    <circle
                      cx="55"
                      cy="55"
                      r={gaugeRadius}
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-white/10"
                      fill="transparent"
                    />
                    <circle
                      cx="55"
                      cy="55"
                      r={gaugeRadius}
                      stroke="url(#progressGaugeGradientClean)"
                      strokeWidth="6"
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
                    <span className="font-serif text-[10px] text-cyan-300 leading-none mb-0.5">
                      進捗
                    </span>
                    <span className="font-['Bebas_Neue'] text-xl sm:text-2xl text-white leading-none">
                      {progressPercent}%
                    </span>
                    <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider">
                      Done
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Summary Pill */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono text-gray-300">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <span className="text-white font-serif">目標:</span>
                  <strong className="text-white">50h 00m 00s</strong>
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <span className="text-cyan-300 font-serif">経過:</span>
                  <strong className="text-cyan-300">{Math.floor(elapsedSeconds / 3600)}h {Math.floor((elapsedSeconds % 3600) / 60)}m</strong>
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <span className="text-amber-300 font-serif">残り:</span>
                  <strong className="text-amber-300">{hours}h {minutes}m {seconds}s</strong>
                </span>
              </div>
            </div>

            {/* Linear Progress Bar with Japanese Torii Accent */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">⛩</span>
                  <span>00h 合戦開始</span>
                </span>
                <span className="text-white font-medium flex items-center gap-1">
                  <span className="text-gray-300 font-serif">現在関門:</span>
                  <strong className="text-cyan-300">{MILESTONES[currentMilestoneIndex].kanji} ({MILESTONES[currentMilestoneIndex].label})</strong>
                </span>
                <span>50h 天下統一 🏆</span>
              </div>
              <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/15 p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-white to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                  style={{ width: `${Math.min(100, Math.max(0, parseFloat(progressPercent)))}%` }}
                />
              </div>
            </div>

            {/* PRIMARY INTERACTIVE CONTROLS */}
            <div className="w-full flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
              {/* Play / Pause Button - Translucent Glassmorphism Look */}
              <button
                onClick={togglePlayPause}
                className={`relative group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-['Bebas_Neue'] text-base sm:text-lg tracking-wider text-white backdrop-blur-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isRunning
                    ? 'bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.35)] hover:scale-102 active:scale-98'
                    : 'bg-white/5 hover:bg-white/15 border-white/20 hover:border-white/40 shadow-[0_8px_25px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:scale-102 active:scale-98'
                }`}
              >
                {/* Glass top specular highlight reflection line */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

                {isRunning ? (
                  <>
                    <svg className="w-4 h-4 fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    <span className="drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]">PAUSE TIMER (停止)</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]">START 50H COUNTDOWN (開始)</span>
                  </>
                )}
              </button>

              {/* Reset Button */}
              <button
                onClick={() => resetTimer(TOTAL_50_HOURS_SECONDS)}
                title="Reset to 50:00:00 (Shift+R)"
                className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/30 text-white font-['Inter'] text-xs sm:text-sm font-semibold transition-all cursor-pointer backdrop-blur-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>初期化 Reset 50h</span>
              </button>

              {/* Quick Adjust Buttons */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
                <button
                  onClick={() => adjustTime(3600)}
                  title="Add 1 Hour"
                  className="px-2.5 py-2 rounded-xl text-xs font-mono font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  +1h
                </button>
                <button
                  onClick={() => adjustTime(-3600)}
                  title="Subtract 1 Hour"
                  className="px-2.5 py-2 rounded-xl text-xs font-mono font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  -1h
                </button>
                <button
                  onClick={() => adjustTime(900)}
                  title="Add 15 Minutes"
                  className="px-2.5 py-2 rounded-xl text-xs font-mono font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  +15m
                </button>
                <button
                  onClick={() => adjustTime(-900)}
                  title="Subtract 15 Minutes"
                  className="px-2.5 py-2 rounded-xl text-xs font-mono font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  -15m
                </button>
              </div>
            </div>

            {/* Presets Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-400">
              <span className="font-mono text-[11px] uppercase tracking-wider text-gray-300 font-serif">設定:</span>
              <button
                onClick={() => resetTimer(50 * 3600)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  totalSeconds === 50 * 3600
                    ? 'bg-white/20 border-white/40 text-white font-semibold shadow-sm'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
                }`}
              >
                50 Hours (本戦)
              </button>
              <button
                onClick={() => resetTimer(24 * 3600)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  totalSeconds === 24 * 3600
                    ? 'bg-white/20 border-white/40 text-white font-semibold'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
                }`}
              >
                24 Hours (半日)
              </button>
              <button
                onClick={() => resetTimer(12 * 3600)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  totalSeconds === 12 * 3600
                    ? 'bg-white/20 border-white/40 text-white font-semibold'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
                }`}
              >
                12 Hours (夜戦)
              </button>
              <button
                onClick={() => resetTimer(4 * 3600)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  totalSeconds === 4 * 3600
                    ? 'bg-white/20 border-white/40 text-white font-semibold'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
                }`}
              >
                Final 4 Hours (決戦)
              </button>
              <button
                onClick={() => resetTimer(300)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                  totalSeconds === 300
                    ? 'bg-white/20 border-white/40 text-white font-semibold'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
                }`}
              >
                5m Pitch Demo (発表)
              </button>
            </div>
          </div>

          {/* RIGHT 5 COLS: SERENE & MAJESTIC MEDI DRAGON (STRICTLY NO SHAKING) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            {/* Dragon Speech / Motivational Bubble */}
            <div className="w-full max-w-md mb-3 relative z-20">
              <div className="relative bg-black/80 border border-white/20 rounded-2xl p-4 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-amber-400 flex items-center justify-center text-sm font-bold text-black shrink-0 shadow-md">
                    🐉
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif text-xs sm:text-sm tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                        <span>守護龍 MEDI DRAGON</span>
                        <span className="text-[10px] text-gray-400 font-mono">神託</span>
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        CLICK FOR BLESSING
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-light">
                      "{dragonSpeech}"
                    </p>
                  </div>
                </div>
                {/* Speech bubble arrow pointer */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/80 border-b border-r border-white/20 rotate-45" />
              </div>
            </div>

            {/* Interactive Medi Dragon Character - STRICTLY NO SHAKE / NO TILT / NO JITTER */}
            <div
              onClick={handleDragonClick}
              className="relative group cursor-pointer flex items-center justify-center py-2 select-none"
              title="Click Medi Dragon to receive a tranquil blessing & quote"
            >
              {/* Serene Dragon Aura - Pulsing celestial glow (Smooth breathing, no shaking) */}
              <div className={`absolute w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 rounded-full bg-gradient-to-tr from-cyan-500/20 via-white/10 to-amber-500/20 blur-[55px] pointer-events-none transition-all duration-700 ${
                dragonAuraGlow ? 'opacity-90 scale-110' : 'animate-dragon-aura'
              }`} />

              {/* Japanese Zen Garden Circular Rings (Smooth constant rotation, no shaking) */}
              <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full border border-dashed border-white/15 animate-radar pointer-events-none" />
              <div className="absolute w-72 sm:w-84 h-72 sm:h-84 rounded-full border border-white/10 pointer-events-none" />

              {/* Medi Dragon Image - Smooth vertical floating only, ZERO rotation, ZERO shake */}
              <div className="relative z-10">
                <img
                  src="/images/medi-dragon.png"
                  alt="Medi Dragon Mascot"
                  className="w-64 sm:w-72 md:w-80 lg:w-[340px] xl:w-[380px] object-contain filter drop-shadow-[0_20px_45px_rgba(255,255,255,0.35)] animate-dragon-float"
                />
              </div>

              {/* Interactive Pill on Hover */}
              <div className="absolute -bottom-2 z-20 px-3.5 py-1 rounded-full bg-black/85 border border-white/25 text-[11px] font-mono text-gray-300 group-hover:text-amber-300 group-hover:border-amber-400/50 backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5">
                <span>⚔️ 龍の加護 Tap Dragon for Blessing</span>
              </div>
            </div>

            {/* Dragon Energy & Hackathon Stats */}
            <div className="w-full max-w-md mt-5 grid grid-cols-3 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-md">
                <span className="block font-['Bebas_Neue'] text-xl sm:text-2xl text-white leading-none">
                  50 HRS
                </span>
                <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider flex items-center justify-center gap-1">
                  <span>五十時間</span>
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-md">
                <span className="block font-['Bebas_Neue'] text-xl sm:text-2xl text-cyan-300 leading-none">
                  200+
                </span>
                <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider flex items-center justify-center gap-1">
                  <span>猛者 Hackers</span>
                </span>
              </div>
              <div className="bg-white/5 border border-amber-500/20 rounded-xl p-2.5 text-center backdrop-blur-md">
                <span className="block font-['Bebas_Neue'] text-xl sm:text-2xl text-amber-300 leading-none">
                  ₹1,00,000+
                </span>
                <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider flex items-center justify-center gap-1">
                  <span>賞金 Prize</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 50-HOUR JAPANESE MILESTONES ROADMAP / TIMELINE BAR */}
        <section className="mt-2 sm:mt-3 lg:mt-4 w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-serif">⛩</span>
              <h3 className="font-['Bebas_Neue'] text-lg sm:text-xl text-white tracking-wider flex items-center gap-2">
                <span>50-HOUR CRUCIBLE MILESTONES</span>
                <span className="font-serif text-xs text-gray-400 tracking-normal">(五段階関門)</span>
              </h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              Current: <strong className="text-white">{MILESTONES[currentMilestoneIndex].kanji}</strong> ({MILESTONES[currentMilestoneIndex].label})
            </span>
          </div>

          {/* Milestone Cards Grid with Japanese Kanji */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {MILESTONES.map((m, idx) => {
              const isPassed = elapsedHoursExact >= m.hour;
              const isCurrent = idx === currentMilestoneIndex;
              return (
                <div
                  key={m.hour}
                  className={`p-3 rounded-2xl border transition-all backdrop-blur-xl relative overflow-hidden flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white/15 border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-102'
                      : isPassed
                      ? 'bg-white/5 border-white/20 text-gray-300 opacity-90'
                      : 'bg-black/30 border-white/5 text-gray-500 opacity-60'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-white to-amber-400 animate-pulse" />
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">{m.icon}</span>
                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCurrent ? 'bg-amber-400 text-black' : isPassed ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'
                      }`}>
                        {m.hour}H
                      </span>
                    </div>
                    <div className="font-serif text-[11px] font-bold text-gray-300 mb-0.5">
                      {m.kanji}
                    </div>
                    <h4 className="font-['Inter'] text-xs font-bold leading-tight mb-1 text-white">
                      {m.label}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-light line-clamp-2 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] font-mono">
                    <span className={isCurrent ? 'text-amber-300 font-semibold' : isPassed ? 'text-emerald-400' : 'text-gray-500'}>
                      {isCurrent ? '● 進行中 ACTIVE' : isPassed ? '✓ 突破 PASSED' : '未到 UPCOMING'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-20 w-full px-4 sm:px-8 py-2.5 border-t border-white/10 backdrop-blur-md bg-black/55 flex flex-wrap items-center justify-between text-xs text-gray-400 font-mono gap-3">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">MEDAITHON 2026 メダイソン</span>
          <span className="text-gray-600">|</span>
          <span className="font-serif text-[11px]">龍の道 • 50時間極限ハッカソン</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden sm:inline">Shortcuts: <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white">Space</kbd> Play/Pause &bull; <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white">F</kbd> Fullscreen &bull; <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white">M</kbd> Mute</span>
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

export default TimerPage;
