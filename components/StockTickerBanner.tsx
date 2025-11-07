import React from 'react';
import { Stock } from '../types';
import { availableStocks } from '../services/mockData';

// 해외 주식은 달러, 국내 주식은 원화로 표시
const isForeignStock = (symbol: string): boolean => {
  // 해외 주식 심볼 (알파벳만 있고 숫자가 없는 경우)
  return /^[A-Z]+$/.test(symbol) && !symbol.match(/^\d+$/);
};

const StockTickerBanner: React.FC = () => {
  // availableStocks를 사용하여 Stocks 페이지와 동일한 데이터 소스 사용
  const displayStocks = availableStocks.slice(0, 10); // 상위 10개 주식 표시

  return (
    <div className="w-full bg-surface-light dark:bg-surface-dark border-b border-border-color-light dark:border-border-color-dark overflow-hidden">
      <div className="flex items-center space-x-8 px-6 py-3 animate-scroll">
        {displayStocks.map((stock) => {
          const isPositive = stock.change >= 0;
          const isForeign = isForeignStock(stock.symbol);
          const currency = isForeign ? '$' : '';
          const priceDisplay = isForeign 
            ? stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : stock.price.toLocaleString();
          const changeDisplay = isForeign
            ? stock.change.toFixed(2)
            : stock.change.toLocaleString();
          
          return (
            <div key={stock.symbol} className="flex items-center space-x-2 whitespace-nowrap">
              <span className="font-bold text-on-surface dark:text-on-surface text-sm">
                {stock.symbol}
              </span>
              <span className="text-on-surface-secondary dark:text-on-surface-secondary text-sm">
                {currency}{priceDisplay}{!isForeign ? '원' : ''}
              </span>
              <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{changeDisplay}{!isForeign ? '원' : ''} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default StockTickerBanner;

