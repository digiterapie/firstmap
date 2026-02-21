import React from 'react';

interface Props {
  size?: number;
}

export default function FirstMapLogo({ size = 64 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dotted curved path connecting circles */}
      <path
        d="M22 80 C 40 50, 60 90, 80 55 C 95 30, 108 50, 108 50"
        stroke="#B8A1E3"
        strokeWidth="3"
        strokeDasharray="5 4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left circle (small) */}
      <circle cx="22" cy="82" r="14" fill="#4CBFBF" />
      {/* Middle circle (medium) */}
      <circle cx="70" cy="58" r="18" fill="#7DCFB6" />
      {/* Right circle (largest) */}
      <circle cx="108" cy="46" r="22" fill="#F6A96C" />
      {/* Small star/dot endpoint */}
      <circle cx="108" cy="46" r="5" fill="#FFE08A" opacity="0.9" />
    </svg>
  );
}
