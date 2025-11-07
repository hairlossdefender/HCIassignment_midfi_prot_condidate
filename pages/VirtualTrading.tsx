
import React, { useState, useEffect, useMemo } from 'react';
import { VirtualAccount, VirtualTransaction, VirtualPosition, Stock, MarketScenario, StockChartData } from '../types';
import { 
  availableStocks, 
  getInitialVirtualAccount, 
  getVirtualTransactions, 
  saveVirtualTransaction,
  calculateVirtualPositions,
  marketScenarios,
  applyMarketScenario,
  generateStockChartData
} from '../services/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VirtualTradingProps {
  userId: string;
}

const VirtualTrading: React.FC<VirtualTradingProps> = ({ userId }) => {
  const [account, setAccount] = useState<VirtualAccount | null>(null);
  const [positions, setPositions] = useState<VirtualPosition[]>([]);
  const [transactions, setTransactions] = useState<VirtualTransaction[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'trade' | 'positions' | 'history'>('trade');
  const [marketScenario, setMarketScenario] = useState<MarketScenario>('normal');
  const [stockChartData, setStockChartData] = useState<StockChartData[]>([]);

  useEffect(() => {
    if (userId) {
      const virtualAccount = getInitialVirtualAccount(userId);
      setAccount(virtualAccount);
      
      const accountId = virtualAccount.id;
      const txns = getVirtualTransactions(accountId);
      setTransactions(txns);
      
      const pos = calculateVirtualPositions(accountId);
      setPositions(pos);
      
      // 총 자산 계산 업데이트
      updateAccountTotalValue(accountId, virtualAccount, pos);
    }
  }, [userId]);

  useEffect(() => {
    if (selectedStock) {
      const chartData = generateStockChartData(selectedStock, marketScenario);
      setStockChartData(chartData);
    }
  }, [selectedStock, marketScenario]);

  const updateAccountTotalValue = (accountId: string, acc: VirtualAccount, pos: VirtualPosition[]) => {
    const stockValue = pos.reduce((sum, p) => sum + p.marketValue, 0);
    const totalValue = acc.balance + stockValue;
    
    const updatedAccount = { ...acc, totalValue };
    setAccount(updatedAccount);
    localStorage.setItem(`virtualAccount_${userId}`, JSON.stringify(updatedAccount));
  };

  const filteredStocks = useMemo(() => {
    return availableStocks
      .filter(stock =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(stock => applyMarketScenario(stock, marketScenario));
  }, [searchTerm, marketScenario]);

  const handleOrder = () => {
    if (!selectedStock || !account || quantity <= 0) return;

    const accountId = account.id;
    const totalAmount = selectedStock.price * quantity;

    if (orderType === 'buy') {
      if (totalAmount > account.balance) {
        alert('잔고가 부족합니다.');
        return;
      }

      const transaction: VirtualTransaction = {
        id: `tx_${Date.now()}`,
        accountId,
        stockSymbol: selectedStock.symbol,
        stockName: selectedStock.name,
        type: 'buy',
        quantity,
        price: selectedStock.price,
        totalAmount,
        date: new Date().toISOString(),
      };

      saveVirtualTransaction(accountId, transaction);
      
      const updatedAccount = {
        ...account,
        balance: account.balance - totalAmount,
      };
      setAccount(updatedAccount);
      localStorage.setItem(`virtualAccount_${userId}`, JSON.stringify(updatedAccount));

      const txns = getVirtualTransactions(accountId);
      setTransactions(txns);
      const pos = calculateVirtualPositions(accountId);
      setPositions(pos);
      updateAccountTotalValue(accountId, updatedAccount, pos);
      
      alert(`${selectedStock.name} ${quantity}주 매수 완료!`);
      setQuantity(0);
    } else {
      // 매도
      const position = positions.find(p => p.symbol === selectedStock.symbol);
      if (!position || position.quantity < quantity) {
        alert('보유 수량이 부족합니다.');
        return;
      }

      const transaction: VirtualTransaction = {
        id: `tx_${Date.now()}`,
        accountId,
        stockSymbol: selectedStock.symbol,
        stockName: selectedStock.name,
        type: 'sell',
        quantity,
        price: selectedStock.price,
        totalAmount,
        date: new Date().toISOString(),
      };

      saveVirtualTransaction(accountId, transaction);
      
      const updatedAccount = {
        ...account,
        balance: account.balance + totalAmount,
      };
      setAccount(updatedAccount);
      localStorage.setItem(`virtualAccount_${userId}`, JSON.stringify(updatedAccount));

      const txns = getVirtualTransactions(accountId);
      setTransactions(txns);
      const pos = calculateVirtualPositions(accountId);
      setPositions(pos);
      updateAccountTotalValue(accountId, updatedAccount, pos);
      
      alert(`${selectedStock.name} ${quantity}주 매도 완료!`);
      setQuantity(0);
    }
  };

  const totalProfit = account
    ? account.totalValue - account.initialBalance
    : 0;
  const totalProfitPercent = account
    ? ((totalProfit / account.initialBalance) * 100)
    : 0;

  const profitChartData = transactions.map((tx, index) => {
    const cumulativeProfit = transactions.slice(0, index + 1).reduce((sum, t) => {
      // 간단한 수익률 계산 (실제로는 더 복잡한 계산 필요)
      return sum + (t.type === 'buy' ? -t.totalAmount : t.totalAmount);
    }, account?.initialBalance || 0);
    
    return {
      date: new Date(tx.date).toLocaleDateString(),
      value: cumulativeProfit,
    };
  });

  // 상단에 표시할 주가 그래프 데이터 (첫 번째 종목 또는 선택된 종목)
  const topChartStock = selectedStock || filteredStocks[0];
  const [topChartData, setTopChartData] = useState<StockChartData[]>([]);

  useEffect(() => {
    if (topChartStock) {
      const chartData = generateStockChartData(topChartStock, marketScenario);
      setTopChartData(chartData);
    }
  }, [topChartStock, marketScenario]);

  return (
    <div className="space-y-8">
      {/* 상단 주가 그래프 */}
      {topChartData.length > 0 && (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-on-surface dark:text-on-surface">
                {topChartStock?.name} ({topChartStock?.symbol})
              </h3>
              <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">
                {marketScenarios[marketScenario].name} - 최근 30일 주가 추이
              </p>
            </div>
            {topChartStock && (
              <div className="text-right">
                <p className="text-2xl font-bold text-on-surface dark:text-on-surface">
                  {topChartStock.price.toLocaleString()}원
                </p>
                <p className={`text-sm ${topChartStock.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                  {topChartStock.change >= 0 ? '+' : ''}{topChartStock.change.toLocaleString()}원 
                  ({topChartStock.changePercent >= 0 ? '+' : ''}{topChartStock.changePercent.toFixed(2)}%)
                </p>
              </div>
            )}
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={topChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                <XAxis 
                  dataKey="date" 
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px', 
                    color: '#f9fafb'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()}원`, '종가']}
                />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#FFB400" 
                  strokeWidth={2} 
                  dot={false}
                  name="종가"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 계좌 요약 */}
      {account && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-2">가용 현금</p>
            <p className="text-2xl font-bold text-on-surface dark:text-on-surface">
              {account.balance.toLocaleString()}원
            </p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-2">총 자산</p>
            <p className="text-2xl font-bold text-on-surface dark:text-on-surface">
              {account.totalValue.toLocaleString()}원
            </p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-2">평가 손익</p>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}원
            </p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-2">수익률</p>
            <p className={`text-2xl font-bold ${totalProfitPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex space-x-2 border-b border-border-color-light dark:border-border-color-dark">
        {(['trade', 'positions', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-colors text-on-surface dark:text-on-surface ${
              activeTab === tab
                ? 'border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light'
                : 'text-on-surface-secondary dark:text-on-surface-secondary hover:text-on-surface dark:hover:text-on-surface'
            }`}
          >
            {tab === 'trade' ? '거래' : tab === 'positions' ? '보유종목' : '거래내역'}
          </button>
        ))}
      </div>

      {/* 시장 상황 선택 */}
      {activeTab === 'trade' && (
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
          <h3 className="text-lg font-bold text-on-surface dark:text-on-surface mb-3">시장 상황 시뮬레이션</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {(Object.keys(marketScenarios) as MarketScenario[]).map((scenario) => (
              <button
                key={scenario}
                onClick={() => setMarketScenario(scenario)}
                className={`p-3 rounded-lg border transition-colors text-sm text-left ${
                  marketScenario === scenario
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary dark:text-brand-primary-light'
                    : 'bg-background-light dark:bg-background-dark border-border-color-light dark:border-border-color-dark text-on-surface dark:text-on-surface hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <p className="font-semibold">{marketScenarios[scenario].name}</p>
                <p className="text-xs text-on-surface-secondary dark:text-on-surface-secondary mt-1">
                  {marketScenarios[scenario].description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 거래 탭 */}
      {activeTab === 'trade' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 주식 검색 및 선택 */}
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-4">주식 검색</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="종목명 또는 코드 검색"
              className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    selectedStock?.symbol === stock.symbol
                      ? 'bg-brand-primary/10 border-brand-primary'
                      : 'bg-background-light dark:bg-background-dark border-border-color-light dark:border-border-color-dark hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-on-surface dark:text-on-surface">{stock.name}</p>
                      <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">{stock.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-on-surface dark:text-on-surface">{stock.price.toLocaleString()}원</p>
                      <p className={`text-sm ${stock.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toLocaleString()}원 ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 주문 입력 */}
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
            <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-4">주문</h3>
            
            {selectedStock && (
              <div className="mb-6 p-4 bg-background-light dark:bg-background-dark rounded-lg">
                <p className="font-semibold text-on-surface dark:text-on-surface">{selectedStock.name} ({selectedStock.symbol})</p>
                <p className="text-2xl font-bold text-on-surface dark:text-on-surface mt-2">
                  {selectedStock.price.toLocaleString()}원
                </p>
                {positions.find(p => p.symbol === selectedStock.symbol) && (
                  <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mt-2">
                    보유: {positions.find(p => p.symbol === selectedStock.symbol)?.quantity}주
                  </p>
                )}
                
                {/* 주가 그래프 */}
                {stockChartData.length > 0 && (
                  <div className="mt-4" style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                      <LineChart data={stockChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                        <XAxis 
                          dataKey="date" 
                          className="text-gray-600 dark:text-gray-400"
                          tick={{ fill: 'currentColor' }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                          className="text-gray-600 dark:text-gray-400"
                          tick={{ fill: 'currentColor' }}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--tw-color-surface-dark)', 
                            border: '1px solid var(--tw-color-border-color-dark)', 
                            borderRadius: '8px', 
                            color: 'var(--tw-color-on-surface)'
                          }}
                          formatter={(value: number) => [`${value.toLocaleString()}원`, '종가']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="close" 
                          stroke="#FFB400" 
                          strokeWidth={2} 
                          dot={false}
                          name="종가"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setOrderType('buy')}
                  className={`py-3 rounded-lg font-semibold transition-colors ${
                    orderType === 'buy'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-on-surface dark:text-on-surface'
                  }`}
                >
                  매수
                </button>
                <button
                  onClick={() => setOrderType('sell')}
                  className={`py-3 rounded-lg font-semibold transition-colors ${
                    orderType === 'sell'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-on-surface dark:text-on-surface'
                  }`}
                >
                  매도
                </button>
              </div>

              <label className="block text-sm font-medium text-on-surface dark:text-on-surface mb-2">
                수량
              </label>
              <input
                type="number"
                min="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-background-light dark:bg-background-dark border border-border-color-light dark:border-border-color-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-on-surface dark:text-on-surface"
                placeholder="수량 입력"
              />

              {selectedStock && quantity > 0 && (
                <div className="mt-4 p-4 bg-background-light dark:bg-background-dark rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-on-surface-secondary dark:text-on-surface-secondary">주문 금액</span>
                    <span className="font-bold text-on-surface dark:text-on-surface">
                      {(selectedStock.price * quantity).toLocaleString()}원
                    </span>
                  </div>
                  {orderType === 'buy' && account && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-secondary dark:text-on-surface-secondary">주문 후 잔고</span>
                      <span className="font-semibold text-on-surface dark:text-on-surface">
                        {(account.balance - selectedStock.price * quantity).toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleOrder}
                disabled={!selectedStock || quantity <= 0}
                className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors ${
                  orderType === 'buy'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {orderType === 'buy' ? '매수' : '매도'}하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 보유종목 탭 */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {positions.length === 0 ? (
            <div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-color-light dark:border-border-color-dark">
              <p className="text-on-surface-secondary dark:text-on-surface-secondary">보유 중인 종목이 없습니다.</p>
            </div>
          ) : (
            positions.map((position) => (
              <div
                key={position.symbol}
                className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark"
              >
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-1">종목</p>
                    <p className="font-bold text-on-surface dark:text-on-surface">{position.name}</p>
                    <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">{position.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-1">보유수량</p>
                    <p className="font-semibold text-on-surface dark:text-on-surface">{position.quantity}주</p>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-1">평균단가</p>
                    <p className="font-semibold text-on-surface dark:text-on-surface">{position.averagePrice.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-1">현재가</p>
                    <p className="font-semibold text-on-surface dark:text-on-surface">{position.currentPrice.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-1">평가손익</p>
                    <p className={`font-semibold ${position.profit >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      {position.profit >= 0 ? '+' : ''}{position.profit.toLocaleString()}원
                    </p>
                    <p className={`text-sm ${position.profitPercent >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      ({position.profitPercent >= 0 ? '+' : ''}{position.profitPercent.toFixed(2)}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mb-1">평가금액</p>
                    <p className="font-semibold text-on-surface dark:text-on-surface">{position.marketValue.toLocaleString()}원</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 거래내역 탭 */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-color-light dark:border-border-color-dark">
              <p className="text-on-surface-secondary dark:text-on-surface-secondary">거래 내역이 없습니다.</p>
            </div>
          ) : (
            <>
              {profitChartData.length > 0 && (
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-border-color-light dark:border-border-color-dark">
                  <h3 className="text-xl font-bold text-on-surface dark:text-on-surface mb-4">자산 추이</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={profitChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [`${value.toLocaleString()}원`, '총 자산']} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} name="총 자산" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-border-color-light dark:border-border-color-dark"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-sm font-semibold ${
                                tx.type === 'buy'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {tx.type === 'buy' ? '매수' : '매도'}
                            </span>
                            <span className="font-semibold text-on-surface dark:text-on-surface">{tx.stockName}</span>
                            <span className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">
                              {tx.quantity}주
                            </span>
                          </div>
                          <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary mt-1">
                            {new Date(tx.date).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-on-surface dark:text-on-surface">
                            {tx.price.toLocaleString()}원
                          </p>
                          <p className="text-sm text-on-surface-secondary dark:text-on-surface-secondary">
                            총 {tx.totalAmount.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VirtualTrading;

