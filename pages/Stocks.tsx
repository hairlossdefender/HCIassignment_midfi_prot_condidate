
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { mockOwnedStocks } from '../services/mockData';
import StockCard from '../components/StockCard';
import { OwnedStock } from '../types';

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

const StocksPortfolioChart: React.FC<{ data: OwnedStock[] }> = ({ data }) => {
    const chartData = data.map(stock => ({
        name: stock.name,
        value: stock.price * stock.quantity,
    }));
    
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-on-surface dark:text-on-surface">보유 주식 포트폴리오</h3>
                <p className="text-2xl font-bold text-on-surface dark:text-on-surface mt-1">{totalValue.toLocaleString()}원</p>
                <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">총 평가금액</p>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value.toLocaleString()}원`, '평가금액']} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const StocksPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-on-surface dark:text-on-surface mb-2">보유 주식 현황</h2>
                <p className="text-lg text-on-surface-secondary dark:text-on-surface-secondary">
                    보유 중인 주식 포트폴리오의 비중과 상세 정보를 확인하세요.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <StocksPortfolioChart data={mockOwnedStocks} />
                </div>
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 gap-6">
                        {mockOwnedStocks.map(stock => (
                            <StockCard key={stock.symbol} stock={stock} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StocksPage;