import React from 'react';

export default function BrandLogo({ size = 36, className = '' }) {
  return (
    <img 
      src="/favicon.ico" 
      alt="SwasthSaarthi Logo Icon" 
      style={{ width: size, height: size }}
      className={`shrink-0 object-contain transition-transform duration-300 ${className}`}
    />
  );
}
