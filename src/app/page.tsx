import SearchBar from '@/components/SearchBar';
import { TrendingUp, Activity, Award } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold mb-6 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Market Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Decode the Market with<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Insider Signals
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Uncover correlations between insider trading, news events, and price action. 
            Powered by Gemini AI for real-time patterns.
          </p>
        </div>

        <SearchBar />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
            title="Price Correlation"
            description="See exactly where insiders bought or sold on the stock chart."
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6 text-cyan-400" />}
            title="News Integration"
            description="Link major headlines directly to price volatility and insider moves."
          />
          <FeatureCard 
            icon={<Award className="w-6 h-6 text-purple-400" />}
            title="AI Insights"
            description="Get instant analysis on track records and upcoming trends."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:border-emerald-500/30 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
