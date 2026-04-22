import React from 'react';

type SVGProps = React.SVGProps<SVGSVGElement>;

export const BridgeLogo = ({ showBars = true }: { showBars?: boolean }) => (
  <svg width="32" height="20" viewBox="0 0 60 37" fill="none">
    <path d="M2 31h56" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M10 31V19" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M50 31V19" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M10 19C10 19 18 7 30 7C42 7 50 19 50 19" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    {showBars && (
      <>
        <line x1="20" y1="31" x2="20" y2="21" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="31" x2="30" y2="15" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="31" x2="40" y2="21" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
      </>
    )}
  </svg>
);

export const ClockIcon = ({ width = 16, height = 16, ...props }: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const XCircleIcon = ({ width = 16, height = 16, ...props }: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const CheckmarkIcon = (props: SVGProps) => (
  <svg viewBox="0 0 40 30" fill="none" {...props}>
    <path d="M3 15l12 12L37 3" stroke="#1e7d3f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckIcon = (props: SVGProps) => (
  <svg viewBox="0 0 14 12" fill="none" {...props}>
    <path d="M1 6l4 4 8-8" stroke="#5b5bd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AlertTriangleIcon = (props: SVGProps) => (
  <svg viewBox="0 0 40 40" fill="none" {...props}>
    <path d="M20 4L4 34h32L20 4z" fill="#fee" stroke="#c0392b" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M20 15v10" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="20" cy="29" r="1.8" fill="#c0392b" />
  </svg>
);

export const HourglassIcon = (props: SVGProps) => (
  <svg viewBox="0 0 44 44" fill="none" {...props}>
    <path d="M8 4h28l-9 16H17L8 4z" fill="#f0f0ff" stroke="#5b5bd6" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M8 40h28l-9-16H17L8 40z" fill="#f0f0ff" stroke="#5b5bd6" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M17 24s1.5 3 5 3 5-3 5-3" stroke="#5b5bd6" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    <line x1="7" y1="4" x2="37" y2="4" stroke="#5b5bd6" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="7" y1="40" x2="37" y2="40" stroke="#5b5bd6" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const ClockSpinnerIcon = (props: SVGProps) => (
  <svg viewBox="0 0 36 36" fill="none" {...props}>
    <circle cx="18" cy="18" r="14" stroke="#5b5bd6" strokeWidth="2" strokeDasharray="6 4" style={{ animation: 'spinHG 3s linear infinite', transformOrigin: '18px 18px' }} />
    <path d="M18 10v8l5 5" stroke="#5b5bd6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ShieldCheckIcon = ({ width = 18, height = 18, ...props }: SVGProps) => (
  <svg width={width} height={height} viewBox="0 0 18 18" fill="none" {...props}>
    <path d="M9 2L3 5v5c0 3.3 2.7 6.4 6 7 3.3-.6 6-3.7 6-7V5L9 2z" stroke="#5b5bd6" strokeWidth="1.6" fill="#f0f0ff" strokeLinejoin="round" />
    <path d="M6 9l2 2 4-4" stroke="#5b5bd6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ShieldIcon = ({ width = 12, height = 14, ...props }: SVGProps) => (
  <svg width={width} height={height} viewBox="0 0 12 14" fill="none" {...props}>
    <path d="M6 1L1 3.5v4c0 2.76 2.24 5 5 5s5-2.24 5-5v-4L6 1z" fill="#9197ab" opacity="0.5" />
  </svg>
);

export const BuildingIcon = ({ width = 36, height = 32, ...props }: SVGProps) => (
  <svg width={width} height={height} viewBox="0 0 48 44" fill="none" {...props}>
    <rect x="2" y="18" width="44" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
    <rect x="2" y="36" width="44" height="6" rx="3" fill="white" />
    <rect x="6" y="24" width="6" height="12" rx="2" fill="white" />
    <rect x="17" y="24" width="6" height="12" rx="2" fill="white" />
    <rect x="28" y="24" width="6" height="12" rx="2" fill="white" />
    <rect x="39" y="24" width="6" height="12" rx="2" fill="white" />
    <path d="M2 18L24 4l22 14H2z" fill="white" />
    <circle cx="24" cy="12" r="3" fill="rgba(255,255,255,0.5)" />
  </svg>
);