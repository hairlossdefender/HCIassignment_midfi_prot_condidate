
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockForexRates, mockForexHistory } from '../services/mockData';
import { ForexRate, ForexHistoryPoint } from '../types';

type ForexPair = 'USD/KRW' | 'EUR/KRW' | 'JPY/KRW';

const ForexCard: React.FC<{ rate: ForexRate }> = ({ rate }) => {
    const isPositive = rate.change >= 0;
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-on-surface dark:text-on-surface">{rate.name}</h3>
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-on-surface-secondary dark:text-on-surface-secondary">{rate.pair}</span>
            </div>
            <div className="flex justify-between items-baseline mt-4">
                <p className="text-3xl font-bold text-on-surface dark:text-on-surface">
                    {rate.rate.toFixed(2).toLocaleString()}원
                </p>
                <div className={`text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    <p className="font-semibold text-lg">{isPositive ? '+' : ''}{rate.change.toFixed(2)}원</p>
                    <p className="text-base">({isPositive ? '+' : ''}{rate.changePercent.toFixed(2)}%)</p>
                </div>
            </div>
        </div>
    );
};

const HistoryChart: React.FC<{ data: ForexHistoryPoint[], pair: string }> = ({ data, pair }) => (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
        <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-4">Historical Fluctuation ({pair})</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="date" stroke="rgb(156 163 175)" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(value) => `${value.toFixed(0)}`} stroke="rgb(156 163 175)" />
                    <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)}원`, 'Rate']}
                        contentStyle={{
                            backgroundColor: 'rgb(31 41 55 / 0.8)',
                            borderColor: '#374151'
                        }}
                        labelStyle={{ color: '#f9fafb' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} name="환율" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);


const ForexPage: React.FC = () => {
    const [activePair, setActivePair] = useState<ForexPair>('USD/KRW');

    const TabButton = ({ pair, label }: { pair: ForexPair, label: string }) => (
        <button
          onClick={() => setActivePair(pair)}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
            activePair === pair
              ? 'bg-brand-primary text-white shadow'
              : 'bg-transparent text-on-surface-secondary hover:text-on-surface dark:hover:text-on-surface'
          }`}
        >
          {label}
        </button>
      );
    
    const currentRate = mockForexRates[activePair];
    const historyData = mockForexHistory[activePair];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-on-surface dark:text-on-surface mb-2">Foreign Exchange Rates</h2>
                <p className="text-lg text-on-surface-secondary dark:text-on-surface-secondary">
                    Check the latest FX rates and their historical performance.
                </p>
            </div>

            <div className="flex items-center space-x-2 p-1.5 bg-gray-100 dark:bg-surface-dark rounded-lg max-w-min">
                <TabButton pair="USD/KRW" label="🇺🇸 USD/KRW" />
                <TabButton pair="EUR/KRW" label="🇪🇺 EUR/KRW" />
                <TabButton pair="JPY/KRW" label="🇯🇵 JPY/KRW" />
            </div>
            
            <div className="space-y-6">
                {currentRate && <ForexCard rate={currentRate} />}
                {historyData && <HistoryChart data={historyData} pair={activePair} />}
            </div>
        </div>
    );
};

export default ForexPage;
