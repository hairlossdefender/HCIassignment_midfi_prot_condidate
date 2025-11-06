import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'];

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
            <Tooltip formatter={(value: number) => [`${value.toLocaleString()}원`, 'Value']} />
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


export const TransactionsList: React.FC<TransactionsListProps> = ({ data, title="Recent Transactions" }) => (
  <WidgetCard title={title}>
    <ul className="space-y-4">
      {data.map(tx => (
        <li key={tx.id} className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {tx.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
            <div>
              <p className="font-semibold text-on-surface dark:text-on-surface">{tx.description}</p>
              <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">{tx.date}</p>
            </div>
          </div>
          <p className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
            {tx.amount.toLocaleString()}원
          </p>
        </li>
      ))}
    </ul>
  </WidgetCard>
);