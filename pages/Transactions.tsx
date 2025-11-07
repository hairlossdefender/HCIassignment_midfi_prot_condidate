import React, { useState, useMemo, useEffect } from 'react';
import { Transaction } from '../types';
import { mockTransactions } from '../services/mockData';
import { TransactionsList } from '../components/DashboardWidgets';

type TransactionCategory = 'all' | 'fixed' | 'variable' | 'income';

interface TransactionsPageProps {
  userId?: string;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ userId }) => {
  const [activeCategory, setActiveCategory] = useState<TransactionCategory>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<{
    description: string;
    amount: number;
    type: 'income' | 'expense';
    expenseCategory?: 'fixed' | 'variable';
    date: string;
  }>({
    description: '',
    amount: 0,
    type: 'expense',
    expenseCategory: 'variable',
    date: new Date().toISOString().split('T')[0],
  });

  // 사용자별 거래 내역 로드
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`transactions_${userId}`);
      if (stored) {
        setTransactions(JSON.parse(stored));
      } else {
        // 초기 데이터가 없으면 mock 데이터 사용
        setTransactions(mockTransactions);
        localStorage.setItem(`transactions_${userId}`, JSON.stringify(mockTransactions));
      }
    } else {
      setTransactions(mockTransactions);
    }
  }, [userId]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    switch (activeCategory) {
      case 'income':
        filtered = filtered.filter(tx => tx.type === 'income');
        break;
      case 'fixed':
        filtered = filtered.filter(tx => tx.type === 'expense' && tx.expenseCategory === 'fixed');
        break;
      case 'variable':
        filtered = filtered.filter(tx => tx.type === 'expense' && tx.expenseCategory === 'variable');
        break;
      case 'all':
      default:
        break;
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeCategory, transactions]);

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    if (userId) {
      localStorage.setItem(`transactions_${userId}`, JSON.stringify(newTransactions));
    }
  };

  const handleAdd = () => {
    if (!formData.description || !formData.amount || !formData.date) return;
    
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      date: formData.date,
      description: formData.description,
      amount: formData.type === 'income' ? formData.amount : -Math.abs(formData.amount),
      type: formData.type,
      expenseCategory: formData.type === 'expense' ? formData.expenseCategory : undefined,
    };
    
    saveTransactions([newTransaction, ...transactions]);
    setFormData({
      description: '',
      amount: 0,
      type: 'expense',
      expenseCategory: 'variable',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setFormData({
      description: tx.description,
      amount: Math.abs(tx.amount),
      type: tx.type,
      expenseCategory: tx.expenseCategory,
      date: tx.date,
    });
    setShowAddForm(true);
  };

  const handleUpdate = () => {
    if (!editingId || !formData.description || !formData.amount || !formData.date) return;
    
    const updatedTransactions = transactions.map(tx => 
      tx.id === editingId
        ? {
            ...tx,
            date: formData.date,
            description: formData.description,
            amount: formData.type === 'income' ? formData.amount : -Math.abs(formData.amount),
            type: formData.type,
            expenseCategory: formData.type === 'expense' ? formData.expenseCategory : undefined,
          }
        : tx
    );
    
    saveTransactions(updatedTransactions);
    setEditingId(null);
    setFormData({
      description: '',
      amount: 0,
      type: 'expense',
      expenseCategory: 'variable',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      saveTransactions(transactions.filter(tx => tx.id !== id));
    }
  };

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
      
      <div className="flex items-center justify-between">
        <div className="p-1.5 bg-gray-100 dark:bg-surface-dark rounded-full flex items-center space-x-2 max-w-sm">
          <TabButton category="all" label="전체" />
          <TabButton category="income" label="수입" />
          <TabButton category="fixed" label="고정 지출" />
          <TabButton category="variable" label="변동 지출" />
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({
              description: '',
              amount: 0,
              type: 'expense',
              expenseCategory: 'variable',
              date: new Date().toISOString().split('T')[0],
            });
          }}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-lg transition-colors"
        >
          {showAddForm ? '취소' : '+ 거래 추가'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-color-light dark:border-border-color-dark">
          <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-4">
            {editingId ? '거래 수정' : '거래 추가'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                거래 유형
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    formData.type === 'income'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-on-surface dark:text-on-surface'
                  }`}
                >
                  수입
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    formData.type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-on-surface dark:text-on-surface'
                  }`}
                >
                  지출
                </button>
              </div>
            </div>

            {formData.type === 'expense' && (
              <div>
                <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                  지출 유형
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, expenseCategory: 'fixed' })}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      formData.expenseCategory === 'fixed'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-on-surface dark:text-on-surface'
                    }`}
                  >
                    고정 지출
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, expenseCategory: 'variable' })}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      formData.expenseCategory === 'variable'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-on-surface dark:text-on-surface'
                    }`}
                  >
                    변동 지출
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                설명
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="거래 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                금액
              </label>
              <input
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="금액을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                날짜
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="flex-1 px-4 py-2 border border-border-color-light dark:border-border-color-dark text-on-surface dark:text-on-surface rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg transition-colors"
              >
                {editingId ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <TransactionsList 
          data={filteredTransactions} 
          title={titleMap[activeCategory]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default TransactionsPage;
