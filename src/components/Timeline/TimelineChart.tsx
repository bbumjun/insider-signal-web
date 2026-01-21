'use client';

import { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, AreaSeries, HistogramSeries, createSeriesMarkers, SeriesMarker } from 'lightweight-charts';
import { StockPrice, InsiderTransaction, CompanyNews } from '@/types';

interface TimelineChartProps {
  symbol: string;
  prices: StockPrice[];
  insiderTransactions: InsiderTransaction[];
  news: CompanyNews[];
  period?: '1M' | '3M' | '1Y';
}

export default function TimelineChart({ symbol, prices, insiderTransactions, news, period = '3M' }: TimelineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { buyData, sellData, totalBuy, totalSell, transactionsByDate, newsByDate } = useMemo(() => {
    const buyMap = new Map<string, number>();
    const sellMap = new Map<string, number>();
    const transactionsByDate = new Map<string, InsiderTransaction[]>();
    const newsByDate = new Map<string, CompanyNews[]>();
    let totalBuy = 0;
    let totalSell = 0;

    insiderTransactions.forEach(t => {
      const value = t.share * (t.transactionPrice || 1);
      const isBuy = ['P', 'A', 'M'].includes(t.transactionCode);
      const isSell = t.transactionCode === 'S';
      
      if (isBuy || isSell) {
        if (!transactionsByDate.has(t.transactionDate)) {
          transactionsByDate.set(t.transactionDate, []);
        }
        transactionsByDate.get(t.transactionDate)!.push(t);
      }
      
      if (isBuy) {
        buyMap.set(t.transactionDate, (buyMap.get(t.transactionDate) || 0) + value);
        totalBuy += value;
      } else if (isSell) {
        sellMap.set(t.transactionDate, (sellMap.get(t.transactionDate) || 0) + value);
        totalSell += value;
      }
    });

    news.forEach(n => {
      const date = n.datetime ? new Date(n.datetime * 1000).toISOString().split('T')[0] : n.publishedAt?.split('T')[0];
      if (!date) return;
      if (!newsByDate.has(date)) {
        newsByDate.set(date, []);
      }
      newsByDate.get(date)!.push(n);
    });

    const buyData = Array.from(buyMap.entries())
      .map(([time, value]) => ({ time, value, color: '#10b981' }))
      .sort((a, b) => a.time.localeCompare(b.time));

    const sellData = Array.from(sellMap.entries())
      .map(([time, value]) => ({ time, value: -value, color: '#ef4444' }))
      .sort((a, b) => a.time.localeCompare(b.time));

    return { buyData, sellData, totalBuy, totalSell, transactionsByDate, newsByDate };
  }, [insiderTransactions, news]);

  useEffect(() => {
    if (!chartContainerRef.current || !prices.length) return;

    const containerHeight = chartContainerRef.current.clientHeight || 300;
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: containerHeight,
      timeScale: {
        borderColor: '#334155',
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#10b981',
      topColor: 'rgba(16, 185, 129, 0.4)',
      bottomColor: 'rgba(16, 185, 129, 0.05)',
      lineWidth: 3,
      priceLineVisible: false,
      priceScaleId: 'right',
    });

    const buyHistogram = chart.addSeries(HistogramSeries, {
      priceLineVisible: false,
      lastValueVisible: false,
      priceScaleId: 'volume',
      color: '#10b981',
    });

    const sellHistogram = chart.addSeries(HistogramSeries, {
      priceLineVisible: false,
      lastValueVisible: false,
      priceScaleId: 'volume',
      color: '#ef4444',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
      borderVisible: false,
    });

    chart.applyOptions({
      crosshair: {
        vertLine: { color: '#475569', width: 1, style: 1, labelBackgroundColor: '#1e293b' },
        horzLine: { color: '#475569', width: 1, style: 1, labelBackgroundColor: '#1e293b' },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    const formattedData = prices.map(p => ({ time: p.date, value: p.close }));
    areaSeries.setData(formattedData);

    buyHistogram.setData(buyData);
    sellHistogram.setData(sellData);

    const markers: SeriesMarker<string>[] = [];
    const seenInsider = new Set<string>();
    const openMarketBuyDates = new Set<string>();
    
    insiderTransactions.forEach(t => {
      if (t.transactionCode === 'P') {
        openMarketBuyDates.add(t.transactionDate);
      }
    });
    
    insiderTransactions.forEach(t => {
      const isOpenMarketBuy = t.transactionCode === 'P';
      const isBuy = ['P', 'A', 'M'].includes(t.transactionCode);
      const isSell = t.transactionCode === 'S';
      
      if (!isBuy && !isSell) return;
      
      const key = `${t.transactionDate}-${isBuy ? 'BUY' : 'SELL'}`;
      if (seenInsider.has(key)) return;
      seenInsider.add(key);
      const priceAtDate = prices.find(p => p.date === t.transactionDate)?.close;
      if (priceAtDate) {
        const hasOpenMarketBuy = openMarketBuyDates.has(t.transactionDate);
        markers.push({
          time: t.transactionDate,
          position: hasOpenMarketBuy && isBuy ? 'aboveBar' : (isBuy ? 'belowBar' : 'aboveBar'),
          color: isBuy ? (hasOpenMarketBuy ? '#fbbf24' : '#10b981') : '#ef4444',
          shape: hasOpenMarketBuy && isBuy ? 'arrowDown' : 'circle',
          text: hasOpenMarketBuy && isBuy ? '★' : '',
        });
      }
    });

    const seenNews = new Set<string>();
    news.forEach(n => {
      const date = n.datetime ? new Date(n.datetime * 1000).toISOString().split('T')[0] : n.publishedAt?.split('T')[0];
      if (!date || seenNews.has(date)) return;
      seenNews.add(date);
      const priceAtDate = prices.find(p => p.date === date)?.close;
      if (priceAtDate) {
        markers.push({ time: date, position: 'inBar', color: '#3b82f6', shape: 'circle', text: '' });
      }
    });

    const seriesMarkers = createSeriesMarkers(areaSeries);
    seriesMarkers.setMarkers(markers.sort((a, b) => (a.time > b.time ? 1 : -1)));
    chart.timeScale().fitContent();

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    let tooltipLocked = false;

    const hideTooltip = () => {
      if (tooltipRef.current) {
        tooltipRef.current.style.display = 'none';
        tooltipLocked = false;
      }
    };

    const showTooltip = (dateStr: string, point: { x: number; y: number }) => {
      if (!tooltipRef.current || !chartContainerRef.current) return;

      const transactions = transactionsByDate.get(dateStr);
      const newsItems = newsByDate.get(dateStr);
      
      if ((!transactions || transactions.length === 0) && (!newsItems || newsItems.length === 0)) {
        if (!tooltipLocked) hideTooltip();
        return;
      }

      const buyTransactions = transactions?.filter(t => ['P', 'A', 'M'].includes(t.transactionCode)) || [];
      const sellTransactions = transactions?.filter(t => t.transactionCode === 'S') || [];

      const formatValue = (v: number) => {
        if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
        if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
        if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
        return `$${v.toFixed(0)}`;
      };

      const getCodeLabel = (code: string) => {
        switch (code) {
          case 'P': return '공개시장 매수';
          case 'A': return '주식 수여';
          case 'M': return '옵션 행사';
          case 'S': return '공개시장 매도';
          default: return code;
        }
      };

      let html = `<div class="flex items-center justify-between mb-2">`;
      html += `<span class="text-xs font-bold">${dateStr}</span>`;
      if (isTouchDevice) {
        html += `<button class="tooltip-close text-slate-400 hover:text-white text-lg leading-none px-1">×</button>`;
      }
      html += `</div>`;

      const groupByPerson = (txns: InsiderTransaction[]) => {
        const grouped = new Map<string, { name: string; totalShares: number; totalValue: number; codes: Set<string> }>();
        txns.forEach(t => {
          const existing = grouped.get(t.name);
          const value = t.share * (t.transactionPrice || 1);
          if (existing) {
            existing.totalShares += t.share;
            existing.totalValue += value;
            existing.codes.add(t.transactionCode);
          } else {
            grouped.set(t.name, { name: t.name, totalShares: t.share, totalValue: value, codes: new Set([t.transactionCode]) });
          }
        });
        return Array.from(grouped.values());
      };

      const getCodesLabel = (codes: Set<string>) => {
        return Array.from(codes).map(code => getCodeLabel(code)).join(', ');
      };

      const hasOpenMarketBuy = buyTransactions.some(t => t.transactionCode === 'P');
      
      if (buyTransactions.length > 0) {
        const groupedBuys = groupByPerson(buyTransactions);
        html += '<div class="mb-2">';
        if (hasOpenMarketBuy) {
          html += '<div class="text-yellow-400 font-semibold mb-1 flex items-center gap-1">⭐ 강력 매수 시그널</div>';
        } else {
          html += '<div class="text-emerald-400 font-semibold mb-1">매수</div>';
        }
        groupedBuys.forEach(g => {
          const isOpenMarket = g.codes.has('P');
          html += `<div class="${isOpenMarket ? 'text-yellow-200' : 'text-slate-300'} text-[10px] leading-relaxed mb-1">`;
          html += `${g.name}<br/>`;
          html += `<span class="${isOpenMarket ? 'text-yellow-400/70' : 'text-slate-500'}">${getCodesLabel(g.codes)}</span><br/>`;
          html += `${Number(g.totalShares).toLocaleString()}주 · ${formatValue(g.totalValue)}`;
          html += `</div>`;
        });
        html += '</div>';
      }

      if (sellTransactions.length > 0) {
        const groupedSells = groupByPerson(sellTransactions);
        html += '<div class="mb-2">';
        html += '<div class="text-red-400 font-semibold mb-1">매도</div>';
        groupedSells.forEach(g => {
          html += `<div class="text-slate-300 text-[10px] leading-relaxed mb-1">`;
          html += `${g.name}<br/>`;
          html += `<span class="text-slate-500">${getCodesLabel(g.codes)}</span><br/>`;
          html += `${Number(g.totalShares).toLocaleString()}주 · ${formatValue(g.totalValue)}`;
          html += `</div>`;
        });
        html += '</div>';
      }

      if (newsItems && newsItems.length > 0) {
        html += '<div>';
        html += '<div class="text-blue-400 font-semibold mb-1">📰 뉴스</div>';
        const displayNews = newsItems.slice(0, 3);
        displayNews.forEach(n => {
          const title = n.headline || '';
          const truncatedTitle = title.length > 50 ? title.slice(0, 50) + '...' : title;
          html += `<div class="text-slate-300 text-[10px] leading-relaxed mb-1">`;
          html += `${truncatedTitle}`;
          html += `</div>`;
        });
        if (newsItems.length > 3) {
          html += `<div class="text-slate-500 text-[10px]">+${newsItems.length - 3}개 더보기</div>`;
        }
        html += '</div>';
      }

      tooltipRef.current.innerHTML = html;
      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.pointerEvents = isTouchDevice ? 'auto' : 'none';
      if (isTouchDevice) tooltipLocked = true;

      const closeBtn = tooltipRef.current.querySelector('.tooltip-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', hideTooltip);
      }

      const chartRect = chartContainerRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current.offsetWidth || 200;
      const tooltipHeight = tooltipRef.current.offsetHeight;

      let left = point.x + 10;
      let top = point.y - tooltipHeight / 2;

      if (left + tooltipWidth > chartRect.width) {
        left = point.x - tooltipWidth - 10;
      }
      if (left < 0) left = 10;

      if (top < 0) top = 10;
      if (top + tooltipHeight > chartRect.height) {
        top = chartRect.height - tooltipHeight - 10;
      }

      tooltipRef.current.style.left = `${left}px`;
      tooltipRef.current.style.top = `${top}px`;
    };

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        if (!isTouchDevice) hideTooltip();
        return;
      }
      if (isTouchDevice && tooltipLocked) return;
      showTooltip(param.time as string, param.point);
    });

    const handleTouchOutside = (e: TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        hideTooltip();
      }
    };

    if (isTouchDevice) {
      document.addEventListener('touchstart', handleTouchOutside);
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight || 300,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (isTouchDevice) {
        document.removeEventListener('touchstart', handleTouchOutside);
      }
      chart.remove();
    };
  }, [prices, insiderTransactions, news, buyData, sellData, transactionsByDate, newsByDate, period]);

  if (!prices || prices.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
        {symbol}의 주가 데이터가 없습니다
      </div>
    );
  }

  const formatValue = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div ref={chartContainerRef} className="w-full flex-1 min-h-0 relative">
        <div
          ref={tooltipRef}
          className="absolute z-10 pointer-events-none bg-slate-900/95 border border-slate-700 rounded-lg p-3 shadow-xl backdrop-blur-sm"
          style={{ display: 'none', minWidth: '200px', maxWidth: '300px' }}
        />
      </div>
      <div className="flex items-center justify-between px-1 sm:px-2 pt-1">
        <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs flex-wrap">
          <span className="text-slate-500 hidden sm:inline">내부자 거래</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-400">매수 {formatValue(totalBuy)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500" />
            <span className="text-red-400">매도 {formatValue(totalSell)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
