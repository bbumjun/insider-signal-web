import SearchBar from '@/components/SearchBar';
import { TrendingUp, Activity, Award } from 'lucide-react';

function ChartBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.2),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.15),transparent_60%)]" />
      
      <svg 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[1600px] h-[700px] opacity-70"
        viewBox="0 0 1400 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <g className="opacity-40">
          {[200, 400, 600, 800, 1000, 1200].map((x) => (
            <line key={x} x1={x} y1="20" x2={x} y2="380" stroke="#334155" strokeWidth="1" />
          ))}
          {[80, 140, 200, 260, 320].map((y) => (
            <line key={y} x1="50" y1={y} x2="1350" y2={y} stroke="#334155" strokeWidth="1" />
          ))}
        </g>
        
        <path
          d="M0,320 C100,300 150,280 250,250 S400,200 500,190 S650,160 750,120 S900,100 1000,130 S1150,90 1250,70 S1350,80 1400,90"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="4"
          filter="url(#glowStrong)"
        />
        
        <path
          d="M0,320 C100,300 150,280 250,250 S400,200 500,190 S650,160 750,120 S900,100 1000,130 S1150,90 1250,70 S1350,80 1400,90 L1400,400 L0,400 Z"
          fill="url(#chartGradient)"
        />
        
        <g>
          <circle cx="250" cy="250" r="8" fill="#10b981" filter="url(#glowStrong)">
            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="500" cy="190" r="8" fill="#10b981" filter="url(#glowStrong)">
            <animate attributeName="r" values="6;10;6" dur="2.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="750" cy="120" r="10" fill="#fbbf24" filter="url(#glowStrong)">
            <animate attributeName="r" values="8;14;8" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="1000" cy="130" r="8" fill="#ef4444" filter="url(#glowStrong)">
            <animate attributeName="r" values="6;10;6" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="1250" cy="70" r="8" fill="#10b981" filter="url(#glowStrong)">
            <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>
        

      </svg>
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30 relative overflow-hidden">
      <ChartBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-32 pb-12 sm:pb-20 relative z-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold mb-6 uppercase tracking-wider backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            마켓 인텔리전스
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
            내부자 시그널로<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              시장을 읽다
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            내부자 거래, 뉴스, 주가 흐름의 상관관계를 분석합니다.
            Gemini AI가 실시간으로 패턴을 찾아드립니다.
          </p>
        </div>

        <SearchBar />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-32">
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
            title="주가 상관관계"
            description="내부자가 언제 매수/매도했는지 차트에서 한눈에 확인하세요."
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6 text-cyan-400" />}
            title="뉴스 통합"
            description="주요 헤드라인과 주가 변동, 내부자 거래의 연결고리를 파악하세요."
          />
          <FeatureCard 
            icon={<Award className="w-6 h-6 text-purple-400" />}
            title="AI 인사이트"
            description="트랙 레코드와 향후 트렌드에 대한 즉각적인 분석을 받아보세요."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
