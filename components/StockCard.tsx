
import React from 'react';
import { OwnedStock } from '../types';

interface StockCardProps {
  stock: OwnedStock;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const isPositive = stock.change >= 0;
  const totalValue = stock.price * stock.quantity;

  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="text-xl font-bold text-on-surface dark:text-on-surface">{stock.name}</h3>
            <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-on-surface-secondary dark:text-on-surface-secondary">{stock.symbol}</span>
        </div>
        <div className={`text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <p className="font-semibold">{stock.change.toLocaleString()}원</p>
          <p className="text-sm">({stock.changePercent.toFixed(2)}%)</p>
        </div>
      </div>
      
      <div className="space-y-3 mt-4">
        <div className="flex justify-between items-baseline">
            <span className="text-on-surface-secondary dark:text-on-surface-secondary">현재가</span>
            <p className="font-bold text-on-surface dark:text-on-surface">{stock.price.toLocaleString()}원</p>
        </div>
        <div className="flex justify-between items-baseline">
            <span className="text-on-surface-secondary dark:text-on-surface-secondary">보유수량</span>
            <p className="font-bold text-on-surface dark:text-on-surface">{stock.quantity}주</p>
        </div>
        <div className="flex justify-between items-baseline border-t border-border-color-light dark:border-border-color-dark pt-3 mt-2">
            <span className="text-lg font-semibold text-on-surface-secondary dark:text-on-surface-secondary">평가금액</span>
            <p className="text-2xl font-bold text-on-surface dark:text-on-surface">{totalValue.toLocaleString()}원</p>
        </div>
      </div>
    </div>
  );
};

export default StockCard;