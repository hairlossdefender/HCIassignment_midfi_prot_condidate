import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from 'recharts';
import { Asset, Transaction } from '../types';

interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ title, children, className }) => (
    <div className={`bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark ${className}`}>
        <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-4">{title}</h3>
        {children}
    </div>
);


interface AssetsChartProps {
  data: Asset[];
}

const COLORS = ['#FFB400', '#10b981', '#f59e0b', '#3b82f6'];

const RADIAN = Math.PI / 180;
// Fix: Updated the type of props for renderCustomizedLabel to `any` to avoid type conflicts with recharts' PieLabelRenderProps.
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// 커스텀 Tooltip 컴포넌트 - 항상 흰 배경에 검은 글씨
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div 
                className="recharts-tooltip-custom"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: '#111827'
                }}
            >
                <p className="recharts-tooltip-text" style={{ margin: 0, color: '#111827', fontWeight: 600 }}>
                    Value : {data.value?.toLocaleString()}원
                </p>
            </div>
        );
    }
    return null;
};


export const AssetsChart: React.FC<AssetsChartProps> = ({ data }) => {
  return (
    <WidgetCard title="Asset Allocation">
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
};

interface TransactionsListProps {
  data: Transaction[];
  title?: string;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

const IncomeIcon = () => (
    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8l-8-8-8 8" />
        </svg>
    </div>
);

const ExpenseIcon = () => (
    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8l8 8 8-8" />
        </svg>
    </div>
);


export const TransactionsList: React.FC<TransactionsListProps> = ({ data, title="Recent Transactions", onEdit, onDelete }) => (
  <WidgetCard title={title}>
    <ul className="space-y-4">
      {data.length === 0 ? (
        <li className="text-center py-8 text-on-surface-secondary dark:text-on-surface-secondary">
          거래 내역이 없습니다.
        </li>
      ) : (
        data.map(tx => (
          <li key={tx.id} className="flex justify-between items-center group">
            <div className="flex items-center gap-4 flex-1">
              {tx.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
              <div className="flex-1">
                <p className="font-semibold text-on-surface dark:text-on-surface">{tx.description}</p>
                <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">{tx.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.amount.toLocaleString()}원
              </p>
              {(onEdit || onDelete) && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-2 text-on-surface-secondary dark:text-on-surface-secondary hover:text-brand-primary dark:hover:text-brand-primary-light transition-colors"
                      aria-label="수정"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="p-2 text-on-surface-secondary dark:text-on-surface-secondary hover:text-red-500 transition-colors"
                      aria-label="삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </li>
        ))
      )}
    </ul>
  </WidgetCard>
);