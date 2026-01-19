'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  symbol: string;
}

export default function ShareButton({ symbol }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${symbol} 내부자 거래 분석 - Insider Signal`;
    const text = `${symbol} 종목의 내부자 거래 패턴을 AI로 분석한 결과를 확인하세요.`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white relative"
      aria-label="공유하기"
    >
      {copied ? (
        <Check className="w-5 h-5 text-emerald-400" />
      ) : (
        <Share2 className="w-5 h-5" />
      )}
      {copied && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-slate-800 text-emerald-400 px-2 py-1 rounded shadow-lg">
          링크 복사됨
        </span>
      )}
    </button>
  );
}
