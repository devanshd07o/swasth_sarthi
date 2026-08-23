import React, { useState, useEffect, useRef } from 'react';

// Pre-load all 6 robot frames into browser memory for zero lag
const ROBOT_FRAMES = [
  '/robot_frames/robot_1.png', // 0: Eyes Wide Open (Default)
  '/robot_frames/robot_2.png', // 1: Slight Eyelid Dip (25%)
  '/robot_frames/robot_3.png', // 2: Half Eyelid Dip (50%)
  '/robot_frames/robot_4.png', // 3: Closing Eyelid (75%)
  '/robot_frames/robot_5.png', // 4: Nearly Closed (90%)
  '/robot_frames/robot_6.png', // 5: Fully Closed Eyes (100% Blink)
];

export default function RobotAvatarAnimation({
  state = 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
  size = 'md',    // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  onClick = null
}) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const isBlinkingRef = useRef(false);

  // Pre-load all 6 images on mount
  useEffect(() => {
    ROBOT_FRAMES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Natural Eye-Blink & State-Based Motion Logic
  useEffect(() => {
    let mainTimer = null;

    if (state === 'speaking') {
      // Mouth / Eye movement synced to speech rhythm (frames 0 -> 1 -> 2 -> 3 -> 2 -> 1 -> 0)
      const speechSequence = [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 3, 1];
      let idx = 0;
      mainTimer = setInterval(() => {
        idx = (idx + 1) % speechSequence.length;
        setCurrentFrameIndex(speechSequence[idx]);
      }, 130);
    } else if (state === 'listening') {
      // Attentive wide-eyed pose with periodic quick dip
      const listenSequence = [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 1, 0];
      let idx = 0;
      mainTimer = setInterval(() => {
        idx = (idx + 1) % listenSequence.length;
        setCurrentFrameIndex(listenSequence[idx]);
      }, 180);
    } else if (state === 'thinking') {
      // Thoughtful eye-narrowing (frames 1 -> 2 -> 3 -> 2 -> 1)
      const thinkSequence = [1, 2, 3, 2, 1, 2];
      let idx = 0;
      mainTimer = setInterval(() => {
        idx = (idx + 1) % thinkSequence.length;
        setCurrentFrameIndex(thinkSequence[idx]);
      }, 200);
    } else {
      // 🌿 IDLE MODE:
      // 1. Character rests naturally on frame 0 (eyes wide open).
      // 2. Fixed duration (interval) between blinks: Every 3.5 seconds.
      // 3. Crisp, natural eye-blink speed (40ms per frame step = 280ms total blink).
      setCurrentFrameIndex(0);

      const triggerCrispBlink = () => {
        if (isBlinkingRef.current) return;
        isBlinkingRef.current = true;

        const blinkSequence = [0, 1, 2, 4, 5, 4, 2, 1, 0];
        let step = 0;

        const timer = setInterval(() => {
          step++;
          if (step < blinkSequence.length) {
            setCurrentFrameIndex(blinkSequence[step]);
          } else {
            clearInterval(timer);
            setCurrentFrameIndex(0); // Lock back on default open eyes
            isBlinkingRef.current = false;
          }
        }, 40); // 40ms per frame = crisp natural eye-blink
      };

      // Fixed 3.5 second interval between blinks
      mainTimer = setInterval(triggerCrispBlink, 3500);
    }

    return () => {
      if (mainTimer) clearInterval(mainTimer);
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
    idle: 'drop-shadow-[0_0_14px_rgba(16,185,129,0.35)]',
    listening: 'drop-shadow-[0_0_22px_rgba(244,63,94,0.75)] animate-pulse',
    thinking: 'drop-shadow-[0_0_22px_rgba(245,158,11,0.75)]',
    speaking: 'drop-shadow-[0_0_22px_rgba(20,184,166,0.75)] animate-pulse',
  }[state] || '';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 ${sizeClasses} ${className}`}
      style={{ animation: 'avatarFloat 3.5s ease-in-out infinite' }}
    >
      <style>{`
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.02); }
        }
      `}</style>
      <img
        src={ROBOT_FRAMES[currentFrameIndex]}
        alt="AyurSaarthi AI Robot Avatar"
        className={`w-full h-full object-contain pointer-events-none transition-all duration-200 ${glowClasses}`}
      />
    </div>
  );
}
