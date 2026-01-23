'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { InsiderTransaction, StockPrice } from '@/types';

interface OpenMarketBuyReturnProps {
  insiderTransactions: InsiderTransaction[];
  prices: StockPrice[];
}

export default function OpenMarketBuyReturn({ insiderTransactions, prices }: OpenMarketBuyReturnProps) {
  const returnData = useMemo(() => {
    const openMarketBuys = insiderTransactions
      .filter(t => t.transactionCode === 'P' && t.transactionPrice > 0)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    
    if (openMarketBuys.length === 0 || prices.length === 0) return null;
    
    const latestBuy = openMarketBuys[0];
    const buyPrice = latestBuy.transactionPrice;
    const buyDate = latestBuy.transactionDate;
    const buyerName = latestBuy.name;
    
    const currentPrice = prices[prices.length - 1]?.close;
    if (!currentPrice || !buyPrice) return null;
    
    const returnPct = ((currentPrice - buyPrice) / buyPrice) * 100;
    
    const buyDateObj = new Date(buyDate);
    const now = new Date();
    const daysSinceBuy = Math.floor((now.getTime() - buyDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      buyPrice,
      currentPrice,
      returnPct,
      buyDate,
      buyerName,
      daysSinceBuy,
      totalBuys: openMarketBuys.length,
    };
  }, [insiderTransactions, prices]);
  
  if (!returnData) return null;
  
  const isPositive = returnData.returnPct >= 0;
  
  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-300">공개 시장 매수</h3>
            <p className="text-[10px] text-slate-500">가장 강력한 매수 시그널</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
          isPositive 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="text-[10px] font-normal opacity-70">매수 후</span>
          {isPositive ? '+' : ''}{returnData.returnPct.toFixed(1)}%
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500 text-xs mb-0.5">매수가</p>
          <p className="font-semibold">${returnData.buyPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-0.5">현재가</p>
          <p className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            ${returnData.currentPrice.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-800/50">
        <div className="flex items-center justify-between text-xs">
          <div className="text-slate-500">
            <span className="text-slate-400">{returnData.buyerName.split(' ')[0]}</span>
            {' · '}
            {returnData.daysSinceBuy}일 전
          </div>
          {returnData.totalBuys > 1 && (
            <div className="text-amber-400/70">
              +{returnData.totalBuys - 1}건 추가 매수
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
