
import React, { useState, useEffect } from 'react';
import { AssetsChart, TransactionsList } from '../components/DashboardWidgets';
import FinancialLearningCard from '../components/FinancialLearningCard';
import { mockAssets, mockTransactions } from '../services/mockData';
import { generateDashboardBriefing } from '../services/geminiService';
import { UserProfile } from '../types';

interface DashboardPageProps {
  userProfile: UserProfile;
}

const StatCard = ({ title, value, change, icon }: { title: string, value: string, change?: string, icon: React.ReactNode }) => {
    const isPositive = change && !change.startsWith('-');
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <div className="flex items-center justify-between mb-4">
                <p className="text-base font-medium text-on-surface-secondary dark:text-on-surface-secondary">{title}</p>
                {icon}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-on-surface dark:text-on-surface">{value}</h3>
                {change && (
                     <p className={`text-sm font-semibold mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {change}
                    </p>
                )}
            </div>
        </div>
    );
}

const WalletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-on-surface-secondary dark:text-on-surface-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-on-surface-secondary dark:text-on-surface-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);


const DashboardPage: React.FC<DashboardPageProps> = ({ userProfile }) => {
  const [briefing, setBriefing] = useState<string>('');
  const [isBriefingLoading, setIsBriefingLoading] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
        setIsBriefingLoading(true);
        const generatedBriefing = await generateDashboardBriefing(mockAssets, userProfile.name);
        setBriefing(generatedBriefing);
        setIsBriefingLoading(false);
    };
    fetchBriefing();
  }, [userProfile.name]);

  const recentTransactions = mockTransactions.slice(0, 5);
  const totalAssets = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
  const netChange = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-on-surface dark:text-on-surface mb-2">Hello, {userProfile.name}!</h2>
        {isBriefingLoading ? (
            <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
        ) : (
             <p className="text-lg text-on-surface-secondary dark:text-on-surface-secondary animate-fadeIn">
                {briefing}
            </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            title="Total Assets" 
            value={`${(totalAssets / 100000000).toFixed(2)}억원`}
            icon={<WalletIcon />}
        />
        <StatCard 
            title="Recent Net Change" 
            value={`${netChange.toLocaleString()}원`} 
            change={`${(netChange / totalAssets * 100).toFixed(2)}%`}
            icon={<TrendingUpIcon />}
        />
        <div className="md:col-span-2 lg:col-span-1">
          <FinancialLearningCard userProfile={userProfile} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
             <AssetsChart data={mockAssets} />
          </div>
          <div className="lg:col-span-2">
            <TransactionsList data={recentTransactions} />
          </div>
      </div>
    </div>
  );
};

export default DashboardPage;
