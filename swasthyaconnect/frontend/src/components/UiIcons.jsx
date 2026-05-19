import React from 'react';

export const MedicalLogo = ({ className = '', style, ...rest }) => (
  <svg viewBox="0 0 240 240" className={className} style={style} aria-hidden="true" {...rest}>
    <rect x="24" y="24" width="192" height="192" rx="28" fill="#fff" />
    <g transform="translate(120 120) scale(0.86)">
      <path d="M0-82c12 0 19 7 22 15 1 3 4 5 7 5 16 0 30 7 38 20 3 5 4 10 2 15l-6 15c-2 5-6 8-11 8h-8c-3 0-6-2-8-5l-7-11c-3-5-10-8-16-8h-4c-6 0-13 3-16 8l-7 11c-2 3-5 5-8 5h-8c-5 0-9-3-11-8l-6-15c-2-5-1-10 2-15 8-13 22-20 38-20 3 0 6-2 7-5 3-8 10-15 22-15z" fill="#111827" />
      <path d="M0-80c-22 0-42 8-57 22-4 4-10 4-14 0-4-4-4-10 0-14 19-18 45-28 71-28 26 0 52 10 71 28 4 4 4 10 0 14-4 4-10 4-14 0C42-72 22-80 0-80z" fill="#111827" />
      <path d="M0 32c8 0 15-3 20-8l8-8c4-4 10-4 14 0s4 10 0 14l-8 8c-10 10-22 15-34 15s-24-5-34-15l-8-8c-4-4-4-10 0-14s10-4 14 0l8 8c5 5 12 8 20 8z" fill="#111827" />
      <path d="M0-76v164" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
      <path d="M0-42c-10 0-18 8-18 18 0 8 4 15 11 18l18 10c8 4 12 12 12 21 0 14-11 25-25 25s-25-11-25-25" fill="none" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
      <path d="M0-42c10 0 18 8 18 18 0 8-4 15-11 18l-18 10c-8 4-12 12-12 21 0 14 11 25 25 25s25-11 25-25" fill="none" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
    </g>
  </svg>
);

export const AiimsLogo = ({ className = '', style, ...rest }) => (
  <svg viewBox="0 0 240 240" className={className} style={style} aria-hidden="true" {...rest}>
    <circle cx="120" cy="120" r="104" fill="#ffffff" />
    <circle cx="120" cy="120" r="92" fill="#3947a8" />
    <circle cx="120" cy="120" r="78" fill="#f7f8ff" />
    <path d="M61 74c12 22 26 36 44 45" fill="none" stroke="#1faa59" strokeWidth="9" strokeLinecap="round" />
    <path d="M179 74c-12 22-26 36-44 45" fill="none" stroke="#1faa59" strokeWidth="9" strokeLinecap="round" />
    <path d="M53 86c20 28 35 45 54 54" fill="none" stroke="#1faa59" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
    <path d="M187 86c-20 28-35 45-54 54" fill="none" stroke="#1faa59" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
    <circle cx="120" cy="61" r="13" fill="#3947a8" />
    <path d="M120 72v83" stroke="#3947a8" strokeWidth="10" strokeLinecap="round" />
    <path d="M120 86c-8 0-14 6-14 14 0 6 3 11 8 14l14 8c6 3 9 9 9 15 0 10-8 18-18 18s-18-8-18-18" fill="none" stroke="#3947a8" strokeWidth="8" strokeLinecap="round" />
    <path d="M120 86c8 0 14 6 14 14 0 6-3 11-8 14l-14 8c-6 3-9 9-9 15 0 10 8 18 18 18s18-8 18-18" fill="none" stroke="#3947a8" strokeWidth="8" strokeLinecap="round" />
    <path d="M120 176c-16 0-31-4-44-12" fill="none" stroke="#3947a8" strokeWidth="8" strokeLinecap="round" />
    <path d="M120 176c16 0 31-4 44-12" fill="none" stroke="#3947a8" strokeWidth="8" strokeLinecap="round" />
    <path d="M70 112h14M70 123h12M70 134h10" stroke="#3947a8" strokeWidth="6" strokeLinecap="round" />
    <path d="M170 112h-14M170 123h-12M170 134h-10" stroke="#3947a8" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export const MenuIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
);

export const ShareIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="2" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="18" cy="19" r="2" />
    <path d="M8 11l8-4" />
    <path d="M8 13l8 4" />
  </svg>
);

export const SwitchPatientIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 7h10" />
    <path d="M14 3l4 4-4 4" />
    <path d="M16 17H6" />
    <path d="M10 13l-4 4 4 4" />
  </svg>
);

export const HospitalIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-6h6v6" />
    <path d="M12 9v4" />
    <path d="M10 11h4" />
  </svg>
);

export const LogoutIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M21 4v16" />
  </svg>
);

export const TileIcon = ({ type, className = '' }) => {
  const iconProps = {
    viewBox: '0 0 24 24',
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (type) {
    case 'appointment':
      return (
        <svg {...iconProps}>
          <rect x="5" y="6" width="14" height="13" rx="3" fill="#ffb74d" stroke="none" />
          <rect x="8" y="4" width="8" height="4" rx="2" fill="#9e9e9e" stroke="none" />
          <path d="M9 12h6" stroke="#1f2937" strokeWidth="2" />
          <path d="M12 9v6" stroke="#1f2937" strokeWidth="2" />
        </svg>
      );
    case 'history':
      return (
        <svg {...iconProps}>
          <rect x="5" y="5" width="14" height="14" rx="3" fill="#e8f1ff" stroke="none" />
          <circle cx="12" cy="12" r="5.5" fill="#ffffff" stroke="#1f2937" strokeWidth="1.5" />
          <path d="M12 9v4l2 1.5" stroke="#1f2937" strokeWidth="1.8" />
        </svg>
      );
    case 'lab':
      return (
        <svg {...iconProps}>
          <path d="M10 3h4" stroke="#1f2937" strokeWidth="2" />
          <path d="M11 3v6l-4 8a3 3 0 0 0 3 4h4a3 3 0 0 0 3-4l-4-8V3" fill="#c9e5ff" stroke="#1f2937" />
          <path d="M8 14h8" stroke="#1f2937" strokeWidth="2" />
          <circle cx="18" cy="7" r="2.5" fill="#ffb74d" stroke="none" />
        </svg>
      );
    case 'prescription':
      return (
        <svg {...iconProps}>
          <rect x="6" y="4" width="10" height="16" rx="2" fill="#fff4cc" stroke="#1f2937" />
          <path d="M11 4v16" stroke="#1f2937" strokeWidth="1.5" />
          <path d="M8 10h6" stroke="#1f2937" strokeWidth="1.8" />
          <path d="M8 13h3" stroke="#1f2937" strokeWidth="1.8" />
          <circle cx="17.5" cy="14.5" r="4.3" fill="#59c2f4" stroke="none" />
          <path d="M15.5 14.5h4" stroke="#1f2937" strokeWidth="1.8" />
        </svg>
      );
    case 'billing':
      return (
        <svg {...iconProps}>
          <rect x="6" y="4" width="10" height="16" rx="2" fill="#e6f4ff" stroke="#1f2937" />
          <path d="M8.5 8h5" stroke="#1f2937" strokeWidth="1.8" />
          <path d="M8.5 12h5" stroke="#1f2937" strokeWidth="1.8" />
          <circle cx="18" cy="16" r="3.5" fill="#7ed957" stroke="none" />
          <path d="M18 14.2v3.6M16.4 16h3.2" stroke="#1f2937" strokeWidth="1.6" />
        </svg>
      );
    case 'info':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="8" fill="#fff" stroke="#1f2937" strokeWidth="2" />
          <path d="M12 10v6" stroke="#1f2937" strokeWidth="2" />
          <path d="M12 7h.01" stroke="#1f2937" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      );
  }
};
