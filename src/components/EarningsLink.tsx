'use client';

import { Calendar } from 'lucide-react';
import Link from 'next/link';

export default function EarningsLink() {
  return (
    <Link
      href="/earnings"
      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
      title="실적 캘린더"
    >
      <Calendar className="w-5 h-5 text-emerald-400" />
    </Link>
  );
}
