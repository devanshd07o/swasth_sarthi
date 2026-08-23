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
    let blinkTimeout = null;

    if (state === 'speaking') {
      // Mouth / Eye movement synced to speech rhythm (frames 0 -> 1 -> 2 -> 3 -> 2 -> 1 -> 0)
      const speechSequence = [0, 1, 2, 3, 2, 1, 0, 1, 4, 1];
      let idx = 0;
      mainTimer = setInterval(() => {
        idx = (idx + 1) % speechSequence.length;
        setCurrentFrameIndex(speechSequence[idx]);
      }, 140);
    } else if (state === 'listening') {
      // Attentive wide-eyed pose with periodic quick dip
      const listenSequence = [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 1, 0];
      let idx = 0;
      mainTimer = setInterval(() => {
        idx = (idx + 1) % listenSequence.length;
        setCurrentFrameIndex(listenSequence[idx]);
      }, 200);
    } else if (state === 'thinking') {
      // Thoughtful eye-narrowing (frames 1 -> 2 -> 3 -> 2 -> 1)
      const thinkSequence = [1, 2, 3, 2, 1, 2];
      let idx = 0;
      mainTimer = setInterval(() => {
        idx = (idx + 1) % thinkSequence.length;
        setCurrentFrameIndex(thinkSequence[idx]);
      }, 220);
    } else {
      // 🌿 NATURAL IDLE MODE:
      // Default to frame 0 (eyes wide open). Character stays on frame 0 ~92% of the time.
      // Every 3.8 - 5.5 seconds, executes a fast, natural 280ms eye-blink sequence (0 -> 1 -> 2 -> 4 -> 5 -> 4 -> 2 -> 1 -> 0).
      setCurrentFrameIndex(0);

      const triggerNaturalBlink = () => {
        if (isBlinkingRef.current) return;
        isBlinkingRef.current = true;

        // Realistic fast blink sequence (approx 35ms per frame)
        const blinkSteps = [0, 1, 2, 4, 5, 4, 2, 1, 0];
        let stepIndex = 0;

        const blinkInterval = setInterval(() => {
          stepIndex++;
          if (stepIndex < blinkSteps.length) {
            setCurrentFrameIndex(blinkSteps[stepIndex]);
          } else {
            clearInterval(blinkInterval);
            setCurrentFrameIndex(0); // Return to default eyes-open
            isBlinkingRef.current = false;
            
            // Schedule next blink randomly between 3.8s and 5.5s
            const nextBlinkDelay = Math.floor(Math.random() * 1700) + 3800;
            blinkTimeout = setTimeout(triggerNaturalBlink, nextBlinkDelay);
          }
        }, 35);
      };

      // Start initial blink timer
      const initialDelay = Math.floor(Math.random() * 1500) + 2500;
      blinkTimeout = setTimeout(triggerNaturalBlink, initialDelay);
    }

    return () => {
      if (mainTimer) clearInterval(mainTimer);
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
