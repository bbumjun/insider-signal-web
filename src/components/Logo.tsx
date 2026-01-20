import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 sm:w-7 sm:h-7"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="100%" stopColor="#06b6d4"/>
          </linearGradient>
          <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        <circle cx="16" cy="16" r="15" fill="#0f172a" stroke="url(#logoGradient)" strokeWidth="1.5"/>
        
        <path 
          d="M6 22 L10 18 L14 20 L18 12 L22 14 L26 8" 
          stroke="url(#logoGradient)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
        />
        
        <path 
          d="M6 22 L10 18 L14 20 L18 12 L22 14 L26 8 L26 24 L6 24 Z" 
          fill="url(#chartFill)"
        />
        
        <circle cx="18" cy="12" r="3" fill="#fbbf24"/>
        <circle cx="18" cy="12" r="5" fill="#fbbf24" opacity="0.3"/>
      </svg>
      <span className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
        Insider Signal
      </span>
    </Link>
  );
}
