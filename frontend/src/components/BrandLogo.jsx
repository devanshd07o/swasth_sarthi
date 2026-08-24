import React, { useState } from 'react';

export default function BrandLogo({ size = 38, className = '', showText = true, textClassName = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`inline-flex items-center gap-2.5 cursor-pointer group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={isHovered ? "/loading_animation.gif" : "/swasthsaarthi_static_logo.png"} 
        alt="SwasthSaarthi Interactive Logo" 
        style={{ width: size, height: size }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = './swasthsaarthi_static_logo.png';
        }}
        className="shrink-0 object-contain transition-all duration-300 transform group-hover:scale-110 drop-shadow-xs"
      />
      {showText && (
        <img 
          src="./swasthsaarthi_text_logo.png" 
          alt="SwasthSaarthi Text Logo" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = './swasthsaarthi_text_logo.png';
          }}
          className={`h-8 w-auto object-contain shrink-0 ${textClassName}`} 
        />
      )}
    </div>
  );
}
