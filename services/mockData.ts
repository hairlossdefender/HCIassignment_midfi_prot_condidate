
import { Asset, Transaction, Stock, OwnedStock, ForexRate, ForexHistoryPoint, VirtualTransaction, VirtualPosition, News, ResearchReport, StockChartData, MarketScenario } from '../types';

export const mockOwnedStocks: OwnedStock[] = [
  { symbol: '005930', name: '삼성전자', price: 83000, change: 1200, changePercent: 1.47, quantity: 542 },
  { symbol: '035720', name: '카카오', price: 43000, change: -500, changePercent: -1.15, quantity: 116 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 340000, change: 12000, changePercent: 3.70, quantity: 15 }
];

const totalStockValue = mockOwnedStocks.reduce((sum, stock) => sum + (stock.price * stock.quantity), 0);

export const mockAssets: Asset[] = [
  { name: '주식 포트폴리오', value: totalStockValue, category: 'Stocks' },
  { name: '서울 아파트', value: 850000000, category: 'Real Estate' },
  { name: '달러 예금', value: 35000000, category: 'Cash' },
  { name: '비트코인', value: 15000000, category: 'Crypto' },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', date: '2024-07-22', description: '월급', amount: 5000000, type: 'income' },
  { id: 't2', date: '2024-07-21', description: '넷플릭스 구독', amount: -17000, type: 'expense', expenseCategory: 'fixed' },
  { id: 't3', date: '2024-07-20', description: '주식 매수 (삼성전자)', amount: -1000000, type: 'expense', expenseCategory: 'variable' },
  { id: 't4', date: '2024-07-19', description: '마트 장보기', amount: -150000, type: 'expense', expenseCategory: 'variable' },
  { id: 't5', date: '2024-07-15', description: '관리비', amount: -250000, type: 'expense', expenseCategory: 'fixed' },
  { id: 't6', date: '2024-07-14', description: '교통비', amount: -55000, type: 'expense', expenseCategory: 'variable' },
  { id: 't7', date: '2024-07-12', description: '보험료', amount: -120000, type: 'expense', expenseCategory: 'fixed' },
  { id: 't8', date: '2024-07-10', description: '외식', amount: -85000, type: 'expense', expenseCategory: 'variable' },
  { id: 't9', date: '2024-07-01', description: '월세', amount: -750000, type: 'expense', expenseCategory: 'fixed' },
  { id: 't10', date: '2024-06-22', description: '프리랜서 수입', amount: 800000, type: 'income' },
];

export const mockStocks: { [key: string]: Stock } = {
  '005930': { symbol: '005930', name: '삼성전자', price: 83000, change: 1200, changePercent: 1.47 },
  '035720': { symbol: '035720', name: '카카오', price: 43000, change: -500, changePercent: -1.15 },
  'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.50, change: 8.75, changePercent: 3.70 },
};

export const mockForexRates: { [key: string]: ForexRate } = {
    'USD/KRW': { pair: 'USD/KRW', name: 'US Dollar / Korean Won', rate: 1385.50, change: 2.30, changePercent: 0.17 },
    'EUR/KRW': { pair: 'EUR/KRW', name: 'Euro / Korean Won', rate: 1482.10, change: -1.50, changePercent: -0.10 },
    'JPY/KRW': { pair: 'JPY/KRW', name: 'Japanese Yen (100) / Korean Won', rate: 880.45, change: 0.95, changePercent: 0.11 },
};
  
export const mockForexHistory: { [key: string]: ForexHistoryPoint[] } = {
    'USD/KRW': [
      { date: '7-15', rate: 1380.2 },
      { date: '7-16', rate: 1382.5 },
      { date: '7-17', rate: 1381.0 },
      { date: '7-18', rate: 1384.8 },
      { date: '7-19', rate: 1383.2 },
      { date: '7-20', rate: 1385.1 },
      { date: '7-21', rate: 1385.5 },
    ],
    'EUR/KRW': [
      { date: '7-15', rate: 1485.6 },
      { date: '7-16', rate: 1483.2 },
      { date: '7-17', rate: 1484.0 },
      { date: '7-18', rate: 1481.5 },
      { date: '7-19', rate: 1483.6 },
      { date: '7-20', rate: 1482.9 },
      { date: '7-21', rate: 1482.1 },
    ],
    'JPY/KRW': [
      { date: '7-15', rate: 878.1 },
      { date: '7-16', rate: 879.5 },
      { date: '7-17', rate: 879.0 },
      { date: '7-18', rate: 880.2 },
      { date: '7-19', rate: 879.5 },
      { date: '7-20', rate: 880.0 },
      { date: '7-21', rate: 880.45 },
    ],
};

// 가상 주식 거래소용 추가 주식 데이터
// 해외 주식은 달러 단위, 국내 주식은 원화 단위
export const availableStocks: Stock[] = [
  { symbol: '005930', name: '삼성전자', price: 83000, change: 1200, changePercent: 1.47 },
  { symbol: '035720', name: '카카오', price: 43000, change: -500, changePercent: -1.15 },
  { symbol: '000660', name: 'SK하이닉스', price: 145000, change: 3000, changePercent: 2.11 },
  { symbol: '005380', name: '현대차', price: 245000, change: -2000, changePercent: -0.81 },
  { symbol: '035420', name: 'NAVER', price: 198000, change: 5000, changePercent: 2.59 },
  { symbol: '051910', name: 'LG화학', price: 425000, change: -3000, changePercent: -0.70 },
  { symbol: '006400', name: '삼성SDI', price: 385000, change: 8000, changePercent: 2.12 },
  { symbol: '028260', name: '삼성물산', price: 125000, change: 1500, changePercent: 1.21 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.50, change: 8.75, changePercent: 3.70 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 256.08, change: 10.58, changePercent: 4.31 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 514.45, change: -3.45, changePercent: -0.67 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 252.53, change: -2.19, changePercent: -0.86 },
];

// 초기 가상 계좌 데이터 (localStorage에서 로드하거나 생성)
export const getInitialVirtualAccount = (userId: string) => {
  const stored = localStorage.getItem(`virtualAccount_${userId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const initial = {
    id: `va_${userId}`,
    userId,
    balance: 100000000, // 1억원
    initialBalance: 100000000,
    totalValue: 100000000,
    createdAt: new Date().toISOString(),
  };
  
  localStorage.setItem(`virtualAccount_${userId}`, JSON.stringify(initial));
  return initial;
};

// 가상 거래 내역 (localStorage 사용)
export const getVirtualTransactions = (accountId: string): VirtualTransaction[] => {
  const stored = localStorage.getItem(`virtualTransactions_${accountId}`);
  return stored ? JSON.parse(stored) : [];
};

export const saveVirtualTransaction = (accountId: string, transaction: VirtualTransaction) => {
  const transactions = getVirtualTransactions(accountId);
  transactions.push(transaction);
  localStorage.setItem(`virtualTransactions_${accountId}`, JSON.stringify(transactions));
};

// 가상 보유 포지션 계산
export const calculateVirtualPositions = (accountId: string): VirtualPosition[] => {
  const transactions = getVirtualTransactions(accountId);
  const positions: { [key: string]: { quantity: number; totalCost: number; transactions: VirtualTransaction[] } } = {};

  transactions.forEach(tx => {
    if (!positions[tx.stockSymbol]) {
      positions[tx.stockSymbol] = { quantity: 0, totalCost: 0, transactions: [] };
    }
    
    if (tx.type === 'buy') {
      positions[tx.stockSymbol].quantity += tx.quantity;
      positions[tx.stockSymbol].totalCost += tx.totalAmount;
    } else {
      positions[tx.stockSymbol].quantity -= tx.quantity;
      positions[tx.stockSymbol].totalCost -= (positions[tx.stockSymbol].totalCost / (positions[tx.stockSymbol].quantity + tx.quantity)) * tx.quantity;
    }
    positions[tx.stockSymbol].transactions.push(tx);
  });

  return Object.entries(positions)
    .filter(([_, pos]) => pos.quantity > 0)
    .map(([symbol, pos]) => {
      const stock = availableStocks.find(s => s.symbol === symbol) || mockStocks[symbol];
      if (!stock) return null;

      const averagePrice = pos.totalCost / pos.quantity;
      const currentPrice = stock.price;
      const marketValue = pos.quantity * currentPrice;
      const profit = marketValue - pos.totalCost;
      const profitPercent = (profit / pos.totalCost) * 100;

      return {
        symbol,
        name: stock.name,
        quantity: pos.quantity,
        averagePrice,
        currentPrice,
        totalCost: pos.totalCost,
        marketValue,
        profit,
        profitPercent,
      };
    })
    .filter((pos): pos is VirtualPosition => pos !== null);
};

// 뉴스 데이터
export const mockNews: News[] = [
  {
    id: 'n1',
    title: '삼성전자, 2분기 실적 발표 전망 밝아',
    content: '삼성전자가 오는 27일 2분기 실적을 발표하는데, 시장에서는 긍정적인 전망이 나오고 있습니다.',
    source: '한국경제',
    category: 'company',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relatedStocks: ['005930'],
  },
  {
    id: 'n2',
    title: '미국 금리 동결 결정, 주식시장 상승세',
    content: '미국 연준이 기준금리를 동결하면서 글로벌 주식시장이 상승세를 보이고 있습니다.',
    source: '조선일보',
    category: 'market',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n3',
    title: '카카오, 신규 서비스 출시 발표',
    content: '카카오가 새로운 금융 서비스를 출시한다고 발표하며 주가가 상승하고 있습니다.',
    source: '매일경제',
    category: 'company',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    relatedStocks: ['035720'],
  },
  {
    id: 'n4',
    title: '정부, 부동산 투자세 완화 조치 발표',
    content: '정부가 부동산 투자 관련 세금을 완화하는 조치를 발표했습니다.',
    source: '연합뉴스',
    category: 'policy',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n5',
    title: 'SK하이닉스, 반도체 수요 증가 기대',
    content: 'AI 반도체 수요가 증가하면서 SK하이닉스의 전망이 밝아지고 있습니다.',
    source: '서울경제',
    category: 'company',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    relatedStocks: ['000660'],
  },
];

// 증권사 리포트 데이터
export const mockReports: ResearchReport[] = [
  {
    id: 'r1',
    title: '삼성전자 투자의견 상향, 목표가 95,000원',
    summary: '2분기 실적 전망이 긍정적이며, 메모리 반도체 회복세가 지속될 것으로 예상됩니다.',
    source: 'KB증권',
    targetStock: '005930',
    targetPrice: 95000,
    rating: 'buy',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r2',
    title: '카카오, 중립 유지 목표가 45,000원',
    summary: '신규 서비스 기대효과는 긍정적이나, 경쟁 심화 우려가 있습니다.',
    source: '미래에셋증권',
    targetStock: '035720',
    targetPrice: 45000,
    rating: 'hold',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r3',
    title: 'SK하이닉스, 매수 추천 목표가 160,000원',
    summary: 'AI 반도체 수요 증가로 인한 실적 개선이 예상됩니다.',
    source: 'NH투자증권',
    targetStock: '000660',
    targetPrice: 160000,
    rating: 'buy',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 시장 상황 시뮬레이션 설정
export const marketScenarios: Record<MarketScenario, { name: string; description: string; priceMultiplier: number; volatility: number }> = {
  normal: {
    name: '정상 시장',
    description: '일반적인 시장 상황',
    priceMultiplier: 1.0,
    volatility: 0.02,
  },
  crash: {
    name: '폭락장',
    description: '급격한 하락장 상황',
    priceMultiplier: 0.7,
    volatility: 0.1,
  },
  correction: {
    name: '조정장',
    description: '점진적인 하락 조정',
    priceMultiplier: 0.85,
    volatility: 0.05,
  },
  dead_cat_bounce: {
    name: '데드캣 바운스',
    description: '하락 후 일시적 반등',
    priceMultiplier: 0.75,
    volatility: 0.15,
  },
  bear_market: {
    name: '약세장',
    description: '지속적인 하락 추세',
    priceMultiplier: 0.9,
    volatility: 0.08,
  },
  bull_market: {
    name: '강세장',
    description: '지속적인 상승 추세',
    priceMultiplier: 1.15,
    volatility: 0.04,
  },
};

// 시장 상황에 따른 주가 조정
export const applyMarketScenario = (stock: Stock, scenario: MarketScenario): Stock => {
  const config = marketScenarios[scenario];
  const basePrice = stock.price * config.priceMultiplier;
  const volatility = config.volatility;
  const randomChange = (Math.random() - 0.5) * volatility * basePrice;
  const newPrice = basePrice + randomChange;
  const change = newPrice - stock.price;
  const changePercent = (change / stock.price) * 100;

  return {
    ...stock,
    price: Math.max(1, Math.round(newPrice)),
    change: Math.round(change),
    changePercent: parseFloat(changePercent.toFixed(2)),
  };
};

// 주가 차트 데이터 생성 (최근 30일)
export const generateStockChartData = (stock: Stock, scenario: MarketScenario = 'normal'): StockChartData[] => {
  const config = marketScenarios[scenario];
  const data: StockChartData[] = [];
  const basePrice = stock.price * config.priceMultiplier;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 시장 상황에 따른 가격 변동 시뮬레이션
    const trend = scenario === 'crash' || scenario === 'bear_market' ? -0.01 : 
                  scenario === 'bull_market' ? 0.01 : 0;
    const randomFactor = (Math.random() - 0.5) * config.volatility;
    const priceChange = basePrice * (trend + randomFactor);
    const currentPrice = basePrice + priceChange * (29 - i);
    
    const open = currentPrice * (1 + (Math.random() - 0.5) * 0.02);
    const close = currentPrice;
    const high = Math.max(open, close) * (1 + Math.random() * 0.03);
    const low = Math.min(open, close) * (1 - Math.random() * 0.03);
    const volume = Math.floor(Math.random() * 10000000 + 1000000);

    data.push({
      date: dateStr,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume,
    });
  }
  
  return data;
};