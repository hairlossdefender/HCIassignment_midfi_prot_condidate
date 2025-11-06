
import React, { useState, useEffect, useCallback } from 'react';
import { getFinancialTip } from '../services/geminiService';
import { FinancialTip, UserProfile } from '../types';

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10M20 20l-1.5-1.5A9 9 0 003.5 14" />
    </svg>
);

interface FinancialLearningCardProps {
    userProfile: UserProfile;
}

const FinancialLearningCard: React.FC<FinancialLearningCardProps> = ({ userProfile }) => {
    const [tip, setTip] = useState<FinancialTip | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTip = useCallback(async () => {
        setIsLoading(true);
        const newTip = await getFinancialTip(userProfile.scores.comprehension);
        setTip(newTip);
        setIsLoading(false);
    }, [userProfile.scores.comprehension]);

    useEffect(() => {
        fetchTip();
    }, [fetchTip]);

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-on-surface dark:text-on-surface">오늘의 금융 학습</h3>
                <button 
                    onClick={fetchTip} 
                    disabled={isLoading}
                    className="p-2 rounded-full text-on-surface-secondary dark:text-on-surface-secondary hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="새로운 팁 보기"
                >
                    <RefreshIcon />
                </button>
            </div>
            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            ) : tip ? (
                <div>
                    <h4 className="text-lg font-semibold text-brand-primary dark:text-brand-primary-light mb-2">{tip.title}</h4>
                    <p className="text-on-surface-secondary dark:text-on-surface-secondary leading-relaxed">{tip.content}</p>
                </div>
            ) : (
                 <p className="text-on-surface-secondary dark:text-on-surface-secondary">금융 팁을 불러올 수 없습니다.</p>
            )}
        </div>
    );
};

export default FinancialLearningCard;
