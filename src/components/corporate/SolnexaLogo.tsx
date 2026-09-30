import React from 'react';

interface SolnexaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'horizontal' | 'mark-only' | 'stacked';
  theme?: 'dark' | 'light' | 'white';
  showSlogan?: boolean;
}

export const SolnexaLogo: React.FC<SolnexaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  theme = 'light',
  showSlogan = true
}) => {
  // Sizing definitions
  const dimensions = {
    sm: { iconSize: 28, titleSize: 'text-base', sloganSize: 'text-[9px]', badgeSize: 'text-[9px]' },
    md: { iconSize: 36, titleSize: 'text-xl', sloganSize: 'text-[10px]', badgeSize: 'text-[10px]' },
    lg: { iconSize: 46, titleSize: 'text-2xl', sloganSize: 'text-xs', badgeSize: 'text-xs' },
    xl: { iconSize: 60, titleSize: 'text-3xl', sloganSize: 'text-sm', badgeSize: 'text-sm' }
  }[size];

  // Theme text colors
  const titleColor = theme === 'dark' || theme === 'white' ? 'text-white' : 'text-[#002b49]';
  const subtitleColor = theme === 'dark' || theme === 'white' ? 'text-slate-300' : 'text-slate-500';
  const sloganColor = theme === 'dark' || theme === 'white' ? 'text-amber-300' : 'text-[#f97316]';

  // Crisp Vector Emblem: Stylized Dynamic 'S' Solar & Battery Energy Loop
  const Emblem = (
    <svg 
      width={dimensions.iconSize} 
      height={dimensions.iconSize} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs"
    >
      <defs>
        {/* Sun Yellow to Energy Orange Gradient */}
        <linearGradient id="solarSunGrad" x1="15" y1="15" x2="85" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Energy Orange to Deep Navy / Solar Blue Gradient */}
        <linearGradient id="energyFlowGrad" x1="85" y1="45" x2="15" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="35%" stopColor="#0EA5E9" />
          <stop offset="70%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#002B49" />
        </linearGradient>

        {/* Ambient Core Glow */}
        <radialGradient id="sunCore" cx="50" cy="50" r="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle background solar disc aura */}
      <circle cx="50" cy="50" r="44" fill="url(#sunCore)" opacity="0.35" />

      {/* Outer Upper Loop of 'S' - Solar Energy Arc */}
      <path
        d="M 68 20 C 82 22, 88 36, 82 48 C 76 58, 60 62, 50 67 C 36 74, 26 80, 32 90 C 37 98, 52 98, 62 93"
        stroke="url(#energyFlowGrad)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dynamic Counter Energy Wave of 'S' - Storage & Power Flow */}
      <path
        d="M 32 80 C 18 78, 12 64, 18 52 C 24 42, 40 38, 50 33 C 64 26, 74 20, 68 10 C 63 2, 48 2, 38 7"
        stroke="url(#solarSunGrad)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Solar Energy Node / Spark of Action (SOL + NEXT + A) */}
      <circle cx="50" cy="50" r="6" fill="#FBBF24" />
      <circle cx="50" cy="50" r="3.5" fill="#FFFFFF" />

      {/* Ray sparks */}
      <circle cx="68" cy="18" r="2.5" fill="#FDE047" />
      <circle cx="32" cy="82" r="2.5" fill="#38BDF8" />
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {Emblem}
      
      <div className="flex flex-col justify-center">
        {/* Brand Name with Orange X */}
        <div className="flex items-center leading-none">
          <span className={`font-mono font-black tracking-tight ${dimensions.titleSize} ${titleColor}`}>
            <span>SOLNE</span>
            <span className="text-[#f97316]">X</span>
            <span>A</span>
          </span>
        </div>

        {/* JAPAN Designation underneath SOLNEXA */}
        <div className="flex items-center gap-2 mt-1 leading-none">
          <span className={`font-extrabold tracking-[0.22em] uppercase font-mono text-[9px] sm:text-[10px] ${
            theme === 'dark' || theme === 'white' ? 'text-amber-300' : 'text-slate-500'
          }`}>
            JAPAN
          </span>
          {showSlogan && (
            <>
              <span className="text-slate-300 text-[9px]">|</span>
              <span className={`font-bold tracking-wider uppercase font-mono ${dimensions.sloganSize} ${sloganColor}`}>
                SMARTER ENERGY. BRIGHTER TOMORROW.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolnexaLogo;
