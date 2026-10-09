import React, { useState } from 'react';

export const HEADER_LOGO_KEY = 'club_header_logo';
export const HEADER_LOGO_URL = '/header_logo.png';

interface ClubLogoProps {
  className?: string;
  style?: React.CSSProperties;
  logoSrc?: string;
}

export const ClubLogo: React.FC<ClubLogoProps> = ({
  className = '',
  style,
  logoSrc,
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Read stored header logo or prop, fallback to /header_logo.png
  const storedHeaderLogo = typeof window !== 'undefined' ? localStorage.getItem(HEADER_LOGO_KEY) : null;
  const activeSrc = logoSrc || storedHeaderLogo || HEADER_LOGO_URL;

  if (hasError) {
    // Fallback limpio: contenedor transparente sin deformar la identidad gráfica
    return (
      <div
        className={className}
        style={{
          height: '48px',
          width: 'auto',
          minWidth: '48px',
          display: 'block',
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={activeSrc}
      alt="Club Puerto Azul"
      onError={() => setHasError(true)}
      style={{
        height: '48px',
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
      className={className}
    />
  );
};
