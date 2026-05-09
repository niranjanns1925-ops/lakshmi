import React from 'react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Dark green background canopy */}
      <path d="M50 10 C30 10 15 25 20 45 C10 50 10 65 25 70 C25 70 35 75 50 75 C65 75 75 70 75 70 C90 65 90 50 80 45 C85 25 70 10 50 10 Z" fill="#2E7D32" />
      
      {/* Light green foreground canopy */}
      <path d="M50 20 C35 20 25 30 30 46 C20 50 20 62 30 66 C30 66 40 70 50 70 C60 70 70 66 70 66 C80 62 80 50 70 46 C75 30 65 20 50 20 Z" fill="#8BC34A" />

      {/* Hanging roots/vines */}
      <path d="M22 65 Q20 80 25 95 M28 68 Q30 75 28 85 M78 65 Q80 80 75 95 M72 68 Q70 75 72 85" fill="none" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" />

      {/* Yellow Sun/Star */}
      <polygon points="50,30 53,40 63,40 55,46 58,56 50,50 42,56 45,46 37,40 47,40" fill="#FFEB3B" />

      {/* Human / Trunk */}
      <path d="M50,95 C40,95 43,75 46,65 L32,50 L36,46 L48,58 L48,50 C48,47 52,47 52,50 L52,58 L64,46 L68,50 L54,65 C57,75 60,95 50,95 Z" fill="#8D6E63" />
      <path d="M40 95 Q50 90 60 95 Z" fill="#795548" />
    </svg>
  );
}
