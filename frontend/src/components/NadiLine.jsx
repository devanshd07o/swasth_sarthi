import React from 'react';

export default function NadiLine({ className = '', showDot = true, label = 'नाड़ी तरंग • CONTINUOUS PULSE' }) {
  return (
    <div className={`w-full my-3 overflow-hidden ${className}`}>
      <div className="relative w-full">
        <svg 
          viewBox="0 0 1200 60" 
          preserveAspectRatio="none" 
          className="w-full h-10 sm:h-12"
        >
          <defs>
            <linearGradient id="nadiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2F5233" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#B97A34" stopOpacity="0.9" />
              <stop offset="85%" stopColor="#2F5233" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2F5233" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background subtle guide hairline */}
          <line x1="0" y1="30" x2="1200" y2="30" stroke="#DED0AC" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

          {/* Living Heartbeat Continuous Wave */}
          <path 
            className="nadi-living-pulse" 
            d="M0,30 L160,30 L180,30 L195,10 L210,50 L225,18 L238,30 L460,30 L475,12 L490,48 L505,20 L518,30 L740,30 L755,8 L770,52 L785,16 L798,30 L980,30 L995,6 L1010,54 L1025,14 L1040,30 L1200,30" 
            fill="none"
            stroke="url(#nadiGradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {showDot && (
            <circle 
              className="nadi-pulsing-orb"
              cx="1010" 
              cy="54" 
              r="4.5" 
              fill="#B97A34" 
              filter="url(#glow)"
            />
          )}
        </svg>
      </div>

      {label && (
        <div className="flex items-center justify-between px-1 -mt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand animate-ping opacity-75 inline-block" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-deep font-semibold">
              नाड़ी स्पन्दन (NADI RHYTHM) • 72 BPM
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink-faint">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
