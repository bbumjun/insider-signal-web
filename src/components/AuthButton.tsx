'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 animate-pulse" />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-xs sm:text-sm"
      >
        <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>로그인</span>
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-0.5 sm:p-1 rounded-full hover:bg-slate-800 transition-colors"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={32}
            height={32}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 flex items-center justify-center">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50">
          <div className="px-4 py-2 border-b border-slate-800">
            <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
