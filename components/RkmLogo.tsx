import React from 'react';
import Image from 'next/image';

interface RkmLogoProps {
  size?: number;
  className?: string;
}

export default function RkmLogo({ size = 44, className = '' }: RkmLogoProps) {
  return (
    <div
      className={`rkm-emblem-wrapper ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        position: 'relative',
      }}
      title="Ramakrishna Math & Ramakrishna Mission"
    >
      <Image
        src="/rkm-logo.png"
        alt="Ramakrishna Math & Ramakrishna Mission Emblem"
        width={size}
        height={size}
        className="rkm-emblem-img object-contain"
        priority
      />
    </div>
  );
}
