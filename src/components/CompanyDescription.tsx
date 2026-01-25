'use client';

import { useState, useEffect } from 'react';
import { Building2, Globe, Users, ExternalLink, DollarSign, Clock } from 'lucide-react';

interface CompanyProfile {
  symbol: string;
  name: string;
  sector: string | null;
  industry: string | null;
  description: string;
  website: string | null;
  employees: number | null;
  country: string | null;
  marketCap: number | null;
  cachedAt: string | null;
}

interface CompanyDescriptionProps {
  symbol: string;
}

function Skeleton() {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 bg-slate-700 rounded" />
        <div className="h-5 w-24 bg-slate-700 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-700 rounded w-5/6" />
        <div className="h-4 bg-slate-700 rounded w-4/6" />
      </div>
      <div className="flex gap-4 mt-4">
        <div className="h-4 w-20 bg-slate-700 rounded" />
        <div className="h-4 w-24 bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export default function CompanyDescription({ symbol }: CompanyDescriptionProps) {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/stock/${symbol}/profile`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProfile(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [symbol]);

  if (loading) return <Skeleton />;
  if (error || !profile) return null;

  const formatEmployees = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}만명`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}천명`;
    return `${num}명`;
  };

  const formatMarketCap = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatCachedAt = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  };

  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-5 h-5 text-slate-400" />
        <h3 className="text-base sm:text-lg font-bold">기업 소개</h3>
      </div>

      <div className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4 space-y-1">
        {profile.description.split('\n').map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-400">
        {profile.sector && (
          <span className="flex items-center gap-1">
            <span className="text-slate-500">섹터:</span>
            <span className="text-slate-300">{profile.sector}</span>
          </span>
        )}
        {profile.industry && (
          <span className="flex items-center gap-1">
            <span className="text-slate-500">산업:</span>
            <span className="text-slate-300">{profile.industry}</span>
          </span>
        )}
        {profile.employees && (
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span className="text-slate-300">{formatEmployees(profile.employees)}</span>
          </span>
        )}
        {profile.marketCap && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-slate-300">{formatMarketCap(profile.marketCap)}</span>
          </span>
        )}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>웹사이트</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      {profile.cachedAt && (
        <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center gap-1 text-[10px] text-slate-600">
          <Clock className="w-3 h-3" />
          <span>{formatCachedAt(profile.cachedAt)} 업데이트</span>
        </div>
      )}
    </section>
  );
}
