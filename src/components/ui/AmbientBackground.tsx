import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="curveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#EFF6FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="curveGrad2" x1="10%" y1="90%" x2="90%" y2="10%">
            <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#E0E7FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="curveGrad3" x1="0%" y1="70%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#E0F2FE" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Diagonal sweeping wave curves matching reference */}
        <path
          d="M-200 900 C 300 750, 700 550, 1150 80 C 1300 -60, 1500 -50, 1650 -100 L 1650 900 Z"
          fill="url(#curveGrad1)"
          opacity="0.75"
        />
        <path
          d="M-100 950 C 450 780, 850 480, 1280 40 C 1420 -100, 1550 50, 1700 -50 L 1700 950 Z"
          fill="url(#curveGrad2)"
          opacity="0.6"
        />
        <path
          d="M 100 900 Q 650 600, 1200 120 T 1700 -80"
          stroke="#93C5FD"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          fill="none"
        />
        <path
          d="M 180 920 Q 720 580, 1260 140 T 1760 -60"
          stroke="#60A5FA"
          strokeWidth="1"
          strokeOpacity="0.2"
          fill="none"
        />
      </svg>
    </div>
  );
};
