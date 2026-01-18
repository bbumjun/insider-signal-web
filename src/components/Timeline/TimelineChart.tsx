'use client';

import { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, AreaSeries, HistogramSeries, createSeriesMarkers, SeriesMarker } from 'lightweight-charts';
import { StockPrice, InsiderTransaction, CompanyNews } from '@/types';

interface TimelineChartProps {
  symbol: string;
  prices: StockPrice[];
  insiderTransactions: InsiderTransaction[];
  news: CompanyNews[];
}

export default function TimelineChart({ symbol, prices, insiderTransactions, news }: TimelineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const { buyData, sellData, totalBuy, totalSell } = useMemo(() => {
    const buyMap = new Map<string, number>();
    const sellMap = new Map<string, number>();
    let totalBuy = 0;
    let totalSell = 0;

    insiderTransactions.forEach(t => {
      const value = t.share * (t.transactionPrice || 1);
      if (t.transactionCode === 'P') {
        buyMap.set(t.transactionDate, (buyMap.get(t.transactionDate) || 0) + value);
        totalBuy += value;
      } else if (t.transactionCode === 'S') {
        sellMap.set(t.transactionDate, (sellMap.get(t.transactionDate) || 0) + value);
        totalSell += value;
      }
    });

    const buyData = Array.from(buyMap.entries())
      .map(([time, value]) => ({ time, value, color: '#10b981' }))
      .sort((a, b) => a.time.localeCompare(b.time));

    const sellData = Array.from(sellMap.entries())
      .map(([time, value]) => ({ time, value: -value, color: '#ef4444' }))
      .sort((a, b) => a.time.localeCompare(b.time));

    return { buyData, sellData, totalBuy, totalSell };
  }, [insiderTransactions]);

  useEffect(() => {
    if (!chartContainerRef.current || !prices.length) return;

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
      height: 380,
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
    insiderTransactions.forEach(t => {
      if (t.transactionCode !== 'P' && t.transactionCode !== 'S') return;
      const key = `${t.transactionDate}-${t.transactionCode}`;
      if (seenInsider.has(key)) return;
      seenInsider.add(key);
      const priceAtDate = prices.find(p => p.date === t.transactionDate)?.close;
      if (priceAtDate) {
        const isBuy = t.transactionCode === 'P';
        markers.push({
          time: t.transactionDate,
          position: isBuy ? 'belowBar' : 'aboveBar',
          color: isBuy ? '#10b981' : '#ef4444',
          shape: 'circle',
          text: '',
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

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [prices, insiderTransactions, news, buyData, sellData]);

  if (!prices || prices.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
        No price data available for {symbol}
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
      <div ref={chartContainerRef} className="w-full h-[380px]" />
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-500">Insider Trading</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-400">Buy {formatValue(totalBuy)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-400">Sell {formatValue(totalSell)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
