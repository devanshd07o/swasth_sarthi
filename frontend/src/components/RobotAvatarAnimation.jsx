import React, { useState, useEffect } from 'react';

// Pre-load all 6 robot frames into browser memory for zero lag
const ROBOT_FRAMES = [
  '/robot_frames/robot_1.png',
  '/robot_frames/robot_2.png',
  '/robot_frames/robot_3.png',
  '/robot_frames/robot_4.png',
  '/robot_frames/robot_5.png',
  '/robot_frames/robot_6.png',
];

export default function RobotAvatarAnimation({
  state = 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
  size = 'md',    // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  onClick = null
}) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // Pre-load frames on mount
  useEffect(() => {
    ROBOT_FRAMES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Controlled natural frame animation loop
  useEffect(() => {
    let intervalId = null;
    let blinkTimeout = null;

    if (state === 'listening') {
      intervalId = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % ROBOT_FRAMES.length);
      }, 180);
    } else if (state === 'speaking') {
      intervalId = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % ROBOT_FRAMES.length);
      }, 150);
    } else if (state === 'thinking') {
      intervalId = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev % 3) + 1);
      }, 220);
    } else {
      // IDLE MODE: Default to frame 0 (eyes open). Single quick natural blink every 4.5 seconds
      setCurrentFrameIndex(0);

      const scheduleBlink = () => {
        blinkTimeout = setTimeout(() => {
          let step = 0;
          const blinkTimer = setInterval(() => {
            step++;
            if (step < ROBOT_FRAMES.length) {
              setCurrentFrameIndex(step);
            } else {
              clearInterval(blinkTimer);
              setCurrentFrameIndex(0); // Return to default eyes-open
              scheduleBlink(); // Schedule next blink
            }
          }, 45); // Quick 45ms per frame = 270ms natural eye blink
        }, 4500); // Blink every 4.5 seconds
      };

      scheduleBlink();

      return () => {
        if (blinkTimeout) clearTimeout(blinkTimeout);
      };
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, [state]);

  // Size mapping
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size] || 'w-16 h-16';

  // Glow aura ring based on AI state
  const glowClasses = {
    idle: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    listening: 'drop-shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse',
    thinking: 'drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]',
    speaking: 'drop-shadow-[0_0_20px_rgba(20,184,166,0.7)] animate-pulse',
  }[state] || '';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 ${sizeClasses} ${className}`}
    >
      <img
        src={ROBOT_FRAMES[currentFrameIndex]}
        alt="AyurSaarthi AI Robot Avatar"
        className={`w-full h-full object-contain pointer-events-none transition-all ${glowClasses}`}
      />
    </div>
  );
}
