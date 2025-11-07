
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { mockOwnedStocks, availableStocks, generateStockChartData } from '../services/mockData';
import StockCard from '../components/StockCard';
import { OwnedStock, Stock, StockChartData } from '../types';

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


// 해외 주식인지 확인하는 함수
const isForeignStock = (symbol: string): boolean => {
    return /^[A-Z]+$/.test(symbol) && !symbol.match(/^\d+$/);
};

const MarketStockCard: React.FC<{ stock: Stock; chartData: StockChartData[] }> = ({ stock, chartData }) => {
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
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-bold text-lg text-on-surface dark:text-on-surface">{stock.name}</h3>
                    <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">{stock.symbol}</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-on-surface dark:text-on-surface">
                        {currency}{priceDisplay}{!isForeign ? '원' : ''}
                    </p>
                    <p className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{changeDisplay}{!isForeign ? '원' : ''} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </p>
                </div>
            </div>
            <div style={{ width: '100%', height: 120 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData.slice(-7)}>
                        <Line 
                            type="monotone" 
                            dataKey="close" 
                            stroke={isPositive ? '#10b981' : '#ef4444'} 
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const StocksPage: React.FC = () => {
    const [marketStocks, setMarketStocks] = useState<Stock[]>([]);
    const [stockCharts, setStockCharts] = useState<Record<string, StockChartData[]>>({});

    useEffect(() => {
        // 시장 주식 목록 설정
        setMarketStocks(availableStocks);
        
        // 각 주식의 차트 데이터 생성
        const charts: Record<string, StockChartData[]> = {};
        availableStocks.forEach(stock => {
            charts[stock.symbol] = generateStockChartData(stock, 'normal');
        });
        setStockCharts(charts);
    }, []);

    return (
        <div className="space-y-8">
            {/* 시장 주식 목록 및 그래프 */}
            <div>
                <h2 className="text-2xl font-bold text-on-surface dark:text-on-surface mb-4">시장 주식 목록</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketStocks.map(stock => (
                        <MarketStockCard 
                            key={stock.symbol} 
                            stock={stock} 
                            chartData={stockCharts[stock.symbol] || []}
                        />
                    ))}
                </div>
            </div>

            {/* 보유 주식 현황 */}
            <div>
                <h2 className="text-3xl font-bold text-on-surface dark:text-on-surface mb-2">보유 주식 현황</h2>
                <p className="text-lg text-on-surface-secondary dark:text-on-surface-secondary mb-6">
                    보유 중인 주식 포트폴리오의 비중과 상세 정보를 확인하세요.
                </p>

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
        </div>
    );
};

export default StocksPage;