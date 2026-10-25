import React, { useState, useEffect } from 'react';
import { EVENT_DATE } from '../constants';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isAwake, setIsAwake] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = EVENT_DATE.getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsAwake(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isAwake) {
    return (
      <div className="text-center font-['Bebas_Neue'] text-4xl sm:text-6xl text-white border-2 border-white/30 p-6 rounded-2xl bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.2)] backdrop-blur-xl">
        THE HACKATHON IS LIVE 🚀
      </div>
    );
  }

  const TimeCard = ({ value, label }) => (
    <div className="col-center glass-card border border-white/20 rounded-2xl p-2.5 sm:p-4 min-w-[62px] sm:min-w-[100px] shadow-[0_8px_25px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-transform hover:scale-105 group relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-80" />
      <span className="font-['Bebas_Neue'] text-3xl sm:text-5xl text-white leading-none drop-shadow-[0_2px_15px_rgba(255,255,255,0.4)]">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="font-['Inter'] text-[9px] sm:text-xs text-gray-300 mt-1 font-bold tracking-widest uppercase">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2 sm:gap-4 justify-center items-center">
        <TimeCard value={timeLeft.days} label="DAYS" />
        <span className="text-white font-bold text-xl sm:text-3xl opacity-80 animate-pulse -mt-2">:</span>
        <TimeCard value={timeLeft.hours} label="HOURS" />
        <span className="text-white font-bold text-xl sm:text-3xl opacity-80 animate-pulse -mt-2">:</span>
        <TimeCard value={timeLeft.minutes} label="MINS" />
        <span className="text-white font-bold text-xl sm:text-3xl opacity-80 animate-pulse -mt-2">:</span>
        <TimeCard value={timeLeft.seconds} label="SECS" />
      </div>
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] sm:text-xs font-mono text-gray-300 tracking-wider shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>OCTOBER 26, 27 & 28, 2026</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
