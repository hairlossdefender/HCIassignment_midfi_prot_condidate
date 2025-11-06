
import React, { useState, useMemo } from 'react';
import { TransactionsList } from '../components/DashboardWidgets';
import { mockTransactions } from '../services/mockData';

type TransactionCategory = 'all' | 'fixed' | 'variable' | 'income';

const TransactionsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<TransactionCategory>('all');

  const filteredTransactions = useMemo(() => {
    switch (activeCategory) {
      case 'income':
        return mockTransactions.filter(tx => tx.type === 'income');
      case 'fixed':
        return mockTransactions.filter(tx => tx.type === 'expense' && tx.expenseCategory === 'fixed');
      case 'variable':
        return mockTransactions.filter(tx => tx.type === 'expense' && tx.expenseCategory === 'variable');
      case 'all':
      default:
        return [...mockTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [activeCategory]);

  const TabButton = ({ category, label }: { category: TransactionCategory, label: string }) => (
    <button
      onClick={() => setActiveCategory(category)}
      className={`flex-1 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none ${
        activeCategory === category
          ? 'bg-brand-primary text-white shadow'
          : 'bg-transparent text-on-surface-secondary hover:text-on-surface dark:hover:text-on-surface'
      }`}
    >
      {label}
    </button>
  );

  const titleMap: Record<TransactionCategory, string> = {
    all: '전체 거래 내역',
    income: '수입 내역',
    fixed: '고정 지출 내역',
    variable: '변동 지출 내역',
  };
  
  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-3xl font-bold text-on-surface dark:text-on-surface mb-2">거래 내역</h2>
        <p className="text-lg text-on-surface-secondary dark:text-on-surface-secondary">
          수입, 고정 지출, 변동 지출을 나누어 확인해보세요.
        </p>
      </div>
      
      <div className="p-1.5 bg-gray-100 dark:bg-surface-dark rounded-full flex items-center space-x-2 max-w-sm sticky top-4 z-10">
        <TabButton category="all" label="전체" />
        <TabButton category="income" label="수입" />
        <TabButton category="fixed" label="고정 지출" />
        <TabButton category="variable" label="변동 지출" />
      </div>

      <div className="max-w-4xl mx-auto">
        <TransactionsList data={filteredTransactions} title={titleMap[activeCategory]}/>
      </div>
    </div>
  );
};

export default TransactionsPage;