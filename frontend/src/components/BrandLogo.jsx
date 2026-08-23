import React from 'react';

export default function BrandLogo({ size = 36, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
      aria-label="SwasthSaarthi Ayurvedic Nadi Logo"
    >
      {/* Botanical Leaf Silhouette */}
      <path 
        d="M24 4 C39 12 39 36 24 44 C9 36 9 12 24 4 Z" 
        fill="#2F5233" 
      />
      {/* Inner Nadi Pulse Vein */}
      <path 
        d="M11 24 L18 24 L21 15 L26 33 L29 24 L37 24"
        stroke="#D9A868" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
