import React from 'react';

export default function SwasthSaarthiVideoLoader({ 
  size = 'md', 
  text = null, 
  inline = false,
  className = ''
}) {
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    full: 'w-36 h-36'
  }[size] || 'w-14 h-14';

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center gap-2.5 ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses}`}>
        <img
          src="./loading_animation.gif"
          alt="SwasthSaarthi Transparent Loading..."
          className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
        />
      </div>

      {text && (
        <span className="text-xs md:text-sm font-black tracking-wide text-emerald-950 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif] animate-pulse">
          {text}
        </span>
      )}
    </div>
  );

  if (inline) {
    return loaderContent;
  }

  return (
    <div className="w-full py-4 flex items-center justify-center animate-fade-in">
      {loaderContent}
    </div>
  );
}
