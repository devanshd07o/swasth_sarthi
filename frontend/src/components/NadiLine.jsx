import React from 'react';

export default function NadiLine({ className = '', showDot = true, label = '' }) {
  return (
    <div className={`w-full my-3 ${className}`}>
      <svg 
        viewBox="0 0 1200 54" 
        preserveAspectRatio="none" 
        className="w-full h-8 sm:h-9 text-brand"
      >
        <path 
          className="nadi-path" 
          d="M0,27 L140,27 L162,27 L178,6 L196,48 L214,14 L228,27 L420,27 L436,8 L452,46 L468,16 L482,27 L700,27 L716,10 L734,44 L752,18 L766,27 L850,27 L868,4 L886,50 L904,12 L922,27 L1200,27" 
        />
        {showDot ? (
          <circle 
            className="nadi-dot" 
            cx="868" 
            cy="4" 
            r="4.5" 
            fill="#8A2A34" 
          />
        ) : null}
      </svg>
      {label && (
        <div className="flex justify-end -mt-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
